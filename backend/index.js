const path = require('path');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const AuthRouter = require('./Routes/AuthRouter');
const GetEmails = require('./Routes/GetEmails');
const verifyEmail = require('./Routes/VerifyEmail');

require('dotenv').config();
require('./Models/db');
const PORT = process.env.PORT || 8000;

app.get('/ping',(req,res)=>{
  res.send('PONG');
})
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(cors());
app.use('/auth',AuthRouter);
app.use('/get-emails', GetEmails);

const router = express.Router();
router.get('/verify-email', verifyEmail);
app.use(router);

app.listen(PORT,()=>{
  console.log('Server started');
})