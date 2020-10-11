'use stritc';

var app = require('express')(),
    http = require('http').createServer(app),
    io = require('socket.io')(http),
    port = process.env.PORT || 3000,
    publicDir = `${__dirname}/public`

http.listen(port, () => {
    console.log('Inicia express y socket.IO en localhosto:%d',port);
});

app.get('/', (req,res) => {
    res.sendFile(`${publicDir}/client.html`)
});

app.get('/streaming', (req,res) => {
    res.sendFile(`${publicDir}/server.html`)
});

io.on('connection', (socket) =>{
    console.log('socket%d',socket);
});