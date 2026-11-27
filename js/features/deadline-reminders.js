/**
 * ScholarFinder — Deadline Reminders
 * Prevents missed applications with browser notifications & reminder banners.
 */
(function () {
  'use strict';

  const REMINDERS_KEY = 'scholarfinder_reminders';

  function loadReminders() {
    try { return JSON.parse(localStorage.getItem(REMINDERS_KEY) || '{}'); } catch { return {}; }
  }

  function saveReminders(r) {
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(r));
  }

  function setReminder(scholarshipId, deadline, name) {
    const reminders = loadReminders();
    reminders[scholarshipId] = { deadline, name, setAt: new Date().toISOString() };
    saveReminders(reminders);
    updateRemindersBanner();

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  function removeReminder(scholarshipId) {
    const reminders = loadReminders();
    delete reminders[scholarshipId];
    saveReminders(reminders);
    updateRemindersBanner();
  }

  function hasReminder(scholarshipId) {
    return !!loadReminders()[scholarshipId];
  }

  function checkUpcomingDeadlines() {
    const reminders = loadReminders();
    const now = new Date();
    const upcoming = [];
    const expired = [];

    for (const [id, r] of Object.entries(reminders)) {
      const deadline = new Date(r.deadline);
      const daysLeft = Math.ceil((deadline - now) / 86400000);

      if (daysLeft < 0) {
        expired.push(id);
      } else if (daysLeft <= 7) {
        upcoming.push({ id, ...r, daysLeft });
      }
    }

    // Clean expired
    if (expired.length) {
      expired.forEach(id => delete reminders[id]);
      saveReminders(reminders);
    }

    // Send browser notifications for urgent ones (≤3 days)
    upcoming.filter(u => u.daysLeft <= 3).forEach(u => {
      sendNotification(u.name, u.daysLeft, u.deadline);
    });

    return upcoming;
  }

  function sendNotification(name, daysLeft, deadline) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const key = `notified_${deadline}`;
      const today = new Date().toDateString();
      if (sessionStorage.getItem(key) === today) return; // Avoid spamming

      new Notification('⏰ ScholarFinder Deadline Reminder', {
        body: `"${name}" deadline is in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}! Apply now.`,
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🎓</text></svg>'
      });
      sessionStorage.setItem(key, today);
    }
  }

  function updateRemindersBanner() {
    const banner = document.getElementById('remindersBanner');
    if (!banner) return;

    const upcoming = checkUpcomingDeadlines();
    if (upcoming.length === 0) {
      banner.classList.add('hidden');
      return;
    }

    banner.classList.remove('hidden');
    banner.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4 flex-wrap">
        <div class="flex items-center gap-3">
          <span class="text-lg">⏰</span>
          <div>
            <span class="text-sm font-semibold text-amber-900" data-i18n="deadline_alert">Deadline Alert!</span>
            <span class="text-sm text-amber-800">
              ${upcoming.map(u => `<strong>${u.name.length > 40 ? u.name.slice(0, 40) + '...' : u.name}</strong> (${u.daysLeft}d left)`).join(' · ')}
            </span>
          </div>
        </div>
        <button onclick="this.parentElement.parentElement.classList.add('hidden')" class="text-amber-600 hover:text-amber-800 text-sm font-semibold">Dismiss</button>
      </div>
    `;
  }

  function injectReminderButtons(SF) {
    const cards = document.querySelectorAll('.scholarship-card');
    const scholarships = SF.state.filteredScholarships;

    cards.forEach((card, i) => {
      if (!scholarships[i] || !scholarships[i].deadline_2026_27) return;
      const s = scholarships[i];
      const deadline = new Date(s.deadline_2026_27);
      if (deadline < new Date()) return; // Skip past deadlines

      const existing = card.querySelector('.reminder-btn');
      if (existing) return;

      const actionRow = card.querySelector('.flex.items-center.gap-2.pt-1');
      if (!actionRow) return;

      const isSet = hasReminder(s.id);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `reminder-btn p-2 rounded-xl border ${isSet ? 'border-amber-300 bg-amber-50 text-amber-600' : 'border-slate-200 text-slate-400 hover:text-amber-500 hover:bg-slate-50'} transition-colors`;
      btn.title = isSet ? 'Reminder set — click to remove' : 'Set deadline reminder';
      btn.innerHTML = `<svg class="w-4 h-4" fill="${isSet ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>`;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (hasReminder(s.id)) {
          removeReminder(s.id);
          btn.className = 'reminder-btn p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-amber-500 hover:bg-slate-50 transition-colors';
          btn.title = 'Set deadline reminder';
          btn.querySelector('svg').setAttribute('fill', 'none');
        } else {
          setReminder(s.id, s.deadline_2026_27, s.name);
          btn.className = 'reminder-btn p-2 rounded-xl border border-amber-300 bg-amber-50 text-amber-600 transition-colors';
          btn.title = 'Reminder set — click to remove';
          btn.querySelector('svg').setAttribute('fill', 'currentColor');

          // Toast feedback
          const toast = document.createElement('div');
          toast.className = 'fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-amber-500 text-white text-sm font-semibold shadow-lg flex items-center gap-2 animate-bounce';
          toast.textContent = `⏰ Reminder set for ${s.deadline_2026_27}`;
          document.body.appendChild(toast);
          setTimeout(() => toast.remove(), 3000);
        }
      });

      actionRow.appendChild(btn);
    });
  }

  // Enhance modal with reminder button
  function enhanceModalReminder(SF) {
    const origOpen = SF.openModal;
    SF.openModal = function (scholarship) {
      origOpen(scholarship);
      if (!scholarship.deadline_2026_27) return;
      const deadline = new Date(scholarship.deadline_2026_27);
      if (deadline < new Date()) return;

      const footer = document.querySelector('#detailsModal .px-6.py-4.bg-slate-50');
      if (footer && !footer.querySelector('.modal-reminder-btn')) {
        const isSet = hasReminder(scholarship.id);
        const btn = document.createElement('button');
        btn.className = `modal-reminder-btn px-3 py-2.5 rounded-xl border ${isSet ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'} text-sm font-semibold flex items-center gap-1.5 transition-colors`;
        btn.innerHTML = `<svg class="w-4 h-4" fill="${isSet ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg><span>${isSet ? 'Reminder Set' : 'Set Reminder'}</span>`;
        btn.addEventListener('click', () => {
          if (hasReminder(scholarship.id)) {
            removeReminder(scholarship.id);
            btn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg><span>Set Reminder</span>`;
            btn.classList.remove('border-amber-300', 'bg-amber-50', 'text-amber-700');
            btn.classList.add('border-slate-200', 'bg-white', 'text-slate-600');
          } else {
            setReminder(scholarship.id, scholarship.deadline_2026_27, scholarship.name);
            btn.innerHTML = `<svg class="w-4 h-4" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg><span>Reminder Set</span>`;
            btn.classList.add('border-amber-300', 'bg-amber-50', 'text-amber-700');
            btn.classList.remove('border-slate-200', 'bg-white', 'text-slate-600');
          }
        });
        const actionDiv = footer.querySelector('.flex.items-center.gap-2');
        if (actionDiv) actionDiv.insertBefore(btn, actionDiv.firstChild);
      }
    };
  }

  function initDeadlineReminders() {
    const SF = window.ScholarFinder;
    if (!SF) return;

    // Check on load
    updateRemindersBanner();

    // Request notification permission proactively
    if ('Notification' in window && Notification.permission === 'default') {
      // Don't auto-request, wait for user action
    }

    // Monkey-patch renderCards
    const origRender = SF.renderCards;
    SF.renderCards = function () {
      origRender();
      setTimeout(() => injectReminderButtons(SF), 90);
    };

    enhanceModalReminder(SF);
    setTimeout(() => injectReminderButtons(SF), 250);

    // Periodic check every 5 minutes
    setInterval(updateRemindersBanner, 300000);

    console.log('✅ Deadline Reminders initialized');
  }

  document.addEventListener('scholarfinder:ready', initDeadlineReminders);
  if (window.ScholarFinder) initDeadlineReminders();
})();
