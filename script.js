/* 낱권 화면 코드
   순서: 데이터(표지, 예시 책) → 쪽 나누기 → 표지와 페이지 그리기 → 뷰어 → 생성 */

const PALETTES = {
  bathhouse: { b: "#12504f", f: "#f6efe3", a: "#e9a79b", n: "#3a1712", l: "#2a6a68", d: "#0d3f3f" },
  ink:       { b: "#1c2230", f: "#ece7da", a: "#d8b24a", n: "#2a2006", l: "#333b4e", d: "#141927" },
  brick:     { b: "#7d2f24", f: "#f7ebdc", a: "#efc27b", n: "#3c2206", l: "#96473a", d: "#64241b" },
  moss:      { b: "#434f2c", f: "#f1eed9", a: "#d3c76a", n: "#2b2806", l: "#5a6840", d: "#343e21" },
  plum:      { b: "#47294a", f: "#f3e8ea", a: "#e59aa6", n: "#3f141d", l: "#5f3f62", d: "#371f3a" },
  paper:     { b: "#ece6d8", f: "#26231e", a: "#c04a30", n: "#fff6ec", l: "#c9c1ae", d: "#ded6c4" },
};
const MOTIFS = ["tiles", "sun", "rings", "rain", "arch"];
const SPEC = {
  novel: { label: "소설", size: "신국판 152×225mm", type: "본명조 계열 10.2pt, 행간 172%, 양끝 정렬, 첫 줄 들여쓰기", w: 608, h: 900 },
  essay: { label: "에세이", size: "사륙판 128×188mm", type: "바탕 계열 9.9pt, 행간 190%, 문단 사이 한 줄", w: 512, h: 752 },
  kids: { label: "동화책", size: "크라운판 176×248mm", type: "돋움 계열 13pt, 행간 185%, 장마다 삽화", w: 704, h: 992 },
  pic: { label: "그림책", size: "정사각 판형 215×215mm", type: "펼침면 전체 그림 위에 짧은 글", w: 640, h: 640 },
};

