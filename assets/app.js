(() => {
  'use strict';

  if (!window.MelatoAI) throw new Error('MelatoAI widget engine was not loaded.');

  const log = document.getElementById('demo-log');
  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-input');
  const quick = document.getElementById('quick-replies');
  const voiceButton = document.getElementById('voice-button');
  const emailName = document.getElementById('email-name');
  const emailInquiry = document.getElementById('email-inquiry');
  const emailSubject = document.getElementById('email-subject');
  const emailBody = document.getElementById('email-body');
  const draftButton = document.getElementById('draft-email');
  const copyButton = document.getElementById('copy-email');
  const emailStatus = document.getElementById('email-status');

  const plannerForm = document.getElementById('service-plan-form');
  const planResult = document.getElementById('plan-result');
  const serviceTabs = [...document.querySelectorAll('.service-tab')];
  const serviceJumps = [...document.querySelectorAll('[data-jump-service]')];
  const activeServiceLabel = document.getElementById('active-service-label');
  const servicePrompt = document.getElementById('service-prompt');
  const planItem = document.getElementById('plan-item');
  const planSize = document.getElementById('plan-size');
  const planPreference = document.getElementById('plan-preference');
  const planOrder = document.getElementById('plan-order');
  const planEmail = document.getElementById('plan-email');
  const planNeed = document.getElementById('plan-need');
  const fitFields = [...document.querySelectorAll('.fit-field')];
  const orderFields = [...document.querySelectorAll('.order-field')];
  const needFields = [...document.querySelectorAll('.need-field')];
  const itemField = document.querySelector('.field-item');

  const SERVICE_META = {
    fit: { label: 'FIT DIRECTION', prompt: 'Tell us the silhouette you are aiming for.', fit: true, item: true, order: false, need: false },
    order: { label: 'ORDER SUPPORT', prompt: 'Add the details that let the order team find the right record.', fit: false, item: false, order: true, need: true },
    returns: { label: 'RETURNS + EXCHANGES', prompt: 'A few details will make the return request easier to review.', fit: false, item: false, order: true, need: true },
    delivery: { label: 'DELIVERY', prompt: 'Use the order details only if you need an order-specific answer.', fit: false, item: false, order: true, need: true },
    care: { label: 'CARE GUIDANCE', prompt: 'Choose the piece so the advice can be more specific.', fit: false, item: true, order: false, need: false },
    products: { label: 'PRODUCT DIRECTION', prompt: 'Tell us the category you are considering.', fit: false, item: true, order: false, need: false }
  };

  let activeService = 'fit';

  const escapeHtml = value => String(value || '').replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);

  const copyText = async text => {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const area = document.createElement('textarea');
    area.value = text;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    document.execCommand('copy');
    area.remove();
  };

  function addMessage(text, role, cta) {
    const bubble = document.createElement('div');
    bubble.className = `msg ${role}`;
    bubble.textContent = text;
    if (cta && cta.href) {
      const link = document.createElement('a');
      link.href = cta.href;
      link.textContent = cta.label || 'Open';
      link.target = '_blank';
      link.rel = 'noopener';
      bubble.appendChild(document.createElement('br'));
      bubble.appendChild(link);
    }
    log.appendChild(bubble);
    log.scrollTop = log.scrollHeight;
  }

  function submit(message) {
    const text = String(message || input.value || '').trim();
    if (!text) return null;
    addMessage(text, 'user');
    input.value = '';
    const result = window.MelatoAI.ask(text, { channel: 'dashboard' });
    addMessage(result.answer, 'bot', result.cta);
    return result;
  }

  function renderPlan(plan) {
    const checklist = plan.checklist.map(item => `<li>${escapeHtml(item)}</li>`).join('');
    planResult.innerHTML = `
      <div class="plan-output">
        <div class="plan-output-head">
          <div><p class="mini-label">YOUR SERVICE PLAN</p><h3>${escapeHtml(plan.title)}</h3></div>
          <span class="plan-intent">${escapeHtml(plan.intent).toUpperCase()}</span>
        </div>
        <p class="plan-summary">${escapeHtml(plan.summary)}</p>
        <div class="plan-lower">
          <div class="plan-block"><h4>WHAT TO HAVE READY</h4><ul class="plan-checklist">${checklist}</ul></div>
          <div class="plan-block"><h4>HANDOFF NOTE</h4><p class="plan-draft">${escapeHtml(plan.draft)}</p></div>
        </div>
        <div class="plan-actions">
          <a class="result-link" href="${escapeHtml(plan.cta.href)}">${escapeHtml(plan.cta.label)} <span>↗</span></a>
          <button class="copy-plan" type="button" id="copy-plan">Copy handoff note</button>
        </div>
      </div>`;

    document.getElementById('copy-plan').addEventListener('click', async event => {
      const button = event.currentTarget;
      try {
        await copyText(plan.draft);
        button.textContent = 'Copied';
      } catch {
        button.textContent = 'Copy unavailable';
      }
      window.setTimeout(() => { button.textContent = 'Copy handoff note'; }, 1400);
    });
  }

  function setActiveService(service) {
    activeService = SERVICE_META[service] ? service : 'fit';
    const meta = SERVICE_META[activeService];
    activeServiceLabel.textContent = meta.label;
    servicePrompt.textContent = meta.prompt;

    serviceTabs.forEach(tab => {
      const selected = tab.dataset.service === activeService;
      tab.classList.toggle('is-active', selected);
      tab.setAttribute('aria-selected', String(selected));
    });
    fitFields.forEach(field => field.classList.toggle('is-hidden', !meta.fit));
    orderFields.forEach(field => field.classList.toggle('is-hidden', !meta.order));
    needFields.forEach(field => field.classList.toggle('is-hidden', !meta.need));
    itemField.classList.toggle('is-hidden', !meta.item);

    planResult.innerHTML = '<div class="result-placeholder"><span class="result-orbit"></span><p>Set the details for this route, then we will assemble the most useful next step.</p></div>';
  }

  window.MelatoAI.ask('').quickReplies.forEach(label => {
    const chip = document.createElement('button');
    chip.className = 'chip';
    chip.type = 'button';
    chip.textContent = label;
    chip.addEventListener('click', () => submit(label));
    quick.appendChild(chip);
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    submit();
  });

  serviceTabs.forEach(tab => tab.addEventListener('click', () => setActiveService(tab.dataset.service)));
  serviceJumps.forEach(link => link.addEventListener('click', () => setActiveService(link.dataset.jumpService)));

  plannerForm.addEventListener('submit', event => {
    event.preventDefault();
    const plan = window.MelatoAI.createServicePlan(activeService, {
      item: planItem.value,
      usualSize: planSize.value,
      preference: planPreference.value,
      orderNumber: planOrder.value,
      email: planEmail.value,
      need: planNeed.value
    });
    renderPlan(plan);
    planResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  draftButton.addEventListener('click', () => {
    if (!emailInquiry.value.trim()) {
      emailStatus.textContent = 'Add a customer inquiry before creating a reply.';
      emailInquiry.focus();
      return;
    }
    const draft = window.MelatoAI.draftEmail(emailInquiry.value, emailName.value.trim());
    emailSubject.value = draft.subject;
    emailBody.value = draft.body;
    emailStatus.textContent = 'Draft created. Review and adjust it before sending.';
  });

  copyButton.addEventListener('click', async () => {
    if (!emailSubject.value.trim() && !emailBody.value.trim()) {
      emailStatus.textContent = 'Create a reply before copying it.';
      emailInquiry.focus();
      return;
    }
    try {
      await copyText(`Subject: ${emailSubject.value}\n\n${emailBody.value}`);
      copyButton.textContent = 'Copied';
      emailStatus.textContent = 'Email copied to the clipboard.';
    } catch {
      copyButton.textContent = 'Copy unavailable';
      emailStatus.textContent = 'Clipboard access is unavailable. Select and copy the reply manually.';
    }
    window.setTimeout(() => { copyButton.textContent = 'Copy email'; }, 1400);
  });

  voiceButton.addEventListener('click', () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addMessage('Voice recognition is not available in this browser. Type the inquiry instead.', 'bot');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-CA';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => {
      voiceButton.disabled = true;
      voiceButton.setAttribute('aria-label', 'Listening for voice input');
    };
    recognition.onresult = event => {
      const transcript = event.results[0][0].transcript;
      const result = submit(transcript);
      if (result) window.MelatoAI.speak(result.answer);
    };
    recognition.onerror = () => addMessage('I could not catch that clearly. Try again or type it in.', 'bot');
    recognition.onend = () => {
      voiceButton.disabled = false;
      voiceButton.setAttribute('aria-label', 'Start voice input');
    };
    recognition.start();
  });

  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./service-worker.js').catch(() => {});

  setActiveService(activeService);
  addMessage(window.MelatoAI.config.greeting, 'bot');
})();
