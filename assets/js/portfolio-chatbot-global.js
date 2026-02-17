(function () {
  if (window.__portfolioChatbotInit) return;
  window.__portfolioChatbotInit = true;

  const style = document.createElement('style');
  style.textContent = `
    .pc-fab{position:fixed;right:18px;bottom:18px;z-index:2100;border:none;border-radius:999px;background:#2563eb;color:#fff;padding:12px 16px;font-weight:700;box-shadow:0 10px 30px rgba(0,0,0,.22);cursor:pointer}
    .pc-modal{position:fixed;right:18px;bottom:74px;width:min(390px,calc(100vw - 24px));background:#fff;border:1px solid #e2e8f0;border-radius:14px;box-shadow:0 20px 40px rgba(0,0,0,.26);z-index:2200;display:none;overflow:hidden}
    .pc-modal.on{display:block}
    .pc-head{background:#0f172a;color:#fff;padding:11px 12px;display:flex;justify-content:space-between;align-items:center}
    .pc-body{padding:10px}.pc-log{border:1px solid #e2e8f0;background:#f8fafc;border-radius:10px;padding:10px;min-height:120px;max-height:260px;overflow:auto;font-size:.92rem;margin-bottom:8px}
    .pc-row{display:flex;gap:8px}.pc-row input{flex:1;padding:10px;border:1px solid #e2e8f0;border-radius:10px}
    .pc-send{padding:10px 12px;border:none;border-radius:10px;background:#2563eb;color:#fff;cursor:pointer}
  `;
  document.head.appendChild(style);

  const trained = {
    profile: '최원혁(ben)은 Product Strategy·AI/ML 중심으로 프로젝트를 고도화 중이며, 전문가 톤 포트폴리오를 지향합니다.',
    career: '인터파크는 2025년 12월에 퇴사했고, 현재는 독립 프로젝트와 포트폴리오 고도화에 집중합니다.',
    projects: '광고 최적화, 쿠폰 자동화, 데이터 파이프라인, 운영 대시보드, AI/ML 및 연구형 프로젝트를 수행했습니다.',
    contact: 'Contact 페이지에서 이메일/전화로 연락 가능하며 CRM형 문의 흐름으로 확장 중입니다.',
    metrics: '포트폴리오는 CTR/CPC/클릭/전환 등 KPI 중심 사례 구성을 강화하고 있습니다.'
  };

  function answer(q){
    const t=(q||'').toLowerCase().trim();
    if(!t || t.length < 2) return '질문이 너무 짧아요. 예: 성과 / 연락방법 / AI 프로젝트 / 퇴사 시점';
    if(/누구|소개|profile|about/.test(t)) return trained.profile;
    if(/퇴사|경력|career|interpark|인터파크/.test(t)) return trained.career;
    if(/프로젝트|project|ai|ml|유전자|bio/.test(t)) return trained.projects;
    if(/연락|문의|contact|email|전화/.test(t)) return trained.contact;
    if(/cpc|ctr|클릭|지표|성과|metric/.test(t)) return trained.metrics;
    if(/법|legal|규정|컴플라이언스/.test(t)) return '법률 자문은 제공하지 않지만, 운영 정책/거버넌스 설계 경험은 프로젝트 사례로 설명할 수 있습니다.';
    return '질문 의도를 더 구체화해줘요. 예: "성과 정리", "퇴사 시점", "연락 방법", "AI 프로젝트"';
  }

  const fab=document.createElement('button'); fab.className='pc-fab'; fab.textContent='💬 Ask';
  const modal=document.createElement('div'); modal.className='pc-modal';
  modal.innerHTML=`<div class='pc-head'><strong>AI Portfolio Assistant</strong><button id='pc-close' style='background:none;border:none;color:#fff;font-size:1.1rem;cursor:pointer'>✕</button></div>
  <div class='pc-body'><div class='pc-log' id='pc-log'>안녕하세요. 제 경력/프로젝트/성과/KPI/연락 방법을 물어보세요.</div>
  <div class='pc-row'><input id='pc-input' placeholder='예: 인터파크 퇴사 시점 / AI 프로젝트 / CPC 지표'><button class='pc-send' id='pc-send'>전송</button></div></div>`;
  document.body.appendChild(fab); document.body.appendChild(modal);

  const getNum=(k)=>Number(localStorage.getItem(k)||'0');
  const setNum=(k,v)=>localStorage.setItem(k,String(v));

  function append(q,a){
    const log=modal.querySelector('#pc-log');
    log.innerHTML += `<hr style='border:none;border-top:1px solid #e2e8f0;margin:8px 0'><div><b>Q.</b> ${q}</div><div style='margin-top:3px'><b>A.</b> ${a}</div>`;
    log.scrollTop=log.scrollHeight;
  }
  function send(){
    const i=modal.querySelector('#pc-input');
    const q=(i.value||'').trim(); if(!q) return;
    append(q,answer(q)); i.value='';
    setNum('portfolio_chat_question_count', getNum('portfolio_chat_question_count')+1);
  }

  fab.addEventListener('click',()=>{modal.classList.add('on'); setNum('portfolio_chat_open_count', getNum('portfolio_chat_open_count')+1);});
  modal.querySelector('#pc-close').addEventListener('click',()=>modal.classList.remove('on'));
  modal.querySelector('#pc-send').addEventListener('click',send);
  modal.querySelector('#pc-input').addEventListener('keydown',(e)=>{if(e.key==='Enter') send();});
})();
