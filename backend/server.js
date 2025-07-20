import express from 'express';
import cors from 'cors';
import router from './routes/router.js'
import DBConnection from './database.js';
import dotenv from 'dotenv';

dotenv.config();
const port = process.env.PORT
const app = express();

DBConnection();
app.use("/api", router);
app.use(cors());
app.use(express.json());

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
