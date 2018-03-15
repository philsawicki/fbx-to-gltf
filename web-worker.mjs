import http from 'http';
import app from './app';


const PORT = process.env.APPLICATION_PORT || 3000;
const HOST = process.env.APPLICATION_HOST || '0.0.0.0';

app.set('port', PORT);


const server = http.createServer(app);
server.listen(PORT, HOST, err => {
    if (err) {
        throw new Error(err);
    } else {
        console.log(`Server listening on port ${PORT}.`);
    }
});
