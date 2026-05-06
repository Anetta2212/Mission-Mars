const el = id => document.getElementById(id);

// ─── Intro screen ────────────────────────────────────────────────────────────

function buildIntro() {
  const existing = document.getElementById("introScreen");
  if (existing) existing.remove();

  const slides = [
    {
      icon: "◈",
      title: "ARES-7 — HELLAS PLANITIA",
      text: "Sol 1. Ваша база щойно приземлилась на Марс.\nЗв'язок із Землею — 20 хвилин затримки.\nЕкіпаж: 6 осіб. Ресурси: критично обмежені."
    },
    {
      icon: "🎯",
      title: "ТРИ ЦІЛІ МІСІЇ",
      text: "① Виростити першу рослину на Марсі\n   (через оранжерею + дослідження)\n\n② Протриматись 20 солів\n\n③ Підготувати евакуацію екіпажу\n   (антена + місії зв'язку)"
    },
    {
      icon: "⚠",
      title: "ЯК ВИЖИТИ",
      text: "• Стежте за киснем, водою та енергією\n• Кризи — клікайте на піни на карті\n• RP заробляєте через лабораторію\n  та щоденні завдання у «Місіях»\n• Вночі сонячні панелі не працюють"
    },
    {
      icon: "🌱",
      title: "ПЕРША РОСЛИНА",
      text: "Головна ціль місії — виростити живу рослину.\nЦе доведе: Марс може стати домом.\n\nЧотири етапи: ґрунт → насіння → ріст → збір.\nКожен потребує ресурсів і часу.\n\nУдачі, командире."
    }
  ];

  let idx = 0;

  const screen = document.createElement("div");
  screen.id = "introScreen";
  screen.style.cssText = `
    position:fixed;inset:0;background:#0d0704;z-index:9998;
    display:flex;align-items:center;justify-content:center;
    font-family:'Share Tech Mono',monospace;
  `;

  const scanline = document.createElement("div");
  scanline.style.cssText = `
    position:absolute;inset:0;pointer-events:none;
    background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.08) 2px,rgba(0,0,0,0.08) 4px);
  `;
  screen.appendChild(scanline);

  const box = document.createElement("div");
  box.style.cssText = `
    position:relative;z-index:2;max-width:520px;width:90%;
    background:rgba(22,11,6,0.98);border:1px solid #e85d04;
    padding:36px 44px;text-align:center;
    clip-path:polygon(0 0,calc(100% - 24px) 0,100% 24px,100% 100%,24px 100%,0 calc(100% - 24px));
  `;

  const badge = document.createElement("div");
  badge.style.cssText = "display:inline-block;font-size:10px;letter-spacing:3px;color:#e85d04;border:1px solid rgba(232,93,4,0.4);padding:3px 12px;margin-bottom:14px;";
  badge.textContent = "ARES-7 // BRIEFING";

  const iconEl = document.createElement("div");
  iconEl.style.cssText = "font-size:44px;margin-bottom:14px;line-height:1;";

  const titleEl = document.createElement("div");
  titleEl.style.cssText = "font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;letter-spacing:3px;color:#ffb347;text-transform:uppercase;margin-bottom:16px;";

  const textEl = document.createElement("div");
  textEl.style.cssText = "font-size:12px;color:#8a5c44;line-height:1.9;white-space:pre-line;margin-bottom:24px;text-align:left;";

  const dotsEl = document.createElement("div");
  dotsEl.style.cssText = "display:flex;justify-content:center;gap:6px;margin-bottom:22px;";

  const btn = document.createElement("button");
  btn.style.cssText = `
    padding:11px 32px;background:rgba(232,93,4,0.2);border:1px solid #e85d04;
    color:#f0cdb8;font-family:'Rajdhani',sans-serif;font-size:13px;
    font-weight:700;letter-spacing:3px;text-transform:uppercase;cursor:pointer;
    clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,0 100%);
  `;

  btn.addEventListener("mouseover", () => { btn.style.background = "rgba(232,93,4,0.45)"; btn.style.color = "#fff"; });
  btn.addEventListener("mouseout",  () => { btn.style.background = "rgba(232,93,4,0.2)";  btn.style.color = "#f0cdb8"; });

  btn.addEventListener("click", () => {
    if (idx < slides.length - 1) { idx++; render(); }
    else { screen.remove(); }
  });

  box.appendChild(badge);
  box.appendChild(iconEl);
  box.appendChild(titleEl);
  box.appendChild(textEl);
  box.appendChild(dotsEl);
  box.appendChild(btn);

  screen.appendChild(box);
  document.body.appendChild(screen);

  function render() {
    const s = slides[idx];
    iconEl.textContent  = s.icon;
    titleEl.textContent = s.title;
    textEl.textContent  = s.text;
    btn.textContent     = idx < slides.length - 1 ? "ДАЛІ →" : "▶ РОЗПОЧАТИ МІСІЮ";

    dotsEl.innerHTML = slides.map((_, i) =>
      `<div style="height:3px;width:${i === idx ? 28 : 18}px;background:${i === idx ? "#e85d04" : "#3a1a0a"};transition:all 0.3s;"></div>`
    ).join("");
  }

  render();
}


// ─── Game state ───────────────────────────────────────────────────────────────

