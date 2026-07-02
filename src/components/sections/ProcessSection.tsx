'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Search, Hammer, Rocket } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    number: '01',
    icon: Search,
    title: 'Audit & Map',
    desc: 'We analyse your existing workflows, identify every manual touchpoint, and map the data flows that can be automated. No guesswork — just precise engineering.',
    detail: 'Process mapping · Integration audit · ROI modelling',
    color: 'from-brand-500 to-indigo-400',
    glow: 'shadow-brand-500/20',
  },
  {
    number: '02',
    icon: Hammer,
    title: 'Build & Test',
    desc: 'Our engineers build the pipeline against real production data, stress-testing edge cases and failover logic before a single line touches your systems.',
    detail: 'LLM integration · Webhook architecture · Load testing',
    color: 'from-violet-500 to-purple-400',
    glow: 'shadow-violet-500/20',
  },
  {
    number: '03',
    icon: Rocket,
    title: 'Deploy & Monitor',
    desc: 'We ship to production with zero-downtime deployment, set up Datadog/Sentry observability, and stay on call for the first 30 days.',
    detail: 'CI/CD · Self-healing fallbacks · 24/7 alerting',
    color: 'from-emerald-500 to-teal-400',
    glow: 'shadow-emerald-500/20',
  },
];

export default function ProcessSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headingRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: headingRef.current, start: 'top 85%' },
        }
      );

      stepRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.fromTo(el,
          { opacity: 0, y: 60, scale: 0.96 },
          {
            opacity: 1, y: 0, scale: 1, duration: 0.75, ease: 'power3.out',
            delay: i * 0.15,
            scrollTrigger: { trigger: el, start: 'top 88%' },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="process"
      className="py-28 px-6 md:px-12 bg-gradient-to-b from-[#f8f7ff] to-white relative"
    >
      <div className="max-w-6xl mx-auto">

        {/* Heading */}
        <div ref={headingRef} className="max-w-2xl mb-20 opacity-0">
          <div className="mb-4 text-xs font-semibold tracking-widest text-brand-600 uppercase font-mono">
            How we work
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight mb-5">
            Three steps from idea<br />to production.
          </h2>
          <p className="text-lg text-gray-500 font-light leading-relaxed">
            No sprints that drag on for months. We move fast, build right, and hand over a system that runs itself.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map(({ number, icon: Icon, title, desc, detail, color, glow }, i) => (
            <div
              key={title}
              ref={(el) => { stepRefs.current[i] = el; }}
              className={`relative p-8 rounded-3xl bg-white border border-gray-100 shadow-xl ${glow} hover:-translate-y-2 transition-transform duration-300 opacity-0 group`}
            >
              {/* Step number */}
              <div className="text-[80px] font-extrabold leading-none text-gray-50 select-none absolute top-4 right-6 group-hover:text-gray-100 transition-colors duration-300">
                {number}
              </div>

              {/* Icon */}
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-6 shadow-lg relative z-10`}>
                <Icon className="w-6 h-6 text-white" strokeWidth={2} />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-3 relative z-10">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-5 relative z-10">{desc}</p>

              {/* Detail tags */}
              <div className="flex flex-wrap gap-2 relative z-10">
                {detail.split(' · ').map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-500 border border-gray-100"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Connector arrow (not last) */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 z-20">
                  <div className="w-8 h-8 rounded-full bg-white border border-gray-100 shadow flex items-center justify-center">
                    <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 12 12">
                      <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
