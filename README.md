# CosmicJyoti - Vedic AI Astrology App

A comprehensive Vedic astrology platform powered by Google Gemini AI, featuring birth charts, horoscopes, numerology, tarot, and spiritual guidance.

## 🌟 Features

- **Janam Kundali** - Complete Vedic birth chart analysis
- **Daily Horoscope** - Personalized daily predictions
- **CosmicHealth AI** - Vedic health advisor with dosha remedies
- **Numerology** - Life path and destiny numbers
- **Tarot Reading** - AI-powered card readings
- **Panchang** - Daily Vedic almanac
- **Muhurat Planner** - Auspicious timings
- **Compatibility Checker** - Love harmony analysis
- **Learning Center** - Comprehensive astrology education
- And many more features!

## 🚀 Live Demo

Visit: [https://YOUR_USERNAME.github.io/cosmicjyoti/](https://YOUR_USERNAME.github.io/cosmicjyoti/)

## 📖 Deployment Guide

For detailed GitHub deployment instructions, see: [GITHUB_LOGIN_AND_PUSH.md](./GITHUB_LOGIN_AND_PUSH.md)

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **AI**: Google Gemini API
- **Mobile**: Capacitor (Android)
- **State Management**: React Hooks

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/cosmicjyoti.git
cd cosmicjyoti

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Add your API keys to .env

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔑 Environment Variables

Create a `.env` file in the root directory:

```env
API_KEY=your_gemini_api_key_here
GEMINI_FALLBACK_KEY=your_fallback_key_optional
VITE_GOOGLE_API_KEY=your_google_maps_key_optional
```

Get your Gemini API key from: https://aistudio.google.com/app/apikey

## 📱 Android Build

```bash
# Build web app
npm run build

# Sync with Capacitor
npx cap sync android

# Open in Android Studio
npx cap open android
```

## 🚀 Deployment

### GitHub Pages

```bash
npm run deploy
```

Then enable GitHub Pages in repository settings.

### Manual Deployment

1. Build the app: `npm run build`
2. Upload `dist/` folder to your hosting service
3. Configure your server to serve `index.html` for all routes

## ⚡ Performance

- **Code Splitting**: Automatic vendor chunk separation
- **Lazy Loading**: Removed for faster initial load
- **Optimized Builds**: Minified and compressed
- **CDN Assets**: External fonts and libraries

## 📄 License

This project is private and proprietary.

## 🤝 Contributing

This is a private project. For issues or suggestions, please contact the maintainers.

## 📧 Contact

- Website: https://www.cosmicjyoti.com
- Support: Contact through website

---

Built with ❤️ by CosmicJyoti Team
