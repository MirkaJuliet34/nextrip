import express from 'express';
import cors from 'cors';
import rideRoutes from './routes/rideRoutes';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/ride', rideRoutes);

export default app;
