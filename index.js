const express = require('express');
const path = require('path');
const mainApp = express();
const getExpressApp1 = require('./apps/app1/get-express-app');
const getExpressApp2 = require('./apps/app2/get-express-app');
const getExpressApp3 = require('./apps/passport/get-express-app');

/*
    Modena should expose the following functions:
        1) Get all the existing express apps in the target folder ('./apps' by default)
        2) Given a set of apps, a resolver to determine which app is being accessed
        3) A function to set a default app (which will modify the resolveFunction value)
        4) A function to enable HTTPS (given the corresponding parameters)
        5) TODO Passport, body-parser, etc.
*/

let accessedApp;
const resolverFunction = (req, res, next) => {
    if (req.url === '/') {
        accessedApp = 'mainApp';
    }
    else if (req.url.startsWith('/app-1')) {
        accessedApp = 'app1';
    }
    else if (req.url.startsWith('/app-2')) {
        accessedApp = 'app2';
    }
    else if (req.url.startsWith('/passport')) {
        accessedApp = 'passport';
    }
    else {
        accessedApp = undefined;
    }
    console.log('Accessing', accessedApp);
    next();
};
mainApp.use(resolverFunction);

const appsPath = path.join(__dirname, 'apps');
const renderIsolator = (req, res, next) => {
    const renderFunction = res.render.bind(res);
    res.render = (viewName, options) => {
        const viewPath = path.resolve(appsPath, accessedApp, 'views', viewName);
        renderFunction(viewPath, options);
    }
    next();
};
mainApp.use(renderIsolator);

mainApp.use(/^\/$/, (req, res, next) => res.send('Main app'));

mainApp.use('/app-1', getExpressApp1());
mainApp.use('/app-2', getExpressApp2());
mainApp.use('/passport', getExpressApp3());

mainApp.listen(3000, error => {
    if (error) {
        console.log(error);
    }
    else {
        console.log('Yuhu');
    }
});