const SAMPLES = {
  novel: {
    genre: "novel", name: "윤해수", keywords: "폐업하는 동네 목욕탕, 마지막 손님",
    title: "물 빼는 날", subtitle: "장편소설", palette: "bathhouse", motif: "tiles",
    tagline: "서른 해 동안 한 번도 비운 적 없는 탕에서\n물이 빠지기 시작하면, 바닥에 뭐가 남을까.",
    blurb: "재개발 공고가 붙은 대성탕의 마지막 영업일. 아버지에게 목욕탕을 물려받은 윤해수는 저녁 여덟 시에 보일러를 끄기로 마음먹는다. 그런데 문 닫을 시간이 지나도록 여탕 온탕에 몸을 담근 채 나오지 않는 손님이 있다. 서른 해 동안 매주 화요일이면 찾아온 그 노인은 해수의 이름을 처음으로 부르며 묻는다. \"너희 아버지가 탕 밑에 뭘 묻었는지, 아직 모르지?\"\n\n물이 빠지는 하룻밤 동안 한 동네의 비밀이 차례로 드러나는 이야기.",
    note: { title: "작가의 말", text: "동네 목욕탕이 문을 닫을 때 맨 마지막에 하는 일은 탕의 물을 빼는 것이라고 한다.\n몸을 담그던 물이 천천히 낮아지는 모습을 상상하다가 이 이야기를 시작했다. 그곳에 있던 사람들이 수위와 함께 조금씩 드러나는 소설을 쓰고 싶었다.\n다 읽고 나면 뜨거운 물에 오래 앉아 있고 싶어지면 좋겠다." },
    outline: ["마지막 화요일", "수위", "보일러실의 장부", "남탕과 여탕 사이", "1994년의 배관", "서로의 등", "물 빼는 날"],
    chapters: [
      { title: "마지막 화요일", text: `대성탕의 보일러는 새벽 네 시 십 분에 돈다. 아버지가 맞춰둔 시간이었다. 아버지가 죽고 육 년이 지나는 동안 윤해수는 그 시간을 한 번도 바꾸지 않았고, 오늘도 네 시 십 분이 되자 건물 밑바닥에서 낮게 떨리는 소리가 올라왔다.
해수는 카운터 뒤 쪽방에서 눈을 떴다. 천장에 번진 얼룩이 어제와 같은 자리에 있었다. 오늘로 끝이라는 생각은 들지 않았다. 대신 수건을 몇 장이나 삶아야 하는지 생각했다. 어차피 내일이면 쓸 일이 없는 수건이었다. 그래도 삶았다.
여섯 시에 셔터를 올리자 유리문에 붙여둔 종이가 먼저 눈에 들어왔다. 손으로 쓴 글씨였다.
그동안 고마웠습니다. 11월 3일 저녁 8시까지만 영업합니다.
누군가 그 아래에 볼펜으로 '언니 어디로 가' 하고 적어놓았다. 어제는 없던 글씨였다. 해수는 볼펜 자국을 엄지로 한번 문질러보고 안으로 들어갔다.
* * *
첫 손님은 늘 그렇듯 철물점 박 씨였다. 박 씨는 오천 원짜리를 내려놓으며 말했다.
"오늘은 돈 안 받는다고 안 하네."
"왜 안 받아요. 마지막 날인데 더 받아야지."
"독하다, 독해."
박 씨는 웃지도 않고 남탕으로 들어갔다. 삼십 년을 한 동네에 산 사람들의 인사는 대개 그런 식이었다. 일곱 시를 넘기자 손님이 평소보다 빠르게 늘었다. 사거리 약국 내외, 세탁소 아들, 몇 년 전 분당으로 이사 갔다던 정희 엄마까지 보였다. 정희 엄마는 카운터 앞에 서서 해수의 손을 한참 쥐고 있다가, 때수건 한 장을 사 갔다. 집에 많을 물건이었다.
사람들은 탕에 들어가기 전에 벽을 만졌다. 해수는 탈의실 거울로 그 모습을 몇 번이나 보았다. 다들 무슨 약속이라도 한 듯, 타일 한 장에 손바닥을 댔다가 떼었다. 누구도 그것에 대해 말하지 않았다.
점심때쯤 재개발 조합에서 나왔다는 남자가 들렀다. 남자는 내일 오전에 철거 업체가 현장을 보러 올 거라며, 그 전까지 탕의 물을 전부 빼놓으라고 했다.
"물은 왜요?"
"안전 문제도 있고, 배관도 확인해야 해서요."
"서른 해를 안 뺀 탕이에요. 그게 하룻밤에 빠질 것 같아요?"
남자는 웃으며 서류에 뭔가를 적었다. 그 물을 안 뺐다는 말을 농담으로 들은 모양이었다. 물론 정기적으로 갈았다. 그러나 맨 아래 온탕만은 달랐다. 아버지는 그 탕의 배수 밸브를 해수가 손대지 못하게 했고, 물이 탁해지면 위에서 새 물을 넘치게 받아 흘려보냈다. 왜 그러느냐고 물으면 밸브가 낡아서 그렇다고 했다. 해수는 그 말을 스무 해 넘게 믿었다. 믿었다기보다, 더 물어볼 이유가 없었다.
* * *
화요일 오후 세 시면 그 노인이 왔다.
이름은 몰랐다. 장부에는 '화요일 할머니'라고 적혀 있었고, 아버지가 살아 있을 때도 그렇게 불렀다. 노인은 언제나 정확히 삼천 원을 동전으로 냈다. 요금이 오천 원, 칠천 원으로 올라도 그랬고, 해수는 그 차액을 따로 받지 않았다. 아버지가 그렇게 하라고 했다.
오늘도 세 시에 문이 열렸다. 노인은 동전을 하나씩 카운터에 올려놓았다. 손등의 핏줄이 푸른 끈처럼 불거져 있었다.
"오늘까지예요, 할머니. 아시죠?"
노인은 대답 대신 해수의 얼굴을 올려다보았다. 그렇게 오래 눈을 맞춘 적이 없었기 때문에, 해수는 자기도 모르게 턱을 조금 당겼다.
그러고 노인은 여탕으로 들어갔다. 다른 날과 다르지 않았다. 그래서 해수는 곧 그 일을 잊었다. 네 시에는 손님이 탈의실 바닥에 다 앉지 못할 만큼 몰렸고, 여섯 시에는 수건이 떨어져 집에서 쓰던 것까지 꺼내 왔다. 일곱 시 사십 분이 되자 사람들이 하나둘 머리를 말리고 나갔다. 나가는 사람마다 카운터에 뭔가를 두고 갔다. 귤, 박카스, 흰 봉투 하나. 봉투는 돌려주려고 뛰어나갔다가 그냥 들고 돌아왔다.
여덟 시에 해수는 간판 불을 껐다. 남탕을 돌며 수도꼭지를 잠그고, 사우나실 문을 열어두고, 바가지를 포개어 엎어놓았다. 여탕 문을 열었을 때 김이 뺨에 먼저 닿았다.
"할머니."
맨 아래 온탕에 노인이 앉아 있었다. 물이 턱 밑까지 차 있었고, 흰머리가 젖어 두피가 비쳤다. 다섯 시간이었다. 사람이 뜨거운 물에 그렇게 오래 있을 수는 없었다. 해수는 슬리퍼를 신은 채로 뛰어 내려갔다.
"할머니, 괜찮으세요? 나오셔야 해요. 일어나 보세요."
노인이 눈을 떴다. 어지러운 기색 없이 맑은 눈이었다.
"해수야."
서른 해 만에 처음 듣는 소리였다. 해수는 그 노인이 자기 이름을 안다는 것을 그제야 알았다.
"밸브 열어라."
"네?"
"물 빼라고 그러지? 내일 사람들 오기 전에." 노인은 물속에서 손을 들어, 탕 바닥 쪽을 가리켰다. 손끝에서 물이 떨어졌다. "내가 볼 테니까. 네 아버지가 그 밑에 뭘 묻었는지, 너도 이제는 봐야지."` },
      { title: "수위", text: `밸브는 보일러실 안쪽, 벽과 물탱크 사이에 있었다. 어른 한 사람이 옆으로 서야 겨우 들어가는 틈이었다. 해수는 손전등을 입에 물고 그 틈으로 몸을 밀어 넣었다.
붉은 칠이 벗겨진 손잡이에 철사가 감겨 있었다. 아버지의 솜씨였다. 무엇이든 철사로 세 번 감고 끝을 안으로 말아 넣는 사람이었다. 해수는 펜치로 철사를 끊었다. 끊어진 철사가 바닥에 떨어지는 소리가 생각보다 컸다.
손잡이는 움직이지 않았다.
윤활제를 뿌리고, 파이프 렌치를 걸고, 온몸으로 매달렸다. 세 번째에 쇠가 비명 같은 소리를 내며 사분의 일쯤 돌아갔다. 그 순간 발밑의 배관 어딘가에서 물이 움직이기 시작했다. 들리는 것보다 먼저 몸으로 알 수 있었다. 아주 오래 참았던 숨을 내쉬는 것처럼, 건물 전체가 낮게 울렸다.
여탕으로 돌아갔을 때 노인은 아까 그 자리에 앉아 있었다. 턱 밑에 있던 수면이 쇄골까지 내려와 있었다.
"나오세요, 이제."
"다 빠지면 나가지."
"왜 그러시는 건데요. 할머니가 우리 아버지를 어떻게 아세요?"
노인은 대답하지 않고, 탕 벽의 타일을 가리켰다. 수면이 내려간 자리에 물때가 층층이 띠를 이루고 있었다. 나무의 나이테처럼 진하고 옅은 줄이 겹쳐 있었다.
"저 맨 위 줄이 올해야." 노인이 말했다. "내려갈수록 옛날이고. 천천히 보자. 아직 시간 많다."
해수는 탕 가장자리에 걸터앉았다. 젖은 바지가 허벅지에 달라붙었다. 밖에서는 누군가 셔터를 두드리다가 그만두었고, 물은 아주 느리게, 타일 한 장에 십 분쯤 걸리는 속도로 내려가고 있었다.` },
    ],
  },
  essay: {
    genre: "essay", name: "윤해수", keywords: "폐업하는 동네 목욕탕, 마지막 손님",
    title: "젖은 수건의 시간", subtitle: "동네 목욕탕 카운터에서 쓴 스무 해", palette: "paper", motif: "rings",
    tagline: "사람은 옷을 벗으면\n조금 더 쉽게 안부를 묻는다.",
    blurb: "아버지의 목욕탕을 물려받은 윤해수가 카운터에 앉아 지켜본 사람들에 대해 쓴 산문집. 오천 원을 내고 들어와 한 시간 뒤 다른 얼굴로 나가는 이웃들, 하루 사백 장의 수건, 그리고 마지막 영업일에 대한 기록이다. 사라지는 장소보다 그곳에서 사람들이 서로를 대하던 방식에 오래 머무는 글들을 담았다.",
    note: { title: "들어가며", text: "목욕탕을 닫기로 하고 나서 제일 먼저 한 일은 수건을 세는 것이었다. 천이백 장이 조금 넘었다.\n이 책은 그 수건들을 개면서 떠오른 이야기를 적은 것이다. 대단한 일은 나오지 않는다. 대부분 뜨거운 물과 안부에 관한 이야기다." },
    outline: ["네 시 십 분", "오천 원의 표정", "등을 내어주는 사이", "수건 사백 장", "마지막 손님", "물이 빠진 뒤"],
    chapters: [
      { title: "네 시 십 분", text: `우리 집 보일러는 새벽 네 시 십 분에 돈다. 아버지가 맞춰둔 시간이다. 왜 네 시도 네 시 반도 아니고 십 분인지 끝내 물어보지 못했다. 아버지가 돌아가신 뒤 설비 기사에게 슬쩍 물었더니, 그 시간에 틀어야 여섯 시에 물이 딱 맞는다고 했다. 싱거운 답이었다. 그날 이후로 나는 네 시 십 분을 조금 더 좋아하게 되었다.
목욕탕을 물려받겠다고 했을 때 친구들은 내가 대단한 결심을 한 줄 알았다. 사실은 그만둘 결심을 못 한 것에 가까웠다. 다니던 회사를 잠깐 쉬면서 아버지를 돕기 시작했고, 수건을 개다 보니 한 계절이 갔고, 그러다 스무 해가 지났다.
카운터에 오래 앉아 있으면 사람들의 들어올 때 얼굴과 나갈 때 얼굴이 다르다는 걸 알게 된다. 들어올 때는 다들 자기 나이보다 조금 늙어 있다. 어깨가 앞으로 말려 있고, 지갑을 찾는 손이 무겁다. 한 시간쯤 뒤에 나올 때는 볼이 붉고 걸음이 느슨하다. 나는 그 변화를 오천 원에 파는 사람이었다. 세상에 그만한 장사가 드물다고 지금도 생각한다.
손님들은 내게 많은 걸 말해주었다. 며느리 흉, 아들 취직 소식, 병원에서 들은 말. 옷을 다 입고 나와서도 머리카락이 젖어 있는 동안은 다들 조금 솔직했다. 신기하게도 머리가 다 마르면 그 이야기를 멈추고 "그럼 수고해" 하고 나갔다.
그래서 나는 드라이기 바람을 약하게 틀어두었다. 이건 아직 아무에게도 말한 적 없는 비밀이다.
폐업 공고를 붙이던 날, 단골인 철물점 아저씨가 종이를 한참 들여다보더니 이렇게 물었다.
"그럼 나는 이제 어디 가서 씻냐."
집에도 욕실이 있으시잖아요, 하고 대답하려다 말았다. 아저씨가 물은 게 씻는 곳이 아니라는 건 나도 알고 있었다.
어떤 공간은 쓸모가 사라져서 없어지는 게 아니다. 그곳이 하던 일을 아무도 이름 붙여주지 않아서 없어진다. 우리 탕이 하던 일이 무엇이었는지 나도 아직 정확한 말을 찾지 못했다. 이 책을 쓰는 이유의 절반은 그 말을 찾기 위해서다.` },
      { title: "오천 원의 표정", text: `요금을 올린 날이면 나는 카운터에서 고개를 잘 들지 못했다. 사천 원에서 오천 원으로 올리던 해에는 일주일 전부터 종이에 쓴 안내문을 붙여두었는데도, 손님들은 꼭 천 원짜리 네 장을 내밀고 나서야 아, 하고 말했다.
그 '아' 하는 소리에 여러 가지가 들어 있었다. 그럴 수 있지, 하는 소리이기도 했고 너도 별수 없구나, 하는 소리이기도 했다. 나는 그때마다 죄송하다고 말했다. 가스비가 얼마나 올랐는지는 한 번도 설명하지 않았다.
한 달쯤 지나자 아무도 그 일을 입에 올리지 않았다.` },
    ],
  },
};

