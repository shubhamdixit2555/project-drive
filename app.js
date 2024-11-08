const express = require('express');
const userRouter = require('./routes/user.routes');
const indexRouter = require('./routes/index.routes');
const dotenv = require('dotenv');
const connectToDB = require('./config/db');
const cookieParser = require('cookie-parser');

// Load environment variables before connecting to the database
dotenv.config();
connectToDB();

const app = express();

app.set('view engine', 'ejs');
app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', indexRouter)
app.use('/user', userRouter);

app.listen(3000, '0.0.0.0', () => {
    console.log('Server is running on port 3000');
});