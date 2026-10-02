import * as THREE from 'three';

const clamp = n => Math.max(0, Math.min(1, n));
const smooth = (a, b, n) => { const t = clamp((n - a) / (b - a)); return t * t * (3 - 2 * t); };
const unsplash = id => `https://images.unsplash.com/${id}?auto=format&fit=crop&q=82`;
const responsive = (base, focal = 'center') => ({
  src: `${base}&w=1600`,
  srcset: [640, 960, 1280, 1600, 2200].map(width => `${base}&w=${width} ${width}w`).join(', '), focal
});

export const DESTINATIONS = {
  norway: {
    name: 'Trondheim', country: 'Norway', university: 'NTNU',
    universityFull: 'Norwegian University of Science and Technology',
    heroImage: {
      // Wikimedia no longer serves the larger derivative consistently. The
      // 1280px image is the same credited photograph and remains reliable.
      src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/NTNU_Gl%C3%B8shaugen.jpg/1280px-NTNU_Gl%C3%B8shaugen.jpg',
      srcset: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/NTNU_Gl%C3%B8shaugen.jpg/1280px-NTNU_Gl%C3%B8shaugen.jpg 1280w',
      focal: '50% 45%'
    },
    studyImages: [responsive(unsplash('photo-1767102060241-130cb9260718'), '55% 48%')],
    studentImages: [responsive(unsplash('photo-1779838933874-9a3f1cd29f5b'), '30% 50%'), responsive(unsplash('photo-1779838933874-9a3f1cd29f5b'), '50% 42%')],
    cityImages: [responsive(unsplash('photo-1565704927742-7fae2c6f7630'), '50% 52%')],
    landscapeImage: responsive(unsplash('photo-1758030980085-bbf051691578'), '50% 50%'),
    seasonImages: [responsive(unsplash('photo-1740847553656-57de13070567'), '50% 52%'), responsive(unsplash('photo-1581000033157-469e7665bece'), '50% 48%')],
    photoCredits: {
      hero: 'PHOTO — SAMSETH / WIKIMEDIA COMMONS · CC BY-SA 3.0 NO',
      study: 'PHOTO — FER TROULIK / UNSPLASH', people: 'ILLUSTRATIVE STUDENT LIFE · NATASHA MARCH / UNSPLASH',
      detail: 'PHOTO — NATASHA MARCH / UNSPLASH', city: 'PHOTO — SÉBASTIEN GOLDBERG / UNSPLASH',
      landscape: 'PHOTO — BARNABAS DAVOTI / UNSPLASH', season: 'PHOTO — GEORG EIERMANN + ALEXANDER SINN / UNSPLASH'
    }
  }
};

function setOpacity(node, value) {
  if (!node) return;
  node.style.opacity = String(clamp(value));
  node.style.visibility = value > .008 ? 'visible' : 'hidden';
}

