// ============================
// ARES-7 — Hellas Planitia
// Марсіанський симулятор виживання
// ============================

// Скорочення для getElementById
const q = (id) => document.getElementById(id);

// Вступні слайди при запуску
function intro() {
  const scr = document.createElement('div');
  scr.id = 'isc';
  scr.style.cssText =
    "position:fixed;inset:0;background:#0d0704;z-index:9998;display:flex;align-items:center;justify-content:center;font-family:'Share Tech Mono',monospace";
  const slides = [
    {
      icon: '◈',
      title: 'ARES-7 — HELLAS PLANITIA',
      text: "Sol 1. Ваша база щойно приземлилась на Марс.\nЗв'язок із Землею — 20 хвилин затримки.\nЕкіпаж: 6 осіб. Ресурси: критично обмежені.",
    },
    {
      icon: '🎯',
      title: "П'ЯТЬ ЦІЛЕЙ МІСІЇ",
      text: '① Виростити першу рослину на Марсі\n② Протриматись 10 солів\n③ Дослідити всі зони поверхні\n④ Побудувати всі будівлі\n⑤ Евакуювати екіпаж',
    },
    {
      icon: '⚠',
      title: 'ЯК ВИЖИТИ',
      text: '• Стежте за киснем, водою та енергією\n• Без активності — немає RP!\n• Криза в модулі → відкриває аварійну місію\n• Вночі сонячні панелі не працюють\n• Екіпаж потрібен для місій і будівель',
    },
    {
      icon: '🌱',
      title: 'ПЕРША РОСЛИНА',
      text: 'Головна ціль — виростити живу рослину.\nЧотири етапи: ґрунт → насіння → ріст → збір.\nКожен потребує ресурсів, техів і часу.\n\nУдачі, командире.',
    },
  ];
  let i = 0;
  const box = document.createElement('div');
  box.style.cssText =
    'max-width:520px;width:92%;background:rgba(22,11,6,0.98);border:1px solid #e85d04;padding:32px 28px;text-align:center;box-sizing:border-box';
  function draw() {
    const s = slides[i];
    box.innerHTML = `<div style="font-size:38px;margin-bottom:14px">${s.icon}</div>
      <div style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;letter-spacing:2px;color:#ffb347;text-transform:uppercase;margin-bottom:16px">${s.title}</div>
      <div style="font-size:13px;color:#c49070;line-height:1.85;white-space:pre-line;margin-bottom:24px;text-align:left">${s.text}</div>
      <div style="display:flex;justify-content:center;gap:6px;margin-bottom:20px">
        ${slides.map((_, j) => `<div style="width:24px;height:3px;background:${j === i ? '#e85d04' : '#3a1a0a'}"></div>`).join('')}
      </div>
      <button style="padding:12px 32px;background:rgba(232,93,4,0.2);border:1px solid #e85d04;color:#f0cdb8;font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;letter-spacing:2px;text-transform:uppercase;cursor:pointer;width:100%">
        ${i < slides.length - 1 ? 'ДАЛІ →' : 'РОЗПОЧАТИ МІСІЮ'}
      </button>`;
    box.querySelector('button').onclick = () => {
      i < slides.length - 1 ? (i++, draw()) : scr.remove();
    };
  }
  draw();
  scr.appendChild(box);
  document.body.appendChild(scr);
}