const game = {
  sol: 1, rp: 0,
  paused: false, over: false,
  hour: 14, min: 37,

  res: { oxygen: 78, water: 54, energy: 63 },

  modules: {
    habitat:    { name: "Житловий модуль", status: "ok", level: 1, crisis: null, drain: { oxygen: 0.04 }, crises: ["fire","leak"] },
    greenhouse: { name: "Оранжерея",       status: "ok", level: 1, crisis: null, drain: { water: 0.03  }, crises: ["drought","pest"] },
    solar:      { name: "Сонячні панелі",  status: "ok", level: 1, crisis: null, drain: { energy: 0    }, crises: ["dust_storm","malfunction"] },
    lab:        { name: "Лабораторія",     status: "ok", level: 1, crisis: null, drain: { energy: 0.02 }, crises: ["overload","leak"] }
  },

  buildings: {
    recycler:    { name: "Переробник води",    icon: "💧", cost: 60,  built: false, desc: "+0.05 води/тік постійно" },
    garage:      { name: "Гараж роверів",      icon: "🚗", cost: 100, built: false, desc: "Розблоковує місії на поверхні" },
    medlab:      { name: "Медичний блок",      icon: "⚕️", cost: 120, built: false, desc: "Екіпаж відновлює здоров'я щодня" },
    antenna:     { name: "Антена зв'язку",     icon: "📡", cost: 80,  built: false, desc: "+20% RP і потрібна для евакуації" },
    greenhouse2: { name: "Друга оранжерея",    icon: "🌿", cost: 160, built: false, desc: "Оранжерея виробляє +0.04 води/тік" },
    battery:     { name: "Акумуляторний блок", icon: "🔋", cost: 130, built: false, desc: "+0.04 енергії вночі" },
    reactor:     { name: "Резервний реактор",  icon: "⚛️", cost: 250, built: false, desc: "Енергія не падає нижче 20%" },
    ice_drill:   { name: "Льодобур",           icon: "🧊", cost: 200, built: false, desc: "+0.10 води/тік", needs: "crater_north" }
  },

  missions: [
    { id: "survey",  name: "Розвідка кратера",   icon: "🗺️", desc: "Вивчити рельєф на схід від бази.",    time: 25,  reward: 70,  type: "rp",     done: false, active: false, progress: 0, needs: null,      rpCost: 0 },
    { id: "sample",  name: "Збір ґрунту",         icon: "🧪", desc: "Зібрати п'ять зразків реголіту.",     time: 18,  reward: 50,  type: "rp",     done: false, active: false, progress: 0, needs: null,      rpCost: 0 },
    { id: "repair",  name: "Ремонт труби",         icon: "🔩", desc: "Замінити зовнішній водяний клапан.",  time: 12,  reward: 22,  type: "water",  done: false, active: false, progress: 0, needs: null,      rpCost: 0 },
    { id: "rover",   name: "Рейд на ровері",       icon: "🚗", desc: "Доїхати до аномалії за три км.",     time: 40,  reward: 120, type: "rp",     done: false, active: false, progress: 0, needs: "garage",  rpCost: 0 },
    { id: "meteor",  name: "Аналіз метеорита",     icon: "☄️", desc: "Дослідити уламки поблизу бази.",     time: 35,  reward: 90,  type: "rp",     done: false, active: false, progress: 0, needs: null,      rpCost: 0 },
    { id: "oxygen2", name: "Запуск генератора O₂", icon: "💨", desc: "Увімкнути резервний кисневий блок.", time: 20,  reward: 25,  type: "oxygen", done: false, active: false, progress: 0, needs: "medlab",  rpCost: 0 },
    // ── Евакуаційні місії ──────────────────────────────────────────────────────
    { id: "evac1",   name: "Сигнал евакуації",     icon: "📡", desc: "Надіслати сигнал SOS на Землю. Земля має отримати і підтвердити сигнал — це займає час.",          time: 60,  reward: 80,  type: "rp", done: false, active: false, progress: 0, needs: "antenna", rpCost: 0,   evacStep: 1 },
    { id: "evac2",   name: "Підготовка капсули",   icon: "🚀", desc: "Повна технічна перевірка евакуаційної капсули, заправка і тест двигунів.",                         time: 80,  reward: 60,  type: "rp", done: false, active: false, progress: 0, needs: "garage",  rpCost: 0,   evacStep: 2 },
    { id: "evac3",   name: "Евакуація екіпажу",    icon: "🛸", desc: "Посадка і запуск капсули. Операція вимагає значних ресурсів і повної готовності екіпажу.",          time: 120, reward: 0,   type: "rp", done: false, active: false, progress: 0, needs: null,     rpCost: 300, evacStep: 3, needsEvac: true }
  ],

  tech: [
    { id: "atmo",     tier: 1, name: "Атмосферний фільтр",  icon: "💨", desc: "Кисень -15% витрат",               cost: 70,  done: false, needs: [] },
    { id: "hydro",    tier: 1, name: "Гідропоніка",         icon: "🌱", desc: "Оранжерея виробляє воду",          cost: 70,  done: false, needs: [] },
    { id: "solar2",   tier: 1, name: "Покращені батареї",   icon: "⚡", desc: "Панелі +20% генерації",            cost: 80,  done: false, needs: [] },
    { id: "biotech",  tier: 1, name: "Марсіанська біологія",icon: "🔬", desc: "Розблоковує етап «Насіння»",       cost: 90,  done: false, needs: [] },
    { id: "medsuit",  tier: 2, name: "Захисний костюм",     icon: "🧑‍🚀", desc: "Здоров'я екіпажу -50% втрат", cost: 110, done: false, needs: ["atmo"] },
    { id: "ai",       tier: 2, name: "ШІ-асистент",         icon: "🤖", desc: "Лабораторія +30% RP",             cost: 130, done: false, needs: ["hydro","solar2"] },
    { id: "growtech", tier: 2, name: "Технологія росту",    icon: "🌿", desc: "Розблоковує етап «Ріст»",         cost: 120, done: false, needs: ["biotech","hydro"] },
    { id: "fusion",   tier: 3, name: "Мікрореактор",        icon: "⚛️", desc: "Енергія не падає нижче 10%",      cost: 220, done: false, needs: ["ai"] }
  ],

  zones: [
    { id: "base_area",     name: "Периметр бази",     icon: "🏠", desc: "Вже досліджена.",                     bonus: "Стартова зона",          bonusType: null,           bonusValue: 0,   open: true,  unlocking: false, progress: 0, cost: 0,   needs: null,           top: 1, left: 1 },
    { id: "crater_north",  name: "Північний кратер",  icon: "🌑", desc: "Поклади льоду.",                      bonus: "Розблоковує Льодобур",   bonusType: "unlock_b",     bonusValue: 0,   open: false, unlocking: false, progress: 0, cost: 50,  needs: null,           top: 0, left: 1 },
    { id: "lava_field",    name: "Лавове поле",        icon: "🌋", desc: "Мінерали для досліджень.",            bonus: "+50 RP",                 bonusType: "rp",           bonusValue: 50,  open: false, unlocking: false, progress: 0, cost: 60,  needs: null,           top: 0, left: 2 },
    { id: "dust_plain",    name: "Пилова рівнина",     icon: "🌪",  desc: "Ідеальне місце для панелей.",        bonus: "+15% енергії",           bonusType: "energy_boost", bonusValue: 0,   open: false, unlocking: false, progress: 0, cost: 70,  needs: "lava_field",   top: 0, left: 3 },
    { id: "canyon_west",   name: "Західний каньйон",   icon: "🏔",  desc: "Відклади мінералів.",               bonus: "+30 води",               bonusType: "water",        bonusValue: 30,  open: false, unlocking: false, progress: 0, cost: 75,  needs: "base_area",    top: 1, left: 0 },
    { id: "ice_valley",    name: "Льодяна долина",     icon: "❄️", desc: "Підземний лід.",                     bonus: "+0.05 води/тік",         bonusType: "water_regen",  bonusValue: 0,   open: false, unlocking: false, progress: 0, cost: 100, needs: "crater_north", top: 1, left: 2 },
    { id: "mineral_ridge", name: "Мінеральний хребет", icon: "💎", desc: "Унікальні мінерали.",                bonus: "+0.3 RP/тік",            bonusType: "rp_regen",     bonusValue: 0,   open: false, unlocking: false, progress: 0, cost: 85,  needs: "lava_field",   top: 1, left: 3 },
    { id: "shelter_ruins", name: "Покинутий зонд",     icon: "🛸", desc: "Уламки старого марсохода NASA.",     bonus: "+80 RP",                 bonusType: "rp",           bonusValue: 80,  open: false, unlocking: false, progress: 0, cost: 90,  needs: "canyon_west",  top: 2, left: 0 },
    { id: "south_plateau", name: "Південне плато",     icon: "🗻", desc: "Рівнина для панелей.",               bonus: "+25% RP від лабораторії",bonusType: "rp_lab_boost", bonusValue: 0,   open: false, unlocking: false, progress: 0, cost: 120, needs: "canyon_west",  top: 2, left: 1 },
    { id: "deep_crater",   name: "Глибокий кратер",    icon: "🕳",  desc: "Найглибший кратер.",                bonus: "+60 кисню",              bonusType: "oxygen",       bonusValue: 60,  open: false, unlocking: false, progress: 0, cost: 110, needs: "crater_north", top: 2, left: 2 },
    { id: "far_east",      name: "Далекий схід",       icon: "🌅", desc: "Невідома зона далеко від бази.",     bonus: "+150 RP",                bonusType: "rp",           bonusValue: 150, open: false, unlocking: false, progress: 0, cost: 170, needs: "mineral_ridge",top: 2, left: 3 }
  ],

  plant: {
    stage: 0,
    stageProgress: 0,
    growing: false
  },

  crew: [
    { id: "koval",   name: "Олена Коваль",   role: "Командир", avatar: "👩‍🚀", health: 92, morale: 88, skill: 85, task: "Управління базою" },
    { id: "petrov",  name: "Дмитро Петров",  role: "Інженер",  avatar: "👨‍🔧", health: 78, morale: 72, skill: 90, task: "Обслуговування" },
    { id: "sirenko", name: "Яна Сіренко",    role: "Лікар",    avatar: "👩‍⚕️", health: 95, morale: 80, skill: 88, task: "Медичний блок" },
    { id: "bondar",  name: "Ігор Бондар",    role: "Геолог",   avatar: "👨‍🔬", health: 65, morale: 60, skill: 82, task: "Польові дослідження" },
    { id: "lysenko", name: "Марія Лисенко",  role: "Біолог",   avatar: "👩‍🌾", health: 88, morale: 91, skill: 79, task: "Оранжерея" },
    { id: "kravets", name: "Сергій Кравець", role: "Пілот",    avatar: "👨‍✈️", health: 82, morale: 66, skill: 94, task: "Чекає на завдання" }
  ],

  zoneBonuses: { waterRegen: 0, rpRegen: 0, energyBoost: 1, rpLabBoost: 1 },

  dailyTasks: [],
  _dailyCrisisFixed: 0, _dailyMissionStarted: 0, _dailyUpgraded: 0, _dailyZoneOpened: 0,

  tradeAvailable: false, tradeNextSol: 6, tradeOffer: null,

  objectives: {
    plant:   false,
    survive: false,
    evac:    false
  },

  ending: null
};

