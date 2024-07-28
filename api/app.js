import express, { json, urlencoded } from 'express';
import cors from 'cors';

import { transports as _transports, format as _format, addColors } from 'winston';
import { logger, errorLogger } from 'express-winston';

import routes from './routes.js';

const app = express();

const corsOrigin = process.env.APP_ORIGIN || '*';

app.use(cors({ origin: corsOrigin }));

app.use(json());
app.use(urlencoded({ extended: true }));

// request logging
app.use(logger({
  transports: [
    new _transports.Console(),
  ],
  format: _format.combine(
    _format.colorize(),
    _format.simple(),
  ),
  meta: true,
  msg: 'HTTP {{req.method}} {{req.url}}',
  expressFormat: true,
  colorize: false,
  ignoreRoute(req, res) { return false; },
}));

app.get('/', (req, res) => {
  res.json({ message: 'Classical chess coach API' });
});

routes(app);

// error logging
app.use(errorLogger({
  transports: [
    new _transports.Console(),
  ],
  format: _format.combine(
    _format.colorize(),
    _format.json(),
  ),
}));

// json formatting
app.set('json spaces', 2);

export default app;
