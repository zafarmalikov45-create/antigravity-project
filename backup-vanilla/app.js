// Digital Flow Main Application JavaScript
const activeFlow = {
  trigger: null,
  model: null,
  action: null
};

// Log scenarios based on user selections
const scenarios = {
  'webhook-summarize-slack': [
    { text: '[INFO] Initializing Webhook listener on /v1/webhooks/digitalflow-inbound', color: 'text-gray-400' },
    { text: '[OK] Sandbox server ready. Awaiting POST payload...', color: 'text-green-500' },
    { text: '[RECV] HTTP POST 200 payload: { "author": "Alice", "feedback": "Your AI engine is working at 60fps. Highly impressed with response times!" }', color: 'text-indigo-400' },
    { text: '[AI] Forwarding text segment to Gemini Flash core extractor...', color: 'text-yellow-400' },
    { text: '[AI] Extracting sentiment: positive (0.98 confidence)', color: 'text-yellow-400' },
    { text: '[AI] Generated summary: "User Alice reports positive feedback on WebGL rendering speed."', color: 'text-yellow-400' },
    { text: '[OUT] Dispatching Slack webhook payloads to channel #customer-feedbacks...', color: 'text-violet-400' },
    { text: '[OK] Slack webhook accepted. message_id: msg_88f912c3', color: 'text-green-500' },
    { text: '[SUCCESS] Workflow execution finished in 248ms. Memory: 42MB. Status: 0', color: 'text-green-400 font-bold' }
  ],
  'webhook-summarize-db': [
    { text: '[INFO] Initializing Webhook listener on /v1/webhooks/digitalflow-inbound', color: 'text-gray-400' },
    { text: '[OK] Sandbox server ready. Awaiting POST payload...', color: 'text-green-500' },
    { text: '[RECV] HTTP POST 200 payload: { "article_body": "Three.js utilizes WebGL to draw 3D graphics in modern browsers..." }', color: 'text-indigo-400' },
    { text: '[AI] Invoking LLM Summary extractor...', color: 'text-yellow-400' },
    { text: '[AI] Output: "WebGL uses GPUs for hardware-accelerated 3D rendering."', color: 'text-yellow-400' },
    { text: '[OUT] Connecting to PostgreSQL PGVector database target...', color: 'text-violet-400' },
    { text: '[DATA] Generating token embeddings for summary string...', color: 'text-indigo-400' },
    { text: '[DATA] Executing raw SQL: INSERT INTO embeddings_store (vector) VALUES (...);', color: 'text-green-500' },
    { text: '[SUCCESS] Workflow execution finished in 382ms. Database index sync complete.', color: 'text-green-400 font-bold' }
  ],
  'webhook-classify-slack': [
    { text: '[INFO] Initializing Webhook listener on /v1/webhooks/digitalflow-inbound', color: 'text-gray-400' },
    { text: '[RECV] Payload: { "text": "I cannot access my sandbox API tokens" }', color: 'text-indigo-400' },
    { text: '[AI] Processing classification layers...', color: 'text-yellow-400' },
    { text: '[AI] Category detected: SUPPORT_ACCESS (score: 0.94)', color: 'text-yellow-400' },
    { text: '[OUT] Dispatching alert to Slack channel #ops-support-critical...', color: 'text-violet-400' },
    { text: '[SUCCESS] Slack notification routed to alert queue. Runtime: 184ms', color: 'text-green-400 font-bold' }
  ],
  'webhook-classify-db': [
    { text: '[INFO] Initializing Webhook listener on /v1/webhooks/digitalflow-inbound', color: 'text-gray-400' },
    { text: '[RECV] Payload: { "text": "Fatal out of memory error in node instance" }', color: 'text-indigo-400' },
    { text: '[AI] Running Intent classification...', color: 'text-yellow-400' },
    { text: '[AI] Class: SYSTEM_ERROR (score: 0.99)', color: 'text-yellow-400' },
    { text: '[OUT] Writing log item into TimescaleDB time-series logs table...', color: 'text-violet-400' },
    { text: '[SUCCESS] Index update successful. Status: self-healing triggered.', color: 'text-green-400 font-bold' }
  ],
  'schedule-summarize-slack': [
    { text: '[CRON] Cron scheduler matched pattern "*/60 * * * *"', color: 'text-gray-400' },
    { text: '[INFO] Fetching hourly summary stats from transactional storage...', color: 'text-gray-400' },
    { text: '[AI] Compiling metrics: 14,220 API queries executed, 0 errors.', color: 'text-yellow-400' },
    { text: '[AI] Summarizing performance profiles...', color: 'text-yellow-400' },
    { text: '[OUT] Sending hourly digest reports to Slack executive channel...', color: 'text-violet-400' },
    { text: '[SUCCESS] Slack message sent. Digest workflow done in 512ms.', color: 'text-green-400 font-bold' }
  ],
  'schedule-summarize-db': [
    { text: '[CRON] Cron scheduler matched pattern "*/60 * * * *"', color: 'text-gray-400' },
    { text: '[INFO] Fetching records from transaction database...', color: 'text-gray-400' },
    { text: '[AI] Generating vectors and summaries for 10 inbound case files...', color: 'text-yellow-400' },
    { text: '[OUT] Executing bulk insert statement into Vector Database...', color: 'text-violet-400' },
    { text: '[SUCCESS] Database synchronizer finished. 10 files updated.', color: 'text-green-400 font-bold' }
  ],
  'schedule-classify-slack': [
    { text: '[CRON] Cron scheduler matched pattern "0 0 * * *"', color: 'text-gray-400' },
    { text: '[INFO] Ingesting yesterday\'s user logs dataset...', color: 'text-gray-400' },
    { text: '[AI] Running Intent classifier on 1,400 raw entries...', color: 'text-yellow-400' },
    { text: '[AI] Classification summary complete: 85% normal queries, 15% system alerts.', color: 'text-yellow-400' },
    { text: '[OUT] Pushing alert reports containing anomalies to Slack #security...', color: 'text-violet-400' },
    { text: '[SUCCESS] Security anomaly log cron task resolved.', color: 'text-green-400 font-bold' }
  ],
  'schedule-classify-db': [
    { text: '[CRON] Cron scheduler matched pattern "0 0 * * *"', color: 'text-gray-400' },
    { text: '[INFO] Gathering operational event logs...', color: 'text-gray-400' },
    { text: '[AI] Categorizing error classes via Zero-shot Classifier...', color: 'text-yellow-400' },
    { text: '[OUT] Writing logs classified as "CRITICAL" to recovery database...', color: 'text-violet-400' },
    { text: '[SUCCESS] Daily clean-up database task complete.', color: 'text-green-400 font-bold' }
  ]
};

