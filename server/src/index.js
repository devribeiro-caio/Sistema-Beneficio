import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDatabase } from './config/database.js';
import routes from './routes/benefitsRoutes.js';

const app = express();
const port = Number(process.env.PORT || 4317);
app.use(cors({ origin: (origin, callback) => {
  if (!origin || origin === 'null' || origin === 'http://127.0.0.1:5173') callback(null, true);
  else callback(new Error('Origem não permitida.'));
} }));
app.use(express.json({ limit: '1mb' }));
app.use('/api', routes);
app.use((error, _req, res, _next) => {
  console.error(error);
  if (error.code === 11000) return res.status(409).json({ message: 'Já existe um registro com esses dados.' });
  if (error.name === 'ValidationError' || error.name === 'CastError') return res.status(400).json({ message: error.message });
  res.status(500).json({ message: 'Não foi possível concluir a operação.' });
});

connectDatabase().then(() => app.listen(port, '127.0.0.1', () => console.log(`API pronta em http://127.0.0.1:${port}/api`))).catch((error) => {
  console.error(`Falha ao conectar ao MongoDB: ${error.message}`);
  process.exit(1);
});
