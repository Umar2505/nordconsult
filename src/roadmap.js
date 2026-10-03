import * as THREE from 'three';
import { localizeCanvas } from './i18n.js';
import { STORY } from './story.js';

const clamp = value => Math.max(0, Math.min(1, value));
const smooth = (a, b, value) => {
  const t = clamp((value - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const lerp = THREE.MathUtils.lerp;
const GOLD = 0xd6b783;
const UP = new THREE.Vector3(0, 1, 0);

// All example profile, program, date and outcome content lives here.
export const ROADMAP_CONTENT = {
  profile: [
    ['FIELD', STORY.student.field], ['BUDGET', STORY.student.budget],
    ['LANGUAGE', STORY.student.language], ['PRIORITY', STORY.student.priority], ['COUNTRIES', 'Europe']
  ],
  countries: [
    ['FINLAND', 'ENGLISH PROGRAMS · SCHOLARSHIPS'],
    ['GERMANY', 'TUITION · ENTRY'],
    ['SWEDEN', 'PROGRAMS · LIVING COST'],
    ['ITALY', 'SCHOLARSHIPS · PROGRAMS'],
    ['NETHERLANDS', 'ENGLISH PROGRAMS'],
    ['NORWAY', 'REQUIREMENTS']
  ],
  university: {
    name: STORY.journey.university.toUpperCase(),
    program: STORY.student.field,
    location: `${STORY.journey.city} · ${STORY.journey.destination}`,
    tuition: STORY.student.budget,
    scholarship: 'Considered',
    deadline: 'Illustrative date'
  },
  documents: ['PASSPORT COPY', 'TRANSCRIPT', 'IELTS', 'CV', 'MOTIVATION LETTER', 'RECOMMENDATION'],
  waitDates: ['MAR 14', 'MAR 27', 'APR 09', 'APR 21'],
  milestones: [
    ['YOUR PROFILE', 'IT STARTS WITH YOU.', 'We begin with your goals, budget and academic background.'],
    ['YOUR DESTINATION', 'WHERE SHOULD YOUR STORY CONTINUE?', 'Explore the places that fit your plans.'],
    ['YOUR UNIVERSITY', 'WE FIND THE ONES THAT FIT.', 'Program, requirements and cost all need to work for you.'],
    ['YOUR DOCUMENTS', 'EVERY PIECE HAS A PURPOSE.', 'Prepare, review and refine before anything is sent.'],
    ['YOUR APPLICATION', 'EVERY DETAIL MATTERS.', 'The right program and a complete application, ready to submit.'],
    ['YOUR ADMISSION', "YOU'VE BEEN ACCEPTED.", 'A new chapter becomes real.'],
    ['YOUR VISA', 'ONE LAST STEP BEFORE DEPARTURE.', 'The next requirements are made clear, one by one.'],
    ['YOUR DEPARTURE', 'YOUR FIRST FLIGHT.', 'From your first question to the journey ahead.']
  ]
};

function makeTexture(width, height, paint) {
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  const ctx = localizeCanvas(canvas.getContext('2d'));
  paint(ctx, width, height);
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;
  return map;
}

function textSprite(text, size = 34, color = '#e2d7c4', background = false) {
  const map = makeTexture(512, 116, (ctx, w) => {
    if (background) {
      ctx.fillStyle = 'rgba(9,20,25,.82)'; ctx.fillRect(6, 8, w - 12, 100);
      ctx.strokeStyle = 'rgba(219,188,134,.55)'; ctx.strokeRect(6.5, 8.5, w - 13, 99);
      ctx.fillStyle = '#d6b783'; ctx.fillRect(6, 8, 4, 100);
    }
    ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.font = `600 ${size}px Arial`;
    ctx.fillText(text, w / 2, 72, w - 30);
  });
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map, transparent: true, opacity: 0, depthWrite: false }));
  sprite.scale.set(1.6, .36, 1);
  return sprite;
}

function line(points, color = GOLD, opacity = 0) {
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const object = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false }));
  object.frustumCulled = false;
  return object;
}

