import React, { useState } from 'react';
import { AppLogo } from '../components/AppLogo';

interface LoginScreenProps {
  onLoginCitizen: (alias?: string) => void;
  onLoginAuthority: (badgeId: string, department: string) => void;
  onTriggerSOS: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginCitizen,
  onLoginAuthority,
  onTriggerSOS,
}) => {
  // Citizen Form State
  const [citizenAlias, setCitizenAlias] = useState('');
  const [agreeAnonymous, setAgreeAnonymous] = useState(true);

  // Authority Form State
  const [badgeId, setBadgeId] = useState('DL-POL-9842');
  const [accessPin, setAccessPin] = useState('1122');
  const [department, setDepartment] = useState('Metro Police Patrol (PCR-14)');
  const [authorityError, setAuthorityError] = useState<string | null>(null);

  const handleCitizenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginCitizen(citizenAlias.trim() || 'Anonymous Citizen');
  };

  const handleAuthoritySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthorityError(null);
    if (!badgeId.trim()) {
      setAuthorityError('Please enter an Officer Badge or Station ID.');
      return;
    }
    if (!accessPin.trim()) {
      setAuthorityError('Please enter your 4-digit Security PIN.');
      return;
    }
    onLoginAuthority(badgeId.trim(), department);
  };

  const fillDemoAuthority = () => {
    setBadgeId('DL-POL-9842');
    setAccessPin('1122');
    setDepartment('Metro Police Patrol (PCR-14)');
    setAuthorityError(null);
  };

  return (
    <div className="w-full min-h-[calc(100vh-5rem)] flex flex-col justify-between px-margin-lg py-space-xl">
      {/* Dynamic Background Auras */}
      <div className="absolute top-10 left-1/3 w-96 h-96 bg-pink-200/25 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[450px] h-[450px] bg-purple-200/30 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 max-w-5xl mx-auto w-full">
        {/* Header / Intro */}
        <div className="text-center max-w-2xl mx-auto mb-space-xl flex flex-col items-center">
          <div className="mb-4 inline-flex items-center justify-center p-3 rounded-2xl bg-white border border-purple-200 shadow-md">
            <AppLogo size={48} className="h-12 w-12 drop-shadow-sm" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100/90 border border-purple-200 mb-3 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-pink-600 animate-pulse" />
            <span className="text-xs uppercase font-bold tracking-wider text-pink-700 font-mono">
              Civic Vigilance &amp; Rapid Action Grid
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-purple-950 tracking-tight leading-tight">
            Welcome to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
              AddaBaaji
            </span>
          </h1>
          <p className="mt-3 text-base sm:text-lg text-purple-900/80 leading-relaxed">
            Choose your portal below to sign in. Citizens report complaints with zero-trace privacy; authorities review and resolve safety issues.
          </p>
        </div>

        {/* The Two Distinct Login Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg items-stretch">
          {/* OPTION 1: Citizen Login */}
          <div className="bg-white border-2 border-pink-200/90 hover:border-pink-400 rounded-3xl p-6 sm:p-8 shadow-lg shadow-pink-500/5 transition-all flex flex-col justify-between relative overflow-hidden group">
            {/* Top Accent Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-pink-500 to-rose-500" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 text-pink-700 text-xs font-mono font-bold border border-pink-200">
                  <span className="material-symbols-outlined text-[14px]">shield_person</span>
                  CITIZEN ACCESS
                </span>
                <span className="text-xs font-mono text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                  100% PRIVATE
                </span>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-100 to-pink-50 border border-pink-200 flex items-center justify-center text-pink-600 shadow-xs">
                  <span className="material-symbols-outlined text-[28px]">fingerprint</span>
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-purple-950">
                    Log in as Citizen
                  </h2>
                  <p className="text-xs text-pink-700 font-semibold">
                    Report Harassment &amp; Track Complaints
                  </p>
                </div>
              </div>

              <p className="text-sm text-purple-800/90 leading-relaxed mb-6">
                File confidential incident reports regarding catcalling, intimidating crowds, stalkers, or dark street corners. No phone number or personal identity is ever recorded.
              </p>

              {/* Citizen Form */}
              <form onSubmit={handleCitizenSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-purple-900 uppercase tracking-wider mb-1.5">
                    Display Alias or Initials <span className="text-purple-600 font-normal font-sans">(Optional)</span>
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-600 text-[18px]">
                      badge
                    </span>
                    <input
                      type="text"
                      value={citizenAlias}
                      onChange={(e) => setCitizenAlias(e.target.value)}
                      placeholder="e.g. Concerned Commuter, Metro Rider (or leave blank)"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-purple-200 bg-purple-50/50 text-sm text-purple-950 placeholder-purple-600 focus:outline-none focus:ring-2 focus:ring-pink-500/40 focus:border-pink-500 transition-all"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-pink-50/60 border border-pink-200/80 flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="citizen-anon-check"
                    checked={agreeAnonymous}
                    onChange={(e) => setAgreeAnonymous(e.target.checked)}
                    className="mt-0.5 rounded text-pink-600 focus:ring-pink-500 border-pink-300"
                  />
                  <label htmlFor="citizen-anon-check" className="text-xs text-purple-900 leading-snug cursor-pointer select-none">
                    <span className="font-bold text-pink-700">Zero-Trace Protocol Active:</span> Strip IP address, device telemetry, and photo EXIF metadata upon report submission.
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-pink-600 via-pink-500 to-purple-600 text-white font-bold text-sm sm:text-base shadow-md shadow-pink-600/25 hover:shadow-lg hover:shadow-pink-600/35 hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
                  <span>Enter as Citizen</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </form>

              {/* Citizen Key Features */}
              <div className="mt-6 pt-5 border-t border-purple-100 space-y-2">
                <span className="text-[11px] font-mono uppercase text-purple-600 font-bold tracking-wider">
                  Citizen Portal Capabilities:
                </span>
                <ul className="text-xs text-purple-800 space-y-1.5">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-pink-600 text-[16px]">check_circle</span>
                    <span>Submit anonymous GPS coordinates, photos &amp; audio memos</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-pink-600 text-[16px]">check_circle</span>
                    <span>Track progress with confidential 8-character Hash tokens</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-pink-600 text-[16px]">check_circle</span>
                    <span>Quick Emergency SOS alarm &amp; discreet Camouflage mode</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* OPTION 2: Authority Login */}
          <div className="bg-white border-2 border-purple-200/90 hover:border-purple-400 rounded-3xl p-6 sm:p-8 shadow-lg shadow-purple-500/5 transition-all flex flex-col justify-between relative overflow-hidden group">
            {/* Top Accent Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-600 to-indigo-600" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-800 text-xs font-mono font-bold border border-purple-200">
                  <span className="material-symbols-outlined text-[14px]">local_police</span>
                  OFFICIAL ACCESS
                </span>
                <span className="text-xs font-mono text-pink-700 font-semibold bg-pink-50 px-2 py-0.5 rounded border border-pink-100">
                  COMMAND DESK
                </span>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-100 to-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 shadow-xs">
                  <span className="material-symbols-outlined text-[28px]">policy</span>
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-purple-950">
                    Log in as Authority
                  </h2>
                  <p className="text-xs text-purple-700 font-semibold">
                    Review Cases, Dispatch Patrols &amp; Resolve Issues
                  </p>
                </div>
              </div>

              <p className="text-sm text-purple-800/90 leading-relaxed mb-4">
                Authorized terminal for municipal police patrol units, PCR dispatchers, and civic maintenance engineers to inspect reported addas and resolve safety violations.
              </p>

              {/* Authority Form */}
              <form onSubmit={handleAuthoritySubmit} className="space-y-3.5">
                {authorityError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">error</span>
                    <span>{authorityError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-purple-900 uppercase tracking-wider mb-1">
                    Officer Badge / Station ID
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-600 text-[18px]">
                      badge
                    </span>
                    <input
                      type="text"
                      value={badgeId}
                      onChange={(e) => setBadgeId(e.target.value)}
                      placeholder="e.g. DL-POL-9842"
                      required
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-purple-200 bg-purple-50/50 text-sm text-purple-950 placeholder-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 font-mono font-medium transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-purple-900 uppercase tracking-wider mb-1">
                      Security PIN
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-600 text-[18px]">
                        lock
                      </span>
                      <input
                        type="password"
                        value={accessPin}
                        onChange={(e) => setAccessPin(e.target.value)}
                        placeholder="••••"
                        required
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-purple-200 bg-purple-50/50 text-sm text-purple-950 placeholder-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 font-mono font-medium transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-purple-900 uppercase tracking-wider mb-1">
                      Department / Wing
                    </label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-purple-200 bg-purple-50/50 text-xs sm:text-sm text-purple-950 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 font-medium transition-all"
                    >
                      <option value="Metro Police Patrol (PCR-14)">Metro Police (PCR-14)</option>
                      <option value="Women Safety Quick Reaction Cell">Women Safety Squad</option>
                      <option value="MCD Civic Works & Lighting Desk">Civic Lighting &amp; Roads</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-0.5">
                  <span className="text-purple-700 font-mono">Demo: DL-POL-9842 / PIN 1122</span>
                  <button
                    type="button"
                    onClick={fillDemoAuthority}
                    className="text-pink-600 hover:text-pink-700 font-bold underline cursor-pointer"
                  >
                    Auto-Fill Demo
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-700 via-purple-800 to-indigo-800 text-white font-bold text-sm sm:text-base shadow-md shadow-purple-700/25 hover:shadow-lg hover:shadow-purple-700/35 hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
                  <span>Enter as Authority</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </form>

              {/* Authority Key Features */}
              <div className="mt-6 pt-5 border-t border-purple-100 space-y-2">
                <span className="text-[11px] font-mono uppercase text-purple-600 font-bold tracking-wider">
                  Authority Command Capabilities:
                </span>
                <ul className="text-xs text-purple-800 space-y-1.5">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-purple-700 text-[16px]">check_circle</span>
                    <span>View all citizen complaints in live triage docket</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-purple-700 text-[16px]">check_circle</span>
                    <span>Update resolution status &amp; attach official investigation notes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-purple-700 text-[16px]">check_circle</span>
                    <span>Zone heatmaps, radio intercom broadcasts &amp; rapid dispatch</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Direct Emergency Access Callout */}
        <div className="mt-space-lg p-4 rounded-2xl bg-white border border-purple-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
              <span className="material-symbols-outlined text-[22px]">e911_emergency</span>
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-purple-950">
                Are you in immediate physical danger?
              </div>
              <div className="text-xs text-purple-700">
                Skip portal login and trigger direct emergency siren, location coordinates &amp; helpline dispatch.
              </div>
            </div>
          </div>
          <button
            onClick={onTriggerSOS}
            type="button"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-600/25 flex items-center justify-center gap-2 cursor-pointer shrink-0 transition-colors animate-pulse"
          >
            <span className="material-symbols-outlined text-[18px]">emergency</span>
            <span>Immediate Quick SOS</span>
          </button>
        </div>

        {/* Security Isolation Notice */}
        <div className="mt-6 text-center text-xs text-purple-700 font-mono">
          <span className="inline-flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px] text-pink-600">lock</span>
            Encrypted Gateway Isolation: Citizen and Authority network states are strictly segregated.
          </span>
        </div>
      </div>
    </div>
  );
};
