import * as THREE from 'three';
import { createWorld } from './world.js';
import { createChaos } from './chaos.js';
import { createRoadmap, ROADMAP_CONTENT } from './roadmap.js';
import { createStories } from './stories.js';
import { createJourneyBuilder } from './journey-builder.js';
import { createArrival } from './arrival.js';
import { createBehindJourney } from './behind-journey.js';
import { createFinalJourney } from './final-journey.js';
import { STORY } from './story.js';
import { createCinematicScroll } from './cinematic-scroll.js';
import { initI18n, t, localizeCanvas } from './i18n.js';
import './style.css';

initI18n();
let renderDirty = true, lastRenderSignature = '';
window.addEventListener('click', () => { renderDirty = true; });
const canvas = document.querySelector('#experience');
const stickyScene = document.querySelector('.scene__sticky');
const loading = document.querySelector('#loading');
const intro = document.querySelector('#intro');
const microcopy = document.querySelector('#microcopy');
const chapterNumber = document.querySelector('#chapter-number');
const scrollCue = document.querySelector('#scroll-cue');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const dawn = document.querySelector('#dawn');
const environment = document.querySelector('#story-environment');
const sceneTwo = document.querySelector('#scene-two');
const sceneTwoLines = [...document.querySelectorAll('.scene-two__line > span')];
const finalQuestion = document.querySelector('#final-question');
const panel = document.querySelector('#destination-panel');
const hotspots = document.querySelector('#destination-hotspots');
const sceneThree = document.querySelector('#scene-three');
const capitalGalleryEyebrow = document.querySelector('.capital-gallery__eyebrow');
const capitalGallery = document.querySelector('.capital-gallery');
const capitalCards = [...document.querySelectorAll('.capital-card')];
const capitalStory = document.querySelector('#capital-story');
const capitalHandoff = document.querySelector('#capital-handoff');
const roadmapOpening = document.querySelector('#roadmap-opening');
const roadmapMilestone = document.querySelector('#roadmap-milestone');
const roadmapUniversityNote = document.querySelector('#roadmap-university-note');
const roadmapApplicationState = document.querySelector('#roadmap-application-state');
const roadmapWait = document.querySelector('#roadmap-wait');
const roadmapAcceptance = document.querySelector('#roadmap-acceptance');
const roadmapVisa = document.querySelector('#roadmap-visa');
const roadmapFinal = document.querySelector('#roadmap-final');
const roadmapSkip = document.querySelector('#roadmap-skip');
const chapterName = document.querySelector('.chapter__name');
document.querySelector('#footer-year').textContent = String(new Date().getFullYear());

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x090b0e, 0.025);
const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 700 ? 1.35 : 1.8));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.45;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const clamp = (n, a = 0, b = 1) => Math.max(a, Math.min(b, n));
const lerp = THREE.MathUtils.lerp;
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };

function makeCanvas(width, height, painter) {
  const c = document.createElement('canvas');
  c.width = width; c.height = height;
  const ctx = localizeCanvas(c.getContext('2d'));
  painter(ctx, width, height);
  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
  return texture;
}

function seededNoise(ctx, width, height, amount, count) {
  let seed = 2517;
  const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  for (let i = 0; i < count; i++) {
    const l = Math.round(80 + rand() * 100);
    ctx.fillStyle = `rgba(${l},${Math.round(l * .8)},${Math.round(l * .8)},${rand() * amount})`;
    ctx.fillRect(rand() * width, rand() * height, 1 + rand() * 2, 1 + rand() * 3);
  }
}

const coverTexture = makeCanvas(768, 1060, (ctx, w, h) => {
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, '#403538'); g.addColorStop(.38, '#392a2e'); g.addColorStop(1, '#302026');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  seededNoise(ctx, w, h, .075, 65000);
  const edge = ctx.createLinearGradient(0, 0, 70, 0);
  edge.addColorStop(0, 'rgba(0,0,0,.34)'); edge.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = edge; ctx.fillRect(0, 0, 70, h);
});

