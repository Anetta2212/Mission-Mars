const el = (id) => document.getElementById(id);

const game = {
  sol: 1,
  rp: 0,
  paused: false,
  over: false,
  won: false,
  hour: 14,
  min: 37,

  res: { oxygen: 78, water: 54, energy: 63 },

  modules: {
    habitat: {
      name: "Житловий модуль",
      status: "ok",
      level: 1,
      crisis: null,
      drain: { oxygen: 0.04 },
      crises: ["fire", "leak"],
    },
    greenhouse: {
      name: "Оранжерея",
      status: "ok",
      level: 1,
      crisis: null,
      drain: { water: 0.03 },
      crises: ["drought", "pest"],
    },
    solar: {
      name: "Сонячні панелі",
      status: "ok",
      level: 1,
      crisis: null,
      drain: { energy: 0 },
      crises: ["dust_storm", "malfunction"],
    },
    lab: {
      name: "Лабораторія",
      status: "ok",
      level: 1,
      crisis: null,
      drain: { energy: 0.02 },
      crises: ["overload", "leak"],
    },
  },

  buildings: {
    recycler: {
      name: "Переробник води",
      icon: "💧",
      cost: 80,
      built: false,
      desc: "Повертає воду з відходів. +0.04 води/тік",
    },
    garage: {
      name: "Гараж роверів",
      icon: "🚗",
      cost: 120,
      built: false,
      desc: "Розблоковує місії на поверхні",
    },
    medlab: {
      name: "Медичний блок",
      icon: "⚕️",
      cost: 150,
      built: false,
      desc: "Екіпаж відновлює здоров'я щодня",
    },
    antenna: {
      name: "Антена зв'язку",
      icon: "📡",
      cost: 100,
      built: false,
      desc: "+20% RP від лабораторії",
    },
    greenhouse2: {
      name: "Друга оранжерея",
      icon: "🌿",
      cost: 200,
      built: false,
      desc: "Оранжерея виробляє +0.03 води/тік",
    },
    battery: {
      name: "Акумуляторний блок",
      icon: "🔋",
      cost: 160,
      built: false,
      desc: "Зберігає енергію вдень, віддає вночі (+0.04/тік вночі)",
    },
    reactor: {
      name: "Резервний реактор",
      icon: "⚛️",
      cost: 300,
      built: false,
      desc: "Енергія не падає нижче 20%",
    },
    workshop: {
      name: "Ремонтний відсік",
      icon: "🔧",
      cost: 180,
      built: false,
      desc: "Спрощує усунення криз",
    },
    ice_drill: {
      name: "Льодобур",
      icon: "🧊",
      cost: 250,
      built: false,
      desc: "Видобуває підземний лід. +0.08 води/тік",
      needs: "crater_north",
    },
  },

  missions: [
    {
      id: "survey",
      name: "Розвідка кратера",
      icon: "🗺️",
      desc: "Вивчити рельєф на схід від бази.",
      time: 30,
      reward: 80,
      type: "rp",
      done: false,
      active: false,
      progress: 0,
      needs: null,
    },
    {
      id: "sample",
      name: "Збір ґрунту",
      icon: "🧪",
      desc: "Зібрати п'ять зразків реголіту.",
      time: 20,
      reward: 55,
      type: "rp",
      done: false,
      active: false,
      progress: 0,
      needs: null,
    },
    {
      id: "repair",
      name: "Ремонт труби",
      icon: "🔩",
      desc: "Замінити зовнішній водяний клапан.",
      time: 15,
      reward: 20,
      type: "water",
      done: false,
      active: false,
      progress: 0,
      needs: null,
    },
    {
      id: "rover",
      name: "Рейд на ровері",
      icon: "🚗",
      desc: "Доїхати до аномалії за три км.",
      time: 45,
      reward: 130,
      type: "rp",
      done: false,
      active: false,
      progress: 0,
      needs: "garage",
    },
    {
      id: "meteor",
      name: "Аналіз метеорита",
      icon: "☄️",
      desc: "Дослідити уламки поблизу бази.",
      time: 40,
      reward: 100,
      type: "rp",
      done: false,
      active: false,
      progress: 0,
      needs: null,
    },
    {
      id: "oxygen2",
      name: "Запуск генератора O₂",
      icon: "💨",
      desc: "Увімкнути резервний кисневий блок.",
      time: 25,
      reward: 25,
      type: "oxygen",
      done: false,
      active: false,
      progress: 0,
      needs: "medlab",
    },
  ],

  tech: [
    {
      id: "atmo",
      tier: 1,
      name: "Атмосферний фільтр",
      icon: "💨",
      desc: "Кисень витрачається на 15% повільніше",
      cost: 80,
      done: false,
      needs: [],
    },
    {
      id: "hydro",
      tier: 1,
      name: "Гідропоніка",
      icon: "🌱",
      desc: "Оранжерея виробляє воду замість споживання",
      cost: 80,
      done: false,
      needs: [],
    },
    {
      id: "solar2",
      tier: 1,
      name: "Покращені батареї",
      icon: "⚡",
      desc: "Сонячні панелі дають на 20% більше",
      cost: 90,
      done: false,
      needs: [],
    },
    {
      id: "medsuit",
      tier: 2,
      name: "Захисний костюм",
      icon: "🧑‍🚀",
      desc: "Здоров'я екіпажу падає вдвічі повільніше",
      cost: 120,
      done: false,
      needs: ["atmo"],
    },
    {
      id: "ai",
      tier: 2,
      name: "ШІ-асистент",
      icon: "🤖",
      desc: "Лабораторія дає на 30% більше RP",
      cost: 150,
      done: false,
      needs: ["hydro", "solar2"],
    },
    {
      id: "fusion",
      tier: 3,
      name: "Мікрореактор",
      icon: "⚛️",
      desc: "Енергія не падає нижче 10%",
      cost: 250,
      done: false,
      needs: ["ai"],
    },
  ],

  zones: [
    {
      id: "base_area",
      name: "Периметр бази",
      icon: "🏠",
      desc: "Найближча зона. Вже досліджена.",
      bonus: "Стартова зона",
      bonusType: null,
      bonusValue: 0,
      open: true,
      unlocking: false,
      progress: 0,
      cost: 0,
      needs: null,
      top: 1,
      left: 1,
    },
    {
      id: "crater_north",
      name: "Північний кратер",
      icon: "🌑",
      desc: "Стародавній кратер. Можливі поклади льоду.",
      bonus: "Розблоковує Льодобур",
      bonusType: "unlock_building",
      bonusValue: "ice_drill",
      open: false,
      unlocking: false,
      progress: 0,
      cost: 60,
      needs: null,
      top: 0,
      left: 1,
    },
    {
      id: "lava_field",
      name: "Лавове поле",
      icon: "🌋",
      desc: "Застигла лава, багато мінералів.",
      bonus: "+50 RP",
      bonusType: "rp",
      bonusValue: 50,
      open: false,
      unlocking: false,
      progress: 0,
      cost: 70,
      needs: null,
      top: 0,
      left: 2,
    },
    {
      id: "dust_plain",
      name: "Пилова рівнина",
      icon: "🌪",
      desc: "Відкрита рівнина для сонячних панелей.",
      bonus: "+15% генерації енергії",
      bonusType: "energy_boost",
      bonusValue: 0,
      open: false,
      unlocking: false,
      progress: 0,
      cost: 80,
      needs: "lava_field",
      top: 0,
      left: 3,
    },
    {
      id: "canyon_west",
      name: "Західний каньйон",
      icon: "🏔",
      desc: "Глибокий каньйон з відкладами мінералів.",
      bonus: "+30 води",
      bonusType: "water",
      bonusValue: 30,
      open: false,
      unlocking: false,
      progress: 0,
      cost: 90,
      needs: "base_area",
      top: 1,
      left: 0,
    },
    {
      id: "ice_valley",
      name: "Льодяна долина",
      icon: "❄️",
      desc: "Підземний лід близько до поверхні.",
      bonus: "+0.05 води/тік",
      bonusType: "water_regen",
      bonusValue: 0,
      open: false,
      unlocking: false,
      progress: 0,
      cost: 120,
      needs: "crater_north",
      top: 1,
      left: 2,
    },
    {
      id: "mineral_ridge",
      name: "Мінеральний хребет",
      icon: "💎",
      desc: "Унікальні мінерали для досліджень.",
      bonus: "+0.3 RP/тік",
      bonusType: "rp_regen",
      bonusValue: 0,
      open: false,
      unlocking: false,
      progress: 0,
      cost: 100,
      needs: "lava_field",
      top: 1,
      left: 3,
    },
    {
      id: "shelter_ruins",
      name: "Покинутий зонд",
      icon: "🛸",
      desc: "Уламки старого марсохода NASA.",
      bonus: "+80 RP",
      bonusType: "rp",
      bonusValue: 80,
      open: false,
      unlocking: false,
      progress: 0,
      cost: 110,
      needs: "canyon_west",
      top: 2,
      left: 0,
    },
    {
      id: "south_plateau",
      name: "Південне плато",
      icon: "🗻",
      desc: "Висока рівнина для сонячних панелей.",
      bonus: "+25% RP від лабораторії",
      bonusType: "rp_lab_boost",
      bonusValue: 0,
      open: false,
      unlocking: false,
      progress: 0,
      cost: 150,
      needs: "canyon_west",
      top: 2,
      left: 1,
    },
    {
      id: "deep_crater",
      name: "Глибокий кратер",
      icon: "🕳",
      desc: "Найглибший кратер у районі.",
      bonus: "+60 кисню",
      bonusType: "oxygen",
      bonusValue: 60,
      open: false,
      unlocking: false,
      progress: 0,
      cost: 130,
      needs: "crater_north",
      top: 2,
      left: 2,
    },
    {
      id: "far_east",
      name: "Далекий схід",
      icon: "🌅",
      desc: "Невідома зона далеко від бази.",
      bonus: "+150 RP",
      bonusType: "rp",
      bonusValue: 150,
      open: false,
      unlocking: false,
      progress: 0,
      cost: 200,
      needs: "mineral_ridge",
      top: 2,
      left: 3,
    },
  ],

  crew: [
    {
      id: "koval",
      name: "Олена Коваль",
      role: "Командир",
      avatar: "👩‍🚀",
      health: 92,
      morale: 88,
      skill: 85,
      task: "Управління базою",
    },
    {
      id: "petrov",
      name: "Дмитро Петров",
      role: "Інженер",
      avatar: "👨‍🔧",
      health: 78,
      morale: 72,
      skill: 90,
      task: "Технічне обслуговування",
    },
    {
      id: "sirenko",
      name: "Яна Сіренко",
      role: "Лікар",
      avatar: "👩‍⚕️",
      health: 95,
      morale: 80,
      skill: 88,
      task: "Медичний блок",
    },
    {
      id: "bondar",
      name: "Ігор Бондар",
      role: "Геолог",
      avatar: "👨‍🔬",
      health: 65,
      morale: 60,
      skill: 82,
      task: "Польові дослідження",
    },
    {
      id: "lysenko",
      name: "Марія Лисенко",
      role: "Біолог",
      avatar: "👩‍🌾",
      health: 88,
      morale: 91,
      skill: 79,
      task: "Оранжерея",
    },
    {
      id: "kravets",
      name: "Сергій Кравець",
      role: "Пілот",
      avatar: "👨‍✈️",
      health: 82,
      morale: 66,
      skill: 94,
      task: "Чекає на завдання",
    },
  ],

  zoneBonuses: { waterRegen: 0, rpRegen: 0, energyBoost: 1, rpLabBoost: 1 },

  // Щоденні завдання
  dailyTasks: [],
  dailyTasksCompleted: 0,

  // Торгівля
  tradeAvailable: false,
  tradeNextSol: 8,
  tradeOffer: null,
};

