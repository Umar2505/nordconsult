import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../src/lead-submit.js', import.meta.url), 'utf8');
const contactSource = await readFile(new URL('../src/contact-field.js', import.meta.url), 'utf8');
const moduleSource = source
  .replace("import { contactError } from './contact-field.js';", contactSource.replaceAll('export ', ''))
  .replace('import.meta.env.VITE_LEAD_INBOX', JSON.stringify('inbox@example.com'));
const { leadDeliveryReady, submitLead } = await import(`data:text/javascript,${encodeURIComponent(moduleSource)}`);

test('valid enquiry sends the selected contact method and profile', async () => {
  assert.equal(leadDeliveryReady, true);
  const originalFetch = globalThis.fetch;
  const originalDocument = globalThis.document;
  const originalWindow = globalThis.window;
  let request;
  globalThis.document = { documentElement: { lang: 'en' } };
  globalThis.window = { location: { origin: 'https://nordconsult.example', pathname: '/' } };
  globalThis.fetch = async (url, options) => {
    request = { url, options };
    return { ok: true, json: async () => ({ success: 'true' }) };
  };
  try {
    await submitLead({ name: 'Test Visitor', contactMethod: 'Email', contact: 'visitor@example.com', studyLevel: 'Masters', source: 'test' });
    assert.equal(request.url, 'https://formsubmit.co/ajax/inbox%40example.com');
    assert.equal(request.options.method, 'POST');
    const body = JSON.parse(request.options.body);
    assert.equal(body.name, 'Test Visitor');
    assert.equal(body.email, 'visitor@example.com');
    assert.equal(body.preferred_contact, 'Email');
    assert.equal(body.study_level, 'Masters');
    assert.equal(body.source, 'test');
    assert.equal(body._url, 'https://nordconsult.example/');
  } finally {
    globalThis.fetch = originalFetch;
    globalThis.document = originalDocument;
    globalThis.window = originalWindow;
  }
});

test('invalid and spam enquiries never reach delivery', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = () => { throw new Error('Unexpected delivery request'); };
  try {
    const lead = { name: 'Test Visitor', contactMethod: 'Email', contact: 'visitor@example.com' };
    await assert.rejects(submitLead(lead, 'filled-honeypot'), /spam_rejected/);
    await assert.rejects(submitLead({ ...lead, contact: 'bad-address' }), /invalid_email/);
    await assert.rejects(submitLead({ ...lead, name: 'A' }), /invalid_contact/);
    await assert.rejects(submitLead({ ...lead, contactMethod: 'Phone', contact: 'not a number' }), /invalid_contact/);
    await assert.rejects(submitLead({ ...lead, contactMethod: 'Telegram', contact: '@bad' }), /invalid_contact/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('rejected delivery does not report success', async () => {
  const originalFetch = globalThis.fetch;
  const originalDocument = globalThis.document;
  const originalWindow = globalThis.window;
  globalThis.document = { documentElement: { lang: 'en' } };
  globalThis.window = { location: { origin: 'https://nordconsult.example', pathname: '/' } };
  globalThis.fetch = async () => ({ ok: true, json: async () => ({ success: false }) });
  try {
    await assert.rejects(submitLead({ name: 'Test Visitor', contactMethod: 'Phone', contact: '+998 90 123 45 67' }), /delivery_rejected/);
  } finally {
    globalThis.fetch = originalFetch;
    globalThis.document = originalDocument;
    globalThis.window = originalWindow;
  }
});
