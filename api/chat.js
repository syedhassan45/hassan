// api/chat.js — Vercel Serverless Function
// API key sirf yahan (server par) use hoti hai, browser ko kabhi nahi milti.

const MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const MAX_MESSAGES = 20; // sirf aakhri 20 messages bhejte hain
const MAX_TEXT_LENGTH = 2000; // har message ki max length

const SYSTEM_PROMPT =
  "You are a friendly, helpful assistant. Reply in the same language the user writes in " +
  "(for example English, Urdu, or Roman Urdu). Keep answers clear and concise.";

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Sirf POST request allowed hai." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res
      .status(500)
      .json({ error: "Server par GEMINI_API_KEY set nahi hai." });
  }

  // Frontend se aane wala data check karein
  const messages = req.body && req.body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages array zaroori hai." });
  }

  const contents = messages
    .slice(-MAX_MESSAGES)
    .filter(
      (m) =>
        m &&
        (m.role === "user" || m.role === "model") &&
        typeof m.text === "string" &&
        m.text.trim() !== ""
    )
    .map((m) => ({
      role: m.role,
      parts: [{ text: m.text.slice(0, MAX_TEXT_LENGTH) }],
    }));

  if (contents.length === 0 || contents[contents.length - 1].role !== "user") {
    return res.status(400).json({ error: "Aakhri message user ka hona chahiye." });
  }

  try {
    const geminiResponse = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        generationConfig: { maxOutputTokens: 2048, temperature: 0.7 },
      }),
    });

    const data = await geminiResponse.json();

    if (!geminiResponse.ok) {
      console.error("Gemini API error:", data);
      return res.status(502).json({
        error: "Gemini API ne error diya. Thori der baad dobara try karein.",
      });
    }

    if (data.promptFeedback && data.promptFeedback.blockReason) {
      return res.status(200).json({
        reply: "Maazrat, main is sawal ka jawab nahi de sakta. Kuch aur poochein.",
      });
    }

    const parts =
      (data.candidates &&
        data.candidates[0] &&
        data.candidates[0].content &&
        data.candidates[0].content.parts) ||
      [];

    const reply = parts
      .filter((p) => typeof p.text === "string" && !p.thought)
      .map((p) => p.text)
      .join("")
      .trim();

    if (!reply) {
      return res.status(200).json({
        reply: "Mujhe jawab nahi mila. Dobara koshish karein.",
      });
    }

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ error: "Server mein masla aa gaya." });
  }
};