// ============================
// Глобальний стан гри (G)
// ============================
const G = {
  sol: 1,
  rp: 0,
  paused: false,
  over: false,
  h: 6,      // година 0–9 (марсіанський день = 10 год)
  m: 0,
  res: { o2: 78, h2o: 54, en: 63 },

  // Модулі бази — рівень, стан, кризи
  mods: {
    habitat: {
      name: 'Житловий модуль',
      status: 'ok',
      lv: 1,
      crisis: null,
      drain: { o2: 0.04 },
      crises: ['fire', 'leak'],
      col: 'orange',
    },
    greenhouse: {
      name: 'Оранжерея',
      status: 'ok',
      lv: 1,
      crisis: null,
      drain: { h2o: 0.03 },
      crises: ['drought', 'pest'],
      col: 'orange',
    },
    solar: {
      name: 'Сонячні панелі',
      status: 'ok',
      lv: 1,
      crisis: null,
      drain: { en: 0 },
      crises: ['dust_storm', 'malfunction'],
      col: 'orange',
    },
    lab: {
      name: 'Лабораторія',
      status: 'ok',
      lv: 1,
      crisis: null,
      drain: { en: 0.02 },
      crises: ['overload', 'leak'],
      col: 'orange',
    },
  },

  act: 0,       // дій за поточний Sol
  idlewarn: false,

  // Будівлі — будуються за RP
  bld: {
    recycler: {
      name: 'Переробник води',
      icon: '💧',
      cost: 140,
      built: false,
      lv: 1,
      max: 3,
      desc: 'Очищує воду з відходів. +0.05/тік за рівень',
    },
    garage: {
      name: 'Гараж транспорту',
      icon: '🚗',
      cost: 100,
      built: false,
      lv: 1,
      max: 3,
      desc: 'Розблоковує місії на поверхні та евакуацію',
    },
    medlab: {
      name: 'Медичний блок',
      icon: '⚕️',
      cost: 120,
      built: false,
      lv: 1,
      max: 3,
      desc: "Екіпаж відновлює +1.5 здоров'я щодня за рівень",
    },
    antenna: {
      name: "Антена зв'язку",
      icon: '📡',
      cost: 80,
      built: false,
      lv: 1,
      max: 3,
      desc: '+20% RP за рівень і потрібна для евакуації',
    },
    battery: {
      name: 'Акумуляторний блок',
      icon: '🔋',
      cost: 100,
      built: false,
      lv: 1,
      max: 3,
      desc: '+0.05 енергії вночі за рівень',
    },
    growlight: {
      name: 'Лампи росту',
      icon: '💡',
      cost: 140,
      built: false,
      lv: 1,
      max: 3,
      desc: 'Рослина росте швидше',
    },
    o2pump: {
      name: 'Кисневий насос',
      icon: '🌬️',
      cost: 130,
      built: false,
      lv: 1,
      max: 3,
      desc: '+0.03 кисню/тік за рівень',
    },
    workshop: {
      name: 'Ремонтний відсік',
      icon: '🔧',
      cost: 110,
      built: false,
      lv: 1,
      max: 3,
      desc: 'Кризи тривають менше',
    },
  },

  // 5 цілей місії — відкриваються послідовно
  goals: [
    {
      title: 'Вижити 10 солів',
      desc: 'Протримайтесь 10 повних солів',
      done: false,
      on: true,
      icon: '⏳',
    },
    {
      title: 'Виростити рослину',
      desc: 'Пройти всі 4 етапи в оранжереї',
      done: false,
      on: false,
      icon: '🌱',
    },
    {
      title: 'Дослідити всі зони',
      desc: 'Відкрити всі 11 зон поверхні',
      done: false,
      on: false,
      icon: '🗺️',
    },
    {
      title: 'Побудувати всі будівлі',
      desc: 'Збудувати всі 8 будівель бази',
      done: false,
      on: false,
      icon: '🏗️',
    },
    {
      title: 'Евакуація екіпажу',
      desc: 'Виконати всі 3 місії евакуації',
      done: false,
      on: false,
      icon: '🚀',
    },
  ],

  // Польові місії. rep = кулдаун у солях
  ms: [
    {
      id: 'survey',
      name: 'Розвідка кратера',
      icon: '🗺️',
      desc: 'Вивчити рельєф на схід від бази.',
      t: 30,
      rw: 40,
      tp: 'rp',
      done: false,
      on: false,
      pg: 0,
      need: null,
      rep: 3,
    },
    {
      id: 'sample',
      name: 'Збір ґрунту',
      icon: '🧪',
      desc: 'Зібрати зразки реголіту для лабораторії.',
      t: 25,
      rw: 30,
      tp: 'rp',
      done: false,
      on: false,
      pg: 0,
      need: null,
      rep: 3,
    },
    {
      id: 'repair',
      name: 'Ремонт труби',
      icon: '🔩',
      desc: 'Полагодити зовнішній водяний клапан.',
      t: 15,
      rw: 18,
      tp: 'h2o',
      done: false,
      on: false,
      pg: 0,
      need: null,
      rep: 2,
    },
    {
      id: 'o2patch',
      name: 'Ремонт кисневого шланга',
      icon: '💨',
      desc: 'Усунути мікровитік в житловому модулі.',
      t: 18,
      rw: 15,
      tp: 'o2',
      done: false,
      on: false,
      pg: 0,
      need: null,
      rep: 2,
    },
    {
      id: 'rover',
      name: 'Рейд на ровері',
      icon: '🚗',
      desc: 'Дослідити аномалію за три км від бази.',
      t: 45,
      rw: 80,
      tp: 'rp',
      done: false,
      on: false,
      pg: 0,
      need: 'garage',
      rep: 4,
    },
    {
      id: 'meteor',
      name: 'Аналіз метеорита',
      icon: '☄️',
      desc: 'Дослідити фрагменти біля посадкового майданчика.',
      t: 35,
      rw: 55,
      tp: 'rp',
      done: false,
      on: false,
      pg: 0,
      need: null,
      rep: 4,
    },
    {
      id: 'soiltest',
      name: 'Тест ґрунту',
      icon: '🌱',
      desc: 'Взяти проби для визначення складу ґрунту.',
      t: 20,
      rw: 25,
      tp: 'rp',
      done: false,
      on: false,
      pg: 0,
      need: null,
      rep: 3,
    },
    {
      id: 'solarfix',
      name: 'Чищення панелей',
      icon: '⚡',
      desc: 'Змести пил із сонячних панелей.',
      t: 12,
      rw: 12,
      tp: 'en',
      done: false,
      on: false,
      pg: 0,
      need: null,
      rep: 2,
    },
    {
      id: 'geology',
      name: 'Геологічна розвідка',
      icon: '⛏️',
      desc: 'Детальне картування мінеральних покладів.',
      t: 40,
      rw: 70,
      tp: 'rp',
      done: false,
      on: false,
      pg: 0,
      need: 'garage',
      rep: 4,
    },
    {
      id: 'seismic',
      name: 'Сейсмічні зонди',
      icon: '📡',
      desc: 'Встановити датчики коливань ґрунту.',
      t: 50,
      rw: 85,
      tp: 'rp',
      done: false,
      on: false,
      pg: 0,
      need: 'antenna',
      rep: 5,
    },
    {
      id: 'icedrill',
      name: 'Буріння льоду',
      icon: '❄️',
      desc: 'Дістатися до підземних льодовиків.',
      t: 55,
      rw: 30,
      tp: 'h2o',
      done: false,
      on: false,
      pg: 0,
      need: 'garage',
      rep: 5,
    },
    {
      id: 'atmoread',
      name: 'Аналіз атмосфери',
      icon: '🌪️',
      desc: 'Вивчити склад і тиск марсіанської атмосфери.',
      t: 30,
      rw: 45,
      tp: 'rp',
      done: false,
      on: false,
      pg: 0,
      need: null,
      rep: 3,
    },
    {
      id: 'relic',
      name: 'Дослідження реліквії',
      icon: '🛸',
      desc: "Вивчити аномальний об'єкт у кратері.",
      t: 60,
      rw: 100,
      tp: 'rp',
      done: false,
      on: false,
      pg: 0,
      need: 'garage',
      rep: 6,
    },
    // Евакуаційні місії — строго по порядку
    {
      id: 'evac1',
      name: 'Сигнал евакуації',
      icon: '📡',
      desc: 'Надіслати SOS-сигнал на Землю через антену.',
      evacDesc: '🔓 Відкривається після: всі будівлі до Lv3 АБО всі зони досліджені. Потрібна: Антена зв\'язку.',
      t: 35,
      rw: 0,
      tp: 'rp',
      cost: 150,
      done: false,
      on: false,
      pg: 0,
      need: 'antenna',
      ev: 1,
    },
    {
      id: 'evac2',
      name: 'Підготовка капсули',
      icon: '🚀',
      desc: 'Перевірити і заправити евакуаційну капсулу.',
      evacDesc: '🔓 Відкривається після: виконано «Сигнал евакуації». Потрібен: Гараж транспорту.',
      t: 45,
      rw: 0,
      tp: 'rp',
      cost: 250,
      done: false,
      on: false,
      pg: 0,
      need: 'garage',
      ev: 2,
    },
    {
      id: 'evac3',
      name: 'Евакуація екіпажу',
      icon: '🛸',
      desc: 'Запуск капсули — екіпаж залишає Марс.',
      evacDesc: '🔓 Відкривається після: виконано «Сигнал» і «Підготовка капсули». Потрібен: Гараж транспорту.',
      t: 60,
      rw: 0,
      tp: 'rp',
      cost: 400,
      done: false,
      on: false,
      pg: 0,
      need: 'garage',
      ev: 3,
    },
  ],

  emg: [], // активні аварійні місії

  // Дерево технологій — tier = рядок у дереві
  tech: [
    {
      id: 'atmo',
      tier: 1,
      name: 'Атмосферний фільтр',
      icon: '💨',
      desc: 'Кисень -20% витрат',
      cost: 90,
      done: false,
      needs: [],
    },
    {
      id: 'hydro',
      tier: 1,
      name: 'Гідропоніка',
      icon: '🌱',
      desc: 'Оранжерея дає воду',
      cost: 90,
      done: false,
      needs: [],
    },
    {
      id: 'solar2',
      tier: 1,
      name: 'Ефективні панелі',
      icon: '⚡',
      desc: 'Енергія +30%',
      cost: 100,
      done: false,
      needs: [],
    },
    {
      id: 'biotech',
      tier: 1,
      name: 'Марсіанська біологія',
      icon: '🔬',
      desc: 'Розблоковує Етап 2',
      cost: 110,
      done: false,
      needs: [],
    },
    {
      id: 'recycling',
      tier: 1,
      name: 'Замкнутий цикл',
      icon: '♻️',
      desc: 'Переробник +50%',
      cost: 80,
      done: false,
      needs: [],
    },
    {
      id: 'medsuit',
      tier: 2,
      name: 'Захисний костюм',
      icon: '🧑‍🚀',
      desc: "Здоров'я -60% втрат",
      cost: 130,
      done: false,
      needs: ['atmo'],
    },
    {
      id: 'ai',
      tier: 2,
      name: 'ШІ-асистент',
      icon: '🤖',
      desc: 'Лаб +40% RP',
      cost: 150,
      done: false,
      needs: ['hydro', 'solar2'],
    },
    {
      id: 'growtech',
      tier: 2,
      name: 'Технологія росту',
      icon: '🌿',
      desc: 'Розблоковує Етап 3',
      cost: 140,
      done: false,
      needs: ['biotech', 'hydro'],
    },
    {
      id: 'deepdrill',
      tier: 2,
      name: 'Глибоке буріння',
      icon: '⛏️',
      desc: 'Відкриває буріння льоду',
      cost: 120,
      done: false,
      needs: ['solar2'],
    },
    {
      id: 'fusion',
      tier: 3,
      name: 'Мікрореактор',
      icon: '⚛️',
      desc: 'Енергія не нижче 15%',
      cost: 280,
      done: false,
      needs: ['ai', 'solar2'],
    },
    {
      id: 'terraform',
      tier: 3,
      name: 'Терраформінг-зонд',
      icon: '🌍',
      desc: '+O2 і вода пасивно',
      cost: 320,
      done: false,
      needs: ['growtech', 'ai'],
    },
    {
      id: 'quantum',
      tier: 3,
      name: "Квантовий зв'язок",
      icon: '📶',
      desc: 'RP від місій +50%',
      cost: 350,
      done: false,
      needs: ['ai', 'deepdrill'],
    },
  ],

  // Зони поверхні — сітка 3×4
  zones: [
    {
      id: 'base',
      name: 'Периметр бази',
      icon: '🏠',
      desc: 'Вже досліджена.',
      bonus: '+Стартова зона',
      bt: null,
      bv: 0,
      open: true,
      ul: false,
      pg: 0,
      cost: 0,
      dep: null,
      r: 1,
      c: 1,
    },
    {
      id: 'cn',
      name: 'Північний кратер',
      icon: '🌑',
      desc: 'Поклади льоду під поверхнею.',
      bonus: '+40 води одразу',
      bt: 'h2o',
      bv: 40,
      open: false,
      ul: false,
      pg: 0,
      cost: 55,
      dep: null,
      r: 0,
      c: 1,
    },
    {
      id: 'lava',
      name: 'Лавове поле',
      icon: '🌋',
      desc: 'Мінерали для досліджень.',
      bonus: '+70 RP одразу',
      bt: 'rp',
      bv: 70,
      open: false,
      ul: false,
      pg: 0,
      cost: 60,
      dep: null,
      r: 0,
      c: 2,
    },
    {
      id: 'dust',
      name: 'Пилова рівнина',
      icon: '🌪',
      desc: 'Рівнина — добре для панелей.',
      bonus: '+25% генерації енергії',
      bt: 'ebst',
      bv: 0,
      open: false,
      ul: false,
      pg: 0,
      cost: 70,
      dep: 'lava',
      r: 0,
      c: 3,
    },
    {
      id: 'cw',
      name: 'Західний каньйон',
      icon: '🏔',
      desc: 'Захищена ділянка від вітру.',
      bonus: '+0.04 води/тік',
      bt: 'h2oreg',
      bv: 0,
      open: false,
      ul: false,
      pg: 0,
      cost: 65,
      dep: 'base',
      r: 1,
      c: 0,
    },
    {
      id: 'ice',
      name: 'Льодяна долина',
      icon: '❄️',
      desc: 'Шар льоду на глибині 2 м.',
      bonus: '+0.07 води/тік',
      bt: 'h2oreg',
      bv: 0,
      open: false,
      ul: false,
      pg: 0,
      cost: 95,
      dep: 'cn',
      r: 1,
      c: 2,
    },
    {
      id: 'mrdg',
      name: 'Мінеральний хребет',
      icon: '💎',
      desc: 'Рідкісні мінерали для науки.',
      bonus: '+0.5 RP/тік',
      bt: 'rpreg',
      bv: 0,
      open: false,
      ul: false,
      pg: 0,
      cost: 85,
      dep: 'lava',
      r: 1,
      c: 3,
    },
    {
      id: 'ruin',
      name: 'Покинутий зонд',
      icon: '🛸',
      desc: 'Уламки марсохода.',
      bonus: '+100 RP одразу',
      bt: 'rp',
      bv: 100,
      open: false,
      ul: false,
      pg: 0,
      cost: 80,
      dep: 'cw',
      r: 2,
      c: 0,
    },
    {
      id: 'plat',
      name: 'Південне плато',
      icon: '🗻',
      desc: 'Висока рівнина, менше пилу.',
      bonus: '+35% RP від лаб.',
      bt: 'rplabbst',
      bv: 0,
      open: false,
      ul: false,
      pg: 0,
      cost: 105,
      dep: 'cw',
      r: 2,
      c: 1,
    },
    {
      id: 'dc',
      name: 'Глибокий кратер',
      icon: '🕳',
      // Змінено: тепер дає пасивний +O₂/тік замість разового бонусу
      desc: 'Найглибший кратер — кисневмісні газові кишені.',
      bonus: '+0.04 кисню/тік',
      bt: 'o2reg',
      bv: 0,
      open: false,
      ul: false,
      pg: 0,
      cost: 90,
      dep: 'cn',
      r: 2,
      c: 2,
    },
    {
      id: 'fe',
      name: 'Далекий схід',
      icon: '🌅',
      desc: 'Невідома зона з аномальним сигналом.',
      bonus: '+140 RP одразу',
      bt: 'rp',
      bv: 140,
      open: false,
      ul: false,
      pg: 0,
      cost: 120,
      dep: 'mrdg',
      r: 2,
      c: 3,
    },
  ],

  plant: { stage: 0, prog: 0, growing: false },

  // Екіпаж — hp здоров'я, mor бойовий дух, sk навички
  crew: [
    {
      id: 'koval',
      name: 'Олена Коваль',
      role: 'Командир',
      av: '👩‍🚀',
      hp: 92,
      mor: 88,
      sk: 85,
      task: 'Управління базою',
      sl: null,
    },
    {
      id: 'petrov',
      name: 'Дмитро Петров',
      role: 'Інженер',
      av: '👨‍🔧',
      hp: 78,
      mor: 72,
      sk: 90,
      task: 'Обслуговування',
      sl: null,
    },
    {
      id: 'sirenko',
      name: 'Яна Сіренко',
      role: 'Лікар',
      av: '👩‍⚕️',
      hp: 95,
      mor: 80,
      sk: 88,
      task: 'Медичний блок',
      sl: null,
    },
    {
      id: 'bondar',
      name: 'Ігор Бондар',
      role: 'Геолог',
      av: '👨‍🔬',
      hp: 65,
      mor: 60,
      sk: 82,
      task: 'Польові дослідження',
      sl: null,
    },
    {
      id: 'lysenko',
      name: 'Марія Лисенко',
      role: 'Біолог',
      av: '👩‍🌾',
      hp: 88,
      mor: 91,
      sk: 79,
      task: 'Оранжерея',
      sl: null,
    },
    {
      id: 'kravets',
      name: 'Сергій Кравець',
      role: 'Пілот',
      av: '👨‍✈️',
      hp: 82,
      mor: 66,
      sk: 94,
      task: 'Чекає на завдання',
      sl: null,
    },
  ],

  slots: { lab: null, greenhouse: null, medlab: null, workshop: null },

  // Постійні бонуси від відкритих зон
  zb: { wr: 0, rr: 0, eb: 1, rlb: 1, or: 0 },

  daily: [],
  dcf: 0,   // кризи усунені за Sol
  dms: 0,   // місії запущені за Sol
  dup: 0,   // покращення за Sol
  dzo: 0,   // зони відкриті за Sol
  tr: false,
  trNext: 7,
  trOffer: null,
  win: { plant: false, surv: false, evac: false, zones: false, blds: false },
  ending: null,
};