// ─── Plant stages ─────────────────────────────────────────────────────────────

const PLANT_STAGES = [
  {
    num: 1, name: "Підготовка ґрунту", icon: "🪨",
    desc: "Зволожити реголіт і додати живильні речовини.",
    duration: 40,
    requires: () => game.res.water >= 30 && game.modules.greenhouse.level >= 1,
    requiresText: "Вода ≥ 30% • Оранжерея Lv1+",
    needsTech: null
  },
  {
    num: 2, name: "Посів насіння", icon: "🌰",
    desc: "Посіяти адаптоване насіння пшениці у підготовлений ґрунт.",
    duration: 50,
    requires: () => hasTech("biotech") && game.res.water >= 35,
    requiresText: "Технологія «Марсіанська біологія» • Вода ≥ 35%",
    needsTech: "biotech"
  },
  {
    num: 3, name: "Вирощування", icon: "🌿",
    desc: "Підтримувати оптимальний рівень вологи і температури.",
    duration: 70,
    requires: () => hasTech("growtech") && game.res.water >= 40 && game.res.oxygen >= 50,
    requiresText: "Технологія «Технологія росту» • Вода ≥ 40% • O₂ ≥ 50%",
    needsTech: "growtech"
  },
  {
    num: 4, name: "Перший урожай", icon: "🌾",
    desc: "Зафіксувати, задокументувати і зібрати першу рослину на Марсі.",
    duration: 30,
    requires: () => true,
    requiresText: "Автоматично",
    needsTech: null
  }
];

const DAILY_POOL = [
  { desc: "Усунь будь-яку кризу",              reward: 30, check: () => game._dailyCrisisFixed > 0 },
  { desc: "Запусти будь-яку місію",             reward: 25, check: () => game._dailyMissionStarted > 0 },
  { desc: "Покращ або побудуй щось",            reward: 35, check: () => game._dailyUpgraded > 0 },
  { desc: "Кисень вище 60% до кінця Sol",       reward: 20, check: () => game.res.oxygen >= 60 },
  { desc: "Вода вище 50% до кінця Sol",         reward: 20, check: () => game.res.water >= 50 },
  { desc: "Енергія вище 40% до кінця Sol",      reward: 15, check: () => game.res.energy >= 40 },
  { desc: "Відкрий зону на поверхні",           reward: 40, check: () => game._dailyZoneOpened > 0 },
  { desc: "Просто пережити цей Sol",            reward: 15, check: () => true }
];

const TRADE_OFFERS = [
  { desc: "Контейнер з водою (+45 💧)", cost: 45, res: "water",  amount: 45 },
  { desc: "Балони з киснем (+40 O₂)",   cost: 40, res: "oxygen", amount: 40 },
  { desc: "Заряд батарей (+35 ⚡)",      cost: 35, res: "energy", amount: 35 },
  { desc: "Науковий набір (+80 RP)",    cost: 25, res: "rp",     amount: 80 },
  { desc: "Великий вантаж: вода (+70)", cost: 80, res: "water",  amount: 70 },
  { desc: "Аварійний кисень (+55 O₂)",  cost: 60, res: "oxygen", amount: 55 }
];

const crises = {
  fire:        { label: "🔥 Пожежа!",         desc: "Займання в житловому модулі.",           extra: { oxygen: 0.3, energy: 0.1 } },
  leak:        { label: "💧 Витік кисню!",     desc: "Пошкоджена герметизація.",              extra: { oxygen: 0.25 } },
  drought:     { label: "🌵 Посуха!",          desc: "Система поливу відмовила.",              extra: { water: 0.25 } },
  pest:        { label: "🐛 Шкідники!",        desc: "Комахи потрапили в оранжерею.",          extra: { water: 0.12, energy: 0.08 } },
  dust_storm:  { label: "🌪 Пилова буря!",     desc: "Буря засипала сонячні панелі.",          extra: { energy: 0.35 } },
  malfunction: { label: "⚡ Відмова системи!", desc: "Збій в енергосистемі.",                  extra: { energy: 0.3 } },
  overload:    { label: "🔌 Перевантаження!",  desc: "Лабораторія споживає занадто багато.",   extra: { energy: 0.2 } }
};

const resLabel  = { oxygen: "Кисень", water: "Вода", energy: "Енергія" };
const lvlNames  = ["","Базовий","Покращений","Розширений","Передовий","Елітний"];
const upgCost   = lvl => lvl * 80;
const EXPLORE_T = 40;
const isNight   = () => game.hour >= 18 || game.hour < 6;

let currentPage = "home";


// ─── Navigation ───────────────────────────────────────────────────────────────

function goTo(page) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.querySelectorAll("nav a").forEach(a => a.classList.remove("active"));
  el(`page-${page}`).classList.add("active");
  document.querySelector(`nav a[data-page="${page}"]`).classList.add("active");

  const headers = {
    home:      ["ГОЛОВНА БАЗА ARES-7",    "Сектор: Hellas Planitia"],
    plant:     ["ПЕРША РОСЛИНА",          "Головна ціль місії"],
    buildings: ["БУДІВЛІ",                "Розширення бази"],
    missions:  ["МІСІЇ",                  "Польові операції"],
    research:  ["ТЕХНОЛОГІЇ",             "Дослідження"],
    crew:      ["ЕКІПАЖ",                 "Персонал бази"],
    explore:   ["ПОВЕРХНЯ МАРСА",         "Дослідження зон"]
  };
  el("pageTitle").textContent    = headers[page][0];
  el("pageSubtitle").textContent = headers[page][1];
  currentPage = page;

  if (page === "plant")     drawPlant();
  if (page === "buildings") drawBuildings();
  if (page === "missions")  drawMissions();
  if (page === "research")  drawResearch();
  if (page === "crew")      drawCrew();
  if (page === "explore")   drawExplore();
}

document.querySelectorAll("nav a[data-page]").forEach(link => {
  link.addEventListener("click", e => { e.preventDefault(); goTo(link.dataset.page); });
});


// ─── Ticker ───────────────────────────────────────────────────────────────────

const tickerLines = [
  "Зв'язок із Землею: затримка 20 хв • Всі системи в автономному режимі",
  "Температура поверхні: -42°C • Вітер: 18 м/с • Видимість: 4 км",
  "Ціль №1: виростити першу рослину на Марсі",
  "Рекомендація NASA: тримайте ресурси вище 30%",
  "Ціль №2: протриматися 20 солів",
  "Ціль №3: підготувати і виконати евакуацію екіпажу"
];
let tickerIdx = 0;

function showTicker(text) {
  el("ticker").innerHTML = `<span class="ticker-text">${text}</span>`;
  setTimeout(() => { tickerIdx = (tickerIdx + 1) % tickerLines.length; showTicker(tickerLines[tickerIdx]); }, 15000);
}


// ─── Log ──────────────────────────────────────────────────────────────────────

