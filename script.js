const el = id => document.getElementById(id);

// ───────────────────────── INTRO ─────────────────────────
function buildIntro() {
  const screen = document.createElement("div");
  screen.id = "introScreen";
  screen.style.cssText = `
    position:fixed;inset:0;background:#0d0704;z-index:9998;
    display:flex;align-items:center;justify-content:center;
    font-family:'Share Tech Mono',monospace;
  `;
  const slides = [
    { icon:"◈", title:"ARES-7 — HELLAS PLANITIA",
      text:"Sol 1. Ваша база щойно приземлилась на Марс.\nЗв'язок із Землею — 20 хвилин затримки.\nЕкіпаж: 6 осіб. Ресурси: критично обмежені." },
    { icon:"🎯", title:"П'ЯТЬ ЦІЛЕЙ МІСІЇ",
      text:"① Виростити першу рослину на Марсі\n② Протриматись 10 солів\n③ Дослідити всі зони поверхні\n④ Побудувати всі будівлі\n⑤ Евакуювати екіпаж" },
    { icon:"⚠", title:"ЯК ВИЖИТИ",
      text:"• Стежте за киснем, водою та енергією\n• Без активності — немає RP!\n• Криза в модулі → відкриває аварійну місію\n• Вночі сонячні панелі не працюють\n• Екіпаж потрібен для місій і будівель" },
    { icon:"🌱", title:"ПЕРША РОСЛИНА",
      text:"Головна ціль місії — виростити живу рослину.\nЧотири етапи: ґрунт → насіння → ріст → збір.\nКожен потребує ресурсів, техів і часу.\n\nУдачі, командире." }
  ];
  let idx = 0;
  const box = document.createElement("div");
  box.style.cssText = `max-width:520px;width:92%;background:rgba(22,11,6,0.98);border:1px solid #e85d04;padding:32px 28px;text-align:center;box-sizing:border-box;`;
  function render() {
    const s = slides[idx];
    box.innerHTML = `
      <div style="font-size:38px;margin-bottom:14px">${s.icon}</div>
      <div style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;letter-spacing:2px;color:#ffb347;text-transform:uppercase;margin-bottom:16px">${s.title}</div>
      <div style="font-size:13px;color:#8a5c44;line-height:1.85;white-space:pre-line;margin-bottom:24px;text-align:left">${s.text}</div>
      <div style="display:flex;justify-content:center;gap:6px;margin-bottom:20px">
        ${slides.map((_,i)=>`<div style="width:24px;height:3px;background:${i===idx?"#e85d04":"#3a1a0a"}"></div>`).join("")}
      </div>
      <button id="introBtnNext" style="padding:12px 32px;background:rgba(232,93,4,0.2);border:1px solid #e85d04;color:#f0cdb8;font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;letter-spacing:2px;text-transform:uppercase;cursor:pointer;width:100%;">
        ${idx < slides.length-1 ? "ДАЛІ →" : "РОЗПОЧАТИ МІСІЮ"}
      </button>`;
    box.querySelector("button").addEventListener("click", () => {
      if (idx < slides.length-1) { idx++; render(); }
      else { screen.remove(); }
    });
  }
  render();
  screen.appendChild(box);
  document.body.appendChild(screen);
}

// ───────────────────────── GAME STATE ─────────────────────────
const game = {
  sol: 1, rp: 0,
  paused: false, over: false,
  hour: 6, min: 0,
  res: { oxygen: 78, water: 54, energy: 63 },

  modules: {
    habitat:    { name:"Житловий модуль", status:"ok", level:1, crisis:null, drain:{ oxygen:0.04 }, crises:["fire","leak"],         color:"orange" },
    greenhouse: { name:"Оранжерея",       status:"ok", level:1, crisis:null, drain:{ water:0.03  }, crises:["drought","pest"],       color:"orange" },
    solar:      { name:"Сонячні панелі",  status:"ok", level:1, crisis:null, drain:{ energy:0    }, crises:["dust_storm","malfunction"], color:"orange" },
    lab:        { name:"Лабораторія",     status:"ok", level:1, crisis:null, drain:{ energy:0.02 }, crises:["overload","leak"],      color:"orange" }
  },

  // Активність: лічильники дій за Sol (щоб RP йшли лише при діях)
  activityThisSol: 0,   // лічильник дій за Sol (для завдань)
  rpIdleWarned: false,

  buildings: {
    recycler:  { name:"Переробник води",   icon:"💧", cost:140, built:false, level:1, maxLevel:3, desc:"Очищує воду з відходів. +0.05/тік за рівень", effect:"water_regen" },
    garage:    { name:"Гараж роверів",     icon:"🚗", cost:100, built:false, level:1, maxLevel:3, desc:"Розблоковує місії на поверхні та евакуацію",  effect:"missions" },
    medlab:    { name:"Медичний блок",     icon:"⚕️", cost:120, built:false, level:1, maxLevel:3, desc:"Екіпаж відновлює +1.5 здоров'я щодня за рівень", effect:"crew_heal" },
    antenna:   { name:"Антена зв'язку",   icon:"📡", cost:80,  built:false, level:1, maxLevel:3, desc:"+20% RP за рівень і потрібна для евакуації",   effect:"rp_boost" },
    battery:   { name:"Акумуляторний блок",icon:"🔋", cost:100, built:false, level:1, maxLevel:3, desc:"+0.05 енергії вночі за рівень",               effect:"night_energy" },
    growlight:  { name:"Лампи росту",      icon:"💡", cost:140, built:false, level:1, maxLevel:3, desc:"Рослина росте швидше. Рівень збільшує швидкість", effect:"plant_speed" },
    o2pump:    { name:"Кисневий насос",    icon:"🌬️", cost:130, built:false, level:1, maxLevel:3, desc:"+0.03 кисню/тік за рівень",                   effect:"o2_regen" },
    workshop:  { name:"Ремонтний відсік",  icon:"🔧", cost:110, built:false, level:1, maxLevel:3, desc:"Кризи тривають менше. Рівень = більший ефект", effect:"crisis_reduction" }
  },

  // Стан 5 великих цілей (відкриваються послідовно)
  mainObjectives: [
    { id:"obj_survive",  title:"Вижити 10 солів",          desc:"Протримайтесь 10 повних солів",            done:false, active:true,  icon:"⏳" },
    { id:"obj_plant",    title:"Виростити рослину",        desc:"Пройти всі 4 етапи в оранжереї",           done:false, active:false, icon:"🌱" },
    { id:"obj_zones",    title:"Дослідити всі зони",       desc:"Відкрити всі 11 зон поверхні",             done:false, active:false, icon:"🗺️" },
    { id:"obj_buildings",title:"Побудувати всі будівлі",   desc:"Збудувати всі 8 будівель бази",            done:false, active:false, icon:"🏗️" },
    { id:"obj_evac",     title:"Евакуація екіпажу",        desc:"Виконати всі 3 місії евакуації",           done:false, active:false, icon:"🚀" }
  ],

  missions: [
    { id:"survey",   name:"Розвідка кратера",        icon:"🗺️", desc:"Вивчити рельєф на схід від бази.",                    time:30,  reward:40,  type:"rp",     done:false, active:false, progress:0, needs:null,     repeatAfter:3 },
    { id:"sample",   name:"Збір ґрунту",              icon:"🧪", desc:"Зібрати зразки реголіту для лабораторії.",             time:25,  reward:30,  type:"rp",     done:false, active:false, progress:0, needs:null,     repeatAfter:3 },
    { id:"repair",   name:"Ремонт труби",              icon:"🔩", desc:"Полагодити зовнішній водяний клапан.",                 time:15,  reward:18,  type:"water",  done:false, active:false, progress:0, needs:null,     repeatAfter:2 },
    { id:"o2patch",  name:"Ремонт кисневого шланга",  icon:"💨", desc:"Усунути мікровитік в житловому модулі.",               time:18,  reward:15,  type:"oxygen", done:false, active:false, progress:0, needs:null,     repeatAfter:2 },
    { id:"rover",    name:"Рейд на ровері",            icon:"🚗", desc:"Дослідити аномалію за три км від бази.",              time:45,  reward:80,  type:"rp",     done:false, active:false, progress:0, needs:"garage", repeatAfter:4 },
    { id:"meteor",   name:"Аналіз метеорита",          icon:"☄️", desc:"Дослідити фрагменти біля посадкового майданчика.",    time:35,  reward:55,  type:"rp",     done:false, active:false, progress:0, needs:null,     repeatAfter:4 },
    { id:"soiltest", name:"Тест ґрунту для рослини",  icon:"🌱", desc:"Взяти проби для визначення складу ґрунту.",            time:20,  reward:25,  type:"rp",     done:false, active:false, progress:0, needs:null,     repeatAfter:3 },
    { id:"solarfix", name:"Чищення панелей",           icon:"⚡", desc:"Змести пил із сонячних панелей.",                     time:12,  reward:12,  type:"energy", done:false, active:false, progress:0, needs:null,     repeatAfter:2 },
    { id:"geology",  name:"Геологічна розвідка",       icon:"⛏️", desc:"Детальне картування мінеральних покладів.",           time:40,  reward:70,  type:"rp",     done:false, active:false, progress:0, needs:"garage", repeatAfter:4 },
    { id:"seismic",  name:"Сейсмічні зонди",           icon:"📡", desc:"Встановити датчики коливань ґрунту.",                 time:50,  reward:85,  type:"rp",     done:false, active:false, progress:0, needs:"antenna",repeatAfter:5 },
    { id:"icedrill", name:"Буріння крижаного шару",   icon:"❄️", desc:"Дістатися до підземних льодовиків.",                  time:55,  reward:30,  type:"water",  done:false, active:false, progress:0, needs:"garage", repeatAfter:5 },
    { id:"atmoread", name:"Аналіз атмосфери",          icon:"🌪️", desc:"Вивчити склад і тиск марсіанської атмосфери.",        time:30,  reward:45,  type:"rp",     done:false, active:false, progress:0, needs:null,     repeatAfter:3 },
    { id:"relic",    name:"Дослідження реліквії",      icon:"🛸", desc:"Вивчити аномальний об'єкт у кратері.",               time:60,  reward:100, type:"rp",     done:false, active:false, progress:0, needs:"garage", repeatAfter:6 },
    // місії евакуації (одноразові, платні)
    { id:"evac1",    name:"Сигнал евакуації",          icon:"📡", desc:"Надіслати сигнал SOS на Землю. Потрібна антена. Доступно після всіх зон або будівель.",                      time:35,  reward:0,   type:"rp",     cost:150,  done:false, active:false, progress:0, needs:"antenna", evacStep:1 },
    { id:"evac2",    name:"Підготовка капсули",        icon:"🚀", desc:"Перевірити евакуаційну капсулу. Потрібен гараж. Доступно після всіх зон або будівель.",                     time:45,  reward:0,   type:"rp",     cost:250,  done:false, active:false, progress:0, needs:"garage",  evacStep:2 },
    { id:"evac3",    name:"Евакуація екіпажу",         icon:"🛸", desc:"Посадка і запуск капсули з усім екіпажем. Потрібен гараж і виконані evac 1 та 2.",           time:60,  reward:0,   type:"rp",     cost:400,  done:false, active:false, progress:0, needs:"garage",  evacStep:3 }
  ],

  // Аварійні місії, що відкриваються при кризах
  emergencyMissions: [],

  tech: [
    { id:"atmo",     tier:1, name:"Атмосферний фільтр",   icon:"💨", desc:"Кисень -20% витрат на тік",                cost:90,  done:false, needs:[] },
    { id:"hydro",    tier:1, name:"Гідропоніка",           icon:"🌱", desc:"Оранжерея виробляє воду замість витрат",   cost:90,  done:false, needs:[] },
    { id:"solar2",   tier:1, name:"Ефективні панелі",      icon:"⚡", desc:"Генерація енергії +30%",                  cost:100, done:false, needs:[] },
    { id:"biotech",  tier:1, name:"Марсіанська біологія",  icon:"🔬", desc:"Розблоковує посів насіння (Етап 2)",       cost:110, done:false, needs:[] },
    { id:"recycling",tier:1, name:"Замкнутий цикл",        icon:"♻️", desc:"Переробник води +50% ефективності",       cost:80,  done:false, needs:[] },
    { id:"medsuit",  tier:2, name:"Захисний костюм",       icon:"🧑‍🚀", desc:"Здоров'я екіпажу втрачається -60%",     cost:130, done:false, needs:["atmo"] },
    { id:"ai",       tier:2, name:"ШІ-асистент",           icon:"🤖", desc:"Лабораторія +40% RP при активності",      cost:150, done:false, needs:["hydro","solar2"] },
    { id:"growtech", tier:2, name:"Технологія росту",      icon:"🌿", desc:"Розблоковує вирощування (Етап 3)",        cost:140, done:false, needs:["biotech","hydro"] },
    { id:"deepdrill",tier:2, name:"Глибоке буріння",       icon:"⛏️", desc:"Відкриває місію буріння льоду",           cost:120, done:false, needs:["solar2"] },
    { id:"fusion",   tier:3, name:"Мікрореактор",          icon:"⚛️", desc:"Енергія не падає нижче 15%",             cost:280, done:false, needs:["ai","solar2"] },
    { id:"terraform",tier:3, name:"Терраформінг-зонд",     icon:"🌍", desc:"+0.05 кисню і +0.03 води пасивно",       cost:320, done:false, needs:["growtech","ai"] },
    { id:"quantum",  tier:3, name:"Квантовий зв'язок",     icon:"📶", desc:"RP від місій +50%",                       cost:350, done:false, needs:["ai","deepdrill"] }
  ],

  zones: [
    { id:"base_area",     name:"Периметр бази",     icon:"🏠", desc:"Вже досліджена.",                           bonus:"+Стартова зона",          bonusType:null,            bonusValue:0,   open:true,  unlocking:false, progress:0, cost:0,   needs:null,           top:1, left:1 },
    { id:"crater_north",  name:"Північний кратер",  icon:"🌑", desc:"Поклади льоду під поверхнею.",              bonus:"+40 води одразу",         bonusType:"water",         bonusValue:40,  open:false, unlocking:false, progress:0, cost:55,  needs:null,           top:0, left:1 },
    { id:"lava_field",    name:"Лавове поле",        icon:"🌋", desc:"Мінерали для досліджень.",                  bonus:"+70 RP одразу",           bonusType:"rp",            bonusValue:70,  open:false, unlocking:false, progress:0, cost:60,  needs:null,           top:0, left:2 },
    { id:"dust_plain",    name:"Пилова рівнина",     icon:"🌪", desc:"Відкрита рівнина — добре для панелей.",   bonus:"+25% генерації енергії",  bonusType:"energy_boost",  bonusValue:0,   open:false, unlocking:false, progress:0, cost:70,  needs:"lava_field",   top:0, left:3 },
    { id:"canyon_west",   name:"Західний каньйон",  icon:"🏔", desc:"Захищена ділянка від вітру.",              bonus:"+0.04 води/тік",          bonusType:"water_regen",   bonusValue:0,   open:false, unlocking:false, progress:0, cost:65,  needs:"base_area",    top:1, left:0 },
    { id:"ice_valley",    name:"Льодяна долина",     icon:"❄️", desc:"Шар льоду на глибині 2 м.",               bonus:"+0.07 води/тік",          bonusType:"water_regen",   bonusValue:0,   open:false, unlocking:false, progress:0, cost:95,  needs:"crater_north", top:1, left:2 },
    { id:"mineral_ridge", name:"Мінеральний хребет", icon:"💎", desc:"Рідкісні мінерали для науки.",            bonus:"+0.5 RP/тік",             bonusType:"rp_regen",      bonusValue:0,   open:false, unlocking:false, progress:0, cost:85,  needs:"lava_field",   top:1, left:3 },
    { id:"shelter_ruins", name:"Покинутий зонд",     icon:"🛸", desc:"Уламки марсохода з корисними деталями.",  bonus:"+100 RP одразу",          bonusType:"rp",            bonusValue:100, open:false, unlocking:false, progress:0, cost:80,  needs:"canyon_west",  top:2, left:0 },
    { id:"south_plateau", name:"Південне плато",     icon:"🗻", desc:"Висока рівнина, менше пилу.",             bonus:"+35% RP від лабораторії", bonusType:"rp_lab_boost",  bonusValue:0,   open:false, unlocking:false, progress:0, cost:105, needs:"canyon_west",  top:2, left:1 },
    { id:"deep_crater",   name:"Глибокий кратер",    icon:"🕳", desc:"Найглибший кратер — повно кисню.",        bonus:"+55 кисню одразу",        bonusType:"oxygen",        bonusValue:55,  open:false, unlocking:false, progress:0, cost:90,  needs:"crater_north", top:2, left:2 },
    { id:"far_east",      name:"Далекий схід",       icon:"🌅", desc:"Невідома зона з аномальним сигналом.",   bonus:"+140 RP одразу",          bonusType:"rp",            bonusValue:140, open:false, unlocking:false, progress:0, cost:120, needs:"mineral_ridge", top:2, left:3 }
  ],

  plant: { stage:0, stageProgress:0, growing:false },

  crew: [
    { id:"koval",   name:"Олена Коваль",   role:"Командир", avatar:"👩‍🚀", health:92, morale:88, skill:85, task:"Управління базою",    assignedTo:null },
    { id:"petrov",  name:"Дмитро Петров",  role:"Інженер",  avatar:"👨‍🔧", health:78, morale:72, skill:90, task:"Обслуговування",       assignedTo:null },
    { id:"sirenko", name:"Яна Сіренко",    role:"Лікар",    avatar:"👩‍⚕️", health:95, morale:80, skill:88, task:"Медичний блок",       assignedTo:null },
    { id:"bondar",  name:"Ігор Бондар",    role:"Геолог",   avatar:"👨‍🔬", health:65, morale:60, skill:82, task:"Польові дослідження",  assignedTo:null },
    { id:"lysenko", name:"Марія Лисенко",  role:"Біолог",   avatar:"👩‍🌾", health:88, morale:91, skill:79, task:"Оранжерея",            assignedTo:null },
    { id:"kravets", name:"Сергій Кравець", role:"Пілот",    avatar:"👨‍✈️", health:82, morale:66, skill:94, task:"Чекає на завдання",    assignedTo:null }
  ],

  // Призначення екіпажу до будівель
  crewAssignments: {
    lab: null,        // підвищує RP
    greenhouse: null, // прискорює рослину
    medlab: null,     // підвищує зцілення
    workshop: null    // прискорює ремонт
  },

  zoneBonuses: { waterRegen:0, rpRegen:0, energyBoost:1, rpLabBoost:1 },
  dailyTasks: [],
  _dailyCrisisFixed:0, _dailyMissionStarted:0, _dailyUpgraded:0, _dailyZoneOpened:0,

  tradeAvailable:false, tradeNextSol:7, tradeOffer:null,

  objectives: { plant:false, survive:false, evac:false, zones:false, buildings:false },
  ending: null
};

// ───────────────────────── PLANT STAGES ─────────────────────────
const PLANT_STAGES = [
  { num:1, name:"Підготовка ґрунту", icon:"🪨", desc:"Зволожити реголіт і додати живильні речовини.", duration:50,
    requires:() => game.res.water >= 30 && game.modules.greenhouse.level >= 1,
    requiresText:"Вода ≥ 30% • Оранжерея Lv1+", needsTech:null },
  { num:2, name:"Посів насіння", icon:"🌰", desc:"Посіяти адаптоване насіння пшениці у підготовлений ґрунт.", duration:65,
    requires:() => hasTech("biotech") && game.res.water >= 35,
    requiresText:"Техн. «Марсіанська біологія» • Вода ≥ 35%", needsTech:"biotech" },
  { num:3, name:"Вирощування", icon:"🌿", desc:"Підтримувати оптимальний рівень вологи і температури.", duration:90,
    requires:() => hasTech("growtech") && game.res.water >= 40 && game.res.oxygen >= 50,
    requiresText:"Техн. «Технологія росту» • Вода ≥ 40% • O₂ ≥ 50%", needsTech:"growtech" },
  { num:4, name:"Перший урожай", icon:"🌾", desc:"Зафіксувати, задокументувати і зібрати першу рослину на Марсі.", duration:35,
    requires:() => true, requiresText:"Автоматично", needsTech:null }
];

const DAILY_POOL = [
  { desc:"Усунь будь-яку кризу",        reward:40,  check:() => game._dailyCrisisFixed > 0 },
  { desc:"Запусти будь-яку місію",       reward:30,  check:() => game._dailyMissionStarted > 0 },
  { desc:"Покращ або побудуй щось",      reward:45,  check:() => game._dailyUpgraded > 0 },
  { desc:"Кисень вище 60% до кінця Sol", reward:25,  check:() => game.res.oxygen >= 60 },
  { desc:"Вода вище 50% до кінця Sol",   reward:25,  check:() => game.res.water >= 50 },
  { desc:"Енергія вище 40% до кінця Sol",reward:20,  check:() => game.res.energy >= 40 },
  { desc:"Відкрий зону на поверхні",     reward:50,  check:() => game._dailyZoneOpened > 0 },
  { desc:"Просто пережити цей Sol",      reward:20,  check:() => true }
];

const TRADE_OFFERS = [
  { desc:"Контейнер з водою (+50 💧)",  cost:55,  res:"water",  amount:50 },
  { desc:"Балони з киснем (+45 O₂)",    cost:50,  res:"oxygen", amount:45 },
  { desc:"Заряд батарей (+40 ⚡)",       cost:45,  res:"energy", amount:40 },
  { desc:"Науковий набір (+100 RP)",     cost:30,  res:"rp",     amount:100 },
  { desc:"Великий вантаж: вода (+80)",   cost:100, res:"water",  amount:80 },
  { desc:"Аварійний кисень (+60 O₂)",   cost:75,  res:"oxygen", amount:60 }
];

const crises = {
  fire:        { label:"🔥 Пожежа!",         desc:"Займання в житловому модулі.",           extra:{ oxygen:0.3, energy:0.1 },  missionId:"emg_fire" },
  leak:        { label:"💧 Витік кисню!",     desc:"Пошкоджена герметизація.",              extra:{ oxygen:0.25 },             missionId:"emg_leak" },
  drought:     { label:"🌵 Посуха!",          desc:"Система поливу відмовила.",              extra:{ water:0.25 },              missionId:"emg_drought" },
  pest:        { label:"🐛 Шкідники!",        desc:"Комахи потрапили в оранжерею.",         extra:{ water:0.12, energy:0.08 }, missionId:"emg_pest" },
  dust_storm:  { label:"🌪 Пилова буря!",     desc:"Буря засипала сонячні панелі.",          extra:{ energy:0.35 },             missionId:"emg_dust" },
  malfunction: { label:"⚡ Відмова системи!", desc:"Збій в енергосистемі.",                  extra:{ energy:0.3 },              missionId:"emg_malfunction" },
  overload:    { label:"🔌 Перевантаження!",  desc:"Лабораторія споживає занадто багато.",   extra:{ energy:0.2 },              missionId:"emg_overload" }
};

// Шаблони аварійних місій
const EMERGENCY_TEMPLATES = {
  emg_fire:        { icon:"🔥", name:"Гасіння пожежі",         desc:"Усунути займання та перевірити системи безпеки.",  time:8,  reward:60, type:"rp",     modKey:"habitat" },
  emg_leak:        { icon:"💧", name:"Ремонт герметизації",     desc:"Залатати пошкоджену ділянку корпусу модуля.",      time:10, reward:50, type:"rp",     modKey:"habitat" },
  emg_drought:     { icon:"🌵", name:"Ремонт системи поливу",   desc:"Полагодити клапани системи зрошення.",             time:8,  reward:40, type:"water",  modKey:"greenhouse" },
  emg_pest:        { icon:"🐛", name:"Дезінфекція оранжереї",   desc:"Знищити шкідників і захистити посіви.",            time:12, reward:50, type:"rp",     modKey:"greenhouse" },
  emg_dust:        { icon:"🌪", name:"Очищення від бурі",        desc:"Очистити сонячні панелі від піску.",               time:6,  reward:30, type:"energy", modKey:"solar" },
  emg_malfunction: { icon:"⚡", name:"Ремонт енергосистеми",    desc:"Відновити роботу збійного блоку.",                 time:10, reward:60, type:"rp",     modKey:"solar" },
  emg_overload:    { icon:"🔌", name:"Розвантаження системи",   desc:"Скинути перевантаження лабораторії.",              time:7,  reward:50, type:"rp",     modKey:"lab" }
};

const resLabel = { oxygen:"Кисень", water:"Вода", energy:"Енергія" };
const lvlNames  = ["","Базовий","Покращений","Розширений","Передовий","Елітний"];
const lvlColors = ["","#e85d04","#ffb347","#4ab3ff","#a855f7","#3ddc84"];
const upgCost   = lvl => lvl * 90;
const bldUpgCost= lvl => lvl * 120;
const EXPLORE_T = 45;
const isNight   = () => game.hour >= 5;
const hasTech   = id => game.tech.find(t => t.id === id)?.done;
const hasBuilding= id => game.buildings[id]?.built;

let currentPage = "home";

// ───────────────────────── NAVIGATION ─────────────────────────
function goTo(page) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.querySelectorAll("nav a").forEach(a => a.classList.remove("active"));
  el(`page-${page}`).classList.add("active");
  document.querySelector(`nav a[data-page="${page}"]`).classList.add("active");
  const headers = {
    home:      ["ГОЛОВНА БАЗА ARES-7",   "Сектор: Hellas Planitia"],
    plant:     ["ПЕРША РОСЛИНА",          "Головна ціль місії"],
    buildings: ["БУДІВЛІ",                "Розширення та покращення бази"],
    missions:  ["МІСІЇ",                  "Польові операції та завдання"],
    research:  ["ТЕХНОЛОГІЇ",             "Наукові дослідження"],
    crew:      ["ЕКІПАЖ",                 "Персонал і призначення"],
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

// ───────────────────────── TICKER (fixed mobile) ─────────────────────────
const tickerLines = [
  "Зв'язок із Землею: затримка 20 хв • Всі системи в автономному режимі",
  "Температура поверхні: −42°C • Вітер: 18 м/с • Видимість: 4 км",
  "Ціль №1: вижити 10 солів",
  "Ціль №2: виростити першу рослину на Марсі",
  "Рекомендація NASA: тримайте ресурси вище 30%",
  "Ціль №3: дослідити всі зони поверхні Марса",
  "Ціль №4: побудувати всі будівлі бази",
  "Ціль №5: підготувати і виконати евакуацію екіпажу",
  "Без активності — немає RP! Запускайте місії та досліджуйте."
];
let tickerIdx = 0;
let tickerAnimating = false;

function showTicker(customText) {
  const tickerEl = el("ticker");
  if (!tickerEl) return;
  const text = customText || tickerLines[tickerIdx];
  // Очищуємо і ставимо новий текст
  tickerEl.innerHTML = `<span class="ticker-text" id="tickerSpan">${text}</span>`;
  const span = el("tickerSpan");
  if (!span) return;
  tickerAnimating = true;
  // Розраховуємо тривалість анімації на основі довжини тексту
  // ~12px на символ + ширина контейнера, зі швидкістю ~80px/s
  const containerW = tickerEl.offsetWidth || 400;
  const textLen = text.length * 8; // приблизна ширина символу
  const totalDist = containerW + textLen;
  const duration = Math.max(8, totalDist / 70); // 70px/s
  span.style.setProperty("--ticker-dur", `${duration}s`);
  // Ловимо кінець анімації — переходимо до наступного рядка лише коли текст зник
  span.addEventListener("animationend", () => {
    tickerAnimating = false;
    if (!customText) {
      tickerIdx = (tickerIdx + 1) % tickerLines.length;
    }
    setTimeout(() => showTicker(), 300);
  }, { once: true });
}

// ───────────────────────── LOG ─────────────────────────
const pad = n => String(n).padStart(2, "0");
function log(text, type="") {
  const time = `Sol ${game.sol} ${pad(game.hour)}:${pad(game.min)}`;
  const row = document.createElement("div");
  row.className   = `log-entry ${type}`;
  row.textContent = `[${time}] ${text}`;
  el("eventLog").prepend(row);
  while (el("eventLog").children.length > 35) el("eventLog").lastChild.remove();
}

// ───────────────────────── RESOURCES ─────────────────────────
function drawResources() {
  el("resourceBars").innerHTML = [
    { key:"oxygen", label:"Кисень"  },
    { key:"water",  label:"Вода"    },
    { key:"energy", label:"Енергія" }
  ].map(({ key, label }) => {
    const val = Math.max(0, Math.min(100, game.res[key]));
    const pct = Math.round(val);
    const cls = val < 25 ? "low" : val < 50 ? "medium" : "";
    const col = val < 25 ? "#ff3d3d" : val < 50 ? "#ffb347" : "#f0cdb8";
    const emergCost = { oxygen:35, water:30, energy:25 }[key];
    return `
      <div class="res-bar">
        <div class="res-labels"><span>${label}</span><span class="res-pct" style="color:${col}">${pct}%</span></div>
        <div class="res-track"><div class="res-fill ${cls}" style="width:${pct}%"></div></div>
        ${val < 40 ? `<button class="emerg-btn" onclick="emergencyRefill('${key}')">⚡ +20 за ${emergCost} RP</button>` : ""}
      </div>`;
  }).join("");
}

function emergencyRefill(key) {
  const cost = { oxygen:35, water:30, energy:25 }[key];
  if (game.rp < cost) { log("Не вистачає RP.", "warning"); return; }
  game.rp -= cost;
  game.res[key] = Math.min(100, game.res[key] + 20);
  el("rpDisplay").textContent = Math.floor(game.rp);
  log(`Аварійне поповнення: ${resLabel[key]} +20`, "ok");
  game.activityThisSol++;
  drawResources();
}

// ───────────────────────── MODULE LIST ─────────────────────────
function drawModuleList() {
  el("moduleList").innerHTML = Object.entries(game.modules).map(([key, mod]) => {
    const text = mod.crisis ? "⚠ КРИЗА" : "Норма";
    const cls  = mod.crisis ? "crisis" : "ok";
    const lvlCol = lvlColors[Math.min(mod.level, 5)];
    return `
      <div class="module-row" onclick="openModule('${key}')">
        <span>${mod.name}</span>
        <span class="module-lv" style="color:${lvlCol}">Lv${mod.level}</span>
        <span class="module-status ${cls}">${text}</span>
      </div>`;
  }).join("");
}

// ───────────────────────── PINS ─────────────────────────
const PIN_LV_COLORS = ["","#e85d04","#ffb347","#4ab3ff","#a855f7","#3ddc84"];

function updatePins() {
  Object.entries(game.modules).forEach(([key, mod]) => {
    const dot   = el(`pin-${key}`);
    const alert = el(`alert-${key}`);
    if (!dot) return;
    dot.classList.toggle("is-crisis", !!mod.crisis);
    alert.classList.toggle("hidden", !mod.crisis);
    // Колір піна залежно від рівня модуля
    if (!mod.crisis) {
      const col = PIN_LV_COLORS[Math.min(mod.level, 5)];
      dot.style.background = `radial-gradient(circle, ${col}ee 30%, ${col} 100%)`;
      dot.style.borderColor = col;
      dot.style.boxShadow   = `0 0 10px ${col}, 0 0 22px ${col}55`;
    } else {
      dot.style.cssText = "";
    }
  });
  const count = Object.values(game.modules).filter(m => m.crisis).length;
  const homeLink = document.querySelector("nav a[data-page='home']");
  let badge = homeLink.querySelector(".nav-alert");
  if (count > 0) {
    if (!badge) { badge = document.createElement("span"); badge.className = "nav-alert"; homeLink.appendChild(badge); }
    badge.textContent = count;
  } else if (badge) badge.remove();
}

// ───────────────────────── TIME ─────────────────────────
function tickTime() {
  game.min++;
  if (game.min >= 60) { game.min = 0; game.hour++; }
  if (game.hour >= 10) {
    game.hour = 0; game.sol++;
    el("solDisplay").textContent = game.sol;
    log(`Sol ${game.sol} розпочався.`, "ok");
    onNewSol();
  }
  el("clock").textContent = `${pad(game.hour)}:${pad(game.min)}`;
  const nightTag = el("nightTag");
  if (nightTag) { isNight() ? nightTag.classList.remove("hidden") : nightTag.classList.add("hidden"); }
}

function refreshRepeatableMissions() {
  let refreshed = 0;
  game.missions.forEach(m => {
    if (m.done && m.repeatAfter && m.reopenOnSol && game.sol >= m.reopenOnSol) {
      m.done = false;
      m.active = false;
      m.progress = 0;
      m.doneOnSol = null;
      m.reopenOnSol = null;
      refreshed++;
    }
  });
  if (refreshed > 0) {
    log(`${refreshed} місій знову доступні.`, "ok");
    if (currentPage === "missions") drawMissions();
  }
}

function onNewSol() {
  dailyCrewTick();
  generateDailyTasks();
  checkTradeArrival();
  checkMainObjectives();
  refreshRepeatableMissions();
  // Якщо активності не було — штраф або попередження
  if (game.activityThisSol === 0) {
    log("⚠ Жодної активності! RP не нараховується без дій.", "crisis");
    if (!game.rpIdleWarned) {
      game.rpIdleWarned = true;
      showTicker("⚠ УВАГА: Без активності RP не накопичуються! Запускайте місії.");
    }
  } else {
    game.rpIdleWarned = false;
  }
  game.activityThisSol = 0;
  game._dailyCrisisFixed = 0; game._dailyMissionStarted = 0;
  game._dailyUpgraded = 0; game._dailyZoneOpened = 0;
}

// ───────────────────────── RESOURCES TICK ─────────────────────────
function tickResources() {
  const r = game.res;
  const b = game.zoneBonuses;
  const night = isNight();

  const atmoMul  = hasTech("atmo")   ? 0.80 : 1;
  const hydroOn  = hasTech("hydro");
  const solarMul = hasTech("solar2") ? 1.30 : 1;
  const aiMul    = hasTech("ai")     ? 1.40 : 1;
  const antMul   = hasBuilding("antenna") ? (1 + 0.20 * (game.buildings.antenna.level || 1)) : 1;
  const recycMul = hasTech("recycling") ? 1.5 : 1;
  const tfOn     = hasTech("terraform");

  Object.values(game.modules).forEach(mod => {
    if (mod.status === "offline") return;
    const lvlMul = 1 - (mod.level-1) * 0.05;
    if (mod.drain.oxygen != null) {
      let d = mod.drain.oxygen * lvlMul * atmoMul;
      if (mod.crisis) d += crises[mod.crisis].extra.oxygen || 0;
      r.oxygen -= d;
    }
    if (mod.drain.water != null) {
      if (mod === game.modules.greenhouse) {
        if (hydroOn) { r.water += 0.04 * (mod.level * 0.2 + 0.8); }
        else {
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
  if (!solar.crisis && !night) r.energy += 0.07 * (1 + (solar.level-1) * 0.12) * solarMul * b.energyBoost;
  if (hasBuilding("battery") && night) r.energy += 0.04 * (game.buildings.battery.level || 1);
  if (hasBuilding("recycler")) r.water += 0.05 * recycMul * (game.buildings.recycler.level || 1);
  if (hasBuilding("o2pump"))   r.oxygen += 0.03 * (game.buildings.o2pump.level || 1);
  if (tfOn) { r.oxygen += 0.05; r.water += 0.03; }
  r.water += b.waterRegen;

  if (hasTech("fusion")) r.energy = Math.max(15, r.energy);

  // RP нараховуються ТІЛЬКИ якщо вкладка активна (не у фоні)
  const lab = game.modules.lab;
  if (!lab.crisis && lab.status !== "offline" && !document.hidden) {
    const crewInLab = game.crewAssignments.lab;
    const crewMember = crewInLab ? game.crew.find(c => c.id === crewInLab) : null;
    const crewBonus = crewMember ? (1 + crewMember.skill / 200) : 1;
    const earned = (0.4 + lab.level * 0.2) * (r.energy / 100) * aiMul * antMul * b.rpLabBoost * crewBonus + b.rpRegen;
    game.rp += earned;
    el("rpDisplay").textContent = Math.floor(game.rp);
  }

  Object.keys(r).forEach(k => { r[k] = Math.max(0, Math.min(100, r[k])); });
}

// ───────────────────────── CRISES ─────────────────────────
function maybeTriggerCrisis() {
  const chance = 0.005 + game.sol * 0.00018;
  if (Math.random() > chance) return;
  const free = Object.keys(game.modules).filter(k => !game.modules[k].crisis);
  if (!free.length) return;
  const key  = free[Math.floor(Math.random() * free.length)];
  const mod  = game.modules[key];
  const type = mod.crises[Math.floor(Math.random() * mod.crises.length)];
  mod.crisis = type;
  log(`${crises[type].label} — ${mod.name}`, "crisis");
  showTicker(`⚠ ${crises[type].label} у "${mod.name}". Відкрита аварійна місія!`);
  // Породжуємо аварійну місію
  spawnEmergencyMission(type, key);
  if (currentPage === "missions") drawMissions();
}

function spawnEmergencyMission(crisisType, moduleKey) {
  const tpl = EMERGENCY_TEMPLATES[crises[crisisType].missionId];
  if (!tpl) return;
  const id = `emg_${Date.now()}`;
  // Час скорочується якщо є майстерня
  const workshopLv = hasBuilding("workshop") ? (game.buildings.workshop.level || 1) : 0;
  const timeMul = workshopLv > 0 ? Math.max(0.4, 1 - workshopLv * 0.2) : 1;
  game.emergencyMissions.push({
    id, icon:tpl.icon, name:tpl.name, desc:tpl.desc,
    time: Math.round(tpl.time * timeMul),
    reward:tpl.reward, type:tpl.type,
    done:false, active:false, progress:0,
    crisisType, moduleKey, isEmergency:true
  });
}

// ───────────────────────── MISSIONS ─────────────────────────
function tickMissions() {
  [...game.missions, ...game.emergencyMissions].forEach(m => {
    if (!m.active || m.done) return;
    m.progress = Math.min(m.time, m.progress + 1);
    if (m.progress >= m.time) finishMission(m);
  });
  if (currentPage === "missions") drawMissions();
}

function finishMission(m) {
  m.done = true; m.active = false;
  // Якщо аварійна — знімаємо кризу
  if (m.isEmergency && m.moduleKey) {
    game.modules[m.moduleKey].crisis = null;
    updatePins(); drawModuleList();
    log(`Кризу усунено через місію: ${game.modules[m.moduleKey].name}`, "ok");
    game._dailyCrisisFixed++;
  }
  if (m.evacStep === 3) {
    game.objectives.evac = true;
    log("Евакуація завершена! Екіпаж на шляху додому.", "upgrade");
    checkMainObjectives(); checkEnding(); return;
  }
  const rpBonus = hasTech("quantum") ? 1.5 : 1;
  if (m.type === "rp") {
    const earned = Math.round(m.reward * rpBonus);
    game.rp += earned;
    el("rpDisplay").textContent = Math.floor(game.rp);
    log(`"${m.name}" виконано! +${earned} RP`, "upgrade");
  } else {
    game.res[m.type] = Math.min(100, game.res[m.type] + m.reward);
    log(`"${m.name}" виконано! +${m.reward} ${resLabel[m.type]}`, "upgrade");
  }
  // Якщо місія повторювана — запам'ятовуємо sol, коли вона відновиться
  if (m.repeatAfter) {
    m.doneOnSol = game.sol;
    m.reopenOnSol = game.sol + m.repeatAfter;
  }
  // не рахуємо — це автоматична подія, не дія гравця
}

// ───────────────────────── PLANT ─────────────────────────
function tickPlant() {
  const p = game.plant;
  if (!p.growing || p.stage === 0 || p.stage > 4) return;
  const cfg = PLANT_STAGES[p.stage-1];
  if (!cfg.requires()) { if (currentPage === "plant") drawPlant(); return; }
  // Crew assigned to greenhouse boosts growth
  const crewInGH = game.crewAssignments.greenhouse;
  const crewBonus = crewInGH ? (1 + game.crew.find(c=>c.id===crewInGH)?.skill/150) : 1;
  const growlightLv = hasBuilding("growlight") ? (game.buildings.growlight.level || 1) : 0;
  const speedMul = (growlightLv > 0 ? (1 + growlightLv * 0.5) : 1) * crewBonus;
  p.stageProgress += (100 / cfg.duration) * speedMul;
  if (p.stageProgress >= 100) {
    p.stageProgress = 100; p.growing = false;
    log(`Етап "${cfg.name}" завершено!`, "upgrade");
    if (p.stage === 4) {
      p.stage = 5;
      game.objectives.plant = true;
      log("🌱 Перша рослина на Марсі виросла!", "upgrade");
      showTicker("🌱 НЕМОЖЛИВЕ СТАЛО МОЖЛИВИМ — перша рослина на Марсі!");
      checkMainObjectives(); checkEnding();
    } else {
      setTimeout(() => { if (!game.over) { p.stage++; p.stageProgress = 0; } if (currentPage === "plant") drawPlant(); }, 1500);
    }
  }
  if (currentPage === "plant") drawPlant();
}

function startPlantStage() {
  const p = game.plant;
  const cfg = PLANT_STAGES[p.stage-1];
  if (!cfg.requires()) return;
  p.growing = true;
  game.activityThisSol++;
  log(`Розпочато: "${cfg.name}"`, "warning");
  if (currentPage === "plant") drawPlant();
}

function drawPlant() {
  const p = game.plant;
  const pEl = el("plantPage");
  if (!pEl) return;
  const totalPct = p.stage === 5 ? 100 : p.stage === 0 ? 0 : Math.round(((p.stage-1)*100 + p.stageProgress)/4);
  const plantEmoji = p.stage === 5 ? "🌾" : p.stage >= 3 ? "🌿" : p.stage >= 2 ? "🌱" : p.stage >= 1 ? "🌰" : "🪨";
  const heroStatus = p.stage === 5 ? "Місія виконана. Марс може стати домом."
    : p.stage === 0 ? "Оранжерея готова. Розпочніть підготовку ґрунту."
    : p.growing ? `Етап ${p.stage} з 4 — ${Math.round(p.stageProgress)}%…`
    : `Етап ${p.stage} з 4 — очікує на запуск або умови`;
  pEl.innerHTML = `
    <div class="plant-hero">
      <div class="plant-visual">${plantEmoji}</div>
      <div style="flex:1">
        <div class="plant-title">ПЕРША РОСЛИНА НА МАРСІ</div>
        <div class="plant-subtitle">${heroStatus}</div>
        <div class="plant-overall"><div class="plant-overall-fill" style="width:${totalPct}%"></div></div>
        <div class="plant-overall-label">${totalPct}% — ${p.stage === 5 ? "ЗАВЕРШЕНО" : `Sol ${game.sol}`}</div>
      </div>
    </div>
    <div class="plant-stages">
      ${PLANT_STAGES.map((cfg, i) => {
        const stageNum = i+1;
        const isDone   = p.stage > stageNum || p.stage === 5;
        const isActive = p.stage === stageNum;
        const cls = isDone ? "is-done" : isActive ? "is-active" : "is-locked";
        const progress = isActive ? p.stageProgress : isDone ? 100 : 0;
        const canStart = isActive && !p.growing && cfg.requires();
        const missingReqs = isActive && !cfg.requires();
        return `
          <div class="stage-card ${cls}">
            <div class="stage-num">ЕТАП 0${stageNum}</div>
            <div class="stage-icon">${cfg.icon}</div>
            <div class="stage-name">${cfg.name}</div>
            <div class="stage-req">${cfg.requiresText}</div>
            <div class="stage-bar"><div class="stage-bar-fill" style="width:${progress}%"></div></div>
            <div class="stage-status">${isDone?"✓ Завершено":isActive&&p.growing?`Росте… ${Math.round(p.stageProgress)}%`:isActive?"Готовий до запуску":"Заблоковано"}</div>
            ${isActive && !isDone ? `<button class="stage-btn" onclick="startPlantStage()" ${canStart?"":"disabled"}>${p.growing?"Росте…":missingReqs?"Умови не виконані":"▶ ПОЧАТИ"}</button>` : ""}
            ${missingReqs ? `<p class="hint" style="margin-top:6px">Потрібно: ${cfg.requiresText}</p>` : ""}
          </div>`;
      }).join("")}
    </div>`;
}

// ───────────────────────── EXPLORE ─────────────────────────
function tickExplore() {
  game.zones.forEach(zone => {
    if (!zone.unlocking || zone.open) return;
    zone.progress++;
    if (zone.progress >= EXPLORE_T) {
      zone.open = true; zone.unlocking = false;
      applyZoneBonus(zone);
      game._dailyZoneOpened++;
      // не рахуємо — автоматична подія
      log(`Зону "${zone.name}" відкрито! ${zone.bonus}`, "upgrade");
      checkMainObjectives();
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
  game.activityThisSol++;
  log(`Розпочато дослідження: "${zone.name}"`, "warning");
  drawExplore();
}

function drawExplore() {
  const cells = Array(3).fill(null).map(() => Array(4).fill(null));
  game.zones.forEach(z => { cells[z.top][z.left] = z; });
  el("exploreMap").innerHTML = cells.flat().map(zone => {
    if (!zone) return `<div class="zone is-locked"><div class="zone-fog">▓</div></div>`;
    if (zone.open) return `<div class="zone is-open"><div><div class="zone-icon">${zone.icon}</div><div class="zone-name">${zone.name}</div><div class="zone-bonus">${zone.desc}</div></div><div class="zone-explored">✓ ${zone.bonus}</div></div>`;
    if (zone.unlocking) {
      const pct = Math.round((zone.progress/EXPLORE_T)*100);
      return `<div class="zone is-unlocking"><div><div class="zone-icon">${zone.icon}</div><div class="zone-name">${zone.name}</div></div><div><div class="zone-cost">${EXPLORE_T-zone.progress}с…</div><div class="zone-progress"><div class="zone-progress-fill" style="width:${pct}%"></div></div></div></div>`;
    }
    const parentOk = !zone.needs || game.zones.find(z => z.id === zone.needs)?.open;
    const canBuy   = parentOk && game.rp >= zone.cost;
    if (!parentOk) return `<div class="zone is-locked"><div class="zone-fog">?</div><div><div class="zone-name">${zone.name}</div><div class="zone-cost">Відкрий сусідню</div></div></div>`;
    return `<div class="zone ${canBuy?"is-available":"is-locked"}" ${canBuy?`onclick="startExplore('${zone.id}')"`:""}>
      <div><div class="zone-icon">${zone.icon}</div><div class="zone-name">${zone.name}</div><div class="zone-bonus">${zone.desc}</div></div>
      <div><div class="zone-bonus" style="color:#666">${zone.bonus}</div><div class="zone-cost">${zone.cost} RP${!canBuy?` (є ${Math.floor(game.rp)})`:""})</div></div>
    </div>`;
  }).join("");
}

// ───────────────────────── DAILY TASKS ─────────────────────────
function generateDailyTasks() {
  game.dailyTasks = [...DAILY_POOL].sort(() => Math.random()-0.5)
    .slice(0,3).map(t => ({ ...t, claimed:false }));
  if (currentPage === "missions") drawMissions();
  log(`Нові завдання на Sol ${game.sol}.`, "warning");
}

function claimDailyTask(idx) {
  const t = game.dailyTasks[idx];
  if (!t || t.claimed || !t.check()) return;
  t.claimed = true;
  game.rp += t.reward;
  el("rpDisplay").textContent = Math.floor(game.rp);
  game.activityThisSol++;
  log(`Завдання: "${t.desc}" +${t.reward} RP`, "upgrade");
  drawMissions();
}

// ───────────────────────── TRADE ─────────────────────────
function checkTradeArrival() {
  if (game.sol >= game.tradeNextSol) {
    game.tradeAvailable = true;
    game.tradeOffer = TRADE_OFFERS[Math.floor(Math.random()*TRADE_OFFERS.length)];
    game.tradeNextSol = game.sol + 6 + Math.floor(Math.random()*3);
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
  game.activityThisSol++;
  log("Торгівля завершена.", "ok");
  drawMissions();
}

function declineTrade() {
  game.tradeAvailable = false; game.tradeOffer = null;
  log("Торгову пропозицію відхилено.", "");
  drawMissions();
}

// ───────────────────────── MAIN OBJECTIVES ─────────────────────────
function checkMainObjectives() {
  const objs = game.mainObjectives;
  // Ціль 1: вижити 10 солів
  if (!objs[0].done && game.sol >= 10) {
    objs[0].done = true;
    game.objectives.survive = true;
    objs[1].active = true;
    log("✓ ЦІЛЬ 1: 10 солів виживання!", "upgrade");
    showTicker("✓ Ціль 1 виконана: 10 солів пережито!");
  }
  // Ціль 2: рослина
  if (!objs[1].done && game.objectives.plant && objs[1].active) {
    objs[1].done = true;
    objs[2].active = true;
    log("✓ ЦІЛЬ 2: перша рослина!", "upgrade");
  }
  // Ціль 3: всі зони
  if (!objs[2].done && objs[2].active) {
    const allZones = game.zones.every(z => z.open);
    if (allZones) {
      objs[2].done = true;
      game.objectives.zones = true;
      objs[3].active = true;
      log("✓ ЦІЛЬ 3: всі зони досліджені!", "upgrade");
      showTicker("✓ Ціль 3: всі зони Марса досліджені!");
    }
  }
  // Ціль 4: всі будівлі
  if (!objs[3].done && objs[3].active) {
    const allBuilt = Object.values(game.buildings).every(b => b.built);
    if (allBuilt) {
      objs[3].done = true;
      game.objectives.buildings = true;
      objs[4].active = true;
      log("✓ ЦІЛЬ 4: всі будівлі побудовані!", "upgrade");
      showTicker("✓ Ціль 4: база повністю побудована!");
    }
  }
  // Ціль 5: евакуація
  if (!objs[4].done && objs[4].active && game.objectives.evac) {
    objs[4].done = true;
    log("✓ ЦІЛЬ 5: евакуація виконана!", "upgrade");
    checkEnding();
  }
  drawObjectives();
}

function drawObjectives() {
  const objs = game.mainObjectives;
  el("objectivesPanel").innerHTML = objs.map((o, i) => {
    const statusIcon = o.done ? "✓" : o.active ? "◈" : "○";
    const cls = o.done ? "obj-done" : o.active ? "obj-active" : "obj-locked";
    return `
      <div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:7px;font-size:11px;">
        <span class="${cls}" style="flex-shrink:0">${statusIcon}</span>
        <div>
          <span class="${cls}" style="font-weight:700">${o.icon} ${o.title}</span>
          ${o.active && !o.done ? `<div style="font-size:10px;color:#4a2e20;margin-top:1px">${o.desc}</div>` : ""}
        </div>
      </div>`;
  }).join("");
}

// ───────────────────────── ENDINGS ─────────────────────────
function checkEnding() {
  const { plant, survive, evac, zones, buildings } = game.objectives;
  const doneCount = [plant, survive, evac, zones, buildings].filter(Boolean).length;
  if (doneCount === 5) { triggerEnding("full"); return; }
  if (plant && evac && !crewAlive()) { triggerEnding("bitter"); return; }
  if (evac && !plant) { triggerEnding("sacrifice"); return; }
}

function crewAlive() { return game.crew.some(c => c.health > 0); }

function triggerEnding(type) {
  if (game.over) return;
  game.over = true; game.ending = type;
  const endings = {
    full:      { glyph:"🏆", title:"ПОВНА ПЕРЕМОГА",         color:"#3ddc84", text:"Усі 5 цілей виконано.\nРослина виросла. Зони досліджені. База побудована.\nЕкіпаж евакуйовано. ARES-7 — легенда." },
    bitter:    { glyph:"🌱", title:"ГІРКО-СОЛОДКА ПЕРЕМОГА", color:"#ffb347", text:"Рослина виросла на Марсі.\nАле екіпаж не вижив, щоб це побачити.\nВони знали, на що йшли." },
    sacrifice: { glyph:"🚀", title:"ЖЕРТОВНА ПЕРЕМОГА",      color:"#4ab3ff", text:"Екіпаж евакуйовано живими.\nРослина залишилась на Марсі — самотня,\nале жива. Місія буде продовжена." },
    defeat:    { glyph:"☠",  title:"МІСІЯ ПРОВАЛЕНА",         color:"#ff3d3d", text:"Ресурси вичерпано. Зв'язок втрачено.\nEкіпаж не вижив." }
  };
  const e = endings[type];
  el("endGlyph").textContent  = e.glyph;
  el("endTitle").textContent  = e.title;
  el("endTitle").style.color  = e.color;
  el("endReason").textContent = e.text;
  el("finalSol").textContent  = game.sol;
  el("finalRp").textContent   = Math.floor(game.rp);
  el("gameOverScreen").classList.remove("hidden");
}

// ───────────────────────── CREW ─────────────────────────
function dailyCrewTick() {
  const medlabLv = hasBuilding("medlab") ? (game.buildings.medlab.level || 1) : 0;
  const suit = hasTech("medsuit");
  const crewInMedlab = game.crewAssignments.medlab;
  game.crew.forEach(c => {
    const healRate = medlabLv > 0 ? 1.5 * medlabLv : -0.8;
    const suitMul  = suit ? 0.4 : 1;
    const crewHealBonus = (crewInMedlab === c.id) ? 1.5 : 1;
    c.health = Math.max(0, Math.min(100, c.health + healRate * suitMul * crewHealBonus));
    c.morale = Math.max(0, Math.min(100, c.morale + Math.random()*4 - 2));
  });
  if (currentPage === "crew") drawCrew();
}

function drawCrew() {
  el("crewGrid").innerHTML = game.crew.map(c => {
    const hCol = c.health < 30 ? "#ff3d3d" : c.health < 60 ? "#ffb347" : "#e85d04";
    const mCol = c.morale < 30 ? "#ff3d3d" : c.morale < 60 ? "#ffb347" : "#886600";
    // Знаходимо де призначений
    const assignedWhere = Object.entries(game.crewAssignments).find(([,v]) => v === c.id);
    const bldName = assignedWhere ? (game.buildings[assignedWhere[0]]?.name || assignedWhere[0]) : null;

    // Опції призначення
    const assignOptions = Object.entries(game.crewAssignments)
      .filter(([k]) => game.buildings[k]?.built || k === "lab" || k === "greenhouse")
      .map(([k]) => {
        const name = game.buildings[k]?.name || (k === "lab" ? "Лабораторія" : "Оранжерея");
        const occupied = game.crewAssignments[k] && game.crewAssignments[k] !== c.id;
        return `<option value="${k}" ${assignedWhere?.[0]===k?"selected":""} ${occupied?"disabled":""}>
          ${name}${occupied?" (зайнято)":""}
        </option>`;
      }).join("");

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
        <div class="crew-task">◈ ${bldName ? `Призначено: ${bldName}` : c.task}</div>
        <div style="margin-top:8px">
          <select class="crew-assign-sel" onchange="assignCrew('${c.id}', this.value)" style="width:100%;background:rgba(20,10,5,0.9);border:1px solid #3a1a0a;color:#8a5c44;font-family:'Share Tech Mono',monospace;font-size:10px;padding:4px 6px;cursor:pointer;">
            <option value="">— без призначення —</option>
            ${assignOptions}
          </select>
        </div>
      </div>`;
  }).join("");
}

