import { IncidentReport } from '../types';

export const INITIAL_REPORTS: IncidentReport[] = [
  {
    id: 'case-ab-78942',
    hash: '#AB-78942-METRO3',
    category: ['Catcalling / Threat Adda', 'Group Intimidation'],
    narrative:
      'Persistent hostile gathering & harassment outside Metro Gate 3 Chai stall during evening rush. Unauthorized crowd of 12-15 individuals blocking the pedestrian sidewalk, catcalling commuters exiting subway escalators, accompanied by illegal tea and pan-masala stalls.',
    location: 'Metro Gate 3 Underpass, Sector 14, Delhi',
    landmark: 'Near Sharma Tea Stall & Gate 3 Escalator',
    gps: '28.4819° N, 77.0878° E (Fuzzed ±15m for privacy)',
    network: 'Delhi Metro DMRC / Kolkata Metro',
    urgency: 'critical',
    status: 'active',
    timestamp: '18:42 IST',
    timeAgo: '38 mins ago',
    timeWindow: '07:30 PM - 09:30 PM',
    frequency: 'Daily Occurrence (Recurring)',
    hasAudio: true,
    audioDuration: '00:24',
    hasPhoto: true,
    photoUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuARc0LFL29UEfW0sdNruGMe76Qriq85dyHzzJ2BDCR1p5vTqXzoca0jRH_G-Tyzy4QkP6IArBmaGE3kYJb0Rls0Yg4cIp5bvYAePIZVvoRd4gUFdGwwrzHoBuSqdV4Qrx8GOcFPxXvZG3CtxJghBeAuPi7wrxcCXRdQ14GgNz1_06XgP_3bWrdkYzXBuywCbCx2NXPRPKlD2Ie7wzQu4PRrK9lTRdyIwGT6FTOMHdqhjr-VwrJ1iW7F',
    assignedOfficer: 'Sub-Inspector R. Sharma (ID: SI-4091)',
    assignedUnit: 'PCR Van #12',
    officerMemo:
      'Beat Patrol 04 visited at 20:15 hrs. Dispersed unauthorized crowd, issued challan to illegal tea kiosk, stationed fixed picket between 19:00 - 22:00 hrs daily.',
    luxLevel: 12,
    luxText: '12 Lux (Poor)',
    activePicket: 'None (Vacant)',
  },
  {
    id: 'case-ab-78941',
    hash: '#AB-78941-KOL',
    category: ['Group Intimidation', 'Metro / Transit Stalking'],
    narrative:
      'Group loitering near Girls College bus shelter, eve-teasing reported. Multiple calls received via SOS stealth beacon regarding youth on modified bikes circling the passenger shelter.',
    location: 'Sector 7-B Bus Corridor',
    landmark: 'Opposite Modern Girls College Gate 2',
    gps: '22.5726° N, 88.3639° E (Fuzzed ±15m for privacy)',
    network: 'Kolkata Metro Corridor',
    urgency: 'critical',
    status: 'active',
    timestamp: '17:50 IST',
    timeAgo: '1h 20m ago',
    timeWindow: '05:00 PM - 07:00 PM',
    frequency: 'Daily Occurrence (Recurring)',
    hasAudio: false,
    hasPhoto: false,
    assignedOfficer: 'Officer Das',
    assignedUnit: 'Beat 12 Motorcycle Squad',
    officerMemo: 'Patrol Officer Das deployed at 18:02 hrs. Contact maintained with perimeter wardens.',
    luxLevel: 18,
    luxText: '18 Lux (Moderate)',
    activePicket: 'Mobile Patrol',
  },
  {
    id: 'case-ab-78939',
    hash: '#AB-78939-NCR',
    category: ['Liquor / Open Gambling'],
    narrative:
      'Gambling adda blocking public walkway near Subhash Park. Unregulated gathering drinking and gambling around the gazebo pavilion, intimidating families and evening walkers.',
    location: 'Subhash Park East Walkway',
    landmark: 'East Walkway Gazebo',
    gps: '28.6507° N, 77.2334° E (Fuzzed ±15m for privacy)',
    network: 'Delhi Metro DMRC',
    urgency: 'moderate',
    status: 'resolved',
    timestamp: '14:15 IST',
    timeAgo: 'Cleared in 24m',
    timeWindow: '02:00 PM - 04:00 PM',
    frequency: 'Weekend Evenings Only',
    hasAudio: false,
    hasPhoto: false,
    assignedOfficer: 'Beat Constable Yadav',
    assignedUnit: 'PCR Bravo-08',
    officerMemo:
      'PCR Bravo-08 cleared the perimeter. 4 persons warned under Delhi Police Act Sec 65. Municipal ward locked the pavilion gates.',
    luxLevel: 45,
    luxText: '45 Lux (Adequate Daylight)',
    activePicket: 'Stationed Day Beat',
  },
];

const STORAGE_KEY_REPORTS = 'addabaaji_incident_reports_v2';
const STORAGE_KEY_MY_KEYS = 'addabaaji_my_anonymous_keys_v2';

export function getStoredReports(): IncidentReport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REPORTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(INITIAL_REPORTS));
      return INITIAL_REPORTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_REPORTS;
  } catch {
    return INITIAL_REPORTS;
  }
}

export function saveStoredReports(reports: IncidentReport[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(reports));
    window.dispatchEvent(new Event('addabaaji_reports_updated'));
  } catch (err) {
    console.error('Failed to save reports to localStorage:', err);
  }
}

export function getMyAnonymousKeys(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MY_KEYS);
    if (!raw) {
      // Default to the first case token for demo
      const def = ['#AB-78942-METRO3'];
      localStorage.setItem(STORAGE_KEY_MY_KEYS, JSON.stringify(def));
      return def;
    }
    return JSON.parse(raw);
  } catch {
    return ['#AB-78942-METRO3'];
  }
}

export function saveMyAnonymousKey(hash: string): void {
  try {
    const current = getMyAnonymousKeys();
    if (!current.includes(hash)) {
      const updated = [hash, ...current];
      localStorage.setItem(STORAGE_KEY_MY_KEYS, JSON.stringify(updated));
      window.dispatchEvent(new Event('addabaaji_keys_updated'));
    }
  } catch (err) {
    console.error('Failed to save anonymous key:', err);
  }
}
