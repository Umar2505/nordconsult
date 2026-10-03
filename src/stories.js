import * as THREE from 'three';
import { t } from './i18n.js';
import { oceanTexture } from './world.js';
import { STORY } from './story.js';
import { STUDENT_STORIES, AMBIENT_JOURNEYS } from './stories-data.js';

const clamp = n => Math.max(0, Math.min(1, n));
const smooth = (a, b, n) => { const t = clamp((n - a) / (b - a)); return t * t * (3 - 2 * t); };
const lerp = THREE.MathUtils.lerp;
const center = new THREE.Vector3(0, 14, -88);
const radius = 6;
const gold = 0xe7c998;
const teal = 0x83aaa5;

function geo([lat, lon], altitude = 0) {
  const latitude = THREE.MathUtils.degToRad(lat), longitude = THREE.MathUtils.degToRad(lon);
  const r = radius + altitude;
  return new THREE.Vector3(
    r * Math.cos(latitude) * Math.sin(longitude),
    r * Math.sin(latitude),
    r * Math.cos(latitude) * Math.cos(longitude)
  );
}

function arc(a, b, segments = 64) {
  const first = geo(a).normalize(), last = geo(b).normalize();
  return Array.from({ length: segments + 1 }, (_, i) => {
    const t = i / segments;
    return first.clone().lerp(last, t).normalize().multiplyScalar(radius + .09 + Math.sin(Math.PI * t) * .68);
  });
}

function cameraAt(keys, p) {
  for (let i = 1; i < keys.length; i++) {
    if (p <= keys[i][0]) {
      const [a, from] = keys[i - 1], [b, to] = keys[i];
      return from.clone().lerp(to, smooth(a, b, p));
    }
  }
  return keys.at(-1)[1].clone();
}

function setOpacity(node, amount) {
  node.style.opacity = String(clamp(amount));
  node.style.visibility = amount > .005 ? 'visible' : 'hidden';
}

