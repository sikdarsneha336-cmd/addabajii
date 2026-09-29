import React, { useState, useEffect } from 'react';
import { IncidentReport, RadioLog, ScreenType } from '../types';
import { AudioTranscriber } from '../components/AudioTranscriber';
import { AppLogo } from '../components/AppLogo';
import { EvidencePhoto } from '../components/EvidencePhoto';

interface AuthorityCommandScreenProps {
  reports: IncidentReport[];
  activeSelectedHash?: string;
  onSelectCase?: (hash: string) => void;
  onUpdateReport: (updatedReport: IncidentReport) => void;
  onLogout: () => void;
  onTriggerSOS: () => void;
  badgeId?: string;
  department?: string;
}

export const AuthorityCommandScreen: React.FC<AuthorityCommandScreenProps> = ({
  reports,
  activeSelectedHash,
  onSelectCase,
  onUpdateReport,
  onLogout,
  onTriggerSOS,
  badgeId = 'DL-POL-9842',
  department = 'Metro Police Patrol (PCR-14)',
}) => {
  const [activeTab, setActiveTab] = useState<'command' | 'telemetry' | 'docket' | 'vault'>('command');
  const [searchQuery, setSearchQuery] = useState('');
  const [zoneFilter, setZoneFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isSyncing, setIsSyncing] = useState(false);

  // Selected Case to Inspect
  const [selectedHash, setSelectedHash] = useState<string>(
    activeSelectedHash || reports[0]?.hash || '#AB-78942-METRO3'
  );

  useEffect(() => {
    if (activeSelectedHash) {
      setSelectedHash(activeSelectedHash);
    }
  }, [activeSelectedHash]);

  const activeCase = reports.find(r => r.hash === selectedHash) || reports[0];

  // Editable fields for active case
  const [caseStatus, setCaseStatus] = useState<string>(activeCase?.status || 'active');
  const [officerMemo, setOfficerMemo] = useState<string>(
    activeCase?.officerMemo ||
      'Beat Patrol 04 visited at 20:15 hrs. Dispersed unauthorized crowd, issued challan to illegal tea kiosk, stationed fixed picket between 19:00 - 22:00 hrs daily.'
  );
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // When activeCase changes, sync local form fields
  useEffect(() => {
    if (activeCase) {
      setCaseStatus(activeCase.status);
      setOfficerMemo(
        activeCase.officerMemo ||
          'Beat Patrol dispatched to spot. Crowd dispersed, continuous surveillance maintained.'
      );
    }
  }, [activeCase]);

  // Radio Intercom State
  const [radioLogs, setRadioLogs] = useState<RadioLog[]>([
    {
      id: 'r1',
      callsign: 'PCR-14 (North Line)',
      time: '20:22 IST',
      message: 'Picket positioned outside Gate 3. Crowd dispersed without physical escalation.',
      type: 'patrol',
    },
    {
      id: 'r2',
      callsign: 'Patrol Squad 12',
      time: '20:18 IST',
      message: 'Arrived at Girls College shelter. Area clear, following suspicious group towards Market 4.',
      type: 'patrol',
    },
    {
      id: 'r3',
      callsign: 'MCD Electrical Desk',
      time: '20:05 IST',
      message: 'Work order #MCD-990 issued for high-mast bulb replacement on Sector 14 rotary.',
      type: 'mcd',
    },
  ]);
  const [newBroadcast, setNewBroadcast] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBroadcast.trim()) return;

    const newLog: RadioLog = {
      id: `r-${Date.now()}`,
      callsign: 'HQ DISPATCH (Desk 01)',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST',
      message: newBroadcast,
      type: 'intercom',
    };
    setRadioLogs([newLog, ...radioLogs]);
    setNewBroadcast('');
    showToast('Broadcast directive transmitted over CH-09 to all active patrol units.');
  };

  const handleSelectCase = (hash: string) => {
    setSelectedHash(hash);
    if (onSelectCase) onSelectCase(hash);
    const found = reports.find(r => r.hash === hash);
    if (found) {
      setCaseStatus(found.status);
      setOfficerMemo(found.officerMemo || 'Patrol assigned to verify area.');
    }
  };

  const handleCommitCase = () => {
    if (!activeCase) return;
    const updated: IncidentReport = {
      ...activeCase,
      status: caseStatus as 'pending' | 'active' | 'rectification' | 'resolved',
      officerMemo,
    };
    onUpdateReport(updated);
    showToast(
      `Status Committed: ${activeCase.hash} updated to [${caseStatus.toUpperCase()}]. Encrypted sync transmitted to citizen token.`
    );
  };

  const handleQuickDirective = (directiveText: string) => {
    setOfficerMemo(prev => `${prev}\n• ${directiveText}`);
    showToast(`Directive logged: "${directiveText}"`);
  };

  // Metrics
  const totalComplaints = 1480 + reports.length;
  const pendingTriageCount = reports.filter(r => r.status === 'pending').length + 32;
  const resolvedCount = reports.filter(r => r.status === 'resolved').length + 891;

  // Filtered reports
  const filteredReports = reports.filter(r => {
    if (
      searchQuery &&
      !r.hash.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !r.narrative.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !r.location.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    if (urgencyFilter !== 'all' && r.urgency !== urgencyFilter) return false;
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="flex w-full min-h-screen bg-[#faf7fd] text-[#241236]">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-white text-purple-950 px-4 py-3 rounded-xl shadow-2xl border border-pink-400 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3">
          <span className="material-symbols-outlined text-pink-600">satellite_alt</span>
          <div className="flex flex-col">
            <span className="font-headline-sm text-label-md font-bold text-purple-950">HQ Tactical Sync</span>
            <span className="font-body-sm text-body-sm text-purple-800">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Left Tactical Navigation Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-72 bg-white/95 backdrop-blur-md border-r border-purple-200/80 z-50 flex-col justify-between py-space-lg select-none">
        <div className="flex flex-col gap-space-lg">
          {/* Logo */}
          <div className="px-space-lg flex items-center gap-space-sm">
            <AppLogo size={36} className="h-9 w-9 shrink-0 drop-shadow-xs" />
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-purple-950 uppercase tracking-tight font-bold">
                AddaBaaji
              </span>
              <span className="font-label-sm text-label-sm text-pink-600 uppercase font-mono font-bold">
                Tactical Ops
              </span>
            </div>
          </div>

          {/* Status Badge */}
          <div className="px-space-md">
            <div className="px-space-md py-space-sm bg-purple-50/70 border border-purple-200 rounded-xl flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-purple-800 uppercase font-mono">
                Command Status
              </span>
              <span className="inline-flex items-center px-space-xs py-0.5 rounded text-label-sm font-label-sm bg-pink-100 text-pink-700 font-mono font-bold border border-pink-300">
                ENCRYPTED
              </span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="flex flex-col gap-space-xs px-space-md">
            <button
              onClick={() => setActiveTab('command')}
              className={`flex items-center gap-space-md px-space-md py-space-sm transition-all rounded-xl font-label-lg text-label-lg font-semibold text-left cursor-pointer ${
                activeTab === 'command'
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md shadow-pink-600/20'
                  : 'text-purple-800 hover:text-purple-950 hover:bg-purple-100/70'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">radar</span>
              <span>Command Center</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('telemetry');
                showToast('Telemetry & Zone GIS map activated.');
              }}
              className={`flex items-center gap-space-md px-space-md py-space-sm rounded-xl transition-all font-label-lg text-label-lg font-semibold text-left cursor-pointer ${
                activeTab === 'telemetry'
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md shadow-pink-600/20'
                  : 'text-purple-800 hover:text-purple-950 hover:bg-purple-100/70'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">fmd_good</span>
              <span>Telemetry &amp; Zones</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('docket');
                showToast(`Viewing full docket of ${reports.length} anonymous cases.`);
              }}
              className={`flex items-center gap-space-md px-space-md py-space-sm rounded-xl transition-all font-label-lg text-label-lg font-semibold text-left cursor-pointer ${
                activeTab === 'docket'
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md shadow-pink-600/20'
                  : 'text-purple-800 hover:text-purple-950 hover:bg-purple-100/70'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">policy</span>
              <span>Incident Docket</span>
              <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full bg-pink-100 text-pink-700 font-mono font-bold">
                {reports.length}
              </span>
            </button>
            <button
              onClick={() => {
                setActiveTab('vault');
                showToast('Accessing zero-trace triage cryptographic vault.');
              }}
              className={`flex items-center gap-space-md px-space-md py-space-sm rounded-xl transition-all font-label-lg text-label-lg font-semibold text-left cursor-pointer ${
                activeTab === 'vault'
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md shadow-pink-600/20'
                  : 'text-purple-800 hover:text-purple-950 hover:bg-purple-100/70'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">lock_person</span>
              <span>Triage Vault</span>
            </button>
          </nav>

          {/* Official Sign Out / Exit Session */}
          <div className="px-space-md pt-4 border-t border-purple-200/80 flex flex-col gap-2">
            <div className="px-2 py-1 text-[11px] font-mono text-purple-700 uppercase flex items-center justify-between font-bold">
              <span>Station Session</span>
              <span className="text-emerald-700">ONLINE</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-purple-50 text-xs font-mono text-purple-900 border border-purple-200">
              <div className="font-bold text-purple-950">{badgeId}</div>
              <div className="text-[10px] text-purple-700 truncate">{department}</div>
            </div>
            <button
              onClick={onLogout}
              className="text-left px-3 py-2 text-xs text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl flex items-center justify-between transition-colors cursor-pointer font-bold mt-1"
            >
              <span>Exit Authority Portal</span>
              <span className="material-symbols-outlined text-[16px]">logout</span>
            </button>
          </div>
        </div>

        {/* Secure Link Badge */}
        <div className="px-space-md">
          <div className="p-space-md rounded-xl bg-purple-50/70 border border-purple-200 flex flex-col gap-space-xs">
            <span className="font-label-sm text-label-sm text-purple-700 uppercase font-mono font-semibold">Secure Link</span>
            <span className="font-label-sm text-label-sm text-purple-950 break-all font-mono font-bold">
              NODE-14-DELHI-SOUTH
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="w-full lg:pl-72 flex flex-col">
        {/* Top Header */}
        <header className="sticky top-0 w-full h-20 bg-white/95 backdrop-blur-xl border-b border-purple-200/80 shadow-sm z-40 flex items-center justify-between px-space-lg lg:px-space-xl">
          <div className="flex items-center gap-space-md">
            <div className="flex items-center gap-space-sm px-space-md py-space-xs rounded-lg bg-purple-50/80 border border-purple-200">
              <span className="material-symbols-outlined text-pink-600 text-[18px]">verified_user</span>
              <span className="font-label-sm text-label-sm text-purple-900 uppercase tracking-wider font-mono font-semibold">
                Protected by 256-bit Anonymous Routing • Active in 14 Metropolitan Zones
              </span>
            </div>
          </div>

          <div className="flex items-center gap-space-md">
            {/* Officer Credentials & Sign Out */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-bold text-purple-950">{badgeId}</span>
              <span className="text-purple-600 hidden md:inline">• {department}</span>
            </div>

            <button
              onClick={onTriggerSOS}
              className="flex items-center gap-space-xs bg-rose-600 hover:bg-rose-700 px-space-md py-space-sm rounded-lg text-white font-label-lg text-label-lg transition-all shadow-[0_2px_12px_rgba(225,29,72,0.35)] font-bold cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">e911_emergency</span>
              <span>Quick SOS</span>
            </button>

            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold cursor-pointer transition-colors"
              title="Sign out from Authority Console"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Dashboard Body */}
        <div className="p-space-lg space-y-space-lg">
          {/* Real-time Cross-Sync Notification Banner */}
          <div className="p-3 bg-white border border-pink-300 rounded-xl flex items-center justify-between text-xs font-mono shadow-sm">
            <div className="flex items-center gap-2 text-pink-700">
              <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping" />
              <span className="font-bold">LIVE ANONYMOUS INGESTION ACTIVE:</span>
              <span className="text-purple-800">
                Any complaint submitted from the citizen side instantly populates here. Changes made below reflect on the citizen tracking vault immediately.
              </span>
            </div>
            <span className="text-purple-600 uppercase text-[10px] hidden md:inline font-semibold">
              Zero PII Retained • Ephemeral Hash Protocol
            </span>
          </div>

          {/* HUD Tactical Status Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-space-md">
            {/* Metric 1 */}
            <div className="bg-white border border-purple-200 p-space-md rounded-xl flex items-center justify-between shadow-sm relative overflow-hidden group hover:border-pink-300 transition-colors">
              <div className="space-y-space-xs">
                <div className="flex items-center gap-space-xs text-purple-700">
                  <span className="material-symbols-outlined text-[16px] text-pink-600">analytics</span>
                  <span className="font-label-sm text-label-sm uppercase tracking-wider font-mono font-semibold">
                    Total Complaints
                  </span>
                </div>
                <div className="font-headline-md text-headline-md text-purple-950 tracking-tight font-bold">
                  {totalComplaints.toLocaleString()}
                </div>
                <div className="font-label-sm text-label-sm text-pink-600 flex items-center gap-0.5 font-mono font-semibold">
                  <span className="material-symbols-outlined text-[14px]">trending_up</span> +14.2% vs last cycle
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-pink-50 border border-pink-200 flex items-center justify-center text-pink-600">
                <span className="material-symbols-outlined text-[20px]">receipt_long</span>
              </div>
            </div>

            {/* Metric 2: Pending Triage */}
            <div className="bg-white border border-purple-200 p-space-md rounded-xl flex items-center justify-between shadow-sm relative overflow-hidden group hover:border-pink-300 transition-colors">
              <div className="space-y-space-xs">
                <div className="flex items-center gap-space-xs text-rose-700">
                  <span className="material-symbols-outlined text-[16px] text-rose-600">priority_high</span>
                  <span className="font-label-sm text-label-sm uppercase tracking-wider font-mono font-semibold">
                    Pending Triage
                  </span>
                </div>
                <div className="font-headline-md text-headline-md text-rose-600 tracking-tight font-bold">
                  {pendingTriageCount}
                </div>
                <div className="font-label-sm text-label-sm text-rose-700 flex items-center gap-0.5 font-mono font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" /> 9 flagged urgent
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                <span className="material-symbols-outlined text-[20px]">warning</span>
              </div>
            </div>

            {/* Metric 3: Patrols Deployed */}
            <div className="bg-white border border-purple-200 p-space-md rounded-xl flex items-center justify-between shadow-sm relative overflow-hidden group hover:border-pink-300 transition-colors">
              <div className="space-y-space-xs">
                <div className="flex items-center gap-space-xs text-purple-700">
                  <span className="material-symbols-outlined text-[16px] text-purple-600">local_police</span>
                  <span className="font-label-sm text-label-sm uppercase tracking-wider font-mono font-semibold">
                    Patrols Deployed
                  </span>
                </div>
                <div className="font-headline-md text-headline-md text-purple-900 tracking-tight font-bold">
                  18 <span className="font-label-md text-label-md text-purple-600 font-normal">/ 24 Units</span>
                </div>
                <div className="font-label-sm text-label-sm text-purple-700 flex items-center gap-0.5 font-mono font-semibold">
                  <span className="material-symbols-outlined text-[14px]">shield</span> Beat 01-18 synchronized
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
                <span className="material-symbols-outlined text-[20px]">directions_car</span>
              </div>
            </div>

            {/* Metric 4: Resolved */}
            <div className="bg-white border border-purple-200 p-space-md rounded-xl flex items-center justify-between shadow-sm relative overflow-hidden group hover:border-pink-300 transition-colors">
              <div className="space-y-space-xs">
                <div className="flex items-center gap-space-xs text-emerald-700">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
                  <span className="font-label-sm text-label-sm uppercase tracking-wider font-mono font-semibold">
                    Resolved This Month
                  </span>
                </div>
                <div className="font-headline-md text-headline-md text-emerald-700 tracking-tight font-bold">
                  {resolvedCount}
                </div>
                <div className="font-label-sm text-label-sm text-emerald-700 flex items-center gap-0.5 font-mono font-semibold">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span> 98.4% audit satisfaction
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <span className="material-symbols-outlined text-[20px]">task_alt</span>
              </div>
            </div>

            {/* Metric 5: Speed */}
            <div className="bg-white border border-purple-200 p-space-md rounded-xl flex items-center justify-between shadow-sm relative overflow-hidden group hover:border-pink-300 transition-colors">
              <div className="space-y-space-xs">
                <div className="flex items-center gap-space-xs text-purple-700">
                  <span className="material-symbols-outlined text-[16px] text-purple-600">timer</span>
                  <span className="font-label-sm text-label-sm uppercase tracking-wider font-mono font-semibold">
                    Avg. Resolution
                  </span>
                </div>
                <div className="font-headline-md text-headline-md text-purple-950 tracking-tight font-bold">
                  42 <span className="font-label-md text-label-md text-purple-600 font-normal">mins</span>
                </div>
                <div className="font-label-sm text-label-sm text-pink-600 flex items-center gap-0.5 font-mono font-semibold">
                  <span className="material-symbols-outlined text-[14px]">bolt</span> 8m faster than baseline
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
                <span className="material-symbols-outlined text-[20px]">speed</span>
              </div>
            </div>
          </div>

          {/* Filter & Investigation Control Console */}
          <div className="bg-white border border-purple-200 p-space-md rounded-xl flex flex-wrap items-center justify-between gap-space-md shadow-sm">
            <div className="flex flex-wrap items-center gap-space-sm flex-1 min-w-[280px]">
              {/* Search bar */}
              <div className="relative flex-1 min-w-[220px]">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-purple-500 text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-purple-50/50 border border-purple-200 text-purple-950 placeholder:text-purple-400 text-body-sm font-body-sm rounded-lg focus:outline-none focus:border-pink-500"
                  placeholder="Search Case Token (#AB-...), Spot Hash, or Beat..."
                />
              </div>

              {/* Zone Filter */}
              <div className="flex items-center bg-purple-50/50 border border-purple-200 rounded-lg px-3 py-1.5 gap-space-xs">
                <span className="material-symbols-outlined text-[16px] text-purple-600">domain</span>
                <select
                  value={zoneFilter}
                  onChange={e => setZoneFilter(e.target.value)}
                  className="bg-transparent text-purple-950 font-label-md text-label-md focus:outline-none cursor-pointer font-mono font-medium"
                >
                  <option value="all">All Metropolitan Zones</option>
                  <option value="north-metro">North Metro Line (Sector 14)</option>
                  <option value="south-market">South Market Sector</option>
                  <option value="univ-campus">University Campus North</option>
                </select>
              </div>

              {/* Urgency Filter */}
              <div className="flex items-center bg-purple-50/50 border border-purple-200 rounded-lg px-3 py-1.5 gap-space-xs">
                <span className="material-symbols-outlined text-[16px] text-rose-600">emergency</span>
                <select
                  value={urgencyFilter}
                  onChange={e => setUrgencyFilter(e.target.value)}
                  className="bg-transparent text-purple-950 font-label-md text-label-md focus:outline-none cursor-pointer font-mono font-medium"
                >
                  <option value="all">Urgency: Any</option>
                  <option value="critical">Urgent / Critical</option>
                  <option value="moderate">Moderate Risk</option>
                  <option value="advisory">Advisory Note</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center bg-purple-50/50 border border-purple-200 rounded-lg px-3 py-1.5 gap-space-xs">
                <span className="material-symbols-outlined text-[16px] text-purple-600">filter_list</span>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="bg-transparent text-purple-950 font-label-md text-label-md focus:outline-none cursor-pointer font-mono font-medium"
                >
                  <option value="all">Status: All Active &amp; Historical</option>
                  <option value="pending">Pending Triage</option>
                  <option value="active">Active Patrol Engaged</option>
                  <option value="rectification">Civic Rectification</option>
                  <option value="resolved">Completed / Resolved</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-space-xs">
              <button
                onClick={() => showToast('Switched to current active shift 02 (16:00 - 24:00 IST).')}
                className="flex items-center gap-space-xs px-3 py-2 bg-purple-50 hover:bg-purple-100 rounded-lg text-purple-900 font-label-md text-label-md transition-colors border border-purple-200 cursor-pointer font-medium"
              >
                <span className="material-symbols-outlined text-[16px] text-purple-600">calendar_today</span>
                <span>Today (Shift 02)</span>
              </button>
              <button
                onClick={() => {
                  setIsSyncing(true);
                  setTimeout(() => {
                    setIsSyncing(false);
                    showToast('Feed synced with 14 metropolitan nodes.');
                  }, 600);
                }}
                className="flex items-center gap-space-xs px-3 py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-95 text-white rounded-lg font-label-md text-label-md font-semibold transition-opacity cursor-pointer shadow-sm"
              >
                <span className={`material-symbols-outlined text-[16px] ${isSyncing ? 'animate-spin' : ''}`}>
                  refresh
                </span>
                <span>Sync Feed</span>
              </button>
            </div>
          </div>

          {/* Main Tactical Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
            {/* Left Column: Registry Cases (8 cols) */}
            <div className="lg:col-span-8 space-y-space-md">
              {/* Active Inspected Lead Case */}
              {activeCase && (
                <div
                  className={`bg-white rounded-2xl p-space-lg shadow-md space-y-space-md relative overflow-hidden border transition-all ${
                    caseStatus === 'resolved'
                      ? 'border-emerald-300 ring-1 ring-emerald-300/40'
                      : caseStatus === 'active'
                      ? 'border-amber-300 ring-1 ring-amber-300/40'
                      : 'border-pink-300 ring-1 ring-pink-300/40'
                  }`}
                >
                  <div className="absolute -right-16 -top-16 w-48 h-48 bg-pink-100 rounded-full blur-3xl pointer-events-none" />

                  {/* Monospace Docket Header */}
                  <div className="flex flex-wrap items-center justify-between gap-space-sm pb-space-sm border-b border-purple-100">
                    <div className="flex items-center gap-space-sm">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          caseStatus === 'resolved'
                            ? 'bg-emerald-500'
                            : caseStatus === 'active'
                            ? 'bg-amber-500 animate-pulse'
                            : 'bg-pink-500 animate-ping'
                        }`}
                      />
                      <span className="font-label-lg text-label-lg text-purple-950 font-bold tracking-wider font-mono">
                        {activeCase.hash}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded font-label-sm text-label-sm uppercase font-semibold font-mono ${
                          caseStatus === 'resolved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : caseStatus === 'active'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-pink-50 text-pink-700 border border-pink-200'
                        }`}
                      >
                        {caseStatus === 'resolved'
                          ? 'Resolved & Synchronized'
                          : caseStatus === 'active'
                          ? 'Active Patrol Engaged'
                          : activeCase.urgency === 'critical'
                          ? 'Critical Distress Alert'
                          : 'Pending Triage'}
                      </span>
                      <span className="px-2 py-0.5 bg-purple-50 text-purple-800 rounded font-label-sm text-label-sm font-mono border border-purple-200 font-medium">
                        GEO: {activeCase.gps}
                      </span>
                    </div>

                    <div className="flex items-center gap-space-xs font-label-sm text-label-sm text-purple-700 font-mono">
                      <span className="material-symbols-outlined text-[14px]">schedule</span>
                      <span>
                        {activeCase.timestamp} ({activeCase.timeAgo})
                      </span>
                    </div>
                  </div>

                  {/* Case Title & Narrative */}
                  <div className="space-y-space-xs">
                    <div className="flex items-center gap-2">
                      <h3 className="font-headline-sm text-headline-sm text-purple-950 font-bold">
                        {activeCase.category.join(' • ')} — {activeCase.location}
                      </h3>
                    </div>
                    <p className="font-body-md text-body-md text-purple-900/90 leading-relaxed font-normal">
                      {activeCase.narrative}
                    </p>
                    <div className="text-xs font-mono text-pink-700 font-medium">
                      Landmark: <span className="text-purple-950 font-bold">{activeCase.landmark}</span> • Time Window:{' '}
                      <span className="text-purple-950 font-bold">{activeCase.timeWindow}</span> • Pattern:{' '}
                      <span className="text-purple-950 font-bold">{activeCase.frequency}</span>
                    </div>
                  </div>

                  {/* Scrubbed Media & Tactical Audio Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md pt-space-xs">
                    {/* Photo Evidence with EXIF Scrubbed Indicator */}
                    <div className="relative rounded-xl overflow-hidden bg-purple-50 group h-48 flex items-center justify-center border border-purple-200 shadow-inner">
                      <EvidencePhoto
                        className="w-full h-full object-cover"
                        alt="Tactical surveillance capture"
                        src={activeCase.photoUrl}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-purple-950/80 via-transparent to-transparent flex flex-col justify-between p-space-sm pointer-events-none">
                        <div className="self-end px-2 py-0.5 bg-white/90 backdrop-blur rounded text-pink-700 font-label-sm text-label-sm flex items-center gap-1 border border-pink-200 font-mono font-bold shadow-sm">
                          <span className="material-symbols-outlined text-[12px] text-pink-600">security</span>
                          <span>EXIF Metadata Scrubbed</span>
                        </div>
                        <div>
                          <div className="font-label-sm text-label-sm text-white font-semibold font-mono">
                            Surveillance Frame #{activeCase.id.slice(-6)}
                          </div>
                          <div className="font-body-sm text-body-sm text-purple-200 font-mono">
                            Location: {activeCase.location}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Audio Snippet & Physical Parameter Gauges */}
                    <div className="bg-purple-50/60 border border-purple-200 p-space-md rounded-xl flex flex-col justify-between gap-space-sm shadow-sm">
                      <div className="space-y-space-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-label-sm text-label-sm text-purple-800 uppercase font-mono font-semibold">
                            Anonymous Audio Ambience
                          </span>
                          <span className="px-2 py-0.5 bg-pink-100 text-pink-700 rounded font-label-sm text-label-sm font-mono border border-pink-200 font-bold">
                            Audio Encrypted (00:24)
                          </span>
                        </div>

                        {/* Tactical Waveform Player */}
                        <div className="p-space-xs bg-white border border-purple-200 rounded-lg flex items-center gap-space-sm shadow-sm">
                          <button
                            type="button"
                            onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                            className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 flex items-center justify-center text-white hover:opacity-90 shadow cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {isPlayingAudio ? 'pause' : 'play_arrow'}
                            </span>
                          </button>
                          <div className="flex-1 flex items-end gap-1 h-6 px-1">
                            <div className={`w-1 bg-pink-500 h-3 rounded-full ${isPlayingAudio ? 'animate-pulse' : ''}`} />
                            <div className={`w-1 bg-pink-500 h-5 rounded-full ${isPlayingAudio ? 'animate-pulse' : ''}`} />
                            <div className={`w-1 bg-pink-500 h-2 rounded-full ${isPlayingAudio ? 'animate-pulse' : ''}`} />
                            <div className={`w-1 bg-pink-500 h-6 rounded-full ${isPlayingAudio ? 'animate-pulse' : ''}`} />
                            <div className="w-1 bg-pink-300 h-3 rounded-full" />
                            <div className="w-1 bg-pink-300 h-4 rounded-full" />
                            <div className="w-1 bg-pink-300 h-2 rounded-full" />
                            <div className="w-1 bg-purple-300 h-5 rounded-full" />
                            <div className="w-1 bg-purple-300 h-3 rounded-full" />
                            <div className="w-1 bg-purple-300 h-1 rounded-full" />
                          </div>
                          <span className="font-label-sm text-label-sm text-purple-700 font-mono font-medium">
                            {isPlayingAudio ? '00:19 / 00:24' : '00:14 / 00:24'}
                          </span>
                        </div>
                      </div>

                      {/* Spot Safety Indicators */}
                      <div className="grid grid-cols-2 gap-space-sm">
                        <div className="p-2 rounded-lg bg-white border border-purple-200 shadow-sm">
                          <div className="font-label-sm text-label-sm text-purple-700 uppercase font-mono font-semibold">Ambient Lux</div>
                          <div className="font-headline-sm text-headline-sm text-purple-950 font-bold">
                            {activeCase.luxLevel || 12}{' '}
                            <span className="text-label-sm text-purple-600 font-normal font-mono">
                              Lux ({activeCase.luxText || 'Poor'})
                            </span>
                          </div>
                        </div>
                        <div className="p-2 rounded-lg bg-white border border-purple-200 shadow-sm">
                          <div className="font-label-sm text-label-sm text-purple-700 uppercase font-mono font-semibold">Active Picket</div>
                          <div className="font-headline-sm text-headline-sm text-rose-600 font-bold">
                            {activeCase.activePicket || 'None'}{' '}
                            <span className="text-label-sm text-purple-600 font-normal font-mono">
                              (Assigned Beat)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Dispatch Controls */}
                  <div className="p-space-md bg-purple-50/50 border border-purple-200 rounded-xl space-y-space-md">
                    <div className="flex flex-wrap items-center justify-between gap-space-sm">
                      <span className="font-label-sm text-label-sm text-pink-700 uppercase font-bold tracking-wider flex items-center gap-1 font-mono">
                        <span className="material-symbols-outlined text-[16px] text-pink-600">bolt</span>
                        <span>Inter-Department Action Directives</span>
                      </span>
                      <div className="flex items-center gap-space-xs text-purple-900 font-label-sm text-label-sm bg-white border border-purple-200 px-2.5 py-1 rounded-full font-mono shadow-sm">
                        <span className="material-symbols-outlined text-[14px] text-pink-600">sync</span>
                        <span>Real-time sync to Citizen Token: <strong className="text-pink-600">{activeCase.hash}</strong></span>
                      </div>
                    </div>

                    {/* Inter-Departmental Push Buttons */}
                    <div className="flex flex-wrap items-center gap-space-sm">
                      <button
                        type="button"
                        onClick={() => handleQuickDirective('PCR Patrol Van dispatched to spot; physical recon commenced.')}
                        className="flex items-center gap-space-xs px-3 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:opacity-95 rounded-lg font-label-md text-label-md font-bold transition-all cursor-pointer shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[18px]">emergency</span>
                        <span>Deploy PCR Van / Beat Constable</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickDirective('MCD Municipal lighting work order registered for blown sodium fixtures.')}
                        className="flex items-center gap-space-xs px-3 py-2 bg-white hover:bg-purple-100 text-purple-950 rounded-lg font-label-md text-label-md transition-all border border-purple-200 cursor-pointer font-semibold shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[18px] text-amber-500">wb_incandescent</span>
                        <span>Request High-Mast Street Lighting</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickDirective('Municipal Encroachment Squad notified for sidewalk kiosk clearance.')}
                        className="flex items-center gap-space-xs px-3 py-2 bg-white hover:bg-purple-100 text-purple-950 rounded-lg font-label-md text-label-md transition-all border border-purple-200 cursor-pointer font-semibold shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[18px] text-purple-600">store</span>
                        <span>Municipal Encroachment Squad</span>
                      </button>
                    </div>

                    {/* Officer Case Final Action Row */}
                    <div className="space-y-space-xs pt-space-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <label className="font-label-sm text-label-sm text-purple-900 uppercase flex items-center gap-2 font-mono font-semibold">
                          <span>Beat Officer Logging &amp; Disposition Memo (Mirrored to Citizen Vault)</span>
                          <span className="text-pink-600 font-bold">
                            {activeCase.assignedOfficer || 'Sub-Inspector R. Sharma (ID: SI-4091)'}
                          </span>
                        </label>
                      </div>

                      <AudioTranscriber
                        label="Dictate Memo via Microphone (Gemini 3.5 Transcribe)"
                        onTranscriptionComplete={(text) => {
                          if (text) {
                            setOfficerMemo(prev => (prev.trim() ? `${prev.trim()}\n${text}` : text));
                            showToast('Voice memo transcribed and appended to officer disposition.');
                          }
                        }}
                      />

                      <textarea
                        rows={3}
                        value={officerMemo}
                        onChange={e => setOfficerMemo(e.target.value)}
                        className="w-full bg-white p-3 rounded-xl text-body-md font-body-md text-purple-950 border border-purple-200 focus:outline-none focus:border-pink-500 font-mono text-sm leading-relaxed shadow-sm"
                        placeholder="Write official memo or action note..."
                      />
                    </div>

                    {/* Status selector & Resolution Button */}
                    <div className="flex flex-wrap items-center justify-between gap-space-md pt-space-xs">
                      <div className="flex items-center gap-space-sm">
                        <span className="font-label-sm text-label-sm text-purple-800 uppercase font-mono font-semibold">
                          Case Status:
                        </span>
                        <select
                          value={caseStatus}
                          onChange={e => setCaseStatus(e.target.value)}
                          className="bg-white text-purple-950 font-label-md text-label-md px-3 py-2 rounded-lg border border-purple-200 focus:outline-none focus:border-pink-500 font-mono cursor-pointer font-medium shadow-sm"
                        >
                          <option value="pending">Pending Triage</option>
                          <option value="active">Active Patrol Engaged</option>
                          <option value="rectification">Civic Rectification</option>
                          <option value="resolved">Marked Completed / Resolved</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCommitCase}
                          className="flex items-center gap-space-xs px-space-lg py-2.5 rounded-xl font-headline-sm text-headline-sm transition-all shadow-md shadow-pink-600/20 font-bold cursor-pointer bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:opacity-95"
                        >
                          <span className="material-symbols-outlined text-[20px]">sync</span>
                          <span>Commit &amp; Synchronize Status</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Docket List of All Anonymous Complaints */}
              <div className="space-y-space-sm pt-2">
                <div className="flex items-center justify-between pb-1">
                  <span className="font-label-md text-label-md font-mono uppercase font-bold text-purple-950 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-pink-600">format_list_bulleted</span>
                    <span>All Docketed Anonymous Complaints ({filteredReports.length})</span>
                  </span>
                  <span className="text-xs text-purple-700 font-mono font-medium">
                    Click any card to inspect and update in main console
                  </span>
                </div>

                <div className="space-y-space-sm">
                  {filteredReports.map(rep => {
                    const isSelected = rep.hash === activeCase?.hash;
                    return (
                      <div
                        key={rep.id}
                        onClick={() => handleSelectCase(rep.hash)}
                        className={`rounded-2xl p-space-md border shadow-sm transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-pink-50/50 border-pink-400 ring-2 ring-pink-400/30'
                            : 'bg-white border-purple-200 hover:border-pink-300'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-space-sm">
                          <div className="flex items-center gap-space-sm">
                            <span
                              className={`w-2.5 h-2.5 rounded-full ${
                                rep.status === 'resolved'
                                  ? 'bg-emerald-500'
                                  : rep.status === 'active'
                                  ? 'bg-amber-500'
                                  : 'bg-pink-500 animate-pulse'
                              }`}
                            />
                            <span className="font-label-lg text-label-lg text-purple-950 font-bold font-mono">
                              {rep.hash}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded font-label-sm text-label-sm uppercase font-semibold font-mono border ${
                                rep.status === 'resolved'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : rep.status === 'active'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-pink-50 text-pink-700 border-pink-200'
                              }`}
                            >
                              {rep.status.toUpperCase()}
                            </span>
                            <span className="px-2 py-0.5 bg-purple-50 text-purple-800 rounded font-label-sm text-label-sm font-mono border border-purple-200 font-medium">
                              {rep.location}
                            </span>
                          </div>
                          <span className="font-label-sm text-label-sm text-purple-700 font-mono">
                            {rep.timestamp} • {rep.timeAgo}
                          </span>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md mt-2">
                          <div className="space-y-space-xs max-w-xl">
                            <h4 className="font-title-md text-title-md text-purple-950 font-bold">
                              {rep.category.join(' • ')}
                            </h4>
                            <p className="font-body-sm text-body-sm text-purple-800 line-clamp-2 leading-relaxed">
                              {rep.narrative}
                            </p>
                          </div>
                          <div className="flex items-center gap-space-sm shrink-0">
                            <div className="flex flex-col items-end text-right">
                              <span className="font-label-sm text-label-sm text-purple-600 uppercase font-mono font-medium">Landmark</span>
                              <span className="font-label-md text-label-md text-pink-700 font-bold font-mono">
                                {rep.landmark}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                handleSelectCase(rep.hash);
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all shadow-sm ${
                                isSelected
                                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white'
                                  : 'bg-purple-50 text-purple-900 hover:bg-purple-100 border border-purple-200'
                              }`}
                            >
                              {isSelected ? 'Inspecting' : 'Inspect'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Threat Grid & Intercom Logs (4 cols) */}
            <div className="lg:col-span-4 space-y-space-md">
              {/* Metropolitan Threat Grid Widget */}
              <div className="bg-white border border-purple-200 rounded-2xl p-space-md shadow-sm space-y-space-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-pink-600 text-[18px]">radar</span>
                    <span className="font-label-lg text-label-lg text-purple-950 font-bold uppercase tracking-wider font-mono">
                      Metropolitan Threat Grid
                    </span>
                  </div>
                  <span className="px-2 py-0.5 bg-rose-50 text-rose-700 rounded font-label-sm text-label-sm uppercase font-mono font-bold border border-rose-200">
                    6 Dense Hotspots
                  </span>
                </div>

                {/* Embedded Geo-Map View */}
                <div className="relative rounded-xl overflow-hidden h-64 bg-purple-50 border border-purple-200 shadow-inner">
                  <div
                    className="w-full h-full bg-cover bg-center"
                    data-location="Connaught Place and Delhi Metro Stations, New Delhi, India"
                    style={{
                      backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBgpQi3-RKGSP0Abn6IKoq51GfzkkcRqtfltScNUvYf5RmUKCQTeM_YukHIRsDWNeLjWeVWddhsLLo-fcKwxOENJDCc8yWuvaAeQkXLHGoW9kpK3tS35EM4ATRTtkcRka7mjai-L4TDaORQwpDFWDPlYRYzFqGVFa8dt1vOc5Q4gas8dVzM8NIb7eTHSYSIjjJoL5GpE0mj0N7QauUJu7O6yv9YFC2jGEcx_OTVgit0UEkBk--D8p-Z')`,
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-950/80 via-transparent to-transparent flex flex-col justify-end p-space-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-label-sm text-white font-mono font-medium">
                        Sector 14 Corridor (Live Vector)
                      </span>
                      <span className="font-label-sm text-label-sm text-pink-300 font-bold font-mono">
                        14 Active Beacons
                      </span>
                    </div>
                  </div>
                </div>

                {/* Density Legend */}
                <div className="flex items-center justify-between text-label-sm font-label-sm text-purple-800 pt-space-xs font-mono font-medium">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Critical Hostility
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Loitering Cluster
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600" /> Safe Adda Zone
                  </div>
                </div>
              </div>

              {/* Rapid Beat Dispatch & Intercom Log */}
              <div className="bg-white border border-purple-200 rounded-2xl p-space-md shadow-sm space-y-space-sm">
                <div className="flex items-center justify-between border-b border-purple-100 pb-space-xs">
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-purple-600 text-[18px]">cell_tower</span>
                    <span className="font-label-lg text-label-lg text-purple-950 font-bold uppercase tracking-wider font-mono">
                      Patrol Intercom
                    </span>
                  </div>
                  <span className="font-label-sm text-label-sm text-pink-700 font-mono font-bold">
                    Radio: CH-09
                  </span>
                </div>

                {/* Stream of Radio Events */}
                <div className="space-y-space-sm font-body-sm text-body-sm max-h-56 overflow-y-auto pr-1">
                  {radioLogs.map(log => (
                    <div
                      key={log.id}
                      className="p-space-xs rounded-xl bg-purple-50/70 border border-purple-200/80 flex items-start gap-space-xs"
                    >
                      <span className="material-symbols-outlined text-[16px] text-pink-600 shrink-0 mt-0.5">
                        headset_mic
                      </span>
                      <div className="w-full">
                        <div className="flex items-center justify-between">
                          <span className="font-label-sm text-label-sm text-purple-950 font-bold font-mono">
                            {log.callsign}
                          </span>
                          <span className="font-label-sm text-label-sm text-purple-600 font-mono font-medium">{log.time}</span>
                        </div>
                        <p className="text-purple-800 font-body-sm text-body-sm mt-0.5 leading-relaxed">
                          {log.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Broadcast Push Input with Gemini Voice Dictation */}
                <div className="pt-space-xs flex flex-col gap-1.5">
                  <AudioTranscriber
                    label="Voice Dictate Directive (Mic)"
                    onTranscriptionComplete={(text) => {
                      if (text) {
                        setNewBroadcast(prev => (prev.trim() ? `${prev.trim()} ${text}` : text));
                        showToast('Voice directive transcribed by Gemini 3.5.');
                      }
                    }}
                  />
                  <form onSubmit={handleBroadcast} className="flex gap-space-xs">
                    <input
                      type="text"
                      value={newBroadcast}
                      onChange={e => setNewBroadcast(e.target.value)}
                      placeholder="Broadcast directive to on-duty beats..."
                      className="flex-1 bg-purple-50/50 border border-purple-200 px-3 py-1.5 rounded-xl text-body-sm font-body-sm text-purple-950 placeholder:text-purple-400 focus:outline-none focus:border-pink-500 font-mono"
                    />
                    <button
                      type="submit"
                      className="p-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl hover:opacity-90 transition-opacity cursor-pointer font-bold shadow-sm"
                      title="Send radio broadcast"
                    >
                      <span className="material-symbols-outlined text-[16px]">send</span>
                    </button>
                  </form>
                </div>
              </div>

              {/* Municipal Department Coordination Matrix */}
              <div className="bg-white border border-purple-200 rounded-2xl p-space-md shadow-sm space-y-space-xs">
                <span className="font-label-sm text-label-sm text-purple-700 uppercase tracking-wider font-mono font-bold">
                  Inter-Agency Escalation Status
                </span>
                <div className="space-y-space-xs pt-space-xs">
                  <div className="flex items-center justify-between text-label-sm font-label-sm font-mono">
                    <span className="text-purple-950 font-medium">Delhi Police South-West PCR</span>
                    <span className="text-pink-700 font-bold">100% ONLINE</span>
                  </div>
                  <div className="w-full bg-purple-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-pink-500 to-purple-600 h-full w-full" />
                  </div>
                </div>
                <div className="space-y-space-xs pt-space-xs">
                  <div className="flex items-center justify-between text-label-sm font-label-sm font-mono">
                    <span className="text-purple-950 font-medium">Municipal Encroachment Dept</span>
                    <span className="text-purple-700 font-bold">3 SQUADS ACTIVE</span>
                  </div>
                  <div className="w-full bg-purple-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full w-3/4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