const pad = n => String(n).padStart(2, "0");

function log(text, type = "") {
  const time = `Sol ${game.sol} ${pad(game.hour)}:${pad(game.min)}`;
  const row  = document.createElement("div");
  row.className   = `log-entry ${type}`;
  row.textContent = `[${time}] ${text}`;
  el("eventLog").prepend(row);
  while (el("eventLog").children.length > 35) el("eventLog").lastChild.remove();
}


// ─── Resources ────────────────────────────────────────────────────────────────

function drawResources() {
  el("resourceBars").innerHTML = [
    { key: "oxygen", label: "Кисень"  },
    { key: "water",  label: "Вода"    },
    { key: "energy", label: "Енергія" }
  ].map(({ key, label }) => {
    const val = Math.max(0, Math.min(100, game.res[key]));
    const pct = Math.round(val);
    const cls = val < 25 ? "low" : val < 50 ? "medium" : "";
    const col = val < 25 ? "#ff3d3d" : val < 50 ? "#ffb347" : "#f0cdb8";
    const emergCost = { oxygen: 30, water: 25, energy: 20 }[key];
    return `
      <div class="res-bar">
        <div class="res-labels">
          <span>${label}</span>
          <span class="res-pct" style="color:${col}">${pct}%</span>
        </div>
        <div class="res-track"><div class="res-fill ${cls}" style="width:${pct}%"></div></div>
        ${val < 40 ? `<button class="emerg-btn" onclick="emergencyRefill('${key}')">⚡ +20 за ${emergCost} RP</button>` : ""}
      </div>`;
  }).join("");
}

function emergencyRefill(key) {
  const cost = { oxygen: 30, water: 25, energy: 20 }[key];
  if (game.rp < cost) { log("Не вистачає RP.", "warning"); return; }
  game.rp -= cost;
  game.res[key] = Math.min(100, game.res[key] + 20);
  el("rpDisplay").textContent = Math.floor(game.rp);
  log(`Аварійне поповнення: ${resLabel[key]} +20`, "ok");
  drawResources();
}


// ─── Module list ──────────────────────────────────────────────────────────────

function drawModuleList() {
  el("moduleList").innerHTML = Object.entries(game.modules).map(([key, mod]) => {
    const text = mod.crisis ? "⚠ КРИЗА" : "Норма";
    const cls  = mod.crisis ? "crisis" : "ok";
    return `
      <div class="module-row" onclick="openModule('${key}')">
        <span>${mod.name}</span>
        <span class="module-lv">Lv${mod.level}</span>
        <span class="module-status ${cls}">${text}</span>
      </div>`;
  }).join("");
}


// ─── Pins ─────────────────────────────────────────────────────────────────────

function updatePins() {
  Object.entries(game.modules).forEach(([key, mod]) => {
    const dot   = el(`pin-${key}`);
    const alert = el(`alert-${key}`);
    if (!dot) return;
    dot.classList.toggle("is-crisis", !!mod.crisis);
    alert.classList.toggle("hidden", !mod.crisis);
  });
  const count    = Object.values(game.modules).filter(m => m.crisis).length;
  const homeLink = document.querySelector("nav a[data-page='home']");
  let badge = homeLink.querySelector(".nav-alert");
  if (count > 0) {
    if (!badge) { badge = document.createElement("span"); badge.className = "nav-alert"; homeLink.appendChild(badge); }
    badge.textContent = count;
  } else if (badge) badge.remove();
}


// ─── Clock ────────────────────────────────────────────────────────────────────

function tickTime() {
  game.min++;
  if (game.min >= 60) { game.min = 0; game.hour++; }
  if (game.hour >= 25) {
    game.hour = 0; game.sol++;
    el("solDisplay").textContent = game.sol;
    log(`Sol ${game.sol} розпочався.`, "ok");
    onNewSol();
  }
  el("clock").textContent = `${pad(game.hour)}:${pad(game.min)}`;
  const nightTag = el("nightTag");
  if (nightTag) { isNight() ? nightTag.classList.remove("hidden") : nightTag.classList.add("hidden"); }
}

function onNewSol() {
  dailyCrewTick();
  generateDailyTasks();
  checkTradeArrival();
  game._dailyCrisisFixed = 0; game._dailyMissionStarted = 0;
  game._dailyUpgraded = 0; game._dailyZoneOpened = 0;
}


// ─── Resources tick ───────────────────────────────────────────────────────────

function tickResources() {
  const r = game.res;
  const b = game.zoneBonuses;
  const night = isNight();

  const atmoMul  = hasTech("atmo")   ? 0.85 : 1;
  const hydroOn  = hasTech("hydro");
  const solarMul = hasTech("solar2") ? 1.20 : 1;
  const aiMul    = hasTech("ai")     ? 1.30 : 1;
  const antMul   = hasBuilding("antenna") ? 1.20 : 1;

  Object.values(game.modules).forEach(mod => {
    if (mod.status === "offline") return;
    const lvlMul = 1 - (mod.level - 1) * 0.05;

    if (mod.drain.oxygen != null) {
      let d = mod.drain.oxygen * lvlMul * atmoMul;
      if (mod.crisis) d += crises[mod.crisis].extra.oxygen || 0;
      r.oxygen -= d;
    }
    if (mod.drain.water != null) {
      if (mod === game.modules.greenhouse) {
        if (hydroOn || hasBuilding("greenhouse2")) {
          r.water += (0.03 + (hasBuilding("greenhouse2") ? 0.04 : 0)) * (mod.level * 0.2 + 0.8);
        } else {
          let d = mod.drain.water * lvlMul;
          if (mod.crisis) d += crises[mod.crisis].extra.water || 0;
          r.water -= d;
        }
      }
    }
    if (mod.drain.energy > 0) {
      let d = mod.drain.energy * lvlMul;
      if (mod.crisis) d += crises[mod.crisis].extra.energy || 0;
      r.energy -= d;
    }
  });

  const solar = game.modules.solar;
  if (!solar.crisis && !night) r.energy += 0.07 * (1 + (solar.level - 1) * 0.12) * solarMul * b.energyBoost;
  if (hasBuilding("battery") && night) r.energy += 0.04;
  if (hasBuilding("recycler"))   r.water  += 0.05;
  if (hasBuilding("ice_drill"))  r.water  += 0.10;
  r.water  += b.waterRegen;

  if (hasTech("fusion"))      r.energy = Math.max(10, r.energy);
  if (hasBuilding("reactor")) r.energy = Math.max(20, r.energy);

  const lab = game.modules.lab;
  if (!lab.crisis && lab.status !== "offline") {
    game.rp += (0.6 + lab.level * 0.3) * (r.energy / 100) * aiMul * antMul * b.rpLabBoost + b.rpRegen;
    el("rpDisplay").textContent = Math.floor(game.rp);
  }

  Object.keys(r).forEach(k => { r[k] = Math.max(0, Math.min(100, r[k])); });
}

const hasTech     = id => game.tech.find(t => t.id === id)?.done;
const hasBuilding = id => game.buildings[id]?.built;


// ─── Crises ───────────────────────────────────────────────────────────────────

function maybeTriggerCrisis() {
  const chance = 0.005 + game.sol * 0.00015;
  if (Math.random() > chance) return;
  const free = Object.keys(game.modules).filter(k => !game.modules[k].crisis);
  if (!free.length) return;
  const key  = free[Math.floor(Math.random() * free.length)];
  const mod  = game.modules[key];
  const type = mod.crises[Math.floor(Math.random() * mod.crises.length)];
  mod.crisis = type;
  log(`${crises[type].label} — ${mod.name}`, "crisis");
  showTicker(`⚠ ${crises[type].label} у "${mod.name}". Клікни на піні!`);
}


// ─── Missions ─────────────────────────────────────────────────────────────────

