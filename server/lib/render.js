'use strict';
// Renders the data-driven parts of the public pages. The static HTML files stay
// the templates: only the <!--@name-->...<!--@/name--> regions are replaced.
const fs = require('fs');
const path = require('path');

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const CATS = { thermal: 'Thermal Break Windows', windoor: 'Windows & Doors', structural: 'Structural Facade', interior: 'Interior Systems' };
const PCATS = { facade: 'Facade', curtain: 'Curtain Wall & Glazing', interior: 'Interior', install: 'On-site Installation' };
const byOrder = (a, b) => (a.order || 0) - (b.order || 0);

module.exports = function createRenderer(store, siteDir, siteUrl) {
  const products = () => store.get('products').filter(p => p.published !== false).sort(byOrder);
  const projects = () => store.get('projects').filter(p => p.published !== false).sort(byOrder);

  const tagsHtml = p => (p.tags.en || []).map((t, i) => `<span class="tag" data-i18n="p.${p.id}.k${i}">${esc(t)}</span>`).join('');
  const card = (p, d) => `<article class="product-card"><a class="card-link" href="${d}products/${p.id}.html"><div class="prod-media">${p.featured ? '<span class="prod-badge"><span data-i18n="btn.featured">Featured</span></span>' : ''}<img src="${d}${esc(p.image)}" alt="${esc(p.title.en)}" loading="lazy"></div><div class="prod-body"><h4 data-i18n="p.${p.id}.t">${esc(p.title.en)}</h4>${p.tag.en ? `<span class="prod-tag" data-i18n="p.${p.id}.g">${esc(p.tag.en)}</span>` : ''}<p data-i18n="p.${p.id}.s">${esc(p.short.en)}</p><div class="tags">${tagsHtml(p)}</div><span class="learn-more"><span data-i18n="btn.learn">Learn More</span> <span>↗</span></span></div></a></article>`;
  const work = (p, i, d) => `<figure class="work" data-cat="${p.cat}"><button type="button" class="work-btn" data-idx="${i}" aria-label="${esc(p.title.en)}"><img src="${d}${esc(p.image)}" alt="${esc(p.title.en)}" loading="lazy"></button><figcaption><span class="work-cat" data-i18n="proj.cat.${p.cat}">${esc(PCATS[p.cat] || '')}</span><h3 data-i18n="pj.${p.id}">${esc(p.title.en)}</h3></figcaption></figure>`;
  const logos = list => list.slice().sort(byOrder).map(l => `<div class="logo-pill"><img src="${esc(l.image)}" alt="${esc(l.name)}" loading="lazy"></div>`).join('');

  const regions = {
    'home-products': () => products().filter(p => p.onHome).slice(-6).map(p => card(p, '')).join(''),  // the 6 most recently added
    'home-projects': () => projects().filter(p => p.onHome).slice(-8).map((p, i) => work(p, i, '')).join(''),
    projects: () => projects().map((p, i) => work(p, i, '')).join(''),
    partners: () => logos(store.get('partners')),
    clients: () => logos(store.get('clients')),
    'product-options': () => products().map(p => `<option value="${esc(p.title.en)}" data-pid="${p.id}">${esc(p.title.en)}</option>`).join(''),
    'product-catalog': () => {
      const all = products(), cats = Object.keys(CATS).filter(c => all.some(p => p.cat === c));
      if (!cats.length) return '<p style="text-align:center;color:#566680">Products coming soon.</p>';
      const tabs = cats.map((c, i) => `<button type="button" class="cat-tab${i ? '' : ' active'}" data-cat="${c}"><span data-i18n="cat.${c}">${esc(CATS[c])}</span></button>`).join('');
      const panels = cats.map((c, i) => `<div class="cat-panel${i ? '' : ' active'}" data-panel="${c}"><div class="product-grid">${all.filter(p => p.cat === c).map(p => card(p, '')).join('')}</div></div>`).join('');
      return `<div class="cat-tabs center">${tabs}</div>${panels}`;
    },
  };

  function fill(html) {
    return html.replace(/<!--@([\w-]+)-->[\s\S]*?<!--@\/\1-->/g, (m, name) => regions[name] ? `<!--@${name}-->${regions[name]()}<!--@/${name}-->` : m);
  }
  const readSite = f => fs.readFileSync(path.join(siteDir, f), 'utf8');

  function page(file) { return fill(readSite(file)); }

  // Product detail page: reuse the shell (head, header, footer) of an existing product page.
  function productPage(id) {
    const p = products().find(x => x.id === id);
    if (!p) return null;
    const shell = readSite('products/thermal-sh.html');
    const rel = products().filter(q => q.cat === p.cat && q.id !== p.id).slice(0, 3);
    const first = (p.detail.en || p.short.en || '').split(/(?<=[.!?])\s/)[0].slice(0, 120);
    const desc = `${p.title.en} by AG Facade Technology, Dhaka. ${first}`.slice(0, 300);
    const url = `${siteUrl}/products/${p.id}.html`;
    const main = `<main><section class="pd"><div class="wrap">
<a href="../products.html" class="back-link"><span data-i18n="btn.back">← Back to Products</span></a>
<div class="pd-grid"><div class="pd-media"><img src="../${esc(p.image)}" alt="${esc(p.title.en)}"></div>
<div class="pd-body"><span class="pill-eyebrow"><span data-i18n="cat.${p.cat}">${esc(CATS[p.cat])}</span></span><h1 data-i18n="p.${p.id}.t">${esc(p.title.en)}</h1>${p.tag.en ? `<span class="prod-tag" data-i18n="p.${p.id}.g">${esc(p.tag.en)}</span>` : ''}<p class="pd-desc" data-i18n="p.${p.id}.d">${esc(p.detail.en)}</p>
<div class="tags">${tagsHtml(p)}</div>
<div class="pd-actions"><a class="cta-btn" href="../contact.html?product=${encodeURIComponent(p.id)}"><span data-i18n="btn.requestquote">Request a Quote</span> <span>→</span></a><a class="view-all-btn" href="../catalogue.html"><span data-i18n="btn.seecat">See Full Catalogue</span> <span>→</span></a></div></div></div>
${rel.length ? `<div class="section-head" style="margin-top:64px"><h2><span data-i18n="prod.related">More in this category</span></h2></div><div class="product-grid">${rel.map(q => card(q, '../')).join('')}</div>` : ''}</div></section></main>`;
    return shell
      .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(p.title.en)} | AG Facade Technology</title>`)
      .replace(/(<meta name="description" content=")[^"]*(")/, (m, a, b) => a + esc(desc) + b)
      .replace(/(<link rel="canonical" href=")[^"]*(")/, (m, a, b) => a + url + b)
      .replace(/(<meta property="og:title" content=")[^"]*(")/, (m, a, b) => a + esc(p.title.en) + ' | AG Facade Technology' + b)
      .replace(/(<meta property="og:description" content=")[^"]*(")/, (m, a, b) => a + esc(desc) + b)
      .replace(/(<meta property="og:url" content=")[^"]*(")/, (m, a, b) => a + url + b)
      .replace(/<main>[\s\S]*<\/main>/, () => main);
  }

  // i18n.js = static dictionary + live product / project text
  let i18nCache = { v: -1, txt: '' };
  function i18n() {
    if (i18nCache.v === store.version()) return i18nCache.txt;
    const raw = readSite('i18n.js');
    const D = JSON.parse(raw.slice(raw.indexOf('=') + 1).trim().replace(/;$/, ''));
    const put = (k, en, bn) => { if (en != null && en !== '') D.en[k] = en; if (bn) D.bn[k] = bn; else delete D.bn[k]; };
    store.get('products').forEach(p => {
      put(`p.${p.id}.t`, p.title.en, p.title.bn); put(`p.${p.id}.g`, p.tag.en, p.tag.bn);
      put(`p.${p.id}.s`, p.short.en, p.short.bn); put(`p.${p.id}.d`, p.detail.en, p.detail.bn);
      (p.tags.en || []).forEach((t, i) => put(`p.${p.id}.k${i}`, t, (p.tags.bn || [])[i]));
    });
    store.get('projects').forEach(p => put(`pj.${p.id}`, p.title.en, p.title.bn));
    i18nCache = { v: store.version(), txt: 'window.I18N=' + JSON.stringify(D) + ';\n' };
    return i18nCache.txt;
  }

  function sitemap() {
    const base = ['', 'products.html', 'projects.html', 'catalogue.html', 'about.html', 'contact.html'];
    const pr = { '': '1.0', 'products.html': '0.9', 'projects.html': '0.8', 'contact.html': '0.8' };
    const today = new Date().toISOString().slice(0, 10);
    const u = (p, pri) => `  <url><loc>${siteUrl}/${p}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>${pri}</priority></url>\n`;
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${base.map(p => u(p, pr[p] || '0.7')).join('')}${products().map(p => u(`products/${p.id}.html`, '0.6')).join('')}</urlset>\n`;
  }
  return { page, productPage, i18n, sitemap, CATS, PCATS, esc };
};
