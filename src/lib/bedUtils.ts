/** Generate a short abbreviation from sector name, e.g. "Enfermaria 1º Andar" -> "ENF-1A" */
export function sectorAbbrev(nome: string): string {
  const clean = nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const words = clean.split(/[\s-]+/).filter(Boolean);

  if (words.length === 1) {
    return words[0].substring(0, 3).toUpperCase();
  }

  const first = words[0].substring(0, 3).toUpperCase();
  const rest = words
    .slice(1)
    .map((w) => {
      const digits = w.replace(/[^\d]/g, "");
      if (digits) return digits;
      return w[0]?.toUpperCase() || "";
    })
    .join("");

  return `${first}-${rest}`;
}

export function bedLabel(abbrev: string, index: number): string {
  return `${abbrev} ${String(index + 1).padStart(2, "0")}`;
}
