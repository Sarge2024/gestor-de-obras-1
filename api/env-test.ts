export default function handler(req, res) {
  res.json({
    env: process.env.NODE_ENV,
    vercel: process.env.VERCEL
  });
}
