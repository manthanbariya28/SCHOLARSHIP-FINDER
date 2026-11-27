/**
 * ScholarFinder — Voice Search
 * Search scholarships using voice via Web Speech API.
 */
(function () {
  'use strict';

  function initVoiceSearch() {
    const SF = window.ScholarFinder;
    if (!SF) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const voiceBtn = document.getElementById('voiceSearchBtn');
    if (!voiceBtn) return;

    if (!SpeechRecognition) {
      voiceBtn.title = 'Voice search not supported in this browser';
      voiceBtn.classList.add('opacity-30', 'cursor-not-allowed');
      voiceBtn.disabled = true;
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    let isListening = false;
    const input = document.getElementById('heroSearchInput');
    const micIcon = voiceBtn.querySelector('.mic-icon');
    const pulseRing = voiceBtn.querySelector('.pulse-ring');

    voiceBtn.addEventListener('click', () => {
      if (isListening) {
        recognition.stop();
        return;
      }

      recognition.start();
    });

    recognition.addEventListener('start', () => {
      isListening = true;
      voiceBtn.classList.add('voice-active');
      if (micIcon) micIcon.classList.add('text-red-500');
      if (pulseRing) pulseRing.classList.remove('hidden');
      input.placeholder = '🎙️ Listening... speak your search query';
      input.classList.add('ring-2', 'ring-red-400');
    });

    recognition.addEventListener('result', (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      input.value = transcript;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });

    recognition.addEventListener('end', () => {
      isListening = false;
      voiceBtn.classList.remove('voice-active');
      if (micIcon) micIcon.classList.remove('text-red-500');
      if (pulseRing) pulseRing.classList.add('hidden');
      input.placeholder = 'Search by scheme name, course, or keyword (e.g. AICTE, Pragati, Post-Matric)...';
      input.classList.remove('ring-2', 'ring-red-400');

      // Trigger search
      if (input.value.trim()) {
        SF.state.filters.search = input.value.trim().toLowerCase();
        const clearBtn = document.getElementById('clearSearchBtn');
        if (clearBtn) clearBtn.classList.remove('hidden');
        SF.applyFiltersAndRender();
      }
    });

    recognition.addEventListener('error', (event) => {
      isListening = false;
      voiceBtn.classList.remove('voice-active');
      if (micIcon) micIcon.classList.remove('text-red-500');
      if (pulseRing) pulseRing.classList.add('hidden');
      input.placeholder = 'Search by scheme name, course, or keyword (e.g. AICTE, Pragati, Post-Matric)...';
      input.classList.remove('ring-2', 'ring-red-400');

      if (event.error === 'not-allowed') {
        alert('Microphone access denied. Please allow microphone permission in your browser settings.');
      }
    });

    voiceBtn.classList.remove('hidden');
    console.log('✅ Voice Search initialized');
  }

  document.addEventListener('scholarfinder:ready', initVoiceSearch);
  if (window.ScholarFinder) initVoiceSearch();
})();
