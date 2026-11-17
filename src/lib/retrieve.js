// Lexical retrieval (BM25) over the case-study passages.
// Runs in the browser; also importable from Node for testing.
// It can only quote what is in the corpus, and it declines when nothing matches well enough.

const STOP = new Set(
  `a about after all also am an and any are as at be been being but by can could did do does doing done
  each ever for from get got had has have having he her here him his how i if in into is it its just
  like make made many me more most much my no not of on one or other our out over own s she so some
  such t tell than that the their them then there these they thing things this those to too up us use
  used using very was we were what when where which who whom why will with would you your yours rourke
  work worked working project projects build built building system systems ai
  ship shipped shipping deliver delivered delivering create created develop developed write wrote
  written know knows good great best experience experienced skill skills stop prevent avoid handle
  deal ensure keep approach manage solve show explain describe give want need help please hi hello
  hey thanks thank kind sort type really actually ever yet still now today company companies
  down off under through across around per via within without between during before again always
  whats whos hows wheres im ive youre youve dont doesnt cant isnt arent didnt wont
  sure able possible well way ways lot lots bit something anything everything someone anyone
  people person stuff look looking see think feel say said talk talking mean means come go going
  take put try new big small main key overall general generally specific specifically example
  examples biggest favourite favorite proud proudest most interesting play plays playing enjoy
  enjoys love loves`.split(/\s+/)
);

// Query expansion: everyday words mapped to the vocabulary the case studies use.
const EXPAND = {
  hallucinate: ['grounded', 'unsourced', 'improvising', 'citation', 'source'],
  hallucination: ['grounded', 'unsourced', 'improvising', 'citation', 'source'],
  making: ['grounded', 'unsourced', 'improvising'],
  wrong: ['grounded', 'unsourced', 'failure'],
  accurate: ['grounded', 'accuracy', 'eval', 'citation'],
  accuracy: ['grounded', 'eval', 'citation'],
  trust: ['grounded', 'citation', 'governance'],
  rag: ['retrieval', 'grounded', 'vector', 'embeddings', 'citation'],
  fast: ['weeks', 'timeline', 'days', 'schedule'],
  quick: ['weeks', 'timeline', 'days', 'schedule'],
  quickly: ['weeks', 'timeline', 'days', 'schedule'],
  speed: ['weeks', 'timeline', 'days', 'schedule'],
  deliver: ['rollout', 'weeks', 'timeline', 'shipped'],
  deadline: ['timeline', 'weeks', 'schedule'],
  language: ['isizulu', 'isixhosa', 'afrikaans', 'english', 'languages'],
  languages: ['isizulu', 'isixhosa', 'afrikaans', 'english'],
  multilingual: ['isizulu', 'isixhosa', 'afrikaans', 'languages'],
  speak: ['languages', 'isizulu', 'isixhosa'],
  zulu: ['isizulu'],
  xhosa: ['isixhosa'],
  database: ['postgres', 'supabase', 'migrations'],
  db: ['postgres', 'supabase', 'migrations'],
  sql: ['postgres', 'migrations'],
  model: ['claude'],
  models: ['claude'],
  llm: ['claude', 'model', 'anthropic'],
  llms: ['claude', 'model', 'anthropic'],
  test: ['eval', 'tests', 'ci', 'harness'],
  testing: ['eval', 'tests', 'ci', 'harness'],
  evals: ['eval', 'harness', 'tests'],
  evaluation: ['eval', 'harness', 'tests'],
  security: ['secret', 'rls', 'dkim', 'isolation', 'pii'],
  secure: ['secret', 'rls', 'dkim', 'isolation', 'pii'],
  privacy: ['pii', 'secret', 'isolation'],
  tenant: ['multi-tenant', 'tenancy', 'isolation', 'rls'],
  tenants: ['multi-tenant', 'tenancy', 'isolation', 'rls'],
  scale: ['tenants', 'agents', 'multi-tenant', 'rollout'],
  users: ['agents', 'students', 'tenants', 'cohorts'],
  frontend: ['next.js', 'typescript', 'pwa', 'dashboard'],
  stack: ['typescript', 'next.js', 'supabase', 'claude'],
  tools: ['typescript', 'next.js', 'supabase', 'claude'],
  cost: ['costs', 'caps', 'spend', 'cheapest'],
  money: ['costs', 'spend', 'caps'],
  compliance: ['fais', 'regulatory', 'governance'],
  regulation: ['fais', 'regulatory', 'governance'],
  crm: ['zoho', 'conversions'],
  ads: ['meta', 'google', 'conversions'],
  monitoring: ['watchtower', 'sentinels', 'watchdog', 'alert'],
  ops: ['runbooks', 'rollback', 'rotation', 'incident'],
  operations: ['runbooks', 'rollback', 'rotation', 'incident'],
  reliability: ['runbooks', 'rollback', 'sentinels', 'incident'],
  fun: ['game', 'party', 'chess'],
  game: ['impostor', 'party', 'multiplayer'],
  grading: ['grades', 'graded', 'rubrics'],
  education: ['students', 'learning', 'curriculum'],
  email: ['inbound', 'dkim', 'accountant'],
  automation: ['automatically', 'reconciles', 'scheduled'],
  agents: ['watchtower', 'scheduled', 'agent'],
  voice: ['calls', 'voice'],
  hobby: ['chess', 'bonsai', 'calisthenics'],
  hobbies: ['chess', 'bonsai', 'calisthenics'],
  interests: ['chess', 'bonsai', 'calisthenics'],
  outside: ['chess', 'bonsai', 'calisthenics'],
  free: ['chess', 'bonsai', 'calisthenics'],
  plants: ['bonsai'],
  gym: ['calisthenics'],
  exercise: ['calisthenics'],
  sport: ['calisthenics', 'chess'],
  intern: ['intern', 'account'],
  internship: ['intern', 'account'],
  started: ['intern', 'joined'],
  start: ['intern', 'joined'],
  career: ['intern', 'engineer', 'role'],
  school: ['edinburgh', 'msc'],
  studying: ['msc', 'edinburgh'],
  study: ['msc', 'analytics', 'edinburgh'],
  studied: ['msc', 'analytics'],
  degree: ['msc', 'analytics', 'edinburgh'],
  qualification: ['msc', 'analytics'],
  qualifications: ['msc', 'analytics'],
  university: ['msc', 'edinburgh'],
  masters: ['msc', 'analytics'],
  background: ['msc', 'analytics', 'engineer'],
  based: ['johannesburg'],
  located: ['johannesburg'],
  location: ['johannesburg'],
  live: ['johannesburg'],
  country: ['johannesburg', 'africa'],
  city: ['johannesburg'],
  contact: ['email', 'linkedin', 'reach'],
  hire: ['email', 'linkedin', 'reach'],
  reach: ['email', 'linkedin'],
  employer: ['gas', 'marketing'],
  job: ['engineer', 'gas'],
  role: ['engineer', 'gas'],
  title: ['engineer'],
};