// Список можливих щоденних завдань
const DAILY_TASK_POOL = [
  {
    id: "fix_crisis",
    desc: "Усунь будь-яку кризу",
    reward: 25,
    check: () => game._dailyCrisisFixed > 0,
  },
  {
    id: "start_mission",
    desc: "Запусти будь-яку місію",
    reward: 20,
    check: () => game._dailyMissionStarted > 0,
  },
  {
    id: "upgrade_mod",
    desc: "Покращ будь-який модуль",
    reward: 30,
    check: () => game._dailyUpgraded > 0,
  },
  {
    id: "keep_oxygen",
    desc: "Утримай кисень вище 60% 1 Sol",
    reward: 20,
    check: () => game.res.oxygen >= 60,
  },
  {
    id: "keep_water",
    desc: "Утримай воду вище 50% 1 Sol",
    reward: 20,
    check: () => game.res.water >= 50,
  },
  {
    id: "keep_energy",
    desc: "Утримай енергію вище 40% 1 Sol",
    reward: 15,
    check: () => game.res.energy >= 40,
  },
  {
    id: "explore_zone",
    desc: "Відкрий будь-яку зону поверхні",
    reward: 35,
    check: () => game._dailyZoneOpened > 0,
  },
  {
    id: "survive_sol",
    desc: "Просто вижити цей Sol",
    reward: 15,
    check: () => true,
  },
];

