const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

const port = process.env.PORT || 8080;

const routes = require('./routes');
const securityHeaders = require('./middleware/securityHeaders');

app.use(securityHeaders);
app.use(bodyParser.json({ limit: process.env.JSON_BODY_LIMIT || '100kb' }));
app.use(cookieParser());

app.use((req, res, next) => {
    const allowedOrigins = (process.env.CORS_ORIGIN || '')
        .split(',')
        .map(origin => origin.trim())
        .filter(Boolean);
    const requestOrigin = req.get('Origin');
    const isDevelopment = process.env.NODE_ENV !== 'production';

    if (requestOrigin && allowedOrigins.length > 0 && !allowedOrigins.includes(requestOrigin)) {
        return res.status(403).json({
            error: 'Forbidden',
            message: 'Origin is not allowed'
        });
    }

    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Origin', requestOrigin || (isDevelopment ? '*' : allowedOrigins[0] || ''));
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }

    next();
});

app.use(routes);


const {
    DB_NAME,
    DB_USER,
    DB_PASSWORD,
    DB_HOST
} = process.env

mongoose.connect(`mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}`)
    .then(result => {
        app.listen(port);
    })
    .catch(err => {
        throw new Error(err);
    });
