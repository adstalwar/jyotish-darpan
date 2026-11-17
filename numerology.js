/* Numerology (Anka Shastra) in the Indian style: Chaldean letter values by default, numbers ruled by the nine grahas,
   friendship between numbers taken from the planetary friendships used in the rest of the app. */
(function (root) {
  'use strict';
  const J = root.Jyotish, D = root.JD, R = root.JRules;
  const N = p => D.PLANETS[p].name;

  const CHALDEAN = { A: 1, B: 2, C: 3, D: 4, E: 5, F: 8, G: 3, H: 5, I: 1, J: 1, K: 2, L: 3, M: 4, N: 5, O: 7, P: 8, Q: 1, R: 2, S: 3, T: 4, U: 6, V: 6, W: 6, X: 5, Y: 1, Z: 7 };
  const PYTHAGOREAN = {}; 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach((ch, i) => PYTHAGOREAN[ch] = (i % 9) + 1);
  const PLANET = { 1: 'Su', 2: 'Mo', 3: 'Ju', 4: 'Ra', 5: 'Me', 6: 'Ve', 7: 'Ke', 8: 'Sa', 9: 'Ma' };
  const COLOUR = { 1: 'gold, orange, copper', 2: 'white, cream, silver', 3: 'yellow, saffron', 4: 'grey, electric blue', 5: 'green', 6: 'white, light blue, pink', 7: 'smoky grey, mixed colours', 8: 'dark blue, black', 9: 'red, maroon' };

  const digitSum = n => String(n).split('').reduce((a, d) => a + (+d || 0), 0);
  const reduce = n => { while (n > 9) n = digitSum(n); return n; };

  const NUM = {
    1: { key: 'The leader', self: 'Independent, ambitious and direct. You like to start things and to be in charge of your own path, and you do best when you have room to decide. Watch for pride and impatience with slower people.', path: 'Life keeps asking you to stand on your own feet, take the first step and lead. Recognition comes through initiative rather than waiting.', year: 'A year of new beginnings: start projects, take charge, plant seeds for the next nine years.' },
    2: { key: 'The peacemaker', self: 'Gentle, intuitive and sensitive to mood. You are a natural partner, mediator and carer, with a strong imagination. Watch for indecision and taking things to heart.', path: 'Life teaches cooperation: partnerships, diplomacy and patience bring your gains. You succeed alongside others more than alone.', year: 'A year for patience, partnership and detail. Results ripen slowly; relationships matter most.' },
    3: { key: 'The teacher', self: 'Optimistic, principled and expressive. You like to learn and to guide others, and people look to you for advice. Watch for over-commitment and preaching.', path: 'Life leads toward knowledge, teaching, counselling and expression. Growth comes through study and sharing what you know.', year: 'A year of expansion, learning and social life. Good for study, writing, children and celebrations.' },
    4: { key: 'The reformer', self: 'Practical, unconventional and hard-working. You see things differently, question rules and build systems. Life can bring sudden turns. Watch for rebelliousness and worry.', path: 'Life asks for steady, methodical work and the courage to do things your own way. Unexpected changes become the turning points.', year: 'A year of hard work and foundations: organise, build, and handle surprises calmly.' },
    5: { key: 'The communicator', self: 'Quick, witty, adaptable and commercial. You love variety, travel and ideas, and you can talk to anyone. Watch for restlessness and scattering your energy.', path: 'Life brings change, movement and many contacts. Success comes through communication, trade, travel and learning fast.', year: 'A year of change and movement: travel, new contacts, new skills. Stay flexible.' },
    6: { key: 'The nurturer', self: 'Warm, artistic and family-minded. You love beauty, comfort and harmony, and people feel at home with you. Watch for indulgence and taking on others\' burdens.', path: 'Life centres on home, love, responsibility and creativity. Gains come through service, art, hospitality and relationships.', year: 'A year of home, family and responsibility: marriage, a new home, caring for others, creative work.' },
    7: { key: 'The seeker', self: 'Reflective, private and intuitive. You look beneath the surface and need time alone to think. Watch for detachment and distrust.', path: 'Life leads inward: research, spirituality, healing and specialised knowledge. Your best work is deep rather than broad.', year: 'A year of reflection, study and inner work. Rest, research and spiritual practice pay off more than pushing.' },
    8: { key: 'The builder', self: 'Serious, disciplined and persevering. You carry responsibility well and build slowly but solidly. Success often comes later in life. Watch for pessimism and overwork.', path: 'Life teaches patience and endurance; delays come before lasting achievement. Strength in management, law, finance and long projects.', year: 'A year of effort and reward: career, money and authority, earned through discipline.' },
    9: { key: 'The warrior', self: 'Energetic, courageous and generous. You fight for what you believe in and act fast. Watch for anger and impulsiveness.', path: 'Life calls for courage and service to a larger cause. Gains come through energy, protection, engineering, sport or public work.', year: 'A year of completion: finish, clear out and forgive, ready for a new cycle next year.' }
  };
  const LOSHU = [[4, 9, 2], [3, 5, 7], [8, 1, 6]];
  const LOSHU_MEAN = {
    1: ['communication and self-expression', 'difficulty expressing feelings in words'], 2: ['intuition and sensitivity', 'impatience or difficulty reading others'],
    3: ['imagination and memory', 'difficulty focusing or remembering'], 4: ['order, discipline and practicality', 'disorganisation or dislike of routine'],
    5: ['balance and emotional centre', 'restlessness and lack of direction'], 6: ['home, family and creativity', 'strained home life or anxiety about family'],
    7: ['learning through experience and disappointment', 'reluctance to learn from setbacks'], 8: ['method, attention to detail and money sense', 'carelessness with details or money'],
    9: ['idealism, ambition and humanitarianism', 'lack of ambition or vision']
  };
  const PLANES = [['Mental plane', [4, 9, 2], 'good thinking and planning'], ['Emotional plane', [3, 5, 7], 'emotional balance and spirituality'], ['Practical plane', [8, 1, 6], 'practicality and material success'],
    ['Thought plane', [4, 3, 8], 'planning and organising ability'], ['Will plane', [9, 5, 1], 'determination and willpower'], ['Action plane', [2, 7, 6], 'turning ideas into action'],
    ['Golden yoga (success)', [4, 5, 6], 'success and prosperity'], ['Property yoga', [2, 5, 8], 'property and assets']];

  function rel(a, b) { // relation between two numbers via their planets: 2 same, 1 friend, 0 neutral, -1 enemy
    const p = PLANET[a], q = PLANET[b]; if (p === q) return 2;
    const f = J.FRIENDS[p].includes(q) || J.FRIENDS[q].includes(p), e = J.ENEMIES[p].includes(q) || J.ENEMIES[q].includes(p);
    return f && !e ? 1 : e && !f ? -1 : 0;
  }
  const REL_TXT = { 2: 'the same planet', 1: 'friendly', 0: 'neutral', '-1': 'opposed' };

  function nameValue(name, sys) {
    const T = sys === 'pythagorean' ? PYTHAGOREAN : CHALDEAN, letters = (name || '').toUpperCase().replace(/[^A-Z]/g, '');
    const words = (name || '').toUpperCase().split(/\s+/).map(w => w.replace(/[^A-Z]/g, '')).filter(Boolean);
    const total = letters.split('').reduce((a, ch) => a + T[ch], 0);
    const vowels = letters.split('').filter(ch => 'AEIOU'.includes(ch)).reduce((a, ch) => a + T[ch], 0);
    return { letters, words: words.map(w => ({ w, v: w.split('').reduce((a, ch) => a + T[ch], 0) })), compound: total, number: total ? reduce(total) : 0, soul: vowels ? reduce(vowels) : 0, persona: total - vowels ? reduce(total - vowels) : 0 };
  }

  function harmony(n, mul, bha) { // score a name number against birth and destiny numbers
    const a = rel(n, mul), b = rel(n, bha);
    let s = (a === 2 ? 2 : a === 1 ? 1.5 : a === 0 ? 0.8 : 0) + (b === 2 ? 2 : b === 1 ? 1.5 : b === 0 ? 0.8 : 0);
    if (n === 4 || n === 8) s -= 0.6;
    const verdict = a < 0 || b < 0 ? 'clash' : s >= 2.7 ? 'harmonious' : 'neutral';
    return { score: s, a, b, verdict };
  }

  // Spelling variants: one small change to one word, keeping the sound.
  function variants(name) {
    const words = name.trim().split(/\s+/), out = new Map();
    const push = (wi, nw, how) => { if (!nw || nw.toLowerCase() === words[wi].toLowerCase()) return; const full = words.map((w, i) => i === wi ? nw : w).join(' '); if (!out.has(full.toLowerCase())) out.set(full.toLowerCase(), { full, how, word: wi }); };
    words.forEach((w, wi) => {
      const lw = w.toLowerCase(), cap = s => w[0] === w[0].toUpperCase() ? s[0].toUpperCase() + s.slice(1) : s;
      for (let i = 0; i < lw.length; i++) {
        const ch = lw[i]; if (!/[a-z]/.test(ch)) continue;
        if (i > 0 && lw[i + 1] !== ch && lw[i - 1] !== ch && 'aeonlrtsmpdk'.includes(ch) && (i < lw.length - 1 || 'aelns'.includes(ch))) push(wi, cap(lw.slice(0, i + 1) + ch + lw.slice(i + 1)), `double the "${ch}"`);
        if (lw[i + 1] === ch) push(wi, cap(lw.slice(0, i) + lw.slice(i + 1)), `use a single "${ch}"`);
        if ('bdgkpt'.includes(ch) && lw[i + 1] !== 'h' && i > 0) push(wi, cap(lw.slice(0, i + 1) + 'h' + lw.slice(i + 1)), `add "h" after "${ch}"`);
      }
      [['ee', 'i'], ['i', 'ee'], ['oo', 'u'], ['u', 'oo'], ['v', 'w'], ['w', 'v'], ['ph', 'f'], ['f', 'ph'], ['y', 'i'], ['i', 'y'], ['sh', 'sch'], ['c', 'k'], ['k', 'c']].forEach(([a, b]) => {
        let at = lw.indexOf(a); while (at >= 0) { push(wi, cap(lw.slice(0, at) + b + lw.slice(at + a.length)), `"${a}" → "${b}"`); at = lw.indexOf(a, at + 1); }
      });
      if (!/[aeh]$/.test(lw)) push(wi, cap(lw + 'a'), 'add "a" at the end');
      if (/a$/.test(lw)) push(wi, cap(lw + 'h'), 'add "h" at the end');
    });
    return [...out.values()];
  }

  function suggestions(name, sys, mul, bha) {
    const cur = nameValue(name, sys), h0 = harmony(cur.number, mul, bha);
    const words = name.trim().split(/\s+/);
    const all = variants(name).map(v => { const nv = nameValue(v.full, sys), h = harmony(nv.number, mul, bha); return Object.assign(v, { compound: nv.compound, number: nv.number, h }); })
      .filter(v => v.h.verdict === 'harmonious' && v.h.score > h0.score);
    const pr = v => (v.word === 0 ? 0 : 0.3) + (/double|single/.test(v.how) ? 0 : /end/.test(v.how) ? 0.1 : 0.2);
    all.sort((x, y) => y.h.score - x.h.score || pr(x) - pr(y));
    const seen = new Set(), pick = [];
    for (const v of all) { const k = v.number + '|' + v.word; if (seen.has(k) && pick.length > 2) continue; seen.add(k); pick.push(v); if (pick.length >= 6) break; }
    return { current: Object.assign(cur, { h: h0 }), list: pick, firstName: words.length > 1 ? nameValue(words[0], sys) : null };
  }

  function personal(i, date) {
    const y = date.getFullYear(), m = date.getMonth() + 1, d = date.getDate();
    const py = reduce(reduce(i.d) + reduce(i.m) + reduce(digitSum(y))), pm = reduce(py + reduce(m)), pd = reduce(pm + reduce(d));
    return { year: py, month: pm, day: pd, y };
  }

  function numerology(c, opts) {
    const i = c.input, sys = (opts && opts.sys) || 'chaldean', name = ((opts && opts.name) || i.name || '').trim();
    const mul = reduce(i.d), bha = reduce(digitSum(String(i.d) + String(i.m) + String(i.y)));
    const dobDigits = (String(i.d).padStart(2, '0') + String(i.m).padStart(2, '0') + String(i.y)).split('').map(Number).filter(Boolean);
    const gridDigits = dobDigits.concat(i.d > 9 ? [mul] : [], [bha]);
    const count = {}; for (let n = 1; n <= 9; n++) count[n] = gridDigits.filter(x => x === n).length;
    const planes = PLANES.map(([nm, ns, m]) => ({ name: nm, nums: ns, meaning: m, full: ns.every(n => count[n]), empty: ns.every(n => !count[n]) }));
    const link = n => { const p = PLANET[n], o = c.planets[p]; return { n, p, text: `${N(p)} rules ${n}. In your chart ${N(p)} is in ${D.SIGNS[o.sign].name}, your ${R.ord(o.house)} house, ${R.DIG[o.dignity]}${R.neechaBhanga && R.neechaBhanga(c, p) ? ' (the debility is cancelled)' : ''}.`, strong: ['exalted', 'own', 'moolatrikona'].includes(o.dignity) || (R.neechaBhanga && R.neechaBhanga(c, p)), weak: o.dignity === 'debilitated' && !(R.neechaBhanga && R.neechaBhanga(c, p)) }; };
    const friendly = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(n => rel(n, mul) >= 1 && rel(n, bha) >= 0), avoid = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(n => rel(n, mul) < 0 || rel(n, bha) < 0);
    const now = new Date(), P = [0, 1, 2].map(k => personal(i, new Date(now.getFullYear() + k, now.getMonth(), now.getDate())));
    const months = Array.from({ length: 12 }, (_, k) => { const dt = new Date(now.getFullYear(), k, 1); return { m: k, n: personal(i, dt).month }; });
    return {
      sys, name, mulank: mul, bhagyank: bha, bhagyankCompound: digitSum(String(i.d) + String(i.m) + String(i.y)),
      mul: Object.assign({ planet: PLANET[mul] }, NUM[mul]), bha: Object.assign({ planet: PLANET[bha] }, NUM[bha]), mb: rel(mul, bha),
      links: [link(mul)].concat(bha !== mul ? [link(bha)] : []),
      grid: { count, digits: gridDigits, planes, present: Object.keys(count).filter(n => count[n]).map(Number), missing: Object.keys(count).filter(n => !count[n]).map(Number) },
      lucky: { numbers: friendly, avoid, days: [...new Set([PLANET[mul], PLANET[bha]].map(p => D.REMEDY[p].day))], colours: [COLOUR[mul], bha !== mul ? COLOUR[bha] : null].filter(Boolean) },
      personal: P, months, today: personal(i, now),
      names: name ? suggestions(name, sys, mul, bha) : null
    };
  }

  function numMatch(a, b) { // a, b: chart inputs
    const ma = reduce(a.d), mb = reduce(b.d), ba = reduce(digitSum(String(a.d) + a.m + a.y)), bb = reduce(digitSum(String(b.d) + b.m + b.y));
    const r1 = rel(ma, mb), r2 = rel(ba, bb), s = r1 + r2;
    return { ma, mb, ba, bb, r1, r2, verdict: s >= 2 ? 'Harmonious' : s >= 0 ? 'Workable' : 'Needs understanding', text: `Birth numbers ${ma} (${N(PLANET[ma])}) and ${mb} (${N(PLANET[mb])}) are ${REL_TXT[r1]}; destiny numbers ${ba} (${N(PLANET[ba])}) and ${bb} (${N(PLANET[bb])}) are ${REL_TXT[r2]}.` };
  }

  const DAY = { 1: 'Start something and take the lead.', 2: 'Cooperate, listen and be patient.', 3: 'Communicate, learn and meet people.', 4: 'Organise and do the hard, steady work.', 5: 'Expect change: travel, sell, network.', 6: 'Home, family, care and beauty.', 7: 'Reflect, study and rest; avoid big launches.', 8: 'Money, career and dealings with authority.', 9: 'Finish, clear out and give.' };
  R.numerology = numerology; R.numMatch = numMatch;
  R.NUM = { NUM, DAY, LOSHU, LOSHU_MEAN, PLANET, COLOUR, REL_TXT, rel, reduce, nameValue, CHALDEAN, PYTHAGOREAN,
    NOTE: 'Numerology is a traditional system, like astrology, with no scientific proof. Birth and destiny numbers here follow common Indian practice; the name number uses the Chaldean letter values unless you choose Pythagorean. Friendship between numbers follows the friendship of their ruling planets.',
    NAME_NOTE: 'Spelling changes are optional. Many people use a changed spelling only in their signature, email or brand name and keep official documents unchanged. A name change cannot override effort, and nobody should be pressured into one.' };
})(typeof window !== 'undefined' ? window : globalThis);