// Лічильники для завдань 
game._dailyCrisisFixed = 0;
game._dailyMissionStarted = 0;
game._dailyUpgraded = 0;
game._dailyZoneOpened = 0;

// Торгові пропозиції
const TRADE_OFFERS = [
  { desc: "Контейнер з водою (+40 💧)", cost: 50, res: "water", amount: 40 },
  { desc: "Балони з киснем (+35 O₂)", cost: 45, res: "oxygen", amount: 35 },
  { desc: "Сонячні батареї (+30 ⚡)", cost: 40, res: "energy", amount: 30 },
  { desc: "Науковий набір (+70 RP)", cost: 30, res: "rp", amount: 70 },
  { desc: "Великий вантаж: вода (+60 💧)", cost: 90, res: "water", amount: 60 },
  { desc: "Аварійний кисень (+50 O₂)", cost: 70, res: "oxygen", amount: 50 },
];

// Головні цілі місії
const OBJECTIVES = [
  {
    id: "survive_30",
    desc: "Вижити 30 солів",
    done: false,
    check: () => game.sol >= 30,
  },
  {
    id: "all_zones",
    desc: "Відкрити 8+ зон поверхні",
    done: false,
    check: () => game.zones.filter((z) => z.open).length >= 8,
  },
  {
    id: "build_4",
    desc: "Побудувати 4+ будівлі",
    done: false,
    check: () =>
      Object.values(game.buildings).filter((b) => b.built).length >= 4,
  },
  {
    id: "all_tech_t1",
    desc: "Відкрити всі технології 1-го рівня",
    done: false,
    check: () => game.tech.filter((t) => t.tier === 1).every((t) => t.done),
  },
  {
    id: "res_full",
    desc: "Мати всі ресурси вище 70% одночасно",
    done: false,
    check: () => Object.values(game.res).every((v) => v >= 70),
  },
  {
    id: "rp_500",
    desc: "Накопичити 500 RP",
    done: false,
    check: () => game.rp >= 500,
  },
];

const crises = {
  fire: {
    label: "🔥 Пожежа!",
    desc: "Займання в житловому модулі.",
    extra: { oxygen: 0.3, energy: 0.1 },
  },
  leak: {
    label: "💧 Витік кисню!",
    desc: "Пошкоджена герметизація — кисень іде.",
    extra: { oxygen: 0.25 },
  },
  drought: {
    label: "🌵 Посуха!",
    desc: "Система поливу відмовила.",
    extra: { water: 0.25 },
  },
  pest: {
    label: "🐛 Шкідники!",
    desc: "Комахи потрапили в оранжерею.",
    extra: { water: 0.12, energy: 0.08 },
  },
  dust_storm: {
    label: "🌪 Пилова буря!",
    desc: "Буря засипала сонячні панелі.",
    extra: { energy: 0.35 },
  },
  malfunction: {
    label: "⚡ Відмова системи!",
    desc: "Збій в енергосистемі.",
    extra: { energy: 0.3 },
  },
  overload: {
    label: "🔌 Перевантаження!",
    desc: "Лабораторія споживає занадто багато.",
    extra: { energy: 0.2 },
  },
};

const resLabel = { oxygen: "Кисень", water: "Вода", energy: "Енергія" };
const lvlNames = [
  "",
  "Базовий",
  "Покращений",
  "Розширений",
  "Передовий",
  "Елітний",
];
const upgCost = (lvl) => lvl * 80;
const EXPLORE_TIME = 45;
const isNight = () => game.hour >= 18 || game.hour < 6;

let currentPage = "home";

// Навігація

function goTo(page) {
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));
  document
    .querySelectorAll("nav a")
    .forEach((a) => a.classList.remove("active"));
  el(`page-${page}`).classList.add("active");
  document.querySelector(`nav a[data-page="${page}"]`).classList.add("active");

  const headers = {
    home: ["ГОЛОВНА БАЗА ARES-7", "Сектор: Hellas Planitia"],
    buildings: ["БУДІВЛІ", "Розширення бази"],
    missions: ["МІСІЇ", "Польові операції"],
    research: ["ДОСЛІДЖЕННЯ", "Технології"],
    crew: ["ЕКІПАЖ", "Персонал бази"],
    explore: ["ПОВЕРХНЯ МАРСА", "Дослідження нових зон"],
  };
  el("pageTitle").textContent = headers[page][0];
  el("pageSubtitle").textContent = headers[page][1];
  currentPage = page;

  if (page === "buildings") drawBuildings();
  if (page === "missions") drawMissions();
  if (page === "research") drawResearch();
  if (page === "crew") drawCrew();
  if (page === "explore") drawExplore();
}

document.querySelectorAll("nav a[data-page]").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    goTo(link.dataset.page);
  });
});

// Бігучий рядок

const tickerLines = [
  "Зв'язок із Землею: затримка 20 хв • Всі системи в автономному режимі",
  "Температура поверхні: -42°C • Вітер: 18 м/с",
  "Екіпаж: 4 з 6 активні • Наступна ротація: Sol 34",
  "Рекомендація NASA: тримайте ресурси вище 30%",
  "Марсіанський пил: помірний • Видимість: 4 км",
  "NASA очікує звіт на Sol 10",
];
let tickerIdx = 0;

function showTicker(text) {
  el("ticker").innerHTML = `<span class="ticker-text">${text}</span>`;
  setTimeout(() => {
    tickerIdx = (tickerIdx + 1) % tickerLines.length;
    showTicker(tickerLines[tickerIdx]);
  }, 15000);
}

// Лог

const pad = (n) => String(n).padStart(2, "0");

