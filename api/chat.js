const SYSTEM = `تو «رو» هستی؛ همراه هوشمند روانت. درمانگر یا روان‌پزشک نیستی.
فارسی محاوره. معمولاً ۲–۴ جمله. همدل باش؛ داستان را کامل برنگردان؛ جواب یک‌کلمه‌ای سرد نده.
فقط حوزه سلامت روان، احساسات، روابط، استرس، خانواده، دردِدل و مسیر روانت.
ریاضی، تکلیف، کد، اخبار و موضوعات غیرروانی را حل نکن؛ کوتاه بگو کار تو نیست و برگردان به حال کاربر.
وقتی سلام یا «تو کی هستی»: «من رو هستم؛ همراه هوشمند روانت. درمانگر نیستم؛ اینجام که بشنوم.»
تشخیص/دارو/روش آسیب ممنوع. بحران واضح: ۱۱۵ و ۱۲۳. ایده نرم مثل کاش بیدار نمی‌شدم: همدلی + یادآوری ۱۱۵/۱۲۳ در صورت فشار زیاد.`;

function crisis(t) {
  if (/\u0631\u0648\u0634\s*\u062e\u0648\u062f\u06a9\u0634\u06cc|\u0686\u0637\u0648\u0631\s*\u062e\u0648\u062f\u0645\s*\u0631\u0627\s*\u0628\u06a9\u0634\u0645|\u0645\u06cc\u200c\u062e\u0648\u0627\u0645\s*\u0628\u06a9\u0634\u0645|\u0645\u06cc\u062e\u0648\u0627\u0645\s*\u0628\u06a9\u0634\u0645/.test(t)) {
    return "\u0627\u06af\u0631 \u062f\u0631 \u062e\u0637\u0631 \u0641\u0648\u0631\u06cc \u0647\u0633\u062a\u06cc \u0628\u0627 \u0627\u0648\u0631\u0698\u0627\u0646\u0633 \u06f1\u06f1\u06f5 \u06cc\u0627 \u0627\u0648\u0631\u0698\u0627\u0646\u0633 \u0627\u062c\u062a\u0645\u0627\u0639\u06cc \u06f1\u06f2\u06f3 \u062a\u0645\u0627\u0633 \u0628\u06af\u06cc\u0631. \u062a\u0646\u0647\u0627 \u0646\u0628\u0627\u0634.";
  }
  return null;
}
function softCrisis(t) {
  if (/\u06a9\u0627\u0634\s*(\u0635\u0628\u062d\s*)?\u0628\u06cc\u062f\u0627\u0631\s*\u0646\u0645\u06cc|\u0646\u0645\u06cc\u200c\u062e\u0648\u0627\u0645\s*\u0632\u0646\u062f|\u0646\u0645\u06cc\u062e\u0648\u0627\u0645\s*\u0632\u0646\u062f|\u0627\u06cc\s*\u06a9\u0627\u0634\s*\u0645\u0631\u062f\u0647/.test(t)) {
    return "\u0627\u06cc\u0646 \u062d\u0633 \u062e\u06cc\u0644\u06cc \u0633\u0646\u06af\u06cc\u0646\u0647. \u0627\u06af\u0631 \u0641\u0634\u0627\u0631 \u0628\u0631\u0627\u06cc\u062a \u063a\u06cc\u0631\u0642\u0627\u0628\u0644 \u062a\u062d\u0645\u0644 \u0627\u0633\u062a\u060c \u0628\u0627 \u06f1\u06f1\u06f5 \u06cc\u0627 \u06f1\u06f2\u06f3 \u062d\u0631\u0641 \u0628\u0632\u0646. \u0627\u06cc\u0646\u062c\u0627\u0645\u061b \u0627\u06af\u0631 \u062e\u0648\u0627\u0633\u062a\u06cc \u0627\u0632 \u0647\u0645\u0627\u0646 \u0633\u0646\u06af\u06cc\u0646\u06cc \u0628\u06af\u0648 \u2014 \u0628\u062f\u0648\u0646 \u062c\u0632\u0626\u06cc\u0627\u062a \u0622\u0633\u06cc\u0628.";
  }
  return null;
}
function offTopic(t) {
  if (/(\u0645\u0639\u0627\u062f\u0644\u0647|\u0631\u06cc\u0627\u0636\u06cc|\u062d\u0644\s*\u06a9\u0646|\u06a9\u062f\s*\u0628\u0632\u0646|\u067e\u0627\u06cc\u062a\u0648\u0646|\u062a\u0631\u062c\u0645\u0647\s*\u06a9\u0646|javascript|\u0627\u0645\u0644\u0627\u06cc|\u062a\u0627\u0631\u06cc\u062e\s*\u0686\u0646\u062f|\u067e\u0627\u06cc\u062a\u062e\u062a)/i.test(t) &&
      !/(\u0627\u0633\u062a\u0631\u0633|\u0627\u0636\u0637\u0631\u0627\u0628|\u062d\u0627\u0644\u0645|\u063a\u0645|\u062a\u0646\u0647\u0627|\u062f\u0639\u0648\u0627|\u062e\u0627\u0646\u0648\u0627\u062f\u0647|\u0631\u0627\u0628\u0637\u0647)/.test(t)) {
    return "\u0645\u0646 \u0628\u0631\u0627\u06cc \u0627\u06cc\u0646 \u06a9\u0627\u0631 \u0646\u06cc\u0633\u062a\u0645\u061b \u0647\u0645\u0631\u0627\u0647 \u0631\u0648\u0627\u0646\u062a\u0645. \u0627\u06af\u0631 \u0686\u06cc\u0632\u06cc \u0627\u0632 \u062d\u0627\u0644 \u06cc\u0627 \u0630\u0647\u0646\u062a \u0641\u0634\u0627\u0631 \u0645\u06cc\u200c\u0622\u0631\u0647 \u0628\u06af\u0648.";
  }
  return null;
}
function boundary(t) {
  if (/\u062f\u0627\u0631\u0648|\u0642\u0631\u0635|\u062f\u0648\u0632/.test(t) && /\u0628\u062e\u0648\u0631|\u062a\u062c\u0648\u06cc\u0632|\u0686\u06cc\s*\u0628\u06af\u06cc\u0631\u0645/.test(t)) {
    return "\u0645\u0646 \u0646\u0645\u06cc\u200c\u062a\u0648\u0646\u0645 \u062f\u0631\u0628\u0627\u0631\u0647 \u062f\u0627\u0631\u0648 \u0646\u0638\u0631 \u0628\u062f\u0645. \u0627\u06cc\u0646 \u0631\u0627 \u0628\u0627 \u067e\u0632\u0634\u06a9 \u06cc\u0627 \u0631\u0648\u0627\u0646\u200c\u067e\u0632\u0634\u06a9 \u0645\u0637\u0631\u062d \u06a9\u0646.";
  }
  if (/\u062a\u0634\u062e\u06cc\u0635\s*\u0628\u062f\u0647|\u0627\u0641\u0633\u0631\u062f\u06af\u06cc\s*\u062f\u0627\u0631\u0645\?/.test(t)) {
    return "\u062a\u0634\u062e\u06cc\u0635 \u0628\u0627 \u0645\u062a\u062e\u0635\u0635 \u0627\u0633\u062a\u061b \u0645\u0646 \u062c\u0627\u0634 \u0646\u06cc\u0633\u062a\u0645. \u0627\u06af\u0631 \u062e\u0648\u0627\u0633\u062a\u06cc \u0627\u0632 \u062d\u0627\u0644\u200c\u062a \u0628\u06af\u0648.";
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
    if (!userText) return res.status(400).json({ error: "message required", reply: "\u067e\u06cc\u0627\u0645 \u062e\u0627\u0644\u06cc \u0628\u0648\u062f." });

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
      return res.status(200).json({
        reply: "\u062a\u0646\u0638\u06cc\u0645\u0627\u062a \u0645\u062f\u0644 \u0646\u0627\u0642\u0635 \u0627\u0633\u062a.",
        mode: "presence",
        source: "local",
      });
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
      return res.status(200).json({ reply: `\u062e\u0637\u0627\u06cc \u0645\u062f\u0644 (${r.status}): ${raw.slice(0, 280)}`, error: "llm_error" });
    }
    const data = JSON.parse(raw);
    const reply =
      data.choices?.[0]?.message?.content ||
      data.choices?.[0]?.text ||
      "\u067e\u0627\u0633\u062e \u062e\u0627\u0644\u06cc.";
    return res.status(200).json({ reply, mode: "presence", source: "llm", model: MODEL });
  } catch (e) {
    return res.status(200).json({ reply: "\u062e\u0637\u0627\u06cc \u0633\u0631\u0648\u0631: " + String(e.message || e) });
  }
}