function pageBase(ctx, w, h, reverse = false) {
  const g = ctx.createLinearGradient(0, 0, w, 0);
  g.addColorStop(0, reverse ? '#e9dfcb' : '#d9cfbd');
  g.addColorStop(.22, '#f4ecdc');
  g.addColorStop(.78, '#f5eedf');
  g.addColorStop(1, reverse ? '#d9cfbd' : '#e5dbc8');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  seededNoise(ctx, w, h, .027, 15000);
  ctx.strokeStyle = 'rgba(103,79,73,.18)'; ctx.lineWidth = 2;
  ctx.strokeRect(33, 33, w - 66, h - 66);
  ctx.strokeStyle = 'rgba(103,79,73,.1)'; ctx.lineWidth = 1;
  ctx.strokeRect(45, 45, w - 90, h - 90);
  ctx.save();
  ctx.strokeStyle = 'rgba(143,111,99,.17)'; ctx.lineWidth = 1;
  for (let i = 0; i < 23; i++) {
    ctx.beginPath();
    ctx.ellipse(w / 2, h * .47, 110 + i * 13, 160 + i * 14, i * .075, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawIdentityPage(ctx, stage = 0) {
  const w = ctx.canvas.width, h = ctx.canvas.height;
  pageBase(ctx, w, h, true);
  const status = [STORY.journey.initialStatus, STORY.journey.selectedStatus, 'Applying', STORY.journey.applicationStatus, STORY.journey.admissionStatus, STORY.journey.visaStatus][stage];
  ctx.textAlign = 'left';
  ctx.fillStyle = '#6c5148'; ctx.font = '600 17px Arial';
  ctx.fillText('O‘ZBEKISTON  ·  UZBEKISTAN', 75, 100);
  ctx.textAlign = 'right'; ctx.fillText('01 / 09', w - 75, 100);
  ctx.strokeStyle = 'rgba(108,81,72,.36)'; ctx.beginPath(); ctx.moveTo(75, 122); ctx.lineTo(w - 75, 122); ctx.stroke();
  ctx.textAlign = 'left'; ctx.fillStyle = '#453631'; ctx.font = '43px Georgia';
  ctx.fillText('Student journey', 75, 190);
  ctx.fillStyle = '#947666'; ctx.font = '13px Arial';
  ctx.fillText('FICTIONAL STORY RECORD  ·  NOT A TRAVEL DOCUMENT', 76, 220);

  // The portrait is intentionally abstract and cannot be mistaken for a real ID photo.
  ctx.fillStyle = '#d9d2c5'; ctx.fillRect(75, 260, 218, 270);
  ctx.strokeStyle = '#ad9b87'; ctx.strokeRect(75.5, 260.5, 217, 269);
  ctx.save(); ctx.beginPath(); ctx.rect(78, 263, 212, 264); ctx.clip();
  ctx.fillStyle = '#a8aaa3'; ctx.beginPath(); ctx.arc(184, 349, 55, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#7e8682'; ctx.beginPath(); ctx.ellipse(184, 519, 112, 115, 0, Math.PI, Math.PI * 2); ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#796b5e'; ctx.font = '11px Arial'; ctx.fillText('ILLUSTRATIVE PORTRAIT', 79, 551);
  ctx.fillStyle = '#b4a48e'; ctx.font = 'bold 13px Arial'; ctx.fillText('N / C', 218, 495);

  function field(label, value, x, y, size = 20) {
    ctx.fillStyle = '#8a7768'; ctx.font = 'bold 12px Arial'; ctx.fillText(label, x, y);
    ctx.fillStyle = '#453933'; ctx.font = `600 ${size}px Arial`; ctx.fillText(value, x, y + 32, 360);
    ctx.strokeStyle = 'rgba(110,85,71,.24)'; ctx.beginPath(); ctx.moveTo(x, y + 46); ctx.lineTo(x + 340, y + 46); ctx.stroke();
  }
  field('NAME', STORY.student.name.toUpperCase(), 329, 285, 25);
  field('NATIONALITY', STORY.student.nationality.toUpperCase(), 329, 374);
  field('JOURNEY ID', STORY.student.journeyId, 329, 463, 17);
  field('FIELD OF STUDY', STORY.student.field.toUpperCase(), 75, 608);
  field('DESTINATION', stage >= 1 ? STORY.journey.destination.toUpperCase() : '—  EXPLORING', 75, 704);
  field('UNIVERSITY', stage >= 2 ? STORY.journey.university.toUpperCase() : '—  NOT SELECTED', 75, 800, 17);
  ctx.fillStyle = '#725242'; ctx.font = 'bold 12px Arial'; ctx.fillText('STATUS', 75, 914);
  ctx.fillStyle = '#694e42'; ctx.font = 'bold 25px Arial'; ctx.fillText(status.toUpperCase(), 75, 951);
  ctx.textAlign = 'right'; ctx.fillStyle = '#867668'; ctx.font = '11px Arial';
  ctx.fillText('SAFAR SHU YERDAN BOSHLANADI  ·  01', w - 74, 951);
}

const paperTexture = makeCanvas(768, 1060, (ctx) => drawIdentityPage(ctx));

const blankTexture = makeCanvas(768, 1060, (ctx, w, h) => {
  pageBase(ctx, w, h);
  ctx.fillStyle = 'rgba(86,61,55,.8)'; ctx.textAlign = 'center'; ctx.font = '600 18px Arial';
  ctx.fillText('THE WORLD OPENS', w / 2, 130);
  ctx.font = '14px Arial'; ctx.fillText('02  ·  NORD CONSULT', w / 2, h - 94);
});

const foilTexture = makeCanvas(768, 1060, (ctx, w, h) => {
  ctx.clearRect(0, 0, w, h);
  ctx.textAlign = 'center'; ctx.fillStyle = '#e1bb67';
  ctx.font = '43px Arial';
  ctx.fillText('O‘ZBEKISTON RESPUBLIKASI', w / 2, 122, 690);
  ctx.fillText('REPUBLIC OF UZBEKISTAN', w / 2, 177, 660);
  ctx.font = '48px Arial';
  ctx.fillText('PASPORT·PASSPORT', w / 2, 823, 680);
  // ICAO e-passport mark, positioned as on the reference cover.
  ctx.fillRect(w / 2 - 43, 918, 86, 48);
  ctx.clearRect(w / 2 - 43, 938, 86, 7);
  ctx.beginPath(); ctx.arc(w / 2, 942, 15, 0, Math.PI * 2); ctx.fill();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath(); ctx.arc(w / 2, 942, 8, 0, Math.PI * 2); ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
});

// The official emblem is rasterized into fine monochrome foil lines at runtime.
// This preserves the intricate state design without putting full-colour artwork on the cover.
const emblemImage = new Image();
let emblemReady = false, fontsReady = false, firstFrame = false;
document.fonts.ready.then(() => { fontsReady = true; });
window.setTimeout(() => { fontsReady = true; emblemReady = true; }, 3500);
emblemImage.onload = () => {
  const size = 440, emblemHeight = 462;
  const source = document.createElement('canvas'); source.width = size; source.height = emblemHeight;
  const sctx = source.getContext('2d', { willReadFrequently: true });
  sctx.drawImage(emblemImage, 0, 0, size, emblemHeight);
  const pixels = sctx.getImageData(0, 0, size, emblemHeight).data;
  const mask = sctx.createImageData(size, emblemHeight);
  const distance = (a, b) => Math.max(
    Math.abs(pixels[a] - pixels[b]),
    Math.abs(pixels[a + 1] - pixels[b + 1]),
    Math.abs(pixels[a + 2] - pixels[b + 2]),
    Math.abs(pixels[a + 3] - pixels[b + 3])
  );
  for (let y = 1; y < emblemHeight - 1; y++) for (let x = 1; x < size - 1; x++) {
    const p = (y * size + x) * 4;
    const strength = Math.max(distance(p, p + 4), distance(p, p + size * 4), distance(p, p - 4), distance(p, p - size * 4));
    const alpha = Math.min(255, Math.max(0, (strength - 19) * 3.6));
    mask.data[p] = 238; mask.data[p + 1] = 200; mask.data[p + 2] = 110; mask.data[p + 3] = alpha;
  }
  sctx.clearRect(0, 0, size, emblemHeight);
  sctx.putImageData(mask, 0, 0);
  const foilCtx = foilTexture.image.getContext('2d');
  foilCtx.drawImage(source, 204, 296, 360, 379);
  foilTexture.needsUpdate = true;
  emblemReady = true;
};
emblemImage.onerror = () => { emblemReady = true; };
emblemImage.src = '/assets/uzbekistan-emblem.svg';

const burgundy = new THREE.MeshStandardMaterial({ color: 0x371d24, roughness: .81, metalness: .05 });
const pageEdge = new THREE.MeshStandardMaterial({ color: 0xd2c8b7, roughness: .86 });
const outerCover = new THREE.MeshStandardMaterial({ map: coverTexture, roughness: .78, metalness: .06 });
const innerCover = new THREE.MeshStandardMaterial({ map: paperTexture, roughness: .92 });
const blankPage = new THREE.MeshStandardMaterial({ map: blankTexture, roughness: .94 });
const foilMaterial = new THREE.MeshStandardMaterial({ map: foilTexture, transparent: true, roughness: .34, metalness: .45, depthWrite: false });

const passport = new THREE.Group();
scene.add(passport);
const width = 2.55, height = 3.52;

function box(w, h, d, materials, x, y, z, parent = passport) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), materials);
  mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh);
  return mesh;
}