SAMPLES.novel.author = "Claude";
SAMPLES.essay.author = "Claude";

/* ---------- 동화책·그림책 예시 그림: 판형과 구도를 보여주려고 코드로 그린 시안 ---------- */
const INK = "#3a2c28";
const person = (x, y, s, o = {}) => {
  const skin = o.skin || "#f3c9a5", hair = o.hair || "#3a2c28", top = o.top || "#e4604e";
  let g = `<g transform="translate(${x} ${y}) scale(${s})">`;
  if (!o.bath) g += `<rect x="-24" y="34" width="48" height="66" rx="20" fill="${top}"/><rect x="-18" y="92" width="13" height="34" rx="6" fill="${INK}"/><rect x="5" y="92" width="13" height="34" rx="6" fill="${INK}"/>`;
  else g += `<rect x="-30" y="34" width="60" height="50" rx="24" fill="${skin}"/>`;
  g += `<circle r="36" fill="${skin}"/><path d="M-37 -2a37 37 0 0 1 74 0c-16-14-54-14-74 0z" fill="${hair}"/>`;
  if (o.bun) g += `<circle cy="-40" r="14" fill="${hair}"/>`;
  g += `<circle cx="-12" cy="6" r="3.5" fill="${INK}"/><circle cx="12" cy="6" r="3.5" fill="${INK}"/><path d="M-9 17q9 8 18 0" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/></g>`;
  return g;
};
const steam = (x, y, s, c = "#fff") => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 0c-22-22 22-38 0-60s22-38 0-60" fill="none" stroke="${c}" stroke-width="14" stroke-linecap="round" opacity=".8"/>`;
const tiles = (x, y, w, h, c, line) => {
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
  for (let i = x; i <= x + w; i += 64) s += `<path d="M${i} ${y}V${y + h}" stroke="${line}" stroke-width="3"/>`;
  for (let j = y; j <= y + h; j += 64) s += `<path d="M${x} ${j}H${x + w}" stroke="${line}" stroke-width="3"/>`;
  return s;
};
const house = (x, w, h, c) => `<rect x="${x}" y="${500 - h}" width="${w}" height="${h}" fill="${c}"/><path d="M${x - 12} ${500 - h}L${x + w / 2} ${450 - h}L${x + w + 12} ${500 - h}z" fill="${INK}" opacity=".75"/><rect x="${x + w * .3}" y="${530 - h}" width="${w * .4}" height="44" fill="#ffe9a8"/>`;
const SCENES = {
  town: () => `<rect width="1280" height="640" fill="#bfe3e0"/><circle cx="1090" cy="120" r="66" fill="#ffe08a"/>${steam(350, 150, 1.05)}${steam(405, 130, .8)}<rect x="330" y="150" width="88" height="310" fill="#c8513f"/><rect x="330" y="150" width="88" height="24" fill="${INK}"/><rect x="190" y="310" width="370" height="190" fill="#f6d9b0"/><rect x="170" y="290" width="410" height="30" fill="#c8513f"/><rect x="330" y="390" width="90" height="110" fill="#1d6a68"/><circle cx="240" cy="372" r="30" fill="#1d6a68"/><circle cx="510" cy="372" r="30" fill="#1d6a68"/>${house(650, 150, 170, "#f2b880")}${house(830, 130, 120, "#9fc9a8")}${house(985, 170, 200, "#e89f93")}${house(30, 110, 130, "#9fc9a8")}<rect y="500" width="1280" height="140" fill="#78a886"/>${person(610, 462, .8, { top: "#ffcd4f" })}`,
  door: () => `${tiles(0, 0, 1280, 640, "#f7efe0", "#e3d7c2")}<rect y="540" width="1280" height="100" fill="#8a6f60"/><rect x="170" y="130" width="400" height="410" fill="#1d6a68"/><rect x="195" y="155" width="350" height="215" fill="#bfe3e0"/><rect x="480" y="395" width="32" height="70" rx="14" fill="#ffcd4f"/><rect x="260" y="205" width="220" height="118" fill="#fffdf6" transform="rotate(-2 370 260)"/><path d="M285 235H455M285 262H455M285 289H400" stroke="${INK}" stroke-width="5"/>${person(760, 382, 1.25, { top: "#ffcd4f" })}`,
  crowd: () => `${tiles(0, 0, 1280, 390, "#bfe3e0", "#9ccdc8")}<rect y="390" width="1280" height="250" fill="#2a8481"/><path d="M0 390q80-22 160 0t160 0 160 0 160 0 160 0 160 0 160 0 160 0" fill="#2a8481"/>${person(180, 322, 1.05, { bath: 1, hair: "#ccc", skin: "#f3c9a5" })}${person(370, 340, .85, { bath: 1, skin: "#d9a57e" })}${person(555, 318, 1.1, { bath: 1, bun: 1, hair: "#99a" })}${person(780, 345, .75, { bath: 1 })}${person(945, 322, 1, { bath: 1, skin: "#d9a57e", hair: "#7a4b35" })}${person(1120, 345, .8, { bath: 1, bun: 1 })}${steam(280, 200, .7)}${steam(680, 180, .8)}${steam(1040, 190, .7)}`,
  back: () => `${tiles(0, 0, 1280, 640, "#ffe7ba", "#f2d398")}<rect x="-40" y="440" width="1360" height="240" rx="50" fill="#2a8481"/>${person(320, 300, 1.8, { bath: 1, hair: "#ccc", skin: "#f3c9a5" })}${person(610, 360, 1.2, { bath: 1, bun: 1 })}<rect x="480" y="370" width="90" height="26" rx="13" fill="#e4604e" transform="rotate(-16 520 380)"/><g fill="${INK}"><circle cx="880" cy="170" r="13"/><rect x="890" y="85" width="6" height="85"/><circle cx="1010" cy="205" r="13"/><rect x="1020" y="120" width="6" height="85"/><rect x="890" y="85" width="136" height="9" transform="rotate(14 890 85)"/></g>`,
  alone: () => `<rect width="1280" height="640" fill="#21305c"/>${tiles(0, 0, 1280, 450, "#2c3d70", "#3a4c85")}<rect x="110" y="420" width="1060" height="220" rx="24" fill="#3aa6a2"/><circle cx="1085" cy="90" r="42" fill="#ffe08a"/>${person(820, 370, 1, { bath: 1, bun: 1, hair: "#ddd" })}${steam(820, 280, .6)}`,
  drain: () => `${tiles(0, 0, 1280, 640, "#d7ecea", "#b5d9d5")}<ellipse cx="640" cy="420" rx="520" ry="190" fill="#2a8481"/><ellipse cx="640" cy="420" rx="370" ry="130" fill="none" stroke="#7bcfc9" stroke-width="16"/><ellipse cx="640" cy="420" rx="240" ry="84" fill="none" stroke="#7bcfc9" stroke-width="14"/><ellipse cx="640" cy="420" rx="120" ry="40" fill="none" stroke="#bfe9e5" stroke-width="12"/><ellipse cx="640" cy="420" rx="36" ry="14" fill="${INK}"/>${person(120, 150, .95, { top: "#ffcd4f" })}`,
  found: () => `${tiles(0, 0, 1280, 640, "#f9f3e6", "#e3d7c2")}<g stroke-linecap="round" fill="none" stroke-width="7"><circle cx="175" cy="150" r="24" stroke="#e4604e"/><path d="M175 110v-20M215 150h20M135 150h-20" stroke="#e4604e"/><path d="M340 190l40-70 40 70z" stroke="#1d6a68"/><path d="M930 130q30-44 60 0t60 0" stroke="#2a68c4"/><circle cx="1110" cy="330" r="28" stroke="#e7a51c"/><path d="M90 420q30-40 60 0" stroke="#7a4bb5"/><path d="M1030 470l26 44 26-44z" stroke="#e4604e"/></g>${person(330, 380, 1.15, { top: "#ffcd4f" })}${person(510, 390, 1.05, { bun: 1, hair: "#ddd", top: "#8fb7a0" })}`,
  night: () => `<rect width="1280" height="640" fill="#172449"/><circle cx="1000" cy="140" r="70" fill="#ffe08a"/><g fill="#fff"><circle cx="200" cy="80" r="4"/><circle cx="620" cy="60" r="5"/><circle cx="830" cy="210" r="3"/><circle cx="1180" cy="310" r="4"/><circle cx="90" cy="220" r="3"/></g>${steam(392, 200, 1.1)}<path d="M340 90c-22-30 52-40 52 0 0-40 74-30 52 0-14 22-52 46-52 46s-38-24-52-46z" fill="#ff9b8a"/><rect x="350" y="200" width="84" height="290" fill="#6d3a3e"/><rect x="200" y="350" width="390" height="150" fill="#3b4b7a"/>${house(660, 150, 150, "#334270")}${house(860, 130, 110, "#2c3a66")}${house(1020, 170, 180, "#3b4b7a")}<rect y="500" width="1280" height="140" fill="#1e3a42"/>${person(600, 462, .8, { top: "#ffcd4f" })}`,
};
const COVER_ART = { town: { box: "120 -170 560 790", sky: "#bfe3e0" }, night: { box: "130 -120 760 760", sky: "#172449" } };
const sceneSvg = (name, cls = "", box = "0 0 1280 640") => `<svg class="${cls}" viewBox="${box}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${(SCENES[name] || SCENES.town)()}</svg>`;

