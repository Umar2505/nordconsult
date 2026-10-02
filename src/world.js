import * as THREE from 'three';
import { t } from './i18n.js';
import atlas from 'world-atlas/countries-110m.json';
import { feature, mesh } from 'topojson-client';

export const STORY_CONTENT = {
  origin: { name: 'Tashkent', lat: 41.3, lon: 69.27 },
  destinations: [
    { name: 'Finland', city: 'Helsinki', lat: 60.17, lon: 24.94, universities: 'Explore universities in Helsinki, Oulu, Tampere and Turku', tag: 'English-taught programs · scholarships' },
    { name: 'Sweden', city: 'Stockholm', lat: 59.33, lon: 18.07, universities: 'Explore universities in Stockholm', tag: 'International study options' },
    { name: 'Norway', city: 'Oslo', lat: 59.91, lon: 10.75, universities: 'Explore universities in Oslo', tag: 'A new perspective on learning' },
    { name: 'Germany', city: 'Berlin', lat: 52.52, lon: 13.405, universities: 'Explore universities in Berlin', tag: 'Programs across Germany' },
    { name: 'Italy', city: 'Milan', lat: 45.46, lon: 9.19, universities: 'Explore universities in Milan', tag: 'Design, culture and research' },
    { name: 'Netherlands', city: 'Amsterdam', lat: 52.37, lon: 4.9, universities: 'Explore universities in Amsterdam', tag: 'A global classroom' },
    { name: 'China', city: 'Beijing', lat: 39.9, lon: 116.4, universities: 'Explore universities in Beijing', tag: 'New connections, new ideas' }
  ],
  illustrativeStats: ['7 COUNTRIES', '100+ UNIVERSITIES', 'THOUSANDS OF POSSIBILITIES']
};

const R = 2.38;
// On the passport the atlas is an ink drawing rather than a framed image.
// Give it more vertical presence so the contours occupy over half the page.
const planeW = 2.31, planeH = 2.12;
const pageMapCenter = 1.275;
const clamp = (v) => Math.max(0, Math.min(1, v));
const lerp = THREE.MathUtils.lerp;

function uv(lon, lat) { return [(lon + 180) / 360, (lat + 90) / 180]; }
function plane(u, v, lift = 0) { return new THREE.Vector3(pageMapCenter + (u - .5) * planeW, (v - .5) * planeH, lift); }
function sphere(u, v, lift = 0) {
  const lon = (u * 2 - 1) * Math.PI;
  const lat = (v - .5) * Math.PI;
  const r = R + lift;
  return new THREE.Vector3(r * Math.cos(lat) * Math.sin(lon), r * Math.sin(lat), r * Math.cos(lat) * Math.cos(lon));
}
function canvasTexture(painter) {
  const c = document.createElement('canvas'); c.width = 2048; c.height = 1024;
  painter(c.getContext('2d'), c.width, c.height);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  return tex;
}
function drawPolygon(ctx, ring, w, h) {
  let started = false, prevX = 0;
  ctx.beginPath();
  for (const [lon, lat] of ring) {
    const x = (lon + 180) / 360 * w, y = (90 - lat) / 180 * h;
    if (!started || Math.abs(x - prevX) > w * .5) { ctx.moveTo(x, y); started = true; }
    else ctx.lineTo(x, y);
    prevX = x;
  }
  ctx.closePath(); ctx.fill();
}
function eachPolygon(geometry, cb) {
  if (geometry.type === 'Polygon') cb(geometry.coordinates);
  else if (geometry.type === 'MultiPolygon') geometry.coordinates.forEach(cb);
}
const land = feature(atlas, atlas.objects.land);
export const oceanTexture = canvasTexture((ctx, w, h) => {
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, '#10232c'); g.addColorStop(.55, '#102631'); g.addColorStop(1, '#0a1b24');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#506c6a';
  for (const feature of land.features) eachPolygon(feature.geometry, rings => rings.forEach(ring => drawPolygon(ctx, ring, w, h)));
  ctx.strokeStyle = 'rgba(188,204,194,.17)'; ctx.lineWidth = 1;
  for (let lat = -60; lat <= 75; lat += 30) {
    const y = (90 - lat) / 180 * h; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }
  for (let lon = -150; lon <= 180; lon += 30) {
    const x = (lon + 180) / 360 * w; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
});

