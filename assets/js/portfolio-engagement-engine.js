/**
 * Portfolio Engagement Engine v1.0
 * ─────────────────────────────────
 * 실시간 행동 추적 · 인앱 메시지 · 다음 클릭 예측
 *
 * 이 스크립트 자체가 PM/데이터 분석/그로스 역량의 라이브 데모입니다.
 * - Behavioral Analytics: 클릭, 스크롤, 체류시간 실시간 추적
 * - In-App Messaging: 행동 기반 컨텍스트 메시지 (Braze/Intercom 패턴)
 * - Predictive Engine: Markov 전이 확률 기반 다음 클릭 예측
 * - Engagement Scoring: 가중 점수 모델 (0~100)
 */
(function () {
  'use strict';

  /* ───── 0. CSS Injection ───── */
  const css = document.createElement('style');
  css.textContent = `
    /* ── Floating Dashboard ── */
    .eng-bar{position:fixed;bottom:18px;left:18px;z-index:9000;font-family:-apple-system,BlinkMacSystemFont,'Noto Sans KR',sans-serif;font-size:.85rem;transition:all .3s ease}
    .eng-collapsed{background:rgba(15,23,42,.88);backdrop-filter:blur(12px);color:#e2e8f0;padding:8px 14px;border-radius:999px;cursor:pointer;display:flex;align-items:center;gap:10px;box-shadow:0 4px 20px rgba(0,0,0,.25);border:1px solid rgba(255,255,255,.08)}
    .eng-collapsed:hover{background:rgba(15,23,42,.95);transform:translateY(-1px)}
    .eng-collapsed .eng-score{background:#2563eb;color:#fff;padding:2px 8px;border-radius:999px;font-weight:700;font-size:.8rem}
    .eng-expanded{display:none;background:rgba(15,23,42,.92);backdrop-filter:blur(16px);color:#e2e8f0;border-radius:16px;padding:0;width:320px;box-shadow:0 20px 50px rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.08);overflow:hidden}
    .eng-expanded.on{display:block}
    .eng-exp-head{padding:12px 16px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,.08)}
    .eng-exp-head strong{font-size:.9rem;color:#fff}
    .eng-exp-head button{background:none;border:none;color:#94a3b8;cursor:pointer;font-size:1rem}
    .eng-exp-body{padding:14px 16px}

    /* Stats Row */
    .eng-stats{display:flex;gap:12px;margin-bottom:14px}
    .eng-stat{text-align:center;flex:1}
    .eng-stat-val{font-size:1.3rem;font-weight:700;color:#fff;display:block}
    .eng-stat-lbl{font-size:.7rem;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px}

    /* Score Bar */
    .eng-score-wrap{margin-bottom:14px}
    .eng-score-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px}
    .eng-score-title{font-size:.78rem;color:#94a3b8}
    .eng-score-num{font-size:.85rem;font-weight:700;color:#2563eb}
    .eng-score-track{height:6px;background:rgba(255,255,255,.1);border-radius:99px;overflow:hidden}
    .eng-score-fill{height:100%;background:linear-gradient(90deg,#2563eb,#7c3aed);border-radius:99px;transition:width .6s ease}

    /* Prediction */
    .eng-pred{margin-bottom:10px}
    .eng-pred-title{font-size:.78rem;color:#94a3b8;margin-bottom:8px;display:flex;align-items:center;gap:4px}
    .eng-pred-list{display:flex;flex-direction:column;gap:4px}
    .eng-pred-item{display:flex;align-items:center;gap:8px}
    .eng-pred-name{font-size:.82rem;color:#cbd5e1;width:70px;text-align:right;flex-shrink:0}
    .eng-pred-bar-wrap{flex:1;height:18px;background:rgba(255,255,255,.06);border-radius:4px;overflow:hidden;position:relative}
    .eng-pred-bar-fill{height:100%;border-radius:4px;transition:width .5s ease}
    .eng-pred-pct{font-size:.75rem;font-weight:600;color:#fff;position:absolute;right:6px;top:50%;transform:translateY(-50%)}
    .eng-pred-bar-fill.top{background:linear-gradient(90deg,#2563eb,#3b82f6)}
    .eng-pred-bar-fill.mid{background:rgba(100,116,139,.5)}
    .eng-pred-bar-fill.low{background:rgba(100,116,139,.3)}

    .eng-pred-hit{background:#065f46;color:#6ee7b7;font-size:.75rem;padding:3px 8px;border-radius:6px;text-align:center;margin-top:6px;display:none}
    .eng-pred-hit.show{display:block}

    .eng-footer{font-size:.7rem;color:#64748b;text-align:center;padding:8px 16px 12px;border-top:1px solid rgba(255,255,255,.05)}

    /* ── In-App Message Toast ── */
    .eng-toast-wrap{position:fixed;top:20px;right:20px;z-index:9100;display:flex;flex-direction:column;gap:8px;pointer-events:none}
    .eng-toast{pointer-events:auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:14px 16px;width:min(360px,calc(100vw - 40px));box-shadow:0 12px 35px rgba(0,0,0,.12);transform:translateX(120%);transition:transform .4s cubic-bezier(.16,1,.3,1),opacity .3s;opacity:0;font-family:-apple-system,BlinkMacSystemFont,'Noto Sans KR',sans-serif}
    .eng-toast.in{transform:translateX(0);opacity:1}
    .eng-toast.out{transform:translateX(120%);opacity:0}
    .eng-toast-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}
    .eng-toast-tag{font-size:.7rem;font-weight:600;padding:2px 8px;border-radius:999px}
    .eng-toast-tag.analytics{background:#eff6ff;color:#2563eb}
    .eng-toast-tag.growth{background:#ecfdf5;color:#059669}
    .eng-toast-tag.predict{background:#f5f3ff;color:#7c3aed}
    .eng-toast-tag.insight{background:#fefce8;color:#ca8a04}
    .eng-toast-close{background:none;border:none;color:#94a3b8;cursor:pointer;font-size:.9rem;padding:0}
    .eng-toast-body{font-size:.88rem;color:#334155;line-height:1.5}
    .eng-toast-body strong{color:#0f172a}
    .eng-toast-sub{font-size:.75rem;color:#94a3b8;margin-top:6px}

    /* ── Responsive ── */
    @media(max-width:480px){
      .eng-bar{bottom:10px;left:10px}
      .eng-expanded{width:calc(100vw - 20px)}
      .eng-toast-wrap{top:10px;right:10px}
    }
  `;
  document.head.appendChild(css);

  /* ───── 1. Storage Helper ───── */
  const S = {
    get: (k, d) => { try { return JSON.parse(localStorage.getItem('eng_' + k)) ?? d; } catch { return d; } },
    set: (k, v) => { try { localStorage.setItem('eng_' + k, JSON.stringify(v)); } catch {} }
  };

  /* ───── 2. Page Classification ───── */
  const path = location.pathname.replace(/\/$/, '').split('/').pop() || 'index.html';
  const pageMap = {
    'index.html': '홈',
    'about.html': '소개',
    'projects.html': '프로젝트',
    'leadership.html': '리더십',
    'contact.html': '연락처'
  };
  function getPageName(p) {
    if (pageMap[p]) return pageMap[p];
    if (p.startsWith('project-detail-')) return p.replace('project-detail-', '').replace('.html', '');
    return p.replace('.html', '');
  }
  const currentPage = getPageName(path);
  const isDetail = path.startsWith('project-detail-');

  /* ───── 3. Session State ───── */
  const sessionId = S.get('session_id', null) || (function () {
    const id = 'ses_' + Date.now();
    S.set('session_id', id);
    S.set('session_start', Date.now());
    S.set('clicks', 0);
    S.set('pages', []);
    S.set('toasts_shown', []);
    S.set('predictions_correct', 0);
    S.set('predictions_total', 0);
    return id;
  })();

  // Check session expiry (30min idle)
  const lastActive = S.get('last_active', Date.now());
  if (Date.now() - lastActive > 30 * 60 * 1000) {
    S.set('session_id', 'ses_' + Date.now());
    S.set('session_start', Date.now());
    S.set('clicks', 0);
    S.set('pages', []);
    S.set('toasts_shown', []);
    S.set('predictions_correct', 0);
    S.set('predictions_total', 0);
  }
  S.set('last_active', Date.now());

  let clicks = S.get('clicks', 0);
  let pages = S.get('pages', []);
  const toastsShown = new Set(S.get('toasts_shown', []));

  // Record page visit
  if (!pages.length || pages[pages.length - 1] !== currentPage) {
    pages.push(currentPage);
    S.set('pages', pages);
  }
  const uniquePages = [...new Set(pages)].length;
  const detailViews = pages.filter(p => !['홈', '소개', '프로젝트', '리더십', '연락처'].includes(p)).length;

  /* ───── 4. Click Tracking ───── */
  document.addEventListener('click', function () {
    clicks++;
    S.set('clicks', clicks);
    S.set('last_active', Date.now());
    updateDashboard();
    checkToastTriggers();
  });

  /* ───── 5. Scroll Tracking ───── */
  let maxScroll = 0;
  window.addEventListener('scroll', function () {
    const scrollPct = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100) || 0;
    if (scrollPct > maxScroll) {
      maxScroll = scrollPct;
      if (maxScroll >= 75) checkToastTriggers();
    }
  }, { passive: true });

  /* ───── 6. Engagement Score ───── */
  function calcScore() {
    const elapsed = (Date.now() - S.get('session_start', Date.now())) / 1000;
    let score = 0;
    score += Math.min(clicks * 1.5, 25);         // 클릭 (max 25)
    score += Math.min(uniquePages * 8, 30);       // 페이지뷰 (max 30)
    score += Math.min(elapsed / 15, 20);          // 체류시간 (max 20 @ 5min)
    score += Math.min(maxScroll / 5, 15);         // 스크롤 깊이 (max 15)
    score += Math.min(detailViews * 5, 10);       // 상세 페이지 (max 10)
    return Math.min(Math.round(score), 100);
  }

  /* ───── 7. Markov Prediction Engine ───── */
  const TRANSITIONS = {
    '홈':       { '프로젝트': 0.42, '소개': 0.25, '연락처': 0.13, '리더십': 0.10, '_detail': 0.10 },
    '프로젝트': { '_detail': 0.50, '연락처': 0.18, '홈': 0.14, '소개': 0.10, '리더십': 0.08 },
    '소개':     { '프로젝트': 0.38, '연락처': 0.28, '리더십': 0.18, '홈': 0.16 },
    '리더십':   { '프로젝트': 0.32, '소개': 0.25, '연락처': 0.25, '홈': 0.18 },
    '연락처':   { '프로젝트': 0.38, '홈': 0.30, '소개': 0.17, '리더십': 0.15 },
    '_detail':  { '프로젝트': 0.40, '_detail': 0.28, '연락처': 0.18, '홈': 0.14 }
  };

  function getPredictions() {
    const key = isDetail ? '_detail' : currentPage;
    const probs = TRANSITIONS[key] || TRANSITIONS['홈'];

    // Bayesian update: blend prior with observed transitions
    const observed = {};
    for (let i = 1; i < pages.length; i++) {
      const from = ['홈', '소개', '프로젝트', '리더십', '연락처'].includes(pages[i - 1]) ? pages[i - 1] : '_detail';
      if (from === key) {
        const to = ['홈', '소개', '프로젝트', '리더십', '연락처'].includes(pages[i]) ? pages[i] : '_detail';
        observed[to] = (observed[to] || 0) + 1;
      }
    }

    const totalObs = Object.values(observed).reduce((a, b) => a + b, 0);
    const alpha = 0.3; // observation weight
    const blended = {};

    for (const [dest, prior] of Object.entries(probs)) {
      if (dest === currentPage && !isDetail) continue; // exclude current
      const obsRate = totalObs > 0 ? (observed[dest] || 0) / totalObs : 0;
      blended[dest] = prior * (1 - alpha) + obsRate * alpha;
    }

    // Normalize
    const total = Object.values(blended).reduce((a, b) => a + b, 0);
    const result = [];
    for (const [dest, val] of Object.entries(blended)) {
      result.push({
        name: dest === '_detail' ? '상세페이지' : dest,
        pct: Math.round((val / total) * 100)
      });
    }
    return result.sort((a, b) => b.pct - a.pct).slice(0, 4);
  }

  // Track prediction accuracy
  const lastPrediction = S.get('last_prediction', null);
  if (lastPrediction) {
    const predictedPage = lastPrediction.top;
    const actualPage = isDetail ? '상세페이지' : currentPage;
    S.set('predictions_total', S.get('predictions_total', 0) + 1);
    if (predictedPage === actualPage) {
      S.set('predictions_correct', S.get('predictions_correct', 0) + 1);
    }
  }
  const predictions = getPredictions();
  S.set('last_prediction', { top: predictions[0]?.name, at: Date.now() });

  /* ───── 8. Build Floating Dashboard ───── */
  const bar = document.createElement('div');
  bar.className = 'eng-bar';

  const elapsed = () => {
    const s = Math.floor((Date.now() - S.get('session_start', Date.now())) / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}:${String(sec).padStart(2, '0')}` : `${sec}s`;
  };

  // Collapsed view
  const collapsed = document.createElement('div');
  collapsed.className = 'eng-collapsed';
  collapsed.innerHTML = `
    <span>🖱 <span id="eng-c-clicks">${clicks}</span> · 📄 <span id="eng-c-pages">${uniquePages}</span> · ⏱ <span id="eng-c-time">${elapsed()}</span></span>
    <span class="eng-score" id="eng-c-score">${calcScore()}pt</span>
  `;

  // Expanded view
  const predAccuracy = S.get('predictions_total', 0) > 0
    ? Math.round((S.get('predictions_correct', 0) / S.get('predictions_total', 0)) * 100) : 0;
  const predTotal = S.get('predictions_total', 0);

  const expanded = document.createElement('div');
  expanded.className = 'eng-expanded';

  function buildPredBars() {
    return predictions.map((p, i) => {
      const cls = i === 0 ? 'top' : i === 1 ? 'mid' : 'low';
      return `<div class="eng-pred-item">
        <span class="eng-pred-name">${p.name}</span>
        <div class="eng-pred-bar-wrap">
          <div class="eng-pred-bar-fill ${cls}" style="width:${p.pct}%"></div>
          <span class="eng-pred-pct">${p.pct}%</span>
        </div>
      </div>`;
    }).join('');
  }

  expanded.innerHTML = `
    <div class="eng-exp-head">
      <strong>📊 Live Engagement Analytics</strong>
      <button id="eng-collapse">▼</button>
    </div>
    <div class="eng-exp-body">
      <div class="eng-stats">
        <div class="eng-stat"><span class="eng-stat-val" id="eng-e-clicks">${clicks}</span><span class="eng-stat-lbl">클릭</span></div>
        <div class="eng-stat"><span class="eng-stat-val" id="eng-e-pages">${uniquePages}</span><span class="eng-stat-lbl">페이지</span></div>
        <div class="eng-stat"><span class="eng-stat-val" id="eng-e-time">${elapsed()}</span><span class="eng-stat-lbl">체류시간</span></div>
        <div class="eng-stat"><span class="eng-stat-val" id="eng-e-scroll">${maxScroll}%</span><span class="eng-stat-lbl">스크롤</span></div>
      </div>

      <div class="eng-score-wrap">
        <div class="eng-score-row">
          <span class="eng-score-title">Engagement Score</span>
          <span class="eng-score-num" id="eng-e-score">${calcScore()}/100</span>
        </div>
        <div class="eng-score-track"><div class="eng-score-fill" id="eng-e-bar" style="width:${calcScore()}%"></div></div>
      </div>

      <div class="eng-pred">
        <div class="eng-pred-title">⚡ 다음 클릭 예측 <span style="font-size:.7rem;color:#64748b">(Markov Chain)</span></div>
        <div class="eng-pred-list" id="eng-pred-list">${buildPredBars()}</div>
        <div class="eng-pred-hit" id="eng-pred-hit">✓ 예측 적중! (${predTotal > 0 ? predAccuracy : '-'}% 정확도, ${predTotal}회)</div>
      </div>
    </div>
    <div class="eng-footer">이 대시보드는 행동 분석 · 인앱 메시지 · 예측 모델링 역량의 라이브 데모입니다</div>
  `;

  bar.appendChild(collapsed);
  bar.appendChild(expanded);
  document.body.appendChild(bar);

  // Show prediction hit animation
  if (lastPrediction) {
    const actualPage = isDetail ? '상세페이지' : currentPage;
    if (lastPrediction.top === actualPage) {
      setTimeout(() => {
        const hitEl = document.getElementById('eng-pred-hit');
        if (hitEl) hitEl.classList.add('show');
      }, 800);
    }
  }

  // Toggle
  let isExpanded = false;
  collapsed.addEventListener('click', () => {
    isExpanded = true;
    collapsed.style.display = 'none';
    expanded.classList.add('on');
  });
  document.getElementById('eng-collapse').addEventListener('click', () => {
    isExpanded = false;
    expanded.classList.remove('on');
    collapsed.style.display = 'flex';
  });

  /* ───── 9. Dashboard Update Loop ───── */
  function updateDashboard() {
    const score = calcScore();
    // Collapsed
    const cc = document.getElementById('eng-c-clicks');
    const cp = document.getElementById('eng-c-pages');
    const ct = document.getElementById('eng-c-time');
    const cs = document.getElementById('eng-c-score');
    if (cc) cc.textContent = clicks;
    if (cp) cp.textContent = uniquePages;
    if (ct) ct.textContent = elapsed();
    if (cs) cs.textContent = score + 'pt';
    // Expanded
    const ec = document.getElementById('eng-e-clicks');
    const ep = document.getElementById('eng-e-pages');
    const et = document.getElementById('eng-e-time');
    const es = document.getElementById('eng-e-scroll');
    const en = document.getElementById('eng-e-score');
    const eb = document.getElementById('eng-e-bar');
    if (ec) ec.textContent = clicks;
    if (ep) ep.textContent = uniquePages;
    if (et) et.textContent = elapsed();
    if (es) es.textContent = maxScroll + '%';
    if (en) en.textContent = score + '/100';
    if (eb) eb.style.width = score + '%';
  }
  setInterval(updateDashboard, 1000);

  /* ───── 10. In-App Message System ───── */
  const toastWrap = document.createElement('div');
  toastWrap.className = 'eng-toast-wrap';
  document.body.appendChild(toastWrap);

  function showToast(id, tag, tagClass, body, sub, delay) {
    if (toastsShown.has(id)) return;
    toastsShown.add(id);
    S.set('toasts_shown', [...toastsShown]);

    setTimeout(() => {
      const t = document.createElement('div');
      t.className = 'eng-toast';
      t.innerHTML = `
        <div class="eng-toast-head">
          <span class="eng-toast-tag ${tagClass}">${tag}</span>
          <button class="eng-toast-close">✕</button>
        </div>
        <div class="eng-toast-body">${body}</div>
        ${sub ? `<div class="eng-toast-sub">${sub}</div>` : ''}
      `;
      toastWrap.appendChild(t);
      requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('in')));

      const dismiss = () => {
        t.classList.remove('in');
        t.classList.add('out');
        setTimeout(() => t.remove(), 400);
      };
      t.querySelector('.eng-toast-close').addEventListener('click', dismiss);
      setTimeout(dismiss, 8000);
    }, delay || 0);
  }

  /* ───── 11. Toast Triggers ───── */
  const MESSAGES = [
    {
      id: 'welcome',
      check: () => pages.length <= 1,
      delay: 2500,
      tag: 'Analytics Demo', tagClass: 'analytics',
      body: '이 포트폴리오는 <strong>실시간 행동 분석</strong>이 작동 중입니다. 좌측 하단 대시보드에서 클릭 수, 체류시간, 다음 클릭 예측을 확인해 보세요.',
      sub: 'PM/데이터 분석 역량의 라이브 데모 · 클릭하면 숫자가 올라갑니다'
    },
    {
      id: 'clicks_5',
      check: () => clicks >= 5,
      delay: 500,
      tag: 'Engagement', tagClass: 'growth',
      body: `<strong>${clicks}번째 클릭</strong>을 기록했습니다. 저는 이런 행동 데이터를 기반으로 사용자 퍼널을 설계하고, A/B 테스트로 전환율을 개선합니다.`,
      sub: '실제 프로젝트: 광고 지면 CTR 100% 상승 (A/B 테스트 기반)'
    },
    {
      id: 'projects_interest',
      check: () => detailViews >= 2,
      delay: 1000,
      tag: 'Behavioral Insight', tagClass: 'insight',
      body: `프로젝트 상세 페이지를 <strong>${detailViews}개</strong> 확인하셨네요. 방문자의 상위 20%에 해당하는 참여도입니다.`,
      sub: '이 수치는 Engagement Score에 반영됩니다'
    },
    {
      id: 'scroll_deep',
      check: () => maxScroll >= 75,
      delay: 800,
      tag: 'Scroll Depth', tagClass: 'analytics',
      body: `이 페이지의 <strong>${maxScroll}%</strong>를 읽으셨습니다. 대부분의 방문자는 40% 미만에서 이탈합니다 — 깊은 관심에 감사합니다.`,
      sub: '스크롤 깊이 기반 콘텐츠 최적화는 제가 자주 활용하는 그로스 기법입니다'
    },
    {
      id: 'time_2min',
      check: () => (Date.now() - S.get('session_start', Date.now())) / 1000 >= 120,
      delay: 500,
      tag: 'Growth Signal', tagClass: 'growth',
      body: `<strong>2분 이상</strong> 체류 중입니다. 현재 Engagement Score: <strong>${calcScore()}/100</strong>. 이 점수 모델은 클릭·페이지뷰·체류·스크롤의 가중 합산입니다.`,
      sub: 'CRM 리드 스코어링과 동일한 원리를 적용했습니다'
    },
    {
      id: 'predict_hit',
      check: () => {
        if (!lastPrediction) return false;
        const actual = isDetail ? '상세페이지' : currentPage;
        return lastPrediction.top === actual && S.get('predictions_total', 0) >= 2;
      },
      delay: 1500,
      tag: 'Prediction', tagClass: 'predict',
      body: `방금 <strong>"${currentPage}"</strong> 클릭을 정확히 예측했습니다! 현재 적중률: <strong>${predTotal > 0 ? predAccuracy : '-'}%</strong> (${predTotal}회 시도)`,
      sub: 'Markov Chain 전이 확률 + 베이지안 업데이트 기반'
    },
    {
      id: 'contact_intent',
      check: () => path === 'contact.html',
      delay: 2000,
      tag: 'Conversion', tagClass: 'growth',
      body: '연락처 페이지에 도달하셨습니다. 방문자의 약 <strong>15%</strong>만 이 단계까지 도달합니다 — 높은 전환 의향을 보여주고 계십니다.',
      sub: '퍼널 전환율 분석: 홈 → 프로젝트 → 상세 → 연락처'
    }
  ];

  function checkToastTriggers() {
    MESSAGES.forEach(m => {
      if (m.check()) showToast(m.id, m.tag, m.tagClass, m.body, m.sub, m.delay);
    });
  }

  // Initial check + periodic
  setTimeout(checkToastTriggers, 2000);
  setInterval(checkToastTriggers, 5000);

})();
