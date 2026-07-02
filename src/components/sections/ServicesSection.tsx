import { Network, DatabaseBackup, CodeXml, ShieldAlert } from 'lucide-react';

const capabilities = [
  {
    icon: Network,
    color: 'bg-brand-50 text-brand-600',
    title: 'LLM Routing',
    desc: 'Route complex user queries to optimized smaller models dynamically, cutting API expenses by up to 75%.',
  },
  {
    icon: DatabaseBackup,
    color: 'bg-violet-50 text-violet-600',
    title: 'Vector Synchronization',
    desc: 'Real-time data ingestion pipelines sync operational SQL rows to vector stores (Pinecone, pgvector) incrementally.',
  },
  {
    icon: CodeXml,
    color: 'bg-indigo-50 text-indigo-600',
    title: 'Webhook Middleware',
    desc: 'Native developer libraries format, clean, and enrich incoming webhooks prior to dispatching them to downstream models.',
  },
  {
    icon: ShieldAlert,
    color: 'bg-emerald-50 text-emerald-600',
    title: 'Self-Healing Traces',
    desc: 'System errors trigger automatic fallback routes, logging errors to Datadog/Sentry while serving cached responses.',
  },
];

const metrics = [
  { value: '4.8M+', label: 'Daily Runs', note: 'Sustained system execution throughput.', color: 'text-brand-600' },
  { value: '12ms', label: 'Avg Overhead', note: 'Unnoticeable pipeline latency additions.', color: 'text-violet-600' },
  { value: '99.98%', label: 'Execution SLA', note: 'Guaranteed node retry reliability.', color: 'text-emerald-500' },
];

export default function ServicesSection() {
  return (
    <section id="services" className="py-28 px-4 md:px-8 relative bg-white">
      <div className="max-w-7xl mx-auto relative z-10">

        <div className="max-w-3xl mb-20">
          <div className="mb-4 text-xs font-semibold tracking-wider text-brand-600 uppercase font-mono">
            Capabilities
          </div>
          <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-none mb-6">
            Engineered for high-scale workflows
          </h2>
          <p className="text-lg text-gray-500 font-light leading-relaxed">
            From data extraction pipelines to autonomous user agent loops, our systems execute
            automated operations with low latency and native resilience.
          </p>
        </div>

        {/* Capability cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {capabilities.map(({ icon: Icon, color, title, desc }) => (
            <div
              key={title}
              className="p-8 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white transition-all duration-300 group hover:shadow-lg hover:shadow-brand-500/5"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300 ${color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-xl mb-2 text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Metrics */}
        <div className="mt-20 grid grid-cols-1 lg:grid-cols-3 gap-8 pt-16 border-t border-gray-100">
          <div className="lg:col-span-1">
            <h4 className="text-2xl font-bold text-gray-900 mb-2">Proven Metrics</h4>
            <p className="text-gray-500 text-sm">
              Real-world production outcomes achieved for developer-focused platforms running
              Digital Flow automation layers.
            </p>
          </div>
          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-6">
            {metrics.map(({ value, label, note, color }) => (
              <div key={label}>
                <div className={`text-4xl md:text-5xl font-extrabold mb-2 ${color}`}>{value}</div>
                <div className="text-sm font-semibold text-gray-800">{label}</div>
                <p className="text-xs text-gray-400 mt-1">{note}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