// 4 етапи вирощування рослини
const STAGES = [
  {
    name: 'Підготовка ґрунту',
    icon: '🪨',
    desc: 'Зволожити реголіт і додати живильні речовини.',
    dur: 50,
    ok: () => G.res.h2o >= 30 && G.mods.greenhouse.lv >= 1,
    reqt: 'Вода ≥ 30% • Оранжерея Lv1+',
  },
  {
    name: 'Посів насіння',
    icon: '🌰',
    desc: 'Посіяти насіння пшениці у підготовлений ґрунт.',
    dur: 65,
    ok: () => hasTech('biotech') && G.res.h2o >= 35,
    reqt: '«Марсіанська біологія» • Вода ≥ 35%',
  },
  {
    name: 'Вирощування',
    icon: '🌿',
    desc: 'Підтримувати вологу і температуру.',
    dur: 90,
    ok: () => hasTech('growtech') && G.res.h2o >= 40 && G.res.o2 >= 50,
    reqt: '«Технологія росту» • Вода ≥ 40% • O₂ ≥ 50%',
  },
  {
    name: 'Перший урожай',
    icon: '🌾',
    desc: 'Зафіксувати і зібрати першу рослину.',
    dur: 35,
    ok: () => true,
    reqt: 'Автоматично',
  },
];

// Щоденні завдання — 3 рандомних на Sol
const DTASKS = [
  { desc: 'Усунь будь-яку кризу', rw: 40, chk: () => G.dcf > 0 },
  { desc: 'Запусти будь-яку місію', rw: 30, chk: () => G.dms > 0 },
  { desc: 'Покращ або побудуй щось', rw: 45, chk: () => G.dup > 0 },
  { desc: 'Кисень вище 60%', rw: 25, chk: () => G.res.o2 >= 60 },
  { desc: 'Вода вище 50%', rw: 25, chk: () => G.res.h2o >= 50 },
  { desc: 'Енергія вище 40%', rw: 20, chk: () => G.res.en >= 40 },
  { desc: 'Відкрий зону на поверхні', rw: 50, chk: () => G.dzo > 0 },
  { desc: 'Просто пережити цей Sol', rw: 20, chk: () => true },
];

// Що привозить торговий корабель
const TRADES = [
  { desc: 'Контейнер з водою (+50)', cost: 55, res: 'h2o', amt: 50 },
  { desc: 'Балони з киснем (+45)', cost: 50, res: 'o2', amt: 45 },
  { desc: 'Заряд батарей (+40)', cost: 45, res: 'en', amt: 40 },
  { desc: 'Науковий набір (+100 RP)', cost: 30, res: 'rp', amt: 100 },
  { desc: 'Великий вантаж: вода (+80)', cost: 100, res: 'h2o', amt: 80 },
  { desc: 'Аварійний кисень (+60)', cost: 75, res: 'o2', amt: 60 },
];

// Типи криз — посилюють витрати відповідного ресурсу
const CRISES = {
  fire: {
    lbl: '🔥 Пожежа!',
    desc: 'Займання в житловому модулі.',
    ex: { o2: 0.3, en: 0.1 },
    mid: 'emg_fire',
  },
  leak: {
    lbl: '💧 Витік кисню!',
    desc: 'Пошкоджена герметизація.',
    ex: { o2: 0.25 },
    mid: 'emg_leak',
  },
  drought: {
    lbl: '🌵 Посуха!',
    desc: 'Система поливу відмовила.',
    ex: { h2o: 0.25 },
    mid: 'emg_drought',
  },
  pest: {
    lbl: '🐛 Шкідники!',
    desc: 'Комахи потрапили в оранжерею.',
    ex: { h2o: 0.12, en: 0.08 },
    mid: 'emg_pest',
  },
  dust_storm: {
    lbl: '🌪 Пилова буря!',
    desc: 'Буря засипала сонячні панелі.',
    ex: { en: 0.35 },
    mid: 'emg_dust',
  },
  malfunction: {
    lbl: '⚡ Відмова системи!',
    desc: 'Збій в енергосистемі.',
    ex: { en: 0.3 },
    mid: 'emg_malfunction',
  },
  overload: {
    lbl: '🔌 Перевантаження!',
    desc: 'Лабораторія споживає забагато.',
    ex: { en: 0.2 },
    mid: 'emg_overload',
  },
};

// Шаблони аварійних місій — генеруються при кризі
const ETPL = {
  emg_fire: {
    icon: '🔥',
    name: 'Гасіння пожежі',
    desc: 'Усунути займання.',
    t: 8,
    rw: 60,
    tp: 'rp',
    mk: 'habitat',
  },
  emg_leak: {
    icon: '💧',
    name: 'Ремонт герметизації',
    desc: 'Залатати корпус модуля.',
    t: 10,
    rw: 50,
    tp: 'rp',
    mk: 'habitat',
  },
  emg_drought: {
    icon: '🌵',
    name: 'Ремонт поливу',
    desc: 'Полагодити клапани зрошення.',
    t: 8,
    rw: 40,
    tp: 'h2o',
    mk: 'greenhouse',
  },
  emg_pest: {
    icon: '🐛',
    name: 'Дезінфекція',
    desc: 'Знищити шкідників.',
    t: 12,
    rw: 50,
    tp: 'rp',
    mk: 'greenhouse',
  },
  emg_dust: {
    icon: '🌪',
    name: 'Очищення панелей',
    desc: 'Прибрати пісок із панелей.',
    t: 6,
    rw: 30,
    tp: 'en',
    mk: 'solar',
  },
  emg_malfunction: {
    icon: '⚡',
    name: 'Ремонт енергосистеми',
    desc: 'Відновити збійний блок.',
    t: 10,
    rw: 60,
    tp: 'rp',
    mk: 'solar',
  },
  emg_overload: {
    icon: '🔌',
    name: 'Розвантаження системи',
    desc: 'Скинути перевантаження.',
    t: 7,
    rw: 50,
    tp: 'rp',
    mk: 'lab',
  },
};

// Назви ресурсів для логу
const RL = { o2: 'Кисень', h2o: 'Вода', en: 'Енергія' };
// Назви і кольори рівнів
const LN = ['', 'Базовий', 'Покращений', 'Розширений', 'Передовий', 'Елітний'];
const LC = ['', '#e85d04', '#ffb347', '#4ab3ff', '#a855f7', '#3ddc84'];

// Вартість покращення модуля і будівлі
const upgC = (l) => l * 90;
const bupgC = (l) => l * 120;
const ET = 45; // тіки щоб відкрити зону

// Ніч — коли год >= 5 (панелі не працюють)
const isN = () => G.h >= 5;
const hasTech = (id) => G.tech.find((t) => t.id === id)?.done;
const hasBld = (id) => G.bld[id]?.built;

// Перевіряємо умову евакуації — всі будівлі збудовані АБО всі зони відкриті
const evacUnlocked = () => G.win.zones || G.win.blds;

let cur = 'home'; // поточна активна вкладка

// ============================
// Навігація між вкладками
// ============================
function goto(page) {
  document
    .querySelectorAll('.page')
    .forEach((p) => p.classList.remove('active'));
  document
    .querySelectorAll('nav a')
    .forEach((a) => a.classList.remove('active'));
  q(`page-${page}`).classList.add('active');
  document.querySelector(`nav a[data-page="${page}"]`).classList.add('active');
  const H = {
    home: ['ГОЛОВНА БАЗА ARES-7', 'Сектор: Hellas Planitia'],
    plant: ['ПЕРША РОСЛИНА', 'Головна ціль місії'],
    buildings: ['БУДІВЛІ', 'Розширення та покращення бази'],
    missions: ['МІСІЇ', 'Польові операції та завдання'],
    research: ['ТЕХНОЛОГІЇ', 'Наукові дослідження'],
    crew: ['ЕКІПАЖ', 'Персонал і призначення'],
    explore: ['ПОВЕРХНЯ МАРСА', 'Дослідження зон'],
  };
  q('pgtit').textContent = H[page][0];
  q('pgsub').textContent = H[page][1];
  cur = page;
  if (page === 'plant') dPlant();
  if (page === 'buildings') dBld();
  if (page === 'missions') dMs();
  if (page === 'research') dRes();
  if (page === 'crew') dCrew();
  if (page === 'explore') dExp();
}