// 동화책 본문 삽화. 여기 없는 이름은 코드로 그린 시안 그림을 쓴다.
const ILL_IMAGES = {
  town: { src: "images/kids-town.jpg", alt: "빨간 굴뚝이 있는 대성탕 앞 골목에 노란 후드를 입은 아이가 서 있는 그림" },
  door: { src: "images/kids-door.jpg", alt: "안내문이 붙은 대성탕 문 옆 계단에 아이가 앉아 있는 그림" },
  alone: { src: "images/kids-alone.jpg", alt: "달이 뜬 밤, 김이 오르는 온탕에 할머니가 혼자 앉아 웃고 있는 그림" },
};

SAMPLES.kids = {
  genre: "kids", author: "Claude", name: "윤해수", keywords: "폐업하는 동네 목욕탕, 마지막 손님",
  title: "대성탕의 비밀 타일", subtitle: "초등 저학년 창작 동화", palette: "bathhouse", art: "town", coverImage: "images/kids-cover.jpg",
  tagline: "물이 빠진 탕 바닥에\n누가 그림을 그려 놓았을까요?",
  blurb: "아빠의 목욕탕이 문을 닫는 날, 열 살 해수는 맨 아래 온탕의 물이 빠지는 걸 처음 구경하게 돼요. 그런데 물이 빠진 바닥의 타일마다 삐뚤빼뚤한 그림이 그려져 있어요. 그림을 그린 사람은 누구일까요? 해수는 매주 화요일에 오는 할머니와 함께 동네를 돌며 비밀을 찾아 나섭니다.",
  note: { title: "작가의 말", text: "여러분 동네에는 오래된 가게가 있나요?\n없어질까 봐 아쉬운 곳이 있다면, 이 책을 읽고 한번 들러 보세요." },
  outline: ["굴뚝이 쉬는 날", "화요일 할머니", "바닥의 그림", "동네 탐정단", "물감을 묻힌 손", "다시 만난 친구들"],
  chapters: [
    { title: "굴뚝이 쉬는 날", text: `[그림:town]
해수네 집은 목욕탕이에요. 동네에서 제일 높은 빨간 굴뚝이 바로 해수네 굴뚝이지요.
아침마다 굴뚝에서는 하얀 김이 올라왔어요. 친구들은 그 김을 보고 "해수네 굴뚝이 숨 쉰다!" 하고 놀렸어요. 해수는 그 말이 싫지 않았어요.
그런데 오늘은 문 앞에 종이 한 장이 붙었어요.
"아빠, 진짜로 문 닫아?"
아빠는 수건을 개다 말고 고개를 끄덕였어요.
"오늘이 마지막이야. 저녁에는 탕 물도 다 뺄 거고."
해수는 눈이 동그래졌어요.
"맨 아래 온탕도? 거기는 한 번도 안 뺐잖아."
아빠는 대답 대신 수건 한 장을 해수 머리에 툭 얹었어요.
"궁금하면 저녁까지 기다려 봐."
[그림:door]
해수는 문 앞에 앉아 손님들을 세기 시작했어요. 하나, 둘, 셋. 스물까지 세었을 때 낯익은 지팡이 소리가 들렸어요.
톡, 톡, 톡.
오늘은 화요일이었어요.` },
    { title: "화요일 할머니", text: `[그림:alone]
화요일 할머니는 언제나 동전을 하나씩 세어서 냈어요. 해수는 할머니 이름을 몰랐어요. 아빠도 그냥 화요일 할머니라고 불렀어요.
저녁이 되자 손님들이 모두 돌아갔어요. 그런데 맨 아래 온탕에 할머니가 혼자 앉아 있었어요.
"할머니, 이제 문 닫아요."
할머니는 해수를 보고 싱긋 웃었어요.
"알아. 나는 저 물이 빠지는 걸 보러 왔단다."
"왜요?"
"네 아빠가 어렸을 때, 나랑 약속한 게 있거든."` },
  ],
};
SAMPLES.pic = {
  genre: "pic", author: "Claude", name: "윤해수", keywords: "폐업하는 동네 목욕탕, 마지막 손님",
  title: "안녕, 굴뚝아", subtitle: "그림책", palette: "brick", art: "night",
  tagline: "우리 동네 제일 따뜻한 곳에게\n잘 가라고 말하는 날",
  blurb: "해수네 목욕탕이 문을 닫는 날, 온 동네 사람들이 마지막으로 뜨거운 물에 몸을 담그러 옵니다. 사람들이 모두 돌아간 뒤 물이 빠지자 탕 바닥에서 뜻밖의 것이 나타납니다. 사라지는 장소와 인사하는 법을 담은 그림책입니다.",
  note: { title: "", text: "" }, outline: [], chapters: [],
  spreads: [
    { scene: "town", text: "해수네 목욕탕에는\n동네에서 제일 높은 굴뚝이 있어요.", side: 1, pos: "bottom", dark: 1 },
    { scene: "door", text: "오늘은 목욕탕이\n문을 닫는 날이에요.", side: 1, pos: "top" },
    { scene: "crowd", text: "동네 사람들이 다 모였어요.", side: 0, pos: "bottom", dark: 1 },
    { scene: "back", text: "등을 밀어 주고, 노래도 불렀어요.\n“시원하다!”", side: 1, pos: "bottom", dark: 1 },
    { scene: "alone", text: "저녁이 되자 아무도 없어요.\n딱 한 사람만 빼고요.", side: 0, pos: "top", dark: 1 },
    { scene: "drain", text: "마개를 뽑았어요.\n꼬르륵, 꼬르르륵.", side: 1, pos: "top" },
    { scene: "found", text: "어, 이게 뭐지?\n“네 아빠가 어렸을 때 그린 거란다.”", side: 1, pos: "bottom", },
    { scene: "night", text: "마지막 김이 하늘로 올라가요.\n안녕, 굴뚝아.", side: 1, pos: "bottom", dark: 1 },
  ],
};

