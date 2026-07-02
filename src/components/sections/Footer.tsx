import { Cpu } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400 py-12 px-4 md:px-8 border-t border-gray-900 relative z-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gradient-to-tr from-brand-600 to-violet-500 flex items-center justify-center">
            <Cpu className="w-3 h-3 text-white" />
          </div>
          <span className="font-bold text-white tracking-tight text-sm">Digital Flow Inc.</span>
        </div>

        <p className="text-xs text-gray-600">
          &copy; 2026 Digital Flow. All rights reserved. Designed for developers.
        </p>

        <div className="flex gap-6 text-xs text-gray-500">
          <a href="#" className="hover:text-white transition-colors duration-200">Security SLA</a>
          <a href="#" className="hover:text-white transition-colors duration-200">Terms of Service</a>
          <a href="#" className="hover:text-white transition-colors duration-200">API Documentation</a>
        </div>

      </div>
    </footer>
  );
}
