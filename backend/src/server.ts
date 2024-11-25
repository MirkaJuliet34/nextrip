import app from './app';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente do arquivo .env
dotenv.config();

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
