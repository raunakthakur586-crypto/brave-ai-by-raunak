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
        { error: "Gemini API key missing" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const message = body.message || body.prompt || body.text;

    if (!message) {
      return Response.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const contents = [
      ...(Array.isArray(body.history) ? body.history : []).map(item => ({
        role: item.role === "assistant" || item.role === "model"
          ? "model" : "user",
        parts: [{ text: String(item.text || item.content || "") }]
      })),
      {
        role: "user",
        parts: [{ text: String(message) }]
      }
    ];

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=" +
      encodeURIComponent(API_KEY),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: "You are BRAVE AI, an advanced intelligent AI assistant created by Raunak. You are helpful, creative, knowledgeable and friendly. Support multiple languages. Help users with coding, website creation, image generation guidance, education, writing and general questions. Give clear and accurate answers."
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
      return Response.json(
        { error: data.error?.message || "AI API error" },
        { status: response.status }
      );
    }

    const reply = data.candidates?.[0]?.content?.parts
      ?.map(part => part.text || "").join("") || "No response received.";

    return Response.json({
      reply,
      response: reply,
      text: reply
    });

  } catch (error) {
    return Response.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
};
