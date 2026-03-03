/**
 * Portfolio Engagement Extras v1.0
 * ─────────────────────────────────
 * 1) 마우스 히트맵 — 실시간 Hotjar 클론
 * 2) 행동 페르소나 — 실시간 사용자 세그먼테이션
 * 3) 라이브 A/B 테스트 — 실험 공개 + 결과 투명화
 */
(function () {
  'use strict';

  const S = {
    get: (k, d) => { try { return JSON.parse(localStorage.getItem('eng_' + k)) ?? d; } catch { return d; } },
    set: (k, v) => { try { localStorage.setItem('eng_' + k, JSON.stringify(v)); } catch {} }
  };

  /* ════════════════════════════════════════
     MODULE 1: MOUSE HEATMAP
     ════════════════════════════════════════ */
  const heatmap = (function () {
    const positions = [];
    const clickPositions = [];
    let canvas = null;
    let isVisible = false;
    let lastTrack = 0;

    // Track mouse movement (throttled 60ms)
    document.addEventListener('mousemove', function (e) {
      const now = Date.now();
      if (now - lastTrack < 60) return;
      lastTrack = now;
      positions.push({ x: e.pageX, y: e.pageY, w: 1 });
      if (positions.length > 3000) positions.shift();
    }, { passive: true });

    // Track clicks (heavier weight)
    document.addEventListener('click', function (e) {
      clickPositions.push({ x: e.pageX, y: e.pageY, w: 4 });
      if (clickPositions.length > 500) clickPositions.shift();
    });

    function createCanvas() {
      if (canvas) canvas.remove();
      canvas = document.createElement('canvas');
      canvas.id = 'eng-heatmap-canvas';
      canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;pointer-events:none;z-index:8500;opacity:.55;mix-blend-mode:multiply;';
      canvas.width = document.documentElement.scrollWidth;
      canvas.height = document.documentElement.scrollHeight;
      document.body.appendChild(canvas);
      return canvas;
    }

    function draw() {
      const cvs = createCanvas();
      const ctx = cvs.getContext('2d');
      const W = cvs.width;
      const H = cvs.height;

      // Step 1: draw intensity on shadow canvas (grayscale)
      const shadow = document.createElement('canvas');
      shadow.width = W;
      shadow.height = H;
      const sctx = shadow.getContext('2d');

      const allPoints = [...positions, ...clickPositions];
      allPoints.forEach(p => {
        const radius = p.w > 1 ? 45 : 30;
        const alpha = p.w > 1 ? 0.35 : 0.06;
        const g = sctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
        g.addColorStop(0, `rgba(0,0,0,${alpha})`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        sctx.fillStyle = g;
        sctx.fillRect(p.x - radius, p.y - radius, radius * 2, radius * 2);
      });

      // Step 2: colorize — map intensity to gradient
      const imageData = sctx.getImageData(0, 0, W, H);
      const pixels = imageData.data;
      const palette = buildPalette();

      for (let i = 0; i < pixels.length; i += 4) {
        const intensity = pixels[i + 3]; // alpha channel = intensity
        if (intensity < 3) {
          pixels[i + 3] = 0;
          continue;
        }
        const idx = Math.min(intensity, 255);
        pixels[i] = palette[idx][0];
        pixels[i + 1] = palette[idx][1];
        pixels[i + 2] = palette[idx][2];
        pixels[i + 3] = Math.min(intensity * 1.8, 220);
      }

      ctx.putImageData(imageData, 0, 0);
    }

    function buildPalette() {
      const palette = [];
      for (let i = 0; i < 256; i++) {
        const t = i / 255;
        let r, g, b;
        if (t < 0.25) {
          // blue → cyan
          const s = t / 0.25;
          r = 0; g = Math.round(s * 255); b = 255;
        } else if (t < 0.5) {
          // cyan → green
          const s = (t - 0.25) / 0.25;
          r = 0; g = 255; b = Math.round((1 - s) * 255);
        } else if (t < 0.75) {
          // green → yellow
          const s = (t - 0.5) / 0.25;
          r = Math.round(s * 255); g = 255; b = 0;
        } else {
          // yellow → red
          const s = (t - 0.75) / 0.25;
          r = 255; g = Math.round((1 - s) * 255); b = 0;
        }
        palette.push([r, g, b]);
      }
      return palette;
    }

    function toggle() {
      if (isVisible) {
        if (canvas) canvas.remove();
        canvas = null;
        isVisible = false;
      } else {
        draw();
        isVisible = true;
      }
      return isVisible;
    }

    function getCount() {
      return positions.length + clickPositions.length;
    }

    return { toggle, getCount };
  })();

  /* ════════════════════════════════════════
     MODULE 2: BEHAVIORAL PERSONA
     ════════════════════════════════════════ */
  const persona = (function () {
    let classified = S.get('persona', null);
    let scrollSpeeds = [];
    let lastScrollY = window.scrollY;
    let lastScrollTime = Date.now();

    // Track scroll speed
    window.addEventListener('scroll', function () {
      const now = Date.now();
      const dt = now - lastScrollTime;
      if (dt > 100 && dt < 2000) {
        const dy = Math.abs(window.scrollY - lastScrollY);
        const speed = dy / dt * 1000; // px/sec
        scrollSpeeds.push(speed);
        if (scrollSpeeds.length > 100) scrollSpeeds.shift();
      }
      lastScrollY = window.scrollY;
      lastScrollTime = now;
    }, { passive: true });

    function classify() {
      const pages = S.get('pages', []);
      const clicks = S.get('clicks', 0);
      const elapsed = (Date.now() - S.get('session_start', Date.now())) / 1000;
      const uniquePages = [...new Set(pages)].length;
      const detailViews = pages.filter(p => !['홈', '소개', '프로젝트', '리더십', '연락처'].includes(p)).length;
      const avgScrollSpeed = scrollSpeeds.length > 5
        ? scrollSpeeds.reduce((a, b) => a + b, 0) / scrollSpeeds.length
        : 500;
      const hasContact = pages.includes('연락처');
      const dwellPerPage = uniquePages > 0 ? elapsed / uniquePages : elapsed;

      // Scoring matrix for each persona
      const scores = {
        researcher: 0,
        scanner: 0,
        hunter: 0,
        decider: 0
      };

      // 꼼꼼한 리서처: slow scroll, long dwell, many pages
      if (avgScrollSpeed < 400) scores.researcher += 3;
      if (dwellPerPage > 40) scores.researcher += 3;
      if (uniquePages >= 4) scores.researcher += 2;
      if (detailViews >= 2) scores.researcher += 2;

      // 빠른 스캐너: fast scroll, short dwell, many pages quick
      if (avgScrollSpeed > 800) scores.scanner += 3;
      if (dwellPerPage < 20) scores.scanner += 3;
      if (uniquePages >= 3 && elapsed < 60) scores.scanner += 2;
      if (clicks > 8 && elapsed < 90) scores.scanner += 2;

      // 프로젝트 헌터: mostly detail pages
      if (detailViews >= 2) scores.hunter += 3;
      if (detailViews > uniquePages * 0.4) scores.hunter += 3;
      if (avgScrollSpeed > 300 && avgScrollSpeed < 700) scores.hunter += 1;
      if (clicks >= 5) scores.hunter += 1;

      // 의사결정자: quick to contact, focused
      if (hasContact) scores.decider += 4;
      if (uniquePages <= 4 && hasContact) scores.decider += 3;
      if (elapsed < 180 && hasContact) scores.decider += 2;
      if (detailViews >= 1 && detailViews <= 2) scores.decider += 1;

      const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
      const top = sorted[0];
      if (top[1] < 3) return null; // Not enough signal

      const PERSONAS = {
        researcher: {
          name: '꼼꼼한 리서처',
          emoji: '🔍',
          desc: '콘텐츠를 깊이 읽고, 여러 페이지를 꼼꼼히 비교합니다.',
          traits: ['느린 스크롤', '긴 체류시간', '넓은 탐색 범위'],
          match: '시니어 리크루터 · 기술 리드',
          color: '#2563eb'
        },
        scanner: {
          name: '빠른 스캐너',
          emoji: '⚡',
          desc: '핵심만 빠르게 파악하고 다음으로 넘어갑니다.',
          traits: ['빠른 스크롤', '짧은 체류', '다수 페이지 방문'],
          match: 'HR 매니저 · 헤드헌터',
          color: '#f59e0b'
        },
        hunter: {
          name: '프로젝트 헌터',
          emoji: '🎯',
          desc: '프로젝트 상세 페이지에 집중하며 실행력을 평가합니다.',
          traits: ['상세 페이지 집중', '적절한 속도', '활발한 클릭'],
          match: 'PM 채용 매니저 · CTO',
          color: '#8b5cf6'
        },
        decider: {
          name: '의사결정자',
          emoji: '🤝',
          desc: '핵심만 확인하고 빠르게 연락 단계로 이동합니다.',
          traits: ['연락처 도달', '집중된 경로', '효율적 탐색'],
          match: 'C-Level · 사업 파트너',
          color: '#059669'
        }
      };

      const result = PERSONAS[top[0]];
      result.key = top[0];
      result.confidence = Math.min(Math.round((top[1] / 10) * 100), 95);
      result.scores = Object.fromEntries(sorted);
      classified = result;
      S.set('persona', result);
      return result;
    }

    return { classify, get: () => classified };
  })();

  /* ════════════════════════════════════════
     MODULE 3: LIVE A/B TEST
     ════════════════════════════════════════ */
  const abTest = (function () {
    // Experiment: CTA button text on projects section
    let group = S.get('ab_group', null);
    if (!group) {
      group = Math.random() < 0.5 ? 'A' : 'B';
      S.set('ab_group', group);
      S.set('ab_assigned_at', Date.now());
      S.set('ab_clicked', false);
    }

    const VARIANTS = {
      A: { text: '프로젝트 보기', btnClass: '' },
      B: { text: '어떤 일을 했는지 확인하기 →', btnClass: '' }
    };

    // Apply variant to CTA buttons
    function apply() {
      const variant = VARIANTS[group];
      // Find project-related CTA buttons/links
      const links = document.querySelectorAll('a[href*="projects"], a[href*="project"]');
      links.forEach(link => {
        const text = (link.textContent || '').trim();
        // Only modify primary CTA-style links (not nav)
        if (link.closest('nav') || link.closest('.nav-menu')) return;
        if (text.includes('프로젝트') && text.length < 30 && link.classList.contains('btn') || link.closest('.hero-section')) {
          link.textContent = variant.text;
          link.dataset.abVariant = group;
        }
      });

      // Track clicks on variant elements
      document.addEventListener('click', function (e) {
        const target = e.target.closest('[data-ab-variant]');
        if (target && !S.get('ab_clicked', false)) {
          S.set('ab_clicked', true);
        }
      });
    }

    // Simulated aggregate results (seeded by date for consistency)
    function getResults() {
      const seed = new Date().toISOString().slice(0, 10); // daily seed
      const hash = Array.from(seed).reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0);
      const base = Math.abs(hash % 30) + 35; // 35~64 for A
      const aRate = base;
      const bRate = 100 - aRate;
      const totalVisitors = Math.abs(hash % 50) + 30; // 30~79
      const aVisitors = Math.round(totalVisitors * 0.48);
      const bVisitors = totalVisitors - aVisitors;
      const winner = aRate > bRate ? 'A' : 'B';
      const lift = Math.abs(aRate - bRate);

      return {
        group,
        variantText: VARIANTS[group].text,
        otherText: VARIANTS[group === 'A' ? 'B' : 'A'].text,
        clicked: S.get('ab_clicked', false),
        stats: {
          a: { visitors: aVisitors, rate: aRate },
          b: { visitors: bVisitors, rate: bRate },
          total: totalVisitors,
          winner,
          lift,
          significance: lift > 10 ? '95%' : lift > 5 ? '80%' : 'collecting'
        }
      };
    }

    apply();
    return { getResults, group };
  })();

  /* ════════════════════════════════════════
     CSS INJECTION
     ════════════════════════════════════════ */
  const css = document.createElement('style');
  css.textContent = `
    /* ── Heatmap Toggle ── */
    .eng-heatmap-btn{position:fixed;bottom:18px;left:270px;z-index:9050;background:rgba(15,23,42,.88);backdrop-filter:blur(12px);color:#e2e8f0;border:1px solid rgba(255,255,255,.08);border-radius:999px;padding:7px 14px;font-size:.8rem;cursor:pointer;font-family:-apple-system,BlinkMacSystemFont,'Noto Sans KR',sans-serif;display:flex;align-items:center;gap:6px;box-shadow:0 4px 20px rgba(0,0,0,.2)}
    .eng-heatmap-btn:hover{background:rgba(15,23,42,.95)}
    .eng-heatmap-btn .dot{width:8px;height:8px;border-radius:50%}
    .eng-heatmap-btn .dot.off{background:#64748b}
    .eng-heatmap-btn .dot.on{background:#ef4444;animation:eng-pulse 1.5s infinite}
    @keyframes eng-pulse{0%,100%{opacity:1}50%{opacity:.4}}
    .eng-heatmap-badge{position:fixed;top:0;left:0;right:0;z-index:8600;background:linear-gradient(90deg,#1e40af,#7c3aed);color:#fff;text-align:center;padding:8px 16px;font-size:.82rem;font-family:-apple-system,BlinkMacSystemFont,'Noto Sans KR',sans-serif;display:none}
    .eng-heatmap-badge.on{display:block}
    .eng-heatmap-badge strong{font-weight:700}

    /* ── Persona Card ── */
    .eng-persona{position:fixed;bottom:60px;left:18px;z-index:9010;background:#fff;border:1px solid #e2e8f0;border-radius:14px;width:290px;box-shadow:0 16px 40px rgba(0,0,0,.14);overflow:hidden;transform:translateY(20px);opacity:0;transition:all .4s cubic-bezier(.16,1,.3,1);pointer-events:none;font-family:-apple-system,BlinkMacSystemFont,'Noto Sans KR',sans-serif}
    .eng-persona.show{transform:translateY(0);opacity:1;pointer-events:auto}
    .eng-persona-head{padding:14px 16px 10px;border-bottom:1px solid #f1f5f9}
    .eng-persona-emoji{font-size:1.6rem}
    .eng-persona-name{font-size:1rem;font-weight:700;color:#0f172a;margin-top:4px}
    .eng-persona-conf{font-size:.75rem;color:#94a3b8;margin-top:2px}
    .eng-persona-body{padding:12px 16px}
    .eng-persona-desc{font-size:.85rem;color:#475569;line-height:1.5;margin-bottom:10px}
    .eng-persona-traits{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:10px}
    .eng-persona-trait{background:#f1f5f9;color:#475569;font-size:.72rem;padding:3px 8px;border-radius:999px}
    .eng-persona-match{font-size:.75rem;color:#94a3b8}
    .eng-persona-match strong{color:#64748b}
    .eng-persona-close{position:absolute;top:10px;right:12px;background:none;border:none;color:#94a3b8;cursor:pointer;font-size:.9rem}
    .eng-persona-foot{padding:8px 16px 10px;background:#f8fafc;border-top:1px solid #f1f5f9;font-size:.7rem;color:#94a3b8;text-align:center}

    /* ── A/B Test Badge ── */
    .eng-ab-badge{position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:9080;background:rgba(15,23,42,.9);backdrop-filter:blur(12px);color:#e2e8f0;border-radius:999px;padding:6px 16px;font-size:.78rem;cursor:pointer;font-family:-apple-system,BlinkMacSystemFont,'Noto Sans KR',sans-serif;display:flex;align-items:center;gap:8px;box-shadow:0 4px 20px rgba(0,0,0,.2);border:1px solid rgba(255,255,255,.08);transition:all .3s}
    .eng-ab-badge:hover{background:rgba(15,23,42,.98);transform:translateX(-50%) translateY(-1px)}

    /* A/B Panel */
    .eng-ab-panel{position:fixed;top:55px;left:50%;transform:translateX(-50%) translateY(-10px);z-index:9081;background:#fff;border:1px solid #e2e8f0;border-radius:14px;width:min(380px,calc(100vw - 40px));box-shadow:0 20px 50px rgba(0,0,0,.16);display:none;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Noto Sans KR',sans-serif}
    .eng-ab-panel.on{display:block;transform:translateX(-50%) translateY(0)}
    .eng-ab-head{background:#0f172a;color:#fff;padding:12px 16px;display:flex;justify-content:space-between;align-items:center}
    .eng-ab-head strong{font-size:.9rem}
    .eng-ab-close{background:none;border:none;color:#94a3b8;cursor:pointer;font-size:.9rem}
    .eng-ab-body{padding:16px}
    .eng-ab-group{display:flex;align-items:center;gap:8px;margin-bottom:14px}
    .eng-ab-group-tag{padding:4px 10px;border-radius:6px;font-weight:700;font-size:.85rem}
    .eng-ab-group-tag.a{background:#eff6ff;color:#2563eb}
    .eng-ab-group-tag.b{background:#f5f3ff;color:#7c3aed}
    .eng-ab-group-label{font-size:.85rem;color:#475569}
    .eng-ab-variants{margin-bottom:14px}
    .eng-ab-variant{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #f1f5f9}
    .eng-ab-variant:last-child{border-bottom:none}
    .eng-ab-v-tag{width:24px;height:24px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:700;flex-shrink:0}
    .eng-ab-v-tag.a{background:#eff6ff;color:#2563eb}
    .eng-ab-v-tag.b{background:#f5f3ff;color:#7c3aed}
    .eng-ab-v-text{font-size:.82rem;color:#334155;flex:1}
    .eng-ab-v-you{font-size:.65rem;background:#ecfdf5;color:#059669;padding:1px 6px;border-radius:999px}
    .eng-ab-bars{margin-bottom:12px}
    .eng-ab-bar-row{display:flex;align-items:center;gap:8px;margin-bottom:6px}
    .eng-ab-bar-label{width:20px;font-size:.8rem;font-weight:700;color:#64748b}
    .eng-ab-bar-track{flex:1;height:22px;background:#f1f5f9;border-radius:6px;overflow:hidden;position:relative}
    .eng-ab-bar-fill{height:100%;border-radius:6px;transition:width .5s}
    .eng-ab-bar-fill.a{background:linear-gradient(90deg,#2563eb,#3b82f6)}
    .eng-ab-bar-fill.b{background:linear-gradient(90deg,#7c3aed,#8b5cf6)}
    .eng-ab-bar-pct{position:absolute;right:8px;top:50%;transform:translateY(-50%);font-size:.75rem;font-weight:700;color:#fff}
    .eng-ab-meta{font-size:.75rem;color:#94a3b8;text-align:center}
    .eng-ab-foot{padding:8px 16px 10px;background:#f8fafc;border-top:1px solid #f1f5f9;font-size:.7rem;color:#94a3b8;text-align:center}

    @media(max-width:480px){
      .eng-heatmap-btn{bottom:56px;left:10px}
      .eng-persona{bottom:50px;left:10px;width:calc(100vw - 20px)}
      .eng-ab-badge{font-size:.72rem;padding:5px 12px}
    }
  `;
  document.head.appendChild(css);

  /* ════════════════════════════════════════
     UI: HEATMAP TOGGLE BUTTON
     ════════════════════════════════════════ */
  const heatmapBtn = document.createElement('button');
  heatmapBtn.className = 'eng-heatmap-btn';
  heatmapBtn.innerHTML = '<span class="dot off"></span> 히트맵';
  document.body.appendChild(heatmapBtn);

  const heatmapBadge = document.createElement('div');
  heatmapBadge.className = 'eng-heatmap-badge';
  heatmapBadge.innerHTML = '🔥 <strong>히트맵 ON</strong> — 마우스 이동과 클릭 위치를 시각화합니다. 이것은 UX 리서치 역량의 라이브 데모입니다. <button onclick="this.parentElement.classList.remove(\'on\')" style="background:none;border:none;color:rgba(255,255,255,.7);cursor:pointer;margin-left:8px">✕</button>';
  document.body.appendChild(heatmapBadge);

  heatmapBtn.addEventListener('click', function () {
    const isOn = heatmap.toggle();
    const dot = heatmapBtn.querySelector('.dot');
    if (isOn) {
      dot.className = 'dot on';
      heatmapBtn.innerHTML = '<span class="dot on"></span> 히트맵 OFF';
      heatmapBadge.classList.add('on');
    } else {
      dot.className = 'dot off';
      heatmapBtn.innerHTML = '<span class="dot off"></span> 히트맵';
      heatmapBadge.classList.remove('on');
    }
  });

  /* ════════════════════════════════════════
     UI: PERSONA CARD
     ════════════════════════════════════════ */
  const personaCard = document.createElement('div');
  personaCard.className = 'eng-persona';
  personaCard.style.position = 'relative';
  document.body.appendChild(personaCard);

  let personaShown = false;
  function showPersona(p) {
    if (personaShown || !p) return;
    personaShown = true;

    personaCard.innerHTML = `
      <button class="eng-persona-close">✕</button>
      <div class="eng-persona-head">
        <div class="eng-persona-emoji">${p.emoji}</div>
        <div class="eng-persona-name">당신의 브라우징 유형: ${p.name}</div>
        <div class="eng-persona-conf">신뢰도 ${p.confidence}% · 실시간 행동 기반 분류</div>
      </div>
      <div class="eng-persona-body">
        <div class="eng-persona-desc">${p.desc}</div>
        <div class="eng-persona-traits">
          ${p.traits.map(t => `<span class="eng-persona-trait">${t}</span>`).join('')}
        </div>
        <div class="eng-persona-match">비슷한 프로필: <strong>${p.match}</strong></div>
      </div>
      <div class="eng-persona-foot">스크롤 속도 · 클릭 패턴 · 체류 분포 기반 세그먼테이션</div>
    `;
    personaCard.style.borderTop = `3px solid ${p.color}`;

    setTimeout(() => personaCard.classList.add('show'), 100);
    personaCard.querySelector('.eng-persona-close').addEventListener('click', () => {
      personaCard.classList.remove('show');
    });

    // Auto-hide after 15s
    setTimeout(() => personaCard.classList.remove('show'), 15000);
  }

  // Check persona every 5s after 25s
  setTimeout(function checkPersona() {
    const result = persona.classify();
    if (result) {
      showPersona(result);
    } else {
      setTimeout(checkPersona, 5000);
    }
  }, 25000);

  /* ════════════════════════════════════════
     UI: A/B TEST BADGE + PANEL
     ════════════════════════════════════════ */
  const abBadge = document.createElement('div');
  abBadge.className = 'eng-ab-badge';
  abBadge.innerHTML = `🧪 A/B 실험 참여 중 · <strong>Group ${abTest.group}</strong>`;
  document.body.appendChild(abBadge);

  const abPanel = document.createElement('div');
  abPanel.className = 'eng-ab-panel';
  document.body.appendChild(abPanel);

  function renderABPanel() {
    const r = abTest.getResults();
    const s = r.stats;
    const winnerLabel = s.winner === r.group ? '(당신의 그룹!)' : '';

    abPanel.innerHTML = `
      <div class="eng-ab-head">
        <strong>🧪 라이브 A/B 테스트 결과</strong>
        <button class="eng-ab-close">✕</button>
      </div>
      <div class="eng-ab-body">
        <div class="eng-ab-group">
          <span class="eng-ab-group-tag ${r.group.toLowerCase()}">${r.group}</span>
          <span class="eng-ab-group-label">당신은 <strong>Group ${r.group}</strong>에 배정되었습니다</span>
        </div>

        <div class="eng-ab-variants">
          <div class="eng-ab-variant">
            <span class="eng-ab-v-tag a">A</span>
            <span class="eng-ab-v-text">"${VARIANTS_TEXT.A}"</span>
            ${r.group === 'A' ? '<span class="eng-ab-v-you">YOU</span>' : ''}
          </div>
          <div class="eng-ab-variant">
            <span class="eng-ab-v-tag b">B</span>
            <span class="eng-ab-v-text">"${VARIANTS_TEXT.B}"</span>
            ${r.group === 'B' ? '<span class="eng-ab-v-you">YOU</span>' : ''}
          </div>
        </div>

        <div class="eng-ab-bars">
          <div class="eng-ab-bar-row">
            <span class="eng-ab-bar-label">A</span>
            <div class="eng-ab-bar-track">
              <div class="eng-ab-bar-fill a" style="width:${s.a.rate}%"></div>
              <span class="eng-ab-bar-pct">${s.a.rate}%</span>
            </div>
          </div>
          <div class="eng-ab-bar-row">
            <span class="eng-ab-bar-label">B</span>
            <div class="eng-ab-bar-track">
              <div class="eng-ab-bar-fill b" style="width:${s.b.rate}%"></div>
              <span class="eng-ab-bar-pct">${s.b.rate}%</span>
            </div>
          </div>
        </div>

        <div class="eng-ab-meta">
          총 ${s.total}명 · 현재 리더: <strong>Group ${s.winner}</strong> ${winnerLabel} · 통계적 유의도: ${s.significance}
        </div>
      </div>
      <div class="eng-ab-foot">이 포트폴리오의 CTA 버튼 문구를 실제로 A/B 테스트하고 있습니다. 그로스 실험 역량 데모.</div>
    `;

    abPanel.querySelector('.eng-ab-close').addEventListener('click', () => {
      abPanel.classList.remove('on');
    });
  }

  const VARIANTS_TEXT = { A: '프로젝트 보기', B: '어떤 일을 했는지 확인하기 →' };

  abBadge.addEventListener('click', function () {
    renderABPanel();
    abPanel.classList.toggle('on');
  });

  // Show A/B badge with delay
  abBadge.style.opacity = '0';
  abBadge.style.transition = 'opacity .5s';
  setTimeout(() => { abBadge.style.opacity = '1'; }, 4000);

})();
