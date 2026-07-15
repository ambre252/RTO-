import './load-env.js'; // MUST be first — loads .env before Prisma initializes
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import compression from 'compression';
import morgan from 'morgan';
import prisma from './app/db.server.js';

process.stderr.write('[DEBUG app.js] Running diagnostic query at startup...\n');
prisma.session.count()
  .then((count) => {
    process.stderr.write('[DEBUG app.js] Connection check SUCCESS. Session count: ' + count + '\n');
  })
  .catch((err) => {
    process.stderr.write('[DEBUG app.js] Connection check FAILED: ' + err.message + '\n');
  });

import { createRequestHandler } from '@react-router/express';
import * as build from './build/server/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// Enable compression for assets
app.use(compression());
app.disable("x-powered-by");

// Serve static files from Vite build directory
app.use(
  "/assets",
  express.static(path.join(__dirname, "build/client/assets"), { immutable: true, maxAge: "1y" })
);
app.use(express.static(path.join(__dirname, "build/client"), { maxAge: "1h" }));

app.use(morgan("tiny"));

// React Router Request Handler
app.all(
  "*",
  createRequestHandler({
    build,
  })
);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
