/**
 * ScholarFinder — Scholarship Alert System
 * Manages active notifications, deadline urgency alerts, and user alert preferences.
 */
(function () {
  'use strict';

  const ALERTS_PREF_KEY = 'scholarfinder_alert_preferences';

  function loadPreferences() {
    try {
      return JSON.parse(localStorage.getItem(ALERTS_PREF_KEY)) || {
        email: '',
        notifyDeadlines: true,
        notifyNewSchemes: true,
        urgentThresholdDays: 7,
        selectedCategories: ['ALL']
      };
    } catch {
      return { email: '', notifyDeadlines: true, notifyNewSchemes: true, urgentThresholdDays: 7, selectedCategories: ['ALL'] };
    }
  }

  function savePreferences(p) {
    localStorage.setItem(ALERTS_PREF_KEY, JSON.stringify(p));
  }

  function getActiveAlerts() {
    const SF = window.ScholarFinder;
    if (!SF || !SF.state) return [];

    const scholarships = SF.state.allScholarships;
    const now = new Date();
    const alerts = [];

    scholarships.forEach(s => {
      // 1. Deadline Alerts
      if (s.deadline_2026_27) {
        const dl = new Date(s.deadline_2026_27);
        const daysLeft = Math.ceil((dl - now) / 86400000);

        if (daysLeft >= 0 && daysLeft <= 14) {
          alerts.push({
            id: `alert-dl-${s.id}`,
            scholarshipId: s.id,
            title: `Deadline Closing Soon: ${s.name}`,
            type: daysLeft <= 3 ? 'urgent' : 'warning',
            message: `Only ${daysLeft} day${daysLeft !== 1 ? 's' : ''} left before application window closes on ${s.deadline_2026_27}.`,
            badge: `${daysLeft}d left`,
            link: s.official_portal,
            deadline: s.deadline_2026_27,
            scholarship: s
          });
        }
      }

      // 2. Open schemes with active verification
      if (s.status === 'open_verify_date' && !s.deadline_2026_27) {
        alerts.push({
          id: `alert-open-${s.id}`,
          scholarshipId: s.id,
          title: `Application Cycle Active: ${s.name}`,
          type: 'info',
          message: `Portal is accepting applications and student verifications. Submit documents before quota fills.`,
          badge: 'Open Now',
          link: s.official_portal,
          scholarship: s
        });
      }
    });

    // Sort urgent alerts first
    alerts.sort((a, b) => {
      if (a.type === 'urgent') return -1;
      if (b.type === 'urgent') return 1;
      return 0;
    });

    return alerts;
  }

  function updateBellBadge() {
    const badge = document.getElementById('alertCountBadge');
    if (!badge) return;

    const alerts = getActiveAlerts();
    if (alerts.length > 0) {
      badge.textContent = alerts.length;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }

  function openAlertsModal() {
    const modal = document.getElementById('alertsModal');
    if (!modal) return;

    const SF = window.ScholarFinder;
    const alerts = getActiveAlerts();
    const pref = loadPreferences();

    modal.querySelector('.modal-content').innerHTML = `
      <div class="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-start justify-between">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/30 text-amber-200 border border-amber-400/30">Notification Center</span>
          </div>
          <h2 class="text-xl font-bold tracking-tight">Scholarship Alerts & Updates</h2>
          <p class="text-xs text-indigo-200 mt-0.5">Real-time alerts for impending deadlines, portal openings, and scheme renewals.</p>
        </div>
        <button id="closeAlertsModal" class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Tabs -->
      <div class="px-6 pt-3 border-b border-slate-200 bg-white flex items-center gap-4">
        <button id="tabAlertsList" class="px-3 py-2 border-b-2 border-indigo-600 text-indigo-600 text-xs font-bold transition-colors">
          Active Alerts (${alerts.length})
        </button>
        <button id="tabAlertsSettings" class="px-3 py-2 border-b-2 border-transparent text-slate-500 hover:text-slate-800 text-xs font-bold transition-colors">
          Alert Preferences
        </button>
      </div>

      <!-- Tab Content 1: Alerts List -->
      <div id="alertsListContent" class="p-6 overflow-y-auto max-h-[60vh] space-y-3">
        ${alerts.length === 0 ? `
          <div class="p-8 text-center text-slate-400">
            <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2 text-xl">🎉</div>
            <p class="text-sm font-semibold text-slate-700">No urgent deadlines right now!</p>
            <p class="text-xs mt-1">Check back later or configure your alert preferences.</p>
          </div>
        ` : alerts.map(a => {
          const typeClasses = {
            urgent: 'bg-red-50 border-red-200 text-red-800',
            warning: 'bg-amber-50 border-amber-200 text-amber-800',
            info: 'bg-indigo-50 border-indigo-200 text-indigo-800'
          };
          const badgeClasses = {
            urgent: 'bg-red-200/80 text-red-900 border-red-300',
            warning: 'bg-amber-200/80 text-amber-900 border-amber-300',
            info: 'bg-indigo-200/80 text-indigo-900 border-indigo-300'
          };
          return `
            <div class="p-3.5 rounded-xl border ${typeClasses[a.type] || typeClasses.info} flex items-start justify-between gap-3 transition-all hover:shadow-xs">
              <div class="space-y-1 min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-bold truncate">${SF.escapeHtml(a.title)}</span>
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeClasses[a.type]}">${a.badge}</span>
                </div>
                <p class="text-xs opacity-90 leading-relaxed">${SF.escapeHtml(a.message)}</p>
              </div>
              <button 
                class="view-alert-scholarship-btn shrink-0 px-3 py-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-800 text-xs font-bold shadow-2xs border border-black/10 transition-colors"
                data-id="${a.scholarshipId}"
              >
                View
              </button>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Tab Content 2: Settings (Hidden initially) -->
      <div id="alertsSettingsContent" class="hidden p-6 overflow-y-auto max-h-[60vh] space-y-4 text-xs">
        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <h4 class="font-bold text-slate-900 text-sm">Email Alert Digest (Simulated)</h4>
          <p class="text-slate-600">Receive an email notification when a scholarship matching your profile opens or is 7 days from closing.</p>
          <div class="flex items-center gap-2">
            <input 
              type="email" 
              id="alertEmailInput" 
              placeholder="Enter your student email..." 
              value="${SF.escapeHtml(pref.email)}" 
              class="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
            <button id="saveAlertEmailBtn" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors">
              Save
            </button>
          </div>
          <span id="emailSaveFeedback" class="hidden text-[11px] font-semibold text-emerald-600">✓ Email preferences saved locally!</span>
        </div>

        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
          <h4 class="font-bold text-slate-900 text-sm">Browser Push Notifications</h4>
          <p class="text-slate-600">Get instant alerts on your desktop when application deadlines approach.</p>
          <button id="requestPushPermissionBtn" class="px-4 py-2 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold transition-colors">
            Enable Push Notifications
          </button>
        </div>
      </div>

      <div class="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
        <span>Alerts update continuously based on live deadline data.</span>
        <button id="dismissAlertsBtn" class="px-4 py-2 bg-slate-900 hover:bg-indigo-600 text-white font-semibold rounded-xl transition-colors">
          Close
        </button>
      </div>
    `;

    // Hook tab switches
    const tabList = modal.querySelector('#tabAlertsList');
    const tabSettings = modal.querySelector('#tabAlertsSettings');
    const contentList = modal.querySelector('#alertsListContent');
    const contentSettings = modal.querySelector('#alertsSettingsContent');

    tabList.addEventListener('click', () => {
      tabList.classList.add('border-indigo-600', 'text-indigo-600');
      tabList.classList.remove('border-transparent', 'text-slate-500');
      tabSettings.classList.remove('border-indigo-600', 'text-indigo-600');
      tabSettings.classList.add('border-transparent', 'text-slate-500');
      contentList.classList.remove('hidden');
      contentSettings.classList.add('hidden');
    });

    tabSettings.addEventListener('click', () => {
      tabSettings.classList.add('border-indigo-600', 'text-indigo-600');
      tabSettings.classList.remove('border-transparent', 'text-slate-500');
      tabList.classList.remove('border-indigo-600', 'text-indigo-600');
      tabList.classList.add('border-transparent', 'text-slate-500');
      contentSettings.classList.remove('hidden');
      contentList.classList.add('hidden');
    });

    // View button
    modal.querySelectorAll('.view-alert-scholarship-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const s = SF.state.allScholarships.find(item => item.id === id);
        if (s) {
          modal.classList.add('modal-hidden');
          document.body.style.overflow = '';
          SF.openModal(s);
        }
      });
    });

    // Save Email
    const emailInput = modal.querySelector('#alertEmailInput');
    const saveEmailBtn = modal.querySelector('#saveAlertEmailBtn');
    const feedback = modal.querySelector('#emailSaveFeedback');

    saveEmailBtn.addEventListener('click', () => {
      const email = emailInput.value.trim();
      const currentPref = loadPreferences();
      currentPref.email = email;
      savePreferences(currentPref);
      feedback.classList.remove('hidden');
      setTimeout(() => feedback.classList.add('hidden'), 3000);
    });

    // Push permission
    const pushBtn = modal.querySelector('#requestPushPermissionBtn');
    pushBtn.addEventListener('click', () => {
      if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            pushBtn.textContent = '✓ Push Notifications Enabled';
            pushBtn.classList.replace('bg-slate-900', 'bg-emerald-600');
            new Notification('🔔 ScholarFinder Alerts Active', {
              body: 'You will receive critical updates on upcoming scholarship deadlines!',
              icon: 'https://scholarships.gov.in/favicon.ico'
            });
          } else {
            alert('Notification permission was not granted. Please enable in browser settings.');
          }
        });
      }
    });

    // Close
    modal.querySelector('#closeAlertsModal').addEventListener('click', () => {
      modal.classList.add('modal-hidden');
      document.body.style.overflow = '';
    });
    modal.querySelector('#dismissAlertsBtn').addEventListener('click', () => {
      modal.classList.add('modal-hidden');
      document.body.style.overflow = '';
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('modal-hidden');
        document.body.style.overflow = '';
      }
    });

    modal.classList.remove('modal-hidden');
    document.body.style.overflow = 'hidden';
  }

  function initAlerts() {
    const btn = document.getElementById('alertBellBtn');
    if (btn) {
      btn.addEventListener('click', openAlertsModal);
    }
    updateBellBadge();
    console.log('✅ Scholarship Alert System initialized');
  }

  window.ScholarFinderAlerts = { openAlertsModal, getActiveAlerts, updateBellBadge };

  document.addEventListener('scholarfinder:ready', initAlerts);
  if (window.ScholarFinder) initAlerts();
})();
