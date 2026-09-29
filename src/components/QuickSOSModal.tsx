import React, { useState, useEffect } from 'react';

interface QuickSOSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickSOSModal: React.FC<QuickSOSModalProps> = ({ isOpen, onClose }) => {
  const [countdown, setCountdown] = useState(3);
  const [isTriggered, setIsTriggered] = useState(false);
  const [sirenPlaying, setSirenPlaying] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && countdown > 0 && !isTriggered) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    } else if (isOpen && countdown === 0 && !isTriggered) {
      setIsTriggered(true);
    }
    return () => clearTimeout(timer);
  }, [isOpen, countdown, isTriggered]);

  const toggleSiren = () => {
    setSirenPlaying(!sirenPlaying);
    try {
      if (!sirenPlaying && window.AudioContext) {
        const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.2);
      }
    } catch {
      // Audio fallback
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-purple-950/40 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white border border-pink-300 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col gap-5">
        <div className="absolute -right-20 -top-20 w-60 h-60 bg-pink-100 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between z-10 border-b border-purple-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-600 text-white flex items-center justify-center animate-pulse shadow-md shadow-pink-600/30">
              <span className="material-symbols-outlined text-2xl">e911_emergency</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-purple-950 font-bold tracking-tight">
                Quick Distress SOS
              </h3>
              <p className="font-label-sm text-label-sm text-pink-600 uppercase tracking-wider font-semibold">
                Priority 1 Emergency Broadcast
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setCountdown(3);
              setIsTriggered(false);
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-purple-100 text-purple-900 hover:bg-purple-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Countdown / Dispatch State */}
        {!isTriggered ? (
          <div className="flex flex-col items-center justify-center py-6 gap-3 z-10 text-center">
            <div className="w-24 h-24 rounded-full border-4 border-pink-500 bg-pink-50 flex items-center justify-center text-4xl font-headline-xl text-pink-600 font-bold animate-ping">
              {countdown}
            </div>
            <p className="font-title-md text-purple-950 font-semibold mt-2">
              Broadcasting Silent Distress Alert in {countdown}s
            </p>
            <p className="font-body-sm text-purple-800/80 max-w-xs">
              Direct telemetry routed to nearest PCR patrol van and station duty officer.
            </p>
            <button
              onClick={() => {
                setCountdown(3);
                onClose();
              }}
              className="mt-2 px-6 py-2 rounded-lg bg-purple-100 text-purple-950 hover:bg-purple-200 font-label-md transition-colors cursor-pointer border border-purple-300 font-semibold"
            >
              Cancel Alert
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 z-10">
            <div className="bg-pink-50 border border-pink-300 rounded-xl p-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-3xl text-pink-600 animate-bounce">
                fmd_good
              </span>
              <div>
                <div className="font-label-md text-pink-900 font-bold uppercase">
                  🚨 Distress Beacon Active &amp; Dispatched
                </div>
                <div className="font-body-sm text-purple-900 mt-0.5">
                  PCR Patrol Van #14 dispatched to Metro Gate 3. Estimated ETA: 4 mins.
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={toggleSiren}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-center transition-all cursor-pointer ${
                  sirenPlaying
                    ? 'bg-rose-100 border-rose-400 text-rose-900 ring-2 ring-rose-400'
                    : 'bg-purple-50 border-purple-200 text-purple-950 hover:bg-purple-100'
                }`}
              >
                <span className="material-symbols-outlined text-2xl text-amber-600">
                  volume_up
                </span>
                <span className="font-label-sm uppercase font-bold">
                  {sirenPlaying ? 'Stop Siren' : 'Acoustic Deterrent Siren'}
                </span>
              </button>

              <a
                href="tel:112"
                className="p-3 rounded-xl bg-pink-600 hover:bg-pink-700 text-white border border-pink-500 flex flex-col items-center gap-2 text-center transition-all font-bold shadow-md shadow-pink-600/30"
              >
                <span className="material-symbols-outlined text-2xl">call</span>
                <span className="font-label-sm uppercase font-bold">Call 112 (National Helpline)</span>
              </a>
            </div>

            <div className="bg-purple-50 border border-purple-200 p-3 rounded-xl flex items-center justify-between text-xs font-mono text-purple-900">
              <span className="font-semibold">ENCRYPTED GPS COORDS:</span>
              <span className="text-pink-600 font-bold">28.6328° N, 77.2197° E</span>
            </div>
          </div>
        )}

        {/* Emergency Hotlines Strip */}
        <div className="border-t border-purple-100 pt-3 flex items-center justify-between text-xs text-purple-700 font-mono">
          <span>WOMEN HELPLINE: <span className="text-purple-950 font-bold">1091</span></span>
          <span>POLICE CR: <span className="text-purple-950 font-bold">100</span></span>
          <span>DCW: <span className="text-purple-950 font-bold">181</span></span>
        </div>
      </div>
    </div>
  );
};