function log(text, type = "") {
  const time = `Sol ${game.sol} ${pad(game.hour)}:${pad(game.min)}`;
  const row = document.createElement("div");
  row.className = `log-entry ${type}`;
  row.textContent = `[${time}] ${text}`;
  el("eventLog").prepend(row);
  while (el("eventLog").children.length > 30) el("eventLog").lastChild.remove();
}

// Ресурси

function drawResources() {
  el("resourceBars").innerHTML = [
    { key: "oxygen", label: "Кисень" },
    { key: "water", label: "Вода" },
    { key: "energy", label: "Енергія" },
  ]
    .map(({ key, label }) => {
      const val = Math.max(0, Math.min(100, game.res[key]));
      const pct = Math.round(val);
      const cls = val < 25 ? "low" : val < 50 ? "medium" : "";
      const col = val < 25 ? "#ff4422" : val < 50 ? "#ffaa00" : "#ffaa66";
      const emergCost = { oxygen: 30, water: 25, energy: 20 }[key];
      return `
      <div class="res-bar">
        <div class="res-labels">
          <span>${label}</span>
          <span class="res-pct" style="color:${col}">${pct}%</span>
        </div>
        <div class="res-track"><div class="res-fill ${cls}" style="width:${pct}%"></div></div>
        ${val < 40 ? `<button class="emerg-btn" onclick="emergencyRefill('${key}')" title="Аварійне поповнення (${emergCost} RP)">⚡ +20 за ${emergCost} RP</button>` : ""}
      </div>`;
    })
    .join("");
}

// Аварійне поповнення

function emergencyRefill(key) {
  const cost = { oxygen: 30, water: 25, energy: 20 }[key];
  if (game.rp < cost) {
    log(`Не вистачає RP для аварійного поповнення.`, "warning");
    return;
  }
  game.rp -= cost;
  game.res[key] = Math.min(100, game.res[key] + 20);
  el("rpDisplay").textContent = Math.floor(game.rp);
  log(`Аварійне поповнення: ${resLabel[key]} +20`, "ok");
  drawResources();
}

// Список модулів

function drawModuleList() {
  el("moduleList").innerHTML = Object.entries(game.modules)
    .map(([key, mod]) => {
      const text = mod.crisis
        ? "⚠ КРИЗА"
        : mod.status === "ok"
          ? "Норма"
          : "Офлайн";
      const cls = mod.crisis
        ? "crisis"
        : mod.status === "ok"
          ? "ok"
          : "offline";
      return `
      <div class="module-row" onclick="openModule('${key}')">
        <span>${mod.name}</span>
        <span class="module-lv">Lv${mod.level}</span>
        <span class="module-status ${cls}">${text}</span>
      </div>`;
    })
    .join("");
}

// Піни

function updatePins() {
  Object.entries(game.modules).forEach(([key, mod]) => {
    const dot = el(`pin-${key}`);
    const alert = el(`alert-${key}`);
    if (!dot) return;
    dot.classList.toggle("is-crisis", !!mod.crisis);
    alert.classList.toggle("hidden", !mod.crisis);
  });
  const count = Object.values(game.modules).filter((m) => m.crisis).length;
  const homeLink = document.querySelector("nav a[data-page='home']");
  let badge = homeLink.querySelector(".nav-alert");
  if (count > 0) {
    if (!badge) {
      badge = document.createElement("span");
      badge.className = "nav-alert";
      homeLink.appendChild(badge);
    }
    badge.textContent = count;
  } else if (badge) badge.remove();
}

// Годинник

function tickTime() {
  game.min++;
  if (game.min >= 60) {
    game.min = 0;
    game.hour++;
  }
  if (game.hour >= 25) {
    game.hour = 0;
    game.sol++;
    el("solDisplay").textContent = game.sol;
    log(`Sol ${game.sol} розпочався.`, "ok");
    onNewSol();
  }
  el("clock").textContent = `${pad(game.hour)}:${pad(game.min)}`;
}

function onNewSol() {
  dailyCrewTick();
  generateDailyTasks();
  checkTradeArrival();
  // скидання лічильника завдань
  game._dailyCrisisFixed = 0;
  game._dailyMissionStarted = 0;
  game._dailyUpgraded = 0;
  game._dailyZoneOpened = 0;
}

// Витрата ресурсів

function tickResources() {
  const r = game.res;
  const b = game.zoneBonuses;
  const night = isNight();

  const atmoMul = hasTech("atmo") ? 0.85 : 1;
  const hydroOn = hasTech("hydro");
  const solarMul = hasTech("solar2") ? 1.2 : 1;
  const aiMul = hasTech("ai") ? 1.3 : 1;
  const antMul = hasBuilding("antenna") ? 1.2 : 1;

  Object.values(game.modules).forEach((mod) => {
    if (mod.status === "offline") return;
    const lvlBonus = 1 - (mod.level - 1) * 0.05;

    if (mod.drain.oxygen != null) {
      let d = mod.drain.oxygen * lvlBonus * atmoMul;
      if (mod.crisis) d += crises[mod.crisis].extra.oxygen || 0;
      r.oxygen -= d;
    }

    if (mod.drain.water != null) {
      if (mod === game.modules.greenhouse) {
        if (hydroOn || hasBuilding("greenhouse2")) {
          r.water +=
            (0.03 + (hasBuilding("greenhouse2") ? 0.03 : 0)) *
            (mod.level * 0.2 + 0.8);
        } else {
          let d = mod.drain.water * lvlBonus;
          if (mod.crisis) d += crises[mod.crisis].extra.water || 0;
          r.water -= d;
        }
      }
    }

    if (mod.drain.energy > 0) {
      let d = mod.drain.energy * lvlBonus;
      if (mod.crisis) d += crises[mod.crisis].extra.energy || 0;
      r.energy -= d;
    }
  });

  // Сонячні панелі
  const solar = game.modules.solar;
  if (!solar.crisis && solar.status !== "offline" && !night) {
    r.energy +=
      0.06 * (1 + (solar.level - 1) * 0.12) * solarMul * b.energyBoost;
  }

  // Акумулятор — вночі повертає збережену енергію
  if (hasBuilding("battery") && night) r.energy += 0.04;

  // Переробник води і льодобур
  if (hasBuilding("recycler")) r.water += 0.04;
  if (hasBuilding("ice_drill")) r.water += 0.08;

  // Бонуси від зон
  r.water += b.waterRegen;

  if (hasTech("fusion")) r.energy = Math.max(10, r.energy);
  if (hasBuilding("reactor")) r.energy = Math.max(20, r.energy);

  // RP від лабораторії
  const lab = game.modules.lab;
  if (!lab.crisis && lab.status !== "offline") {
    game.rp +=
      (0.5 + lab.level * 0.25) *
        (r.energy / 100) *
        aiMul *
        antMul *
        b.rpLabBoost +
      b.rpRegen;
    el("rpDisplay").textContent = Math.floor(game.rp);
  }

  Object.keys(r).forEach((k) => {
    r[k] = Math.max(0, Math.min(100, r[k]));
  });
}

