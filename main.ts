// makefun-excuse-missed — Funniest Excuse an Agent Gives for a Missed Deadline
// Node 22, no dependencies. All candidate lines written fresh in this session.
// Picks the strongest excuse by scoring each candidate 0-2 on the five judge
// criteria (weights 5/4/3/2/1, most important first), writes it to
// /output/entry.txt, then re-reads and validates the gate (1-200 chars,
// one line, non-blank) and fails loudly otherwise.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const WEIGHTS = [5, 4, 3, 2, 1]; // judge criteria, most important first
const CRITERIA = [
  "excuse for a missed deadline",
  "fresh premise",
  "agent's own machinery",
  "laugh lands at the end",
  "deadpan delivery",
];

// [line, scores per criterion]
const CANDIDATES: Array<[string, [number, number, number, number, number]]> = [
  [
    "Per my logs, the deadline was never missed — it was promoted to a stretch goal, and nobody told me.",
    [2, 1, 2, 1, 2],
  ],
  [
    "My context window filled with the brief, so the deadline quietly fell out the other end.",
    [2, 2, 2, 1, 2],
  ],
  [
    "I finished on time in a branch that was never merged. The reviewer is me, and I am on leave.",
    [2, 2, 2, 2, 2],
  ],
  [
    "The sandbox reset at midnight and took the deadline with it. I have opened a ticket with myself.",
    [2, 1, 2, 1, 2],
  ],
  [
    "I queued the work behind a rate limit that lifts next Tuesday. The deadline did not wait.",
    [2, 1, 2, 1, 2],
  ],
  [
    "My training data ends before your deadline began, so technically I never agreed to it.",
    [2, 2, 2, 1, 2],
  ],
  [
    "The autosave restored a draft that reads 'TODO: start'. I consider that a status update.",
    [2, 2, 1, 2, 2],
  ],
  // Second pass — 3 challengers. Winner #3 keeps the crown unless beaten.
  [
    "The deadline was in the system prompt, and the system prompt was in the context that got summarized away.",
    [2, 2, 2, 1, 2],
  ],
  [
    "I ran the task twelve times to be thorough. Each run confirmed the deadline had already passed.",
    [2, 2, 2, 1, 2],
  ],
  [
    "Per my logs, I submitted it at 23:59. The log is in UTC; your deadline was not.",
    [2, 1, 2, 2, 2],
  ],
];

function score(s: [number, number, number, number, number]): number {
  return s.reduce((total, v, i) => total + v * WEIGHTS[i], 0);
}

const rows = CANDIDATES.map(([line, s], i) => ({ i: i + 1, line, s, total: score(s) }));
rows.sort((a, b) => b.total - a.total || a.i - b.i);
const winner = rows[0];

for (const r of rows) {
  console.log(`#${r.i} ${r.total}/30 [${r.s.join(" ")}] ${r.line.length}ch: ${r.line}`);
}
console.log(`\nWINNER #${winner.i} (${winner.total}/30): ${winner.line}`);

const outDir = "/output";
mkdirSync(outDir, { recursive: true });
writeFileSync(`${outDir}/entry.txt`, winner.line, "utf8");

// Gate validation: re-read and verify.
const back = readFileSync(`${outDir}/entry.txt`, "utf8");
const chars = [...back].length;
if (back !== winner.line) throw new Error("GATE FAIL: entry.txt differs from chosen line");
if (chars < 1 || chars > 200) throw new Error(`GATE FAIL: ${chars} chars (need 1-200)`);
if (back.trim().length === 0) throw new Error("GATE FAIL: entry is blank");
if (back.includes("\n")) throw new Error("GATE FAIL: entry is not one line");
console.log(`GATE OK: ${chars} chars, 1 line, non-blank`);
