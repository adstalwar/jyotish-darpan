/* Interface */
(function () {
  'use strict';
  const J = window.Jyotish, D = window.JD, R = window.JRules, ord = R.ord;
  const $ = s => document.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const st = { chart: null, input: null, style: 'north', kind: 'd1', selHouse: 1, aspP: null, tab: 'overview', tDate: new Date(), play: false, speed: 7, sat: null, mOpen: null, aOpen: null, tcache: {} };
  const store = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } } };
  const framed = (function () { try { return window.self !== window.top; } catch (e) { return true; } })();

  const dms = x => { const m = Math.floor(x * 60 + 1e-9); return Math.floor(m / 60) + '°' + String(m % 60).padStart(2, '0') + '′'; };
  const fd = d => d ? d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
  const fym = d => d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
  const PN = p => D.PLANETS[p].name, SN = i => D.SIGNS[i].name;
  const term = (k, label) => `<span class="term" tabindex="0" data-term="${k}">${label || D.GLOSSARY[k][0]}</span>`;
  const pl = (p, extra) => `<span class="pl pl-${p}"><i>${D.PLANETS[p].glyph}</i>${PN(p)}${extra || ''}</span>`;
  const pill = (t, k) => `<span class="pill ${k || ''}">${t}</span>`;
  const DIGP = { exalted: ['Exalted', 'good', 'uccha'], debilitated: ['Debilitated', 'bad', 'neecha'], moolatrikona: ['Moolatrikona', 'good'], own: ['Own sign', 'good'], friend: ["Friend's sign", ''], enemy: ['Unfriendly sign', 'warn'], neutral: ['Neutral sign', ''] };
  const stars = n => `<span class="stars" aria-label="${n} of 5">${'●'.repeat(n)}<b>${'●'.repeat(5 - n)}</b></span>`;
  const age = (d, c) => Math.floor((d - c.date) / J.YEAR);

  /* ================= Kundali drawing ================= */
  const NP = [[[200, 0], [100, 100], [200, 200], [300, 100]], [[0, 0], [200, 0], [100, 100]], [[0, 0], [100, 100], [0, 200]], [[0, 200], [100, 100], [200, 200], [100, 300]], [[0, 200], [100, 300], [0, 400]], [[0, 400], [100, 300], [200, 400]], [[200, 400], [100, 300], [200, 200], [300, 300]], [[200, 400], [300, 300], [400, 400]], [[400, 400], [300, 300], [400, 200]], [[400, 200], [300, 300], [200, 200], [300, 100]], [[400, 200], [300, 100], [400, 0]], [[400, 0], [300, 100], [200, 0]]];
  const NC = [[200, 100], [100, 36], [36, 100], [100, 200], [36, 300], [100, 364], [200, 300], [300, 364], [364, 300], [300, 200], [364, 100], [300, 36]];
  const NN = [[200, 178], [100, 86], [82, 104], [178, 204], [82, 304], [100, 322], [200, 230], [300, 322], [318, 304], [222, 204], [318, 104], [300, 86]];
  const SCELL = [[1, 0], [2, 0], [3, 0], [3, 1], [3, 2], [3, 3], [2, 3], [1, 3], [0, 3], [0, 2], [0, 1], [0, 0]];
  function slotsNorth(h, n) {
    const [cx, cy] = NC[h], out = [];
    const type = [0, 3, 6, 9].includes(h) ? 'd' : [1, 11].includes(h) ? 't' : [5, 7].includes(h) ? 'b' : 's';
    if (type === 's') { const lh = n > 5 ? 15 : 19; for (let i = 0; i < n; i++) out.push([cx - 2 * (h < 6 ? 1 : -1), cy + (i - (n - 1) / 2) * lh + 4]); return out; }
    const caps = type === 'd' ? [3, 3, 3] : [3, 2, 2, 2], rows = []; let left = n, r = 0;
    while (left > 0) { const k = Math.min(caps[Math.min(r, caps.length - 1)], left); rows.push(k); left -= k; r++; }
    rows.forEach((k, ri) => {
      const y = type === 'd' ? cy + (ri - (rows.length - 1) / 2) * 20 + 4 : type === 't' ? 24 + ri * 19 : 388 - ri * 19;
      for (let j = 0; j < k; j++) out.push([cx + (j - (k - 1) / 2) * 46, y]);
    });
    return out;
  }
  function chartData(kind) {
    const c = st.chart, p = c.planets, m = {};
    const asc = kind === 'd1' ? c.asc.sign : kind === 'moon' ? p.Mo.sign : kind === 'd9' ? c.asc.nav : c.asc.d10;
    J.P.forEach(k => m[k] = kind === 'd9' ? p[k].nav : kind === 'd10' ? p[k].d10 : p[k].sign);
    return { asc, m };
  }
  function label(k, x, y, showDeg) {
    const o = st.chart.planets[k];
    return `<text class="cp pl-${k}" x="${x}" y="${y}" text-anchor="middle">${k}${showDeg ? `<tspan class="cdeg" dy="-4">${Math.floor(o.deg + 1e-7)}°${o.retro && k !== 'Ra' && k !== 'Ke' ? 'ᴿ' : ''}</tspan>` : ''}<title>${PN(k)} ${dms(o.deg)} ${SN(o.sign)}</title></text>`;
  }
  function kundali(kind, interactive) {
    const { asc, m } = chartData(kind), showDeg = kind === 'd1' || kind === 'moon';
    const byHouse = Array.from({ length: 12 }, () => []);
    J.P.forEach(k => byHouse[(m[k] - asc + 12) % 12].push(k));
    const hi = [], lines = [];
    if (interactive && kind === 'd1' && st.aspP) { const from = st.chart.planets[st.aspP].house; R.aspectsOf(st.chart, st.aspP).forEach(a => { hi.push(a.house); lines.push([from, a.house]); }); }
    let s = '', centers = [];
    if (st.style === 'north') {
      for (let h = 0; h < 12; h++) {
        const sign = (asc + h) % 12, cls = ['hs', interactive && st.selHouse === h + 1 ? 'sel' : '', hi.includes(h + 1) ? 'hit' : ''].join(' ');
        s += `<polygon class="${cls}" data-house="${h + 1}" points="${NP[h].map(q => q.join(',')).join(' ')}"><title>${ord(h + 1)} house · ${SN(sign)}</title></polygon>`;
        s += `<text class="cnum" x="${NN[h][0]}" y="${NN[h][1]}" text-anchor="middle">${sign + 1}</text>`;
        slotsNorth(h, byHouse[h].length).forEach((xy, i) => s += label(byHouse[h][i], xy[0], xy[1], showDeg));
        centers[h + 1] = NC[h];
      }
      s += `<text class="casc" x="200" y="40" text-anchor="middle">${kind === 'moon' ? 'Moon' : 'Lagna'}${kind === 'd1' ? ' ' + Math.floor(st.chart.asc.deg) + '°' : ''}</text>`;
    } else {
      for (let sign = 0; sign < 12; sign++) {
        const [cx, cy] = SCELL[sign], x = cx * 100, y = cy * 100, h = (sign - asc + 12) % 12, ps = byHouse[h];
        const cls = ['hs', interactive && st.selHouse === h + 1 ? 'sel' : '', hi.includes(h + 1) ? 'hit' : ''].join(' ');
        s += `<rect class="${cls}" data-house="${h + 1}" x="${x}" y="${y}" width="100" height="100"><title>${ord(h + 1)} house · ${SN(sign)}</title></rect>`;
        s += `<text class="cnum" x="${x + 6}" y="${y + 14}">${SN(sign).slice(0, 3)}</text><text class="cnum" x="${x + 94}" y="${y + 14}" text-anchor="end">${h + 1}</text>`;
        if (h === 0) s += `<path class="cascl" d="M${x} ${y + 22}L${x + 22} ${y}"/><text class="casc" x="${x + 50}" y="${y + 14}" text-anchor="middle">${kind === 'moon' ? 'Moon' : 'Asc'}</text>`;
        ps.forEach((k, i) => { const cols = 2, row = Math.floor(i / cols), n = Math.min(cols, ps.length - row * cols), j = i % cols; s += label(k, x + 50 + (j - (n - 1) / 2) * 44, y + 38 + row * 18, showDeg); });
        centers[h + 1] = [x + 50, y + 55];
      }
      s += `<text class="ctitle" x="200" y="196" text-anchor="middle">${{ d1: 'Rashi', moon: 'Chandra', d9: 'Navamsa', d10: 'Dasamsa' }[kind]}</text><text class="csub" x="200" y="216" text-anchor="middle">${{ d1: 'Birth chart (D1)', moon: 'Moon chart', d9: 'D9', d10: 'D10' }[kind]}</text>`;
    }
    lines.forEach(([a, b]) => { const A = centers[a], B = centers[b], dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy) || 1; s += `<line class="asp pl-${st.aspP}" x1="${A[0] + dx / L * 16}" y1="${A[1] + dy / L * 16}" x2="${B[0] - dx / L * 20}" y2="${B[1] - dy / L * 20}" marker-end="url(#arr)"/>`; });
    return `<svg class="kundali ${st.style}" viewBox="-2 -2 404 404" role="img" aria-label="${kind} chart"><defs><marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" class="arrh"/></marker></defs><rect class="frame" x="0" y="0" width="400" height="400"/>${s}</svg>`;
  }

  /* ================= Zodiac wheel ================= */
  function wheel(tr) {
    const c = 230, pt = (lon, r) => { const a = (90 + lon) * Math.PI / 180; return [c + r * Math.cos(a), c - r * Math.sin(a)]; };
    const arc = (l1, l2, r1, r2) => { const a = pt(l1, r1), b = pt(l2, r1), d = pt(l2, r2), e = pt(l1, r2); return `M${a[0].toFixed(1)} ${a[1].toFixed(1)}A${r1} ${r1} 0 0 0 ${b[0].toFixed(1)} ${b[1].toFixed(1)}L${d[0].toFixed(1)} ${d[1].toFixed(1)}A${r2} ${r2} 0 0 1 ${e[0].toFixed(1)} ${e[1].toFixed(1)}Z`; };
    const nat = st.chart;
    let s = '';
    for (let i = 0; i < 12; i++) {
      const h = J.houseFrom(i, nat.asc.sign), m = pt(i * 30 + 15, 211), hm = pt(i * 30 + 15, 185);
      s += `<path class="wsign ${i % 2 ? 'alt' : ''} ${h === 1 ? 'lag' : ''}" d="${arc(i * 30, i * 30 + 30, 226, 196)}"/><path class="whouse" d="${arc(i * 30, i * 30 + 30, 196, 174)}"/>`;
      s += `<text class="wst" x="${m[0].toFixed(1)}" y="${(m[1] + 4).toFixed(1)}" text-anchor="middle">${D.SIGNS[i].glyph} ${SN(i).slice(0, 3)}</text><text class="wht" x="${hm[0].toFixed(1)}" y="${(hm[1] + 3.5).toFixed(1)}" text-anchor="middle">H${h}</text>`;
      const a = pt(i * 30, 174), b = pt(i * 30, 42); s += `<line class="wspoke" x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}"/>`;
    }
    const place = (set, base, cls) => {
      const arr = J.P.map(k => ({ k, lon: set[k].lon })).sort((a, b) => a.lon - b.lon); let prev = null, out = '';
      arr.forEach(o => { o.lv = prev && o.lon - prev.lon < 9 ? (prev.lv + 1) % 3 : 0; prev = o; const [x, y] = pt(o.lon, base - o.lv * (cls === 'wt' ? 19 : 17)); out += `<g class="${cls} pl-${o.k}"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${cls === 'wt' ? 10.5 : 8.5}"/><text x="${x.toFixed(1)}" y="${(y + 3.3).toFixed(1)}" text-anchor="middle">${o.k}</text><title>${PN(o.k)} ${dms(set[o.k].deg)} ${SN(set[o.k].sign)}${cls === 'wn' ? ' (birth)' : ''}</title></g>`; });
      return out;
    };
    const al = pt(nat.asc.lon, 174), al2 = pt(nat.asc.lon, 232);
    s += `<circle class="wring" cx="${c}" cy="${c}" r="42"/>` + place(nat.planets, 95, 'wn') + place(tr, 156, 'wt');
    s += `<line class="wasc" x1="${al[0].toFixed(1)}" y1="${al[1].toFixed(1)}" x2="${al2[0].toFixed(1)}" y2="${al2[1].toFixed(1)}"/>`;
    s += `<text class="wdate" x="${c}" y="${c - 2}" text-anchor="middle">${st.tDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</text><text class="wyear" x="${c}" y="${c + 20}" text-anchor="middle">${st.tDate.getFullYear()}</text>`;
    return `<svg class="wheel" viewBox="0 0 460 460" role="img" aria-label="Zodiac wheel with birth and current planet positions">${s}</svg>`;
  }

  /* ================= Views ================= */
  function cuspAlerts() {
    const c = st.chart; let s = '';
    J.P.forEach(k => {
      const o = c.planets[k]; if (!o.cusp || k === 'Ke') return;
      const names = k === 'Ra' ? 'Rahu and Ketu' : PN(k);
      s += `<div class="alert"><b>${names} ${k === 'Ra' ? 'sit' : 'sits'} on a sign border.</b> ${PN(k)} is only ${o.cusp.arcsec < 60 ? Math.max(1, Math.round(o.cusp.arcsec)) + ' arc-seconds' : Math.round(o.cusp.arcsec / 60) + ' arc-minutes'} from the line between ${SN(o.sign)} and ${SN(o.cusp.other)}. A few minutes' difference in birth time, or a different ephemeris, moves it across, so software packages will disagree. This reading currently places it in <b>${SN(o.sign)}</b>${o.cusp.flipped ? ' (your override)' : ''}. Read both versions and see which fits your life. <button class="btn sm" data-nudge="${k}">Read it in ${SN(o.cusp.other)} instead</button></div>`;
    });
    if (c.asc.nearBorder != null) s += `<div class="alert"><b>Your Lagna is close to a sign border</b> (${dms(c.asc.deg)} ${SN(c.asc.sign)}). The Lagna moves one degree every four minutes, so a birth time that is off by ${Math.max(1, Math.round(c.asc.nearBorder * 4))} minutes could change the rising sign and every house. Check your recorded birth time.</div>`;
    return s;
  }
  function currentDasha(when) {
    const c = st.chart, t = when || new Date(), m = c.dasha.mahas.find(x => t >= x.start && t < x.end); if (!m) return null;
    const a = J.subPeriods(m).find(x => t >= x.start && t < x.end), p = J.subPeriods(a).find(x => t >= x.start && t < x.end);
    return { m, a, p };
  }
  function satNow() {
    const now = new Date(), cyc = st.sat.cycles.find(x => now >= x.start && now < x.end);
    if (cyc) { const ph = cyc.parts.find(x => now >= x.from && now < x.to) || cyc.parts[0]; return { on: true, cyc, ph }; }
    const dh = st.sat.dhaiya.find(x => now >= x.from && now < x.to); if (dh) return { dh };
    return { next: st.sat.cycles.find(x => x.start > now) };
  }
  const PHASE = { 12: ['Rising phase', 'Saturn is in the sign before your Moon. Pressure builds around expenses, sleep and distance from comfort. Elders in the family may need attention.'], 1: ['Peak phase', 'Saturn is passing over your Moon. This is the heaviest stretch: emotional weight, added responsibility and a restructuring of personal life and health routines.'], 2: ['Setting phase', 'Saturn is in the sign after your Moon. Attention shifts to money, family and speech. Pressure eases and the lessons settle in.'] };

  function vOverview() {
    const c = st.chart, p = c.planets, i = st.input, cd = currentDasha(), sn = satNow(), y = R.yogas(c), nk = D.NAK[p.Mo.nak.index], pg = c.panchang;
    const good = y.filter(x => x.kind === 'good').slice(0, 4), care = y.filter(x => x.kind !== 'good').slice(0, 3);
    const tile = (k, v, sub, t) => `<div class="tile"><span class="k">${k}</span><span class="v">${v}</span><span class="sub">${sub}</span>${t ? `<p>${t}</p>` : ''}</div>`;
    const tithiName = pg.tithi % 15 === 14 ? (pg.paksha ? 'Amavasya (new moon)' : 'Purnima (full moon)') : D.TITHI[pg.tithi % 15];
    return `${cuspAlerts()}
    <div class="grid tiles">
      ${tile(term('lagna', 'Lagna · rising sign'), `${D.SIGNS[c.asc.sign].glyph} ${SN(c.asc.sign)}`, `${D.SIGNS[c.asc.sign].sa} · ${D.SIGNS[c.asc.sign].dev} · ${dms(c.asc.deg)}`, 'How you meet the world. Sets the 12 houses.')}
      ${tile(term('rashi', 'Rashi · Moon sign'), `${D.SIGNS[p.Mo.sign].glyph} ${SN(p.Mo.sign)}`, `${D.SIGNS[p.Mo.sign].sa} · ${D.SIGNS[p.Mo.sign].dev} · ${dms(p.Mo.deg)}`, 'Your mind and emotions. Used for Sade Sati and daily transits.')}
      ${tile(term('nakshatra', 'Nakshatra · birth star'), nk.name, `Pada ${p.Mo.nak.pada} · ruled by ${PN(p.Mo.nak.lord)}`, `Symbol: ${nk.symbol}. Deity: ${nk.deity}.`)}
      ${tile('Sun sign (Vedic)', `${D.SIGNS[p.Su.sign].glyph} ${SN(p.Su.sign)}`, dms(p.Su.deg), 'Often one sign earlier than your Western sign, because Vedic astrology measures against the stars.')}
      ${cd ? tile(term('dasha', 'Current dasha'), `${PN(cd.m.lord)} – ${PN(cd.a.lord)}`, `Sub-period until ${fd(cd.a.end)}`, `${PN(cd.m.lord)} major period runs ${fym(cd.m.start)} to ${fym(cd.m.end)}.`) : ''}
      ${tile(term('sadesati', 'Sade Sati'), sn.on ? 'Running now' : sn.dh ? 'Dhaiya running' : 'Not running', sn.on ? `${PHASE[sn.ph.rel][0]} until ${fd(sn.ph.to)}` : sn.dh ? `until ${fd(sn.dh.to)}` : sn.next ? `Next begins ${fd(sn.next.start)}` : '', sn.on ? `The full cycle runs ${fym(sn.cyc.start)} to ${fym(sn.cyc.end)}.` : 'Saturn is away from your Moon sign.')}
    </div>
    <div class="grid two">
      <section class="card"><h2>Birth chart</h2><p class="hint">Select a house to see what it means. Numbers are zodiac signs (1 is Aries); planets are shown with their degree.</p>${chartBlock('d1')}</section>
      <section class="card prose"><h2>In plain words</h2>
        <h3>Your nature</h3><p>${D.LAGNA[c.asc.sign]}</p>
        <h3>Your mind</h3><p>${D.MOONSIGN[p.Mo.sign]} Your birth star ${nk.name} adds a nature that is ${nk.trait}.</p>
        ${good.length ? `<h3>Strengths in the chart</h3><ul>${good.map(x => `<li><b>${x.name}.</b> ${x.meaning}</li>`).join('')}</ul>` : ''}
        ${care.length ? `<h3>Things to work with</h3><ul>${care.map(x => `<li><b>${x.name}.</b> ${x.meaning}${x.note ? ' ' + x.note : ''}</li>`).join('')}</ul>` : ''}
        <h3>Day to day</h3><p><a href="#today">Today's reading</a> · <a href="#watch">Periods to watch</a> · <a href="#remedies">Simple remedies</a> · <a href="#gemstones">Gemstones</a> · <a href="#guru">Ask AstroGuru</a> · <a href="#portrait">Your portrait</a> · <a href="#match">Kundli matching</a></p>
        ${cd ? `<h3>The period you are in</h3><p>${D.DASHA[cd.m.lord]} <a href="#dasha">See the full timeline</a>.</p>` : ''}
      </section>
    </div>
    <section class="card"><h2>${term('panchang', 'Panchang at birth')}</h2>
      <div class="kv">
        <div><span>Weekday (Vara)</span><b>${D.VARA[pg.weekday][0]}</b><small>${D.VARA[pg.weekday][1]}, ruled by ${PN(D.VARA[pg.weekday][2])}${pg.weekday !== pg.civilWeekday ? `. The Vedic day starts at sunrise, so a birth before dawn on ${D.VARA[pg.civilWeekday][0]} still belongs to ${D.VARA[pg.weekday][0]}.` : ''}</small></div>
        <div><span>${term('tithi', 'Tithi')}</span><b>${pg.paksha ? 'Krishna' : 'Shukla'} ${tithiName}</b><small>${pg.paksha ? 'Waning' : 'Waxing'} half, lunar day ${pg.tithi % 15 + 1}</small></div>
        <div><span>Nakshatra</span><b>${nk.name}</b><small>Pada ${p.Mo.nak.pada}</small></div>
        <div><span>Yoga</span><b>${D.YOGA27[pg.yoga]}</b><small>Sun and Moon combined</small></div>
        <div><span>Karana</span><b>${D.KARANA[pg.karana]}</b><small>Half of a tithi</small></div>
        <div><span>Sunrise · sunset</span><b>${pg.sunrise ? localT(pg.sunrise) + ' · ' + localT(pg.sunset) : '—'}</b><small>At the birthplace, local time</small></div>
        <div><span>${term('ayanamsa', 'Ayanamsa')}</span><b>${dms(c.ayanamsa)}</b><small>${{ lahiri: 'Lahiri (Chitrapaksha)', raman: 'B. V. Raman', kp: 'Krishnamurti (KP)' }[c.ayanamsaSys]}</small></div>
        <div><span>Birth in UTC</span><b>${c.date.toISOString().slice(0, 16).replace('T', ' ')}</b><small>Offset ${c.offsetMin >= 0 ? '+' : '−'}${String(Math.floor(Math.abs(c.offsetMin) / 60)).padStart(2, '0')}:${String(Math.round(Math.abs(c.offsetMin) % 60)).padStart(2, '0')} · ${(+i.lat).toFixed(4)}°, ${(+i.lon).toFixed(4)}°</small></div>
      </div></section>`;
  }
  const localT = d => { const x = new Date(d.getTime() + st.chart.offsetMin * 60000); return String(x.getUTCHours()).padStart(2, '0') + ':' + String(x.getUTCMinutes()).padStart(2, '0'); };

  function houseDetail(h) {
    const c = st.chart, hs = c.houses[h - 1], H = D.HOUSES[h - 1], hf = R.houseFactors(c, h);
    return `<div class="detail"><div class="dh"><span class="hn"><b>${h}</b></span><div><h3>${ord(h)} house · ${H.title}</h3><p class="hint">${term('bhava', H.sa + ' Bhava')} · governs ${H.themes}</p></div></div>
      <p><b>Sign:</b> ${D.SIGNS[hs.sign].glyph} ${SN(hs.sign)} (${D.SIGNS[hs.sign].sa}), ${D.SIGNS[hs.sign].element.toLowerCase()}, ${D.SIGNS[hs.sign].quality.toLowerCase()}. <b>Strength:</b> ${stars(hf.stars)}</p>
      <p>${R.lordPlacement(c, h)}</p>
      ${hs.planets.length ? `<p><b>Planets here:</b></p><ul>${hs.planets.map(p => `<li>${pl(p)} ${dms(c.planets[p].deg)}. ${D.PIH[p][h - 1]}</li>`).join('')}</ul>` : '<p><b>No planets here.</b> That is normal; the house works through its lord.</p>'}
      ${hs.aspectedBy.filter(p => !hs.planets.includes(p)).length ? `<p><b>${term('drishti', 'Aspected by')}:</b> ${hs.aspectedBy.filter(p => !hs.planets.includes(p)).map(p => pl(p)).join(' ')}</p>` : ''}
      <details><summary>Why this strength score</summary><ul class="fx">${hf.factors.map(f => `<li class="${f[0] > 0 ? 'up' : f[0] < 0 ? 'dn' : ''}">${f[0] > 0 ? '▲' : f[0] < 0 ? '▼' : '•'} ${f[1]}</li>`).join('') || '<li>No strong factors either way.</li>'}</ul></details></div>`;
  }
  function chartBlock(kind) {
    return `<div class="chartwrap">${kundali(kind, true)}</div>
      <div class="seg" role="group" aria-label="Chart style"><button data-style="north" class="${st.style === 'north' ? 'on' : ''}">North Indian</button><button data-style="south" class="${st.style === 'south' ? 'on' : ''}">South Indian</button></div>`;
  }
  function vCharts() {
    const c = st.chart, kinds = [['d1', 'Birth chart (D1)', 'The main chart. Houses are counted from the Lagna.'], ['moon', 'Moon chart', 'The same planets with the Moon sign as the first house. Shows the emotional view and is used for transits.'], ['d9', 'Navamsa (D9)', 'Each sign split into nine. Shows the inner strength of planets and marriage.'], ['d10', 'Dasamsa (D10)', 'Each sign split into ten. Adds detail on career.']];
    const k = kinds.find(x => x[0] === st.kind);
    return `<div class="grid two">
      <section class="card"><div class="seg wrap" role="group" aria-label="Chart">${kinds.map(x => `<button data-kind="${x[0]}" class="${st.kind === x[0] ? 'on' : ''}">${x[1]}</button>`).join('')}</div>
        <p class="hint">${k[2]}</p>${chartBlock(st.kind)}
        ${st.kind === 'd1' ? `<h3>${term('drishti', 'Show aspects (drishti)')}</h3><p class="hint">Pick a planet to see which houses it looks at.</p><div class="chips">${J.P.map(p => `<button class="chip pl-${p} ${st.aspP === p ? 'on' : ''}" data-asp="${p}">${D.PLANETS[p].glyph} ${PN(p)}</button>`).join('')}</div>${st.aspP ? `<p class="note">${PN(st.aspP)} sits in your ${ord(c.planets[st.aspP].house)} house and aspects the ${R.list(R.aspectsOf(c, st.aspP).map(a => ord(a.house) + ' house (' + ord(a.nth) + ' from itself' + (a.planets.length ? ', touching ' + a.planets.map(PN).join(', ') : '') + ')'))}.</p>` : ''}` : ''}
      </section>
      <section class="card">${st.kind === 'd1' ? houseDetail(st.selHouse) : `<h2>${k[1]}</h2><p>${k[2]}</p><p class="hint">Planets that land in the same sign here as in the birth chart are ${term('vargottama', 'vargottama')} and gain strength.</p>` + divTable(st.kind)}</section>
    </div>
    <section class="card"><h2>How to read this chart</h2><ol class="steps"><li><b>Find the Lagna.</b> In the North Indian style the top diamond is always the 1st house. In the South Indian style signs stay fixed and the Lagna box is marked.</li><li><b>Count the houses.</b> North Indian charts run anticlockwise from the top; South Indian charts run clockwise from the Lagna box.</li><li><b>Read the number.</b> In the North Indian chart each house shows a sign number: 1 Aries, 2 Taurus, up to 12 Pisces.</li><li><b>Note the planets.</b> Su Sun, Mo Moon, Ma Mars, Me Mercury, Ju Jupiter, Ve Venus, Sa Saturn, Ra Rahu, Ke Ketu. A small ᴿ means retrograde.</li></ol></section>`;
  }
  function divTable(kind) {
    const c = st.chart, f = kind === 'd9' ? 'nav' : kind === 'd10' ? 'd10' : 'sign', asc = kind === 'moon' ? c.planets.Mo.sign : c.asc[f] != null ? c.asc[f] : c.asc.sign;
    return `<div class="scroll"><table><thead><tr><th>Planet</th><th>Sign</th><th>House</th><th></th></tr></thead><tbody>${J.P.map(p => { const s = c.planets[p][f]; return `<tr><td>${pl(p)}</td><td>${SN(s)}</td><td>${J.houseFrom(s, asc)}</td><td>${kind !== 'moon' && s === c.planets[p].sign ? pill('Vargottama', 'good') : ''}</td></tr>`; }).join('')}</tbody></table></div>`;
  }

  function vPlanets() {
    const c = st.chart;
    return `<p class="lead">The nine ${term('graha', 'grahas')}, where each sat at birth, and what that placement is said to give. Positions are ${term('ayanamsa', 'sidereal')} (measured against the stars).</p>
    <div class="scroll card"><table><thead><tr><th>Planet</th><th>Sign</th><th>Degree</th><th>House</th><th>${term('nakshatra', 'Nakshatra')}</th><th>State</th><th>Speed / day</th></tr></thead><tbody>
      <tr><td><span class="pl"><i>↑</i>Lagna</span></td><td>${SN(c.asc.sign)}</td><td class="num">${dms(c.asc.deg)}</td><td>1</td><td>${D.NAK[c.asc.nak.index].name} ${c.asc.nak.pada}</td><td></td><td></td></tr>
      ${J.P.map(p => { const o = c.planets[p]; return `<tr><td>${pl(p)} <small>${D.PLANETS[p].sa}</small></td><td>${SN(o.sign)}</td><td class="num">${dms(o.deg)}</td><td>${o.house}</td><td>${D.NAK[o.nak.index].name} ${o.nak.pada}</td><td>${statePills(p)}</td><td class="num">${o.speed.toFixed(3)}°</td></tr>`; }).join('')}
    </tbody></table></div>
    <div class="grid cards">${J.P.map(p => {
      const o = c.planets[p], disp = J.SIGN_LORD[o.sign], as = R.aspectsOf(c, p);
      return `<article class="card pcard pl-${p}"><header><span class="glyph">${D.PLANETS[p].glyph}</span><div><h3>${PN(p)} <small>${D.PLANETS[p].sa} · ${D.PLANETS[p].dev}</small></h3><p class="hint">Stands for ${D.PLANETS[p].themes}.</p></div></header>
        <p class="where"><b>${SN(o.sign)} ${dms(o.deg)}</b> · ${ord(o.house)} house (${D.HOUSES[o.house - 1].title.toLowerCase()}) · ${D.NAK[o.nak.index].name}, pada ${o.nak.pada}</p>
        <div class="pills">${statePills(p)}</div>
        <p>${D.PIH[p][o.house - 1]}</p>
        <p class="hint">${term('dispositor', 'Sign lord')}: ${PN(disp)}, in your ${ord(c.planets[disp].house)} house. ${term('drishti', 'Aspects')} the ${R.list(as.map(a => ord(a.house)))} house${as.length > 1 ? 's' : ''}.${o.retro && p !== 'Ra' && p !== 'Ke' ? ` It was ${term('vakri', 'retrograde')} at birth: its results turn inward, come late or arrive in an unusual way, and it is counted as strong.` : ''}${o.combust ? ` It is ${term('asta', 'combust')}, only ${o.sunDist.toFixed(1)}° from the Sun, so its qualities take effort to express.` : ''}</p></article>`;
    }).join('')}</div>`;
  }
  function statePills(p) {
    const o = st.chart.planets[p], d = DIGP[o.dignity]; let s = pill(d[0], d[1]);
    if (o.retro && p !== 'Ra' && p !== 'Ke') s += pill('Retrograde ℞', 'warn');
    if (o.combust) s += pill('Combust', 'warn'); if (o.vargottama) s += pill('Vargottama', 'good'); if (o.cusp) s += pill('On sign border', 'bad');
    return s;
  }

  function vDasha() {
    const c = st.chart, now = new Date(), cd = currentDasha(), ms = c.dasha.mahas, t0 = c.date.getTime(), t1 = ms[8].end.getTime(), span = t1 - t0;
    if (!st.mOpen) st.mOpen = cd ? cd.m.lord + cd.m.start.getTime() : ms[0].lord + ms[0].start.getTime();
    const open = ms.find(m => m.lord + m.start.getTime() === st.mOpen) || ms[0], antars = J.subPeriods(open);
    const aOpen = antars.find(a => a.lord + a.start.getTime() === st.aOpen) || (cd && open === cd.m ? antars.find(a => a.lord === cd.a.lord) : null);
    const bar = ms.map(m => { const s = Math.max(m.start.getTime(), t0), w = (m.end.getTime() - s) / span * 100; return `<button class="seg-d pl-${m.lord} ${m === open ? 'on' : ''}" style="flex-basis:${w.toFixed(2)}%" data-maha="${m.lord + m.start.getTime()}" title="${PN(m.lord)} ${fym(m.start)} – ${fym(m.end)}"><b>${PN(m.lord)}</b><small>${new Date(s).getFullYear()}</small></button>`; }).join('');
    const nowPct = (now.getTime() - t0) / span * 100;
    return `<p class="lead">${term('dasha', 'Vimshottari Dasha')} divides 120 years among the nine planets. Your Moon's star, ${D.NAK[c.planets.Mo.nak.index].name}, starts the sequence with ${PN(c.dasha.startLord)}, with ${c.dasha.balanceYears.toFixed(2)} years of it left at birth. The planet in charge colours each stretch of life.</p>
    ${cd ? `<section class="card now"><h2>Right now</h2><div class="nowrow"><div><span class="k">${term('mahadasha', 'Major period')}</span>${pl(cd.m.lord)}<small>${fd(cd.m.start)} – ${fd(cd.m.end)}</small></div><div><span class="k">${term('antardasha', 'Sub-period')}</span>${pl(cd.a.lord)}<small>${fd(cd.a.start)} – ${fd(cd.a.end)}</small></div><div><span class="k">Sub-sub-period</span>${pl(cd.p.lord)}<small>${fd(cd.p.start)} – ${fd(cd.p.end)}</small></div></div>
      <div class="prose">${R.dashaReading(c, cd.m.lord).map(x => `<p>${x}</p>`).join('')}<p><b>Within it, ${PN(cd.a.lord)}:</b> ${R.antarNote(c, cd.m.lord, cd.a.lord)}</p></div></section>` : ''}
    <section class="card"><h2>Life timeline</h2><p class="hint">Select a period to open its sub-periods. Widths show length.</p>
      <div class="dbar-wrap"><div class="dbar">${bar}</div>${nowPct > 0 && nowPct < 100 ? `<span class="nowmark" style="left:${nowPct.toFixed(2)}%"><i>now</i></span>` : ''}</div>
      <h3>${pl(open.lord)} major period <small>${fd(open.start)} – ${fd(open.end)} · age ${Math.max(0, age(open.start, c))} to ${age(open.end, c)}</small></h3>
      <div class="prose">${open === (cd && cd.m) ? '' : R.dashaReading(c, open.lord).map(x => `<p>${x}</p>`).join('')}</div>
      <div class="scroll"><table class="click"><thead><tr><th>Sub-period</th><th>From</th><th>To</th><th>Age</th><th></th></tr></thead><tbody>${antars.map(a => { const cur = now >= a.start && now < a.end, isO = aOpen === a; return `<tr class="${cur ? 'cur' : ''} ${isO ? 'open' : ''}" data-antar="${a.lord + a.start.getTime()}" tabindex="0"><td>${pl(open.lord)} – ${pl(a.lord)}</td><td>${fd(a.start)}</td><td>${fd(a.end)}</td><td>${age(a.start, c) < 0 ? '—' : age(a.start, c)}</td><td>${cur ? pill('Now', 'good') : a.end < c.date ? pill('Before birth') : ''}</td></tr>${isO ? `<tr class="sub"><td colspan="5"><p>${R.antarNote(c, open.lord, a.lord)}</p><div class="pratis">${J.subPeriods(a).map(q => `<span class="${now >= q.start && now < q.end ? 'cur' : ''}"><b>${PN(q.lord)}</b> ${fd(q.start)} – ${fd(q.end)}</span>`).join('')}</div></td></tr>` : ''}`; }).join('')}</tbody></table></div></section>`;
  }

  function transitRows() {
    const key = st.tDate.toISOString().slice(0, 13) + st.chart.ayanamsaSys; if (st.tcache.key === key) return st.tcache.rows;
    const tr = J.transits(st.tDate, st.chart, st.chart.ayanamsaSys), rows = J.P.map(p => ({ p, o: tr[p], stay: J.signStay(p, st.tDate, st.chart.ayanamsaSys), stn: J.stations(p, st.tDate, st.chart.ayanamsaSys) }));
    st.tcache = { key, rows, tr }; return rows;
  }
  function vTransits() {
    const c = st.chart, tr = J.transits(st.tDate, c, c.ayanamsaSys), iso = new Date(st.tDate.getTime() - st.tDate.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    return `<p class="lead">${term('gochar', 'Gochar')} compares the sky on any date with your birth chart. The wheel shows the zodiac as a circle: filled discs are the planets on the chosen date, outlined discs are where they were when you were born. Press play to watch them move.</p>
    <div class="grid two">
      <section class="card"><div class="tctl"><button class="btn icon" data-shift="-30" title="Back one month">«</button><button class="btn icon" data-shift="-1" title="Back one day">‹</button><input type="date" id="tdate" value="${iso}" aria-label="Transit date"><button class="btn icon" data-shift="1" title="Forward one day">›</button><button class="btn icon" data-shift="30" title="Forward one month">»</button><button class="btn" id="today">Today</button></div>
        <div id="wheelbox">${wheel(tr)}</div>
        <div class="tctl"><button class="btn primary" id="play">${st.play ? 'Pause' : 'Play'}</button><label for="speed">Speed</label><select id="speed"><option value="1">1 day per step</option><option value="7">1 week per step</option><option value="30">1 month per step</option></select></div>
        <p class="hint">H1 to H12 are your houses, counted from your Lagna (the gold line). Planets move anticlockwise; a planet moving clockwise is ${term('vakri', 'retrograde')}. Rahu and Ketu always move clockwise.</p></section>
      <section class="card" id="tsum">${transitSummary()}</section>
    </div>
    <section class="card" id="ttable">${transitTable()}</section>`;
  }
  function transitSummary() {
    const rows = transitRows(), slow = ['Sa', 'Ju', 'Ra', 'Ke'];
    return `<h2>The slow movers on ${fd(st.tDate)}</h2><p class="hint">Saturn, Jupiter and the nodes stay in a sign for a year or more, so they set the background of a period.</p>${rows.filter(r => slow.includes(r.p)).map(r => { const x = R.transitReading(r.p, r.o.fromMoon, r.o.house); return `<div class="trow"><div>${pl(r.p)} ${pill(x.good ? 'Favourable' : 'Testing', x.good ? 'good' : 'warn')}${r.o.retro && r.p !== 'Ra' && r.p !== 'Ke' ? pill('Retrograde ℞', 'warn') : ''}</div><p>${x.text} It stays in ${SN(r.o.sign)} until <b>${fd(r.stay.to)}</b>.</p></div>`; }).join('')}`;
  }
  function transitTable() {
    const rows = transitRows();
    return `<h2>Every planet on ${fd(st.tDate)}</h2><div class="scroll"><table><thead><tr><th>Planet</th><th>Now in</th><th>Motion</th><th>Your house</th><th>From Moon</th><th>Entered sign</th><th>Leaves sign</th><th>${term('vakri', 'Retrograde')}</th></tr></thead><tbody>${rows.map(r => {
      const x = R.transitReading(r.p, r.o.fromMoon, r.o.house), s = r.stn, node = r.p === 'Ra' || r.p === 'Ke';
      const retro = node ? 'Always' : !s ? 'Never' : s.retro ? `Now, until ${fd(s.until)}` : `Next: ${fd(s.nextStart)} – ${fd(s.nextEnd)}`;
      return `<tr><td>${pl(r.p)}</td><td>${SN(r.o.sign)} <span class="num">${dms(r.o.deg)}</span></td><td>${r.o.retro ? pill(node ? 'Backward' : 'Retrograde', 'warn') : pill('Direct')} <span class="num">${Math.abs(r.o.speed).toFixed(2)}°/day</span></td><td>${ord(r.o.house)} <small>${D.HOUSES[r.o.house - 1].title}</small></td><td>${ord(r.o.fromMoon)} ${pill(x.good ? 'Favourable' : 'Testing', x.good ? 'good' : 'warn')}</td><td>${fd(r.stay.from)}</td><td>${fd(r.stay.to)}</td><td>${retro}</td></tr>`;
    }).join('')}</tbody></table></div><p class="hint">"From Moon" uses the classical rule for each planet: for example Saturn is favourable in the 3rd, 6th and 11th from the Moon, Jupiter in the 2nd, 5th, 7th, 9th and 11th.</p>`;
  }

  function vSade() {
    const c = st.chart, S = st.sat, now = new Date(), sn = satNow(), t0 = c.date.getTime(), span = 100 * J.YEAR, pct = d => ((d.getTime() - t0) / span * 100).toFixed(2);
    const segs = S.cycles.map(cy => cy.parts.map(ph => `<span class="ss p${ph.rel}" style="left:${pct(ph.from)}%;width:${(pct(ph.to) - pct(ph.from)).toFixed(2)}%" title="${PHASE[ph.rel][0]} ${fd(ph.from)} – ${fd(ph.to)}"></span>`).join('')).join('') + S.dhaiya.map(d => `<span class="ss dh" style="left:${pct(d.from)}%;width:${(pct(d.to) - pct(d.from)).toFixed(2)}%" title="Dhaiya ${fd(d.from)} – ${fd(d.to)}"></span>`).join('');
    const ticks = Array.from({ length: 11 }, (_, i) => `<i style="left:${i * 10}%">${i * 10}</i>`).join('');
    return `<p class="lead">${term('sadesati', 'Sade Sati')} is the seven and a half years when Saturn crosses the sign before your Moon sign, your Moon sign (${SN(c.planets.Mo.sign)}), and the sign after it. Saturn takes about 30 years to circle the zodiac, so most people meet it two or three times.</p>
    <section class="card now"><h2>${sn.on ? 'Sade Sati is running' : sn.dh ? 'A Dhaiya is running' : 'Sade Sati is not running'}</h2>
      ${sn.on ? `<p><b>${PHASE[sn.ph.rel][0]}</b>, Saturn in ${SN(sn.ph.sign)}, until ${fd(sn.ph.to)}. ${PHASE[sn.ph.rel][1]}</p><p class="hint">This cycle began ${fd(sn.cyc.start)} and ends ${fd(sn.cyc.end)}.</p>` : sn.dh ? `<p>Saturn is in the ${ord(sn.dh.rel)} sign from your Moon until ${fd(sn.dh.to)}. ${sn.dh.rel === 4 ? 'This puts pressure on home, mother, property and peace of mind.' : 'This brings obstacles, sudden changes and a need for care with health and risk.'}</p>` : `<p>Saturn is clear of your Moon.${sn.next ? ` The next Sade Sati begins ${fd(sn.next.start)}, at age ${age(sn.next.start, c)}.` : ''}</p>`}
      <p>Sade Sati is not a sentence of bad luck. Saturn rewards discipline, honesty and patience, and many people take on their largest responsibilities and build lasting things during it. What it removes is usually what was not solid.</p></section>
    <section class="card"><h2>Across your life</h2><div class="sbar"><div class="strack">${segs}${now.getTime() < t0 + span ? `<span class="nowmark" style="left:${pct(now)}%"><i>now</i></span>` : ''}</div><div class="sticks">${ticks}</div></div>
      <div class="legend"><span><i class="ss p12"></i>Rising</span><span><i class="ss p1"></i>Peak</span><span><i class="ss p2"></i>Setting</span><span><i class="ss dh"></i>${term('dhaiya', 'Dhaiya')}</span><span>Numbers are your age</span></div>
      ${S.cycles.map((cy, i) => `<h3>${ord(i + 1)} Sade Sati <small>${fd(cy.start)} – ${fd(cy.end)} · age ${age(cy.start, c)} to ${age(cy.end, c)}${now >= cy.start && now < cy.end ? ' · running' : ''}</small></h3><div class="scroll"><table><thead><tr><th>Phase</th><th>Saturn in</th><th>From</th><th>To</th><th>What it asks</th></tr></thead><tbody>${cy.parts.map(ph => `<tr class="${now >= ph.from && now < ph.to ? 'cur' : ''}"><td><i class="ss p${ph.rel} dot"></i>${PHASE[ph.rel][0]}</td><td>${SN(ph.sign)}</td><td>${fd(ph.from)}</td><td>${fd(ph.to)}</td><td>${PHASE[ph.rel][1]}</td></tr>`).join('')}</tbody></table></div>`).join('')}
      <p class="hint">A phase can appear twice because Saturn turns retrograde each year and can slip back into the previous sign for a few months.</p><h3>${term('dhaiya', 'Dhaiya periods')}</h3><div class="scroll"><table><thead><tr><th>Type</th><th>Saturn in</th><th>From</th><th>To</th><th>Age</th></tr></thead><tbody>${S.dhaiya.map(d => `<tr class="${now >= d.from && now < d.to ? 'cur' : ''}"><td>${d.rel === 4 ? 'Kantaka Shani (4th from Moon)' : 'Ashtama Shani (8th from Moon)'}</td><td>${SN(d.sign)}</td><td>${fd(d.from)}</td><td>${fd(d.to)}</td><td>${age(d.from, c)}</td></tr>`).join('')}</tbody></table></div></section>`;
  }

  function vYogas() {
    const y = R.yogas(st.chart), lab = { good: ['Strength', 'good'], mixed: ['Mixed', 'warn'], caution: ['Work with it', 'bad'] };
    const grp = k => y.filter(x => x.kind === k).map(x => `<article class="card ycard ${x.kind}"><header><h3>${x.name}</h3>${pill(lab[x.kind][0], lab[x.kind][1])}</header><p>${x.meaning}</p><p class="hint"><b>Why it applies:</b> ${x.why}</p>${x.note ? `<p class="note">${x.note}</p>` : ''}</article>`).join('');
    return `<p class="lead">A ${term('yoga', 'yoga')} is a named planetary combination. A ${term('dosha', 'dosha')} is one regarded as a challenge. Each card says exactly which planets form it, so you can check it against the chart. No single yoga decides a life; read them together.</p>
    <h2 class="sec">Strengths</h2><div class="grid cards">${grp('good') || '<p>No major benefic yogas from the checked list.</p>'}</div>
    <h2 class="sec">Mixed and to work with</h2><div class="grid cards">${grp('mixed') + grp('caution') || '<p>None of the checked doshas apply.</p>'}</div>
    <p class="hint">Checked: the five Mahapurusha yogas, Gajakesari, Budhaditya, Chandra-Mangala, Adhi, Amala, Raja and Dhana yogas, Parivartana, Vipareeta Raja, Neecha Bhanga, Sunapha, Anapha, Durudhara, Kemadruma, Kaal Sarp, Mangal Dosha, Guru Chandala, Shrapit, Angarak, Vish, Grahan and Vargottama.</p>`;
  }

  function vLife() {
    const a = R.lifeAreas(st.chart, st.input.gender);
    return `<p class="lead">Each area of life belongs to a ${term('bhava', 'house')}. The reading looks at the house, the planet that rules it and where that planet sits, any planets inside, and the planets that ${term('drishti', 'aspect')} it. The dots are a rough strength score; open "why" to see every factor.</p>
    <div class="grid cards wide">${a.map(x => `<article class="card"><header class="lh"><div><h3>${x.title}</h3><span class="hint">${ord(x.house)} house</span></div><div class="score">${stars(x.stars)}<small>${x.verdict}</small></div></header>${x.paras.map(p => `<p>${p}</p>`).join('')}<details><summary>Why this score</summary><ul class="fx">${x.factors.map(f => `<li class="${f[0] > 0 ? 'up' : f[0] < 0 ? 'dn' : ''}">${f[0] > 0 ? '▲' : f[0] < 0 ? '▼' : '•'} ${f[1]}</li>`).join('') || '<li>No strong factors either way.</li>'}</ul></details></article>`).join('')}</div>`;
  }

  function vNadi() {
    const c = st.chart, n = R.nadi(c, st.input.gender), nowAge = Math.max(0, age(new Date(), c)), prog = R.nadiProgression(c, nowAge - 2, nowAge + 10), tr = R.nadiTransits(c, new Date(), 8);
    return `<p class="lead">This section follows ${term('nadi', 'Bhrigu Nandi Nadi')}, a South Indian method that reads planets as fixed significators and ignores houses. Planets in the same sign or in trine signs (same element) act as one group. The next sign shows what a planet is heading toward, the previous sign what it comes from, and the opposite sign what it faces.</p>
    <p class="note">Traditional Nadi readings from palm-leaf manuscripts cannot be reproduced by software. What follows applies the published rules of the Bhrigu Nandi method to your chart.</p>
    <div class="grid cards wide">${n.readings.map(r => `<article class="card pcard pl-${r.p}"><header><span class="glyph">${D.PLANETS[r.p].glyph}</span><div><h3>${r.title} <small>${PN(r.p)} in ${SN(r.sign)}${r.retro ? ', retrograde' : ''}</small></h3><p class="hint">${r.intro}</p></div></header>${r.groups.length ? r.groups.map(g => `<h4>${g.label}</h4><ul>${g.items.map(i => `<li>${pl(i.q)} ${i.text}</li>`).join('')}</ul>`).join('') : '<p>No planets are linked to it by sign, so it acts alone and gives plain results of its own nature.</p>'}${r.retro ? `<p class="hint">Because ${PN(r.p)} is retrograde, the method also reads it from the previous sign.</p>` : ''}</article>`).join('')}</div>
    <section class="card"><h2>Year by year: Jupiter's progression</h2><p class="hint">In this method Jupiter (you) steps forward one sign for each year of life, returning to its birth sign every 12 years. Each year switches on the birth planets in that sign and its trines.</p>
      <div class="scroll"><table><thead><tr><th>Age</th><th>From</th><th>Jupiter progressed to</th><th>Meets</th><th>Themes</th></tr></thead><tbody>${prog.map(x => `<tr class="${x.age === nowAge ? 'cur' : ''}"><td>${x.age}${x.age === nowAge ? ' ' + pill('Now', 'good') : ''}</td><td>${fd(x.start)}</td><td>${SN(x.sign)}</td><td>${x.hit.map(q => pl(q)).join(' ') || '—'}</td><td>${x.text}</td></tr>`).join('')}</tbody></table></div></section>
    <section class="card"><h2>Transit triggers for the next 8 years</h2><p class="hint">When Jupiter or Saturn in the sky moves through a sign that holds, or is in trine to, your birth planets, those planets' matters come up. Jupiter opens; Saturn tests and makes lasting.</p>
      <div class="scroll"><table><thead><tr><th>Planet</th><th>In</th><th>From</th><th>To</th><th>Touches</th></tr></thead><tbody>${tr.map(x => `<tr><td>${pl(x.tp)}</td><td>${SN(x.sign)}</td><td>${fd(x.from)}</td><td>${x.open ? '…' : fd(x.to)}</td><td>${x.hit.map(q => pl(q)).join(' ')}<br><small>${x.hit.map(q => R.EVENT[q]).join('; ')}</small></td></tr>`).join('')}</tbody></table></div></section>`;
  }

  function vLearn() {
    return `<div class="grid two"><section class="card prose"><h2>Five steps to reading a kundali</h2><ol class="steps">
      <li><b>Start with the Lagna.</b> The rising sign is the first house and describes you. Everything else is counted from it.</li>
      <li><b>Look at the Moon.</b> Its sign and star describe your mind. Sade Sati and daily transits are judged from the Moon.</li>
      <li><b>For any question, find the house.</b> Career is the 10th, marriage the 7th, money the 2nd and 11th. Check the planets in it, the planet that rules it, and the aspects on it.</li>
      <li><b>Check the timing.</b> The dasha tells you which planet is in charge now. Its house and condition say what kind of period it is.</li>
      <li><b>Add the transits.</b> Slow planets crossing important points trigger the events the dasha promises.</li></ol>
      <h2>How this app calculates</h2><ul>
      <li>Planet positions come from the VSOP87 and ELP-based Astronomy Engine library, checked against Swiss Ephemeris to within a few arc-seconds for 1900 to 2100.</li>
      <li>The zodiac is sidereal with Lahiri ayanamsa by default (Raman and KP are available).</li>
      <li>Houses are whole-sign: the sign holding the Lagna is the whole first house.</li>
      <li>Rahu and Ketu use the mean node.</li>
      <li>Vimshottari dasha uses a 365.25-day year.</li>
      <li>Interpretations follow rules found in Brihat Parashara Hora Shastra, Phaladeepika, Saravali and Jataka Parijata, and the Bhrigu Nandi Nadi method as published by R. G. Rao. They are written fresh in plain English.</li></ul>
      <h2>What to keep in mind</h2><p>The astronomy here is exact. The meanings are a traditional interpretive system, not a tested science, and a rule-based reading cannot weigh a chart the way an experienced astrologer does. Use it for reflection, not for medical, legal or financial decisions.</p></section>
      <section class="card"><h2>Glossary</h2><dl class="gloss">${Object.keys(D.GLOSSARY).map(k => `<dt id="g-${k}">${D.GLOSSARY[k][0]}</dt><dd>${D.GLOSSARY[k][1]}</dd>`).join('')}</dl></section></div>`;
  }


  /* ================= Today ================= */
  const ft = d => d ? d.toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';
  const sameDay = (a, b) => a.toDateString() === b.toDateString();
  function dayMoment() { const n = new Date(); return !st.dDate || sameDay(st.dDate, n) ? n : st.dDate; }
  function remedyCard(p, why) {
    const r = D.REMEDY[p];
    return `<article class="card pcard pl-${p}"><header><span class="glyph">${D.PLANETS[p].glyph}</span><div><h3>${PN(p)} <small>${D.PLANETS[p].sa} · ${r.day}</small></h3>${why ? `<p class="hint">For you because it ${R.list(why)}.</p>` : `<p class="hint">Eases ${D.ILL[p]}.</p>`}</div></header>
      <p class="mantra"><span lang="sa">${r.dev}</span><small>${r.tr} · ${r.when}</small></p>
      <dl class="rem"><dt>Practice</dt><dd>${r.practice}</dd><dt>Give</dt><dd>${r.give} Best on ${r.day}.</dd><dt>Conduct</dt><dd>${r.conduct}</dd><dt>In daily life</dt><dd>${D.COPE[p]}</dd><dt>Fast</dt><dd>A light fast on ${r.day}: one simple meal after sunset. Skip it if you have a health condition, are pregnant or are on medication.</dd><dt>Colour</dt><dd>${D.ATTR[p][0]}. Wear it on ${r.day} or give cloth of this colour.</dd>${D.ATTR[p][1] !== '—' ? `<dt>Direction</dt><dd>${D.ATTR[p][1]}. Face this way for its mantra.</dd>` : ''}<dt>Rudraksha</dt><dd>${D.ATTR[p][3]}, a low-cost alternative to a gemstone. The pairing is from later tradition.</dd><dt>Gemstone</dt><dd>${D.GEM[p][0]} (${D.GEM[p][1]}). Check <a href="#gemstones">Gemstones</a> first: it may not suit your chart.</dd></dl>
      <p class="hint"><b>Sources:</b> ${r.src}</p></article>`;
  }
  function vToday() {
    const c = st.chart, when = dayMoment(), d = R.daily(c, when), now = new Date(), isToday = sameDay(when, now), cd = currentDasha(when), nk = D.NAK[d.mo.nak.index], T = D.TARA[d.tara];
    const iso = new Date(when.getTime() - when.getTimezoneOffset() * 60000).toISOString().slice(0, 10), r = D.REMEDY[d.dayLord];
    const tn = d.tithi % 15 === 14 ? (d.tithi > 14 ? 'Amavasya' : 'Purnima') : D.TITHI[d.tithi % 15];
    const week = Array.from({ length: 7 }, (_, i) => { const x = new Date(when); x.setDate(x.getDate() + i); if (i) x.setHours(12, 0, 0, 0); return R.daily(c, x, true); });
    return `<p class="lead">A daily reading from the Moon, the fastest mover. It combines the Moon's position counted from your birth Moon (${term('gochar', 'Chandra gochar')}) with the day's star counted from your birth star (Tara Bala). ${isToday ? 'Showing this moment.' : 'Showing midday on the chosen date.'}</p>
    <div class="tctl left"><button class="btn icon" data-dshift="-1" title="Previous day">‹</button><input type="date" id="ddate" value="${iso}" aria-label="Date"><button class="btn icon" data-dshift="1" title="Next day">›</button><button class="btn" id="dtoday">Today</button></div>
    <div class="grid two">
      <section class="card now"><span class="k">${when.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span><h2 class="verdict">${d.verdict[0]} ${pill(d.score > 0 ? '+' + d.score : String(d.score), d.verdict[1])}</h2>
        ${d.fromMoon === 8 ? `<div class="alert"><b>Chandrashtama.</b> The Moon is in the 8th sign from your Moon until ${ft(d.moonUntil)}. Keep the day simple.</div>` : ''}
        <p><b>Moon in ${SN(d.mo.sign)}</b>, ${ord(d.fromMoon)} from your Moon and in your ${ord(d.house)} house (${D.HOUSES[d.house - 1].title.toLowerCase()}), until ${ft(d.moonUntil)}.</p><p>${D.MOONGO[d.fromMoon - 1]}</p>
        <p><b>Star of the day: ${nk.name}</b>, until ${ft(d.nakUntil)}. Counted from your birth star it is <b>${T[0]} Tara</b> ${pill(T[1] > 0 ? 'Favourable' : T[1] < 0 ? 'Testing' : 'Sensitive', T[1] > 0 ? 'good' : T[1] < 0 ? 'bad' : 'warn')}. ${T[2]}</p>
        <div class="grid doav"><div><h4>Good for</h4><ul>${d.doList.map(x => `<li>${x}</li>`).join('')}</ul></div><div><h4>Go easy on</h4><ul>${d.avoid.map(x => `<li>${x}</li>`).join('')}</ul></div></div></section>
      <section class="card"><h2>The day in detail</h2>
        <div class="kv"><div><span>Weekday</span><b>${D.VARA[d.wd][0]}</b><small>Ruled by ${PN(d.dayLord)}</small></div><div><span>${term('tithi', 'Tithi')}</span><b>${d.tithi > 14 ? 'Krishna' : 'Shukla'} ${tn}</b><small>${d.tithi > 14 ? 'Waning' : 'Waxing'} Moon</small></div><div><span>Yoga</span><b>${D.YOGA27[d.yoga]}</b><small>Sun and Moon combined</small></div>${cd ? `<div><span>${term('dasha', 'Running periods')}</span><b>${PN(cd.m.lord)} – ${PN(cd.a.lord)} – ${PN(cd.p.lord)}</b><small>Sub-sub-period until ${fd(cd.p.end)}</small></div>` : ''}</div>
        <p>${d.dayNote}</p>
        <h3>Other fast planets</h3>${d.fast.map(f => `<div class="trow slim">${pl(f.p)} ${pill(f.good ? 'Favourable' : 'Testing', f.good ? 'good' : 'warn')} <span>in ${SN(f.o.sign)}, your ${ord(f.o.house)} house (${D.HOUSES[f.o.house - 1].title.toLowerCase()})${f.o.retro ? ', retrograde' : ''}</span></div>`).join('')}
        <h3>Simple practice for ${D.VARA[d.wd][0]}</h3><p class="mantra"><span lang="sa">${r.dev}</span><small>${r.tr} · ${r.when}</small></p><p>${r.practice} <a href="#remedies">All remedies</a></p></section>
    </div>
    <section class="card"><h2>The week ahead</h2><div class="week">${week.map((w, i) => `<button class="wday ${w.verdict[1]}" data-dday="${w.date.getTime()}"><b>${w.date.toLocaleDateString('en-GB', { weekday: 'short' })}</b><small>${w.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</small><span>${w.verdict[0]}</span><small>Moon ${SN(w.mo.sign).slice(0, 3)} · ${ord(w.fromMoon)}</small><small>${D.TARA[w.tara][0]}</small></button>`).join('')}</div>
      <p class="hint">The Moon changes sign about every two and a quarter days, so a day can shift partway through; open a day to see the exact times. This is a rule-based reading of the day's general tone, the same for everyone who shares your Moon sign and star, and is not a forecast of events.</p></section>`;
  }

  /* ================= Watch periods ================= */
  function vWatch() {
    const c = st.chart, yrs = st.wYears || 10, now = new Date(), W = R.watch(c, st.sat, now, yrs), span = W.to - W.from, pct = d => ((d - W.from) / span * 100);
    const lane = (items, cat, soft) => `<div class="lane"><span class="ln">${cat}</span><div class="lt">${items.filter(i => i.cat === cat).map(i => `<span class="lb ${soft ? 'soft' : 's' + i.sev}" style="left:${pct(i.vfrom).toFixed(2)}%;width:${Math.max(0.4, pct(i.vto) - pct(i.vfrom)).toFixed(2)}%" title="${esc(i.title)}: ${fd(i.from)} – ${fd(i.to)}"></span>`).join('')}</div></div>`;
    const ticks = Array.from({ length: yrs + 1 }, (_, i) => i).filter(i => yrs <= 10 || i % 5 === 0).map(i => `<i style="left:${(i / yrs * 100).toFixed(2)}%">${now.getFullYear() + i}</i>`).join('');
    const SV = { 3: ['High', 'bad'], 2: ['Moderate', 'warn'], 1: ['Mild', ''] }, active = W.hard.filter(h => now >= h.from && now < h.to);
    const card = h => `<article class="card wcard s${h.sev}"><header><div><h3>${h.title}</h3><span class="hint">${fd(h.from)} – ${fd(h.to)}${now >= h.from && now < h.to ? ' · <b>active now</b>' : ''}</span></div>${pill(SV[h.sev][0], SV[h.sev][1])}</header>
      <dl class="rem"><dt>Why</dt><dd>${h.why}</dd><dt>What it can bring</dt><dd>${h.ill}</dd><dt>How to handle it</dt><dd>${h.cope}</dd><dt>Remedy</dt><dd>${h.planets.map(p => `${pl(p)} <span lang="sa">${D.REMEDY[p].dev}</span>, ${D.REMEDY[p].practice.toLowerCase().replace(/\.$/, '')}`).join('<br>')}. <a href="#remedies">Details</a></dd></dl></article>`;
    return `<p class="lead">Stretches that classical rules mark as demanding, drawn from three sources: Saturn's passage near your Moon and Lagna, Rahu and Ketu crossing your key points, and dasha sub-periods whose ruling planet is weak or badly placed in your chart. Each one says why it is flagged, what it tends to bring, and what helps.</p>
    <p class="note">These are periods to be careful in, not predictions of misfortune. Most pass as heavier workloads or slower progress. Overlapping bars matter more than any single one.</p>
    <div class="seg" role="group" aria-label="Window">${[5, 10, 25].map(y => `<button data-wy="${y}" class="${yrs === y ? 'on' : ''}">Next ${y} years</button>`).join('')}</div>
    <section class="card"><h2>Timeline</h2><div class="lanes">${lane(W.hard, 'Saturn')}${lane(W.hard, 'Nodes')}${lane(W.hard, 'Dasha')}${lane(W.soft, 'Jupiter', true)}${lane(W.soft, 'Dasha', true).replace('>Dasha<', '>Good dasha<')}<div class="lane"><span class="ln"></span><div class="sticks">${ticks}</div></div></div>
      <div class="legend"><span><i class="lb s3"></i>High</span><span><i class="lb s2"></i>Moderate</span><span><i class="lb s1"></i>Mild</span><span><i class="lb soft"></i>Supportive</span></div></section>
    <h2 class="sec">Active now</h2><div class="grid cards wide">${active.map(card).join('') || '<p>Nothing is flagged right now.</p>'}</div>
    <h2 class="sec">Coming up</h2><div class="grid cards wide">${W.hard.filter(h => h.from > now).map(card).join('') || '<p>Nothing further is flagged in this window.</p>'}</div>
    <h2 class="sec">Supportive windows</h2><section class="card"><div class="scroll"><table><thead><tr><th>Period</th><th>From</th><th>To</th><th>Why it helps</th></tr></thead><tbody>${W.soft.map(s => `<tr class="${now >= s.from && now < s.to ? 'cur' : ''}"><td>${s.title}</td><td>${fd(s.from)}</td><td>${fd(s.to)}</td><td>${s.why}</td></tr>`).join('') || '<tr><td colspan="4">None in this window.</td></tr>'}</tbody></table></div></section>
    <h2 class="sec">Transitions in the next five years</h2><p class="hint">Changes of dasha and of the slow planets' signs. The weeks around a change are when life feels most unsettled.</p>
    <section class="card"><div class="scroll"><table><thead><tr><th>Date</th><th>Change</th><th>What shifts</th><th>Possible strain</th><th>What helps</th></tr></thead><tbody>${W.trans.map(t => { const x = R.transitionText(c, t); return `<tr><td class="num">${fd(t.date)}</td><td>${pill(t.kind === 'transit' ? 'Transit' : 'Dasha', x.sev)}<br><b>${x.title}</b></td><td>${x.text}</td><td>${x.ill}</td><td>${x.cope}</td></tr>`; }).join('')}</tbody></table></div></section>`;
  }

  /* ================= Remedies ================= */
  function vRemedies() {
    const c = st.chart, plan = R.remedyPlan(c, st.sat, currentDasha()), top = plan.map(x => x.p), rest = J.P.filter(p => !top.includes(p));
    return `<p class="lead">Simple things anyone can do without a priest, expense or special materials: a short mantra, one act of giving, and a habit. They are ordered for your chart, with the planets that most need support first.</p>
    <section class="card prose"><h2>Where these come from</h2><p>The Vedas and Upanishads do not prescribe remedies planet by planet. The planet-wise giving and worship come from Brihat Parashara Hora Shastra and the Puranic tradition. What the Vedas contribute are the hymns tradition recites with them, and what the Upanishads contribute is conduct: truthfulness, study, and honouring mother, father and teacher. Each card names its source so you can see which is which.</p><p>Do one or two consistently instead of all of them occasionally. Giving and service count for more than recitation, and none of this replaces medical, legal or financial help. Gemstones have their own section, because whether a stone suits you depends on your Lagna: see <a href="#gemstones">Gemstones</a>.</p></section>
    <h2 class="sec">Your priorities now</h2><div class="grid cards wide">${plan.map(x => remedyCard(x.p, x.why)).join('')}</div>
    <h2 class="sec">For peace in any period</h2><section class="card"><div class="shanti">${D.SHANTI.map(s => `<div><p class="mantra"><span lang="sa">${s[0]}</span><small>${s[1]}</small></p><p>${s[3]}</p><p class="hint">${s[2]}</p></div>`).join('')}</div></section>
    ${rest.length ? `<h2 class="sec">The other planets</h2><div class="grid cards wide">${rest.map(p => remedyCard(p)).join('')}</div>` : ''}`;
  }


  /* ================= Gemstones ================= */
  function vGems() {
    const c = st.chart, G = R.gemPlan(c, currentDasha()), CAT = { yes: ['Suits your chart', 'good'], maybe: ['Neutral, situational', 'warn'], avoid: ['Not advised', 'bad'] };
    const card = g => { const m = D.GEM[g.p]; return `<article class="card pcard pl-${g.p} gcard"><header><span class="glyph">${D.PLANETS[g.p].glyph}</span><div><h3>${m[0]} <small>${m[1]} · for ${PN(g.p)}</small></h3>${pill(CAT[g.cat][0], CAT[g.cat][1])}</div></header><p>${g.why}</p>${g.notes.map(n => `<p class="note">${n}</p>`).join('')}
      ${g.cat !== 'avoid' ? `<dl class="rem"><dt>Affordable substitute</dt><dd>${m[2]}</dd><dt>Metal</dt><dd>${m[3]}</dd><dt>Finger</dt><dd>${m[4]}, on the hand you work with</dd><dt>First worn</dt><dd>${m[5]}, after reciting <span lang="sa">${D.REMEDY[g.p].dev}</span> 108 times</dd><dt>Supports</dt><dd>${D.PLANETS[g.p].themes}</dd></dl>` : ''}</article>`; };
    const by = k => G.gems.filter(g => g.cat === k).map(card).join('');
    const L = G.lucky, days = [...new Set(L.map(p => D.REMEDY[p].day))];
    return `<p class="lead">Each planet has a gemstone, and wearing it is said to strengthen that planet. That is why the stone must be chosen from your chart: strengthening a planet that rules a difficult house for your Lagna can make things worse. The verdicts below follow the standard rule based on which houses each planet rules for ${SN(c.asc.sign)} Lagna.</p>
    <section class="card prose"><h2>Before you buy anything</h2><ul>
      <li><b>There is no scientific evidence that gemstones change events.</b> The practice rests on tradition. Treat a stone as a support for intention, and never as a replacement for treatment, effort or professional advice.</li>
      <li><b>A stone is optional.</b> Mantra, giving and conduct cost nothing and come first. See <a href="#remedies">Remedies</a>.</li>
      <li><b>Start with the substitute.</b> Each stone has an inexpensive alternative that tradition accepts. Nobody needs to spend heavily or borrow for a gem.</li>
      <li><b>Try before you commit.</b> Keep the stone with you for three to seven days first. Blue sapphire, hessonite and cat's eye in particular are always trialled. If sleep, mood or circumstances turn worse, stop.</li>
      <li><b>Buy safely.</b> Ask for a certificate from an independent gem laboratory stating natural origin and any treatment. Be wary of anyone who predicts disaster unless you buy from them.</li>
      <li><b>Size.</b> Common practice is 3 to 5 carats, set so the stone touches the skin. A larger or costlier stone is not better advice.</li>
      <li><b>Source.</b> The planet-to-gem pairing comes from texts such as Jataka Parijata and the gem chapters of the Garuda Purana, not from the Vedas or Upanishads. The house-rulership rule used here is later Parashari practice, and astrologers differ on details.</li></ul></section>
    <h2 class="sec">Stones that suit your chart</h2><div class="grid cards wide">${by('yes')}</div>
    ${G.clash.length ? `<p class="note">Do not wear these together: ${G.clash.map(x => `${D.GEM[x[0]][0]} with ${D.GEM[x[1]][0]}`).join('; ')}. Their planets belong to opposing groups. Choose one.</p>` : '<p class="note">These stones belong to mutually friendly planets and can be worn together. If you want only one, take the first.</p>'}
    <h2 class="sec">Neutral or situational</h2><div class="grid cards wide">${by('maybe') || '<p>None.</p>'}</div>
    <h2 class="sec">Not advised for your chart</h2><div class="grid cards wide">${by('avoid') || '<p>None.</p>'}</div>
    <h2 class="sec">Favourable for you</h2><section class="card"><p class="hint">From the planets that rule your Lagna, 5th and 9th houses: ${L.map(p => pl(p)).join(' ')}.</p>
      <div class="kv"><div><span>Days</span><b>${days.join(', ')}</b><small>Good for beginnings</small></div><div><span>Colours</span><b>${L.map(p => D.ATTR[p][0].split(',')[0]).join(', ')}</b><small>For clothes and surroundings</small></div><div><span>Directions</span><b>${L.map(p => D.ATTR[p][1]).filter(x => x !== '—').join(', ')}</b><small>To face for work or prayer</small></div><div><span>Numbers</span><b>${L.map(p => D.ATTR[p][2]).join(', ')}</b><small>From popular numerology, not the classical texts</small></div><div><span>Metals</span><b>${[...new Set(L.map(p => D.GEM[p][3].split(' or ')[0].split(',')[0]))].join(', ')}</b><small>For rings and pendants</small></div></div></section>
    <section class="card"><h2>All nine at a glance</h2><div class="scroll"><table><thead><tr><th>Planet</th><th>Gemstone</th><th>Substitute</th><th>Metal</th><th>Finger</th><th>For you</th></tr></thead><tbody>${J.P.map(p => { const g = G.gems.find(x => x.p === p), m = D.GEM[p]; return `<tr><td>${pl(p)}</td><td>${m[0]} <small>${m[1]}</small></td><td>${m[2]}</td><td>${m[3]}</td><td>${m[4]}</td><td>${pill(CAT[g.cat][0], CAT[g.cat][1])}</td></tr>`; }).join('')}</tbody></table></div></section>`;
  }


  /* ================= Portrait ================= */
  function vPortrait() {
    const c = st.chart, P = R.portrait(c, st.input.gender), blk = (t, a) => `<section class="card prose"><h2>${t}</h2>${a.map(x => `<p>${x}</p>`).join('')}</section>`;
    return `<p class="lead">A sketch of the person the chart describes, put together from the ${term('lagna', 'Lagna')}, its ruling planet, the Moon and the birth star. Each part says how well the classical texts support it.</p>
    <div class="grid tiles"><div class="tile"><span class="k">Temperament group</span><span class="v">${P.gana} gana</span><span class="sub">From the birth star</span></div><div class="tile"><span class="k">Constitution</span><span class="v">${P.nadi}</span><span class="sub">Nadi of the birth star</span></div><div class="tile"><span class="k">Symbolic animal</span><span class="v">${P.star.yoni}</span><span class="sub">Yoni of the birth star</span></div><div class="tile"><span class="k">Leading element</span><span class="v">${D.SIGNS[c.asc.sign].element} Lagna</span><span class="sub">${D.SIGNS[c.asc.sign].quality} sign</span></div></div>
    <div class="grid two">${blk('Personality and temperament', P.temper)}
      <div class="view inner">${blk('Build and appearance', P.body.concat(['<span class="hint">Well described in the texts, but real bodies follow family and lifestyle more than the chart. Read it as what tradition expects, not a description of you.</span>']))}
      ${blk('Friends and social circle', P.friends)}</div></div>
    <div class="grid two"><section class="card prose"><h2>Interests and talents</h2><p class="hint">From the planets in your 1st, 3rd, 5th and 10th houses, the rulers of the 3rd and 5th, and your strongest planets.</p><ul>${P.interests.map(i => `<li>${pl(i.p)} ${i.text}</li>`).join('')}</ul></section>${blk('Pets and animals', P.pets)}</div>
    <section class="card prose"><h2>Life advice</h2><p><b>For your nature:</b> ${P.advice[0]}</p>${P.advice.slice(1).map(a => `<p>${a}</p>`).join('')}
      <div class="grid doav"><div><h4>Lean on these</h4><ul>${P.lean.map(a => `<li><b>${a.title}</b> ${stars(a.stars)}<br><span class="hint">Your strongest ground. Build here first.</span></li>`).join('')}</ul></div><div><h4>Give patient effort to these</h4><ul>${P.work.map(a => `<li><b>${a.title}</b> ${stars(a.stars)}<br><span class="hint">Results come slower here; steady routine beats bursts.</span></li>`).join('')}</ul></div></div>
      <p class="hint">Details for each are under <a href="#life">Life areas</a>; practices that help are under <a href="#remedies">Remedies</a>.</p></section>`;
  }

  /* ================= Matching ================= */
  function vMatch() {
    const c = st.chart, m = st.partner, mine = st.input.gender === 'f' ? 'bride' : 'groom', role = st.mRole || (mine === 'groom' ? 'bride' : 'groom');
    let res = '';
    if (m && m.chart) {
      const g = role === 'bride' ? c : m.chart, b = role === 'bride' ? m.chart : c, M = R.match(g, b), gn = role === 'bride' ? (st.input.name || 'This chart') : (m.name || 'Partner'), bn = role === 'bride' ? (m.name || 'Partner') : (st.input.name || 'This chart');
      const who = (n, x) => `<div><span class="k">${n}</span><b>${SN(x.sign)} Moon</b><small>${D.NAK[x.nak].name} · ${D.GANANAME[x.gana][0]} gana · ${x.yoni} · ${D.NADINAME[x.nadi]}</small></div>`;
      res = `<section class="card now"><div class="mscore"><div class="dial ${M.verdict[1]}"><b>${M.total % 1 ? M.total.toFixed(1) : M.total}</b><small>of 36</small></div><div><h2>${M.verdict[0]}</h2><p>18 is the traditional minimum, 24 and above is good, 32 and above is excellent.</p><div class="kv">${who(esc(gn) + ' (groom)', M.g)}${who(esc(bn) + ' (bride)', M.b)}</div></div></div>
        <ul>${M.flags.map(f => `<li>${f}</li>`).join('')}</ul></section>
      <section class="card"><h2>The eight tests</h2><div class="scroll"><table><thead><tr><th>Koota</th><th>Tests</th><th>Points</th><th></th><th>Detail</th></tr></thead><tbody>${M.kutas.map(k => `<tr><td><b>${k.name}</b></td><td>${k.about}</td><td class="num">${k.pts} / ${k.max}</td><td><span class="mbar"><i style="width:${(k.pts / k.max * 100).toFixed(0)}%" class="${k.pts / k.max >= 0.75 ? 'good' : k.pts / k.max >= 0.4 ? 'warn' : 'bad'}"></i></span></td><td>${k.detail}</td></tr>`).join('')}</tbody></table></div>
        <p class="hint">The system is written for a bride and groom, and three tests (Varna, Vashya, Gana) score differently depending on which chart is which. Scoring tables for Vashya and Gana vary slightly between almanacs, so another app may differ by a point or two.</p></section>`;
    }
    return `<p class="lead">Kundli matching (Ashtakoota Guna Milan) compares two people's Moon signs and birth stars on eight tests worth 36 points. It needs only the partner's birth details.</p>
    <p class="note">The score measures one traditional idea of compatibility. It cannot see character, values or how two people treat each other, and astrologers also compare the full charts. Do not accept or reject a person on this number alone.</p>
    <section class="card"><h2>Partner's birth details</h2><form id="mform" class="form mform" novalidate>
      <div class="row half"><label for="m-name">Name</label><input id="m-name" type="text" autocomplete="off" value="${esc(m ? m.name : '')}"></div>
      <div class="row half"><label for="m-role">Partner is the</label><select id="m-role"><option value="bride" ${role === 'bride' ? 'selected' : ''}>Bride</option><option value="groom" ${role === 'groom' ? 'selected' : ''}>Groom</option></select></div>
      <div class="row half"><label for="m-date">Date of birth</label><input id="m-date" type="date" value="${m ? m.date : ''}"></div>
      <div class="row half"><label for="m-time">Time of birth</label><input id="m-time" type="time" value="${m ? m.time : ''}"></div>
      <div class="row"><label for="m-place">Place of birth <small>pick from the list, or fill the three fields below</small></label><input id="m-place" type="text" list="citylist" autocomplete="off" value="${esc(m ? m.place : '')}"><datalist id="citylist">${D.CITIES.map(x => `<option value="${esc(x.name + ', ' + x.region)}">`).join('')}</datalist></div>
      <div class="row third"><label for="m-lat">Latitude</label><input id="m-lat" type="number" step="any" value="${m ? m.lat : ''}"></div><div class="row third"><label for="m-lon">Longitude</label><input id="m-lon" type="number" step="any" value="${m ? m.lon : ''}"></div><div class="row third"><label for="m-tz">Time zone</label><input id="m-tz" type="text" value="${esc(m ? m.tz : '')}" placeholder="Asia/Kolkata"></div>
      <p id="merr" class="err" role="alert"></p><div class="row actions"><button class="btn primary" type="submit">Compare charts</button></div></form></section>${res}`;
  }
  function runMatch() {
    const v = id => $('#' + id).value.trim(), err = t => { $('#merr').textContent = t; };
    const d = v('m-date').split('-').map(Number), t = v('m-time').split(':').map(Number), lat = parseFloat(v('m-lat')), lon = parseFloat(v('m-lon')); let tz = v('m-tz');
    if (d.length !== 3 || !d[0]) return err("Enter the partner's date of birth."); if (t.length < 2 || isNaN(t[0])) return err("Enter the partner's time of birth. If unknown, use 12:00; the score depends on the Moon, which moves about half a degree an hour.");
    if (isNaN(lat) || isNaN(lon)) return err('Pick a place from the list or enter latitude and longitude.');
    const mm = tz.match(/^([+-])(\d{1,2})(?::?(\d{2}))?$/); let tzv = tz; if (mm) tzv = (mm[1] === '-' ? -1 : 1) * (+mm[2] * 60 + (+mm[3] || 0)); else { try { new Intl.DateTimeFormat('en', { timeZone: tz }); } catch (e) { return err('Time zone must be a name such as Asia/Kolkata or an offset such as +05:30.'); } }
    try { st.partner = { name: v('m-name'), date: v('m-date'), time: v('m-time'), place: v('m-place'), lat, lon, tz, chart: J.compute({ y: d[0], m: d[1], d: d[2], h: t[0], min: t[1], lat, lon, tz: tzv, ayanamsa: st.chart.ayanamsaSys }) }; st.mRole = v('m-role'); render(); } catch (e) { err('Could not compute the chart: ' + e.message); }
  }

  const TABS = [['overview', 'Overview', vOverview], ['today', 'Today', vToday], ['portrait', 'Portrait', vPortrait], ['guru', 'AstroGuru', vGuru], ['charts', 'Charts', vCharts], ['planets', 'Planets', vPlanets], ['dasha', 'Dasha', vDasha], ['transits', 'Transits', vTransits], ['sade-sati', 'Sade Sati', vSade], ['watch', 'Watch periods', vWatch], ['remedies', 'Remedies', vRemedies], ['gemstones', 'Gemstones', vGems], ['match', 'Matching', vMatch], ['yogas', 'Yogas', vYogas], ['life', 'Life areas', vLife], ['nadi', 'Nadi', vNadi], ['learn', 'Learn', vLearn]];

  const GROUPS = [['You', ['overview', 'today', 'portrait', 'guru']], ['Chart', ['charts', 'planets', 'yogas', 'life']], ['Timing', ['dasha', 'transits', 'sade-sati', 'watch']], ['Guidance', ['remedies', 'gemstones', 'match']], ['More', ['nadi', 'learn']]];
  function render() {
    const c = st.chart; if (!c) return;
    const i = st.input, t = TABS.find(x => x[0] === st.tab) || TABS[0];
    $('#idbar').innerHTML = `<div><h1>${esc(i.name || 'Kundali')}</h1><p>${new Date(Date.UTC(i.y, i.m - 1, i.d)).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })} · ${String(i.h).padStart(2, '0')}:${String(i.min).padStart(2, '0')} · ${esc(i.place || '')}${i.sample ? ' · <b>sample chart</b>' : ''}</p></div><div class="idact"><button class="btn" id="edit">Edit details</button>${framed ? '' : '<button class="btn" id="print">Print</button>'}</div>`;
    $('#tabs').innerHTML = GROUPS.map(g => `<div class="ng"><span class="k">${g[0]}</span>${g[1].map(id => { const x = TABS.find(y => y[0] === id); return `<a href="#${id}" class="${id === t[0] ? 'on' : ''}" ${id === t[0] ? 'aria-current="page"' : ''}>${x[1]}</a>`; }).join('')}</div>`).join('');
    $('#tabs').classList.remove('open'); $('#navbtn').innerHTML = `<span><i aria-hidden="true">☰</i> <span>Menu</span></span><b>${t[1]}</b>`;
    $('#view').innerHTML = t[2]();
    if (t[0] === 'transits') { const sp = $('#speed'); if (sp) sp.value = String(st.speed); }
  }
  function generate(input, keepTab) {
    try {
      st.chart = J.compute(input); st.input = input; st.sat = J.saturnCycles(st.chart, st.chart.ayanamsaSys);
      st.mOpen = st.aOpen = null; st.partner = null; GURU.msgs = []; cancelAnimationFrame(HERO.raf); st.tcache = {}; st.selHouse = 1; st.aspP = null;
      $('#home').hidden = true; $('#report').hidden = false; if (!keepTab) { st.tab = 'overview'; if (location.hash && location.hash !== '#overview') location.hash = 'overview'; }
      render(); window.scrollTo(0, 0);
    } catch (e) { $('#ferr').textContent = 'Could not compute the chart: ' + e.message; }
  }

  /* ================= Form ================= */
  function fillForm(i) {
    $('#f-name').value = i.name || ''; $('#f-date').value = `${String(i.y).padStart(4, '0')}-${String(i.m).padStart(2, '0')}-${String(i.d).padStart(2, '0')}`; $('#f-time').value = `${String(i.h).padStart(2, '0')}:${String(i.min).padStart(2, '0')}`;
    $('#f-place').value = i.place || ''; $('#f-lat').value = i.lat; $('#f-lon').value = i.lon; $('#f-tz').value = typeof i.tz === 'number' ? fmtOff(i.tz) : i.tz; $('#f-gender').value = i.gender || ''; $('#f-ayan').value = i.ayanamsa || 'lahiri';
  }
  const fmtOff = m => (m < 0 ? '-' : '+') + String(Math.floor(Math.abs(m) / 60)).padStart(2, '0') + ':' + String(Math.abs(m) % 60).padStart(2, '0');
  function readForm() {
    const err = m => { $('#ferr').textContent = m; return null; }; $('#ferr').textContent = '';
    const d = $('#f-date').value.split('-').map(Number), t = $('#f-time').value.split(':').map(Number);
    if (d.length !== 3 || !d[0]) return err('Enter the date of birth.'); if (t.length < 2 || isNaN(t[0])) return err('Enter the time of birth. If unknown, use 12:00 and treat the Lagna and houses as unreliable.');
    const lat = parseFloat($('#f-lat').value), lon = parseFloat($('#f-lon').value);
    if (isNaN(lat) || isNaN(lon) || Math.abs(lat) > 66 || Math.abs(lon) > 180) return err('Choose a place from the list, or enter latitude (−66 to 66) and longitude (−180 to 180) yourself.');
    let tz = $('#f-tz').value.trim(); const m = tz.match(/^([+-])(\d{1,2})(?::?(\d{2}))?$/);
    if (m) tz = (m[1] === '-' ? -1 : 1) * (+m[2] * 60 + (+m[3] || 0)); else { try { new Intl.DateTimeFormat('en', { timeZone: tz }); } catch (e) { return err('Time zone must be a name such as Asia/Kolkata or an offset such as +05:30.'); } }
    return { name: $('#f-name').value.trim(), y: d[0], m: d[1], d: d[2], h: t[0], min: t[1], place: $('#f-place').value.trim(), lat, lon, tz, gender: $('#f-gender').value, ayanamsa: $('#f-ayan').value };
  }
  function showPlaces(list, note) {
    const box = $('#places'); box.innerHTML = list.map((c, i) => `<button type="button" data-i="${i}">${esc(c.name)} <small>${esc(c.region)}</small></button>`).join('') + (note ? `<p>${note}</p>` : ''); box.hidden = !list.length && !note; box._list = list;
  }
  function searchLocal(q) {
    q = q.toLowerCase().trim(); if (q.length < 2) return showPlaces([]);
    const a = D.CITIES.filter(c => c.name.toLowerCase().startsWith(q)), b = D.CITIES.filter(c => !c.name.toLowerCase().startsWith(q) && (c.name + ' ' + c.region).toLowerCase().includes(q));
    const r = a.concat(b).slice(0, 8); showPlaces(r, r.length ? '' : 'Not in the built-in list. Try the nearest city, use "Search online", or type the coordinates below.');
  }
  async function searchOnline() {
    const q = $('#f-place').value.trim(); if (q.length < 2) return;
    showPlaces([], 'Searching…');
    try {
      const r = await fetch('https://geocoding-api.open-meteo.com/v1/search?count=8&language=en&name=' + encodeURIComponent(q)), j = await r.json();
      const l = (j.results || []).map(x => ({ name: x.name, region: [x.admin1, x.country].filter(Boolean).join(', '), lat: x.latitude, lon: x.longitude, tz: x.timezone }));
      showPlaces(l, l.length ? '' : 'No match found online.');
    } catch (e) { showPlaces([], 'Online search is not available here. Pick the nearest city from the list or type the coordinates.'); }
  }
  function profiles() {
    const ps = store.get('jd.profiles', []);
    $('#saved').innerHTML = ps.length ? '<span class="k">Saved charts</span>' + ps.map((p, i) => `<span class="chip"><button type="button" data-load="${i}">${esc(p.name || 'Unnamed')} <small>${p.d}/${p.m}/${p.y}</small></button><button type="button" class="x" data-del="${i}" aria-label="Remove ${esc(p.name || 'chart')}">×</button></span>`).join('') : '';
  }
  function saveProfile(i) { if (i.sample) return; let ps = store.get('jd.profiles', []); const key = x => [x.name, x.y, x.m, x.d, x.h, x.min].join('|'); ps = ps.filter(x => key(x) !== key(i)); const c = Object.assign({}, i); delete c.nudge; ps.unshift(c); store.set('jd.profiles', ps.slice(0, 12)); }

  /* ================= Events ================= */
  let timer = null;
  function stopPlay() { st.play = false; clearInterval(timer); timer = null; }
  function refreshTransit(full) {
    const box = $('#wheelbox'); if (!box) return;
    box.innerHTML = wheel(J.transits(st.tDate, st.chart, st.chart.ayanamsaSys));
    const di = $('#tdate'); if (di) di.value = new Date(st.tDate.getTime() - st.tDate.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    if (full) { $('#tsum').innerHTML = transitSummary(); $('#ttable').innerHTML = transitTable(); }
  }
  document.addEventListener('click', e => {
    const t = e.target, q = s => t.closest(s);
    let el;
    if ((el = q('[data-house]'))) { st.selHouse = +el.dataset.house; if (st.tab === 'overview') { st.tab = 'charts'; st.kind = 'd1'; location.hash = 'charts'; } render(); }
    else if ((el = q('[data-style]'))) { st.style = el.dataset.style; store.set('jd.style', st.style); render(); }
    else if ((el = q('[data-kind]'))) { st.kind = el.dataset.kind; render(); }
    else if ((el = q('[data-asp]'))) { st.aspP = st.aspP === el.dataset.asp ? null : el.dataset.asp; render(); }
    else if ((el = q('[data-maha]'))) { st.mOpen = el.dataset.maha; st.aOpen = null; render(); }
    else if ((el = q('[data-antar]'))) { st.aOpen = st.aOpen === el.dataset.antar ? null : el.dataset.antar; render(); }
    else if ((el = q('[data-nudge]'))) { const k = el.dataset.nudge, n = Object.assign({}, st.input.nudge || {}); if (n[k]) delete n[k]; else n[k] = 1; generate(Object.assign({}, st.input, { nudge: n }), true); }
    else if ((el = q('[data-shift]'))) { stopPlay(); st.tDate = new Date(st.tDate.getTime() + (+el.dataset.shift) * J.DAY); render(); }
    else if ((el = q('[data-dshift]'))) { const x = new Date(dayMoment()); x.setDate(x.getDate() + (+el.dataset.dshift)); x.setHours(12, 0, 0, 0); st.dDate = x; render(); }
    else if ((el = q('[data-dday]'))) { st.dDate = new Date(+el.dataset.dday); render(); window.scrollTo(0, 0); }
    else if (t.id === 'dtoday') { st.dDate = null; render(); }
    else if ((el = q('[data-wy]'))) { st.wYears = +el.dataset.wy; render(); }
    else if (t.id === 'today') { stopPlay(); st.tDate = new Date(); render(); }
    else if (t.id === 'play') {
      if (st.play) { stopPlay(); render(); }
      else { st.play = true; t.textContent = 'Pause'; timer = setInterval(() => { st.tDate = new Date(st.tDate.getTime() + st.speed * J.DAY); refreshTransit(false); }, 110); }
    }
    else if (t.id === 'edit') { fillForm(st.input); profiles(); showHome(true); }
    else if (q('#brand')) showHome();
    else if (t.id === 'back') { $('#home').hidden = true; $('#report').hidden = false; render(); window.scrollTo(0, 0); }
    else if (t.id === 'sample') generate(SAMPLE);
    else if ((el = q('[data-demo]'))) { st.tab = el.dataset.demo; generate(st.chart && !st.input.sample ? st.input : SAMPLE, true); location.hash = st.tab; }
    else if (q('#navbtn')) $('#tabs').classList.toggle('open');
    else if (t.id === 'hnow') { HERO.mode = 'now'; HERO.base = new Date(); $('#hscrub').value = 0; $('#herocap').textContent = 'The sky right now'; heroSet(HERO.base, true); }
    else if ((el = q('[data-hp]'))) { const k = el.dataset.hp, P = D.PLANETS[k], lon = HERO.lons[k]; heroInfo(`<b class="pl-${k}">${P.glyph} ${P.name}</b> (${P.sa}, <span lang="hi">${P.dev}</span>) stands for ${P.themes}. On this date it is in <b>${SN(Math.floor(lon / 30))}</b> at ${dms(lon % 30)}, in the star ${D.NAK[Math.floor(lon / (360 / 27))].name}.`); }
    else if ((el = q('[data-hs]'))) { const i = +el.dataset.hs, S = D.SIGNS[i], inn = J.P.filter(k => Math.floor(HERO.lons[k] / 30) === i); heroInfo(`<b>${S.glyph} ${S.name}</b> (${S.sa}, <span lang="hi">${S.dev}</span>) is a ${S.quality.toLowerCase()} ${S.element.toLowerCase()} sign ruled by ${PN(J.SIGN_LORD[i])}. ${inn.length ? 'Here on this date: ' + inn.map(PN).join(', ') + '.' : 'No planet is here on this date.'}`); }
    else if ((el = q('[data-hn]'))) { const n = D.NAK[+el.dataset.hn]; heroInfo(`<b>${n.name}</b> is one of the 27 nakshatras, the Moon's daily stations. Symbol: ${n.symbol}. Deity: ${n.deity}. People born under it are ${n.trait}.${el.classList.contains('on') ? ' The Moon is here on this date.' : ''}`); }
    else if (t.id === 'gstart') guruSend('Welcome me in three sentences, naming my Lagna, Moon sign and current dasha. Then suggest three questions I could ask you.');
    else if ((el = q('[data-gq]'))) guruSend(el.dataset.gq);
    else if (t.id === 'gclear') { GURU.msgs = []; render(); }
    else if (t.id === 'print') { try { window.print(); } catch (x) { } }
    else if (t.id === 'online') searchOnline();
    else if (t.id === 'theme') { const r = document.documentElement, dark = r.dataset.theme ? r.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches; r.dataset.theme = dark ? 'light' : 'dark'; store.set('jd.theme', r.dataset.theme); }
    else if ((el = q('#places button'))) { const c = $('#places')._list[+el.dataset.i]; $('#f-place').value = c.name + (c.region ? ', ' + c.region : ''); $('#f-lat').value = c.lat; $('#f-lon').value = c.lon; $('#f-tz').value = c.tz || ''; showPlaces([]); heroFromForm(); }
    else if ((el = q('[data-load]'))) { fillForm(store.get('jd.profiles', [])[+el.dataset.load]); }
    else if ((el = q('[data-del]'))) { const ps = store.get('jd.profiles', []); ps.splice(+el.dataset.del, 1); store.set('jd.profiles', ps); profiles(); }
    if (!q('.term')) hideTip();
  });
  document.addEventListener('change', e => {
    if (e.target.id === 'tdate' && e.target.value) { stopPlay(); const d = e.target.value.split('-').map(Number); st.tDate = new Date(d[0], d[1] - 1, d[2], 12); render(); }
    if (e.target.id === 'speed') st.speed = +e.target.value;
    if (e.target.id === 'lang') setLang(e.target.value);
    if (['f-date', 'f-time', 'f-tz'].includes(e.target.id)) heroFromForm();
    if (e.target.id === 'ddate' && e.target.value) { const d = e.target.value.split('-').map(Number); st.dDate = new Date(d[0], d[1] - 1, d[2], 12); render(); }
  });
  document.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('tr[data-antar]')) { e.preventDefault(); e.target.click(); } if (e.key === 'Escape') hideTip(); });
  $('#f-place').addEventListener('input', e => searchLocal(e.target.value));
  document.addEventListener('submit', e => { if (e.target.id === 'mform') { e.preventDefault(); runMatch(); } if (e.target.id === 'gform') { e.preventDefault(); const v = $('#gq').value; guruSend(v); } });
  document.addEventListener('input', e => { if (e.target.id === 'hscrub') { $('#herocap').textContent = HERO.mode === 'birth' ? 'The sky at the birth moment you entered' : 'The sky right now'; heroSet(new Date(HERO.base.getTime() + (+e.target.value) * J.DAY), false); } });
  document.addEventListener('keydown', e => { if (e.target.id === 'gq' && e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); guruSend(e.target.value); } if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('[data-hp]')) { e.preventDefault(); e.target.dispatchEvent(new MouseEvent('click', { bubbles: true })); } });
  document.addEventListener('input', e => { if (e.target.id === 'm-place') { const c = D.CITIES.find(x => x.name + ', ' + x.region === e.target.value); if (c) { $('#m-lat').value = c.lat; $('#m-lon').value = c.lon; $('#m-tz').value = c.tz; } } });
  $('#form').addEventListener('submit', e => { e.preventDefault(); const i = readForm(); if (!i) return; saveProfile(i); generate(i); });
  window.addEventListener('hashchange', () => { const h = location.hash.slice(1); if (TABS.some(x => x[0] === h) && st.chart && (h !== st.tab || $('#report').hidden)) { stopPlay(); st.tab = h; $('#home').hidden = true; $('#report').hidden = false; render(); window.scrollTo(0, 0); } });

  /* glossary tooltips */
  const tip = $('#tip');
  function showTip(el) { const g = D.GLOSSARY[el.dataset.term]; if (!g) return; tip.innerHTML = `<b>${g[0]}</b>${g[1]}`; tip.hidden = false; const r = el.getBoundingClientRect(), w = Math.min(320, innerWidth - 24); tip.style.width = w + 'px'; tip.style.left = Math.max(12, Math.min(innerWidth - w - 12, r.left + r.width / 2 - w / 2)) + 'px'; const th = tip.offsetHeight; tip.style.top = (r.top - th - 8 > 8 ? r.top - th - 8 : r.bottom + 8) + scrollY + 'px'; }
  function hideTip() { tip.hidden = true; }
  document.addEventListener('mouseover', e => { const t = e.target.closest && e.target.closest('.term'); if (t) showTip(t); });
  document.addEventListener('mouseout', e => { if (e.target.closest && e.target.closest('.term')) hideTip(); });
  document.addEventListener('focusin', e => { const t = e.target.closest && e.target.closest('.term'); if (t) showTip(t); else hideTip(); });
  document.addEventListener('click', e => { const t = e.target.closest('.term'); if (t) showTip(t); });

  /* ================= Landing: live sky wheel ================= */
  const HERO = { base: new Date(), date: new Date(), lons: null, mode: 'now', raf: 0 };
  function heroLons(d) { const o = {}; J.P.forEach(p => o[p] = J.sidLon(p, d)); return o; }
  function heroDraw(lons) {
    const c = 280, f = n => n.toFixed(1), pt = (lon, r) => { const a = (90 + lon) * Math.PI / 180; return [c + r * Math.cos(a), c - r * Math.sin(a)]; };
    const arc = (l1, l2, r1, r2) => { const a = pt(l1, r1), b = pt(l2, r1), d = pt(l2, r2), e = pt(l1, r2); return `M${f(a[0])} ${f(a[1])}A${r1} ${r1} 0 0 0 ${f(b[0])} ${f(b[1])}L${f(d[0])} ${f(d[1])}A${r2} ${r2} 0 0 1 ${f(e[0])} ${f(e[1])}Z`; };
    let s = '<defs><radialGradient id="hg"><stop offset="0" stop-color="#e8bd66" stop-opacity=".38"/><stop offset="1" stop-color="#e8bd66" stop-opacity="0"/></radialGradient></defs>';
    s += `<circle cx="${c}" cy="${c}" r="150" fill="url(#hg)"/>`;
    const L = 360 / 27, mn = Math.floor(lons.Mo / L);
    for (let i = 0; i < 27; i++) s += `<path class="hnak ${i === mn ? 'on' : ''}" data-hn="${i}" d="${arc(i * L + 0.5, (i + 1) * L - 0.5, 274, 260)}"><title>${D.NAK[i].name} nakshatra</title></path>`;
    for (let i = 0; i < 12; i++) {
      const g = pt(i * 30 + 15, 234), n = pt(i * 30 + 15, 211);
      s += `<path class="hsign ${i % 2 ? 'alt' : ''}" data-hs="${i}" d="${arc(i * 30, i * 30 + 30, 254, 198)}"><title>${SN(i)} · ${D.SIGNS[i].sa}</title></path><text class="hglyph" x="${f(g[0])}" y="${f(g[1] + 7)}" text-anchor="middle">${D.SIGNS[i].glyph}</text><text class="hname" x="${f(n[0])}" y="${f(n[1] + 4)}" text-anchor="middle">${D.SIGNS[i].dev}</text>`;
    }
    [180, 152, 124].forEach(r => s += `<circle class="horb" cx="${c}" cy="${c}" r="${r}"/>`);
    s += `<g class="hyantra"><rect x="${c - 46}" y="${c - 46}" width="92" height="92"/><path d="M${c - 46} ${c - 46}L${c + 46} ${c + 46}M${c + 46} ${c - 46}L${c - 46} ${c + 46}M${c} ${c - 46}L${c - 46} ${c}L${c} ${c + 46}L${c + 46} ${c}Z"/></g>`;
    const arr = J.P.map(k => ({ k, lon: lons[k] })).sort((a, b) => a.lon - b.lon); let prev = null;
    arr.forEach(o => {
      o.lv = prev && o.lon - prev.lon < 10 ? (prev.lv + 1) % 3 : 0; prev = o; const [x, y] = pt(o.lon, 180 - o.lv * 28), e = pt(o.lon, 198);
      s += `<line class="hspoke pl-${o.k}" x1="${f(x)}" y1="${f(y)}" x2="${f(e[0])}" y2="${f(e[1])}"/><g class="hpl pl-${o.k}" data-hp="${o.k}" tabindex="0" role="button" aria-label="${PN(o.k)}"><circle class="halo" cx="${f(x)}" cy="${f(y)}" r="19"/><circle class="disc" cx="${f(x)}" cy="${f(y)}" r="12.5"/><text x="${f(x)}" y="${f(y + 4)}" text-anchor="middle">${o.k}</text><title>${PN(o.k)} in ${SN(Math.floor(o.lon / 30))} ${dms(o.lon % 30)}</title></g>`;
    });
    return `<svg class="hwheel" viewBox="0 0 560 560" role="img" aria-label="The zodiac with the planets at their sidereal positions">${s}</svg>`;
  }
  function heroPaint() {
    const box = $('#herowheel'); if (!box) return; box.innerHTML = heroDraw(HERO.lons);
    const d = HERO.date, mo = HERO.lons.Mo, su = HERO.lons.Su, e = J.norm(mo - su), ti = Math.floor(e / 12), tn = ti % 15 === 14 ? (ti > 14 ? 'Amavasya' : 'Purnima') : D.TITHI[ti % 15];
    $('#hdate').textContent = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    $('#skynow').innerHTML = [['Moon', SN(Math.floor(mo / 30))], ['Nakshatra', D.NAK[Math.floor(mo / (360 / 27))].name], ['Tithi', (ti > 14 ? 'Krishna ' : 'Shukla ') + tn], ['Sun', SN(Math.floor(su / 30))]].map(x => `<span><small>${x[0]}</small><b>${x[1]}</b></span>`).join('');
  }
  function heroSet(date, tween) {
    HERO.date = date; const target = heroLons(date); cancelAnimationFrame(HERO.raf);
    if (!tween || !HERO.lons || matchMedia('(prefers-reduced-motion: reduce)').matches) { HERO.lons = target; return heroPaint(); }
    const from = HERO.lons, t0 = performance.now(), step = now => { const k = Math.min(1, (now - t0) / 900), q = 1 - Math.pow(1 - k, 3), cur = {}; J.P.forEach(p => cur[p] = J.norm(from[p] + J.diff(target[p], from[p]) * q)); HERO.lons = cur; heroPaint(); if (k < 1) HERO.raf = requestAnimationFrame(step); };
    HERO.raf = requestAnimationFrame(step);
  }
  function heroInfo(html) { $('#heroinfo').innerHTML = html; }
  const FEATS = [['charts', 'कुं', 'Kundali charts', 'North and South Indian styles, Navamsa and Dasamsa. Select any house for its meaning.'], ['dasha', 'द', 'Dasha timeline', 'Which planet runs each stretch of life, down to the month.'], ['transits', 'गो', 'Live transits', 'An animated wheel of where the planets are now against the birth chart.'], ['sade-sati', 'श', 'Sade Sati', "Every pass of Saturn over the Moon across a lifetime."], ['today', 'आ', 'Daily reading', 'The tone of today from the Moon and the day\'s star.'], ['watch', 'सा', 'Periods to watch', 'Demanding stretches ahead, why they are flagged and what helps.'], ['remedies', 'उ', 'Remedies and gemstones', 'Simple practices with their sources, and stones judged for the chart.'], ['portrait', 'स्व', 'Portrait', 'Temperament, build, friends, interests and life advice.'], ['match', 'मि', 'Kundli matching', 'The 36-point Ashtakoota comparison of two charts.'], ['guru', 'गु', 'AstroGuru', 'Ask Claude questions about the chart in your own words.']];
  function showHome(toForm) {
    stopPlay(); $('#report').hidden = true; $('#home').hidden = false; $('#back').hidden = !st.chart;
    $('#features').innerHTML = FEATS.map(x => `<button class="feat" data-demo="${x[0]}" type="button"><i data-noi18n lang="hi">${x[1]}</i><span><b>${x[2]}</b><small>${x[3]}</small></span></button>`).join('');
    HERO.mode = 'now'; HERO.base = new Date(); $('#hscrub').value = 0; $('#herocap').textContent = 'The sky right now'; heroSet(HERO.base, false); drawStars();
    if (toForm) $('#form').scrollIntoView({ block: 'start' }); else window.scrollTo(0, 0);
  }
  function heroFromForm() {
    const d = $('#f-date').value.split('-').map(Number), t = $('#f-time').value.split(':').map(Number); if (d.length !== 3 || !d[0] || d[0] < 1000 || t.length < 2 || isNaN(t[0])) return;
    let tz = $('#f-tz').value.trim() || 'Asia/Kolkata'; const m = tz.match(/^([+-])(\d{1,2})(?::?(\d{2}))?$/); if (m) tz = (m[1] === '-' ? -1 : 1) * (+m[2] * 60 + (+m[3] || 0));
    try { const u = J.localToUtc(d[0], d[1], d[2], t[0], t[1], tz).date; HERO.mode = 'birth'; HERO.base = u; $('#hscrub').value = 0; $('#herocap').textContent = 'The sky at the birth moment you entered'; heroSet(u, true); } catch (e) { }
  }

  /* ================= AstroGuru (Claude) ================= */
  const GURU = { msgs: [], busy: false, api: undefined, started: false };
  function guruContext() {
    const c = st.chart, i = st.input, p = c.planets, cd = currentDasha(), now = new Date(), L = [];
    L.push(`Person: ${i.name || 'not given'}; born ${i.d}-${i.m}-${i.y} ${String(i.h).padStart(2, '0')}:${String(i.min).padStart(2, '0')} local time at ${i.place || 'unknown place'}; gender ${i.gender || 'not given'}. Today is ${now.toDateString()}.`);
    L.push(`Lagna ${SN(c.asc.sign)} ${dms(c.asc.deg)}. Moon sign ${SN(p.Mo.sign)}, birth star ${D.NAK[p.Mo.nak.index].name} pada ${p.Mo.nak.pada}. Ayanamsa ${c.ayanamsaSys}. Whole-sign houses.`);
    L.push('Planets: ' + J.P.map(k => `${PN(k)} ${SN(p[k].sign)} ${dms(p[k].deg)} house ${p[k].house} ${D.NAK[p[k].nak.index].name}-${p[k].nak.pada} ${p[k].dignity}${p[k].retro && k !== 'Ra' && k !== 'Ke' ? ' retrograde' : ''}${p[k].combust ? ' combust' : ''}${p[k].cusp ? ' ON SIGN BORDER (uncertain sign)' : ''}`).join('; '));
    L.push('House lords: ' + c.houses.map(h => `H${h.num} ${SN(h.sign)} lord ${PN(h.lord)} in H${p[h.lord].house}`).join('; '));
    if (cd) { const up = J.subPeriods(cd.m).filter(a => a.start > now).slice(0, 4); L.push(`Vimshottari now: ${PN(cd.m.lord)} mahadasha (${fd(cd.m.start)} to ${fd(cd.m.end)}), ${PN(cd.a.lord)} antardasha (to ${fd(cd.a.end)}), ${PN(cd.p.lord)} pratyantar (to ${fd(cd.p.end)}). Next antardashas: ${up.map(a => PN(a.lord) + ' from ' + fd(a.start)).join(', ')}. Mahadasha sequence: ${c.dasha.mahas.map(m => PN(m.lord) + ' ' + m.start.getFullYear()).join(', ')}.`); }
    const sn = satNow(); L.push('Sade Sati: ' + (sn.on ? `running, ${PHASE[sn.ph.rel][0]}, whole cycle ${fd(sn.cyc.start)} to ${fd(sn.cyc.end)}` : sn.dh ? `Dhaiya running to ${fd(sn.dh.to)}` : `not running${sn.next ? ', next from ' + fd(sn.next.start) : ''}`) + '.');
    L.push('Yogas and doshas found: ' + R.yogas(c).map(y => `${y.name} [${y.kind}] (${y.why}${y.note ? ' ' + y.note : ''})`).join(' | '));
    const d = R.daily(c, now); L.push(`Today: ${d.verdict[0]}; Moon in ${SN(d.mo.sign)}, ${d.fromMoon} from natal Moon, house ${d.house}; Tara ${D.TARA[d.tara][0]}.`);
    const W = R.watch(c, st.sat, now, 10); L.push('Flagged periods (next 10 years): ' + W.hard.slice(0, 12).map(h => `${h.title} ${fd(h.from)} to ${fd(h.to)}`).join('; ') + '. Supportive: ' + W.soft.slice(0, 6).map(h => `${h.title} ${fd(h.from)} to ${fd(h.to)}`).join('; ') + '.');
    const G = R.gemPlan(c, cd), gl = k => G.gems.filter(g => g.cat === k).map(g => D.GEM[g.p][0]).join(', ') || 'none'; L.push(`Gemstones by house-rulership rule: suit ${gl('yes')}; neutral ${gl('maybe')}; not advised ${gl('avoid')}.`);
    L.push('Life-area strength (1-5): ' + R.lifeAreas(c, i.gender).map(a => `${a.title} ${a.stars}`).join('; ') + '.');
    return L.join('\n');
  }
  const GURU_RULES = lang => `You are AstroGuru, a Vedic astrology guide inside the Jyotish Darpan app. Answer the person's questions using ONLY the chart data below, which the app has already calculated; never recalculate positions or invent placements, dates or yogas that are not in the data. If the data does not cover a question, say so and say what would be needed.
Style: warm, plain language, no jargon without a short explanation. Keep answers under 180 words unless asked for more. Name the chart factor behind each statement (for example "because Jupiter rules your 5th house"). Reply in ${lang}.
Honesty: astrology is a traditional interpretive system, not a tested science. Describe tendencies, never certainties. Do not predict death, serious illness, accidents, divorce or disaster, and do not frighten. Do not give medical, legal or financial instructions; suggest a qualified professional for those. Do not tell anyone to accept or reject a marriage or a person. Remedies must be simple and free or cheap (mantra, giving, conduct); never push gemstones or paid rituals, and mention that a planet flagged ON SIGN BORDER has an uncertain sign.
CHART DATA
`;
  const gfmt = t => esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');
  async function guruSend(q) {
    if (GURU.busy || !GURU.api || !q.trim()) return; GURU.busy = true; GURU.started = true; GURU.msgs.push({ role: 'user', content: q.trim() }); render();
    const hist = GURU.msgs.slice(-12).map(m => ({ role: m.role, content: m.content })); while (hist.length && hist[0].role !== 'user') hist.shift();
    hist[0] = { role: 'user', content: GURU_RULES(window.JD_I18N.full[lang]) + guruContext() + '\n\nQUESTION\n' + hist[0].content };
    try {
      const r = await GURU.api(hist, { cache: false, onText: ({ text }) => { const el = $('#gstream'); if (el) { el.innerHTML = gfmt(text); el.scrollIntoView({ block: 'nearest' }); } } });
      GURU.msgs.push({ role: 'assistant', content: r.text + (r.truncated ? ' …' : '') });
    } catch (e) {
      const code = e && e.code; GURU.msgs.pop();
      GURU.err = code === 'not_granted' ? 'Claude did not get permission to answer. Press Start again and approve the prompt to use AstroGuru.' : code === 'rate_limited' ? 'Claude is busy or your usage limit is reached. Wait a minute and ask again.' : 'Claude could not answer just now. Try again in a moment.'; if (code === 'not_granted') GURU.started = false;
    }
    GURU.busy = false; render(); const box = $('#gthread'); if (box) box.scrollTop = box.scrollHeight;
  }
  function vGuru() {
    const A = window.JD_AUTHOR || {}, err = GURU.err ? `<p class="err">${GURU.err}</p>` : ''; GURU.err = '';
    const head = `<p class="lead">AstroGuru is Claude, given the chart this app has calculated. Ask it anything about the chart in your own words: what a period means, why something is flagged, what to focus on this year.</p>`;
    if (GURU.api === null) return head + `<section class="card prose"><h2>AstroGuru runs inside Claude</h2><p>The assistant needs a Claude sign-in, and Claude only allows that on pages it hosts. This copy of the app is a plain website, so the chat is not available here. Everything else works as usual.</p><p>${A.claudeUrl ? `Open the Claude-hosted version, sign in with your Claude account, and the AstroGuru tab will be live: <a href="${esc(A.claudeUrl)}" target="_blank" rel="noopener">open Jyotish Darpan in Claude</a>.` : 'Open the Claude-hosted version of Jyotish Darpan and sign in with your Claude account to use it.'}</p><p class="hint">No API key is stored in this app, and your birth details are never sent anywhere from this website.</p></section>`;
    if (GURU.api === undefined) return head + '<section class="card"><p>Connecting to Claude…</p></section>';
    if (!GURU.started) return head + `<section class="card now prose"><h2>Sign in with Claude</h2><p>AstroGuru answers through your own Claude account. You are already signed in to Claude to see this page; when you press Start, Claude asks once for permission to answer on this page.</p><p>Each question sends the calculated chart (birth details, positions, periods and the app's findings) to Claude so it can answer. Nothing is sent before you press Start.</p>${err}<p><button class="btn primary big" id="gstart" type="button">Start AstroGuru</button></p></section>`;
    const sug = ['What should I focus on this year?', 'Explain my current dasha simply', 'What are my biggest strengths?', 'Why is the next period flagged?', 'What simple remedy suits me most?'];
    return head + `<section class="card guru"><div id="gthread" class="gthread">${GURU.msgs.map(m => `<div class="bubble ${m.role}">${gfmt(m.content)}</div>`).join('')}${GURU.busy ? '<div class="bubble assistant" id="gstream">Thinking…</div>' : ''}</div>${err}
      <div class="chips">${sug.map(x => `<button class="chip" data-gq="${esc(x)}" type="button">${x}</button>`).join('')}</div>
      <form id="gform" class="gform"><label class="vh" for="gq">Your question</label><textarea id="gq" rows="2" placeholder="Ask about your chart" ${GURU.busy ? 'disabled' : ''}></textarea><button class="btn primary" type="submit" ${GURU.busy ? 'disabled' : ''}>Send</button></form>
      <p class="hint">Answers come from Claude reading this chart's data. They are interpretations, not predictions, and not medical, legal or financial advice. <button class="btn sm" id="gclear" type="button">Clear chat</button></p></section>`;
  }

  /* ================= Languages ================= */
  const I18 = window.JD_I18N; let lang = store.get('jd.lang', 'en'); if (!I18.dict[lang]) lang = 'en';
  function trs(en) {
    const d = I18.dict[lang], m = en.match(/^(\s*)([\s\S]*?)(\s*)$/), core = m[2]; if (!core) return en;
    if (d[core]) return m[1] + d[core] + m[3];
    if (core.length <= 48) { I18.rx.lastIndex = 0; if (I18.rx.test(core) && !/[A-Za-z]/.test(core.replace(I18.rx, ''))) return m[1] + core.replace(I18.rx, k => d[k] || k) + m[3]; }
    return en;
  }
  const trOk = n => { const p = n.parentElement; return p && !p.closest('svg,script,style,[data-noi18n],.mantra,.bubble,textarea,#lang'); };
  function trNode(n) { if (n._en === undefined) n._en = n.nodeValue; const v = lang === 'en' ? n._en : trs(n._en); if (n.nodeValue !== v) n.nodeValue = v; }
  function trWalk(root) { if (root.nodeType === 3) { if (trOk(root)) trNode(root); return; } if (root.nodeType !== 1) return; const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) if (trOk(n)) trNode(n); }
  function setLang(l) { lang = l; store.set('jd.lang', l); document.documentElement.lang = l; $('#lang').value = l; $('#langnote').hidden = l === 'en'; trWalk(document.body); }
  new MutationObserver(ms => { if (lang === 'en') return; ms.forEach(m => m.addedNodes.forEach(trWalk)); }).observe(document.body, { childList: true, subtree: true });

  function drawStars() {
    document.querySelectorAll('canvas.stars').forEach(cv => {
      if (!cv.offsetWidth) return; const w = cv.width = cv.offsetWidth * 2, h = cv.height = cv.offsetHeight * 2, g = cv.getContext('2d'); let s = 7 + h;
      const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647; g.clearRect(0, 0, w, h); g.fillStyle = '#e8dcb8';
      const n = Math.round(w * h / 9000); for (let i = 0; i < n; i++) { const r = rnd() * 1.7 + 0.3; g.globalAlpha = 0.15 + rnd() * 0.7; g.beginPath(); g.arc(rnd() * w, rnd() * h, r, 0, 7); g.fill(); }
    });
  }
  window.addEventListener('resize', drawStars);


  /* init */
  const th = store.get('jd.theme', null); if (th) document.documentElement.dataset.theme = th;
  st.style = store.get('jd.style', 'north');
  const SAMPLE = { name: 'India (independence chart)', y: 1947, m: 8, d: 15, h: 0, min: 0, place: 'New Delhi, Delhi', lat: 28.6139, lon: 77.209, tz: 'Asia/Kolkata', gender: '', ayanamsa: 'lahiri', sample: true };
  const h0 = location.hash.slice(1); if (TABS.some(x => x[0] === h0)) st.tab = h0;
  profiles(); drawStars();
  { const A = window.JD_AUTHOR || {}; $('#credit').innerHTML = `© ${new Date().getFullYear()} ${esc(A.name || '')}. All rights reserved.${A.linkedin ? ` · <a href="${esc(A.linkedin)}" target="_blank" rel="noopener">LinkedIn</a>` : ''}`; }
  if (window.claude && window.claude.use) window.claude.use('sample').then(a => { GURU.api = a || null; if (st.tab === 'guru' && st.chart) render(); }, () => { GURU.api = null; }); else GURU.api = null;
  if (window.JD_DEFAULT) { fillForm(window.JD_DEFAULT); generate(window.JD_DEFAULT, true); } else showHome();
  if (lang !== 'en') setLang(lang);
  if ('serviceWorker' in navigator && !framed && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => { });
})();
