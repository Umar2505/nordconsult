import { escapeHTML } from './dom.js';
const clamp = n => Math.max(0, Math.min(1, n));
const smooth = (a, b, n) => { const t = clamp((n - a) / (b - a)); return t * t * (3 - 2 * t); };
const show = (node, value) => {
  if (!node) return;
  const opacity = clamp(value);
  node.style.opacity = String(opacity);
  node.style.visibility = opacity > .008 ? 'visible' : 'hidden';
};

const photo = id => `https://images.unsplash.com/${id}?auto=format&fit=crop&q=82`;

export const TEAM_MEMBERS = [
  {
    name: 'TEAM MEMBER', role: 'Admissions consultant',
    photo: `${photo('photo-1775163024488-e88e4a71179f')}&w=1600`,
    languages: ['Languages to be confirmed'], specialties: ['University selection', 'Application strategy', 'Student guidance'],
    shortStatement: 'Authentic staff statement to be added before publication.', placeholder: true
  },
  {
    name: 'TEAM MEMBER', role: 'Student adviser',
    photo: `${photo('photo-1517245386807-bb43f82c33c4')}&w=1600`,
    languages: ['Languages to be confirmed'], specialties: ['Profiles', 'Requirements', 'Deadlines'],
    shortStatement: 'Authentic staff statement to be added before publication.', placeholder: true
  }
];

export const TRUST_METRICS = [
  { value: '—', label: 'students advised' },
  { value: '—', label: 'destinations' },
  { value: '—', label: 'languages spoken' }
];

export function createBehindJourney(arrival, builder) {
  const ui = document.querySelector('#scene-eight');
  const sceneSeven = document.querySelector('#scene-seven');
  const hero = arrival.destination.heroImage;
  const consultation = `${photo('photo-1517245386807-bb43f82c33c4')}&w=2000`;
  const documentReview = `${photo('photo-1775163024488-e88e4a71179f')}&w=1800`;
  const office = `${photo('photo-1775163024488-e88e4a71179f')}&w=1800`;

  ui.querySelectorAll('[data-behind-photo="hero"]').forEach(img => {
    img.src = hero.src; img.srcset = hero.srcset; img.sizes = '100vw'; img.style.objectPosition = hero.focal;
  });
  const sources = { consultation, review: documentReview, office };
  ui.querySelectorAll('[data-behind-photo]').forEach(img => {
    const source = sources[img.dataset.behindPhoto];
    if (!source) return;
    img.src = source; img.loading = 'lazy'; img.decoding = 'async';
  });

  const team = ui.querySelector('#behind-team');
  // Present the existing advisory roles without inventing staff identities or quotes.
  team.innerHTML = TEAM_MEMBERS.map((member, index) => `
    <article class="team-editorial team-editorial--${index + 1}">
      <figure><img src="${member.photo}" loading="lazy" decoding="async" alt="Illustrative consultation photography" /><figcaption>ILLUSTRATIVE PHOTOGRAPHY · UNSPLASH</figcaption></figure>
      <div><span>PERSONAL GUIDANCE</span><h3>${member.role}</h3><ul>${member.specialties.map(item => `<li>${item}</li>`).join('')}</ul></div>
    </article>`).join('');

  const beats = [...ui.querySelectorAll('[data-behind-beat]')];
  let profileSignature = '';
  function renderProfile() {
    const p = builder.profile;
    const rows = [
      ['STUDY LEVEL', p.studyLevel], ['FIELD', p.field], ['REGION', p.country || p.region],
      ['PRIORITY', p.priority], ['BUDGET', p.budget]
    ].filter(([, value]) => value);
    const signature = JSON.stringify(rows);
    if (signature === profileSignature) return;
    profileSignature = signature;
    const list = ui.querySelector('#behind-profile-list');
    list.innerHTML = rows.length
      ? rows.map(([label, value]) => `<li><span>${label}</span><strong>${escapeHTML(value)}</strong></li>`).join('')
      : '<li class="journey-profile__empty">NOT DEFINED YET</li>';
  }

  function update(p, time, mobile, reduced) {
    const visible = p > .001;
    show(team, smooth(.72, .735, p) * (1 - smooth(.78, .80, p)));
    [...team.children].forEach((node, index) => show(node, index === 0 ? 1 - smooth(.752, .762, p) : smooth(.752, .762, p)));
    // Keep the three retained drafts legible before the checklist takes over.
    ui.querySelectorAll('.draft-pages article').forEach((node, index) => {
      const starts = [.415, .455, .49];
      show(node, smooth(starts[index], starts[index] + .01, p));
    });
    show(ui, smooth(.001, .018, p));
    ui.setAttribute('aria-hidden', String(!visible));
    if (!visible) return;
    sceneSeven.style.opacity = String(1 - smooth(.008, .055, p));
    renderProfile();
    ui.style.setProperty('--desk', String(smooth(.07, .17, p)));
    ui.style.setProperty('--focus', String(smooth(.19, .245, p)));
    ui.style.setProperty('--shortlist', String(smooth(.25, .40, p)));
    ui.style.setProperty('--draft', String(smooth(.40, .52, p)));
    ui.style.setProperty('--check', String(smooth(.52, .565, p)));
    ui.style.setProperty('--human', String(smooth(.595, .635, p)));
    ui.style.setProperty('--team', String(smooth(.69, .80, p)));
    ui.style.setProperty('--plan', String(smooth(.79, .88, p)));
    ui.style.setProperty('--proof', String(smooth(.87, .94, p)));
    ui.style.setProperty('--brand', String(smooth(.935, .973, p)));
    ui.style.setProperty('--return', String(smooth(.968, .992, p)));
    ui.style.setProperty('--drift', `${reduced ? 0 : Math.sin(time * .35) * .35}px`);
    beats.forEach(node => {
      const start = Number(node.dataset.start), end = Number(node.dataset.end);
      const edge = Number(node.dataset.edge || .012);
      const value = smooth(start, start + edge, p) * (1 - smooth(end - edge, end, p));
      show(node, value);
      node.style.transform = `translate3d(0,${(1 - value) * (mobile ? 12 : 20)}px,0)`;
    });
    ui.querySelectorAll('.university-sheet').forEach((sheet, index) => {
      const threshold = index >= 7 ? 1 : index >= 6 ? .78 : index >= 4 ? .48 : .2;
      const remain = 1 - smooth(threshold, Math.min(1, threshold + .14), smooth(.25, .40, p));
      sheet.style.setProperty('--remain', String(remain));
    });
  }

  return { update, ui };
}