function tickMissions() {
  game.missions.forEach(m => {
    if (!m.active || m.done) return;
    m.progress = Math.min(m.time, m.progress + 1);
    if (m.progress >= m.time) finishMission(m);
  });
  if (currentPage === "missions") drawMissions();
}

function finishMission(m) {
  m.done = true; m.active = false;
  if (m.evacStep === 3) {
    game.objectives.evac = true;
    log("Евакуація завершена! Екіпаж на шляху додому.", "upgrade");
    checkEnding();
    return;
  }
  if (m.type === "rp") {
    game.rp += m.reward;
    el("rpDisplay").textContent = Math.floor(game.rp);
    log(`"${m.name}" виконано! +${m.reward} RP`, "upgrade");
  } else {
    game.res[m.type] = Math.min(100, game.res[m.type] + m.reward);
    log(`"${m.name}" виконано! +${m.reward} ${resLabel[m.type]}`, "upgrade");
  }
}


// ─── Plant ────────────────────────────────────────────────────────────────────

function tickPlant() {
  const p = game.plant;
  if (!p.growing || p.stage === 0 || p.stage > 4) return;

  const cfg = PLANT_STAGES[p.stage - 1];

  if (!cfg.requires()) {
    if (currentPage === "plant") drawPlant();
    return;
  }

  p.stageProgress += 100 / cfg.duration;
  if (p.stageProgress >= 100) {
    p.stageProgress = 100;
    p.growing = false;
    log(`Етап "${cfg.name}" завершено!`, "upgrade");
    if (p.stage === 4) {
      p.stage = 5;
      game.objectives.plant = true;
      log("🌱 Перша рослина на Марсі виросла!", "upgrade");
      showTicker("🌱 НЕМОЖЛИВЕ СТАЛО МОЖЛИВИМ — перша рослина на Марсі!");
      checkEnding();
    } else {
      setTimeout(() => {
        if (!game.over) { p.stage++; p.stageProgress = 0; }
        if (currentPage === "plant") drawPlant();
      }, 1500);
    }
  }

  if (currentPage === "plant") drawPlant();
}

function startPlantStage() {
  const p   = game.plant;
  const cfg = PLANT_STAGES[p.stage - 1];
  if (!cfg.requires()) return;
  p.growing = true;
  log(`Розпочато: "${cfg.name}"`, "warning");
  if (currentPage === "plant") drawPlant();
}

function drawPlant() {
  const p   = game.plant;
  const pEl = el("plantPage");
  if (!pEl) return;

  const totalPct = p.stage === 5 ? 100
    : p.stage === 0 ? 0
    : Math.round(((p.stage - 1) * 100 + p.stageProgress) / 4);

  const plantEmoji = p.stage === 5 ? "🌾"
    : p.stage >= 3 ? "🌿"
    : p.stage >= 2 ? "🌱"
    : p.stage >= 1 ? "🌰" : "🪨";

  const heroStatus = p.stage === 5
    ? "Місія виконана. Марс може стати домом."
    : p.stage === 0
    ? "Оранжерея готова. Розпочніть підготовку ґрунту."
    : p.growing
    ? `Етап ${p.stage} з 4 — ${Math.round(p.stageProgress)}%…`
    : `Етап ${p.stage} з 4 — очікує на запуск або умови`;

  pEl.innerHTML = `
    <div class="plant-hero">
      <div class="plant-visual">${plantEmoji}</div>
      <div style="flex:1">
        <div class="plant-title">ПЕРША РОСЛИНА НА МАРСІ</div>
        <div class="plant-subtitle">${heroStatus}</div>
        <div class="plant-overall">
          <div class="plant-overall-fill" style="width:${totalPct}%"></div>
        </div>
        <div class="plant-overall-label">${totalPct}% — ${p.stage === 5 ? "ЗАВЕРШЕНО" : `Sol ${game.sol}`}</div>
      </div>
    </div>
    <div class="plant-stages">
      ${PLANT_STAGES.map((cfg, i) => {
        const stageNum  = i + 1;
        const isDone    = p.stage > stageNum || p.stage === 5;
        const isActive  = p.stage === stageNum;
        const isLocked  = p.stage < stageNum;
        const cls       = isDone ? "is-done" : isActive ? "is-active" : "is-locked";
        const progress  = isActive ? p.stageProgress : isDone ? 100 : 0;
        const canStart  = isActive && !p.growing && cfg.requires();
        const missingReqs = isActive && !cfg.requires();

        return `
          <div class="stage-card ${cls}">
            <div class="stage-num">ЕТАП 0${stageNum}</div>
            <div class="stage-icon">${cfg.icon}</div>
            <div class="stage-name">${cfg.name}</div>
            <div class="stage-req">${cfg.requiresText}</div>
            <div class="stage-bar"><div class="stage-bar-fill" style="width:${progress}%"></div></div>
            <div class="stage-status">
              ${isDone ? "✓ Завершено" : isActive && p.growing ? `Росте… ${Math.round(p.stageProgress)}%` : isActive ? "Готовий до запуску" : "Заблоковано"}
            </div>
            ${isActive && !isDone ? `
              <button class="stage-btn" onclick="startPlantStage()" ${canStart ? "" : "disabled"}>
                ${p.growing ? "Росте…" : missingReqs ? "Умови не виконані" : "▶ ПОЧАТИ"}
              </button>` : ""}
            ${missingReqs ? `<p class="hint" style="margin-top:6px">Потрібно: ${cfg.requiresText}</p>` : ""}
          </div>`;
      }).join("")}
    </div>`;
}


// ─── Explore ──────────────────────────────────────────────────────────────────

function tickExplore() {
  game.zones.forEach(zone => {
    if (!zone.unlocking || zone.open) return;
    zone.progress++;
    if (zone.progress >= EXPLORE_T) {
      zone.open = true; zone.unlocking = false;
      applyZoneBonus(zone);
      game._dailyZoneOpened++;
      log(`Зону "${zone.name}" відкрито! ${zone.bonus}`, "upgrade");
      if (currentPage === "explore") drawExplore();
    }
  });
  if (game.zones.some(z => z.unlocking) && currentPage === "explore") drawExplore();
}

function applyZoneBonus(zone) {
  const b = game.zoneBonuses;
  switch (zone.bonusType) {
    case "rp":           game.rp += zone.bonusValue; el("rpDisplay").textContent = Math.floor(game.rp); break;
    case "water":        game.res.water  = Math.min(100, game.res.water  + zone.bonusValue); break;
    case "oxygen":       game.res.oxygen = Math.min(100, game.res.oxygen + zone.bonusValue); break;
    case "water_regen":  b.waterRegen  += 0.05; break;
    case "rp_regen":     b.rpRegen     += 0.3;  break;
    case "energy_boost": b.energyBoost += 0.25; break;
    case "rp_lab_boost": b.rpLabBoost  += 0.25; break;
  }
}

function startExplore(zoneId) {
  const zone = game.zones.find(z => z.id === zoneId);
  if (!zone || zone.open || zone.unlocking || game.rp < zone.cost) return;
  if (zone.needs && !game.zones.find(z => z.id === zone.needs)?.open) return;
  game.rp -= zone.cost;
  el("rpDisplay").textContent = Math.floor(game.rp);
  zone.unlocking = true; zone.progress = 0;
  log(`Розпочато: "${zone.name}"`, "warning");
  drawExplore();
}

