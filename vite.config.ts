import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';
import { transcribeAudio } from './src/server/transcribe';
import { fetchLiveWeatherForLocation } from './src/server/weather';

function apiPlugin(): Plugin {
  return {
    name: 'api-server',
    configureServer(server) {
      // 1. Audio Transcription endpoint (gemini-3.5-transcribe)
      server.middlewares.use('/api/transcribe', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method Not Allowed' }));
          return;
        }

        let body = '';
        req.on('data', chunk => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const { audioData, mimeType } = JSON.parse(body || '{}');
            if (!audioData) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Missing audioData payload in request' }));
              return;
            }

            const transcript = await transcribeAudio(audioData, mimeType);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ transcript }));
          } catch (err: unknown) {
            console.error('Transcription error:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            const message = err instanceof Error ? err.message : 'Transcription failed';
            res.end(JSON.stringify({ error: message }));
          }
        });
      });

      // 2. Device Traced Live Weather endpoint
      server.middlewares.use('/api/weather', async (req, res) => {
        try {
          const url = new URL(req.url || '', 'http://localhost');
          const lat = parseFloat(url.searchParams.get('lat') || '28.6139');
          const lon = parseFloat(url.searchParams.get('lon') || '77.2090');

          const data = await fetchLiveWeatherForLocation(lat, lon);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
        } catch (err: unknown) {
          console.error('Weather error:', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          const message = err instanceof Error ? err.message : 'Weather fetch failed';
          res.end(JSON.stringify({ error: message }));
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