// The spine is x=0. Both covers and the page block are children of one persistent model.
box(width + .1, height + .1, .055, [burgundy, burgundy, burgundy, burgundy, burgundy, burgundy], width / 2, 0, -.12);
box(width - .05, height - .07, .16, [pageEdge, pageEdge, pageEdge, pageEdge, blankPage, pageEdge], width / 2, 0, -.005);
for (let i = 0; i < 7; i++) {
  const y = -height / 2 + .10 + i * .014;
  box(width - .15, .006, .006, pageEdge, width / 2, y, .079);
}

const coverHinge = new THREE.Group();
coverHinge.position.set(0, 0, .105);
passport.add(coverHinge);
box(width + .1, height + .1, .065,
  [burgundy, burgundy, burgundy, burgundy, outerCover, innerCover],
  width / 2, 0, 0, coverHinge);
const foil = new THREE.Mesh(new THREE.PlaneGeometry(width + .1, height + .1), foilMaterial);
foil.position.set(width / 2, 0, .037); coverHinge.add(foil);

// Small layered leaf near the hinge adds a physical page movement as the cover turns.
const pageLeafHinge = new THREE.Group();
pageLeafHinge.position.set(.035, 0, .087);
passport.add(pageLeafHinge);
box(width - .12, height - .13, .012,
  [pageEdge, pageEdge, pageEdge, pageEdge, blankPage, blankPage],
  (width - .12) / 2, 0, 0, pageLeafHinge);
const world = createWorld(passport, width);
const hotspotButtons = world.markers.slice(1).map(marker => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'destination-hotspots__button';
  button.setAttribute('aria-label', `${t('Show')} ${t(marker.item.name)}, ${t(marker.item.city)}`);
  button.title = `${t(marker.item.name)} · ${t(marker.item.city)}`;
  button.tabIndex = -1;
  button.addEventListener('click', () => {
    const position = marker.group.getWorldPosition(new THREE.Vector3()).project(camera);
    pointer.set((position.x + 1) * innerWidth / 2, (1 - position.y) * innerHeight / 2);
  });
  button.addEventListener('focus', () => {
    const position = marker.group.getWorldPosition(new THREE.Vector3()).project(camera);
    pointer.set((position.x + 1) * innerWidth / 2, (1 - position.y) * innerHeight / 2);
  });
  hotspots.append(button);
  return { button, marker };
});
const chaos = createChaos(scene, passport, world, coverHinge);
const roadmap = createRoadmap(scene, chaos);
const stories = createStories(scene, roadmap, chaos);
const builder = createJourneyBuilder(scene, chaos);
const arrival = createArrival(scene, chaos, builder);
const behindJourney = createBehindJourney(arrival, builder);
const finalJourney = createFinalJourney(builder, arrival);

