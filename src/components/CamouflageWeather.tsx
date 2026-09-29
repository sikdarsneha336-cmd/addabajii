import React, { useState, useEffect } from 'react';
import {
  traceDeviceLocation,
  fetchLiveTemperatureAndWeather,
  LiveWeatherReport,
} from '../services/weatherService';

interface CamouflageWeatherProps {
  onClose: () => void;
  onSwitchToCalculator?: () => void;
}

export const CamouflageWeather: React.FC<CamouflageWeatherProps> = ({
  onClose,
  onSwitchToCalculator,
}) => {
  const [isLocating, setIsLocating] = useState(true);
  const [temperatureUnit, setTemperatureUnit] = useState<'C' | 'F'>('C');
  const [weatherData, setWeatherData] = useState<LiveWeatherReport | null>(null);
  const [locationStatus, setLocationStatus] = useState<string>('Initializing device location sensors...');

  const performLocationTraceAndWeatherFetch = async () => {
    setIsLocating(true);
    setLocationStatus('Tracing device physical GPS coordinates...');

    try {
      const geo = await traceDeviceLocation();
      if (geo.isFallback) {
        setLocationStatus('GPS permissions denied/unavailable. Using metropolitan region reference.');
      } else {
        setLocationStatus(`Device location traced: ${geo.lat.toFixed(4)}° N, ${geo.lon.toFixed(4)}° E (±${geo.accuracy}m accuracy)`);
      }

      const report = await fetchLiveTemperatureAndWeather(
        geo.lat,
        geo.lon,
        geo.accuracy,
        geo.altitude,
        geo.isFallback
      );
      setWeatherData(report);
    } catch (err) {
      console.error('Failed to trace location or fetch temperature:', err);
      setLocationStatus('Error reading sensors. Displaying cached weather telemetry.');
    } finally {
      setIsLocating(false);
    }
  };

  useEffect(() => {
    performLocationTraceAndWeatherFetch();
  }, []);

  const displayTemp = weatherData
    ? temperatureUnit === 'C'
      ? `${weatherData.temperature}°C`
      : `${weatherData.temperatureF}°F`
    : '--°C';

  const displayFeelsLike = weatherData
    ? temperatureUnit === 'C'
      ? `${weatherData.feelsLike}°C`
      : `${Math.round((weatherData.feelsLike * 9) / 5 + 32)}°F`
    : '--°C';

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-b from-[#fdf4fb] via-[#faf5ff] to-[#f5effe] text-purple-950 flex flex-col p-4 sm:p-6 justify-between select-none overflow-y-auto">
      {/* Top Header Bar */}
      <div className="w-full flex items-center justify-between max-w-2xl mx-auto pb-3 border-b border-purple-200">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-pink-100 border border-pink-300 flex items-center justify-center text-pink-600">
            <span className="material-symbols-outlined text-[24px]">
              {weatherData?.icon || 'partly_cloudy_day'}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-headline-sm text-base sm:text-lg font-bold tracking-tight text-purple-950">
                AccuMetro Live Weather
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 border border-pink-300 font-semibold uppercase">
                Camouflage Disguise
              </span>
            </div>
            <span className="text-xs text-purple-700/80 block font-mono">
              Real-Time Device Telemetry &amp; Micro-Climate
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Temperature Unit Toggle */}
          <div className="flex rounded-lg bg-purple-100 p-0.5 border border-purple-200">
            <button
              onClick={() => setTemperatureUnit('C')}
              className={`text-xs px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                temperatureUnit === 'C'
                  ? 'bg-pink-600 text-white shadow-sm'
                  : 'text-purple-700 hover:text-purple-950'
              }`}
            >
              °C
            </button>
            <button
              onClick={() => setTemperatureUnit('F')}
              className={`text-xs px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                temperatureUnit === 'F'
                  ? 'bg-pink-600 text-white shadow-sm'
                  : 'text-purple-700 hover:text-purple-950'
              }`}
            >
              °F
            </button>
          </div>

          {/* Switch to Calculator Decoy */}
          {onSwitchToCalculator && (
            <button
              onClick={onSwitchToCalculator}
              className="hidden md:flex text-xs px-3 py-1.5 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-900 transition-colors items-center gap-1.5 border border-purple-200 cursor-pointer font-medium"
              title="Switch disguise to Calculator"
            >
              <span className="material-symbols-outlined text-[15px] text-pink-600">calculate</span>
              <span>Calculator</span>
            </button>
          )}

          {/* Retrace Location Button */}
          <button
            type="button"
            onClick={performLocationTraceAndWeatherFetch}
            disabled={isLocating}
            className="text-xs px-3 py-1.5 rounded-lg bg-pink-100 hover:bg-pink-200 text-pink-700 transition-colors flex items-center gap-1.5 border border-pink-300 cursor-pointer disabled:opacity-50 font-semibold"
            title="Retrace device location and refresh temperature"
          >
            <span className={`material-symbols-outlined text-[15px] ${isLocating ? 'animate-spin' : ''}`}>
              {isLocating ? 'sync' : 'my_location'}
            </span>
            <span className="hidden sm:inline">
              {isLocating ? 'Tracing...' : 'Retrace GPS'}
            </span>
          </button>

          {/* Discreet Exit Back to AddaBaaji */}
          <button
            type="button"
            onClick={onClose}
            className="text-xs px-3 py-1.5 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-900 transition-colors flex items-center gap-1 border border-purple-200 cursor-pointer font-medium"
            title="Close Camouflage (Esc)"
          >
            <span className="material-symbols-outlined text-[15px]">close</span>
            <span className="hidden sm:inline">Exit</span>
          </button>
        </div>
      </div>

      {/* Main Traced Location & Temperature Showcase */}
      <div className="flex flex-col items-center gap-3 text-center max-w-xl w-full mx-auto my-auto py-4">
        {/* Device Location Sensor Trace Status Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-purple-200 text-xs font-mono shadow-sm">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isLocating
                ? 'bg-pink-500 animate-ping'
                : weatherData?.isSimulatedFallback
                ? 'bg-amber-500'
                : 'bg-emerald-500 animate-pulse'
            }`}
          />
          <span className="text-purple-800 font-medium">{locationStatus}</span>
        </div>

        {/* Traced Location Title */}
        <div className="flex flex-col items-center mt-1">
          <div className="flex items-center gap-2 text-pink-600">
            <span className="material-symbols-outlined text-[20px]">location_on</span>
            <span className="text-lg sm:text-2xl font-bold tracking-tight text-purple-950 font-headline-sm uppercase">
              {weatherData?.locationName || 'Detecting Location...'}
            </span>
          </div>

          {weatherData && (
            <div className="flex items-center gap-2 text-xs font-mono text-purple-700/80 mt-1 font-medium">
              <span>
                Coordinates: {weatherData.latitude.toFixed(4)}° N, {weatherData.longitude.toFixed(4)}° E
              </span>
              {weatherData.accuracyMeters && (
                <>
                  <span>&bull;</span>
                  <span className="text-pink-600 font-semibold">Accuracy &plusmn;{weatherData.accuracyMeters}m</span>
                </>
              )}
              {weatherData.altitudeMeters && (
                <>
                  <span>&bull;</span>
                  <span>Alt: {weatherData.altitudeMeters}m</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Large Prominent Temperature Display */}
        <div className="flex items-center justify-center gap-4 my-2">
          <span className="material-symbols-outlined text-6xl sm:text-8xl text-pink-500 drop-shadow-sm">
            {weatherData?.icon || 'partly_cloudy_day'}
          </span>
          <div className="flex flex-col text-left">
            <div className="text-6xl sm:text-8xl font-light tracking-tighter text-purple-950 font-mono leading-none">
              {displayTemp}
            </div>
            <span className="text-sm font-medium text-purple-700 mt-1">
              Feels like <span className="text-purple-950 font-bold">{displayFeelsLike}</span>
            </span>
          </div>
        </div>

        {/* Weather Condition */}
        <div className="inline-block px-4 py-1 rounded-full bg-white border border-purple-200 text-sm font-medium text-purple-900 shadow-sm">
          {weatherData?.condition || 'Analyzing atmospheric readings...'} &bull; Observed {weatherData?.tracedAt || 'Just now'}
        </div>

        {/* Meteorological Metric Tiles for Traced Coordinates */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full mt-3 text-xs">
          <div className="bg-white border border-purple-200 p-3 rounded-xl flex flex-col items-center text-center shadow-sm">
            <span className="material-symbols-outlined text-pink-500 text-[20px] mb-1">water_drop</span>
            <span className="text-purple-600 font-medium">Humidity</span>
            <span className="text-base font-bold text-purple-950 font-mono mt-0.5">
              {weatherData?.humidity ?? 52}%
            </span>
          </div>

          <div className="bg-white border border-purple-200 p-3 rounded-xl flex flex-col items-center text-center shadow-sm">
            <span className="material-symbols-outlined text-purple-600 text-[20px] mb-1">air</span>
            <span className="text-purple-600 font-medium">Wind Velocity</span>
            <span className="text-base font-bold text-purple-950 font-mono mt-0.5">
              {weatherData?.windSpeed ?? 9} km/h
            </span>
          </div>

          <div className="bg-white border border-purple-200 p-3 rounded-xl flex flex-col items-center text-center shadow-sm">
            <span className="material-symbols-outlined text-pink-500 text-[20px] mb-1">compress</span>
            <span className="text-purple-600 font-medium">Pressure</span>
            <span className="text-base font-bold text-purple-950 font-mono mt-0.5">
              {weatherData?.pressureHpa ?? 1012} hPa
            </span>
          </div>

          <div className="bg-white border border-purple-200 p-3 rounded-xl flex flex-col items-center text-center shadow-sm">
            <span className="material-symbols-outlined text-purple-600 text-[20px] mb-1">eco</span>
            <span className="text-purple-600 font-medium">Air Quality</span>
            <span className="text-base font-bold text-purple-950 font-mono mt-0.5">
              AQI {weatherData?.aqiEstimate ?? 138}
            </span>
          </div>
        </div>

        {/* Hourly Micro-Forecast for Traced Location */}
        {weatherData?.hourly && weatherData.hourly.length > 0 && (
          <div className="w-full mt-4">
            <div className="flex items-center justify-between text-xs text-purple-700 mb-2 px-1">
              <span className="font-mono uppercase font-bold tracking-wider">
                Traced Coordinate Forecast
              </span>
              <span className="text-pink-600 font-mono text-[11px] font-semibold">Next 4-Hour Trajectory</span>
            </div>
            <div className="grid grid-cols-4 gap-2 w-full">
              {weatherData.hourly.map((h, i) => {
                const hourTemp =
                  temperatureUnit === 'C'
                    ? `${h.temp}°C`
                    : `${Math.round((h.temp * 9) / 5 + 32)}°F`;
                return (
                  <div
                    key={i}
                    className="bg-white border border-purple-200 p-2.5 rounded-xl flex flex-col items-center gap-1 shadow-sm"
                  >
                    <span className="text-purple-600 font-mono text-[11px] font-medium">{h.time}</span>
                    <span className="material-symbols-outlined text-pink-500 text-[20px]">
                      {h.icon || 'partly_cloudy_day'}
                    </span>
                    <span className="font-bold text-purple-950 font-mono text-sm">{hourTemp}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Bar: Camouflage Security Note & Quick Exit Notice */}
      <div className="w-full max-w-2xl mx-auto pt-3 border-t border-purple-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-purple-700">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-pink-600 text-[18px]">verified</span>
          <span className="font-medium">Screen Decoy Active &bull; Innocent Weather Dashboard Displayed</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-purple-600 font-mono text-[11px]">Tap Esc or Exit to return</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            Return to Safety Grid
          </button>
        </div>
      </div>
    </div>
  );
};
