(function () {
'use strict';
/* ============ helpers ============ */
class Raw { constructor(s) { this.s = s; } }
const raw = s => new Raw(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const part = v => v instanceof Raw ? v.s : Array.isArray(v) ? v.map(part).join('') : esc(v);
const h = (s, ...v) => new Raw(s.reduce((a, x, i) => a + x + (i < v.length ? part(v[i]) : ''), ''));
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const ICON = {
  dash: 'M3 12l9-8 9 8M5 10v10h5v-6h4v6h5V10', inbox: 'M4 13l2-8h12l2 8M4 13v6h16v-6M4 13h5l1 2h4l1-2h5',
  box: 'M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8M12 13v8', image: 'M4 5h16v14H4zM4 15l5-5 4 4 3-3 4 4M9 9.5h.01', users: 'M16 19v-1a4 4 0 00-4-4H7a4 4 0 00-4 4v1M9.5 10a3 3 0 100-6 3 3 0 000 6zM21 19v-1a4 4 0 00-3-3.9M16 4.2a3 3 0 010 5.6',
  cog: 'M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z',
  out: 'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9', plus: 'M12 5v14M5 12h14', search: 'M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3',
  edit: 'M12 20h9M16.5 3.5a2.1 2.1 0 113 3L7 19l-4 1 1-4z', trash: 'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6', up: 'M12 19V5M5 12l7-7 7 7', down: 'M12 5v14M19 12l-7 7-7-7',
  ext: 'M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5', dl: 'M12 4v12M6 11l6 6 6-6M4 20h16', phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2',
  mail: 'M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1zM3 7l9 6 9-6', chat: 'M21 12a8 8 0 01-11.7 7L3 21l2-5.5A8 8 0 1121 12z',
  check: 'M5 12l5 5 9-10', eyeoff: 'M3 3l18 18M10.6 10.6a3 3 0 004.2 4.2M9.9 5.1A10 10 0 0112 5c6 0 10 7 10 7a17 17 0 01-3.2 4M6.1 6.1A17 17 0 002 12s4 7 10 7a9.7 9.7 0 004-.9', x: 'M6 6l12 12M18 6L6 18', menu: 'M4 6h16M4 12h16M4 18h16', cloud: 'M7 18a5 5 0 110-10 6 6 0 0111.5 1.5A4 4 0 0118 18zM12 11v6M9 14l3-3 3 3', shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
  star: 'M12 3l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.2 20.9l1.1-6.5L2.6 9.8l6.5-.9z', eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 15a3 3 0 100-6 3 3 0 000 6z', clock: 'M12 7v5l3 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
};
const ic = (n, cls = '') => raw(`<svg class="i ${cls}" viewBox="0 0 24 24"><path d="${ICON[n]}"/></svg>`);
const ST = { new: 'New', contacted: 'Contacted', quoted: 'Quoted', won: 'Won', lost: 'Lost' };
const CATS = { thermal: 'Thermal Break Windows', windoor: 'Windows & Doors', structural: 'Structural Facade', interior: 'Interior Systems' };
const PCATS = { facade: 'Facade', curtain: 'Curtain Wall & Glazing', interior: 'Interior', install: 'On-site Installation' };
const fmt = iso => { const d = new Date(iso); return isNaN(d) ? '' : d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); };
const ago = iso => { const s = (Date.now() - new Date(iso)) / 1000; if (isNaN(s)) return ''; if (s < 60) return 'just now'; if (s < 3600) return Math.floor(s / 60) + ' min ago'; if (s < 86400) return Math.floor(s / 3600) + ' h ago'; if (s < 604800) return Math.floor(s / 86400) + ' d ago'; return fmt(iso).slice(0, 11); };
const waLink = p => { let d = String(p || '').replace(/\D/g, ''); if (d.startsWith('0')) d = '880' + d.slice(1); return 'https://wa.me/' + d; };
const homeSet = (list, n) => new Set(list.filter(p => p.published !== false && p.onHome).sort((x, y) => x.order - y.order).slice(-n).map(p => p.id));
const pwField = (id, ac) => h`<div class="pw"><input id="${id}" type="password" autocomplete="${ac}" required><button type="button" class="pw-eye" data-eye="${id}" aria-label="Show password" aria-pressed="false" title="Show password">${ic('eye')}</button></div>`;
document.addEventListener('mousedown', e => { if (e.target.closest('[data-eye]')) e.preventDefault(); });
document.addEventListener('click', e => {
  const b = e.target.closest('[data-eye]'); if (!b) return;
  const i = document.getElementById(b.dataset.eye), show = i.type === 'password';
  i.type = show ? 'text' : 'password'; b.innerHTML = ic(show ? 'eyeoff' : 'eye').s;
  b.setAttribute('aria-pressed', show); b.setAttribute('aria-label', show ? 'Hide password' : 'Show password'); b.title = show ? 'Hide password' : 'Show password';
});
const imgSrc = p => '/' + String(p || '').replace(/^\/+/, '');

function toast(msg, type = 'ok') {
  const t = document.createElement('div'); t.className = 'toast ' + type;
  t.innerHTML = (type === 'ok' ? ic('check') : ic('x')).s + '<span></span>'; $('span', t).textContent = msg;
  $('#toasts').appendChild(t); setTimeout(() => t.remove(), type === 'ok' ? 3200 : 5500);
}
async function api(method, url, body, headers = {}) {
  const opt = { method, headers: { 'X-Admin': '1', ...headers }, credentials: 'same-origin' };
  if (body !== undefined) { if (body instanceof Blob) opt.body = body; else { opt.body = JSON.stringify(body); opt.headers['Content-Type'] = 'application/json'; } }
  const r = await fetch('/admin/api' + url, opt); let j = {};
  try { j = await r.json(); } catch (e) {}
  if (r.status === 401 && url !== '/login' && url !== '/me') { S.user = null; renderLogin('Your session ended. Please sign in again.'); throw new Error('auth'); }
  if (!r.ok) throw new Error(j.error || 'Something went wrong.');
  return j;
}
const guard = fn => async (...a) => { try { return await fn(...a); } catch (e) { if (e.message !== 'auth') toast(e.message, 'err'); } };
function confirmBox(title, msg, ok = 'Delete') {
  return new Promise(res => {
    const ov = document.createElement('div'); ov.className = 'ov'; const m = document.createElement('div'); m.className = 'modal'; m.setAttribute('role', 'dialog');
    m.innerHTML = h`<h3>${title}</h3><p class="muted" style="margin:6px 0 22px">${msg}</p><div class="row" style="justify-content:flex-end"><button class="btn" data-v="0">Cancel</button><button class="btn danger" data-v="1">${ok}</button></div>`.s;
    document.body.append(ov, m); const done = v => { ov.remove(); m.remove(); res(v); };
    m.onclick = e => { const b = e.target.closest('[data-v]'); if (b) done(b.dataset.v === '1'); }; ov.onclick = () => done(false);
  });
}
function modal(html, onMount) {
  const ov = document.createElement('div'); ov.className = 'ov'; const m = document.createElement('div'); m.className = 'modal'; m.innerHTML = html.s;
  const close = () => { ov.remove(); m.remove(); }; ov.onclick = close; document.body.append(ov, m); onMount(m, close); return close;
}

/* ============ state + shell ============ */
const S = { user: null, stats: null, newSeen: null };
const app = $('#app');

function renderLogin(msg) {
  app.innerHTML = h`<div class="login"><div class="login-art">
    <div class="logo-chip"><img src="/images/logo/ag-logo.png" alt=""><b>AG Facade Technology</b></div>
    <div><h1>Run your whole website from one place.</h1><p>Manage products, projects and client logos, and follow every customer inquiry through to a won job.</p>
    <ul><li>${ic('box')} Add or edit products in English and Bangla</li><li>${ic('inbox')} Track every inquiry from new to won</li><li>${ic('shield')} Private, secure and session protected</li></ul></div>
    <small style="color:#88A2C6">© AG Facade Technology</small></div>
  <div class="login-form"><form id="lf" autocomplete="on"><h2>Welcome back</h2><p class="sub">Sign in to the admin panel.</p>
    ${msg ? h`<div class="err">${msg}</div>` : ''}
    <div class="field"><label for="u">Username</label><input id="u" type="text" autocomplete="username" required autofocus></div>
    <div class="field"><label for="p">Password</label>${pwField('p', 'current-password')}</div>
    <button class="btn primary" style="width:100%;padding:12px" id="lb">Sign in</button></form></div></div>`.s;
  $('#lf').onsubmit = async e => {
    e.preventDefault(); const b = $('#lb'); b.disabled = true; b.textContent = 'Signing in…';
    try { const j = await api('POST', '/login', { username: $('#u').value, password: $('#p').value }); S.user = j.user; boot(); }
    catch (x) { renderLogin(x.message); }
  };
}
const NAV = [['dashboard', 'Dashboard', 'dash'], ['inquiries', 'Inquiries', 'inbox'], ['products', 'Products', 'box'], ['projects', 'Projects', 'image'], ['clients', 'Clients & Partners', 'users'], ['settings', 'Settings', 'cog']];
function shell() {
  app.innerHTML = h`<div class="shell"><aside class="side" id="side"><div class="brand"><span class="chip"><img src="/images/logo/ag-logo.png" alt=""></span><b>AG Facade<small>Admin panel</small></b></div>
    <nav class="nav" id="nav"><div class="nav-label">Overview</div>${NAV.slice(0, 2).map(n => item(n))}<div class="nav-label">Website content</div>${NAV.slice(2, 5).map(n => item(n))}<div class="nav-label">System</div>${item(NAV[5])}</nav>
    <div class="foot"><a href="/" target="_blank" rel="noopener" style="color:#9CC4E4">View live website ↗</a></div></aside>
    <div class="main"><div class="top"><button class="burger" id="burger" aria-label="Menu">${ic('menu')}</button><h1 id="ttl"></h1>
      <a class="btn sm" href="/" target="_blank" rel="noopener">${ic('ext')} View website</a>
      <div class="user"><span class="uname">${S.user}</span><span class="avatar">${S.user[0]}</span><button class="btn sm" id="out">${ic('out')} Sign out</button></div></div>
    <main class="view" id="view"></main></div></div>`.s;
  $('#burger').onclick = () => { const s = $('#side'); s.classList.toggle('open'); if (s.classList.contains('open')) { const sc = document.createElement('div'); sc.className = 'scrim'; sc.onclick = () => { s.classList.remove('open'); sc.remove(); }; document.body.appendChild(sc); } };
  $('#out').onclick = async () => { try { await api('POST', '/logout'); } catch (e) {} S.user = null; renderLogin(); };
}
const item = ([k, label, icon]) => h`<a href="#/${k}" data-k="${k}">${ic(icon)}<span>${label}</span>${k === 'inquiries' ? h`<span class="pill" id="newpill" hidden></span>` : ''}</a>`;
function setNav(k, title) {
  $$('#nav a').forEach(a => a.classList.toggle('on', a.dataset.k === k)); $('#ttl').textContent = title;
  $('#side').classList.remove('open'); $$('.scrim').forEach(x => x.remove()); document.title = title + ' | AG Facade Admin';
}
async function pollStats(first) {
  try {
    const st = await api('GET', '/stats'); S.stats = st; const p = $('#newpill'); if (p) { p.hidden = !st.newInquiries; p.textContent = st.newInquiries; }
    if (S.newSeen !== null && st.inquiries > S.newSeen) toast('New inquiry received!'); S.newSeen = st.inquiries; return st;
  } catch (e) {}
}

/* ============ router ============ */
const ROUTES = { dashboard, inquiries, products, projects, clients, settings };
async function route() {
  if (!S.user) return;
  const [, k = 'dashboard', a] = (location.hash || '#/dashboard').split('/');
  const fn = ROUTES[k] || dashboard; $('#view').innerHTML = ''; await guard(fn)(a);
}
async function boot() { shell(); window.removeEventListener('hashchange', route); window.addEventListener('hashchange', route); await pollStats(); route(); clearInterval(S.timer); S.timer = setInterval(pollStats, 60000); }

/* ============ dashboard ============ */
async function dashboard() {
  setNav('dashboard', 'Dashboard'); const st = await pollStats(); if (!st) return;
  const hr = new Date().getHours(), greet = hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening';
  const max = Math.max(1, ...st.days.map(d => d.count)), colors = { new: '#00B4D8', contacted: '#F2A81D', quoted: '#7C5CE8', won: '#12B886', lost: '#9AA7BA' };
  const tot = st.inquiries || 1, top = Object.entries(st.byService).sort((a, b) => b[1] - a[1])[0];
  $('#view').innerHTML = h`<div class="page-head"><div><h2>${greet}, ${S.user} 👋</h2><p>Here is how your website is doing.</p></div><a class="btn primary" href="#/products/new">${ic('plus')} Add product</a></div>
  <div class="stats">
   <a class="card stat" href="#/inquiries" style="color:inherit"><span class="ic" style="background:linear-gradient(135deg,#00B4D8,#0077A8)">${ic('inbox')}</span><div><b>${st.newInquiries}</b><span>New inquiries</span></div></a>
   <div class="card stat"><span class="ic" style="background:linear-gradient(135deg,#7C5CE8,#5636C4)">${ic('chat')}</span><div><b>${st.inquiries}</b><span>Total · ${st.thisWeek} this week</span></div></div>
   <a class="card stat" href="#/products" style="color:inherit"><span class="ic" style="background:linear-gradient(135deg,#12B886,#0A7A53)">${ic('box')}</span><div><b>${st.productsLive}</b><span>Live products${st.products > st.productsLive ? ` · ${st.products - st.productsLive} hidden` : ''}</span></div></a>
   <a class="card stat" href="#/projects" style="color:inherit"><span class="ic" style="background:linear-gradient(135deg,#F2A81D,#C77700)">${ic('image')}</span><div><b>${st.projects}</b><span>Projects showcased</span></div></a></div>
  <div class="grid2"><div class="card pad"><div class="row"><div class="grow"><h3>Inquiries · last 14 days</h3><span class="muted small">Every request from your contact form</span></div></div>
    <div class="chart">${st.days.map(d => h`<div class="bar" title="${d.count} on ${d.date}"><span class="v">${d.count || ''}</span><i class="${d.count ? '' : 'z'}" style="height:${Math.max(3, d.count / max * 100)}%"></i><small>${d.date.slice(8)}</small></div>`)}</div></div>
   <div class="card pad"><h3>Pipeline</h3><span class="muted small">Where your inquiries stand</span>
    <div class="pipe">${Object.keys(ST).map(k => h`<span style="width:${(st.byStatus[k] || 0) / tot * 100}%;background:${colors[k]}"></span>`)}</div>
    <div class="legend">${Object.keys(ST).map(k => h`<div><i style="background:${colors[k]}"></i>${ST[k]}<b>${st.byStatus[k] || 0}</b></div>`)}</div>
    ${top ? h`<p class="muted small" style="margin-top:14px">Most requested: <b style="color:var(--navy)">${top[0]}</b> (${top[1]})</p>` : ''}</div></div>
  <div class="grid2"><div class="card pad"><div class="row"><h3 class="grow">Latest inquiries</h3><a class="btn sm" href="#/inquiries">View all</a></div>
    ${st.recent.length ? h`<div class="recent">${st.recent.map(r => h`<a href="#/inquiries/${r.ref}"><span class="avatar" style="width:38px;height:38px;background:#E8EEF7;color:var(--navy)">${r.name[0]}</span><div class="grow"><span class="name">${r.name}</span><div class="muted small">${r.service}${r.product ? ' · ' + r.product : ''}</div></div><div style="text-align:right"><span class="badge ${r.status}">${ST[r.status] || r.status}</span><div class="muted small">${ago(r.receivedAt)}</div></div></a>`)}</div>` :
      h`<div class="empty">${ic('inbox')}<h3>No inquiries yet</h3><p>New requests from your contact form will appear here.</p></div>`}</div>
   <div class="card pad"><h3>Quick actions</h3><div class="qa" style="margin-top:14px"><a href="#/products/new">${ic('box')}Add product</a><a href="#/projects">${ic('image')}Add project</a><a href="#/clients">${ic('users')}Client logos</a><a href="/" target="_blank" rel="noopener">${ic('ext')}Open website</a></div></div></div>`.s;
}

/* ============ inquiries ============ */
async function inquiries(ref) {
  setNav('inquiries', 'Inquiries'); let all = await api('GET', '/inquiries'), f = 'all', q = '';
  const draw = () => {
    const list = all.filter(r => (f === 'all' || r.status === f) && (!q || [r.name, r.phone, r.email, r.message, r.ref, r.location, r.product, r.service].join(' ').toLowerCase().includes(q)));
    const cnt = k => k === 'all' ? all.length : all.filter(r => r.status === k).length;
    $('#view').innerHTML = h`<div class="page-head"><div><h2>Customer inquiries</h2><p>Follow up on every request and track its progress.</p></div>
      <div class="row"><div class="search">${ic('search')}<input type="search" id="q" placeholder="Search name, phone, message…" value="${q}"></div><a class="btn" href="/admin/api/inquiries.csv">${ic('dl')} Export CSV</a></div></div>
      <div class="tabs" style="margin-bottom:16px">${['all', ...Object.keys(ST)].map(k => h`<button class="tab ${f === k ? 'on' : ''}" data-f="${k}">${k === 'all' ? 'All' : ST[k]}<em>${cnt(k)}</em></button>`)}</div>
      <div class="card">${list.length ? h`<div class="tbl-wrap"><table><thead><tr><th>Customer</th><th>Contact</th><th>Interested in</th><th>Received</th><th>Status</th></tr></thead><tbody>
        ${list.map(r => h`<tr class="click" data-ref="${r.ref}"><td><span class="name">${r.name}</span><div class="muted small">${r.ref}</div></td><td>${r.phone}<div class="muted small">${r.email}</div></td>
        <td>${r.service}<div class="muted small">${r.product || r.location || ''}</div></td><td>${fmt(r.receivedAt)}<div class="muted small">${ago(r.receivedAt)}</div></td><td><span class="badge ${r.status}"><i class="dot"></i>${ST[r.status] || r.status}</span></td></tr>`)}</tbody></table></div>` :
        h`<div class="empty">${ic('inbox')}<h3>${all.length ? 'No matching inquiries' : 'No inquiries yet'}</h3><p>${all.length ? 'Try another filter or search.' : 'When a customer sends the contact form it appears here, and you also get a WhatsApp alert.'}</p></div>`}</div>`.s;
    $$('[data-f]').forEach(b => b.onclick = () => { f = b.dataset.f; draw(); });
    const qi = $('#q'); qi.oninput = () => { q = qi.value.toLowerCase().trim(); const pos = qi.selectionStart; draw(); const n = $('#q'); n.focus(); n.setSelectionRange(pos, pos); };
    $$('tr[data-ref]').forEach(tr => tr.onclick = () => openInquiry(all.find(r => r.ref === tr.dataset.ref), all, draw));
  };
  draw(); if (ref) { const r = all.find(x => x.ref === ref); if (r) openInquiry(r, all, draw); }
}
function openInquiry(r, all, redraw) {
  const ov = document.createElement('div'); ov.className = 'ov'; const dr = document.createElement('aside'); dr.className = 'drawer';
  const close = () => { ov.remove(); dr.remove(); if (location.hash.split('/')[2]) history.replaceState(null, '', '#/inquiries'); }; ov.onclick = close;
  dr.innerHTML = h`<header><span class="avatar" style="width:46px;height:46px;font-size:1.1rem">${r.name[0]}</span><div class="grow"><h3 style="font-size:1.2rem">${r.name}</h3><div class="muted small">${r.ref} · ${fmt(r.receivedAt)}</div></div><button class="btn icon" id="dx" aria-label="Close">${ic('x')}</button></header>
  <div class="bd"><div class="row" style="margin-bottom:6px"><a class="btn sm" href="tel:${r.phone}">${ic('phone')} Call</a><a class="btn sm" href="${waLink(r.phone)}" target="_blank" rel="noopener">${ic('chat')} WhatsApp</a><a class="btn sm" href="mailto:${r.email}?subject=Re: your inquiry ${r.ref}">${ic('mail')} Email</a></div>
   <dl class="kv"><dt>Phone</dt><dd>${r.phone}</dd><dt>Email</dt><dd>${r.email}</dd><dt>Service</dt><dd>${r.service}</dd><dt>Product</dt><dd>${r.product || '—'}</dd><dt>Location</dt><dd>${r.location || '—'}</dd><dt>Language</dt><dd>${r.lang === 'bn' ? 'বাংলা' : 'English'}</dd></dl>
   <span class="lbl">Message</span><div class="msg" style="margin:6px 0 18px">${r.message}</div>
   <div class="field"><label for="st">Status</label><select id="st">${Object.keys(ST).map(k => h`<option value="${k}" ${r.status === k ? 'selected' : ''}>${ST[k]}</option>`)}</select></div>
   <div class="field"><label for="nt">Internal notes <span class="muted" style="font-weight:400">(only you can see this)</span></label><textarea id="nt" placeholder="e.g. Called on Sunday, site visit on Tuesday…">${r.notes || ''}</textarea></div>
   <div class="row"><button class="btn primary" id="sv">Save changes</button><span class="grow"></span><button class="btn danger" id="dl">${ic('trash')} Delete</button></div></div>`.s;
  document.body.append(ov, dr); $('#dx', dr).onclick = close;
  $('#sv', dr).onclick = guard(async () => { const u = await api('PATCH', '/inquiries/' + encodeURIComponent(r.ref), { status: $('#st', dr).value, notes: $('#nt', dr).value }); Object.assign(r, u); toast('Inquiry updated'); redraw(); pollStats(); close(); });
  $('#dl', dr).onclick = guard(async () => { if (!await confirmBox('Delete this inquiry?', `The request from ${r.name} will be removed permanently.`)) return; await api('DELETE', '/inquiries/' + encodeURIComponent(r.ref)); all.splice(all.indexOf(r), 1); toast('Inquiry deleted'); redraw(); pollStats(); close(); });
}

/* ============ image uploader ============ */
async function prepImage(file, maxW, keepAlpha) {
  const bmp = await createImageBitmap(file), sc = Math.min(1, maxW / bmp.width), c = document.createElement('canvas');
  c.width = Math.round(bmp.width * sc); c.height = Math.round(bmp.height * sc); const x = c.getContext('2d');
  if (!keepAlpha) { x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); } x.drawImage(bmp, 0, 0, c.width, c.height);
  return new Promise(r => c.toBlob(r, keepAlpha ? 'image/png' : 'image/jpeg', .88));
}
function uploader(value, { maxW = 1600, alpha = false, label = 'Click or drop an image here' } = {}) {
  return h`<div class="up" data-up><input type="file" class="sr" accept="image/jpeg,image/png,image/webp" tabindex="-1"><input type="hidden" name="image" value="${value || ''}">
    <div data-prev>${value ? h`<img src="${imgSrc(value)}" alt="">` : h`<div class="ph">${ic('cloud')}<div style="margin-top:6px;font-weight:600">${label}</div><div class="small">JPG, PNG or WebP</div></div>`}</div><div class="busy">Uploading…</div></div>`;
}
function bindUploader(root, opt = {}, onChange) {
  const up = $('[data-up]', root), fi = $('input[type=file]', up), hid = $('input[name=image]', up);
  const go = guard(async file => {
    if (!file) return; if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error('Please choose a JPG, PNG or WebP image.');
    up.classList.add('loading'); try {
      const blob = await prepImage(file, opt.maxW || 1600, !!opt.alpha); const j = await api('POST', '/upload', blob, { 'Content-Type': blob.type });
      hid.value = j.path; $('[data-prev]', up).innerHTML = `<img src="${imgSrc(j.path)}" alt="">`; onChange && onChange(j.path);
    } finally { up.classList.remove('loading'); }
  });
  up.onclick = () => fi.click(); fi.onchange = () => go(fi.files[0]);
  up.ondragover = e => { e.preventDefault(); up.classList.add('over'); }; up.ondragleave = () => up.classList.remove('over');
  up.ondrop = e => { e.preventDefault(); up.classList.remove('over'); go(e.dataTransfer.files[0]); };
}
const moveId = (list, id, dir, same) => { const ids = list.map(x => x.id), i = ids.indexOf(id); let j = i + dir; while (j >= 0 && j < ids.length && same && !same(list[i], list[j])) j += dir; if (j < 0 || j >= ids.length) return null; [ids[i], ids[j]] = [ids[j], ids[i]]; return ids; };

/* ============ products ============ */
async function products(a) { if (a) return productForm(a === 'new' ? null : decodeURIComponent(a)); setNav('products', 'Products'); await productList(); }
async function productList(state = { q: '', cat: 'all', vis: 'all' }) {
  const all = await api('GET', '/products'), homeP = homeSet(all, 6);
  const draw = () => {
    const l = all.filter(p => (state.cat === 'all' || p.cat === state.cat) && (state.vis === 'all' || (state.vis === 'live') === (p.published !== false)) && (!state.q || (p.title.en + p.title.bn + p.tag.en).toLowerCase().includes(state.q)));
    $('#view').innerHTML = h`<div class="page-head"><div><h2>Products</h2><p>${all.length} products · changes appear on your website instantly.</p></div><a class="btn primary" href="#/products/new">${ic('plus')} Add product</a></div>
    <div class="row" style="margin-bottom:16px"><div class="search">${ic('search')}<input type="search" id="q" placeholder="Search products…" value="${state.q}"></div>
      <select id="fc" style="width:auto"><option value="all">All categories</option>${Object.entries(CATS).map(([k, v]) => h`<option value="${k}" ${state.cat === k ? 'selected' : ''}>${v}</option>`)}</select>
      <select id="fv" style="width:auto"><option value="all">All visibility</option><option value="live" ${state.vis === 'live' ? 'selected' : ''}>Live only</option><option value="hidden" ${state.vis === 'hidden' ? 'selected' : ''}>Hidden only</option></select></div>
    <div class="card">${l.length ? h`<div class="tbl-wrap"><table><thead><tr><th>Product</th><th>Category</th><th>Status</th><th style="text-align:right">Actions</th></tr></thead><tbody>${l.map(p => h`<tr>
      <td><div class="row" style="flex-wrap:nowrap"><img class="thumb contain" src="${imgSrc(p.image)}" alt="" loading="lazy"><div><a class="name" href="#/products/${p.id}">${p.title.en}</a><div class="muted small">${p.tag.en || ''}</div></div></div></td>
      <td>${CATS[p.cat]}</td><td>${p.published === false ? h`<span class="badge hidden">Hidden</span>` : h`<span class="badge live"><i class="dot"></i>Live</span>`} ${p.featured ? h`<span class="badge feat">${ic('star')}Featured</span>` : ''} ${homeP.has(p.id) ? h`<span class="badge">On home page</span>` : ''}</td>
      <td><div class="acts"><button class="btn icon sm" data-mv="-1" data-id="${p.id}" title="Move up">${ic('up')}</button><button class="btn icon sm" data-mv="1" data-id="${p.id}" title="Move down">${ic('down')}</button>
      <a class="btn icon sm" href="/products/${p.id}.html" target="_blank" rel="noopener" title="View on website">${ic('eye')}</a><a class="btn icon sm" href="#/products/${p.id}" title="Edit">${ic('edit')}</a><button class="btn icon sm danger" data-del="${p.id}" title="Delete">${ic('trash')}</button></div></td></tr>`)}</tbody></table></div>` :
      h`<div class="empty">${ic('box')}<h3>No products found</h3><p>Try a different filter, or add a new product.</p></div>`}</div>`.s;
    const qi = $('#q'); qi.oninput = () => { state.q = qi.value.toLowerCase().trim(); const p = qi.selectionStart; draw(); const n = $('#q'); n.focus(); n.setSelectionRange(p, p); };
    $('#fc').onchange = e => { state.cat = e.target.value; draw(); }; $('#fv').onchange = e => { state.vis = e.target.value; draw(); };
    $$('[data-mv]').forEach(b => b.onclick = guard(async () => { const ids = moveId(all, b.dataset.id, +b.dataset.mv, (x, y) => x.cat === y.cat); if (!ids) return; await api('POST', '/products/reorder', { ids }); await productList(state); }));
    $$('[data-del]').forEach(b => b.onclick = guard(async () => { const p = all.find(x => x.id === b.dataset.del); if (!await confirmBox('Delete this product?', `“${p.title.en}” will be removed from your website. This cannot be undone.`)) return; await api('DELETE', '/products/' + p.id); toast('Product deleted'); await productList(state); }));
  };
  draw();
}
const FIELDS = [['title', 'Product name', 'text', true], ['tag', 'Subtitle / series', 'text'], ['short', 'Short description (shown on the product card)', 'area'], ['detail', 'Full description (product page)', 'area']];
async function productForm(id) {
  setNav('products', id ? 'Edit product' : 'Add product');
  const p = id ? (await api('GET', '/products')).find(x => x.id === id) : { cat: 'windoor', image: '', title: {}, tag: {}, short: {}, detail: {}, tags: { en: [], bn: [] }, featured: false, onHome: false, published: true };
  if (id && !p) { toast('Product not found', 'err'); location.hash = '#/products'; return; }
  const pane = lang => h`<div class="langpane" data-lang="${lang}" ${lang === 'bn' ? 'hidden' : ''}>
    ${FIELDS.map(([k, label, type, req]) => h`<div class="field"><label>${label}${req && lang === 'en' ? ' *' : ''}</label>${type === 'area' ? h`<textarea data-f="${k}" data-l="${lang}" ${lang === 'bn' ? 'lang="bn"' : ''} rows="${k === 'detail' ? 6 : 3}">${p[k][lang] || ''}</textarea>` : h`<input type="text" data-f="${k}" data-l="${lang}" maxlength="120" value="${p[k][lang] || ''}" ${lang === 'bn' ? 'lang="bn"' : ''}>`}</div>`)}
    <div class="field"><label>Feature tags</label><input type="text" data-f="tags" data-l="${lang}" value="${(p.tags[lang] || []).join(', ')}" placeholder="${lang === 'en' ? 'e.g. 2.0mm profile, Double glazing, Self-closing' : 'একই ক্রমে বাংলা ট্যাগ, কমা দিয়ে আলাদা করুন'}"><span class="hint">Separate with commas (up to 8). Bangla tags are matched to English tags by position.</span></div></div>`;
  $('#view').innerHTML = h`<div class="page-head"><div><h2>${id ? 'Edit product' : 'Add a new product'}</h2><p>${id ? 'Update the details and save. It goes live immediately.' : 'Fill in the details. Bangla is optional; if empty, English is shown.'}</p></div><a class="btn" href="#/products">← Back to products</a></div>
  <form id="pf" class="editor"><div class="card pad"><div class="seg" style="margin-bottom:18px"><button type="button" data-l="en" class="on">English</button><button type="button" data-l="bn">বাংলা (Bangla)</button></div>${pane('en')}${pane('bn')}</div>
  <div class="sticky"><div class="card pad" style="margin-bottom:16px"><div class="field"><label>Product image *</label>${uploader(p.image, { maxW: 1400, label: 'Click or drop product image' })}<span class="hint">Tip: a clean picture on a plain background works best.</span></div>
    <div class="field"><label for="cat">Category *</label><select id="cat">${Object.entries(CATS).map(([k, v]) => h`<option value="${k}" ${p.cat === k ? 'selected' : ''}>${v}</option>`)}</select></div>
    <div class="switch"><div><b>Visible on website</b><span>Turn off to hide without deleting</span></div><input type="checkbox" id="pub" ${p.published !== false ? 'checked' : ''}></div>
    <div class="switch"><div><b>Featured badge</b><span>Shows a “Featured” label on the card</span></div><input type="checkbox" id="feat" ${p.featured ? 'checked' : ''}></div>
    <div class="switch"><div><b>Show on home page</b><span>The 6 newest items with this on appear on the home page</span></div><input type="checkbox" id="home" ${p.onHome ? 'checked' : ''}></div></div>
    <div class="card pad"><span class="lbl">Card preview</span><div class="pv" style="margin-top:10px"><div class="im" id="pvi"></div><div class="bd"><h4 id="pvt"></h4><span class="tg" id="pvg"></span><p id="pvs"></p><div class="tags" id="pvk"></div></div></div></div></div>
  <div style="grid-column:1/-1"><div class="savebar"><a class="btn" href="#/products">Cancel</a><button class="btn primary" id="save">${ic('check')} ${id ? 'Save changes' : 'Publish product'}</button></div></div></form>`.s;
  const f = $('#pf'); bindUploader(f, { maxW: 1400 }, prev);
  $$('.seg button', f).forEach(b => b.onclick = () => { $$('.seg button', f).forEach(x => x.classList.toggle('on', x === b)); $$('.langpane', f).forEach(pn => pn.hidden = pn.dataset.lang !== b.dataset.l); });
  const val = (k, l) => ($(`[data-f=${k}][data-l=${l}]`, f).value || '').trim(), tagsOf = l => val('tags', l).split(',').map(s => s.trim()).filter(Boolean);
  function prev() {
    const img = $('input[name=image]', f).value; $('#pvi', f).innerHTML = img ? `<img src="${imgSrc(img)}" alt="">` : '<span class="muted small">No image yet</span>';
    $('#pvt', f).textContent = val('title', 'en') || 'Product name'; $('#pvg', f).textContent = val('tag', 'en'); $('#pvs', f).textContent = val('short', 'en');
    $('#pvk', f).innerHTML = tagsOf('en').slice(0, 4).map(t => `<span>${esc(t)}</span>`).join('');
  }
  f.addEventListener('input', prev); prev();
  f.onsubmit = guard(async e => {
    e.preventDefault(); const btn = $('#save'); btn.disabled = true;
    const body = { cat: $('#cat').value, image: $('input[name=image]', f).value, published: $('#pub').checked, featured: $('#feat').checked, onHome: $('#home').checked, tags: { en: tagsOf('en'), bn: tagsOf('bn') } };
    ['title', 'tag', 'short', 'detail'].forEach(k => body[k] = { en: val(k, 'en'), bn: val(k, 'bn') });
    try { id ? await api('PUT', '/products/' + id, body) : await api('POST', '/products', body); toast(id ? 'Product updated · live on your website' : 'Product published · live on your website'); location.hash = '#/products'; }
    finally { btn.disabled = false; }
  });
}

/* ============ projects ============ */
async function projects() {
  setNav('projects', 'Projects'); const all = await api('GET', '/projects'), homeJ = homeSet(all, 8); let f = 'all';
  const draw = () => {
    const l = all.filter(p => f === 'all' || p.cat === f);
    $('#view').innerHTML = h`<div class="page-head"><div><h2>Project works</h2><p>${all.length} projects in your portfolio.</p></div><button class="btn primary" id="add">${ic('plus')} Add project</button></div>
    <div class="tabs" style="margin-bottom:18px">${['all', ...Object.keys(PCATS)].map(k => h`<button class="tab ${f === k ? 'on' : ''}" data-f="${k}">${k === 'all' ? 'All' : PCATS[k]}<em>${k === 'all' ? all.length : all.filter(p => p.cat === k).length}</em></button>`)}</div>
    ${l.length ? h`<div class="cards">${l.map(p => h`<div class="card pc"><div class="im"><img src="${imgSrc(p.image)}" alt="" loading="lazy"></div><div class="bd"><span class="badge">${PCATS[p.cat]}</span> ${p.published === false ? h`<span class="badge hidden">Hidden</span>` : ''} ${homeJ.has(p.id) ? h`<span class="badge feat">On home page</span>` : ''}<span class="name">${p.title.en}</span><span class="muted small">${p.title.bn || ''}</span></div>
      <div class="ft"><button class="btn icon sm" data-mv="-1" data-id="${p.id}" title="Move earlier">${ic('up')}</button><button class="btn icon sm" data-mv="1" data-id="${p.id}" title="Move later">${ic('down')}</button><button class="btn icon sm" data-ed="${p.id}" title="Edit">${ic('edit')}</button><button class="btn icon sm danger" data-del="${p.id}" title="Delete">${ic('trash')}</button></div></div>`)}</div>` : h`<div class="card"><div class="empty">${ic('image')}<h3>No projects here yet</h3><p>Add your first project photo.</p></div></div>`}`.s;
    $$('[data-f]').forEach(b => b.onclick = () => { f = b.dataset.f; draw(); }); $('#add').onclick = () => edit(null);
    $$('[data-ed]').forEach(b => b.onclick = () => edit(all.find(x => x.id === b.dataset.ed)));
    $$('[data-mv]').forEach(b => b.onclick = guard(async () => { const ids = moveId(all, b.dataset.id, +b.dataset.mv); if (!ids) return; await api('POST', '/projects/reorder', { ids }); projects(); }));
    $$('[data-del]').forEach(b => b.onclick = guard(async () => { const p = all.find(x => x.id === b.dataset.del); if (!await confirmBox('Delete this project?', `“${p.title.en}” will be removed from your portfolio.`)) return; await api('DELETE', '/projects/' + p.id); toast('Project deleted'); projects(); }));
  };
  function edit(p) {
    const n = p || { title: {}, cat: 'facade', image: '', onHome: false, published: true };
    modal(h`<h3>${p ? 'Edit project' : 'Add project'}</h3><p class="muted small" style="margin-bottom:16px">It appears in the Projects gallery on your website.</p><form id="jf">
      <div class="field"><label>Photo *</label>${uploader(n.image, { maxW: 1400, label: 'Click or drop project photo' })}</div>
      <div class="field"><label>Title (English) *</label><input type="text" id="te" maxlength="120" value="${n.title.en || ''}"></div>
      <div class="field"><label>Title (বাংলা)</label><input type="text" id="tb" maxlength="120" lang="bn" value="${n.title.bn || ''}"></div>
      <div class="field"><label>Category *</label><select id="pc">${Object.entries(PCATS).map(([k, v]) => h`<option value="${k}" ${n.cat === k ? 'selected' : ''}>${v}</option>`)}</select></div>
      <div class="switch"><div><b>Visible on website</b></div><input type="checkbox" id="pp" ${n.published !== false ? 'checked' : ''}></div>
      <div class="switch"><div><b>Show on home page</b><span>The 8 newest items with this on appear on the home page</span></div><input type="checkbox" id="ph" ${n.onHome ? 'checked' : ''}></div>
      <div class="row" style="justify-content:flex-end;margin-top:18px"><button type="button" class="btn" id="cx">Cancel</button><button class="btn primary">${p ? 'Save changes' : 'Add project'}</button></div></form>`, (m, close) => {
      bindUploader(m, { maxW: 1400 }); $('#cx', m).onclick = close;
      $('#jf', m).onsubmit = guard(async e => { e.preventDefault(); const b = { image: $('input[name=image]', m).value, title: { en: $('#te', m).value, bn: $('#tb', m).value }, cat: $('#pc', m).value, published: $('#pp', m).checked, onHome: $('#ph', m).checked };
        p ? await api('PUT', '/projects/' + p.id, b) : await api('POST', '/projects', b); close(); toast(p ? 'Project updated' : 'Project added'); projects(); });
    });
  }
  draw();
}

/* ============ clients & partners ============ */
async function clients() {
  setNav('clients', 'Clients & Partners'); const data = { clients: await api('GET', '/clients'), partners: await api('GET', '/partners') };
  const meta = { clients: ['Clients who trust you', 'Shown in the “Clients” strip on the home and About pages.'], partners: ['Global partners', 'Profile, glass and hardware brands shown on the home and About pages.'] };
  const draw = () => {
    $('#view').innerHTML = h`<div class="page-head"><div><h2>Clients & Partners</h2><p>Keep your logo walls current. Logos are shown exactly in this order.</p></div></div>
    ${['clients', 'partners'].map(k => h`<div class="sect"><div><h3>${meta[k][0]} <span class="muted small">(${data[k].length})</span></h3><span class="muted small">${meta[k][1]}</span></div><button class="btn primary" data-add="${k}">${ic('plus')} Add ${k === 'clients' ? 'client' : 'partner'}</button></div>
      ${data[k].length ? h`<div class="cards" style="grid-template-columns:repeat(auto-fill,minmax(190px,1fr))">${data[k].map(c => h`<div class="card pc"><div class="im contain" style="aspect-ratio:3/2"><img src="${imgSrc(c.image)}" alt="" loading="lazy"></div><div class="bd" style="padding:10px 14px"><span class="name" style="margin:0;font-size:.9rem">${c.name}</span></div>
        <div class="ft"><button class="btn icon sm" data-mv="${k}|-1|${c.id}">${ic('up')}</button><button class="btn icon sm" data-mv="${k}|1|${c.id}">${ic('down')}</button><button class="btn icon sm" data-ed="${k}|${c.id}">${ic('edit')}</button><button class="btn icon sm danger" data-del="${k}|${c.id}">${ic('trash')}</button></div></div>`)}</div>` : h`<div class="card"><div class="empty">${ic('users')}<h3>Nothing here yet</h3></div></div>`}`)}`.s;
    $$('[data-add]').forEach(b => b.onclick = () => edit(b.dataset.add, null));
    $$('[data-ed]').forEach(b => { const [k, id] = b.dataset.ed.split('|'); b.onclick = () => edit(k, data[k].find(x => x.id === id)); });
    $$('[data-mv]').forEach(b => { const [k, d, id] = b.dataset.mv.split('|'); b.onclick = guard(async () => { const ids = moveId(data[k], id, +d); if (!ids) return; await api('POST', `/${k}/reorder`, { ids }); data[k] = await api('GET', '/' + k); draw(); }); });
    $$('[data-del]').forEach(b => { const [k, id] = b.dataset.del.split('|'); b.onclick = guard(async () => { const c = data[k].find(x => x.id === id); if (!await confirmBox('Remove this logo?', `“${c.name}” will be removed from your website.`, 'Remove')) return; await api('DELETE', `/${k}/${id}`); data[k] = await api('GET', '/' + k); toast('Removed'); draw(); }); });
  };
  function edit(k, c) {
    modal(h`<h3>${c ? 'Edit' : 'Add'} ${k === 'clients' ? 'client' : 'partner'}</h3><p class="muted small" style="margin-bottom:16px">Use a logo with a clean or transparent background.</p><form id="cf">
      <div class="field"><label>Logo *</label>${uploader(c && c.image, { maxW: 700, alpha: true, label: 'Click or drop logo' })}</div>
      <div class="field"><label>Company name *</label><input type="text" id="cn" maxlength="80" value="${c ? c.name : ''}"></div>
      <div class="row" style="justify-content:flex-end;margin-top:18px"><button type="button" class="btn" id="cx">Cancel</button><button class="btn primary">${c ? 'Save changes' : 'Add'}</button></div></form>`, (m, close) => {
      bindUploader(m, { maxW: 700, alpha: true }); $('#cx', m).onclick = close;
      $('#cf', m).onsubmit = guard(async e => { e.preventDefault(); const b = { name: $('#cn', m).value, image: $('input[name=image]', m).value };
        c ? await api('PUT', `/${k}/${c.id}`, b) : await api('POST', '/' + k, b); data[k] = await api('GET', '/' + k); close(); toast(c ? 'Saved' : 'Added'); draw(); });
    });
  }
  draw();
}

/* ============ settings ============ */
async function settings() {
  setNav('settings', 'Settings'); const s = await api('GET', '/settings');
  const yes = (ok, t, f) => ok ? h`<span class="badge live"><i class="dot"></i>${t}</span>` : h`<span class="badge hidden">${f}</span>`;
  $('#view').innerHTML = h`<div class="page-head"><div><h2>Settings</h2><p>Account security, alerts and backups.</p></div></div><div class="set">
  <div class="card pad"><h3>Change password</h3><p class="muted small" style="margin-bottom:16px">Signed in as <b>${s.user}</b>. Use at least 8 characters.</p><form id="pw">
    <div class="field"><label>Current password</label>${pwField('cp', 'current-password')}</div><div class="field"><label>New password</label>${pwField('np', 'new-password')}<span class="hint">At least 8 characters.</span></div>
    <div class="field"><label>Repeat new password</label>${pwField('rp', 'new-password')}</div><button class="btn primary">Update password</button></form></div>
  <div class="card pad"><h3>Inquiry alerts</h3><p class="muted small" style="margin-bottom:8px">How you are told about new requests. Change these in the server <code>.env</code> file.</p>
    <div class="status-row"><span>Saved in this panel</span>${yes(true, 'Always on', '')}</div>
    <div class="status-row"><span>WhatsApp alert</span>${yes(s.whatsapp, 'Active', 'Not set up')}</div>
    <div class="status-row"><span>Email alert${s.email ? ' → ' + s.notifyEmail : ''}</span>${yes(s.email, 'Active', 'Not set up')}</div></div>
  <div class="card pad"><h3>Backup your data</h3><p class="muted small" style="margin-bottom:14px">Download products, projects, logos and inquiries as one file. Do this regularly.</p><a class="btn primary" href="/admin/api/backup">${ic('dl')} Download backup</a>
    <div class="warn-box" style="margin-top:16px">Uploaded pictures are stored in <code>${s.dataDir}/uploads</code>. If your hosting resets its disk when it restarts (common on free plans), you will lose data. Use a hosting plan with a persistent disk.</div></div>
  <div class="card pad"><h3>System</h3><div class="status-row"><span>Website address</span><a href="${s.siteUrl}" target="_blank" rel="noopener">${s.siteUrl}</a></div>
    <div class="status-row"><span>Sitemap</span><a href="/sitemap.xml" target="_blank" rel="noopener">/sitemap.xml</a></div><div class="status-row"><span>Server</span><span class="muted">Node ${s.node} · up ${s.uptimeHours} h</span></div></div></div>`.s;
  $('#pw').onsubmit = guard(async e => { e.preventDefault(); if ($('#np').value !== $('#rp').value) throw new Error('The new passwords do not match.'); await api('POST', '/password', { current: $('#cp').value, next: $('#np').value }); e.target.reset(); toast('Password updated'); });
}

/* ============ start ============ */
(async () => { try { const m = await api('GET', '/me'); S.user = m.user; boot(); } catch (e) { if (e.message !== 'auth') renderLogin(); } })();
})();