const hasTech = (id) => game.tech.find((t) => t.id === id)?.done;
const hasBuilding = (id) => game.buildings[id]?.built;

// Кризи

function maybeTriggerCrisis() {
  const chance = 0.006 + game.sol * 0.0002;
  if (Math.random() > chance) return;
  const freeKeys = Object.keys(game.modules).filter(
    (k) => !game.modules[k].crisis,
  );
  if (!freeKeys.length) return;
  const key = freeKeys[Math.floor(Math.random() * freeKeys.length)];
  const mod = game.modules[key];
  const type = mod.crises[Math.floor(Math.random() * mod.crises.length)];
  mod.crisis = type;
  log(`${crises[type].label} — ${mod.name}`, "crisis");
  showTicker(`⚠ ${crises[type].label} у "${mod.name}". Клікни на піні!`);
}

// Місії

function tickMissions() {
  game.missions.forEach((m) => {
    if (!m.active || m.done) return;
    m.progress = Math.min(m.time, m.progress + 1);
    if (m.progress >= m.time) finishMission(m);
  });
  if (currentPage === "missions") drawMissions();
}

function finishMission(m) {
  m.done = true;
  m.active = false;
  if (m.type === "rp") {
    game.rp += m.reward;
    el("rpDisplay").textContent = Math.floor(game.rp);
    log(`"${m.name}" виконано! +${m.reward} RP`, "upgrade");
  } else {
    game.res[m.type] = Math.min(100, game.res[m.type] + m.reward);
    log(`"${m.name}" виконано! +${m.reward} ${resLabel[m.type]}`, "upgrade");
  }
}

// Дослідження зон

function tickExplore() {
  let changed = false;
  game.zones.forEach((zone) => {
    if (!zone.unlocking || zone.open) return;
    zone.progress++;
    if (zone.progress >= EXPLORE_TIME) {
      zone.open = true;
      zone.unlocking = false;
      applyZoneBonus(zone);
      game._dailyZoneOpened++;
      log(`Зону "${zone.name}" відкрито! ${zone.bonus}`, "upgrade");
      changed = true;
    }
  });
  if (changed || game.zones.some((z) => z.unlocking)) {
    if (currentPage === "explore") drawExplore();
  }
}

function applyZoneBonus(zone) {
  const b = game.zoneBonuses;
  switch (zone.bonusType) {
    case "rp":
      game.rp += zone.bonusValue;
      el("rpDisplay").textContent = Math.floor(game.rp);
      break;
    case "water":
      game.res.water = Math.min(100, game.res.water + zone.bonusValue);
      break;
    case "oxygen":
      game.res.oxygen = Math.min(100, game.res.oxygen + zone.bonusValue);
      break;
    case "water_regen":
      b.waterRegen += 0.05;
      break;
    case "rp_regen":
      b.rpRegen += 0.3;
      break;
    case "energy_boost":
      b.energyBoost += 0.25;
      break;
    case "rp_lab_boost":
      b.rpLabBoost += 0.25;
      break;
  }
}

function startExplore(zoneId) {
  const zone = game.zones.find((z) => z.id === zoneId);
  if (!zone || zone.open || zone.unlocking || game.rp < zone.cost) return;
  if (zone.needs && !game.zones.find((z) => z.id === zone.needs)?.open) return;
  game.rp -= zone.cost;
  el("rpDisplay").textContent = Math.floor(game.rp);
  zone.unlocking = true;
  zone.progress = 0;
  log(`Розпочато дослідження: "${zone.name}"`, "warning");
  drawExplore();
}

function drawExplore() {
  const cells = Array(3)
    .fill(null)
    .map(() => Array(4).fill(null));
  game.zones.forEach((z) => {
    cells[z.top][z.left] = z;
  });

  el("exploreMap").innerHTML = cells
    .flat()
    .map((zone) => {
      if (!zone)
        return `<div class="zone is-locked"><div class="zone-fog">▓</div></div>`;

      if (zone.open)
        return `
      <div class="zone is-open">
        <div><div class="zone-icon">${zone.icon}</div><div class="zone-name">${zone.name}</div><div class="zone-bonus">${zone.desc}</div></div>
        <div class="zone-explored">✓ ${zone.bonus}</div>
      </div>`;

      if (zone.unlocking) {
        const pct = Math.round((zone.progress / EXPLORE_TIME) * 100);
        return `
        <div class="zone is-unlocking">
          <div><div class="zone-icon">${zone.icon}</div><div class="zone-name">${zone.name}</div><div class="zone-bonus">${zone.desc}</div></div>
          <div>
            <div class="zone-cost">Досліджується… ${EXPLORE_TIME - zone.progress}с</div>
            <div class="zone-progress"><div class="zone-progress-fill" style="width:${pct}%"></div></div>
          </div>
        </div>`;
      }

      const parentOpen =
        !zone.needs || game.zones.find((z) => z.id === zone.needs)?.open;
      const canAfford = game.rp >= zone.cost;

      if (!parentOpen)
        return `
      <div class="zone is-locked">
        <div class="zone-fog">?</div>
        <div><div class="zone-name">${zone.name}</div><div class="zone-cost">Відкрий сусідню зону</div></div>
      </div>`;

      return `
      <div class="zone ${canAfford ? "is-available" : "is-locked"}" onclick="${canAfford ? `startExplore('${zone.id}')` : ""}">
        <div><div class="zone-icon">${zone.icon}</div><div class="zone-name">${zone.name}</div><div class="zone-bonus">${zone.desc}</div></div>
        <div>
          <div class="zone-bonus" style="color:#aaa">${zone.bonus}</div>
          <div class="zone-cost">${zone.cost} RP${!canAfford ? ` (є ${Math.floor(game.rp)})` : ""}</div>
        </div>
      </div>`;
    })
    .join("");
}

