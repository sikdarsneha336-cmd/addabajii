import { GoogleGenAI } from '@google/genai';

export async function transcribeAudio(
  base64Audio: string,
  mimeType: string = 'audio/webm'
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured on the server.');
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const audioPart = {
    inlineData: {
      mimeType: mimeType.split(';')[0], // Extract base MIME like 'audio/webm', 'audio/mp4', 'audio/wav'
      data: base64Audio,
    },
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3.5-transcribe',
    contents: {
      parts: [
        audioPart,
        {
          text: 'Transcribe this spoken audio accurately into text. Provide only the verbatim transcript of the speaker without adding conversational filler or commentary.',
        },
      ],
    },
  });

  return response.text || '';
}
