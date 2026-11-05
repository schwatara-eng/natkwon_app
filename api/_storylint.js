// 동화책·그림책 원고의 기준선을 코드로 검사한다. AI 평가와 달리 언제나 같은 결과가 나온다.
// 여기서 잡은 errors가 하나라도 있으면 심사를 통과하지 못하고, 원인이 고쳐 쓰기 지시로 넘어간다.
const SHAPE = { kids: { chapters: 3, spreads: 3, min: 300, max: 620 }, pic: { spreads: 8, max: 100 } };

const CHILDISH = /너무너무|[가-힣]답니다|뿅|짠[!~]|룰루랄라|~|!!/g;
const MORAL = /깨달았|깨닫게|소중한 (것|친구|마음)|소중하다는|중요하다는|다짐했|진정한|함께라면/g;
const NAMED_FEELING = /행복했|행복해졌|기뻤|기뻐했|슬펐|외로웠|뿌듯|(마음|가슴)이 따뜻/g;
const AI_PHRASE = /단순한 .{1,12}(이|가) 아니었|어쩌면 .{1,20}지도 모른다/g;

const count = (text, re) => (text.match(re) || []).length;
const unquote = (text) => text.replace(/["“][^"”]*["”]/g, " ");
const sentences = (text) => text.split(/(?<=[.?!…])\s+|\n+/).map((s) => s.trim()).filter((s) => /[가-힣]/.test(s));

function units(genre, draft) {
  if (genre === "pic") return (draft && draft.spreads) || [];
  return ((draft && draft.chapters) || []).flatMap((c) => c.spreads || []);
}

function lintDraft(genre, draft) {
  const errors = [], warnings = [], shape = SHAPE[genre];
  const list = units(genre, draft), texts = list.map((u) => String(u.text || ""));
  const all = texts.join("\n");

  if (genre === "pic") {
    if (list.length !== shape.spreads) errors.push(`펼침면이 ${list.length}개다. ${shape.spreads}개여야 한다.`);
  } else {
    const chapters = (draft && draft.chapters) || [];
    if (chapters.length !== shape.chapters || chapters.some((c) => (c.spreads || []).length !== shape.spreads)) {
      errors.push(`장 ${shape.chapters}개, 장마다 펼침면 ${shape.spreads}개여야 한다.`);
    }
  }
  texts.forEach((t, i) => {
    if (t.length > shape.max) errors.push(`${i + 1}번째 펼침면이 ${t.length}자로 너무 길다. ${shape.max}자 이내로 줄인다.`);
    if (shape.min && t.length < shape.min) errors.push(`${i + 1}번째 펼침면이 ${t.length}자로 너무 짧다. 장면을 더 구체적으로 쓴다.`);
  });

  const childish = count(all, CHILDISH);
  if (childish) errors.push(`유아적인 말투가 ${childish}곳 있다(너무너무, ~답니다, 물결표, 느낌표 겹쳐 쓰기 등). 모두 없앤다.`);
  const moral = (all.match(MORAL) || []);
  if (moral.length) errors.push(`교훈을 직접 말하는 표현이 있다: ${[...new Set(moral)].join(", ")}. 행동과 장면으로 바꾼다.`);
  const felt = (all.match(NAMED_FEELING) || []);
  if (felt.length >= (genre === "pic" ? 2 : 3)) errors.push(`감정에 이름을 붙인 표현이 많다: ${[...new Set(felt)].join(", ")}. 행동과 사물로 드러낸다.`);
  if (count(all, AI_PHRASE)) errors.push("'단순한 ~이 아니었다', '어쩌면 ~지도 모른다' 같은 상투 문장을 없앤다.");
  if (count(all, /마치/g) >= 4) warnings.push("'마치'를 너무 자주 쓴다.");

  if (genre === "kids") {
    const narration = sentences(unquote(all));
    const politeEnding = narration.filter((s) => /(어요|에요|예요|지요)[.?!…]?$/.test(s)).length;
    if (narration.length && politeEnding / narration.length > 0.3) errors.push("서술이 '~어요' 체에 치우쳐 있다. 서술은 '~했다' 체로 통일한다.");
    const long = narration.filter((s) => s.length >= 30).length;
    if (narration.length && long / narration.length < 0.15) errors.push("짧은 문장만 이어진다. 30자 이상의 호흡 긴 문장을 곳곳에 섞어 리듬을 바꾼다.");
    if (count(all, /["“][^"”]*["”]/g) < 4) errors.push("대화가 거의 없다. 인물이 말로 부딪치는 장면을 넣는다.");
  }
  let run = 1, repeated = 0, last = "";
  for (const s of sentences(unquote(all))) {
    const first = s.split(/\s+/)[0];
    run = first === last ? run + 1 : 1;
    if (run === 3) repeated++;
    last = first;
  }
  if (repeated) warnings.push(`같은 말로 시작하는 문장이 세 번 이상 이어지는 곳이 ${repeated}곳 있다.`);
  return { errors, warnings };
}

const ACTS = ["기", "승", "전", "결"];
const PLAN_FIELDS = ["theme_question", "cliche_to_avoid", "want", "stakes", "obstacle", "flaw", "dilemma", "twist", "refrain", "refrain_turn", "ending_image", "change"];

// 설계가 네 단계 구조를 제대로 갖췄는지 본다. 문제가 없으면 빈 배열.
function validatePlan(genre, plan) {
  if (!plan || typeof plan !== "object") return ["설계가 JSON이 아니다."];
  const problems = [], total = genre === "pic" ? SHAPE.pic.spreads : SHAPE.kids.chapters * SHAPE.kids.spreads;
  for (const f of PLAN_FIELDS) if (!String(plan[f] || "").trim()) problems.push(`${f}가 비어 있다.`);
  if (plan.theme_question && !/\?\s*$/.test(String(plan.theme_question))) problems.push("theme_question은 질문으로 끝나야 한다.");
  const list = Array.isArray(plan.units) ? plan.units : [];
  if (list.length !== total) problems.push(`units가 ${list.length}개다. ${total}개여야 한다.`);
  const acts = list.map((u) => ACTS.indexOf(u && u.act));
  if (acts.includes(-1) || acts.some((a, i) => i && a < acts[i - 1]) || ACTS.some((_, i) => !acts.includes(i))) problems.push("기, 승, 전, 결이 순서대로 모두 있어야 한다.");
  if (list.some((u) => !u || !String(u.event || "").trim() || !String(u.change || "").trim())) problems.push("모든 unit에 사건과 달라지는 점이 있어야 한다.");
  return problems;
}

// 심사 점수 계산은 모델에게 맡기지 않는다. 모든 항목 4점 이상, 평균 4.2 이상, 코드 검사 오류 없음이 통과선이다.
const CRITERIA = ["theme", "structure", "agency", "specificity", "language", "ending"];
function judge(scores, lint) {
  const vals = CRITERIA.map((k) => Math.max(1, Math.min(5, Number(scores && scores[k]) || 1)));
  const score = Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100;
  const pass = vals.every((v) => v >= 4) && score >= 4.2 && lint.errors.length === 0;
  return { score, pass, rank: score - lint.errors.length * 0.5 };
}

module.exports = { lintDraft, validatePlan, judge, CRITERIA, ACTS, units };