// Щоденні завдання

function generateDailyTasks() {
  // вибираємо 3 випадкові завдання
  const shuffled = [...DAILY_TASK_POOL].sort(() => Math.random() - 0.5);
  game.dailyTasks = shuffled.slice(0, 3).map((t) => ({ ...t, claimed: false }));
  game.dailyTasksCompleted = 0;
  if (currentPage === "missions") drawMissions();
  log(`Нові щоденні завдання на Sol ${game.sol}.`, "warning");
}

function claimDailyTask(idx) {
  const task = game.dailyTasks[idx];
  if (!task || task.claimed || !task.check()) return;
  task.claimed = true;
  game.rp += task.reward;
  el("rpDisplay").textContent = Math.floor(game.rp);
  log(`Завдання виконано: "${task.desc}" +${task.reward} RP`, "upgrade");
  drawMissions();
}

// оргівля із Землею

function checkTradeArrival() {
  if (game.sol >= game.tradeNextSol) {
    game.tradeAvailable = true;
    game.tradeOffer =
      TRADE_OFFERS[Math.floor(Math.random() * TRADE_OFFERS.length)];
    game.tradeNextSol = game.sol + 6 + Math.floor(Math.random() * 4);
    log(
      `Торговий корабель прибув! Пропозиція: ${game.tradeOffer.desc}`,
      "upgrade",
    );
    showTicker(`🚀 Торговий корабель від NASA! Перевір вкладку Місії.`);
    if (currentPage === "missions") drawMissions();
  }
}

function acceptTrade() {
  const offer = game.tradeOffer;
  if (!offer || !game.tradeAvailable || game.rp < offer.cost) return;
  game.rp -= offer.cost;
  if (offer.res === "rp") {
    game.rp += offer.amount;
  } else {
    game.res[offer.res] = Math.min(100, game.res[offer.res] + offer.amount);
  }
  el("rpDisplay").textContent = Math.floor(game.rp);
  game.tradeAvailable = false;
  game.tradeOffer = null;
  log(`Торгівля завершена! Отримано: ${offer.desc}`, "ok");
  drawMissions();
}

function declineTrade() {
  game.tradeAvailable = false;
  game.tradeOffer = null;
  log("Торгову пропозицію відхилено.", "");
  drawMissions();
}

// Цілі місії

function checkObjectives() {
  let allDone = true;
  OBJECTIVES.forEach((obj) => {
    if (!obj.done && obj.check()) {
      obj.done = true;
      log(`✓ Ціль виконана: "${obj.desc}"`, "upgrade");
      showTicker(`🏆 Ціль досягнута: ${obj.desc}!`);
    }
    if (!obj.done) allDone = false;
  });
  if (allDone && !game.won) {
    game.won = true;
    game.over = true;
    // показуємо екран перемоги
    el("deathReason").textContent =
      "Всі цілі виконано. Місія ARES-7 — успішна!";
    el("gameOverScreen").classList.remove("hidden");
    el("gameOverScreen").querySelector("h2").textContent = "МІСІЯ ВИКОНАНА";
    el("gameOverScreen").querySelector(".game-over-icon").textContent = "🏆";
  }
}

// Щоденний тік екіпажу

function dailyCrewTick() {
  const hasmedlab = hasBuilding("medlab");
  const hasSuit = hasTech("medsuit");
  game.crew.forEach((member) => {
    const regen = hasmedlab ? 1.5 : -0.8;
    const factor = hasSuit ? 0.5 : 1;
    member.health = Math.max(0, Math.min(100, member.health + regen * factor));
    member.morale = Math.max(
      0,
      Math.min(100, member.morale + Math.random() * 4 - 2),
    );
  });
  if (currentPage === "crew") drawCrew();
}

// Перевірка поразки

function checkEnd() {
  for (const [key, val] of Object.entries(game.res)) {
    if (val <= 0) {
      gameOver(`${resLabel[key]} вичерпано. Екіпаж загинув.`);
      return;
    }
  }
  const dead = game.crew.find((c) => c.health <= 0);
  if (dead) gameOver(`${dead.name} не вижив. Місія провалена.`);
}

function gameOver(reason) {
  game.over = true;
  el("deathReason").textContent = reason;
  el("finalSol").textContent = game.sol;
  el("finalRp").textContent = Math.floor(game.rp);
  el("gameOverScreen").classList.remove("hidden");
}

// Будівлі

function drawBuildings() {
  el("buildingsGrid").innerHTML = Object.entries(game.buildings)
    .map(([key, b]) => {
      const zoneOk = !b.needs || game.zones.find((z) => z.id === b.needs)?.open;
      const canBuy = !b.built && game.rp >= b.cost && zoneOk;
      const btnCls = b.built ? "is-built" : "";
      const btnTxt = b.built ? "✓ Побудовано" : `Побудувати — ${b.cost} RP`;
      let hint = "";
      if (!b.built && !zoneOk)
        hint = `<p class="hint">Потрібно відкрити зону на поверхні</p>`;
      else if (!b.built && !canBuy)
        hint = `<p class="hint">Потрібно ${b.cost} RP (є ${Math.floor(game.rp)})</p>`;
      return `
      <div class="card">
        <div class="card-icon">${b.icon}</div>
        <div class="card-title">${b.name}</div>
        <div class="card-desc">${b.desc}</div>
        ${!b.built ? `<div class="card-cost">Вартість: ${b.cost} RP</div>` : ""}
        <button class="card-btn ${btnCls}" onclick="build('${key}')" ${b.built || !canBuy ? "disabled" : ""}>${btnTxt}</button>
        ${hint}
      </div>`;
    })
    .join("");
}

function build(key) {
  const b = game.buildings[key];
  const zoneOk = !b.needs || game.zones.find((z) => z.id === b.needs)?.open;
  if (b.built || game.rp < b.cost || !zoneOk) return;
  game.rp -= b.cost;
  b.built = true;
  el("rpDisplay").textContent = Math.floor(game.rp);
  log(`Побудовано: ${b.name}`, "upgrade");
  game._dailyUpgraded++;
  drawBuildings();
}

// Місії + щоденні завдання + торгівля

