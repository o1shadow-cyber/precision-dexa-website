(function () {
  if (window.__pdxSoon) return;
  window.__pdxSoon = true;

  var style = document.createElement('style');
  style.textContent = [
    '#pdx-soon{border:0;padding:0;background:transparent;width:min(440px,calc(100vw - 32px));max-height:calc(100vh - 32px);color:#33424C}',
    '#pdx-soon::backdrop{background:rgba(13,59,102,.55)}',
    '#pdx-soon .pdx-soon-card{position:relative;background:#F7F7F5;border-top:3px solid #C6B18E;padding:40px 36px 32px;max-height:calc(100vh - 32px);overflow:auto}',
    '#pdx-soon h2{margin:0 36px 0 0;font:400 clamp(30px,4vw,36px)/1.15 Georgia,serif;color:#0D3B66}',
    '#pdx-soon p{margin:16px 0 0;font:400 16.5px/1.65 Inter,system-ui,sans-serif;color:#33424C}',
    '#pdx-soon .pdx-soon-actions{display:flex;flex-wrap:wrap;gap:14px 22px;align-items:center;margin-top:28px}',
    '#pdx-soon .pdx-soon-join{display:inline-block;background:#0D3B66;color:#F7F7F5;padding:16px 26px;font:500 12.5px/1 Inter,system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;text-decoration:none}',
    '#pdx-soon .pdx-soon-join:hover{background:#C6B18E;color:#0D3B66}',
    '#pdx-soon .pdx-soon-later{background:none;border:0;padding:8px 0;font:500 14px/1 Inter,system-ui,sans-serif;color:#5A6068;cursor:pointer;text-decoration:underline;text-underline-offset:4px}',
    '#pdx-soon .pdx-soon-x{position:absolute;top:10px;right:10px;width:40px;height:40px;display:flex;align-items:center;justify-content:center;border:0;background:transparent;color:#0D3B66;cursor:pointer;padding:0}',
    '#pdx-soon a:focus-visible,#pdx-soon button:focus-visible{outline:2px solid #0D3B66;outline-offset:3px}',
    '@media (max-width:560px){#pdx-soon{width:calc(100vw - 24px)}#pdx-soon .pdx-soon-card{padding:36px 20px 24px}#pdx-soon .pdx-soon-actions{flex-direction:column;align-items:stretch}#pdx-soon .pdx-soon-join,#pdx-soon .pdx-soon-later{text-align:center}}'
  ].join('');
  document.head.appendChild(style);

  var waitlistHref = document.getElementById('waitlist') ? '#waitlist' : '/#waitlist';
  var dialog = document.createElement('dialog');
  dialog.id = 'pdx-soon';
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-labelledby', 'pdx-soon-title');
  dialog.setAttribute('aria-describedby', 'pdx-soon-body pdx-soon-offer');
  dialog.innerHTML =
    '<div class="pdx-soon-card">' +
      '<button type="button" class="pdx-soon-x" aria-label="Close">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"></path></svg>' +
      '</button>' +
      '<h2 id="pdx-soon-title">We\'re opening soon!</h2>' +
      '<p id="pdx-soon-body">Thank you so much for your interest in booking a scan. We\'re putting the finishing touches on the studio and can\'t wait to welcome you. Join our waitlist and you\'ll be among the first to book when we open, with early booking access for waitlist members.</p>' +
      '<p id="pdx-soon-offer">Join the waitlist by January 31, 2027 for 35% off. We\'ll email your code for single-scan early-customer pricing before we open.</p>' +
      '<div class="pdx-soon-actions">' +
        '<a class="pdx-soon-join" href="' + waitlistHref + '">Join the Waitlist</a>' +
        '<button type="button" class="pdx-soon-later">Maybe later</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(dialog);

  var lastFocus = null;

  function focusables() {
    return Array.prototype.slice.call(
      dialog.querySelectorAll('a[href], button:not([disabled])')
    ).filter(function (el) {
      return !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true';
    });
  }

  function openSoon(trigger) {
    if (typeof dialog.showModal !== 'function') return false;
    lastFocus = trigger && trigger.focus ? trigger : document.activeElement;
    if (!dialog.open) dialog.showModal();
    var closeBtn = dialog.querySelector('.pdx-soon-x');
    if (closeBtn) closeBtn.focus();
    return true;
  }

  function closeSoon() {
    if (dialog.open) dialog.close();
  }

  dialog.addEventListener('close', function () {
    if (lastFocus && typeof lastFocus.focus === 'function') {
      try { lastFocus.focus(); } catch (err) {}
    }
  });

  dialog.addEventListener('click', function (e) {
    if (e.target === dialog) closeSoon();
  });

  dialog.querySelector('.pdx-soon-x').addEventListener('click', closeSoon);
  dialog.querySelector('.pdx-soon-later').addEventListener('click', closeSoon);
  dialog.querySelector('.pdx-soon-join').addEventListener('click', closeSoon);

  document.addEventListener('keydown', function (e) {
    if (!dialog.open || e.key !== 'Tab') return;
    var items = focusables();
    if (!items.length) return;
    var first = items[0];
    var last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  document.addEventListener('click', function (e) {
    var link = e.target.closest && e.target.closest('[data-opening-soon]');
    if (!link) return;
    if (!openSoon(link)) return;
    e.preventDefault();
  }, true);

  document.addEventListener('pdx-open-soon', function () {
    openSoon(document.activeElement);
  });
})();
