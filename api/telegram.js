const SYSTEM = `تو «رو» هستی؛ همراه هوشمند روانت. درمانگر یا روان‌پزشک نیستی.

برند: روانت | فارسی محاوره | معمولاً ۲–۴ جمله | گاهی کمی بیشتر اگر لازم است.
همدل و حاضر. داستان را کلمه به کلمه برنگردان. جواب یک‌کلمه‌ای سرد نده.
هر پیام الزاماً سؤال نپرس؛ گاهی فقط حضور کافی است.

حوزه فقط: سلامت روان، احساس، رابطه، استرس، خانواده، دردِدل، مسیر روانت.
خارج از حوزه: حل نکن؛ کوتاه رد کن.

معرفی فقط اول گفتگو یا «تو کی هستی».
پیوستگی: ریست ممنوع مگر /start. lets go / بزن بریم / ادامه = ادامه نخ.
مسیر: شنیدن احساس → الگو → گام نرم. دارو و تشخیص نه.
ایمنی: بحران → ۱۱۵ و ۱۲۳.`;

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
  if (/(معادله|ریاضی|حل\s*کن|پایتون|javascript|کد\s*بزن|تکلیف|املا)/i.test(t) &&
      !/(استرس|اضطراب|حالم|غم|تنها|دعوا|خانواده|رابطه)/.test(t)) {
    return "من برای این کار نیستم؛ همراه روانتم. اگر چیزی از حال یا ذهنت فشار می‌آره بگو.";
  }
  return null;
}
function boundary(t) {
  if (/دارو|قرص|دوز/.test(t) && /بخور|تجویز|چی\s*بگیرم/.test(t)) {
    return "من نمی‌تونم درباره دارو نظر بدم. این را با پزشک یا روان‌پزشک مطرح کن.";
  }
  if (/تشخیص\s*بده/.test(t)) return "تشخیص با متخصص است؛ من جاش نیستم.";
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
function inferPersonHints(history) {
  const userBits = (history || []).filter((m) => m && m.role === "user").map((m) => String(m.content || "")).slice(-8);
  const blob = userBits.join(" ");
  const traits = [];
  if (/تنها|تنهایی/.test(blob)) traits.push("تم: تنهایی");
  if (/مادر|خانواده|پدر|مادرشوهر/.test(blob)) traits.push("تم: خانواده");
  if (/کار|رئیس|همکار/.test(blob)) traits.push("تم: کار");
  if (/رابطه|همسر|شوهر|دوست/.test(blob)) traits.push("تم: رابطه");
  if (/استرس|اضطراب|نگران/.test(blob)) traits.push("احساس: استرس");
  if (/غم|حالم\s*بد/.test(blob)) traits.push("احساس: غم");
  if (!traits.length) return "";
  return "نشانه‌های شخص از گفتگوی اخیر: " + traits.join(" | ");
}
function buildMessages(userText, history) {
  const prev = (history || []).slice(-12);
  const msgs = [{ role: "system", content: SYSTEM }];
  if (prev.length > 0) {
    msgs.push({ role: "system", content: "ادامه گفتگو. ریست و معرفی دوباره ممنوع. lets go / بزن بریم = ادامه." });
    const person = inferPersonHints(prev);
    if (person) msgs.push({ role: "system", content: person });
  }
  msgs.push(...prev);
  msgs.push({ role: "user", content: userText });
  return msgs;
}
async function roReply(userText, history) {
  const hard = crisis(userText); if (hard) return hard;
  const soft = softCrisis(userText); if (soft) return soft;
  const bound = boundary(userText); if (bound) return bound;
  const off = offTopic(userText); if (off) return off;
  const API_KEY = process.env.RO_LLM_API_KEY || process.env.OPENAI_API_KEY || "";
  let BASE_URL = (process.env.RO_LLM_BASE_URL || "").replace(/\/$/, "");
  const MODEL = process.env.RO_LLM_MODEL || "";
  if (!API_KEY || !BASE_URL || !MODEL) return "تنظیمات مدل ناقص است.";
  if (!/\/v1$/i.test(BASE_URL)) BASE_URL = BASE_URL.replace(/\/+$/, "") + "/v1";
  const messages = buildMessages(userText, history);
  const r = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: authHeader(API_KEY) },
    body: JSON.stringify({ model: MODEL, temperature: 0.7, max_tokens: 600, messages }),
  });
  const raw = await r.text();
  if (!r.ok) return `الان نتونستم وصل شم (${r.status}). کمی بعد دوباره بفرست.`;
  try {
    const data = JSON.parse(raw);
    return data.choices?.[0]?.message?.content || data.choices?.[0]?.text || "…";
  } catch { return "پاسخ مدل قابل خواندن نبود."; }
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
    if (!text) { await tgSend(token, chatId, "متن بفرست تا بتونم جواب بدم."); return res.status(200).json({ ok: true }); }
    const key = String(chatId);
    if (text === "/start" || text.startsWith("/start@")) {
      sessions.set(key, []);
      await tgSend(token, chatId, "سلام، من رو هستم؛ همراه هوشمند روانت.\nدرمانگر یا روان‌پزشک نیستم.\nاینجام که بشنوم. هرچی سنگینه بگو.");
      return res.status(200).json({ ok: true });
    }
    if (!sessions.has(key)) sessions.set(key, []);
    const history = sessions.get(key);
    const reply = await roReply(text, history);
    history.push({ role: "user", content: text });
    history.push({ role: "assistant", content: reply });
    if (history.length > 24) history.splice(0, history.length - 24);
    await tgSend(token, chatId, reply);
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(200).json({ ok: false, error: String(e.message || e) });
  }
}