function drawExplore() {
  const cells = Array(3).fill(null).map(() => Array(4).fill(null));
  game.zones.forEach(z => { cells[z.top][z.left] = z; });

  el("exploreMap").innerHTML = cells.flat().map(zone => {
    if (!zone) return `<div class="zone is-locked"><div class="zone-fog">▓</div></div>`;
    if (zone.open) return `
      <div class="zone is-open">
        <div><div class="zone-icon">${zone.icon}</div><div class="zone-name">${zone.name}</div><div class="zone-bonus">${zone.desc}</div></div>
        <div class="zone-explored">✓ ${zone.bonus}</div>
      </div>`;
    if (zone.unlocking) {
      const pct = Math.round((zone.progress / EXPLORE_T) * 100);
      return `
        <div class="zone is-unlocking">
          <div><div class="zone-icon">${zone.icon}</div><div class="zone-name">${zone.name}</div></div>
          <div>
            <div class="zone-cost">${EXPLORE_T - zone.progress}с…</div>
            <div class="zone-progress"><div class="zone-progress-fill" style="width:${pct}%"></div></div>
          </div>
        </div>`;
    }
    const parentOk = !zone.needs || game.zones.find(z => z.id === zone.needs)?.open;
    const canBuy   = parentOk && game.rp >= zone.cost;
    if (!parentOk) return `
      <div class="zone is-locked">
        <div class="zone-fog">?</div>
        <div><div class="zone-name">${zone.name}</div><div class="zone-cost">Відкрий сусідню</div></div>
      </div>`;
    return `
      <div class="zone ${canBuy ? "is-available" : "is-locked"}" onclick="${canBuy ? `startExplore('${zone.id}')` : ""}">
        <div><div class="zone-icon">${zone.icon}</div><div class="zone-name">${zone.name}</div><div class="zone-bonus">${zone.desc}</div></div>
        <div>
          <div class="zone-bonus" style="color:#666">${zone.bonus}</div>
          <div class="zone-cost">${zone.cost} RP${!canBuy ? ` (є ${Math.floor(game.rp)})` : ""}</div>
        </div>
      </div>`;
  }).join("");
}


// ─── Daily tasks ──────────────────────────────────────────────────────────────

function generateDailyTasks() {
  game.dailyTasks = [...DAILY_POOL].sort(() => Math.random() - 0.5)
    .slice(0, 3).map(t => ({ ...t, claimed: false }));
  if (currentPage === "missions") drawMissions();
  log(`Нові завдання на Sol ${game.sol}.`, "warning");
}

function claimDailyTask(idx) {
  const t = game.dailyTasks[idx];
  if (!t || t.claimed || !t.check()) return;
  t.claimed = true;
  game.rp += t.reward;
  el("rpDisplay").textContent = Math.floor(game.rp);
  log(`Завдання: "${t.desc}" +${t.reward} RP`, "upgrade");
  drawMissions();
}


// ─── Trade ────────────────────────────────────────────────────────────────────

function checkTradeArrival() {
  if (game.sol >= game.tradeNextSol) {
    game.tradeAvailable = true;
    game.tradeOffer     = TRADE_OFFERS[Math.floor(Math.random() * TRADE_OFFERS.length)];
    game.tradeNextSol   = game.sol + 5 + Math.floor(Math.random() * 3);
    log(`Торговий корабель прибув! ${game.tradeOffer.desc}`, "upgrade");
    showTicker("🚀 Торговий корабель від NASA! Перевір вкладку Місії.");
    if (currentPage === "missions") drawMissions();
  }
}

function acceptTrade() {
  const o = game.tradeOffer;
  if (!o || game.rp < o.cost) return;
  game.rp -= o.cost;
  if (o.res === "rp") game.rp += o.amount;
  else game.res[o.res] = Math.min(100, game.res[o.res] + o.amount);
  el("rpDisplay").textContent = Math.floor(game.rp);
  game.tradeAvailable = false; game.tradeOffer = null;
  log("Торгівля завершена.", "ok");
  drawMissions();
}

function declineTrade() {
  game.tradeAvailable = false; game.tradeOffer = null;
  log("Торгову пропозицію відхилено.", "");
  drawMissions();
}


// ─── Objectives panel ─────────────────────────────────────────────────────────

function drawObjectives() {
  const obj = game.objectives;
  const items = [
    { done: obj.plant,   active: game.plant.stage > 0 && game.plant.stage < 5, text: "Виростити першу рослину на Марсі" },
    { done: obj.survive, active: game.sol >= 10,                                text: `Протриматися 20 солів (Sol ${game.sol}/20)` },
    { done: obj.evac,    active: game.missions.find(m => m.evacStep && m.done), text: "Евакуювати екіпаж" }
  ];

  el("objectivesPanel").innerHTML = items.map(o => `
    <div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:7px;font-size:11px;">
      <span class="${o.done ? "obj-done" : o.active ? "obj-active" : "obj-locked"}" style="flex-shrink:0">
        ${o.done ? "✓" : o.active ? "◈" : "○"}
      </span>
      <span class="${o.done ? "obj-done" : o.active ? "obj-active" : "obj-locked"}">${o.text}</span>
    </div>`).join("");
}


// ─── Endings ─────────────────────────────────────────────────────────────────

function checkEnding() {
  const { plant, survive, evac } = game.objectives;
  survive || (game.objectives.survive = game.sol >= 20);

  if (plant && evac && game.objectives.survive) {
    triggerEnding("full");
  } else if (plant && !crewAlive()) {
    triggerEnding("bitter");
  } else if (evac && !plant) {
    triggerEnding("sacrifice");
  }
}

function crewAlive() {
  return game.crew.some(c => c.health > 0);
}

function triggerEnding(type) {
  if (game.over) return;
  game.over = true;
  game.ending = type;

  const endings = {
    full: {
      glyph: "🏆", title: "ПОВНА ПЕРЕМОГА",
      color: "#3ddc84",
      text: "Рослина виросла. Екіпаж евакуйовано. 20 солів виживання.\nМісія ARES-7 увійде в підручники історії.\nМарс — наш новий дім."
    },
    bitter: {
      glyph: "🌱", title: "ГІРКО-СОЛОДКА ПЕРЕМОГА",
      color: "#ffb347",
      text: "Рослина виросла на Марсі.\nАле екіпаж не вижив, щоб це побачити.\nВони знали, на що йшли."
    },
    sacrifice: {
      glyph: "🚀", title: "ЖЕРТОВНА ПЕРЕМОГА",
      color: "#4ab3ff",
      text: "Екіпаж евакуйовано живими.\nРослина залишилась на Марсі — самотня,\nале жива. Місія буде продовжена."
    },
    defeat: {
      glyph: "☠", title: "МІСІЯ ПРОВАЛЕНА",
      color: "#ff3d3d",
      text: "Ресурси вичерпано. Зв'язок втрачено.\nЕкіпаж не вижив."
    }
  };

  const e = endings[type];
  el("endGlyph").textContent    = e.glyph;
  el("endTitle").textContent    = e.title;
  el("endTitle").style.color    = e.color;
  el("endReason").textContent   = e.text;
  el("finalSol").textContent    = game.sol;
  el("finalRp").textContent     = Math.floor(game.rp);
  el("gameOverScreen").classList.remove("hidden");
}


// ─── Daily crew tick ──────────────────────────────────────────────────────────

function dailyCrewTick() {
  const medlab = hasBuilding("medlab");
  const suit   = hasTech("medsuit");
  game.crew.forEach(c => {
    const regen = medlab ? 1.5 : -0.8;
    c.health = Math.max(0, Math.min(100, c.health + regen * (suit ? 0.5 : 1)));
    c.morale = Math.max(0, Math.min(100, c.morale + Math.random() * 4 - 2));
  });
  if (currentPage === "crew") drawCrew();
}


// ─── Check defeat ─────────────────────────────────────────────────────────────

function checkDefeat() {
  if (game.over) return;
  for (const [key, val] of Object.entries(game.res)) {
    if (val <= 0) { triggerEnding("defeat"); return; }
  }
  if (!crewAlive()) { triggerEnding("defeat"); return; }
  if (game.sol >= 20 && !game.objectives.survive) {
    game.objectives.survive = true;
    log("Ціль виконана: 20 солів виживання!", "upgrade");
    showTicker("✓ 20 солів пережито! Друга ціль досягнута.");
    checkEnding();
  }
}


