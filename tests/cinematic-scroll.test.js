import test from 'node:test';
import assert from 'node:assert/strict';
import { createCinematicScroll, CINEMATIC_STAGES } from '../src/cinematic-scroll.js';

function setup({ reduced = false, gate = true } = {}) {
  const win = new EventTarget(), doc = new EventTarget();
  win.scrollY = 0;
  win.scrollTo = (_, y) => { win.scrollY = y; };
  win.setTimeout = setTimeout;
  doc.documentElement = { classList: { toggle() {} } };
  let form = null;
  doc.querySelector = () => form;
  globalThis.window = win; globalThis.document = doc;
  globalThis.location = { hash: '', search: '' };
  globalThis.innerHeight = 800;
  const controller = createCinematicScroll({
    resolveOffset: stage => CINEMATIC_STAGES.indexOf(stage) * 1000,
    canAdvance: () => gate, reducedMotion: { matches: reduced }
  });
  const finish = () => controller.tick(performance.now() + 3000);
  const wheel = (deltaY, extra = {}) => {
    const event = new Event('wheel', { cancelable: true });
    Object.defineProperties(event, Object.fromEntries(Object.entries({ deltaY, deltaMode: 0, ctrlKey: false, ...extra }).map(([k,v]) => [k,{value:v}])));
    win.dispatchEvent(event); return event;
  };
  return { controller, finish, wheel, win, setForm: value => { form = value; } };
}

