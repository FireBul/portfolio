(function () {
  const KEY = {
    totalView: 'portfolio_view_count',
    projectClick: 'portfolio_project_click_count',
    contactClick: 'portfolio_contact_click_count',
    searchSim: 'portfolio_search_event_count',
    scroll75: 'portfolio_scroll_75_count',
    outboundClick: 'portfolio_outbound_click_count',
    ctaClick: 'portfolio_cta_click_count',
    sessionId: 'portfolio_session_id',
    trafficSource: 'portfolio_traffic_source'
  };

  const getNum = (k) => Number(localStorage.getItem(k) || '0');
  const setNum = (k, v) => localStorage.setItem(k, String(v));
  const pushEvent = (name, params) => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: name, ...params, ts: new Date().toISOString() });
  };

  const ensureSession = () => {
    let sessionId = sessionStorage.getItem(KEY.sessionId);
    if (!sessionId) {
      sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      sessionStorage.setItem(KEY.sessionId, sessionId);
    }
    return sessionId;
  };

  const detectSource = () => {
    const q = new URLSearchParams(location.search);
    const utmSource = q.get('utm_source');
    const utmMedium = q.get('utm_medium');
    const utmCampaign = q.get('utm_campaign');
    const ref = document.referrer || '';
    let refHost = 'direct';
    if (ref) {
      try { refHost = new URL(ref).hostname || 'direct'; } catch (_) { refHost = 'direct'; }
    }

    const source = {
      source: utmSource || refHost,
      medium: utmMedium || (ref ? 'referral' : 'none'),
      campaign: utmCampaign || 'not_set'
    };

    localStorage.setItem(KEY.trafficSource, JSON.stringify(source));
    return source;
  };

  const sessionId = ensureSession();
  const source = detectSource();

  setNum(KEY.totalView, getNum(KEY.totalView) + 1);
  pushEvent('portfolio_page_view', {
    page_path: location.pathname,
    page_title: document.title,
    session_id: sessionId,
    ...source
  });

  document.querySelectorAll('a[href*="project-detail"], .project-card a, .project-preview-card a').forEach((a) => {
    a.addEventListener('click', () => {
      setNum(KEY.projectClick, getNum(KEY.projectClick) + 1);
      pushEvent('portfolio_project_click', {
        href: a.getAttribute('href') || '',
        text: (a.textContent || '').trim().slice(0, 80),
        session_id: sessionId
      });
    });
  });

  document.querySelectorAll('a[href^="mailto:"], a[href^="tel:"]').forEach((a) => {
    a.addEventListener('click', () => {
      setNum(KEY.contactClick, getNum(KEY.contactClick) + 1);
      pushEvent('portfolio_contact_click', {
        href: a.getAttribute('href') || '',
        session_id: sessionId
      });
    });
  });

  document.querySelectorAll('[data-filter], input[type="search"], select').forEach((el) => {
    const handler = () => {
      setNum(KEY.searchSim, getNum(KEY.searchSim) + 1);
      pushEvent('portfolio_filter_interaction', {
        element: el.name || el.id || el.className || el.tagName,
        session_id: sessionId
      });
    };
    el.addEventListener('click', handler);
    el.addEventListener('change', handler);
  });

  document.querySelectorAll('.btn, [data-cta]').forEach((btn) => {
    btn.addEventListener('click', () => {
      setNum(KEY.ctaClick, getNum(KEY.ctaClick) + 1);
      pushEvent('portfolio_cta_click', {
        cta_text: (btn.textContent || '').trim().slice(0, 80),
        cta_href: btn.getAttribute('href') || '',
        session_id: sessionId
      });
    });
  });

  document.querySelectorAll('a[href^="http"]').forEach((a) => {
    try {
      const url = new URL(a.href);
      if (url.hostname && url.hostname !== location.hostname) {
        a.addEventListener('click', () => {
          setNum(KEY.outboundClick, getNum(KEY.outboundClick) + 1);
          pushEvent('portfolio_outbound_click', {
            target_host: url.hostname,
            href: a.href,
            session_id: sessionId
          });
        });
      }
    } catch (_) {}
  });

  let fired75 = false;
  window.addEventListener('scroll', () => {
    if (fired75) return;
    const doc = document.documentElement;
    const ratio = (doc.scrollTop + window.innerHeight) / doc.scrollHeight;
    if (ratio >= 0.75) {
      fired75 = true;
      setNum(KEY.scroll75, getNum(KEY.scroll75) + 1);
      pushEvent('portfolio_scroll_depth_75', { session_id: sessionId });
    }
  }, { passive: true });
})();