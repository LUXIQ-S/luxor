/* =============================================================
   FrameHeart — Main JavaScript
   =============================================================
   SECTIONS
   1. Loader
   2. Navigation (scroll effect + mobile drawer)
   3. Scroll reveal animations
   4. Carousel (arrows + dots + drag)
   5. Video modal
   6. File upload preview
   7. Request form validation & submission
   ============================================================= */


/* ─────────────────────────────────────────────────────────────
   1. LOADER
   Hides the loading screen after a short delay.
   🎨 Change the delay (ms) to lengthen/shorten the intro.
───────────────────────────────────────────────────────────── */
(function initLoader() {
  const loader = document.getElementById('loader');
  document.body.classList.add('is-loading');

  // Wait for fonts + minimum display time
  const minDelay = 1300; // milliseconds — edit me
  const start = Date.now();

  function hideLoader() {
    const elapsed = Date.now() - start;
    const wait = Math.max(0, minDelay - elapsed);

    setTimeout(() => {
      loader.classList.add('hidden');
      document.body.classList.remove('is-loading');

      // Remove from DOM after transition
      loader.addEventListener('transitionend', () => loader.remove(), { once: true });
    }, wait);
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(hideLoader);
  } else {
    window.addEventListener('load', hideLoader);
  }
})();


/* ─────────────────────────────────────────────────────────────
   2. NAVIGATION
   - Adds .scrolled class for glass shadow on scroll
   - Handles mobile hamburger + drawer
   - Closes drawer when a link is clicked
───────────────────────────────────────────────────────────── */
(function initNav() {
  const nav        = document.getElementById('nav');
  const hamburger  = document.getElementById('hamburger');
  const drawer     = document.getElementById('navDrawer');
  const drawerLinks = document.querySelectorAll('.drawer-link');

  // Scroll effect
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  // Hamburger toggle
  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    drawer.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
  });

  // Close drawer on link click
  drawerLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      drawer.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  // Close drawer on outside click
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) {
      hamburger.classList.remove('open');
      drawer.classList.remove('open');
    }
  });
})();


/* ─────────────────────────────────────────────────────────────
   3. SCROLL REVEAL ANIMATIONS
   Elements with class .reveal fade in when they enter the
   viewport. Uses IntersectionObserver for performance.
   🎨 Adjust threshold (0–1) to trigger earlier/later.
───────────────────────────────────────────────────────────── */
(function initReveal() {
  const elements = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window)) {
    // Fallback: show everything immediately
    elements.forEach(el => el.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target); // animate once only
      }
    });
  }, {
    threshold: 0.12,    // 🎨 edit: 0 = as soon as 1px visible, 1 = fully visible
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(el => observer.observe(el));
})();


/* ─────────────────────────────────────────────────────────────
   4. CAROUSEL
   - Arrow button scroll
   - Touch/mouse drag to scroll
   - Auto-generates dot indicators
   - Updates active dot on scroll
───────────────────────────────────────────────────────────── */
(function initCarousel() {
  const track     = document.getElementById('carouselTrack');
  const arrowLeft = document.getElementById('arrowLeft');
  const arrowRight= document.getElementById('arrowRight');
  const dotsWrap  = document.getElementById('carouselDots');

  if (!track) return;

  const cards = track.querySelectorAll('.video-card');
  const cardCount = cards.length;

  // ── Dot generation ─────────────────────────────────────
  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.addEventListener('click', () => scrollToCard(i));
    dotsWrap.appendChild(dot);
  });

  const dots = dotsWrap.querySelectorAll('.carousel-dot');

  function updateDots() {
    const scrollLeft = track.scrollLeft;
    const cardW = cards[0].offsetWidth + 24; // card width + gap
    const index = Math.round(scrollLeft / cardW);
    dots.forEach((d, i) => d.classList.toggle('active', i === index));
  }

  function scrollToCard(index) {
    const cardW = cards[0].offsetWidth + 24;
    track.scrollTo({ left: cardW * index, behavior: 'smooth' });
  }

  // ── Arrow buttons ───────────────────────────────────────
  function scrollByCards(direction) {
    const cardW = cards[0].offsetWidth + 24;
    track.scrollBy({ left: cardW * direction, behavior: 'smooth' });
  }

  arrowLeft.addEventListener('click',  () => scrollByCards(-1));
  arrowRight.addEventListener('click', () => scrollByCards(1));

  // ── Update dots on scroll ───────────────────────────────
  track.addEventListener('scroll', updateDots, { passive: true });

  // ── Mouse drag to scroll ────────────────────────────────
  let isDown  = false;
  let startX  = 0;
  let scrollL = 0;

  track.addEventListener('mousedown', (e) => {
    isDown  = true;
    startX  = e.pageX - track.offsetLeft;
    scrollL = track.scrollLeft;
    track.style.cursor = 'grabbing';
  });

  track.addEventListener('mouseleave', () => {
    isDown = false;
    track.style.cursor = '';
  });

  track.addEventListener('mouseup', () => {
    isDown = false;
    track.style.cursor = '';
  });

  track.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x    = e.pageX - track.offsetLeft;
    const walk = (x - startX) * 1.4;
    track.scrollLeft = scrollL - walk;
  });
})();


