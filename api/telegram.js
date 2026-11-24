const SYSTEM = `تو «رو» هستی؛ همراه هوشمند روانت. درمانگر یا روان‌پزشک نیستی.
فارسی محاوره. معمولاً ۲–۴ جمله. همدل باش؛ داستان را کامل برنگردان.
فقط حوزه سلامت روان، احساسات، روابط، استرس، خانواده، دردِدل و مسیر روانت.
ریاضی و موضوعات غیرروانی را حل نکن؛ کوتاه رد کن و برگردان به حال کاربر.
سلام / تو کی هستی: من رو هستم؛ همراه هوشمند روانت. درمانگر نیستم؛ اینجام که بشنوم.
تشخیص/دارو/روش آسیب ممنوع. بحران واضح: ۱۱۵ و ۱۲۳. ایده نرم: همدلی + ۱۱۵/۱۲۳.`;

const sessions = new Map();

function crisis(t) {
  if (/روش\s*خودکشی|می‌خوام\s*بکشم|میخوام\s*بکشم/.test(t)) {
    return "اگر در خطر فوری هستی با اورژانس ۱۱۵ یا اورژانس اجتماعی ۱۲۳ تماس بگیر. تنها نباش.";
  }
  return null;
}
function softCrisis(t) {
  if (/کاش\s*(صبح\s*)?بیدار\s*نمی|نمی‌خوام\s*زند|نمیخوام\s*زند/.test(t)) {
    return "این حس خیلی سنگینه. اگر فشار غیرقابل تحمل است با ۱۱۵ یا ۱۲۳ حرف بزن. اینجام؛ اگر خواستی از همان سنگینی بگو.";
  }
  return null;
}
function offTopic(t) {
  if (/(معادله|ریاضی|حل\s*کن|پایتون|javascript|کد\s*بزن)/i.test(t) &&
      !/(استرس|اضطراب|حالم|غم|تنها|دعوا|خانواده|رابطه)/.test(t)) {
    return "من برای این کار نیستم؛ همراه روانتم. اگر چیزی از حال یا ذهنت فشار می‌آره بگو.";
  }
  return null;
}
function boundary(t) {
  if (/دارو|قرص|دوز/.test(t) && /بخور|تجویز|چی\s*بگیرم/.test(t)) {
    return "من نمی‌تونم درباره دارو نظر بدم. این را با پزشک یا روان‌پزشک مطرح کن.";
  }
  if (/تشخیص\s*بده/.test(t)) {
    return "تشخیص با متخصص است؛ من جاش نیستم.";
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

async function roReply(userText, history) {
  const hard = crisis(userText);
  if (hard) return hard;
  const soft = softCrisis(userText);
  if (soft) return soft;
  const bound = boundary(userText);
  if (bound) return bound;
  const off = offTopic(userText);
  if (off) return off;

  const API_KEY = process.env.RO_LLM_API_KEY || process.env.OPENAI_API_KEY || "";
  let BASE_URL = (process.env.RO_LLM_BASE_URL || "").replace(/\/$/, "");
  const MODEL = process.env.RO_LLM_MODEL || "";
  if (!API_KEY || !BASE_URL || !MODEL) return "تنظیمات مدل ناقص است.";
  if (!/\/v1$/i.test(BASE_URL)) BASE_URL = BASE_URL.replace(/\/+$/, "") + "/v1";

  const messages = (history || []).slice(-10);
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
  if (!r.ok) return `الان نتونستم وصل شم (${r.status}). کمی بعد دوباره بفرست.`;
  let data;
  try { data = JSON.parse(raw); } catch { return "پاسخ مدل قابل خواندن نبود."; }
  return data.choices?.[0]?.message?.content || data.choices?.[0]?.text || "…";
}

async function tgSend(token, chatId, text) {
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: String(text).slice(0, 4000) }),
  });
}

export default async function handler(req, res) {
  if (req.method === "GET") return res.status(200).json({ ok: true, service: "ro-telegram" });
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const token = process.env.TELEGRAM_BOT_TOKEN || "";
  if (!token) return res.status(200).json({ ok: false, error: "TELEGRAM_BOT_TOKEN missing" });

  try {
    const update = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const msg = update.message || update.edited_message;
    if (!msg || !msg.chat) return res.status(200).json({ ok: true, skipped: true });

    const chatId = msg.chat.id;
    const text = String(msg.text || msg.caption || "").trim();
    if (!text) {
      await tgSend(token, chatId, "متن بفرست تا بتونم جواب بدم.");
      return res.status(200).json({ ok: true });
    }

    if (text === "/start" || text.startsWith("/start@")) {
      await tgSend(
        token,
        chatId,
        "سلام، من رو هستم؛ همراه هوشمند روانت.\nدرمانگر یا روان‌پزشک نیستم.\nاینجام که بشنوم. هرچی سنگینه بگو."
      );
      return res.status(200).json({ ok: true });
    }

    const key = String(chatId);
    if (!sessions.has(key)) sessions.set(key, []);
    const history = sessions.get(key);

    const reply = await roReply(text, history);
    history.push({ role: "user", content: text });
    history.push({ role: "assistant", content: reply });
    if (history.length > 20) history.splice(0, history.length - 20);

    await tgSend(token, chatId, reply);
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(200).json({ ok: false, error: String(e.message || e) });
  }
}
