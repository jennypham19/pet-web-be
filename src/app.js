// src/app.js
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const { StatusCodes } = require('http-status-codes');

const config = require('./config');
const logger = require('./config/logger');
const ApiError = require('./utils/ApiError');
const errorHandler = require('./middlewares/errorHandler');
const apiRoutes = require('./routes');

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger.config');

const { initializeDailyJobs } = require('./jobs/dailyTasks.job.js');
const { initializeTokenCleanupJobs } = require('./jobs/tokenCleanup.job.js');

const app = express();

if(config.env === 'development') {
    app.use(morgan('dev'));
}

app.use(
    helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
    })
);

app.use(cookieParser());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

const allowedOriginss = [];
if(config.env === 'development') {
    allowedOriginss.push(`${process.env.CORS_ORIGIN_FE}`)
}

if(config.corsOriginFe){
    config.corsOriginFe.split(',').forEach(origin => allowedOriginss.push(origin.trim()))
}

const corsOptions = {
    origin: function (origin, callback) {
        if(!origin || allowedOriginss.indexOf(origin) !== -1) {
            callback(null, true)
        }else {
            logger.error(`CORS: Blocked origin - ${origin}. Allowed: ${allowedOrigins.join(', ')}`);
            callback(new Error('Not allowed by CORS'))
        }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'timezone'],
    credentials: true,
    optionsSuccessStatus: 200
}

app.use(cors(corsOptions));

if(config.env === 'development') {
    app.use(morgan('dev'))
}

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api', apiRoutes);

if (process.env.NODE_ENV !== 'test') {
  try {
    Promise.all([ 
        initializeDailyJobs(),
        initializeTokenCleanupJobs()
    ]).then(() => {
        logger.info('All cron jobs initialization process started.');
    }).catch(error => {
        logger.error('Failed during cron jobs initialization:', error);
    });
  } catch (error) {
    logger.error('Synchronous error initializing cron jobs:', error);
  }
}

app.use((req, res, next) => {
    next(new ApiError(StatusCodes.NOT_FOUND, "API Route Not Found"))
})

app.use(errorHandler);

module.exports = app;