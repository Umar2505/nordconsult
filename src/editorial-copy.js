// These headlines are written as complete thoughts in each language. The line
// breaks serve the animation; they are not translation boundaries.
const copy = [
  ['#intro .line:nth-child(1) .line__inner', ['YOUR FUTURE', 'KELAJAGINGIZ', 'ВАШЕ БУДУЩЕЕ']],
  ['#intro .line:nth-child(2) .line__inner', ["DOESN'T HAVE", 'BIR JOY BILAN', 'НЕ ОГРАНИЧЕНО']],
  ['#intro .line:nth-child(3) .line__inner', ['TO STAY <em>HERE.</em>', '<em>CHEKLANMAYDI.</em>', '<em>ОДНИМ МЕСТОМ.</em>']],
  ['.scene-two__line:nth-child(1) > span', ['THE WORLD', 'BUTUN DUNYO', 'ВЕСЬ МИР']],
  ['.scene-two__line:nth-child(2) > span', ['JUST BECAME', 'ENDI SIZNING', 'ТЕПЕРЬ ВАШ']],
  ['.scene-two__line:nth-child(3) > span', ['YOUR <em>CAMPUS.</em>', '<em>KAMPUSINGIZ.</em>', '<em>КАМПУС.</em>']],
  ['#final-question', ['BUT WHICH ONE IS RIGHT FOR <em>YOU?</em>', 'AMMO QAYSI BIRI <em>SIZGA MOS?</em>', 'НО ЧТО ПОДОЙДЁТ <em>ИМЕННО ВАМ?</em>']],
  ['.capital-gallery__story h2', ['EIGHT CAPITALS.<br /><em>ONE FUTURE.</em>', 'SAKKIZ POYTAXT.<br /><em>KELAJAK UCHUN KO‘P YO‘L.</em>', 'ВОСЕМЬ СТОЛИЦ.<br /><em>МНОГО ПУТЕЙ В БУДУЩЕЕ.</em>']],
  ['.capital-gallery__handoff h2', ['POSSIBILITY<br />BECOMES A <em>PLAN.</em>', 'IMKONIYATLARDAN<br /><em>ANIQ REJA SARI.</em>', 'ОТ ВОЗМОЖНОСТЕЙ<br />К <em>ЧЁТКОМУ ПЛАНУ.</em>']],
  ['.scene-four__opening h2', ['YOUR JOURNEY<br /><em>STARTS HERE.</em>', 'YO‘LINGIZ<br /><em>SHU YERDAN BOSHLANADI.</em>', 'ВАШ ПУТЬ<br /><em>НАЧИНАЕТСЯ ЗДЕСЬ.</em>']],
  ['#roadmap-university-note', ['NOT EVERY GOOD UNIVERSITY<br />IS GOOD FOR <em>YOU.</em>', 'YAXSHI UNIVERSITETLARNING<br />HAMMASI HAM <em>SIZGA MOS EMAS.</em>', 'ДАЖЕ ХОРОШИЙ УНИВЕРСИТЕТ<br />МОЖЕТ <em>ВАМ НЕ ПОДОЙТИ.</em>']],
  ['#roadmap-acceptance h2', ["YOU'VE BEEN<br /><em>ACCEPTED.</em>", 'SIZ O‘QISHGA<br /><em>QABUL QILINDINGIZ.</em>', 'ВЫ<br /><em>ПОСТУПИЛИ.</em>']],
  ['#roadmap-final h2', ['TO YOUR<br /><em>FIRST FLIGHT.</em>', 'ILK<br /><em>PARVOZINGIZGACHA.</em>', 'ДО ПЕРВОГО<br /><em>ПОЛЁТА.</em>']],
  ['#stories-one', ['ONE <em>JOURNEY.</em>', 'BIR <em>YO‘L.</em>', 'ОДИН <em>ПУТЬ.</em>']],
  ['#stories-many', ['MANY <em>POSSIBILITIES.</em>', 'KO‘P <em>IMKONIYAT.</em>', 'МНОГО <em>ВОЗМОЖНОСТЕЙ.</em>']],
  ['#stories-network-title', ['ONE WORLD.<br /><em>MANY JOURNEYS.</em>', 'BITTA DUNYO.<br /><em>TURLI YO‘LLAR.</em>', 'ОДИН МИР.<br /><em>РАЗНЫЕ ПУТИ.</em>']],
  ['#stories-trust-second', ['A DIFFERENT PATH.<br /><em>FOR EVERY STUDENT.</em>', 'HAR BIR TALABANING<br /><em>O‘Z YO‘LI BOR.</em>', 'У КАЖДОГО СТУДЕНТА<br /><em>СВОЙ ПУТЬ.</em>']],
  ['#stories-unfinished', ['THEIR STORIES<br />STARTED THE SAME WAY.<br /><em>WITH A QUESTION.</em>', 'ULARNING HAMMASI<br />BIR SAVOLDAN<br /><em>BOSHLANGAN.</em>', 'ВСЁ НАЧАЛОСЬ<br />С ОДНОГО<br /><em>ВОПРОСА.</em>']],
  ['#stories-question', ['WHERE WILL<br /><em>YOUR STORY GO?</em>', 'SIZNING HIKOYANGIZ<br /><em>QAYERDA DAVOM ETADI?</em>', 'А ГДЕ ПРОДОЛЖИТСЯ<br /><em>ВАША ИСТОРИЯ?</em>']],
  ['#builder-intro h2', ["LET'S <em>FIND OUT.</em>", 'KELING, <em>ANIQLAYMIZ.</em>', 'ДАВАЙТЕ <em>РАЗБЕРЁМСЯ.</em>']],
  ['#builder-filter', ['<span>FROM EVERYWHERE</span><strong>TO SOMEWHERE THAT FITS YOU.</strong><small>ILLUSTRATIVE FILTERING · NOT UNIVERSITY RECOMMENDATIONS</small>', '<span>KO‘P VARIANTLAR ORASIDAN</span><strong>SIZGA MOSINI TOPAMIZ.</strong><small>NAMUNAVIY SARALASH · UNIVERSITET TAVSIYASI EMAS</small>', '<span>ИЗ МНОЖЕСТВА ВАРИАНТОВ</span><strong>НАЙДЁМ ТО, ЧТО ПОДХОДИТ ВАМ.</strong><small>ПРИМЕР ОТБОРА · НЕ РЕКОМЕНДАЦИЯ УНИВЕРСИТЕТОВ</small>']],
  ['#builder-result h2', ['IS STARTING TO<br /><em>TAKE SHAPE.</em>', 'ENDI ANIQ<br /><em>SHAKL OLMOQDA.</em>', 'ПОСТЕПЕННО<br /><em>ПРОЯСНЯЕТСЯ.</em>']],
  ['#builder-contact h2', ['CONTINUE YOUR<br /><em>JOURNEY.</em>', 'YO‘LINGIZNI<br /><em>DAVOM ETTIRING.</em>', 'СДЕЛАЙТЕ<br /><em>СЛЕДУЮЩИЙ ШАГ.</em>']],
  ['#photo-hero h2', ['IMAGINE<br />CALLING THIS<br /><em>HOME.</em>', 'TASAVVUR QILING:<br />BU JOYNI <em>UYIM</em><br />DEYSIZ.', 'ПРЕДСТАВЬТЕ:<br />ОДНАЖДЫ ЭТО<br /><em>ВАШ ДОМ.</em>']],
  ['#photo-study h2', ['BUT UNIVERSITY<br />BECOMES MUCH MORE<br />THAN A <em>CLASSROOM.</em>', 'UNIVERSITET —<br />FAQAT <em>DARSLAR</em><br />EMAS.', 'УНИВЕРСИТЕТ —<br />ЭТО БОЛЬШЕ,<br />ЧЕМ <em>ЗАНЯТИЯ.</em>']],
  ['#photo-city .city-copy:not(.city-copy--second)', ["YOU DON'T JUST<br />CHOOSE A UNIVERSITY.", 'SIZ FAQAT<br />UNIVERSITETNI TANLAMAYSIZ.', 'ВЫ ВЫБИРАЕТЕ<br />НЕ ТОЛЬКО УНИВЕРСИТЕТ.']],
  ['#photo-city .city-copy--second', ['YOU CHOOSE<br /><em>A LIFE AROUND IT.</em>', 'SIZ UNI O‘RAB TURGAN<br /><em>HAYOTNI HAM TANLAYSIZ.</em>', 'ВЫ ВЫБИРАЕТЕ<br /><em>ЖИЗНЬ ВОКРУГ НЕГО.</em>']],
  ['#photo-seasons h2', ['YOU WATCH<br />A NEW PLACE<br /><em>BECOME FAMILIAR.</em>', 'YANGI JOY<br />ASTA-SEKIN<br /><em>QADRDON BO‘LIB QOLADI.</em>', 'НОВОЕ МЕСТО<br />ПОСТЕПЕННО<br /><em>СТАНОВИТСЯ РОДНЫМ.</em>']],
  ['#photo-mosaic h2', ['IT STOPS FEELING<br />LIKE “ABROAD.”', 'BU JOY ENDI<br />BEGONA TUYULMAYDI.', 'ОНО БОЛЬШЕ<br />НЕ КАЖЕТСЯ ЧУЖИМ.']],
  ['#photo-life h2', ['IT JUST FEELS<br />LIKE <em>YOUR LIFE.</em>', 'BU HAYOT HAM<br /><em>SIZNIKI.</em>', 'ЭТО ПРОСТО<br /><em>ВАША ЖИЗНЬ.</em>']],
  ['#photo-callback h2 strong', ['COULD LOOK<br />LIKE THIS.', 'SHUNDAY<br />BO‘LISHI MUMKIN.', 'МОЖЕТ ВЫГЛЯДЕТЬ<br />ВОТ ТАК.']],
  ['.behind-opening h2', ['IT CAN LOOK<br />EFFORTLESS<br /><em>FROM HERE.</em>', 'TASHQARIDAN<br />HAMMASI <em>OSON</em><br />KO‘RINADI.', 'СО СТОРОНЫ<br />ВСЁ КАЖЕТСЯ<br /><em>ПРОСТЫМ.</em>']],
  ['.research-work header h2', ['FIND THE<br /><em>RIGHT OPTIONS.</em>', 'AVVAL SIZGA MOS<br /><em>VARIANTLARNI TOPAMIZ.</em>', 'СНАЧАЛА НАЙДЁМ<br /><em>ПОДХОДЯЩИЕ ВАРИАНТЫ.</em>']],
  ['.draft-work header h2', ['MAKE THE<br />APPLICATION <em>STRONG.</em>', 'ARIZANI<br /><em>PUXTA TAYYORLAYMIZ.</em>', 'ПОДГОТОВИМ<br /><em>СИЛЬНУЮ ЗАЯВКУ.</em>']],
  ['.draft-caption', ['GOOD APPLICATIONS<br />RARELY START AS<br />FINAL DRAFTS.', 'PUXTA ARIZA<br />BIRINCHI QORALAMADAYOQ<br />TAYYOR BO‘LMAYDI.', 'СИЛЬНАЯ ЗАЯВКА<br />РЕДКО ПОЛУЧАЕТСЯ<br />С ПЕРВОГО РАЗА.']],
  ['.detail-work h2', ['AND EVERYTHING<br /><em>HAS A DEADLINE.</em>', 'HAR BIR BOSQICHNING<br /><em>O‘Z MUDDATI BOR.</em>', 'И У КАЖДОГО ЭТАПА<br /><em>СВОЙ СРОК.</em>']],
  ['.human-reveal h2', ["BUT DOCUMENTS<br />DON'T MAKE<br /><em>DECISIONS.</em>", 'HUJJATLAR<br /><em>QAROR QABUL QILMAYDI.</em>', 'НО ДОКУМЕНТЫ<br /><em>НЕ ПРИНИМАЮТ РЕШЕНИЙ.</em>']],
  ['.brand-statement h2', ['A PLAN THAT<br /><em>MAKES SENSE FOR YOU.</em>', 'AYNAN SIZGA<br /><em>MOS REJA.</em>', 'ПЛАН,<br /><em>КОТОРЫЙ ПОДХОДИТ ВАМ.</em>']],
  ['.behind-brand h2', ['FROM “WHERE DO I START?”<br /><em>TO “I’M HERE.”</em>', '“QAYERDAN BOSHLAYMAN?”DAN<br /><em>“MANA, YETIB KELDIM”GACHA.</em>', 'ОТ «С ЧЕГО НАЧАТЬ?»<br /><em>ДО «Я УЖЕ ЗДЕСЬ».</em>']],
  ['.journey-question h2', ["READY TO FIND OUT<br /><em>WHAT'S REALISTIC FOR YOU?</em>", 'ENDI SIZGA MOS<br /><em>IMKONIYATLARNI BILIB OLAMIZMI?</em>', 'ГОТОВЫ УЗНАТЬ,<br /><em>ЧТО ПОДХОДИТ ИМЕННО ВАМ?</em>']],
  ['#final-transition h2', ["NOW LET'S TALK<br /><em>ABOUT YOURS.</em>", 'ENDI <em>SIZNING</em><br />REJALARINGIZ HAQIDA GAPLASHAQ.', 'ТЕПЕРЬ ПОГОВОРИМ<br /><em>О ВАШИХ ПЛАНАХ.</em>']],
  ['#final-headline p', ['EVERY JOURNEY<br />STARTS <em>SOMEWHERE.</em>', 'HAR BIR YO‘L<br /><em>BIR QADAMDAN BOSHLANADI.</em>', 'ЛЮБОЙ ПУТЬ<br /><em>НАЧИНАЕТСЯ С ШАГА.</em>']],
  ['#final-headline h2', ['YOURS CAN<br /><em>START HERE.</em>', 'SIZNIKI HAM<br /><em>SHU YERDAN BOSHLANSIN.</em>', 'ВАШ ПУТЬ МОЖЕТ<br /><em>НАЧАТЬСЯ ЗДЕСЬ.</em>']],
  ['#final-contact-title', ["LET'S CONTINUE<br /><em>YOUR JOURNEY.</em>", 'KELING, REJANGIZNI<br /><em>BIRGA DAVOM ETTIRAMIZ.</em>', 'ДАВАЙТЕ<br /><em>ДВИГАТЬСЯ ДАЛЬШЕ.</em>']],
  ['#final-closing h2', ['WHERE WILL<br />YOUR STORY <em>GO?</em>', 'HIKOYANGIZ<br /><em>QAYERDA DAVOM ETADI?</em>', 'ГДЕ ПРОДОЛЖИТСЯ<br /><em>ВАША ИСТОРИЯ?</em>']],
];

export function applyEditorialCopy(language) {
  const index = { en: 0, uz: 1, ru: 2 }[language] ?? 0;
  for (const [selector, variants] of copy) {
    const node = document.querySelector(selector);
    if (!node) continue;
    node.setAttribute('data-no-translate', '');
    node.innerHTML = variants[index];
  }
  const worldHeadline = document.querySelector('.scene-two h2');
  if (worldHeadline) worldHeadline.setAttribute('aria-label', {
    en: 'The world just became your campus.',
    uz: 'Butun dunyo endi sizning kampusingiz.',
    ru: 'Весь мир теперь ваш кампус.',
  }[language]);
}