const ambient = new THREE.AmbientLight(0xc6bdaf, .52); scene.add(ambient);
const key = new THREE.DirectionalLight(0xffe7c7, 4.2);
key.position.set(-2.7, 4.5, 6.3); key.castShadow = true;
key.shadow.mapSize.set(1024, 1024); key.shadow.bias = -.0005;
key.shadow.camera.left = -6; key.shadow.camera.right = 6;
key.shadow.camera.top = 6; key.shadow.camera.bottom = -6;
scene.add(key);
const rim = new THREE.DirectionalLight(0xd9dce5, 2.4);
rim.position.set(2, 4.5, -4); scene.add(rim);
const fill = new THREE.PointLight(0xffe4d2, 16, 20, 2);
fill.position.set(1, -1, 5); scene.add(fill);

let visualScroll = 0;
let mouseX = 0, mouseY = 0, currentMouseX = 0, currentMouseY = 0;
const pointer = new THREE.Vector2();
let currentDestination = null;
let currentRoadmapMilestone = -1;
let currentIdentityStage = -1;
let capitalSpinStartedAt = null;

function getChapterTravel() {
  const reduced = reducedMotion.matches;
  const mobile = window.innerWidth < 700 || window.innerWidth / window.innerHeight < 1;
  return [
    window.innerHeight * (reduced ? .45 : mobile ? 1.05 : 1.35),
    window.innerHeight * (reduced ? 2 : mobile ? 4 : 4.5),
    window.innerHeight * (reduced ? 5.5 : mobile ? 8.2 : 8.2),
    window.innerHeight * (reduced ? 10 : mobile ? 15.5 : 14.2),
    window.innerHeight * (reduced ? 6 : mobile ? 10.5 : 10),
    window.innerHeight * (reduced ? 4 : 4.5),
    window.innerHeight * (reduced ? 4.5 : mobile ? 9 : 10),
    window.innerHeight * (reduced ? 5 : mobile ? 9 : 10),
    window.innerHeight * (reduced ? 4 : 6)
  ];
}

function resolveStageOffset(stage) {
  const travel = getChapterTravel();
  return travel.slice(0, stage.chapter).reduce((sum, value) => sum + value, 0) + travel[stage.chapter] * stage.progress;
}

const cinematicScroll = createCinematicScroll({
  resolveOffset: resolveStageOffset,
  reducedMotion,
  canAdvance(stage) {
    if (stage.gate !== 'builder') return true;
    const state = builder.getState();
    if (state.complete || state.outcome) return true;
    document.querySelector('#builder-question')?.focus?.({ preventScroll: true });
    return false;
  },
  onStageChange(stage) {
    if (stage.chapter >= 6) arrival.preload();
    document.documentElement.dataset.cinematicStage = stage.id;
  }
});
try {
  if (sessionStorage.getItem('nord-language-normal') === 'true') cinematicScroll.enableNormalMode();
  sessionStorage.removeItem('nord-language-normal');
} catch {}

function resize() {
  renderDirty = true;
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, w < 700 ? 1.35 : 1.8));
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.fov = w < 700 || w / h < 1 ? 48 : 42;
  camera.updateProjectionMatrix();
  const travel = getChapterTravel();
  document.querySelector('.scene').style.height = `${travel.reduce((a, b) => a + b, 0) + h}px`;
  const anchors = { opening: [0, .54], destinations: [1, .40], 'roadmap-start': [3, .115], 'stories-start': [4, .18], 'build-start': [5, .12], 'arrival-start': [6, .09], 'behind-start': [7, .05], 'story-start': [8, .20], 'journey-end': [8, .20] };
  for (const [id, [chapter, progress]] of Object.entries(anchors)) {
    const node = document.getElementById(id);
    if (node) node.style.top = `${resolveStageOffset({ chapter, progress })}px`;
  }
  cinematicScroll.realign();
}

