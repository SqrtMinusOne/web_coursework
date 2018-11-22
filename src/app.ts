import * as express from 'express'
import * as morgan from 'morgan'

const app = express();
const logger = morgan('dev');

app.use(logger);
app.use('/lib', express.static(__dirname + "/lib"));
app.use('/styles', express.static(__dirname + "/styles"));
app.use('/game', express.static(__dirname + "/game"));
app.use('/assets', express.static(__dirname + "/assets"));
app.get('/', (req, res)=>{res.sendFile(__dirname + '/html/index.html')});

app.listen(3000, ()=>{
    console.log('App listening at http://localhost:3000');
});