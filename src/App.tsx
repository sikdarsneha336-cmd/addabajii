/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ScreenType, UserRole, IncidentReport } from './types';
import {
  getStoredReports,
  saveStoredReports,
  getMyAnonymousKeys,
  saveMyAnonymousKey,
} from './data/reportsStore';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { QuickSOSModal } from './components/QuickSOSModal';
import { CamouflageWeather } from './components/CamouflageWeather';
import { CamouflageCalculator } from './components/CamouflageCalculator';
import { LoginScreen } from './screens/LoginScreen';
import { CitizenPortalScreen } from './screens/CitizenPortalScreen';
import { AuthorityCommandScreen } from './screens/AuthorityCommandScreen';

export default function App() {
  // Session & Role Isolation State
  const [userRole, setUserRole] = useState<UserRole>('none');
  const [citizenAlias, setCitizenAlias] = useState<string>('Anonymous Citizen');
  const [authorityBadgeId, setAuthorityBadgeId] = useState<string>('DL-POL-9842');
  const [authorityDepartment, setAuthorityDepartment] = useState<string>(
    'Metro Police Patrol (PCR-14)'
  );

  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [camouflageMode, setCamouflageMode] = useState<'none' | 'weather' | 'calculator'>('none');

  // Anonymous Reports & Keys Store
  const [reports, setReports] = useState<IncidentReport[]>(() => getStoredReports());
  const [myAnonymousKeys, setMyAnonymousKeys] = useState<string[]>(() => getMyAnonymousKeys());
  const [activeTrackingKey, setActiveTrackingKey] = useState<string>(() => {
    const keys = getMyAnonymousKeys();
    return keys[0] || '#AB-78942-METRO3';
  });

  // Sync across tabs & components
  useEffect(() => {
    const handleReportsUpdate = () => {
      setReports(getStoredReports());
    };
    const handleKeysUpdate = () => {
      setMyAnonymousKeys(getMyAnonymousKeys());
    };

    window.addEventListener('addabaaji_reports_updated', handleReportsUpdate);
    window.addEventListener('addabaaji_keys_updated', handleKeysUpdate);
    window.addEventListener('storage', handleReportsUpdate);

    return () => {
      window.removeEventListener('addabaaji_reports_updated', handleReportsUpdate);
      window.removeEventListener('addabaaji_keys_updated', handleKeysUpdate);
      window.removeEventListener('storage', handleReportsUpdate);
    };
  }, []);

  // Keyboard shortcut listener: Escape exits camouflage or closes SOS modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (camouflageMode !== 'none') {
          setCamouflageMode('none');
        } else if (isSOSOpen) {
          setIsSOSOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [camouflageMode, isSOSOpen]);

  // Login Handlers
  const handleLoginCitizen = (alias?: string) => {
    setUserRole('citizen');
    if (alias && alias.trim()) {
      setCitizenAlias(alias.trim());
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginAuthority = (badgeId: string, department: string) => {
    setUserRole('authority');
    setAuthorityBadgeId(badgeId);
    setAuthorityDepartment(department);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Secure Logout Handler: resets session and returns directly to the login landing screen
  const handleLogout = () => {
    setUserRole('none');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReportSubmitted = (newReport: IncidentReport) => {
    const updated = [newReport, ...reports];
    setReports(updated);
    saveStoredReports(updated);
    saveMyAnonymousKey(newReport.hash);
    setActiveTrackingKey(newReport.hash);
  };

  const handleUpdateReport = (updatedReport: IncidentReport) => {
    const updated = reports.map(r => (r.id === updatedReport.id ? updatedReport : r));
    setReports(updated);
    saveStoredReports(updated);
  };

  const handleSelectTrackingKey = (key: string) => {
    setActiveTrackingKey(key);
  };

  const currentScreen: ScreenType =
    userRole === 'citizen'
      ? 'citizen-anonymous-portal'
      : userRole === 'authority'
      ? 'authority-command-center'
      : 'login';

  return (
    <div className="min-h-screen bg-[#faf7fd] text-[#241236] font-body-md selection:bg-pink-200 selection:text-pink-900 flex flex-col justify-between">
      {/* Camouflage Mode Decoys */}
      {camouflageMode === 'weather' && (
        <CamouflageWeather
          onClose={() => setCamouflageMode('none')}
          onSwitchToCalculator={() => setCamouflageMode('calculator')}
        />
      )}
      {camouflageMode === 'calculator' && (
        <CamouflageCalculator onClose={() => setCamouflageMode('none')} />
      )}

      {/* Quick Distress SOS Modal */}
      <QuickSOSModal isOpen={isSOSOpen} onClose={() => setIsSOSOpen(false)} />

      {/* Top Header: Rendered on Login Landing and Citizen Portal (Authority has dedicated tactical ops header) */}
      {userRole !== 'authority' && (
        <Header
          currentScreen={currentScreen}
          userRole={userRole}
          citizenAlias={citizenAlias}
          onLogout={handleLogout}
          onTriggerSOS={() => setIsSOSOpen(true)}
          onToggleCamouflage={
            userRole === 'citizen' ? () => setCamouflageMode('weather') : undefined
          }
        />
      )}

      {/* Main Screen Container with Strict Role Segregation */}
      <main className={`w-full flex-1 ${userRole !== 'authority' ? 'pt-20' : ''}`}>
        {/* Landing Page: Dedicated Clean Dual-Gateway Login Screen */}
        {userRole === 'none' && (
          <LoginScreen
            onLoginCitizen={handleLoginCitizen}
            onLoginAuthority={handleLoginAuthority}
            onTriggerSOS={() => setIsSOSOpen(true)}
          />
        )}

        {/* Citizen Portal: Protected Reporting & Status Tracking */}
        {userRole === 'citizen' && (
          <CitizenPortalScreen
            reports={reports}
            myAnonymousKeys={myAnonymousKeys}
            activeTrackingKey={activeTrackingKey}
            onSelectTrackingKey={handleSelectTrackingKey}
            onReportSubmitted={handleReportSubmitted}
            onTriggerCamouflage={() => setCamouflageMode('weather')}
          />
        )}

        {/* Authority Command Center: Official Triage & Resolution Console */}
        {userRole === 'authority' && (
          <AuthorityCommandScreen
            reports={reports}
            activeSelectedHash={activeTrackingKey}
            onSelectCase={handleSelectTrackingKey}
            onUpdateReport={handleUpdateReport}
            onLogout={handleLogout}
            onTriggerSOS={() => setIsSOSOpen(true)}
            badgeId={authorityBadgeId}
            department={authorityDepartment}
          />
        )}
      </main>

      {/* Global Footer (shown on landing and citizen screens) */}
      {userRole !== 'authority' && <Footer />}
    </div>
  );
}
