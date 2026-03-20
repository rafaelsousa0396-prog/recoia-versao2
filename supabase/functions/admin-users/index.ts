import { createClient } from "https://esm.sh/@supabase/supabase-js@2.99.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type UserHospitalLink = {
  hospital_id: string;
  role: string;
  ativo: boolean;
};

const jsonHeaders = {
  ...corsHeaders,
  "Content-Type": "application/json",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: jsonHeaders,
  });
}

function getTokenFromHeader(authHeader: string | null) {
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  return token || null;
}

function canManageHospital(isSuperAdmin: boolean, manageableHospitalIds: Set<string>, hospitalId: string) {
  return isSuperAdmin || manageableHospitalIds.has(hospitalId);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    const accessToken = getTokenFromHeader(authHeader);

    if (!accessToken) {
      return jsonResponse({ error: "Não autorizado" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return jsonResponse({ error: "Configuração incompleta da função" }, 500);
    }

    const supabaseUser = createClient(supabaseUrl, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: authHeader! } },
    });

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const {
      data: { user },
      error: userError,
    } = await supabaseUser.auth.getUser(accessToken);

    if (userError || !user) {
      return jsonResponse({ error: "Não autorizado" }, 401);
    }

    const { data: userLinks, error: userLinksError } = await supabaseUser
      .from("user_hospitals")
      .select("hospital_id, role, ativo")
      .eq("ativo", true);

    if (userLinksError) {
      console.error("Erro ao carregar vínculos do usuário", userLinksError);
      return jsonResponse({ error: "Não foi possível validar suas permissões" }, 500);
    }

    const activeLinks = (userLinks ?? []) as UserHospitalLink[];
    const isSuperAdmin = activeLinks.some((link) => link.role === "super_admin");
    const manageableHospitalIds = new Set(
      activeLinks
        .filter((link) => link.role === "admin" || link.role === "super_admin")
        .map((link) => link.hospital_id),
    );

    if (manageableHospitalIds.size === 0) {
      return jsonResponse({ error: "Acesso negado" }, 403);
    }

    const body = await req.json();
    const { action } = body;

    switch (action) {
      case "create_user": {
        const { email, password, nome, registro, hospital_id, role } = body;

        if (!email || !password || !nome || !registro || !hospital_id || !role) {
          return jsonResponse({ error: "Campos obrigatórios faltando" }, 400);
        }

        if (!canManageHospital(isSuperAdmin, manageableHospitalIds, hospital_id)) {
          return jsonResponse({ error: "Você só pode cadastrar usuários em hospitais que administra" }, 403);
        }

        if (role === "super_admin" && !isSuperAdmin) {
          return jsonResponse({ error: "Apenas super_admin pode atribuir esse papel" }, 403);
        }

        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { nome, registro },
        });

        if (createError) {
          return jsonResponse({ error: createError.message }, 400);
        }

        const { error: linkError } = await supabaseAdmin
          .from("user_hospitals")
          .insert({ user_id: newUser.user.id, hospital_id, role });

        if (linkError) {
          await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
          return jsonResponse({ error: linkError.message }, 400);
        }

        return jsonResponse({ success: true, user_id: newUser.user.id });
      }

      case "link_user_hospital": {
        const { user_id, hospital_id, role } = body;

        if (!user_id || !hospital_id || !role) {
          return jsonResponse({ error: "Campos obrigatórios faltando" }, 400);
        }

        if (!canManageHospital(isSuperAdmin, manageableHospitalIds, hospital_id)) {
          return jsonResponse({ error: "Você só pode vincular usuários em hospitais que administra" }, 403);
        }

        if (role === "super_admin" && !isSuperAdmin) {
          return jsonResponse({ error: "Apenas super_admin pode atribuir esse papel" }, 403);
        }

        const { error } = await supabaseAdmin
          .from("user_hospitals")
          .insert({ user_id, hospital_id, role });

        if (error) {
          return jsonResponse({ error: error.message }, 400);
        }

        return jsonResponse({ success: true });
      }

      case "update_link": {
        const { link_id, role, ativo } = body;

        if (!link_id) {
          return jsonResponse({ error: "Link inválido" }, 400);
        }

        const { data: existingLink, error: existingLinkError } = await supabaseAdmin
          .from("user_hospitals")
          .select("hospital_id, role")
          .eq("id", link_id)
          .single();

        if (existingLinkError || !existingLink) {
          return jsonResponse({ error: "Vínculo não encontrado" }, 404);
        }

        if (!canManageHospital(isSuperAdmin, manageableHospitalIds, existingLink.hospital_id)) {
          return jsonResponse({ error: "Você só pode alterar vínculos do seu hospital" }, 403);
        }

        if ((role === "super_admin" || existingLink.role === "super_admin") && !isSuperAdmin) {
          return jsonResponse({ error: "Apenas super_admin pode alterar esse vínculo" }, 403);
        }

        const updateData: Record<string, unknown> = {};
        if (role !== undefined) updateData.role = role;
        if (ativo !== undefined) updateData.ativo = ativo;

        if (Object.keys(updateData).length === 0) {
          return jsonResponse({ error: "Nenhuma alteração informada" }, 400);
        }

        const { error } = await supabaseAdmin
          .from("user_hospitals")
          .update(updateData)
          .eq("id", link_id);

        if (error) {
          return jsonResponse({ error: error.message }, 400);
        }

        return jsonResponse({ success: true });
      }

      case "create_hospital": {
        const { nome, cidade, estado } = body;

        if (!isSuperAdmin) {
          return jsonResponse({ error: "Apenas super_admin pode criar hospitais" }, 403);
        }

        if (!nome || !cidade || !estado) {
          return jsonResponse({ error: "Campos obrigatórios faltando" }, 400);
        }

        const { data, error } = await supabaseAdmin
          .from("hospitals")
          .insert({ nome, cidade, estado })
          .select()
          .single();

        if (error) {
          return jsonResponse({ error: error.message }, 400);
        }

        return jsonResponse({ success: true, hospital: data });
      }

      case "update_hospital": {
        const { hospital_id, nome, cidade, estado, ativo } = body;

        if (!isSuperAdmin) {
          return jsonResponse({ error: "Apenas super_admin pode atualizar hospitais" }, 403);
        }

        if (!hospital_id) {
          return jsonResponse({ error: "Hospital inválido" }, 400);
        }

        const updateData: Record<string, unknown> = {};
        if (nome !== undefined) updateData.nome = nome;
        if (cidade !== undefined) updateData.cidade = cidade;
        if (estado !== undefined) updateData.estado = estado;
        if (ativo !== undefined) updateData.ativo = ativo;

        if (Object.keys(updateData).length === 0) {
          return jsonResponse({ error: "Nenhuma alteração informada" }, 400);
        }

        const { error } = await supabaseAdmin
          .from("hospitals")
          .update(updateData)
          .eq("id", hospital_id);

        if (error) {
          return jsonResponse({ error: error.message }, 400);
        }

        return jsonResponse({ success: true });
      }

      default:
        return jsonResponse({ error: "Ação inválida" }, 400);
    }
  } catch (err) {
    console.error("Erro na função admin-users", err);
    return jsonResponse({ error: err instanceof Error ? err.message : "Erro interno" }, 500);
  }
});