const express = require('express')
const app = express()
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);

app.use(express.static(__dirname + '/Website'));

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(8000, (server) => {
    console.log('Express app listening at http://localhost:8000')
})

const robotServer = io('http://localhost:3000/admin', {
    reconnectionDelayMax: 10000,
});
