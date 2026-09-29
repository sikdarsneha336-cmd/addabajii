import React, { useState } from 'react';
import { ScreenType, UserRole } from '../types';
import { AppLogo } from './AppLogo';

interface HeaderProps {
  currentScreen: ScreenType;
  userRole: UserRole;
  citizenAlias?: string;
  onLogout: () => void;
  onTriggerSOS: () => void;
  onToggleCamouflage?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  userRole,
  citizenAlias = 'Citizen',
  onLogout,
  onTriggerSOS,
  onToggleCamouflage,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full z-40 bg-white/95 backdrop-blur-xl border-b border-purple-200/80 shadow-[0_2px_16px_rgba(219,39,119,0.06)]">
      <div className="w-full px-margin-lg">
        <div className="h-20 flex items-center justify-between gap-space-lg">
          {/* Logo & Platform Info */}
          <div className="flex items-center gap-space-md">
            <div className="flex items-center gap-space-sm text-left">
              <AppLogo size={36} className="h-9 w-9 shrink-0 drop-shadow-xs" />
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm text-purple-950 uppercase tracking-tight font-bold">
                  AddaBaaji
                </span>
                <span className="font-label-sm text-label-sm text-pink-600 uppercase font-bold tracking-wider">
                  {userRole === 'citizen'
                    ? 'Citizen Anonymous Portal'
                    : userRole === 'authority'
                    ? 'Tactical Ops Desk'
                    : 'Civic Safety Grid'}
                </span>
              </div>
            </div>

            <div className="hidden xl:flex items-center gap-space-sm px-space-md py-space-xs rounded-lg bg-purple-50/80 border border-purple-200/70">
              <span className="material-symbols-outlined text-purple-600 text-[18px]">verified_user</span>
              <span className="font-label-sm text-label-sm text-purple-900 uppercase tracking-wider font-semibold">
                {userRole === 'citizen'
                  ? 'Zero-Trace Anonymous Routing Active • No Identity Logs'
                  : '256-bit Encrypted Portal Gateway'}
              </span>
            </div>
          </div>

          {/* Citizen Dedicated Center Navigation (No cross-portal links!) */}
          {userRole === 'citizen' && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50/80 border border-purple-200">
              <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping" />
              <span className="text-xs font-mono font-bold text-purple-900 uppercase">
                Active Session:
              </span>
              <span className="text-xs font-mono font-semibold text-pink-700">
                {citizenAlias}
              </span>
            </div>
          )}

          {/* Action Items */}
          <div className="flex items-center gap-space-sm sm:gap-space-md">
            {/* Camouflage (only available in citizen session) */}
            {userRole === 'citizen' && onToggleCamouflage && (
              <button
                onClick={onToggleCamouflage}
                className="hidden sm:flex items-center gap-space-xs px-space-md py-space-sm rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-950 font-label-md text-label-md transition-all border border-purple-200 cursor-pointer shadow-xs"
                title="Instant Camouflage SafeTouch (Disguise app as weather or calculator)"
              >
                <span className="material-symbols-outlined text-pink-600 text-[18px]">visibility_off</span>
                <span>Camouflage</span>
              </button>
            )}

            {/* Quick SOS Emergency Alarm */}
            <button
              onClick={onTriggerSOS}
              className="flex items-center gap-space-xs bg-pink-600 hover:bg-pink-700 px-space-md py-space-sm rounded-xl text-white font-label-lg text-label-lg transition-all shadow-md shadow-pink-600/30 border border-pink-400 cursor-pointer animate-pulse font-bold"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">e911_emergency</span>
              <span className="font-bold">Quick SOS</span>
            </button>

            {/* Log Out Button (When logged in as citizen) */}
            {userRole === 'citizen' && (
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-xs"
                title="Log out and return to landing page"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                <span>Log Out</span>
              </button>
            )}

            {/* Mobile Hamburger Button */}
            {userRole === 'citizen' && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl bg-purple-50 text-purple-900 hover:bg-purple-100 border border-purple-200"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {mobileMenuOpen ? 'close' : 'menu'}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Dropdown Menu (Only citizen items, strictly no authority link!) */}
        {mobileMenuOpen && userRole === 'citizen' && (
          <div className="md:hidden border-t border-purple-200 py-3 flex flex-col gap-2 bg-white px-2 animate-in slide-in-from-top-2 rounded-b-2xl shadow-xl">
            <div className="p-2.5 rounded-xl bg-purple-50 text-xs text-purple-900 font-mono flex items-center justify-between border border-purple-100">
              <span className="font-bold">Logged in as:</span>
              <span className="text-pink-700 font-bold">{citizenAlias}</span>
            </div>

            {onToggleCamouflage && (
              <button
                onClick={() => {
                  onToggleCamouflage();
                  setMobileMenuOpen(false);
                }}
                className="p-3 rounded-xl text-left font-label-md bg-purple-50 text-purple-900 flex items-center gap-2 border border-purple-200 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px] text-pink-600">visibility_off</span>
                <span>Activate Quick Camouflage Decoy</span>
              </button>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onLogout();
              }}
              className="p-3 rounded-xl text-left font-label-md bg-rose-50 text-rose-700 font-bold flex items-center gap-2 border border-rose-200 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              <span>Log Out to Login Screen</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