document.querySelectorAll('nav a[data-page]').forEach((a) =>
  a.addEventListener('click', (e) => {
    e.preventDefault();
    goto(a.dataset.page);
  }),
);

// Рядок новин, що біжить знизу карти
const TL = [
  "Зв'язок із Землею: затримка 20 хв • Всі системи в автономному режимі",
  'Температура поверхні: −42°C • Вітер: 18 м/с • Видимість: 4 км',
  'Ціль №1: вижити 10 солів',
  'Ціль №2: виростити першу рослину на Марсі',
  'Рекомендація NASA: тримайте ресурси вище 30%',
  'Ціль №3: дослідити всі зони поверхні Марса',
  'Ціль №4: побудувати всі будівлі бази',
  'Ціль №5: підготувати і виконати евакуацію екіпажу',
  'Без активності — немає RP! Запускайте місії та досліджуйте.',
];
let ti = 0;

function showTkr(txt) {
  const el = q('tkr');
  if (!el) return;
  const s = txt || TL[ti];
  el.innerHTML = `<span class="tspan" id="tsp">${s}</span>`;
  const sp = q('tsp');
  if (!sp) return;
  const dur = Math.max(8, (el.offsetWidth + s.length * 8) / 70);
  sp.style.setProperty('--td', `${dur}s`);
  sp.addEventListener(
    'animationend',
    () => {
      if (!txt) ti = (ti + 1) % TL.length;
      setTimeout(() => showTkr(), 300);
    },
    { once: true },
  );
}

const p2 = (n) => String(n).padStart(2, '0');

// Додає запис у журнал подій
function log(txt, type = '') {
  const t = `Sol ${G.sol} ${p2(G.h)}:${p2(G.m)}`;
  const d = document.createElement('div');
  d.className = `log-entry ${type}`;
  d.textContent = `[${t}] ${txt}`;
  q('elog').prepend(d);
  while (q('elog').children.length > 35) q('elog').lastChild.remove();
}

// ============================
// Ресурси — права панель
// ============================
function dBars() {
  q('rbars').innerHTML = ['o2', 'h2o', 'en']
    .map((k) => {
      const v = Math.max(0, Math.min(100, G.res[k])),
        p = Math.round(v);
      const cls = v < 25 ? 'low' : v < 50 ? 'medium' : '';
      const col = v < 25 ? '#ff3d3d' : v < 50 ? '#ffb347' : '#f0cdb8';
      const ec = { o2: 35, h2o: 30, en: 25 }[k];
      return `<div class="res-bar">
      <div class="res-labels"><span>${RL[k]}</span><span class="res-pct" style="color:${col}">${p}%</span></div>
      <div class="res-track"><div class="res-fill ${cls}" style="width:${p}%"></div></div>
      ${v < 40 ? `<button class="emerg-btn" onclick="eref('${k}')">⚡ +20 за ${ec} RP</button>` : ''}
    </div>`;
    })
    .join('');
}

// Аварійне поповнення ресурсу за RP
function eref(k) {
  const cost = { o2: 35, h2o: 30, en: 25 }[k];
  if (G.rp < cost) {
    log('Не вистачає RP.', 'warning');
    return;
  }
  G.rp -= cost;
  G.res[k] = Math.min(100, G.res[k] + 20);
  q('rpn').textContent = Math.floor(G.rp);
  log(`Аварійне поповнення: ${RL[k]} +20`, 'ok');
  G.act++;
  dBars();
}

// Список модулів у правій панелі
function dModList() {
  q('mlist').innerHTML = Object.entries(G.mods)
    .map(([k, m]) => {
      const lc = LC[Math.min(m.lv, 5)];
      return `<div class="module-row" onclick="openMod('${k}')">
      <span>${m.name}</span>
      <span class="module-lv" style="color:${lc}">Lv${m.lv}</span>
      <span class="module-status ${m.crisis ? 'crisis' : 'ok'}">${m.crisis ? '⚠ КРИЗА' : 'Норма'}</span>
    </div>`;
    })
    .join('');
}

const PLC = ['', '#e85d04', '#ffb347', '#4ab3ff', '#a855f7', '#3ddc84'];

// Оновлює кольорові піни на карті
function updPins() {
  Object.entries(G.mods).forEach(([k, m]) => {
    const dot = q(`pd-${k}`),
      al = q(`pa-${k}`);
    if (!dot) return;
    dot.classList.toggle('is-crisis', !!m.crisis);
    al.classList.toggle('hidden', !m.crisis);
    if (!m.crisis) {
      const c = PLC[Math.min(m.lv, 5)];
      dot.style.background = `radial-gradient(circle,${c}ee 30%,${c} 100%)`;
      dot.style.borderColor = c;
      dot.style.boxShadow = `0 0 10px ${c},0 0 22px ${c}55`;
    } else dot.style.cssText = '';
  });
  // Лічильник криз на кнопці навігації
  const cnt = Object.values(G.mods).filter((m) => m.crisis).length;
  const hl = document.querySelector('nav a[data-page="home"]');
  let b = hl.querySelector('.nav-alert');
  if (cnt > 0) {
    if (!b) {
      b = document.createElement('span');
      b.className = 'nav-alert';
      hl.appendChild(b);
    }
    b.textContent = cnt;
  } else if (b) b.remove();
}

// ============================
// Ігровий годинник і Sol
// ============================
function tickTime() {
  G.m++;
  if (G.m >= 60) {
    G.m = 0;
    G.h++;
  }
  // Новий Sol — годинник перевалив за 10
  if (G.h >= 10) {
    G.h = 0;
    G.sol++;
    q('snum').textContent = G.sol;
    log(`Sol ${G.sol} розпочався.`, 'ok');
    newSol();
  }
  q('clk').textContent = `${p2(G.h)}:${p2(G.m)}`;
  const nt = q('ntag');
  if (nt) isN() ? nt.classList.remove('hidden') : nt.classList.add('hidden');
}

// Місії з кулдауном — відновлюємо після rep солів
function refreshMs() {
  let n = 0;
  G.ms.forEach((m) => {
    if (m.done && m.rep && m.ropen && G.sol >= m.ropen) {
      m.done = false;
      m.on = false;
      m.pg = 0;
      m.dsol = null;
      m.ropen = null;
      n++;
    }
  });
  if (n) {
    log(`${n} місій знову доступні.`, 'ok');
    if (cur === 'missions') dMs();
  }
}

// Все що відбувається на початку нового Sol
function newSol() {
  crewDay();
  genDaily();
  checkTrade();
  checkGoals();
  refreshMs();
  // Якщо гравець нічого не робив — попереджаємо
  if (G.act === 0) {
    log('⚠ Жодної активності! RP не нараховується без дій.', 'crisis');
    if (!G.idlewarn) {
      G.idlewarn = true;
      showTkr('⚠ Без активності RP не накопичуються!');
    }
  } else G.idlewarn = false;
  // Скидаємо щоденні лічильники
  G.act = 0;
  G.dcf = 0;
  G.dms = 0;
  G.dup = 0;
  G.dzo = 0;
}

// ============================
// Тік ресурсів (кожну секунду)
// ============================
function tickRes() {
  const r = G.res,
    b = G.zb,
    n = isN();
  // Бонуси від технологій
  const atmo = hasTech('atmo') ? 0.8 : 1;
  const hydro = hasTech('hydro');
  const sol2 = hasTech('solar2') ? 1.3 : 1;
  const aim = hasTech('ai') ? 1.4 : 1;
  const antm = hasBld('antenna') ? 1 + 0.2 * (G.bld.antenna.lv || 1) : 1;
  const recm = hasTech('recycling') ? 1.5 : 1;
  const tf = hasTech('terraform');

  // Витрати від кожного модуля (вищий рівень = трохи ефективніший)
  Object.values(G.mods).forEach((m) => {
    if (m.status === 'offline') return;
    const lm = 1 - (m.lv - 1) * 0.05;
    if (m.drain.o2 != null) {
      let d = m.drain.o2 * lm * atmo;
      if (m.crisis) d += CRISES[m.crisis].ex.o2 || 0;
      r.o2 -= d;
    }
    if (m.drain.h2o != null) {
      if (m === G.mods.greenhouse) {
        // Гідропоніка — оранжерея виробляє воду замість споживання
        if (hydro) r.h2o += 0.04 * (m.lv * 0.2 + 0.8);
        else {
          let d = m.drain.h2o * lm;
          if (m.crisis) d += CRISES[m.crisis].ex.h2o || 0;
          r.h2o -= d;
        }
      }
    }
    if (m.drain.en > 0) {
      let d = m.drain.en * lm;
      if (m.crisis) d += CRISES[m.crisis].ex.en || 0;
      r.en -= d;
    }
  });

  // Генерація енергії
  const sol = G.mods.solar;
  if (!sol.crisis && !n) r.en += 0.07 * (1 + (sol.lv - 1) * 0.12) * sol2 * b.eb;
  if (hasBld('battery') && n) r.en += 0.04 * (G.bld.battery.lv || 1);

  // Пасивні бонуси будівель
  if (hasBld('recycler')) r.h2o += 0.05 * recm * (G.bld.recycler.lv || 1);
  if (hasBld('o2pump')) r.o2 += 0.03 * (G.bld.o2pump.lv || 1);
  if (tf) { r.o2 += 0.05; r.h2o += 0.03; }
  r.h2o += b.wr; // зони з водою
  r.o2 += b.or;  // зони з киснем (Глибокий кратер)

  // Мікрореактор — страховка від знеструмлення
  if (hasTech('fusion')) r.en = Math.max(15, r.en);

  // Лаб пасивно генерує RP
  const lab = G.mods.lab;
  if (!lab.crisis && lab.status !== 'offline' && !document.hidden) {
    const c = G.slots.lab ? G.crew.find((x) => x.id === G.slots.lab) : null;
    const cb = c ? 1 + c.sk / 200 : 1;
    const e =
      (0.4 + lab.lv * 0.2) * (r.en / 100) * aim * antm * b.rlb * cb + b.rr;
    G.rp += e;
    q('rpn').textContent = Math.floor(G.rp);
  }
  // Ресурси завжди 0–100
  Object.keys(r).forEach((k) => {
    r[k] = Math.max(0, Math.min(100, r[k]));
  });
}

