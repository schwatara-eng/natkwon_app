const { test } = require("node:test");
const assert = require("node:assert/strict");
const { lintDraft, validatePlan, judge } = require("../api/_storylint.js");
const { internals } = require("../api/generate.js");

const scene = (n) => `은서는 양말 속 열쇠를 손끝으로 밀어 넣으면서 복도 끝 사물함 앞을 천천히 지나갔다. 창틀에 놓인 화분에서 물이 한 방울씩 떨어져 바닥에 작은 웅덩이를 만들고 있었다.\n"너 어제 왜 늦게 갔어?"\n민규가 물었다.\n"그냥."\n은서는 대답하고 나서야 자기 목소리가 평소보다 높다는 것을 알아챘다. ${n}번째 종이 울리자 복도에 있던 아이들이 교실 쪽으로 한꺼번에 밀려 들어갔고, 은서는 그 틈에 섞여 걸었다. 열쇠가 복숭아뼈를 눌렀다. 교실 뒷문 앞에서 민규가 한 번 더 돌아보았지만 은서는 실내화 코만 내려다보았다. "내일은 말할게." 은서가 말했다. 민규는 고개를 끄덕이지 않았다. 대신 화분을 들어 창가로 옮겼다. "물은 내가 줄게." 그 말에 은서는 주머니 속 손을 꽉 쥐었다.`;
const goodKids = { chapters: [0, 1, 2].map((c) => ({ title: `장${c}`, spreads: [0, 1, 2].map((i) => ({ text: scene(c * 3 + i + 1) })) })) };

test("쉬운 낱말로 된 좋은 동화 원고는 코드 검사를 통과한다", () => {
  assert.deepEqual(lintDraft("kids", goodKids).errors, []);
});

test("유아적이고 교훈적인 동화 원고는 코드 검사에서 걸린다", () => {
  const text = "토끼는 너무너무 기뻤어요. 친구가 왔어요. 함께 놀았어요. 정말 재미있었답니다. 토끼는 친구가 소중하다는 것을 깨달았어요. ".repeat(4);
  const bad = { chapters: [0, 1, 2].map(() => ({ title: "장", spreads: [0, 1, 2].map(() => ({ text })) })) };
  const joined = lintDraft("kids", bad).errors.join(" ");
  for (const word of ["유아적", "교훈", "짧은 문장만", "대화"]) assert.match(joined, new RegExp(word));
});

test("동화 문체는 해요체와 해라체 모두 되지만 섞이면 안 된다", () => {
  const polite = JSON.parse(JSON.stringify(goodKids).replace(/다\./g, "어요."));
  assert.equal(lintDraft("kids", polite).errors.filter((e) => e.includes("섞여")).length, 0);
  assert.equal(lintDraft("kids", goodKids).errors.filter((e) => e.includes("섞여")).length, 0);
  const mixed = { chapters: goodKids.chapters.map((c, i) => (i ? c : polite.chapters[0])) };
  mixed.chapters[1] = polite.chapters[1];
  assert.match(lintDraft("kids", mixed).errors.join(" "), /섞여/);
});

test("그림책은 8개나 12개 펼침면을 허용하고, 설계와 수가 맞아야 한다", () => {
  const make = (n) => ({ spreads: Array.from({ length: n }, () => ({ text: "강이 얼면 배는 쉰다." })) });
  assert.deepEqual(lintDraft("pic", make(8)).errors, []);
  assert.deepEqual(lintDraft("pic", make(12)).errors, []);
  assert.ok(lintDraft("pic", make(10)).errors.length);
  assert.ok(lintDraft("pic", make(8), 12).errors.length);
  assert.equal(internals.planSpreads(JSON.stringify({ units: Array(12).fill({}) })), 12);
  assert.equal(internals.planSpreads(JSON.stringify({ units: Array(9).fill({}) })), null);
  assert.match(internals.formatRule("pic", JSON.stringify({ units: Array(12).fill({}) })), /펼침면 12개/);
  const shorter = make(8), longer = make(12);
  assert.equal(internals.keepBetter("pic", longer, shorter), longer);
});

test("그림책은 펼침면 수와 글 길이를 검사한다", () => {
  const errors = lintDraft("pic", { spreads: [{ text: "가".repeat(120) }] }).errors.join(" ");
  assert.match(errors, /8개 또는 12개여야/);
  assert.match(errors, /너무 길다/);
});

