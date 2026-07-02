'use client';

import { useState } from 'react';
import { BadgeCheck } from 'lucide-react';

export default function ContactSection() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
  }

  return (
    <section
      id="contact"
      className="py-24 px-4 md:px-8 bg-gradient-to-b from-white to-[#fcfbfe] relative"
    >
      <div className="radial-glow bottom-0 left-1/3" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="glass-panel-heavy rounded-3xl p-8 md:p-12 border border-white/80 shadow-xl flex flex-col gap-8 md:gap-10">

          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
              Request API Access
            </h2>
            <p className="text-gray-500 text-sm">
              Tell us about your automation goals. Our core engineers will review your requirements
              and provide Sandbox API keys within 24 hours.
            </p>
          </div>

          {!submitted ? (
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="flex flex-col gap-2">
                <label htmlFor="contact-name" className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  id="contact-name"
                  required
                  placeholder="Alexander Wright"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200 outline-none text-sm"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="contact-email" className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Work Email
                </label>
                <input
                  type="email"
                  id="contact-email"
                  required
                  placeholder="alex@techfirm.io"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200 outline-none text-sm"
                />
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <label htmlFor="contact-engine" className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Preferred AI Core Model
                </label>
                <select
                  id="contact-engine"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200 outline-none text-sm appearance-none"
                >
                  <option value="gemini-flash">Gemini Flash (Ultra fast execution, summaries)</option>
                  <option value="gpt-4o">GPT-4o (High-level reasoning &amp; agents)</option>
                  <option value="claude-sonnet">Claude Sonnet 4 (Advanced coding &amp; logic)</option>
                </select>
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <label htmlFor="contact-desc" className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Describe your automation pipelines
                </label>
                <textarea
                  id="contact-desc"
                  rows={4}
                  required
                  placeholder="Detail the integrations (SaaS tools, Webhooks, Vector Stores) and trigger logic you intend to orchestrate..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200 outline-none text-sm resize-none"
                />
              </div>

              <div className="md:col-span-2 flex justify-center mt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-4 w-full md:w-auto rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-md shadow-brand-500/10 hover:shadow-brand-500/25 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting...' : 'Submit Access Request'}
                </button>
              </div>
            </form>
          ) : (
            <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
              <BadgeCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">Access Request Submitted!</p>
                <p className="text-xs text-emerald-700/80">
                  Check your email. We have generated a temporary API sandbox token for you.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
