/**
 * ALMEER BOT — Plugin: weather.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
import fetch from 'node-fetch';

export default {
  name: 'weather',
  aliases: ['w', 'climate', 'temp'],
  category: 'general',
  description: 'get current weather for any city',
  async run({ argText, reply }) {
    if (!argText) return reply('usage: .weather <city>\nexample: .weather Nairobi\nexample: .weather London');
    try {
      const res = await fetch(
        `https://wttr.in/${encodeURIComponent(argText)}?format=j1`,
        { signal: AbortSignal.timeout(10000), headers: { 'User-Agent': 'curl/7.68.0' } }
      );
      if (!res.ok) throw new Error('city not found');
      const data = await res.json();

      const c = data.current_condition?.[0];
      if (!c) throw new Error('no data');

      const area = data.nearest_area?.[0];
      const city = area?.areaName?.[0]?.value || argText;
      const region = area?.region?.[0]?.value || '';
      const country = area?.country?.[0]?.value || '';
      const location = [city, region, country].filter(Boolean).join(', ');

      const desc = c.weatherDesc?.[0]?.value || 'Unknown';
      const tempC = c.temp_C;
      const tempF = c.temp_F;
      const feelsC = c.FeelsLikeC;
      const feelsF = c.FeelsLikeF;
      const humidity = c.humidity;
      const wind = c.windspeedKmph;
      const windDir = c.winddir16Point;
      const uv = c.uvIndex;
      const visibility = c.visibility;
      const pressure = c.pressure;

      // Tomorrow's forecast
      const tomorrow = data.weather?.[1];
      const hiC = tomorrow?.maxtempC || '—';
      const loC = tomorrow?.mintempC || '—';
      const tDesc = tomorrow?.hourly?.[4]?.weatherDesc?.[0]?.value || '—';

      return reply(
        '╭━━〔 *🌤️ WEATHER* 〕━━┈⊷\n' +
        `┃ 📍 Location   : ${location}\n` +
        `┃ ☁️ Condition  : ${desc}\n` +
        `┃ 🌡️ Temp       : ${tempC}°C / ${tempF}°F\n` +
        `┃ 🤔 Feels Like : ${feelsC}°C / ${feelsF}°F\n` +
        `┃ 💧 Humidity   : ${humidity}%\n` +
        `┃ 💨 Wind       : ${wind} km/h ${windDir}\n` +
        `┃ 👁️ Visibility : ${visibility} km\n` +
        `┃ 📊 Pressure   : ${pressure} hPa\n` +
        `┃ ☀️ UV Index   : ${uv}\n` +
        '┃━━━━━━━━━━━━━━━━━━\n' +
        `┃ 📅 Tomorrow   : ${tDesc}\n` +
        `┃    Hi/Lo      : ${hiC}°C / ${loC}°C\n` +
        '╰━━━━━━━━━━━━━━━━━━┈⊷'
      );
    } catch (e) {
      return reply(`⚠️ couldn't get weather for "${argText}".\nCheck the city name and try again.`);
    }
  },
};
