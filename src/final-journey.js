import { escapeHTML } from './dom.js';
import { t } from './i18n.js';
import { leadDeliveryReady, submitLead } from './lead-submit.js';
const clamp = n => Math.max(0, Math.min(1, n));
const smooth = (a, b, n) => { const t = clamp((n - a) / (b - a)); return t * t * (3 - 2 * t); };

function reveal(node, value) {
  const opacity = clamp(value);
  node.style.opacity = String(opacity);
  node.style.visibility = opacity > .008 ? 'visible' : 'hidden';
}

function dispatch(name, detail = {}) {
  window.dispatchEvent(new CustomEvent(`nord:${name}`, { detail }));
}

export function createFinalJourney(builder, arrival) {
  const ui = document.querySelector('#scene-nine');
  const sceneEight = document.querySelector('#scene-eight');
  const transition = document.querySelector('#final-transition');
  const profileWrap = document.querySelector('#final-profile');
  const profileList = document.querySelector('#final-profile-list');
  const passport = document.querySelector('#final-passport');
  const passportFields = document.querySelector('#final-passport-fields');
  const passportStatus = document.querySelector('#final-passport-status');
  const passportDate = document.querySelector('#final-passport-date');
  const headline = document.querySelector('#final-headline');
  const headlineFirst = headline.querySelector('p');
  const headlineSecond = headline.querySelector('h2');
  const action = document.querySelector('#final-action');
  const cta = document.querySelector('#final-cta');
  const closingCta = document.querySelector('#final-closing-cta');
  const contact = document.querySelector('#final-contact');
  const contactSummary = document.querySelector('#final-contact-summary');
  const editProfile = document.querySelector('#final-edit-profile');
  const form = document.querySelector('#final-lead-form');
  const nameInput = document.querySelector('#final-lead-name');
  const contactInput = document.querySelector('#final-lead-contact');
  const contactLabel = document.querySelector('#final-lead-contact-label');
  const messageInput = document.querySelector('#final-lead-message');
  const methodButtons = [...document.querySelectorAll('[data-final-method]')];
  const formStatus = document.querySelector('#final-lead-status');
  const submit = document.querySelector('#final-lead-submit');
  const contactIntro = document.querySelector('.final-contact__form > small');
  const contactIntroSource = contactIntro.textContent;
  const success = document.querySelector('#final-success');
  const closing = document.querySelector('#final-closing');
  const campusPhoto = document.querySelector('#final-campus-photo');

  const hero = arrival.destination.heroImage;
  campusPhoto.src = hero.src;
  campusPhoto.srcset = hero.srcset;
  campusPhoto.sizes = '40vw';
  campusPhoto.style.objectPosition = hero.focal;

  let profileSignature = '';
  let method = 'WhatsApp';
  let formOpen = false;
  let submitted = builder.getState().outcome === 'submitted';
  let sending = false;
  let entered = false;
  let autoOpened = false;

  const profileRows = () => {
    const state = builder.getState();
    if (!state.complete && state.outcome !== 'submitted') return [];
    const p = builder.profile;
    return [
      ['LEVEL', p.studyLevel], ['FIELD', p.field], ['DESTINATION', p.country || p.region],
      ['PRIORITY', p.priority], ['BUDGET', p.budget]
    ].filter(([, value]) => value);
  };

  function renderProfile() {
    const rows = profileRows();
    const signature = JSON.stringify([rows, submitted]);
    if (signature === profileSignature) return;
    profileSignature = signature;
    if (!rows.length) {
      profileList.innerHTML = '<li class="final-profile__empty"><strong>STILL UNWRITTEN.</strong><small>That\'s completely fine.<br />We can start there.</small></li>';
      contactSummary.innerHTML = '<li><span>YOUR JOURNEY</span><strong>STILL UNWRITTEN</strong></li>';
      passportFields.innerHTML = '<div><dt>DESTINATION</dt><dd>—</dd></div><div><dt>FIELD</dt><dd>—</dd></div><div><dt>PLAN</dt><dd>—</dd></div>';
      passportStatus.textContent = submitted ? 'JOURNEY STARTED' : 'READY TO BEGIN';
      return;
    }
    profileList.innerHTML = rows.map(([label, value], index) => `<li style="--field:${index}"><span>${label}</span><strong>${escapeHTML(value)}</strong></li>`).join('');
    contactSummary.innerHTML = rows.map(([label, value]) => `<li><span>${label}</span><strong>${escapeHTML(value)}</strong></li>`).join('');
    passportFields.innerHTML = rows.slice(0, 4).map(([label, value]) => `<div><dt>${label}</dt><dd>${escapeHTML(value)}</dd></div>`).join('');
    passportStatus.textContent = submitted ? 'JOURNEY STARTED' : 'READY TO PLAN';
  }

  function setMethod(next) {
    method = next;
    methodButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.finalMethod === method)));
    const email = method === 'Email';
    const telegram = method === 'Telegram';
    contactLabel.textContent = email ? 'EMAIL ADDRESS' : telegram ? 'TELEGRAM USERNAME OR PHONE' : `${method.toUpperCase()} NUMBER`;
    contactInput.type = email ? 'email' : telegram ? 'text' : 'tel';
    contactInput.inputMode = email ? 'email' : telegram ? 'text' : 'tel';
    contactInput.autocomplete = email ? 'email' : telegram ? 'off' : 'tel';
    contactInput.placeholder = email ? 'you@example.com' : telegram ? '@username or +358…' : '+358 40 123 4567';
    dispatch('contact_method_selected', { method });
  }

  function openContact({ automatic = false } = {}) {
    if (submitted) return;
    submit.disabled = !leadDeliveryReady;
    contactIntro.textContent = t(contactIntroSource);
    formStatus.textContent = leadDeliveryReady ? '' : t('Online enquiries are temporarily unavailable.');
    formStatus.dataset.state = leadDeliveryReady ? '' : 'error';
    formOpen = true;
    ui.classList.add('is-contact');
    contact.setAttribute('aria-hidden', 'false');
    reveal(contact, 1);
    contact.scrollTop = 0;
    dispatch(automatic ? 'final_form_auto_opened' : 'final_cta_clicked', { hasProfile: profileRows().length > 0 });
    document.querySelector('#final-contact-close').focus({ preventScroll: true });
  }

  function closeContact() {
    formOpen = false;
    ui.classList.remove('is-contact');
    contact.setAttribute('aria-hidden', 'true');
    reveal(contact, 0);
    requestAnimationFrame(() => (Number(ui.style.getPropertyValue('--progress')) > .91 ? closingCta : cta).focus({ preventScroll: true }));
  }
  document.querySelector('#final-contact-close').addEventListener('click', closeContact);
  contact.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); closeContact(); }
    if (event.key !== 'Tab') return;
    const controls = [...contact.querySelectorAll('button:not(:disabled), input, textarea, a')].filter(node => node.getClientRects().length);
    const first = controls[0], last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  cta.addEventListener('click', openContact);
  closingCta.addEventListener('click', openContact);
  methodButtons.forEach(button => button.addEventListener('click', () => setMethod(button.dataset.finalMethod)));
  editProfile.addEventListener('click', () => {
    formOpen = false;
    ui.classList.remove('is-contact');
    contact.setAttribute('aria-hidden', 'true');
    reveal(contact, 0);
    builder.editProfile();
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || !form.reportValidity()) return;
    sending = true;
    ui.classList.add('is-sending');
    submit.disabled = true;
    submit.innerHTML = 'SENDING…';
    formStatus.textContent = 'Sending your journey profile…';
    formStatus.dataset.state = 'sending';
    dispatch('lead_submission_started', { source: 'scene-9', method });
    const lead = {
        name: nameInput.value.trim(), contactMethod: method, contact: contactInput.value.trim(),
        message: messageInput.value.trim(), ...builder.profile,
        timestamp: new Date().toISOString(), source: 'final-story-scene-9', storyProgress: 9
    };
    try {
      await submitLead(lead, form.elements.namedItem('website').value);
      submitted = true; formOpen = false; sending = false;
      builder.markSubmitted(new Date().toISOString());
      ui.classList.remove('is-contact', 'is-sending');
      ui.classList.add('is-success');
      contact.setAttribute('aria-hidden', 'true');
      success.setAttribute('aria-hidden', 'false');
      passportStatus.textContent = 'JOURNEY STARTED';
      passportDate.textContent = new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date());
      formStatus.textContent = 'PROFILE RECEIVED ✓';
      formStatus.dataset.state = 'success';
      dispatch('lead_submission_success', { source: 'scene-9', method });
    } catch (error) {
      sending = false; ui.classList.remove('is-sending'); submit.disabled = false;
      submit.innerHTML = 'TRY AGAIN <span>→</span>';
      formStatus.textContent = t("Something went wrong. Your information wasn't sent.");
      formStatus.dataset.state = 'error';
      dispatch('lead_submission_failed', { source: 'scene-9', reason: error.message });
    }
  });

  function update(p, time, mobile, reduced) {
    const visible = p > .001;
    submitted = builder.getState().outcome === 'submitted';
    if (!visible) {
      document.querySelector('.navigation').inert = false;
      formOpen = false;
      autoOpened = false;
      ui.classList.remove('is-contact');
      contact.setAttribute('aria-hidden', 'true');
    }
    reveal(ui, smooth(.002, .035, p));
    ui.setAttribute('aria-hidden', String(!visible));
    if (!visible) return;
    if (!entered) { entered = true; dispatch('scene9_entered'); }
    sceneEight.style.opacity = String(1 - smooth(.008, .13, p));
    renderProfile();
    document.querySelector('.navigation').inert = formOpen;
    ui.style.setProperty('--line', String(smooth(.08, .72, p)));
    ui.style.setProperty('--passport-open', String(smooth(.34, .47, p)));
    ui.style.setProperty('--photo', String(smooth(.88, .98, p) * .2));
    ui.style.setProperty('--progress', String(p));
    ui.style.setProperty('--drift', `${reduced ? 0 : Math.sin(time * .18) * .25}px`);

    reveal(transition, smooth(.10, .17, p) * (1 - smooth(.24, .29, p)));
    reveal(profileWrap, smooth(.28, .35, p) * (1 - smooth(.41, .46, p)));
    reveal(passport, smooth(.41, .47, p) * (1 - smooth(.49, .53, p)));
    reveal(headline, smooth(.53, .555, p) * (1 - smooth(.72, .77, p)));
    reveal(headlineFirst, smooth(.53, .555, p) * (1 - smooth(.59, .64, p)));
    reveal(headlineSecond, smooth(.60, .65, p) * (1 - smooth(.72, .77, p)));
    reveal(action, !formOpen && !submitted ? smooth(.67, .74, p) * (1 - smooth(.91, .97, p)) : 0);
    reveal(contact, formOpen && p > .62 ? 1 : 0);
    contact.setAttribute('aria-hidden', String(!(formOpen && p > .62)));
    reveal(success, submitted ? smooth(.69, .77, p) * (1 - smooth(.91, .97, p)) : 0);
    success.setAttribute('aria-hidden', String(!(submitted && p > .69 && p < .98)));
    reveal(closing, smooth(.91, .975, p));
    closing.classList.toggle('has-submitted', submitted);
    ui.style.pointerEvents = p > .62 ? 'auto' : 'none';
    if (p < .88) autoOpened = false;
    if (p >= .965 && !autoOpened && !formOpen && !submitted) {
      autoOpened = true;
      openContact({ automatic: true });
    }
  }

  renderProfile();
  return { update, ui };
}
