require('dotenv').config();


const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const sequelize = require('./db');
const router = require('./router/index');
const { User } = require('./models/user-model');
const { Token } = require('./models/token-model');
const errorMiddleware = require('./middlewares/error-middleware');
const userController = require('./controllers/user-controller');
const main = require('./service/ya-service')

const PORT = process.env.PORT;
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL
}));
app.use('/api', router);
app.use(errorMiddleware)



const start = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync({ alter: true });
        app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
    } catch (e) {
        console.log(e);
    }
};

start();
