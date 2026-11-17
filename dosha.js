/* Doshas: detection, what tradition says, what eases it, simple remedies and the formal shanti vidhan.
   Detection rules are stated on every card so a reader can check them. Remedies are traditional practice, not guarantees. */
(function (root) {
  'use strict';
  const J = root.Jyotish, D = root.JD, R = root.JRules;
  const ord = n => n + (['th', 'st', 'nd', 'rd'][(n % 100 > 10 && n % 100 < 14) ? 0 : n % 10] || 'th');
  const N = p => D.PLANETS[p].name, SG = i => D.SIGNS[i].name, NK = i => D.NAK[i].name;
  const list = a => a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];
  const M = p => `${D.REMEDY[p].tr} (${D.REMEDY[p].dev})`;

  // Japa counts commonly prescribed for a full graha shanti (one anushthana). Many priests multiply by four in Kali Yuga.
  const JAPA = { Su: 7000, Mo: 11000, Ma: 10000, Me: 9000, Ju: 19000, Ve: 16000, Sa: 23000, Ra: 18000, Ke: 17000 };
  const japa = p => `${M(p)}: ${JAPA[p].toLocaleString('en-IN')} repetitions in total (the commonly prescribed count; spread it over 11 to 40 days)`;
  const COMMON_START = 'On the chosen day: bath, clean clothes, a lamp, Ganesha puja, then a sankalpa (a statement of your name, gotra if known, and the purpose of the shanti).';
  const COMMON_END = 'Close with aarti, a gift (dakshina) to the priest, feeding people in need, and a quiet prayer for forgiveness of any error in the rite.';

  // Gandmool nakshatras: the six at the junctions of water and fire signs
  const GANDMOOL = {
    0: { lord: 'Ke', deity: 'the Ashwini Kumaras', dm: 'Om Ashvinikumarabhyam Namah', junction: 1 },
    8: { lord: 'Me', deity: 'the Sarpas (serpent deities)', dm: 'Om Sarpebhyo Namah', junction: 4 },
    9: { lord: 'Ke', deity: 'the Pitris (ancestors)', dm: 'Om Pitribhyo Namah', junction: 1 },
    17: { lord: 'Me', deity: 'Indra', dm: 'Om Indraya Namah', junction: 4 },
    18: { lord: 'Ke', deity: 'Nirriti', dm: 'Om Nirritaye Namah', junction: 1 },
    26: { lord: 'Me', deity: 'Pushan', dm: 'Om Pushne Namah', junction: 4 }
  };
  const WATER = [3, 7, 11], FIRE = [0, 4, 8];
  function gandantaOf(lon) { // within the last pada of a water sign or the first pada of a fire sign (3°20')
    const s = Math.floor(J.norm(lon) / 30), d = J.norm(lon) - s * 30;
    if (WATER.includes(s) && d >= 30 - 10 / 3) return { side: 'end', sign: s, dist: 30 - d };
    if (FIRE.includes(s) && d < 10 / 3) return { side: 'start', sign: s, dist: d };
    return null;
  }
  const dmsShort = x => `${Math.floor(x)}°${String(Math.floor((x % 1) * 60)).padStart(2, '0')}′`;

  // Eclipse at birth: umbral lunar eclipse with the Moon above the horizon, or a local solar eclipse in progress.
  function eclipseAt(c) {
    const A = root.Astronomy; if (!A) return null;
    const t = c.date, obs = new A.Observer(c.input.lat, c.input.lon, 0), from = new Date(t.getTime() - 2 * 864e5);
    try {
      const le = A.SearchLunarEclipse(from);
      if (le && le.kind !== 'penumbral' && le.sd_partial > 0 && Math.abs(t - le.peak.date) <= le.sd_partial * 60000) {
        const eq = A.Equator(A.Body.Moon, t, obs, true, true), hor = A.Horizon(t, obs, eq.ra, eq.dec, 'normal');
        if (hor.altitude > 0) return { body: 'Moon', kind: le.kind, peak: le.peak.date };
      }
      const se = A.SearchLocalSolarEclipse(from, obs);
      if (se && se.partial_begin && se.partial_begin.time.date <= t && t <= se.partial_end.time.date) {
        const eq = A.Equator(A.Body.Sun, t, obs, true, true), hor = A.Horizon(t, obs, eq.ra, eq.dec, 'normal');
        if (hor.altitude > 0) return { body: 'Sun', kind: se.kind, peak: se.peak.time.date };
      }
    } catch (e) { /* astronomy library unavailable or failed: skip this check */ }
    return null;
  }

  function doshas(c) {
    const pl = c.planets, pg = c.panchang, found = [], clear = [], y = R.yogas(c);
    const add = o => found.push(Object.assign({ status: 'present', ease: [], areas: [], daily: [], vidhan: null }, o));
    const ok = (name, rule) => clear.push({ name, rule });
    const Y = n => y.find(v => v.name === n);

    /* ---------- 1. Gandmool ---------- */
    const mn = pl.Mo.nak, gm = GANDMOOL[mn.index];
    if (gm) {
      const atJ = mn.pada === gm.junction;
      add({
        id: 'gandmool', name: 'Gandmool (Mool) Dosha', group: 'birth', status: atJ ? 'present' : 'mild', src: 'Classical: Muhurta and Jataka texts (for example Muhurta Chintamani); practised widely in North and Central India.',
        why: `The Moon is in ${NK(mn.index)} pada ${mn.pada}. ${NK(mn.index)} is one of the six Gandmool nakshatras (Ashwini, Ashlesha, Magha, Jyeshtha, Moola and Revati), which sit where a water sign meets a fire sign. ${atJ ? `Pada ${mn.pada} is the pada right at that junction, the most sensitive one.` : `Pada ${mn.pada} is not the junction pada (that is pada ${gm.junction}), so tradition treats this as mild.`}`,
        says: 'Tradition holds that a child born in these stars brings strong change into the family in its early years, and that the effect falls on a particular relative (father, mother, sibling) or on wealth, depending on the pada. The texts differ on which pada affects whom. Many children born in these stars do very well; Moola and Ashwini natives in particular are often energetic and capable.',
        areas: ['early childhood', 'parents and family'],
        ease: atJ ? [] : ['the Moon is not in the junction pada'],
        daily: [`On the day each month when the Moon is in ${NK(mn.index)}, recite ${gm.dm} and ${M(gm.lord)} 108 times.`, `Worship Ganesha for ${gm.lord === 'Ke' ? 'Ketu' : 'Mercury'}-ruled stars${gm.lord === 'Me' ? ', and Vishnu (Vishnu Sahasranama) on Wednesdays' : ''}.`, gm.lord === 'Ke' ? 'Feed stray dogs or give a blanket to someone in need on a Tuesday or Saturday.' : 'Give green moong or school supplies to children on a Wednesday.'],
        vidhan: {
          title: 'Gandmool (Moola) Shanti',
          when: `Traditionally on the 27th day after birth, when the Moon first returns to ${NK(mn.index)}. If that was missed, it is done on any later day when the Moon is in ${NK(mn.index)}, ideally in a waxing fortnight. It can be done at any age.`,
          steps: [COMMON_START,
            'A kalash (pot) is filled with water drawn from several sources and with the leaves or roots of many plants (traditionally 27, one for each nakshatra), and placed on rice.',
            `Puja of the nakshatra deity, ${gm.deity}, with the name mantra ${gm.dm}, and of the Navagrahas.`,
            japa(gm.lord) + '.',
            `Homa (fire offering) with ghee and the samidha (sacred wood) of ${gm.lord === 'Ke' ? 'kusha grass' : 'apamarga'}, the wood associated with ${N(gm.lord)}.`,
            'Abhisheka: the child (or the adult native) and the parents are sprinkled with the kalash water.',
            'In many families the father first sees the child\'s face reflected in a bowl of oil (chhaya darshan), and the oil is then given away.',
            `Daan: ${gm.lord === 'Ke' ? 'a blanket, sesame and a multi-coloured cloth' : 'green moong, green cloth and books'}.`,
            COMMON_END]
        }
      });
    } else ok('Gandmool (Mool) Dosha', `The Moon is in ${NK(mn.index)}, which is not one of the six Gandmool nakshatras.`);

    /* ---------- 2. Gandanta (Moon, Lagna) ---------- */
    const gandaHits = [];
    const gMo = gandantaOf(pl.Mo.lon); if (gMo) gandaHits.push(['Moon', gMo]);
    const gAs = gandantaOf(c.asc.sign * 30 + c.asc.deg); if (gAs) gandaHits.push(['Lagna', gAs]);
    if (gandaHits.length) {
      const tight = gandaHits.some(([, g]) => g.dist < 0.8);
      const others = J.P.filter(p => p !== 'Mo' && p !== 'Ra' && p !== 'Ke' && gandantaOf(pl[p].lon));
      add({
        id: 'gandanta', name: 'Gandanta Dosha', group: 'birth', status: tight ? 'present' : 'mild', src: 'Classical: Brihat Parashara Hora Shastra and Muhurta texts describe the sign–nakshatra junctions as gandanta ("knot at the end").',
        why: gandaHits.map(([w, g]) => `The ${w} is ${dmsShort(g.dist)} ${g.side === 'end' ? `before the end of ${SG(g.sign)}` : `into ${SG(g.sign)}`}, inside the junction between a water sign and a fire sign.`).join(' ') + (tight ? ' It is within 48′ of the exact junction, the tightest zone.' : ' It is in the junction pada but not at the exact knot, so the effect is milder.'),
        says: 'The junctions of Cancer–Leo, Scorpio–Sagittarius and Pisces–Aries are points where one cycle ends and another begins. A Moon or Lagna there is linked with an intense, transforming start to life and a deep inner search later. It overlaps with Gandmool: the same zones contain the junction padas of the Gandmool stars.',
        areas: ['health in childhood', 'mind and emotions'],
        note: others.length ? `${list(others.map(N))} ${others.length > 1 ? 'are' : 'is'} also in a gandanta zone, which matters less than the Moon or Lagna.` : null,
        daily: ['Recite the Mahamrityunjaya mantra (Rig Veda 7.59.12) 11 or 108 times daily.', 'Worship Ganesha, remover of obstacles, at the start of each day.', `Recite ${M(pl.Mo.nak.lord === 'Ke' || pl.Mo.nak.lord === 'Me' ? pl.Mo.nak.lord : 'Mo')} on Mondays.`],
        vidhan: { title: 'Gandanta Shanti', when: 'Usually done together with Gandmool Shanti, on a day the Moon is in the birth nakshatra.', steps: [COMMON_START, 'Kalash and Navagraha puja as for Gandmool Shanti.', 'Mahamrityunjaya japa (often 11,000 or 1,25,000 in total by priests) with homa.', 'Abhisheka of the native with the kalash water.', 'Daan of sesame, rice and a cow\'s ghee lamp at a temple.', COMMON_END] }
      });
    } else ok('Gandanta Dosha', 'Neither the Moon nor the Lagna is in the junction pada between a water sign and a fire sign.');

    /* ---------- 3. Mangal ---------- */
    const mg = Y('Mangal Dosha (Manglik)');
    if (mg) add({
      id: 'mangal', name: 'Mangal Dosha (Manglik)', group: 'chart', status: mg.kind === 'caution' ? 'present' : 'eased', src: 'Classical root in South Indian texts (for example the 1st, 2nd, 4th, 7th, 8th and 12th houses rule); cancellations from later manuals.',
      why: mg.why, says: 'Mars brings heat, speed and a need for independence into partnership. Tradition checks it when matching charts; a match between two Manglik charts is considered balanced. It is very common (counting from Lagna, Moon and Venus, more than half of all charts qualify) and is widely held to ease after age 28.',
      areas: ['marriage', 'partnership harmony'], ease: mg.kind === 'mixed' && mg.note ? [mg.note.replace(/^Eased here because /, '').replace(/\.$/, '')] : [], note: mg.kind === 'caution' ? mg.note : null,
      daily: ['Recite the Hanuman Chalisa on Tuesdays and Saturdays.', `Recite ${M('Ma')} 108 times on Tuesdays.`, 'Regular hard physical exercise is the most practical outlet for Mars.', 'Give red lentils (masoor) or donate blood on a Tuesday.'],
      vidhan: { title: 'Mangal Shanti (Bhaum Shanti)', when: 'On a Tuesday in a waxing fortnight, ideally before marriage. Ujjain\'s Mangalnath temple is a traditional place for it.', steps: [COMMON_START, 'Puja of Mangal (Mars) with red flowers, red sandal and red cloth.', japa('Ma') + '.', 'Homa with khadira (catechu) samidha, the wood of Mars.', 'Daan of red lentils, jaggery, copper and red cloth.', 'Some families also perform Kumbh Vivah (a symbolic marriage to a pot or a Vishnu image) before the wedding. It is a custom, not a requirement; good chart matching matters more.', COMMON_END] }
    }); else ok('Mangal Dosha', 'Mars is not in the 1st, 2nd, 4th, 7th, 8th or 12th from the Lagna, the Moon or Venus.');

    /* ---------- 4. Kaal Sarp ---------- */
    const ks = Y('Kaal Sarp Yoga');
    if (ks) add({
      id: 'kaalsarp', name: 'Kaal Sarp Dosha', group: 'chart', status: 'present', src: 'Popular modern. It is not in Parashara or the other classical texts, and many traditional astrologers give it little weight.',
      why: ks.why, says: 'Life moves in strong swings with a sense of fate: delays, then breakthroughs. Many accomplished people have it. Read it as intensity, not misfortune.', areas: ['timing of success', 'peace of mind'],
      daily: ['Recite "Om Namah Shivaya" 108 times; offer water to a Shiva linga on Mondays.', `Recite ${M('Ra')} on Saturdays and ${M('Ke')} on Tuesdays.`, 'Worship on Nag Panchami.'],
      vidhan: { title: 'Kaal Sarp Shanti', when: 'On Nag Panchami, an Amavasya, or a day when the Moon is in Ardra, Swati or Shatabhisha (Rahu\'s stars). Trimbakeshwar (Nashik) and Srikalahasti (Andhra Pradesh) are the best-known places.', steps: [COMMON_START, 'Puja of a silver or copper image of a serpent pair (naga-nagin), with Shiva and the Navagrahas.', 'Rahu and Ketu japa: ' + japa('Ra') + '; ' + japa('Ke') + '.', 'Rudrabhisheka (bathing the Shiva linga while reciting Sri Rudram).', 'The serpent image is immersed in flowing water or given to the temple.', COMMON_END] }
    }); else ok('Kaal Sarp Dosha', 'The seven planets are not all on one side of the Rahu–Ketu axis.');

    /* ---------- 5. Pitra ---------- */
    {
      const h9 = c.houses[8], l9 = h9.lord, r = [];
      if (pl.Su.sign === pl.Ra.sign) r.push('the Sun is with Rahu');
      if (pl.Su.sign === pl.Ke.sign) r.push('the Sun is with Ketu');
      if (pl.Su.sign === pl.Sa.sign) r.push('the Sun is with Saturn');
      if (pl.Ra.house === 9) r.push('Rahu is in the 9th house (father and ancestors)');
      if (pl.Ke.house === 9) r.push('Ketu is in the 9th house (father and ancestors)');
      if (l9 !== 'Ra' && l9 !== 'Ke' && (pl[l9].sign === pl.Ra.sign || pl[l9].sign === pl.Ke.sign)) r.push(`the 9th lord ${N(l9)} is with ${pl[l9].sign === pl.Ra.sign ? 'Rahu' : 'Ketu'}`);
      if (r.length) add({
        id: 'pitra', name: 'Pitra Dosha', group: 'chart', status: r.length > 1 ? 'present' : 'mild', src: 'Popular. The rules are not uniform; this app uses the most widely used ones (Sun with Rahu, Ketu or Saturn; a node in the 9th; the 9th lord with a node). Parashara\'s chapter on curses from past lives is the classical root.',
        why: `Here ${list(r)}.`, says: 'Read as unfinished duties toward ancestors or a strained line of fathers. It is linked with delays in progress, with the father\'s health or relationship, and sometimes with children. The traditional answer is gratitude and service toward ancestors and elders.',
        areas: ['father', 'fortune', 'children'],
        daily: ['Offer water and black sesame (tarpan) to ancestors on every Amavasya.', 'Feed crows, cows or people in need in your ancestors\' memory.', 'Water a peepal tree on Saturdays.', `Recite ${M('Su')} at sunrise.`],
        vidhan: { title: 'Pitra Dosha Shanti', when: 'During Pitru Paksha (the dark fortnight of Bhadrapada) or on any Amavasya. Gaya, Trimbakeshwar and Haridwar are traditional places.', steps: [COMMON_START, 'Shraddha with pinda daan (rice balls offered to ancestors) for three generations on both sides.', 'Tarpan with water, black sesame and kusha grass.', 'Narayan Bali or Tripindi Shraddha where a priest advises it for a specific family history.', 'Feeding Brahmins or people in need, and a gift of clothes in the ancestors\' name.', COMMON_END] }
      }); else ok('Pitra Dosha', 'The Sun is not with Rahu, Ketu or Saturn, no node is in the 9th house, and the 9th lord is not with a node.');
    }

    /* ---------- 6. Node and Saturn conjunction doshas (detected in the yogas list) ---------- */
    const CONJ = [
      ['Grahan Yoga (Sun)', 'grahan-su', 'Grahan Dosha (Sun)', ['confidence', 'father', 'career'], 'Su', 'Aditya Hridayam on Sundays and offering water to the rising Sun'],
      ['Grahan Yoga (Moon)', 'grahan-mo', 'Grahan Dosha (Moon)', ['peace of mind', 'mother', 'sleep'], 'Mo', '"Om Namah Shivaya" and a Monday fast or light meal'],
      ['Guru Chandala Yoga', 'chandal', 'Guru Chandal Dosha', ['learning', 'advisers', 'children'], 'Ju', 'Vishnu Sahasranama on Thursdays and respect for teachers'],
      ['Shrapit Yoga', 'shrapit', 'Shrapit Dosha', ['career delays', 'persistence'], 'Sa', 'Hanuman Chalisa on Saturdays and service to elderly or labouring people'],
      ['Angarak Yoga', 'angarak', 'Angarak Dosha', ['anger', 'accidents', 'property disputes'], 'Ma', 'Hanuman Chalisa on Tuesdays and channelling energy into exercise'],
      ['Vish Yoga', 'vish', 'Vish Dosha', ['peace of mind', 'mother'], 'Mo', 'Shiva worship on Mondays and a steady sleep routine']
    ];
    CONJ.forEach(([yn, id, name, areas, p, simple]) => {
      const v = Y(yn); if (!v) return ok(name, 'The planets that form it are not in the same sign.');
      const node = /Grahan|Chandala|Shrapit|Angarak/.test(yn) ? (v.why.includes('Ketu') ? 'Ke' : 'Ra') : 'Sa';
      add({ id, name, group: 'chart', status: v.note ? 'mild' : 'present', src: 'Named in later Jyotish manuals; the conjunctions themselves are discussed in the classical texts.', why: v.why, says: v.meaning, areas, note: v.note,
        daily: [`${simple[0].toUpperCase() + simple.slice(1)}.`, `Recite ${M(p)} and ${M(node)} 108 times on ${[...new Set([D.REMEDY[p].day, D.REMEDY[node].day])].join(' and ')}.`, `Give: ${D.REMEDY[node].give}`],
        vidhan: { title: `${N(p)}–${N(node)} Shanti`, when: `On ${D.REMEDY[p].day} in a waxing fortnight, or during an eclipse for Grahan Dosha.`, steps: [COMMON_START, `Navagraha puja with special worship of ${N(p)} and ${N(node)}.`, japa(p) + '.', japa(node) + '.', 'Homa with the samidha of both planets.', `Daan: ${[...new Set([D.REMEDY[p].give, D.REMEDY[node].give])].join(' ')}`, COMMON_END] } });
    });

    /* ---------- 7. Kemadruma ---------- */
    const km = Y('Kemadruma Yoga');
    if (km) add({ id: 'kemadruma', name: 'Kemadruma Dosha', group: 'chart', status: km.kind === 'caution' ? 'present' : 'eased', src: 'Classical: Brihat Parashara Hora Shastra, Phaladeepika.', why: km.why, says: km.meaning, areas: ['peace of mind', 'support from others'], ease: km.note ? [km.note.replace(/^Largely cancelled here: /, '').replace(/\.$/, '')] : [],
      daily: ['Worship Shiva or Goddess Parvati on Mondays.', `Recite ${M('Mo')} 108 times in the evening.`, 'Keep up friendships deliberately; loneliness is the main risk this points to.', 'Give rice, milk or white cloth on Mondays.'],
      vidhan: { title: 'Chandra Shanti', when: 'On a Monday in a waxing fortnight, or on a Purnima.', steps: [COMMON_START, 'Puja of the Moon with white flowers and a silver or white vessel of milk.', japa('Mo') + '.', 'Homa with palasha samidha, the wood of the Moon.', 'Daan of rice, milk, white cloth and silver.', COMMON_END] } });
    else ok('Kemadruma Dosha', 'The Moon has a planet beside it or in the signs on either side.');

    /* ---------- 8. Moment-of-birth doshas from the Panchang ---------- */
    const t = pg.tithi;
    if (t === 29) add({ id: 'amavasya', name: 'Amavasya Janma (Darsha Dosha)', group: 'moment', status: 'present', src: 'Classical: Muhurta texts on janma doshas.', why: 'Birth fell on Amavasya, the new-moon tithi, when the Moon is hidden.', says: 'The Moon (mind, mother, nourishment) is at its weakest. Tradition links it with sensitivity, a strong bond with ancestors and early financial strain in the family.', areas: ['mind', 'mother', 'family finances'],
      daily: ['Offer water and sesame to ancestors on each Amavasya.', `Recite ${M('Mo')} on Mondays and ${M('Su')} at sunrise.`, 'Light a ghee lamp in the evening on Amavasya.'],
      vidhan: { title: 'Darsha (Amavasya) Janma Shanti', when: 'On the next Amavasya after birth, or any Amavasya.', steps: [COMMON_START, 'Puja of the Sun and Moon (traditionally a gold image of the Sun and a silver image of the Moon).', japa('Su') + '; ' + japa('Mo') + '.', 'Pitru tarpan with sesame water.', 'Daan of rice, ghee, silver and white cloth.', COMMON_END] } });
    else ok('Amavasya Janma', 'Birth was not on the new-moon tithi.');

    if (t === 28) { const part = Math.min(6, Math.floor((1 - pg.tithiLeft) * 6) + 1);
      add({ id: 'chaturdashi', name: 'Krishna Chaturdashi Janma', group: 'moment', status: part >= 4 ? 'present' : 'mild', src: 'Classical: Muhurta texts divide this tithi into six parts with different results.', why: `Birth fell on Krishna Chaturdashi (the 14th of the waning fortnight), in part ${part} of 6.`, says: 'The night before the new moon is ruled by Shiva. The texts treat the later parts of this tithi as the more sensitive, with effects on parents or the native\'s early health.', areas: ['parents', 'early health'],
        daily: ['Worship Shiva on Mondays and on every Masik Shivaratri (this same tithi each month).', 'Recite the Mahamrityunjaya mantra 108 times.'],
        vidhan: { title: 'Krishna Chaturdashi Shanti', when: 'On a Masik Shivaratri or Maha Shivaratri.', steps: [COMMON_START, 'Rudrabhisheka with milk, curd, honey, ghee and water.', 'Mahamrityunjaya japa with homa of sesame and ghee.', 'Daan of sesame, a black blanket and food.', COMMON_END] } }); }
    else ok('Krishna Chaturdashi Janma', 'Birth was not on the 14th tithi of the waning fortnight.');

    { const sd = pl.Su.deg, sp = Math.abs(pl.Su.speed) || 1, hrs = Math.min(sd, 30 - sd) / sp * 24;
      if (hrs <= 6) add({ id: 'sankranti', name: 'Sankranti Janma', group: 'moment', status: 'present', src: 'Classical: Muhurta texts on janma doshas.', why: `The Sun was ${hrs.toFixed(1)} hours ${sd < 15 ? `after entering ${SG(pl.Su.sign)}` : `before leaving ${SG(pl.Su.sign)}`} (sidereal), inside the sankranti window.`, says: 'A birth at the moment the Sun changes sign is held to bring an unsettled start and a strong drive for change; the Sun (vitality, father, status) is in transition.', areas: ['father', 'vitality', 'career start'],
        daily: ['Offer water to the rising Sun and recite the Gayatri mantra.', 'Recite Aditya Hridayam on Sundays.', 'Give wheat and jaggery on each Sankranti.'],
        vidhan: { title: 'Sankranti Janma Shanti', when: 'On the next Sankranti (the Sun\'s entry into a sign), or on a Sunday.', steps: [COMMON_START, 'Surya puja with red flowers and red sandal; Navagraha puja.', japa('Su') + '.', 'Homa with arka (calotropis) samidha, the wood of the Sun.', 'Daan of wheat, jaggery, copper and red cloth.', COMMON_END] } });
      else ok('Sankranti Janma', `The Sun was not within six hours of changing sign (it was ${Math.round(hrs / 24)} days away).`); }

    { const e = eclipseAt(c);
      if (e) add({ id: 'grahan-janma', name: `Grahan Janma (${e.body === 'Sun' ? 'solar' : 'lunar'} eclipse at birth)`, group: 'moment', status: 'present', src: 'Classical: Muhurta texts; an eclipse visible at the birthplace.', why: `${/^[aeiou]/.test(e.kind) ? "An" : "A"} ${e.kind} ${e.body === 'Sun' ? 'solar' : 'lunar'} eclipse was in progress and visible at the birthplace at the time of birth.`, says: `The ${e.body === 'Sun' ? 'Sun (vitality, father)' : 'Moon (mind, mother)'} is eclipsed. Tradition treats this as one of the strongest janma doshas and prescribes a shanti soon after birth.`, areas: e.body === 'Sun' ? ['father', 'vitality'] : ['mother', 'mind'],
        daily: [`Recite ${M(e.body === 'Sun' ? 'Su' : 'Mo')} and ${M('Ra')} 108 times.`, 'Recite the Mahamrityunjaya mantra daily.', 'During every later eclipse, sit quietly, chant and give charity afterwards.'],
        vidhan: { title: 'Grahan Janma Shanti', when: 'Soon after birth on a suitable day, or during a later eclipse of the same kind.', steps: [COMMON_START, `Puja of images of the ${e.body === 'Sun' ? 'Sun (gold)' : 'Moon (silver)'} and of Rahu (traditionally lead or a naga image).`, japa(e.body === 'Sun' ? 'Su' : 'Mo') + '; ' + japa('Ra') + '.', 'Homa with durva grass and sesame.', 'Daan of the images, sesame, a blanket and food.', COMMON_END] } });
      else ok('Grahan Janma', 'No solar or lunar eclipse was in progress and visible at the birthplace at the time of birth.'); }

    if (pg.karana === 6) add({ id: 'bhadra', name: 'Vishti (Bhadra) Karana Janma', group: 'moment', status: 'mild', src: 'Classical: Muhurta texts.', why: 'Birth fell in Vishti karana (also called Bhadra), the half-tithi traditionally avoided for new beginnings.', says: 'Linked with a restless, sometimes combative temperament. Treated as a lighter janma dosha than Gandmool or an eclipse.', areas: ['temperament'],
      daily: ['Worship Ganesha and recite the Ganesha Atharvashirsha or "Om Gam Ganapataye Namah" 108 times.', 'Keep a steady routine; Bhadra is about restlessness.'],
      vidhan: { title: 'Bhadra Shanti', when: 'On a day without Vishti karana in a waxing fortnight.', steps: [COMMON_START, 'Ganesha and Shiva puja.', 'Japa of "Om Namah Shivaya" (11,000 times) with homa of sesame.', 'Daan of sesame, food and a lamp.', COMMON_END] } });
    else ok('Vishti (Bhadra) Karana', `Birth was in ${D.KARANA ? D.KARANA[pg.karana] : 'another'} karana.`);

    if (pg.yoga === 16 || pg.yoga === 26) { const nm = pg.yoga === 16 ? 'Vyatipata' : 'Vaidhriti';
      add({ id: 'yoga-janma', name: `${nm} Yoga Janma`, group: 'moment', status: 'mild', src: 'Classical: Muhurta texts list Vyatipata and Vaidhriti among the inauspicious nitya yogas for birth.', why: `Birth fell in ${nm}, one of the 27 daily yogas (the Sun–Moon combination), traditionally avoided for beginnings.`, says: 'Linked with obstacles at the start of ventures and the need to plan before acting.', areas: ['beginnings', 'ventures'],
        daily: ['Recite the Vishnu Sahasranama or "Om Namo Narayanaya" 108 times.', 'Offer water to the Sun at sunrise.'],
        vidhan: { title: `${nm} Janma Shanti`, when: `On a day without ${nm} yoga, ideally a Sunday or Thursday.`, steps: [COMMON_START, 'Vishnu and Surya puja; Navagraha puja.', 'Japa of "Om Namo Narayanaya" with homa.', 'Daan of food, cloth and a cow\'s ghee lamp.', COMMON_END] } }); }
    else ok('Vyatipata or Vaidhriti Yoga', `Birth was in ${D.YOGA27 ? D.YOGA27[pg.yoga] : 'another'} yoga.`);

    { const e = pg.elong % 60, d = Math.min(e, 60 - e);
      if (d < 0.2) add({ id: 'tithi-gandanta', name: 'Tithi Gandanta', group: 'moment', status: 'mild', src: 'Classical: Muhurta texts (the junction of Purna and Nanda tithis).', why: 'Birth fell within one ghati (about 24 minutes) of the change between a Purna tithi (5th, 10th or 15th) and the next Nanda tithi (1st, 6th or 11th).', says: 'A junction of lunar days, read like the other gandantas: a turning point at the start of life.', areas: ['beginnings'],
        daily: ['Recite the Mahamrityunjaya mantra daily.', 'Worship Ganesha.'],
        vidhan: { title: 'Tithi Gandanta Shanti', when: 'Usually combined with any other janma shanti; otherwise on the birth tithi.', steps: [COMMON_START, 'Navagraha puja.', 'Mahamrityunjaya japa with homa.', 'Daan of sesame and food.', COMMON_END] } });
      else ok('Tithi Gandanta', 'Birth was not within 24 minutes of a Purna–Nanda tithi junction.'); }

    const rank = { present: 0, eased: 2, mild: 1 };
    found.sort((a, b) => rank[a.status] - rank[b.status]);
    return { found, clear };
  }

  R.doshas = doshas;
  R.DOSHA_NOTE = 'A dosha marks a tendency the tradition asks you to handle with care, not a sentence. Most are common, most have conditions that ease them, and all of them act only in the matching dasha periods and transits. The simple daily remedies are free and can be done by anyone. A formal shanti is optional; if you choose one, ask a qualified priest, agree the cost in advance, and be wary of anyone who uses fear to sell it.';
})(typeof window !== 'undefined' ? window : globalThis);
