import handler from './server.ts';
process.env.VERCEL = "1";
process.env.NODE_ENV = "production";
async function run() {
  try {
    const req = { url: '/api/health', method: 'GET', headers: {} };
    const res = { json: console.log, status: (c) => res };
    await handler(req, res);
  } catch (err) {
    console.error("CRASH:", err);
  }
}
run();
