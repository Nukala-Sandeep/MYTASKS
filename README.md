# mytasks — Kokoro Quest Full Version

A full-stack gamified productivity app with an original female anime-style companion.

## Included
- React + Vite + TypeScript frontend
- Express + MongoDB backend
- JWT authentication + bcrypt password hashing
- Cloud profile and quest persistence
- Quest Board with E/D/C/B/A/S ranks
- XP, gold, level and streak progression
- Quest completion persisted through the API
- 25-minute Focus Crucible with cloud reward claiming
- Original anime companion UI
- Default **Female Anime-Style** browser voice profile
- Female voice preference detection with browser-voice fallback
- Soft / Playful / Goblin companion moods
- Voice Vault with audition controls
- Notification onboarding
- User-entered date of birth and Arcane Zodiac
- Responsive desktop + mobile navigation
- Security boundaries and production notes

## Voice note
The default voice is an original anime-style character presentation using browser speech synthesis. The app does **not** copy a specific anime character, actor, or copyrighted voice. Browser voice availability varies by OS/browser, so the app automatically selects the closest available female English voice.

## Run
Requirements: Node.js 22+ and MongoDB local or Atlas.

### Backend
```bash
cd server
npm install
```
Copy `server/.env.example` to `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/mytasks
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
```
Then:
```bash
npm run dev
```
Health check: `http://localhost:5000/api/health`

### Frontend
From project root:
```bash
npm install
```
Create `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```
Then:
```bash
npm run dev
```
Open `http://localhost:5173`.

## Production hardening
Use HTTPS, rate limiting, secure headers, refresh-token/session strategy, email verification, password reset, server-side validation, structured logging, secure secret storage, MongoDB Atlas network restrictions, and WebAuthn/native secure storage for sensitive vault functionality.

## Custom Voice Engine (v1.3)

The Voice Vault now supports a real provider-backed custom voice pipeline through ElevenLabs. The browser never receives the provider API key.

### Backend `server/.env`

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/mytasks
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
ELEVENLABS_API_KEY=your_provider_key_here
ELEVENLABS_MODEL_ID=eleven_multilingual_v2
ELEVENLABS_DEFAULT_VOICE_ID=R9th2GNXPmvP5kdtphBE
ELEVENLABS_DEFAULT_VOICE_NAME=Kitsune Aoi • Default Female
```

`ELEVENLABS_DEFAULT_VOICE_ID` can be overridden for another ElevenLabs voice. If omitted, this build uses the bundled Kitsune Aoi voice ID above.

### Custom voice flow

1. Open **Voice Vault**.
2. Upload or record a voice you own or have permission to use.
3. Confirm the consent checkbox.
4. Click **Create / Replace Custom Voice**.
5. The backend creates the provider voice and stores only its voice ID in MongoDB.
6. Companion, focus and quest dialogue call `/api/voice/speak` and use the selected custom voice.
7. Remove the custom voice from Voice Vault to return to the browser female voice.

The ElevenLabs API documents `POST /v1/voices/add` for creating an IVC voice from audio samples and `POST /v1/text-to-speech/:voice_id` for generating speech from the resulting voice ID. The API key must remain server-side. See the official documentation for current account/plan requirements. 

### Fallback behavior

If the provider is not configured, the app does not break. It automatically falls back to the best available female English browser voice. This makes local development possible without a provider key.

### Security / privacy notes

- Do not put `ELEVENLABS_API_KEY` in a `VITE_*` variable.
- Do not commit `server/.env` to Git.
- Only clone voices you own or are authorized to use.
- Production should use HTTPS, rate limiting, request validation and a secure secret manager.
- Audio samples are sent to the configured provider when creating a custom voice; review the provider's current retention/privacy terms before production use.


## If login shows Failed to fetch
1. Open a second terminal.
2. Run `cd server` then `npm install` then `npm run dev`.
3. Confirm `http://localhost:5000/api/health` opens and returns JSON.
4. Make sure MongoDB is running: `mongod --version` and `mongosh`.
5. If MongoDB is installed as a Windows service, start it from Services or run `net start MongoDB` from an Administrator CMD.
6. Frontend `.env` must contain `VITE_API_URL=http://localhost:5000/api`.
7. Restart Vite after changing `.env`.


## Default Kitsune Aoi voice
The app is configured to use the ElevenLabs voice ID `R9th2GNXPmvP5kdtphBE` as the default female Kitsune Aoi voice. The ElevenLabs API key must remain in `server/.env`; never put it in a `VITE_*` variable. The TTS endpoint uses the configured voice ID with the selected TTS model.


## v1.5 interactive quest upgrades
- Quest completion now triggers an Aoi appreciation line through the ElevenLabs voice path, with browser TTS fallback.
- Quests can be removed from the board and database.
- Quest deadlines use date + time and are enforced by both the UI and API; expired quests cannot be cleared.
- Voice Command Mode uses the browser Web Speech API in Chrome/Edge. Supported commands include creating a quest, changing filters, completing a named quest, and removing a named quest.
- Voice commands do not send microphone audio to ElevenLabs; speech recognition is performed by the browser.
