import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rpc from './rpc';
import fossil from './fossil';
import { version } from '../package.json';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '4mb' }));
app.use(express.urlencoded({ limit: '4mb', extended: false }));
app.use(cors({ maxAge: 86400 }));
app.use('/', rpc);
app.use('/fossil', fossil);

app.get('/', (req, res) =>
  res.json({
    version,
    port: PORT,
    starknet_address: process.env.STARKNET_ADDRESS || '',
    eth_address: process.env.ETH_ADDRESS || '',
    fossil_address: process.env.ETH_ADDRESS || ''
  })
);

app.listen(PORT, () => console.log(`Listening at http://localhost:${PORT}`));
