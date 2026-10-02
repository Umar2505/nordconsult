import { escapeHTML } from './dom.js';
import { t } from './i18n.js';
import { leadDeliveryReady, submitLead } from './lead-submit.js';
import * as THREE from 'three';

const clamp = n => Math.max(0, Math.min(1, n));
const smooth = (a, b, n) => { const t = clamp((n - a) / (b - a)); return t * t * (3 - 2 * t); };
const lerp = THREE.MathUtils.lerp;

export const JOURNEY_QUESTIONS = [
  {
    key: 'studyLevel', label: 'LEVEL', kicker: '01 / 05 · YOUR STUDY LEVEL',
    title: 'WHICH STUDY LEVEL\nFITS YOUR PLANS?', support: 'Choose the stage that feels closest right now.',
    choices: ["Bachelor's", "Master's", 'Language program', 'Not sure yet']
  },
  {
    key: 'field', label: 'FIELD', kicker: '02 / 05 · YOUR INTEREST',
    title: 'WHAT INTERESTS YOU?', support: 'A broad direction is enough to begin.',
    choices: ['Computer Science', 'Business', 'Engineering', 'Medicine', 'Arts & Design', 'Social Sciences', 'Other', 'Not sure yet']
  },
  {
    key: 'region', label: 'REGION', kicker: '03 / 05 · YOUR DIRECTION',
    title: 'WHERE DO YOU\nSEE YOURSELF?', support: 'This gives the journey a direction, not a final destination.',
    choices: ['Europe', 'China', 'Nordics', 'Anywhere', 'Country in mind']
  },
  {
    key: 'priority', label: 'PRIORITY', kicker: '04 / 05 · YOUR PRIORITY',
    title: 'WHAT MATTERS MOST\nTO YOU?', support: 'Choose the factor that should guide the first filtering pass.',
    choices: ['Scholarship', 'Low tuition', 'University ranking', 'Career opportunities', 'Easier admission', 'Location', 'Not sure']
  },
  {
    key: 'budget', label: 'BUDGET', kicker: '05 / 05 · YOUR BUDGET',
    title: 'WHAT SHOULD WE\nPLAN AROUND?', support: 'An approximate annual study budget helps focus on realistic options.',
    choices: ['Under €5K', '€5K–10K', '€10K–20K', '€20K+', 'I need a scholarship', 'Not sure']
  }
];

const DIRECTIONS = {
  Europe: ['Finland', 'Germany', 'Italy'], China: ['China', 'Regional options', 'International programs'],
  Nordics: ['Finland', 'Sweden', 'Norway'], Anywhere: ['Finland', 'Germany', 'Italy'],
  'Country in mind': ['Selected country', 'Nearby options', 'Alternative routes']
};

function dispatch(name, detail = {}) {
  window.dispatchEvent(new CustomEvent(`nord:${name}`, { detail }));
}

function line(points, color, opacity = 0) {
  const object = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false })
  );
  object.frustumCulled = false;
  return object;
}

