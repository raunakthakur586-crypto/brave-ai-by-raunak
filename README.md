# BRAVE AI BY RAUNAK — starter project

This is a working AI chat starter for Netlify. It includes:
- Gemini-powered chat through a server-side Netlify Function
- Conversation history saved in the browser
- Voice input (browser support required)
- Read-aloud using browser text-to-speech
- Code-friendly responses and a mobile layout

## Deploy from your phone

1. Download and extract `brave-ai-by-raunak.zip`.
2. Upload the **contents of the extracted folder** to a new GitHub repository. Keep the folder structure:
   - `index.html`
   - `netlify.toml`
   - `netlify/functions/chat.mjs`
3. Import that GitHub repository into Netlify and deploy it.
4. In Netlify, open **Project configuration → Environment variables**.
5. Add:
   - Key: `GEMINI_API_KEY`
   - Value: your API key from Google AI Studio
6. Optionally add `GEMINI_MODEL` with a model available to your API key. Default in this starter: `gemini-3.8-flash`.
7. Trigger a fresh deploy after adding/changing environment variables.

## Important security note
Never paste your Gemini API key into `index.html`, GitHub, or a public chat. It belongs only in Netlify's environment variables. Keep the repository free of API keys.

## Current scope
This first version is a text AI assistant with browser voice input/output. It can write code and generate website files as text, but it does not yet create image files, understand uploaded images/PDFs, perform live web search, or automatically publish websites. Those need separate integrations and will be added in later stages.

## Troubleshooting
- `GEMINI_API_KEY is missing`: add the variable in Netlify and redeploy.
- `Model not found` or `not available`: set `GEMINI_MODEL` to a model currently available in your Google AI Studio account, then redeploy.
- `API key invalid`: create/check the key in Google AI Studio.
- Voice input not working: use Chrome and allow microphone permission. Browser speech features vary by device.
