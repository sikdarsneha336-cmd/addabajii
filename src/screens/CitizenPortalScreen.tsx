import React, { useState, useRef } from 'react';
import { IncidentReport, ScreenType } from '../types';
import { AudioTranscriber } from '../components/AudioTranscriber';
import { EvidencePhoto } from '../components/EvidencePhoto';

interface CitizenPortalScreenProps {
  reports: IncidentReport[];
  myAnonymousKeys: string[];
  activeTrackingKey: string;
  onSelectTrackingKey: (key: string) => void;
  onReportSubmitted: (newReport: IncidentReport) => void;
  onTriggerCamouflage: () => void;
}

export const CitizenPortalScreen: React.FC<CitizenPortalScreenProps> = ({
  reports,
  myAnonymousKeys,
  activeTrackingKey,
  onSelectTrackingKey,
  onReportSubmitted,
  onTriggerCamouflage,
}) => {
  // Classification Tags
  const [selectedTags, setSelectedTags] = useState<string[]>([
    'Catcalling / Threat Adda',
    'Group Intimidation',
  ]);

  // Form State
  const [narrative, setNarrative] = useState(
    '5-6 young men gather constantly around the unregulated cigarette shack right outside Metro Gate 3 exit. They pass unsolicited personal remarks and block pedestrian ingress. Between 8:00 PM and 9:30 PM commuters have to step into oncoming traffic to bypass them.'
  );
  const [searchLocation, setSearchLocation] = useState(
    'Rajiv Chowk Metro Gate 3 / Connaught Place Radial'
  );
  const [landmark, setLandmark] = useState('Near Sharma Tea Stall & Gate 3 Escalator');
  const [fuzzedGps, setFuzzedGps] = useState('28.6328° N, 77.2197° E (Fuzzed ±15m for privacy)');
  const [frequency, setFrequency] = useState('Daily Occurrence (Recurring)');
  const [timeStart, setTimeStart] = useState('07:30 PM');
  const [timeEnd, setTimeEnd] = useState('09:30 PM');
  const [selectedNetwork, setSelectedNetwork] = useState('Delhi Metro DMRC / Kolkata Metro');
  const [hasAudio, setHasAudio] = useState(true);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [facesBlurred, setFacesBlurred] = useState(true);
  const [mapZoom, setMapZoom] = useState(15);
  const [pinOffset, setPinOffset] = useState({ x: 0, y: 0 });

  // Photo Evidence Upload State
  const DEFAULT_SURVEILLANCE_PHOTO =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDcrBxDBi2x1tOaXfGWngKrcLI-1ZMHYAP4s7xzubeyDBl0ZaJaXgbZ1JArqAbCHfTA0qBZx2Y9AGeGD1TRtg6o0SlFaRU5WsV8jk1XH-zXpqvuagNS50ojIRokPXbdwfnMKt0G1vZuPEUqSHjMkAxMiMV02TmGk9-kfHBd15guXre4DGjIs7fDBhy02NBD8ct_SzkmBJZkZmWNEHmeyK_7M2FcqLL4_gdTe0tGZM-Q0ILn4teDQ0yU';

  const [photoUrl, setPhotoUrl] = useState<string>(DEFAULT_SURVEILLANCE_PHOTO);
  const [photoName, setPhotoName] = useState<string>('sample_night_patrol.jpg');
  const [photoSize, setPhotoSize] = useState<string>('1.8 MB');
  const [isDevicePhoto, setIsDevicePhoto] = useState<boolean>(false);
  const [isDraggingPhoto, setIsDraggingPhoto] = useState<boolean>(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setToastMsg('Please choose an image file (e.g. JPG, PNG, WEBP).');
      setTimeout(() => setToastMsg(null), 3500);
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setToastMsg('Image size exceeds 25MB limit. Please select a smaller photo.');
      setTimeout(() => setToastMsg(null), 3500);
      return;
    }

    const sizeFormatted =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        setPhotoUrl(dataUrl);
        setPhotoName(file.name);
        setPhotoSize(sizeFormatted);
        setIsDevicePhoto(true);
        setToastMsg(`✓ Photo "${file.name}" uploaded from device! EXIF stripped and sanitized.`);
        setTimeout(() => setToastMsg(null), 4000);
      }
    };
    reader.onerror = () => {
      setToastMsg('Failed to read image file from device. Please try another photo.');
      setTimeout(() => setToastMsg(null), 4000);
    };
    reader.readAsDataURL(file);
  };

  const handleResetPhoto = () => {
    setPhotoUrl(DEFAULT_SURVEILLANCE_PHOTO);
    setPhotoName('sample_night_patrol.jpg');
    setPhotoSize('1.8 MB');
    setIsDevicePhoto(false);
    if (photoInputRef.current) {
      photoInputRef.current.value = '';
    }
    setToastMsg('Reset to default surveillance frame.');
    setTimeout(() => setToastMsg(null), 2500);
  };

  // Lookup by Hash
  const [lookupHashInput, setLookupHashInput] = useState('');

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Active inspected report in the vault
  const activeReport =
    reports.find(r => r.hash.trim().toUpperCase() === activeTrackingKey.trim().toUpperCase()) ||
    reports[0];

  const availableCategories = [
    {
      title: 'Catcalling / Threat Adda',
      desc: 'Corner tea shops, hostile gaze, vulgar catcalls',
      color: 'text-error',
    },
    {
      title: 'Group Intimidation',
      desc: 'Crowding pathways, blocking commuters, loitering',
      color: 'text-secondary',
    },
    {
      title: 'Liquor / Open Gambling',
      desc: 'Near school perimeter, park corners, or bus depots',
      color: 'text-tertiary',
    },
    {
      title: 'Metro / Transit Stalking',
      desc: 'Persistent following from escalators to exits',
      color: 'text-primary',
    },
    {
      title: 'Poor Lighting Hotspot',
      desc: 'Broken municipal lamps, pitch black lanes',
      color: 'text-amber-300',
    },
    {
      title: 'Unregulated Parking Dens',
      desc: 'Unauthorized car gatherings drinking inside vehicles',
      color: 'text-outline',
    },
  ];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const copyKey = () => {
    if (!activeReport) return;
    navigator.clipboard.writeText(activeReport.hash).then(() => {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    });
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setPinOffset({ x: Math.max(-120, Math.min(120, x)), y: Math.max(-60, Math.min(60, y)) });
    const lat = (28.6328 + y * -0.0001).toFixed(4);
    const lng = (77.2197 + x * 0.0001).toFixed(4);
    setFuzzedGps(`${lat}° N, ${lng}° E (Fuzzed ±15m for privacy)`);
    setLandmark('Near Metro Concourse Radial Lane');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!narrative.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const randomHashNum = Math.floor(10000 + Math.random() * 90000);
      const newHash = `#AB-${randomHashNum}-METRO3`;
      setIsSubmitting(false);
      setIsSubmitted(true);

      const newReport: IncidentReport = {
        id: `case-${Date.now()}`,
        hash: newHash,
        category: selectedTags.length > 0 ? selectedTags : ['Civic Adda Concern'],
        narrative,
        location: searchLocation,
        landmark,
        gps: fuzzedGps,
        network: selectedNetwork,
        urgency: selectedTags.includes('Catcalling / Threat Adda') ? 'critical' : 'moderate',
        status: 'pending',
        timestamp:
          new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST',
        timeAgo: 'Just now',
        timeWindow: `${timeStart} - ${timeEnd}`,
        frequency,
        hasAudio,
        audioDuration: hasAudio ? '00:24' : undefined,
        hasPhoto: true,
        photoUrl: photoUrl,
        luxLevel: 12,
        luxText: '12 Lux (Poor)',
        activePicket: 'None (Pending Assignment)',
        officerMemo: 'Automated receipt: Incident queued in Central Beat dispatch docket.',
      };

      onReportSubmitted(newReport);
      onSelectTrackingKey(newHash);
      setToastMsg(`Zero-Trace report uploaded! Secret key: ${newHash} is now live in your vault.`);
      setTimeout(() => setToastMsg(null), 5000);
    }, 1100);
  };

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupHashInput.trim()) return;
    const clean = lookupHashInput.trim().toUpperCase();
    const formatted = clean.startsWith('#') ? clean : `#${clean}`;
    const found = reports.find(r => r.hash.toUpperCase() === formatted);
    if (found) {
      onSelectTrackingKey(found.hash);
      setToastMsg(`Loaded anonymous report ${found.hash}`);
      setLookupHashInput('');
    } else {
      setToastMsg(`No report found for token ${formatted}. Check token format.`);
    }
    setTimeout(() => setToastMsg(null), 4000);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-white border border-pink-400 text-purple-950 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <span className="material-symbols-outlined text-pink-600">task_alt</span>
          <span className="text-sm font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Primary Shield Banner */}
      <section className="w-full px-margin-lg pt-space-lg pb-space-md">
        <div className="relative overflow-hidden rounded-2xl bg-white border border-purple-200 p-space-lg shadow-sm">
          <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-pink-100/70 blur-3xl pointer-events-none" />
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-md relative z-10">
            <div className="flex flex-col gap-space-xs max-w-3xl">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-pink-600 text-[20px]">shield_person</span>
                <span className="font-label-sm text-label-sm text-pink-700 uppercase tracking-widest font-bold font-mono">
                  Protocol 0-Log Protection Active
                </span>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-purple-950 tracking-tight font-bold">
                File an Anonymous Safety Report
              </h1>
              <p className="font-body-md text-body-md text-purple-800">
                Document hostile street groups, systemic street harassment, stalking, or hazardous civic corners without attaching identity, contact details, or network footprints.
              </p>
            </div>

            <div className="flex items-center gap-space-sm bg-purple-50/90 border border-purple-200 px-space-md py-space-sm rounded-xl shadow-sm">
              <div className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse" />
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-purple-950 uppercase font-bold font-mono">
                  Onion Routing Guard
                </span>
                <span className="font-label-sm text-label-sm text-purple-700 font-mono">
                  IP Scrambled • EXIF Stripped • No Login Required
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Interface Grid */}
      <section className="w-full px-margin-lg pb-space-xl">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
          {/* Left/Center: Form (8 cols on desktop) */}
          <div className="xl:col-span-8 flex flex-col gap-space-lg">
            <form onSubmit={handleSubmit} className="flex flex-col gap-space-lg">
              {/* Category 1: Incident Category Chips */}
              <div className="bg-white border border-purple-200 p-space-lg rounded-2xl shadow-sm flex flex-col gap-space-md">
                <div className="flex items-center justify-between">
                  <label className="font-label-lg text-label-lg text-purple-950 flex items-center gap-space-xs uppercase tracking-wider font-bold">
                    <span className="material-symbols-outlined text-pink-600 text-[20px]">category</span>
                    <span>1. Incident Classification</span>
                  </label>
                  <span className="font-label-sm text-label-sm text-purple-700 font-mono">
                    Single or Multiple Select
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-space-sm">
                  {availableCategories.map(cat => {
                    const isSelected = selectedTags.includes(cat.title);
                    return (
                      <button
                        key={cat.title}
                        type="button"
                        onClick={() => toggleTag(cat.title)}
                        className={`text-left p-space-sm rounded-xl transition-all border flex flex-col gap-1 cursor-pointer ${
                          isSelected
                            ? 'bg-pink-50/80 border-pink-400 shadow-sm'
                            : 'bg-purple-50/40 border-purple-200 hover:bg-purple-50'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className={`font-label-sm text-label-sm font-bold font-mono ${cat.color}`}>
                            {cat.title}
                          </span>
                          <span
                            className={`material-symbols-outlined text-pink-600 text-[18px] transition-opacity ${
                              isSelected ? 'opacity-100' : 'opacity-0'
                            }`}
                          >
                            check_circle
                          </span>
                        </div>
                        <span className="font-body-sm text-body-sm text-purple-800 line-clamp-1">
                          {cat.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category 2: Media Dropzone & EXIF Scrubber */}
              <div className="bg-white border border-purple-200 p-space-lg rounded-2xl shadow-sm flex flex-col gap-space-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
                  <label className="font-label-lg text-label-lg text-purple-950 flex items-center gap-space-xs uppercase tracking-wider font-bold">
                    <span className="material-symbols-outlined text-pink-600 text-[20px]">add_a_photo</span>
                    <span>2. Evidence &amp; Automated Metadata Sanitizer</span>
                  </label>
                  <div className="flex items-center gap-space-xs bg-pink-50 border border-pink-200 px-space-sm py-1 rounded-lg">
                    <span className="material-symbols-outlined text-pink-600 text-[14px]">auto_fix_high</span>
                    <span className="font-label-sm text-label-sm text-pink-700 uppercase font-mono font-bold">
                      EXIF Data Auto-Wiped
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-space-md">
                  {/* Upload Area */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingPhoto(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      setIsDraggingPhoto(false);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingPhoto(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) {
                        handlePhotoFile(file);
                      }
                    }}
                    onClick={() => photoInputRef.current?.click()}
                    className={`md:col-span-7 flex flex-col items-center justify-center p-space-lg rounded-xl border-2 border-dashed transition-all cursor-pointer relative overflow-hidden group min-h-[190px] ${
                      isDraggingPhoto
                        ? 'border-pink-500 bg-pink-100/60 ring-2 ring-pink-300'
                        : isDevicePhoto
                        ? 'border-emerald-300 bg-emerald-50/40 hover:border-emerald-400'
                        : 'border-purple-300 bg-purple-50/40 hover:border-pink-500 hover:bg-pink-50/20'
                    }`}
                  >
                    {/* Hidden Native File Input */}
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handlePhotoFile(file);
                        }
                      }}
                    />

                    {isDevicePhoto ? (
                      <div className="flex flex-col items-center text-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-300 shadow-sm">
                          <span className="material-symbols-outlined text-[26px]">check_circle</span>
                        </div>
                        <div>
                          <p className="font-headline-sm text-headline-sm text-purple-950 font-bold">
                            Device Photo Attached
                          </p>
                          <p className="font-label-sm text-label-sm font-mono text-purple-700 mt-0.5 truncate max-w-[280px]">
                            {photoName} ({photoSize})
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              photoInputRef.current?.click();
                            }}
                            className="px-3 py-1.5 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[15px]">file_upload</span>
                            <span>Change Photo</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleResetPhoto();
                            }}
                            className="px-3 py-1.5 bg-white hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                          >
                            Reset
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-purple-400 group-hover:text-pink-600 text-[40px] transition-colors">
                          add_photo_alternate
                        </span>
                        <p className="font-headline-sm text-headline-sm text-purple-950 mt-space-xs text-center font-bold">
                          Upload Photo from Device
                        </p>
                        <p className="font-body-sm text-body-sm text-purple-800 text-center mt-1 max-w-sm">
                          Select a photo from your device gallery, capture live, or drag and drop here
                        </p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            photoInputRef.current?.click();
                          }}
                          className="mt-space-sm px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-semibold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer transform group-hover:scale-105"
                        >
                          <span className="material-symbols-outlined text-[18px]">upload</span>
                          <span>Select Photo from Device</span>
                        </button>
                        <p className="font-label-sm text-label-sm text-purple-600 font-mono mt-2">
                          JPG, PNG, WEBP (Max 25MB)
                        </p>
                      </>
                    )}

                    <div className="flex items-center gap-space-xs mt-space-sm bg-white/90 px-space-sm py-1 rounded border border-purple-200 shadow-xs">
                      <span className="material-symbols-outlined text-pink-600 text-[14px]">lock_reset</span>
                      <span className="font-label-sm text-label-sm text-purple-800 font-mono font-medium">
                        Device serial, lens, ISO &amp; metadata stripped instantly
                      </span>
                    </div>
                  </div>

                  {/* Sanitized Preview Widget */}
                  <div className="md:col-span-5 bg-purple-50/40 border border-purple-200 p-space-md rounded-xl flex flex-col gap-space-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-label-sm text-label-sm text-purple-700 uppercase tracking-wider font-mono font-semibold">
                          Sanitized Preview
                        </span>
                        {isDevicePhoto && (
                          <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-1.5 py-0.2 rounded">
                            Device File
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setFacesBlurred(!facesBlurred)}
                        className={`font-label-sm text-label-sm px-2 py-0.5 rounded transition-all font-mono font-bold cursor-pointer ${
                          facesBlurred
                            ? 'text-pink-700 bg-pink-100 border border-pink-300'
                            : 'text-purple-700 bg-purple-100'
                        }`}
                      >
                        {facesBlurred ? 'Faces Blurred' : 'Blur Off'}
                      </button>
                    </div>

                    <div className="relative w-full h-36 rounded-lg overflow-hidden bg-purple-100 border border-purple-200">
                      <EvidencePhoto
                        isBlurred={facesBlurred}
                        alt={isDevicePhoto ? 'Uploaded device evidence photo' : 'Sanitized night surveillance view'}
                        src={photoUrl}
                        className="w-full h-full object-cover transition-all"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-purple-950/80 via-transparent to-transparent flex items-end justify-between p-space-xs">
                        <span className="font-label-sm text-label-sm text-white bg-purple-950/80 px-2 py-0.5 rounded backdrop-blur-sm font-mono border border-purple-400/40">
                          EXIF: Scrubbed • {isDevicePhoto ? 'Source: Device' : 'Source: Frame'}
                        </span>
                        {isDevicePhoto && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleResetPhoto();
                            }}
                            className="text-[11px] font-mono font-bold text-rose-200 hover:text-white bg-rose-950/60 px-1.5 py-0.5 rounded backdrop-blur-sm transition-colors cursor-pointer"
                            title="Remove uploaded photo"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>

                    {isDevicePhoto && (
                      <div className="flex items-center justify-between text-[11px] font-mono text-purple-700 bg-white/80 border border-purple-200 px-2 py-1 rounded">
                        <span className="truncate max-w-[170px]" title={photoName}>
                          {photoName}
                        </span>
                        <span className="text-purple-500">{photoSize}</span>
                      </div>
                    )}

                    {/* Audio Clip Attached Mock or Recorded Audio */}
                    {hasAudio && (
                      <div className="flex flex-col gap-1 bg-white border border-purple-200 p-space-xs rounded-lg shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-space-xs">
                            <span className="material-symbols-outlined text-purple-600 text-[18px]">mic</span>
                            <span className="font-label-sm text-label-sm text-purple-900 truncate max-w-[140px] font-mono font-medium">
                              {recordedAudioUrl ? 'live_mic_recording.webm' : 'ambient_clip_22s.aac'}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              setHasAudio(false);
                              setRecordedAudioUrl(null);
                            }}
                            className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer"
                            type="button"
                            title="Remove audio memo"
                          >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        </div>
                        {recordedAudioUrl && (
                          <audio src={recordedAudioUrl} controls className="w-full h-7 mt-1 rounded opacity-90" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Category 3: Detailed Incident Description */}
              <div className="bg-white border border-purple-200 p-space-lg rounded-2xl shadow-sm flex flex-col gap-space-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
                  <label
                    htmlFor="incident-narrative"
                    className="font-label-lg text-label-lg text-purple-950 flex items-center gap-space-xs uppercase tracking-wider font-bold"
                  >
                    <span className="material-symbols-outlined text-pink-600 text-[20px]">edit_note</span>
                    <span>3. Specific Incident Narrative</span>
                  </label>
                  <span className="font-label-sm text-label-sm text-purple-700 font-mono">
                    Zero Self-Identifying Info Required
                  </span>
                </div>

                {/* Gemini 3.5 Transcribe Microphone Input */}
                <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-200 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-pink-700 font-bold uppercase flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-pink-600">speech_to_text</span>
                      <span>Microphone Voice Input &bull; Gemini 3.5 Transcribe</span>
                    </span>
                    <span className="text-[10px] text-purple-700 font-mono">Real-time speech-to-text</span>
                  </div>
                  <AudioTranscriber
                    label="Speak Your Report (Microphone &rarr; Text)"
                    onTranscriptionComplete={(transcript, audioBlobUrl) => {
                      if (transcript) {
                        setNarrative(prev => (prev.trim() ? `${prev.trim()}\n${transcript}` : transcript));
                        setHasAudio(true);
                        if (audioBlobUrl) {
                          setRecordedAudioUrl(audioBlobUrl);
                        }
                        setToastMsg('Speech transcribed using gemini-3.5-transcribe and added to narrative!');
                        setTimeout(() => setToastMsg(null), 5000);
                      }
                    }}
                  />
                </div>

                <div className="relative">
                  <textarea
                    id="incident-narrative"
                    rows={4}
                    value={narrative}
                    onChange={e => setNarrative(e.target.value)}
                    className="w-full bg-purple-50/30 border border-purple-200 text-purple-950 p-space-md rounded-xl font-body-md text-body-md focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200 placeholder:text-purple-400 transition-all leading-relaxed"
                    placeholder="Describe what is happening (e.g. 5-6 men gathered at Metro Gate 3 corner tea stall, passing vulgar comments at women commuters every evening between 7:30 - 9:00 PM)."
                  />
                  <div className="flex justify-between items-center mt-space-xs">
                    <span className="font-label-sm text-label-sm text-purple-700 font-mono flex items-center gap-1 font-medium">
                      <span className="material-symbols-outlined text-[14px] text-pink-600">check_circle</span>
                      Auto-Scrubbing PII: Phone numbers &amp; names highlighted for warning
                    </span>
                    <span className="font-label-sm text-label-sm text-purple-700 font-mono">
                      {narrative.length} / 2000 chars
                    </span>
                  </div>
                </div>
              </div>

              {/* Category 4: Metro Map & Location Tagging Widget */}
              <div className="bg-white border border-purple-200 p-space-lg rounded-2xl shadow-sm flex flex-col gap-space-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
                  <label className="font-label-lg text-label-lg text-purple-950 flex items-center gap-space-xs uppercase tracking-wider font-bold">
                    <span className="material-symbols-outlined text-pink-600 text-[20px]">fmd_good</span>
                    <span>4. Precise Metro &amp; Landmark Geo-Tagging</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="font-label-sm text-label-sm text-purple-700 font-mono font-semibold">Network:</span>
                    <select
                      value={selectedNetwork}
                      onChange={e => setSelectedNetwork(e.target.value)}
                      className="font-label-sm text-label-sm bg-purple-50 border border-purple-200 px-2 py-0.5 rounded text-purple-950 font-mono focus:outline-none cursor-pointer"
                    >
                      <option>Delhi Metro DMRC / Kolkata Metro</option>
                      <option>Mumbai Metro MMOPL / Western Suburban</option>
                      <option>Bengaluru Namma Metro / Outer Ring</option>
                    </select>
                  </div>
                </div>

                {/* Search Field */}
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-3 text-purple-400 text-[20px]">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchLocation}
                    onChange={e => setSearchLocation(e.target.value)}
                    className="w-full pl-10 pr-space-md py-space-sm bg-purple-50/40 border border-purple-200 text-purple-950 rounded-xl font-body-md text-body-md focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
                    placeholder="Search metro station, gate number, market alley or landmark..."
                  />
                </div>

                {/* Interactive Map Visualizer */}
                <div
                  onClick={handleMapClick}
                  className="relative rounded-xl overflow-hidden bg-purple-100 border border-purple-200 h-64 flex flex-col justify-between p-space-md cursor-crosshair select-none shadow-inner"
                  title="Click anywhere on the map to place distress hotspot pin"
                >
                  <div
                    className="absolute inset-0 opacity-60 bg-cover bg-center transition-all duration-300"
                    data-location="Rajiv Chowk Metro Station, Connaught Place, New Delhi"
                    style={{
                      backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBYtIz4bRQN6yA9ZY5nweG3NPlukGTB1bWGTZCjkJ-EbE7aP6uPDiiiryVy0vPsfSWD4FiFts7OAYVUlevJIPChqZa5H8KLgzM_7_kae4TLOgg3k04JnkVkvHGFHQt547IcxbFoQDWpdDpowsfCqtGERS019Eg2Biw-iZKAHpdVTllpZXafF8tr-1O7_rNROaNj6Hx9J43w26OzZuCFfN24SZrzAolOyUJSQWzXNyN94Ml-SJ2rqNS_')`,
                      transform: `scale(${mapZoom / 15})`,
                    }}
                  />

                  {/* Map Controls */}
                  <div className="relative z-10 flex justify-between items-start pointer-events-auto">
                    <div className="bg-white/95 backdrop-blur-md px-space-sm py-1 rounded-lg border border-purple-200 shadow-sm flex items-center gap-space-xs">
                      <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                      <span className="font-label-sm text-label-sm text-purple-950 uppercase font-mono font-bold">
                        Pin: Yellow/Blue Line Concourse
                      </span>
                    </div>

                    <div className="flex flex-col gap-1 bg-white/95 backdrop-blur-md p-1 rounded-lg border border-purple-200 shadow-sm">
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          setMapZoom(z => Math.min(20, z + 1));
                        }}
                        className="p-1 hover:bg-purple-100 text-purple-900 rounded cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                      </button>
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          setMapZoom(z => Math.max(10, z - 1));
                        }}
                        className="p-1 hover:bg-purple-100 text-purple-900 rounded cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">remove</span>
                      </button>
                    </div>
                  </div>

                  {/* Interactive Pin */}
                  <div
                    className="relative z-10 flex flex-col items-center justify-center pointer-events-none transition-transform duration-200"
                    style={{
                      transform: `translate(${pinOffset.x}px, ${pinOffset.y}px)`,
                    }}
                  >
                    <div className="bg-rose-600 text-white text-xs px-2.5 py-1 rounded-lg shadow-lg flex items-center gap-1 font-label-sm mb-1 animate-bounce font-bold">
                      <span>Distress Hotspot</span>
                    </div>
                    <span
                      className="material-symbols-outlined text-rose-600 text-[36px] drop-shadow-md"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      location_on
                    </span>
                  </div>

                  {/* Map Status Footer Strip */}
                  <div className="relative z-10 bg-white/95 backdrop-blur-md p-space-sm rounded-lg border border-purple-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-xs shadow-sm">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-purple-600 text-[18px]">storefront</span>
                      <span className="font-body-sm text-body-sm text-purple-950 font-medium">
                        Auto-Landmark: <span className="text-purple-700 font-bold">{landmark}</span>
                      </span>
                    </div>
                    <div className="font-label-sm text-label-sm text-pink-700 font-mono font-bold">
                      <span>GPS: {fuzzedGps}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category 5: Time & Recurrence Selector */}
              <div className="bg-white border border-purple-200 p-space-lg rounded-2xl shadow-sm flex flex-col gap-space-md">
                <div className="flex items-center justify-between">
                  <label className="font-label-lg text-label-lg text-purple-950 flex items-center gap-space-xs uppercase tracking-wider font-bold">
                    <span className="material-symbols-outlined text-pink-600 text-[20px]">schedule</span>
                    <span>5. Recurrence &amp; Temporal Window</span>
                  </label>
                  <span className="font-label-sm text-label-sm text-purple-700 font-mono">
                    Aids Police Patrol Routing
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                  <div className="flex flex-col gap-1.5">
                    <span className="font-label-sm text-label-sm text-purple-700 uppercase font-mono font-semibold">
                      Pattern Frequency
                    </span>
                    <select
                      value={frequency}
                      onChange={e => setFrequency(e.target.value)}
                      className="w-full bg-purple-50/40 border border-purple-200 text-purple-950 px-space-md py-space-sm rounded-xl font-body-md focus:outline-none focus:border-pink-500 cursor-pointer"
                    >
                      <option>Daily Occurrence (Recurring)</option>
                      <option>Weekend Evenings Only (Fri-Sun)</option>
                      <option>One-Time Violent Incident</option>
                      <option>Sporadic / Late Night Weekdays</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="font-label-sm text-label-sm text-purple-700 uppercase font-mono font-semibold">
                      Peak High-Risk Window
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={timeStart}
                        onChange={e => setTimeStart(e.target.value)}
                        className="w-1/2 bg-purple-50/40 border border-purple-200 text-purple-950 px-space-sm py-space-sm rounded-xl text-center font-label-md font-mono focus:outline-none focus:border-pink-500"
                      />
                      <span className="text-purple-400 text-xs font-mono font-semibold">TO</span>
                      <input
                        type="text"
                        value={timeEnd}
                        onChange={e => setTimeEnd(e.target.value)}
                        className="w-1/2 bg-purple-50/40 border border-purple-200 text-purple-950 px-space-sm py-space-sm rounded-xl text-center font-label-md font-mono focus:outline-none focus:border-pink-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Action Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-space-md pt-space-xs">
                {/* Panic Button: Camouflage Switcher */}
                <button
                  type="button"
                  onClick={onTriggerCamouflage}
                  className="w-full sm:w-auto flex items-center justify-center gap-space-xs px-space-lg py-space-md rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-950 font-label-md transition-all border border-purple-300 font-bold cursor-pointer"
                >
                  <span className="material-symbols-outlined text-purple-700 text-[20px]">visibility_off</span>
                  <span>Quick Exit / Disguise as Weather App</span>
                </button>

                {/* Primary Submission */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto flex items-center justify-center gap-space-sm px-space-xl py-space-md rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-95 text-white font-headline-sm text-headline-sm transition-all shadow-md shadow-pink-600/30 font-bold cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <span className="material-symbols-outlined text-[24px] animate-spin">sync</span>
                      <span>Scrubbing &amp; Transmitting...</span>
                    </>
                  ) : isSubmitted ? (
                    <>
                      <span className="material-symbols-outlined text-[24px]">done_all</span>
                      <span>Transmitted Securely</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[24px]">send</span>
                      <span>Transmit Zero-Trace Complaint</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Tracking Vault & Live Pipeline (4 cols) */}
          <div className="xl:col-span-4 flex flex-col gap-space-lg">
            {/* Live Cross-System Synchronization Banner */}
            <div className="p-space-md rounded-2xl bg-pink-50 border border-pink-200 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-pink-700 font-bold font-mono text-xs uppercase">
                <span className="material-symbols-outlined text-[18px]">sync_alt</span>
                <span>Bidirectional Anonymous Tunnel Active</span>
              </div>
              <p className="text-xs text-purple-900 leading-relaxed font-medium">
                Complaints reported here are instantly mirrored to the municipal/police command desk without personal logs. When authorities dispatch patrols or log updates, you see them live below.
              </p>
            </div>

            {/* Generated Secret Key Card */}
            <div className="bg-white border border-purple-200 p-space-lg rounded-2xl shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-space-sm">
                <span className="font-label-sm text-label-sm text-pink-700 uppercase tracking-widest font-mono font-bold">
                  Tracking Secret Key
                </span>
                <span className="material-symbols-outlined text-pink-600 text-[20px]">vpn_key</span>
              </div>
              <p className="font-body-sm text-body-sm text-purple-800 mb-space-md leading-relaxed">
                Save this cryptographic hash. Since no account is linked, this key is the sole key to inspect civic dispatch updates.
              </p>

              {/* Token Selector / Lookup dropdown */}
              {myAnonymousKeys.length > 1 && (
                <div className="mb-space-sm flex flex-col gap-1">
                  <span className="text-[11px] font-mono text-purple-700 uppercase font-semibold">
                    My Anonymous Submissions ({myAnonymousKeys.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {myAnonymousKeys.map(k => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => onSelectTrackingKey(k)}
                        className={`px-2 py-1 rounded text-xs font-mono font-semibold transition-all cursor-pointer ${
                          activeReport?.hash === k
                            ? 'bg-pink-600 text-white font-bold shadow'
                            : 'bg-purple-100 text-purple-900 hover:bg-purple-200 border border-purple-200'
                        }`}
                      >
                        {k}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Token Display with Copy */}
              <div className="bg-purple-50 border border-purple-200 p-space-md rounded-xl flex items-center justify-between mb-space-md">
                <div className="flex flex-col">
                  <span className="font-label-lg text-label-lg text-pink-700 tracking-wider font-bold font-mono">
                    {activeReport ? activeReport.hash : activeTrackingKey}
                  </span>
                  <span className="text-[10px] text-purple-600 font-mono mt-0.5">
                    {activeReport?.location || 'Sector 14 Corridor'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={copyKey}
                  className="p-1.5 text-purple-700 hover:text-pink-600 transition-colors rounded-lg hover:bg-purple-100 cursor-pointer"
                  title="Copy to clipboard"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {copiedKey ? 'check' : 'content_copy'}
                  </span>
                </button>
              </div>

              {/* Manual Token Lookup input */}
              <form onSubmit={handleLookup} className="flex items-center gap-1.5 pt-1">
                <input
                  type="text"
                  placeholder="Lookup token (e.g. #AB-78941)..."
                  value={lookupHashInput}
                  onChange={e => setLookupHashInput(e.target.value)}
                  className="flex-1 bg-purple-50/50 border border-purple-200 px-2.5 py-1 text-xs rounded-lg font-mono text-purple-950 placeholder:text-purple-400 focus:outline-none focus:border-pink-500"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 bg-purple-100 hover:bg-purple-200 text-xs font-mono rounded-lg border border-purple-300 text-purple-950 cursor-pointer font-bold"
                >
                  Lookup
                </button>
              </form>

              <div className="flex items-center gap-2 text-xs font-label-sm text-purple-700 font-mono mt-3">
                <span className="material-symbols-outlined text-[16px] text-pink-600">lock</span>
                <span>Self-destructs from server storage in 30 days</span>
              </div>
            </div>

            {/* Live Status Timeline Panel */}
            <div className="bg-white border border-purple-200 p-space-lg rounded-2xl shadow-sm flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-pink-600 text-[22px]">hub</span>
                  <h2 className="font-headline-sm text-headline-sm text-purple-950 font-bold">
                    Anonymous Tracking Vault
                  </h2>
                </div>
                <span className="font-label-sm text-label-sm text-pink-700 bg-pink-100 border border-pink-200 px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-ping" />
                  Live Sync
                </span>
              </div>

              {/* Active Case Summary Card */}
              {activeReport && (
                <div className="p-3 bg-purple-50/60 border border-purple-200 rounded-xl flex flex-col gap-1 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-purple-800 font-bold">{activeReport.hash}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded font-bold uppercase text-[10px] ${
                        activeReport.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : activeReport.status === 'active'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-purple-100 text-purple-800 border border-purple-300'
                      }`}
                    >
                      {activeReport.status}
                    </span>
                  </div>
                  <div className="text-purple-900 font-sans line-clamp-2">
                    &ldquo;{activeReport.narrative}&rdquo;
                  </div>
                  {activeReport.photoUrl && (
                    <div className="flex items-center gap-2 pt-1 border-t border-purple-200/60 mt-1">
                      <div className="w-10 h-10 rounded-md overflow-hidden border border-purple-300 shrink-0">
                        <EvidencePhoto
                          src={activeReport.photoUrl}
                          alt="Scrubbed Evidence"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col text-[11px] font-mono text-purple-800">
                        <span className="font-semibold text-purple-950 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px] text-pink-600">verified</span>
                          Attached Evidence Logged
                        </span>
                        <span className="text-[10px] text-purple-600">Sanitized photo in dispatch dossier</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Vertical Dynamic Timeline */}
              <div className="relative flex flex-col gap-space-lg mt-space-sm pl-2">
                <div className="absolute left-[19px] top-3 bottom-3 w-0.5 bg-purple-200" />

                {/* Step 1: Dispatched */}
                <div className="relative flex items-start gap-space-md">
                  <div className="w-7 h-7 rounded-full bg-pink-600 flex items-center justify-center shrink-0 z-10 shadow-sm text-white">
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-space-xs">
                      <span className="font-label-sm text-label-sm text-purple-950 font-bold uppercase font-mono">
                        1. Encrypted &amp; Dispatched
                      </span>
                      <span className="font-label-sm text-label-sm text-purple-600 font-mono">
                        {activeReport?.timestamp || '19:42 IST'}
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-purple-800 mt-0.5 leading-relaxed">
                      Routed via Central Beat Police &amp; NDMC Night Patrol unit. All personal and device metadata stripped.
                    </p>
                    <span className="font-label-sm text-label-sm text-pink-700 mt-1 font-mono font-bold">
                      Status: Completed &amp; Broadcast
                    </span>
                  </div>
                </div>

                {/* Step 2: Under Investigation */}
                <div
                  className={`relative flex items-start gap-space-md ${
                    activeReport?.status === 'pending' ? 'opacity-80' : ''
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 ${
                      activeReport?.status === 'resolved' || activeReport?.status === 'rectification'
                        ? 'bg-pink-600 text-white shadow-sm'
                        : activeReport?.status === 'active'
                        ? 'bg-purple-600 text-white ring-4 ring-purple-100'
                        : 'bg-purple-100 text-purple-600 border border-purple-300'
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-[16px] ${
                        activeReport?.status === 'active' ? 'animate-spin' : ''
                      }`}
                    >
                      {activeReport?.status === 'resolved' || activeReport?.status === 'rectification'
                        ? 'check'
                        : 'refresh'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-space-xs">
                      <span className="font-label-sm text-label-sm text-purple-950 font-bold uppercase font-mono">
                        2. Beat Officer Triage
                      </span>
                      <span
                        className={`font-label-sm text-label-sm font-mono font-bold ${
                          activeReport?.status === 'resolved' || activeReport?.status === 'rectification'
                            ? 'text-pink-700'
                            : activeReport?.status === 'active'
                            ? 'text-purple-700'
                            : 'text-purple-500'
                        }`}
                      >
                        {activeReport?.status === 'resolved' || activeReport?.status === 'rectification'
                          ? 'Action Verified'
                          : activeReport?.status === 'active'
                          ? 'In Progress (Active Unit)'
                          : 'Queue Acknowledged'}
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-purple-800 mt-0.5 leading-relaxed">
                      {activeReport?.assignedOfficer || 'Assigned to Beat Officer & PCR Patrol Squad'}
                      {activeReport?.assignedUnit ? ` (${activeReport.assignedUnit})` : ''}.
                    </p>
                    {activeReport?.officerMemo && (
                      <div className="mt-2 bg-purple-50 border border-purple-200 p-space-xs rounded-lg text-xs font-body-sm text-purple-900 italic">
                        Beat memo: &ldquo;{activeReport.officerMemo}&rdquo;
                      </div>
                    )}
                  </div>
                </div>

                {/* Step 3: Patrol Intervention / Lighting */}
                <div
                  className={`relative flex items-start gap-space-md ${
                    activeReport?.status === 'resolved' || activeReport?.status === 'rectification'
                      ? 'opacity-100'
                      : 'opacity-50'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 border ${
                      activeReport?.status === 'resolved'
                        ? 'bg-pink-600 text-white border-pink-600'
                        : activeReport?.status === 'rectification'
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-purple-100 text-purple-600 border-purple-300'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">lightbulb</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-purple-950 font-bold uppercase font-mono">
                      3. Civic Rectification
                    </span>
                    <p className="font-body-sm text-body-sm text-purple-800 mt-0.5 leading-relaxed">
                      Municipal electrical works &amp; sidewalk encroachment inspection deployed at {activeReport?.landmark}.
                    </p>
                    <span className="font-label-sm text-label-sm text-purple-700 mt-1 font-mono">
                      {activeReport?.status === 'resolved'
                        ? 'Completed'
                        : activeReport?.status === 'rectification'
                        ? 'Active Work Order Executing'
                        : 'Awaiting Physical Dispatch'}
                    </span>
                  </div>
                </div>

                {/* Step 4: Resolution */}
                <div
                  className={`relative flex items-start gap-space-md ${
                    activeReport?.status === 'resolved' ? 'opacity-100' : 'opacity-40'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 border ${
                      activeReport?.status === 'resolved'
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                        : 'bg-purple-100 text-purple-600 border-purple-300'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">task_alt</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-purple-950 font-bold uppercase font-mono">
                      4. Marked Completed &amp; Cleared
                    </span>
                    <p className="font-body-sm text-body-sm text-purple-800 mt-0.5 leading-relaxed">
                      Corridor verified cleared. Picket stationed or illumination restored.
                    </p>
                    {activeReport?.status === 'resolved' && (
                      <span className="font-label-sm text-label-sm text-emerald-700 font-mono font-bold mt-1">
                        ✓ Safety Audit Confirmed 98.4%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Municipal Guarantee Box */}
            <div className="bg-purple-50 border border-purple-200 p-space-md rounded-2xl shadow-sm flex items-start gap-space-sm">
              <span className="material-symbols-outlined text-pink-600 text-[24px]">verified</span>
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-purple-950 uppercase font-bold font-mono">
                  Right to Safe Mobility Guarantee
                </span>
                <p className="font-body-sm text-body-sm text-purple-800 mt-1 leading-relaxed">
                  Your submission directly feeds into the public Safety Heat Index map, preventing local stations from ignoring chronic harassment addas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
