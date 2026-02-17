(function(){
  const form=document.getElementById('crmContactForm');
  if(!form) return;
  const out=document.getElementById('crmResult');
  const getNum=(k)=>Number(localStorage.getItem(k)||'0');
  const setNum=(k,v)=>localStorage.setItem(k,String(v));

  form.addEventListener('submit',function(e){
    e.preventDefault();
    const data={
      name:form.name.value.trim(),
      email:form.email.value.trim(),
      inquiryType:form.inquiryType.value,
      budget:form.budget.value,
      timeline:form.timeline.value,
      source:form.source.value,
      message:form.message.value.trim(),
      at:new Date().toISOString()
    };
    const key='portfolio_crm_leads';
    const arr=JSON.parse(localStorage.getItem(key)||'[]');
    arr.push(data);
    localStorage.setItem(key,JSON.stringify(arr));
    setNum('portfolio_crm_submit_count', getNum('portfolio_crm_submit_count')+1);
    if(out) out.textContent=`저장 완료: ${arr.length}건 (로컬 데모)`;
    form.reset();
  });
})();