function animate() {
  requestAnimationFrame(animate);
  const now = performance.now();
  // All ambient motion uses seconds. Story state itself remains derived from
  // scroll progress, while restrained breathing and traveler motion stay live.
  const t = now * .001;
  const reduced = reducedMotion.matches;
  visualScroll = cinematicScroll.tick(performance.now());
  const mobile = window.innerWidth < 700 || window.innerWidth / window.innerHeight < 1;
  const tablet = window.innerWidth >= 700 && window.innerWidth < 1050;
  const [chapterOneTravel, chapterTwoTravel, chapterThreeTravel, chapterFourTravel, chapterFiveTravel, chapterSixTravel, chapterSevenTravel, chapterEightTravel, chapterNineTravel] = getChapterTravel();
  const p = clamp(visualScroll / chapterOneTravel);
  const p2 = clamp((visualScroll - chapterOneTravel) / chapterTwoTravel);
  const p3 = clamp((visualScroll - chapterOneTravel - chapterTwoTravel) / chapterThreeTravel);
  const p4 = clamp((visualScroll - chapterOneTravel - chapterTwoTravel - chapterThreeTravel) / chapterFourTravel);
  const p5 = clamp((visualScroll - chapterOneTravel - chapterTwoTravel - chapterThreeTravel - chapterFourTravel) / chapterFiveTravel);
  const p6 = clamp((visualScroll - chapterOneTravel - chapterTwoTravel - chapterThreeTravel - chapterFourTravel - chapterFiveTravel) / chapterSixTravel);
  const p7 = clamp((visualScroll - chapterOneTravel - chapterTwoTravel - chapterThreeTravel - chapterFourTravel - chapterFiveTravel - chapterSixTravel) / chapterSevenTravel);
  const p8 = clamp((visualScroll - chapterOneTravel - chapterTwoTravel - chapterThreeTravel - chapterFourTravel - chapterFiveTravel - chapterSixTravel - chapterSevenTravel) / chapterEightTravel);
  const p9 = clamp((visualScroll - chapterOneTravel - chapterTwoTravel - chapterThreeTravel - chapterFourTravel - chapterFiveTravel - chapterSixTravel - chapterSevenTravel - chapterEightTravel) / chapterNineTravel);
  if (p3 > .001 && p4 <= .001 && capitalSpinStartedAt === null) capitalSpinStartedAt = now;
  if (p3 <= .001 || p4 > .001) capitalSpinStartedAt = null;
  const capitalSpin = capitalSpinStartedAt === null || reduced ? 0 : (now - capitalSpinStartedAt) * .000035;
  const identityStage = p4 < .27 ? 0 : p4 < .38 ? 1 : p4 < .55 ? 2 : p4 < .72 ? 3 : p4 < .86 ? 4 : 5;
  if (identityStage !== currentIdentityStage) {
    drawIdentityPage(paperTexture.image.getContext('2d'), identityStage);
    paperTexture.needsUpdate = true;
    currentIdentityStage = identityStage;
  }
  const approach = smooth(0, .55, p);
  const opening = smooth(.54, 1, p);
  const leave = smooth(0, .53, p);
  const hover = reduced ? 0 : Math.sin(t * .95) * (1 - smooth(.2, .7, p));

  currentMouseX = lerp(currentMouseX, reduced || mobile ? 0 : mouseX, .025);
  currentMouseY = lerp(currentMouseY, reduced || mobile ? 0 : mouseY, .025);
  const compactOpening = mobile && innerHeight < 650;
  passport.scale.setScalar(compactOpening ? lerp(.82, 1, approach) : 1);
  passport.position.set(
    mobile ? lerp(-1.28, 0, opening) : lerp(tablet ? .25 : 1.10, -width / 2, approach) * (1 - opening),
    (mobile ? lerp(compactOpening ? -2.9 : -2.45, 0, approach) : -.08) + hover * .035,
    0
  );
  passport.rotation.set(
    lerp(-.10, -Math.PI / 2, opening) + currentMouseY * .028 * (1 - opening),
    lerp(-.24, 0, approach) + currentMouseX * .04 * (1 - opening),
    lerp(-.045, 0, opening) + hover * .009
  );
  coverHinge.rotation.y = -Math.PI * .985 * opening;
  pageLeafHinge.rotation.y = -Math.PI * .10 * smooth(.68, .96, p);

  let lookX = 0, lookY = mobile ? -.15 : 0, lookZ = 0;
  if (reduced) {
    camera.position.set(0, lerp(0, mobile ? 14 : 6.25, opening), lerp(mobile ? 12.3 : 10.5, mobile ? 1.2 : .8, opening));
  } else {
    camera.position.set(0, lerp(.1, mobile ? 14 : 6.25, opening), lerp(mobile ? 12.2 : 10.6, 7.2, approach) * (1 - opening) + (mobile ? 1.2 : .8) * opening);
  }
  camera.up.set(0, 1 - opening, -opening).normalize();
  if (p2 > 0) {
    const pageFocus = smooth(.04, .43, p2);
    const close = smooth(.43, .68, p2);
    const pullback = smooth(.77, .89, p2);
    camera.position.x = lerp(0, 1.0, smooth(.90, 1, p2));
    camera.position.y = lerp(camera.position.y, mobile ? 11 : 6.8, pageFocus * (1 - close));
    camera.position.y = lerp(camera.position.y, mobile ? 11.0 : 9.5, close);
    camera.position.y = lerp(camera.position.y, mobile ? 10.7 : 8.9, pullback);
    camera.position.z = lerp(camera.position.z, .45, pageFocus * (1 - close));
    camera.position.z = lerp(camera.position.z, 3.2, close);
    camera.position.z = lerp(camera.position.z, mobile ? 12.3 : 9.2, pullback);
    lookX = lerp(width / 2, 0, smooth(.47, .79, p2)) * pageFocus;
    lookY = lerp(0, mobile ? 8.5 : 7, smooth(.47, .79, p2));
    lookZ = 0;
    const turnUp = smooth(.65, .86, p2);
    camera.up.set(0, turnUp, -(1 - turnUp)).normalize();
  }
  if (p3 > 0) {
    const gallerySettle = smooth(.01, .12, p3);
    camera.position.x = lerp(camera.position.x, mobile ? .35 : 1.15, gallerySettle);
    camera.position.y = lerp(camera.position.y, mobile ? 10.7 : 8.9, gallerySettle);
    camera.position.z = lerp(camera.position.z, mobile ? 12.3 : 9.2, gallerySettle);
    lookX = lerp(lookX, 0, gallerySettle);
    lookY = lerp(lookY, mobile ? 8.5 : 7, gallerySettle);
    camera.up.set(0, 1, 0);
  }
  camera.lookAt(lookX, lookY, lookZ);
  fill.intensity = lerp(16, 21, approach) * (1 - smooth(.62, .84, p2) * .65);
  ambient.intensity = lerp(.52, .7, approach);
  key.intensity = lerp(4.2, 2.35, smooth(.61, .84, p2));
  rim.intensity = lerp(2.4, 3.5, smooth(.6, .85, p2));
  scene.fog.density = lerp(.025, .011, smooth(.5, .88, p2));
  if (p7 < .10) {
  passport.children.forEach(child => { if (child !== world.group) child.visible = p3 <= .001; });
  world.group.visible = p4 <= .001;
  passport.updateMatrixWorld(true);
  world.update(p2, t, camera, mobile, reduced, capitalSpin);
  if (p3 > .035) world.routes.forEach(route => { route.line.visible = false; route.traveler.visible = false; });
  if (p3 > .001) world.group.scale.setScalar(lerp(1, .035, smooth(.62, .91, p3)));
  passport.updateMatrixWorld(true);
  if (p3 <= .001) chaos.update(0, t, mobile, reduced, currentMouseX, currentMouseY);
  else { chaos.group.visible = false; chaos.student.visible = false; }
  roadmap.update(p4, camera, mobile, reduced);
  if (p3 > .001 && p4 <= .001) {
    const passportReturn = smooth(.62, .91, p3);
    chaos.student.visible = passportReturn > .01;
    chaos.student.position.set(0, 6.55, 3.5);
    chaos.student.rotation.set(-.09, -.12, -.05);
    chaos.student.scale.setScalar(.33 * passportReturn);
    chaos.studentCover.rotation.y = 0;
  }
  roadmap.root.visible = p4 > .001 && p5 < .30;
  stories.update(p5, t, camera, mobile, reduced, { x: mouseX, y: mouseY });
  builder.update(p6, t, camera, mobile, reduced, { x: mouseX, y: mouseY });
  }
  if (p6 > .5) arrival.preload();
  if (p5 > 0) {
    const warmth = smooth(.03, .24, p5);
    fill.intensity = lerp(fill.intensity, 9, warmth);
    key.intensity = lerp(key.intensity, 2.8, warmth);
    rim.intensity = lerp(rim.intensity, 1.8, warmth);
    scene.fog.density = lerp(scene.fog.density, .006, warmth);
  }
  arrival.update(p7, t, camera, mobile, reduced);
  behindJourney.update(p8, t, mobile, reduced);
  finalJourney.update(p9, t, mobile, reduced);

  intro.style.opacity = String(1 - smooth(.02, .48, p));
  intro.style.transform = `translate(${(-8 * leave).toFixed(2)}vw, -46%)`;
  intro.style.pointerEvents = p > .35 ? 'none' : 'auto';
  const micro = smooth(.36, .46, p) * (1 - smooth(.63, .75, p));
  microcopy.style.opacity = String(micro * .85);
  microcopy.style.transform = `translate(-50%, ${(20 - micro * 20).toFixed(1)}px)`;
  scrollCue.style.opacity = String(1 - smooth(0, .2, p));
  scrollCue.style.visibility = p < .2 ? 'visible' : 'hidden';
  chapterNumber.textContent = p9 > .01 ? '09' : p8 > .01 ? '08' : p7 > .01 ? '07' : p6 > .015 ? '06' : p5 > .015 ? '05' : p4 > .025 ? '04' : p3 > .035 ? '03' : p2 > .03 ? '02' : '01';
  chapterName.textContent = p9 > .01 ? 'YOUR STORY STARTS HERE' : p8 > .01 ? 'BEHIND EVERY JOURNEY' : p7 > .01 ? 'THIS COULD BE YOUR LIFE' : p6 > .015 ? 'BUILD YOUR JOURNEY' : p5 > .015 ? 'POSSIBLE JOURNEYS' : p4 > .025 ? 'YOUR ROADMAP' : p3 > .035 ? 'CAPITALS OF POSSIBILITY' : p2 > .03 ? 'THE WORLD OPENS' : 'THE DECISION';
  document.body.classList.toggle('nav-on-light', p9 < .01 && ((p8 > .01 && (p8 < .61 || (p8 > .72 && p8 < .79) || (p8 > .90 && p8 < .947))) || (p8 === 0 && ((p7 > .46 && p7 < .53) || (p7 > .75 && p7 < .84) || p7 > .98))));
  dawn.style.opacity = String(smooth(.41, .86, p2) * .78);
  const activeChapter = p9 > .01 ? 8 : p8 > .01 ? 7 : p7 > .01 ? 6 : p6 > .015 ? 5 : p5 > .015 ? 4 : p4 > .025 ? 3 : p3 > .035 ? 2 : p2 > .03 ? 1 : 0;

  const titleShow = smooth(.81, .865, p2) * (1 - smooth(.925, .95, p2));
  sceneTwo.style.opacity = String(titleShow);
  sceneTwoLines.forEach((line, i) => { line.style.transform = `translateY(${(1 - smooth(.81 + i * .009, .865 + i * .009, p2)) * 112}%)`; });
  finalQuestion.style.opacity = '0';
  finalQuestion.style.transform = 'translateY(25px)';
  const containers = [intro, sceneTwo, sceneThree, document.querySelector('#scene-four'), document.querySelector('#scene-five'), document.querySelector('#scene-six'), document.querySelector('#scene-seven'), document.querySelector('#scene-eight'), document.querySelector('#scene-nine')];
  containers.forEach((node, index) => { node.inert = index !== activeChapter; node.setAttribute('aria-hidden', String(index !== activeChapter)); });
  intro.style.visibility = p < .48 ? 'visible' : 'hidden';
  sceneTwo.style.visibility = titleShow > .01 ? 'visible' : 'hidden';
  updateSceneThree(p3, p4, mobile);
  updateSceneFour(p4, p5);
  updateDestinationPanel(p2, p3, mobile);
  [finalQuestion, ...sceneThree.children, ...document.querySelector('#scene-four').children].forEach(node => {
    node.style.visibility = Number(node.style.opacity || 0) > .01 ? 'visible' : 'hidden';
  });
  const ambientFrame = reduced || p7 >= .10 ? 0 : Math.floor(now / (mobile ? 42 : 33));
  const renderSignature = [visualScroll.toFixed(2), capitalSpin.toFixed(5), ambientFrame, currentMouseX.toFixed(3), currentMouseY.toFixed(3), mouseX, mouseY, emblemReady, JSON.stringify(builder.profile), JSON.stringify(builder.getState())].join('|');
  if (p7 < .10 && (renderDirty || renderSignature !== lastRenderSignature)) {
    renderer.render(scene, camera);
    lastRenderSignature = renderSignature;
    renderDirty = false;
  }
  if (!firstFrame) firstFrame = true;
  if (firstFrame && emblemReady && fontsReady && loading && !loading.classList.contains('is-ready')) loading.classList.add('is-ready');
}

