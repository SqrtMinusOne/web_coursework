import * as express from 'express'
import * as morgan from 'morgan'
import * as path from "path";

const app = express();
const logger = morgan('dev');

app.use(logger);
app.use('/assets', express.static(__dirname + "/assets"));
app.use(express.static(path.join(__dirname)));
app.get('/', (req, res)=>{res.sendFile(__dirname + '/html/index.html')});

app.listen(3000, ()=>{
    console.log('App listening at http://localhost:3000');
});