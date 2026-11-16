/* Jyotish engine: astronomy + Vedic calculations. Needs global `Astronomy` (astronomy-engine). */
(function (root) {
  'use strict';
  const A = root.Astronomy || (typeof require !== 'undefined' ? require('astronomy-engine') : null);
  const D2R = Math.PI / 180, R2D = 180 / Math.PI, DAY = 86400000;
  const norm = x => ((x % 360) + 360) % 360;
  const diff = (a, b) => { let d = norm(a - b); return d > 180 ? d - 360 : d; };

  const P = ['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa', 'Ra', 'Ke'];
  const BODY = { Su: 'Sun', Mo: 'Moon', Ma: 'Mars', Me: 'Mercury', Ju: 'Jupiter', Ve: 'Venus', Sa: 'Saturn' };
  const SIGN_LORD = ['Ma', 'Ve', 'Me', 'Mo', 'Su', 'Me', 'Ve', 'Ma', 'Ju', 'Sa', 'Sa', 'Ju'];
  const EXALT = { Su: [0, 10], Mo: [1, 3], Ma: [9, 28], Me: [5, 15], Ju: [3, 5], Ve: [11, 27], Sa: [6, 20] };
  const MOOLA = { Su: [4, 0, 20], Mo: [1, 3, 30], Ma: [0, 0, 12], Me: [5, 15, 20], Ju: [8, 0, 10], Ve: [6, 0, 15], Sa: [10, 0, 20] };
  const FRIENDS = { Su: ['Mo', 'Ma', 'Ju'], Mo: ['Su', 'Me'], Ma: ['Su', 'Mo', 'Ju'], Me: ['Su', 'Ve'], Ju: ['Su', 'Mo', 'Ma'], Ve: ['Me', 'Sa'], Sa: ['Me', 'Ve'], Ra: ['Ve', 'Sa', 'Me'], Ke: ['Ma', 'Ju'] };
  const ENEMIES = { Su: ['Ve', 'Sa'], Mo: [], Ma: ['Me'], Me: ['Mo'], Ju: ['Me', 'Ve'], Ve: ['Su', 'Mo'], Sa: ['Su', 'Mo', 'Ma'], Ra: ['Su', 'Mo', 'Ma'], Ke: ['Su', 'Mo'] };
  const COMBUST = { Mo: 12, Ma: 17, Me: 14, Ju: 11, Ve: 10, Sa: 15 };
  const ASPECTS = { Su: [7], Mo: [7], Me: [7], Ve: [7], Ma: [4, 7, 8], Ju: [5, 7, 9], Sa: [3, 7, 10], Ra: [5, 7, 9], Ke: [5, 7, 9] };
  const DASHA_ORDER = ['Ke', 'Ve', 'Su', 'Mo', 'Ma', 'Ra', 'Ju', 'Sa', 'Me'];
  const DASHA_YEARS = { Ke: 7, Ve: 20, Su: 6, Mo: 10, Ma: 7, Ra: 18, Ju: 16, Sa: 19, Me: 17 };
  const YEAR = 365.25 * DAY;
  // Ayanamsa value at J2000 (degrees), fitted to Swiss Ephemeris
  const AYAN0 = { lahiri: 23.857103, raman: 22.410802, kp: 23.760240 };

  const Tcent = d => (d.getTime() / DAY + 2440587.5 - 2451545.0) / 36525;

  function ayanamsa(d, sys) {
    const T = Tcent(d);
    return (AYAN0[sys || 'lahiri']) + (5028.796195 * T + 1.1054348 * T * T) / 3600;
  }
  function nutLon(d) {
    const T = Tcent(d);
    const O = (125.04452 - 1934.136261 * T) * D2R, L = (280.4665 + 36000.7698 * T) * D2R, L1 = (218.3165 + 481267.8813 * T) * D2R;
    return (-17.20 * Math.sin(O) - 1.32 * Math.sin(2 * L) - 0.23 * Math.sin(2 * L1) + 0.21 * Math.sin(2 * O)) / 3600;
  }
  function meanNode(d) {
    const T = Tcent(d);
    return norm(125.0445479 - 1934.1362891 * T + 0.0020754 * T * T + T * T * T / 467441);
  }
  // Tropical apparent longitude, true equinox of date
  function tropLon(p, d) {
    if (p === 'Su') return A.SunPosition(d).elon;
    if (p === 'Mo') { return A.Ecliptic(A.GeoMoon(d)).elon; }
    if (p === 'Ra') return norm(meanNode(d) + nutLon(d));
    if (p === 'Ke') return norm(meanNode(d) + 180 + nutLon(d));
    return A.Ecliptic(A.GeoVector(BODY[p], d, true)).elon;
  }
  function sidLon(p, d, sys) { return norm(tropLon(p, d) - nutLon(d) - ayanamsa(d, sys)); }
  function speed(p, d, sys) {
    const h = 3600000;
    return diff(sidLon(p, new Date(d.getTime() + h), sys), sidLon(p, new Date(d.getTime() - h), sys)) * 12;
  }
  function ascendant(d, lat, lon, sys) {
    const T = Tcent(d);
    const ramc = norm(A.SiderealTime(d) * 15 + lon) * D2R;
    const O = (125.04452 - 1934.136261 * T) * D2R;
    const eps = (23.4392911 - 0.0130042 * T + 9.2 / 3600 * Math.cos(O)) * D2R;
    const y = Math.cos(ramc), x = -(Math.sin(ramc) * Math.cos(eps) + Math.tan(lat * D2R) * Math.sin(eps));
    return norm(norm(Math.atan2(y, x) * R2D) - nutLon(d) - ayanamsa(d, sys));
  }

  function nak(lon) {
    const L = 360 / 27, i = Math.floor(lon / L), within = lon - i * L;
    return { index: i, pada: Math.floor(within / (L / 4)) + 1, frac: within / L, lord: DASHA_ORDER[i % 9] };
  }
  function dignity(p, sign, deg) {
    if (p === 'Ra' || p === 'Ke') {
      const l = SIGN_LORD[sign];
      return FRIENDS[p].includes(l) ? 'friend' : ENEMIES[p].includes(l) ? 'enemy' : 'neutral';
    }
    if (EXALT[p][0] === sign) return 'exalted';
    if ((EXALT[p][0] + 6) % 12 === sign) return 'debilitated';
    const m = MOOLA[p];
    if (m[0] === sign && deg >= m[1] && deg < m[2]) return 'moolatrikona';
    if (SIGN_LORD[sign] === p) return 'own';
    const l = SIGN_LORD[sign];
    return FRIENDS[p].includes(l) ? 'friend' : ENEMIES[p].includes(l) ? 'enemy' : 'neutral';
  }
  const navamsa = lon => Math.floor(lon / (30 / 9)) % 12;
  function dasamsa(lon) {
    const s = Math.floor(lon / 30), part = Math.floor((lon % 30) / 3);
    return ((s % 2 === 0 ? s : s + 8) + part) % 12;
  }
  function houseFrom(sign, refSign) { return ((sign - refSign + 12) % 12) + 1; }

  /* ---------- time zone helpers ---------- */
  function tzOffsetMin(utcMs, tz) {
    const f = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' });
    const o = {}; f.formatToParts(new Date(utcMs)).forEach(x => o[x.type] = +x.value);
    return (Date.UTC(o.year, o.month - 1, o.day, o.hour, o.minute, o.second) - Math.floor(utcMs / 1000) * 1000) / 60000;
  }
  // local wall-clock -> UTC Date. tz: IANA name or numeric offset in minutes
  function localToUtc(y, mo, d, h, mi, tz) {
    const wall = Date.UTC(y, mo - 1, d, h, mi);
    if (typeof tz === 'number') return { date: new Date(wall - tz * 60000), offset: tz };
    let off = tzOffsetMin(wall, tz);
    off = tzOffsetMin(wall - off * 60000, tz);
    return { date: new Date(wall - off * 60000), offset: off };
  }

  /* ---------- core chart ---------- */
  function placements(d, refAscSign, sys, nudge) {
    const out = {}; const sun = sidLon('Su', d, sys);
    P.forEach(p => {
      let lon = sidLon(p, d, sys); const raw = lon;
      const near = Math.round(lon / 30) * 30, gap = lon - near; // signed distance from nearest sign border
      let cusp = Math.abs(gap) < 0.05 ? { arcsec: Math.abs(gap) * 3600, other: gap < 0 ? (Math.floor(lon / 30) + 1) % 12 : (Math.floor(lon / 30) + 11) % 12 } : null;
      if (cusp && nudge && nudge[p]) { lon = norm(near + (gap < 0 ? 0.0003 : -0.0003)); cusp.flipped = true; cusp.other = Math.floor(raw / 30); }
      const sign = Math.floor(lon / 30), deg = lon - sign * 30;
      const sp = (p === 'Ra' || p === 'Ke') ? -0.05295 : speed(p, d, sys);
      const o = { key: p, lon, sign, deg, speed: sp, retro: sp < 0, nak: nak(lon), dignity: dignity(p, sign, deg), nav: navamsa(lon), d10: dasamsa(lon) };
      if (refAscSign != null) o.house = houseFrom(sign, refAscSign);
      if (COMBUST[p]) {
        let orb = COMBUST[p]; if (o.retro && p === 'Me') orb = 12; if (o.retro && p === 'Ve') orb = 8;
        o.sunDist = Math.abs(diff(lon, sun)); o.combust = o.sunDist < orb;
      }
      o.vargottama = o.nav === sign; if (cusp) o.cusp = cusp;
      out[p] = o;
    });
    return out;
  }

  function panchang(d, pl, lat, lon, offsetMin) {
    const e = norm(pl.Mo.lon - pl.Su.lon);
    const tithi = Math.floor(e / 12), kar = Math.floor(e / 6);
    const yoga = Math.floor(norm(pl.Mo.lon + pl.Su.lon) / (360 / 27));
    let karana; if (kar === 0) karana = 10; else if (kar >= 57) karana = kar - 57 + 7; else karana = (kar - 1) % 7;
    // weekday by sunrise
    const local = new Date(d.getTime() + offsetMin * 60000);
    const midnightUtc = new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()) - offsetMin * 60000);
    let sunrise = null, sunset = null, wd = local.getUTCDay();
    try {
      const obs = new A.Observer(lat, lon, 0);
      const sr = A.SearchRiseSet('Sun', obs, +1, midnightUtc, 1), ss = A.SearchRiseSet('Sun', obs, -1, midnightUtc, 1);
      sunrise = sr ? sr.date : null; sunset = ss ? ss.date : null;
      if (sunrise && d < sunrise) wd = (wd + 6) % 7;
    } catch (err) { }
    return { tithi, paksha: tithi < 15 ? 0 : 1, tithiLeft: 1 - (e % 12) / 12, yoga, karana, weekday: wd, civilWeekday: local.getUTCDay(), sunrise, sunset, elong: e };
  }

  function vimshottari(birth, moonLon) {
    const n = nak(moonLon), first = DASHA_ORDER.indexOf(n.lord);
    let start = birth.getTime() - n.frac * DASHA_YEARS[n.lord] * YEAR;
    const mahas = [];
    for (let i = 0; i < 9; i++) {
      const lord = DASHA_ORDER[(first + i) % 9], len = DASHA_YEARS[lord] * YEAR;
      mahas.push({ lord, start: new Date(start), end: new Date(start + len) });
      start += len;
    }
    return { balanceYears: (1 - n.frac) * DASHA_YEARS[n.lord], startLord: n.lord, mahas };
  }
  function subPeriods(period, parentLord) {
    // works for antar (within maha) and pratyantar (within antar): starts from the period's own lord
    const startLord = period.lord, first = DASHA_ORDER.indexOf(startLord), total = period.end - period.start;
    let s = period.start.getTime(); const out = [];
    for (let i = 0; i < 9; i++) {
      const lord = DASHA_ORDER[(first + i) % 9], len = total * DASHA_YEARS[lord] / 120;
      out.push({ lord, start: new Date(s), end: new Date(s + len) }); s += len;
    }
    return out;
  }

  function compute(input) {
    // input: {y,m,d,h,min, lat, lon, tz (IANA or minutes), ayanamsa}
    const sys = input.ayanamsa || 'lahiri';
    const t = localToUtc(input.y, input.m, input.d, input.h, input.min, input.tz);
    const date = t.date;
    const ascLon = ascendant(date, input.lat, input.lon, sys), ascSign = Math.floor(ascLon / 30);
    const planets = placements(date, ascSign, sys, input.nudge);
    const houses = [];
    for (let h = 1; h <= 12; h++) {
      const sign = (ascSign + h - 1) % 12;
      houses.push({ num: h, sign, lord: SIGN_LORD[sign], planets: P.filter(p => planets[p].sign === sign), aspectedBy: [] });
    }
    P.forEach(p => ASPECTS[p].forEach(a => { houses[(planets[p].house - 1 + a - 1) % 12].aspectedBy.push(p); }));
    const ag = Math.abs(ascLon - Math.round(ascLon / 30) * 30);
    const asc = { nearBorder: ag < 0.75 ? ag : null, lon: ascLon, sign: ascSign, deg: ascLon - ascSign * 30, nak: nak(ascLon), nav: navamsa(ascLon), d10: dasamsa(ascLon) };
    return {
      input, date, offsetMin: t.offset, ayanamsaSys: sys, ayanamsa: ayanamsa(date, sys), asc, planets, houses,
      panchang: panchang(date, planets, input.lat, input.lon, t.offset),
      dasha: vimshottari(date, planets.Mo.lon)
    };
  }

  /* ---------- transits ---------- */
  const STEP = { Su: 5, Mo: 0.4, Ma: 3, Me: 1, Ju: 5, Ve: 2, Sa: 5, Ra: 20, Ke: 20 };
  const signOf = (p, ms, sys) => Math.floor(sidLon(p, new Date(ms), sys) / 30);
  function bisect(f, a, b) { // f(a) != f(b); returns first ms where f equals f(b) side
    const fa = f(a);
    while (b - a > 30000) { const m = (a + b) / 2; if (f(m) === fa) a = m; else b = m; }
    return b;
  }
  function nextChange(p, ms, dir, sys, limitDays) {
    const cur = signOf(p, ms, sys), step = STEP[p] * DAY * dir; let a = ms, n = 0, max = (limitDays || 8000) / STEP[p];
    while (n++ < max) {
      const b = a + step;
      if (signOf(p, b, sys) !== cur) {
        return dir > 0 ? bisect(x => signOf(p, x, sys), a, b) : (function () { let lo = b, hi = a; const f = x => signOf(p, x, sys); while (hi - lo > 30000) { const m = (lo + hi) / 2; if (f(m) === cur) hi = m; else lo = m; } return hi; })();
      }
      a = b;
    }
    return null;
  }
  function signStay(p, d, sys) {
    const ms = d.getTime();
    const from = nextChange(p, ms, -1, sys), to = nextChange(p, ms, +1, sys);
    return { sign: signOf(p, ms, sys), from: from ? new Date(from) : null, to: to ? new Date(to) : null };
  }
  // all sign intervals of planet p between two dates
  function ingressList(p, fromD, toD, sys) {
    const out = []; let ms = fromD.getTime(); const end = toD.getTime();
    let cur = signOf(p, ms, sys), start = ms;
    const step = STEP[p] * DAY;
    while (ms < end) {
      const b = ms + step, s = signOf(p, b, sys);
      if (s !== cur) {
        const x = bisect(t => signOf(p, t, sys), ms, b);
        out.push({ sign: cur, from: new Date(start), to: new Date(x) }); cur = signOf(p, x + 60000, sys); start = x; ms = x + 60000;
      } else ms = b;
    }
    out.push({ sign: cur, from: new Date(start), to: new Date(end), open: true });
    return out;
  }
  function stations(p, d, sys) {
    // returns {retro, since, until, nextStart, nextEnd}
    if (!['Me', 'Ve', 'Ma', 'Ju', 'Sa'].includes(p)) return null;
    const sgn = ms => speed(p, new Date(ms), sys) < 0;
    const find = (ms, dir) => {
      const cur = sgn(ms); let a = ms;
      for (let i = 0; i < 900; i++) {
        const b = a + dir * DAY;
        if (sgn(b) !== cur) { let lo = Math.min(a, b), hi = Math.max(a, b); const fl = sgn(lo); while (hi - lo > 600000) { const m = (lo + hi) / 2; if (sgn(m) === fl) lo = m; else hi = m; } return hi; }
        a = b;
      }
      return null;
    };
    const ms = d.getTime(), retro = sgn(ms), nxt = find(ms, +1);
    const r = { retro };
    if (retro) { const prev = find(ms, -1); r.since = prev && new Date(prev); r.until = nxt && new Date(nxt); }
    else { r.nextStart = nxt && new Date(nxt); const e = nxt && find(nxt + DAY, +1); r.nextEnd = e && new Date(e); }
    return r;
  }
  function transits(d, natal, sys) {
    const pl = placements(d, natal.asc.sign, sys);
    P.forEach(p => { pl[p].fromMoon = houseFrom(pl[p].sign, natal.planets.Mo.sign); });
    return pl;
  }
  function saturnCycles(natal, sys) {
    const birth = natal.date, end = new Date(birth.getTime() + 100 * YEAR);
    const list = ingressList('Sa', birth, end, sys), moon = natal.planets.Mo.sign;
    const tagged = list.map(x => ({ ...x, rel: houseFrom(x.sign, moon) }));
    // group Sade Sati (rel 12,1,2), merging retrograde re-entries
    const cycles = []; let cur = null;
    tagged.forEach(x => {
      const inSS = x.rel === 12 || x.rel === 1 || x.rel === 2;
      if (inSS) {
        if (!cur || x.from - cur.end > 400 * DAY) { cur = { start: x.from, end: x.to, parts: [] }; cycles.push(cur); }
        cur.parts.push(x); cur.end = x.to;
      }
    });
    cycles.forEach(c => {
      c.phases = [12, 1, 2].map(rel => { const ps = c.parts.filter(x => x.rel === rel); return ps.length ? { rel, sign: ps[0].sign, from: ps[0].from, to: ps[ps.length - 1].to, spans: ps } : null; }).filter(Boolean);
    });
    const dhaiya = [];
    tagged.forEach(x => {
      if (x.rel === 4 || x.rel === 8) {
        const last = dhaiya[dhaiya.length - 1];
        if (last && last.rel === x.rel && x.from - last.to < 400 * DAY) last.to = x.to; else dhaiya.push({ rel: x.rel, sign: x.sign, from: x.from, to: x.to });
      }
    });
    return { cycles, dhaiya, all: tagged };
  }

  root.Jyotish = {
    P, BODY, SIGN_LORD, EXALT, FRIENDS, ENEMIES, ASPECTS, DASHA_ORDER, DASHA_YEARS, YEAR, DAY,
    norm, diff, ayanamsa, sidLon, tropLon, speed, ascendant, nak, dignity, navamsa, dasamsa, houseFrom,
    localToUtc, tzOffsetMin, compute, placements, subPeriods, signStay, ingressList, stations, transits, saturnCycles
  };
})(typeof window !== 'undefined' ? window : globalThis);
