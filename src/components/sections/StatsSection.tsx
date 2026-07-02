'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { end: 4.8, suffix: 'M+', label: 'Automated tasks per day', decimals: 1 },
  { end: 12, suffix: 'ms', label: 'Average pipeline latency', decimals: 0 },
  { end: 99.98, suffix: '%', label: 'Uptime SLA guaranteed', decimals: 2 },
  { end: 40, suffix: '+', label: 'Production integrations', decimals: 0 },
];

const TECH = [
  'OpenAI', 'Anthropic', 'LangChain', 'Pinecone', 'pgvector',
  'Supabase', 'Datadog', 'Webhooks', 'Slack', 'Notion',
  'Zapier', 'Stripe', 'Postgres', 'Redis', 'Vercel',
  'OpenAI', 'Anthropic', 'LangChain', 'Pinecone', 'pgvector',
];

export default function StatsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const countRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      stats.forEach((stat, i) => {
        const el = countRefs.current[i];
        if (!el) return;
        const obj = { val: 0 };
        gsap.to(obj, {
          val: stat.end,
          duration: 1.8,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
          onUpdate() {
            el.textContent = obj.val.toFixed(stat.decimals) + stat.suffix;
          },
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="stats" className="py-20 relative overflow-hidden bg-white border-y border-gray-100">

      {/* Stats grid */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 mb-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
          {stats.map(({ suffix, label }, i) => (
            <div key={label} className="text-center px-4 py-6">
              <div className="text-4xl md:text-5xl font-extrabold text-brand-600 tabular-nums mb-2">
                <span ref={(el) => { countRefs.current[i] = el; }}>
                  {'0' + suffix}
                </span>
              </div>
              <p className="text-sm text-gray-500 font-medium leading-snug">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 mb-8" />

      {/* Marquee */}
      <div className="relative overflow-hidden">
        <div className="absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
        <div className="flex items-center gap-12 marquee-track">
          {[...TECH, ...TECH].map((name, idx) => (
            <span
              key={idx}
              className="text-sm font-semibold text-gray-400 tracking-wider uppercase whitespace-nowrap hover:text-brand-500 transition-colors duration-200"
            >
              {name}
            </span>
          ))}
        </div>
      </div>

    </section>
  );
}
