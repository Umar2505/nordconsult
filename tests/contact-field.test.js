import test from 'node:test';
import assert from 'node:assert/strict';
import { contactError, contactFieldConfig, UZBEK_PHONE_EXAMPLE } from '../src/contact-field.js';

test('both phone contact methods show the Uzbek example', () => {
  assert.equal(UZBEK_PHONE_EXAMPLE, '+998 90 123 45 67');
  for (const method of ['WhatsApp', 'Phone']) {
    assert.equal(contactFieldConfig(method).placeholder, UZBEK_PHONE_EXAMPLE);
    assert.equal(contactFieldConfig(method).type, 'tel');
  }
  assert.match(contactFieldConfig('Telegram').placeholder, /\+998/);
});

test('contact validation accepts real contact formats and rejects unrelated text', () => {
  assert.equal(contactError('WhatsApp', '+998 90 123 45 67'), '');
  assert.equal(contactError('Phone', '+44 (20) 7946 0958'), '');
  assert.equal(contactError('Telegram', '@sample_user'), '');
  assert.equal(contactError('Telegram', '+998 90 123 45 67'), '');
  assert.equal(contactError('Email', 'person@example.com'), '');
  assert.notEqual(contactError('Phone', 'call me later'), '');
  assert.notEqual(contactError('Phone', '123'), '');
  assert.notEqual(contactError('Telegram', '@bad'), '');
  assert.notEqual(contactError('Email', 'not-an-email'), '');
});
