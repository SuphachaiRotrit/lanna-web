import type { IncomingMessage, ServerResponse } from 'http';
import { createApp } from '../src/bootstrap';

let server: (req: IncomingMessage, res: ServerResponse) => void;

async function getServer() {
  if (!server) {
    const app = await createApp();
    await app.init();
    server = app.getHttpAdapter().getInstance();
  }
  return server;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const expressApp = await getServer();
  expressApp(req, res);
}
