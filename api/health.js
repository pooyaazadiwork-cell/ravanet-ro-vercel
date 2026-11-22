export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).json({
    ok: true,
    product: "ravanet-ro",
    llm: Boolean(process.env.RO_LLM_API_KEY || process.env.OPENAI_API_KEY),
    model: process.env.RO_LLM_MODEL || "deepseek-flash",
  });
}
