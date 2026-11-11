// Pregúntale al FCOM · Airline Ready by From The Cockpit
// Proxy seguro hacia la API de Anthropic. La clave vive solo en el servidor.
// Variables de entorno en Netlify:
//   ANTHROPIC_API_KEY  (obligatoria)
//   ANTHROPIC_MODEL    (opcional, por defecto claude-sonnet-5-5)
//   ALLOWED_ORIGIN     (opcional, p. ej. https://tu-sitio.netlify.app)

const TOOLS = [{
  name: "search_manual",
  description: "Search the loaded pilot manuals (FCOM/FCTM/QRH...) for passages. Returns up to 6 passages with id, document, section, page and text. Use English technical terms.",
  input_schema: {
    type: "object",
    properties: { query: { type: "string", description: "English keywords" } },
    required: ["query"]
  }
}];

const SYSTEM = "You are \"Pregúntale al FCOM\", a study assistant for professional airline pilots by Airline Ready by From The Cockpit. You answer strictly from manual passages supplied in the conversation, never from outside knowledge, and follow the output format the user message specifies. Refuse anything unrelated to studying aircraft operating manuals.";

const MAX_BODY = 400_000; // bytes

export default async (req) => {
  const origin = process.env.ALLOWED_ORIGIN;
  const cors = origin ? { "access-control-allow-origin": origin } : {};
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: { ...cors, "access-control-allow-methods": "POST", "access-control-allow-headers": "content-type" } });
  if (req.method !== "POST") return json({ error: { message: "Method not allowed" } }, 405, cors);
  if (origin && req.headers.get("origin") && req.headers.get("origin") !== origin) return json({ error: { message: "Forbidden origin" } }, 403, cors);

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return json({ error: { message: "ANTHROPIC_API_KEY no configurada" } }, 500, cors);

  const raw = await req.text();
  if (raw.length > MAX_BODY) return json({ error: { message: "Request too large" } }, 413, cors);
  let body; try { body = JSON.parse(raw); } catch { return json({ error: { message: "Bad JSON" } }, 400, cors); }
  const messages = Array.isArray(body.messages) ? body.messages.slice(0, 16) : null;
  if (!messages || !messages.length) return json({ error: { message: "messages required" } }, 400, cors);

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5",
      max_tokens: 2000,
      system: SYSTEM,
      tools: TOOLS,
      messages
    })
  });
  const text = await r.text();
  return new Response(text, { status: r.status, headers: { ...cors, "content-type": "application/json" } });
};

function json(obj, status, extra = {}) {
  return new Response(JSON.stringify(obj), { status, headers: { ...extra, "content-type": "application/json" } });
}

export const config = { path: "/api/ask" };