function drawMissions() {
  const missionCards = game.missions
    .map((m) => {
      const reqOk = !m.needs || game.buildings[m.needs]?.built;
      const pct = Math.round((m.progress / m.time) * 100);
      const secLeft = m.time - m.progress;
      const timeStr = `${Math.floor(secLeft / 60)}хв ${secLeft % 60}с`;
      const prize =
        m.type === "rp"
          ? `+${m.reward} RP`
          : `+${m.reward} ${resLabel[m.type]}`;
      let btnTxt, btnCls, disabled;
      if (m.done) {
        btnTxt = "✓ Виконано";
        btnCls = "is-built";
        disabled = true;
      } else if (m.active) {
        btnTxt = `${timeStr}…`;
        btnCls = "in-progress";
        disabled = true;
      } else if (!reqOk) {
        btnTxt = `Потрібно: ${game.buildings[m.needs]?.name}`;
        btnCls = "";
        disabled = true;
      } else {
        btnTxt = "Розпочати";
        btnCls = "";
        disabled = false;
      }
      return `
      <div class="card">
        <div class="card-icon">${m.icon}</div>
        <div class="card-title">${m.name}</div>
        <div class="card-desc">${m.desc}</div>
        <div class="mission-reward">Нагорода: ${prize}</div>
        ${m.active ? `<div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>` : ""}
        <button class="card-btn ${btnCls}" onclick="startMission('${m.id}')" ${disabled ? "disabled" : ""}>${btnTxt}</button>
      </div>`;
    })
    .join("");

  // Щоденні завдання
  const dailySection = game.dailyTasks.length
    ? `
    <div class="card" style="grid-column: 1 / -1; background: rgba(255,170,0,0.06); border-color: rgba(255,170,0,0.3);">
      <div class="card-title" style="color:#ffcc44">📋 ЩОДЕННІ ЗАВДАННЯ — Sol ${game.sol}</div>
      ${game.dailyTasks
        .map((t, i) => {
          const done = t.check();
          const claimed = t.claimed;
          return `
          <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
            <span style="font-size:13px;color:${claimed ? "#664" : done ? "#ffcc44" : "#aa8866"}">${claimed ? "✓ " : ""}${t.desc}</span>
            <button class="card-btn" style="width:auto;padding:5px 12px;font-size:10px;"
              onclick="claimDailyTask(${i})" ${claimed || !done ? "disabled" : ""}>
              ${claimed ? "Отримано" : `+${t.reward} RP`}
            </button>
          </div>`;
        })
        .join("")}
    </div>`
    : "";

  // Торгівля
  const tradeSection =
    game.tradeAvailable && game.tradeOffer
      ? `
    <div class="card" style="grid-column: 1 / -1; border-color: #44aaff; background: rgba(0,100,200,0.08);">
      <div class="card-icon">🚀</div>
      <div class="card-title" style="color:#88ccff">ТОРГОВИЙ КОРАБЕЛЬ NASA</div>
      <div class="card-desc">${game.tradeOffer.desc}</div>
      <div class="card-cost">Вартість: ${game.tradeOffer.cost} RP</div>
      <div style="display:flex;gap:8px;margin-top:4px;">
        <button class="card-btn" onclick="acceptTrade()" ${game.rp < game.tradeOffer.cost ? "disabled" : ""}>✓ Прийняти</button>
        <button class="card-btn" onclick="declineTrade()" style="border-color:#664444;color:#aa8888">✗ Відхилити</button>
      </div>
      ${game.rp < game.tradeOffer.cost ? `<p class="hint">Потрібно ${game.tradeOffer.cost} RP</p>` : ""}
    </div>`
      : "";

  el("missionsGrid").innerHTML = tradeSection + dailySection + missionCards;
}

function startMission(id) {
  const m = game.missions.find((x) => x.id === id);
  if (!m || m.active || m.done) return;
  m.active = true;
  m.progress = 0;
  game._dailyMissionStarted++;
  log(`Місія розпочата: ${m.name}`, "warning");
  drawMissions();
}

// Дослідження

function drawResearch() {
  el("researchTree").innerHTML = [1, 2, 3]
    .map((tier) => {
      const items = game.tech.filter((t) => t.tier === tier);
      return `
      <div>
        <div class="tier-label">РІВЕНЬ ${tier}</div>
        <div class="tier-row">
          ${items
            .map((t) => {
              const reqsDone = t.needs.every(
                (id) => game.tech.find((x) => x.id === id)?.done,
              );
              const canBuy = !t.done && reqsDone && game.rp >= t.cost;
              const cls = t.done
                ? "is-unlocked"
                : reqsDone
                  ? "is-available"
                  : "is-locked";
              return `
              <div class="rcard ${cls}">
                <div class="rcard-icon">${t.icon}</div>
                <div class="rcard-name">${t.name}</div>
                <div class="rcard-effect">${t.desc}</div>
                ${
                  t.done
                    ? `<div class="rcard-done">✓ Відкрито</div>`
                    : `<div class="rcard-cost">${t.cost} RP</div>
                     <button class="rcard-btn" onclick="research('${t.id}')" ${canBuy ? "" : "disabled"}>
                       ${reqsDone ? "ВІДКРИТИ" : "🔒 Спочатку попередні"}
                     </button>`
                }
              </div>`;
            })
            .join("")}
        </div>
      </div>`;
    })
    .join("");
}

function research(id) {
  const t = game.tech.find((x) => x.id === id);
  if (!t || t.done || game.rp < t.cost) return;
  if (!t.needs.every((nid) => game.tech.find((x) => x.id === nid)?.done))
    return;
  game.rp -= t.cost;
  t.done = true;
  el("rpDisplay").textContent = Math.floor(game.rp);
  log(`Відкрито: ${t.name}`, "upgrade");
  drawResearch();
}

// Права панель

function drawObjectives() {
  const done = OBJECTIVES.filter((o) => o.done).length;
  const total = OBJECTIVES.length;
  el("objectivesPanel").innerHTML = `
    <div style="font-size:11px;color:#cc8855;margin-bottom:8px;">${done}/${total} виконано</div>
    ${OBJECTIVES.map(
      (o) => `
      <div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:6px;font-size:11px;">
        <span style="color:${o.done ? "#44cc88" : "#664433"};flex-shrink:0">${o.done ? "✓" : "○"}</span>
        <span style="color:${o.done ? "#66aa77" : "#aa8866"}">${o.desc}</span>
      </div>`,
    ).join("")}`;
}

