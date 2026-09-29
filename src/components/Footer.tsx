import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#f5effb] border-t border-purple-200/80 py-space-xl">
      <div className="w-full px-margin-lg flex flex-col md:flex-row items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-sm">
          <span className="material-symbols-outlined text-pink-600 text-[20px]">security</span>
          <span className="font-label-md text-label-md text-purple-900/80">
            &copy; 2025 AddaBaaji Platform. Encrypted Municipal Grid Protocol.
          </span>
        </div>
        <div className="flex items-center gap-space-lg">
          <span className="font-label-sm text-label-sm text-purple-700 uppercase tracking-wider font-semibold">
            Zero Log Architecture
          </span>
          <span className="font-label-sm text-label-sm text-purple-700 uppercase tracking-wider font-semibold">
            E2E Salt Encryption
          </span>
        </div>
      </div>
    </footer>
  );
};
