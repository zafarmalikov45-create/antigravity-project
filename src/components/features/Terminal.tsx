'use client';

import { useRef, useImperativeHandle, forwardRef, useState, useCallback } from 'react';

export interface LogLine {
  text: string;
  color: string;
}

export interface TerminalHandle {
  clear: () => void;
  streamLogs: (lines: LogLine[], onComplete?: () => void) => void;
  printError: (msg: string) => void;
}

const Terminal = forwardRef<TerminalHandle>(function Terminal(_, ref) {
  const [lines, setLines] = useState<LogLine[]>([
    { text: '// Configure nodes and click "Run Pipeline" to execute simulation...', color: 'text-gray-500' },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const clear = useCallback(() => {
    setLines([]);
  }, []);

  const printError = useCallback((msg: string) => {
    setLines([{ text: msg, color: 'text-red-400 font-bold' }]);
  }, []);

  const streamLogs = useCallback((logLines: LogLine[], onComplete?: () => void) => {
    setLines([{ text: '// Connecting execution nodes...', color: 'text-gray-400' }]);
    let i = 0;

    function next() {
      if (i < logLines.length) {
        const line = logLines[i];
        setLines((prev) => [...prev, line]);
        i++;
        setTimeout(next, 400 + Math.random() * 300);
      } else {
        onComplete?.();
      }
    }

    setTimeout(next, 500);
  }, []);

  useImperativeHandle(ref, () => ({ clear, streamLogs, printError }));

  return (
    <div className="rounded-2xl bg-gray-950 border border-gray-800 p-5 shadow-inner flex flex-col gap-2 h-44 relative overflow-hidden">
      <div className="flex items-center justify-between text-xs text-gray-500 pb-2 border-b border-gray-900 font-mono">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
          <span className="ml-2">stdout — flow-runner-v1.0.8</span>
        </span>
        <span>IDLE</span>
      </div>
      <div
        ref={scrollRef}
        role="log"
        aria-label="Pipeline execution log"
        className="font-mono text-xs text-green-400/90 leading-relaxed overflow-y-auto max-h-28 flex flex-col gap-1 pr-2"
      >
        {lines.map((line, idx) => (
          <p key={idx} className={`${line.color} transition-all duration-300`}>
            {line.text}
          </p>
        ))}
      </div>
    </div>
  );
});

export default Terminal;