const $ = (id) => document.getElementById(id);
const el = (tag, cls, text) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
};
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

let current = null, pages = [], idx = 0, mine = null, ctl = null, busy = false, flipping = false, progress = null;

/* ---------- 쪽 나누기: 원고를 실제 판면 크기에 흘려 넣는다 ---------- */
function pageShell(genre, side, extra) {
  return el("div", `pg ${genre} ${side}${extra ? " " + extra : ""}`);
}

function blocksFrom(text) {
  const out = [];
  let first = true;
  for (const raw of text.split(/\n+/)) {
    const t = raw.trim();
    if (!t) continue;
    const ill = t.match(/^\[그림:(\w+)\]$/);
    if (ill) { out.push({ ill: ill[1] }); first = true; continue; }
    if (/^(\*\s*){1,3}$|^[＊*·]{1,3}$/.test(t)) { out.push({ scene: true, text: "＊" }); first = true; continue; }
    out.push({ text: t, noind: first });
    first = false;
  }
  return out;
}

function makeP(b) {
  if (b.ill) {
    const d = el("div", "ill"), photo = ILL_IMAGES[b.ill];
    if (photo) {
      const img = el("img");
      img.src = photo.src;
      img.alt = photo.alt;
      d.append(img);
    } else d.innerHTML = sceneSvg(b.ill);
    return d;
  }
  const p = el("p", "", b.text);
  if (b.scene) p.className = "scene";
  else {
    if (b.noind) p.classList.add("noind");
    if (b.cont) p.classList.add("cont");
    if (b.split) p.classList.add("split");
  }
  return p;
}

function chapHead(c) {
  const h = el("div", "chap");
  if (c.num) h.append(el("b", "", c.num));
  h.append(el("strong", "", c.title));
  return h;
}

function flow(genre, blocks, chapter) {
  const m = $("measure");
  m.innerHTML = "";
  const shell = pageShell(genre, "recto"), body = el("div", "body");
  shell.append(body);
  m.append(shell);
  const fits = () => body.scrollHeight <= body.clientHeight + 1;
  const out = [];
  let cur = { items: [], chapter, opener: true };
  const reset = () => { body.innerHTML = ""; if (cur.opener) body.append(chapHead(chapter)); };
  reset();
  const queue = blocks.map((b) => ({ ...b }));
  while (queue.length) {
    const b = queue.shift();
    const p = makeP(b);
    body.append(p);
    if (fits()) { cur.items.push(b); continue; }
    p.remove();
    let placed = false;
    if (!b.scene && !b.ill) {
      const probe = makeP({ ...b, split: true });
      body.append(probe);
      let lo = 0, hi = b.text.length - 1;
      while (lo < hi) {
        const mid = Math.ceil((lo + hi) / 2);
        probe.textContent = b.text.slice(0, mid);
        if (fits()) lo = mid; else hi = mid - 1;
      }
      // 다음 쪽에 아주 짧은 글만 남지 않게 조금 더 넘긴다
      let n = lo;
      const remain = b.text.length - n;
      if (remain > 0 && remain < 14) n = Math.max(0, n - (14 - remain));
      probe.textContent = b.text.slice(0, n);
      const lh = parseFloat(getComputedStyle(probe).lineHeight) || 26;
      if (n > 0 && probe.getBoundingClientRect().height >= lh * 1.9) {
        cur.items.push({ ...b, text: b.text.slice(0, n), split: true });
        queue.unshift({ ...b, text: b.text.slice(n).replace(/^\s+/, ""), cont: true, noind: false });
        placed = true;
      }
      probe.remove();
    }
    if (!placed) queue.unshift(b);
    if (!cur.items.length && !placed && !cur.opener) { cur.items.push(queue.shift()); }
    out.push(cur);
    cur = { items: [], chapter, opener: false };
    reset();
  }
  if (cur.items.length || cur.opener) out.push(cur);
  m.innerHTML = "";
  return out;
}

async function loadFonts(book) {
  const txt = [book.title, book.subtitle, book.tagline, book.note.text, ...(book.spreads || []).map((s) => s.text), ...book.chapters.map((c) => c.title + c.text), ...(book.outline || [])].join("").slice(0, 12000);
  const fam = { novel: '15.5px "Noto Serif KR"', essay: '15px "Gowun Batang"', kids: '19px "Gowun Dodum"', pic: '30px "Gowun Dodum"' }[book.genre];
  try {
    await Promise.all([document.fonts.load(fam, txt), document.fonts.load('38px "Song Myung"', book.title + (book.outline || []).join("") + "차례작가의말"), document.fonts.load('40px "Jua"', book.title + (book.outline || []).join("") + "0123456789"), document.fonts.load('15px "Gowun Dodum"', book.tagline + book.blurb)]);
    await document.fonts.ready;
  } catch (e) { /* 글꼴을 못 받아도 대체 글꼴로 계속한다 */ }
}

function buildPages(book) {
  const g = book.genre, ps = [];
  ps.push({ t: "cover" }, { t: "blank" }, { t: "title" }, { t: "colophon" }, { t: "epi" });
  const recto = () => { if (ps.length % 2 === 1) ps.push({ t: "blank" }); };
  if (book.spreads) {
    // 그림책: 왼쪽·오른쪽 면이 그림 한 장을 나눠 갖는다
    if (ps.length % 2 === 0) ps.push({ t: "blank" });
    book.spreads.forEach((s) => ps.push({ t: "pic", s, part: 0 }, { t: "pic", s, part: 1 }));
    ps.push({ t: "end" });
    return ps;
  }
  recto();
  const tocAt = ps.length;
  ps.push({ t: "toc" });
  recto();
  for (const pg of flow(g, blocksFrom(book.note.text), { title: book.note.title, num: "" })) ps.push({ t: "text", pg });
  const starts = [];
  book.chapters.forEach((c, i) => {
    recto();
    starts.push(ps.length);
    for (const pg of flow(g, blocksFrom(c.text), { title: c.title, num: String(i + 1) })) ps.push({ t: "text", pg });
  });
  ps.push({ t: "end" });
  // 아직 쓰지 않은 장의 차례 쪽수는 앞 장 분량으로 어림한 값이다
  const per = Math.max(12, Math.round((ps.length - starts[0]) / Math.max(1, book.chapters.length)) + 12);
  ps[tocAt].list = (book.outline || book.chapters.map((c) => c.title)).map((title, i) => ({
    title,
    folio: (starts[i] != null ? starts[i] : starts[starts.length - 1] + (i - starts.length + 1) * per) - 1,
  }));
  return ps;
}