function updateSceneThree(p3, p4, mobile) {
  const chapterVisible = smooth(.015, .07, p3) * (1 - smooth(.005, .055, p4));
  const galleryVisible = chapterVisible * (1 - smooth(.62, .82, p3));
  sceneThree.style.setProperty('--veil', String(.18 * chapterVisible));
  capitalGallery.style.opacity = String(galleryVisible);
  capitalGalleryEyebrow.style.opacity = String(galleryVisible * .85);
  const storyVisible = smooth(.10, .24, p3) * (1 - smooth(.56, .68, p3));
  capitalStory.style.opacity = String(storyVisible);
  capitalStory.style.transform = `translateY(${((1 - storyVisible) * 15).toFixed(1)}px)`;
  const handoffVisible = smooth(.66, .82, p3) * (1 - smooth(.005, .055, p4));
  capitalHandoff.style.opacity = String(handoffVisible);
  capitalHandoff.style.transform = `translateY(${((1 - handoffVisible) * 20).toFixed(1)}px)`;
  updateCapitalCardPositions(p3, p4, mobile);
}

function updateCapitalCardPositions(p3, p4, mobile) {
  const desktopOffsets = [[118,116],[-112,-112],[-116,-38],[-112,42],[114,-108],[116,-34],[114,42],[118,116]];
  const mobileOffsets = [[76,92],[-76,-96],[-78,-36],[-76,28],[76,-88],[78,-30],[76,28],[78,88]];
  const offsets = mobile ? mobileOffsets : desktopOffsets;
  world.markers.forEach((marker, index) => {
    const card = capitalCards[index];
    if (!card) return;
    const point = marker.group.getWorldPosition(new THREE.Vector3()).project(camera);
    const pinX = (point.x + 1) * innerWidth / 2;
    const pinY = (1 - point.y) * innerHeight / 2;
    const width = card.offsetWidth, height = card.offsetHeight;
    const [offsetX, offsetY] = offsets[index];
    const reveal = smooth(.07 + index * .010, .24 + index * .010, p3)
      * (1 - smooth(.62, .82, p3)) * (1 - smooth(.005, .055, p4));
    const pinVisibility = marker.facing ?? (marker.group.visible ? 1 : 0);
    const visible = reveal * pinVisibility;
    const dock = smooth(.55, .78, p3);
    const x = pinX + offsetX * (1 - dock * .86) - width / 2;
    const y = pinY + offsetY * (1 - dock * .86) - height / 2;
    const entranceShift = (index < 3 ? -1 : 1) * (1 - reveal) * 18;
    card.style.opacity = String(visible);
    card.style.visibility = visible > .01 && marker.group.visible ? 'visible' : 'hidden';
    card.style.transform = `translate3d(${(x + entranceShift).toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${((.965 + reveal * .035) * (1 - dock * .72)).toFixed(4)})`;
  });
}

