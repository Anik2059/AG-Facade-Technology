'use strict';
// AG Facade Technology: serves the website and receives project inquiries.
const express = require('express');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// tiny .env loader (no extra dependency)
try {
  fs.readFileSync(path.join(__dirname, '.env'), 'utf8').split(/\r?\n/).forEach(l => {
    const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !l.trim().startsWith('#') && !(m[1] in process.env)) process.env[m[1]] = m[2];
  });
} catch (e) {}

const PORT = process.env.PORT || 3000;
const NOTIFY = process.env.NOTIFY_EMAIL || 'agfacadetechnology06.bd@gmail.com';
const SITE_DIR = path.join(__dirname, '..', 'website');
const DATA_DIR = path.join(__dirname, 'data');
const LOG = path.join(DATA_DIR, 'inquiries.jsonl');
fs.mkdirSync(DATA_DIR, { recursive: true });

const mailer = process.env.SMTP_USER && process.env.SMTP_PASS
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT || 465),
      secure: Number(process.env.SMTP_PORT || 465) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  : null;
if (!mailer) console.warn('[mail] SMTP not configured: inquiries will be saved to data/inquiries.jsonl only.');


// ---- WhatsApp alert (free, via CallMeBot) ---------------------------------
// Set WHATSAPP_PHONE and WHATSAPP_APIKEY in .env. For several people, separate
// with commas and keep the same order:  +8801711111111,+8801822222222  /  111111,222222
const WA_PHONES = (process.env.WHATSAPP_PHONE || '').split(',').map(x => x.replace(/[^\d+]/g, '')).filter(Boolean);
const WA_KEYS = (process.env.WHATSAPP_APIKEY || '').split(',').map(x => x.trim()).filter(Boolean);
const WA_URL = process.env.WHATSAPP_API_URL || 'https://api.callmebot.com/whatsapp.php';
if (!WA_PHONES.length || WA_PHONES.length !== WA_KEYS.length) console.warn('[whatsapp] Not configured: no WhatsApp alerts will be sent.');
function sendWhatsApp(d, ref) {
  if (!WA_PHONES.length || WA_PHONES.length !== WA_KEYS.length) return;
  const text = `*New website inquiry* ${ref}\n` +
    `Name: ${d.name}\nPhone: ${d.phone}\nEmail: ${d.email}\nService: ${d.service}\n` +
    (d.product ? `Product: ${d.product}\n` : '') + (d.location ? `Location: ${d.location}\n` : '') +
    `Message: ${d.message.slice(0, 500)}`;
  WA_PHONES.forEach((phone, i) => {
    const url = WA_URL + '?' + new URLSearchParams({ phone, text, apikey: WA_KEYS[i] }).toString();
    fetch(url, { signal: AbortSignal.timeout(20000) })
      .then(r => { if (!r.ok) console.error('[whatsapp] failed for', phone, 'HTTP', r.status); })
      .catch(e => console.error('[whatsapp] failed for', phone + ':', e.message));
  });
}

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clean = (v, max) => String(v == null ? '' : v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
const SERVICES = ['Windows / Doors', 'Curtain Walls', 'Kitchen / Interiors', 'Full Facade Project'];

// simple per-IP rate limit: 5 inquiries / 10 minutes
const hits = new Map();
function limited(ip) {
  const now = Date.now(), win = 10 * 60 * 1000;
  const arr = (hits.get(ip) || []).filter(t => now - t < win);
  arr.push(now); hits.set(ip, arr);
  return arr.length > 5;
}

const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: '20kb' }));