/* ---------- 표지 ---------- */
function motifSvg(m, p, w, h) {
  let s = "";
  if (m === "tiles") {
    const c = Math.round(w / 8);
    let n = 0;
    s += `<rect y="${h * .58}" width="${w}" height="${h * .42}" fill="${p.d}"/>`;
    for (let y = h * .2; y < h; y += c) for (let x = 0; x < w; x += c) {
      n++;
      s += `<rect x="${x}" y="${y}" width="${c}" height="${c}" fill="${n === 20 ? p.a : "none"}" stroke="${p.l}" stroke-width="2"/>`;
    }
  } else if (m === "sun") {
    s += `<circle cx="${w * .36}" cy="${h * .5}" r="${w * .27}" fill="${p.a}"/>`;
    s += `<rect y="${h * .58}" width="${w}" height="${h * .42}" fill="${p.d}"/>`;
    for (let i = 0; i < 7; i++) s += `<rect y="${h * .6 + i * 22}" width="${w}" height="${2 + i}" fill="${p.l}"/>`;
  } else if (m === "rings") {
    for (let i = 11; i > 0; i--) s += `<circle cx="${w * .38}" cy="${h * .55}" r="${i * w * .058}" fill="${i === 3 ? p.a : "none"}" stroke="${p.l}" stroke-width="2"/>`;
  } else if (m === "rain") {
    for (let i = 0; i < 60; i++) {
      const x = (i * 37) % w, y = h * .16 + ((i * 89) % (h * .7));
      s += `<line x1="${x}" y1="${y}" x2="${x - 18}" y2="${y + 58}" stroke="${i % 13 === 0 ? p.a : p.l}" stroke-width="${i % 13 === 0 ? 4 : 2}"/>`;
    }
  } else {
    for (let i = 6; i > 0; i--) {
      const r = i * w * .065, cx = w * .38;
      s += `<path d="M${cx - r} ${h}V${h * .58}a${r} ${r} 0 0 1 ${r * 2} 0V${h}" fill="${i === 1 ? p.a : i % 2 ? p.d : "none"}" stroke="${p.l}" stroke-width="2"/>`;
    }
  }
  return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">${s}</svg>`;
}

const GRAIN = `<svg class="grain" aria-hidden="true"><filter id="gr"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 .55 0"/></filter><rect width="100%" height="100%" filter="url(#gr)"/></svg>`;

const missingCovers = new Set();
function renderCover(book) {
  const pal = PALETTES[book.palette] || PALETTES.ink;
  const g = book.genre, { w, h } = SPEC[g];
  const c = el("div", `cv v-${g}`);
  if (book.coverImage && !missingCovers.has(book.coverImage)) {
    // 제목까지 들어 있는 완성 표지 이미지는 글자를 덧입히지 않고 그대로 쓴다
    const img = el("img", "cover-img");
    img.src = book.coverImage;
    img.alt = `${book.title} 표지`;
    // 파일을 못 찾으면 빈 표지 대신 코드로 그린 표지를 보여주고, 콘솔에 경로를 알려준다
    img.onerror = () => {
      console.error(`표지 이미지를 찾지 못했어요: ${book.coverImage}`);
      missingCovers.add(book.coverImage);
      c.replaceWith(renderCover(book));
    };
    c.append(img);
    return c;
  }
  c.style.setProperty("--cb", pal.b);
  c.style.setProperty("--cf", pal.f);
  c.style.setProperty("--ca", pal.a);
  c.style.setProperty("--cn", pal.n);
  c.insertAdjacentHTML("afterbegin", (book.art ? sceneSvg(book.art, "", COVER_ART[book.art].box) : motifSvg(MOTIFS.includes(book.motif) ? book.motif : "rings", pal, w, h)) + GRAIN);
  if (book.art) c.style.setProperty("--cb", COVER_ART[book.art].sky);
  const len = [...book.title].length;
  const ts = g === "kids" ? 66 : g === "pic" ? 72 : g === "novel" ? Math.min(84, Math.max(46, 570 / Math.max(len, 5))) : Math.min(50, Math.max(34, 420 / Math.max(len, 7)));
  c.style.setProperty("--ts", ts + "px");
  c.style.setProperty("--tb", (Math.ceil(len * ts / 416) * ts * 1.2 + 14) + "px");
  c.append(el("div", "tt", book.title), el("div", "sb", book.subtitle), el("div", "au", `${book.author} 지음`));
  if (book.art) { c.append(el("div", "im", "낱권")); return c; }
  const obi = el("div", "obi");
  obi.append(el("span", "", (book.tagline || "").split("\n")[0]), el("b", "", "낱권"));
  c.append(obi);
  return c;
}

function renderBook3d(book) {
  const box = $("book3d"), { w, h } = SPEC[book.genre];
  const pal = PALETTES[book.palette] || PALETTES.ink;
  const width = Math.min({ novel: 320, essay: 290, kids: 340, pic: 360 }[book.genre], innerWidth - 110);
  const scale = width / w, height = h * scale;
  box.innerHTML = "";
  box.style.width = width + "px";
  box.style.height = height + "px";
  const spine = el("div", "spine"); spine.style.background = pal.b;
  const edge = el("div", "edge");
  const shadow = el("div", "shadow");
  const front = el("div", "front");
  front.style.width = w + "px"; front.style.height = h + "px"; front.style.transform = `scale(${scale})`;
  front.append(renderCover(book));
  box.append(shadow, spine, edge, front);
}

