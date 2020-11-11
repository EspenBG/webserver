/***********************************************************************************************************************
 * WEBSERVER
 * THIS IS A PROGRAM FOR COMMUNICATION WITH CLIENTS AND THE ROBOT SERVER
 * WRITTEN AS A PART OF THE SUBJECT IELEA2001
 ***********************************************************************************************************************/

/*********************************************************************
 * IMPORTS AND CONSTANTS
 *********************************************************************/
// Webserver config
const express = require('express')
const app = express()
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const ioClient = require('socket.io-client');
const jwt = require('jsonwebtoken');

//const {token} = sessionStorage;

// other requires



const robotServer = ioClient('http://10.0.1.42:3000/admin', {
    reconnectionDelayMax: 10000,
    key: "TEST",
});

robotServer.on('connect', () => {
    robotServer.emit('test', "sample text")
})


/*********************************************************************
* MAIN PROGRAM
*********************************************************************/
// Set the directory the webclients can access, the clients can only request files from this directory
app.use(express.static(__dirname + '/www'));


app.get('/', (req, res) => {
    res.send('Hello World!');
})

app.listen(8000, (server) => {
    console.log('Express app listening at http://localhost:8000');
})



/*********************************************************************
 * PROGRAM FUNCTIONS
 *********************************************************************/
// TODO implement function to get data from robot server

// TODO: Add function to add

// TODO: add function for making of sensor