test('storyboard has unique, increasing stable stages across all nine chapters', () => {
  assert.equal(new Set(CINEMATIC_STAGES.map(s => s.id)).size, CINEMATIC_STAGES.length);
  assert.deepEqual([...new Set(CINEMATIC_STAGES.map(s => s.chapter))], [0,1,2,3,4,5,6,7,8]);
  CINEMATIC_STAGES.forEach((stage, i) => {
    if (i && stage.chapter === CINEMATIC_STAGES[i-1].chapter) assert.ok(stage.progress > CINEMATIC_STAGES[i-1].progress);
    assert.ok(stage.progress >= 0 && stage.progress <= 1);
  });
});
test('opening uses one flat-map stop followed by one complete globe transition', () => {
  assert.deepEqual(CINEMATIC_STAGES.slice(0, 5).map(stage => stage.id), [
    'decision-intro', 'passport-approach', 'passport-page', 'map-appears', 'globe-forms'
  ]);
  const ids = CINEMATIC_STAGES.filter(stage => stage.chapter === 1).map(stage => stage.id);
  assert.deepEqual(ids, ['map-appears', 'globe-forms']);
  const map = CINEMATIC_STAGES.find(stage => stage.id === 'map-appears');
  const globe = CINEMATIC_STAGES.find(stage => stage.id === 'globe-forms');
  assert.equal(map.progress, .40);
  assert.equal(globe.duration, 'cinematic');
});
test('capital photography follows the globe without a pins-only stop', () => {
  assert.deepEqual(CINEMATIC_STAGES.filter(stage => stage.chapter === 2).map(stage => stage.id), ['capital-constellation']);
});
test('roadmap stops hold each process visual while it is visible', () => {
  const progress = Object.fromEntries(CINEMATIC_STAGES.filter(stage => stage.chapter === 3).map(stage => [stage.id, stage.progress]));
  assert.ok(progress['roadmap-profile'] >= .105 && progress['roadmap-profile'] <= .17);
  assert.ok(progress['roadmap-destination'] >= .215 && progress['roadmap-destination'] <= .285);
  assert.ok(progress['roadmap-university'] >= .335 && progress['roadmap-university'] <= .395);
  assert.ok(progress['roadmap-documents'] >= .44 && progress['roadmap-documents'] <= .51);
  assert.ok(progress['roadmap-application'] >= .545 && progress['roadmap-application'] <= .61);
  assert.ok(progress['roadmap-acceptance'] >= .755 && progress['roadmap-acceptance'] <= .815);
  assert.ok(progress['roadmap-visa'] >= .845 && progress['roadmap-visa'] <= .905);
});
test('rapid input cannot skip or interrupt a camera stage', () => {
  const {controller:c,finish} = setup();
  c.request(1);
  for (let i=0;i<20;i++) c.request(i%2 ? -1 : 1);
  finish(); assert.equal(c.getStage().id,'passport-approach');
  c.request(-1);finish();assert.equal(c.getStage().id,'decision-intro');c.destroy();
});
test('a wheel momentum burst remains one step even after animation completion', () => {
  const {controller:c,finish,wheel} = setup();
  wheel(180); finish();
  for (let i=0;i<10;i++) wheel(120);
  finish();assert.equal(c.getStage().id,'passport-approach');
  wheel(-100);finish();assert.equal(c.getStage().id,'decision-intro');c.destroy();
});
test('profile gate blocks forward but permits reverse navigation', () => {
  const {controller:c,finish} = setup({gate:false});
  c.jumpTo('builder-questions');c.request(1);finish();assert.equal(c.getStage().id,'builder-questions');
  c.request(-1);finish();assert.equal(c.getStage().id,'builder-intro');c.destroy();
});
test('reduced motion resolves at the target with no partial pose', () => {
  const {controller:c,win} = setup({reduced:true});
  c.request(1);c.tick(performance.now());assert.equal(c.getStage().id,'passport-approach');assert.equal(win.scrollY,1000);c.destroy();
});
test('resize during transition settles the intended target', () => {
  const {controller:c,win} = setup();c.request(1);c.realign();
  assert.equal(c.getStage().id,'passport-approach');assert.equal(win.scrollY,1000);c.destroy();
});
test('open forms retain scroll ownership and block chapter changes', () => {
  const {controller:c,setForm,finish} = setup();setForm({contains:()=>true});
  assert.equal(c.request(1),false);finish();assert.equal(c.getStage().id,'decision-intro');c.destroy();
});
test('overflowing form regions and pinch zoom retain native input', () => {
  const {controller:c,wheel,finish} = setup();
  const region = {scrollHeight:1000,clientHeight:400};
  const event = wheel(400,{target:{closest:()=>region}});assert.equal(event.defaultPrevented,false);
  assert.equal(wheel(400,{ctrlKey:true}).defaultPrevented,false);finish();assert.equal(c.getStage().id,'decision-intro');c.destroy();
});
test('footer releases native scroll and can return to the cinematic ending', () => {
  const {controller:c,wheel,finish} = setup();c.jumpTo('final-closing');assert.equal(c.request(1),false);assert.equal(c.isNormalMode(),true);
  wheel(-100);finish();assert.equal(c.isNormalMode(),false);assert.equal(c.getStage().id,'first-conversation');
  c.enableNormalMode();c.jumpTo('first-conversation');assert.equal(c.isNormalMode(),false);c.destroy();
});
test('destroy removes event listeners', () => {
  const {controller:c,wheel,finish}=setup();c.destroy();wheel(200);finish();assert.equal(c.getStage().id,'decision-intro');
});
test('one touch swipe advances once; cancellation and multitouch do not advance', () => {
  const {controller:c,finish,win}=setup();
  const touch = (type, data) => { const e=new Event(type,{cancelable:true});Object.assign(e,data);win.dispatchEvent(e);return e; };
  touch('touchstart',{touches:[{clientY:500}]});touch('touchend',{changedTouches:[{clientY:250}]});finish();
  assert.equal(c.getStage().id,'passport-approach');
  touch('touchstart',{touches:[{clientY:500}]});touch('touchcancel',{});touch('touchend',{changedTouches:[{clientY:250}]});finish();
  assert.equal(c.getStage().id,'passport-approach');
  touch('touchstart',{touches:[{clientY:500},{clientY:550}]});touch('touchend',{changedTouches:[{clientY:250}]});finish();
  assert.equal(c.getStage().id,'passport-approach');c.destroy();
});
test('keyboard input inside a text field does not navigate the story', () => {
  const {controller:c,finish,win}=setup();const e=new Event('keydown',{cancelable:true});
  Object.defineProperties(e,{key:{value:'ArrowDown'},target:{value:{closest:()=>({})}}});win.dispatchEvent(e);finish();
  assert.equal(c.getStage().id,'decision-intro');assert.equal(e.defaultPrevented,false);c.destroy();
});
