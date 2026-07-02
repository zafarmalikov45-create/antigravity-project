'use client';

import { useRef, useState } from 'react';
import { Eye, Play, Radio, Clock, Sparkles, ListFilter, MessageSquare, Database } from 'lucide-react';
import Terminal, { type TerminalHandle, type LogLine } from '@/components/features/Terminal';

type TriggerKey = 'webhook' | 'schedule' | null;
type ModelKey = 'summarize' | 'classify' | null;
type ActionKey = 'slack' | 'db' | null;

interface PipelineState {
  trigger: TriggerKey;
  model: ModelKey;
  action: ActionKey;
}

const LOG_SCRIPTS: Record<string, LogLine[]> = {
  'webhook+summarize+slack': [
    { text: '[trigger] POST /webhook/run received — payload 2.4 KB', color: 'text-emerald-400' },
    { text: '[pipeline] Dispatching to LLM Summary & Extract block...', color: 'text-blue-400' },
    { text: '[model] Tokens in: 312 | Temperature: 0.4 | Model: claude-3-opus', color: 'text-gray-400' },
    { text: '[model] Summary generated: "Q3 sales report highlights 22% YoY growth..."', color: 'text-violet-300' },
    { text: '[action] Posting to #alerts — Slack API v2.1 — 200 OK', color: 'text-emerald-400' },
    { text: '[pipeline] ✓ Completed in 812ms — Exit 0', color: 'text-green-300 font-bold' },
  ],
  'webhook+classify+slack': [
    { text: '[trigger] POST /webhook/run received — payload 1.1 KB', color: 'text-emerald-400' },
    { text: '[pipeline] Dispatching to Intent Classifier block...', color: 'text-blue-400' },
    { text: '[model] Tokens in: 88 | Category result: "support_escalation"', color: 'text-violet-300' },
    { text: '[action] Posting to #alerts — Slack API v2.1 — 200 OK', color: 'text-emerald-400' },
    { text: '[pipeline] ✓ Completed in 540ms — Exit 0', color: 'text-green-300 font-bold' },
  ],
  'webhook+summarize+db': [
    { text: '[trigger] POST /webhook/run received — payload 2.4 KB', color: 'text-emerald-400' },
    { text: '[pipeline] Dispatching to LLM Summary & Extract block...', color: 'text-blue-400' },
    { text: '[model] Extracted fields: { title, summary, sentiment, tags }', color: 'text-violet-300' },
    { text: '[action] Upserting to pgvector — embedding dims: 1536', color: 'text-blue-300' },
    { text: '[db] INSERT ON CONFLICT DO UPDATE — 1 row affected', color: 'text-gray-400' },
    { text: '[pipeline] ✓ Completed in 1024ms — Exit 0', color: 'text-green-300 font-bold' },
  ],
  'webhook+classify+db': [
    { text: '[trigger] POST /webhook/run received — payload 1.1 KB', color: 'text-emerald-400' },
    { text: '[model] Category: "feature_request" | Confidence: 0.94', color: 'text-violet-300' },
    { text: '[db] Upserting classification row to Supabase — 200 OK', color: 'text-blue-300' },
    { text: '[pipeline] ✓ Completed in 640ms — Exit 0', color: 'text-green-300 font-bold' },
  ],
  'schedule+summarize+slack': [
    { text: '[trigger] Cron tick — 0 * * * * (every hour)', color: 'text-emerald-400' },
    { text: '[pipeline] Fetching latest 50 rows from data source...', color: 'text-blue-400' },
    { text: '[model] Digest summary generated for 50 records', color: 'text-violet-300' },
    { text: '[action] Slack digest posted to #daily-summary', color: 'text-emerald-400' },
    { text: '[pipeline] ✓ Scheduled run complete — Exit 0', color: 'text-green-300 font-bold' },
  ],
  'schedule+summarize+db': [
    { text: '[trigger] Cron tick — 0 * * * *', color: 'text-emerald-400' },
    { text: '[model] Batch summarizing 50 records...', color: 'text-blue-400' },
    { text: '[db] Bulk upsert 50 embeddings — pgvector', color: 'text-blue-300' },
    { text: '[pipeline] ✓ Batch run complete — Exit 0', color: 'text-green-300 font-bold' },
  ],
  'schedule+classify+slack': [
    { text: '[trigger] Cron tick — 0 * * * *', color: 'text-emerald-400' },
    { text: '[model] Classifying 50 incoming events...', color: 'text-blue-400' },
    { text: '[action] 12 escalations → #alerts, 38 logged', color: 'text-emerald-400' },
    { text: '[pipeline] ✓ Batch classification complete — Exit 0', color: 'text-green-300 font-bold' },
  ],
  'schedule+classify+db': [
    { text: '[trigger] Cron tick — 0 * * * *', color: 'text-emerald-400' },
    { text: '[model] Classifying 50 records...', color: 'text-blue-400' },
    { text: '[db] 50 rows upserted with category labels', color: 'text-blue-300' },
    { text: '[pipeline] ✓ Complete — Exit 0', color: 'text-green-300 font-bold' },
  ],
};

