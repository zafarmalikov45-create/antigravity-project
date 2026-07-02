'use client';

import { useEffect, useRef, useState } from 'react';

export default function SkeletonLoader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const onLoaded = () => {
      setVisible(false);
    };
    window.addEventListener('threejs-loaded', onLoaded);

    // Fallback: dismiss after 4s
    const timer = setTimeout(() => setVisible(false), 4000);

    return () => {
      window.removeEventListener('threejs-loaded', onLoaded);
      clearTimeout(timer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      id="skeleton-loader"
      className="fixed inset-0 bg-white z-[9999] flex flex-col justify-center items-center transition-opacity duration-700"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <div className="w-full max-w-4xl px-8 flex flex-col gap-6">
        <div className="h-8 w-48 shimmer rounded-md" />
        <div className="h-24 w-full max-w-2xl shimmer rounded-lg mt-6" />
        <div className="h-6 w-full max-w-md shimmer rounded-md" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="h-48 shimmer rounded-xl" />
          <div className="h-48 shimmer rounded-xl" />
          <div className="h-48 shimmer rounded-xl" />
        </div>
        <div className="flex items-center gap-3 mt-8">
          <div className="w-4 h-4 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
          <span className="text-sm font-medium text-brand-600 font-mono tracking-wider">
            COMPILING SHADERS...
          </span>
        </div>
      </div>
    </div>
  );
}