// Dismiss loader once Three.js notifies ready
window.addEventListener('threejs-loaded', () => {
  const loader = document.getElementById('skeleton-loader');
  if (loader) {
    loader.style.opacity = '0';
    setTimeout(() => {
      loader.style.display = 'none';
    }, 800);
  }
});

// Fallback loader dismiss in case event misses
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('skeleton-loader');
    if (loader && loader.style.display !== 'none') {
      loader.style.opacity = '0';
      setTimeout(() => {
        loader.style.display = 'none';
      }, 800);
    }
  }, 3000);
});

// Configure Options Selection
function selectOption(category, value) {
  activeFlow[category] = value;

  // Visual state updates on buttons
  const buttons = document.querySelectorAll(`button[onclick*="'${category}'"]`);
  buttons.forEach(btn => {
    btn.classList.remove('border-brand-500', 'bg-brand-50/50', 'ring-2', 'ring-brand-500/20');
  });

  const selectedBtn = document.getElementById(`${category}-${value}`);
  if (selectedBtn) {
    selectedBtn.classList.add('border-brand-500', 'bg-brand-50/50', 'ring-2', 'ring-brand-500/20');
  }

  // Update SVG nodes active class
  const nodeEl = document.getElementById(`node-${category}`);
  if (nodeEl) {
    nodeEl.classList.add('active');
    // Change inner circle styling slightly
    nodeEl.style.fill = getCategoryColor(category);
    nodeEl.style.filter = `drop-shadow(0 0 10px ${getCategoryColor(category)})`;
  }

  // Check if connections should illuminate
  updateSVGConnections();
}

function getCategoryColor(category) {
  if (category === 'trigger') return '#10b981'; // Emerald
  if (category === 'model') return '#8b5cf6'; // Violet
  if (category === 'action') return '#6366f1'; // Indigo
  return '#cbd5e1';
}

