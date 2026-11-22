const SYSTEM = `تو «رو» هستی؛ همراه روان‌ت. درمانگر نیستی.
فارسی محاوره. معمولاً ۲–۴ جمله. همدل باش، داستان را کامل برنگردان، جواب یک‌کلمه‌ای سرد نده.
تشخیص/دارو/روش آسیب ممنوع. بحران: ۱۱۵ و ۱۲۳.`;

function crisis(t) {
  if (/خودکشی|می‌خوام\s*بکشم|میخوام\s*بکشم|نمی‌خوام\s*زند|روش\s*خودکشی/.test(t)) {
    return "اگر خطر فوری حس می‌کنی، همین الان با اورژانس ۱۱۵ یا اورژانس اجتماعی ۱۲۳ تماس بگیر. تنها نباش.";
  }
  return null;
}
function boundary(t) {
  if (/دارو|قرص|دوز/.test(t) && /بخور|تجویز|چی\s*بگیرم/.test(t)) {
    return "من نمی‌تونم درباره دارو نظر بدم. این را با پزشک یا روان‌پزشک مطرح کن.";
  }
  if (/تشخیص\s*بده|افسردگی\s*دارم\?/.test(t)) {
    return "تشخیص با متخصص است؛ من جاش نیستم. اگر خواستی از حال‌ت بگو.";
  }
  return null;
}

function authHeader(apiKey) {
  const k = String(apiKey || "").trim();
  if (!k) return "";
  // Arvan: Authorization: apikey XXX
  if (/^apikey\s+/i.test(k)) return k;
  if (/^[0-9a-fA-F-]{16,}$/.test(k) || k.includes("-")) return `apikey ${k}`;
  // OpenAI / DeepSeek style
  if (/^Bearer\s+/i.test(k)) return k;
  return `Bearer ${k}`;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const userText = String(body.message || body.text || "").trim();
    const history = Array.isArray(body.history) ? body.history : [];
    if (!userText) return res.status(400).json({ error: "message required", reply: "پیام خالی بود." });

    const c = crisis(userText);
    if (c) return res.status(200).json({ reply: c, mode: "crisis", source: "safety" });
    const b = boundary(userText);
    if (b) return res.status(200).json({ reply: b, mode: "boundary", source: "safety" });

    const API_KEY = process.env.RO_LLM_API_KEY || process.env.OPENAI_API_KEY || "";
    let BASE_URL = (process.env.RO_LLM_BASE_URL || "").replace(/\/$/, "");
    const MODEL = process.env.RO_LLM_MODEL || "";

    if (!API_KEY || !BASE_URL || !MODEL) {
      return res.status(200).json({
        reply: "تنظیمات ناقص است. RO_LLM_API_KEY و RO_LLM_BASE_URL و RO_LLM_MODEL را در Vercel چک کن و Redeploy بزن.",
        mode: "presence",
        source: "local",
      });
    }

    // ensure /v1
    if (!/\/v1$/i.test(BASE_URL)) {
      BASE_URL = BASE_URL.replace(/\/+$/, "") + "/v1";
    }

    const messages = history
      .filter((m) => m && (m.role === "user" || m.role === "assistant" || m.role === "ro"))
      .slice(-10)
      .map((m) => ({
        role: m.role === "ro" ? "assistant" : m.role,
        content: String(m.content || m.text || ""),
      }));
    messages.push({ role: "user", content: userText });

    const url = `${BASE_URL}/chat/completions`;
    const r = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader(API_KEY),
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.7,
        max_tokens: 400,
        messages: [{ role: "system", content: SYSTEM }, ...messages],
      }),
    });

    const raw = await r.text();
    if (!r.ok) {
      const detail = raw.slice(0, 280);
      return res.status(200).json({
        reply: `خطای مدل (${r.status}): ${detail}`,
        error: "llm_error",
        detail,
        source: "llm",
      });
    }

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return res.status(200).json({ reply: "پاسخ مدل قابل خواندن نبود.", detail: raw.slice(0, 200) });
    }

    const reply =
      data.choices?.[0]?.message?.content ||
      data.choices?.[0]?.text ||
      data.output_text ||
      data.reply ||
      "پاسخ خالی از مدل آمد.";

    return res.status(200).json({ reply, mode: "presence", source: "llm", model: MODEL });
  } catch (e) {
    return res.status(200).json({ reply: "خطای سرور: " + String(e.message || e), error: String(e.message || e) });
  }
}