function makeSurface() {
  const cols = 96, rows = 48, positions = [], uvs = [], indices = [], flat = [], round = [];
  for (let j = 0; j <= rows; j++) for (let i = 0; i <= cols; i++) {
    const u = i / cols, v = j / rows, a = plane(u, v), b = sphere(u, v);
    positions.push(a.x, a.y, a.z); flat.push(a.x, a.y, a.z); round.push(b.x, b.y, b.z); uvs.push(u, v);
  }
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const a = j * (cols + 1) + i, b = a + 1, c = a + cols + 1, d = c + 1;
    indices.push(a, b, d, a, d, c);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices); geometry.computeVertexNormals();
  return { geometry, flat: new Float32Array(flat), round: new Float32Array(round) };
}

function makeOutline(topo, filter, color, opacity) {
  const lines = mesh(atlas, topo, filter).coordinates;
  const flat = [], round = [];
  for (const line of lines) for (let i = 0; i < line.length - 1; i++) {
    const a = line[i], b = line[i + 1];
    if (Math.abs(a[0] - b[0]) > 90) continue;
    for (const q of [a, b]) {
      const [u, v] = uv(q[0], q[1]);
      const f = plane(u, v, .013), s = sphere(u, v, .009);
      flat.push(f.x, f.y, f.z); round.push(s.x, s.y, s.z);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(flat.slice(), 3));
  const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false });
  const object = new THREE.LineSegments(geometry, material); object.frustumCulled = false; object.renderOrder = 10;
  return { object, flat: new Float32Array(flat), round: new Float32Array(round), material };
}

function textSprite(text, color = '#8d7050', fontSize = 42) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 96;
  const ctx = c.getContext('2d'); ctx.clearRect(0, 0, 512, 96);
  ctx.fillStyle = color; ctx.font = `600 ${fontSize}px Arial`; ctx.textAlign = 'center';
  ctx.fillText(t(text).toLocaleUpperCase(), 256, 58);
  const texture = new THREE.CanvasTexture(c); texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false }));
  sprite.scale.set(.66, .14, 1); return sprite;
}

function createMarker(item, index, parent) {
  const group = new THREE.Group(); parent.add(group);
  const dot = new THREE.Mesh(new THREE.SphereGeometry(.022, 10, 8), new THREE.MeshBasicMaterial({ color: 0xdac8a5 }));
  group.add(dot);
  const ring = new THREE.Mesh(new THREE.RingGeometry(.038, .042, 24), new THREE.MeshBasicMaterial({ color: 0xc3ae88, transparent: true, opacity: .65, side: THREE.DoubleSide, depthWrite: false }));
  group.add(ring);
  const label = textSprite(item.city || item.name); label.position.set(0, -.13, .01); group.add(label);
  group.userData = { item, index };
  return { group, dot, ring, label, item, uv: uv(item.lon, item.lat) };
}

function makeRoute(origin, dest, parent) {
  const a = uv(origin.lon, origin.lat), b = uv(dest.lon, dest.lat);
  const flat = [], round = [];
  const v1 = sphere(a[0], a[1]).normalize(), v2 = sphere(b[0], b[1]).normalize();
  for (let i = 0; i <= 64; i++) {
    const t = i / 64;
    const pp = plane(lerp(a[0], b[0], t), lerp(a[1], b[1], t), .025 + Math.sin(t * Math.PI) * .09);
    const n = v1.clone().lerp(v2, t).normalize().multiplyScalar(R + .025 + Math.sin(t * Math.PI) * .31);
    flat.push(pp.x, pp.y, pp.z); round.push(n.x, n.y, n.z);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(flat.slice(), 3));
  const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0xd6c296, transparent: true, opacity: .55, depthWrite: false }));
  line.frustumCulled = false; line.geometry.setDrawRange(0, 0); parent.add(line);
  const traveler = new THREE.Mesh(new THREE.SphereGeometry(.019, 7, 6), new THREE.MeshBasicMaterial({ color: 0xf1ddb6 }));
  parent.add(traveler);
  return { line, traveler, flat: new Float32Array(flat), round: new Float32Array(round) };
}