/* ─────────────────────────────────────────────────────────────
   5. VIDEO MODAL
   Opens when a video card is clicked.
   Supports YouTube embeds and local .mp4 files.
   Closes on overlay click, close button, or Escape key.
───────────────────────────────────────────────────────────── */
(function initModal() {
  const overlay  = document.getElementById('modalOverlay');
  const player   = document.getElementById('modalPlayer');
  const closeBtn = document.getElementById('modalClose');

  if (!overlay) return;

  // Open modal
  function openModal(videoUrl, type) {
    player.innerHTML = '';

    if (type === 'youtube') {
      // Add autoplay + allow fullscreen
      const iframe = document.createElement('iframe');
      iframe.src = videoUrl + '?autoplay=1&rel=0&modestbranding=1';
      iframe.allow = 'autoplay; fullscreen; picture-in-picture';
      iframe.allowFullscreen = true;
      player.appendChild(iframe);
    } else if (type === 'mp4') {
      const video = document.createElement('video');
      video.src = videoUrl;
      video.controls = true;
      video.autoplay = true;
      video.style.width  = '100%';
      video.style.height = '100%';
      player.appendChild(video);
    }

    overlay.hidden = false;
    document.body.style.overflow = 'hidden';

    // Trigger animation on next frame
    requestAnimationFrame(() => overlay.classList.add('visible'));
  }

  // Close modal
  function closeModal() {
    overlay.classList.remove('visible');
    document.body.style.overflow = '';

    overlay.addEventListener('transitionend', () => {
      overlay.hidden = true;
      player.innerHTML = ''; // stop video / iframe
    }, { once: true });
  }

  // Bind cards
  document.querySelectorAll('.video-card').forEach(card => {
    card.addEventListener('click', () => {
      const url  = card.dataset.video;
      const type = card.dataset.type || 'youtube';
      if (url) openModal(url, type);
    });

    // Keyboard accessibility
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });

  // Close triggers
  closeBtn.addEventListener('click', closeModal);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !overlay.hidden) closeModal();
  });
})();


/* ─────────────────────────────────────────────────────────────
   6. FILE UPLOAD PREVIEW
   Shows a thumbnail preview when the user selects a photo.
   Also supports drag-and-drop onto the upload zone.
───────────────────────────────────────────────────────────── */
(function initFileUpload() {
  const zone       = document.getElementById('fileZone');
  const input      = document.getElementById('photoUpload');
  const preview    = document.getElementById('filePreview');
  const previewImg = document.getElementById('filePreviewImg');
  const removeBtn  = document.getElementById('fileRemove');
  const uploadUI   = zone && zone.querySelector('.file-upload-ui');

  if (!zone || !input) return;

  function showPreview(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    previewImg.src = url;
    preview.hidden = false;
    uploadUI.style.display = 'none';
    input.style.display = 'none'; // hide invisible input overlay
  }

  function clearPreview() {
    preview.hidden = true;
    uploadUI.style.display = '';
    input.style.display = '';
    previewImg.src = '';
    input.value = '';
  }

  // File input change
  input.addEventListener('change', () => {
    if (input.files[0]) showPreview(input.files[0]);
  });

  // Remove button
  removeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    clearPreview();
  });

  // Drag-and-drop
  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    zone.classList.add('dragover');
  });

  zone.addEventListener('dragleave', () => {
    zone.classList.remove('dragover');
  });

  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) {
      // Assign to input for form data (if supported)
      try {
        const dt = new DataTransfer();
        dt.items.add(file);
        input.files = dt.files;
      } catch (_) {}
      showPreview(file);
    }
  });
})();


