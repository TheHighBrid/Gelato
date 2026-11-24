(() => {
  if (!window.MelatoAI) throw new Error('MelatoAI widget engine was not loaded.');

  const [log, form, input, quick, voiceButton, emailName, emailInquiry, emailSubject, emailBody, draftButton, copyButton, emailStatus, plannerForm, planResult, activeServiceLabel, servicePrompt, planItem, planSize, planPreference, planOrder, planEmail, planNeed] =
    ['demo-log', 'chat-form', 'chat-input', 'quick-replies', 'voice-button', 'email-name', 'email-inquiry', 'email-subject', 'email-body', 'draft-email', 'copy-email', 'email-status', 'service-plan-form', 'plan-result', 'active-service-label', 'service-prompt', 'plan-item', 'plan-size', 'plan-preference', 'plan-order', 'plan-email', 'plan-need'].map(id => document.getElementById(id));

  const serviceTabs = [...document.querySelectorAll('.service-tab')];
  const serviceJumps = [...document.querySelectorAll('[data-jump-service]')];
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

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = String(text ?? '');
    return node;
  }

  function safeHref(value) {
    try {
      const url = new URL(String(value), window.location.href);
      if (['https:', 'http:', 'mailto:'].includes(url.protocol)) return url.href;
    } catch {
      return '/pages/contact';
    }
    return '/pages/contact';
  }

  async function copyText(text) {
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
    try {
      if (!document.execCommand('copy')) throw new Error('Copy failed');
    } finally {
      area.remove();
    }
  }

  function addMessage(text, role, cta) {
    const bubble = document.createElement('div');
    bubble.className = `msg ${role}`;
    bubble.textContent = text;
    if (cta?.href) {
      const link = document.createElement('a');
      link.href = safeHref(cta.href);
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

  function planHeading(plan) {
    const heading = element('div', 'plan-output-head');
    const title = element('div');
    title.append(element('p', 'mini-label', 'YOUR SERVICE PLAN'), element('h3', '', plan.title));
    heading.append(title, element('span', 'plan-intent', String(plan.intent ?? '').toUpperCase()));
    return heading;
  }

  function planDetails(plan) {
    const lower = element('div', 'plan-lower');
    const ready = element('div', 'plan-block');
    const checklist = element('ul', 'plan-checklist');
    for (const item of plan.checklist) checklist.append(element('li', '', item));
    ready.append(element('h4', '', 'WHAT TO HAVE READY'), checklist);
    const note = element('div', 'plan-block');
    note.append(element('h4', '', 'HANDOFF NOTE'), element('p', 'plan-draft', plan.draft));
    lower.append(ready, note);
    return lower;
  }

  function planActions(plan) {
    const actions = element('div', 'plan-actions');
    const link = element('a', 'result-link', plan.cta.label);
    link.href = safeHref(plan.cta.href);
    link.append(element('span', '', '↗'));
    const copy = element('button', 'copy-plan', 'Copy handoff note');
    copy.type = 'button';
    copy.id = 'copy-plan';
    copy.addEventListener('click', async event => {
      const button = event.currentTarget;
      try {
        await copyText(plan.draft);
        button.textContent = 'Copied';
      } catch {
        button.textContent = 'Copy unavailable';
      }
      window.setTimeout(() => { button.textContent = 'Copy handoff note'; }, 1400);
    });
    actions.append(link, copy);
    return actions;
  }

  function renderPlan(plan) {
    const output = element('div', 'plan-output');
    output.append(planHeading(plan), element('p', 'plan-summary', plan.summary), planDetails(plan), planActions(plan));
    planResult.replaceChildren(output);
  }

  function setActiveService(service) {
    const selected = Object.entries(SERVICE_META).find(([key]) => key === service);
    activeService = selected ? selected[0] : 'fit';
    const meta = selected ? selected[1] : SERVICE_META.fit;
    activeServiceLabel.textContent = meta.label;
    servicePrompt.textContent = meta.prompt;

    serviceTabs.forEach(tab => {
      const selected = tab.dataset.service === activeService;
      tab.classList.toggle('is-active', selected);
      tab.setAttribute('aria-selected', String(selected));
    });
    fitFields.forEach(field => { field.classList.toggle('is-hidden', !meta.fit); });
    orderFields.forEach(field => { field.classList.toggle('is-hidden', !meta.order); });
    needFields.forEach(field => { field.classList.toggle('is-hidden', !meta.need); });
    itemField.classList.toggle('is-hidden', !meta.item);

    const placeholder = element('div', 'result-placeholder');
    placeholder.append(element('span', 'result-orbit'), element('p', '', 'Set the details for this route, then we will assemble the most useful next step.'));
    planResult.replaceChildren(placeholder);
  }

  window.MelatoAI.ask('').quickReplies.forEach(label => {
    const chip = document.createElement('button');
    chip.className = 'chip';
    chip.type = 'button';
    chip.textContent = label;
    chip.addEventListener('click', () => { submit(label); });
    quick.appendChild(chip);
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    submit();
  });

  serviceTabs.forEach(tab => { tab.addEventListener('click', () => { setActiveService(tab.dataset.service); }); });
  serviceJumps.forEach(link => { link.addEventListener('click', () => { setActiveService(link.dataset.jumpService); }); });

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

  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./service-worker.js').catch(error => {
    console.warn('Melato offline support is unavailable.', error);
  });

  setActiveService(activeService);
  addMessage(window.MelatoAI.config.greeting, 'bot');
})();
