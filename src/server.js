const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err, origin) => {
  console.error('Unhandled Rejection at:', err, 'reason:', origin);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const database = process.env.DATABASE.replace(
  '<DB_PASSWORD>',
  process.env.DB_PASSWORD
);

mongoose.connect(database).then(() => {
  console.log('connection success ≥_≤');
});

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`server run on port ${port}`);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  server.close(() => {
    process.exit(1);
  });
  // Application specific logging, throwing an error, or other logic here
});
