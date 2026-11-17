/* Rules: yogas, doshas, life-area readings, dasha readings, Nadi (Bhrigu Nandi) links */
(function (root) {
  'use strict';
  const J = root.Jyotish, D = root.JD;
  const ord = n => n + (['th', 'st', 'nd', 'rd'][(n % 100 > 10 && n % 100 < 14) ? 0 : n % 10] || 'th');
  const KENDRA = [1, 4, 7, 10], TRIKONA = [1, 5, 9], DUS = [6, 8, 12], UPA = [3, 6, 10, 11];
  const BENEFIC = ['Ju', 'Ve', 'Me', 'Mo'];
  const N = p => D.PLANETS[p].name, SG = i => D.SIGNS[i].name;
  const list = a => a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];
  const DIG = { exalted: 'exalted, at its strongest', debilitated: 'debilitated, at its weakest', moolatrikona: 'in its moolatrikona sign, very strong', own: 'in its own sign, strong', friend: "in a friend's sign", enemy: "in an unfriendly sign", neutral: 'in a neutral sign' };

  function ctx(c) {
    const pl = c.planets, S = p => pl[p].sign, H = p => pl[p].house;
    const lord = h => c.houses[h - 1].lord;
    const owns = p => c.houses.filter(h => h.lord === p).map(h => h.num);
    const conj = (a, b) => S(a) === S(b);
    const aspects = (a, b) => J.ASPECTS[a].includes(J.houseFrom(S(b), S(a)));
    const mutual = (a, b) => aspects(a, b) && aspects(b, a);
    const exchange = (a, b) => a !== b && J.SIGN_LORD[S(a)] === b && J.SIGN_LORD[S(b)] === a;
    const related = (a, b) => conj(a, b) ? 'are together in ' + SG(S(a)) : exchange(a, b) ? 'exchange signs' : mutual(a, b) ? 'aspect each other' : null;
    const from = (p, ref) => J.houseFrom(S(p), ref);
    return { pl, S, H, lord, owns, conj, aspects, mutual, exchange, related, from };
  }

  const NB = new WeakMap();
  function neechaBhanga(c, p) { // true when a debilitated planet has a classical cancellation (computed once per chart)
    if (c.planets[p].dignity !== 'debilitated') return false;
    if (!NB.has(c)) NB.set(c, new Set(yogas(c).filter(y => y.name.startsWith('Neecha Bhanga: ')).map(y => Object.keys(D.PLANETS).find(k => D.PLANETS[k].name === y.name.slice(15)))));
    return NB.get(c).has(p);
  }
  function yogas(c) {
    const x = ctx(c), out = [], pl = c.planets, moon = pl.Mo.sign;
    const add = (name, kind, why, meaning, note) => out.push({ name, kind, why, meaning, note });
    const seven = ['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa'];

    // Pancha Mahapurusha
    [['Ma', 'Ruchaka', 'courage, command, physical strength and a fighting spirit'], ['Me', 'Bhadra', 'sharp intellect, eloquence, business skill and a youthful manner'], ['Ju', 'Hamsa', 'wisdom, good character, respect and a teacher-like presence'], ['Ve', 'Malavya', 'charm, comfort, artistic taste and a happy married life'], ['Sa', 'Shasha', 'authority earned through discipline, command over people and organisations']].forEach(([p, nm, m]) => {
      if (['own', 'moolatrikona', 'exalted'].includes(pl[p].dignity) && KENDRA.includes(x.H(p)))
        add(nm + ' Yoga', 'good', `${N(p)} is ${pl[p].dignity === 'exalted' ? 'exalted' : 'in its own sign'} in the ${ord(x.H(p))} house, an angle of the chart.`, `One of the five "great person" yogas. It gives ${m}.`);
    });
    if (KENDRA.includes(x.from('Ju', moon))) add('Gajakesari Yoga', 'good', `Jupiter is in the ${ord(x.from('Ju', moon))} sign from the Moon.`, 'The "elephant and lion" yoga: good reputation, sound judgement, helpful people and lasting respect.', ['debilitated'].includes(pl.Ju.dignity) || pl.Ju.combust ? 'Jupiter is weak here, so the result is milder.' : null);
    if (x.conj('Su', 'Me')) add('Budhaditya Yoga', 'good', `Sun and Mercury are together in ${SG(pl.Su.sign)}.`, 'Intelligence, skill with words and numbers, and recognition for mental work.', pl.Me.combust ? 'Mercury is very close to the Sun (combust), which makes the result quieter.' : null);
    const cm = x.related('Mo', 'Ma'); if (cm) add('Chandra-Mangala Yoga', 'good', `Moon and Mars ${cm}.`, 'Drive to earn, enterprise and emotional courage. It can also bring a quick temper.');
    const ad = ['Ju', 'Ve', 'Me'].filter(p => [6, 7, 8].includes(x.from(p, moon)));
    if (ad.length >= 2) add('Adhi Yoga', 'good', `${list(ad.map(N))} occupy the 6th, 7th or 8th from the Moon.`, 'Leadership, comfort and a trusted position. People listen to you and rivals fall away.');
    ['Ju', 'Ve', 'Me'].forEach(p => { if (x.H(p) === 10 || x.from(p, moon) === 10) { if (!out.some(y => y.name === 'Amala Yoga')) add('Amala Yoga', 'good', `${N(p)}, a natural benefic, is in the 10th from the ${x.H(p) === 10 ? 'Lagna' : 'Moon'}.`, 'A clean reputation and a career conducted ethically; lasting good name.'); } });

    // Raja yogas: angle lord linked with trine lord. Grouped into one entry, with classical qualifiers.
    const lordOf = p => x.owns(p);
    const role = p => `${N(p)} (lord of the ${list(lordOf(p).map(ord))})`;
    const group = (pairs) => { // pairs [[a,b,relation]] -> sentences grouped by relation
      const byRel = {}; pairs.forEach(([a, b, r]) => { (byRel[r] = byRel[r] || new Set()).add(a); byRel[r].add(b); });
      return Object.entries(byRel).map(([r, set]) => { const ps = [...set];
        return r.startsWith('are together') ? `${list(ps.map(role))} ${r}.` : pairs.filter(q => q[2] === r).map(([a, b]) => `${role(a)} and ${role(b)} ${r}.`).join(' '); }).join(' '); };
    const qualify = (ps) => { const notes = [];
      const hs = [...new Set(ps.map(x.H))], dus = ps.filter(p => DUS.includes(x.H(p)));
      if (dus.length === ps.length) notes.push(`All of them sit in the ${list(hs.filter(h => DUS.includes(h)).map(ord))} house${hs.length > 1 ? 's' : ''}, a difficult house, which weakens the yoga: gains come late, through effort${hs.includes(12) ? ', expense or foreign connections' : hs.includes(8) ? ', sudden changes or others\' resources' : ', service or competition'}.`);
      else if (dus.length) notes.push(`${list(dus.map(N))} ${dus.length > 1 ? 'sit' : 'sits'} in a difficult house (${list([...new Set(dus.map(x.H))].map(ord))}), which reduces ${dus.length > 1 ? 'their' : 'its'} share of the result.`);
      const blem = ps.filter(p => x.lord(1) !== p && lordOf(p).some(h => [6, 8, 12].includes(h)));
      if (blem.length) notes.push(blem.map(p => `${N(p)} also rules the ${list(lordOf(p).filter(h => [6, 8, 12].includes(h)).map(ord))}`).join('; ') + `, a difficult house, which dilutes ${blem.length > 1 ? 'their' : 'its'} contribution.`);
      const weak = ps.filter(p => pl[p].combust || pl[p].dignity === 'debilitated');
      if (weak.length) notes.push(weak.map(p => `${N(p)} is ${pl[p].combust ? 'combust' : 'debilitated'}`).join('; ') + `, so ${weak.length > 1 ? 'their' : 'its'} part is weaker.`);
      const strong = ps.filter(p => ['exalted', 'own', 'moolatrikona'].includes(pl[p].dignity));
      if (strong.length) notes.push(strong.map(p => `${N(p)} is ${pl[p].dignity === 'exalted' ? 'exalted' : 'in its own sign'}`).join('; ') + ', which supports the yoga.');
      return { note: notes.join(' ') || null, kind: dus.length === ps.length ? 'mixed' : 'good' }; };
    const rp = [], seen = new Set();
    [1, 4, 7, 10].forEach(k => [1, 5, 9].forEach(t => {
      const a = x.lord(k), b = x.lord(t); if (a === b) return;
      const key = [a, b].sort().join(''); if (seen.has(key)) return;
      const r = x.related(a, b); if (!r) return; seen.add(key); rp.push([a, b, r]);
    }));
    if (rp.length) { const ps = [...new Set(rp.flat().filter(v => J.P.includes(v)))], q = qualify(ps);
      add('Raja Yoga' + (rp.length > 1 ? ` (${rp.length} links)` : ''), q.kind, group(rp), 'Lords of angles (1st, 4th, 7th, 10th) joined with lords of trines (1st, 5th, 9th); the 1st counts as both. A combination for rise in status, authority and achievement. It gives results mainly in the dashas and antardashas of the planets involved.', q.note); }
    seven.forEach(p => { const o = x.owns(p); if (o.some(h => [4, 7, 10].includes(h)) && o.some(h => [5, 9].includes(h))) add('Yogakaraka: ' + N(p), pl[p].dignity === 'debilitated' || DUS.includes(x.H(p)) ? 'mixed' : 'good', `${N(p)} rules both an angle (${ord(o.find(h => [4, 7, 10].includes(h)))}) and a trine (${ord(o.find(h => [5, 9].includes(h)))}) for ${SG(c.asc.sign)} Lagna.`, `${N(p)} is the single most helpful planet for this Lagna. Its periods tend to be productive.`, `It is in the ${ord(x.H(p))} house, ${DIG[pl[p].dignity]}.`); });
    // Dhana: wealth-house lords (2nd, 11th) linked with Lagna or trine lords. Grouped.
    const dp = [], ds = new Set();
    [2, 11].forEach(a => [1, 5, 9].forEach(b => {
      const p = x.lord(a), q = x.lord(b); if (p === q) return; const key = [p, q].sort().join(''); if (ds.has(key)) return;
      const r = x.related(p, q); if (!r) return; ds.add(key); dp.push([p, q, r]);
    }));
    if (dp.length) { const ps = [...new Set(dp.flat().filter(v => J.P.includes(v)))], q = qualify(ps);
      add('Dhana Yoga' + (dp.length > 1 ? ` (${dp.length} links)` : ''), q.kind, group(dp), 'Lords of the wealth houses (2nd, 11th) joined with lords of the Lagna or trines: earning ability linked with good fortune.', q.note); }
    // Parivartana
    for (let i = 0; i < 7; i++) for (let k = i + 1; k < 7; k++) {
      const a = seven[i], b = seven[k]; if (!x.exchange(a, b)) continue;
      const ha = x.H(a), hb = x.H(b), bad = DUS.includes(ha) || DUS.includes(hb);
      add('Parivartana Yoga', bad ? 'mixed' : 'good', `${N(a)} and ${N(b)} sit in each other's signs, linking the ${ord(ha)} and ${ord(hb)} houses.`, `An exchange ties two areas of life together so each feeds the other: ${D.HOUSES[ha - 1].title.toLowerCase()} and ${D.HOUSES[hb - 1].title.toLowerCase()}.`, bad ? 'One house involved is a difficult house, so the link works through effort, distance or expense.' : null);
    }
    // Vipareeta
    [[6, 'Harsha'], [8, 'Sarala'], [12, 'Vimala']].forEach(([h, nm]) => { const l = x.lord(h); if (l !== x.lord(1) && DUS.includes(x.H(l))) add(nm + ' (Vipareeta Raja) Yoga', 'good', `${N(l)}, lord of the ${ord(h)}, sits in the ${ord(x.H(l))} house.`, 'A "reversal" yoga: a difficult house lord placed in a difficult house. Setbacks turn into gains and you come through crises stronger.'); });
    // Neecha bhanga
    seven.forEach(p => {
      if (pl[p].dignity !== 'debilitated') return;
      const disp = J.SIGN_LORD[pl[p].sign], ex = seven.find(q => J.EXALT[q][0] === pl[p].sign), why = [];
      if (disp !== 'Mo' ? (KENDRA.includes(x.H(disp)) || KENDRA.includes(x.from(disp, moon))) : KENDRA.includes(x.H(disp))) why.push(`${N(disp)}, lord of the sign, is in an angle`);
      if (ex && ex !== p && (KENDRA.includes(x.H(ex)) || (ex !== 'Mo' && KENDRA.includes(x.from(ex, moon))))) why.push(`${N(ex)}, which is exalted in this sign, is in an angle`);
      if (x.aspects(disp, p) && disp !== p) why.push(`${N(disp)} aspects it`);
      if (why.length) add('Neecha Bhanga: ' + N(p), 'good', `${N(p)} is debilitated in ${SG(pl[p].sign)}, but ${list(why)}.`, 'The weakness is cancelled. Early struggle in this planet\'s matters turns into strength later, often beyond the ordinary.');
      else add('Debilitated ' + N(p), 'caution', `${N(p)} is in ${SG(pl[p].sign)}, its weakest sign, without a classical cancellation.`, `Matters of ${D.PLANETS[p].themes} need more conscious effort.`);
    });
    // Moon yogas
    const others = ['Ma', 'Me', 'Ju', 'Ve', 'Sa'];
    const s2 = others.filter(p => x.from(p, moon) === 2), s12 = others.filter(p => x.from(p, moon) === 12), s1 = others.filter(p => x.from(p, moon) === 1);
    if (s2.length && s12.length) add('Durudhara Yoga', 'good', `Planets flank the Moon: ${list(s12.map(N))} behind and ${list(s2.map(N))} ahead.`, 'A supported mind: wealth, vehicles and generosity.');
    else if (s2.length) add('Sunapha Yoga', 'good', `${list(s2.map(N))} in the 2nd from the Moon.`, 'Self-earned wealth, intelligence and good reputation.');
    else if (s12.length) add('Anapha Yoga', 'good', `${list(s12.map(N))} in the 12th from the Moon.`, 'A pleasant personality, good health and dignity.');
    else if (!s1.length) {
      const k = J.P.filter(p => p !== 'Mo' && KENDRA.includes(x.H(p))), ja = x.aspects('Ju', 'Mo');
      const cancel = k.length || ja;
      add('Kemadruma Yoga', cancel ? 'mixed' : 'caution', 'No planet sits beside the Moon or in the signs on either side of it.', 'The Moon stands alone, which can bring spells of loneliness or a feeling of carrying things by yourself.', cancel ? `Largely cancelled here: ${[k.length ? list(k.map(N)) + ' occupy angles from the Lagna' : null, ja ? "Jupiter's aspect falls on the Moon" : null].filter(Boolean).join(', and ')}.` : null);
    }
    // Kaal Sarp
    const arc = seven.map(p => J.norm(pl[p].lon - pl.Ra.lon));
    if (arc.every(a => a < 180) || arc.every(a => a > 180)) add('Kaal Sarp Yoga', 'caution', 'All seven planets lie on one side of the Rahu–Ketu axis.', 'Life tends to run in strong swings, with a sense of fate and delayed results before a breakthrough. It is not found in the classical texts and many astrologers give it little weight.');
    // Mangal dosha
    {
      const mh = x.H('Ma'), ms = pl.Ma.sign, hits = [];
      if ([1, 2, 4, 7, 8, 12].includes(mh)) hits.push(`${ord(mh)} from the Lagna`);
      if ([1, 2, 4, 7, 8, 12].includes(x.from('Ma', moon))) hits.push(`${ord(x.from('Ma', moon))} from the Moon`);
      if ([1, 2, 4, 7, 8, 12].includes(x.from('Ma', pl.Ve.sign))) hits.push(`${ord(x.from('Ma', pl.Ve.sign))} from Venus`);
      if (hits.length) {
        const ease = [];
        if (['own', 'moolatrikona', 'exalted'].includes(pl.Ma.dignity)) ease.push('Mars is in its own or exalted sign');
        if (x.conj('Ma', 'Ju') || x.aspects('Ju', 'Ma')) ease.push('Jupiter joins or aspects Mars');
        if ((mh === 2 && [2, 5].includes(ms)) || (mh === 12 && [1, 6].includes(ms)) || (mh === 4 && [0, 7].includes(ms)) || (mh === 7 && [3, 9].includes(ms)) || (mh === 8 && [8, 11].includes(ms))) ease.push('the sign Mars occupies is a listed exception for that house');
        add('Mangal Dosha (Manglik)', ease.length ? 'mixed' : 'caution', `Mars is ${list(hits)}.`, 'Mars brings heat and assertiveness into partnership. Traditionally checked when matching charts for marriage. It is found in a large share of all charts and eases with maturity.', ease.length ? `Eased here because ${list(ease)}.` : 'No classical cancellation applies, so matching with a partner who also has it is the traditional advice.');
      }
    }
    // Node conjunctions
    [['Ju', 'Ra', 'Guru Chandala Yoga', 'mixed', 'Jupiter\'s wisdom meets Rahu\'s hunger. It gives an unconventional mind that questions teachers and tradition and can excel in foreign, technical or boundary-crossing fields. Judgement about advisers needs care.'],
    ['Sa', 'Ra', 'Shrapit Yoga', 'caution', 'Saturn with Rahu brings heavy, karmic pressure: delays that demand persistence, and ambition that works best in large or technical organisations.'],
    ['Ma', 'Ra', 'Angarak Yoga', 'caution', 'Mars with Rahu makes energy explosive: great drive, with a need to manage anger and risk.'],
    ['Mo', 'Sa', 'Vish Yoga', 'caution', 'Saturn with the Moon makes the mind serious and prone to worry, and also gives depth and endurance.'],
    ['Su', 'Ra', 'Grahan Yoga (Sun)', 'caution', 'Rahu with the Sun clouds confidence and relations with father or authority, while sharpening the urge for recognition.'],
    ['Su', 'Ke', 'Grahan Yoga (Sun)', 'caution', 'Ketu with the Sun gives humility and detachment from status, and uncertain confidence early in life.'],
    ['Mo', 'Ra', 'Grahan Yoga (Moon)', 'caution', 'Rahu with the Moon brings a restless, anxious, intensely imaginative mind.'],
    ['Mo', 'Ke', 'Grahan Yoga (Moon)', 'caution', 'Ketu with the Moon gives an inward, psychic mind and periods of emotional detachment.']].forEach(([a, b, nm, k, m]) => {
      if (x.conj(a, b)) add(nm, k, `${N(a)} and ${N(b)} are together in ${SG(pl[a].sign)} (${Math.abs(J.diff(pl[a].lon, pl[b].lon)).toFixed(1)}° apart).`, m, Math.abs(J.diff(pl[a].lon, pl[b].lon)) > 15 ? 'They are far apart within the sign, so the effect is mild.' : null);
    });
    seven.forEach(p => { if (pl[p].vargottama && p !== 'Su') add('Vargottama ' + N(p), 'good', `${N(p)} is in ${SG(pl[p].sign)} in both the birth chart and the Navamsa.`, `${N(p)} gains strength and gives consistent results.`); });
    return out;
  }

  /* ---------- house strength and life areas ---------- */
  function houseFactors(c, h) {
    const x = ctx(c), pl = c.planets, hs = c.houses[h - 1], l = hs.lord, L = pl[l], f = [];
    const nbL = neechaBhanga(c, l), dg = nbL ? 0.5 : { exalted: 2, moolatrikona: 2, own: 2, friend: 1, neutral: 0, enemy: -1, debilitated: -2 }[L.dignity];
    if (dg) f.push([dg, nbL ? `Its lord ${N(l)} is debilitated, but the debility is cancelled (Neecha Bhanga)` : `Its lord ${N(l)} is ${DIG[L.dignity]}`]);
    if (L.house === h) f.push([1, `${N(l)} sits in its own house and guards it`]);
    else if (KENDRA.includes(L.house) || TRIKONA.includes(L.house)) f.push([1, `${N(l)} is well placed in the ${ord(L.house)} house`]);
    else if (DUS.includes(L.house)) f.push([DUS.includes(h) ? 0.5 : -1, `${N(l)} is in the ${ord(L.house)}, a difficult house`]);
    if (L.combust) f.push([-0.5, `${N(l)} is combust (too close to the Sun)`]);
    hs.planets.forEach(p => {
      if (BENEFIC.includes(p)) f.push([1, `${N(p)}, a benefic, occupies the house`]);
      else f.push([UPA.includes(h) ? 0.5 : -0.5, `${N(p)} occupies the house${UPA.includes(h) ? ' (tough planets do well here)' : ''}`]);
    });
    hs.aspectedBy.forEach(p => {
      if (hs.planets.includes(p)) return;
      if (p === l) f.push([1, `${N(p)} aspects its own house`]);
      else if (p === 'Ju') f.push([1, "Jupiter's protective aspect falls here"]);
      else if (['Ve', 'Me', 'Mo'].includes(p)) f.push([0.5, `${N(p)} aspects the house`]);
      else if (p !== 'Su') f.push([-0.5, `${N(p)} aspects the house, adding pressure`]);
    });
    const score = f.reduce((a, b) => a + b[0], 0);
    return { factors: f, score, stars: Math.max(1, Math.min(5, Math.round(3 + score * 0.55))) };
  }
  function lordPlacement(c, h) {
    const hs = c.houses[h - 1], l = hs.lord, L = c.planets[l], t = L.house;
    let how;
    if (t === h) how = 'It stays in its own house, which protects these matters and keeps them in your own hands.';
    else if (DUS.includes(t)) how = 'This is a demanding position: results come through effort, service, change or distance from the birthplace.';
    else if (KENDRA.includes(t) || TRIKONA.includes(t)) how = 'This is a strong, supportive position, so these matters get visible backing.';
    else if (t === 2 || t === 11) how = 'This ties these matters closely to income and gains.';
    else how = 'Here results depend on your own initiative and effort.';
    return `The ${ord(h)} house falls in ${SG(hs.sign)}, ruled by ${N(l)}. ${N(l)} sits in your ${ord(t)} house in ${SG(L.sign)}, ${DIG[L.dignity]}${L.retro && l !== 'Ra' && l !== 'Ke' ? ', and retrograde' : ''}. ${how} It links ${D.HOUSES[h - 1].themes} with ${D.HOUSES[t - 1].themes}.`;
  }
  const VERDICT = ['', 'Needs the most effort', 'Needs effort', 'Mixed, steady with care', 'Well supported', 'Very strong'];
  function lifeAreas(c, gender) {
    // Classical triad: the house (bhava), its lord (bhavesh) and the natural significator (karaka).
    const defs = [
      ['Self, health and vitality', [1], ['Su'], 'body, energy, confidence, how life treats you overall'],
      ['Money, savings and family', [2], ['Ju'], 'savings, family wealth, food and speech'],
      ['Income and gains', [11], ['Ju'], 'earnings, profits, fulfilment of wishes, elder siblings'],
      ['Career and status', [10], ['Sa', 'Su'], 'work, reputation, authority'],
      ['Marriage and partnership', [7], [gender === 'f' ? 'Ju' : 'Ve'], 'spouse, marriage, business partners'],
      ['Children', [5], ['Ju'], 'children, their wellbeing and your bond with them'],
      ['Education and intellect', [4, 5], ['Me'], 'schooling (4th), intelligence and higher study (5th)'],
      ['Home, mother and peace of mind', [4], ['Mo'], 'mother, emotional security, inner contentment'],
      ['Land, house and property', [4], ['Ma'], 'owning land and a house, real estate'],
      ['Vehicles and comforts', [4], ['Ve'], 'vehicles, conveniences and home comforts'],
      ['Fortune, father and dharma', [9], ['Su', 'Ju'], 'luck, father, mentors, higher purpose'],
      ['Divinity and spiritual life', [9, 12], ['Ju', 'Ke'], 'faith and worship (9th), surrender and liberation (12th)'],
      ['Courage, siblings and skills', [3], ['Ma'], 'initiative, younger siblings, communication, short travel'],
      ['Health challenges, debts and rivals', [6], ['Sa', 'Ma'], 'illness, loans, competition, daily work'],
      ['Sudden change, inheritance and research', [8], ['Sa'], 'upheavals, inheritance, insurance, hidden matters'],
      ['Losses, expenses and foreign lands', [12], ['Sa', 'Ke'], 'spending, losses, sleep, living abroad']
    ];
    const KDG = { exalted: 1.5, moolatrikona: 1, own: 1, friend: 0.5, neutral: 0, enemy: -0.5, debilitated: -1.5 };
    return defs.map(([title, hs, ks, scope]) => {
      const f = [], paras = [];
      hs.forEach(h => {
        const hf = houseFactors(c, h);
        hf.factors.forEach(x => f.push([x[0] / hs.length, (hs.length > 1 ? `${ord(h)} house: ` : '') + x[1]]));
        paras.push(lordPlacement(c, h));
        c.houses[h - 1].planets.forEach(p => paras.push(`${N(p)} in the ${ord(h)} house: ${D.PIH[p][h - 1]}`));
        if (!c.houses[h - 1].planets.length && hs.length === 1) paras.push('No planet occupies this house, so read it mainly through its lord. An empty house is normal and not a weakness.');
      });
      ks.forEach(k => {
        const K = c.planets[k], nb = neechaBhanga(c, k), dg = nb ? 0.25 : KDG[K.dignity] || 0;
        if (dg) f.push([dg / ks.length, nb ? `Significator ${N(k)} is debilitated, but cancelled (Neecha Bhanga)` : `Significator ${N(k)} is ${DIG[K.dignity]}`]);
        if (DUS.includes(K.house) && !(k === 'Sa' || k === 'Ke') ) f.push([-0.5 / ks.length, `Significator ${N(k)} is in the ${ord(K.house)}, a difficult house`]);
        if (K.combust) f.push([-0.5 / ks.length, `Significator ${N(k)} is combust`]);
        paras.push(`Significator ${N(k)} (${D.PLANETS[k].short}) is in the ${ord(K.house)} house, ${DIG[K.dignity]}${nb ? ' (the debility is cancelled)' : ''}${K.combust ? ', and combust' : ''}.`);
      });
      const score = f.reduce((a, b) => a + b[0], 0), stars = Math.max(1, Math.min(5, Math.round(3 + score * 0.5)));
      return { title, house: hs[0], houses: hs, scope, stars, verdict: VERDICT[stars], factors: f.map(x => [Math.round(x[0] * 100) / 100, x[1]]), paras };
    });
  }

  function dashaReading(c, p) {
    const x = ctx(c), L = c.planets[p], own = x.owns(p), out = [D.DASHA[p]];
    if (own.length) out.push(`In your chart ${N(p)} rules the ${list(own.map(ord))} house${own.length > 1 ? 's' : ''} (${list(own.map(h => D.HOUSES[h - 1].title.toLowerCase()))}) and sits in the ${ord(L.house)} house (${D.HOUSES[L.house - 1].title.toLowerCase()}) in ${SG(L.sign)}, ${DIG[L.dignity]}. Those are the areas of life this period switches on.`);
    else { const d = J.SIGN_LORD[L.sign], co = J.P.filter(q => q !== p && c.planets[q].sign === L.sign); out.push(`${N(p)} owns no sign, so it works through its host ${N(d)} (lord of ${SG(L.sign)})${co.length ? ' and the planets beside it, ' + list(co.map(N)) : ''}. It sits in your ${ord(L.house)} house (${D.HOUSES[L.house - 1].title.toLowerCase()}), so that area is switched on.`); }
    out.push(D.PIH[p][L.house - 1]);
    if (L.dignity === 'debilitated') out.push(`Because ${N(p)} is debilitated, the period asks for extra effort before it pays off.`);
    if (['exalted', 'own', 'moolatrikona'].includes(L.dignity)) out.push(`Because ${N(p)} is strong by sign, the period tends to deliver its promise fully.`);
    return out;
  }
  function antarNote(c, maha, antar) {
    if (maha === antar) return 'The sub-period belongs to the same planet, so the main themes are at their purest.';
    const rel = J.houseFrom(c.planets[antar].sign, c.planets[maha].sign);
    const fr = J.FRIENDS[maha].includes(antar) ? 'friends' : J.ENEMIES[maha].includes(antar) ? 'unfriendly' : 'neutral';
    const pos = rel === 1 ? 'shares a sign with the main lord, so the two act as one' : [6, 8, 12].includes(rel) ? `sits ${ord(rel)} from the main lord, a strained angle, so this stretch feels like friction or adjustment` : [2].includes(rel) ? 'sits 2nd from the main lord, an angle of building resources' : `sits ${ord(rel)} from the main lord, a cooperative angle`;
    return `${N(antar)} ${pos}. The two planets are ${fr} by nature. Themes of ${N(antar)}: ${D.PLANETS[antar].themes}, acting through your ${ord(c.planets[antar].house)} house.`;
  }

  /* ---------- transits ---------- */
  const GOOD = { Su: [3, 6, 10, 11], Mo: [1, 3, 6, 7, 10, 11], Ma: [3, 6, 11], Me: [2, 4, 6, 8, 10, 11], Ju: [2, 5, 7, 9, 11], Ve: [1, 2, 3, 4, 5, 8, 9, 11, 12], Sa: [3, 6, 11], Ra: [3, 6, 10, 11], Ke: [3, 6, 10, 11] };
  function transitReading(p, fromMoon, house) {
    const good = GOOD[p].includes(fromMoon);
    return { good, text: `${N(p)} is in the ${ord(fromMoon)} sign from your Moon, traditionally a ${good ? 'favourable' : 'testing'} position, and in your ${ord(house)} house. Its themes (${D.PLANETS[p].short}) are now acting on ${D.HOUSES[house - 1].themes}.` };
  }

  /* ---------- Nadi (Bhrigu Nandi) ---------- */
  const EVENT = { Su: 'status, father and dealings with authority', Mo: 'travel, change of place, mother and emotional matters', Ma: 'property, siblings and bold action', Me: 'learning, business, documents and friendships', Ju: 'personal growth, children and recognition', Ve: 'money, marriage, vehicles and comforts', Sa: 'career, responsibility and long-term work', Ra: 'sudden change, foreign links and ambition', Ke: 'endings, detachment, relocation and a spiritual turn' };
  const REL = { with: 'Acting together (same or trine sign)', opp: 'Facing it (opposite sign)', ahead: 'Lying ahead (next sign): where this is heading', behind: 'Behind it (previous sign): what it comes from' };
  function nadiLinks(c, p) {
    const g = { with: [], opp: [], ahead: [], behind: [] };
    J.P.forEach(q => { if (q === p) return; const r = J.houseFrom(c.planets[q].sign, c.planets[p].sign); if ([1, 5, 9].includes(r)) g.with.push(q); else if (r === 7) g.opp.push(q); else if (r === 2) g.ahead.push(q); else if (r === 12) g.behind.push(q); });
    return g;
  }
  function nadi(c, gender) {
    const order = ['Ju', 'Sa', 'Ve', 'Ma', 'Su', 'Mo', 'Me'];
    const readings = order.map(p => {
      const g = nadiLinks(c, p), groups = [];
      Object.keys(REL).forEach(k => { if (g[k].length) groups.push({ label: REL[k], items: g[k].map(q => ({ q, text: D.PAIR[[p, q].sort().join('')] })).filter(i => i.text) }); });
      let intro = D.NADI_KARAKA[p][1];
      if (p === 'Ve' && gender === 'f') intro = 'Venus stands for wealth and comfort, and for the woman herself in some Nadi schools.';
      return { p, title: D.NADI_KARAKA[p][0], intro, sign: c.planets[p].sign, retro: c.planets[p].retro, groups: groups.filter(x => x.items.length) };
    });
    return { readings };
  }
  function nadiProgression(c, fromAge, toAge) {
    const out = [], b = c.date, ju = c.planets.Ju.sign;
    for (let a = Math.max(0, fromAge); a <= toAge; a++) {
      const sign = (ju + a) % 12, hit = [], opp = [];
      J.P.forEach(q => { const r = J.houseFrom(c.planets[q].sign, sign); if ([1, 5, 9].includes(r)) hit.push(q); else if (r === 7) opp.push(q); });
      const start = new Date(b); start.setUTCFullYear(b.getUTCFullYear() + a);
      out.push({ age: a, start, sign, hit, opp, text: hit.length ? 'Activates ' + hit.map(q => EVENT[q]).join('; ') + '.' : (opp.length ? 'Quieter year; themes come from the opposite sign.' : 'A quiet, consolidating year in this method.') });
    }
    return out;
  }
  function nadiTransits(c, from, years) {
    const end = new Date(from.getTime() + years * J.YEAR), out = [];
    [['Ju', 'opens growth and opportunity in'], ['Sa', 'brings pressure, duty and lasting results in']].forEach(([tp, verb]) => {
      J.ingressList(tp, from, end).forEach(seg => {
        const hit = J.P.filter(q => [1, 5, 9].includes(J.houseFrom(c.planets[q].sign, seg.sign)));
        if (hit.length) out.push({ tp, sign: seg.sign, from: seg.from, to: seg.to, open: seg.open, hit, text: `Transit ${N(tp)} in ${SG(seg.sign)} touches natal ${list(hit.map(N))} and ${verb} ${list(hit.map(q => EVENT[q]))}.` });
      });
    });
    return out.sort((a, b) => a.from - b.from);
  }

  function aspectsOf(c, p) {
    return J.ASPECTS[p].map(a => { const h = ((c.planets[p].house - 1 + a - 1) % 12) + 1; return { nth: a, house: h, planets: c.houses[h - 1].planets }; });
  }

  root.JRules = { ord, list, DIG, ctx, yogas, neechaBhanga, houseFactors, lordPlacement, lifeAreas, dashaReading, antarNote, transitReading, nadi, nadiLinks, nadiProgression, nadiTransits, aspectsOf, EVENT, GOOD };
})(typeof window !== 'undefined' ? window : globalThis);
