import React, { useState, useRef, useEffect } from 'react';

interface AudioTranscriberProps {
  onTranscriptionComplete: (text: string, audioBlobUrl?: string) => void;
  label?: string;
  className?: string;
}

export const AudioTranscriber: React.FC<AudioTranscriberProps> = ({
  onTranscriptionComplete,
  label = 'Record Voice Narrative (Auto-Transcribe)',
  className = '',
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastTranscript, setLastTranscript] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    setErrorMsg(null);
    setAudioUrl(null);
    setLastTranscript(null);
    audioChunksRef.current = [];

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Audio recording is not supported in this browser environment.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
        mimeType = 'audio/ogg';
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = e => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const localUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(localUrl);

        // Send to backend for transcription
        await processAudioTranscription(audioBlob, mimeType);
      };

      mediaRecorder.start(250); // Slice data every 250ms
      setIsRecording(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    } catch (err: unknown) {
      console.error('Microphone error:', err);
      const msg = err instanceof Error ? err.message : 'Unable to access microphone';
      setErrorMsg(msg);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsRecording(false);
  };

  const cancelRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = null; // Do not process
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsRecording(false);
    setRecordingSeconds(0);
    audioChunksRef.current = [];
  };

  const processAudioTranscription = async (blob: Blob, mimeType: string) => {
    setIsTranscribing(true);
    setErrorMsg(null);

    try {
      const base64Audio = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const res = reader.result as string;
          const commaIdx = res.indexOf(',');
          resolve(commaIdx >= 0 ? res.substring(commaIdx + 1) : res);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const res = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioData: base64Audio,
          mimeType,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Server error while transcribing');
      }

      const transcript = (data.transcript || '').trim();
      setLastTranscript(transcript);
      const audioBlobUrl = URL.createObjectURL(blob);
      onTranscriptionComplete(transcript, audioBlobUrl);
    } catch (err: unknown) {
      console.error('Transcription error:', err);
      const msg = err instanceof Error ? err.message : 'Transcription failed';
      setErrorMsg(msg);
    } finally {
      setIsTranscribing(false);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {!isRecording && !isTranscribing && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={startRecording}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white hover:bg-pink-50 text-pink-700 hover:text-pink-800 border border-pink-300 font-label-sm text-xs font-mono font-bold transition-all shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-pink-600 animate-pulse">
              mic
            </span>
            <span>{label}</span>
          </button>

          <span className="text-[11px] text-purple-700 font-mono hidden sm:inline font-medium">
            Uses gemini-3.5-transcribe
          </span>
        </div>
      )}

      {/* Recording State HUD */}
      {isRecording && (
        <div className="p-3 bg-pink-50 border border-pink-300 rounded-xl flex items-center justify-between gap-3 animate-in fade-in shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-pink-500 animate-ping" />
            <div className="flex flex-col">
              <span className="text-xs font-mono font-bold text-pink-800 uppercase tracking-wider">
                Recording Audio &bull; {formatTime(recordingSeconds)}
              </span>
              <span className="text-[10px] text-purple-700 font-mono font-medium">
                Speak details clearly (location, people, behavior)...
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={cancelRecording}
              className="px-2.5 py-1 text-xs font-mono text-purple-700 hover:text-purple-950 rounded-lg hover:bg-purple-100 cursor-pointer font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={stopRecording}
              className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-95 text-white rounded-lg font-mono text-xs font-bold transition-opacity cursor-pointer shadow-md"
            >
              <span className="material-symbols-outlined text-[16px]">stop</span>
              <span>Stop &amp; Transcribe</span>
            </button>
          </div>
        </div>
      )}

      {/* Transcribing State HUD */}
      {isTranscribing && (
        <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center gap-3 animate-in fade-in shadow-sm">
          <span className="material-symbols-outlined text-[20px] text-pink-600 animate-spin">
            progress_activity
          </span>
          <div className="flex flex-col">
            <span className="text-xs font-mono font-bold text-purple-950">
              Transcribing audio with gemini-3.5-transcribe...
            </span>
            <span className="text-[10px] text-purple-700 font-mono font-medium">
              Converting speech to text via server-side Gemini model.
            </span>
          </div>
        </div>
      )}

      {/* Success preview strip */}
      {lastTranscript && !isRecording && !isTranscribing && (
        <div className="p-2.5 bg-purple-50/70 border border-purple-200 rounded-xl flex flex-col gap-1.5 animate-in fade-in text-xs font-mono shadow-sm">
          <div className="flex items-center justify-between text-pink-700 font-bold">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-emerald-600">check_circle</span>
              <span>Transcribed by Gemini 3.5</span>
            </span>
            <button
              type="button"
              onClick={startRecording}
              className="text-[11px] text-purple-700 hover:text-pink-700 underline cursor-pointer font-medium"
            >
              Record Again
            </button>
          </div>
          <p className="text-purple-950 text-xs font-sans italic bg-white p-2 rounded-lg border border-purple-200 shadow-sm">
            &ldquo;{lastTranscript}&rdquo;
          </p>
          {audioUrl && (
            <audio src={audioUrl} controls className="w-full h-8 mt-1 rounded opacity-90" />
          )}
        </div>
      )}

      {/* Error state */}
      {errorMsg && (
        <div className="p-2.5 bg-rose-50 border border-rose-300 rounded-xl flex items-center justify-between gap-2 text-xs text-rose-700 font-mono shadow-sm">
          <span>{errorMsg}</span>
          <button
            type="button"
            onClick={startRecording}
            className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
};
