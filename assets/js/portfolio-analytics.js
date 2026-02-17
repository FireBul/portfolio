(function () {
  const key = {
    totalView: 'portfolio_view_count',
    projectClick: 'portfolio_project_click_count',
    contactClick: 'portfolio_contact_click_count',
    searchSim: 'portfolio_search_event_count'
  };

  const getNum = (k) => Number(localStorage.getItem(k) || '0');
  const setNum = (k, v) => localStorage.setItem(k, String(v));

  // page view
  setNum(key.totalView, getNum(key.totalView) + 1);

  // project clicks
  document.querySelectorAll('a[href*="project-detail"], .project-card a, .project-preview-card a').forEach((a) => {
    a.addEventListener('click', () => setNum(key.projectClick, getNum(key.projectClick) + 1));
  });

  // contact clicks
  document.querySelectorAll('a[href^="mailto:"], a[href^="tel:"]').forEach((a) => {
    a.addEventListener('click', () => setNum(key.contactClick, getNum(key.contactClick) + 1));
  });

  // search-like interactions (filter/search controls)
  document.querySelectorAll('[data-filter], input[type="search"]').forEach((el) => {
    el.addEventListener('click', () => setNum(key.searchSim, getNum(key.searchSim) + 1));
    el.addEventListener('change', () => setNum(key.searchSim, getNum(key.searchSim) + 1));
  });
})();
