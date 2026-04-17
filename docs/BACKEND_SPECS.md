# Backend-Specs für neue Viral-Tools

Diese 3 Tools haben UI fertig, benötigen aber noch Backend-Integration.

---

## 1. Future-Self (`/future-self`)

**Was es tut:** Partner lädt Selfie hoch → KI generiert Zukunfts-Bilder (Strand, Auto, Bühne, Familie).

### Endpoint
```
POST /api/future-self/generate
```

### Input (multipart/form-data)
```
photo: File (JPEG/PNG, max 10MB)
scenarios: string[]  // z.B. ["beach", "dream-car", "family"]
style: string        // z.B. "photorealistic"
```

### Output
```ts
{
  images: Array<{
    scenarioId: string;
    scenarioLabel: string;
    imageUrl: string;  // S3/R2 URL
    prompt: string;
  }>
}
```

### Empfohlene API
- **Primary:** Flux Pro Ultra mit Face-Reference (via fal.ai)
- **Alternative:** Nano Banana Pro (fal.ai `nano-banana-pro` oder `face-to-scene`)
- **Backup:** Stable Diffusion XL + IP-Adapter Face

### Code-Skeleton
```ts
// server/routers.ts - in router() ergänzen
futureSelf: router({
  generate: approvedProcedure
    .input(z.object({
      photoUrl: z.string(),       // vorher per upload route in S3
      scenarios: z.array(z.string()),
      style: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const results = [];
      for (const scenarioId of input.scenarios) {
        const prompt = SCENARIO_PROMPTS[scenarioId];
        const img = await api.generateFutureSelfImage({
          facePhotoUrl: input.photoUrl,
          scenePrompt: prompt,
          style: input.style,
        });
        results.push({ scenarioId, imageUrl: img.url, prompt });
      }
      return { images: results };
    }),
}),
```

---

## 2. Avatar-Me (`/avatar-me`)

**Was es tut:** Partner scannt Gesicht → KI-Avatar → unendlich Videos mit seinem Gesicht.

### Endpoints
```
POST /api/avatar-me/create     // 1x pro User, trainiert Avatar (2-3 Min)
POST /api/avatar-me/generate   // pro Video-Generierung
```

### Input /create
```
photo: File (JPEG/PNG)
```

### Output /create
```ts
{ avatarId: string }  // in DB bei user.avatarId speichern
```

### Input /generate
```ts
{
  avatarId: string;
  scene: string;       // z.B. "speaking", "strand", "driving"
  script: string;      // Text den Avatar sprechen soll
}
```

### Output /generate
```ts
{ videoUrl: string; duration: number }
```

### Empfohlene API
- **Primary:** HeyGen Custom Avatar API (ihr habt schon HeyGen für Lina!)
- **Alternative:** D-ID oder Synthesia
- **Open Source:** Wav2Lip + InsightFace für Face-Swap auf Stock-Videos

### DB-Änderung
```sql
ALTER TABLE users ADD COLUMN avatar_id VARCHAR(128);
ALTER TABLE users ADD COLUMN avatar_photo_url TEXT;
```

---

## 3. Story-Cinema (`/story-cinema`)

**Was es tut:** 30-60s Mini-Filme mit mehreren KI-generierten Szenen + Voice + Musik.

### Endpoint
```
POST /api/story-cinema/generate
```

### Input
```ts
{
  scenes: string[];       // 2-6 Szenen-Beschreibungen
  voiceover: string;      // Text für Voice-Over
  voice: string;          // "male-energetic" | "female-warm" | ...
  music: string;          // "epic" | "uplifting" | "chill-beats" | "dramatic" | "none"
}
```

### Output
```ts
{
  videoUrl: string;
  duration: number;
  scenes: Array<{ startTime: number; videoUrl: string }>;
}
```

### Empfohlene Stack
1. **Scene-Videos:** Kling 3.0 Pro via fal.ai (5-8s pro Szene)
2. **Voice-Over:** ElevenLabs API
3. **Musik:** Suno AI API (oder vorgerendertes Stock-Audio)
4. **Composition:** FFmpeg-Server der alles zusammenfügt
5. **Untertitel:** Whisper Transcribe + FFmpeg Subtitles

### Code-Flow (Pseudocode)
```ts
async function generateStoryCinema(input) {
  // 1. Parallel: Scene-Videos generieren
  const sceneVideos = await Promise.all(
    input.scenes.map(s => falAi.kling.generate({ prompt: s, duration: 5 }))
  );

  // 2. Voice-Over
  const voiceAudio = await elevenLabs.tts({ text: input.voiceover, voice: input.voice });

  // 3. Musik
  const musicUrl = input.music === "none" ? null : await sunoAi.generate({ style: input.music });

  // 4. Composition via FFmpeg
  const finalVideo = await ffmpegCompose({
    videos: sceneVideos,
    audio: voiceAudio,
    music: musicUrl,
    subtitles: input.voiceover,
  });

  return { videoUrl: finalVideo.url, duration: finalVideo.duration };
}
```

### Kosten-Schätzung pro Video
- 4 Scene-Videos (Kling 3.0): ~$2
- Voice-Over (ElevenLabs): ~$0.10
- Musik (Suno): ~$0.05
- **Total: ~$2.20 pro Mini-Film**

---

## 4. Reaction-Studio (in SmartAnalysis)

**Was es tut:** Subway-Surfers-Style: Gameplay-Hintergrund + Hook-Text + KI-Voiceover.

### Endpoint
```
POST /api/reaction/generate
```

### Input
```ts
{
  hook: string;        // Text
  gameplay: string;    // "subway" | "minecraft-parkour" | "satisfying-slime" | ...
  voice: string;
}
```

### Output
```ts
{ videoUrl: string; duration: number }
```

### Empfohlene Stack
1. **Stock-Gameplay-Videos:** in R2/S3 gespeichert (jeweils 30s Loops)
2. **Voice-Over:** ElevenLabs
3. **Text-Overlay + Composition:** FFmpeg mit:
   - Video-Crop auf 9:16 (Vertical)
   - Text-Overlay mit drawtext filter
   - Voice-Over als Audio-Layer

---

## Reihenfolge der Implementierung

**Empfehlung:**
1. **Future-Self** zuerst (einzelne Image-Generation, einfachster Stack)
2. **Reaction-Studio** (FFmpeg-Grundgerüst schaffen)
3. **Story-Cinema** (nutzt FFmpeg-Grundgerüst)
4. **Avatar-Me** (komplexeste — HeyGen-Custom-Avatar-Setup)

---

## ENV-Variablen die benötigt werden

```env
FAL_API_KEY=          # schon da (Bilder + Videos)
ELEVENLABS_API_KEY=   # NEU
SUNO_API_KEY=         # NEU (für Story-Cinema Musik)
HEYGEN_API_KEY=       # schon da (für Lina)
FFMPEG_SERVICE_URL=   # NEU (eigener Render-Service, z.B. auf Railway/Fly)
```

---

## Status-Dashboard für Partner

Empfehlung: Video-Jobs in Queue (BullMQ + Redis) laufen lassen, da sie 2-5 Minuten dauern können.

```ts
// Async pattern:
POST /api/story-cinema/generate → { jobId: "abc123" }
GET  /api/jobs/:jobId/status    → { status: "processing" | "done", videoUrl? }
```

Oder per WebSocket / Server-Sent-Events für Live-Updates.