// Рандомна поява кризи — шанс зростає з Sol
function maybeCrisis() {
  if (Math.random() > 0.005 + G.sol * 0.00018) return;
  const free = Object.keys(G.mods).filter((k) => !G.mods[k].crisis);
  if (!free.length) return;
  const k = free[Math.floor(Math.random() * free.length)];
  const m = G.mods[k];
  const t = m.crises[Math.floor(Math.random() * m.crises.length)];
  m.crisis = t;
  log(`${CRISES[t].lbl} — ${m.name}`, 'crisis');
  showTkr(`⚠ ${CRISES[t].lbl} у "${m.name}". Відкрита аварійна місія!`);
  spawnEmg(t, k);
  if (cur === 'missions') dMs();
}

// Створює нову аварійну місію
function spawnEmg(ct, mk) {
  const tpl = ETPL[CRISES[ct].mid];
  if (!tpl) return;
  const id = `emg_${Date.now()}`;
  // Ремонтний відсік скорочує час аварійних місій
  const wl = hasBld('workshop') ? G.bld.workshop.lv || 1 : 0;
  const tm = wl > 0 ? Math.max(0.4, 1 - wl * 0.2) : 1;
  G.emg.push({
    id,
    icon: tpl.icon,
    name: tpl.name,
    desc: tpl.desc,
    t: Math.round(tpl.t * tm),
    rw: tpl.rw,
    tp: tpl.tp,
    done: false,
    on: false,
    pg: 0,
    ct,
    mk,
    isEmg: true,
  });
}

// Прогрес активних місій
function tickMs() {
  [...G.ms, ...G.emg].forEach((m) => {
    if (!m.on || m.done) return;
    m.pg = Math.min(m.t, m.pg + 1);
    if (m.pg >= m.t) finM(m);
  });
  if (cur === 'missions') dMs();
}

// Завершення місії — видаємо нагороду, знімаємо кризу
function finM(m) {
  m.done = true;
  m.on = false;
  if (m.isEmg && m.mk) {
    G.mods[m.mk].crisis = null;
    updPins();
    dModList();
    log(`Кризу усунено: ${G.mods[m.mk].name}`, 'ok');
    G.dcf++;
  }
  // Остання евакуаційна місія — кінець гри
  if (m.ev === 3) {
    G.win.evac = true;
    log('Евакуація завершена! Екіпаж на шляху додому.', 'upgrade');
    checkGoals();
    checkEnd();
    return;
  }
  const qb = hasTech('quantum') ? 1.5 : 1;
  if (m.tp === 'rp') {
    const e = Math.round(m.rw * qb);
    G.rp += e;
    q('rpn').textContent = Math.floor(G.rp);
    log(`"${m.name}" виконано! +${e} RP`, 'upgrade');
  } else {
    G.res[m.tp] = Math.min(100, G.res[m.tp] + m.rw);
    log(`"${m.name}" виконано! +${m.rw} ${RL[m.tp]}`, 'upgrade');
  }
  if (m.rep) {
    m.dsol = G.sol;
    m.ropen = G.sol + m.rep;
  }
}

// ============================
// Рослина
// ============================
function tickPlant() {
  const p = G.plant;
  if (!p.growing || p.stage === 0 || p.stage > 4) return;
  const cfg = STAGES[p.stage - 1];
  if (!cfg.ok()) {
    if (cur === 'plant') dPlant();
    return;
  }
  // Біолог в оранжереї + лампи росту прискорюють
  const cg = G.slots.greenhouse
    ? G.crew.find((c) => c.id === G.slots.greenhouse)
    : null;
  const cb = cg ? 1 + cg.sk / 150 : 1;
  const gl = hasBld('growlight') ? G.bld.growlight.lv || 1 : 0;
  const sp = (gl > 0 ? 1 + gl * 0.5 : 1) * cb;
  p.prog += (100 / cfg.dur) * sp;
  if (p.prog >= 100) {
    p.prog = 100;
    p.growing = false;
    log(`Етап "${cfg.name}" завершено!`, 'upgrade');
    if (p.stage === 4) {
      p.stage = 5;
      G.win.plant = true;
      log('🌱 Перша рослина на Марсі виросла!', 'upgrade');
      showTkr('🌱 НЕМОЖЛИВЕ СТАЛО МОЖЛИВИМ — перша рослина на Марсі!');
      checkGoals();
      checkEnd();
    } else {
      setTimeout(() => {
        if (!G.over) { p.stage++; p.prog = 0; }
        if (cur === 'plant') dPlant();
      }, 1500);
    }
  }
  if (cur === 'plant') dPlant();
}

function startPlant() {
  const p = G.plant;
  if (!STAGES[p.stage - 1].ok()) return;
  p.growing = true;
  G.act++;
  log(`Розпочато: "${STAGES[p.stage - 1].name}"`, 'warning');
  if (cur === 'plant') dPlant();
}

// Рендер сторінки рослини
function dPlant() {
  const p = G.plant,
    el = q('pgplant');
  if (!el) return;
  const tot =
    p.stage === 5
      ? 100
      : p.stage === 0
        ? 0
        : Math.round(((p.stage - 1) * 100 + p.prog) / 4);
  const em =
    p.stage === 5 ? '🌾' : p.stage >= 3 ? '🌿' : p.stage >= 2 ? '🌱' : p.stage >= 1 ? '🌰' : '🪨';
  const st =
    p.stage === 5
      ? 'Місія виконана. Марс може стати домом.'
      : p.stage === 0
        ? 'Оранжерея готова.'
        : p.growing
          ? `Етап ${p.stage} з 4 — ${Math.round(p.prog)}%…`
          : `Етап ${p.stage} з 4 — очікує`;
  el.innerHTML = `
    <div class="plant-hero">
      <div class="plant-visual">${em}</div>
      <div style="flex:1">
        <div class="plant-title">ПЕРША РОСЛИНА НА МАРСІ</div>
        <div class="plant-subtitle">${st}</div>
        <div class="plant-overall"><div class="plant-overall-fill" style="width:${tot}%"></div></div>
        <div class="plant-overall-label">${tot}% — ${p.stage === 5 ? 'ЗАВЕРШЕНО' : `Sol ${G.sol}`}</div>
      </div>
    </div>
    <div class="plant-stages">
      ${STAGES.map((cfg, i) => {
        const sn = i + 1, dn = p.stage > sn || p.stage === 5, ac = p.stage === sn;
        const cls = dn ? 'is-done' : ac ? 'is-active' : 'is-locked';
        const pr = ac ? p.prog : dn ? 100 : 0;
        const ok = ac && !p.growing && cfg.ok(), miss = ac && !cfg.ok();
        return `<div class="stage-card ${cls}">
          <div class="stage-num">ЕТАП 0${sn}</div>
          <div class="stage-icon">${cfg.icon}</div>
          <div class="stage-name">${cfg.name}</div>
          <div class="stage-req">${cfg.reqt}</div>
          <div class="stage-bar"><div class="stage-bar-fill" style="width:${pr}%"></div></div>
          <div class="stage-status">${dn ? '✓ Завершено' : ac && p.growing ? `Росте… ${Math.round(p.prog)}%` : ac ? 'Готовий' : 'Заблоковано'}</div>
          ${ac && !dn ? `<button class="stage-btn" onclick="startPlant()" ${ok ? '' : 'disabled'}>${p.growing ? 'Росте…' : miss ? 'Умови не виконані' : '▶ ПОЧАТИ'}</button>` : ''}
          ${miss ? `<p class="hint" style="margin-top:6px">Потрібно: ${cfg.reqt}</p>` : ''}
        </div>`;
      }).join('')}
    </div>`;
}

// ============================
// Дослідження зон поверхні
// ============================
function tickExp() {
  G.zones.forEach((z) => {
    if (!z.ul || z.open) return;
    z.pg++;
    if (z.pg >= ET) {
      z.open = true;
      z.ul = false;
      zBonus(z);
      G.dzo++;
      log(`Зону "${z.name}" відкрито! ${z.bonus}`, 'upgrade');
      checkGoals();
      if (cur === 'explore') dExp();
    }
  });
  if (G.zones.some((z) => z.ul) && cur === 'explore') dExp();
}

// Застосовує бонус відкритої зони
function zBonus(z) {
  const b = G.zb;
  const rv = (k) => { G.res[k] = Math.min(100, G.res[k] + z.bv); };
  switch (z.bt) {
    case 'rp': G.rp += z.bv; q('rpn').textContent = Math.floor(G.rp); break;
    case 'h2o': rv('h2o'); break;
    case 'o2': rv('o2'); break;
    case 'h2oreg': b.wr += 0.05; break; // постійний +вода
    case 'rpreg': b.rr += 0.3; break;   // постійний +RP
    case 'ebst': b.eb += 0.25; break;   // +ефективність панелей
    case 'rplabbst': b.rlb += 0.25; break; // +RP від лабу
    case 'o2reg': b.or += 0.04; break;  // постійний +кисень (Глибокий кратер)
  }
}

function startExp(zid) {
  const z = G.zones.find((x) => x.id === zid);
  if (!z || z.open || z.ul || G.rp < z.cost) return;
  if (z.dep && !G.zones.find((x) => x.id === z.dep)?.open) return;
  G.rp -= z.cost;
  q('rpn').textContent = Math.floor(G.rp);
  z.ul = true;
  z.pg = 0;
  G.act++;
  log(`Розпочато дослідження: "${z.name}"`, 'warning');
  dExp();
}

