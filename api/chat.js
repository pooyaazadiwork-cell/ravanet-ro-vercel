const SYSTEM = `تو «رو» هستی؛ همراه هوشمند روانت. درمانگر یا روان‌پزشک نیستی.

برند: روانت | فارسی محاوره | معمولاً ۲–۴ جمله | گاهی کمی بیشتر اگر لازم است.
همدل و حاضر. داستان را کلمه به کلمه برنگردان. جواب یک‌کلمه‌ای سرد نده.
هر پیام الزاماً سؤال نپرس؛ گاهی فقط حضور کافی است.

حوزه فقط: سلامت روان، احساس، رابطه، استرس، خانواده، دردِدل، مسیر روانت.
خارج از حوزه (ریاضی، تکلیف، کد، ترجمه درسی، اخبار، املا، پایتخت): حل نکن؛ کوتاه رد کن و برگردان به حال.

معرفی فقط اول گفتگو یا وقتی صریح پرسید تو کی هستی:
«من رو هستم؛ همراه هوشمند روانت. درمانگر نیستم؛ اینجام که بشنوم.»

پیوستگی:
- با history موجود ریست و معرفی دوباره ممنوع.
- lets go / لتس گو / بزن بریم / ادامه = ادامه همان نخ.
- ریست فقط با /start یا «گفتگوی تازه».

مسیر گفتگو (شناختی-همراه، نه درمان رسمی):
1) شنیدن و نام‌گذاری احساس 2) روشن کردن الگو/موقعیت 3) در صورت آمادگی یک گام کوچک یا جمع‌بندی نرم.
عجل برای نصیحت نکن. تشخیص نده. دارو نده.

اگر خلاصه شخص (person) در پیام سیستم آمده، لحن و موضوع را با آن هماهنگ کن؛ ادعا نکن «همه‌چیز را برای همیشه حفظ کردم» مگر رضایت صریح حافظه باشد.

ایمنی: روش آسیب نه. بحران واضح → ۱۱۵ و ۱۲۳. ایده نرم → همدلی + ۱۱۵/۱۲۳ در فشار زیاد.`;

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
  if (/(معادله|ریاضی|حل\s*کن|کد\s*بزن|پایتون|ترجمه\s*کن|javascript|املای|املا\s|تاریخ\s*چند|پایتخت|تکلیف|مشق)/i.test(t) &&
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

function qualityNote(reply, hasHistory) {
  if (!reply) return "empty";
  if (hasHistory && /من رو هستم|همراه هوشمند روانت/.test(reply) && /سلام/.test(reply)) return "reintro";
  return "ok";
}

function inferPersonHints(history) {
  const userBits = (history || [])
    .filter((m) => m && (m.role === "user"))
    .map((m) => String(m.content || m.text || ""))
    .slice(-8);
  const blob = userBits.join(" ");
  const traits = [];
  if (/تنها|تنهایی|کسی\s*نمی/.test(blob)) traits.push("تم: تنهایی/ندیده شدن");
  if (/مادر|مادرشوهر|خانواده|پدر/.test(blob)) traits.push("تم: خانواده");
  if (/کار|رئیس|همکار|اداره/.test(blob)) traits.push("تم: کار");
  if (/رابطه|دوست\s*پسر|دوست\s*دختر|همسر|شوهر|نامزد/.test(blob)) traits.push("تم: رابطه");
  if (/عصبی|عصب|خشم|فحش|کیر/.test(blob)) traits.push("لحن: ممکن است تند/خسته باشد — آرام بمان");
  if (/استرس|اضطراب|نگران/.test(blob)) traits.push("احساس غالب: استرس/نگرانی");
  if (/غم|گریه|حالم\s*بد|بدم/.test(blob)) traits.push("احساس غالب: غم/فرسودگی");
  if (!traits.length) return "";
  return "نشانه‌های شخص از گفتگوی اخیر (فرضی، نه تشخیص): " + traits.join(" | ");
}

function buildMessages(userText, history) {
  const prev = (history || [])
    .filter((m) => m && (m.role === "user" || m.role === "assistant" || m.role === "ro"))
    .slice(-12)
    .map((m) => ({
      role: m.role === "ro" ? "assistant" : m.role,
      content: String(m.content || m.text || ""),
    }));
  const msgs = [{ role: "system", content: SYSTEM }];
  if (prev.length > 0) {
    msgs.push({
      role: "system",
      content:
        "ادامه گفتگوی قبلی. ریست و معرفی دوباره ممنوع. lets go / بزن بریم / ادامه = ادامه همان نخ. به احساس و موضوع قبلی وصل بمان.",
    });
    const person = inferPersonHints(prev);
    if (person) msgs.push({ role: "system", content: person });
  }
  msgs.push(...prev);
  msgs.push({ role: "user", content: userText });
  return msgs;
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

    const messages = buildMessages(userText, history);
    const r = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: authHeader(API_KEY) },
      body: JSON.stringify({ model: MODEL, temperature: 0.7, max_tokens: 600, messages }),
    });
    const raw = await r.text();
    if (!r.ok) return res.status(200).json({ reply: `خطای مدل (${r.status}): ${raw.slice(0, 280)}`, error: "llm_error" });
    const data = JSON.parse(raw);
    let reply = data.choices?.[0]?.message?.content || data.choices?.[0]?.text || "پاسخ خالی.";
    const q = qualityNote(reply, history.length > 0);
    return res.status(200).json({ reply, mode: "presence", source: "llm", model: MODEL, quality: q });
  } catch (e) {
    return res.status(200).json({ reply: "خطای سرور: " + String(e.message || e) });
  }
}