// Phrases that mean something as a whole. Each match becomes one strong concept
// and its words are removed, so they are not also scored one by one.
const PHRASES = [
  [
    /\b(mak\w*|made|invent\w*|fabricat\w*) (things|stuff|it|answers?|facts?) up\b|\bmade[- ]up\b|\bhallucinat\w*|\bfabricat\w*|\bguess(ing|es)?\b/,
    ['grounded', 'unsourced', 'improvising', 'hallucination', 'citation', 'cites'],
  ],
  [/\bmulti[- ]?tenan\w*/, ['multi-tenant', 'multi-tenancy', 'tenant', 'isolation']],
  [
    /\bhow (fast|quick|quickly|long)\b|\bturn ?around\b|\btime ?lines?\b/,
    ['weeks', 'timeline', 'days', 'schedule', 'rollout'],
  ],
  [/\bwhere\b.*\b(work|employed)\b|\bwho\b.*\bwork for\b|\bcurrent (job|role)\b/, ['gas', 'marketing', 'johannesburg']],
  [/\bwhere\b.*\b(you|he|she|they|rourke)\b/, ['johannesburg']],
];

// Word families the suffix rules below would split apart or wrongly merge
// ("grounded" must not collapse into the "ground" of "ground truth").
const FAMILY = {
  grounded: 'grounded',
  grounding: 'grounded',
  cite: 'cite',
  cites: 'cite',
  cited: 'cite',
  citation: 'cite',
  citations: 'cite',
  hallucination: 'hallucinate',
  hallucinations: 'hallucinate',
  hallucinated: 'hallucinate',
  hallucinates: 'hallucinate',
  retrieval: 'retrieve',
  retrieved: 'retrieve',
  retrieves: 'retrieve',
  'multi-tenancy': 'multi-tenant',
  tenancy: 'tenant',
};

const stem = (w) => {
  if (FAMILY[w]) return FAMILY[w];
  if (w.length > 5 && w.endsWith('ies')) return w.slice(0, -3) + 'y';
  if (w.length > 5 && w.endsWith('ing')) return w.slice(0, -3);
  if (w.length > 4 && w.endsWith('ed')) return w.slice(0, -2);
  if (w.length > 4 && w.endsWith('es')) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1);
  return w;
};

