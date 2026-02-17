# Sprint Changelog

## Wave 1 — SEO/Content Foundation
- Standardized core meta tags across homepage/about/projects/leadership/contact.
- Added missing robots/author/keywords and social metadata quality improvements.
- Reworked structured data on homepage and contact page for richer SERP interpretation.
- Added internal linking prompts to support crawler flow and interviewer navigation.
- Added homepage interviewer quick-navigation cards.

## Wave 2 — CRM & Analytics Stack Upgrade
- Rebuilt `portfolio-analytics.js` with event taxonomy and `dataLayer` integration.
- Added UTM/referral source persistence and session id tracking.
- Added CTA, outbound click, and scroll-depth tracking.
- Rebuilt `portfolio-crm.js` with:
  - auto-source filling from UTM
  - lead scoring logic
  - duplicate lead check
  - structured analytics event on submit

## Wave 3 — Chatbot Intelligence Upgrade
- Expanded `portfolio-knowledge.json` coverage and answer quality.
- Added recommendation-style follow-up prompts per topic.
- Upgraded chatbot UI with guided question chips.
- Added HTML escaping to prevent unsafe rendering in chat log.

## Commits
- `c4d80e8` feat(seo): align metadata and strengthen schema/internal linking
- `1771e6f` feat(growth): upgrade analytics events and CRM lead scoring flow
- `3db977e` feat(chatbot): expand knowledge coverage and safer guided Q&A UX
