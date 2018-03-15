import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import kue from 'kue';
import restAPI from './routes/api';
import webAPI from './routes/web';
import healthcheckAPI from './routes/healthcheck';


const app = express();

// Register middlewares:
app.use(helmet());
app.use(express.static(path.join(path.resolve('.'), 'views')));
app.use(express.static(path.join(path.resolve('.'), 'projects'))); /** @todo: Expose data somewhere else */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configure application:
kue.app.set('title', 'Job queue');
kue.app.disable('x-powered-by');
app.set('view engine', 'ejs');

// Register routes:
app.use('/', webAPI);
app.use('/api', restAPI);
app.use('/queue', kue.app);
app.use('/healthcheck', healthcheckAPI);

// Catch 404 Errors and forward them to the error handler:
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});


// Error Handlers:

// Development Error Handler. Will print Stack Trace:
if (app.get('env') === 'development') {
    app.use((err, req, res, next) => {
        res
            .status(err.status || 500)
            .json({
                message: err.message,
                error: err
            });
    });
} else {
    // Production Error Handler. No Stack Trace leaked to User:
    app.use((err, req, res, next) => {
        res
            .status(err.status || 500)
            .json({
                message: err.message,
                error: {}
            });
    });
}


export default app;
