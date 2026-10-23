# Gemini Chatbot

HTML + CSS + Vanilla JavaScript frontend, aur Vercel Serverless Function (`api/chat.js`) backend.

## Folder structure

```
gemini-chatbot/
├── api/
│   └── chat.js
├── index.html
├── style.css
├── script.js
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## Deploy steps

1. GitHub par naya repository banayein aur ye saari files upload karein.
2. vercel.com par login karein, **Add New > Project** par click karein aur apna repo import karein.
3. **Environment Variables** mein `GEMINI_API_KEY` naam se apni key paste karein.
4. **Deploy** dabayein.

Key Google AI Studio (aistudio.google.com) se milti hai.

## Local testing

```
npm i -g vercel
cp .env.example .env.local   # phir .env.local mein apni key likhein
vercel dev
```
