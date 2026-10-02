import * as THREE from 'three';
import { localizeCanvas } from './i18n.js';
import { STORY } from './story.js';

const clamp = (v) => Math.max(0, Math.min(1, v));
const smooth = (a, b, value) => {
  const t = clamp((value - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const lerp = THREE.MathUtils.lerp;
const INK = '#ede7db';
const ACCENT = 0xd6b783;

export const SCENE_THREE_CONTENT = {
  requirements: [
    ['IELTS 6.5', -2.5, 8.6, 2.1, .05], ['€12,000 / YEAR', -.7, 8.1, 3.6, .085],
    ['JAN 17', 1.2, 8.8, 3.1, .12], ['SAT 1250+', 3.3, 7.9, 1.2, .15],
    ['GPA 3.0+', -3.6, 7.4, -.8, .18], ['50% SCHOLARSHIP', 2.7, 6.6, 3.6, .205],
    ['IELTS 7.0', -4.1, 9.3, 4.5, .23], ['€18,500', 3.9, 9.1, 5.0, .25],
    ['TRANSCRIPT', -1.4, 5.9, 4.5, .27], ['MOTIVATION LETTER', 3.7, 5.4, 1.6, .29],
    ['MAR 15', -4.8, 6.3, 5.7, .305], ['SAT 1350', 1.8, 9.7, -.9, .32],
    ['PROOF OF FUNDS', -3.7, 4.6, 2.6, .34], ['ENTRANCE EXAM', 4.7, 8.2, 4.9, .355],
    ['RESIDENCE PERMIT', 2.0, 4.6, 5.4, .375], ['APPLICATION FEE', -.2, 9.9, 5.4, .39],
    ['NO SCHOLARSHIP', -5.2, 7.8, 1.1, .405], ['HOUSING', 4.9, 6.1, -.2, .42],
    ['INTERVIEW', -1.8, 9.6, -2.0, .44], ['HEALTH INSURANCE', 3.2, 4.8, -1.5, .46]
  ],
  questions: [
    'Which country?', 'Can I afford it?', 'Do I need SAT?', 'Is my GPA enough?',
    'When is the deadline?', 'What about my visa?', 'Where will I live?', 'What if I’m rejected?'
  ],
  documents: [
    ['ACADEMIC TRANSCRIPT', 'Course record', 'Credit hours', 'Grade average'],
    ['IELTS RESULT', 'Listening / Reading', 'Writing / Speaking', 'Overall band'],
    ['APPLICATION FORM', 'Program choice', 'Applicant details', 'Declaration'],
    ['MOTIVATION LETTER', 'Academic interests', 'Why this program', 'Future goals'],
    ['BANK STATEMENT', 'Available funds', 'Account holder', 'Verified balance'],
    ['RECOMMENDATION', 'Referee details', 'Academic reference', 'Signature'],
    ['PASSPORT COPY', 'Identity details', 'Expiry date', 'Document number'],
    ['VISA CHECKLIST', 'Admission letter', 'Insurance', 'Residence address']
  ],
  deadlines: ['JAN 15', 'JAN 31', 'FEB 07', 'MAR 01', 'MAR 15', 'APR 02'],
  profile: [
    ['BUDGET', STORY.student.budget], ['LANGUAGE', STORY.student.language],
    ['FIELD', STORY.student.field], ['DESTINATION', 'Exploring'], ['PRIORITY', STORY.student.priority]
  ],
  milestones: ['PROFILE', 'COUNTRY', 'UNIVERSITY', 'APPLICATION', 'ADMISSION', 'VISA', 'DEPARTURE']
};

function texture(width, height, draw) {
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  draw(localizeCanvas(canvas.getContext('2d')), width, height);
  const result = new THREE.CanvasTexture(canvas);
  result.colorSpace = THREE.SRGBColorSpace;
  result.anisotropy = 8;
  return result;
}

function label(text, options = {}) {
  const { color = INK, size = 33, width = 512, background = false, accent = false } = options;
  const map = texture(width, 112, (ctx, w) => {
    if (background) {
      ctx.fillStyle = 'rgba(12,23,28,.84)';
      ctx.fillRect(7, 10, w - 14, 91);
      ctx.strokeStyle = accent ? '#d4b47e' : 'rgba(191,201,194,.35)';
      ctx.strokeRect(7.5, 10.5, w - 15, 90);
      ctx.fillStyle = accent ? '#d4b47e' : '#a8b9b5';
      ctx.fillRect(7, 10, 4, 91);
    }
    ctx.fillStyle = color; ctx.textAlign = 'center';
    ctx.font = `600 ${size}px Arial`;
    ctx.fillText(text, w / 2, 68, w - 32);
  });
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map, transparent: true, opacity: 0, depthWrite: false, depthTest: true }));
  sprite.scale.set(width / 512 * 1.62, .355, 1);
  return sprite;
}

