'use strict';
// Admin panel API: login, content management (products, projects, clients, partners),
// inquiry management, uploads, stats, backup. No third-party packages needed.
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const express = require('express');

module.exports = function mountAdmin(app, ctx) {
  const { store, render, status } = ctx;
  const DATA = store.dataDir, CFG = path.join(DATA, 'admin.json');
  const STATUSES = ['new', 'contacted', 'quoted', 'won', 'lost'];
  const PCATS = Object.keys(render.PCATS), CATS = Object.keys(render.CATS);

  // ---------- auth ----------
  let secret = process.env.SESSION_SECRET;
  if (!secret) {
    const sf = path.join(DATA, 'session.secret');
    try { secret = fs.readFileSync(sf, 'utf8').trim(); } catch (e) {}
    if (!secret) { secret = crypto.randomBytes(32).toString('hex'); fs.writeFileSync(sf, secret, { mode: 0o600 }); }
  }
  const sign = p => crypto.createHmac('sha256', secret).update(p).digest('hex');
  const safeEq = (a, b) => { const x = crypto.createHash('sha256').update(String(a)).digest(), y = crypto.createHash('sha256').update(String(b)).digest(); return crypto.timingSafeEqual(x, y); };
  const readCfg = () => { try { return JSON.parse(fs.readFileSync(CFG, 'utf8')); } catch (e) { return null; } };
  const hashPw = (pw, salt) => crypto.scryptSync(pw, salt, 64).toString('hex');
  function checkLogin(user, pw) {
    const cfg = readCfg();
    if (cfg) return safeEq(user.toLowerCase(), cfg.user.toLowerCase()) & safeEq(hashPw(pw, cfg.salt), cfg.hash) ? cfg.user : null;
    if (!process.env.ADMIN_PASSWORD) return undefined; // not configured
    const u = process.env.ADMIN_USER || 'admin';
    return (safeEq(user.toLowerCase(), u.toLowerCase()) & safeEq(pw, process.env.ADMIN_PASSWORD)) ? u : null;
  }
  const cookies = req => Object.fromEntries((req.headers.cookie || '').split(';').map(c => c.trim().split(/=(.*)/s).slice(0, 2)).filter(a => a[0]));
  function session(req) {
    const t = cookies(req).agf_admin; if (!t) return null;
    const [exp, user, sig] = decodeURIComponent(t).split('|');
    if (!sig || Number(exp) < Date.now() || !safeEq(sig, sign(exp + '|' + user))) return null;
    return user;
  }
  const attempts = new Map();
  const throttled = ip => { const now = Date.now(), a = (attempts.get(ip) || []).filter(t => now - t < 15 * 60e3); attempts.set(ip, a); return a.length >= 8; };

  const api = express.Router();
  api.use(express.json({ limit: '200kb' }));
  api.use((req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });

  api.post('/login', (req, res) => {
    if (throttled(req.ip)) return res.status(429).json({ error: 'Too many attempts. Try again in 15 minutes.' });
    const { username = '', password = '' } = req.body || {};
    const user = checkLogin(String(username), String(password));
    if (user === undefined) return res.status(503).json({ error: 'Admin login is not set up. Add ADMIN_PASSWORD to the server .env file and restart.' });
    if (!user) { attempts.get(req.ip).push(Date.now()); return res.status(401).json({ error: 'Wrong username or password.' }); }
    attempts.delete(req.ip);
    const exp = Date.now() + 12 * 3600e3;
    res.cookie("agf_admin", `${exp}|${user}|${sign(exp + "|" + user)}`, { httpOnly: true, sameSite: 'strict', secure: req.secure, maxAge: 12 * 3600e3, path: '/admin' });
    res.json({ ok: true, user });
  });
  api.post('/logout', (req, res) => { res.clearCookie('agf_admin', { path: '/admin' }); res.json({ ok: true }); });

  // everything below needs a session; writes also need the X-Admin header (blocks cross-site requests)
  api.use((req, res, next) => {
    const user = session(req);
    if (!user) return res.status(401).json({ error: 'Please sign in again.' });
    if (req.method !== 'GET' && req.get('X-Admin') !== '1') return res.status(403).json({ error: 'Blocked.' });
    req.admin = user; next();
  });
  api.get('/me', (req, res) => res.json({ user: req.admin }));

  // ---------- helpers ----------
  const str = (v, max) => String(v == null ? '' : v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
  const bool = v => v === true || v === 'true';
  const imgOk = p => typeof p === 'string' && /^(images|uploads)\/[A-Za-z0-9_\-./]+$/.test(p) && !p.includes('..');
  const bi = (o, max) => ({ en: str(o && o.en, max), bn: str(o && o.bn, max) });
  const tagList = a => (Array.isArray(a) ? a : []).map(t => str(t, 40)).filter(Boolean).slice(0, 8);
  const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50) || 'item';
  const allImages = () => ['products', 'projects', 'partners', 'clients'].flatMap(n => store.get(n).map(x => x.image));
  function dropFile(p) { // delete an uploaded image once nothing uses it
    if (!p || !p.startsWith('uploads/') || allImages().includes(p)) return;
    fs.unlink(path.join(DATA, p), () => {});
  }

  const COLL = {
    products(b, old) {
      const title = bi(b.title, 120); if (!title.en) throw 'Product name (English) is required.';
      if (!CATS.includes(b.cat)) throw 'Choose a category.';
      if (!imgOk(b.image)) throw 'Please upload a product image.';
      return { cat: b.cat, image: b.image, title, tag: bi(b.tag, 120), short: bi(b.short, 300), detail: bi(b.detail, 2000),
        tags: { en: tagList(b.tags && b.tags.en), bn: tagList(b.tags && b.tags.bn) },
        featured: bool(b.featured), onHome: bool(b.onHome), published: b.published !== false && b.published !== 'false' };
    },
    projects(b) {
      const title = bi(b.title, 120); if (!title.en) throw 'Project title (English) is required.';
      if (!PCATS.includes(b.cat)) throw 'Choose a category.';
      if (!imgOk(b.image)) throw 'Please upload a project photo.';
      return { cat: b.cat, image: b.image, title, onHome: bool(b.onHome), published: b.published !== false && b.published !== 'false' };
    },
    partners(b) { const name = str(b.name, 80); if (!name) throw 'Name is required.'; if (!imgOk(b.image)) throw 'Please upload a logo.'; return { name, image: b.image }; },
    clients(b) { const name = str(b.name, 80); if (!name) throw 'Name is required.'; if (!imgOk(b.image)) throw 'Please upload a logo.'; return { name, image: b.image }; },
  };
  const sorted = n => store.get(n).slice().sort((a, b) => (a.order || 0) - (b.order || 0));

  // ---------- generic CRUD for the 4 content collections ----------
  Object.keys(COLL).forEach(name => {
    api.get('/' + name, (req, res) => res.json(sorted(name)));
    api.post('/' + name, (req, res) => {
      try {
        const list = store.get(name), data = COLL[name](req.body || {});
        let id = slug(data.title ? data.title.en : data.name), n = 2; const base = id;
        while (list.some(x => x.id === id)) id = base + '-' + n++;
        const item = { id, order: Math.max(0, ...list.map(x => x.order || 0)) + 1, ...data };
        store.set(name, [...list, item]); res.json(item);
      } catch (e) { res.status(400).json({ error: typeof e === 'string' ? e : 'Invalid data.' }); }
    });
    api.put('/' + name + '/:id', (req, res) => {
      const list = store.get(name), i = list.findIndex(x => x.id === req.params.id);
      if (i < 0) return res.status(404).json({ error: 'Not found.' });
      try {
        const old = list[i], item = { ...old, ...COLL[name](req.body || {}), id: old.id, order: old.order };
        const next = list.slice(); next[i] = item; store.set(name, next);
        if (old.image !== item.image) dropFile(old.image);
        res.json(item);
      } catch (e) { res.status(400).json({ error: typeof e === 'string' ? e : 'Invalid data.' }); }
    });
    api.delete('/' + name + '/:id', (req, res) => {
      const list = store.get(name), old = list.find(x => x.id === req.params.id);
      if (!old) return res.status(404).json({ error: 'Not found.' });
      store.set(name, list.filter(x => x !== old)); dropFile(old.image); res.json({ ok: true });
    });
    api.post('/' + name + '/reorder', (req, res) => {
      const ids = Array.isArray(req.body && req.body.ids) ? req.body.ids : [];
      const list = store.get(name).map(x => ({ ...x, order: ids.indexOf(x.id) < 0 ? 9999 : ids.indexOf(x.id) + 1 }));
      store.set(name, list); res.json({ ok: true });
    });
  });

  // ---------- image upload (raw binary body, validated by file signature) ----------
  api.post('/upload', express.raw({ type: ['image/jpeg', 'image/png', 'image/webp'], limit: '8mb' }), (req, res) => {
    const b = req.body;
    if (!Buffer.isBuffer(b) || b.length < 100) return res.status(400).json({ error: 'No image received.' });
    let ext = null;
    if (b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF) ext = 'jpg';
    else if (b.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]))) ext = 'png';
    else if (b.slice(0, 4).toString() === 'RIFF' && b.slice(8, 12).toString() === 'WEBP') ext = 'webp';
    if (!ext) return res.status(400).json({ error: 'Only JPG, PNG or WebP images are allowed.' });
    const name = `${Date.now().toString(36)}-${crypto.randomBytes(5).toString('hex')}.${ext}`;
    fs.writeFile(path.join(store.uploadDir, name), b, err => err ? res.status(500).json({ error: 'Could not save the image.' }) : res.json({ path: 'uploads/' + name }));
  });

  // ---------- inquiries ----------
  const inq = () => store.get('inquiries');
  api.get('/inquiries', (req, res) => res.json(inq().slice().sort((a, b) => String(b.receivedAt).localeCompare(String(a.receivedAt)))));
  api.patch('/inquiries/:ref', (req, res) => {
    const list = inq(), i = list.findIndex(x => x.ref === req.params.ref);
    if (i < 0) return res.status(404).json({ error: 'Not found.' });
    const b = req.body || {}, next = list.slice(), r = { ...list[i] };
    if (b.status !== undefined) { if (!STATUSES.includes(b.status)) return res.status(400).json({ error: 'Bad status.' }); r.status = b.status; }
    if (b.notes !== undefined) r.notes = str(b.notes, 2000);
    next[i] = r; store.set('inquiries', next); res.json(r);
  });
  api.delete('/inquiries/:ref', (req, res) => {
    const list = inq(); if (!list.some(x => x.ref === req.params.ref)) return res.status(404).json({ error: 'Not found.' });
    store.set('inquiries', list.filter(x => x.ref !== req.params.ref)); res.json({ ok: true });
  });
  api.get('/inquiries.csv', (req, res) => {
    const cols = ['ref', 'receivedAt', 'status', 'name', 'phone', 'email', 'service', 'product', 'location', 'message', 'notes', 'lang'];
    const cell = v => { v = String(v == null ? '' : v); if (/^[=+\-@\t\r]/.test(v)) v = "'" + v; return '"' + v.replace(/"/g, '""') + '"'; };
    const rows = inq().slice().sort((a, b) => String(b.receivedAt).localeCompare(String(a.receivedAt)));
    res.set({ 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="ag-facade-inquiries.csv"' });
    res.send('\ufeff' + [cols.join(',')].concat(rows.map(r => cols.map(c => cell(r[c])).join(','))).join('\r\n'));
  });

  // ---------- dashboard ----------
  api.get('/stats', (req, res) => {
    const list = inq(), now = new Date(), days = [];
    for (let i = 13; i >= 0; i--) { const d = new Date(now); d.setDate(d.getDate() - i); days.push({ date: d.toISOString().slice(0, 10), count: 0 }); }
    list.forEach(r => { const d = days.find(x => x.date === String(r.receivedAt).slice(0, 10)); if (d) d.count++; });
    const by = k => list.reduce((m, r) => (m[r[k] || '-'] = (m[r[k] || '-'] || 0) + 1, m), {});
    const wk = list.filter(r => Date.now() - new Date(r.receivedAt) < 7 * 864e5).length;
    res.json({ inquiries: list.length, newInquiries: list.filter(r => r.status === 'new').length, thisWeek: wk,
      products: store.get('products').length, productsLive: store.get('products').filter(p => p.published !== false).length,
      projects: store.get('projects').length, partners: store.get('partners').length, clients: store.get('clients').length,
      days, byStatus: by('status'), byService: by('service'),
      recent: inq().slice().sort((a, b) => String(b.receivedAt).localeCompare(String(a.receivedAt))).slice(0, 6) });
  });

  // ---------- settings ----------
  api.get('/settings', (req, res) => res.json({ user: req.admin, whatsapp: status().whatsapp, email: status().email, notifyEmail: status().notifyEmail,
    siteUrl: ctx.siteUrl, dataDir: DATA, node: process.version, uptimeHours: Math.round(process.uptime() / 36) / 100 }));
  api.post('/password', (req, res) => {
    const { current = '', next = '' } = req.body || {};
    if (!checkLogin(req.admin, String(current))) return res.status(400).json({ error: 'Current password is wrong.' });
    if (String(next).length < 8) return res.status(400).json({ error: 'New password must be at least 8 characters.' });
    const salt = crypto.randomBytes(16).toString('hex');
    fs.writeFileSync(CFG, JSON.stringify({ user: req.admin, salt, hash: hashPw(String(next), salt) }), { mode: 0o600 });
    res.json({ ok: true });
  });
  api.get('/backup', (req, res) => {
    const out = { exportedAt: new Date().toISOString() };
    ['products', 'projects', 'partners', 'clients', 'inquiries'].forEach(n => out[n] = store.get(n));
    res.set({ 'Content-Type': 'application/json', 'Content-Disposition': `attachment; filename="ag-facade-backup-${new Date().toISOString().slice(0, 10)}.json"` });
    res.send(JSON.stringify(out, null, 1));
  });

  api.use((req, res) => res.status(404).json({ error: 'Not found.' }));

  app.use('/admin/api', api);
  // admin page + assets
  const UI = path.join(__dirname, '..', 'admin-ui');
  app.use('/admin', (req, res, next) => {
    res.set({ 'X-Frame-Options': 'DENY', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'same-origin', 'X-Robots-Tag': 'noindex, nofollow',
      'Cache-Control': 'no-cache',
      'Content-Security-Policy': "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'self'; frame-ancestors 'none'" });
    next();
  }, express.static(UI, { index: 'index.html' }));
};