export default function PlaygroundSection() {
  const [state, setState] = useState<PipelineState>({ trigger: null, model: null, action: null });
  const [running, setRunning] = useState(false);
  const [activeNodes, setActiveNodes] = useState({ trigger: true, model: false, action: false });
  const termRef = useRef<TerminalHandle>(null);

  function select(key: keyof PipelineState, value: string) {
    setState((prev) => ({ ...prev, [key]: value as never }));
  }

  function runPipeline() {
    if (running) return;
    if (!state.trigger || !state.model || !state.action) {
      termRef.current?.printError('// Error: Select all three pipeline nodes before running.');
      return;
    }

    setRunning(true);
    setActiveNodes({ trigger: true, model: false, action: false });
    const key = `${state.trigger}+${state.model}+${state.action}`;
    const lines = LOG_SCRIPTS[key] ?? [
      { text: '[pipeline] Running custom configuration...', color: 'text-blue-400' },
      { text: '[pipeline] ✓ Completed — Exit 0', color: 'text-green-300 font-bold' },
    ];

    setTimeout(() => setActiveNodes({ trigger: true, model: true, action: false }), 600);
    setTimeout(() => setActiveNodes({ trigger: true, model: true, action: true }), 1200);

    termRef.current?.streamLogs(lines, () => setRunning(false));
  }

  const optBtn = (group: keyof PipelineState, value: string) =>
    `option-btn px-4 py-3 rounded-xl border text-left transition-all duration-200 flex items-center justify-between ${
      state[group] === value
        ? 'border-brand-500 bg-brand-50 shadow-sm shadow-brand-500/10'
        : 'border-gray-200 bg-white hover:border-brand-400'
    }`;

  const nodeClass = (active: boolean) =>
    active
      ? 'node-circle fill-brand-500 stroke-white stroke-[3px] [filter:drop-shadow(0_0_12px_rgba(99,102,241,0.6))]'
      : 'node-circle fill-gray-100 stroke-gray-300 stroke-2';

  const lineClass = (active: boolean) =>
    `connector-line ${active ? 'active' : ''}`;

  return (
    <section
      id="playground"
      className="py-24 px-4 md:px-8 bg-gradient-to-b from-[#fcfbfe] to-[#f4f3f8] relative"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
            Interactive AI Workspace
          </h2>
          <p className="max-w-xl mx-auto text-gray-500 text-lg">
            Build, test, and trace an AI automation flow in real-time. Configure the components
            below and run the engine.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 glass-panel-heavy p-4 md:p-8 rounded-3xl border border-white/60 shadow-xl">

          {/* Config Panels */}
          <div className="lg:col-span-4 flex flex-col gap-6">

            {/* Trigger */}
            <div className="p-5 rounded-2xl bg-white/50 border border-white/80 shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                <span className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center text-white text-xs font-bold">1</span>
                <h3 className="font-bold text-gray-800">Select Input Trigger</h3>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <button className={optBtn('trigger', 'webhook')} onClick={() => select('trigger', 'webhook')}>
                  <div>
                    <p className="font-semibold text-sm text-gray-800">Webhook POST</p>
                    <p className="text-xs text-gray-400">Triggers on HTTP endpoint payload</p>
                  </div>
                  <Radio className="w-4 h-4 text-emerald-500 shrink-0" />
                </button>
                <button className={optBtn('trigger', 'schedule')} onClick={() => select('trigger', 'schedule')}>
                  <div>
                    <p className="font-semibold text-sm text-gray-800">Cron Scheduler</p>
                    <p className="text-xs text-gray-400">Runs every 1 hour / daily</p>
                  </div>
                  <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                </button>
              </div>
            </div>

            {/* Model */}
            <div className="p-5 rounded-2xl bg-white/50 border border-white/80 shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                <span className="w-6 h-6 rounded-lg bg-brand-500 flex items-center justify-center text-white text-xs font-bold">2</span>
                <h3 className="font-bold text-gray-800">Select AI Model Block</h3>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <button className={optBtn('model', 'summarize')} onClick={() => select('model', 'summarize')}>
                  <div>
                    <p className="font-semibold text-sm text-gray-800">LLM Summary & Extract</p>
                    <p className="text-xs text-gray-400">Extract fields and generate summaries</p>
                  </div>
                  <Sparkles className="w-4 h-4 text-brand-500 shrink-0" />
                </button>
                <button className={optBtn('model', 'classify')} onClick={() => select('model', 'classify')}>
                  <div>
                    <p className="font-semibold text-sm text-gray-800">Intent Classifier</p>
                    <p className="text-xs text-gray-400">Categorize incoming text logs</p>
                  </div>
                  <ListFilter className="w-4 h-4 text-gray-400 shrink-0" />
                </button>
              </div>
            </div>

            {/* Action */}
            <div className="p-5 rounded-2xl bg-white/50 border border-white/80 shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                <span className="w-6 h-6 rounded-lg bg-violet-500 flex items-center justify-center text-white text-xs font-bold">3</span>
                <h3 className="font-bold text-gray-800">Select Destination Action</h3>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <button className={optBtn('action', 'slack')} onClick={() => select('action', 'slack')}>
                  <div>
                    <p className="font-semibold text-sm text-gray-800">Post Slack Notification</p>
                    <p className="text-xs text-gray-400">Send summary details into channel</p>
                  </div>
                  <MessageSquare className="w-4 h-4 text-violet-500 shrink-0" />
                </button>
                <button className={optBtn('action', 'db')} onClick={() => select('action', 'db')}>
                  <div>
                    <p className="font-semibold text-sm text-gray-800">Upsert Database (SQL/Vector)</p>
                    <p className="text-xs text-gray-400">Index content into production db</p>
                  </div>
                  <Database className="w-4 h-4 text-gray-400 shrink-0" />
                </button>
              </div>
            </div>

          </div>

          {/* Visualization + Terminal */}
          <div className="lg:col-span-8 flex flex-col gap-6 h-full justify-between">

            {/* Flow Graph */}
            <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm flex-grow flex flex-col min-h-[350px] relative">
              <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Eye className="w-4 h-4 text-brand-600" />
                Live Flow Graph
              </h4>

              <div className="w-full flex-grow flex items-center justify-center bg-gray-50/50 rounded-xl relative overflow-hidden border border-dashed border-gray-200">
                {/* Dot grid */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#6366f1_1.5px,transparent_1.5px)] [background-size:16px_16px]" />

                <svg id="flow-svg" className="w-full h-full min-h-[250px]" viewBox="0 0 600 250">
                  <defs>
                    <marker id="arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 1 L 10 5 L 0 9 z" fill="#d1d5db" />
                    </marker>
                    <marker id="arrow-active" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 1 L 10 5 L 0 9 z" fill="#6366f1" />
                    </marker>
                  </defs>

                  <path
                    d="M 120 125 C 200 125, 200 125, 300 125"
                    stroke={activeNodes.model ? '#6366f1' : '#d1d5db'}
                    strokeWidth="2.5"
                    fill="none"
                    className={lineClass(activeNodes.model)}
                    markerEnd={activeNodes.model ? 'url(#arrow-active)' : 'url(#arrow)'}
                  />
                  <path
                    d="M 300 125 C 400 125, 400 125, 480 125"
                    stroke={activeNodes.action ? '#6366f1' : '#d1d5db'}
                    strokeWidth="2.5"
                    fill="none"
                    className={lineClass(activeNodes.action)}
                    markerEnd={activeNodes.action ? 'url(#arrow-active)' : 'url(#arrow)'}
                  />

                  {/* Trigger Node */}
                  <g transform="translate(120, 125)">
                    <circle r="26" className={nodeClass(activeNodes.trigger)} />
                    <circle r="14" className="fill-white" />
                    <image href="https://api.iconify.design/lucide:zap.svg?color=%236366f1" x="-8" y="-8" width="16" height="16" className="opacity-80" />
                    <text y="42" textAnchor="middle" className="text-xs font-semibold fill-gray-600 font-sans tracking-wide" style={{ fontSize: 10 }}>Trigger</text>
                  </g>

                  {/* Model Node */}
                  <g transform="translate(300, 125)">
                    <circle r="26" className={nodeClass(activeNodes.model)} />
                    <circle r="14" className="fill-white" />
                    <image href="https://api.iconify.design/lucide:brain.svg?color=%238b5cf6" x="-8" y="-8" width="16" height="16" className="opacity-80" />
                    <text y="42" textAnchor="middle" className="text-xs font-semibold fill-gray-600 font-sans tracking-wide" style={{ fontSize: 10 }}>AI Model</text>
                  </g>

                  {/* Action Node */}
                  <g transform="translate(480, 125)">
                    <circle r="26" className={nodeClass(activeNodes.action)} />
                    <circle r="14" className="fill-white" />
                    <image href="https://api.iconify.design/lucide:terminal.svg?color=%234f46e5" x="-8" y="-8" width="16" height="16" className="opacity-80" />
                    <text y="42" textAnchor="middle" className="text-xs font-semibold fill-gray-600 font-sans tracking-wide" style={{ fontSize: 10 }}>Destination</text>
                  </g>
                </svg>

                {/* Run button */}
                <div className="absolute bottom-4 right-4">
                  <button
                    onClick={runPipeline}
                    disabled={running}
                    className="px-6 py-2.5 rounded-full bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md hover:shadow-brand-500/25 transition-all duration-300 flex items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Play className="w-4 h-4 fill-white group-hover:scale-110 transition-transform duration-200" />
                    {running ? 'Running...' : 'Run Pipeline'}
                  </button>
                </div>
              </div>
            </div>

            <Terminal ref={termRef} />
          </div>
        </div>
      </div>
    </section>
  );
}
