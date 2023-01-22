require('express-async-errors');
const express = require('express');
const morgan = require('morgan');
const { errorHandling } = require('./middlewares/error');
require('dotenv').config();
require('./db');
const cors = require('cors');
const { handleNotFound } = require('./utils/helper');
const userRouter = require('./routes/user');
const actorRouter = require('./routes/actor');
const movieRouter = require("./routes/movie")

const app = express();
app.use(cors())

// USE EXPRESS
app.use(express.json());
// USE MORGAN
app.use(morgan('dev'));
// USE THE USER RAUTER
app.use('/api/user',userRouter);
app.use('/api/actor',actorRouter);
app.use('/api/movie', movieRouter);

app.use("/test", (req, res)=>{
    res.json({
        message: "Hello World!!"
    });
})

app.use("/*", handleNotFound);
// MANAGE ERRORS
app.use(errorHandling)


// SERVER
app.listen(8000, ()=>{
    console.log("the port is listening on port 8000")
})