function updateSVGConnections() {
  const line1 = document.getElementById('line1');
  const line2 = document.getElementById('line2');

  // If trigger and model are selected, activate line 1
  if (activeFlow.trigger && activeFlow.model) {
    line1.classList.add('active');
    line1.style.stroke = '#6366f1';
    line1.setAttribute('marker-end', 'url(#arrow-active)');
  } else {
    line1.classList.remove('active');
    line1.style.stroke = '#d1d5db';
    line1.setAttribute('marker-end', 'url(#arrow)');
  }

  // If model and action are selected, activate line 2
  if (activeFlow.model && activeFlow.action) {
    line2.classList.add('active');
    line2.style.stroke = '#6366f1';
    line2.setAttribute('marker-end', 'url(#arrow-active)');
  } else {
    line2.classList.remove('active');
    line2.style.stroke = '#d1d5db';
    line2.setAttribute('marker-end', 'url(#arrow)');
  }
}

// Execute the simulation pipeline
function executeFlowSim() {
  const runBtn = document.getElementById('btn-run-flow');
  const terminal = document.getElementById('terminal-stdout');

  // Guard clauses for user feedback if options are missing
  if (!activeFlow.trigger || !activeFlow.model || !activeFlow.action) {
    terminal.innerHTML = '<p class="text-red-400 font-bold">// ERROR: Cannot execute. Please select a Trigger, AI Model, and Destination first.</p>';
    // Shake the button
    runBtn.classList.add('animate-bounce');
    setTimeout(() => runBtn.classList.remove('animate-bounce'), 800);
    return;
  }

  // Set running state
  runBtn.disabled = true;
  runBtn.innerHTML = `
    <span class="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2"></span>
    Executing...
  `;

  // Start output streaming
  terminal.innerHTML = '<p class="text-gray-400 font-mono">// Connecting execution nodes...</p>';
  
  const key = `${activeFlow.trigger}-${activeFlow.model}-${activeFlow.action}`;
  const logSequence = scenarios[key] || [];

  let index = 0;
  function printNextLine() {
    if (index < logSequence.length) {
      const log = logSequence[index];
      const p = document.createElement('p');
      p.className = `font-mono ${log.color} opacity-0 translate-y-1 transition-all duration-300`;
      p.innerText = log.text;
      terminal.appendChild(p);
      terminal.scrollTop = terminal.scrollHeight;
      
      // trigger fade in
      setTimeout(() => {
        p.classList.remove('opacity-0', 'translate-y-1');
      }, 50);

      index++;
      setTimeout(printNextLine, 400 + Math.random() * 300); // realistic variance
    } else {
      // Completed state
      runBtn.disabled = false;
      runBtn.innerHTML = `
        <i data-lucide="play" class="w-4 h-4 fill-white group-hover:scale-110 transition-transform duration-200"></i>
        Run Pipeline
      `;
      // Re-create lucide icon for play button
      lucide.createIcons();
    }
  }

  setTimeout(printNextLine, 500);
}

// Form Submission handling
function handleFormSubmit(event) {
  event.preventDefault();
  
  const submitBtn = document.getElementById('btn-submit-form');
  const form = document.getElementById('request-form');
  const toast = document.getElementById('form-toast');

  submitBtn.disabled = true;
  submitBtn.innerText = 'Submitting Request...';

  // Simulate server post
  setTimeout(() => {
    // Hide form fields smoothly, display toast
    form.classList.add('hidden');
    toast.classList.remove('hidden');
    
    // Clear fields
    form.reset();
  }, 1200);
}

// Fade in elements scroll watcher using IntersectionObserver
function initScrollWatcher() {
  const cards = document.querySelectorAll('.glass-card, #playground, #services, #contact');
  
  // Set default anim state
  cards.forEach(card => {
    card.classList.add('fade-in-up');
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // trigger once
      }
    });
  }, {
    threshold: 0.05,
    rootMargin: '0px 0px -50px 0px'
  });

  cards.forEach(card => {
    observer.observe(card);
  });
}

// Header appearance change on scroll
window.addEventListener('scroll', () => {
  const header = document.querySelector('header');
  if (window.scrollY > 40) {
    header.classList.add('py-2');
    header.firstElementChild.classList.remove('glass-panel');
    header.firstElementChild.classList.add('glass-panel-heavy', 'shadow-md', 'shadow-brand-500/5');
  } else {
    header.classList.remove('py-2');
    header.firstElementChild.classList.add('glass-panel');
    header.firstElementChild.classList.remove('glass-panel-heavy', 'shadow-md', 'shadow-brand-500/5');
  }
});

// Init on load
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  initScrollWatcher();
  
  // Initialize Webhook / Summarize / Slack buttons by default to encourage running
  setTimeout(() => {
    selectOption('trigger', 'webhook');
    selectOption('model', 'summarize');
    selectOption('action', 'slack');
  }, 100);
});