app.post('/api/inquiry', async (req, res) => {
  const b = req.body || {};
  if (b.website) return res.json({ ok: true, ref: 'AG-OK' }); // honeypot: pretend success to bots
  if (limited(req.ip)) return res.status(429).json({ ok: false, error: 'rate_limited' });

  const d = {
    name: clean(b.name, 100), email: clean(b.email, 150), phone: clean(b.phone, 25),
    service: SERVICES.includes(b.service) ? b.service : SERVICES[0],
    product: clean(b.product, 100), location: clean(b.location, 150),
    message: clean(b.message, 2000), lang: b.lang === 'bn' ? 'bn' : 'en',
  };
  const fields = [];
  if (d.name.length < 2) fields.push('name');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email)) fields.push('email');
  if (d.phone.replace(/\D/g, '').length < 7) fields.push('phone');
  if (d.message.length < 5) fields.push('message');
  if (fields.length) return res.status(400).json({ ok: false, fields });

  const now = new Date();
  const ref = 'AG-' + now.toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
  const record = { ref, receivedAt: now.toISOString(), ip: req.ip, ...d };

  try { fs.appendFileSync(LOG, JSON.stringify(record) + '\n'); }
  catch (e) { console.error('[save] failed', e); return res.status(500).json({ ok: false, error: 'save_failed' }); }

  if (mailer) {
    const rows = [['Reference', ref], ['Name', d.name], ['Email', d.email], ['Phone', d.phone], ['Service', d.service],
      ['Product', d.product || '-'], ['Location', d.location || '-'], ['Language', d.lang === 'bn' ? 'Bengali' : 'English'], ['Message', d.message]];
    const table = rows.map(([k, v]) => `<tr><td style="padding:6px 12px;font-weight:700;vertical-align:top">${k}</td><td style="padding:6px 12px;white-space:pre-wrap">${esc(v)}</td></tr>`).join('');
    // Mail failures never lose the inquiry (already saved above).
    mailer.sendMail({
      from: `"AG Facade Website" <${process.env.SMTP_USER}>`, to: NOTIFY, replyTo: `"${d.name.replace(/"/g, '')}" <${d.email}>`,
      subject: `New inquiry ${ref}: ${d.service} (${d.name})`, html: `<table style="font-family:Arial,sans-serif;font-size:14px">${table}</table>`,
    }).catch(e => console.error('[mail] notify failed:', e.message));
    const bn = d.lang === 'bn';
    mailer.sendMail({
      from: `"AG Facade Technology" <${process.env.SMTP_USER}>`, to: d.email,
      subject: bn ? `আপনার অনুসন্ধান পেয়েছি (${ref})` : `We received your inquiry (${ref})`,
      html: bn
        ? `<p>প্রিয় ${esc(d.name)},</p><p>এজি ফ্যাসাদ টেকনোলজিতে যোগাযোগের জন্য ধন্যবাদ। আপনার রেফারেন্স <b>${ref}</b>। আমাদের টিম শীঘ্রই আপনার সাথে যোগাযোগ করবে।</p><p>জরুরি প্রয়োজনে কল করুন: +880 01869-658629</p>`
        : `<p>Dear ${esc(d.name)},</p><p>Thank you for contacting AG Facade Technology. Your reference is <b>${ref}</b>. Our team will get back to you shortly.</p><p>For urgent matters, call +880 01869-658629.</p>`,
    }).catch(e => console.error('[mail] auto-reply failed:', e.message));
  }
  sendWhatsApp(d, ref); // never blocks or breaks the customer's response
  res.json({ ok: true, ref });
});

// Admin: view saved inquiries  ->  /admin/inquiries?key=YOUR_ADMIN_KEY
app.get('/admin/inquiries', (req, res) => {
  if (!process.env.ADMIN_KEY || req.query.key !== process.env.ADMIN_KEY) return res.status(401).send('Unauthorized');
  let rows = [];
  try { rows = fs.readFileSync(LOG, 'utf8').split('\n').filter(Boolean).map(JSON.parse).reverse(); } catch (e) {}
  res.send(`<meta charset="utf-8"><title>Inquiries</title><body style="font-family:Arial;padding:24px"><h2>Inquiries (${rows.length})</h2>` +
    `<table border="1" cellpadding="8" style="border-collapse:collapse;font-size:14px"><tr><th>Ref</th><th>Date</th><th>Name</th><th>Phone</th><th>Email</th><th>Service</th><th>Product</th><th>Location</th><th>Message</th></tr>` +
    rows.map(r => `<tr><td>${esc(r.ref)}</td><td>${esc(r.receivedAt.slice(0, 16).replace('T', ' '))}</td><td>${esc(r.name)}</td><td>${esc(r.phone)}</td><td>${esc(r.email)}</td><td>${esc(r.service)}</td><td>${esc(r.product)}</td><td>${esc(r.location)}</td><td>${esc(r.message)}</td></tr>`).join('') + '</table>');
});

app.use(express.static(SITE_DIR, { extensions: ['html'] }));
app.use((req, res) => res.status(404).sendFile(path.join(SITE_DIR, 'index.html')));
app.listen(PORT, () => console.log(`AG Facade site running at http://localhost:${PORT}`));