function paperTexture(title, fields, index) {
  return texture(384, 512, (ctx, w, h) => {
    const paper = ctx.createLinearGradient(0, 0, w, h);
    paper.addColorStop(0, '#fffdfa'); paper.addColorStop(1, '#e9e4dc');
    ctx.fillStyle = paper; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#d5d0c8'; ctx.strokeRect(24.5, 23.5, w - 49, h - 47);
    ctx.fillStyle = '#49453f'; ctx.font = 'bold 15px Arial';
    ctx.fillText('APPLICATION RECORD', 38, 57);
    ctx.fillStyle = '#8d8983'; ctx.font = '11px Arial';
    ctx.fillText(`REFERENCE / ${String(index + 1).padStart(2, '0')}`, 38, 81);
    ctx.strokeStyle = '#a9a29a'; ctx.beginPath(); ctx.moveTo(38, 98); ctx.lineTo(346, 98); ctx.stroke();
    ctx.fillStyle = '#282d2d'; ctx.font = 'bold 26px Arial';
    ctx.fillText(title, 38, 138, 307);
    fields.forEach((field, i) => {
      const y = 198 + i * 61;
      ctx.fillStyle = '#665f57'; ctx.font = '13px Arial'; ctx.fillText(field.toUpperCase(), 38, y);
      ctx.strokeStyle = '#b8b2a9'; ctx.beginPath(); ctx.moveTo(38, y + 23); ctx.lineTo(345, y + 23); ctx.stroke();
    });
    ctx.strokeStyle = '#aa9c8f'; ctx.strokeRect(40, 407, 13, 13);
    ctx.fillStyle = '#77716b'; ctx.font = '11px Arial'; ctx.fillText('DOCUMENTS ENCLOSED', 63, 419);
    ctx.fillStyle = '#965d57'; ctx.font = 'bold 12px Arial';
    ctx.fillText('PENDING REVIEW', 218, 458);
    ctx.strokeStyle = '#965d57'; ctx.lineWidth = 2; ctx.strokeRect(207, 439, 145, 29);
  });
}

function branch(points, color = 0xb6b9b1) {
  const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
  const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(40));
  const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0, depthWrite: false }));
  line.frustumCulled = false;
  return line;
}

