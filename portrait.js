/* Portrait (personality sketch) and kundli matching (Ashtakoota) */
(function (root) {
  'use strict';
  const J = root.Jyotish, D = root.JD, R = root.JRules, ord = R.ord;
  const PN = p => D.PLANETS[p].name, SN = i => D.SIGNS[i].name;

  D.BODY = [
    'Medium height with a lean, muscular build, a long neck, a ruddy complexion, strong brows and a quick walk. A mark or scar on the head or face is often mentioned.',
    'Medium to short and solidly built, with broad shoulders, a thick neck, a full face and large eyes. Pleasant looks, with a tendency to gain weight.',
    'Tall and slim, with long arms and fingers, quick eyes, lively gestures and a youthful look that lasts.',
    'Medium to short with a rounded, soft body, a round face, a heavier upper body and a swaying walk.',
    'Broad shoulders and chest, an upright posture, a large forehead, a narrow waist and a commanding look. Hair may thin early.',
    'Slender and youthful, with delicate features, sloping shoulders, a soft voice and a neat appearance.',
    'Well proportioned and graceful, often tall, with an attractive face, good complexion and a winning smile.',
    'Medium height and sturdy, with a broad face, thick brows, penetrating eyes and a strong presence.',
    'Tall and well built, with a large forehead, a long face, strong thighs and an open, cheerful expression. Weight comes later in life.',
    'Lean and bony with prominent joints and deep-set eyes. Looks older than their years when young and younger with age.',
    'Tall with a strong frame, a handsome oval face, a clear complexion and a thoughtful look.',
    'Short to medium with a soft, fuller body, large dreamy eyes, and small hands and feet.'
  ];
  D.BODYMOD = { Su: 'a dignified bearing, strong bones and thinner hair', Mo: 'roundness, softness and a changeable expression', Ma: 'an athletic frame, a reddish tone and perhaps a scar', Me: 'a slim, youthful look and quick movements', Ju: 'a larger, fuller frame and a tendency to gain weight', Ve: 'fine, attractive features and care over appearance', Sa: 'a lean, spare frame, a serious expression and slow ageing', Ra: 'height and an unusual, striking look', Ke: 'a lean build, sharp features and a distant gaze' };
  D.FRIENDS11 = [
    'Energetic, competitive, sporty friends. Friendships form fast and can run hot and cold.',
    'A few loyal, steady, comfort-loving friends who stay for decades.',
    'Many acquaintances: witty, talkative people, writers and traders, often younger than you.',
    'Friends who become family: caring, emotional people you look after and who look after you.',
    'Proud, generous, influential friends, often people in authority.',
    'Practical, skilled, helpful friends, usually met through work.',
    'Charming, artistic, sociable friends. Partners and friends overlap.',
    'Few but intense friendships, private and loyal for life, often proven in a crisis.',
    'Teachers, travellers and philosophical people, often from other cultures.',
    'Older, serious, dependable friends and strong professional networks.',
    'Unconventional thinkers, groups and causes; a wide and varied circle.',
    'Gentle, spiritual or artistic friends, drawn together by compassion.'
  ];
  D.INTEREST = { Su: 'leadership, public life, administration and the outdoors', Mo: 'cooking, caring for others, travel and anything near water', Ma: 'sport, fitness, machines, engineering and competition', Me: 'writing, coding, puzzles, languages and trading', Ju: 'teaching, philosophy, law, advising and scripture', Ve: 'music, art, design, film, clothes and good food', Sa: 'history, long projects, building, organisation and service', Ra: 'technology, foreign cultures, media and unusual subjects', Ke: 'spirituality, mathematics or code, healing and the occult' };
  D.ADVICE = ['Slow down before deciding, and finish what you start.', 'Welcome change; do not let comfort turn into inertia.', 'Go deep on fewer things, and rest your nerves.', 'Do not take things personally; keep kind but firm boundaries.', 'Share the credit, and listen before you lead.', 'Accept "good enough", and be as kind to yourself as you are useful to others.', 'Decide, even when it means someone will disagree.', 'Let go of grudges; trust selectively, but do trust.', 'Pair truth with tact, and follow through on promises.', 'Make time for joy, and ask for help before you need it.', 'Let people in emotionally, not only intellectually.', 'Stay grounded in routine, and learn to say no.'];
  D.ELEM = { Fire: 'action, enthusiasm and initiative', Earth: 'practicality, patience and concern for results', Air: 'ideas, talk and social connection', Water: 'feeling, intuition and care' };
  const GANA = 'DMRMDMDDRRMMDRDRDRRMMDRRMMD', GN = { D: ['Deva', 'gentle, agreeable and well-meaning by temperament'], M: ['Manushya', 'practical, worldly and balanced between kindness and self-interest'], R: ['Rakshasa', 'strong-willed, independent, blunt and hard to push around'] };
  const YONI = ['Horse', 'Elephant', 'Sheep', 'Serpent', 'Serpent', 'Dog', 'Cat', 'Sheep', 'Cat', 'Rat', 'Rat', 'Cow', 'Buffalo', 'Tiger', 'Buffalo', 'Tiger', 'Deer', 'Deer', 'Dog', 'Monkey', 'Mongoose', 'Monkey', 'Lion', 'Horse', 'Lion', 'Cow', 'Elephant'];
  const YORD = ['Horse', 'Elephant', 'Sheep', 'Serpent', 'Dog', 'Cat', 'Rat', 'Cow', 'Buffalo', 'Tiger', 'Deer', 'Monkey', 'Mongoose', 'Lion'];
  const YM = ['42232221013321', '24332222312320', '23421213312031', '33242111122202', '22124212210211', '22212402213321', '22111042222212', '12312224303221', '03312223412221', '11121120141121', '32220323214221', '33022322212432', '22301212222342', '10121121111224'].map(r => r.split('').map(Number));
  const NADI = [0, 1, 2, 2, 1, 0], NADIN = ['Adi (Vata)', 'Madhya (Pitta)', 'Antya (Kapha)'];
  const VARNA = [3, 2, 1, 4, 3, 2, 1, 4, 3, 2, 1, 4], VARNAN = ['', 'Shudra', 'Vaishya', 'Kshatriya', 'Brahmin'];
  const VG = ['Quadruped', 'Human', 'Water', 'Wild', 'Insect'], VT = [[2, 1, 1, 0.5, 1], [1, 2, 0.5, 0, 1], [1, 0.5, 2, 1, 1], [0, 0, 0, 2, 0], [1, 1, 1, 0, 2]];
  const vashya = m => { const s = m.sign, h = m.deg < 15; return [0, 0, 1, 2, 3, 1, 1, 4, h ? 1 : 0, h ? 0 : 2, 1, 2][s]; };
  const starInfo = n => ({ gana: GANA[n], yoni: YONI[n], nadi: NADI[n % 6] });
  const DUS = [6, 8, 12], STRONG = ['exalted', 'own', 'moolatrikona'];

  function portrait(c, gender) {
    const p = c.planets, asc = c.asc.sign, lord = c.houses[0].lord, L = p[lord], si = starInfo(p.Mo.nak.index);
    const elems = { Fire: 0, Earth: 0, Air: 0, Water: 0 }; ['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa'].forEach(k => elems[D.SIGNS[p[k].sign].element]++); elems[D.SIGNS[asc].element]++;
    const es = Object.keys(elems).sort((a, b) => elems[b] - elems[a]), low = es.filter(e => elems[e] === 0);
    const in1 = c.houses[0].planets;
    const body = [D.BODY[asc]]; if (in1.length) body.push(`With ${R.list(in1.map(PN))} in the first house, tradition adds a trait from each${in1.length > 1 ? ', and they can pull in different directions' : ''}: ${in1.map(k => PN(k) + ' gives ' + D.BODYMOD[k]).join('; ')}.`);
    body.push(`The Lagna lord ${PN(lord)} is ${R.DIG[L.dignity]} in the ${ord(L.house)} house, which ${STRONG.includes(L.dignity) || [1, 4, 7, 10, 5, 9].includes(L.house) && L.dignity !== 'debilitated' ? 'supports good vitality and recovery' : 'means stamina needs looking after with regular sleep, food and exercise'}.`);
    const temper = [D.LAGNA[asc], D.MOONSIGN[p.Mo.sign], `Your birth star ${D.NAK[p.Mo.nak.index].name} makes you ${D.NAK[p.Mo.nak.index].trait}. It belongs to the ${GN[si.gana][0]} gana: ${GN[si.gana][1]}.`,
    `Element balance: ${es.filter(e => elems[e]).map(e => `${e} ${elems[e]}`).join(', ')}. ${es[0]} leads, so ${D.ELEM[es[0]]} come naturally.${low.length ? ` Nothing sits in ${R.list(low)}, so ${R.list(low.map(e => D.ELEM[e]))} take conscious effort.` : ''}`];
    if (L.house !== 1) temper.push(`Your Lagna lord sits in the ${ord(L.house)} house, so much of your identity is invested in ${D.HOUSES[L.house - 1].themes}.`);
    // friends
    const h11 = c.houses[10], l11 = p[h11.lord], friends = [D.FRIENDS11[h11.sign]];
    if (h11.planets.length) friends.push(`${R.list(h11.planets.map(PN))} in your 11th house colour your circle with ${R.list(h11.planets.map(k => D.PLANETS[k].short))}.`);
    friends.push(`The 11th lord ${PN(h11.lord)} sits in your ${ord(l11.house)} house, so friendships tend to come through ${D.HOUSES[l11.house - 1].themes}.${DUS.includes(l11.house) ? ' Expect a small circle, and some friendships that end or move far away.' : ''}`);
    friends.push(`You get on most easily with people of ${GN[si.gana][0]} temperament like your own${si.gana === 'D' ? ', and well with Manushya types' : si.gana === 'M' ? ', and well with Deva types' : '; gentler types can find you forceful'}.`);
    // interests
    const score = {}; const bump = (k, n) => score[k] = (score[k] || 0) + n;
    [1, 3, 5, 10].forEach(h => c.houses[h - 1].planets.forEach(k => bump(k, 2))); bump(c.houses[2].lord, 1); bump(c.houses[4].lord, 1.5);
    J.P.forEach(k => { if (STRONG.includes(p[k].dignity)) bump(k, 1.5); if (p[k].vargottama) bump(k, 0.5); });
    const top = Object.keys(score).sort((a, b) => score[b] - score[a]).slice(0, 4);
    const interests = top.map(k => ({ p: k, text: D.INTEREST[k] }));
    // pets
    const h6 = c.houses[5], ben6 = h6.planets.some(k => ['Ju', 'Ve', 'Me', 'Mo'].includes(k)) || !DUS.includes(p[h6.lord].house);
    const pets = [`The symbolic animal (yoni) of your birth star is the <b>${si.yoni}</b>. It is used in compatibility matching and as an emblem of instinct; it does not mean you should keep one.`, `Small animals belong to the 6th house. Yours is ${SN(h6.sign)}, ruled by ${PN(h6.lord)} in the ${ord(p[h6.lord].house)} house${h6.planets.length ? ', holding ' + R.list(h6.planets.map(PN)) : ''}. ${ben6 ? 'That is a comfortable signature for keeping pets.' : 'That suggests pets bring extra work or worry; feeding birds or strays is the traditional alternative.'}`, 'The texts say little about pets, so treat this part as light reading.'];
    // advice
    const areas = R.lifeAreas(c, gender).slice().sort((a, b) => b.stars - a.stars || b.factors.reduce((s, f) => s + f[0], 0) - a.factors.reduce((s, f) => s + f[0], 0));
    const lean = areas.slice(0, 3), work = areas.slice(-3).reverse(), advice = [D.ADVICE[asc]];
    J.P.forEach(k => { if (p[k].dignity === 'debilitated' || p[k].combust) advice.push(`${PN(k)} is ${p[k].dignity === 'debilitated' ? 'debilitated' : 'combust'}: ${D.COPE[k]}`); });
    return { body, temper, friends, interests, pets, advice, lean, work, star: si, gana: GN[si.gana][0], nadi: NADIN[si.nadi] };
  }

  /* ---------- Ashtakoota ---------- */
  function manglik(c) { const m = c.planets.Ma, a = [1, 2, 4, 7, 8, 12]; return a.includes(m.house) || a.includes(J.houseFrom(m.sign, c.planets.Mo.sign)); }
  function match(g, b) { // g = groom chart, b = bride chart
    const gm = g.planets.Mo, bm = b.planets.Mo, gs = starInfo(gm.nak.index), bs = starInfo(bm.nak.index), k = [];
    const add = (name, max, pts, about, detail) => k.push({ name, max, pts, about, detail });
    add('Varna', 1, VARNA[gm.sign] >= VARNA[bm.sign] ? 1 : 0, 'Outlook and work ethic', `Sign classes: ${VARNAN[VARNA[gm.sign]]} and ${VARNAN[VARNA[bm.sign]]}. These are classes of zodiac signs, not of people.`);
    add('Vashya', 2, VT[vashya(gm)][vashya(bm)], 'Mutual pull and influence', `${VG[vashya(gm)]} and ${VG[vashya(bm)]} signs.`);
    const t1 = ((gm.nak.index - bm.nak.index + 27) % 27) % 9 + 1, t2 = ((bm.nak.index - gm.nak.index + 27) % 27) % 9 + 1, bad = [3, 5, 7];
    add('Tara', 3, (bad.includes(t1) ? 0 : 1.5) + (bad.includes(t2) ? 0 : 1.5), 'Health and fortune together', `Stars counted each way: ${t1} and ${t2}.`);
    add('Yoni', 4, YM[YORD.indexOf(gs.yoni)][YORD.indexOf(bs.yoni)], 'Physical and instinctive compatibility', `${gs.yoni} and ${bs.yoni}.`);
    const la = J.SIGN_LORD[gm.sign], lb = J.SIGN_LORD[bm.sign], rel = (x, y) => J.FRIENDS[x].includes(y) ? 2 : J.ENEMIES[x].includes(y) ? 0 : 1, r = [rel(la, lb), rel(lb, la)].sort((x, y) => y - x).join('');
    add('Graha Maitri', 5, la === lb ? 5 : { '22': 5, '21': 4, '11': 3, '20': 1, '10': 0.5, '00': 0 }[r], 'Friendship and mental wavelength', `Moon-sign lords ${PN(la)} and ${PN(lb)}.`);
    add('Gana', 6, { D: { D: 6, M: 6, R: 1 }, M: { D: 5, M: 6, R: 0 }, R: { D: 1, M: 0, R: 6 } }[gs.gana][bs.gana], 'Temperament', `${GN[gs.gana][0]} and ${GN[bs.gana][0]}.`);
    const d = J.houseFrom(bm.sign, gm.sign), bk = [2, 12, 5, 9, 6, 8].includes(d), fr = la === lb || (rel(la, lb) === 2 && rel(lb, la) === 2);
    add('Bhakoot', 7, bk ? 0 : 7, 'Emotional bond, family and prosperity', `Moon signs are ${d} and ${J.houseFrom(gm.sign, bm.sign)} from each other.${bk && fr ? ' The Moon-sign lords are the same or mutual friends, which many astrologers treat as cancelling this dosha.' : ''}`);
    const sameNadi = gs.nadi === bs.nadi;
    add('Nadi', 8, sameNadi ? 0 : 8, 'Constitution and children', `${NADIN[gs.nadi]} and ${NADIN[bs.nadi]}.${sameNadi && (gm.sign === bm.sign) !== (gm.nak.index === bm.nak.index) ? ' Same sign with different stars, or the same star in different signs, is a widely accepted exception.' : ''}`);
    const total = k.reduce((s, x) => s + x.pts, 0), mg = manglik(g), mb = manglik(b);
    const verdict = total >= 32 ? ['Excellent match', 'good'] : total >= 24 ? ['Good match', 'good'] : total >= 18 ? ['Acceptable match', 'warn'] : ['Below the traditional threshold', 'bad'];
    const flags = [];
    if (sameNadi) flags.push('Nadi dosha: both have the same nadi. This is the heaviest single factor in the system; check the exceptions noted in the row.');
    if (bk) flags.push('Bhakoot dosha: the Moon signs fall in a 2/12, 5/9 or 6/8 relationship.' + (fr ? ' It is commonly treated as cancelled here.' : ''));
    if (mg !== mb) flags.push(`Manglik difference: only ${mg ? 'the groom' : 'the bride'} has Mangal Dosha. Tradition prefers both or neither; it eases with age and has many cancellations.`);
    else flags.push(mg ? 'Both have Mangal Dosha, which tradition treats as balancing out.' : 'Neither chart has Mangal Dosha.');
    return { kutas: k, total, verdict, flags, g: { sign: gm.sign, nak: gm.nak.index, ...gs }, b: { sign: bm.sign, nak: bm.nak.index, ...bs } };
  }
  Object.assign(R, { portrait, match, manglik, starInfo });
  D.GANANAME = GN; D.NADINAME = NADIN;
})(typeof window !== 'undefined' ? window : globalThis);
