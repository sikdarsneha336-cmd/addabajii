export interface WeatherData {
  locationName: string;
  latitude: number;
  longitude: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  icon: string;
  isDay: boolean;
  hourly: Array<{
    time: string;
    temp: number;
    icon: string;
  }>;
}

function getWeatherCondition(code: number, isDay: boolean): { condition: string; icon: string } {
  // WMO Weather interpretation codes (WW)
  switch (code) {
    case 0:
      return { condition: 'Clear Sky', icon: isDay ? 'sunny' : 'nights_stay' };
    case 1:
      return { condition: 'Mainly Clear', icon: isDay ? 'partly_cloudy_day' : 'nights_stay' };
    case 2:
      return { condition: 'Partly Cloudy', icon: isDay ? 'partly_cloudy_day' : 'cloud' };
    case 3:
      return { condition: 'Overcast', icon: 'cloud' };
    case 45:
    case 48:
      return { condition: 'Haze & Fog', icon: 'foggy' };
    case 51:
    case 53:
    case 55:
      return { condition: 'Light Drizzle', icon: 'rainy' };
    case 61:
    case 63:
    case 65:
      return { condition: 'Rain Showers', icon: 'rainy' };
    case 71:
    case 73:
    case 75:
      return { condition: 'Snowfall', icon: 'ac_unit' };
    case 80:
    case 81:
    case 82:
      return { condition: 'Heavy Rain Showers', icon: 'thunderstorm' };
    case 95:
    case 96:
    case 99:
      return { condition: 'Thunderstorm', icon: 'thunderstorm' };
    default:
      return { condition: 'Partly Cloudy', icon: isDay ? 'partly_cloudy_day' : 'nights_stay' };
  }
}

export async function fetchLiveWeatherForLocation(
  lat: number,
  lon: number
): Promise<WeatherData> {
  // 1. Fetch location name via reverse geocoding
  let locationName = `${lat.toFixed(2)}° N, ${lon.toFixed(2)}° E`;
  try {
    const geoRes = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
      { headers: { 'User-Agent': 'aistudio-build' } }
    );
    if (geoRes.ok) {
      const geo = await geoRes.json();
      const city = geo.locality || geo.city || geo.principalSubdivision || '';
      const state = geo.principalSubdivision || '';
      const country = geo.countryName || '';
      const parts = [city, state, country].filter(Boolean);
      if (parts.length > 0) {
        locationName = parts.slice(0, 2).join(', ');
      }
    }
  } catch (err) {
    console.warn('Reverse geocode fallback:', err);
  }

  // 2. Fetch live weather from Open-Meteo
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,is_day,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&timezone=auto&forecast_days=2`;
  
  const weatherRes = await fetch(weatherUrl);
  if (!weatherRes.ok) {
    throw new Error(`Open-Meteo API returned status ${weatherRes.status}`);
  }
  const weatherJson = await weatherRes.json();

  const current = weatherJson.current || {};
  const isDay = current.is_day === 1;
  const temp = Math.round(current.temperature_2m ?? 28);
  const humidity = Math.round(current.relative_humidity_2m ?? 50);
  const windSpeed = Math.round(current.wind_speed_10m ?? 8);
  const weatherCode = current.weather_code ?? 1;

  const { condition, icon } = getWeatherCondition(weatherCode, isDay);

  // Compute 4 upcoming hourly forecast slots
  const hourly = weatherJson.hourly || { time: [], temperature_2m: [], weather_code: [] };
  const hourlyList: Array<{ time: string; temp: number; icon: string }> = [];

  const currentTimeStr = current.time || '';
  const startIndex = hourly.time.findIndex((t: string) => t >= currentTimeStr);
  const validStart = startIndex >= 0 ? startIndex + 1 : 0;

  for (let i = validStart; i < validStart + 4 && i < hourly.time.length; i++) {
    const rawTime = hourly.time[i];
    const hourPart = rawTime ? rawTime.split('T')[1]?.slice(0, 5) : `${20 + i}:00`;
    const hTemp = Math.round(hourly.temperature_2m[i] ?? temp);
    const hCode = hourly.weather_code[i] ?? 1;
    const hInfo = getWeatherCondition(hCode, isDay);
    hourlyList.push({
      time: hourPart,
      temp: hTemp,
      icon: hInfo.icon,
    });
  }

  // Fallback slots if array was short
  while (hourlyList.length < 4) {
    hourlyList.push({
      time: `${20 + hourlyList.length}:00`,
      temp: temp - hourlyList.length,
      icon,
    });
  }

  return {
    locationName,
    latitude: lat,
    longitude: lon,
    temperature: temp,
    humidity,
    windSpeed,
    condition,
    icon,
    isDay,
    hourly: hourlyList,
  };
}
