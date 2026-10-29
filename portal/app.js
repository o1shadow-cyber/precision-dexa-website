/* Precision Dexa · Client Portal (vanilla JS, no build step) · v2 house style
 *
 * Routes (hash-based so it drops into any site without server config):
 *   #/signin  #/create-account  (signed out: open the auth modal)
 *   #/  #/progress[/metric]  #/history  #/scans/:id  #/receipts  #/profile
 *   #/receipts/:id/receipt  #/receipts/:id/superbill  (print-ready sample documents)
 *   #/terms  #/privacy  #/health-privacy  (placeholder legal pages, open signed in or out)
 *
 * Data: one JSON payload per signed-in client. See README.md for the contract (unchanged from v1).
 * Swap DATA_URL for your authenticated endpoint (e.g. /api/portal/me).
 */
(function () {
  'use strict';

  // Root-relative so the preview works at /portal/ (and /portal/index.html) on the static site.
  // v5 ships no service worker. The manifest scope is /portal/ so a home-screen install stays on this folder.
  var PORTAL_BASE = '/portal/';
  var DATA_URL = PORTAL_BASE + 'data/sample-client.json';
  function asset(file) { return PORTAL_BASE + 'assets/' + file; }
  var DEMO_MODE = true; // true: mock local accounts (localStorage). See "Mock account store" below. Must be false at launch.

  // ---------- Metric definitions ----------
  // dir: -1 lower is toward goal, +1 higher is toward goal, 0 steady is the goal.
  // steady: changes smaller than this read as "Holding steady".
  // lessWord / moreWord: goal-aware comparison phrasing ("Lower body fat than 42 in 100 women your age").
  var METRICS = {
    bodyFatPct: {
      label: 'Body fat', short: 'Body fat', unit: '%', sep: '', dec: 1, dir: -1, steady: 0.3, dUnit: ' pts', minSpan: 4,
      lessWord: 'Lower body fat', moreWord: 'Higher body fat',
      about: 'The share of your total weight that is fat tissue. DEXA measures it directly, so small changes between scans are real, not guesswork.'
    },
    leanMassLb: {
      label: 'Lean muscle', short: 'Lean', unit: 'lb', sep: ' ', dec: 1, dir: 1, steady: 0.3, dUnit: ' lb', minSpan: 4,
      lessWord: 'Less lean muscle', moreWord: 'More lean muscle',
      about: 'Everything that is not fat or bone: mostly muscle, plus organs and water. Hydration on scan day can shift it slightly, so watch the trend more than one number.'
    },
    vatLb: {
      label: 'Visceral fat', short: 'Visceral', unit: 'lb', sep: ' ', dec: 2, dir: -1, steady: 0.03, dUnit: ' lb', minSpan: 0.4,
      lessWord: 'Less visceral fat', moreWord: 'More visceral fat',
      about: 'Fat stored deep in the abdomen, around your organs. Your scan estimates it separately from the fat just under your skin. Ask Amber what your number means for you.'
    },
    bmdGcm2: {
      label: 'Bone density', short: 'Bone', unit: 'g/cm²', sep: ' ', dec: 3, dir: 0, steady: 0.01, dUnit: '', minSpan: 0.1,
      about: 'Total-body bone mineral density from your DEXA Body Composition scan, useful for tracking change over time. It is not a diagnosis. A Diagnostic DEXA Bone Density Scan includes a separate radiologist report.'
    }
  };
  var METRIC_ORDER = ['bodyFatPct', 'leanMassLb', 'vatLb', 'bmdGcm2'];

  // Covers body composition and bone density; not a diagnosis; radiologist report for diagnostic bone scans.
  var DISCLAIMER = 'Your DEXA results show body composition and bone density so you can track change over time. They are not a medical diagnosis. Clients who have a Diagnostic DEXA Bone Density Scan also receive a radiologist report. For health questions, talk with your doctor.';

  // Display bylines for staff. Data keeps the plain name (contract unchanged); the UI shows the full credential.
  var STAFF = { Amber: 'Amber, RT(R), Founder' };
  function byline(name) { return STAFF[name] || name; }

  // ---------- Helpers ----------
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function d(iso) { return new Date(iso + 'T12:00:00'); }
  function fmtDate(iso, opts) { return d(iso).toLocaleDateString('en-US', opts || { month: 'short', day: 'numeric', year: 'numeric' }); }
  function fmtLong(iso) { return fmtDate(iso, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }); }
  function fmtShort(iso) { return fmtDate(iso, { month: 'short', day: 'numeric' }); }
  function weeksBetween(a, b) { return Math.round((d(b) - d(a)) / (7 * 864e5)); }
  function fmtVal(key, v) { var m = METRICS[key]; return Number(v).toFixed(m.dec); }
  function withUnit(key, v) { var m = METRICS[key]; return fmtVal(key, v) + m.sep + m.unit; }
  function initials(c) { return (String(c.firstName || ' ')[0] + String(c.lastName || ' ')[0]).toUpperCase(); }
  function isDesktop() { return !!(window.matchMedia && window.matchMedia('(min-width: 960px)').matches); }
  function goalFor(key) { var g = (state.data.goals || []).filter(function (x) { return x.metric === key; })[0]; return g || null; }
  /** Direction that counts as progress: the client's goal if one is set, else the metric default. */
  function goalDir(key) {
    var g = goalFor(key);
    if (g) return g.kind === 'reduce' ? -1 : g.kind === 'increase' ? 1 : 0;
    return METRICS[key].dir;
  }

  /** Plain-language change between two values. Never diagnostic: describes direction only. */
  function change(key, prev, cur) {
    var m = METRICS[key];
    var dir = goalDir(key);
    var diff = cur - prev;
    var abs = Math.abs(diff).toFixed(m.dec);
    if (Math.abs(diff) < m.steady) {
      return { tone: 'steady', text: '→ ' + (diff >= 0 ? '+' : '−') + abs + m.dUnit, phrase: 'Holding steady' };
    }
    var arrow = diff > 0 ? '↑ ' : '↓ ';
    var phrase = diff > 0 ? (key === 'leanMassLb' ? 'More than last scan' : 'Higher than last scan') : 'Lower than last scan';
    var toward = dir !== 0 && diff * dir > 0;
    return { tone: toward ? 'good' : 'watch', text: arrow + abs + m.dUnit, phrase: toward ? phrase + ' · toward your goal' : phrase + ' · worth a look with Amber' };
  }
  function pill(c) { return '<span class="pill ' + c.tone + '">' + esc(c.text) + '</span>'; }
  var LEGEND = '<div class="legend" aria-label="Color key">' +
    '<span><i class="dot good"></i>Toward your goal</span>' +
    '<span><i class="dot steady"></i>Holding steady</span>' +
    '<span><i class="dot watch"></i>Worth a look with Amber</span></div>';

  // ---------- Icons + brand art ----------
  var ICON = {
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
    progress: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/></svg>',
    history: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    profile: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>',
    back: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
    chev: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>',
    download: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11"/><path d="M7 10l5 5 5-5"/><path d="M5 20h14"/></svg>',
    calendar: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" rx="1.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',
    receipts: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 3.5h10a1 1 0 0 1 1 1V21l-2.2-1.4L13.5 21l-2.3-1.4L9 21l-2.2-1.4L4.5 21V4.5a1 1 0 0 1 1-1z"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>'
  };
  var LEAF_NAVY = '<img class="ghost" src="' + asset('leaf-on-navy.svg') + '" alt="">';
  function leafDivider() { return '<div class="divider" aria-hidden="true"><img src="' + asset('scan-leaf.svg') + '" alt=""></div>'; }


  // ---------- Page header (banner option B) ----------
  /** Headline goal for the header summary: the first reduce/increase goal, as a 0-100 share of the way. */
  function headlineGoal(cur) {
    var g = (state.data.goals || []).filter(function (x) { return x.kind === 'reduce' || x.kind === 'increase'; })[0];
    if (!g || cur[g.metric] == null) return null;
    var now = cur[g.metric];
    var pct = g.kind === 'reduce' ? (g.start - now) / (g.start - g.target) : (now - g.start) / (g.target - g.start);
    pct = Math.max(0, Math.min(1, pct));
    return { pct: Math.round(pct * 100), label: METRICS[g.metric].label + ' goal', full: g.label };
  }

  /** Option B: personal summary card on sand, greeting left, goal ring right, small date badge. No watermark. */
  function ring(r) {
    var R = 34, C = 2 * Math.PI * R, off = C * (1 - r.pct / 100);
    return '<figure class="ph-ring" role="img" aria-label="' + esc(r.full + ': ' + r.pct + '% of the way') + '">' +
      '<svg viewBox="0 0 84 84" aria-hidden="true" focusable="false">' +
        '<circle cx="42" cy="42" r="' + R + '" class="trk"/>' +
        '<circle cx="42" cy="42" r="' + R + '" class="val" stroke-dasharray="' + C.toFixed(2) + '" stroke-dashoffset="' + off.toFixed(2) + '" transform="rotate(-90 42 42)"/>' +
      '</svg>' +
      '<span class="ph-ring-num" aria-hidden="true">' + r.pct + '<small>%</small></span>' +
      '<figcaption aria-hidden="true">' + esc(r.label) + '</figcaption>' +
    '</figure>';
  }
  function pageHead(o) {
    var text = '<div class="ph-text">' +
      '<p class="eyebrow">' + esc(o.eyebrow) + '</p>' +
      '<h1 class="title">' + esc(o.title) + '</h1>' +
      (o.sub ? '<p class="ph-sub">' + esc(o.sub) + '</p>' : '') +
      (o.badge ? '<span class="ph-badge">' + esc(o.badge) + '</span>' : '') +
    '</div>';
    return '<header class="ph ph-b' + (o.view === 'home' ? ' is-home' : '') + '">' +
      (o.avatar ? '<span class="avatar lg">' + esc(o.avatar) + '</span>' : '') +
      text +
      (o.ring ? ring(o.ring) : '') +
    '</header>';
  }

  // ---------- State ----------
  var state = { data: null, sample: null, account: null, signedIn: false, open: {} };
  function sessionGet(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function sessionSet(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* storage blocked: stay in memory */ } }

  var app = document.getElementById('app');

  // ---------- Top bar (cream lockup, all widths) ----------
  var SITE_URL = 'https://precisiondexa.com';
  var ICON_BACK_SM = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M15 5l-7 7 7 7"/></svg>';
  var ICON_EXIT = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>';
  /** Cream app bar. With a client: back-to-site link (desktop), greeting (desktop), avatar.
      Signed out: back-to-site link (desktop only; on phones it sits in the auth sheet) and a "Sign in" button. */
  function topbar(c) {
    var right = c ?
      '<a class="tb-site" href="' + SITE_URL + '">' + ICON_BACK_SM + 'Back to precisiondexa.com</a>' +
      '<span class="tb-hi">Hi, ' + esc(c.firstName) + '</span>' +
      '<a class="avatar" href="#/profile" aria-label="Your profile">' + esc(initials(c)) + '</a>'
      :
      '<a class="tb-site tb-site-out" href="' + SITE_URL + '">' + ICON_BACK_SM + 'Back to precisiondexa.com</a>' +
      '<button type="button" class="btn btn-sm tb-signin" data-open-auth="signin">Sign in</button>';
    return '<header class="topbar tb1">' +
      '<div class="tb-row">' +
        '<a class="brand" href="' + (c ? '#/' : '#/signin') + '" aria-label="Precision Dexa Client Portal' + (c ? ', home' : '') + '"><img src="' + asset('precision-dexa-logo.svg') + '" alt=""><span class="tb-div" aria-hidden="true"></span><span class="tb-label">Client Portal</span></a>' +
        '<div class="tb-right">' + right + '</div>' +
      '</div>' +
      '<p class="preview-flag">Preview, sample data</p>' +
    '</header>';
  }

  // ---------- Mock account store (PROTOTYPE ONLY) ----------
  // !!! FRONT-END PROTOTYPE. NOT REAL AUTHENTICATION. !!!
  // Accounts, password hashes and consent records live in this browser's localStorage so the flow can be
  // clicked through without a server. Anyone with access to the browser can read or change them.
  // Before launch, replace everything in this section with calls to a secure backend:
  //   - HIPAA-capable hosting with a signed BAA; health data encrypted at rest and in transit
  //   - server-side password hashing (Argon2id or bcrypt), rate limiting, lockout, secure HttpOnly session cookies
  //   - email verification and a real password-reset flow (single-use, expiring tokens)
  //   - a real email provider and SMS provider (10DLC registered) with STOP/HELP keyword handling
  //   - consent records written server-side (append-only audit log)
  // No real client data, keys or secrets belong in this file.
  var STORE_KEY = 'pd_mock_accounts_v1';
  var SESSION_KEY = 'pd_mock_session_v1';
  var DEMO_EMAIL = 'megan.hart@example.com';
  // Demo password is documented in README.md only. Only its salted SHA-256 is stored here.
  var DEMO_SALT = 'pd-demo-1';
  var DEMO_HASH = '24ee3aae6370d1af3a8c8da36d68404bf2e4916bf863e9b7acf3b8c2e0e43f20';

  // Exact consent wording, versioned. Change the text => bump the version, and keep old versions for the audit trail.
  var CONSENT_VERSION = '2026-10-27';
  var CONSENT_TEXT = {
    terms: 'I agree to the Terms of Use and Privacy Policy.',
    healthData: 'I consent to Precision Dexa collecting and storing my scan results and health information to provide my services and show them in this portal. See our Consumer Health Data Privacy Policy.',
    marketingEmail: 'Email me updates, scan reminders and offers from Precision Dexa. You can unsubscribe anytime.',
    sms: 'Text me appointment reminders and updates from Precision Dexa at the number above.',
    smsDisclosure: 'Message frequency varies. Msg & data rates may apply. Reply STOP to opt out, HELP for help. Consent is not a condition of purchase.',
    marketingEmailProfile: 'Email updates: updates, scan reminders and offers from Precision Dexa. Unsubscribe anytime.',
    smsProfile: 'Text messages: appointment reminders and updates from Precision Dexa to my mobile number.'
  };

  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage blocked */ } }
  function sessionDel(k) { try { sessionStorage.removeItem(k); } catch (e) { /* ignore */ } }
  var memStore = null; // fallback when localStorage is blocked
  function loadAccounts() {
    if (memStore) return memStore;
    var raw = lsGet(STORE_KEY);
    try { memStore = raw ? JSON.parse(raw) : {}; } catch (e) { memStore = {}; }
    return memStore;
  }
  function saveAccounts() { lsSet(STORE_KEY, JSON.stringify(memStore || {})); }
  function getAccount(email) { return loadAccounts()[String(email || '').trim().toLowerCase()] || null; }
  function putAccount(a) { loadAccounts()[a.email] = a; saveAccounts(); }

  function nowIso() { return new Date().toISOString(); }
  function randomSalt() {
    var a = new Uint8Array(12);
    (window.crypto || window.msCrypto).getRandomValues(a);
    return Array.prototype.map.call(a, function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
  }
  // Prototype hashing so the store never holds a plain password. Real launch: hash on the server (Argon2id/bcrypt).
  function hashPw(salt, pw) {
    var data = new TextEncoder().encode(salt + ':' + pw);
    if (!(window.crypto && crypto.subtle)) return Promise.reject(new Error('Secure context needed (serve over https or localhost).'));
    return crypto.subtle.digest('SHA-256', data).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
    });
  }
  function consentRecord(granted, at, textKey, extra) {
    var r = { granted: !!granted, at: at, version: CONSENT_VERSION, text: CONSENT_TEXT[textKey] };
    if (extra) for (var k in extra) r[k] = extra[k];
    return r;
  }
  function logConsent(acct, type, rec, source) {
    acct.consentLog = acct.consentLog || [];
    acct.consentLog.push({ type: type, granted: rec.granted, at: rec.at, version: rec.version, text: rec.text, source: source });
  }
  function seedDemo(sample) {
    // Refresh the sample profile on each load so the preview stays the designed Megan Hart record.
    var c = sample.client, at = '2025-11-18T10:00:00-08:00';
    var a = {
      id: c.id, email: DEMO_EMAIL, firstName: c.firstName, lastName: c.lastName, phone: c.phone, dateOfBirth: c.dateOfBirth,
      salt: DEMO_SALT, passwordHash: DEMO_HASH, createdAt: at, isDemo: true, consentVersion: CONSENT_VERSION,
      consents: {
        terms: consentRecord(true, at, 'terms'),
        healthData: consentRecord(true, at, 'healthData'),
        marketingEmail: consentRecord(true, at, 'marketingEmail'),
        sms: consentRecord(true, at, 'sms', { phone: c.phone, disclosure: CONSENT_TEXT.smsDisclosure })
      },
      consentLog: []
    };
    ['terms', 'healthData', 'marketingEmail', 'sms'].forEach(function (t) { logConsent(a, t, a.consents[t], 'signup'); });
    putAccount(a);
  }
  /** Portal payload for the signed-in account: the sample file for the demo client, an empty record for new accounts. */
  function dataFor(acct) {
    if (acct.isDemo && state.sample) {
      var d = JSON.parse(JSON.stringify(state.sample));
      d.client.phone = acct.phone || '';
      return d;
    }
    return {
      client: { id: acct.id, firstName: acct.firstName, lastName: acct.lastName, email: acct.email, phone: acct.phone || '', dateOfBirth: acct.dateOfBirth, heightIn: null, memberSince: acct.createdAt.slice(0, 10), studio: 'Precision Dexa · Camas, WA', preferences: { showComparisons: false } },
      scans: [], goals: [], notes: [], nextScan: { recommendedWeekOf: null, intervalWeeks: 10, bookingUrl: '#book' }, isNew: true
    };
  }
  function signInAs(acct) {
    state.account = acct; state.signedIn = true; sessionSet(SESSION_KEY, acct.email);
    state.data = dataFor(acct);
    state.showCompare = !!(state.data.client.preferences && state.data.client.preferences.showComparisons === true);
  }
  function signOut() { state.account = null; state.signedIn = false; state.data = null; sessionDel(SESSION_KEY); }
  function fmtStamp(iso) { return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }

  // ---------- Validation helpers ----------
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function phoneDigits(v) { var x = String(v || '').replace(/\D/g, ''); if (x.length === 11 && x[0] === '1') x = x.slice(1); return x; }
  function fmtPhone(x) { return '(' + x.slice(0, 3) + ') ' + x.slice(3, 6) + '-' + x.slice(6); }
  function validPhone(v) { var x = phoneDigits(v); return x.length === 10 && /^[2-9]\d{2}[2-9]\d{6}$/.test(x); }
  function pwChecks(pw) { return { len: pw.length >= 10, mix: /[a-z]/.test(pw) && /[A-Z]/.test(pw), num: /\d/.test(pw) }; }
  function pwStrength(pw) {
    if (!pw) return { score: 0, label: '' };
    var c = pwChecks(pw), s = (c.len ? 1 : 0) + (c.mix ? 1 : 0) + (c.num ? 1 : 0) + (/[^A-Za-z0-9]/.test(pw) ? 1 : 0) + (pw.length >= 14 ? 1 : 0);
    if (!c.len) return { score: 1, label: 'Too short' };
    return s <= 2 ? { score: 1, label: 'Weak' } : s === 3 ? { score: 2, label: 'Fair' } : s === 4 ? { score: 3, label: 'Good' } : { score: 4, label: 'Strong' };
  }
  function ageOn(dobIso, today) {
    var b = new Date(dobIso + 'T12:00:00'); if (isNaN(b)) return NaN;
    var a = today.getFullYear() - b.getFullYear();
    var m = today.getMonth() - b.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < b.getDate())) a--;
    return a;
  }
  function setErr(el, msg) {
    var err = document.getElementById(el.id + '-err');
    if (err) err.textContent = msg || '';
    el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    var f = el.closest('.field, .check'); if (f) f.classList.toggle('has-err', !!msg);
    return !msg;
  }
  function todayIso() { var t = new Date(); return t.getFullYear() + '-' + ('0' + (t.getMonth() + 1)).slice(-2) + '-' + ('0' + t.getDate()).slice(-2); }

  // ---------- Auth modal ----------
  var ICON_CLOSE = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  var ICON_CHECK = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  var ICON_DOT = '<svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="4" fill="currentColor"/></svg>';
  var authRoot = document.getElementById('auth-root');
  var auth = { open: false, tab: 'signin', step: 'form', opener: null };

  function field(o) {
    var describedby = [o.hint ? o.id + '-hint' : '', o.id + '-err'].filter(Boolean).join(' ');
    return '<div class="field' + (o.cls ? ' ' + o.cls : '') + '">' +
      '<label for="' + o.id + '">' + o.label + (o.tag ? ' <span class="opt" id="' + o.id + '-tag">' + o.tag + '</span>' : '') + '</label>' +
      (o.hint ? '<p class="hint" id="' + o.id + '-hint">' + o.hint + '</p>' : '') +
      (o.pw ?
        '<div class="pw"><input id="' + o.id + '" name="' + o.id + '" type="password" autocomplete="' + o.ac + '" aria-describedby="' + describedby + '" aria-invalid="false"' + (o.attrs || '') + '>' +
        '<button type="button" class="pw-toggle" data-pw-toggle="' + o.id + '" aria-controls="' + o.id + '" aria-pressed="false" aria-label="Show password">Show</button></div>'
        :
        '<input id="' + o.id + '" name="' + o.id + '" type="' + (o.type || 'text') + '" autocomplete="' + o.ac + '" aria-describedby="' + describedby + '" aria-invalid="false"' + (o.attrs || '') + '>') +
      '<p class="err" id="' + o.id + '-err"></p>' +
    '</div>';
  }
  function check(o) {
    return '<div class="check' + (o.cls ? ' ' + o.cls : '') + '">' +
      '<input type="checkbox" id="' + o.id + '" name="' + o.id + '" aria-describedby="' + [o.extra || '', o.id + '-err'].filter(Boolean).join(' ') + '" aria-invalid="false">' +
      '<label for="' + o.id + '"><span class="check-text">' + o.html + '</span> <span class="opt">' + (o.required ? '(required)' : '(optional)') + '</span></label>' +
      (o.after || '') +
      '<p class="err" id="' + o.id + '-err"></p>' +
    '</div>';
  }
  function legalLink(href, text) { return '<a href="' + href + '" target="_blank" rel="noopener">' + text + '<span class="sr-only"> (opens in a new tab)</span></a>'; }

  function authMarkup() {
    var maxDob = todayIso();
    return '<div class="auth-overlay" id="auth" hidden>' +
      '<div class="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-title" aria-describedby="auth-sub" tabindex="-1">' +
        '<div class="auth-head">' +
          '<span class="auth-lockup" aria-hidden="true"><img src="' + asset('precision-dexa-logo.svg') + '" alt=""><span class="tb-div"></span><span class="tb-label">Client Portal</span></span>' +
          '<p class="preview-flag auth-preview">Preview, sample data</p>' +
          '<button type="button" class="auth-close" data-close-auth aria-label="Close">' + ICON_CLOSE + '</button>' +
        '</div>' +
        '<div class="auth-body">' +
          '<header class="ph ph-b auth-intro"><div class="ph-text">' +
            '<p class="eyebrow" id="auth-eyebrow">Secure sign-in</p>' +
            '<h2 class="title" id="auth-title">Welcome back</h2>' +
            '<p class="ph-sub" id="auth-sub">Sign in to see every scan, track your goals and read the notes from your review.</p>' +
          '</div></header>' +
          '<div class="auth-tabs" role="tablist" aria-label="Sign in or create an account">' +
            '<button type="button" role="tab" id="tab-signin" aria-controls="panel-signin" aria-selected="true">Sign in</button>' +
            '<button type="button" role="tab" id="tab-create" aria-controls="panel-create" aria-selected="false" tabindex="-1">Create account</button>' +
          '</div>' +

          // Sign in
          '<section class="auth-panel" role="tabpanel" id="panel-signin" aria-labelledby="tab-signin">' +
            '<form id="signin-form" class="auth-form" action="#" onsubmit="return false" novalidate>' +
              '<div class="form-alert" id="signin-alert" role="alert" hidden></div>' +
              field({ id: 'si-email', label: 'Email', type: 'email', ac: 'email', attrs: ' inputmode="email" autocapitalize="off" spellcheck="false"' }) +
              field({ id: 'si-pw', label: 'Password', pw: true, ac: 'current-password' }) +
              '<div class="auth-row"><button type="button" class="text-btn" data-auth-step="forgot">Forgot password?</button></div>' +
              '<button class="btn btn-primary btn-block" type="submit">Sign in</button>' +
              '<p class="auth-switch">New to Precision Dexa? <button type="button" class="text-btn" data-auth-tab="create">Create an account</button></p>' +
            '</form>' +
            '<form id="forgot-form" class="auth-form" action="#" onsubmit="return false" novalidate hidden>' +
              '<p class="small muted">Enter the email on your account and we’ll send you a link to set a new password.</p>' +
              field({ id: 'fp-email', label: 'Email', type: 'email', ac: 'email', attrs: ' inputmode="email" autocapitalize="off" spellcheck="false"' }) +
              '<button class="btn btn-primary btn-block" type="submit">Email me a reset link</button>' +
              '<div class="form-ok" id="forgot-msg" role="status"></div>' +
              '<p class="auth-switch"><button type="button" class="text-btn" data-auth-step="form">Back to sign in</button></p>' +
            '</form>' +
          '</section>' +

          // Create account
          '<section class="auth-panel" role="tabpanel" id="panel-create" aria-labelledby="tab-create" hidden>' +
            '<form id="create-form" class="auth-form" action="#" onsubmit="return false" novalidate>' +
              '<div class="form-alert" id="create-alert" role="alert" hidden></div>' +
              '<div class="two">' +
                field({ id: 'ca-first', label: 'First name', ac: 'given-name' }) +
                field({ id: 'ca-last', label: 'Last name', ac: 'family-name' }) +
              '</div>' +
              field({ id: 'ca-email', label: 'Email', type: 'email', ac: 'email', attrs: ' inputmode="email" autocapitalize="off" spellcheck="false"' }) +
              field({ id: 'ca-phone', label: 'Mobile phone', tag: '(optional)', hint: 'Only needed if you want text reminders. US numbers.', type: 'tel', ac: 'tel-national', attrs: ' inputmode="tel" placeholder="(360) 555-0100"' }) +
              field({ id: 'ca-dob', label: 'Date of birth', type: 'date', ac: 'bday', attrs: ' max="' + maxDob + '" min="1900-01-01"', hint: 'Used to match you to your scans and to age-based reference ranges.' }) +
              field({ id: 'ca-pw', label: 'Password', pw: true, ac: 'new-password', hint: 'At least 10 characters, with upper- and lowercase letters and a number.' }) +
              '<div class="pw-meter" aria-hidden="true"><span class="pw-bars"><i></i><i></i><i></i><i></i></span><span class="pw-label" id="pw-label"></span></div>' +
              '<ul class="pw-reqs" id="pw-reqs" aria-label="Password requirements">' +
                '<li data-req="len">' + ICON_DOT + '<span>At least 10 characters</span><span class="sr-only req-state"> not met yet</span></li>' +
                '<li data-req="mix">' + ICON_DOT + '<span>Upper- and lowercase letters</span><span class="sr-only req-state"> not met yet</span></li>' +
                '<li data-req="num">' + ICON_DOT + '<span>At least one number</span><span class="sr-only req-state"> not met yet</span></li>' +
              '</ul>' +
              '<p class="sr-only" id="pw-strength-live" aria-live="polite"></p>' +
              field({ id: 'ca-pw2', label: 'Confirm password', pw: true, ac: 'new-password' }) +

              '<fieldset class="consents">' +
                '<legend>Agreements</legend>' +
                check({ id: 'ca-terms', required: true, html: 'I agree to the ' + legalLink('#/terms', 'Terms of Use') + ' and ' + legalLink('#/privacy', 'Privacy Policy') + '.' }) +
                check({ id: 'ca-health', required: true, html: 'I consent to Precision Dexa collecting and storing my scan results and health information to provide my services and show them in this portal. See our ' + legalLink('#/health-privacy', 'Consumer Health Data Privacy Policy') + '.',
                  extra: 'ca-health-note', after: '<p class="fine" id="ca-health-note">Required by Washington’s My Health My Data Act. You can withdraw this consent anytime by contacting the studio.</p>' }) +
              '</fieldset>' +
              '<fieldset class="consents">' +
                '<legend>Stay in touch <span class="opt">(optional)</span></legend>' +
                check({ id: 'ca-mkt-email', html: esc(CONSENT_TEXT.marketingEmail) }) +
                check({ id: 'ca-sms', html: esc(CONSENT_TEXT.sms), extra: 'ca-sms-fine', after: '<p class="fine" id="ca-sms-fine">' + esc(CONSENT_TEXT.smsDisclosure) + '</p>' }) +
              '</fieldset>' +

              '<button class="btn btn-primary btn-block" type="submit">Create account</button>' +
              '<p class="auth-switch">Already have an account? <button type="button" class="text-btn" data-auth-tab="signin">Sign in</button></p>' +
            '</form>' +
          '</section>' +

          '<div class="auth-foot">' +
            '<p class="preview-flag">Preview, sample data</p>' +
            '<a class="auth-site" href="' + SITE_URL + '">' + ICON_BACK_SM + 'Back to precisiondexa.com</a>' +
            '<p class="tagline">Measure. Understand. Thrive.</p>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  var AUTH_COPY = {
    signin: ['Secure sign-in', 'Welcome back', 'Sign in to see every scan, track your goals and read the notes from your review.'],
    forgot: ['Password help', 'Reset your password', 'We’ll email you a secure link to choose a new password.'],
    create: ['New client', 'Create your account', 'Set up your portal in a minute. Your scan results appear here after each visit.']
  };
  function ensureAuth() { if (!document.getElementById('auth')) authRoot.innerHTML = authMarkup(); return document.getElementById('auth'); }
  function setAuthView(tab, step, focus) {
    var o = ensureAuth();
    auth.tab = tab; auth.step = step || 'form';
    var copy = AUTH_COPY[tab === 'signin' && auth.step === 'forgot' ? 'forgot' : tab];
    o.querySelector('#auth-eyebrow').textContent = copy[0];
    o.querySelector('#auth-title').textContent = copy[1];
    o.querySelector('#auth-sub').textContent = copy[2];
    var isSignin = tab === 'signin';
    var ts = o.querySelector('#tab-signin'), tc = o.querySelector('#tab-create');
    ts.setAttribute('aria-selected', String(isSignin)); ts.tabIndex = isSignin ? 0 : -1;
    tc.setAttribute('aria-selected', String(!isSignin)); tc.tabIndex = isSignin ? -1 : 0;
    o.querySelector('.auth-tabs').hidden = auth.step === 'forgot';
    o.querySelector('#panel-signin').hidden = !isSignin;
    o.querySelector('#panel-create').hidden = isSignin;
    o.querySelector('#signin-form').hidden = auth.step === 'forgot';
    o.querySelector('#forgot-form').hidden = auth.step !== 'forgot';
    document.title = (isSignin ? (auth.step === 'forgot' ? 'Reset password' : 'Sign in') : 'Create account') + ' · Precision Dexa';
    if (focus === 'tab') (isSignin ? ts : tc).focus();
    else if (focus !== false) {
      var first = auth.step === 'forgot' ? o.querySelector('#fp-email') : isSignin ? o.querySelector('#si-email') : o.querySelector('#ca-first');
      if (auth.step === 'forgot') { var se = o.querySelector('#si-email'); if (se && se.value && !first.value) first.value = se.value; }
      first.focus({ preventScroll: true });
    }
    var dlg = o.querySelector('.auth-dialog'); if (focus !== 'tab') dlg.scrollTop = 0;
  }
  function openAuth(tab, opener) {
    var o = ensureAuth();
    if (!auth.open) auth.opener = opener || document.activeElement;
    auth.open = true;
    o.hidden = false;
    document.documentElement.classList.add('modal-open');
    app.inert = true; app.setAttribute('aria-hidden', 'true');
    var skip = document.querySelector('.skip'); if (skip) skip.inert = true;
    setAuthView(tab || 'signin', 'form');
  }
  function closeAuth(restoreFocus) {
    var o = document.getElementById('auth'); if (!o) return;
    auth.open = false; o.hidden = true;
    document.documentElement.classList.remove('modal-open');
    app.inert = false; app.removeAttribute('aria-hidden');
    var skip = document.querySelector('.skip'); if (skip) skip.inert = false;
    if (restoreFocus !== false) {
      var t = auth.opener && document.body.contains(auth.opener) && auth.opener !== document.body ? auth.opener : document.querySelector('[data-open-auth]');
      if (t) t.focus();
    }
    auth.opener = null;
  }
  function focusables(root) {
    return Array.prototype.filter.call(root.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'), function (el) {
      return el.offsetParent !== null || el === document.activeElement;
    });
  }

  // Create-account live checks
  function updatePwMeter() {
    var o = document.getElementById('auth'); if (!o) return;
    var pw = o.querySelector('#ca-pw').value, c = pwChecks(pw), s = pwStrength(pw);
    Array.prototype.forEach.call(o.querySelectorAll('#pw-reqs li'), function (li) {
      var met = c[li.getAttribute('data-req')];
      li.classList.toggle('met', met);
      li.firstChild.outerHTML = met ? ICON_CHECK : ICON_DOT;
      li.querySelector('.req-state').textContent = met ? ' met' : ' not met yet';
    });
    var meter = o.querySelector('.pw-meter'); meter.setAttribute('data-score', String(s.score));
    o.querySelector('#pw-label').textContent = s.label ? 'Strength: ' + s.label : '';
    o.querySelector('#pw-strength-live').textContent = s.label ? 'Password strength ' + s.label : '';
  }
  function syncSmsPhone() {
    var o = document.getElementById('auth'); if (!o) return;
    var on = o.querySelector('#ca-sms').checked;
    o.querySelector('#ca-phone-tag').textContent = on ? '(required for texts)' : '(optional)';
    o.querySelector('#ca-phone-hint').textContent = on ? 'We’ll text this number. US mobile numbers only.' : 'Only needed if you want text reminders. US numbers.';
    var p = o.querySelector('#ca-phone'); if (on) p.setAttribute('aria-required', 'true'); else p.removeAttribute('aria-required');
  }
  var CREATE_RULES = {
    'ca-first': function (v) { return v.trim() ? '' : 'Enter your first name.'; },
    'ca-last': function (v) { return v.trim() ? '' : 'Enter your last name.'; },
    'ca-email': function (v) { v = v.trim(); return !v ? 'Enter your email address.' : !EMAIL_RE.test(v) ? 'Enter an email address like name@example.com.' : getAccount(v) ? 'An account with this email already exists. Sign in instead, or reset your password.' : ''; },
    'ca-phone': function (v, f) {
      var sms = f.querySelector('#ca-sms').checked;
      if (!v.trim()) return sms ? 'Enter a mobile number so we can text you, or untick text reminders.' : '';
      return validPhone(v) ? '' : 'Enter a 10-digit US mobile number, like (360) 555-0100.';
    },
    'ca-dob': function (v) {
      if (!v) return 'Enter your date of birth.';
      var a = ageOn(v, new Date());
      if (isNaN(a) || v > todayIso() || v < '1900-01-01') return 'Enter a real date of birth.';
      return a < 18 ? 'You need to be 18 or older to create an account. Please call the studio for help.' : '';
    },
    'ca-pw': function (v) { var c = pwChecks(v); return !v ? 'Create a password.' : (c.len && c.mix && c.num) ? '' : 'Your password needs at least 10 characters, upper- and lowercase letters and a number.'; },
    'ca-pw2': function (v, f) { return !v ? 'Enter your password again.' : v !== f.querySelector('#ca-pw').value ? 'The passwords don’t match.' : ''; },
    'ca-terms': function (v, f) { return f.querySelector('#ca-terms').checked ? '' : 'Please agree to the Terms of Use and Privacy Policy to create an account.'; },
    'ca-health': function (v, f) { return f.querySelector('#ca-health').checked ? '' : 'We need this consent to store your scan results and show them in the portal.'; }
  };
  function validateCreate(f, only) {
    var bad = [];
    Object.keys(CREATE_RULES).forEach(function (id) {
      if (only && only !== id) return;
      var el = f.querySelector('#' + id);
      var msg = CREATE_RULES[id](el.value, f);
      setErr(el, msg); if (msg) bad.push(el);
    });
    return bad;
  }
  function showAlert(el, msg) { el.hidden = !msg; el.textContent = msg || ''; }

  function submitSignin(f) {
    var em = f.querySelector('#si-email'), pw = f.querySelector('#si-pw'), alertEl = f.querySelector('#signin-alert');
    showAlert(alertEl, '');
    var e1 = !em.value.trim() ? 'Enter your email address.' : !EMAIL_RE.test(em.value.trim()) ? 'Enter an email address like name@example.com.' : '';
    var e2 = pw.value ? '' : 'Enter your password.';
    setErr(em, e1); setErr(pw, e2);
    if (e1 || e2) { (e1 ? em : pw).focus(); return; }
    var acct = getAccount(em.value);
    var fail = function () {
      showAlert(alertEl, 'That email and password don’t match an account. Check them and try again, or reset your password.');
      em.setAttribute('aria-invalid', 'true'); pw.setAttribute('aria-invalid', 'true');
      pw.value = ''; pw.focus();
    };
    if (!acct) { fail(); return; }
    hashPw(acct.salt, pw.value).then(function (h) {
      if (h !== acct.passwordHash) { fail(); return; }
      signInAs(acct); closeAuth(false); f.reset();
      if (location.hash === '#/' || location.hash === '') route(); else location.hash = '#/';
    }).catch(function (err) { showAlert(alertEl, 'Sign-in isn’t available in this browser window. ' + err.message); });
  }
  function submitForgot(f) {
    var em = f.querySelector('#fp-email'), msg = f.querySelector('#forgot-msg');
    msg.textContent = '';
    var e1 = !em.value.trim() ? 'Enter your email address.' : !EMAIL_RE.test(em.value.trim()) ? 'Enter an email address like name@example.com.' : '';
    setErr(em, e1); if (e1) { em.focus(); return; }
    // Production: POST /api/auth/password-reset { email }. Always show the same message so it never reveals whether an account exists.
    msg.innerHTML = ICON_CHECK + '<span>If an account exists for <strong>' + esc(em.value.trim()) + '</strong>, we’ve sent a link to reset your password. It expires in 30 minutes.</span>';
  }
  function submitCreate(f) {
    // Preview only. The account, password hash and consents stay in this browser's localStorage.
    // This function must not fetch, beacon, or post the form anywhere.
    f.setAttribute('data-touched', '1');
    var alertEl = f.querySelector('#create-alert');
    var bad = validateCreate(f);
    if (bad.length) {
      showAlert(alertEl, bad.length === 1 ? 'Please fix the highlighted field below.' : 'Please fix the ' + bad.length + ' highlighted fields below.');
      bad[0].focus();
      return;
    }
    showAlert(alertEl, '');
    var at = nowIso(), salt = randomSalt(), v = function (id) { return f.querySelector('#' + id).value.trim(); };
    var phone = v('ca-phone') ? fmtPhone(phoneDigits(v('ca-phone'))) : '';
    var smsOn = f.querySelector('#ca-sms').checked;
    hashPw(salt, f.querySelector('#ca-pw').value).then(function (h) {
      var a = {
        id: 'cl_' + salt.slice(0, 8), email: v('ca-email').toLowerCase(), firstName: v('ca-first'), lastName: v('ca-last'),
        phone: phone, dateOfBirth: v('ca-dob'), salt: salt, passwordHash: h, createdAt: at, isDemo: false,
        emailVerified: false, // Production: send a verification email and gate the portal until it is confirmed.
        consentVersion: CONSENT_VERSION,
        consents: {
          terms: consentRecord(true, at, 'terms'),
          healthData: consentRecord(true, at, 'healthData'),
          marketingEmail: consentRecord(f.querySelector('#ca-mkt-email').checked, at, 'marketingEmail'),
          sms: consentRecord(smsOn, at, 'sms', { phone: smsOn ? phone : null, disclosure: CONSENT_TEXT.smsDisclosure })
        },
        consentLog: []
      };
      ['terms', 'healthData', 'marketingEmail', 'sms'].forEach(function (t) { logConsent(a, t, a.consents[t], 'signup'); });
      putAccount(a);
      signInAs(a); closeAuth(false); f.reset(); f.removeAttribute('data-touched'); updatePwMeter(); syncSmsPhone();
      if (location.hash === '#/' || location.hash === '') route(); else location.hash = '#/';
    }).catch(function (err) { showAlert(alertEl, 'Accounts can’t be created in this browser window. ' + err.message); });
  }

  authRoot.addEventListener('click', function (e) {
    var t;
    if (e.target === document.getElementById('auth') && isDesktopCard()) { closeAuth(); return; }
    if (e.target.closest('[data-close-auth]')) { closeAuth(); return; }
    if ((t = e.target.closest('[role="tab"]'))) { setAuthView(t.id === 'tab-create' ? 'create' : 'signin', 'form', 'tab'); return; }
    if ((t = e.target.closest('[data-auth-tab]'))) { setAuthView(t.getAttribute('data-auth-tab'), 'form'); return; }
    if ((t = e.target.closest('[data-auth-step]'))) {
      var step = t.getAttribute('data-auth-step');
      setAuthView('signin', step, step === 'form' ? undefined : undefined);
      if (step === 'form') { var fm = document.getElementById('forgot-msg'); if (fm) fm.textContent = ''; }
      return;
    }
    if ((t = e.target.closest('[data-pw-toggle]'))) {
      var inp = document.getElementById(t.getAttribute('data-pw-toggle'));
      var show = inp.type === 'password';
      inp.type = show ? 'text' : 'password';
      t.setAttribute('aria-pressed', String(show));
      t.textContent = show ? 'Hide' : 'Show';
      t.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    }
  });
  function isDesktopCard() { return !!(window.matchMedia && window.matchMedia('(min-width: 600px)').matches); }
  authRoot.addEventListener('submit', function (e) {
    e.preventDefault();
    if (e.target.id === 'signin-form') submitSignin(e.target);
    else if (e.target.id === 'forgot-form') submitForgot(e.target);
    else if (e.target.id === 'create-form') submitCreate(e.target);
  });
  authRoot.addEventListener('input', function (e) {
    var f = e.target.form; if (!f) return;
    if (e.target.id === 'ca-pw') updatePwMeter();
    if (f.id === 'create-form' && f.getAttribute('data-touched') && e.target.getAttribute('aria-invalid') === 'true') validateCreate(f, e.target.id);
    if (f.id === 'signin-form' && e.target.getAttribute('aria-invalid') === 'true') { setErr(e.target, ''); }
  });
  authRoot.addEventListener('change', function (e) {
    var f = e.target.form; if (!f || f.id !== 'create-form') return;
    if (e.target.id === 'ca-sms') { syncSmsPhone(); if (f.getAttribute('data-touched') || !e.target.checked) validateCreate(f, 'ca-phone'); }
    if (f.getAttribute('data-touched') && e.target.type === 'checkbox') validateCreate(f, e.target.id);
  });
  authRoot.addEventListener('focusout', function (e) {
    var f = e.target.form; if (!f || f.id !== 'create-form' || !f.getAttribute('data-touched')) return;
    if (CREATE_RULES[e.target.id]) validateCreate(f, e.target.id);
  });
  document.addEventListener('keydown', function (e) {
    if (!auth.open) return;
    var dlg = document.querySelector('#auth .auth-dialog');
    if (e.key === 'Escape') { e.preventDefault(); closeAuth(); return; }
    if (e.key === 'Tab') {
      var list = focusables(dlg); if (!list.length) return;
      var first = list[0], last = list[list.length - 1];
      if (e.shiftKey && (document.activeElement === first || !dlg.contains(document.activeElement))) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (document.activeElement === last || !dlg.contains(document.activeElement))) { e.preventDefault(); first.focus(); }
      return;
    }
    var tab = e.target.closest && e.target.closest('[role="tab"]');
    if (tab && (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Home' || e.key === 'End')) {
      e.preventDefault();
      var toCreate = e.key === 'End' ? true : e.key === 'Home' ? false : tab.id === 'tab-signin';
      setAuthView(toCreate ? 'create' : 'signin', 'form', 'tab');
    }
  });
  // Keep focus inside the dialog if something outside grabs it (e.g. a click on the dimmed area on phones).
  document.addEventListener('focusin', function (e) {
    if (!auth.open) return;
    var dlg = document.querySelector('#auth .auth-dialog');
    if (dlg && !dlg.contains(e.target)) dlg.focus();
  });

  // ---------- Shell ----------
  function shell(active, inner) {
    var D = state.data, c = D.client;
    var tabs = [
      ['home', '#/', 'Home', ICON.home],
      ['progress', '#/progress', 'Progress', ICON.progress],
      ['history', '#/history', 'History', ICON.history],
      ['receipts', '#/receipts', 'Receipts &amp; Superbills', ICON.receipts],
      ['profile', '#/profile', 'Profile', ICON.profile]
    ].map(function (t) {
      return '<a class="tab" href="' + t[1] + '"' + (t[0] === active ? ' aria-current="page"' : '') + '><span class="ico">' + t[3] + '</span><span class="tab-label">' + t[2] + '</span></a>';
    }).join('');
    return '<div class="shell">' +
      topbar(c) +
      '<div class="side">' +
        '<nav class="tabs" aria-label="Portal">' + tabs + '</nav>' +
        '<div class="side-extra">' +
          '<a class="btn btn-primary btn-block" href="' + (appointment() ? '#/appointment' : esc(D.nextScan.bookingUrl)) + '">' + ICON.calendar + (appointment() ? 'View appointment' : 'Book a scan') + '</a>' +
          '<p class="small">' + (appointment() ? esc(fmtShort(appointment().date) + ' · ' + appointment().time + ' · ' + appointment().service) + '.' : (D.nextScan.recommendedWeekOf ? 'Next scan recommended the week of ' + esc(fmtShort(D.nextScan.recommendedWeekOf)) + '.' : 'Book your first scan to start tracking.')) + '</p>' +
          '<p class="tagline">Measure. Understand. Thrive.</p>' +
        '</div>' +
      '</div>' +
      '<main class="main" id="view" tabindex="-1">' + inner + '</main>' +
    '</div>';
  }

  // ---------- Views ----------
  /** Signed-out page behind the auth modal: cream bar, a soft blurred preview of the portal, and a short intro
      with Sign in / Create account buttons (what you see if you close the modal). */
  function viewSignedOut() {
    var ghost = '<div class="ghost-head"></div><div class="ghost-grid"><i></i><i></i><i></i><i></i></div><div class="ghost-wide"></div>';
    return '<div class="auth-page">' + topbar(null) +
      '<div class="auth-ghost" aria-hidden="true">' + ghost + '</div>' +
      '<main class="auth-landing" id="view" tabindex="-1">' +
        '<div class="auth-landing-card">' +
          '<header class="ph ph-b"><div class="ph-text">' +
            '<p class="eyebrow">Your DEXA results</p>' +
            '<h1 class="title">Every scan, in one place</h1>' +
            '<p class="ph-sub">Sign in to see your results, track your goals and read the notes from your review. New client? Create your account in a minute.</p>' +
          '</div></header>' +
          '<div class="auth-landing-actions">' +
            '<button type="button" class="btn btn-primary btn-block" data-open-auth="signin">Sign in</button>' +
            '<button type="button" class="btn btn-ghost btn-block" data-open-auth="create">Create account</button>' +
          '</div>' +
          '<a class="auth-site" href="' + SITE_URL + '">' + ICON_BACK_SM + 'Back to precisiondexa.com</a>' +
          '<p class="disclaimer">' + esc(DISCLAIMER) + '</p>' +
        '</div>' +
      '</main>' +
    '</div>';
  }

  var LEGAL = {
    terms: ['Terms of Use', 'The full Terms of Use will be published here before launch.'],
    privacy: ['Privacy Policy', 'The full Privacy Policy will be published here before launch.'],
    'health-privacy': ['Consumer Health Data Privacy Policy', 'Our Consumer Health Data Privacy Policy (Washington My Health My Data Act) will be published here before launch. It will explain what health data we collect, why, who we share it with, and how to withdraw consent or ask us to delete your data.']
  };
  function viewLegal(page) {
    var L = LEGAL[page], c = state.signedIn && state.data ? state.data.client : null;
    return '<div class="auth-page">' + topbar(c) +
      '<main class="legal" id="view" tabindex="-1"><div class="legal-col">' +
        '<header class="ph ph-b"><div class="ph-text"><p class="eyebrow">Placeholder</p><h1 class="title">' + esc(L[0]) + '</h1></div></header>' +
        '<div class="card accent stack-lg"><p>' + esc(L[1]) + '</p><p class="small muted">Consent text version ' + esc(CONSENT_VERSION) + '.</p></div>' +
        '<p><a class="strong" href="' + (c ? '#/profile' : '#/signin') + '">' + (c ? 'Back to your profile' : 'Back to sign in') + '</a></p>' +
      '</div></main>' +
    '</div>';
  }

  /** New accounts have no scans yet. */
  function viewWelcome(page) {
    var c = state.data.client;
    var active = { '': 'home', progress: 'progress', history: 'history', scans: 'history', receipts: 'receipts' }[page] || 'home';
    return shell(active,
      pageHead({ view: 'welcome', eyebrow: 'Welcome', title: 'Hi, ' + c.firstName, sub: 'Your account is ready.' }) +
      '<section class="card accent stack-lg welcome-card">' +
        leafDivider() +
        '<h2 class="h2">Your results will appear here after your first scan</h2>' +
        '<p>Each visit adds your body fat, lean muscle, visceral fat and bone density, plus the notes from your review. You’ll be able to track your progress toward the goals you set with Amber.</p>' +
        '<a class="btn btn-primary" href="' + esc(state.data.nextScan.bookingUrl) + '">' + ICON.calendar + 'Book your first scan</a>' +
        '<p class="small muted">Already booked? Your results show up here within a day of your visit.</p>' +
      '</section>' +
      '<p class="disclaimer boxed">' + esc(DISCLAIMER) + '</p>'
    );
  }

  function isBody(s) { return !!(s && s.kind !== 'bone-density' && s.bodyFatPct != null); }
  function bodyScans() { return (state.data.scans || []).filter(isBody); }
  function serviceName(s) { return (s && s.service) || 'DEXA Body Composition scan'; }
  function scoreText(n) { var v = Number(n); return (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(1); }
  function appointment() { return state.data.nextScan && state.data.nextScan.appointment; }
  function nextCard() {
    var next = state.data.nextScan, ap = appointment();
    if (!ap) {
      return '<section class="next">' + LEAF_NAVY + '<p class="eyebrow">Next scan recommended</p><h2>Week of ' + esc(fmtShort(next.recommendedWeekOf)) + '</h2>' +
        '<p>About ' + weeksBetween(bodyScans()[0].date, next.recommendedWeekOf) + ' weeks after your last scan, a good interval for seeing meaningful change.</p>' +
        '<a class="btn btn-gold" href="' + esc(next.bookingUrl) + '" style="margin-top:auto">Book your scan</a></section>';
    }
    return '<section class="next">' + LEAF_NAVY + '<p class="eyebrow">' + esc(ap.status) + '</p><h2>' + esc(fmtDate(ap.date, { weekday: 'short', month: 'short', day: 'numeric' })) + '</h2>' +
      '<p>' + esc(ap.time) + ' · ' + esc(ap.service) + ' with ' + esc(ap.with) + '.</p>' +
      '<a class="btn btn-gold" href="#/appointment" style="margin-top:auto">View appointment</a></section>';
  }

  function viewDashboard() {
    var D = state.data, s = D.scans, body = bodyScans(), cur = body[0] || s[0], prev = body[1];
    var hour = new Date().getHours();
    var greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    var cards = METRIC_ORDER.map(function (k) {
      var m = METRICS[k];
      var c = prev ? change(k, prev[k], cur[k]) : null;
      return '<a class="card accent metric" href="#/progress/' + k + '">' +
        '<span class="label">' + m.label + '</span>' +
        '<span class="value">' + fmtVal(k, cur[k]) + '<small>' + m.sep + m.unit + '</small></span>' +
        (c ? pill(c) + '<span class="phrase cue-' + c.tone + '">' + esc(c.phrase) + '</span>' : '<span class="phrase muted">Your baseline</span>') +
      '</a>';
    }).join('');

    var summary = '';
    if (prev) {
      var fat = prev.fatMassLb - cur.fatMassLb, lean = cur.leanMassLb - prev.leanMassLb;
      var parts = [];
      parts.push(fat >= 0 ? 'You carry ' + fat.toFixed(1) + ' lb less fat mass' : 'Fat mass is up ' + Math.abs(fat).toFixed(1) + ' lb');
      parts.push(lean >= 0 ? lean.toFixed(1) + ' lb more lean muscle' : 'lean muscle is down ' + Math.abs(lean).toFixed(1) + ' lb');
      summary = '<p class="eyebrow">Since your ' + esc(fmtShort(prev.date)) + ' scan</p><p class="lead">' + esc(parts.join(' and ')) + '.</p>';
    } else {
      summary = '<p class="eyebrow">Your baseline</p><p class="lead">This first scan is the starting point every future scan is compared against.</p>';
    }
    var n = cur.notes;
    var note = n && n.paragraphs && n.paragraphs.length ?
      '<div class="stack" style="gap:8px;padding-top:14px;border-top:1px solid var(--line)"><p class="eyebrow">From your review</p><p class="note-excerpt">“' + esc(n.paragraphs[0]) + '”</p><p class="byline">— ' + esc(byline(n.author)) + '</p></div>' : '';

    var goals = (D.goals || []).map(function (g) {
      var gp = goalProgress(g, cur[g.metric]);
      return '<div class="goal-mini"><div class="row" style="align-items:baseline"><span class="strong" style="font-size:14px">' + esc(g.label) + '</span><span class="small muted">' + esc(g.due) + '</span></div>' + gp.html + '</div>';
    }).join('');

    var next = D.nextScan;
    return shell('home',
      pageHead({
        view: 'home',
        eyebrow: 'Visit ' + cur.number + ' of ' + s.length + ' · ' + fmtShort(cur.date),
        title: greet + ', ' + D.client.firstName,
        sub: 'Your latest DEXA Body Composition scan was ' + fmtLong(cur.date) + '.',
        badge: 'Latest scan · ' + fmtDate(cur.date, { month: 'short', day: 'numeric', year: 'numeric' }),
        chips: ['Latest scan ' + fmtShort(cur.date), s.length + ' visits', appointment() ? appointment().status + ' ' + fmtShort(appointment().date) : 'Next scan week of ' + fmtShort(next.recommendedWeekOf)],
        ring: headlineGoal(cur)
      }) +
      '<section class="metrics" aria-label="Headline numbers">' + cards + '</section>' +
      LEGEND +
      '<div class="dash-grid">' +
        '<section class="card stack-lg">' + summary + note +
          '<a class="btn btn-outline" href="#/scans/' + esc(cur.id) + '">View full ' + esc(fmtShort(cur.date)) + ' results<span aria-hidden="true">→</span></a>' +
        '</section>' +
        (goals ? '<section class="card stack-lg"><div class="row" style="align-items:baseline"><h2 class="h2" style="font-size:22px">Your goals</h2><a class="small strong" href="#/profile" style="min-height:44px;display:inline-flex;align-items:center">All goals</a></div>' + goals + '</section>' : '') +
        nextCard() +
      '</div>' +
      '<p class="disclaimer boxed">' + esc(DISCLAIMER) + '</p>'
    );
  }

  /** Goal progress bar (reduce/increase) or steady pill (maintain). */
  function goalProgress(g, now) {
    if (g.kind === 'maintain') {
      var ch = change(g.metric, g.start, now);
      var ok = ch.tone === 'steady';
      return { html: '<span class="pill ' + (ok ? 'steady' : 'watch') + '">' + (ok ? '→ Holding steady · on track' : 'Worth a look with Amber') + '</span>' };
    }
    var pct = g.kind === 'reduce' ? (g.start - now) / (g.start - g.target) : (now - g.start) / (g.target - g.start);
    pct = Math.max(0, Math.min(1, pct));
    var p = Math.round(pct * 100);
    var detail = g.kind === 'reduce'
      ? withUnit(g.metric, g.start) + ' at start · ' + withUnit(g.metric, now) + ' now'
      : (now - g.start >= 0 ? '+' : '−') + Math.abs(now - g.start).toFixed(METRICS[g.metric].dec) + ' ' + METRICS[g.metric].unit + ' so far';
    return { html: '<div class="bar" role="progressbar" aria-label="' + esc(g.label) + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + p + '"><i style="width:' + p + '%"></i></div>' +
      '<div class="row small"><span class="muted">' + esc(detail) + '</span><span style="font-weight:600;color:var(--good-ink);white-space:nowrap">' + p + '% of the way</span></div>' };
  }

  function viewProgress(key) {
    if (!METRICS[key]) key = 'bodyFatPct';
    var m = METRICS[key];
    var scans = bodyScans().slice().reverse(); // oldest first, body composition only
    var first = scans[0], last = scans[scans.length - 1];
    var seg = METRIC_ORDER.map(function (k) {
      return '<button type="button" data-metric="' + k + '" aria-pressed="' + (k === key) + '">' + METRICS[k].short + '</button>';
    }).join('');

    // One trend card per metric. Mobile shows the selected one (tabs); desktop shows all four in a grid.
    var trends = METRIC_ORDER.map(function (k) {
      var mm = METRICS[k];
      var total = scans.length > 1 ? change(k, first[k], last[k]) : null;
      return '<section class="card accent trend' + (k === key ? ' is-selected' : '') + '" aria-label="' + mm.label + ' trend">' +
        '<div class="row" style="align-items:flex-end"><div class="stack" style="gap:6px"><span class="eyebrow">' + mm.label + ' · latest</span><span class="big">' + fmtVal(k, last[k]) + '<small>' + mm.sep + mm.unit + '</small></span></div>' +
        (total ? '<div class="stack" style="gap:4px;align-items:flex-end">' + pill(total) + '<span class="small muted">since ' + esc(fmtDate(first.date, { month: 'long' })) + '</span></div>' : '') + '</div>' +
        '<div class="chart" data-chart="' + k + '"></div>' +
        '<p class="about"><span class="strong">About this measure.</span> ' + esc(mm.about) + '</p>' +
      '</section>';
    }).join('');

    var rows = bodyScans().map(function (s, i, arr) {
      var older = arr[i + 1];
      var c = older ? change(key, older[key], s[key]) : null;
      var tag = 'Scan ' + esc(s.number) + (i === 0 ? ' · latest' : '') + (!older ? ' · baseline' : '');
      return '<div class="row"><div class="stack" style="gap:2px"><span class="strong" style="font-size:15px">' + esc(fmtDate(s.date)) + '</span><span class="small muted">' + tag + '</span></div>' +
        '<div class="row" style="gap:10px"><span class="num">' + withUnit(key, s[key]) + '</span>' +
        '<span class="chg-col">' + (c ? pill(c) : '<span class="pill plain">Starting point</span>') + '</span></div></div>';
    }).join('');

    // Desktop: every scan with all four metrics in one table.
    var table = '<div class="table-wrap list" style="overflow-x:auto"><table class="scan-table"><caption class="eyebrow" style="text-align:left;padding:14px 16px">Scan by scan</caption><thead><tr><th scope="col">Scan</th>' +
      METRIC_ORDER.map(function (k) { return '<th scope="col">' + METRICS[k].label + '</th>'; }).join('') + '</tr></thead><tbody>' +
      bodyScans().map(function (s, i, arr) {
        var older = arr[i + 1];
        return '<tr><th scope="row" style="background:none;text-transform:none;letter-spacing:0;font-size:14px"><a href="#/scans/' + esc(s.id) + '" class="strong">' + esc(fmtDate(s.date)) + '</a><span class="small muted" style="display:block;font-weight:400">Scan ' + esc(s.number) + (!older ? ' · baseline' : '') + '</span></th>' +
          METRIC_ORDER.map(function (k) {
            var c = older ? change(k, older[k], s[k]) : null;
            return '<td><span class="v">' + withUnit(k, s[k]) + '</span>' + (c ? pill(c) : '<span class="small muted">Starting point</span>') + '</td>';
          }).join('') + '</tr>';
      }).join('') + '</tbody></table></div>';

    return shell('progress',
      pageHead({
        view: 'progress',
        eyebrow: 'Progress',
        title: 'Your progress',
        sub: scans.length + ' scans · ' + fmtDate(first.date, { month: 'long', day: 'numeric' }) + ' to ' + fmtDate(last.date, { month: 'long', day: 'numeric', year: 'numeric' }),
        badge: 'Latest scan · ' + fmtDate(last.date, { month: 'short', day: 'numeric', year: 'numeric' }),
        chips: [scans.length + ' body composition scans', fmtShort(first.date) + ' to ' + fmtDate(last.date, { month: 'short', day: 'numeric', year: 'numeric' })]
      }) +
      '<p class="small muted">Trends use the DEXA Body Composition scans. The Diagnostic DEXA Bone Density Scan is in History and is not plotted here.</p>' +
      '<div class="seg" role="group" aria-label="Choose a metric">' + seg + '</div>' +
      '<div class="progress-grid">' +
        '<div class="trend-grid">' + trends + '</div>' +
        LEGEND +
        '<section class="list trend-rows" aria-label="' + m.label + ' by scan">' + rows + '</section>' +
        table +
      '</div>'
    );
  }

  /** Line charts drawn at each container's real width so labels stay legible. */
  function drawCharts() {
    var els = document.querySelectorAll('[data-chart]');
    for (var n = 0; n < els.length; n++) drawChart(els[n]);
  }
  function drawChart(el) {
    var key = el.getAttribute('data-chart');
    var m = METRICS[key];
    var scans = bodyScans().slice().reverse();
    var vals = scans.map(function (s) { return s[key]; });
    var g = goalFor(key);
    var target = g && g.kind !== 'maintain' ? g.target : null;
    var all = target != null ? vals.concat([target]) : vals;
    var lo = Math.min.apply(null, all), hi = Math.max.apply(null, all);
    var span = Math.max((hi - lo) * 1.35, m.minSpan), mid = (hi + lo) / 2;
    var min = mid - span / 2, max = mid + span / 2;
    var W = Math.max(280, el.clientWidth || 320), H = 220, L = 48, R = 24, T = 28, B = 56;
    var x = function (i) { return vals.length === 1 ? (L + W - R) / 2 : L + 18 + i * ((W - L - R - 36) / (vals.length - 1)); };
    var y = function (v) { return T + (max - v) / (max - min) * (H - T - B + 20); };
    var bottom = y(min);
    var grid = [max, (max + min) / 2, min].map(function (gv) {
      return '<line x1="' + L + '" x2="' + W + '" y1="' + y(gv) + '" y2="' + y(gv) + '" stroke="#E7E1D6"/>' +
        '<text x="0" y="' + (y(gv) + 4) + '" font-size="12" fill="#5A6068">' + fmtVal(key, gv) + '</text>';
    }).join('');
    var goalLine = target != null ?
      '<line x1="' + L + '" x2="' + W + '" y1="' + y(target) + '" y2="' + y(target) + '" stroke="#5E7F6B" stroke-width="1.5" stroke-dasharray="5 4"/>' +
      '<text x="' + (W - 2) + '" y="' + (y(target) - 6) + '" font-size="12" font-weight="600" fill="#3D5A49" text-anchor="end">Goal ' + esc(withUnit(key, target)) + '</text>' : '';
    var pts = vals.map(function (v, i) { return x(i).toFixed(1) + ',' + y(v).toFixed(1); }).join(' ');
    var dots = vals.map(function (v, i) {
      var latest = i === vals.length - 1;
      return '<circle cx="' + x(i) + '" cy="' + y(v) + '" r="' + (latest ? 6.5 : 5) + '" fill="' + (latest ? '#C6B18E' : '#FFFFFF') + '" stroke="#0D3B66" stroke-width="2"/>' +
        '<text x="' + x(i) + '" y="' + (y(v) - 13) + '" font-size="13" font-weight="600" fill="#0D3B66" text-anchor="middle">' + fmtVal(key, v) + '</text>' +
        '<text x="' + x(i) + '" y="' + (bottom + 26) + '" font-size="12" fill="#5A6068" text-anchor="middle">' + esc(fmtShort(scans[i].date)) + '</text>';
    }).join('');
    var label = m.label + ' over ' + vals.length + ' scans: ' + vals.map(function (v) { return fmtVal(key, v); }).join(', ') + ' ' + m.unit + (target != null ? '. Goal ' + withUnit(key, target) : '');
    el.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + (bottom + 36) + '" role="img" aria-label="' + esc(label) + '" font-family="Inter, sans-serif">' +
      grid + goalLine + '<polyline points="' + pts + '" fill="none" stroke="#0D3B66" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>' + dots + '</svg>';
  }

  /** Collapsible section. Collapsed by default on mobile, open on desktop; remembers the client's choice. */
  function fold(id, title, sub, body) {
    var open = state.open.hasOwnProperty(id) ? state.open[id] : isDesktop();
    return '<details class="fold d-left" data-fold="' + id + '"' + (open ? ' open' : '') + '>' +
      '<summary><span><span class="h2" style="font-family:var(--serif);color:var(--navy);display:block">' + title + '</span><span class="sub">' + sub + '</span></span><span class="chev" aria-hidden="true">' + ICON.chev + '</span></summary>' +
      '<div class="fold-body">' + body + '</div></details>';
  }

  function viewBoneScan(s, scans) {
    var sites = (s.sites || []).map(function (site) {
      return '<div class="card stack" style="gap:6px"><p class="eyebrow">' + esc(site.label) + '</p>' +
        '<p class="lead" style="font-size:28px">' + Number(site.bmd).toFixed(3) + ' <small style="font-size:16px">g/cm²</small></p>' +
        '<p>T-score <span class="strong">' + esc(scoreText(site.tScore)) + '</span> · Z-score <span class="strong">' + esc(scoreText(site.zScore)) + '</span></p></div>';
    }).join('');
    var report = s.radiologistSummary;
    var reportHtml = report ? '<section class="notes" aria-label="Sample radiologist report summary">' +
      '<div class="who"><span class="avatar" aria-hidden="true">R</span><div class="stack" style="gap:2px"><span class="h3">Sample radiologist report summary</span><span class="small muted">Sample data · ' + esc(fmtDate(report.date)) + '</span></div></div>' +
      leafDivider() +
      report.paragraphs.map(function (p) { return '<p class="para">' + esc(p) + '</p>'; }).join('') +
    '</section>' : '';
    var n = s.notes;
    var notes = n ? '<section class="card stack-lg"><p class="eyebrow">From Amber</p>' +
      n.paragraphs.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') +
      '<p class="byline">— ' + esc(byline(n.author)) + '</p></section>' : '';
    return shell('history',
      '<div class="row"><a class="back" href="#/history">' + ICON.back + 'History</a>' +
      '<a class="btn btn-ghost btn-sm" href="#/receipts/' + esc(s.id) + '/receipt">Receipt</a></div>' +
      pageHead({
        view: 'scan',
        eyebrow: serviceName(s),
        title: fmtDate(s.date, { month: 'long', day: 'numeric', year: 'numeric' }),
        sub: 'Hip and spine. Sample scores for this preview, not a diagnosis.',
        badge: 'Visit ' + s.number + ' of ' + scans.length,
        chips: ['Hip and spine', 'Sample radiologist summary']
      }) +
      '<section class="metrics" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr))" aria-label="Hip and spine scores">' + sites + '</section>' +
      reportHtml +
      notes +
      '<p class="disclaimer boxed">Sample data only. T-scores and Z-scores on this page are for the Diagnostic DEXA Bone Density Scan preview. They are not a diagnosis. A real report is read with your doctor. ' + esc(DISCLAIMER) + '</p>'
    );
  }

  function viewScan(id) {
    var scans = state.data.scans;
    var i = scans.findIndex(function (s) { return s.id === id; });
    if (i < 0) return viewNotFound();
    var s = scans[i];
    if (s.kind === 'bone-density') return viewBoneScan(s, scans);
    var prev = scans.slice(i + 1).filter(isBody)[0];
    function delta(field, dir, dec) {
      if (!prev) return '<span class="chg-steady">Baseline</span>';
      var df = s[field] - prev[field];
      if (Math.abs(df) < 0.05) return '<span class="chg-steady">→ No change</span>';
      var cls = dir === 0 ? 'chg-steady' : (df * dir > 0 ? 'chg-good' : 'chg-watch');
      return '<span class="' + cls + '">' + (df > 0 ? '↑ ' : '↓ ') + Math.abs(df).toFixed(dec) + ' lb</span>';
    }
    var headline = METRIC_ORDER.map(function (k) {
      var c = prev ? change(k, prev[k], s[k]) : null;
      return '<div class="row"><div class="stack" style="gap:2px"><span class="strong" style="font-size:15px">' + METRICS[k].label + '</span><span class="small ' + (c ? 'cue-' + c.tone : 'muted') + '">' + (c ? esc(c.phrase) : 'Your baseline') + '</span></div>' +
        '<div class="row" style="gap:10px"><span class="num">' + withUnit(k, s[k]) + '</span>' + (c ? '<span class="chg-col">' + pill(c) + '</span>' : '') + '</div></div>';
    }).join('');

    var r = s.regions;
    function cell(X) { return '<span><span class="strong">' + Number(X.leanLb).toFixed(1) + ' lb</span> lean<br><span class="small muted">' + Number(X.fatPct).toFixed(1) + '% fat</span></span>'; }
    function sideRow(name, R, Lf, note) {
      return '<div class="region"><div class="region-row"><span class="strong">' + name + '</span>' + cell(R) + cell(Lf) + '</div>' + note + '</div>';
    }
    function balance(R, Lf, part, hand) {
      var diff = Math.abs(R.leanLb - Lf.leanLb) / Math.min(R.leanLb, Lf.leanLb) * 100;
      if (diff < 3) return '<span class="pill good">Well balanced · under ' + Math.max(2, Math.ceil(diff)) + '% apart</span>';
      var side = R.leanLb > Lf.leanLb ? 'Right' : 'Left';
      return '<span class="pill watch">' + side + ' ' + part + ' ' + Math.round(diff) + '% more lean' + (hand ? ' · common with a dominant hand' : '') + '</span>';
    }
    var trunkNote = '';
    if (prev) {
      var tc = s.regions.trunk.fatPct - prev.regions.trunk.fatPct;
      trunkNote = '<span class="pill ' + (tc < -0.3 ? 'good' : tc > 0.3 ? 'watch' : 'steady') + '">' + (Math.abs(tc) <= 0.3 ? '→ ' : tc < 0 ? '↓ ' : '↑ ') + Math.abs(tc).toFixed(1) + ' pts fat since last scan</span>';
    }
    // Figure: R and L tags sit on the figure itself (standard DEXA front view).
    var tag = function (cx, cy, t) { return '<circle cx="' + cx + '" cy="' + cy + '" r="10" fill="#0D3B66"/><text x="' + cx + '" y="' + (cy + 4.5) + '" font-size="12" font-weight="700" fill="#F7F3EC" text-anchor="middle" font-family="Inter, sans-serif">' + t + '</text>'; };
    var figure = '<svg viewBox="0 0 170 262" role="img" aria-label="Body map: arms in gold, trunk in navy, legs in green. R marks your right side, L marks your left side.">' +
      '<circle cx="85" cy="24" r="17" fill="#EFE3CC" stroke="#C6B18E"/><rect x="59" y="46" width="52" height="92" rx="14" fill="#0D3B66"/>' +
      '<rect x="33" y="48" width="19" height="94" rx="9.5" fill="#C6B18E"/><rect x="118" y="48" width="19" height="94" rx="9.5" fill="#C6B18E"/>' +
      '<rect x="61" y="144" width="22" height="102" rx="11" fill="#5E7F6B"/><rect x="87" y="144" width="22" height="102" rx="11" fill="#5E7F6B"/>' +
      tag(14, 92, 'R') + tag(156, 92, 'L') + tag(44, 200, 'R') + tag(126, 200, 'L') +
    '</svg>';
    var regionBody =
      '<div class="body-map">' + figure +
        '<div class="key"><span><i class="dot" style="background:var(--gold)"></i>Arms</span><span><i class="dot" style="background:var(--navy)"></i>Trunk</span><span><i class="dot" style="background:var(--sage)"></i>Legs</span><span><span class="side-tag">R</span>Right <span class="side-tag" style="margin-left:6px">L</span>Left</span></div>' +
      '</div>' +
      '<section class="list regions"><div class="regions-head"><span>Region</span><span><span class="side-tag" aria-hidden="true">R</span>Right</span><span><span class="side-tag" aria-hidden="true">L</span>Left</span></div>' +
        sideRow('Arms', r.armRight, r.armLeft, balance(r.armRight, r.armLeft, 'arm', true)) +
        sideRow('Legs', r.legRight, r.legLeft, balance(r.legRight, r.legLeft, 'leg', false)) +
        '<div class="region"><div class="region-row"><span class="strong">Trunk</span>' + cell(r.trunk) + '<span class="small muted">One region</span></div>' + trunkNote + '</div>' +
      '</section>';

    var n = s.notes;
    var notes = n ? '<section class="notes" aria-label="Notes from your review">' +
      '<div class="who"><span class="avatar" aria-hidden="true">' + esc(String(n.author || ' ')[0]) + '</span><div class="stack" style="gap:2px"><span class="h3">Notes from your review</span><span class="small muted">Results review · ' + esc(fmtDate(n.date)) + '</span></div></div>' +
      leafDivider() +
      n.paragraphs.map(function (p) { return '<p class="para">' + esc(p) + '</p>'; }).join('') +
      '<p class="byline">— ' + esc(byline(n.author)) + '</p>' +
      (n.plan && n.plan.length ? '<div class="stack-lg"><p class="eyebrow">Your plan until next scan</p><ol class="plan">' + n.plan.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ol></div>' : '') +
      (i === 0 ? '<a class="btn btn-primary" href="' + esc(state.data.nextScan.bookingUrl) + '">Book your next scan</a>' : '') +
    '</section>' : '';

    var cmp = compareSection(s, scans[scans.length - 1]);

    return shell('history',
      '<div class="row"><a class="back" href="#/history">' + ICON.back + 'History</a>' +
      (s.reportUrl ? '<a class="icon-btn" href="' + esc(s.reportUrl) + '" aria-label="Download PDF report">' + ICON.download + '</a>' : '<button type="button" class="icon-btn" aria-label="Download PDF report (coming soon)" disabled>' + ICON.download + '</button>') + '</div>' +
      pageHead({
        view: 'scan',
        eyebrow: serviceName(s) + ' · Visit ' + s.number + ' of ' + scans.length,
        title: fmtDate(s.date, { month: 'long', day: 'numeric', year: 'numeric' }),
        sub: (prev ? 'Compared with your ' + fmtShort(prev.date) + ' scan, ' + weeksBetween(prev.date, s.date) + ' weeks earlier' : 'Your baseline scan') + (s.reviewedBy ? ' · Reviewed with ' + s.reviewedBy : ''),
        badge: 'Scan ' + s.number + ' of ' + scans.length,
        chips: ['Scan ' + s.number + ' of ' + scans.length].concat(s.reviewedBy ? ['Reviewed with ' + s.reviewedBy] : []).concat([prev ? weeksBetween(prev.date, s.date) + ' weeks after ' + fmtShort(prev.date) : 'Your baseline'])
      }) +
      '<section class="stats" aria-label="Totals">' +
        '<div><span class="small muted">Total weight</span><span class="v">' + Number(s.weightLb).toFixed(1) + ' lb</span>' + delta('weightLb', 0, 1) + '</div>' +
        '<div><span class="small muted">Fat mass</span><span class="v">' + Number(s.fatMassLb).toFixed(1) + ' lb</span>' + delta('fatMassLb', -1, 1) + '</div>' +
        '<div><span class="small muted">Lean mass</span><span class="v">' + Number(s.leanMassLb).toFixed(1) + ' lb</span>' + delta('leanMassLb', 1, 1) + '</div>' +
        '<div><span class="small muted">Bone mineral</span><span class="v">' + Number(s.bmcLb).toFixed(1) + ' lb</span>' + delta('bmcLb', 0, 1) + '</div>' +
      '</section>' +
      '<div class="detail-grid">' +
        '<div class="d-left stack-lg"><h2 class="h2">Headline numbers</h2><section class="list">' + headline + '</section>' + LEGEND + '</div>' +
        notes +
        fold('regions', 'By region', 'Arms, legs and trunk, right and left', regionBody) +
        (cmp ? fold('compare', 'How you compare', cmp.sub, cmp.body) : '') +
      '</div>' +
      '<p class="disclaimer boxed">' + esc(DISCLAIMER) + '</p>'
    );
  }

  /** Opt-in peer comparison. Percentiles come from the scan software's reference data, never computed here.
   *  Wording is goal-aware ("Lower body fat than 42 in 100 women your age"), and the change since the
   *  first scan is labeled toward or away from the goal with the same cue colors.
   *  Bone density is intentionally excluded (bone comparisons are T/Z-scores, a clinical conversation). */
  function clampP(n) { n = Math.round(Number(n)); return isFinite(n) ? Math.max(1, Math.min(99, n)) : null; }
  function compareSection(s, first) {
    var p = s.percentiles;
    if (!p || !p.reference) return null;
    var ref = p.reference;
    var people = ref.sex === 'female' ? 'women' : ref.sex === 'male' ? 'men' : 'adults';
    var group = people + ' ' + String(ref.ageBand).replace('–', ' to ');
    var on = !!state.showCompare;
    var sw = '<div class="switch-row"><span id="cmp-label">Show how I compare with ' + esc(group) + '</span>' +
      '<button type="button" class="switch" role="switch" aria-checked="' + on + '" aria-labelledby="cmp-label" data-toggle-compare><span></span></button></div>';
    if (!on) {
      return { sub: 'Off · optional', body: sw + '<p class="small muted">See where your numbers fall among ' + esc(group) + ' nationally. Comparisons stay off unless you turn them on.</p>' };
    }
    var base = first && first.id !== s.id && first.percentiles ? first : null;
    var rows = ['bodyFatPct', 'leanMassLb', 'vatLb'].map(function (k) {
      var v = clampP(p[k]);
      if (v == null) return '';
      var mm = METRICS[k];
      var dir = goalDir(k) || mm.dir;
      // fav = how many in 100 the client is "on the goal side" of. Bar runs from away-from-goal (left) to toward-goal (right).
      var fav = dir < 0 ? 100 - v : v;
      var sentence = (dir < 0 ? mm.lessWord : mm.moreWord) + ' than ' + fav + ' in 100 ' + people + ' your age';
      var b = base ? clampP(base.percentiles[k]) : null;
      var favB = b == null ? null : (dir < 0 ? 100 - b : b);
      var chg = '';
      if (favB != null) {
        var diff = fav - favB;
        var tone = Math.abs(diff) < 3 ? 'steady' : diff > 0 ? 'good' : 'watch';
        var txt = tone === 'steady' ? '→ About the same as your first scan' : tone === 'good' ? '↑ Toward your goal since your first scan' : '↓ Away from your goal · worth a look with Amber';
        chg = '<div class="row" style="flex-wrap:wrap;gap:6px 12px"><span class="pill ' + tone + '" style="white-space:normal">' + esc(txt) + '</span><span class="small muted">' + favB + ' in 100 on ' + esc(fmtShort(base.date)) + '</span></div>';
      }
      return '<div class="cmp">' +
        '<p class="small strong" style="letter-spacing:.12em;text-transform:uppercase;font-size:12px">' + mm.label + '</p>' +
        '<p class="sentence">' + esc(sentence) + '</p>' +
        '<div class="pbar" aria-hidden="true"><i class="mid"></i>' + (favB != null ? '<i class="was" style="left:' + favB + '%"></i>' : '') + '<i class="now" style="left:' + fav + '%"></i></div>' +
        '<div class="pends" aria-hidden="true"><span>' + esc(dir < 0 ? mm.moreWord : mm.lessWord) + '</span><span>' + esc(dir < 0 ? mm.lessWord : mm.moreWord) + ' →</span></div>' +
        chg + '</div>';
    }).join('');
    return { sub: 'On · compared with ' + esc(group), body: sw +
      '<p class="small muted">Where your ' + esc(fmtShort(s.date)) + ' numbers fall among 100 ' + esc(group) + '. The right end of each bar is the direction of your goal; the center mark is the national middle.</p>' +
      rows +
      '<div class="legend"><span><i class="dot steady"></i>' + esc(fmtShort(s.date)) + '</span>' +
        (base ? '<span><i class="dot" style="background:#fff;box-shadow:inset 0 0 0 2px var(--navy)"></i>' + esc(fmtShort(base.date)) + ' (first scan)</span>' : '') +
        '<span><i style="width:2px;height:14px;background:var(--muted);display:inline-block"></i>National middle</span></div>' +
      '<p class="disclaimer">Reference: ' + esc(ref.source || 'national reference data') + ', ' + esc(group) + '. A comparison, not a health rating. Bone density is not compared here; a Diagnostic DEXA Bone Density Scan includes a radiologist report.</p>' };
  }

  function viewHistory() {
    var D = state.data, scans = D.scans;
    var first = scans[scans.length - 1];
    var cards = scans.map(function (s, i) {
      if (s.kind === 'bone-density') {
        var hip = (s.sites || []).filter(function (x) { return x.id === 'hip'; })[0] || (s.sites || [])[2] || {};
        var spine = (s.sites || []).filter(function (x) { return x.id === 'spine'; })[0] || (s.sites || [])[0] || {};
        return '<a class="card scan-card" href="#/scans/' + esc(s.id) + '">' +
          '<div class="stack" style="gap:2px"><span class="date">' + esc(fmtDate(s.date)) + '</span><span class="small muted">' + esc(serviceName(s)) + '</span></div>' +
          '<div class="mini"><span>Spine T<strong>' + esc(scoreText(spine.tScore)) + '</strong><span class="chg-steady">L1–L4</span></span>' +
          '<span>Hip T<strong>' + esc(scoreText(hip.tScore)) + '</strong><span class="chg-steady">Total hip</span></span>' +
          '<span class="x">Neck T<strong>' + esc(scoreText(((s.sites || [])[1] || {}).tScore)) + '</strong><span class="chg-steady">Femoral neck</span></span></div>' +
          '<span class="badge-slot">' + ICON.chev + '</span></a>';
      }
      var older = scans.slice(i + 1).filter(isBody)[0];
      function cell(label, k, extra) {
        var c = older ? change(k, older[k], s[k]) : null;
        return '<span' + (extra ? ' class="x"' : '') + '>' + label + '<strong>' + withUnit(k, s[k]) + '</strong>' + (c ? '<span class="chg-' + c.tone + '">' + esc(c.text) + '</span>' : '<span aria-label="Starting point">—</span>') + '</span>';
      }
      var w = older ? (s.weightLb - older.weightLb) : null;
      var badge = i === 0 ? '<span class="pill dark">Latest</span>' : (!older ? '<span class="pill steady">Baseline</span>' : '');
      return '<a class="card scan-card" href="#/scans/' + esc(s.id) + '">' +
        '<div class="stack" style="gap:2px"><span class="date">' + esc(fmtDate(s.date)) + '</span><span class="small muted">' + esc(serviceName(s)) + (older ? '' : ' · Baseline') + '</span></div>' +
        '<div class="mini">' + cell('Body fat', 'bodyFatPct') + cell('Lean', 'leanMassLb') + cell('Visceral', 'vatLb', true) + cell('Bone', 'bmdGcm2', true) +
        '<span>Weight<strong>' + Number(s.weightLb).toFixed(1) + ' lb</strong><span class="chg-steady">' + (w == null ? '—' : (w < 0 ? '↓ ' : '↑ ') + Math.abs(w).toFixed(1) + ' lb') + '</span></span></div>' +
        '<span class="badge-slot" data-badge>' + badge + ICON.chev + '</span>' +
      '</a>';
    }).join('');
    var next = D.nextScan;
    return shell('history',
      pageHead({
        view: 'history',
        eyebrow: 'History',
        title: 'Scan history',
        sub: scans.length + ' scans since ' + fmtDate(first.date, { month: 'long', year: 'numeric' }) + ' · about every ' + next.intervalWeeks + ' weeks',
        badge: scans.length + ' scans since ' + fmtDate(first.date, { month: 'short', year: 'numeric' }),
        chips: [scans.length + ' visits', 'About every ' + next.intervalWeeks + ' weeks', appointment() ? 'Next visit ' + fmtShort(appointment().date) : 'Next scan week of ' + fmtShort(next.recommendedWeekOf)]
      }) +
      '<div class="history-grid">' +
        '<aside class="history-aside">' +
          '<div class="upnext">' + LEAF_NAVY + '<span class="eyebrow">' + (appointment() ? esc(appointment().status) : 'Up next') + '</span><div class="row-cta"><span class="when">' +
          (appointment() ? esc(fmtShort(appointment().date) + ' · ' + appointment().time) : 'Week of ' + esc(fmtShort(next.recommendedWeekOf))) + '</span>' +
          '<a class="btn btn-gold btn-sm" href="#/appointment">' + (appointment() ? 'View' : 'Book') + '</a></div><p>' +
          (appointment() ? esc(appointment().service) + ' with ' + esc(appointment().with) + '.' : 'Same time of day and well hydrated gives the cleanest comparison.') + '</p></div>' +
          '<div class="panel stack small"><p class="eyebrow">Your reports</p><p class="muted" style="font-size:14px">Sample preview. Open a visit for Amber’s notes. The bone-density visit includes a sample radiologist summary. PDF files are not part of this preview.</p></div>' +
        '</aside>' +
        '<div class="history-list">' + cards + '</div>' +
      '</div>' +
      LEGEND
    );
  }

  function viewProfile() {
    var D = state.data, c = D.client, cur = bodyScans()[0] || D.scans[0];
    var goals = D.goals.map(function (g) {
      var gp = goalProgress(g, cur[g.metric]);
      return '<div class="card stack-lg" style="gap:10px"><div class="row" style="align-items:baseline"><span class="strong" style="font-size:15px">' + esc(g.label) + '</span><span class="small muted">' + esc(g.due) + '</span></div>' + gp.html + '</div>';
    }).join('');
    var ft = Math.floor(c.heightIn / 12), inch = c.heightIn % 12, hasHeight = c.heightIn > 0;
    var nextWk = D.nextScan.recommendedWeekOf;
    var setWith = D.goals[0] ? 'Set with ' + esc(D.goals[0].setWith) + ' on ' + esc(fmtShort(D.goals[0].setOn)) : '';
    return shell('profile',
      pageHead({
        view: 'profile',
        avatar: initials(c),
        eyebrow: 'Profile',
        title: c.firstName + ' ' + c.lastName,
        sub: 'Member since ' + fmtDate(c.memberSince, { month: 'long', year: 'numeric' }) + ' · ' + D.scans.length + (D.scans.length === 1 ? ' scan' : ' scans'),
        badge: 'Member since ' + fmtDate(c.memberSince, { month: 'short', year: 'numeric' }),
        chips: ['Member since ' + fmtDate(c.memberSince, { month: 'short', year: 'numeric' }), D.scans.length + ' visits', appointment() ? 'Next visit ' + fmtShort(appointment().date) : (nextWk ? 'Next scan week of ' + fmtShort(nextWk) : 'First scan not booked yet')]
      }) +
      '<div class="profile-grid">' +
        '<section class="stack-lg"><div class="row" style="align-items:baseline"><h2 class="h2">Your goals</h2><a href="#/profile" class="strong" style="font-size:14px;min-height:44px;display:flex;align-items:center">Edit</a></div>' +
        '<p class="small muted" style="margin-top:-8px">' + setWith + '</p>' + (goals || '<div class="card"><p class="muted">You’ll set your goals with Amber at your first scan.</p></div>') + '</section>' +
        '<div class="stack-lg"><h2 class="h2">Account</h2><dl class="list" style="margin:0">' +
          '<div class="kv"><dt>Email</dt><dd>' + esc(c.email) + '</dd></div>' +
          '<div class="kv"><dt>Mobile phone</dt><dd>' + (c.phone ? esc(c.phone) : '<span class="muted">Not added</span>') + '</dd></div>' +
          '<div class="kv"><dt>Home address</dt><dd>' + (c.address ? esc(c.address) : '<span class="muted">Not added</span>') + '</dd></div>' +
          '<div class="kv"><dt>Date of birth</dt><dd>' + esc(fmtDate(c.dateOfBirth)) + '</dd></div>' +
          '<div class="kv"><dt>Height</dt><dd>' + (hasHeight ? ft + '′ ' + inch + '″' : '<span class="muted">Measured at your first scan</span>') + '</dd></div>' +
          '<div class="kv"><dt>Studio</dt><dd>' + esc(c.studio) + '</dd></div>' +
          (appointment() ? '<div class="kv"><dt>Next visit</dt><dd><a href="#/appointment">' + esc(fmtLong(appointment().date) + ' · ' + appointment().time) + '</a></dd></div>' : '') +
        '</dl>' +
        commPrefs() +
        '<h2 class="h2" style="margin-top:10px">Account settings</h2>' +
        '<nav class="list" aria-label="Account settings">' +
          '<a class="link-row" href="#/appointment">Upcoming appointment<span aria-hidden="true">→</span></a>' +
          '<a class="link-row" href="#/receipts">Receipts &amp; Superbills<span aria-hidden="true">→</span></a>' +
          '<a class="link-row" href="#/profile">Privacy and your data<span aria-hidden="true">→</span></a>' +
          '<a class="link-row" href="' + SITE_URL + '">Back to precisiondexa.com<span aria-hidden="true">↗</span></a>' +
          '<a class="link-row" href="#/signin" data-signout>Sign out<span aria-hidden="true">→</span></a>' +
        '</nav></div>' +
      '</div>'
    );
  }

  /** Communication preferences: marketing email and SMS, both opt-in, each change logged with time and text version. */
  function commPrefs() {
    var a = state.account, C = a.consents, phone = a.phone;
    var em = C.marketingEmail, sm = C.sms;
    function row(key, title, desc, rec, extra, disabled) {
      return '<div class="comm-row">' +
        '<div class="comm-text">' +
          '<span class="strong" id="pref-' + key + '-l">' + title + '</span>' +
          '<span class="small muted" id="pref-' + key + '-d">' + desc + '</span>' +
          (extra || '') +
          '<span class="comm-stamp" id="pref-' + key + '-u">' + (rec.granted ? 'On' : 'Off') + ' · Updated ' + esc(fmtStamp(rec.at)) + '</span>' +
        '</div>' +
        '<button type="button" class="switch switch-lg" role="switch" aria-checked="' + !!rec.granted + '" aria-labelledby="pref-' + key + '-l" aria-describedby="pref-' + key + '-d pref-' + key + '-u"' + (disabled ? ' disabled' : '') + ' data-pref="' + key + '" id="pref-' + key + '"><span></span></button>' +
      '</div>';
    }
    var smsExtra = phone ?
      '<span class="fine">' + esc(CONSENT_TEXT.smsDisclosure) + '</span>' :
      '<span class="fine">Add a mobile number to turn on texts.</span>' +
      '<form class="add-phone" id="add-phone" novalidate><div class="field"><label for="pp-phone">Mobile phone</label><input id="pp-phone" type="tel" inputmode="tel" autocomplete="tel-national" placeholder="(360) 555-0100" aria-describedby="pp-phone-err" aria-invalid="false"><p class="err" id="pp-phone-err"></p></div><button class="btn btn-sm btn-ghost" type="submit">Save number</button></form>';
    return '<section class="stack-lg comm" aria-labelledby="comm-h">' +
      '<h2 class="h2" id="comm-h" style="margin-top:10px">Communication preferences</h2>' +
      '<div class="list">' +
        row('marketingEmail', 'Email updates', 'Updates, scan reminders and offers from Precision Dexa. Unsubscribe anytime.', em) +
        row('sms', 'Text messages', 'Appointment reminders and updates' + (phone ? ' to ' + esc(phone) : '') + '.', sm, smsExtra, !phone) +
      '</div>' +
      '<p class="small muted">We’ll still email you about your account, like sign-in help and new results.</p>' +
      '<dl class="list consent-list" style="margin:0">' +
        '<div class="kv"><dt>Terms and Privacy</dt><dd>Agreed ' + esc(fmtStamp(C.terms.at)) + '</dd></div>' +
        '<div class="kv"><dt>Health data consent</dt><dd>Given ' + esc(fmtStamp(C.healthData.at)) + '</dd></div>' +
      '</dl>' +
      '<p class="small muted">To withdraw your health data consent or ask us to delete your data, contact the studio. Read the <a href="#/health-privacy">Consumer Health Data Privacy Policy</a>.</p>' +
      '<p class="small strong" id="pref-status" role="status"></p>' +
    '</section>';
  }

  var STUDIO_NAME = 'Precision Dexa';
  var STUDIO_ADDRESS = 'Suite 14, 19550 SE Brady Rd, Camas WA';
  var RECORDS_LINE = 'Download itemized receipts and superbills for your records.';
  var REIMBURSE_NOTE = 'Submit to your insurer for possible reimbursement.';
  var CPT_NOTE = '[PLACEHOLDER, confirm with billing]';

  function money(n) { return '$' + Number(n).toFixed(2); }
  function visits() {
    return (state.data.scans || []).map(function (s) {
      var b = s.billing || {};
      return {
        id: s.id,
        date: s.date,
        service: b.service || 'DEXA Body Composition scan',
        amount: b.amountPaid,
        amountNote: b.amountNote || '',
        paymentMethod: b.paymentMethod || '[PLACEHOLDER]',
        orderingProvider: b.orderingProvider || '[PLACEHOLDER]'
      };
    });
  }
  function findVisit(id) {
    var list = visits();
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }
  function docRow(label, value) {
    return '<div class="doc-row"><dt>' + esc(label) + '</dt><dd>' + value + '</dd></div>';
  }
  function docActions() {
    return '<div class="doc-actions no-print">' +
      '<button type="button" class="btn btn-primary" data-print>Print or save as PDF</button>' +
      '<a class="btn btn-ghost" href="#/receipts">Back to receipts</a>' +
    '</div>';
  }
  function receiptHtml(v, c) {
    return '<p class="eyebrow">Itemized receipt</p>' +
      '<div class="doc-brand"><img src="' + asset('precision-dexa-logo.svg') + '" alt=""><div><p class="strong">' + esc(STUDIO_NAME) + '</p><p class="small">' + esc(STUDIO_ADDRESS) + '</p></div></div>' +
      '<p class="preview-flag">Preview, sample data</p>' +
      '<dl class="doc-grid">' +
        docRow('Patient', esc(c.firstName + ' ' + c.lastName)) +
        docRow('Date of service', esc(fmtLong(v.date))) +
        docRow('Service', esc(v.service)) +
        docRow('Amount', v.amount == null ? '[PLACEHOLDER]' : esc(money(v.amount))) +
        docRow('Payment method', esc(v.paymentMethod)) +
        docRow('Ordering provider', esc(v.orderingProvider)) +
      '</dl>' +
      (v.amountNote ? '<p class="doc-note">' + esc(v.amountNote) + '</p>' : '') +
      '<p class="doc-note">' + esc(RECORDS_LINE) + '</p>';
  }
  function superbillHtml(v, c) {
    return '<p class="eyebrow">Superbill</p>' +
      '<div class="doc-brand"><img src="' + asset('precision-dexa-logo.svg') + '" alt=""><div><p class="strong">' + esc(STUDIO_NAME) + '</p><p class="small">' + esc(STUDIO_ADDRESS) + '</p></div></div>' +
      '<p class="preview-flag">Preview, sample data</p>' +
      '<dl class="doc-grid">' +
        docRow('Patient', esc(c.firstName + ' ' + c.lastName)) +
        docRow('Date of birth', esc(fmtDate(c.dateOfBirth))) +
        docRow('Phone', c.phone ? esc(c.phone) : '[PLACEHOLDER]') +
        docRow('Date of service', esc(fmtLong(v.date))) +
        docRow('Service', esc(v.service)) +
        docRow('Ordering provider', esc(v.orderingProvider)) +
        docRow('NPI', '[PLACEHOLDER]') +
        docRow('Business tax ID', '[PLACEHOLDER]') +
        docRow('ICD-10 code', '[PLACEHOLDER]') +
      '</dl>' +
      '<h2 class="h2" style="font-size:22px">Procedure codes</h2>' +
      '<ul class="doc-codes">' +
        '<li><span class="strong">77080</span> DXA bone density, axial <span class="doc-ph">' + esc(CPT_NOTE) + '</span></li>' +
        '<li><span class="strong">76499</span> Unlisted procedure, often used for DXA body composition <span class="doc-ph">' + esc(CPT_NOTE) + '</span></li>' +
      '</ul>' +
      '<p class="doc-note">' + esc(REIMBURSE_NOTE) + '</p>' +
      '<p class="doc-note">' + esc(RECORDS_LINE) + '</p>';
  }
  function viewReceipts(id, kind) {
    if (!state.data.scans) state.data.scans = [];
    if (id && (kind === 'receipt' || kind === 'superbill')) {
      var v = findVisit(id);
      if (!v) return shell('receipts', '<section class="stack"><h1 class="title">We couldn’t find that visit</h1><p><a class="strong" href="#/receipts">Back to receipts</a></p></section>');
      var inner = kind === 'superbill' ? superbillHtml(v, state.data.client) : receiptHtml(v, state.data.client);
      return shell('receipts', '<article class="doc-sheet">' + inner + docActions() + '</article>');
    }
    var list = visits();
    var cards = list.length ? list.map(function (v) {
      return '<article class="card visit-card">' +
        '<div class="row" style="align-items:baseline"><h2 class="h2" style="font-size:22px">' + esc(fmtDate(v.date)) + '</h2><span class="small muted">Date of service</span></div>' +
        '<p>' + esc(v.service) + '</p>' +
        '<p class="small muted">' + (v.amount == null ? '' : esc(money(v.amount)) + ' · ') + esc(v.paymentMethod) + '</p>' +
        '<div class="doc-actions">' +
          '<a class="btn btn-primary" href="#/receipts/' + esc(v.id) + '/receipt">Download itemized receipt</a>' +
          '<a class="btn btn-ghost" href="#/receipts/' + esc(v.id) + '/superbill">Download superbill</a>' +
        '</div></article>';
    }).join('') : '<div class="card"><p>Your receipts and superbills will appear here after your first scan. Each document lists that scan’s date of service.</p></div>';
    return shell('receipts',
      pageHead({ view: 'receipts', eyebrow: 'Billing', title: 'Receipts & Superbills', sub: 'Sample documents for this preview. Nothing here is sent to a bank or an insurer.', badge: list.length ? (list.length + (list.length === 1 ? ' visit' : ' visits')) : 'No visits yet' }) +
      '<p class="small muted">' + esc(RECORDS_LINE) + '</p>' +
      '<div class="visit-list">' + cards + '</div>'
    );
  }

  function viewAppointment() {
    var ap = appointment();
    if (!ap) return shell('home', '<section class="stack"><h1 class="title">No visit is scheduled</h1><p class="muted"><a href="#/">Back to your dashboard</a></p></section>');
    return shell('home',
      pageHead({
        view: 'appointment',
        eyebrow: ap.status,
        title: 'Your upcoming visit',
        sub: ap.note,
        badge: fmtDate(ap.date, { month: 'short', day: 'numeric', year: 'numeric' }),
        chips: [ap.time, ap.service]
      }) +
      '<section class="card accent stack-lg">' +
        '<p class="eyebrow">Sample appointment</p>' +
        '<h2 class="h2">' + esc(fmtLong(ap.date)) + '</h2>' +
        '<dl class="list" style="margin:0">' +
          '<div class="kv"><dt>Time</dt><dd>' + esc(ap.time) + '</dd></div>' +
          '<div class="kv"><dt>Service</dt><dd>' + esc(ap.service) + '</dd></div>' +
          '<div class="kv"><dt>With</dt><dd>' + esc(ap.with) + '</dd></div>' +
          '<div class="kv"><dt>Where</dt><dd>' + esc(ap.place) + '</dd></div>' +
          '<div class="kv"><dt>Status</dt><dd>' + esc(ap.status) + '</dd></div>' +
        '</dl>' +
        '<p>Wear comfortable clothes without metal. Come well hydrated, at a similar time of day to your last body composition scan, so the comparison stays fair.</p>' +
        '<p class="small muted">This is sample data. Nothing is sent to a booking system.</p>' +
        '<a class="btn btn-outline" href="#/">Back to your dashboard<span aria-hidden="true">→</span></a>' +
      '</section>'
    );
  }

  function viewNotFound() {
    return shell('home', '<section class="stack"><h1 class="title">We couldn’t find that page</h1><p class="muted"><a href="#/">Back to your dashboard</a></p></section>');
  }

  // ---------- Router ----------
  function route() {
    var parts = (location.hash.replace(/^#\/?/, '') || '').split('/');
    var page = parts[0] || '';
    var isAuthRoute = page === 'signin' || page === 'create-account';
    if (LEGAL[page]) {
      if (auth.open) closeAuth(false);
      app.innerHTML = viewLegal(page); window.scrollTo(0, 0);
      var lv = document.getElementById('view'); if (lv && route.ran) lv.focus({ preventScroll: true });
      route.ran = true; document.title = LEGAL[page][0] + ' · Precision Dexa';
      return;
    }
    if (!state.signedIn && !isAuthRoute) { location.replace('#/signin'); return; }
    if (state.signedIn && isAuthRoute) { location.replace('#/'); return; }
    if (!state.signedIn) {
      // Signed out: the page behind is the blurred portal preview; the modal opens on top automatically.
      app.innerHTML = viewSignedOut(); window.scrollTo(0, 0); route.ran = true;
      openAuth(page === 'create-account' ? 'create' : 'signin', document.querySelector('.tb-signin'));
      return;
    }
    if (state.data.isNew && page !== 'profile' && page !== 'receipts') {
      app.innerHTML = viewWelcome(page); window.scrollTo(0, 0);
      var wv = document.getElementById('view'); if (wv && route.ran) wv.focus({ preventScroll: true });
      route.ran = true; document.title = 'Welcome · Precision Dexa';
      return;
    }
    var html;
    switch (page) {
      case '': html = viewDashboard(); break;
      case 'progress': html = viewProgress(parts[1]); break;
      case 'history': html = viewHistory(); break;
      case 'scans': html = viewScan(decodeURIComponent(parts[1] || '')); break;
      case 'receipts': html = viewReceipts(parts[1], parts[2]); break;
      case 'appointment': html = viewAppointment(); break;
      case 'profile': html = viewProfile(); break;
      default: html = viewNotFound();
    }
    app.innerHTML = html;
    drawCharts();
    var main = document.getElementById('view');
    if (main && route.ran) main.focus({ preventScroll: true });
    window.scrollTo(0, 0);
    route.ran = true;
    document.title = ({ signin: 'Sign in', '': 'Dashboard', progress: 'Progress', history: 'Scan history', scans: 'Scan results', receipts: 'Receipts & Superbills', appointment: 'Upcoming appointment', profile: 'Profile' }[page] || 'Client portal') + ' · Precision Dexa';
  }

  // ---------- Events ----------
  app.addEventListener('click', function (e) {
    var seg = e.target.closest('[data-metric]');
    if (seg && seg.tagName === 'BUTTON') { location.hash = '#/progress/' + seg.getAttribute('data-metric'); return; }
    if (e.target.closest('[data-toggle-compare]')) {
      state.showCompare = !state.showCompare;
      state.open.compare = true; // keep the section open while toggling
      // Production: persist with PATCH /api/portal/me/preferences { showComparisons }
      var y = window.scrollY; route(); window.scrollTo(0, y);
      var sw = document.querySelector('[data-toggle-compare]'); if (sw) sw.focus();
      return;
    }
    var oa = e.target.closest('[data-open-auth]');
    if (oa) { openAuth(oa.getAttribute('data-open-auth'), oa); return; }
    var pref = e.target.closest('[data-pref]');
    if (pref) { togglePref(pref.getAttribute('data-pref')); return; }
    if (e.target.closest('[data-print]')) { window.print(); return; }
    if (e.target.closest('[data-signout]')) { signOut(); }
  });
  function rerenderKeepScroll(focusId) {
    var y = window.scrollY; route(); window.scrollTo(0, y);
    var el = focusId && document.getElementById(focusId); if (el) el.focus({ preventScroll: true });
  }
  function togglePref(key) {
    var a = state.account; if (!a) return;
    var cur = a.consents[key], on = !cur.granted, at = nowIso();
    if (key === 'sms' && on && !a.phone) return;
    var rec = consentRecord(on, at, key === 'sms' ? 'smsProfile' : 'marketingEmailProfile', key === 'sms' ? { phone: on ? a.phone : null, disclosure: CONSENT_TEXT.smsDisclosure } : null);
    a.consents[key] = rec; a.consentVersion = CONSENT_VERSION;
    logConsent(a, key, rec, 'profile');
    // Production: PATCH /api/portal/me/consents { type, granted, version } and sync the email/SMS provider (suppression lists, STOP).
    putAccount(a);
    rerenderKeepScroll('pref-' + key);
    var st = document.getElementById('pref-status');
    if (st) st.textContent = (key === 'sms' ? 'Text messages' : 'Email updates') + ' turned ' + (on ? 'on' : 'off') + '.';
  }
  // Remember open/closed collapsibles across re-renders ('toggle' does not bubble, so listen in capture).
  app.addEventListener('toggle', function (e) {
    var f = e.target && e.target.getAttribute && e.target.getAttribute('data-fold');
    if (f) state.open[f] = e.target.open;
  }, true);
  // Profile: add a mobile number so texts can be turned on.
  app.addEventListener('submit', function (e) {
    if (e.target.id !== 'add-phone') return;
    e.preventDefault();
    var inp = e.target.querySelector('#pp-phone');
    if (!setErr(inp, validPhone(inp.value) ? '' : 'Enter a 10-digit US mobile number, like (360) 555-0100.')) { inp.focus(); return; }
    state.account.phone = fmtPhone(phoneDigits(inp.value)); state.data.client.phone = state.account.phone;
    putAccount(state.account);
    rerenderKeepScroll('pref-sms');
    var st = document.getElementById('pref-status'); if (st) st.textContent = 'Mobile number saved. You can now turn on text messages.';
  });
  var resizeTimer;
  window.addEventListener('resize', function () { clearTimeout(resizeTimer); resizeTimer = setTimeout(drawCharts, 120); });
  window.addEventListener('hashchange', route);

  // ---------- Boot ----------
  fetch(DATA_URL, { credentials: 'same-origin' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (data) {
      data.scans.sort(function (a, b) { return a.date < b.date ? 1 : -1; }); // newest first
      state.sample = data;
      seedDemo(data);
      // Restore this tab's session (mock). Opt-in: comparisons stay hidden unless the client turned them on (signInAs).
      var acct = getAccount(sessionGet(SESSION_KEY));
      if (acct) signInAs(acct);
      route();
    })
    .catch(function () {
      app.innerHTML = '<p class="loading">We couldn’t load your results right now. Please refresh, or call the studio if this keeps happening.</p>';
    });
})();