function updateSceneFour(p4, p5) {
  roadmapOpening.style.opacity = String(smooth(.075, .115, p4) * (1 - smooth(.13, .15, p4)));
  const ranges = [[.15, .195], [.205, .29], [.36, .415], [.42, .51], [.525, .63], [.725, .81], [.815, .9], [.905, .935]];
  const index = ranges.findIndex(([a, b]) => p4 >= a && p4 < b);
  if (index !== currentRoadmapMilestone && index >= 0) {
    const [title, headline, copy] = ROADMAP_CONTENT.milestones[index];
    document.querySelector('#roadmap-kicker').textContent = `${String(index + 1).padStart(2, '0')} / ${title}`;
    document.querySelector('#roadmap-headline').textContent = headline;
    document.querySelector('#roadmap-copy').textContent = copy;
    currentRoadmapMilestone = index;
  }
  const range = ranges[index];
  roadmapMilestone.style.opacity = String(range && index !== 5 ? smooth(range[0], range[0] + .01, p4) * (1 - smooth(range[1] - .01, range[1], p4)) : 0);
  roadmapUniversityNote.style.opacity = String(smooth(.305, .325, p4) * (1 - smooth(.345, .365, p4)));
  roadmapApplicationState.style.opacity = String(smooth(.555, .575, p4) * (1 - smooth(.61, .635, p4)));
  roadmapApplicationState.textContent = p4 < .578 ? 'SUBMIT APPLICATION' : p4 < .603 ? 'SUBMITTING...' : 'APPLICATION SUBMITTED';
  roadmapWait.style.opacity = String(smooth(.635, .66, p4) * (1 - smooth(.725, .75, p4)));
  roadmapWait.querySelector('strong').style.opacity = String(smooth(.672, .7, p4));
  roadmapAcceptance.style.opacity = String(smooth(.748, .775, p4) * (1 - smooth(.812, .845, p4)));
  roadmapAcceptance.querySelector('h2').style.opacity = String(smooth(.777, .803, p4));
  roadmapVisa.style.opacity = String(smooth(.867, .887, p4) * (1 - smooth(.905, .93, p4)));
  roadmapFinal.style.opacity = String(smooth(.945, .97, p4) * (1 - smooth(.025, .105, p5)));
  roadmapFinal.querySelector('h2').style.opacity = String(smooth(.955, .985, p4));
  roadmapFinal.querySelector('small').style.opacity = String(smooth(.977, 1, p4));
  const skipVisible = smooth(.025, .055, p4) * (1 - smooth(.92, .98, p4));
  roadmapSkip.style.opacity = String(skipVisible);
  roadmapSkip.style.visibility = skipVisible > .01 ? 'visible' : 'hidden';
  roadmapSkip.style.pointerEvents = skipVisible > .2 ? 'auto' : 'none';
}