function documentMap(title, reviewed = false) {
  return makeTexture(384, 512, (ctx, w, h) => {
    const base = ctx.createLinearGradient(0, 0, w, h);
    base.addColorStop(0, '#fffdfa'); base.addColorStop(1, '#e8e3da');
    ctx.fillStyle = base; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#cdc4b8'; ctx.strokeRect(22.5, 22.5, w - 45, h - 45);
    ctx.fillStyle = '#5f5a53'; ctx.font = 'bold 12px Arial'; ctx.fillText('STUDENT JOURNEY / DOCUMENT', 37, 54);
    ctx.strokeStyle = '#b4a99b'; ctx.beginPath(); ctx.moveTo(37, 70); ctx.lineTo(347, 70); ctx.stroke();
    ctx.fillStyle = '#2d3535'; ctx.font = 'bold 23px Arial'; ctx.fillText(title, 37, 111, 310);
    ctx.fillStyle = '#716d66'; ctx.font = '12px Arial';
    ['Applicant details', 'Program and destination', 'Supporting information', 'Review notes'].forEach((field, i) => {
      ctx.fillText(field.toUpperCase(), 37, 164 + i * 67);
      ctx.strokeStyle = '#bdb7ad'; ctx.beginPath(); ctx.moveTo(37, 185 + i * 67); ctx.lineTo(347, 185 + i * 67); ctx.stroke();
    });
    if (title === 'MOTIVATION LETTER') {
      ctx.fillStyle = '#555d5b'; ctx.font = '13px Georgia';
      ctx.fillText(reviewed ? 'My goal is to apply what I learn to...' : 'I have always been interested in...', 37, 370, 305);
      if (reviewed) {
        ctx.fillStyle = 'rgba(207,181,115,.28)'; ctx.fillRect(32, 350, 317, 32);
        ctx.fillStyle = '#775c42'; ctx.font = 'bold 12px Arial'; ctx.fillText('REVIEWED', 250, 419);
      }
    }
    ctx.strokeStyle = reviewed ? '#99754c' : '#a98972'; ctx.lineWidth = 2;
    ctx.strokeRect(226, 445, 120, 30);
    ctx.fillStyle = reviewed ? '#99754c' : '#a98972'; ctx.font = 'bold 12px Arial';
    ctx.fillText(reviewed ? '✓ REVIEWED' : 'IN REVIEW', 238, 465);
  });
}