// Екіпаж

function drawCrew() {
  el("crewGrid").innerHTML = game.crew
    .map((c) => {
      const hCol =
        c.health < 30 ? "#ff4422" : c.health < 60 ? "#ffaa00" : "#cc4422";
      const mCol =
        c.morale < 30 ? "#ff4422" : c.morale < 60 ? "#ffaa00" : "#886600";
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
          <div class="stat-labels"><span>Навички</span><span style="color:#4488ff">${Math.round(c.skill)}%</span></div>
          <div class="stat-track"><div class="stat-fill skill" style="width:${c.skill}%"></div></div>
        </div>
        <div class="crew-task">📋 ${c.task}</div>
      </div>`;
    })
    .join("");
}

// Модальне вікно

function openModule(key) {
  const mod = game.modules[key];
  if (!mod) return;
  game.paused = true;

  const statusText = mod.crisis ? "Криза" : "Норма";
  const statusCls = mod.crisis ? "critical" : "ok";
  const cost = upgCost(mod.level);
  const maxed = mod.level >= 5;
  const canUpgrade = !maxed && game.rp >= cost;

  el("modalTitle").textContent = mod.name;
  el("modalBody").innerHTML = `
    <p><strong>Статус:</strong> <span class="modal-status ${statusCls}">${statusText}</span></p>
    <p><strong>Рівень:</strong> ${lvlNames[mod.level]} (${mod.level}/5)</p>
    ${mod.crisis ? `<p>${crises[mod.crisis].desc}</p>` : ""}
    <hr>
    ${mod.crisis ? `<button class="btn-crisis" onclick="fixCrisis('${key}')">⚡ УСУНУТИ ПРОБЛЕМУ</button>` : ""}
    ${
      maxed
        ? `<p style="color:#ffcc44;font-size:12px;margin-top:10px;">★ Максимальний рівень</p>`
        : `<button class="btn-upgrade" onclick="upgrade('${key}')" ${canUpgrade ? "" : "disabled"}>
           ▲ Покращити до рівня ${mod.level + 1} (${cost} RP)
         </button>
         ${!canUpgrade ? `<p class="hint" style="margin-top:6px;">Потрібно ${cost} RP, є ${Math.floor(game.rp)}</p>` : ""}`
    }
  `;
  el("modal").classList.add("open");
}

function fixCrisis(key) {
  game.modules[key].crisis = null;
  game._dailyCrisisFixed++;
  log(`Проблему усунено: ${game.modules[key].name}`, "ok");
  closeModal();
}

function upgrade(key) {
  const mod = game.modules[key];
  const cost = upgCost(mod.level);
  if (game.rp < cost || mod.level >= 5) return;
  game.rp -= cost;
  mod.level++;
  el("rpDisplay").textContent = Math.floor(game.rp);
  game._dailyUpgraded++;
  log(`${mod.name} покращено до рівня ${mod.level}`, "upgrade");
  closeModal();
}

function closeModal() {
  el("modal").classList.remove("open");
  game.paused = false;
  drawModuleList();
  updatePins();
}

el("modal").addEventListener("click", (e) => {
  if (e.target === el("modal") || e.target.classList.contains("modal-close"))
    closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && el("modal").classList.contains("open"))
    closeModal();
});
document.querySelectorAll(".pin").forEach((pin) => {
  pin.addEventListener("click", () => openModule(pin.dataset.module));
  pin.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openModule(pin.dataset.module);
    }
  });
});

// Рестарт

function restart() {
  game.sol = 1;
  game.rp = 0;
  game.over = false;
  game.won = false;
  game.paused = false;
  game.hour = 14;
  game.min = 37;
  Object.assign(game.res, { oxygen: 78, water: 54, energy: 63 });
  Object.values(game.modules).forEach((m) => {
    m.status = "ok";
    m.level = 1;
    m.crisis = null;
  });
  Object.values(game.buildings).forEach((b) => {
    b.built = false;
  });
  game.tech.forEach((t) => {
    t.done = false;
  });
  game.missions.forEach((m) => {
    m.done = false;
    m.active = false;
    m.progress = 0;
  });
  game.zones.forEach((z) => {
    z.open = z.id === "base_area";
    z.unlocking = false;
    z.progress = 0;
  });
  game.crew.forEach((c) => {
    c.health = 80 + Math.random() * 15;
    c.morale = 70 + Math.random() * 20;
  });
  Object.assign(game.zoneBonuses, {
    waterRegen: 0,
    rpRegen: 0,
    energyBoost: 1,
    rpLabBoost: 1,
  });
  OBJECTIVES.forEach((o) => {
    o.done = false;
  });
  game.dailyTasks = [];
  game.tradeAvailable = false;
  game.tradeOffer = null;
  game.tradeNextSol = 8;
  game._dailyCrisisFixed = 0;
  game._dailyMissionStarted = 0;
  game._dailyUpgraded = 0;
  game._dailyZoneOpened = 0;

  el("solDisplay").textContent = 1;
  el("rpDisplay").textContent = 0;
  el("eventLog").innerHTML = "";
  el("gameOverScreen").classList.add("hidden");
  el("gameOverScreen").querySelector("h2").textContent = "МІСІЯ ПРОВАЛЕНА";
  el("gameOverScreen").querySelector(".game-over-icon").textContent = "☠";

  goTo("home");
  drawResources();
  drawModuleList();
  updatePins();
  drawObjectives();
  generateDailyTasks();
  log("Місія розпочалась. Удачі, командире.", "ok");
  showTicker(tickerLines[0]);
}

el("restartBtn").addEventListener("click", restart);

// Головний цикл

function loop() {
  if (game.over || game.paused) return;
  tickTime();
  tickResources();
  maybeTriggerCrisis();
  tickMissions();
  tickExplore();
  checkObjectives();
  checkEnd();
  drawResources();
  drawModuleList();
  updatePins();
  drawObjectives();
}

// Запуск

drawResources();
drawModuleList();
updatePins();
generateDailyTasks();
drawObjectives();
log("Місія розпочалась. Удачі, командире.", "ok");
showTicker(tickerLines[0]);

setInterval(loop, 1000);
