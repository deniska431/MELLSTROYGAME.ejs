const express = require('express');
const path = require('path');
const session = require('express-session');
const { User, Request, Service, initModels } = require('./public/models/index');

// Express
const app = express();

//Модели
initModels();

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 1 день
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware 
app.use((req, res, next) => {
    res.locals.userId = req.session.userId ? req.session.userId : null;
    Service.findAll().then(services => {
        res.locals.services = services;
        next();
    }).catch(err => {
        console.log(err);
        next();
    });
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Маршруты
const indexRouter = require('./routes/index');
const prizeRouter = require('./routes/prize');

// APP

app.use('/', indexRouter);
app.use('/prize', prizeRouter);

// Ошибки
app.use((err, req, res, next) => {
    const environment = req.app.get('env');
    res.locals.message = err.message;
    res.locals.error = environment === 'development' ? err : {};
    if (environment === 'development') {
        return res.status(err.status || 500).send("An error occurred: " + err.message);
    } else {
        return res.status(err.status || 500).send("Internal Server Error");
    }
});

app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ error: 'Invalid JSON' });
    }
    next();
});


module.exports = app;