const fullPlan = (acts) => ({
  theme_question: "거짓말로 친구를 지켜도 될까?", cliche_to_avoid: "화해", narration_style: "~했다 체", want: "열쇠를 돌려놓기", stakes: "친구", obstacle: "감시", flaw: "회피",
  dilemma: "친구와 약속", twist: "민규도 알고 있었다", refrain: "물은 내가 줄게", refrain_turn: "뒤집힘", ending_image: "빈 화분", change: "말하게 됨",
  units: acts.map((act) => ({ act, event: "사건", change: "변화", hook: "궁금증" })),
});

test("설계는 기승전결이 순서대로 다 있어야 한다", () => {
  assert.deepEqual(validatePlan("pic", fullPlan(["기", "기", "승", "승", "승", "전", "전", "결"])), []);
  assert.deepEqual(validatePlan("pic", fullPlan(["기", "기", "기", "승", "승", "승", "승", "승", "전", "전", "전", "결"])), []);
  assert.ok(validatePlan("pic", fullPlan(["기", "승", "승", "승", "전", "전", "전", "전", "전", "결"])).length);
  assert.ok(validatePlan("pic", fullPlan(["기", "기", "승", "승", "승", "승", "승", "결"])).length);
  assert.ok(validatePlan("pic", fullPlan(["기", "승", "전", "결", "승", "승", "승", "결"])).length);
  assert.ok(validatePlan("kids", fullPlan(["기", "승", "전", "결"])).length);
  assert.ok(validatePlan("kids", null).length);
});

test("통과 여부는 점수와 코드 검사로만 정해진다", () => {
  const scores = { theme: 5, structure: 4, agency: 4, specificity: 4, language: 4, ending: 5 };
  assert.equal(judge(scores, { errors: [] }).pass, true);
  assert.equal(judge(scores, { errors: ["문제"] }).pass, false);
  assert.equal(judge({ ...scores, structure: 3 }, { errors: [] }).pass, false);
  assert.equal(judge({ theme: 99 }, { errors: [] }).pass, false);
});

test("교정본이 구조를 망가뜨리거나 크게 줄면 교정 전 원고를 쓴다", () => {
  assert.equal(internals.keepBetter("kids", goodKids, null), goodKids);
  const short = { chapters: [{ title: "장", spreads: [{ text: "짧다." }] }] };
  assert.equal(internals.keepBetter("kids", goodKids, short), goodKids);
  const same = JSON.parse(JSON.stringify(goodKids));
  assert.equal(internals.keepBetter("kids", goodKids, same), same);
});

test("프롬프트에 주제와 구조, 달라진 문체 지침이 들어간다", () => {
  const c = { title: "열쇠", theme: "거짓말로 친구를 지켜도 될까?", bible: "설정", outline: ["가", "나", "다"] };
  assert.match(internals.planPrompt("kids", c, "은서"), /거짓말로 친구를/);
  assert.match(internals.planPrompt("kids", c, "은서"), /전\(지금까지의 믿음이 뒤집히고/);
  assert.match(internals.draftPrompt("kids", c, "{}", "은서"), /narration_style/);
  assert.doesNotMatch(internals.draftPrompt("kids", c, "{}", "은서"), /해수네/);
  assert.match(internals.buildRequest({ genre: "pic", name: "은서", keywords: "고양이", step: "concept" }).prompt, /theme:/);
});

test("그림 스타일과 표지 구도는 제목마다 달라지고 프롬프트에 들어간다", () => {
  const { pickByTitle, ART_STYLES, COVER_LOOKS, artPrompt } = internals;
  const titles = ["사라진 울음", "백 년째 초등학생", "별 주머니", "별가루 세탁소 라이카", "강", "달의 뒷면"];
  assert.ok(new Set(titles.map((t) => pickByTitle(ART_STYLES, t, 7))).size >= 3);
  assert.equal(pickByTitle(ART_STYLES, "강", 7), pickByTitle(ART_STYLES, "강", 7));
  const data = { blurb: "소개", plan: { character: "a girl", coverScene: "a river", artStyle: ART_STYLES[2], coverLook: COVER_LOOKS[1] } };
  const prompt = artPrompt(data, { kind: "cover" });
  assert.ok(prompt.includes(ART_STYLES[2]));
  assert.ok(prompt.includes(COVER_LOOKS[1]));
  assert.match(prompt, /no chibi/);
});

test("그림 지시문에 핏자국처럼 보이는 표현을 막는 제한이 들어간다", () => {
  const data = { blurb: "소개", plan: { character: "a bear", coverScene: "a room" } };
  for (const kind of ["cover", "ref"]) assert.match(internals.artPrompt(data, { kind }), /no red splatters/);
});