/* ---------- 페이지 그리기 ---------- */
function renderPage(i) {
  const book = current, g = book.genre, d = pages[i];
  const side = i % 2 === 0 ? "recto" : "verso";
  const p = pageShell(g, side, d.t === "cover" ? "cover" : "");
  const folio = i - 1;
  if (d.t === "cover") {
    p.append(renderCover(book));
  } else if (d.t === "title") {
    const w = el("div", "tp title-p");
    w.append(el("h4", "", book.title), el("p", "", book.subtitle), el("p", "", `${book.author} 지음`), el("div", "imp", "낱권"));
    p.append(w);
  } else if (d.t === "colophon") {
    const w = el("div", "tp colophon");
    w.append(el("h4", "", book.title));
    const t = el("table");
    [["지은이", `${book.author} (AI)`], ["주인공", book.name], ["입력", book.keywords], ["판형", SPEC[g].size], ["펴낸곳", "낱권 (가상의 시안 출판사)"]].forEach(([a, b]) => {
      const r = el("tr");
      r.append(el("td", "", a), el("td", "", b));
      t.append(r);
    });
    w.append(t, el("p", "", "이 미리보기는 AI가 만든 창작물이며 실제로 출간된 책이 아닙니다."), el("p", "", "이 책의 내용은 모두 허구입니다. 인물의 이름이 실존 인물과 같더라도 그 인물과 아무 관계가 없습니다."));
    p.append(w);
  } else if (d.t === "epi") {
    const w = el("div", "tp epi");
    (book.tagline || "").split("\n").forEach((l) => w.append(el("div", "", l)));
    p.append(w);
  } else if (d.t === "toc") {
    const w = el("div", "tp toc"), ol = el("ol");
    w.append(el("h4", "", "차례"));
    d.list.forEach((c, n) => {
      const li = el("li");
      li.append(el("small", "", n + 1), el("span", "", c.title), el("i"), el("span", "", c.folio));
      ol.append(li);
    });
    w.append(ol);
    p.append(w);
  } else if (d.t === "text") {
    const body = el("div", "body");
    if (d.pg.opener) body.append(chapHead(d.pg.chapter));
    d.pg.items.forEach((b) => body.append(makeP(b)));
    p.append(body);
    if (!d.pg.opener) p.append(el("div", "head", side === "verso" ? book.title : d.pg.chapter.title));
    p.append(el("div", "foot", folio));
  } else if (d.t === "pic") {
    p.insertAdjacentHTML("afterbegin", sceneSvg(d.s.scene, d.part ? "half right" : "half"));
    if (d.part === d.s.side) {
      const w = el("div", `pictext ${d.s.pos}${d.s.dark ? " light" : ""}`);
      d.s.text.split("\n").forEach((l) => w.append(el("div", "", l)));
      p.append(w);
    }
  } else if (d.t === "end") {
    const w = el("div", "tp end");
    w.append(el("b", "", "미리보기가 여기서 끝나요"), el("div", "", book.spreads ? `「${book.title}」의 펼침면 ${book.spreads.length}개를 담았어요.` : `「${book.title}」의 앞부분 ${book.chapters.length}장을 담았어요.`));
    p.append(w);
  }
  return p;
}
function slot(i) {
  return i < 0 || i >= pages.length ? pageShell(current.genre, "ghost") : renderPage(i);
}

/* ---------- 뷰어 ---------- */
const isNarrow = () => $("stage").clientWidth < 760;
function spreadOf(i) {
  if (i === 0) return [-1, 0];
  const l = i % 2 === 1 ? i : i - 1;
  return [l, l + 1];
}

function layout() {
  const { w, h } = SPEC[current.genre];
  const cols = isNarrow() ? 1 : 2;
  const cs = getComputedStyle($("stage"));
  const avail = $("stage").clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  const scale = Math.min(avail / (w * cols), 1.2);
  const sp = $("spread");
  sp.style.transform = `scale(${scale})`;
  sp.style.width = w * cols + "px";
  sp.style.height = h + "px";
  $("crop").style.width = w * cols * scale + "px";
  $("crop").style.height = h * scale + "px";
}

function status(ids) {
  $("range").max = pages.length - 1;
  $("range").value = idx;
  $("prev").disabled = idx <= 0;
  $("next").disabled = idx >= pages.length - 1;
  $("edge-prev").hidden = $("prev").disabled;
  $("edge-next").hidden = $("next").disabled;
  const shown = ids.filter((i) => i >= 0 && i < pages.length).map((i) => i + 1);
  $("pos").textContent = `${shown.join("–")} / ${pages.length}면`;
}

function draw() {
  if (!current) return;
  const ids = isNarrow() ? [idx] : spreadOf(idx);
  $("spread").replaceChildren(...ids.map(slot));
  layout();
  status(ids);
}

async function flipTo(next) {
  const dir = next > idx ? 1 : -1;
  const from = spreadOf(idx), to = spreadOf(next);
  if (reduced()) { idx = next; draw(); return; }
  flipping = true;
  const { w, h } = SPEC[current.genre];
  const leaf = el("div", "leaf");
  leaf.style.width = w + "px";
  leaf.style.height = h + "px";
  leaf.style.left = (dir > 0 ? w : 0) + "px";
  leaf.style.transformOrigin = dir > 0 ? "left center" : "right center";
  const front = el("div", "face"), back = el("div", "face back");
  front.append(slot(dir > 0 ? from[1] : from[0]));
  back.append(slot(dir > 0 ? to[0] : to[1]));
  leaf.append(front, back);
  const base = dir > 0 ? [from[0], to[1]] : [to[0], from[1]];
  $("spread").replaceChildren(slot(base[0]), slot(base[1]), leaf);
  idx = next;
  status(to);
  const end = dir > 0 ? -180 : 180;
  await leaf.animate(
    [{ transform: "perspective(2600px) rotateY(0deg)" }, { transform: `perspective(2600px) rotateY(${end}deg)` }],
    { duration: 620, easing: "cubic-bezier(.45,.05,.3,1)", fill: "forwards" }
  ).finished.catch(() => {});
  flipping = false;
  draw();
}

function step(dir) {
  if (flipping) return;
  if (isNarrow()) {
    idx = Math.max(0, Math.min(pages.length - 1, idx + dir));
    while (pages[idx] && pages[idx].t === "blank" && idx > 0 && idx < pages.length - 1) idx += dir;
    draw();
    return;
  }
  const [l] = spreadOf(idx);
  const next = dir > 0 ? (idx === 0 ? 1 : l + 2) : (l <= 1 ? 0 : l - 2);
  if (next < 0 || next >= pages.length || next === idx) return;
  flipTo(next);
}

function info(book) {
  const s = SPEC[book.genre];
  const chars = book.spreads ? book.spreads.reduce((n, s) => n + s.text.length, 0) : book.chapters.reduce((n, c) => n + c.text.length, 0);
  $("i-kicker").textContent = `${s.label} · ${s.size}`;
  $("i-title").textContent = book.title;
  $("i-sub").textContent = `${book.subtitle} · ${book.author} 지음`;
  $("i-blurb").textContent = book.blurb;
  const rows = [["주인공", book.name], ["소재", book.keywords], ["본문 조판", s.type], ["미리보기", `${pages.length}면, 본문 ${chars.toLocaleString("ko-KR")}자`]];
  $("i-spec").replaceChildren(...rows.flatMap(([a, b]) => [el("dt", "", a), el("dd", "", b)]));
  renderBook3d(book);
}