const words = (text) =>
  text
    .toLowerCase()
    .replace(/[’']/g, '')
    .split(/[^a-z0-9.\-]+/)
    .map((w) => w.replace(/^[.\-]+|[.\-]+$/g, ''))
    .filter(Boolean);

export const terms = (text) => words(text).filter((w) => !STOP.has(w)).map(stem);

const K1 = 1.4;
const B = 0.75;
/** Below this score the best passage is not a real match, so we decline. */
const MIN_SCORE = 1.1;

export function createIndex(passages) {
  const docs = passages.map((p) => {
    const tf = new Map();
    const all = terms(`${p.title} ${p.text}`);
    for (const t of all) tf.set(t, (tf.get(t) ?? 0) + 1);
    return { p, tf, len: all.length };
  });
  const avgLen = docs.reduce((sum, d) => sum + d.len, 0) / Math.max(docs.length, 1);
  const df = new Map();
  for (const d of docs) for (const t of d.tf.keys()) df.set(t, (df.get(t) ?? 0) + 1);
  const idf = (t) => {
    const n = df.get(t) ?? 0;
    return n ? Math.log(1 + (docs.length - n + 0.5) / (n + 0.5)) : 0;
  };

  const known = (t) => df.has(t);

  function search(query, limit = 3) {
    // A query becomes a list of concepts. A concept is the visitor's word (or a
    // whole phrase) plus the corpus vocabulary it expands to.
    let rest = ` ${query.toLowerCase()} `;
    const concepts = [];
    for (const [pattern, expansion] of PHRASES) {
      if (!pattern.test(rest)) continue;
      rest = rest.replace(pattern, ' ');
      concepts.push(new Map(expansion.map((t) => [stem(t), 1])));
    }
    for (const raw of words(rest)) {
      const concept = new Map();
      if (!STOP.has(raw)) concept.set(stem(raw), 1);
      for (const extra of EXPAND[raw] ?? []) {
        const t = stem(extra);
        if (!concept.has(t)) concept.set(t, 0.6);
      }
      if (concept.size) concepts.push(concept);
    }
    if (!concepts.length) return { hits: [], matched: [] };

    // When a whole phrase was recognised it carries the intent, so the loose
    // words around it ("a model", "your answers") count for half.
    const phraseCount = concepts.length - words(rest).filter((raw) => !STOP.has(raw) || EXPAND[raw]).length;
    const weights = new Map();
    concepts.forEach((concept, i) => {
      const scale = phraseCount > 0 && i >= phraseCount ? 0.5 : 1;
      for (const [t, w] of concept) weights.set(t, Math.max(w * scale, weights.get(t) ?? 0));
    });
    const matched = [...weights.keys()];

    const scored = docs
      .map((d) => {
        let score = 0;
        for (const [t, w] of weights) {
          const f = d.tf.get(t);
          if (!f) continue;
          score += (w * idf(t) * (f * (K1 + 1))) / (f + K1 * (1 - B + (B * d.len) / avgLen));
        }
        // A bare technology list is a weaker answer than a sentence about the work.
        if (d.p.section === 'Stack') score *= 0.8;
        return { passage: d.p, score, tf: d.tf };
      })
      .filter((r) => r.score >= MIN_SCORE)
      .sort((a, b) => b.score - a.score);

    if (!scored.length) return { hits: [], matched };

    // Decline when the question is at least as much about things this site
    // never mentions as about things it does.
    const top = scored[0];
    const covered = concepts.filter((c) => [...c.keys()].some((t) => top.tf.has(t))).length;
    const unknown = concepts.filter((c) => ![...c.keys()].some(known)).length;
    if (!covered || (unknown && covered <= unknown)) return { hits: [], matched };

    // Keep close runners-up only, and at most two passages per source.
    const perSource = new Map();
    const hits = [];
    for (const r of scored) {
      if (r.score < top.score * 0.6) break;
      const used = perSource.get(r.passage.n) ?? 0;
      if (used >= 2) continue;
      perSource.set(r.passage.n, used + 1);
      hits.push({ passage: r.passage, score: r.score });
      if (hits.length === limit) break;
    }
    return { hits, matched };
  }

  return { search };
}

/** Trims a long passage to the sentences around its best match. */
export function excerpt(text, matched, max = 300) {
  if (text.length <= max) return text;
  const sentences = text.match(/[^.!?]+[.!?]+["')\]]*\s*|[^.!?]+$/g) ?? [text];
  const want = new Set(matched);
  const hitsIn = (s) => terms(s).filter((t) => want.has(t)).length;
  let best = 0;
  sentences.forEach((s, i) => {
    if (hitsIn(s) > hitsIn(sentences[best])) best = i;
  });
  let start = best;
  let end = best;
  let length = sentences[best].length;
  while (true) {
    const next = sentences[end + 1];
    const prev = sentences[start - 1];
    if (next && length + next.length <= max) {
      end += 1;
      length += next.length;
    } else if (prev && length + prev.length <= max) {
      start -= 1;
      length += prev.length;
    } else break;
  }
  const body = sentences.slice(start, end + 1).join('').trim();
  return `${start > 0 ? '… ' : ''}${body}${end < sentences.length - 1 ? ' …' : ''}`;
}

/** Splits text into [{ text, hit }] so matched words can be highlighted without innerHTML. */
export function highlight(text, matched) {
  const want = new Set(matched);
  return text.split(/([A-Za-z0-9][A-Za-z0-9.\-’']*)/).map((part) => {
    const w = part.toLowerCase().replace(/[’']/g, '').replace(/[.\-]+$/g, '');
    return { text: part, hit: !!w && !STOP.has(w) && want.has(stem(w)) };
  });
}
