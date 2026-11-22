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
    if (!userText) return res.status(400).json({ error: "message required" });

    const c = crisis(userText);
    if (c) return res.status(200).json({ reply: c, mode: "crisis", source: "safety" });
    const b = boundary(userText);
    if (b) return res.status(200).json({ reply: b, mode: "boundary", source: "safety" });

    const API_KEY = process.env.RO_LLM_API_KEY || process.env.OPENAI_API_KEY || "";
    const BASE_URL = (process.env.RO_LLM_BASE_URL || "https://api.deepseek.com").replace(/\/$/, "");
    const MODEL = process.env.RO_LLM_MODEL || "deepseek-flash";

    if (!API_KEY) {
      return res.status(200).json({
        reply: "کلید مدل روی Vercel تنظیم نشده. RO_LLM_API_KEY را اضافه کن و Redeploy کن.\nاینجام.",
        mode: "presence",
        source: "local",
      });
    }

    const messages = history
      .filter((m) => m && (m.role === "user" || m.role === "assistant" || m.role === "ro"))
      .slice(-10)
      .map((m) => ({
        role: m.role === "ro" ? "assistant" : m.role,
        content: String(m.content || m.text || ""),
      }));
    messages.push({ role: "user", content: userText });

    const r = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.7,
        max_tokens: 400,
        messages: [{ role: "system", content: SYSTEM }, ...messages],
      }),
    });
    if (!r.ok) {
      const detail = (await r.text()).slice(0, 300);
      return res.status(502).json({ error: "llm_error", detail });
    }
    const data = await r.json();
    const reply = data.choices?.[0]?.message?.content || "…";
    return res.status(200).json({ reply, mode: "presence", source: "llm", model: MODEL });
  } catch (e) {
    return res.status(500).json({ error: String(e.message || e) });
  }
}
