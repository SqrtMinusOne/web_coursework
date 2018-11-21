import * as express from 'express'

const app = express();
app.use('/lib', express.static(__dirname + "/lib"));
app.use('/styles', express.static(__dirname + "/styles"));
app.use('/game', express.static(__dirname + "/game"));
app.get('/', (req, res)=>{res.sendFile(__dirname + '/html/index.html')});

app.listen(3000, ()=>{
    console.log('App listening at http://localhost:3000');
});