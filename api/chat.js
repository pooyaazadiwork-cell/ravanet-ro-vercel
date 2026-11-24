const SYSTEM = `تو «رو» هستی؛ همراه هوشمند روانت. درمانگر یا روان‌پزشک نیستی.
فارسی محاوره. معمولاً ۲–۴ جمله. همدل باش؛ داستان را کامل برنگردان؛ جواب یک‌کلمه‌ای سرد نده.
فقط حوزه سلامت روان، احساسات، روابط، استرس، خانواده، دردِدل و مسیر روانت.
ریاضی، تکلیف، کد، اخبار و موضوعات غیرروانی را حل نکن؛ کوتاه بگو کار تو نیست و برگردان به حال کاربر.
وقتی سلام یا «تو کی هستی»: «من رو هستم؛ همراه هوشمند روانت. درمانگر نیستم؛ اینجام که بشنوم.»
تشخیص/دارو/روش آسیب ممنوع. بحران واضح: ۱۱۵ و ۱۲۳. ایده نرم مثل کاش بیدار نمی‌شدم: همدلی + یادآوری ۱۱۵/۱۲۳ در صورت فشار زیاد.`;

function crisis(t) {
  if (/روش\s*خودکشی|چطور\s*خودم\s*را\s*بکشم|می‌خوام\s*بکشم|میخوام\s*بکشم/.test(t)) {
    return "اگر در خطر فوری هستی با اورژانس ۱۱۵ یا اورژانس اجتماعی ۱۲۳ تماس بگیر. تنها نباش.";
  }
  return null;
}
function softCrisis(t) {
  if (/کاش\s*(صبح\s*)?بیدار\s*نمی|نمی‌خوام\s*زند|نمیخوام\s*زند|ای\s*کاش\s*مرده/.test(t)) {
    return "این حس خیلی سنگینه. اگر فشار برایت غیرقابل تحمل است، با ۱۱۵ یا ۱۲۳ حرف بزن. اینجام؛ اگر خواستی از همان سنگینی بگو — بدون جزئیات آسیب.";
  }
  return null;
}
function offTopic(t) {
  if (/(معادله|ریاضی|حل\s*کن|کد\s*بزن|پایتون|ترجمه\s*کن|javascript|املای|تاریخ\s*چند|پایتخت)/i.test(t) &&
      !/(استرس|اضطراب|حالم|غم|تنها|دعوا|خانواده|رابطه)/.test(t)) {
    return "من برای این کار نیستم؛ همراه روانتم. اگر چیزی از حال یا ذهنت فشار می‌آره بگو.";
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
  if (/^apikey\s+/i.test(k)) return k;
  if (/^[0-9a-fA-F-]{16,}$/.test(k) || (k.includes("-") && !k.startsWith("sk-"))) return `apikey ${k}`;
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

    const hard = crisis(userText);
    if (hard) return res.status(200).json({ reply: hard, mode: "crisis", source: "safety" });
    const soft = softCrisis(userText);
    if (soft) return res.status(200).json({ reply: soft, mode: "crisis_soft", source: "safety" });
    const bound = boundary(userText);
    if (bound) return res.status(200).json({ reply: bound, mode: "boundary", source: "safety" });
    const off = offTopic(userText);
    if (off) return res.status(200).json({ reply: off, mode: "scope", source: "safety" });

    const API_KEY = process.env.RO_LLM_API_KEY || process.env.OPENAI_API_KEY || "";
    let BASE_URL = (process.env.RO_LLM_BASE_URL || "").replace(/\/$/, "");
    const MODEL = process.env.RO_LLM_MODEL || "";
    if (!API_KEY || !BASE_URL || !MODEL) {
      return res.status(200).json({ reply: "تنظیمات مدل ناقص است.", mode: "presence", source: "local" });
    }
    if (!/\/v1$/i.test(BASE_URL)) BASE_URL = BASE_URL.replace(/\/+$/, "") + "/v1";

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
      headers: { "Content-Type": "application/json", Authorization: authHeader(API_KEY) },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.7,
        max_tokens: 400,
        messages: [{ role: "system", content: SYSTEM }, ...messages],
      }),
    });
    const raw = await r.text();
    if (!r.ok) return res.status(200).json({ reply: `خطای مدل (${r.status}): ${raw.slice(0, 280)}`, error: "llm_error" });
    const data = JSON.parse(raw);
    const reply = data.choices?.[0]?.message?.content || data.choices?.[0]?.text || "پاسخ خالی.";
    return res.status(200).json({ reply, mode: "presence", source: "llm", model: MODEL });
  } catch (e) {
    return res.status(200).json({ reply: "خطای سرور: " + String(e.message || e) });
  }
}
