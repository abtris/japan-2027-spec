import assert from "node:assert/strict";
import test from "node:test";
import { availableEntrySlug, entryDays } from "./entry-days.ts";

test("quick entry days include trip boundaries and each day of a multi-day stop", () => {
  const days = entryDays([
    { date: "2027-04-01", csTitle: "Odlet z Prahy" },
    { date: "2027-04-06", csTitle: "Kjóto" },
    { date: "2027-04-09", csTitle: "Nara" },
    { date: "2027-04-15", csTitle: "Cesta zpět do ČR" },
  ]);
  assert.equal(days.length, 17);
  assert.equal(days[0].date, "2027-03-31");
  assert.equal(days[16].date, "2027-04-16");
  assert.equal(days[7].slug, "2027-04-07-kjoto");
  assert.match(days[8].label, /Den 8 — Kjóto/);
  assert.equal(days[9].slug, "2027-04-09-nara");
  assert.equal(new Set(days.map(({ slug }) => slug)).size, 17);
  const used = [{ slug: days[7].slug }, { slug: `${days[7].slug}-2` }];
  assert.equal(availableEntrySlug(days[7].slug, used), "2027-04-07-kjoto-3");
  assert.equal(availableEntrySlug("", used), "");
  const long = availableEntrySlug("a".repeat(80), [{ slug: "a".repeat(80) }]);
  assert.equal(long.length, 80);
  assert.match(long, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
});
