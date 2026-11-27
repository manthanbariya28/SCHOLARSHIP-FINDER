/**
 * ScholarFinder — Feedback System
 * Star ratings and comments to improve recommendation quality.
 */
(function () {
  'use strict';

  const FEEDBACK_KEY = 'scholarfinder_feedback';

  function loadAllFeedback() {
    try { return JSON.parse(localStorage.getItem(FEEDBACK_KEY) || '{}'); } catch { return {}; }
  }

  function saveFeedback(scholarshipId, rating, comment) {
    const all = loadAllFeedback();
    if (!all[scholarshipId]) all[scholarshipId] = { ratings: [], comments: [] };
    all[scholarshipId].ratings.push(rating);
    if (comment && comment.trim()) {
      all[scholarshipId].comments.push({ text: comment.trim(), date: new Date().toISOString() });
    }
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(all));
  }

  function getFeedback(scholarshipId) {
    const all = loadAllFeedback();
    const fb = all[scholarshipId];
    if (!fb || !fb.ratings.length) return null;
    const avg = fb.ratings.reduce((a, b) => a + b, 0) / fb.ratings.length;
    return { avgRating: Math.round(avg * 10) / 10, totalRatings: fb.ratings.length, comments: fb.comments || [] };
  }

  function renderStars(rating, interactive = false, size = 'w-5 h-5') {
    let html = '';
    for (let i = 1; i <= 5; i++) {
      const filled = i <= Math.round(rating);
      html += `<svg class="${size} ${interactive ? 'cursor-pointer feedback-star' : ''} ${filled ? 'text-amber-400' : 'text-slate-300'} transition-colors" data-rating="${i}" fill="${filled ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>`;
    }
    return html;
  }

  function injectFeedbackOnCards(SF) {
    const cards = document.querySelectorAll('.scholarship-card');
    const scholarships = SF.state.filteredScholarships;

    cards.forEach((card, i) => {
      if (!scholarships[i]) return;
      const existing = card.querySelector('.card-feedback');
      if (existing) return;

      const fb = getFeedback(scholarships[i].id);
      if (!fb) return;

      const fbDiv = document.createElement('div');
      fbDiv.className = 'card-feedback flex items-center gap-1.5 text-xs text-slate-500 mt-1';
      fbDiv.innerHTML = `
        <div class="flex items-center gap-0.5">${renderStars(fb.avgRating, false, 'w-3 h-3')}</div>
        <span class="font-medium">${fb.avgRating}</span>
        <span>(${fb.totalRatings})</span>
      `;

      const criteriaGrid = card.querySelector('.space-y-1\\.5.text-xs');
      if (criteriaGrid) {
        criteriaGrid.parentElement.insertBefore(fbDiv, criteriaGrid);
      }
    });
  }

  function enhanceModalWithFeedback(SF) {
    const origOpen = SF.openModal;
    SF.openModal = function (scholarship) {
      origOpen(scholarship);

      const modalBody = document.querySelector('#detailsModal .p-6.space-y-6');
      if (!modalBody) return;

      // Remove existing feedback section
      const existing = modalBody.querySelector('#modalFeedbackSection');
      if (existing) existing.remove();

      const fb = getFeedback(scholarship.id);
      let selectedRating = 0;

      const section = document.createElement('div');
      section.id = 'modalFeedbackSection';
      section.className = 'pt-4 border-t border-slate-200/80';
      section.innerHTML = `
        <div class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3" data-i18n="feedback_title">Rate & Review This Scholarship</div>
        ${fb ? `
          <div class="flex items-center gap-3 mb-3 p-3 rounded-xl bg-amber-50 border border-amber-200/60">
            <div class="flex items-center gap-0.5">${renderStars(fb.avgRating, false, 'w-4 h-4')}</div>
            <span class="text-sm font-bold text-amber-700">${fb.avgRating}/5</span>
            <span class="text-xs text-amber-600">(${fb.totalRatings} rating${fb.totalRatings !== 1 ? 's' : ''})</span>
          </div>
          ${fb.comments.length > 0 ? `
            <div class="space-y-2 mb-4 max-h-32 overflow-y-auto">
              ${fb.comments.slice(-3).map(c => `
                <div class="p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 text-xs text-slate-600">
                  <span class="text-slate-400">${new Date(c.date).toLocaleDateString('en-IN')}</span> — ${SF.escapeHtml(c.text)}
                </div>
              `).join('')}
            </div>
          ` : ''}
        ` : '<p class="text-xs text-slate-400 mb-3">No reviews yet. Be the first!</p>'}
        
        <div class="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200/60">
          <div class="flex items-center gap-2">
            <span class="text-xs font-semibold text-slate-600">Your Rating:</span>
            <div id="feedbackStarsContainer" class="flex items-center gap-0.5">
              ${renderStars(0, true)}
            </div>
            <span id="feedbackRatingLabel" class="text-xs font-bold text-indigo-600 ml-1"></span>
          </div>
          <textarea id="feedbackComment" placeholder="Share your experience or tips for other students..." rows="2" class="w-full text-sm rounded-xl border border-slate-200 p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"></textarea>
          <button id="submitFeedbackBtn" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled>
            Submit Review
          </button>
        </div>
      `;

      modalBody.appendChild(section);

      // Star interaction
      const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
      const starsContainer = section.querySelector('#feedbackStarsContainer');
      const ratingLabel = section.querySelector('#feedbackRatingLabel');
      const submitBtn = section.querySelector('#submitFeedbackBtn');

      starsContainer.querySelectorAll('.feedback-star').forEach(star => {
        star.addEventListener('mouseenter', () => {
          const r = parseInt(star.dataset.rating);
          highlightStars(starsContainer, r);
          ratingLabel.textContent = ratingLabels[r] || '';
        });

        star.addEventListener('click', () => {
          selectedRating = parseInt(star.dataset.rating);
          highlightStars(starsContainer, selectedRating);
          ratingLabel.textContent = ratingLabels[selectedRating] || '';
          submitBtn.disabled = false;
        });
      });

      starsContainer.addEventListener('mouseleave', () => {
        highlightStars(starsContainer, selectedRating);
        ratingLabel.textContent = selectedRating ? ratingLabels[selectedRating] : '';
      });

      submitBtn.addEventListener('click', () => {
        if (!selectedRating) return;
        const comment = section.querySelector('#feedbackComment').value;
        saveFeedback(scholarship.id, selectedRating, comment);

        // Success message
        section.querySelector('.space-y-3').innerHTML = `
          <div class="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <span class="font-semibold">Thank you! Your review has been submitted.</span>
          </div>
        `;

        // Refresh cards to show updated ratings
        setTimeout(() => SF.renderCards(), 500);
      });
    };
  }

  function highlightStars(container, rating) {
    container.querySelectorAll('.feedback-star').forEach(star => {
      const r = parseInt(star.dataset.rating);
      if (r <= rating) {
        star.classList.add('text-amber-400');
        star.classList.remove('text-slate-300');
        star.setAttribute('fill', 'currentColor');
      } else {
        star.classList.remove('text-amber-400');
        star.classList.add('text-slate-300');
        star.setAttribute('fill', 'none');
      }
    });
  }

  function initFeedback() {
    const SF = window.ScholarFinder;
    if (!SF) return;

    enhanceModalWithFeedback(SF);

    // Monkey-patch renderCards
    const origRender = SF.renderCards;
    SF.renderCards = function () {
      origRender();
      setTimeout(() => injectFeedbackOnCards(SF), 100);
    };

    setTimeout(() => injectFeedbackOnCards(SF), 300);

    console.log('✅ Feedback System initialized');
  }

  document.addEventListener('scholarfinder:ready', initFeedback);
  if (window.ScholarFinder) initFeedback();
})();
