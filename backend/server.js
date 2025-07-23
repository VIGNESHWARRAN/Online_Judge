import express from 'express';
import cors from 'cors';
import router from './routes/router.js'
import DBConnection from './database.js';
import dotenv from 'dotenv';

dotenv.config();
const port = process.env.PORT
const app = express();
app.use(cors());
app.use(express.json());

DBConnection();
app.use("/api", router);



app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
