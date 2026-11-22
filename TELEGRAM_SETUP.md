# رو روی تلگرام — ۳ قدم

## ۱) ساخت ربات
1. در تلگرام به @BotFather پیام بده
2. دستور /newbot
3. یک نام و یک یوزرنیم (آخرش bot) بگذار
4. توکن را کپی کن (مثل 123456:ABC...)

## ۲) Vercel
Environment Variable:
- TELEGRAM_BOT_TOKEN = همان توکن BotFather

(همان RO_LLM_* های قبلی سر جایشان بمانند)

Redeploy بزن.

## ۳) وصل Webhook
در مرورگر (توکن و دامنه خودت را بگذار):

https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<VERCEL_DOMAIN>/api/telegram

باید {"ok":true} ببینی.

بعد در تلگرام به رباتت /start بزن و حرف بزن.
