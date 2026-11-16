/* Daily reading, watch periods, transitions and remedies */
(function (root) {
  'use strict';
  const J = root.Jyotish, D = root.JD, R = root.JRules, ord = R.ord, DAY = J.DAY;
  const PN = p => D.PLANETS[p].name, SN = i => D.SIGNS[i].name;

  D.ILL = {
    Su: 'clashes with authority or father figures, dented confidence, loss of standing, and strain from heat, eyes or heart',
    Mo: 'mood swings, poor sleep, worry, changes of residence and concern over mother or home',
    Ma: 'anger, arguments, haste, accidents, cuts or burns, and disputes over property or with siblings',
    Me: 'miscommunication, paperwork errors, poor deals, nervous strain and skin complaints',
    Ju: 'over-optimism, financial over-reach, strained relations with mentors, concerns over children, and weight or liver issues',
    Ve: 'friction in relationships, overspending on comfort, indulgence and vehicle trouble',
    Sa: 'delays, heavy workload, fatigue, isolation, career pressure and trouble with joints or bones',
    Ra: 'confusion, anxiety, sudden changes, being misled, obsessive ambition and risky shortcuts',
    Ke: 'detachment, loss of direction, sudden breaks, inattention and ailments that are hard to pin down'
  };
  D.COPE = {
    Su: 'Avoid ego battles with superiors. Lead by example and keep promises. Get morning sunlight and a routine health check.',
    Mo: 'Keep a fixed sleep time. Spend time near water or greenery. Talk things through with people you trust and cut late-night screens.',
    Ma: 'Exercise hard to burn off heat. Pause before replying. Drive carefully and postpone confrontations and risky purchases.',
    Me: 'Double-check documents and messages. Back up data. Do not sign in haste; write agreements down.',
    Ju: 'Keep commitments modest. Take a second opinion on large money decisions. Keep learning and watch your diet.',
    Ve: 'Budget for luxuries. Give unhurried time to your partner. Practise moderation in food and drink.',
    Sa: 'Plan for the long term and do not quit in frustration. Keep routines, protect sleep, look after joints, and take on service to others.',
    Ra: 'Verify before you trust. Avoid speculation and intoxicants. Stick to facts, and steady yourself with routine and breathing practice.',
    Ke: 'Do not make irreversible exits in a low mood. Simplify, meditate, and finish pending work before starting new things.'
  };
  D.REMEDY = {
    Su: { day: 'Sunday', dev: 'ॐ सूर्याय नमः', tr: 'Om Suryaya Namah', when: '12 or 108 times at sunrise, facing east', practice: 'Offer a little water to the rising Sun, then recite the Gayatri mantra.', give: 'Wheat, jaggery or a meal to someone in need.', conduct: 'Honour your father and those who guide you. Keep your word. Rise before the Sun.', src: 'Gayatri: Rig Veda 3.62.10. Aditya Hridayam: Valmiki Ramayana, Yuddha Kanda. "Pitru devo bhava" (treat your father as divine): Taittiriya Upanishad 1.11.' },
    Mo: { day: 'Monday', dev: 'ॐ सोमाय नमः', tr: 'Om Somaya Namah', when: '108 times in the evening', practice: 'Recite "Om Namah Shivaya" and sit quietly for ten minutes; moonlight walks on bright nights.', give: 'Rice, milk or white cloth.', conduct: 'Care for your mother. Protect your sleep. Drink enough water.', src: '"Om Namah Shivaya": Sri Rudram, Krishna Yajur Veda (Taittiriya Samhita 4.5). The Moon as born of the cosmic mind: Purusha Sukta, Rig Veda 10.90.13. "Matru devo bhava": Taittiriya Upanishad 1.11.' },
    Ma: { day: 'Tuesday', dev: 'ॐ मङ्गलाय नमः', tr: 'Om Mangalaya Namah', when: '108 times in the morning', practice: 'Recite the Hanuman Chalisa, and do vigorous physical exercise.', give: 'Red lentils (masoor) or jaggery. Donating blood is a popular modern form.', conduct: 'Channel anger into effort. Look after your siblings. Do not start fights.', src: 'Charity items: Brihat Parashara Hora Shastra, graha shanti chapter. Hanuman Chalisa: Tulsidas (16th century), a devotional text, not a Vedic one.' },
    Me: { day: 'Wednesday', dev: 'ॐ बुधाय नमः', tr: 'Om Budhaya Namah', when: '108 times in the morning', practice: 'Recite or listen to the Vishnu Sahasranama; study something for 20 minutes every day.', give: 'Green moong dal, green fodder for cows, or books and stationery for a student.', conduct: 'Speak truthfully and precisely. Keep learning.', src: 'Vishnu Sahasranama: Mahabharata, Anushasana Parva. "Satyam vada… svadhyayan ma pramadah" (speak the truth, never neglect study): Taittiriya Upanishad 1.11.' },
    Ju: { day: 'Thursday', dev: 'ॐ गुरवे नमः', tr: 'Om Gurave Namah', when: '108 times in the morning', practice: 'Read a page of scripture or wisdom literature. Seek out a teacher and thank one.', give: 'Chana dal, turmeric or yellow cloth; pay for a student\'s books or fees.', conduct: 'Respect teachers and elders. Give honest advice. Share what you know.', src: 'Hymn to Brihaspati: Rig Veda 4.50. "Acharya devo bhava" (treat your teacher as divine): Taittiriya Upanishad 1.11.' },
    Ve: { day: 'Friday', dev: 'ॐ शुक्राय नमः', tr: 'Om Shukraya Namah', when: '108 times in the morning', practice: 'Recite the Sri Suktam. Keep your home and clothes clean and pleasant.', give: 'Rice, sugar, ghee or white cloth.', conduct: 'Treat your partner and the women in your life with respect. Enjoy in moderation. Make room for art or music.', src: 'Sri Suktam: Rig Veda Khila (supplementary hymns).' },
    Sa: { day: 'Saturday', dev: 'ॐ शनैश्चराय नमः', tr: 'Om Shanaishcharaya Namah', when: '108 times in the evening', practice: 'Light a sesame-oil lamp at dusk. Recite the Mahamrityunjaya mantra.', give: 'Black sesame, urad dal, mustard oil, a blanket or footwear. Better still, your time: serve the elderly, labourers or the disabled.', conduct: 'Be punctual, patient and honest in work. Pay people fairly and on time.', src: 'Mahamrityunjaya: Rig Veda 7.59.12. The verse tradition assigns to Shani, "Sham no devir abhishtaye": Rig Veda 10.9.4.' },
    Ra: { day: 'Saturday', dev: 'ॐ राहवे नमः', tr: 'Om Rahave Namah', when: '108 times after sunset', practice: 'Recite the Durga Suktam, and practise ten minutes of slow breathing.', give: 'Black sesame, a blanket or dark cloth. Feeding birds and stray dogs is a popular practice.', conduct: 'Avoid intoxicants, shortcuts and half-truths. Be transparent. Limit restless scrolling.', src: 'Durga Suktam: Taittiriya Aranyaka (Mahanarayana Upanishad).' },
    Ke: { day: 'Tuesday', dev: 'ॐ केतवे नमः', tr: 'Om Ketave Namah', when: '108 times in the morning', practice: 'Recite the Ganapati Atharvashirsha. Sit in silent meditation.', give: 'A multi-coloured blanket or sesame. Feeding stray dogs is a popular practice.', conduct: 'Finish what you start. Simplify. Spend some time alone without a screen.', src: 'Ganapati Atharvashirsha: a later Upanishad attached to the Atharva Veda.' }
  };
  D.SHANTI = [
    ['ॐ शं नो मित्रः शं वरुणः', 'Om Sham no Mitrah, Sham Varunah…', 'Taittiriya Upanishad 1.1', 'A prayer for peace from Mitra, Varuna, Aryaman, Indra, Brihaspati and Vishnu. The traditional general prayer when planets trouble.'],
    ['ॐ सह नाववतु', 'Om Saha Navavatu…', 'Taittiriya and Katha Upanishads', 'May we be protected and nourished together, and may there be no ill will between us. Good before study or work with others.'],
    ['असतो मा सद्गमय', 'Asato ma sad gamaya…', 'Brihadaranyaka Upanishad 1.3.28', 'Lead me from the unreal to the real, from darkness to light. Recite when a period feels confusing.'],
    ['ॐ त्र्यम्बकं यजामहे', 'Om Tryambakam Yajamahe…', 'Rig Veda 7.59.12', 'The Mahamrityunjaya mantra, for health, protection and release from fear.']
  ];
  D.MOONGO = [
    'The Moon is back in your own Moon sign. You feel more like yourself: comfort, good food and a settled mood.',
    'Money and family matters come up. Watch your words at home and avoid impulse spending.',
    'Courage and energy are up. A good day for initiative, short trips, calls and getting things done.',
    'Restlessness at home and a low, inward mood. Keep the day light and stay close to routine.',
    'Indecision and worry over plans or children. Not the day to judge your own ideas harshly.',
    'You get the better of obstacles. Good for clearing pending work, dealing with rivals and health routines.',
    'Pleasant company and good dealings with others. Good for meetings, travel and time with your partner.',
    'Chandrashtama: the Moon is eighth from your Moon. Energy and patience run low and small things upset. Avoid major starts, arguments and risky travel.',
    'A mixed day: plans meet small obstacles and you may feel tired. Good for prayer, study and visiting elders.',
    'Work goes well and effort is noticed. Good for anything public or professional.',
    'A day of gains, friends and good news. Good for asking, selling and socialising.',
    'Expenses and tiredness. Rest, avoid lending money, and keep commitments small.'
  ];
  D.TARA = [['Janma', 0, 'Your birth star repeats. Sensitive: look after your body and avoid risks.'], ['Sampat', 1, 'The star of wealth. Good for money matters and beginnings.'], ['Vipat', -1, 'The star of danger. Postpone risky or important starts.'], ['Kshema', 1, 'The star of wellbeing. Good for health, comfort and steady work.'], ['Pratyak', -1, 'The star of obstacles. Expect resistance; be patient.'], ['Sadhana', 1, 'The star of achievement. Good for effort toward a goal.'], ['Naidhana', -1, 'The most difficult star. Keep the day simple and avoid new ventures.'], ['Mitra', 1, 'The star of friends. Good for cooperation and meetings.'], ['Parama Mitra', 1, 'The star of best friends. Supportive for almost anything.']];


  D.GEM = {
    Su: ['Ruby', 'Manikya', 'Red garnet or red spinel', 'Gold or copper', 'Ring finger', 'Sunday, within an hour of sunrise'],
    Mo: ['Pearl', 'Moti', 'Moonstone', 'Silver', 'Little finger', 'Monday evening, in the waxing fortnight'],
    Ma: ['Red coral', 'Moonga', 'Carnelian', 'Gold or copper', 'Ring finger', 'Tuesday morning'],
    Me: ['Emerald', 'Panna', 'Peridot or green tourmaline', 'Gold', 'Little finger', 'Wednesday morning'],
    Ju: ['Yellow sapphire', 'Pukhraj', 'Citrine or yellow topaz', 'Gold', 'Index finger', 'Thursday morning'],
    Ve: ['Diamond', 'Heera', 'White sapphire, white zircon or opal', 'Silver, platinum or white gold', 'Middle or ring finger', 'Friday morning'],
    Sa: ['Blue sapphire', 'Neelam', 'Amethyst or blue spinel', 'Silver or iron', 'Middle finger', 'Saturday evening'],
    Ra: ['Hessonite', 'Gomed', 'Orange zircon', 'Silver', 'Middle finger', 'Saturday after sunset'],
    Ke: ["Cat's eye", 'Lehsunia', "Tiger's eye", 'Silver', 'Middle or little finger', 'Tuesday or Thursday']
  };
  D.ATTR = {
    Su: ['Red, orange, copper', 'East', 1, '1 or 12 mukhi'], Mo: ['White, cream, silver', 'North-west', 2, '2 mukhi'], Ma: ['Red, coral', 'South', 9, '3 mukhi'],
    Me: ['Green', 'North', 5, '4 mukhi'], Ju: ['Yellow, saffron', 'North-east', 3, '5 mukhi'], Ve: ['White, pastels, bright prints', 'South-east', 6, '6 mukhi'],
    Sa: ['Dark blue, black', 'West', 8, '7 mukhi'], Ra: ['Smoky grey, dark blue', 'South-west', 4, '8 mukhi'], Ke: ['Brown, earthy, multi-coloured', '—', 7, '9 mukhi']
  };
  const GROUP = { Su: 1, Mo: 1, Ma: 1, Ju: 1, Ve: 2, Sa: 2, Me: 2, Ra: 2, Ke: 2 };
  function gemPlan(c, cd) {
    const x = R.ctx(c), out = [];
    J.P.forEach(p => {
      const o = c.planets[p], own = x.owns(p), weak = o.dignity === 'debilitated' || o.combust || [6, 8, 12].includes(o.house), notes = [];
      let cat, why;
      if (p === 'Ra' || p === 'Ke') {
        const ok = [3, 6, 10, 11].includes(o.house), run = cd && (cd.m.lord === p);
        cat = ok && run ? 'maybe' : 'avoid';
        why = `${PN(p)} owns no house, so its stone is only considered during its own major period and when it sits in the 3rd, 6th, 10th or 11th house. Here it is in your ${ord(o.house)} house${run ? ' and its period is running' : ' and its period is not running'}.`;
      } else if (own.includes(1)) { cat = 'yes'; why = `${PN(p)} rules your Lagna. This is your life stone: it supports health, confidence and the chart as a whole, and is the safest stone for anyone.`; }
      else if (own.some(h => h === 5 || h === 9)) { cat = 'yes'; why = `${PN(p)} rules your ${R.list(own.map(ord))} house${own.length > 1 ? 's' : ''}. Lords of the 5th and 9th are the houses of fortune, so this is a lucky stone for ${SN(c.asc.sign)} Lagna.`; if (own.some(h => [6, 8, 12].includes(h))) notes.push(`It also rules the ${ord(own.find(h => [6, 8, 12].includes(h)))}, a difficult house, so try it for a few weeks before wearing it for good.`); }
      else if (own.some(h => [6, 8, 12].includes(h))) { cat = 'avoid'; why = `${PN(p)} rules your ${R.list(own.map(ord))} house${own.length > 1 ? 's' : ''}. Strengthening the lord of the 6th, 8th or 12th tends to strengthen obstacles, illness or loss, so its stone is not advised. Use its mantra and giving instead.`; }
      else if (own.some(h => [4, 7, 10].includes(h))) { cat = 'maybe'; why = `${PN(p)} rules your ${R.list(own.map(ord))} house${own.length > 1 ? 's' : ''}, an angle of the chart. Its stone is neutral for you: useful mainly during ${PN(p)}'s own dasha or for that house's matters.`; }
      else { cat = 'maybe'; why = `${PN(p)} rules your ${R.list(own.map(ord))} house${own.length > 1 ? 's' : ''}. Its stone is not harmful but adds little; it is not usually prescribed for ${SN(c.asc.sign)} Lagna.`; }
      if (cat === 'yes' && weak) notes.push(`${PN(p)} is ${o.dignity === 'debilitated' ? 'debilitated' : o.combust ? 'combust' : 'in a difficult house'} in your chart. Most astrologers see a weak, helpful planet as the clearest case for a stone; a minority hold that a debilitated planet should be helped by mantra and giving only.`);
      if (cd && cd.m.lord === p && cat !== 'avoid') notes.push(`${PN(p)}'s major period is running, which is when its stone is most relevant.`);
      if (cd && cd.m.lord === p && cat === 'avoid' && p !== 'Ra' && p !== 'Ke') notes.push(`Its major period is running, but that does not change the advice.`);
      out.push({ p, cat, why, notes, weak, rank: (cat === 'yes' ? 0 : cat === 'maybe' ? 10 : 20) + (own.includes(1) ? 0 : 1) - (weak && cat === 'yes' ? 0.5 : 0) });
    });
    out.sort((a, b) => a.rank - b.rank);
    const yes = out.filter(g => g.cat === 'yes'), clash = [];
    yes.forEach(a => out.forEach(b => { if (b.cat !== 'avoid' && a.p < b.p && GROUP[a.p] !== GROUP[b.p] && b.cat === 'yes') clash.push([a.p, b.p]); }));
    const lucky = [...new Set([c.houses[0].lord, c.houses[4].lord, c.houses[8].lord])];
    return { gems: out, clash, lucky };
  }

  function nakEnd(date, sys) {
    const f = ms => J.nak(J.sidLon('Mo', new Date(ms), sys)).index, t0 = date.getTime(), cur = f(t0);
    let a = t0; for (let i = 0; i < 32; i++) { const b = a + 3600000; if (f(b) !== cur) { let lo = a, hi = b; while (hi - lo > 60000) { const m = (lo + hi) / 2; if (f(m) === cur) lo = m; else hi = m; } return new Date(hi); } a = b; }
    return null;
  }
  function daily(c, date, light) {
    const sys = c.ayanamsaSys, tr = J.transits(date, c, sys), mo = tr.Mo, fm = mo.fromMoon;
    const tara = ((mo.nak.index - c.planets.Mo.nak.index + 27) % 27) % 9, tg = D.TARA[tara][1], mg = R.GOOD.Mo.includes(fm) ? 1 : -1;
    const score = mg + tg + (fm === 8 ? -1 : 0);
    const verdict = score >= 2 ? ['Supportive day', 'good'] : score === 1 ? ['Good day', 'good'] : score === 0 ? ['Mixed day', 'warn'] : score === -1 ? ['Go gently', 'warn'] : ['Low-energy day', 'bad'];
    const out = { date, tr, mo, fromMoon: fm, house: mo.house, tara, score, verdict, wd: date.getDay() };
    if (light) return out;
    const e = J.norm(mo.lon - tr.Su.lon);
    out.tithi = Math.floor(e / 12); out.yoga = Math.floor(J.norm(mo.lon + tr.Su.lon) / (360 / 27));
    out.moonUntil = J.signStay('Mo', date, sys).to; out.nakUntil = nakEnd(date, sys);
    out.fast = ['Su', 'Ma', 'Me', 'Ve'].map(p => ({ p, o: tr[p], good: R.GOOD[p].includes(tr[p].fromMoon) }));
    const lord = D.VARA[out.wd][2], L = c.planets[lord];
    out.dayLord = lord;
    out.dayNote = ['exalted', 'own', 'moolatrikona', 'friend'].includes(L.dignity) && ![6, 8, 12].includes(L.house) ? `${PN(lord)} is well placed in your chart, so its matters (${D.PLANETS[lord].short}) tend to go smoothly on its day.` : `${PN(lord)} needs support in your chart, so take extra care with its matters (${D.PLANETS[lord].short}) on its day. Its simple remedy is given under Remedies.`;
    out.doList = score >= 1 ? ['Start things you have been putting off', 'Meetings, requests and important conversations', 'Purchases and signing, after the usual checks'] : score === 0 ? ['Routine work and follow-ups', 'Planning and preparation', 'Exercise and time outdoors'] : ['Routine, low-stakes work', 'Rest, prayer or meditation', 'Finishing small pending tasks'];
    out.avoid = score >= 1 ? ['Over-committing because the day feels easy'] : score === 0 ? ['Forcing decisions that can wait a day', 'Arguments over small things'] : ['Major new starts and big purchases', 'Confrontations and heated messages', 'Risky travel and lending money'];
    return out;
  }

  /* ---------- watch periods ---------- */
  function antarScore(c, M, A) {
    const x = R.ctx(c), P = c.planets[A], rel = M === A ? 1 : J.houseFrom(P.sign, c.planets[M].sign), own = x.owns(A), bad = [], good = []; let b = 0, g = 0;
    if ([6, 8, 12].includes(rel)) { b += 1; bad.push(`${PN(A)} sits ${ord(rel)} from ${PN(M)}, a strained angle`); }
    if (P.dignity === 'debilitated') { b += 1; bad.push(`${PN(A)} is debilitated`); }
    if (P.combust) { b += 0.5; bad.push(`${PN(A)} is combust`); }
    if ([6, 8, 12].includes(P.house)) { b += 1; bad.push(`${PN(A)} is in your ${ord(P.house)} house`); }
    if (own.includes(8) && !own.includes(1)) { b += 1; bad.push(`${PN(A)} rules your 8th house`); }
    else if (own.some(h => h === 6 || h === 12) && !own.some(h => [1, 5, 9].includes(h))) { b += 0.5; bad.push(`${PN(A)} rules a difficult house`); }
    if (J.ENEMIES[M].includes(A)) { b += 0.5; bad.push(`${PN(M)} and ${PN(A)} are unfriendly`); }
    if (['Sa', 'Ma', 'Ra', 'Ke'].includes(A)) { b += 0.5; bad.push(`${PN(A)} is a natural malefic`); }
    if (['exalted', 'own', 'moolatrikona'].includes(P.dignity)) { g += 1; good.push(`${PN(A)} is strong by sign`); }
    if ([1, 4, 7, 10, 5, 9].includes(P.house)) { g += 1; good.push(`${PN(A)} is well placed in your ${ord(P.house)} house`); }
    if (own.some(h => h === 5 || h === 9)) { g += 1; good.push(`${PN(A)} rules a house of fortune`); }
    if (M !== A && [1, 5, 9].includes(rel)) { g += 0.5; good.push(`it cooperates with ${PN(M)}`); }
    if (J.FRIENDS[M].includes(A)) { g += 0.5; good.push(`the two planets are friends`); }
    if (['Ju', 'Ve', 'Me', 'Mo'].includes(A)) { g += 0.5; good.push(`${PN(A)} is a natural benefic`); }
    return { b, g, bad, good, house: P.house };
  }
  function watch(c, sat, from, years) {
    const to = new Date(from.getTime() + years * J.YEAR), hard = [], soft = [], trans = [], sys = c.ayanamsaSys, moon = c.planets.Mo.sign, asc = c.asc.sign;
    const inWin = (a, b) => b > from && a < to, clip = d => new Date(Math.max(from.getTime(), Math.min(to.getTime(), d.getTime())));
    // Saturn
    const SP = { 12: ['Sade Sati, rising phase', 2], 1: ['Sade Sati, peak phase', 3], 2: ['Sade Sati, setting phase', 2], 4: ['Dhaiya: Saturn 4th from Moon', 2], 8: ['Dhaiya: Saturn 8th from Moon', 3] };
    sat.all.forEach(s => {
      if (!inWin(s.from, s.to)) return;
      if (SP[s.rel]) hard.push({ cat: 'Saturn', from: s.from, to: s.to, sev: SP[s.rel][1], title: SP[s.rel][0], why: `Saturn is in ${SN(s.sign)}, the ${ord(s.rel)} sign from your Moon in ${SN(moon)}.`, ill: s.rel === 1 ? 'Emotional weight, added responsibility, fatigue, and a restructuring of personal life.' : s.rel === 12 ? 'Rising expenses, disturbed sleep, distance from comforts, and elders needing care.' : s.rel === 2 ? 'Pressure on savings and family, and harsh words spoken or heard.' : s.rel === 4 ? 'Pressure on home, mother, property and peace of mind.' : 'Obstacles, sudden changes, and a need for care with health and risk.', cope: D.COPE.Sa, planets: ['Sa'] });
      const h = J.houseFrom(s.sign, asc);
      if (h === 1 || h === 8) hard.push({ cat: 'Saturn', from: s.from, to: s.to, sev: 2, title: h === 1 ? 'Saturn over your Lagna' : 'Saturn in your 8th house', why: `Saturn is in ${SN(s.sign)}, your ${ord(h)} house.`, ill: h === 1 ? 'Low vitality, heavier duties and a serious, tired mood. The body asks for discipline.' : 'Slow obstacles, chronic complaints surfacing, and delays with joint money, insurance or inheritance.', cope: D.COPE.Sa, planets: ['Sa'] });
    });
    // Nodes
    J.ingressList('Ra', from, to, sys).forEach(s => {
      const ke = (s.sign + 6) % 12;
      [[s.sign, 'Ra'], [ke, 'Ke']].forEach(([sg, p]) => {
        const hit = sg === moon ? 'Moon' : sg === asc ? 'Lagna' : sg === c.planets.Su.sign ? 'Sun' : null; if (!hit) return;
        hard.push({ cat: 'Nodes', from: s.from, to: s.to, sev: hit === 'Sun' ? 1 : 2, title: `${PN(p)} over your ${hit}`, why: `${PN(p)} transits ${SN(sg)}, the sign of your birth ${hit}.`, ill: hit === 'Moon' ? (p === 'Ra' ? 'A restless, anxious mind, over-thinking and disturbed sleep.' : 'Emotional detachment, low motivation and a wish to withdraw.') : hit === 'Lagna' ? (p === 'Ra' ? 'Restless ambition, image worries and impulsive changes of direction.' : 'Doubt about direction, low drive and unexplained tiredness.') : (p === 'Ra' ? 'Friction with authority and an inflated or shaken sense of status.' : 'Fading interest in status and uncertainty about your role.'), cope: D.COPE[p], planets: [p] });
      });
    });
    // Jupiter support + slow-planet sign changes
    [['Ju', 5], ['Sa', 5], ['Ra', 5]].forEach(([p]) => {
      J.ingressList(p, from, to, sys).forEach((s, i) => {
        const fm = J.houseFrom(s.sign, moon), good = R.GOOD[p].includes(fm);
        if (p === 'Ju' && good) soft.push({ cat: 'Jupiter', from: s.from, to: s.to, title: `Jupiter ${ord(fm)} from your Moon`, why: `Jupiter in ${SN(s.sign)}, your ${ord(J.houseFrom(s.sign, asc))} house, a classically favourable transit. Good for growth in ${D.HOUSES[J.houseFrom(s.sign, asc) - 1].themes}.` });
        if (i > 0 && s.from - from < 5 * J.YEAR) trans.push({ date: s.from, kind: 'transit', p, sign: s.sign, fm, house: J.houseFrom(s.sign, asc), good });
      });
    });
    // Dashas
    const ms = c.dasha.mahas;
    ms.forEach((m, mi) => {
      if (!inWin(m.start, m.end)) return;
      if (mi > 0 && m.start > from && m.start < to) {
        const prev = ms[mi - 1].lord;
        hard.push({ cat: 'Dasha', from: new Date(m.start.getTime() - 183 * DAY), to: new Date(m.start.getTime() + 183 * DAY), sev: 2, title: `Dasha Sandhi: ${PN(prev)} to ${PN(m.lord)}`, why: `Your major period changes from ${PN(prev)} to ${PN(m.lord)} on ${m.start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}. The six months on either side are a junction.`, ill: 'The old period\'s structures loosen before the new ones form: uncertainty, changes of role or place, and unsettled health or mood.', cope: 'Avoid locking in irreversible decisions in the last months of the outgoing period. Close loose ends, keep savings liquid, and let the new direction show itself.', planets: [prev, m.lord] });
        trans.push({ date: m.start, kind: 'maha', prev, lord: m.lord });
      }
      J.subPeriods(m).forEach(a => {
        if (!inWin(a.start, a.end)) return;
        if (a.start > from && a.start - from < 5 * J.YEAR && a.start.getTime() !== m.start.getTime()) trans.push({ date: a.start, kind: 'antar', maha: m.lord, lord: a.lord });
        const s = antarScore(c, m.lord, a.lord);
        if (s.b >= 2 && s.b - s.g >= 0.5) hard.push({ cat: 'Dasha', from: a.start, to: a.end, sev: s.b >= 3 ? 3 : 2, title: `${PN(m.lord)}–${PN(a.lord)} sub-period`, why: R.list(s.bad) + '.', ill: `Tends to bring ${D.ILL[a.lord]}. Most felt in ${D.HOUSES[s.house - 1].themes}.`, cope: D.COPE[a.lord], planets: [a.lord] });
        else if (s.g >= 2.5 && s.b <= 1) soft.push({ cat: 'Dasha', from: a.start, to: a.end, title: `${PN(m.lord)}–${PN(a.lord)} sub-period`, why: R.list(s.good).replace(/^./, ch => ch.toUpperCase()) + `. Good for ${D.PLANETS[a.lord].themes}.` });
      });
    });
    hard.forEach(h => { h.vfrom = clip(h.from); h.vto = clip(h.to); }); soft.forEach(h => { h.vfrom = clip(h.from); h.vto = clip(h.to); });
    hard.sort((a, b) => a.from - b.from); soft.sort((a, b) => a.from - b.from); trans.sort((a, b) => a.date - b.date);
    return { from, to, hard, soft, trans };
  }
  function transitionText(c, t) {
    if (t.kind === 'maha') return { title: `Major period changes: ${PN(t.prev)} to ${PN(t.lord)}`, sev: 'bad', text: `A change of chapter. ${D.DASHA[t.lord]}`, ill: 'Expect several unsettled months around the date as priorities, work or residence shift.', cope: 'Finish what belongs to the old period. Do not judge the new one by its first weeks.', p: t.lord };
    if (t.kind === 'antar') { const s = antarScore(c, t.maha, t.lord), hard = s.b >= 2 && s.b - s.g >= 0.5; return { title: `Sub-period changes to ${PN(t.maha)}–${PN(t.lord)}`, sev: hard ? 'warn' : 'good', text: `Focus moves to ${D.PLANETS[t.lord].themes}, through your ${ord(s.house)} house.`, ill: hard ? `This one is flagged: it can bring ${D.ILL[t.lord]}.` : 'No particular strain is indicated; the first few weeks can still feel like a change of pace.', cope: hard ? D.COPE[t.lord] : 'Use the opening weeks to set intentions for this planet\'s themes.', p: t.lord }; }
    return { title: `${PN(t.p)} enters ${SN(t.sign)}`, sev: t.good ? 'good' : 'warn', text: `It moves into your ${ord(t.house)} house (${D.HOUSES[t.house - 1].title.toLowerCase()}), ${ord(t.fm)} from your Moon: traditionally a ${t.good ? 'favourable' : 'testing'} position.`, ill: t.good ? 'The weeks of the changeover can still feel unsettled as the old themes close.' : `While it lasts it can bring ${D.ILL[t.p]}, felt mostly in ${D.HOUSES[t.house - 1].themes}.`, cope: t.good ? `Use it: put effort into ${D.HOUSES[t.house - 1].themes}.` : D.COPE[t.p], p: t.p };
  }
  function remedyPlan(c, sat, cd) {
    const why = {}, add = (p, r) => { (why[p] = why[p] || []).push(r); }, now = new Date();
    if (cd) { add(cd.m.lord, 'runs your current major period'); if (cd.a.lord !== cd.m.lord) add(cd.a.lord, 'runs your current sub-period'); }
    if (sat.cycles.some(x => now >= x.start && now < x.end)) add('Sa', 'Sade Sati is running'); else if (sat.dhaiya.some(x => now >= x.from && now < x.to)) add('Sa', 'a Dhaiya is running');
    J.P.forEach(p => { const o = c.planets[p]; if (o.dignity === 'debilitated') add(p, 'is debilitated in your chart'); if (o.combust) add(p, 'is combust in your chart'); });
    if (c.planets.Ju.sign === c.planets.Ra.sign) add('Ju', 'is joined by Rahu (Guru Chandala)');
    const lagnaLord = c.houses[0].lord; if ([6, 8, 12].includes(c.planets[lagnaLord].house) || c.planets[lagnaLord].dignity === 'debilitated') add(lagnaLord, 'is your Lagna lord and needs strengthening');
    return Object.keys(why).map(p => ({ p, why: [...new Set(why[p])] })).sort((a, b) => b.why.length - a.why.length);
  }
  Object.assign(R, { gemPlan, daily, watch, transitionText, remedyPlan, antarScore, nakEnd });
})(typeof window !== 'undefined' ? window : globalThis);
