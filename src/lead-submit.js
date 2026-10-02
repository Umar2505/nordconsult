const inbox = (import.meta.env.VITE_LEAD_INBOX || '').trim();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const leadDeliveryReady = emailPattern.test(inbox);

export async function submitLead(lead, honeypot = '') {
  if (!leadDeliveryReady) throw new Error('delivery_not_configured');
  if (honeypot) throw new Error('spam_rejected');
  const name = String(lead.name || '').trim();
  const contact = String(lead.contact || '').trim();
  if (name.length < 2 || name.length > 120 || contact.length < 3 || contact.length > 254) {
    throw new Error('invalid_contact');
  }
  if (lead.contactMethod === 'Email' && !emailPattern.test(contact)) throw new Error('invalid_email');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(inbox)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        _subject: 'Nord Consult — new study enquiry',
        _honey: honeypot,
        _url: `${window.location.origin}${window.location.pathname}`,
        name,
        preferred_contact: lead.contactMethod,
        contact,
        email: lead.contactMethod === 'Email' ? contact : undefined,
        study_level: lead.studyLevel || '',
        field: lead.field || '',
        region: lead.region || '',
        country: lead.country || '',
        priority: lead.priority || '',
        annual_budget: lead.budget || '',
        message: String(lead.message || '').slice(0, 3000),
        source: lead.source,
        language: document.documentElement.lang,
        sent_at: new Date().toISOString()
      }),
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`delivery_http_${response.status}`);
    const result = await response.json();
    if (result.success !== true && result.success !== 'true') throw new Error('delivery_rejected');
    return result;
  } finally {
    clearTimeout(timeout);
  }
}