export function createJourneyBuilder(scene, chaos) {
  const ui = document.querySelector('#scene-six');
  const intro = document.querySelector('#builder-intro');
  const question = document.querySelector('#builder-question');
  const kicker = document.querySelector('#builder-kicker');
  const headline = document.querySelector('#builder-headline');
  const support = document.querySelector('#builder-support');
  const choices = document.querySelector('#builder-choices');
  const back = document.querySelector('#builder-back');
  const skipProfile = document.querySelector('#builder-skip-profile');
  const countryWrap = document.querySelector('#builder-country-wrap');
  const countryInput = document.querySelector('#builder-country');
  const countryContinue = document.querySelector('#builder-country-continue');
  const progressNodes = [...document.querySelectorAll('#builder-progress span')];
  const answerNodes = [...document.querySelectorAll('#builder-answers li')];
  const filterCopy = document.querySelector('#builder-filter');
  const result = document.querySelector('#builder-result');
  const summary = document.querySelector('#builder-summary');
  const contact = document.querySelector('#builder-contact');
  const form = document.querySelector('#lead-form');
  const methodButtons = [...document.querySelectorAll('[data-contact-method]')];
  const contactLabel = document.querySelector('#lead-contact-label');
  const contactInput = document.querySelector('#lead-contact');
  const formStatus = document.querySelector('#lead-status');
  const submit = document.querySelector('#lead-submit');
  const contactIntro = contact.querySelector(':scope > small');
  const contactIntroSource = contactIntro.textContent;
  const skip = document.querySelector('#lead-skip');
  const contactBack = document.querySelector('#lead-back');
  const success = document.querySelector('#builder-success');
  const successLabel = success.querySelector('p');
  const chapterHint = document.querySelector('#builder-next');

  const profile = { studyLevel: '', field: '', region: '', country: '', priority: '', budget: '' };
  let advancing = false, advanceTimer = 0, contactOpen = false, sending = false;
  let step = 0, progress = 0, contactMethod = 'WhatsApp', complete = false, outcome = '', submittedAt = '';
  const storageKey = 'nord-journey-builder-v1';

  try {
    const saved = JSON.parse(sessionStorage.getItem(storageKey) || 'null');
    if (saved?.profile) Object.keys(profile).forEach(key => { if (typeof saved.profile[key] === 'string') profile[key] = saved.profile[key]; });
    step = Math.max(0, Math.min(JOURNEY_QUESTIONS.length - 1, Number(saved?.step) || 0));
    complete = Boolean(saved?.complete) && JOURNEY_QUESTIONS.every(question => Boolean(answerValue(question.key)));
    outcome = ['profile-skipped', 'skipped', 'submitted'].includes(saved?.outcome) ? saved.outcome : '';
    submittedAt = typeof saved?.submittedAt === 'string' ? saved.submittedAt : '';
  } catch {}

  function persist() {
    try { sessionStorage.setItem(storageKey, JSON.stringify({ profile, step, complete, outcome, submittedAt })); } catch {}
  }

  const passportCanvas = document.createElement('canvas');
  passportCanvas.width = 768; passportCanvas.height = 1060;
  const passportContext = passportCanvas.getContext('2d');
  const passportMap = new THREE.CanvasTexture(passportCanvas);
  passportMap.colorSpace = THREE.SRGBColorSpace; passportMap.anisotropy = 8;
  const passportProfile = new THREE.Mesh(
    new THREE.PlaneGeometry(2.38, 3.28),
    new THREE.MeshStandardMaterial({ map: passportMap, roughness: .96, transparent: true, opacity: 0, side: THREE.DoubleSide })
  );
  passportProfile.position.set(1.275, 0, .102);
  passportProfile.visible = false;
  chaos.student.add(passportProfile);

  function fitText(text, maxWidth, startingSize = 34) {
    let size = startingSize;
    passportContext.font = `600 ${size}px Arial, sans-serif`;
    while (size > 19 && passportContext.measureText(text).width > maxWidth) {
      size -= 1; passportContext.font = `600 ${size}px Arial, sans-serif`;
    }
    return size;
  }

  function drawPassportProfile() {
    const ctx = passportContext;
    ctx.fillStyle = '#eee7d6'; ctx.fillRect(0, 0, 768, 1060);
    const wash = ctx.createLinearGradient(0, 0, 768, 1060);
    wash.addColorStop(0, 'rgba(90,122,124,.09)'); wash.addColorStop(.55, 'rgba(255,255,255,.03)'); wash.addColorStop(1, 'rgba(169,118,73,.08)');
    ctx.fillStyle = wash; ctx.fillRect(0, 0, 768, 1060);
    ctx.strokeStyle = 'rgba(36,62,65,.12)'; ctx.lineWidth = 1;
    for (let y = 22; y < 1060; y += 28) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(768, y + 16); ctx.stroke(); }
    ctx.strokeStyle = '#273f40'; ctx.lineWidth = 3; ctx.strokeRect(44, 44, 680, 972);
    ctx.fillStyle = '#273f40'; ctx.font = '700 20px Arial, sans-serif'; ctx.letterSpacing = '4px'; ctx.fillText(t('FUTURE STUDENT JOURNEY'), 74, 105);
    ctx.fillStyle = '#aa8250'; ctx.fillRect(74, 129, 108, 4);
    ctx.fillStyle = '#718182'; ctx.font = '13px Arial, sans-serif'; ctx.fillText(t('PERSONALISED STUDY PROFILE'), 74, 169);

    const rows = [
      ['STUDY LEVEL', profile.studyLevel], ['FIELD', profile.field],
      ['REGION', answerValue('region')], ['PRIORITY', profile.priority], ['BUDGET', profile.budget]
    ];
    rows.forEach(([label, value], index) => {
      const y = 258 + index * 128;
      ctx.fillStyle = '#7c8987'; ctx.font = '12px Arial, sans-serif'; ctx.fillText(t(label), 74, y);
      ctx.fillStyle = '#273f40';
      const displayValue = t(value || 'TO BE DECIDED').toLocaleUpperCase();
      const size = fitText(displayValue, 590);
      ctx.font = `600 ${size}px Arial, sans-serif`; ctx.fillText(displayValue, 74, y + 42);
      ctx.strokeStyle = 'rgba(39,63,64,.18)'; ctx.beginPath(); ctx.moveTo(74, y + 73); ctx.lineTo(694, y + 73); ctx.stroke();
    });
    ctx.fillStyle = '#a27c4a'; ctx.font = '700 15px Arial, sans-serif'; ctx.fillText(t('STATUS  ·  PLANNING'), 74, 929);
    ctx.fillStyle = '#6d7d7b'; ctx.font = '12px Arial, sans-serif'; ctx.fillText(t('ILLUSTRATIVE PROFILE  ·  NORD CONSULT'), 74, 969);
    passportMap.needsUpdate = true;
  }

  const root = new THREE.Group(); scene.add(root);
  const pathPoints = [
    new THREE.Vector3(-2.8, 10.5, -79), new THREE.Vector3(-1.8, 11.8, -75),
    new THREE.Vector3(-.3, 13.1, -71), new THREE.Vector3(1.2, 14.1, -69),
    new THREE.Vector3(2.5, 14.5, -72), new THREE.Vector3(3.5, 14.8, -77),
    new THREE.Vector3(3.0, 15.2, -84), new THREE.Vector3(1.4, 15.7, -93),
    new THREE.Vector3(.2, 16.1, -103), new THREE.Vector3(0, 16.5, -115)
  ];
  const curve = new THREE.CatmullRomCurve3(pathPoints, false, 'catmullrom', .3);
  const samples = curve.getPoints(320);
  const path = line(samples, 0xe7ca94); root.add(path);
  const dimPath = line(samples, 0x6e837d, .2); root.add(dimPath);
  const pathHead = new THREE.Mesh(new THREE.SphereGeometry(.09, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffdda0, transparent: true, opacity: 0 })); root.add(pathHead);
  const progressMarkers = JOURNEY_QUESTIONS.map((_, i) => {
    const point = curve.getPoint(.13 + i * .105);
    const ring = new THREE.Mesh(new THREE.RingGeometry(.12, .135, 26), new THREE.MeshBasicMaterial({ color: 0xd8c095, transparent: true, opacity: .25, side: THREE.DoubleSide, depthWrite: false }));
    ring.position.copy(point); root.add(ring);
    const dot = new THREE.Mesh(new THREE.SphereGeometry(.065, 8, 6), new THREE.MeshBasicMaterial({ color: 0xf0d39e, transparent: true, opacity: 0 }));
    dot.position.copy(point); root.add(dot);
    return { ring, dot };
  });

  const possibilityGeometry = new THREE.SphereGeometry(.045, 6, 5);
  const possibilityMaterial = new THREE.MeshBasicMaterial({ color: 0xb8c9bc, transparent: true, opacity: 0, depthWrite: false });
  const possibilities = new THREE.InstancedMesh(possibilityGeometry, possibilityMaterial, 108);
  const instance = new THREE.Object3D();
  const possibilityData = Array.from({ length: 108 }, (_, i) => {
    const angle = i * 2.39996, radius = 2.4 + (i * 13 % 19) * .24;
    return new THREE.Vector3(Math.cos(angle) * radius, 15.5 + Math.sin(angle) * radius * .42, -97 + (i * 17 % 29) * .42);
  });
  possibilityData.forEach((position, i) => { instance.position.copy(position); instance.updateMatrix(); possibilities.setMatrixAt(i, instance.matrix); });
  possibilities.instanceMatrix.needsUpdate = true; possibilities.frustumCulled = false; root.add(possibilities);

  const viableRing = new THREE.Mesh(
    new THREE.TorusGeometry(3.2, .018, 6, 80),
    new THREE.MeshBasicMaterial({ color: 0xd6bd8c, transparent: true, opacity: 0, depthWrite: false })
  );
  viableRing.position.set(0, 15.5, -94); viableRing.rotation.x = Math.PI / 2; root.add(viableRing);

  const campus = new THREE.Group(); campus.position.set(0, 15.6, -115); root.add(campus);
  const campusMaterial = new THREE.MeshBasicMaterial({ color: 0xb5aa87, transparent: true, opacity: 0 });
  [-2.2, -1.35, -.45, .55, 1.5, 2.3].forEach((x, i) => {
    const building = new THREE.Mesh(new THREE.BoxGeometry(.58 + (i % 2) * .22, 1.3 + (i % 3) * .62, .7), campusMaterial);
    building.position.set(x, building.geometry.parameters.height / 2, (i % 2) * -.5); campus.add(building);
  });
  const campusLight = new THREE.PointLight(0xffcf8c, 0, 20, 2); campus.add(campusLight);

  function setVisible(node, visible) {
    node.classList.toggle('is-visible', visible);
    node.setAttribute('aria-hidden', String(!visible));
  }

  function answerValue(key) { return key === 'region' && profile.country ? profile.country : profile[key]; }

  function renderQuestion() {
    const data = JOURNEY_QUESTIONS[step];
    advancing = false; clearTimeout(advanceTimer);
    kicker.textContent = t(data.kicker);
    headline.innerHTML = t(data.title).split('\n').join('<br>');
    support.textContent = t(data.support);
    choices.replaceChildren();
    data.choices.forEach((value, index) => {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'builder-choice';
      button.style.setProperty('--choice-index', index);
      button.textContent = t(value).toLocaleUpperCase();
      button.setAttribute('aria-pressed', String(profile[data.key] === value));
      button.addEventListener('click', () => choose(value, button));
      choices.append(button);
    });
    countryWrap.hidden = !(data.key === 'region' && profile.region === 'Country in mind');
    countryInput.value = profile.country;
    back.hidden = step === 0;
    progressNodes.forEach((node, i) => node.classList.toggle('is-complete', i < step));
    answerNodes.forEach((node, i) => {
      const q = JOURNEY_QUESTIONS[i], value = answerValue(q.key);
      node.classList.toggle('is-filled', Boolean(value));
      node.querySelector('small').textContent = t(q.label);
      node.querySelector('strong').textContent = t(value || '—');
    });
    persist();
    requestAnimationFrame(() => question.classList.remove('is-changing'));
  }

  function choose(value, button) {
    if (advancing || complete) return;
    const data = JOURNEY_QUESTIONS[step];
    [...choices.children].forEach(choice => choice.classList.toggle('is-selected', choice === button));
    if (data.key === 'region' && value === 'Country in mind') {
      profile.region = value; countryWrap.hidden = false; countryInput.focus(); return;
    }
    profile[data.key] = value;
    if (data.key === 'region') profile.country = '';
    dispatch(`${data.key.replace(/[A-Z]/g, m => `_${m.toLowerCase()}`)}_selected`, { value });
    advancing = true;
    question.classList.add('is-changing');
    [...choices.children].forEach(choice => { choice.disabled = true; });
    advanceTimer = window.setTimeout(() => { advancing = false; advance(); }, 180);
  }

  function advance() {
    if (step < JOURNEY_QUESTIONS.length - 1) { step += 1; renderQuestion(); }
    else finishProfile();
    if (!complete) question.focus({ preventScroll: true });
  }

  function finishProfile() {
    complete = true; step = JOURNEY_QUESTIONS.length;
    drawPassportProfile();
    setVisible(question, false); setVisible(result, true);
    progressNodes.forEach(node => node.classList.add('is-complete'));
    const directions = profile.country ? [profile.country] : (DIRECTIONS[profile.region] || DIRECTIONS.Anywhere);
    summary.innerHTML = JOURNEY_QUESTIONS.map(q => `<li><small>${t(q.label)}</small><strong>${escapeHTML(t(answerValue(q.key)))}</strong></li>`).join('')
      + `<li class="builder-summary__directions"><small>ILLUSTRATIVE DIRECTIONS</small><strong>${directions.map(value => escapeHTML(t(value))).join(' · ')}</strong></li>`;
    persist();
    dispatch('profile_completed', { profile: { ...profile } });
  }

  countryContinue.addEventListener('click', () => {
    const value = countryInput.value.trim();
    if (advancing || complete) return;
    if (!value) { countryInput.setAttribute('aria-invalid', 'true'); return; }
    countryInput.removeAttribute('aria-invalid'); profile.country = value; dispatch('region_selected', { value });
    advancing = true; question.classList.add('is-changing');
    advanceTimer = window.setTimeout(() => { advancing = false; advance(); }, 180);
  });
  countryInput.addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); countryContinue.click(); } });
  back.addEventListener('click', () => {
    if (complete) { complete = false; step = 4; setVisible(result, false); setVisible(contact, false); setVisible(question, true); }
    else if (step > 0) step -= 1;
    renderQuestion();
  });
  skipProfile.addEventListener('click', () => {
    if (advancing || sending) return;
    clearTimeout(advanceTimer); advancing = false; contactOpen = false; complete = false; outcome = 'profile-skipped';
    setVisible(question, false); setVisible(result, false); setVisible(contact, false); setVisible(success, true);
    successLabel.textContent = 'CONTINUING WITHOUT A PROFILE';
    document.querySelector('#builder-success-title').innerHTML = 'START WHERE<br /><em>YOU ARE.</em>';
    document.querySelector('#builder-success-copy').textContent = 'You can explore the rest of the journey now and define your plans later.';
    persist();
    dispatch('scene6_skipped', { profile: null, source: 'profile' });
  });
  document.querySelector('#builder-contact-open').addEventListener('click', () => {
    submit.disabled = !leadDeliveryReady;
    contactIntro.textContent = t(contactIntroSource);
    formStatus.textContent = leadDeliveryReady ? '' : t('Online enquiries are temporarily unavailable.');
    formStatus.dataset.state = leadDeliveryReady ? '' : 'error';
    contactOpen = true; setVisible(result, false); setVisible(contact, true); dispatch('contact_started', { profile: { ...profile } });
    document.querySelector('#lead-name').focus({ preventScroll: true });
  });
  document.querySelector('#builder-edit').addEventListener('click', () => { editProfile(); dispatch('profile_edit'); });
  contactBack.addEventListener('click', () => {
    if (sending) return;
    contactOpen = false;
    formStatus.textContent = '';
    formStatus.removeAttribute('data-state');
    setVisible(contact, false); setVisible(result, true);
    document.querySelector('#builder-contact-open').focus({ preventScroll: true });
  });
  contact.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); contactBack.click(); return; }
    if (event.key !== 'Tab') return;
    const controls = [...contact.querySelectorAll('button:not(:disabled), input, a')].filter(node => node.getClientRects().length);
    const first = controls[0], last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  methodButtons.forEach(button => button.addEventListener('click', () => {
    contactMethod = button.dataset.contactMethod;
    methodButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    contactLabel.textContent = contactMethod.toUpperCase();
    contactInput.type = contactMethod === 'Email' ? 'email' : contactMethod === 'Telegram' ? 'text' : 'tel';
    contactInput.inputMode = contactInput.type;
    contactInput.autocomplete = contactMethod === 'Email' ? 'email' : contactMethod === 'Telegram' ? 'off' : 'tel';
    contactInput.placeholder = contactMethod === 'Email' ? 'you@example.com' : contactMethod === 'Telegram' ? '@username or phone' : 'Your number';
    contactInput.focus();
  }));

  skip.addEventListener('click', () => {
    if (sending) return;
    contactOpen = false; outcome = 'skipped'; setVisible(contact, false); setVisible(success, true);
    successLabel.textContent = 'CONTINUING WITHOUT SUBMISSION';
    document.querySelector('#builder-success-title').textContent = 'YOUR PATH IS READY TO CONTINUE.';
    document.querySelector('#builder-success-copy').textContent = 'Explore at your own pace. Your illustrative journey stays visible here.';
    persist();
    dispatch('scene6_skipped', { profile: { ...profile } });
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || !form.reportValidity()) return;
    sending = true; submit.disabled = true; skip.disabled = true; contactBack.disabled = true; submit.textContent = 'SENDING...'; formStatus.textContent = 'Sending your journey profile…'; formStatus.dataset.state = 'sending';
    const lead = {
        name: document.querySelector('#lead-name').value.trim(), contactMethod,
        contact: contactInput.value.trim(), ...profile,
        timestamp: new Date().toISOString(), source: 'interactive-story-scene-6', storyProgress: 6
    };
    try {
      await submitLead(lead, form.elements.namedItem('website').value);
      sending = false; contactOpen = false; outcome = 'submitted'; submittedAt = new Date().toISOString(); formStatus.textContent = 'PROFILE RECEIVED ✓'; formStatus.dataset.state = 'success';
      successLabel.textContent = 'PROFILE RECEIVED ✓';
      setVisible(contact, false); setVisible(success, true); dispatch('lead_submitted', { method: contactMethod });
      persist();
    } catch (error) {
      sending = false;
      formStatus.textContent = t("Something went wrong. Your information wasn't sent. Please try again.");
      formStatus.dataset.state = 'error'; submit.disabled = false; skip.disabled = false; contactBack.disabled = false; submit.textContent = 'TRY AGAIN →'; dispatch('lead_submission_failed', { reason: error.message });
    }
  });

  if (complete) {
    const restoredOutcome = outcome;
    finishProfile();
    outcome = restoredOutcome;
    if (outcome === 'skipped') {
      successLabel.textContent = 'CONTINUING WITHOUT SUBMISSION';
      document.querySelector('#builder-success-title').textContent = 'YOUR PATH IS READY TO CONTINUE.';
      document.querySelector('#builder-success-copy').textContent = 'Explore at your own pace. Your illustrative journey stays visible here.';
    }
  } else {
    renderQuestion();
    if (outcome === 'profile-skipped') {
      successLabel.textContent = 'CONTINUING WITHOUT A PROFILE';
      document.querySelector('#builder-success-title').innerHTML = 'START WHERE<br /><em>YOU ARE.</em>';
      document.querySelector('#builder-success-copy').textContent = 'You can explore the rest of the journey now and define your plans later.';
    }
  }

  function update(p, time, camera, mobile, reduced, pointer) {
    passportProfile.visible = false;
    progress = p; const visible = p > .001;
    const journeyReady = complete || Boolean(outcome);
    const handoff = journeyReady ? smooth(.56, .96, p) : 0;
    root.visible = visible;
    ui.style.opacity = String(smooth(.025, .1, p) * (1 - smooth(.82, .99, p)));
    ui.setAttribute('aria-hidden', String(!visible));
    ui.style.pointerEvents = p > .075 ? 'auto' : 'none';
    if (!visible) return;
    const answered = complete ? 5 : step;
    const knowledge = answered / 5;
    const introShow = smooth(.04, .11, p) * (1 - smooth(.17, .24, p));
    intro.style.opacity = String(introShow);
    intro.style.visibility = introShow > .01 ? 'visible' : 'hidden';
    setVisible(question, p > .18 && !complete && !outcome);
    setVisible(result, p > .18 && complete && !contactOpen && !outcome);
    setVisible(contact, p > .18 && contactOpen);
    setVisible(success, p > .18 && Boolean(outcome));
    const contentExit = journeyReady ? smooth(.56, .74, p) : 0;
    result.style.opacity = String(complete && !contactOpen && !outcome ? 1 - contentExit : 0);
    success.style.opacity = String(outcome ? 1 - contentExit : 0);
    result.style.pointerEvents = contentExit < .05 && complete && !contactOpen && !outcome ? 'auto' : 'none';
    success.style.pointerEvents = contentExit < .05 && Boolean(outcome) ? 'auto' : 'none';
    document.querySelector('#builder-answers').hidden = complete || Boolean(outcome) || p < .18;
    // Blend from the roadmap's last camera pose into the builder's path.
    // The roadmap updates first each frame, so these are its endpoint values.
    const handoffPosition = camera.position.clone();
    const handoffRotation = camera.quaternion.clone();
    const cameraStart = new THREE.Vector3(0, 16, mobile ? -57 : -61);
    const cameraEnd = new THREE.Vector3(mobile ? 1.2 : 4.8, 17.3 + knowledge * .7, -65 - knowledge * 4);
    camera.position.copy(cameraStart.lerp(cameraEnd, smooth(.03, .18, p)));
    camera.position.lerp(new THREE.Vector3(0, 18, -96), handoff);
    camera.lookAt(new THREE.Vector3(0, lerp(14.2, 16.2, handoff), lerp(-78 - knowledge * 8, -114, handoff)));
    camera.up.set(0, 1, 0);
    const cameraBlend = smooth(0, .14, p);
    camera.position.copy(handoffPosition.lerp(camera.position, cameraBlend));
    camera.quaternion.copy(handoffRotation.slerp(camera.quaternion, cameraBlend));
    if (!complete) {
      chaos.student.scale.multiplyScalar(1 - smooth(.015, .13, p));
      if (p >= .13) chaos.student.visible = false;
    }

    const extension = lerp(.12, complete ? .83 : .18 + answered * .12, smooth(.05, .18, p));
    const finalExtension = lerp(extension, 1, handoff);
    path.geometry.setDrawRange(0, Math.floor(samples.length * finalExtension));
    path.material.opacity = .42 + knowledge * .5 + handoff * .08;
    dimPath.material.opacity = .13 * (1 - knowledge * .65);
    pathHead.position.copy(curve.getPoint(Math.min(.999, finalExtension)));
    pathHead.material.opacity = reduced ? .75 : .7 + .3 * Math.sin(time * 2.1);
    progressMarkers.forEach(({ ring, dot }, i) => {
      const filled = i < answered || complete;
      ring.material.opacity = filled ? .8 : .23;
      ring.quaternion.copy(camera.quaternion);
      dot.material.opacity = filled ? 1 : 0;
      dot.scale.setScalar(filled && !reduced ? 1 + .13 * Math.sin(time * 2.3 + i) : 1);
    });
    possibilityMaterial.opacity = smooth(.18, .5, knowledge) * (.16 + knowledge * .5);
    possibilities.count = complete ? 7 : Math.floor(108 * smooth(.05, .7, knowledge));
    const budgetScale = profile.budget === 'Under €5K' ? .55 : profile.budget === '€5K–10K' ? .72 : profile.budget === '€10K–20K' ? .86 : 1;
    viableRing.material.opacity = complete ? .35 : 0;
    viableRing.scale.setScalar(lerp(1.35, budgetScale, complete ? 1 : 0));

    // The filtering copy belongs to the transition into the result. Keeping it
    // visible behind the completed profile makes both headlines unreadable.
    filterCopy.style.opacity = '0';
    filterCopy.querySelector('strong').textContent = complete ? 'TO SOMEWHERE THAT FITS YOU.' : 'FROM EVERYWHERE';

    if (complete && p > .18) {
      chaos.student.visible = !mobile && !contactOpen;
      chaos.student.position.set(mobile ? 1.35 : 3.7, mobile ? 13.8 : 14.1, mobile ? -75 : -77);
      chaos.student.scale.setScalar(mobile ? .18 : .28);
      chaos.student.rotation.set(-.05, -.18, -.03);
      chaos.studentCover.rotation.y = -Math.PI * .78;
      passportProfile.visible = true;
      passportProfile.material.opacity = 1;
    }
    if (handoff > 0 && complete) {
      chaos.studentCover.rotation.y = lerp(-Math.PI * .78, 0, handoff);
      chaos.student.scale.multiplyScalar(1 - .8 * handoff);
      passportProfile.material.opacity = 1 - handoff;
    }
    campusMaterial.opacity = .2 * handoff;
    campusLight.intensity = 6 * handoff;
    chapterHint.style.opacity = journeyReady ? String(smooth(.68, .9, p) * (1 - smooth(.96, 1, p))) : '0';

    const drift = mobile || reduced ? 0 : pointer.x * .12;
    root.position.x = drift;
    ui.style.setProperty('--builder-light', String(.12 + knowledge * .48 + handoff * .25));
  }

  function editProfile() {
    complete = false; outcome = ''; contactOpen = false; step = 0;
    submit.disabled = false; skip.disabled = false; contactBack.disabled = false; submit.textContent = 'CONTINUE MY JOURNEY →';
    successLabel.textContent = 'PROFILE RECEIVED ✓';
    document.querySelector('#builder-success-title').innerHTML = 'YOUR JOURNEY<br /><em>HAS STARTED.</em>';
    document.querySelector('#builder-success-copy').textContent = "We'll review your profile and continue from here.";
    persist();
    setVisible(result, false); setVisible(contact, false); setVisible(success, false); setVisible(question, true);
    renderQuestion();
  }

  return {
    update, profile, root, editProfile,
    markSubmitted: date => { outcome = 'submitted'; submittedAt = date; persist(); },
    getState: () => ({ complete, outcome, submittedAt })
  };
}
