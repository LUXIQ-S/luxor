/* =============================================================
   FrameHeart — Main JavaScript (CLEAN VERSION)
============================================================= */

/* ── 1. LOADER ── */
(function initLoader() {
  var loader = document.getElementById('loader');
  document.body.classList.add('is-loading');
  var minDelay = 1300;
  var start = Date.now();

  function hideLoader() {
    var elapsed = Date.now() - start;
    var wait = Math.max(0, minDelay - elapsed);
    setTimeout(function () {
      loader.classList.add('hidden');
      document.body.classList.remove('is-loading');
      loader.addEventListener('transitionend', function () { loader.remove(); }, { once: true });
    }, wait);
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(hideLoader);
  } else {
    window.addEventListener('load', hideLoader);
  }
  setTimeout(hideLoader, 3000);
})();

/* ── 2. NAVIGATION ── */
(function initNav() {
  var nav      = document.getElementById('nav');
  var burger   = document.getElementById('hamburger');
  var drawer   = document.getElementById('navDrawer');

  window.addEventListener('scroll', function () {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  burger.addEventListener('click', function () {
    var open = burger.classList.toggle('open');
    drawer.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
  });

  document.querySelectorAll('.drawer-link').forEach(function (link) {
    link.addEventListener('click', function () {
      burger.classList.remove('open');
      drawer.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('click', function (e) {
    if (!nav.contains(e.target)) {
      burger.classList.remove('open');
      drawer.classList.remove('open');
    }
  });
})();

/* ── 3. SMOOTH SCROLL ── */
document.querySelectorAll('a[href^="#"]').forEach(function (a) {
  a.addEventListener('click', function (e) {
    var target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ── 4. SCROLL REVEAL ── */
(function initReveal() {
  var els = document.querySelectorAll('.reveal');
  if (!window.IntersectionObserver) {
    els.forEach(function (el) { el.classList.add('in-view'); });
    return;
  }
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  els.forEach(function (el) { obs.observe(el); });
})();

/* ── 5. CAROUSEL ── */
(function initCarousel() {
  var track    = document.getElementById('carouselTrack');
  var lBtn     = document.getElementById('arrowLeft');
  var rBtn     = document.getElementById('arrowRight');
  var dotsWrap = document.getElementById('carouselDots');
  if (!track) return;

  var cards = track.querySelectorAll('.video-card');

  cards.forEach(function (_, i) {
    var d = document.createElement('button');
    d.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', 'Slide ' + (i + 1));
    d.addEventListener('click', function () { scrollTo(i); });
    dotsWrap.appendChild(d);
  });

  function getDots() { return dotsWrap.querySelectorAll('.carousel-dot'); }
  function cardW()   { return cards[0].offsetWidth + 24; }
  function scrollTo(i) { track.scrollTo({ left: cardW() * i, behavior: 'smooth' }); }
  function updateDots() {
    var idx = Math.round(track.scrollLeft / cardW());
    getDots().forEach(function (d, i) { d.classList.toggle('active', i === idx); });
  }

  lBtn.addEventListener('click', function () { track.scrollBy({ left: -cardW(), behavior: 'smooth' }); });
  rBtn.addEventListener('click', function () { track.scrollBy({ left:  cardW(), behavior: 'smooth' }); });
  track.addEventListener('scroll', updateDots, { passive: true });

  var down = false, startX = 0, scrollL = 0;
  track.addEventListener('mousedown', function (e) {
    down = true; startX = e.pageX - track.offsetLeft; scrollL = track.scrollLeft;
    track.classList.add('grabbing');
  });
  track.addEventListener('mouseleave', function () { down = false; track.classList.remove('grabbing'); });
  track.addEventListener('mouseup',    function () { down = false; track.classList.remove('grabbing'); });
  track.addEventListener('mousemove',  function (e) {
    if (!down) return;
    e.preventDefault();
    track.scrollLeft = scrollL - (e.pageX - track.offsetLeft - startX) * 1.4;
  });
})();

/* ── 6. VIDEO MODAL ── */
(function initModal() {
  var overlay  = document.getElementById('modalOverlay');
  var player   = document.getElementById('modalPlayer');
  var closeBtn = document.getElementById('modalClose');
  if (!overlay) return;

  function open(url, type) {
    player.innerHTML = '';
    if (type === 'youtube') {
      var iframe = document.createElement('iframe');
      iframe.src = url + '?autoplay=1&rel=0';
      iframe.allow = 'autoplay;fullscreen;picture-in-picture';
      iframe.allowFullscreen = true;
      player.appendChild(iframe);
    } else {
      var vid = document.createElement('video');
      vid.src = url; vid.controls = true; vid.autoplay = true;
      vid.style.cssText = 'width:100%;height:100%';
      player.appendChild(vid);
    }
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(function () { overlay.classList.add('visible'); });
  }

  function close() {
    overlay.classList.remove('visible');
    document.body.style.overflow = '';
    setTimeout(function () { overlay.hidden = true; player.innerHTML = ''; }, 400);
  }

  document.querySelectorAll('.video-card').forEach(function (card) {
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.addEventListener('click', function () {
      var url = card.dataset.video;
      var type = card.dataset.type || 'youtube';
      if (url) open(url, type);
    });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); }
    });
  });

  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !overlay.hidden) close(); });
})();

/* ── 7. FILE UPLOAD PREVIEW ── */
(function initFileUpload() {
  var zone    = document.getElementById('fileZone');
  var input   = document.getElementById('photoUpload');
  var preview = document.getElementById('filePreview');
  var img     = document.getElementById('filePreviewImg');
  var rmBtn   = document.getElementById('fileRemove');
  var ui      = zone && zone.querySelector('.file-upload-ui');
  if (!zone || !input) return;

  function show(file) {
    if (!file || !file.type.startsWith('image/')) return;
    img.src = URL.createObjectURL(file);
    preview.hidden = false;
    ui.style.display = 'none';
    input.style.display = 'none';
  }
  function clear() {
    preview.hidden = true;
    ui.style.display = '';
    input.style.display = '';
    img.src = '';
    input.value = '';
  }

  input.addEventListener('change', function () { if (input.files[0]) show(input.files[0]); });
  rmBtn.addEventListener('click',  function (e) { e.stopPropagation(); clear(); });

  zone.addEventListener('dragover',  function (e) { e.preventDefault(); zone.classList.add('dragover'); });
  zone.addEventListener('dragleave', function ()  { zone.classList.remove('dragover'); });
  zone.addEventListener('drop', function (e) {
    e.preventDefault(); zone.classList.remove('dragover');
    var file = e.dataTransfer.files[0];
    if (file) { try { var dt = new DataTransfer(); dt.items.add(file); input.files = dt.files; } catch (_) {} show(file); }
  });
})();

/* ── 8. FORM — SUBMIT LA SERVER ── */
(function initForm() {
  var form      = document.getElementById('requestForm');
  var btn       = document.getElementById('submitBtn');
  var successEl = document.getElementById('formSuccess');
  if (!form) return;

  // ✏️ Schimba URL-ul daca se schimba ngrok
  function sendToServer() {
    var formData = new FormData();
    formData.append('yourName',      document.getElementById('yourName').value);
    formData.append('email',         document.getElementById('email').value);
    formData.append('recipientName', document.getElementById('recipientName').value);
    formData.append('occasion',      document.getElementById('occasion').value);
    formData.append('message',       document.getElementById('message').value);

    fetch('https://formspree.io/f/xkoykkan', {
      method: 'POST',
      body: formData,
      headers: { 'Accept': 'application/json' }
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if(data.ok) {
        btn.classList.remove('loading');
        form.style.display = 'none';
        successEl.hidden = false;
      } else {
        throw new Error('Eroare');
      }
    })
    .catch(function(err) {
      btn.classList.remove('loading');
      alert('Ceva nu a mers. Încearcă din nou.');
    });
  }

  fields.forEach(function (fc) {
    var el = document.getElementById(fc.id);
    if (!el) return;
    el.addEventListener('blur',  function () { validate(fc); });
    el.addEventListener('input', function () {
      if (fc.ok(el.value)) {
        el.classList.remove('error');
        var err = el.parentElement.querySelector('.form-error');
        if (err) err.classList.remove('visible');
      }
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var allOk = fields.map(validate).every(Boolean);
    if (!allOk) {
      var first = form.querySelector('.error');
      if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    btn.classList.add('loading');
    sendToServer();
  });
})();

  fields.forEach(function (fc) {
    var el = document.getElementById(fc.id);
    if (!el) return;
    el.addEventListener('blur',  function () { validate(fc); });
    el.addEventListener('input', function () {
      if (fc.ok(el.value)) {
        el.classList.remove('error');
        var err = el.parentElement.querySelector('.form-error');
        if (err) err.classList.remove('visible');
      }
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var allOk = fields.map(validate).every(Boolean);
    if (!allOk) {
      var first = form.querySelector('.error');
      if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    btn.classList.add('loading');

    // Salvam fisierul pozei INAINTE de orice procesare
    var photoInput = document.getElementById('photoUpload');
    var photoFile  = photoInput && photoInput.files && photoInput.files[0] ? photoInput.files[0] : null;

    function sendToServer(base64Photo) {
      fetch(BACKEND + '/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          from_name:      document.getElementById('yourName').value,
          from_email:     document.getElementById('email').value,
          recipient_name: document.getElementById('recipientName').value,
          occasion:       document.getElementById('occasion').value,
          message:        document.getElementById('message').value,
          photo:          base64Photo || null
        })
      })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.success) {
          btn.classList.remove('loading');
          form.style.display = 'none';
          successEl.hidden = false;
        } else {
          throw new Error(data.error || 'Eroare server');
        }
      })
      .catch(function (err) {
        btn.classList.remove('loading');
        console.error('Backend error:', err);
        alert('Ceva nu a mers. Te rugăm încearcă din nou.');
      });
    }

    if (photoFile) {
      var reader = new FileReader();
      reader.onload  = function (ev) { sendToServer(ev.target.result); };
      reader.onerror = function ()   { sendToServer(null); };
      reader.readAsDataURL(photoFile);
    } else {
      sendToServer(null);
    }
  });
})();
