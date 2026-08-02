import handler from '../server';

export default async function safeHandler(req, res) {
  try {
    return await handler(req, res);
  } catch (err) {
    console.error("VERCEL CRASH ERROR:", err);
    res.status(500).json({ 
      error: "VERCEL CRASH ERROR", 
      message: err.message, 
      stack: err.stack 
    });
  }
}
