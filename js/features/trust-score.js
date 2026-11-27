/**
 * ScholarFinder — Fake Scholarship Warning / Trust Score
 * Flags suspicious or unverified sources; shows trust badges.
 */
(function () {
  'use strict';

  // Verified government and official domains
  const TRUSTED_DOMAINS = [
    'scholarships.gov.in', 'myscheme.gov.in', 'education.gov.in', 'socialjustice.gov.in',
    'aicte-india.org', 'ugc.ac.in', 'tribal.nic.in', 'disabilityaffairs.gov.in',
    'medhavikalyan.mp.gov.in', 'scholarship.up.gov.in', 'mahadbt.maharashtra.gov.in',
    'ssp.postmatric.karnataka.gov.in', 'scholarship.rajasthan.gov.in', 'pmsonline.bihar.gov.in',
    'svmcm.wbhed.gov.in', 'digitalgujarat.gov.in', 'ksb.gov.in', 'dst.gov.in',
    'pgscholarship.aicte-india.org', 'sje.rajasthan.gov.in',
    'pudhumaipenn.tn.gov.in', 'escholarship.tn.gov.in', 'jnanabhumi.ap.gov.in',
    'telanganaepass.cgg.gov.in', 'dcescholarship.kerala.gov.in', 'scholarship.odisha.gov.in',
    'scholarships.punjab.gov.in', 'harchhatravratti.highereduhry.ac.in',
    'directorateofhighereducation.assam.gov.in', 'edistrict.delhigovt.nic.in',
    'hpepass.cgg.gov.in', 'ekalyan.cgg.gov.in', 'postmatric-scholarship.cg.nic.in',
    'csirnet.nta.ac.in', 'ugcnet.nta.ac.in', 'nosmsje.gov.in', 'overseas.tribal.gov.in',
    'warb-mha.gov.in', 'nhfdc.nic.in', 'indianrailways.gov.in', 'vidyalakshmi.co.in',
    'main.icmr.nic.in', 'online-inspire.gov.in', 'dbtindia.gov.in', 'barc.gov.in',
    'brns.res.in', 'rac.gov.in', 'pmrf.in', 'transgender.dosje.gov.in',
    'dsel.education.gov.in', 'ayjnih.nic.in', 'wbmdfcscholarship.in',
    'wbkanyashree.gov.in', 'oasis.gov.in', 'sjsa.maharashtra.gov.in',
    'scholarshipportal.mp.nic.in', 'mysy.guj.nic.in', 'kanyakelavani.org',
    'hte.rajasthan.gov.in', 'bcwd.karnataka.gov.in', 'abhyuday.up.gov.in',
    'medhasoft.bih.nic.in', '7nishchay-yuvaupmission.bihar.gov.in'
  ];

  const VERIFIED_PORTALS = [
    'scholarships.reliancefoundation.org', 'kotakeducationfoundation.org', 'parivartanecss.com',
    'licindia.in', 'ongcscholar.org', 'santoorscholarship.com', 'buddy4study.com'
  ];

  const KNOWN_AGGREGATORS = [
    'buddy4study.com', 'careers360.com', 'careerindia.com', 'collegechalo.com',
    'internshala.com', 'pw.live', 'amarujala.com', 'sarkariyojana.com', 'schemesinindia.in'
  ];

  function getDomain(url) {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch { return ''; }
  }

  function calculateTrustScore(scholarship) {
    let score = 0;
    const reasons = [];

    // 1. Official portal domain
    const portalDomain = getDomain(scholarship.official_portal || '');
    if (TRUSTED_DOMAINS.some(d => portalDomain.includes(d))) {
      score += 40;
      reasons.push({ positive: true, text: 'Official government portal' });
    } else if (VERIFIED_PORTALS.some(d => portalDomain.includes(d))) {
      score += 35;
      reasons.push({ positive: true, text: 'Verified corporate/CSR portal' });
    } else if (portalDomain.endsWith('.gov.in') || portalDomain.endsWith('.nic.in') || portalDomain.endsWith('.ac.in')) {
      score += 30;
      reasons.push({ positive: true, text: 'Government/academic domain' });
    } else if (portalDomain) {
      score += 10;
      reasons.push({ positive: false, text: 'Portal is not a recognized government domain' });
    } else {
      reasons.push({ positive: false, text: 'No official portal URL provided' });
    }

    // 2. Source URL verification
    const sourceDomain = getDomain(scholarship.source_url || '');
    if (TRUSTED_DOMAINS.some(d => sourceDomain.includes(d))) {
      score += 20;
      reasons.push({ positive: true, text: 'Source from official website' });
    } else if (KNOWN_AGGREGATORS.some(d => sourceDomain.includes(d))) {
      score += 15;
      reasons.push({ positive: true, text: 'Source from known education portal' });
    } else if (sourceDomain) {
      score += 5;
      reasons.push({ positive: false, text: 'Source website is not a recognized portal' });
    }

    // 3. Provider credibility
    const provider = (scholarship.provider || '').toLowerCase();
    if (provider.includes('ministry') || provider.includes('government') || provider.includes('department')) {
      score += 20;
      reasons.push({ positive: true, text: 'Government ministry/department provider' });
    } else if (provider.includes('ugc') || provider.includes('aicte') || provider.includes('dst')) {
      score += 20;
      reasons.push({ positive: true, text: 'National regulatory body' });
    } else if (provider.includes('private') || provider.includes('csr') || provider.includes('foundation')) {
      score += 15;
      reasons.push({ positive: true, text: 'Known CSR/Foundation provider' });
    } else {
      score += 5;
    }

    // 4. Data completeness
    let complete = 0;
    if (scholarship.name) complete++;
    if (scholarship.provider) complete++;
    if (scholarship.level && scholarship.level.length) complete++;
    if (scholarship.official_portal) complete++;
    if (scholarship.source_url) complete++;
    if (scholarship.amount_text || scholarship.amount_per_year_inr) complete++;
    if (scholarship.categories && scholarship.categories.length) complete++;

    const completeness = (complete / 7) * 20;
    score += completeness;
    if (completeness >= 15) {
      reasons.push({ positive: true, text: 'Complete scholarship details available' });
    } else {
      reasons.push({ positive: false, text: 'Some scholarship details are incomplete' });
    }

    score = Math.min(100, Math.round(score));

    return { score, reasons, level: score >= 80 ? 'verified' : score >= 50 ? 'moderate' : 'caution' };
  }

  function getTrustBadge(trust) {
    const configs = {
      verified: { icon: '🛡️', label: 'Verified', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
      moderate: { icon: '⚠️', label: 'Verify Source', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
      caution: { icon: '🚨', label: 'Unverified', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' }
    };
    const c = configs[trust.level] || configs.caution;
    return `<span class="trust-badge inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${c.bg} ${c.text} ${c.border} border cursor-pointer" title="Trust Score: ${trust.score}/100 — Click for details">
      <span>${c.icon}</span>
      <span>${c.label}</span>
    </span>`;
  }

  function showTrustDetails(scholarship, trust) {
    const SF = window.ScholarFinder;
    const modal = document.getElementById('trustDetailModal');
    if (!modal) return;

    const levelColors = {
      verified: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', bar: 'bg-emerald-500' },
      moderate: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', bar: 'bg-amber-500' },
      caution: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', bar: 'bg-red-500' }
    };
    const c = levelColors[trust.level];

    modal.querySelector('.modal-content').innerHTML = `
      <div class="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-start justify-between">
        <div>
          <h2 class="text-lg font-bold">Trust & Verification Report</h2>
          <p class="text-xs text-indigo-200 mt-1">${SF.escapeHtml(scholarship.name)}</p>
        </div>
        <button onclick="document.getElementById('trustDetailModal').classList.add('modal-hidden'); document.body.style.overflow='';" class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="p-6 space-y-5 overflow-y-auto flex-1">
        <div class="flex items-center gap-4 p-4 rounded-xl ${c.bg} border ${c.border}">
          <div class="text-3xl font-black ${c.text}">${trust.score}/100</div>
          <div>
            <div class="text-sm font-bold ${c.text}">${trust.level === 'verified' ? '🛡️ Verified Source' : trust.level === 'moderate' ? '⚠️ Partially Verified' : '🚨 Exercise Caution'}</div>
            <div class="text-xs ${c.text} opacity-75">Based on domain verification, provider credibility & data completeness</div>
          </div>
        </div>
        <div class="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div class="h-3 rounded-full ${c.bar} transition-all duration-500" style="width: ${trust.score}%"></div>
        </div>
        <div class="space-y-2.5">
          ${trust.reasons.map(r => `
            <div class="flex items-start gap-2.5 p-3 rounded-xl border ${r.positive ? 'bg-emerald-50/50 border-emerald-200/60' : 'bg-red-50/50 border-red-200/60'}">
              <span class="mt-0.5">${r.positive ? '✅' : '⚠️'}</span>
              <span class="text-sm text-slate-700">${r.text}</span>
            </div>
          `).join('')}
        </div>
        ${trust.level === 'caution' ? `
        <div class="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800">
          <strong>⚠️ Warning:</strong> This scholarship could not be fully verified. Always check the official government portal (scholarships.gov.in) before sharing personal information or paying any fees. Legitimate scholarships never charge application fees.
        </div>` : ''}
        <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
          <strong>Portal:</strong> ${SF.escapeHtml(scholarship.official_portal || 'Not provided')}<br>
          <strong>Source:</strong> ${SF.escapeHtml(scholarship.source_url || 'Not provided')}
        </div>
      </div>
    `;

    modal.classList.remove('modal-hidden');
    document.body.style.overflow = 'hidden';
  }

  function injectTrustBadges(SF) {
    const cards = document.querySelectorAll('.scholarship-card');
    const scholarships = SF.state.filteredScholarships;

    cards.forEach((card, i) => {
      if (!scholarships[i]) return;
      const existing = card.querySelector('.trust-badge');
      if (existing) existing.parentElement.removeChild(existing);

      const trust = calculateTrustScore(scholarships[i]);
      const actionRow = card.querySelector('.space-y-1\\.5.text-xs');
      if (actionRow) {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = getTrustBadge(trust);
        const badge = wrapper.firstElementChild;
        badge.addEventListener('click', (e) => {
          e.stopPropagation();
          showTrustDetails(scholarships[i], trust);
        });
        const topRow = card.querySelector('.flex.items-start.justify-between');
        if (topRow) {
          topRow.querySelector('span:first-child').after(badge);
        }
      }
    });
  }

  function initTrustScore() {
    const SF = window.ScholarFinder;
    if (!SF) return;

    // Monkey-patch renderCards
    const origRender = SF.renderCards;
    SF.renderCards = function () {
      origRender();
      setTimeout(() => injectTrustBadges(SF), 80);
    };

    setTimeout(() => injectTrustBadges(SF), 200);

    console.log('✅ Trust Score / Fake Warning module initialized');
  }

  document.addEventListener('scholarfinder:ready', initTrustScore);
  if (window.ScholarFinder) initTrustScore();
})();