/* 곧은따옴표를 책에 쓰는 둥근따옴표로 바꾼다. 앞이 비어 있거나 여는 부호면 여는 따옴표, 아니면 닫는 따옴표. */
function curly(text) {
  const opens = /[\s(\[{<《〈「『“‘—–-]/;
  return String(text == null ? "" : text).replace(/["']/g, (q, i, s) => {
    const open = i === 0 || opens.test(s[i - 1]);
    return q === '"' ? (open ? "“" : "”") : (open ? "‘" : "’");
  });
}
function curlyBook(b) {
  const c = { ...b };
  ["title", "subtitle", "tagline", "blurb", "keywords"].forEach((k) => { c[k] = curly(b[k]); });
  c.note = { title: curly(b.note.title), text: curly(b.note.text) };
  c.outline = (b.outline || []).map(curly);
  c.chapters = b.chapters.map((x) => ({ title: curly(x.title), text: curly(x.text) }));
  if (b.spreads) c.spreads = b.spreads.map((s) => ({ ...s, text: curly(s.text) }));
  return c;
}

let showToken = 0;
async function show(book, tab, startAt) {
  const t = ++showToken;
  book = curlyBook(book);
  current = book;
  idx = startAt || 0;
  await loadFonts(book);
  if (t !== showToken) return;
  pages = buildPages(book);
  idx = Math.min(idx, pages.length - 1);
  draw();
  info(book);
  ["novel", "essay", "kids", "pic", "mine"].forEach((k) => $("t-" + k).setAttribute("aria-pressed", String(k === tab)));
}

/* ---------- 생성: 단계마다 서버(/api/generate)를 따로 호출한다 ---------- */
// 교정 단계까지 돌리려면 true로 바꾼다. 원고를 한 번 더 고치는 만큼 시간이 더 걸린다.
const USE_EDITOR = false;
const LABELS = USE_EDITOR ? ["콘셉트와 목차", "1·2장 집필", "1·2장 교정", "조판"] : ["콘셉트와 목차", "1·2장 집필", "조판"];
function setSteps(now) {
  const ol = $("steps");
  ol.hidden = false;
  ol.replaceChildren(...LABELS.map((s, i) => el("li", i < now ? "done" : i === now ? "now" : "", s)));
}

function clean(t) {
  return t.replace(/^```.*$/gm, "").replace(/^#+\s.*$/gm, "").replace(/\*\*/g, "").trim();
}
function toLastSentence(t) {
  const m = t.match(/^[\s\S]*[.?!…"”]/);
  return m ? m[0] : t;
}

async function callApi(payload, signal) {
  let r;
  try {
    r = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), signal });
  } catch (e) {
    if (e.name === "AbortError") throw { code: "cancelled" };
    throw { code: "network" };
  }
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw { code: data.error || (r.status === 404 ? "no_server" : "upstream") };
  return data;
}

// 실패해도 끝난 단계는 progress에 남아 있어서, 다시 누르면 실패한 단계부터 이어진다
async function generate(name, genre, keywords) {
  ctl = new AbortController();
  const signal = ctl.signal, base = { name, genre, keywords };
  const key = JSON.stringify(base);
  if (!progress || progress.key !== key) progress = { key, concept: null, drafts: [], final: [] };
  const P = progress;

  if (!P.concept) {
    setSteps(0);
    const { concept } = await callApi({ ...base, step: "concept" }, signal);
    if (!concept || !concept.title || !Array.isArray(concept.outline) || concept.outline.length < 2) throw { code: "invalid_json" };
    P.concept = concept;
  }
  // 두 장을 동시에 쓴다. 한 장이 실패해도 끝난 장은 남아 있어 다시 쓰지 않는다.
  setSteps(1);
  const results = await Promise.allSettled([0, 1].map(async (i) => {
    if (P.drafts[i]) return;
    const r = await callApi({ ...base, step: "chapter", index: i, concept: P.concept }, signal);
    P.drafts[i] = clean(r.truncated ? toLastSentence(r.text) : r.text);
  }));
  const failed = results.find((r) => r.status === "rejected");
  if (failed) throw failed.reason;

  if (USE_EDITOR) {
    setSteps(2);
    await Promise.all([0, 1].map(async (i) => {
      if (P.final[i]) return;
      try {
        const r = await callApi({ ...base, step: "edit", draft: P.drafts[i] }, signal);
        const t = clean(r.text);
        // 교정본이 잘렸거나 너무 짧아졌으면 초고를 쓴다
        P.final[i] = !r.truncated && t.length > P.drafts[i].length * .75 ? t : P.drafts[i];
      } catch (e) {
        if (e.code === "cancelled") throw e;
        P.final[i] = P.drafts[i];
      }
    }));
  } else {
    P.final = P.drafts.slice();
  }
  setSteps(LABELS.length - 1);
  const c = P.concept;
  return {
    genre, name, keywords, author: "Gemini",
    title: String(c.title), subtitle: String(c.subtitle || SPEC[genre].label),
    tagline: String(c.tagline || ""), blurb: String(c.blurb || ""),
    palette: c.palette, motif: c.motif,
    note: { title: genre === "novel" ? "작가의 말" : "들어가며", text: String(c.note || "이 책은 짧은 입력에서 시작되었다.") },
    outline: c.outline.map(String).slice(0, 10),
    chapters: P.final.map((text, i) => ({ title: String(c.outline[i]), text })),
  };
}

const ERR = {
  rate_limited: "호출 한도에 걸렸어요. 잠시 뒤에 다시 눌러주세요.",
  busy: "지금 Gemini 사용자가 많아요. 잠시 뒤에 다시 누르면 끝난 단계 다음부터 이어져요.",
  refused: "이 입력으로는 원고를 쓰지 못했어요. 소재를 바꿔서 다시 해주세요.",
  invalid_json: "기획안을 제대로 받지 못했어요. 다시 한번 눌러주세요.",
  no_key: "서버에 GEMINI_API_KEY가 설정되지 않았어요.",
  config: "Gemini 설정에 문제가 있어요. API 키와 모델 이름을 확인해주세요.",
  no_server: "서버 기능을 찾지 못했어요. Vercel에 배포한 주소에서 실행해주세요.",
  network: "서버에 연결하지 못했어요. 배포한 주소에서 실행 중인지 확인해주세요.",
};

function setBusy(b) {
  busy = b;
  $("go").disabled = b;
  $("stop").hidden = !b;
  $("go").textContent = b ? "만드는 중" : "책 만들기";
}

$("form").addEventListener("submit", async (ev) => {
  ev.preventDefault();
  if (busy) return;
  const name = $("name").value.trim(), kw = $("kw").value.trim();
  const genre = document.querySelector("input[name=genre]:checked").value;
  if (!name || !kw) return;
  $("err").hidden = true;
  setBusy(true);
  try {
    const book = await generate(name, genre, kw);
    mine = book;
    progress = null;
    try { localStorage.setItem("natgwon-last", JSON.stringify(book)); } catch (e) {}
    $("t-mine").hidden = false;
    await show(book, "mine");
    $("steps").hidden = true;
    document.querySelector(".product").scrollIntoView({ behavior: reduced() ? "auto" : "smooth" });
  } catch (e) {
    if (!e || e.code !== "cancelled") {
      $("err").textContent = ERR[e && e.code] || "생성 중에 연결이 끊겼어요. 다시 누르면 끝난 단계 다음부터 이어져요.";
      $("err").hidden = false;
    }
    $("steps").hidden = true;
  } finally {
    setBusy(false);
  }
});

$("stop").onclick = () => ctl && ctl.abort();
$("t-novel").onclick = () => show(SAMPLES.novel, "novel", 11);
$("t-essay").onclick = () => show(SAMPLES.essay, "essay", 11);
$("t-kids").onclick = () => show(SAMPLES.kids, "kids", 11);
$("t-pic").onclick = () => show(SAMPLES.pic, "pic", 5);
$("t-mine").onclick = () => mine && show(mine, "mine");
$("prev").onclick = () => step(-1);
$("next").onclick = () => step(1);
$("edge-prev").onclick = () => step(-1);
$("edge-next").onclick = () => step(1);
$("range").oninput = (e) => { if (!flipping) { idx = +e.target.value; draw(); } };
document.addEventListener("keydown", (e) => {
  if (/INPUT|TEXTAREA/.test(e.target.tagName) && e.target.type !== "range") return;
  if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
  if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
});

function growKw() { const t = $("kw"); t.style.height = "auto"; t.style.height = t.scrollHeight + "px"; }
$("kw").addEventListener("input", growKw);
$("kw").addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); $("form").requestSubmit(); } });

let lastW = 0;
new ResizeObserver(() => {
  const w = $("stage").clientWidth;
  if (w === lastW || flipping) return;
  lastW = w;
  growKw();
  draw();
}).observe($("stage"));
addEventListener("resize", () => current && renderBook3d(current));

(async () => {
  try {
    const s = localStorage.getItem("natgwon-last");
    if (s) { mine = JSON.parse(s); $("t-mine").hidden = false; }
  } catch (e) {}
  growKw();
  await show(SAMPLES.novel, "novel", 11);
})();
