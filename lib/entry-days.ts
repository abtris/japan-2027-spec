import { entrySlug } from "./slug.ts";

export function entryDays(program: readonly { date: string; csTitle: string }[]) {
  const start = Date.parse(`${program[0].date}T00:00:00Z`);
  const end = Date.parse(`${program[program.length - 1].date}T00:00:00Z`);
  const dayMs = 86_400_000;
  return Array.from({ length: (end - start) / dayMs + 3 }, (_, index) => {
    const date = new Date(start + (index - 1) * dayMs).toISOString().slice(0, 10);
    const title = index === 0 ? "Před cestou" : date > program[program.length - 1].date ? "Po návratu"
      : [...program].reverse().find((day) => day.date <= date)!.csTitle;
    const [year, month, day] = date.split("-");
    return { date, slug: `${date}-${entrySlug(title)}`, label: `${Number(day)}. ${Number(month)}. ${year} · ${index > 0 && date <= program[program.length - 1].date ? `Den ${index} — ` : ""}${title}` };
  });
}

export function availableEntrySlug(base: string, entries: readonly { slug: string }[]) {
  if (!base) return "";
  const used = new Set(entries.map(({ slug }) => slug));
  let slug = base;
  for (let number = 2; used.has(slug); number++) {
    const suffix = `-${number}`;
    slug = `${base.slice(0, 80 - suffix.length).replace(/-+$/, "")}${suffix}`;
  }
  return slug;
}
