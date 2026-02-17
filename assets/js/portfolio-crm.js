(function () {
  const form = document.getElementById('crmContactForm');
  if (!form) return;

  const out = document.getElementById('crmResult');
  const sourceInput = form.querySelector('[name="source"]');
  const KEY = {
    leads: 'portfolio_crm_leads',
    submitCount: 'portfolio_crm_submit_count'
  };

  const getNum = (k) => Number(localStorage.getItem(k) || '0');
  const setNum = (k, v) => localStorage.setItem(k, String(v));

  const url = new URL(window.location.href);
  const q = url.searchParams;
  const autoSource = [q.get('utm_source'), q.get('utm_medium'), q.get('utm_campaign')].filter(Boolean).join(' / ');
  if (sourceInput && autoSource && !sourceInput.value) sourceInput.value = autoSource;

  function leadScore(data) {
    let score = 0;
    if (data.inquiryType === 'hiring') score += 35;
    if (data.inquiryType === 'project') score += 30;
    if (data.inquiryType === 'consulting') score += 25;
    if (data.budget === 'gt50m') score += 30;
    if (data.budget === '10m-50m') score += 20;
    if (/1주|2주|즉시|asap|immediate/i.test(data.timeline || '')) score += 15;
    if ((data.message || '').length > 80) score += 10;
    return Math.min(score, 100);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const data = {
      id: `lead_${Date.now()}`,
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      inquiryType: form.inquiryType.value,
      budget: form.budget.value,
      timeline: form.timeline.value.trim(),
      source: form.source.value.trim(),
      message: form.message.value.trim(),
      leadScore: 0,
      status: 'new',
      at: new Date().toISOString()
    };

    data.leadScore = leadScore(data);

    const arr = JSON.parse(localStorage.getItem(KEY.leads) || '[]');
    const duplicate = arr.find((x) => x.email === data.email && x.message === data.message);
    if (duplicate) {
      if (out) out.textContent = '중복 문의로 감지되어 저장하지 않았습니다. 수정 후 다시 제출해 주세요.';
      return;
    }

    arr.push(data);
    localStorage.setItem(KEY.leads, JSON.stringify(arr));
    setNum(KEY.submitCount, getNum(KEY.submitCount) + 1);

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'portfolio_crm_submit',
      inquiry_type: data.inquiryType,
      budget_band: data.budget,
      lead_score: data.leadScore,
      at: data.at
    });

    if (out) {
      out.innerHTML = `저장 완료: <strong>${arr.length}건</strong> (로컬 데모) · Lead Score: <strong>${data.leadScore}</strong>/100`;
    }
    form.reset();
    if (sourceInput && autoSource) sourceInput.value = autoSource;
  });
})();