function updateDestinationPanel(p2, p3, mobile) {
  const hotspotsVisible = p3 < .02 && p2 > .9;
  hotspotButtons.forEach(({ button, marker }, index) => {
    const visible = hotspotsVisible && marker.group.visible && (!mobile || index < 4);
    button.hidden = !visible;
    button.tabIndex = visible ? 0 : -1;
    if (visible) {
      const position = marker.group.getWorldPosition(new THREE.Vector3()).project(camera);
      button.style.left = `${(position.x + 1) * innerWidth / 2}px`;
      button.style.top = `${(1 - position.y) * innerHeight / 2}px`;
    }
  });
  if (p3 > .02 || p2 < .88 || (!mobile && (mouseX === 0 && mouseY === 0) && !hotspots.contains(document.activeElement))) { panel.classList.remove('is-visible'); world.setActiveDestination(null); return; }
  let match = null, nearest = mobile ? 42 : 30;
  for (const marker of world.markers.slice(1)) {
    if (!marker.group.visible) continue;
    const worldPos = marker.group.getWorldPosition(new THREE.Vector3());
    const screen = worldPos.project(camera);
    const x = (screen.x + 1) * window.innerWidth / 2;
    const y = (1 - screen.y) * window.innerHeight / 2;
    const d = Math.hypot(x - pointer.x, y - pointer.y);
    if (d < nearest) { nearest = d; match = { marker, x, y }; }
  }
  if (match) {
    const item = match.marker.item;
    world.setActiveDestination(item.name);
    if (currentDestination !== item.name) {
      document.querySelector('#panel-name').textContent = item.name.toUpperCase();
      document.querySelector('#panel-city').textContent = item.city.toUpperCase();
      document.querySelector('#panel-info').textContent = item.universities;
      document.querySelector('#panel-tag').textContent = item.tag;
      currentDestination = item.name;
    }
    panel.style.left = `${Math.min(window.innerWidth - (mobile ? 190 : 250), match.x + 22)}px`;
    panel.style.top = `${Math.max(90, Math.min(window.innerHeight - 115, match.y))}px`;
    panel.classList.add('is-visible');
  } else { panel.classList.remove('is-visible'); world.setActiveDestination(null); }
}

window.addEventListener('resize', resize, { passive: true });
window.addEventListener('pointermove', (e) => {
  mouseX = (e.clientX / window.innerWidth - .5) * 2;
  mouseY = (e.clientY / window.innerHeight - .5) * 2;
  document.documentElement.style.setProperty('--pointer-x', `${e.clientX}px`);
  document.documentElement.style.setProperty('--pointer-y', `${e.clientY}px`);
  document.documentElement.style.setProperty('--pointer-active', '1');
  pointer.set(e.clientX, e.clientY);
  stories.pointerMove(e.clientX, e.clientY, camera, window.innerWidth < 700);
}, { passive: true });
window.addEventListener('pointerleave', () => document.documentElement.style.setProperty('--pointer-active', '0'), { passive: true });
window.addEventListener('pointerdown', (e) => {
  pointer.set(e.clientX, e.clientY);
  stories.pointerDown(e);
  if (reducedMotion.matches || e.pointerType === 'touch') return;
  const pulse = document.createElement('span');
  pulse.className = 'interaction-pulse';
  pulse.style.left = `${e.clientX}px`;
  pulse.style.top = `${e.clientY}px`;
  stickyScene.append(pulse);
  pulse.addEventListener('animationend', () => pulse.remove(), { once: true });
}, { passive: true });
document.querySelector('#final-edit-profile')?.addEventListener('click', () => {
  history.replaceState(null, '', '#build-start');
  cinematicScroll.jumpTo('builder-questions');
});
function returnToBuilderResult() {
  history.replaceState(null, '', '#build-start');
  cinematicScroll.jumpTo('builder-profile', { immediate: false });
}
window.addEventListener('nord:profile_completed', returnToBuilderResult);
window.addEventListener('nord:profile_edit', () => cinematicScroll.jumpTo('builder-questions'));
window.addEventListener('nord:scene6_skipped', returnToBuilderResult);
window.addEventListener('nord:lead_submitted', returnToBuilderResult);
reducedMotion.addEventListener('change', resize);
if (import.meta.hot) import.meta.hot.dispose(() => { cinematicScroll.destroy(); window.location.reload(); });
resize();
animate();