// ─── Buildings ───────────────────────────────────────────────────────────────

function drawBuildings() {
  el("buildingsGrid").innerHTML = Object.entries(game.buildings).map(([key, b]) => {
    const zoneOk = !b.needs || game.zones.find(z => z.id === b.needs)?.open;
    const canBuy = !b.built && game.rp >= b.cost && zoneOk;
    const btnCls = b.built ? "is-built" : "";
    const btnTxt = b.built ? "✓ Побудовано" : `Побудувати — ${b.cost} RP`;
    let hint = "";
    if (!b.built && !zoneOk)      hint = `<p class="hint">Потрібно відкрити зону на поверхні</p>`;
    else if (!b.built && !canBuy) hint = `<p class="hint">Потрібно ${b.cost} RP (є ${Math.floor(game.rp)})</p>`;
    return `
      <div class="card">
        <div class="card-icon">${b.icon}</div>
        <div class="card-title">${b.name}</div>
        <div class="card-desc">${b.desc}</div>
        ${!b.built ? `<div class="card-cost">${b.cost} RP</div>` : ""}
        <button class="card-btn ${btnCls}" onclick="build('${key}')" ${b.built || !canBuy ? "disabled" : ""}>${btnTxt}</button>
        ${hint}
      </div>`;
  }).join("");
}

function build(key) {
  const b = game.buildings[key];
  const zoneOk = !b.needs || game.zones.find(z => z.id === b.needs)?.open;
  if (b.built || game.rp < b.cost || !zoneOk) return;
  game.rp -= b.cost; b.built = true;
  el("rpDisplay").textContent = Math.floor(game.rp);
  game._dailyUpgraded++;
  log(`Побудовано: ${b.name}`, "upgrade");
  drawBuildings();
}


// ─── Missions ─────────────────────────────────────────────────────────────────

function drawMissions() {
  const evac1Done = game.missions.find(m => m.evacStep === 1)?.done;
  const evac2Done = game.missions.find(m => m.evacStep === 2)?.done;

  const mCards = game.missions.map(m => {
    const reqOk = !m.needs || (m.evacStep === 3
      ? (evac1Done && evac2Done)
      : game.buildings[m.needs]?.built);

    const notEnoughRp = m.rpCost > 0 && game.rp < m.rpCost && !m.done && !m.active && reqOk;
    const pct   = Math.round((m.progress / m.time) * 100);
    const prize = m.type === "rp"
      ? (m.reward > 0 ? `+${m.reward} RP` : "Евакуація")
      : `+${m.reward} ${resLabel[m.type]}`;

    let btnTxt, btnCls, disabled;

    if (m.done) {
      btnTxt = "✓ Виконано"; btnCls = "is-built"; disabled = true;
    } else if (m.active) {
      btnTxt = `${m.time - m.progress}с…`; btnCls = "in-progress"; disabled = true;
    } else if (!reqOk) {
      btnTxt = m.evacStep === 3
        ? "Спочатку виконай evac 1 і 2"
        : `Потрібно: ${game.buildings[m.needs]?.name}`;
      btnCls = ""; disabled = true;
    } else if (notEnoughRp) {
      btnTxt = `Потрібно ${m.rpCost} RP`; btnCls = ""; disabled = true;
    } else {
      btnTxt = m.rpCost > 0 ? `Розпочати — ${m.rpCost} RP` : "Розпочати";
      btnCls = ""; disabled = false;
    }

    const isEvac = !!m.evacStep;

    return `
      <div class="card" ${isEvac ? 'style="border-color:rgba(74,179,255,0.4)"' : ""}>
        <div class="card-icon">${m.icon}</div>
        <div class="card-title" ${isEvac ? 'style="color:#4ab3ff"' : ""}>${m.name}</div>
        <div class="card-desc">${m.desc}</div>
        <div class="mission-reward">${prize}</div>
        ${m.rpCost > 0 && !m.done && !m.active ? `<div class="card-cost" style="color:#ff8877">Вартість запуску: ${m.rpCost} RP</div>` : ""}
        ${m.active ? `<div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>` : ""}
        <button class="card-btn ${btnCls}" onclick="startMission('${m.id}')" ${disabled ? "disabled" : ""}>${btnTxt}</button>
        ${notEnoughRp ? `<p class="hint">Є ${Math.floor(game.rp)} RP — не вистачає ${m.rpCost - Math.floor(game.rp)} RP</p>` : ""}
      </div>`;
  }).join("");

  const daily = game.dailyTasks.length ? `
    <div class="card" style="grid-column:1/-1;border-color:rgba(255,179,71,0.3);background:rgba(255,179,71,0.04)">
      <div class="card-title" style="color:#ffb347">📋 ЗАВДАННЯ — Sol ${game.sol}</div>
      ${game.dailyTasks.map((t, i) => `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:7px 0;border-bottom:1px solid rgba(255,255,255,0.04)">
          <span style="font-size:12px;color:${t.claimed ? "#4a2e20" : t.check() ? "#ffb347" : "#8a5c44"}">${t.claimed ? "✓ " : ""}${t.desc}</span>
          <button class="card-btn" style="width:auto;padding:4px 10px;font-size:10px" onclick="claimDailyTask(${i})" ${t.claimed || !t.check() ? "disabled" : ""}>
            ${t.claimed ? "Отримано" : `+${t.reward} RP`}
          </button>
        </div>`).join("")}
    </div>` : "";

  const trade = game.tradeAvailable && game.tradeOffer ? `
    <div class="card" style="grid-column:1/-1;border-color:rgba(74,179,255,0.4);background:rgba(0,80,160,0.07)">
      <div class="card-icon">🚀</div>
      <div class="card-title" style="color:#4ab3ff">ТОРГОВИЙ КОРАБЕЛЬ NASA</div>
      <div class="card-desc">${game.tradeOffer.desc}</div>
      <div class="card-cost">${game.tradeOffer.cost} RP</div>
      <div style="display:flex;gap:8px">
        <button class="card-btn" onclick="acceptTrade()" ${game.rp < game.tradeOffer.cost ? "disabled" : ""}>✓ Прийняти</button>
        <button class="card-btn" onclick="declineTrade()" style="border-color:#3a1a0a;color:#4a2e20">✗ Відхилити</button>
      </div>
      ${game.rp < game.tradeOffer.cost ? `<p class="hint">Потрібно ${game.tradeOffer.cost} RP</p>` : ""}
    </div>` : "";

  el("missionsGrid").innerHTML = trade + daily + mCards;
}

function startMission(id) {
  const m = game.missions.find(x => x.id === id);
  if (!m || m.active || m.done) return;

  // Перевірка оплати для евакуації екіпажу
  if (m.rpCost > 0) {
    if (game.rp < m.rpCost) {
      log(`Недостатньо RP для "${m.name}". Потрібно ${m.rpCost} RP.`, "warning");
      drawMissions();
      return;
    }
    game.rp -= m.rpCost;
    el("rpDisplay").textContent = Math.floor(game.rp);
    log(`Витрачено ${m.rpCost} RP на запуск "${m.name}".`, "warning");
  }

  m.active = true; m.progress = 0;
  game._dailyMissionStarted++;
  log(`Місія розпочата: ${m.name}`, "warning");
  drawMissions();
}


// ─── Research ─────────────────────────────────────────────────────────────────

