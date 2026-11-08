export default async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  if (request.method !== "POST") {
    return Response.json(
      { error: "Method not allowed" },
      { status: 405 }
    );
  }

  try {
    const API_KEY = Netlify.env.get("GEMINI_API_KEY");

    if (!API_KEY) {
      return Response.json(
        { error: "GEMINI_API_KEY is missing in Netlify" },
        { status: 500 }
      );
    }

    const body = await request.json();

    const history = Array.isArray(body.history)
      ? body.history
      : [];

    const getText = (item) => {
      if (typeof item.text === "string") return item.text;
      if (typeof item.content === "string") return item.content;

      if (Array.isArray(item.parts)) {
        return item.parts.map(p => p.text || "").join("");
      }

      return "";
    };

    let message =
      body.message ||
      body.prompt ||
      body.text ||
      body.input ||
      body.question ||
      "";

    if (!message && history.length) {
      const lastUser = [...history].reverse()
        .find(item => item.role === "user");

      if (lastUser) message = getText(lastUser);
    }

    if (!message) {
      return Response.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const contents = history
      .map(item => ({
        role: item.role === "assistant" || item.role === "model"
          ? "model"
          : "user",
        parts: [{ text: getText(item) }]
      }))
      .filter(item => item.parts[0].text.trim());

    if (
      contents.length === 0 ||
      contents[contents.length - 1].role !== "user"
    ) {
      contents.push({
        role: "user",
        parts: [{ text: String(message) }]
      });
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
      encodeURIComponent(API_KEY),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: "You are BRAVE AI, an advanced AI assistant created by Raunak. You are intelligent, helpful, creative and friendly. Support multiple languages. Help with coding, website creation, education, writing and general questions. Give accurate and clear answers."
            }]
          },
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4096
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return Response.json({
        error: data.error?.message || "Gemini API error"
      }, { status: response.status });
    }

    const reply = data.candidates?.[0]?.content?.parts
      ?.map(p => p.text || "")
      .join("") || "No response received.";

    return Response.json({
      reply,
      response: reply,
      text: reply
    });

  } catch (error) {
    return Response.json({
      error: error.message || "Server error"
    }, { status: 500 });
  }
};
