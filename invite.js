/* ============================================================
   ПРИГЛАСИТЕЛЬНЫЙ — interactions
   ============================================================ */
(function () {
  'use strict';

  /* ---------- parallax for photo backgrounds ---------- */
  var parallaxBgs = document.querySelectorAll('.scene-bg');
  function updateParallax() {
    var wh = window.innerHeight;
    parallaxBgs.forEach(function(bg) {
      var section = bg.parentElement;
      var rect = section.getBoundingClientRect();
      var rel = (rect.top + rect.height / 2 - wh / 2) / wh;
      bg.style.transform = 'translateY(' + (rel * 24) + 'px)';
    });
  }
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.addEventListener('scroll', updateParallax, { passive: true });
    updateParallax();
  }

  /* ---------- background audio ---------- */
  var signalAudio = document.getElementById('signal-audio');
  var audioToggle = document.getElementById('audio-toggle');

  function showAudioToggle() {
    if (audioToggle) audioToggle.classList.add('show');
  }

  function hideAudioToggle() {
    if (audioToggle) audioToggle.classList.remove('show');
  }

  function playSignal() {
    if (!signalAudio) return;
    signalAudio.volume = 0.45;
    var playPromise = signalAudio.play();
    if (playPromise && playPromise.then) {
      playPromise.then(hideAudioToggle).catch(showAudioToggle);
    }
  }

  if (signalAudio) {
    playSignal();
    window.addEventListener('pointerdown', playSignal, { once: true });
    if (audioToggle) audioToggle.addEventListener('click', playSignal);
  }

  /* ---------- scroll reveal ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          // fire a glitch pass on any glitch element revealed
          var g = e.target.classList.contains('glitch')
            ? e.target
            : e.target.querySelector('.glitch');
          if (g) fireGlitch(g);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- glitch trigger ---------- */
  function fireGlitch(el) {
    el.classList.remove('go');
    // force reflow so animation restarts
    void el.offsetWidth;
    el.classList.add('go');
    setTimeout(function () { el.classList.remove('go'); }, 1560);
  }

  // occasional ambient glitch on visible glitch titles
  var glitches = Array.prototype.slice.call(document.querySelectorAll('.glitch'));
  function ambientGlitch() {
    var visible = glitches.filter(function (el) {
      var r = el.getBoundingClientRect();
      return r.top < window.innerHeight * 0.9 && r.bottom > window.innerHeight * 0.1;
    });
    if (visible.length) {
      fireGlitch(visible[Math.floor(Math.random() * visible.length)]);
    }
    setTimeout(ambientGlitch, 2200 + Math.random() * 3600);
  }
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setTimeout(ambientGlitch, 2600);
  }

  /* ---------- parallax on bg images (desktop only) ---------- */
  var isMobile = 'ontouchstart' in window || window.innerWidth < 768;
  if (!isMobile && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var bgImgs = document.querySelectorAll('.scene-bg img');
    window.addEventListener('scroll', function () {
      bgImgs.forEach(function (img) {
        var section = img.closest('.scene');
        var rect = section.getBoundingClientRect();
        var viewH = window.innerHeight;
        // only move when section is in view
        if (rect.bottom < 0 || rect.top > viewH) return;
        var progress = (viewH - rect.top) / (viewH + rect.height);
        var offset = (progress - 0.5) * 80;
        img.style.transform = 'translateY(' + offset + 'px)';
      });
    }, { passive: true });
  }

  /* ---------- viewport-controlled background videos ---------- */
  var bgVideos = document.querySelectorAll('.video-bg video');
  if (bgVideos.length && 'IntersectionObserver' in window) {
    var videoIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var video = entry.target;
        if (entry.isIntersecting) {
          var playPromise = video.play();
          if (playPromise && playPromise.catch) playPromise.catch(function () {});
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.35 });

    bgVideos.forEach(function (video) { videoIo.observe(video); });
  }

  /* ---------- countdown to 13.06.2026 16:00 ---------- */
  var TARGET = new Date(2026, 5, 13, 16, 0, 0).getTime(); // month is 0-indexed (5 = June)
  var el_d = document.getElementById('cd-d');
  var el_h = document.getElementById('cd-h');
  var el_m = document.getElementById('cd-m');
  var el_s = document.getElementById('cd-s');

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function tick() {
    var diff = TARGET - Date.now();
    if (diff <= 0) {
      if (el_d) { el_d.textContent = '00'; el_h.textContent = '00'; el_m.textContent = '00'; el_s.textContent = '00'; }
      var cd = document.getElementById('countdown');
      if (cd && !cd.dataset.open) {
        cd.dataset.open = '1';
        cd.innerHTML = '<div style="font-family:Oswald,sans-serif;font-weight:700;font-size:clamp(22px,7vw,40px);letter-spacing:.08em;text-transform:uppercase" class="neon-pink">ПОРТАЛ ОТКРЫТ</div>';
      }
      return;
    }
    var s = Math.floor(diff / 1000);
    var d = Math.floor(s / 86400); s -= d * 86400;
    var h = Math.floor(s / 3600);  s -= h * 3600;
    var m = Math.floor(s / 60);    s -= m * 60;
    if (el_d) {
      el_d.textContent = pad(d);
      el_h.textContent = pad(h);
      el_m.textContent = pad(m);
      el_s.textContent = pad(s);
    }
  }
  tick();
  setInterval(tick, 1000);

})();
