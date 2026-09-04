const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const { cookieSecret, isProduction } = require('../app-config');

module.exports = (app) => {
    app.use(express.json());

    app.use(cookieParser(cookieSecret));

    app.disable('x-powered-by');
    app.use((req, res, next) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('Referrer-Policy', 'no-referrer');
        if (isProduction) {
            res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }
        next();
    });

    app.use(express.static(path.resolve(__basedir, 'static')));

    // app.use(errorHandler(err, req, res, next));
};
