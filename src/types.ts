export type UserRole = 'none' | 'citizen' | 'authority';

export type ScreenType = 'login' | 'citizen-anonymous-portal' | 'authority-command-center';

export interface IncidentReport {
  id: string;
  hash: string;
  category: string[];
  narrative: string;
  location: string;
  landmark: string;
  gps: string;
  network: string;
  urgency: 'critical' | 'moderate' | 'advisory';
  status: 'pending' | 'active' | 'rectification' | 'resolved';
  timestamp: string;
  timeAgo: string;
  timeWindow: string;
  frequency: string;
  hasAudio: boolean;
  audioDuration?: string;
  hasPhoto: boolean;
  photoUrl?: string;
  assignedOfficer?: string;
  assignedUnit?: string;
  officerMemo?: string;
  luxLevel?: number;
  luxText?: string;
  activePicket?: string;
}

export interface RadioLog {
  id: string;
  callsign: string;
  time: string;
  message: string;
  type: 'patrol' | 'intercom' | 'mcd';
}
