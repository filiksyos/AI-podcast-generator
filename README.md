# Simple Podcast Generator

A modern Next.js application that transforms text into natural-sounding speech using ElevenLabs AI voices. Generate professional-quality podcasts with a beautiful, intuitive interface.

## ✨ Features

- **AI-Powered Speech Generation**: Leverage ElevenLabs' advanced text-to-speech technology
- **Multiple Voice Options**: Choose from a variety of AI voices with different characteristics
- **Advanced Voice Controls**: Fine-tune stability, similarity, style, and speaker boost settings
- **Real-time Audio Playback**: Built-in audio player with modern controls
- **Download Capabilities**: Save generated podcasts in high-quality audio formats
- **Responsive Design**: Beautiful interface that works on desktop and mobile
- **Dark Mode Support**: Automatic dark/light theme switching
- **Voice Previews**: Listen to voice samples before selection

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- ElevenLabs API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd simple-podcast-app
   ```

2. **Install dependencies**
   ```bash
   pnpm install --save
   ```

3. **Set up environment variables**
   
   Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` and add your ElevenLabs API key:
   ```env
   ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Required: ElevenLabs API Configuration
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Optional: Custom API base URL (defaults to https://api.elevenlabs.io)
ELEVENLABS_BASE_URL=https://api.elevenlabs.io

# Optional: Default voice ID (if not specified, first available voice will be used)
DEFAULT_VOICE_ID=

# Optional: Application Configuration
NEXT_PUBLIC_APP_NAME="Simple Podcast Generator"
NEXT_PUBLIC_APP_DESCRIPTION="Generate AI-powered podcasts with ElevenLabs"
```

### Getting Your ElevenLabs API Key

1. Visit [ElevenLabs](https://elevenlabs.io) and create an account
2. Navigate to your profile settings
3. Generate an API key in the API section
4. Copy the key to your `.env.local` file

## 📱 Usage

### Basic Podcast Generation

1. **Enter Your Content**: Type or paste your text content in the main text area
2. **Select a Voice**: Choose from the available AI voices using the voice selector
3. **Adjust Settings** (Optional): Fine-tune voice parameters for optimal results
4. **Generate**: Click the "Generate Podcast" button to create your audio
5. **Play & Download**: Use the built-in player to listen and download your podcast

### Advanced Voice Settings

- **Stability**: Controls voice consistency (lower = more expressive, higher = more stable)
- **Similarity**: How closely the AI matches the original voice characteristics
- **Style**: Style exaggeration level (higher = more stylized speech)
- **Speaker Boost**: Enhances similarity to the original speaker

### Text Guidelines

- **Minimum**: 10 characters
- **Maximum**: 5000 characters
- **Optimal**: 500-2000 characters for best quality
- **Format**: Plain text works best; avoid excessive formatting

## 🛠️ Technical Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Lucide React icons
- **API Integration**: ElevenLabs Text-to-Speech API
- **Audio Handling**: Web Audio API with custom player
- **State Management**: React hooks

## 📂 Project Structure

```
simple-podcast-app/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── generate-podcast/  # Podcast generation endpoint
│   │   └── voices/        # Voice fetching endpoint
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Homepage
├── components/            # React components
│   ├── AudioPlayer.tsx   # Custom audio player
│   ├── PodcastGenerator.tsx  # Main generator interface
│   ├── VoiceSelector.tsx # Voice selection component
│   └── LoadingSpinner.tsx    # Loading components
├── lib/                   # Utility libraries
│   ├── elevenlabs.ts     # ElevenLabs API integration
│   └── utils.ts          # Helper functions
├── types/                 # TypeScript definitions
│   └── podcast.ts        # Interface definitions
└── public/               # Static assets
```

## 🔍 API Routes

### POST `/api/generate-podcast`
Generates speech from text using ElevenLabs API.

**Request Body:**
```json
{
  "text": "Your podcast content here",
  "voice_id": "voice_id_string",
  "settings": {
    "stability": 0.5,
    "similarity_boost": 0.5,
    "style": 0,
    "use_speaker_boost": false
  }
}
```

### GET `/api/voices`
Fetches available voices from ElevenLabs.

**Response:**
```json
{
  "success": true,
  "voices": [
    {
      "voice_id": "string",
      "name": "Voice Name",
      "category": "premade",
      "description": "Voice description",
      "preview_url": "https://..."
    }
  ]
}
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in the Vercel dashboard
4. Deploy

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Render
- DigitalOcean App Platform

## 🐛 Troubleshooting

### Common Issues

**"API key not configured" error:**
- Ensure your `.env.local` file contains the correct `ELEVENLABS_API_KEY`
- Restart your development server after adding the key

**"Failed to fetch voices" error:**
- Check your internet connection
- Verify your ElevenLabs API key is valid
- Ensure you have sufficient credits in your ElevenLabs account

**Audio playback issues:**
- Ensure your browser supports Web Audio API
- Check browser permissions for audio playback
- Try a different browser if issues persist

### Error Logs

Check the browser console and server logs for detailed error messages. Most API-related errors will provide specific guidance.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [ElevenLabs](https://elevenlabs.io) for their excellent text-to-speech API
- [Next.js](https://nextjs.org) for the React framework
- [Tailwind CSS](https://tailwindcss.com) for the styling system
- [Lucide](https://lucide.dev) for the beautiful icons

## 📞 Support

If you encounter any issues or have questions:

1. Check the troubleshooting section above
2. Search existing GitHub issues
3. Create a new issue with detailed information
4. Join our community discussions

---

**Made with ❤️ using Next.js and ElevenLabs AI** 