export function createArrival(scene, chaos, builder) {
  const destination = DESTINATIONS.norway;
  const ui = document.querySelector('#scene-seven');
  const canvas = document.querySelector('#experience');
  const environment = document.querySelector('#story-environment');
  const atmosphere = document.querySelector('.atmosphere');
  const root = new THREE.Group(); scene.add(root); root.visible = false;
  const photos = {
    hero: destination.heroImage, study: destination.studyImages[0], people: destination.studentImages[0],
    detail: destination.studentImages[1], city: destination.cityImages[0], landscape: destination.landscapeImage,
    autumn: destination.seasonImages[0], winter: destination.seasonImages[1]
  };
  ui.querySelectorAll('[data-photo]').forEach(img => {
    const item = photos[img.dataset.photo]; if (!item) return;
    img.src = item.src; img.srcset = item.srcset; img.sizes = img.dataset.sizes || '(max-width: 700px) 160vh, 100vw';
    img.style.objectPosition = item.focal; img.decoding = 'async';
    img.loading = 'lazy';
  });
  ui.querySelectorAll('[data-credit]').forEach(node => { node.textContent = destination.photoCredits[node.dataset.credit] || ''; });
  ui.querySelector('[data-university]').textContent = destination.university;
  ui.querySelector('[data-university-full]').textContent = destination.universityFull;
  ui.querySelector('[data-location]').textContent = `${destination.name}, ${destination.country}`;
  let preloadStarted = false;
  function preload() {
    if (preloadStarted) return;
    preloadStarted = true;
    ui.querySelectorAll('img').forEach(img => { img.loading = 'eager'; });
    document.querySelectorAll('#scene-eight img, #scene-nine img').forEach(img => { img.loading = 'eager'; img.decoding = 'async'; });
    const link = document.createElement('link'); link.rel = 'preload'; link.as = 'image'; link.href = destination.heroImage.src;
    link.imagesrcset = destination.heroImage.srcset; link.imagesizes = '100vw'; document.head.append(link);
  }

  const get = id => ui.querySelector(`#${id}`);
  const portal = get('photo-portal'), hero = get('photo-hero'), study = get('photo-study'), people = get('photo-people');
  const collage = get('photo-collage'), city = get('photo-city'), landscape = get('photo-landscape'), seasons = get('photo-seasons');
  const mosaic = get('photo-mosaic'), life = get('photo-life'), callback = get('photo-callback'), finale = get('photo-finale');
  const chapter = ui.querySelector('.scene-seven__chapter');
  const textNodes = [...ui.querySelectorAll('[data-beat]')];
  const showWindow = (node, p, start, end, edge = .018) => {
    const value = smooth(start, start + edge, p) * (1 - smooth(end - edge, end, p)); setOpacity(node, value); return value;
  };

  function update(p, time, camera, mobile, reduced) {
    const visible = p > .001;
    ui.style.opacity = String(smooth(.002, .02, p)); ui.setAttribute('aria-hidden', String(!visible));
    if (!visible) {
      canvas.style.opacity = '1'; environment.style.opacity = '1'; atmosphere.style.opacity = '.75';
      scene.fog.color.set(0x090b0e); return;
    }
    builder.root.visible = p < .055;
    document.querySelector('#scene-six').style.opacity = String(1 - smooth(.002, .055, p));
    document.querySelector('#scene-six').style.pointerEvents = 'none';
    chaos.student.visible = p < .025;
    camera.position.set(0, 16.4, -96 - smooth(0, .07, p) * 9); camera.lookAt(0, 16.1, -116);

    const portalProgress = smooth(.005, .085, p);
    portal.style.setProperty('--portal', portalProgress.toFixed(4));
    portal.style.setProperty('--portal-scale', String(1 + .035 * smooth(.085, .17, p)));
    setOpacity(portal, 1 - smooth(.165, .19, p));
    canvas.style.opacity = String(1 - smooth(.065, .095, p));
    environment.style.opacity = String(1 - smooth(.055, .09, p));
    atmosphere.style.opacity = String(.75 * (1 - smooth(.055, .095, p)));
    setOpacity(chapter, 1 - smooth(.10, .16, p));

    showWindow(hero, p, .075, .305, .02); hero.style.setProperty('--zoom', String(1 + (reduced ? 0 : .04 * smooth(.09, .28, p))));
    showWindow(study, p, .275, .395, .025); study.style.setProperty('--open', String(smooth(.275, .315, p)));
    showWindow(people, p, .36, .49, .02);
    showWindow(collage, p, .44, .55, .02); collage.style.setProperty('--collage', String(smooth(.455, .495, p)));
    showWindow(city, p, .52, .605, .016); city.style.setProperty('--city-shift', `${(reduced ? 0 : (smooth(.52, .60, p) - .5) * -3).toFixed(2)}%`);
    showWindow(landscape, p, .575, .69, .02); landscape.style.setProperty('--strip', String(smooth(.585, .635, p)));
    showWindow(seasons, p, .655, .755, .02); seasons.style.setProperty('--season', `${(15 + 70 * smooth(.67, .74, p)).toFixed(2)}%`);
    showWindow(mosaic, p, .72, .855, .02); mosaic.style.setProperty('--mosaic', String(smooth(.735, .78, p)));
    showWindow(life, p, .825, .93, .02); life.style.setProperty('--life-zoom', String(1 + (reduced ? 0 : .035 * smooth(.84, .93, p))));
    showWindow(callback, p, .895, .972, .015); callback.style.setProperty('--replace', String(smooth(.925, .955, p)));
    setOpacity(finale, smooth(.962, .982, p)); finale.style.setProperty('--spread', String(smooth(.97, 1, p)));

    textNodes.forEach(node => {
      const start = Number(node.dataset.start), end = Number(node.dataset.end);
      const value = smooth(start, start + .012, p) * (1 - smooth(end - .012, end, p));
      setOpacity(node, value); node.style.transform = `translate3d(0,${((1 - value) * 18).toFixed(2)}px,0)`;
    });
    ui.style.setProperty('--parallax', '0%');
  }

  return { update, preload, root, destination };
}
