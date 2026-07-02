'use client';

import { useEffect, useState } from 'react';
import { Cpu } from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 w-full z-40 px-4 md:px-8 transition-all duration-300 ${scrolled ? 'py-2' : 'py-4'}`}>
      <nav className={`max-w-7xl mx-auto px-6 py-3 rounded-full flex items-center justify-between ${scrolled ? 'glass-panel-heavy shadow-md' : 'glass-panel'}`}>
        <a href="#" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-violet-500 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform duration-300">
            <Cpu className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-brand-600 via-brand-700 to-violet-600 bg-clip-text text-transparent">
            Digital Flow
          </span>
        </a>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <a href="#hero" className="hover:text-brand-600 transition-colors duration-200">Engine</a>
          <a href="#playground" className="hover:text-brand-600 transition-colors duration-200">Playground</a>
          <a href="#services" className="hover:text-brand-600 transition-colors duration-200">Capabilities</a>
          <a href="#contact" className="hover:text-brand-600 transition-colors duration-200">Integration</a>
        </div>

        <a
          href="#playground"
          className="px-5 py-2 text-sm font-semibold rounded-full bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 transition-all duration-300 inline-block"
        >
          Launch Playground
        </a>
      </nav>
    </header>
  );
}