export function createChaos(scene, passport, globeWorld, coverHinge) {
  const group = new THREE.Group(); scene.add(group);
  const requirements = SCENE_THREE_CONTENT.requirements.map(([text, x, y, z, start], i) => {
    const sprite = label(text, { background: i < 6 || i % 4 === 0, accent: i === 2 || i === 10 });
    sprite.position.set(x, y, z); group.add(sprite);
    return { sprite, start, base: new THREE.Vector3(x, y, z), i };
  });
  const questionPositions = [[-4.2, 8.2, 5.5], [2.9, 9.0, 5.4], [-2.4, 5.6, 5.9], [4.3, 6.4, 5.8], [-.1, 10, 5.2], [-4.4, 6.8, 3], [1.3, 4.5, 5.7], [4.4, 8.3, 3]];
  const questions = SCENE_THREE_CONTENT.questions.map((value, i) => {
    const sprite = label(value, { color: '#d8ccc0', size: 28 });
    sprite.position.set(...questionPositions[i]); group.add(sprite); return sprite;
  });
  const documentPositions = [[-1.6, 8.3, 2.4], [2.0, 7.9, 3], [-3.4, 6.8, 4.1], [3.3, 6.3, 4.4], [-1.0, 5.3, 5.1], [1.3, 9.0, 5.2], [4.2, 8.0, 1.3], [-4.5, 8.5, 2.5]];
  const documents = SCENE_THREE_CONTENT.documents.map(([title, ...fields], i) => {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(.9, 1.2),
      new THREE.MeshStandardMaterial({ map: paperTexture(title, fields, i), side: THREE.DoubleSide, transparent: true, opacity: 0, roughness: .91, depthWrite: false })
    );
    mesh.position.set(...documentPositions[i]); mesh.rotation.set((i % 3 - 1) * .12, (i % 2 ? -.27 : .23), (i % 4 - 1.5) * .13);
    group.add(mesh); return { mesh, base: mesh.position.clone(), rotation: mesh.rotation.clone() };
  });
  const deadlinePositions = [[-2.2, 9.3, 4], [3.6, 8.7, 3], [-3.7, 6.1, 5.8], [1.4, 5.9, 6.2], [.1, 9.8, 6.3], [4.4, 5.1, 3.2]];
  const deadlines = SCENE_THREE_CONTENT.deadlines.map((value, i) => {
    const sprite = label(value, { color: '#f0c4ad', background: true, accent: true, size: 41 });
    sprite.position.set(...deadlinePositions[i]); group.add(sprite); return sprite;
  });

  // A compact network grows out of the globe's existing travel routes.
  const branchPaths = [
    [[-1.4, 7.8, 1.4], [-2.5, 8.3, 2.4], [-3.5, 8.8, 4.5]],
    [[-1.4, 7.8, 1.4], [-2.2, 7.3, 2.6], [-3.6, 6.6, 4.1]],
    [[-.2, 8.1, 2], [.6, 8.7, 3], [1.8, 9.4, 4.2]],
    [[-.2, 8.1, 2], [1.0, 7.9, 3.1], [3.2, 7.4, 4.5]],
    [[1.3, 6.4, 1.4], [2.5, 6.0, 2.8], [3.8, 5.4, 4.8]],
    [[1.3, 6.4, 1.4], [.2, 5.7, 3.0], [-1.2, 5.0, 4.8]],
    [[-2.0, 6.9, 1], [-3.5, 7.1, 2.2], [-4.8, 7.5, 3.8]]
  ].map(points => { const line = branch(points); group.add(line); return line; });

  const dotsGeometry = new THREE.SphereGeometry(.038, 6, 5);
  const dots = new THREE.InstancedMesh(dotsGeometry, new THREE.MeshBasicMaterial({ color: 0xbecac4, transparent: true, opacity: .62, depthWrite: false }), 48);
  dots.instanceMatrix.setUsage(THREE.DynamicDrawUsage); dots.frustumCulled = false; group.add(dots);
  const dotData = Array.from({ length: 48 }, (_, i) => {
    const a = i * 2.39996, r = 2.3 + (i * 11 % 13) * .19;
    return new THREE.Vector3(Math.cos(a) * r, 7 + Math.sin(a) * r * .55, -2.5 + (i * 7 % 17) * .42);
  });
  const dummy = new THREE.Object3D();

  // This is a second view of the same physical passport model, without cloning its globe.
  const student = new THREE.Group();
  let studentCover;
  passport.children.filter(child => child !== globeWorld.group).forEach(child => {
    const clone = child.clone(true);
    student.add(clone);
    if (child === coverHinge) studentCover = clone;
  });
  student.visible = false; scene.add(student);
  const studentGlow = new THREE.PointLight(ACCENT, 0, 4, 2); student.add(studentGlow);
  studentGlow.position.set(1.25, .3, .7);

  const guidePoints = [[-8, 6.7, 5.3], [-4, 6.7, 4.8], [-1.2, 6.6, 4.1], [0, 6.6, 3.5], [1.4, 6.9, 3.1], [2.4, 7.3, 2], [3.0, 7.7, .8], [3.35, 8.1, -.5]];
  const guideCurve = new THREE.CatmullRomCurve3(guidePoints.map(p => new THREE.Vector3(...p)));
  const guideGeometry = new THREE.BufferGeometry().setFromPoints(guideCurve.getPoints(160));
  const guide = new THREE.Line(guideGeometry, new THREE.LineBasicMaterial({ color: ACCENT, transparent: true, opacity: 0, depthWrite: false }));
  guide.frustumCulled = false; guide.renderOrder = 15; group.add(guide);
  const guideHead = new THREE.Mesh(new THREE.SphereGeometry(.055, 12, 8), new THREE.MeshBasicMaterial({ color: 0xf4d7a4 }));
  const guideGlow = new THREE.PointLight(ACCENT, 0, 2.5); guideHead.add(guideGlow); group.add(guideHead);

  const profilePositions = [[-1.65, 7.5, 4.4], [1.6, 7.8, 4.2], [-1.65, 5.5, 4.3], [1.65, 5.6, 4.1], [0, 8.7, 4.0]];
  const profile = SCENE_THREE_CONTENT.profile.map(([name, value], i) => {
    const sprite = label(`${name}  /  ${value}`, { color: '#e5d5b9', background: true, accent: true, size: 26 });
    sprite.position.set(...profilePositions[i]); group.add(sprite);
    sprite.scale.multiplyScalar(.75);
    const link = branch([[0, 6.65, 3.5], [profilePositions[i][0] * .55, lerp(6.65, profilePositions[i][1], .55), 3.8], profilePositions[i]], ACCENT);
    group.add(link); return { sprite, link };
  });

  const pathPoints = [[0, 6.55, 3.5], [.9, 6.55, 3.15], [1.7, 6.75, 2.55], [2.5, 7.0, 1.7], [3.2, 7.25, .7], [3.8, 7.55, -.5], [4.3, 7.85, -1.8], [4.7, 8.1, -3]];
  const finalPath = branch(pathPoints, ACCENT); finalPath.renderOrder = 16; group.add(finalPath);
  const milestones = SCENE_THREE_CONTENT.milestones.map((name, i) => {
    const dot = new THREE.Mesh(new THREE.SphereGeometry(i === 0 ? .05 : .038, 12, 8), new THREE.MeshBasicMaterial({ color: ACCENT, transparent: true, opacity: 0, depthWrite: false }));
    const position = new THREE.Vector3(...pathPoints[i + 1]); dot.position.copy(position); group.add(dot);
    const text = label(name, { color: '#e3d2b5', size: 30 });
    text.position.copy(position).add(new THREE.Vector3(0, .3, 0)); text.scale.multiplyScalar(.7); group.add(text);
    return { dot, text, position };
  });

  function update(p, time, mobile, reduced, pointerX = 0, pointerY = 0) {
    group.visible = p > .001;
    group.scale.x = 1;
    const freeze = smooth(.49, .56, p);
    const clarity = smooth(.63, .91, p);
    const cleanup = smooth(.68, .9, p);
    const density = mobile ? 3 : 4;
    requirements.forEach(({ sprite, start, base, i }) => {
      const enter = smooth(start, start + .045, p);
      const filter = smooth(.64 + (i % 5) * .032, .75 + (i % 5) * .027, p);
      sprite.material.opacity = enter * (1 - filter) * (mobile ? .82 : .9);
      sprite.visible = i < density && sprite.material.opacity > .005;
      sprite.position.copy(base);
      if (mobile) sprite.position.x *= .32;
      sprite.position.z += enter * (i % 3 === 0 ? .45 : .15) * smooth(.22, .48, p);
      sprite.position.y += Math.sin(p * 31 + i) * .10 * (1 - freeze);
      const s = .7 + .3 * enter;
      sprite.scale.set(1.62 * s, .355 * s, 1);
    });
    documents.forEach(({ mesh, base, rotation }, i) => {
      const enter = smooth(.19 + i * .031, .26 + i * .031, p);
      const leave = smooth(.66 + i * .026, .78 + i * .024, p);
      mesh.visible = i < (mobile ? 2 : 3) && enter > .001 && leave < .999;
      mesh.material.opacity = enter * (1 - leave) * .6;
      mesh.position.copy(base).lerp(new THREE.Vector3((i % 3 - 1) * .8, 7.1, 1.3), 1 - enter);
      if (mobile) mesh.position.x *= .4;
      mesh.position.z += enter * smooth(.25, .48, p) * (i % 2 ? .7 : .2);
      mesh.rotation.copy(rotation);
      mesh.rotation.z += Math.sin(p * 17 + i) * .09 * (1 - freeze);
    });
    deadlines.forEach((sprite, i) => {
      sprite.material.opacity = smooth(.29 + i * .021, .36 + i * .022, p) * (1 - smooth(.68 + i * .013, .76 + i * .014, p));
      sprite.visible = false && i < (mobile ? 3 : 6) && sprite.material.opacity > .005;
      sprite.position.z = deadlinePositions[i][2] + smooth(.34, .49, p) * (i % 2 ? .8 : 1.4);
    });
    questions.forEach((sprite, i) => {
      sprite.material.opacity = smooth(.37 + i * .012, .43 + i * .012, p) * (1 - smooth(.67 + i * .01, .76 + i * .008, p)) * .82;
      sprite.visible = false && i < (mobile ? 5 : 8) && sprite.material.opacity > .005;
    });
    branchPaths.forEach((line, i) => {
      const reveal = smooth(.20 + i * .025, .30 + i * .025, p);
      line.material.opacity = reveal * (1 - smooth(.65 + i * .015, .81 + i * .012, p)) * .42;
      line.geometry.setDrawRange(0, Math.max(0, Math.floor(41 * reveal)));
      line.visible = i < 2 && line.material.opacity > .005;
    });
    const count = Math.floor(48 * smooth(.1, .49, p));
    const remaining = Math.floor(48 * (1 - cleanup * .895));
    for (let i = 0; i < 48; i++) {
      const visible = i < count && (i < remaining || (i * 13 % 48) < remaining);
      const point = dotData[i];
      dummy.position.copy(point);
      dummy.position.lerp(new THREE.Vector3((i % 5 - 2) * .28, 6.65 + Math.floor(i / 5) * .09, 2.3), cleanup * .68);
      dummy.scale.setScalar(visible ? (i < 5 ? 1.6 : 1) : .0001);
      dummy.updateMatrix(); dots.setMatrixAt(i, dummy.matrix);
    }
    dots.instanceMatrix.needsUpdate = true;
    dots.visible = false;

    const studentReveal = smooth(.32, .49, p);
    student.visible = studentReveal > .001;
    student.position.set(0, 6.55, 3.5);
    student.rotation.set(-.09, -.12, -.05);
    student.scale.setScalar(lerp(.40, mobile ? .28 : .33, smooth(.68, .94, p)) * studentReveal);
    studentGlow.intensity = .35 * smooth(.65, .82, p);
    const guideProgress = smooth(.61, .79, p);
    guide.material.opacity = guideProgress * (1 - smooth(.87, .97, p));
    guide.geometry.setDrawRange(0, Math.floor(161 * guideProgress));
    guide.visible = guide.material.opacity > .005;
    guideHead.visible = guide.visible;
    guideHead.position.copy(guideCurve.getPoint(Math.max(.001, guideProgress)));
    guideGlow.intensity = guideProgress * 1.5;

    profile.forEach(({ sprite, link }, i) => {
      const show = smooth(.68 + i * .019, .74 + i * .018, p) * (1 - smooth(.85, .94, p));
      sprite.material.opacity = show * .9; sprite.visible = false;
      link.material.opacity = show * .56; link.visible = sprite.visible;
      link.geometry.setDrawRange(0, Math.floor(41 * show));
    });
    const pathReveal = smooth(.83, .99, p);
    finalPath.material.opacity = pathReveal * .86;
    finalPath.geometry.setDrawRange(0, Math.floor(41 * pathReveal));
    finalPath.visible = pathReveal > .005;
    milestones.forEach(({ dot, text, position }, i) => {
      const show = smooth(.84 + i * .018, .9 + i * .014, p);
      dot.material.opacity = show; dot.visible = show > .005;
      text.material.opacity = show * (i > 3 ? .44 : .83);
      text.visible = show > .005 && (!mobile || i < 4);
      const hover = !mobile && !reduced && p > .89 ? Math.max(0, 1 - Math.hypot(pointerX * 4 - position.x + .6, pointerY * 2 + position.y - 7) / 1.7) : 0;
      dot.scale.setScalar(1 + hover * .6);
      text.material.opacity = Math.min(1, text.material.opacity + hover * .25);
    });

    globeWorld.group.scale.setScalar(1 - smooth(.05, .30, p));
    globeWorld.group.position.x = -3.5 * smooth(.78, 1, p);
    globeWorld.group.position.y = 6.5 * smooth(.77, 1, p);
    globeWorld.group.rotation.y = .32 * Math.min(p, .52) + .08 * (1 - freeze) * Math.sin(p * 9);
    globeWorld.routes.forEach((route, i) => {
      route.line.material.opacity *= 1 - .82 * smooth(.35 + i * .02, .58 + i * .02, p);
      route.traveler.visible = route.traveler.visible && p < .49;
    });
    globeWorld.markers.forEach((marker, i) => {
      marker.ring.material.opacity *= 1 - .72 * smooth(.28 + i * .015, .52 + i * .012, p);
    });
    return { freeze, clarity, cleanup };
  }

  return { update, group, student, studentCover, finalPath };
}
