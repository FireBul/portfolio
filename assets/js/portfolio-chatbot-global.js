(function () {
  if (window.__portfolioChatbotInit) return;
  window.__portfolioChatbotInit = true;

  const style = document.createElement('style');
  style.textContent = `
    .pc-fab{position:fixed;right:18px;bottom:18px;z-index:2100;border:none;border-radius:999px;background:#2563eb;color:#fff;padding:12px 16px;font-weight:700;box-shadow:0 10px 30px rgba(0,0,0,.22);cursor:pointer}
    .pc-modal{position:fixed;right:18px;bottom:74px;width:min(410px,calc(100vw - 24px));background:#fff;border:1px solid #e2e8f0;border-radius:14px;box-shadow:0 20px 40px rgba(0,0,0,.26);z-index:2200;display:none;overflow:hidden}
    .pc-modal.on{display:block}
    .pc-head{background:#0f172a;color:#fff;padding:11px 12px;display:flex;justify-content:space-between;align-items:center}
    .pc-body{padding:10px}.pc-log{border:1px solid #e2e8f0;background:#f8fafc;border-radius:10px;padding:10px;min-height:120px;max-height:260px;overflow:auto;font-size:.92rem;margin-bottom:8px}
    .pc-row{display:flex;gap:8px}.pc-row input{flex:1;padding:10px;border:1px solid #e2e8f0;border-radius:10px}
    .pc-send{padding:10px 12px;border:none;border-radius:10px;background:#2563eb;color:#fff;cursor:pointer}
    .pc-chip-wrap{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 0}
    .pc-chip{font-size:12px;padding:5px 8px;border-radius:999px;background:#e2e8f0;border:none;cursor:pointer}
  `;
  document.head.appendChild(style);

  let kb = null;
  fetch('assets/data/portfolio-knowledge.json').then((r) => r.json()).then((j) => (kb = j)).catch(() => {});

  const normalize = (t) => String(t || '').toLowerCase().replace(/\s+/g, ' ').trim();

  function answer(q) {
    const t = normalize(q);
    if (!t || t.length < 2) return '질문이 너무 짧아요. 예: 성과 / 연락방법 / AI 프로젝트 / 인터뷰 가능 시점';

    if (/법|legal|규정|컴플라이언스/.test(t)) {
      return '법률 자문은 제공하지 않지만, 운영 정책·거버넌스 설계 경험은 프로젝트 맥락에서 설명 가능합니다.';
    }

    if (kb && Array.isArray(kb.highlights)) {
      let best = null;
      let score = 0;
      for (const h of kb.highlights) {
        const localScore = (h.keywords || []).reduce((acc, k) => acc + (t.includes(normalize(k)) ? 1 : 0), 0);
        if (localScore > score) {
          score = localScore;
          best = h;
        }
      }
      if (best && score > 0) {
        if (best.followUp && Array.isArray(best.followUp) && best.followUp.length) {
          return `${best.answer}\n\n다음 질문도 추천드려요: ${best.followUp.slice(0, 2).join(' / ')}`;
        }
        return best.answer;
      }
      return kb.fallback || '질문을 조금 더 구체적으로 말해 주세요.';
    }

    return '질문을 조금 더 구체적으로 말해 주세요. 예: 성과 / 퇴사 시점 / 연락방법 / AI 프로젝트';
  }

  const fab = document.createElement('button');
  fab.className = 'pc-fab';
  fab.textContent = '💬 Ask';

  const modal = document.createElement('div');
  modal.className = 'pc-modal';
  modal.innerHTML = `<div class='pc-head'><strong>AI Portfolio Assistant</strong><button id='pc-close' style='background:none;border:none;color:#fff;font-size:1.1rem;cursor:pointer'>✕</button></div>
  <div class='pc-body'>
    <div class='pc-log' id='pc-log'>안녕하세요. 제 경력/프로젝트/성과/KPI/연락 방법을 물어보세요.</div>
    <div class='pc-chip-wrap' id='pc-chip-wrap'></div>
    <div class='pc-row'><input id='pc-input' placeholder='예: 인터파크 퇴사 시점 / AI 프로젝트 / CRM 성과'><button class='pc-send' id='pc-send'>전송</button></div>
  </div>`;

  document.body.appendChild(fab);
  document.body.appendChild(modal);

  const getNum = (k) => Number(localStorage.getItem(k) || '0');
  const setNum = (k, v) => localStorage.setItem(k, String(v));

  const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));

  function append(q, a) {
    const log = modal.querySelector('#pc-log');
    log.innerHTML += `<hr style='border:none;border-top:1px solid #e2e8f0;margin:8px 0'><div><b>Q.</b> ${escapeHtml(q)}</div><div style='margin-top:3px;white-space:pre-line'><b>A.</b> ${escapeHtml(a)}</div>`;
    log.scrollTop = log.scrollHeight;
  }

  function send(questionOverride) {
    const i = modal.querySelector('#pc-input');
    const q = (questionOverride || i.value || '').trim();
    if (!q) return;
    append(q, answer(q));
    i.value = '';
    setNum('portfolio_chat_question_count', getNum('portfolio_chat_question_count') + 1);
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'portfolio_chat_question', question: q.slice(0, 120), at: new Date().toISOString() });
  }

  const suggestions = ['핵심 KPI 성과', '협업 가능한 프로젝트 유형', '인터뷰 가능 시점', 'AI/ML 프로젝트 접근 방식'];
  const chipWrap = modal.querySelector('#pc-chip-wrap');
  chipWrap.innerHTML = suggestions.map((x) => `<button type='button' class='pc-chip'>${x}</button>`).join('');
  chipWrap.querySelectorAll('.pc-chip').forEach((chip) => {
    chip.addEventListener('click', () => send(chip.textContent || ''));
  });

  fab.addEventListener('click', () => {
    modal.classList.add('on');
    setNum('portfolio_chat_open_count', getNum('portfolio_chat_open_count') + 1);
  });
  modal.querySelector('#pc-close').addEventListener('click', () => modal.classList.remove('on'));
  modal.querySelector('#pc-send').addEventListener('click', () => send());
  modal.querySelector('#pc-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') send();
  });
})();