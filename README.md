# OpenAI Text-to-Speech Application

A production-ready text-to-speech application powered by OpenAI's TTS API, built with Next.js 15 and TypeScript.

## ✨ Features

- **11 Voices**: Choose from OpenAI's diverse voice library
- **Speed Control**: Adjust playback speed from 0.25x to 4.0x
- **Multiple Formats**: Export as MP3, WAV, or Opus
- **RTL Support**: Full right-to-left support for Arabic text
- **Language Detection**: Automatic detection of Arabic, English, or mixed text
- **Rate Limiting**: Built-in protection against abuse
- **Professional UI**: Accessible, responsive interface with loading states and error handling

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (LTS recommended)
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/openai/openai-fm.git
   cd openai-fm
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your OpenAI API key:
   ```env
   OPENAI_API_KEY=sk-...
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📋 Environment Variables

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key | `sk-...` |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `NEXT_PUBLIC_APP_URL` | Application URL | `http://localhost:3000` |
| `NEXT_PUBLIC_MAX_FREE_CHARACTERS` | Character limit | `10000` |

## 🏗️ Architecture

```
src/
├── app/
│   ├── api/
│   │   ├── generate/      # TTS generation endpoint
│   │   └── health/        # Health check endpoint
│   └── ...
├── components/
│   └── ui/                # Reusable UI components
├── services/
│   ├── tts.service.ts     # OpenAI TTS integration
│   └── validation.service.ts  # Input validation
├── middleware/
│   └── rate-limiter.ts    # Rate limiting logic
├── config/
│   └── index.ts           # Centralized configuration
└── lib/
    ├── errors.ts          # Custom error types
    └── logger.ts          # Production logging
```

## 🔌 API Endpoints

### Generate Speech

**POST** `/api/generate`

Generate speech from text.

**Request (FormData)**:
```typescript
{
  input: string,        // Text to convert (10-4096 chars)
  voice: string,        // Voice name (e.g., 'coral', 'sage')
  speed?: number,       // Playback speed (0.25-4.0)
  format?: string,      // Audio format ('mp3', 'wav', 'opus')
  prompt?: string       // Voice instructions (optional)
}
```

**Response**: Audio stream (binary)

**Headers**:
- `X-Character-Count`: Number of characters processed
- `X-Language`: Detected language ('ar', 'en', 'mixed')

### Health Check

**GET** `/api/health`

Check application health status.

**Response**:
```json
{
  "status": "ok",
  "timestamp": 1234567890,
  "services": {
    "openai": "ok",
    "database": "not_implemented"
  }
}
```

## 🛠️ Configuration

All configuration is centralized in `src/config/index.ts`:

- **Text Limits**: 10-4096 characters
- **Rate Limits**: 10 requests/minute per IP
- **Supported Voices**: 11 voices
- **Supported Formats**: 6 formats (MP3, WAV, Opus, AAC, FLAC, PCM)
- **Speed Range**: 0.25x - 4.0x

## 🔒 Security Features

- ✅ API keys secured server-side only
- ✅ Rate limiting (IP-based)
- ✅ Input validation and sanitization
- ✅ Spam detection
- ✅ CORS configuration
- ✅ Content Security Policy (CSP)
- ✅ No sensitive data in logs

## 📦 Deployment

### Vercel (Recommended)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Set environment variables in Vercel dashboard

### VPS / Docker

1. **Build the Docker image**:
   ```bash
   docker build -t openai-tts .
   ```

2. **Run the container**:
   ```bash
   docker run -p 3000:3000 \
     -e OPENAI_API_KEY=sk-... \
     -e NEXT_PUBLIC_APP_URL=https://your-domain.com \
     openai-tts
   ```

3. **Or use Docker Compose**:
   ```bash
   docker-compose up -d
   ```

### Production Build

```bash
# Build
npm run build

# Start production server
npm run start:prod
```

## 🧪 Development

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

### Testing the API

```bash
# Test text generation
curl -X POST http://localhost:3000/api/generate \
  -F "input=Hello, this is a test" \
  -F "voice=coral" \
  -F "speed=1.0" \
  -F "format=mp3" \
  --output test.mp3

# Check health
curl http://localhost:3000/api/health
```

## 📝 Supported Languages

- **English**: Full support
- **Arabic**: Full RTL support with Arabic font
- **Mixed**: Detects bilingual text

## 🎨 UI Components

All UI components are accessible and RTL-ready:

- `TextEditor`: Professional text input with character counting
- `AudioPlayer`: Full playback controls with download
- `LoadingState`: Spinner and progress indicators
- `ErrorDisplay`: User-friendly error messages
- `LanguageDetector`: Shows detected language
- `SpeedControl`: Speed adjustment slider
- `FormatSelector`: Audio format selection

## ⚠️ Rate Limits

- **IP-based**: 10 requests per minute
- **User-based** (when auth added): 50 requests per minute

When rate limited, retry after the time specified in the error message.

## 🐛 Troubleshooting

### "OPENAI_API_KEY is required"

Make sure you've created a `.env.local` file and added your API key.

### Rate limit errors

Wait 1 minute before trying again, or reduce request frequency.

### Audio not playing

Check browser console for errors. Ensure the format is supported by your browser (MP3 is most compatible).

### Build errors

Run `npm run type-check` to identify TypeScript errors.

## 📚 Resources

- [OpenAI TTS API Documentation](https://platform.openai.com/docs/guides/text-to-speech)
- [Next.js Documentation](https://nextjs.org/docs)
- [API Reference](https://platform.openai.com/docs/api-reference/audio/createSpeech)

## 🤝 Contributing

This is an official OpenAI demo project. Contributions are welcome via pull requests.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Live Demo**: [openai.fm](https://openai.fm)
- **OpenAI Platform**: [platform.openai.com](https://platform.openai.com)

---

**Note**: This application uses the OpenAI API and will consume API credits based on usage. Monitor your usage in the [OpenAI dashboard](https://platform.openai.com/usage).
