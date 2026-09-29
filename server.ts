import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { transcribeAudio } from './src/server/transcribe';
import { fetchLiveWeatherForLocation } from './src/server/weather';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));

app.post('/api/transcribe', async (req, res) => {
  try {
    const { audioData, mimeType } = req.body;
    if (!audioData) {
      return res.status(400).json({ error: 'Missing audioData payload' });
    }
    const transcript = await transcribeAudio(audioData, mimeType);
    res.json({ transcript });
  } catch (err: unknown) {
    console.error('Transcription error:', err);
    const message = err instanceof Error ? err.message : 'Transcription failed';
    res.status(500).json({ error: message });
  }
});

app.get('/api/weather', async (req, res) => {
  try {
    const lat = parseFloat((req.query.lat as string) || '28.6139');
    const lon = parseFloat((req.query.lon as string) || '77.2090');
    const data = await fetchLiveWeatherForLocation(lat, lon);
    res.json(data);
  } catch (err: unknown) {
    console.error('Weather error:', err);
    const message = err instanceof Error ? err.message : 'Weather fetch failed';
    res.status(500).json({ error: message });
  }
});

// Serve static frontend files in production
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));
app.get('*', (_req, res) => {
  res.sendFile(path.resolve(distPath, 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on port ${port} on 0.0.0.0`);
});