function drawResearch() {
  el("researchTree").innerHTML = [1, 2, 3].map(tier => `
    <div>
      <div class="tier-label">РІВЕНЬ ${tier}</div>
      <div class="tier-row">
        ${game.tech.filter(t => t.tier === tier).map(t => {
          const ok  = t.needs.every(id => game.tech.find(x => x.id === id)?.done);
          const can = !t.done && ok && game.rp >= t.cost;
          const cls = t.done ? "is-unlocked" : ok ? "is-available" : "is-locked";
          return `
            <div class="rcard ${cls}">
              <div class="rcard-icon">${t.icon}</div>
              <div class="rcard-name">${t.name}</div>
              <div class="rcard-effect">${t.desc}</div>
              ${t.done
                ? `<div class="rcard-done">✓ Відкрито</div>`
                : `<div class="rcard-cost">${t.cost} RP</div>
                   <button class="rcard-btn" onclick="research('${t.id}')" ${can ? "" : "disabled"}>
                     ${ok ? "ВІДКРИТИ" : "🔒 Спочатку попередні"}
                   </button>`}
            </div>`;
        }).join("")}
      </div>
    </div>`).join("");
}

function research(id) {
  const t = game.tech.find(x => x.id === id);
  if (!t || t.done || game.rp < t.cost) return;
  if (!t.needs.every(nid => game.tech.find(x => x.id === nid)?.done)) return;
  game.rp -= t.cost; t.done = true;
  el("rpDisplay").textContent = Math.floor(game.rp);
  game._dailyUpgraded++;
  log(`Відкрито: ${t.name}`, "upgrade");
  drawResearch();
}


// ─── Crew ─────────────────────────────────────────────────────────────────────

function drawCrew() {
  el("crewGrid").innerHTML = game.crew.map(c => {
    const hCol = c.health < 30 ? "#ff3d3d" : c.health < 60 ? "#ffb347" : "#e85d04";
    const mCol = c.morale < 30 ? "#ff3d3d" : c.morale < 60 ? "#ffb347" : "#886600";
    return `
      <div class="crew-card">
        <div class="crew-avatar">${c.avatar}</div>
        <div class="crew-name">${c.name}</div>
        <div class="crew-role">${c.role}</div>
        <div class="stat-row">
          <div class="stat-labels"><span>Здоров'я</span><span style="color:${hCol}">${Math.round(c.health)}%</span></div>
          <div class="stat-track"><div class="stat-fill health" style="width:${c.health}%"></div></div>
        </div>
        <div class="stat-row">
          <div class="stat-labels"><span>Бойовий дух</span><span style="color:${mCol}">${Math.round(c.morale)}%</span></div>
          <div class="stat-track"><div class="stat-fill morale" style="width:${c.morale}%"></div></div>
        </div>
        <div class="stat-row">
          <div class="stat-labels"><span>Навички</span><span style="color:#4ab3ff">${Math.round(c.skill)}%</span></div>
          <div class="stat-track"><div class="stat-fill skill" style="width:${c.skill}%"></div></div>
        </div>
        <div class="crew-task">◈ ${c.task}</div>
      </div>`;
  }).join("");
}


// ─── Module modal ─────────────────────────────────────────────────────────────

function openModule(key) {
  const mod = game.modules[key];
  if (!mod) return;
  game.paused = true;
  const cost = upgCost(mod.level);
  const maxed = mod.level >= 5;
  const canUpgrade = !maxed && game.rp >= cost;
  el("modalTitle").textContent = mod.name;
  el("modalBody").innerHTML = `
    <p><strong>Статус:</strong> <span class="modal-status ${mod.crisis ? "critical" : "ok"}">${mod.crisis ? "Криза" : "Норма"}</span></p>
    <p><strong>Рівень:</strong> ${lvlNames[mod.level]} (${mod.level}/5)</p>
    ${mod.crisis ? `<p>${crises[mod.crisis].desc}</p>` : ""}
    <hr>
    ${mod.crisis ? `<button class="btn-crisis" onclick="fixCrisis('${key}')">⚡ УСУНУТИ ПРОБЛЕМУ</button>` : ""}
    ${maxed
      ? `<p style="color:#ffb347;font-size:12px;margin-top:10px">★ Максимальний рівень</p>`
      : `<button class="btn-upgrade" onclick="upgrade('${key}')" ${canUpgrade ? "" : "disabled"}>
           ▲ Покращити до рівня ${mod.level + 1} (${cost} RP)
         </button>
         ${!canUpgrade ? `<p class="hint" style="margin-top:6px">Потрібно ${cost} RP, є ${Math.floor(game.rp)}</p>` : ""}`}
  `;
  el("modal").classList.add("open");
}

function fixCrisis(key) {
  game.modules[key].crisis = null;
  game._dailyCrisisFixed++;
  log(`Кризу усунено: ${game.modules[key].name}`, "ok");
  closeModal();
}

function upgrade(key) {
  const mod = game.modules[key];
  const cost = upgCost(mod.level);
  if (game.rp < cost || mod.level >= 5) return;
  game.rp -= cost; mod.level++;
  el("rpDisplay").textContent = Math.floor(game.rp);
  game._dailyUpgraded++;
  log(`${mod.name} → Lv${mod.level}`, "upgrade");
  closeModal();
}

function closeModal() {
  el("modal").classList.remove("open");
  game.paused = false;
  drawModuleList(); updatePins();
}

el("modal").addEventListener("click", e => {
  if (e.target === el("modal") || e.target.classList.contains("modal-close")) closeModal();
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && el("modal").classList.contains("open")) closeModal();
});
document.querySelectorAll(".pin").forEach(pin => {
  pin.addEventListener("click", () => openModule(pin.dataset.module));
  pin.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openModule(pin.dataset.module); }
  });
});


// ─── Restart ──────────────────────────────────────────────────────────────────

function restart() {
  game.sol = 1; game.rp = 0;
  game.over = false; game.ending = null; game.paused = false;
  game.hour = 14; game.min = 37;
  Object.assign(game.res, { oxygen: 78, water: 54, energy: 63 });
  Object.values(game.modules).forEach(m => { m.status = "ok"; m.level = 1; m.crisis = null; });
  Object.values(game.buildings).forEach(b => { b.built = false; });
  game.tech.forEach(t => { t.done = false; });
  game.missions.forEach(m => { m.done = false; m.active = false; m.progress = 0; });
  game.zones.forEach(z => { z.open = z.id === "base_area"; z.unlocking = false; z.progress = 0; });
  game.crew.forEach(c => { c.health = 80 + Math.random() * 15; c.morale = 70 + Math.random() * 20; });
  Object.assign(game.zoneBonuses, { waterRegen: 0, rpRegen: 0, energyBoost: 1, rpLabBoost: 1 });
  Object.assign(game.objectives, { plant: false, survive: false, evac: false });
  Object.assign(game.plant, { stage: 1, stageProgress: 0, growing: false });
  game.dailyTasks = []; game.tradeAvailable = false; game.tradeOffer = null; game.tradeNextSol = 6;
  game._dailyCrisisFixed = 0; game._dailyMissionStarted = 0; game._dailyUpgraded = 0; game._dailyZoneOpened = 0;

  el("solDisplay").textContent = 1;
  el("rpDisplay").textContent  = 0;
  el("eventLog").innerHTML     = "";
  el("gameOverScreen").classList.add("hidden");

  goTo("home");
  drawResources(); drawModuleList(); updatePins(); drawObjectives();
  generateDailyTasks();
  log("Місія розпочалась. Удачі, командире.", "ok");
  showTicker(tickerLines[0]);
  buildIntro();
}

el("restartBtn").addEventListener("click", restart);


// ─── Main loop ────────────────────────────────────────────────────────────────

function loop() {
  if (game.over || game.paused) return;
  tickTime();
  tickResources();
  maybeTriggerCrisis();
  tickMissions();
  tickExplore();
  tickPlant();
  checkDefeat();
  drawResources();
  drawModuleList();
  updatePins();
  drawObjectives();
}


// ─── Boot ─────────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  game.plant.stage = 1;

  drawResources(); drawModuleList(); updatePins();
  generateDailyTasks(); drawObjectives();
  log("Місія розпочалась. Удачі, командире.", "ok");
  showTicker(tickerLines[0]);
  buildIntro();

  setInterval(loop, 1000);
});