function assignCrew(crewId, buildingKey) {
  // Знімаємо попереднє призначення цього члена екіпажу
  Object.keys(game.crewAssignments).forEach(k => {
    if (game.crewAssignments[k] === crewId) game.crewAssignments[k] = null;
  });
  if (buildingKey) {
    game.crewAssignments[buildingKey] = crewId;
    const bldName = game.buildings[buildingKey]?.name || buildingKey;
    const crew = game.crew.find(c => c.id === crewId);
    log(`${crew?.name} призначено до: ${bldName}`, "ok");
  }
  game.activityThisSol++;
  drawCrew();
}

// ───────────────────────── BUILDINGS ─────────────────────────
function drawBuildings() {
  el("buildingsGrid").innerHTML = Object.entries(game.buildings).map(([key, b]) => {
    const canBuy = !b.built && game.rp >= b.cost;
    const lvlCol = b.built ? lvlColors[Math.min(b.level, 5)] : "#4a2e20";
    const upgcost = bldUpgCost(b.level);
    const canUpg = b.built && b.level < b.maxLevel && game.rp >= upgcost;
    return `
      <div class="card" style="${b.built ? `border-color:${lvlCol}30` : ""}">
        <div class="card-icon">${b.icon}</div>
        <div class="card-title" style="${b.built ? `color:${lvlCol}` : ""}">${b.name} ${b.built ? `<span style="font-size:10px;color:${lvlCol}">Lv${b.level}</span>` : ""}</div>
        <div class="card-desc">${b.desc}</div>
        ${!b.built ? `<div class="card-cost">${b.cost} RP</div>` : ""}
        ${b.built ? `
          <div class="bld-level-bar">
            ${Array.from({length:b.maxLevel},(_,i)=>`<div class="bld-lv-pip ${i<b.level?"active":""}" style="${i<b.level?`background:${lvlCol}`:""}"></div>`).join("")}
          </div>
          <div style="font-size:10px;color:#4a2e20;margin-bottom:6px">Lv${b.level}/${b.maxLevel} — ${lvlNames[Math.min(b.level,5)]}</div>
        ` : ""}
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          ${!b.built ? `<button class="card-btn" onclick="build('${key}')" ${canBuy?"":"disabled"}>${canBuy?"Побудувати":"Потрібно "+b.cost+" RP"}</button>` : ""}
          ${b.built && b.level < b.maxLevel ? `<button class="card-btn" onclick="upgradeBuilding('${key}')" ${canUpg?"":"disabled"}>▲ Lv${b.level+1} (${upgcost} RP)</button>` : ""}
          ${b.built && b.level >= b.maxLevel ? `<div class="card-btn is-built" style="cursor:default">★ Макс рівень</div>` : ""}
        </div>
        ${!b.built && !canBuy ? `<p class="hint">Потрібно ${b.cost} RP (є ${Math.floor(game.rp)})</p>` : ""}
      </div>`;
  }).join("");
}