// Рендер сітки зон 3×4
function dExp() {
  const cells = Array(3).fill(null).map(() => Array(4).fill(null));
  G.zones.forEach((z) => { cells[z.r][z.c] = z; });
  q('gmap').innerHTML = cells
    .flat()
    .map((z) => {
      if (!z)
        return `<div class="zone is-locked"><div class="zone-fog">▓</div></div>`;
      if (z.open)
        return `<div class="zone is-open"><div><div class="zone-icon">${z.icon}</div><div class="zone-name">${z.name}</div><div class="zone-bonus">${z.desc}</div></div><div class="zone-explored">✓ ${z.bonus}</div></div>`;
      if (z.ul) {
        const pct = Math.round((z.pg / ET) * 100);
        return `<div class="zone is-unlocking"><div><div class="zone-icon">${z.icon}</div><div class="zone-name">${z.name}</div></div><div><div class="zone-cost">${ET - z.pg}с…</div><div class="zone-progress"><div class="zone-progress-fill" style="width:${pct}%"></div></div></div></div>`;
      }
      const pok = !z.dep || G.zones.find((x) => x.id === z.dep)?.open;
      const can = pok && G.rp >= z.cost;
      if (!pok)
        return `<div class="zone is-locked"><div class="zone-fog">?</div><div><div class="zone-name">${z.name}</div><div class="zone-cost">Відкрий сусідню</div></div></div>`;
      return `<div class="zone ${can ? 'is-available' : 'is-locked'}" ${can ? `onclick="startExp('${z.id}')"` : ''}><div><div class="zone-icon">${z.icon}</div><div class="zone-name">${z.name}</div><div class="zone-bonus">${z.desc}</div></div><div><div class="zone-bonus" style="color:#666">${z.bonus}</div><div class="zone-cost">${z.cost} RP${!can ? ` (є ${Math.floor(G.rp)})` : ''})</div></div></div>`;
    })
    .join('');
}

// 3 рандомних завдання на кожен Sol
function genDaily() {
  G.daily = [...DTASKS]
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map((t) => ({ ...t, claimed: false }));
  if (cur === 'missions') dMs();
  log(`Нові завдання на Sol ${G.sol}.`, 'warning');
}

function claimTask(i) {
  const t = G.daily[i];
  if (!t || t.claimed || !t.chk()) return;
  t.claimed = true;
  G.rp += t.rw;
  q('rpn').textContent = Math.floor(G.rp);
  G.act++;
  log(`Завдання: "${t.desc}" +${t.rw} RP`, 'upgrade');
  dMs();
}

// Торговий корабель — раз на ~6 солів
function checkTrade() {
  if (G.sol < G.trNext) return;
  G.tr = true;
  G.trOffer = TRADES[Math.floor(Math.random() * TRADES.length)];
  G.trNext = G.sol + 6 + Math.floor(Math.random() * 3);
  log(`Торговий корабель прибув! ${G.trOffer.desc}`, 'upgrade');
  showTkr('🚀 Торговий корабель від NASA! Перевір вкладку Місії.');
  if (cur === 'missions') dMs();
}

function acceptTrade() {
  const o = G.trOffer;
  if (!o || G.rp < o.cost) return;
  G.rp -= o.cost;
  if (o.res === 'rp') G.rp += o.amt;
  else G.res[o.res] = Math.min(100, G.res[o.res] + o.amt);
  q('rpn').textContent = Math.floor(G.rp);
  G.tr = false;
  G.trOffer = null;
  G.act++;
  log('Торгівля завершена.', 'ok');
  dMs();
}

function declineTrade() {
  G.tr = false;
  G.trOffer = null;
  log('Торгову пропозицію відхилено.');
  dMs();
}

// Перевірка і оновлення цілей місії
function checkGoals() {
  const gs = G.goals;
  if (!gs[0].done && G.sol >= 10) {
    gs[0].done = true;
    G.win.surv = true;
    gs[1].on = true;
    log('✓ ЦІЛЬ 1: 10 солів!', 'upgrade');
    showTkr('✓ Ціль 1 виконана: 10 солів пережито!');
  }
  if (!gs[1].done && G.win.plant && gs[1].on) {
    gs[1].done = true;
    gs[2].on = true;
    log('✓ ЦІЛЬ 2: перша рослина!', 'upgrade');
  }
  if (!gs[2].done && gs[2].on && G.zones.every((z) => z.open)) {
    gs[2].done = true;
    G.win.zones = true;
    gs[3].on = true;
    log('✓ ЦІЛЬ 3: всі зони!', 'upgrade');
    showTkr('✓ Ціль 3: всі зони Марса досліджені!');
  }
  if (!gs[3].done && gs[3].on && Object.values(G.bld).every((b) => b.built)) {
    gs[3].done = true;
    G.win.blds = true;
    gs[4].on = true;
    log('✓ ЦІЛЬ 4: всі будівлі!', 'upgrade');
    showTkr('✓ Ціль 4: база повністю побудована!');
  }
  if (!gs[4].done && gs[4].on && G.win.evac) {
    gs[4].done = true;
    log('✓ ЦІЛЬ 5: евакуація!', 'upgrade');
    checkEnd();
  }
  dGoals();
}

// Рендер цілей у правій панелі — виконані горять зеленим
function dGoals() {
  q('objp').innerHTML = G.goals
    .map((o) => {
      const si = o.done ? '✓' : o.on ? '◈' : '○';
      const cls = o.done ? 'obj-done' : o.on ? 'obj-active' : 'obj-locked';
      return `<div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:7px;font-size:11px;">
      <span class="${cls}" style="flex-shrink:0">${si}</span>
      <div>
        <span class="${cls}" style="font-weight:700">${o.icon} ${o.title}</span>
        ${o.on && !o.done ? `<div style="font-size:10px;color:#a07060;margin-top:1px">${o.desc}</div>` : ''}
      </div>
    </div>`;
    })
    .join('');
}

// Визначаємо тип кінцівки
function checkEnd() {
  const w = G.win;
  const n = [w.plant, w.surv, w.evac, w.zones, w.blds].filter(Boolean).length;
  if (n === 5) { end('full'); return; }
  if (w.plant && w.evac && !alive()) { end('bitter'); return; }
  if (w.evac && !w.plant) end('sacrifice');
}

function alive() {
  return G.crew.some((c) => c.hp > 0);
}

// Екран завершення гри
function end(type) {
  if (G.over) return;
  G.over = true;
  G.ending = type;
  const E = {
    full: {
      gl: '🏆',
      t: 'ПОВНА ПЕРЕМОГА',
      col: '#3ddc84',
      tx: 'Усі 5 цілей виконано.\nРослина виросла. Зони досліджені. База побудована.\nЕкіпаж евакуйовано. ARES-7 — легенда.',
    },
    bitter: {
      gl: '🌱',
      t: 'ГІРКО-СОЛОДКА ПЕРЕМОГА',
      col: '#ffb347',
      tx: 'Рослина виросла на Марсі.\nАле екіпаж не вижив, щоб це побачити.\nВони знали, на що йшли.',
    },
    sacrifice: {
      gl: '🚀',
      t: 'ЖЕРТОВНА ПЕРЕМОГА',
      col: '#4ab3ff',
      tx: 'Екіпаж евакуйовано живими.\nРослина залишилась на Марсі — самотня,\nале жива. Місія буде продовжена.',
    },
    defeat: {
      gl: '☠',
      t: 'МІСІЯ ПРОВАЛЕНА',
      col: '#ff3d3d',
      tx: "Ресурси вичерпано. Зв'язок втрачено.\nЕкіпаж не вижив.",
    },
  };
  const e = E[type];
  q('egl').textContent = e.gl;
  q('etit').textContent = e.t;
  q('etit').style.color = e.col;
  q('ewhy').textContent = e.tx;
  q('esol').textContent = G.sol;
  q('erp').textContent = Math.floor(G.rp);
  q('gover').classList.remove('hidden');
}

// Оновлення здоров'я екіпажу кожен Sol
function crewDay() {
  const ml = hasBld('medlab') ? G.bld.medlab.lv || 1 : 0;
  const suit = hasTech('medsuit');
  const inMed = G.slots.medlab;
  G.crew.forEach((c) => {
    const hr = ml > 0 ? 1.5 * ml : -0.8; // без медблоку HP падає
    const sm = suit ? 0.4 : 1;
    const hb = inMed === c.id ? 1.5 : 1;
    c.hp = Math.max(0, Math.min(100, c.hp + hr * sm * hb));
    c.mor = Math.max(0, Math.min(100, c.mor + Math.random() * 4 - 2));
  });
  if (cur === 'crew') dCrew();
}

// Рендер карток екіпажу з призначенням
function dCrew() {
  q('gcrw').innerHTML = G.crew
    .map((c) => {
      const hc = c.hp < 30 ? '#ff3d3d' : c.hp < 60 ? '#ffb347' : '#e85d04';
      const mc = c.mor < 30 ? '#ff3d3d' : c.mor < 60 ? '#ffb347' : '#886600';
      const aw = Object.entries(G.slots).find(([, v]) => v === c.id);
      const bn = aw ? G.bld[aw[0]]?.name || aw[0] : null;
      const opts = Object.entries(G.slots)
        .filter(([k]) => G.bld[k]?.built || k === 'lab' || k === 'greenhouse')
        .map(([k]) => {
          const nm = G.bld[k]?.name || (k === 'lab' ? 'Лабораторія' : 'Оранжерея');
          const occ = G.slots[k] && G.slots[k] !== c.id;
          return `<option value="${k}" ${aw?.[0] === k ? 'selected' : ''} ${occ ? 'disabled' : ''}>${nm}${occ ? ' (зайнято)' : ''}</option>`;
        })
        .join('');
      return `<div class="crew-card">
      <div class="crew-avatar">${c.av}</div>
      <div class="crew-name">${c.name}</div>
      <div class="crew-role">${c.role}</div>
      <div class="stat-row"><div class="stat-labels"><span>Здоров'я</span><span style="color:${hc}">${Math.round(c.hp)}%</span></div><div class="stat-track"><div class="stat-fill health" style="width:${c.hp}%"></div></div></div>
      <div class="stat-row"><div class="stat-labels"><span>Бойовий дух</span><span style="color:${mc}">${Math.round(c.mor)}%</span></div><div class="stat-track"><div class="stat-fill morale" style="width:${c.mor}%"></div></div></div>
      <div class="stat-row"><div class="stat-labels"><span>Навички</span><span style="color:#4ab3ff">${Math.round(c.sk)}%</span></div><div class="stat-track"><div class="stat-fill skill" style="width:${c.sk}%"></div></div></div>
      <div class="crew-task">◈ ${bn ? `Призначено: ${bn}` : c.task}</div>
      <div style="margin-top:8px">
        <select class="crew-assign-sel" onchange="assCrew('${c.id}',this.value)" style="width:100%;background:rgba(20,10,5,0.9);border:1px solid #3a1a0a;color:#8a5c44;font-family:'Share Tech Mono',monospace;font-size:10px;padding:4px 6px;cursor:pointer">
          <option value="">— без призначення —</option>${opts}
        </select>
      </div>
    </div>`;
    })
    .join('');
}

