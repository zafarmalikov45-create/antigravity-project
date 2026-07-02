'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ArrowRight, ChevronDown } from 'lucide-react';

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.3 });

      tl.fromTo(badgeRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
      )
      .fromTo(line1Ref.current,
        { opacity: 0, y: 60, rotateX: -40 },
        { opacity: 1, y: 0, rotateX: 0, duration: 0.9, ease: 'power4.out' },
        '-=0.2'
      )
      .fromTo(line2Ref.current,
        { opacity: 0, y: 80, rotateX: -40, scale: 0.95 },
        { opacity: 1, y: 0, rotateX: 0, scale: 1, duration: 1, ease: 'power4.out' },
        '-=0.6'
      )
      .fromTo(subtitleRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
        '-=0.4'
      )
      .fromTo(ctaRef.current,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
        '-=0.3'
      )
      .fromTo(scrollHintRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.8 },
        '-=0.2'
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="min-h-screen flex items-center justify-center px-6 md:px-12 pt-28 pb-20 relative overflow-hidden"
      style={{ perspective: '1200px' }}
    >
      {/* Ambient glows */}
      <div className="radial-glow" style={{ top: '15%', left: '20%' }} />
      <div className="radial-glow-indigo" style={{ bottom: '20%', right: '15%' }} />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/60 pointer-events-none z-0" />

      <div className="max-w-5xl mx-auto text-center relative z-10 flex flex-col items-center">

        {/* Badge */}
        <div
          ref={badgeRef}
          className="mb-8 px-5 py-2 rounded-full glass-panel inline-flex items-center gap-2.5 text-xs font-semibold tracking-widest text-brand-700 uppercase opacity-0"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-600" />
          </span>
          AI Automation Agency
        </div>

        {/* Headline */}
        <div className="mb-8 overflow-hidden" style={{ perspective: '800px' }}>
          <span
            ref={line1Ref}
            className="block text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.05] text-gray-900 opacity-0"
          >
            We build AI that
          </span>
          <span
            ref={line2Ref}
            className="block text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.05] bg-gradient-to-r from-brand-600 via-violet-500 to-indigo-400 bg-clip-text text-transparent text-glow opacity-0"
          >
            works for you.
          </span>
        </div>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className="max-w-2xl text-lg md:text-xl text-gray-500 mb-12 leading-relaxed font-light opacity-0"
        >
          Digital Flow engineers autonomous pipelines that replace manual workflows —
          from raw data to production-grade decisions, at any scale.
        </p>

        {/* CTAs */}
        <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 mb-20 opacity-0">
          <a
            href="#contact"
            className="group px-8 py-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-semibold shadow-xl shadow-brand-500/20 hover:shadow-brand-500/35 hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
          >
            Start a Project
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </a>
          <a
            href="#services"
            className="px-8 py-4 rounded-2xl glass-panel-heavy text-gray-800 font-semibold border border-white/80 hover:border-brand-200 hover:bg-white hover:-translate-y-1 transition-all duration-300"
          >
            See Our Work
          </a>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-8 md:gap-16 max-w-lg w-full border-t border-gray-100/80 pt-8">
          {[
            { value: '4.8M+', label: 'Daily Runs' },
            { value: '12ms', label: 'Avg Latency' },
            { value: '99.98%', label: 'Uptime SLA' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-2xl md:text-3xl font-extrabold text-brand-600 tabular-nums">{value}</div>
              <div className="text-xs text-gray-400 mt-1 font-medium tracking-wide uppercase">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll hint */}
      <div ref={scrollHintRef} className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-0">
        <span className="text-xs text-gray-400 tracking-widest uppercase font-medium">Scroll</span>
        <ChevronDown className="w-4 h-4 text-gray-400 animate-bounce" />
      </div>
    </section>
  );
}