export function createStories(scene, roadmap, chaos) {
  const root = new THREE.Group();
  root.position.copy(center);
  root.rotation.y = -.42;
  scene.add(root);

  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 56, 40),
    new THREE.MeshBasicMaterial({ map: oceanTexture, transparent: true, opacity: 0, depthWrite: false })
  );
  // SphereGeometry's UV seam is a quarter turn away from the geographic
  // coordinate convention used by the journey points and the map texture.
  sphere.rotation.y = -Math.PI / 2;
  root.add(sphere);
  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(radius * 1.045, 40, 28),
    new THREE.MeshBasicMaterial({ color: 0x688a88, transparent: true, opacity: 0, side: THREE.BackSide, depthWrite: false })
  );
  root.add(atmosphere);

  // This line begins at the physical end of Scene 4's guiding route.
  const routeEnd = roadmap.route.getPoint(1);
  const connectorCurve = new THREE.CatmullRomCurve3([
    routeEnd, routeEnd.clone().add(new THREE.Vector3(-.5, 1, -3)),
    new THREE.Vector3(1.2, 14.5, -78),
    center.clone().add(geo([41.30, 69.27], .35))
  ]);
  const connectorPoints = connectorCurve.getPoints(96);
  const connector = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(connectorPoints),
    new THREE.LineBasicMaterial({ color: gold, transparent: true, opacity: 0, depthWrite: false })
  );
  connector.frustumCulled = false;
  scene.add(connector);
  const connectorLight = new THREE.Mesh(
    new THREE.SphereGeometry(.07, 9, 7),
    new THREE.MeshBasicMaterial({ color: 0xffdb9e, transparent: true, opacity: 0, depthWrite: false })
  );
  scene.add(connectorLight);

  const alexCurve = arc([41.30, 69.27], [60.17, 24.94]);
  const alexLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(alexCurve),
    new THREE.LineBasicMaterial({ color: gold, transparent: true, opacity: 0, depthWrite: false })
  );
  root.add(alexLine);

  const routeRecords = STUDENT_STORIES.map((story, index) => {
    const points = arc(story.originCoordinates, story.destinationCoordinates);
    const material = new THREE.LineBasicMaterial({ color: index === 0 ? 0xe0c897 : teal, transparent: true, opacity: 0, depthWrite: false });
    const path = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material);
    path.frustumCulled = false; root.add(path);
    const origin = new THREE.Mesh(new THREE.SphereGeometry(.055, 8, 6), new THREE.MeshBasicMaterial({ color: 0x91a49b, transparent: true, opacity: 0 }));
    origin.position.copy(geo(story.originCoordinates, .08)); root.add(origin);
    const destination = new THREE.Mesh(new THREE.SphereGeometry(.105, 12, 9), new THREE.MeshBasicMaterial({ color: gold, transparent: true, opacity: 0 }));
    destination.position.copy(geo(story.destinationCoordinates, .11)); root.add(destination);
    const halo = new THREE.Mesh(new THREE.RingGeometry(.18, .195, 32), new THREE.MeshBasicMaterial({ color: gold, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }));
    halo.position.copy(destination.position); root.add(halo);
    const traveler = new THREE.Mesh(new THREE.SphereGeometry(.08, 9, 7), new THREE.MeshBasicMaterial({ color: 0xffe0a7, transparent: true, opacity: 0, depthWrite: false }));
    root.add(traveler);
    return { story, path, points, origin, destination, halo, traveler };
  });

  // One draw call holds the smaller, non-interactive demonstration journeys.
  const ambientPositions = [];
  AMBIENT_JOURNEYS.forEach(([from, to]) => {
    const points = arc(from, to, 32);
    for (let i = 0; i < points.length - 1; i++) {
      ambientPositions.push(...points[i].toArray(), ...points[i + 1].toArray());
    }
  });
  const ambientRoutes = new THREE.LineSegments(
    new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(ambientPositions, 3)),
    new THREE.LineBasicMaterial({ color: 0x9eb8a7, transparent: true, opacity: 0, depthWrite: false })
  );
  ambientRoutes.frustumCulled = false; root.add(ambientRoutes);
  const ambientDots = new THREE.InstancedMesh(
    new THREE.SphereGeometry(.06, 7, 5),
    new THREE.MeshBasicMaterial({ color: gold, transparent: true, opacity: 0, depthWrite: false }),
    AMBIENT_JOURNEYS.length
  );
  const dotPlacement = new THREE.Object3D();
  AMBIENT_JOURNEYS.forEach(([, destination], index) => {
    dotPlacement.position.copy(geo(destination, .12));
    dotPlacement.updateMatrix(); ambientDots.setMatrixAt(index, dotPlacement.matrix);
  });
  ambientDots.instanceMatrix.needsUpdate = true;
  root.add(ambientDots);

  const unfinishedPoints = [
    new THREE.Vector3(-2.8, 10.5, -79),
    new THREE.Vector3(-2.2, 11.4, -75),
    new THREE.Vector3(-1.2, 12.5, -72),
    new THREE.Vector3(-.4, 13.2, -69)
  ];
  const unfinishedCurve = new THREE.CatmullRomCurve3(unfinishedPoints);
  const unfinishedSamples = unfinishedCurve.getPoints(80);
  const unfinished = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(unfinishedSamples),
    new THREE.LineBasicMaterial({ color: 0xe6c893, transparent: true, opacity: 0, depthWrite: false })
  );
  unfinished.frustumCulled = false; scene.add(unfinished);
  const unfinishedStart = new THREE.Mesh(new THREE.SphereGeometry(.07, 9, 7), new THREE.MeshBasicMaterial({ color: 0xe6c893, transparent: true, opacity: 0 }));
  unfinishedStart.position.copy(unfinishedPoints[0]); scene.add(unfinishedStart);
  const unfinishedEnd = new THREE.Mesh(new THREE.SphereGeometry(.085, 9, 7), new THREE.MeshBasicMaterial({ color: 0xffe1a8, transparent: true, opacity: 0, depthWrite: false }));
  scene.add(unfinishedEnd);

  const sceneElement = document.querySelector('#scene-five');
  const one = document.querySelector('#stories-one');
  const many = document.querySelector('#stories-many');
  const explore = document.querySelector('#stories-explore');
  const storyText = document.querySelector('#stories-story');
  const trustSecond = document.querySelector('#stories-trust-second');
  const unfinishedText = document.querySelector('#stories-unfinished');
  const question = document.querySelector('#stories-question');
  const start = document.querySelector('#stories-start-hint');
  const networkTitle = document.querySelector('#stories-network-title');
  const hotspots = document.querySelector('#stories-hotspots');
  const storyFields = {
    index: document.querySelector('#stories-index'),
    name: document.querySelector('#stories-name'),
    route: document.querySelector('#stories-route'),
    program: document.querySelector('#stories-program'),
    university: document.querySelector('#stories-university'),
    scholarship: document.querySelector('#stories-scholarship'),
    result: document.querySelector('#stories-result'),
    portrait: document.querySelector('#stories-portrait'),
    source: document.querySelector('#stories-source')
  };

  let progress = 0, hoverIndex = -1, selectedIndex = -1, selectedAt = 0, renderedIndex = -1;
  const buttons = routeRecords.map(({ story }, index) => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'scene-five__hotspot';
    button.textContent = story.destination.toUpperCase();
    button.setAttribute('aria-label', `Explore ${story.name}'s published journey to ${story.destination}`);
    button.hidden = true; button.tabIndex = -1;
    button.addEventListener('pointerenter', () => { hoverIndex = index; });
    button.addEventListener('pointerleave', () => { if (hoverIndex === index) hoverIndex = -1; });
    button.addEventListener('focus', () => { hoverIndex = index; });
    button.addEventListener('blur', () => { if (hoverIndex === index) hoverIndex = -1; });
    button.addEventListener('click', event => {
      event.stopPropagation(); selectedIndex = index; selectedAt = progress;
    });
    hotspots.append(button);
    return button;
  });

  function renderStory(index) {
    if (index === renderedIndex || index < 0) return;
    const story = STUDENT_STORIES[index];
    storyFields.index.textContent = `${String(index + 1).padStart(2, '0')} / ${String(STUDENT_STORIES.length).padStart(2, '0')}`;
    storyFields.name.textContent = story.name.toUpperCase();
    storyFields.route.textContent = `${t(story.origin.toUpperCase())}  →  ${t(story.destination.toUpperCase())}, ${t(story.destinationCountry.toUpperCase())}`;
    storyFields.program.textContent = t(story.program);
    storyFields.university.textContent = t(story.university);
    storyFields.scholarship.textContent = t(story.scholarship);
    storyFields.result.textContent = t(story.result.toUpperCase());
    storyFields.portrait.src = story.portrait;
    storyFields.portrait.alt = t(story.imageAlt);
    storyFields.source.href = story.source;
    renderedIndex = index;
  }

  function update(p, time, camera, mobile, reduced, pointer, nextProgress = 0) {
    progress = p;
    const visible = p > .001;
    const handoff = 1 - smooth(0, .04, nextProgress);
    root.visible = visible && handoff > .005;
    connector.visible = connectorLight.visible = visible && handoff > .005;
    unfinished.visible = unfinishedStart.visible = unfinishedEnd.visible = visible && handoff > .005;
    sceneElement.setAttribute('aria-hidden', String(!visible));
    sceneElement.style.setProperty('--warmth', String(smooth(.035, .24, p) * .75));
    if (!visible) {
      sceneElement.style.opacity = '0';
      buttons.forEach(button => { button.hidden = true; button.tabIndex = -1; });
      return;
    }
    sceneElement.style.opacity = String(handoff);
    if (selectedIndex >= 0 && Math.abs(p - selectedAt) > .025) selectedIndex = -1;

    const entryPosition = camera.position.clone();
    const entryTarget = roadmap.route.getPoint(.965).add(new THREE.Vector3(0, 0, -4));
    const mobileOffset = mobile ? 3.5 : 0;
    const positions = [
      [0, entryPosition], [.10, new THREE.Vector3(4.2, 17.2, -68 + mobileOffset)],
      [.22, new THREE.Vector3(2.5, 18, -68 + mobileOffset)],
      [.34, new THREE.Vector3(4.2, 17, -73 + mobileOffset)],
      [.46, new THREE.Vector3(6, 15.5, -73 + mobileOffset)],
      [.58, new THREE.Vector3(3, 14, -74 + mobileOffset)],
      [.70, new THREE.Vector3(1.2, 19, -63 + mobileOffset)],
      [.82, new THREE.Vector3(1, 19, -65 + mobileOffset)],
      [.91, new THREE.Vector3(0, 17, -62 + mobileOffset)],
      [1, new THREE.Vector3(0, 16, -61 + mobileOffset)]
    ];
    const targets = [
      [0, entryTarget], [.10, new THREE.Vector3(1.7, 13.2, -76)],
      [.22, center.clone()], [.34, center.clone().add(new THREE.Vector3(1.8, .8, 0))],
      [.46, center.clone().add(new THREE.Vector3(1, 0, 0))],
      [.58, center.clone().add(new THREE.Vector3(.5, -.2, 0))],
      [.70, center.clone()], [.82, center.clone()],
      [.91, new THREE.Vector3(-.7, 13, -78)], [1, new THREE.Vector3(-.6, 13, -75)]
    ];
    camera.position.copy(cameraAt(positions, p));
    camera.up.set(0, 1, 0);
    camera.lookAt(cameraAt(targets, p));

    const depart = smooth(.025, .17, p);
    const currentPassportPosition = chaos.student.position.clone();
    const passportForward = routeEnd.clone().add(new THREE.Vector3(-.5, 1.8, -8));
    chaos.student.position.copy(currentPassportPosition.lerp(passportForward, depart));
    chaos.student.scale.multiplyScalar(1 - .73 * depart);
    chaos.student.rotation.y += .18 * depart;
    const leavePassport = smooth(.17, .33, p);
    chaos.student.visible = leavePassport < .98 || (p > .84 && p < .96);
    if (p > .84) {
      const returnBeat = smooth(.84, .885, p) * (1 - smooth(.925, .96, p));
      chaos.student.position.set(1.8, 13.2, -73);
      chaos.student.scale.setScalar((mobile ? .17 : .24) * returnBeat);
      chaos.student.rotation.y = -.18;
    }

    const drawConnector = smooth(.025, .16, p);
    connector.material.opacity = .72 * drawConnector * (1 - smooth(.31, .49, p));
    connector.geometry.setDrawRange(0, Math.max(2, Math.floor(connectorPoints.length * drawConnector)));
    connectorLight.position.copy(connectorCurve.getPoint(drawConnector));
    connectorLight.material.opacity = reduced ? 0 : .95 * smooth(.035, .07, p) * (1 - smooth(.18, .28, p));
    alexLine.material.opacity = .72 * smooth(.10, .20, p) * (1 - smooth(.62, .72, p));
    alexLine.geometry.setDrawRange(0, Math.floor(alexCurve.length * smooth(.10, .23, p)));

    const globeReveal = smooth(.14, .29, p);
    const recede = smooth(.83, .98, p);
    sphere.material.opacity = .31 * globeReveal * (1 - recede * .45);
    atmosphere.material.opacity = .11 * globeReveal * (1 - recede * .6);
    root.rotation.x = .24;
    root.rotation.y = -.42 + (reduced ? 0 : .045 * smooth(.65, .82, p) * Math.sin(time * .22));

    const storyWindows = [[.30, .455], [.455, .635]];
    const timedIndex = storyWindows.findIndex(([a, b]) => p >= a && p < b);
    const activeIndex = selectedIndex >= 0 ? selectedIndex : timedIndex;
    const manual = selectedIndex >= 0;
    const storyOpacity = manual
      ? smooth(.24, .29, p) * (1 - smooth(.75, .80, p))
      : timedIndex < 0 ? 0 : smooth(storyWindows[timedIndex][0], storyWindows[timedIndex][0] + .022, p)
        * (1 - smooth(storyWindows[timedIndex][1] - .022, storyWindows[timedIndex][1], p));
    if (activeIndex >= 0) renderStory(activeIndex);
    setOpacity(storyText, storyOpacity);
    storyText.style.transform = `translateY(${(1 - storyOpacity) * 18}px)`;
    storyText.classList.toggle('is-alternate', activeIndex === 1);

    routeRecords.forEach((record, i) => {
      const reveal = smooth(.195 + i * .026, .30 + i * .02, p);
      const active = activeIndex === i && storyOpacity > .02;
      const hovered = hoverIndex === i && p > .24 && p < .77;
      const opacity = reveal * (active ? .98 : hovered ? .86 : .12) * (1 - recede * .37);
      record.path.material.opacity = opacity;
      record.path.geometry.setDrawRange(0, Math.max(2, Math.floor(record.points.length * reveal)));
      record.origin.material.opacity = reveal * (active ? .9 : .28);
      record.destination.material.opacity = reveal * (active ? 1 : .65) * (1 - recede * .3);
      record.destination.scale.setScalar(1 + (active && !reduced ? .12 * Math.sin(time * 2.1) : 0));
      record.halo.material.opacity = reveal * (active ? .75 : hovered ? .55 : .18) * (1 - recede * .3);
      record.halo.quaternion.copy(camera.quaternion);
      record.traveler.visible = active && !reduced;
      if (record.traveler.visible) {
        const [a, b] = storyWindows[i];
        const travel = manual ? (time * .19) % 1 : smooth(a, a + .075, p);
        record.traveler.position.copy(record.points[Math.min(record.points.length - 1, Math.floor(travel * (record.points.length - 1)))]);
        record.traveler.material.opacity = storyOpacity;
      }
    });
    const backgroundCount = mobile ? 0 : 2;
    ambientRoutes.geometry.setDrawRange(0, Math.floor(backgroundCount * 64 * smooth(.24, .68, p)) * 2);
    ambientRoutes.material.opacity = .10 * smooth(.25, .66, p) * (1 - recede * .62) * (activeIndex >= 0 ? .38 : 1);
    ambientDots.count = Math.floor(backgroundCount * smooth(.24, .68, p));
    ambientDots.material.opacity = .56 * smooth(.28, .67, p) * (1 - recede * .5) * (activeIndex >= 0 ? .5 : 1);

    const pathShow = smooth(.83, .9, p);
    unfinished.material.opacity = .86 * pathShow;
    unfinished.geometry.setDrawRange(0, Math.floor(unfinishedSamples.length * smooth(.84, .93, p)));
    unfinishedStart.material.opacity = .7 * pathShow;
    const cursorPull = mobile || reduced ? 0 : clamp(pointer.x, -1, 1) * .2;
    unfinishedEnd.position.copy(unfinishedSamples[Math.max(0, unfinished.geometry.drawRange.count - 1)]);
    unfinishedEnd.position.x += cursorPull * pathShow;
    unfinishedEnd.material.opacity = pathShow * (.72 + (reduced ? 0 : .22 * Math.sin(time * 2.2)));

    setOpacity(one, smooth(.135, .165, p) * (1 - smooth(.205, .235, p)));
    setOpacity(many, smooth(.215, .25, p) * (1 - smooth(.28, .315, p)));
    setOpacity(explore, smooth(.245, .28, p) * (1 - smooth(.625, .68, p)) * (storyOpacity > .1 ? .28 : 1));
    const networkShow = smooth(.645, .685, p) * (1 - smooth(.755, .805, p));
    setOpacity(networkTitle, networkShow);
    setOpacity(trustSecond, smooth(.815, .84, p) * (1 - smooth(.855, .875, p)));
    setOpacity(unfinishedText, smooth(.885, .91, p) * (1 - smooth(.923, .95, p)));
    setOpacity(question, smooth(.968, .992, p));
    setOpacity(start, smooth(.982, 1, p));

    buttons.forEach((button, i) => {
      const marker = routeRecords[i].destination;
      const point = marker.getWorldPosition(new THREE.Vector3()).project(camera);
      const onScreen = point.z < 1 && point.x > -.9 && point.x < .9 && point.y > -.85 && point.y < .85;
      const enabled = nextProgress < .001 && p > .25 && p < .77 && onScreen;
      button.hidden = !enabled; button.tabIndex = enabled ? 0 : -1;
      if (enabled) {
        button.style.left = `${(point.x + 1) * innerWidth / 2}px`;
        button.style.top = `${(1 - point.y) * innerHeight / 2}px`;
        button.classList.toggle('is-active', activeIndex === i || hoverIndex === i);
      }
    });
  }

  function pointerMove(x, y, camera, mobile) {
    if (mobile || progress < .25 || progress > .77 || selectedIndex >= 0) return;
    let nearest = -1, distance = 16;
    routeRecords.forEach((record, i) => {
      for (let j = 8; j < record.points.length - 4; j += 5) {
        const point = root.localToWorld(record.points[j].clone()).project(camera);
        if (point.z > 1) continue;
        const d = Math.hypot((point.x + 1) * innerWidth / 2 - x, (1 - point.y) * innerHeight / 2 - y);
        if (d < distance) { distance = d; nearest = i; }
      }
    });
    hoverIndex = nearest;
    document.querySelector('#experience').style.cursor = nearest >= 0 ? 'pointer' : '';
  }

  function pointerDown(event) {
    if (progress < .25 || progress > .8) return;
    if (event.target.closest('.scene-five__hotspot')) return;
    if (hoverIndex >= 0 && event.pointerType !== 'touch') { selectedIndex = hoverIndex; selectedAt = progress; }
    else selectedIndex = -1;
  }

  return { update, pointerMove, pointerDown };
}
