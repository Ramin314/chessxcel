import app from './app.js';
import { sequelize } from './models.js';

const PORT = process.env.PORT || 8080;

sequelize.sync().then(() => {
  console.log('Synced db');
}).catch((err) => {
  console.log('Failed to sync db: ', err.message);
}).then(() => {
  app.listen(PORT, console.log(`Server is running on port ${PORT}`));
})
  .catch((err) => {
    console.log(err);
  });