function drawJourneyPage(ctx, count) {
  const w = ctx.canvas.width, h = ctx.canvas.height;
  const base = ctx.createLinearGradient(0, 0, w, h);
  base.addColorStop(0, '#f5efe0'); base.addColorStop(1, '#e6d7bf');
  ctx.fillStyle = base; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#bca98c'; ctx.lineWidth = 2; ctx.strokeRect(33, 33, w - 66, h - 66);
  ctx.strokeStyle = 'rgba(149,127,93,.16)';
  for (let i = 0; i < 15; i++) {
    ctx.beginPath(); ctx.ellipse(w / 2, h * .52, 110 + i * 16, 160 + i * 19, i * .08, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.textAlign = 'center'; ctx.fillStyle = '#655447'; ctx.font = 'bold 24px Arial';
  ctx.fillText('STUDENT JOURNEY', w / 2, 113);
  ctx.font = '14px Arial'; ctx.fillText('NORD CONSULT  ·  STORY RECORD', w / 2, 143);
  const stamps = [
    ['PROFILE COMPLETE', 'PERSONAL PATH'], ['FINLAND SELECTED', 'DESTINATION'],
    ['UNIVERSITY SELECTED', 'PROGRAM MATCH'], ['DOCUMENTS READY', 'REVIEWED'],
    ['APPLICATION SENT', 'SUBMITTED'], ['ADMITTED', 'OFFER RECEIVED'],
    ['READY TO TRAVEL', 'VISA STEP']
  ];
  stamps.slice(0, count).forEach(([title, subtitle], i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = col ? 401 : 72, y = 205 + row * 179;
    ctx.save(); ctx.translate(x + 145, y + 57); ctx.rotate((i % 3 - 1) * .035);
    ctx.strokeStyle = i === 5 ? '#7f5d49' : '#9a7863'; ctx.lineWidth = i === 5 ? 3 : 2;
    ctx.strokeRect(-141, -53, 282, 106);
    ctx.fillStyle = '#765a49'; ctx.font = i === 5 ? 'bold 24px Arial' : 'bold 18px Arial';
    ctx.fillText(title, 0, -5, 260);
    ctx.font = '12px Arial'; ctx.fillText(subtitle + '  ·  ✓', 0, 23);
    ctx.restore();
  });
  ctx.fillStyle = '#8a7a6b'; ctx.font = '13px Arial';
  ctx.fillText('ILLUSTRATIVE JOURNEY  •  NOT A TRAVEL DOCUMENT', w / 2, h - 91);
}

function boardingMap() {
  return makeTexture(768, 300, (ctx, w, h) => {
    ctx.fillStyle = '#d6bf96'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#a79273'; ctx.lineWidth = 3; ctx.strokeRect(11, 11, w - 22, h - 22);
    ctx.strokeStyle = '#b7a98e'; ctx.setLineDash([7, 7]); ctx.beginPath(); ctx.moveTo(548, 11); ctx.lineTo(548, h - 11); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#564538'; ctx.font = 'bold 16px Arial'; ctx.fillText('STUDENT JOURNEY / BOARDING PASS', 30, 40);
    ctx.font = 'bold 15px Arial'; ctx.fillText(STORY.student.name.toUpperCase(), 30, 71);
    ctx.font = '12px Arial'; ctx.fillText('FROM', 32, 106); ctx.fillText('TO', 285, 106);
    ctx.fillStyle = '#223438'; ctx.font = 'bold 32px Arial'; ctx.fillText('TASHKENT', 30, 148); ctx.fillText(STORY.journey.city.toUpperCase(), 283, 148);
    ctx.fillStyle = '#554636'; ctx.font = 'bold 13px Arial'; ctx.fillText('PURPOSE  /  STUDY', 31, 194); ctx.fillText('GATE  /  FUTURE', 284, 194);
    ctx.font = 'bold 16px Arial'; ctx.fillText('STATUS  /  BOARDING', 31, 233);
    ctx.font = '11px Arial'; ctx.fillText('ILLUSTRATIVE STORY PASS · NOT A TRAVEL DOCUMENT', 32, 270);
    ctx.fillStyle = '#66533d'; ctx.fillRect(585, 40, 8, 190); ctx.fillRect(609, 40, 3, 190);
    ctx.fillRect(627, 40, 13, 190); ctx.fillRect(655, 40, 5, 190); ctx.fillRect(677, 40, 9, 190);
  });
}

function applicationTexture(step) {
  return makeTexture(768, 520, (ctx, w, h) => {
    ctx.fillStyle = '#102026'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#82948e'; ctx.lineWidth = 2; ctx.strokeRect(17, 17, w - 34, h - 34);
    ctx.fillStyle = '#c1b18d'; ctx.font = 'bold 19px Arial'; ctx.fillText('STUDENT JOURNEY / APPLICATION', 42, 60);
    ctx.fillStyle = '#e5e7db'; ctx.font = 'bold 28px Arial'; ctx.fillText('PROGRAM APPLICATION', 42, 111);
    const rows = ['PROFILE', 'PROGRAM', 'DOCUMENTS', 'SCHOLARSHIP', 'REVIEW'];
    rows.forEach((row, i) => {
      const y = 164 + i * 54;
      ctx.strokeStyle = '#50645f'; ctx.beginPath(); ctx.moveTo(43, y + 16); ctx.lineTo(724, y + 16); ctx.stroke();
      ctx.fillStyle = i < Math.min(step, 5) ? '#d6b783' : '#b4bfba';
      ctx.font = '600 18px Arial'; ctx.fillText(row, 46, y);
      ctx.textAlign = 'right'; ctx.fillText(i < Math.min(step, 5) ? '✓' : '—', 704, y); ctx.textAlign = 'left';
    });
    ctx.fillStyle = step >= 7 ? '#d6b783' : '#b6a787';
    ctx.fillRect(405, 445, 320, 43);
    ctx.fillStyle = '#102026'; ctx.font = 'bold 17px Arial';
    const status = step < 5 ? 'REVIEW IN PROGRESS' : step === 5 ? 'SUBMIT APPLICATION' : step === 6 ? 'SUBMITTING...' : 'APPLICATION SUBMITTED';
    ctx.textAlign = 'center'; ctx.fillText(status, 565, 473); ctx.textAlign = 'left';
    if (step === 6) { ctx.fillStyle = '#d6b783'; ctx.fillRect(405, 495, 220, 3); }
  });
}

function acceptanceMap() {
  return makeTexture(512, 660, (ctx, w, h) => {
    ctx.fillStyle = '#f6f0e4'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#b8aa90'; ctx.strokeRect(29, 29, w - 58, h - 58);
    ctx.fillStyle = '#7e725f'; ctx.font = 'bold 13px Arial'; ctx.fillText('AURORA STUDY CAMPUS', 54, 73);
    ctx.strokeStyle = '#aaa08e'; ctx.beginPath(); ctx.moveTo(54, 93); ctx.lineTo(458, 93); ctx.stroke();
    ctx.fillStyle = '#455351'; ctx.font = 'bold 31px Georgia'; ctx.fillText('CONGRATULATIONS', 54, 178, 408);
    ctx.fillStyle = '#5d605a'; ctx.font = '19px Georgia';
    [`Dear ${STORY.student.name},`, `An offer has been made for ${STORY.student.field}.`, 'Starting term: illustrative.', 'Offer status: accepted in this story.'].forEach((line, i) => ctx.fillText(line, 54, 246 + i * 45));
    ctx.fillStyle = '#a78359'; ctx.font = 'bold 16px Arial'; ctx.fillText('WELCOME TO YOUR NEXT CHAPTER', 54, 509);
    ctx.fillStyle = '#82796e'; ctx.font = '11px Arial'; ctx.fillText('FICTIONAL STORY LETTER · NOT AN OFFICIAL OFFER', 54, 589);
  });
}

function mapProgress(p) {
  const keys = [[0, 0], [.08, .025], [.18, .14], [.29, .26], [.40, .38], [.51, .50],
    [.62, .62], [.72, .655], [.81, .77], [.90, .88], [1, .985]];
  for (let i = 1; i < keys.length; i++) if (p <= keys[i][0]) {
    const a = keys[i - 1], b = keys[i];
    return lerp(a[1], b[1], smooth(a[0], b[0], p));
  }
  return .985;
}

export function createRoadmap(scene, chaos) {
  const root = new THREE.Group(); scene.add(root);
  const points = [
    [0, 6.55, 3.5], [1.5, 6.9, 2.2], [3.2, 7.4, .1], [4.7, 8.1, -3],
    [5.7, 8.35, -6], [6.4, 8.6, -10], [5.3, 8.9, -15], [2.8, 8.7, -21],
    [.7, 8.25, -27], [.7, 8.5, -33], [2.8, 9, -40], [5.8, 9.7, -47],
    [6.8, 10.6, -54], [4.8, 11.8, -62], [2, 13, -71]
  ].map(p => new THREE.Vector3(...p));
  const route = new THREE.CatmullRomCurve3(points, false, 'catmullrom', .3);
  const routePoints = route.getPoints(520);
  const road = line(routePoints, GOLD, .9); root.add(road);
  const pulse = new THREE.Mesh(new THREE.SphereGeometry(.065, 10, 8), new THREE.MeshBasicMaterial({ color: 0xf3d6a0 })); root.add(pulse);
  const positions = [.14, .26, .38, .50, .62, .77, .88, .96];
  const portals = positions.map((at, i) => {
    const position = route.getPoint(at), tangent = route.getTangent(at).normalize();
    const group = new THREE.Group(); group.position.copy(position);
    group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(i === 7 ? 1.18 : .95, .017, 6, 60), new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, opacity: .16, depthWrite: false }));
    const halo = new THREE.Mesh(new THREE.TorusGeometry(i === 7 ? 1.28 : 1.05, .08, 5, 48), new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, opacity: 0, depthWrite: false }));
    group.add(ring, halo); root.add(group);
    const dot = new THREE.Mesh(new THREE.SphereGeometry(.075, 8, 6), new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, opacity: 0 })); dot.position.copy(position); root.add(dot);
    const name = textSprite(ROADMAP_CONTENT.milestones[i][0], 29);
    name.position.copy(position).add(new THREE.Vector3(0, 1.35, 0));
    root.add(name);
    return { group, ring, halo, dot, name, at, position };
  });

  // Small distant lights make upcoming steps legible before their labels appear.
  const futureLights = new THREE.InstancedMesh(new THREE.SphereGeometry(.055, 6, 5),
    new THREE.MeshBasicMaterial({ color: 0xbec4b3, transparent: true, opacity: .48, depthWrite: false }), 36);
  const temp = new THREE.Object3D();
  for (let i = 0; i < 36; i++) {
    const q = route.getPoint(.12 + i / 42 * .86);
    temp.position.set(q.x + Math.sin(i * 2.2) * (1 + i % 3), q.y + Math.cos(i * 1.8) * (1 + i % 2), q.z);
    temp.scale.setScalar(.35 + (i % 4) * .2); temp.updateMatrix(); futureLights.setMatrixAt(i, temp.matrix);
  }
  futureLights.instanceMatrix.needsUpdate = true; futureLights.frustumCulled = false; root.add(futureLights);

  const profileCenter = portals[0].position;
  const profile = ROADMAP_CONTENT.profile.map(([key, value], i) => {
    const sprite = textSprite(`${key} / ${value}`, 27, '#e8dcc4', true);
    sprite.scale.multiplyScalar(.82); root.add(sprite);
    return sprite;
  });

  const destinationCenter = portals[1].position;
  const countries = ROADMAP_CONTENT.countries.map(([name, criteria], i) => {
    const angle = i * Math.PI * 2 / 6;
    const end = destinationCenter.clone().add(new THREE.Vector3(Math.cos(angle) * 3, Math.sin(angle) * 1.9, -2.3));
    const path = line([destinationCenter, destinationCenter.clone().lerp(end, .53).add(new THREE.Vector3(0, .3, 0)), end], GOLD, 0);
    root.add(path);
    const sprite = textSprite(name, 35, i === 0 ? '#e9d1a3' : '#c8d0c7');
    sprite.position.copy(end); root.add(sprite);
    const info = textSprite(criteria, 22, '#b9c6bd');
    info.position.copy(end).add(new THREE.Vector3(0, -.34, 0)); info.scale.multiplyScalar(.84); root.add(info);
    return { path, sprite, info, end };
  });

  const universityCenter = portals[2].position;
  const universityDots = new THREE.InstancedMesh(new THREE.SphereGeometry(.055, 6, 5),
    new THREE.MeshBasicMaterial({ color: 0xb6c9bf, transparent: true, opacity: .7, depthWrite: false }), 32);
  universityDots.instanceMatrix.setUsage(THREE.DynamicDrawUsage); universityDots.frustumCulled = false; root.add(universityDots);
  const universityPositions = Array.from({ length: 32 }, (_, i) => {
    const a = i * 2.39996, r = 1.8 + (i * 7 % 11) * .28;
    return universityCenter.clone().add(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r * .6, (i * 5 % 9) * .4 - 2));
  });
  const architecture = new THREE.Group(); architecture.position.copy(universityCenter).add(new THREE.Vector3(0, -.38, -.7)); root.add(architecture);
  const stone = new THREE.MeshStandardMaterial({ color: 0x8ca69e, metalness: .12, roughness: .76, transparent: true, opacity: .85 });
  const base = new THREE.Mesh(new THREE.BoxGeometry(2.3, .11, .75), stone); architecture.add(base);
  for (let i = -2; i <= 2; i++) {
    const column = new THREE.Mesh(new THREE.BoxGeometry(.11, .85, .11), stone);
    column.position.set(i * .42, .47, 0); architecture.add(column);
  }
  const roof = new THREE.Mesh(new THREE.BoxGeometry(2.4, .12, .85), stone); roof.position.y = .96; architecture.add(roof);
  const universityInfo = textSprite(`${ROADMAP_CONTENT.university.name}  /  ${ROADMAP_CONTENT.university.program}`, 25, '#e7d6b2', true);
  universityInfo.position.copy(universityCenter).add(new THREE.Vector3(0, 1.5, 0)); root.add(universityInfo);
  const universityDetails = textSprite(`${ROADMAP_CONTENT.university.location} · ${ROADMAP_CONTENT.university.tuition} · SCHOLARSHIP ${ROADMAP_CONTENT.university.scholarship.toUpperCase()}`, 21, '#d0d9d0');
  universityDetails.position.copy(universityCenter).add(new THREE.Vector3(0, 1.12, 0)); root.add(universityDetails);

  const documentCenter = portals[3].position;
  const sharedPaper = new THREE.PlaneGeometry(.76, 1.04);
  const documents = ROADMAP_CONTENT.documents.map((title, i) => {
    const mesh = new THREE.Mesh(sharedPaper, new THREE.MeshStandardMaterial({ map: documentMap(title), side: THREE.DoubleSide, transparent: true, opacity: 0, roughness: .91, depthWrite: false }));
    mesh.position.copy(documentCenter).add(new THREE.Vector3((i % 3 - 1) * 1.1, (Math.floor(i / 3) - .5) * 1.5, i * -.27));
    mesh.rotation.y = -.18 + i * .04; root.add(mesh);
    const check = textSprite('✓', 58, '#d6b783');
    check.position.copy(mesh.position).add(new THREE.Vector3(.4, -.37, .08)); check.scale.set(.32, .32, 1); root.add(check);
    return { mesh, check, initial: mesh.position.clone() };
  });
  const motivation = documents[4].mesh;
  const motivationOriginal = motivation.material.map;
  const motivationReviewed = documentMap('MOTIVATION LETTER', true);

  const application = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 2.4),
    new THREE.MeshBasicMaterial({ map: applicationTexture(0), transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
  application.position.copy(portals[4].position).add(new THREE.Vector3(.2, 0, .2)); root.add(application);
  const applicationMaps = Array.from({ length: 8 }, (_, i) => applicationTexture(i));
  application.material.map = applicationMaps[0];

  const dates = ROADMAP_CONTENT.waitDates.map((value, i) => {
    const sprite = textSprite(value, 34, '#9bacaa');
    const spot = route.getPoint(.65 + i * .025);
    sprite.position.copy(spot).add(new THREE.Vector3(i % 2 ? 1.8 : -1.7, 1.1 + i * .22, -.5));
    root.add(sprite); return sprite;
  });
  const notification = textSprite('APPLICATION STATUS UPDATED', 28, '#e4d3b0', true);
  notification.position.copy(portals[5].position).add(new THREE.Vector3(0, 1.8, 1)); root.add(notification);

  const admission = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 2.7),
    new THREE.MeshBasicMaterial({ map: acceptanceMap(), transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }));
  admission.position.copy(portals[5].position).add(new THREE.Vector3(.6, .45, .35)); root.add(admission);
  const admissionLight = new THREE.PointLight(0xffdeb0, 0, 14, 2); admissionLight.position.copy(portals[5].position); root.add(admissionLight);

  const departureWords = ['DEPARTURES', 'GATE', 'BOARDING', 'DESTINATION'].map((word, i) => {
    const sprite = textSprite(word, 36, '#aab8b1');
    sprite.position.copy(portals[7].position).add(new THREE.Vector3((i % 2 ? 2.4 : -2.5), i * .78 - 1.2, -i * .8));
    root.add(sprite); return sprite;
  });
  const campus = new THREE.Group(); campus.position.copy(route.getPoint(1)); root.add(campus);
  const campusMaterial = new THREE.MeshBasicMaterial({ color: 0xa08d68, transparent: true, opacity: .16 });
  for (let i = -2; i <= 2; i++) {
    const tower = new THREE.Mesh(new THREE.BoxGeometry(.35, 1.7 + (i + 2) % 3 * .45, .4), campusMaterial);
    tower.position.set(i * .53, .85, 0); campus.add(tower);
  }
  const campusLight = new THREE.PointLight(0xffcf83, 0, 15, 2); campusLight.position.copy(route.getPoint(1)); root.add(campusLight);

  const pageCanvas = document.createElement('canvas'); pageCanvas.width = 768; pageCanvas.height = 1060;
  drawJourneyPage(pageCanvas.getContext('2d'), 0);
  const pageMap = new THREE.CanvasTexture(pageCanvas); pageMap.colorSpace = THREE.SRGBColorSpace;
  const journeyPage = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 3.32), new THREE.MeshStandardMaterial({ map: pageMap, roughness: .92, side: THREE.DoubleSide }));
  journeyPage.position.set(1.275, 0, .094); chaos.student.add(journeyPage);
  const boardingPass = new THREE.Mesh(new THREE.PlaneGeometry(2.45, .96),
    new THREE.MeshBasicMaterial({ map: boardingMap(), side: THREE.DoubleSide, transparent: true, opacity: 0, depthWrite: false, depthTest: false, toneMapped: false }));
  boardingPass.position.set(1.55, .44, .28); boardingPass.rotation.z = -.08; chaos.student.add(boardingPass);
  boardingPass.renderOrder = 30;
  let lastStampCount = -1, lastAppStep = -1;

  function update(p, camera, mobile, reduced) {
    root.visible = p > .001;
    chaos.student.visible = p > .001;
    journeyPage.visible = p > .09;
    boardingPass.visible = p > .915;
    // The preceding chapter owns the shared passport until this chapter begins.
    if (p <= .001) return;
    const travel = mapProgress(p);
    const alignment = smooth(.025, .13, p);
    if (p > 0) {
      const cameraPoint = route.getPoint(Math.max(0, travel - .055));
      const tangent = route.getTangent(Math.max(0, travel - .055)).normalize();
      const side = new THREE.Vector3(tangent.z, 0, -tangent.x).normalize();
      const cameraTarget = cameraPoint.clone().addScaledVector(side, mobile ? .72 : 1.9).add(new THREE.Vector3(0, mobile ? 1.45 : 2.2, 0)).addScaledVector(tangent, mobile ? -2.7 : -3.8);
      const ahead = route.getPoint(Math.min(.999, travel + (mobile ? .055 : .075)));
      const quiet = smooth(.63, .67, p) * (1 - smooth(.705, .75, p));
      cameraTarget.lerp(camera.position, quiet * .68);
      const zoomOut = smooth(.945, 1, p);
      const end = route.getPoint(.965);
      cameraTarget.lerp(end.clone().add(new THREE.Vector3(mobile ? 2.5 : 6.5, mobile ? 4 : 7.5, mobile ? 6 : 8)), zoomOut);
      ahead.lerp(end.clone().add(new THREE.Vector3(0, 0, -4)), zoomOut);
      if (mobile) {
        ahead.copy(route.getPoint(Math.min(.99, travel + .022))).add(new THREE.Vector3(.25, .85, .35));
        cameraTarget.addScaledVector(tangent, -1.4);
        const compactFraming = clamp((700 - innerHeight) / 105) * smooth(.19, .23, p) * (1 - smooth(.52, .55, p));
        ahead.y += .85 * compactFraming;
      }
      const previousLook = new THREE.Vector3(.9, 6.8, 0);
      camera.position.lerp(cameraTarget, alignment);
      camera.up.set(0, 1, 0);
      camera.lookAt(previousLook.lerp(ahead, alignment));
    }
    // Hand the guiding line from the clarity chapter to this single roadmap
    // route during the intro. Keeping both paths past the crossfade reads as
    // two competing routes around the travelling passport.
    chaos.group.visible = p < .055;
    road.material.opacity = .92 * smooth(.045, .12, p);
    road.geometry.setDrawRange(0, Math.floor(routePoints.length * Math.max(.03, Math.min(1, travel + .19))));
    pulse.visible = p > .08;
    pulse.position.copy(route.getPoint(Math.min(.999, travel + .17)));
    pulse.scale.setScalar(1 + .5 * Math.sin(p * 85) * (reduced ? 0 : 1));
    futureLights.material.opacity = 0 * smooth(.03, .13, p) * (1 - smooth(.91, 1, p) * .45);
    portals.forEach(({ ring, halo, dot, name, at }, i) => {
      const reached = smooth(at - .018, at + .012, travel);
      const pulseStrength = Math.exp(-Math.pow((travel - at) / .018, 2));
      ring.material.opacity = (.04 + .16 * reached + .15 * pulseStrength) * smooth(.02, .09, p);
      ring.scale.setScalar(1 + .22 * pulseStrength);
      halo.material.opacity = mobile ? 0 : .08 * pulseStrength;
      dot.material.opacity = .18 + .75 * reached;
      name.material.opacity = .86 * smooth(at - .046, at - .01, travel) * (1 - smooth(at + .08, at + .15, travel));
      name.visible = false;
      ring.visible = !mobile && Math.abs(travel - at) < .12;
    });

    const studentMove = smooth(.05, .16, p);
    const studentTarget = route.getPoint(Math.min(.99, travel + .022)).add(new THREE.Vector3(mobile ? -.2 : -.36, -.15, .35));
    const sceneThreePosition = new THREE.Vector3(0, 6.55, 3.5);
    chaos.student.position.copy(sceneThreePosition.lerp(studentTarget, studentMove));
    const finalShift = smooth(.93, .99, p);
    chaos.student.position.addScaledVector(new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion), (mobile ? 0 : 2.3) * finalShift);
    chaos.student.scale.setScalar(lerp(.33, mobile ? .37 : .44, studentMove) * (1 + .025 * Math.sin(p * 70) * (reduced ? 0 : 1)));
    chaos.student.rotation.set(-.09, -.12 + route.getTangent(travel).x * .17 * studentMove, -.05 + .025 * Math.sin(p * 26));
    const openWindows = [[.105, .17], [.215, .285], [.335, .395], [.44, .51], [.545, .61], [.755, .815], [.845, .905]];
    let open = 0;
    openWindows.forEach(([a, b]) => { open = Math.max(open, smooth(a, a + .023, p) * (1 - smooth(b - .018, b, p))); });
    open = Math.max(open, smooth(.935, .975, p));
    chaos.studentCover.rotation.y = -Math.PI * .78 * open;
    const stampThresholds = [.175, .285, .395, .505, .615, .805, .895];
    const stampCount = stampThresholds.filter(value => p >= value).length;
    if (stampCount !== lastStampCount) {
      drawJourneyPage(pageCanvas.getContext('2d'), stampCount);
      pageMap.needsUpdate = true;
      lastStampCount = stampCount;
    }
    journeyPage.visible = p > .09;
    boardingPass.visible = p > .915;
    boardingPass.material.opacity = smooth(.925, .965, p);
    boardingPass.position.y = lerp(.05, .44, smooth(.925, .98, p));

    profile.forEach((sprite, i) => {
      const angle = i * 2.4 + (reduced ? 0 : p * 5);
      const orbit = profileCenter.clone().add(new THREE.Vector3(Math.cos(angle) * (1.55 + (i % 2) * .35), Math.sin(angle) * .9, .7));
      const collapse = smooth(.15, .18, p);
      sprite.position.copy(orbit.lerp(chaos.student.position, collapse));
      sprite.material.opacity = smooth(.085 + i * .008, .115 + i * .008, p) * (1 - smooth(.157, .182, p));
      sprite.visible = false;
    });
    countries.forEach(({ path, sprite, info, end }, i) => {
      sprite.position.copy(end);
      info.position.copy(end).add(new THREE.Vector3(0, -.34, 0));
      const active = smooth(.185 + i * .005, .22 + i * .005, p);
      const selection = smooth(.265, .29, p);
      path.material.opacity = active * (1 - smooth(.29, .325, p)) * (i === 0 ? .2 + .74 * selection : .26 * (1 - .8 * selection));
      sprite.material.opacity = active * (1 - smooth(.295, .33, p)) * (i === 0 ? 1 : 1 - .84 * selection);
      info.material.opacity = sprite.material.opacity * .64;
      const visible = i < (mobile ? 3 : 6);
      path.visible = sprite.visible = info.visible = visible && active > .01 && !mobile;
    });
    const universityShow = smooth(.285, .32, p) * (1 - smooth(.4, .435, p));
    universityDots.visible = universityShow > .01;
    universityDots.material.opacity = .67 * universityShow;
    const filterUniversity = smooth(.335, .39, p);
    for (let i = 0; i < 32; i++) {
      const visible = i < (mobile ? 14 : 32) && (i < Math.floor(32 * (1 - .88 * filterUniversity)) || (i * 7 % 32) < Math.floor(32 * (1 - .88 * filterUniversity)));
      temp.position.copy(universityPositions[i]).lerp(universityCenter, filterUniversity * .72);
      temp.scale.setScalar(visible ? 1 : .0001); temp.updateMatrix(); universityDots.setMatrixAt(i, temp.matrix);
    }
    universityDots.instanceMatrix.needsUpdate = true;
    architecture.visible = false;
    architecture.scale.setScalar(smooth(.355, .395, p) * (1 - smooth(.405, .43, p)));
    universityInfo.material.opacity = smooth(.365, .39, p) * (1 - smooth(.405, .43, p));
    universityDetails.material.opacity = universityInfo.material.opacity * .72;
    universityInfo.visible = universityDetails.visible = !mobile;

    documents.forEach(({ mesh, check, initial }, i) => {
      const enter = smooth(.405 + i * .007, .44 + i * .007, p);
      const checked = smooth(.443 + i * .009, .47 + i * .009, p);
      const stack = smooth(.49, .515, p);
      mesh.visible = enter > .01 && p < .535 && (!mobile || i < 4);
      mesh.material.opacity = enter * (1 - smooth(.515, .535, p));
      mesh.position.copy(initial).lerp(documentCenter.clone().add(new THREE.Vector3(i * .045, 0, -i * .018)), stack);
      if (mobile) mesh.position.addScaledVector(new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion), -.35);
      mesh.quaternion.copy(camera.quaternion);
      mesh.scale.setScalar(1 + .3 * (i === 4 ? smooth(.46, .48, p) * (1 - stack) : 0));
      check.visible = mesh.visible && checked > .01;
      check.material.opacity = checked * (1 - stack);
      check.position.copy(mesh.position).add(new THREE.Vector3(.34, -.33, .09));
    });
    motivation.material.map = p >= .475 ? motivationReviewed : motivationOriginal;
    const appShow = smooth(.51, .54, p) * (1 - smooth(.615, .64, p));
    application.visible = appShow > .01;
    application.material.opacity = appShow;
    application.quaternion.copy(camera.quaternion);
    const appStep = p < .55 ? Math.floor(smooth(.51, .55, p) * 5) : p < .574 ? 5 : p < .601 ? 6 : 7;
    if (appStep !== lastAppStep) { application.material.map = applicationMaps[appStep]; lastAppStep = appStep; }
    const submitting = smooth(.575, .6, p) * (1 - smooth(.61, .635, p));
    application.scale.setScalar((mobile ? .7 : 1) * (1 - .83 * smooth(.605, .64, p) + .035 * submitting));
    application.position.copy(portals[4].position).lerp(route.getPoint(.69), smooth(.615, .645, p));

    dates.forEach((sprite, i) => {
      sprite.material.opacity = smooth(.635 + i * .012, .665 + i * .012, p) * (1 - smooth(.715, .745, p)) * .55;
      sprite.visible = sprite.material.opacity > .01 && (!mobile || i < 2);
    });
    notification.material.opacity = smooth(.695, .715, p) * (1 - smooth(.745, .77, p));
    notification.visible = notification.material.opacity > .01;
    const letter = smooth(.725, .77, p) * (1 - smooth(.815, .845, p));
    admission.visible = letter > .01;
    admission.material.opacity = letter * (1 - .85 * smooth(.77, .8, p));
    admission.scale.setScalar(lerp(.18, 1, smooth(.725, .765, p)));
    admission.quaternion.copy(camera.quaternion);
    admissionLight.intensity = 13 * smooth(.755, .79, p) * (1 - smooth(.835, .89, p));
    departureWords.forEach((sprite, i) => {
      sprite.material.opacity = smooth(.9 + i * .013, .935 + i * .01, p) * (1 - smooth(.965, .99, p)) * .6;
      sprite.visible = sprite.material.opacity > .01 && (!mobile || i < 2);
    });
    campus.visible = p > .94;
    campusMaterial.opacity = .16 * smooth(.94, 1, p);
    campusLight.intensity = 5 * smooth(.95, 1, p);
    return { travel };
  }
  return { update, route, portals, root };
}
