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

/* Character sketch (written) and build figure */
(function (root) {
  'use strict';
  const J = root.Jyotish, D = root.JD, R = root.JRules, ord = R.ord, PN = p => D.PLANETS[p].name, SN = i => D.SIGNS[i].name;
  const SC = [
    ['direct, quick and energetic. You get to the point and people know where they stand with you', 'You start things, decide fast and work best with autonomy and a clear target. Routine bores you', 'you get impatient, push harder or pick a fight', 'starting more than you finish, and hearing advice as an obstacle'],
    ['calm, steady and pleasant, with a quiet stubbornness underneath', 'You build slowly and reliably, and dislike being rushed or having plans changed late', 'you dig in, go silent and resist every change', 'staying too long in what is comfortable'],
    ['curious, talkative and quick, with a youthful manner', 'You learn fast, juggle several things and connect people with ideas. You need variety', 'you scatter, overthink and talk in circles', 'skimming the surface and leaving things half done'],
    ['warm, careful and a little guarded until you trust someone', 'You look after the team, remember details about people and do your best work where you feel safe', 'you withdraw, take things personally and brood', 'letting mood decide, and holding on to old hurts'],
    ['confident, warm and dignified. You carry yourself as someone to be taken seriously', 'You lead from the front, take pride in quality and need that quality to be recognised', 'your pride is hurt first, and you turn stubborn or commanding', 'needing to be right, and finding it hard to ask for help'],
    ['modest, observant and precise. You notice what others miss', 'You improve things, catch errors and are trusted with detail. You prefer being useful to being in the limelight', 'you worry, criticise yourself and others, and over-prepare', 'perfectionism that delays finishing, and seeing flaws before merits'],
    ['courteous, well presented and easy to be around', 'You mediate, design and negotiate, and you work best in partnership', 'you avoid the conflict, delay the decision and try to please everyone', 'putting harmony ahead of what you actually want'],
    ['reserved, intense and watchful. You reveal little and observe a lot', 'You go deep, handle crises well and do not let go until a problem is solved', 'you go quiet, suspect motives and keep score', 'holding grudges, and testing people instead of trusting them'],
    ['open, cheerful and frank, with strong opinions', 'You see the big picture, teach and encourage. Detail and follow-through tire you', 'you become blunt or restless, or you simply leave', 'promising more than you deliver, and preaching'],
    ['serious, composed and older than your years', 'You are patient with long projects, respect structure and carry responsibility without fuss', 'you work even harder, close off and turn pessimistic', 'all duty and no rest, and measuring yourself only by achievement'],
    ['friendly but detached, thoughtful and a little unconventional', 'You think in systems, care about the cause and work well in groups while staying independent', 'you detach, intellectualise and go distant', 'keeping people at arm\'s length, and stubbornness presented as principle'],
    ['gentle, accommodating and slightly dreamy', 'You bring imagination and empathy and sense what a group needs. Hard deadlines and conflict drain you', 'you escape, procrastinate or absorb everyone else\'s mood', 'weak boundaries, and avoiding hard conversations']
  ];
  const MC = [
    ['action and independence. Feelings come fast and pass fast', 'You show love by doing and defending, and need a partner who can take directness'],
    ['security, comfort and routine. You are emotionally steady', 'You are loyal, affectionate and physically warm, slow to commit and slow to leave'],
    ['conversation and mental stimulation. You work out what you feel by talking', 'You need a partner who is also a friend to talk to'],
    ['belonging and a home base. You feel deeply and remember everything', 'You are nurturing and protective, and need reassurance in return'],
    ['appreciation and respect. You are generous when you feel valued', 'You are warm, proud and loyal, and need to be admired, not managed'],
    ['order and usefulness. You worry when things are untidy or uncertain', 'You show love through practical help and need it to be noticed'],
    ['companionship and harmony. Being alone for long unsettles you', 'You are considerate and romantic, need fairness and dislike rows'],
    ['depth and complete trust. You feel intensely and privately', 'Your loyalty is all or nothing, and betrayal is hard for you to forgive'],
    ['freedom, meaning and room to move. You stay optimistic', 'You need a partner who shares your beliefs and gives you space'],
    ['achievement and control. You keep feelings in check', 'You are reserved but dependable, and show love through responsibility'],
    ['space and a cause. You observe your feelings from a distance', 'Friendship comes first, and you need independence inside a relationship'],
    ['quiet, imagination and something to devote yourself to', 'You are tender and self-giving, and need gentleness and clear boundaries']
  ];
  const DRIVE = { Su: 'to be recognised and to lead', Mo: 'to care for people and to belong', Ma: 'to act, compete and win', Me: 'to understand, explain and trade ideas', Ju: 'to grow, teach and find meaning', Ve: 'to enjoy, create and relate', Sa: 'to build something lasting through discipline', Ra: 'to achieve something out of the ordinary', Ke: 'to see beneath the surface and be free of it' };
  const IMP = { Su: 'more commanding', Mo: 'softer and more approachable', Ma: 'more forceful and restless', Me: 'quicker and more talkative', Ju: 'wiser, more generous and more optimistic', Ve: 'more charming and polished', Sa: 'more serious, reserved and older-seeming', Ra: 'more ambitious, unconventional and hard to read', Ke: 'more detached and private' };
  const EA = { Fire: 'confident and active', Earth: 'practical and steady', Air: 'sociable and quick-thinking', Water: 'feeling and sensitive' };
  const FIG = [[1, 1, 'long'], [0.5, 2, 'broad'], [2, 0, 'long'], [0.5, 1.6, 'round'], [1.3, 1.6, 'broad'], [1, 0, 'oval'], [1.6, 1, 'oval'], [1, 1.5, 'broad'], [2, 1.4, 'long'], [1, 0.2, 'long'], [1.8, 1.2, 'oval'], [0.4, 1.7, 'round']];
  const FMOD = { Su: [0, 0.2], Mo: [0, 0.3], Ma: [0, 0.2], Me: [0, -0.3], Ju: [0, 0.5], Ve: [0, 0], Sa: [0.3, -0.5], Ra: [0.3, 0], Ke: [0, -0.3] };

  function character(c, gender) {
    const p = c.planets, asc = c.asc.sign, mo = p.Mo.sign, in1 = c.houses[0].planets, le = D.SIGNS[asc].element, me = D.SIGNS[mo].element, out = [];
    const score = {}, bump = (k, n) => score[k] = (score[k] || 0) + n;
    [1, 10].forEach(h => c.houses[h - 1].planets.forEach(k => bump(k, 2))); [5, 9, 7, 4].forEach(h => c.houses[h - 1].planets.forEach(k => bump(k, 1)));
    J.P.forEach(k => { if (['exalted', 'own', 'moolatrikona'].includes(p[k].dignity)) bump(k, 2); if (p[k].vargottama) bump(k, 0.5); }); bump(c.houses[0].lord, 1.5); bump(p.Mo.nak.lord, 0.5);
    const dom = Object.keys(score).sort((a, b) => score[b] - score[a])[0];
    const hl = h => { const hs = c.houses[h - 1]; return `Your ${ord(h)} house is ${SN(hs.sign)}; its ruler ${PN(hs.lord)} sits in the ${ord(p[hs.lord].house)} house, tying it to ${D.HOUSES[p[hs.lord].house - 1].themes}.`; };
    const st = h => R.houseFactors(c, h).stars;
    out.push(['How you come across', [`On first meeting you seem ${SC[asc][0]}.${in1.length ? ` ${R.list(in1.map(PN))} in the first house shade${in1.length > 1 ? '' : 's'} that impression: ${in1.map(k => PN(k) + ' makes you ' + IMP[k]).join('; ')}.` : ''}`]]);
    out.push(['The private you', [`Underneath, what you need is ${MC[mo][0]}.`, le !== me ? `There is a gap between the two: outside you are ${EA[le]}, inside you run on something more ${EA[me]}. People who know you only at work may be surprised by you at home.` : `Outside and inside match: both are ${EA[le]}. What people see is largely what you are.`]]);
    out.push(['What drives you', [`The strongest planet in the chart is ${PN(dom)}, so the deepest motive is ${DRIVE[dom]}. When life gives no outlet for that, you feel flat however well other things go.`]]);
    out.push(['At work', [`${SC[asc][1]}.`, hl(10) + (c.houses[9].planets.length ? ` ${R.list(c.houses[9].planets.map(PN))} there ${c.houses[9].planets.length > 1 ? 'add' : 'adds'}: ${c.houses[9].planets.map(k => D.PIH[k][9]).join(' ')}` : ''), st(10) >= 4 ? 'Career is one of the stronger parts of the chart: effort here is noticed.' : st(10) <= 2 ? 'Career asks for patience: recognition tends to trail the effort.' : 'Career is steady: it rewards consistency more than brilliance.']]);
    out.push(['In close relationships', [`${MC[mo][1]}.`, hl(7) + (c.houses[6].planets.length ? ' ' + c.houses[6].planets.map(k => `${PN(k)} in the 7th: ${D.PIH[k][6]}`).join(' ') : ''), st(7) >= 4 ? 'Partnership is well supported in the chart.' : st(7) <= 2 ? 'Partnership takes conscious effort: say what you need instead of expecting it to be guessed.' : 'Partnership is workable and improves with time and plain talking.']]);
    out.push(['With money', [(st(2) + st(11)) >= 8 ? 'Money tends to come steadily, and you keep it.' : (st(2) + st(11)) >= 6 ? 'Money comes with effort and planning; saving is a habit to build, not a given.' : 'Money needs discipline: budget, avoid lending and stay away from speculation.', hl(2), hl(11)]]);
    out.push(['Under pressure', [`When stressed, ${SC[asc][2]}. The Moon in ${SN(mo)} means the first thing to go is ${['patience', 'flexibility', 'focus', 'composure', 'humility', 'sleep', 'decisiveness', 'trust', 'tact', 'warmth', 'closeness', 'grip on practical things'][mo]}.`, `What steadies you: ${D.COPE[p.Mo.dignity === 'debilitated' || p.Mo.combust ? 'Mo' : c.houses[0].lord]}`]]);
    const weak = J.P.filter(k => p[k].dignity === 'debilitated' || p[k].combust).slice(0, 2);
    out.push(['Blind spots', [`The usual one for ${SN(asc)} rising is ${SC[asc][3]}.`].concat(weak.map(k => `${PN(k)} is weak in the chart, which shows up as ${D.ILL[k]}.`))]);
    const areas = R.lifeAreas(c, gender).slice().sort((a, b) => b.stars - a.stars), good = R.yogas(c).filter(y => y.kind === 'good').slice(0, 2);
    out.push(['What brings out your best', [`You are at your best in ${R.list(areas.slice(0, 2).map(a => a.title.toLowerCase()))}.${good.length ? ' The chart backs this with ' + R.list(good.map(y => y.name)) + '.' : ''}`, D.ADVICE[asc]]]);
    return out;
  }
  function figure(c) {
    let [h, b, face] = FIG[c.asc.sign]; c.houses[0].planets.forEach(k => { h += FMOD[k][0]; b += FMOD[k][1]; }); if (c.houses[0].planets.includes('Mo')) face = 'round';
    h = Math.max(0, Math.min(2.3, h)); b = Math.max(0, Math.min(2.3, b));
    const H = 236 + h * 34, top = 344 - H, sh = 30 + b * 9, wa = 20 + b * 8, hip = 23 + b * 7, hd = { round: [19, 20], oval: [16.5, 21], long: [15, 23], broad: [20, 20] }[face], cx = 100;
    const hy = top + hd[1], ny = hy + hd[1] + 5, sy = ny + 9, wy = sy + H * 0.30, hpy = wy + H * 0.09, ky = hpy + H * 0.24, fy = 344, arm = 9 + b * 2.2, leg = hip * 0.56;
    const body = `M${cx - sh} ${sy}Q${cx} ${sy - 9} ${cx + sh} ${sy}L${cx + wa} ${wy}L${cx + hip} ${hpy}L${cx + hip - 2} ${ky}L${cx + leg + 3} ${fy}L${cx + 3} ${fy}L${cx} ${hpy + 14}L${cx - 3} ${fy}L${cx - leg - 3} ${fy}L${cx - hip + 2} ${ky}L${cx - hip} ${hpy}L${cx - wa} ${wy}Z`;
    const armP = s => `M${cx + s * sh} ${sy + 2}L${cx + s * (sh + arm + 3)} ${wy + 6}L${cx + s * (sh + arm)} ${hpy + 26}L${cx + s * (sh + arm - 7)} ${hpy + 24}L${cx + s * (sh - 2)} ${wy - 10}Z`;
    const ticks = [0, 1, 2].map(i => `<line class="fgl" x1="18" x2="182" y1="${344 - (236 + i * 34)}" y2="${344 - (236 + i * 34)}"/><text class="fgt" x="182" y="${344 - (236 + i * 34) - 3}" text-anchor="end">${['short', 'medium', 'tall'][i]}</text>`).join('');
    return { svg: `<svg class="figure" viewBox="0 0 200 356" role="img" aria-label="Illustration of the build described for this rising sign">${ticks}<line class="fgb" x1="18" x2="182" y1="344" y2="344"/><path class="fga" d="${armP(1)}"/><path class="fga" d="${armP(-1)}"/><path class="fgbody" d="${body}"/><rect class="fgbody" x="${cx - 6}" y="${ny - 6}" width="12" height="14"/><ellipse class="fghead" cx="${cx}" cy="${hy}" rx="${hd[0]}" ry="${hd[1]}"/></svg>`, height: h < 0.8 ? 'shorter than average' : h > 1.5 ? 'taller than average' : 'medium height', build: b < 0.7 ? 'slim' : b > 1.5 ? 'broad and solid' : 'medium', face: { round: 'round', oval: 'oval', long: 'long', broad: 'broad' }[face] };
  }
  Object.assign(R, { character, figure });
})(typeof window !== 'undefined' ? window : globalThis);