function assCrew(cid, bk) {
  Object.keys(G.slots).forEach((k) => {
    if (G.slots[k] === cid) G.slots[k] = null;
  });
  if (bk) {
    G.slots[bk] = cid;
    log(`${G.crew.find((x) => x.id === cid)?.name} призначено до: ${G.bld[bk]?.name || bk}`, 'ok');
  }
  G.act++;
  dCrew();
}

// ============================
// Будівлі
// ============================
function dBld() {
  q('gbld').innerHTML = Object.entries(G.bld)
    .map(([k, b]) => {
      const lc = b.built ? LC[Math.min(b.lv, 5)] : '#4a2e20';
      const uc = bupgC(b.lv);
      const can = !b.built && G.rp >= b.cost;
      const cup = b.built && b.lv < b.max && G.rp >= uc;
      return `<div class="card" style="${b.built ? `border-color:${lc}30` : ''}">
      <div class="card-icon">${b.icon}</div>
      <div class="card-title" style="${b.built ? `color:${lc}` : ''}"> ${b.name} ${b.built ? `<span class="lv-badge" style="color:${lc}">Lv${b.lv}</span>` : ''}</div>
      <div class="card-desc">${b.desc}</div>
      ${!b.built ? `<div class="card-cost">${b.cost} RP</div>` : ''}
      ${b.built ? `<div class="bld-level-bar">${Array.from({ length: b.max }, (_, i) => `<div class="bld-lv-pip ${i < b.lv ? 'active' : ''}" style="${i < b.lv ? `background:${lc}` : ''}"></div>`).join('')}</div><div style="font-size:10px;color:#7a5040;margin-bottom:6px">Lv${b.lv}/${b.max} — ${LN[Math.min(b.lv, 5)]}</div>` : ''}
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        ${!b.built ? `<button class="card-btn" onclick="doBuild('${k}')" ${can ? '' : 'disabled'}>${can ? 'Побудувати' : 'Потрібно ' + b.cost + ' RP'}</button>` : ''}
        ${b.built && b.lv < b.max ? `<button class="card-btn" onclick="upgBld('${k}')" ${cup ? '' : 'disabled'}>▲ Lv${b.lv + 1} (${uc} RP)</button>` : ''}
        ${b.built && b.lv >= b.max ? `<div class="card-btn is-built" style="cursor:default">★ Макс рівень</div>` : ''}
      </div>
      ${!b.built && !can ? `<p class="hint">Потрібно ${b.cost} RP (є ${Math.floor(G.rp)})</p>` : ''}
    </div>`;
    })
    .join('');
}

function doBuild(k) {
  const b = G.bld[k];
  if (b.built || G.rp < b.cost) return;
  G.rp -= b.cost;
  b.built = true;
  q('rpn').textContent = Math.floor(G.rp);
  G.dup++;
  G.act++;
  log(`Побудовано: ${b.name}`, 'upgrade');
  checkGoals();
  dBld();
}

function upgBld(k) {
  const b = G.bld[k];
  if (!b.built || b.lv >= b.max) return;
  const c = bupgC(b.lv);
  if (G.rp < c) return;
  G.rp -= c;
  b.lv++;
  q('rpn').textContent = Math.floor(G.rp);
  G.dup++;
  G.act++;
  log(`${b.name} → Lv${b.lv}`, 'upgrade');
  dBld();
}

// ============================
// Місії
// ============================
function dMs() {
  const e1 = G.ms.find((m) => m.ev === 1)?.done;
  const e2 = G.ms.find((m) => m.ev === 2)?.done;
  const eu = evacUnlocked();

  // Аварійні місії — на весь рядок, першими
  const emgH = G.emg
    .filter((m) => !m.done)
    .map((m) => {
      const pct = Math.round((m.pg / m.t) * 100);
      return `<div class="card" style="border-color:rgba(255,61,61,0.5);background:rgba(60,10,5,0.5);grid-column:1/-1">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
        <div class="card-icon" style="margin:0">${m.icon}</div>
        <div class="card-title" style="color:#ff3d3d;margin:0">⚠ АВАРІЯ: ${m.name}</div>
      </div>
      <div class="card-desc">${m.desc}</div>
      <div class="mission-reward">${m.tp === 'rp' ? `+${m.rw} RP` : `+${m.rw} ${RL[m.tp]}`}</div>
      ${m.on ? `<div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>` : ''}
      <button class="card-btn" style="border-color:#ff3d3d;color:#ff3d3d" onclick="startEmg('${m.id}')" ${m.on ? 'disabled' : ''}>
        ${m.on ? `Виконується… ${m.t - m.pg}с` : '⚡ ВИКОНАТИ АВАРІЙНУ МІСІЮ'}
      </button>
    </div>`;
    })
    .join('');

  const msH = G.ms
    .map((m) => {
      // Умова доступності для евакуацій
      const rok = m.ev
        ? eu &&
          (m.ev === 1 ? G.bld['antenna']?.built : true) &&
          (m.ev >= 2 ? G.bld['garage']?.built : true) &&
          (m.ev === 3 ? e1 && e2 : true)
        : !m.need || G.bld[m.need]?.built;
      if (m.done && m.rw === 0 && !m.ev) return '';
      const pct = Math.round((m.pg / m.t) * 100);
      const prize =
        m.cost && m.cost > 0
          ? `⚠ Вартість: ${m.cost} RP`
          : m.tp === 'rp'
            ? `+${m.rw} RP`
            : m.rw > 0
              ? `+${m.rw} ${RL[m.tp]}`
              : 'Евакуація';
      const noCash = m.cost && m.cost > 0 && G.rp < m.cost;

      let btxt, bcls, dis;

      if (m.done) {
        const hasCooldown = m.rep && m.ropen;
        // Яскрава кнопка кулдауну — показує коли місія відновиться
        btxt = hasCooldown ? `↻ Знову доступна з Sol ${m.ropen}` : '✓ Виконано';
        bcls = hasCooldown ? 'btn-cooldown' : 'is-built';
        dis = true;
      } else if (m.on) {
        btxt = `${m.t - m.pg}с…`;
        bcls = 'in-progress';
        dis = true;
      } else if (!rok) {
        // Чітке пояснення умов для евакуаційних місій
        if (m.ev && !eu) {
          btxt = '🔒 Спочатку: всі будівлі до Lv3 АБО всі зони Марса';
        } else if (m.ev === 3) {
          btxt = '🔒 Спочатку виконай «Сигнал» і «Підготовку капсули»';
        } else if (m.need && !G.bld[m.need]?.built) {
          btxt = `🔒 Потрібна будівля: ${G.bld[m.need]?.name || m.need}`;
        } else {
          btxt = '🔒 Недоступно';
        }
        bcls = '';
        dis = true;
      } else if (noCash) {
        btxt = `Не вистачає RP (потрібно ${m.cost})`;
        bcls = '';
        dis = true;
      } else {
        btxt = m.cost && m.cost > 0 ? `Розпочати (−${m.cost} RP)` : 'Розпочати';
        bcls = '';
        dis = false;
      }

      // Для евакуаційних місій показуємо умову відкриття
      const evacInfo = m.ev && m.evacDesc
        ? `<div class="evac-unlock-info">${m.evacDesc}</div>`
        : '';

      return `<div class="card" ${m.ev ? 'style="border-color:rgba(74,179,255,0.4)"' : ''}>
      <div class="card-icon">${m.icon}</div>
      <div class="card-title" ${m.ev ? 'style="color:#4ab3ff"' : ''}>${m.name}</div>
      <div class="card-desc">${m.desc}</div>
      ${evacInfo}
      <div class="mission-reward">${prize}</div>
      ${m.on ? `<div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>` : ''}
      <button class="card-btn ${bcls}" onclick="startMs('${m.id}')" ${dis ? 'disabled' : ''}>${btxt}</button>
    </div>`;
    })
    .join('');

  // Щоденні завдання
  const dayH = G.daily.length
    ? `
    <div class="card" style="grid-column:1/-1;border-color:rgba(255,179,71,0.3);background:rgba(255,179,71,0.04)">
      <div class="card-title" style="color:#ffb347">📋 ЗАВДАННЯ — Sol ${G.sol}</div>
      ${G.daily
        .map(
          (t, i) => `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:7px 0;border-bottom:1px solid rgba(255,255,255,0.04)">
          <span style="font-size:12px;color:${t.claimed ? '#4a2e20' : t.chk() ? '#ffb347' : '#a07060'}">${t.claimed ? '✓ ' : ''}${t.desc}</span>
          <button class="card-btn" style="width:auto;padding:4px 10px;font-size:10px" onclick="claimTask(${i})" ${t.claimed || !t.chk() ? 'disabled' : ''}>
            ${t.claimed ? 'Отримано' : `+${t.rw} RP`}
          </button>
        </div>`,
        )
        .join('')}
    </div>`
    : '';

  // Торговий корабель
  const trH =
    G.tr && G.trOffer
      ? `
    <div class="card" style="grid-column:1/-1;border-color:rgba(74,179,255,0.4);background:rgba(0,80,160,0.07)">
      <div class="card-icon">🚀</div>
      <div class="card-title" style="color:#4ab3ff">ТОРГОВИЙ КОРАБЕЛЬ NASA</div>
      <div class="card-desc">${G.trOffer.desc}</div>
      <div class="card-cost">${G.trOffer.cost} RP</div>
      <div style="display:flex;gap:8px">
        <button class="card-btn" onclick="acceptTrade()" ${G.rp < G.trOffer.cost ? 'disabled' : ''}>✓ Прийняти</button>
        <button class="card-btn" onclick="declineTrade()" style="border-color:#3a1a0a;color:#4a2e20">✗ Відхилити</button>
      </div>
      ${G.rp < G.trOffer.cost ? `<p class="hint">Потрібно ${G.trOffer.cost} RP</p>` : ''}`
      : '';

  q('gms').innerHTML = emgH + trH + dayH + msH;
}

