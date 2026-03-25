# Global Ripple Macro Agent v2

A cross-border market intelligence dashboard that leverages **Gemini 3.1 Pro** to translate global news and predict sector-specific ripple effects across international markets.

## 🌟 Key Features

- **Multilingual Intelligence Stream**: Real-time monitoring of global macro-economic topics, translated and synthesized into actionable English insights.
- **Geographical Impact Map**: Visual representation of global events and their primary locations of impact.
- **Sector Correlation Network**: Analysis of how global events correlate with different market sectors (e.g., IT, Banking, Energy).
- **Ripple Effect Engine**: Deep-dive causality analysis explaining how a specific event (like a Fed rate decision) ripples through global supply chains to affect local sectors.
- **Intelligent Fallback**: Robust handling of API limits or content blocks using AI synthesis from internal knowledge bases.

## 🚀 Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS
- **Visualization**: D3.js, Recharts, TopoJSON
- **AI Engine**: Google Gemini 3.1 Pro via `@google/genai`
- **Icons**: Lucide React / FontAwesome

## 🛠️ Getting Started

### Prerequisites

- **Node.js**: Version 18 or higher.
- **Gemini API Key**: Obtain one from the [Google AI Studio](https://aistudio.google.com/app/apikey).

### Installation

1. Clone the repository (or download the source code).
2. Install dependencies:
   ```bash
   npm install
   ```

### Configuration

Create a `.env` file in the root directory and add your Gemini API key:
```env
GEMINI_API_KEY=your_api_key_here
```

### Running the Application

To start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000` (or the port specified by your environment).

## 📊 How to Use

1. **Monitor the Feed**: The left sidebar shows a real-time stream of global signals.
2. **Select an Event**: Click on any news card in the feed to initiate a ripple analysis.
3. **Choose a Sector**: Use the dropdown menu to select a target market sector (e.g., "Indian IT Services") to see how the selected event specifically impacts it.
4. **Explore the Map**: Hover over the map to see where global events are originating.
5. **Analyze the Ripple**: View the center dashboard for a detailed causality chain and estimated market reactions for specific tickers.

## 🛡️ Safety & Reliability

The agent is designed with a "Paraphrase Mandate" to ensure all information is synthesized in its own words, preventing content recitation blocks and ensuring high-quality, original macro-economic analysis.
