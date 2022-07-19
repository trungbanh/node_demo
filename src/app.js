const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const path = require('path');
const compression = require('compression');

const tourRoutes = require('./routers/tourRouter');
const authRouter = require('./routers/authRouter');
const userRouter = require('./routers/userRouter');
const errorController = require('./controllers/errorController');

const AppError = require('./utils/AppError');

const app = express();

app.use(compression());

app.use(
  '/js',
  express.static(path.join(__dirname, '../node_modules/bootstrap/dist/js'))
);
app.use(
  '/js',
  express.static(path.join(__dirname, '../node_modules/jquery/dist'))
);

app.use('/static', express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'rate limit 100 requests per second',
});

app.get('/', (_req, res) => {
  const tour = 'Tour';
  return res.status(200).render('home', { tour });
});

app.use('/api', limiter);

app.use(express.json());
app.use(mongoSanitize());
app.use(xss());
app.use(helmet());

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.use((req, res, next) => {
  res.timeRequest = new Date().toISOString();
  next();
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/tours', tourRoutes);
// app.use('/api/v1/reviews', reviewRouter);

// alway in the bottom
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 400));
});

// handler error function
app.use(errorController);

module.exports = app;
