'use strict';
// Small, dependency-free JSON store. Every write is atomic (temp file + rename).
const fs = require('fs');
const path = require('path');

module.exports = function createStore(dataDir, seedDir) {
  fs.mkdirSync(path.join(dataDir, 'uploads'), { recursive: true });
  const cache = {};
  let version = 1;
  const file = n => path.join(dataDir, n + '.json');

  function save(n, d) {
    const f = file(n), t = f + '.tmp';
    fs.writeFileSync(t, JSON.stringify(d, null, 1));
    fs.renameSync(t, f);
    cache[n] = d; version++;
  }
  function load(n) {
    if (cache[n]) return cache[n];
    let d;
    try { d = JSON.parse(fs.readFileSync(file(n), 'utf8')); }
    catch (e) {
      d = [];
      if (n === 'inquiries') { // import the old inquiries.jsonl log once
        try {
          d = fs.readFileSync(path.join(dataDir, 'inquiries.jsonl'), 'utf8').split('\n').filter(Boolean)
            .map(l => { try { return JSON.parse(l); } catch (x) { return null; } }).filter(Boolean)
            .map(r => ({ status: 'new', notes: '', ...r }));
        } catch (e2) { d = []; }
      } else {
        try { d = JSON.parse(fs.readFileSync(path.join(seedDir, n + '.json'), 'utf8')); } catch (e3) { d = []; }
      }
      save(n, d);
    }
    cache[n] = d; return d;
  }
  return {
    dataDir, uploadDir: path.join(dataDir, 'uploads'),
    get: load, set: save, version: () => version,
    // inquiries
    addInquiry(rec) { const a = load('inquiries'); a.push({ status: 'new', notes: '', ...rec }); save('inquiries', a); },
  };
};
