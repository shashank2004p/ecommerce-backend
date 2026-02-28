/**
 * Entry point: connect DB, then start HTTP server.
 * Binds to 0.0.0.0 so the server is reachable in containers/cloud.
 */
import { connectDB } from './config/db.js';
import config from './config/index.js';
import app from './app.js';

await connectDB();

const host = config.env === 'production' ? '0.0.0.0' : undefined;
app.listen(config.port, host, () => {
  if (config.env !== 'test') {
    console.log(`Server running on port ${config.port} (${config.env})`);
  }
});