function build(key) {
  const b = game.buildings[key];
  if (b.built || game.rp < b.cost) return;
  game.rp -= b.cost; b.built = true;
  el("rpDisplay").textContent = Math.floor(game.rp);
  game._dailyUpgraded++;
  game.activityThisSol++;
  log(`Побудовано: ${b.name}`, "upgrade");
  checkMainObjectives();
  drawBuildings();
}

function upgradeBuilding(key) {
  const b = game.buildings[key];
  if (!b.built || b.level >= b.maxLevel) return;
  const cost = bldUpgCost(b.level);
  if (game.rp < cost) return;
  game.rp -= cost; b.level++;
  el("rpDisplay").textContent = Math.floor(game.rp);
  game._dailyUpgraded++;
  game.activityThisSol++;
  log(`${b.name} → Lv${b.level}`, "upgrade");
  drawBuildings();
}

// ───────────────────────── MISSIONS PAGE ─────────────────────────
function drawMissions() {
  const evac1Done = game.missions.find(m => m.evacStep===1)?.done;
  const evac2Done = game.missions.find(m => m.evacStep===2)?.done;

  // Аварійні місії (активні)
  const emergCards = game.emergencyMissions.filter(m => !m.done).map(m => {
    const pct = Math.round((m.progress/m.time)*100);
    return `
      <div class="card" style="border-color:rgba(255,61,61,0.5);background:rgba(60,10,5,0.5);grid-column:1/-1">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
          <div class="card-icon" style="margin:0">${m.icon}</div>
          <div class="card-title" style="color:#ff3d3d;margin:0">⚠ АВАРІЯ: ${m.name}</div>
        </div>
        <div class="card-desc">${m.desc}</div>
        <div class="mission-reward">${m.type==="rp"?`+${m.reward} RP`:`+${m.reward} ${resLabel[m.type]}`}</div>
        ${m.active ? `<div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>` : ""}
        <button class="card-btn" style="border-color:#ff3d3d;color:#ff3d3d" onclick="startEmergencyMission('${m.id}')" ${m.active?"disabled":""}>
          ${m.active ? `Виконується… ${m.time-m.progress}с` : "⚡ ВИКОНАТИ АВАРІЙНУ МІСІЮ"}
        </button>
      </div>`;
  }).join("");

  const mCards = game.missions.map(m => {
    // Евакуація відкривається лише після всіх зон АБО всіх будівель
    const evacUnlocked = game.objectives.zones || game.objectives.buildings;
    const reqOk = m.evacStep
      ? ( evacUnlocked &&
          (m.evacStep === 1 ? game.buildings["antenna"]?.built : true) &&
          (m.evacStep >= 2 ? game.buildings["garage"]?.built : true) &&
          (m.evacStep === 3 ? (evac1Done && evac2Done) : true) )
      : (!m.needs || game.buildings[m.needs]?.built);
    // Пропускаємо пусті — ті що done і без нагороди
    if (m.done && m.reward === 0 && !m.evacStep) return "";
    const pct = Math.round((m.progress/m.time)*100);
    const prize = m.cost && m.cost > 0
      ? `⚠ Вартість: ${m.cost} RP`
      : m.type==="rp" ? `+${m.reward} RP` : m.reward>0 ? `+${m.reward} ${resLabel[m.type]}` : "Евакуація";
    const cantAfford = m.cost && m.cost > 0 && game.rp < m.cost;
    let btnTxt, btnCls, disabled;
    const reopenIn = m.done && m.repeatAfter && m.reopenOnSol ? `↻ Sol ${m.reopenOnSol}` : "✓ Виконано";
    if (m.done)        { btnTxt=reopenIn; btnCls="is-built"; disabled=true; }
    else if (m.active) { btnTxt=`${m.time-m.progress}с…`; btnCls="in-progress"; disabled=true; }
    else if (!reqOk) {
      if (m.evacStep && !evacUnlocked) {
        btnTxt = "🔒 Спочатку всі зони або всі будівлі";
      } else if (m.evacStep === 3) {
        btnTxt = "Спочатку Сигнал і Капсула";
      } else if (m.needs && !game.buildings[m.needs]?.built) {
        btnTxt = `Потрібно: ${game.buildings[m.needs]?.name||m.needs}`;
      } else {
        btnTxt = "🔒 Недоступно";
      }
      btnCls=""; disabled=true;
    }
    else if (cantAfford){ btnTxt=`Не вистачає RP (${m.cost} RP)`; btnCls=""; disabled=true; }
    else               { btnTxt=m.cost&&m.cost>0?`Розпочати (−${m.cost} RP)`:"Розпочати"; btnCls=""; disabled=false; }
    const isEvac = !!m.evacStep;
    return `
      <div class="card" ${isEvac?'style="border-color:rgba(74,179,255,0.4)"':""}>
        <div class="card-icon">${m.icon}</div>
        <div class="card-title" ${isEvac?'style="color:#4ab3ff"':""}>${m.name}</div>
        <div class="card-desc">${m.desc}</div>
        <div class="mission-reward">${prize}</div>
        ${m.active ? `<div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>` : ""}
        <button class="card-btn ${btnCls}" onclick="startMission('${m.id}')" ${disabled?"disabled":""}>${btnTxt}</button>
      </div>`;
  }).join("");

  const daily = game.dailyTasks.length ? `
    <div class="card" style="grid-column:1/-1;border-color:rgba(255,179,71,0.3);background:rgba(255,179,71,0.04)">
      <div class="card-title" style="color:#ffb347">📋 ЗАВДАННЯ — Sol ${game.sol}</div>
      ${game.dailyTasks.map((t,i) => `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:7px 0;border-bottom:1px solid rgba(255,255,255,0.04)">
          <span style="font-size:12px;color:${t.claimed?"#4a2e20":t.check()?"#ffb347":"#8a5c44"}">${t.claimed?"✓ ":""}${t.desc}</span>
          <button class="card-btn" style="width:auto;padding:4px 10px;font-size:10px" onclick="claimDailyTask(${i})" ${t.claimed||!t.check()?"disabled":""}>
            ${t.claimed?"Отримано":`+${t.reward} RP`}
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
        <button class="card-btn" onclick="acceptTrade()" ${game.rp<game.tradeOffer.cost?"disabled":""}>✓ Прийняти</button>
        <button class="card-btn" onclick="declineTrade()" style="border-color:#3a1a0a;color:#4a2e20">✗ Відхилити</button>
      </div>
      ${game.rp<game.tradeOffer.cost?`<p class="hint">Потрібно ${game.tradeOffer.cost} RP</p>`:""}
    </div>` : "";

  el("missionsGrid").innerHTML = emergCards + trade + daily + mCards;
}

function startMission(id) {
  const m = game.missions.find(x => x.id === id);
  if (!m || m.active || m.done) return;
  // Якщо місія має вартість — списуємо RP
  if (m.cost && m.cost > 0) {
    if (game.rp < m.cost) { log(`Не вистачає RP для місії "${m.name}". Потрібно ${m.cost} RP.`, "warning"); return; }
    game.rp -= m.cost;
    el("rpDisplay").textContent = Math.floor(game.rp);
    log(`Витрачено ${m.cost} RP на "${m.name}"`, "warning");
  }
  m.active = true; m.progress = 0;
  game._dailyMissionStarted++;
  game.activityThisSol++;
  log(`Місія розпочата: ${m.name}`, "warning");
  drawMissions();
}

function startEmergencyMission(id) {
  const m = game.emergencyMissions.find(x => x.id === id);
  if (!m || m.active || m.done) return;
  m.active = true; m.progress = 0;
  game._dailyMissionStarted++;
  game.activityThisSol++;
  log(`Аварійна місія: ${m.name}`, "warning");
  drawMissions();
}

// ───────────────────────── RESEARCH ─────────────────────────
function drawResearch() {
  el("researchTree").innerHTML = [1,2,3].map(tier => `
    <div>
      <div class="tier-label">РІВЕНЬ ${tier}</div>
      <div class="tier-row">
        ${game.tech.filter(t => t.tier===tier).map(t => {
          const ok  = t.needs.every(id => game.tech.find(x => x.id===id)?.done);
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
                   <button class="rcard-btn" onclick="research('${t.id}')" ${can?"":"disabled"}>
                     ${ok?"ВІДКРИТИ":"🔒 Спочатку попередні"}
                   </button>`}
            </div>`;
        }).join("")}
      </div>
    </div>`).join("");
}

function research(id) {
  const t = game.tech.find(x => x.id===id);
  if (!t || t.done || game.rp < t.cost) return;
  if (!t.needs.every(nid => game.tech.find(x => x.id===nid)?.done)) return;
  game.rp -= t.cost; t.done = true;
  el("rpDisplay").textContent = Math.floor(game.rp);
  game._dailyUpgraded++;
  game.activityThisSol++;
  log(`Відкрито: ${t.name}`, "upgrade");
  drawResearch();
}

// ───────────────────────── MODULE MODAL ─────────────────────────
function openModule(key) {
  const mod = game.modules[key];
  if (!mod) return;
  game.paused = true;
  const cost = upgCost(mod.level);
  const maxed = mod.level >= 5;
  const canUpgrade = !maxed && game.rp >= cost;
  const lvlCol = lvlColors[Math.min(mod.level, 5)];
  // Аварійні місії для цього модуля
  const pendingEmg = game.emergencyMissions.filter(m => m.moduleKey === key && !m.done);

  el("modalTitle").textContent = mod.name;
  el("modalBody").innerHTML = `
    <p><strong>Статус:</strong> <span class="modal-status ${mod.crisis?"critical":"ok"}">${mod.crisis?"Криза":"Норма"}</span></p>
    <p><strong>Рівень:</strong> <span style="color:${lvlCol}">${lvlNames[mod.level]} (${mod.level}/5)</span></p>
    ${mod.crisis ? `<p style="color:#ff7755">${crises[mod.crisis]?.desc||""}</p>` : ""}
    <hr>
    ${pendingEmg.length ? `
      <div style="background:rgba(255,61,61,0.1);border:1px solid rgba(255,61,61,0.4);padding:10px;margin-bottom:10px">
        <div style="color:#ff3d3d;font-size:12px;font-weight:700;margin-bottom:6px">⚠ ВІДКРИТА АВАРІЙНА МІСІЯ</div>
        ${pendingEmg.map(m => `
          <div style="font-size:11px;color:#f0cdb8;margin-bottom:4px">${m.icon} ${m.name}</div>
          <button class="btn-crisis" style="animation:none;background:rgba(255,61,61,0.2)" onclick="startEmgFromModal('${m.id}')">
            ${m.active ? `Виконується… ${m.time-m.progress}с` : "⚡ ВІДКРИТИ В МІСІЯХ"}
          </button>`).join("")}
      </div>` : ""}
    ${mod.crisis && pendingEmg.length===0 ? `<button class="btn-crisis" onclick="fixCrisis('${key}')">⚡ УСУНУТИ ВРУЧНУ (без нагороди)</button>` : ""}
    ${maxed ? `<p style="color:${lvlCol};font-size:12px;margin-top:10px">★ Максимальний рівень</p>`
      : `<button class="btn-upgrade" onclick="upgrade('${key}')" ${canUpgrade?"":"disabled"}>
           ▲ Покращити до рівня ${mod.level+1} (${cost} RP) <span style="color:${lvlColors[mod.level+1]}">→ ${lvlNames[mod.level+1]}</span>
         </button>
         ${!canUpgrade?`<p class="hint" style="margin-top:6px">Потрібно ${cost} RP, є ${Math.floor(game.rp)}</p>`:""}`}
  `;
  el("modal").classList.add("open");
}

function startEmgFromModal(id) {
  closeModal();
  goTo("missions");
  setTimeout(() => startEmergencyMission(id), 100);
}

function fixCrisis(key) {
  game.modules[key].crisis = null;
  game._dailyCrisisFixed++;
  log(`Кризу усунено вручну: ${game.modules[key].name}`, "ok");
  closeModal();
}

function upgrade(key) {
  const mod = game.modules[key];
  const cost = upgCost(mod.level);
  if (game.rp < cost || mod.level >= 5) return;
  game.rp -= cost; mod.level++;
  el("rpDisplay").textContent = Math.floor(game.rp);
  game._dailyUpgraded++;
  game.activityThisSol++;
  log(`${mod.name} → Lv${mod.level} (${lvlNames[mod.level]})`, "upgrade");
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
    if (e.key==="Enter" || e.key===" ") { e.preventDefault(); openModule(pin.dataset.module); }
  });
});

// ───────────────────────── DEFEAT CHECK ─────────────────────────
function checkDefeat() {
  if (game.over) return;
  for (const [key, val] of Object.entries(game.res)) {
    if (val <= 0) { triggerEnding("defeat"); return; }
  }
  if (!crewAlive()) { triggerEnding("defeat"); return; }
}

// ───────────────────────── RESTART ─────────────────────────
function restart() {
  game.sol=1; game.rp=0; game.over=false; game.ending=null; game.paused=false;
  game.hour=6; game.min=0; game.activityThisSol=0; game.rpIdleWarned=false;
  Object.assign(game.res, { oxygen:78, water:54, energy:63 });
  Object.values(game.modules).forEach(m => { m.status="ok"; m.level=1; m.crisis=null; });
  Object.entries(game.buildings).forEach(([,b]) => { b.built=false; b.level=1; });
  game.tech.forEach(t => { t.done=false; });
  game.missions.forEach(m => { m.done=false; m.active=false; m.progress=0; m.doneOnSol=null; m.reopenOnSol=null; });
  game.emergencyMissions.length = 0;
  game.zones.forEach(z => { z.open=z.id==="base_area"; z.unlocking=false; z.progress=0; });
  game.crew.forEach(c => { c.health=80+Math.random()*15; c.morale=70+Math.random()*20; c.assignedTo=null; });
  Object.keys(game.crewAssignments).forEach(k => { game.crewAssignments[k]=null; });
  Object.assign(game.zoneBonuses, { waterRegen:0, rpRegen:0, energyBoost:1, rpLabBoost:1 });
  Object.assign(game.objectives, { plant:false, survive:false, evac:false, zones:false, buildings:false });
  Object.assign(game.plant, { stage:1, stageProgress:0, growing:false });
  game.mainObjectives.forEach((o,i) => { o.done=false; o.active=i===0; });
  game.dailyTasks=[]; game.tradeAvailable=false; game.tradeOffer=null; game.tradeNextSol=7;
  game._dailyCrisisFixed=0; game._dailyMissionStarted=0; game._dailyUpgraded=0; game._dailyZoneOpened=0;

  el("solDisplay").textContent=1;
  el("rpDisplay").textContent=0;
  el("eventLog").innerHTML="";
  el("gameOverScreen").classList.add("hidden");
  goTo("home");
  drawResources(); drawModuleList(); updatePins(); drawObjectives();
  generateDailyTasks();
  log("Місія розпочалась. Удачі, командире.", "ok");
  showTicker();
  buildIntro();
}

el("restartBtn").addEventListener("click", restart);

// ───────────────────────── MAIN LOOP ─────────────────────────
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

document.addEventListener("DOMContentLoaded", () => {
  game.plant.stage = 1;
  drawResources(); drawModuleList(); updatePins();
  generateDailyTasks(); drawObjectives();
  log("Місія розпочалась. Удачі, командире.", "ok");
  showTicker();
  buildIntro();
  setInterval(loop, 1000);
});
