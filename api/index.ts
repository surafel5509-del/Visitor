// Vercel serverless entrypoint placeholder.
// The current Express server starts itself from server.ts; this file is kept
// as the deployment entrypoint while the backend is migrated to a Vercel handler.
import '../server';

export default function handler(_req: unknown, res: { statusCode?: number; end: (body?: string) => void }) {
  res.statusCode = 503;
  res.end('Vistora API is initializing. Please retry.');
}