export function createWorld(passport, pageWidth) {
  const group = new THREE.Group(); group.position.set(0, 0, .095); passport.add(group);
  const surface = makeSurface();
  const oceanMaterial = new THREE.MeshStandardMaterial({ map: oceanTexture, roughness: .84, metalness: .03, transparent: true, opacity: 0, side: THREE.FrontSide, depthWrite: false });
  const ocean = new THREE.Mesh(surface.geometry, oceanMaterial); ocean.frustumCulled = false; group.add(ocean);
  const coast = makeOutline(atlas.objects.countries, (a, b) => a === b, 0x51483e, 0);
  const borders = makeOutline(atlas.objects.countries, (a, b) => a !== b, 0x766755, 0);
  group.add(coast.object, borders.object);
  const markerItems = [STORY_CONTENT.origin, ...STORY_CONTENT.destinations];
  const markers = markerItems.map((item, i) => createMarker(item, i, group));
  const cityPreview = new THREE.Group();
  markers[1].group.add(cityPreview);
  [
    ['HELSINKI', -.18, -.12], ['OULU', .12, .22],
    ['TAMPERE', -.22, .09], ['TURKU', .18, -.2]
  ].forEach(([name, x, y]) => {
    const dot = new THREE.Mesh(new THREE.SphereGeometry(.009, 6, 5), new THREE.MeshBasicMaterial({ color: 0xe7d9b8 }));
    dot.position.set(x, y, .045); cityPreview.add(dot);
    const label = textSprite(name, '#dce8dc', 31);
    label.scale.set(.33, .065, 1); label.position.set(x + (x < 0 ? -.17 : .17), y, .05); cityPreview.add(label);
  });
  cityPreview.visible = false;
  const routes = STORY_CONTENT.destinations.map(dest => makeRoute(STORY_CONTENT.origin, dest, group));
  const pointLight = new THREE.PointLight(0xffe8bd, 0, 4.5, 2); group.add(pointLight); pointLight.position.set(0, 0, .5);
  const materialGlow = new THREE.MeshBasicMaterial({ color: 0x96b4b4, transparent: true, opacity: 0, side: THREE.BackSide, depthWrite: false });
  const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(R * 1.055, 32, 24), materialGlow); group.add(atmosphere);
  const markerMeshes = markers.map(m => m.dot);
  let lastMorph = -1;
  let activeDestination = null;

  function update(progress, time, camera, mobile, reduced, galleryRotation = 0) {
    const smooth = (a, b) => { const t = clamp((progress - a) / (b - a)); return t * t * (3 - 2 * t); };
    const morph = smooth(.43, .79);
    const globe = smooth(.54, .81);
    group.position.x = 0;
    group.position.z = .095 + (mobile ? 8.5 : 7) * smooth(.47, .77);
    group.rotation.x = 2.05 * smooth(.71, .85);
    // The globe's narrative orientation is controlled by the gallery rotation.
    // Ambient time must not alter its pose while the map is still forming.
    group.rotation.y = galleryRotation;
    if (Math.abs(morph - lastMorph) > .001) {
      for (const data of [surface, coast, borders]) {
        const array = data.geometry ? data.geometry.attributes.position.array : data.object.geometry.attributes.position.array;
        for (let i = 0; i < array.length; i++) array[i] = lerp(data.flat[i], data.round[i], morph);
        const geom = data.geometry || data.object.geometry;
        geom.attributes.position.needsUpdate = true;
        if (data === surface) geom.computeVertexNormals();
      }
      for (const route of routes) {
        const array = route.line.geometry.attributes.position.array;
        for (let i = 0; i < array.length; i++) array[i] = lerp(route.flat[i], route.round[i], morph);
        route.line.geometry.attributes.position.needsUpdate = true;
      }
      lastMorph = morph;
    }
    // Keep the passport map transparent and contour-only. The colored surface
    // fades in only after the page has visibly curved into a globe, avoiding a
    // rectangular ocean background or filled continents on the paper.
    oceanMaterial.opacity = smooth(.72, .84);
    oceanMaterial.depthWrite = oceanMaterial.opacity > .95;
    coast.material.opacity = smooth(.18, .31) * (1 - smooth(.65, .81)) * .82 + globe * .28;
    coast.object.geometry.setDrawRange(0, 2 * Math.floor(coast.object.geometry.attributes.position.count / 2 * smooth(.18, .34)));
    coast.material.depthTest = morph > .45;
    coast.material.color.setRGB(lerp(.32, .47, globe), lerp(.28, .62, globe), lerp(.24, .60, globe));
    borders.material.opacity = smooth(.30, .42) * (1 - smooth(.62, .8)) * .42 + globe * .12;
    borders.object.geometry.setDrawRange(0, 2 * Math.floor(borders.object.geometry.attributes.position.count / 2 * smooth(.25, .40)));
    borders.material.depthTest = morph > .45;
    pointLight.intensity = smooth(.22, .5) * (1 - smooth(.68, .83)) * .24;
    materialGlow.opacity = globe * .095;
    atmosphere.visible = globe > .03;

    markers.forEach((m, i) => {
      const activation = i === 0 ? smooth(.14, .2) : smooth(.15 + i * .025, .22 + i * .025);
      const network = smooth(.77 + i * .012, .86 + i * .008);
      const visible = Math.max(activation * (1 - smooth(.56, .75)), network);
      const [u, v] = m.uv;
      const onPage = plane(u, v, .035 + smooth(.36, .55) * .09);
      const onSphere = sphere(u, v, .028);
      m.group.position.copy(onPage.lerp(onSphere, morph));
      const globeScale = mobile ? .8 : 1;
      m.group.scale.setScalar((.8 + globe * .55) * globeScale);
      m.facing = 1;
      m.group.visible = visible > .02 && (!mobile || i < 5);
      m.dot.material.opacity = visible;
      m.dot.material.transparent = true;
      m.ring.material.opacity = visible * (i === 1 ? .5 + .3 * Math.sin(time * 2.2) : .35);
      m.label.material.opacity = visible * (1 - smooth(.43, .7)) * smooth(.35, .45) + network * (mobile ? 0 : .75);
      m.label.visible = m.label.material.opacity > .02;
      m.label.material.color.setHex(globe > .5 ? 0xc9d5ce : 0x9e8266);
      if (globe > .5) {
        const normal = sphere(u, v).normalize();
        const worldNormal = normal.clone().applyQuaternion(group.getWorldQuaternion(new THREE.Quaternion()));
        const worldPos = m.group.getWorldPosition(new THREE.Vector3());
        const facing = worldNormal.dot(camera.position.clone().sub(worldPos).normalize());
        const edge = clamp((facing + .04) / .22);
        m.facing = edge * edge * (3 - 2 * edge);
        if (m.facing < .01) m.group.visible = false;
      }
    });
    routes.forEach((route, i) => {
      const reveal = Math.max(smooth(.34 + i * .035, .43 + i * .035) * (1 - smooth(.58, .72)), smooth(.79 + i * .012, .87 + i * .008));
      route.line.visible = reveal > .01 && (!mobile || i < 4);
      route.line.geometry.setDrawRange(0, Math.floor(65 * reveal));
      route.line.material.opacity = reveal * (i < 3 ? .5 : .25);
      const idx = Math.floor(((time * .35 + i * .27) % 1) * 64);
      const a = route.line.geometry.attributes.position.array;
      route.traveler.position.set(a[idx * 3], a[idx * 3 + 1], a[idx * 3 + 2]);
      route.traveler.visible = route.line.visible && globe > .8 && idx < 64 * reveal && i < 3 && !reduced;
    });
    cityPreview.visible = activeDestination === 'Finland' && progress > .88 && !mobile;
    return { morph, globe, markers: markerMeshes };
  }

  return { group, update, markers, routes, atmosphere, setActiveDestination: (name) => { activeDestination = name; } };
}