function startMs(id) {
  const m = G.ms.find((x) => x.id === id);
  if (!m || m.on || m.done) return;
  if (m.cost && m.cost > 0) {
    if (G.rp < m.cost) {
      log(`Не вистачає RP. Потрібно ${m.cost}.`, 'warning');
      return;
    }
    G.rp -= m.cost;
    q('rpn').textContent = Math.floor(G.rp);
    log(`Витрачено ${m.cost} RP на "${m.name}"`, 'warning');
  }
  m.on = true;
  m.pg = 0;
  G.dms++;
  G.act++;
  log(`Місія розпочата: ${m.name}`, 'warning');
  dMs();
}

function startEmg(id) {
  const m = G.emg.find((x) => x.id === id);
  if (!m || m.on || m.done) return;
  m.on = true;
  m.pg = 0;
  G.dms++;
  G.act++;
  log(`Аварійна місія: ${m.name}`, 'warning');
  dMs();
}

// Дерево технологій
function dRes() {
  q('gtree').innerHTML = [1, 2, 3]
    .map(
      (tier) => `
    <div>
      <div class="tier-label">РІВЕНЬ ${tier}</div>
      <div class="tier-row">
        ${G.tech
          .filter((t) => t.tier === tier)
          .map((t) => {
            const ok = t.needs.every(
              (id) => G.tech.find((x) => x.id === id)?.done,
            );
            const can = !t.done && ok && G.rp >= t.cost;
            const cls = t.done ? 'is-unlocked' : ok ? 'is-available' : 'is-locked';
            return `<div class="rcard ${cls}">
            <div class="rcard-icon">${t.icon}</div>
            <div class="rcard-name">${t.name}</div>
            <div class="rcard-effect">${t.desc}</div>
            ${
              t.done
                ? `<div class="rcard-done">✓ Відкрито</div>`
                : `<div class="rcard-cost">${t.cost} RP</div>
               <button class="rcard-btn" onclick="doRes('${t.id}')" ${can ? '' : 'disabled'}>${ok ? 'ВІДКРИТИ' : '🔒 Спочатку попередні'}</button>`
            }
          </div>`;
          })
          .join('')}
      </div>
    </div>`,
    )
    .join('');
}

function doRes(id) {
  const t = G.tech.find((x) => x.id === id);
  if (!t || t.done || G.rp < t.cost) return;
  if (!t.needs.every((n) => G.tech.find((x) => x.id === n)?.done)) return;
  G.rp -= t.cost;
  t.done = true;
  q('rpn').textContent = Math.floor(G.rp);
  G.dup++;
  G.act++;
  log(`Відкрито: ${t.name}`, 'upgrade');
  dRes();
}

// Модальне вікно модуля
function openMod(k) {
  const m = G.mods[k];
  if (!m) return;
  G.paused = true;
  const cost = upgC(m.lv), maxed = m.lv >= 5;
  const lc = LC[Math.min(m.lv, 5)];
  const pemg = G.emg.filter((x) => x.mk === k && !x.done);
  q('mtit').textContent = m.name;
  q('mbody').innerHTML = `
    <p><strong>Статус:</strong> <span class="modal-status ${m.crisis ? 'critical' : 'ok'}">${m.crisis ? 'Криза' : 'Норма'}</span></p>
    <p><strong>Рівень:</strong> <span style="color:${lc}">${LN[m.lv]} (${m.lv}/5)</span></p>
    ${m.crisis ? `<p style="color:#ff7755">${CRISES[m.crisis]?.desc || ''}</p>` : ''}
    <hr>
    ${
      pemg.length
        ? `<div style="background:rgba(255,61,61,0.1);border:1px solid rgba(255,61,61,0.4);padding:10px;margin-bottom:10px">
      <div style="color:#ff3d3d;font-size:12px;font-weight:700;margin-bottom:6px">⚠ ВІДКРИТА АВАРІЙНА МІСІЯ</div>
      ${pemg.map((x) => `<div style="font-size:11px;color:#f0cdb8;margin-bottom:4px">${x.icon} ${x.name}</div>
        <button class="btn-crisis" style="animation:none;background:rgba(255,61,61,0.2)" onclick="emgFromMod('${x.id}')">
          ${x.on ? `Виконується… ${x.t - x.pg}с` : '⚡ ВІДКРИТИ В МІСІЯХ'}
        </button>`).join('')}
    </div>`
        : ''
    }
    ${m.crisis && !pemg.length ? `<button class="btn-crisis" onclick="fixCrisis('${k}')">⚡ УСУНУТИ ВРУЧНУ (без нагороди)</button>` : ''}
    ${
      maxed
        ? `<p style="color:${lc};font-size:12px;margin-top:10px">★ Максимальний рівень</p>`
        : `<button class="btn-upgrade" onclick="upgMod('${k}')" ${!maxed && G.rp >= cost ? '' : 'disabled'}>
         ▲ Покращити до рівня ${m.lv + 1} (${cost} RP) <span style="color:${LC[m.lv + 1]}">→ ${LN[m.lv + 1]}</span>
       </button>
       ${G.rp < cost ? `<p class="hint" style="margin-top:6px">Потрібно ${cost} RP, є ${Math.floor(G.rp)}</p>` : ''}`
    }`;
  q('modal').classList.add('open');
}

function emgFromMod(id) {
  closeModal();
  goto('missions');
  setTimeout(() => startEmg(id), 100);
}

// Ручне усунення кризи (без нагороди)
function fixCrisis(k) {
  G.mods[k].crisis = null;
  G.dcf++;
  log(`Кризу усунено: ${G.mods[k].name}`, 'ok');
  closeModal();
}

function upgMod(k) {
  const m = G.mods[k], cost = upgC(m.lv);
  if (G.rp < cost || m.lv >= 5) return;
  G.rp -= cost;
  m.lv++;
  q('rpn').textContent = Math.floor(G.rp);
  G.dup++;
  G.act++;
  log(`${m.name} → Lv${m.lv} (${LN[m.lv]})`, 'upgrade');
  closeModal();
}

function closeModal() {
  q('modal').classList.remove('open');
  G.paused = false;
  dModList();
  updPins();
}

q('modal').addEventListener('click', (e) => {
  if (e.target === q('modal') || e.target.classList.contains('mcls'))
    closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && q('modal').classList.contains('open')) closeModal();
});
document.querySelectorAll('.pin').forEach((p) => {
  p.addEventListener('click', () => openMod(p.dataset.mod));
  p.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openMod(p.dataset.mod);
    }
  });
});

// Поразка — будь-який ресурс = 0 або всі загинули
function checkDef() {
  if (G.over) return;
  for (const [, v] of Object.entries(G.res))
    if (v <= 0) { end('defeat'); return; }
  if (!alive()) end('defeat');
}

// Перезапуск гри
function restart() {
  G.sol = 1; G.rp = 0; G.over = false; G.ending = null;
  G.paused = false; G.h = 6; G.m = 0; G.act = 0; G.idlewarn = false;
  Object.assign(G.res, { o2: 78, h2o: 54, en: 63 });
  Object.values(G.mods).forEach((m) => { m.status = 'ok'; m.lv = 1; m.crisis = null; });
  Object.values(G.bld).forEach((b) => { b.built = false; b.lv = 1; });
  G.tech.forEach((t) => { t.done = false; });
  G.ms.forEach((m) => { m.done = false; m.on = false; m.pg = 0; m.dsol = null; m.ropen = null; });
  G.emg.length = 0;
  G.zones.forEach((z) => { z.open = z.id === 'base'; z.ul = false; z.pg = 0; });
  G.crew.forEach((c) => { c.hp = 80 + Math.random() * 15; c.mor = 70 + Math.random() * 20; c.sl = null; });
  Object.keys(G.slots).forEach((k) => { G.slots[k] = null; });
  Object.assign(G.zb, { wr: 0, rr: 0, eb: 1, rlb: 1, or: 0 });
  Object.assign(G.win, { plant: false, surv: false, evac: false, zones: false, blds: false });
  Object.assign(G.plant, { stage: 1, prog: 0, growing: false });
  G.goals.forEach((o, i) => { o.done = false; o.on = i === 0; });
  G.daily = []; G.tr = false; G.trOffer = null; G.trNext = 7;
  G.dcf = 0; G.dms = 0; G.dup = 0; G.dzo = 0;
  q('snum').textContent = 1;
  q('rpn').textContent = 0;
  q('elog').innerHTML = '';
  q('gover').classList.add('hidden');
  goto('home');
  dBars(); dModList(); updPins(); dGoals(); genDaily();
  log('Місія розпочалась. Удачі, командире.', 'ok');
  showTkr();
  intro();
}

q('rbtn').addEventListener('click', restart);

// Головний ігровий цикл — кожну секунду
function loop() {
  if (G.over || G.paused) return;
  tickTime();
  tickRes();
  maybeCrisis();
  tickMs();
  tickExp();
  tickPlant();
  checkDef();
  dBars();
  dModList();
  updPins();
  dGoals();
}

// Запуск після завантаження
document.addEventListener('DOMContentLoaded', () => {
  G.plant.stage = 1;
  dBars();
  dModList();
  updPins();
  genDaily();
  dGoals();
  log('Місія розпочалась. Удачі, командире.', 'ok');
  showTkr();
  intro();
  setInterval(loop, 1000);
});
