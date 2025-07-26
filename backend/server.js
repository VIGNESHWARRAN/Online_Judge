import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routes/router.js';
import DBConnection from './database.js';

dotenv.config();

const port = process.env.PORT;
const app = express();

// CORS setup with credentials support
app.use(cors({
  origin: 'http://localhost:5173', // frontend origin
  credentials: true
}));

app.use(express.json());


DBConnection();
app.use("/api", router);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
