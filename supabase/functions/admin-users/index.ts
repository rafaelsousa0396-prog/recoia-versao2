import { createClient } from "https://esm.sh/@supabase/supabase-js@2.99.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Client with user's token for auth check
    const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user is admin or super_admin
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Admin client with service role
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Check if user is admin or super_admin
    const { data: userRoles } = await supabaseAdmin
      .from("user_hospitals")
      .select("role")
      .eq("user_id", user.id)
      .eq("ativo", true)
      .in("role", ["admin", "super_admin"]);

    if (!userRoles || userRoles.length === 0) {
      return new Response(JSON.stringify({ error: "Acesso negado" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action } = body;

    switch (action) {
      case "create_user": {
        const { email, password, nome, registro, hospital_id, role } = body;

        if (!email || !password || !nome || !registro || !hospital_id || !role) {
          return new Response(JSON.stringify({ error: "Campos obrigatórios faltando" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Only super_admin can assign super_admin role
        const isSuperAdmin = userRoles.some((r: any) => r.role === "super_admin");
        if (role === "super_admin" && !isSuperAdmin) {
          return new Response(JSON.stringify({ error: "Apenas super_admin pode atribuir esse papel" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { nome, registro },
        });

        if (createError) {
          return new Response(JSON.stringify({ error: createError.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Link to hospital
        const { error: linkError } = await supabaseAdmin
          .from("user_hospitals")
          .insert({ user_id: newUser.user.id, hospital_id, role });

        if (linkError) {
          return new Response(JSON.stringify({ error: linkError.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ success: true, user_id: newUser.user.id }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "link_user_hospital": {
        const { user_id, hospital_id, role } = body;

        const isSuperAdmin = userRoles.some((r: any) => r.role === "super_admin");
        if (role === "super_admin" && !isSuperAdmin) {
          return new Response(JSON.stringify({ error: "Apenas super_admin pode atribuir esse papel" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { error } = await supabaseAdmin
          .from("user_hospitals")
          .insert({ user_id, hospital_id, role });

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "update_link": {
        const { link_id, role, ativo } = body;

        const updateData: any = {};
        if (role !== undefined) updateData.role = role;
        if (ativo !== undefined) updateData.ativo = ativo;

        const { error } = await supabaseAdmin
          .from("user_hospitals")
          .update(updateData)
          .eq("id", link_id);

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "create_hospital": {
        const { nome, cidade, estado } = body;

        const isSuperAdmin = userRoles.some((r: any) => r.role === "super_admin");
        if (!isSuperAdmin) {
          return new Response(JSON.stringify({ error: "Apenas super_admin pode criar hospitais" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { data, error } = await supabaseAdmin
          .from("hospitals")
          .insert({ nome, cidade, estado })
          .select()
          .single();

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ success: true, hospital: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "update_hospital": {
        const { hospital_id, nome, cidade, estado, ativo } = body;

        const updateData: any = {};
        if (nome !== undefined) updateData.nome = nome;
        if (cidade !== undefined) updateData.cidade = cidade;
        if (estado !== undefined) updateData.estado = estado;
        if (ativo !== undefined) updateData.ativo = ativo;

        const { error } = await supabaseAdmin
          .from("hospitals")
          .update(updateData)
          .eq("id", hospital_id);

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({ error: "Ação inválida" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