/* ─────────────────────────────────────────────────────────────
   7. REQUEST FORM — Validation & Submission
   Validates required fields, shows inline errors.
   On valid submit, shows a success message.

   🚀 CONNECT TO BACKEND:
   Replace the fake submit block (marked below) with a real
   fetch() call to your API endpoint or form service
   (e.g. Formspree, EmailJS, your own server).
───────────────────────────────────────────────────────────── */
(function initForm() {
  const form       = document.getElementById('requestForm');
  const submitBtn  = document.getElementById('submitBtn');
  const successMsg = document.getElementById('formSuccess');

  if (!form) return;

  // Fields to validate: [id, validation function, error message]
  const fields = [
    {
      id: 'yourName',
      validate: v => v.trim().length >= 2,
    },
    {
      id: 'recipientName',
      validate: v => v.trim().length >= 1,
    },
    {
      id: 'email',
      validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
    },
    {
      id: 'occasion',
      validate: v => v !== '',
    },
    {
      id: 'message',
      validate: v => v.trim().length >= 10,
    },
  ];

  function validateField(fieldConfig) {
    const el  = document.getElementById(fieldConfig.id);
    const err = el && el.parentElement.querySelector('.form-error');
    const valid = fieldConfig.validate(el ? el.value : '');

    if (el) el.classList.toggle('error', !valid);
    if (err) err.classList.toggle('visible', !valid);

    return valid;
  }

  // Real-time validation on blur
  fields.forEach(fc => {
    const el = document.getElementById(fc.id);
    if (el) {
      el.addEventListener('blur', () => validateField(fc));
      el.addEventListener('input', () => {
        // Clear error as soon as user types
        if (fc.validate(el.value)) {
          el.classList.remove('error');
          const err = el.parentElement.querySelector('.form-error');
          if (err) err.classList.remove('visible');
        }
      });
    }
  });

  // Submit handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate all fields
    const allValid = fields.map(validateField).every(Boolean);
    if (!allValid) {
      // Scroll to first error
      const firstErr = form.querySelector('.error');
      if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // ── Loading state ─────────────────────────────────────
    submitBtn.classList.add('loading');

    // ── Collect form data ──────────────────────────────────
    const formData = new FormData(form);

    /* ════════════════════════════════════════════════════════
       🚀 CONNECT YOUR BACKEND HERE
       Replace everything in this try block with your own
       fetch() or API call.

       Example with Formspree:
       const res = await fetch('https://formspree.io/f/YOUR_ID', {
         method: 'POST',
         body: formData,
         headers: { 'Accept': 'application/json' }
       });
       if (!res.ok) throw new Error('Server error');

       Example with EmailJS:
       await emailjs.sendForm('SERVICE_ID', 'TEMPLATE_ID', form);
    ════════════════════════════════════════════════════════ */
    try {
      // SIMULATED DELAY — remove this in production
      await new Promise(resolve => setTimeout(resolve, 1800));

      // Log data for development (remove in production)
      console.log('Form submitted:');
      for (const [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value);
      }

      // ── Success ──────────────────────────────────────────
      submitBtn.classList.remove('loading');
      form.style.display = 'none';
      successMsg.hidden = false;

    } catch (err) {
      // ── Error ────────────────────────────────────────────
      submitBtn.classList.remove('loading');
      console.error('Submit error:', err);
      alert('Sorry, something went wrong. Please try again or email us directly.');
    }
  });
})();

/* ─────────────────────────────────────────────────────────────
   SMOOTH ANCHOR LINKS
   Handles any <a href="#..."> with smooth scrolling.
───────────────────────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
