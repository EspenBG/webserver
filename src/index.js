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

/*********************************************************************
* MAIN PROGRAM
*********************************************************************/
// Set the directory the webclients can access, the clients can only request files from this directory
app.use(express.static(__dirname + '/Website'));


app.get('/', (req, res) => {
    res.send('Hello World!');
})

app.listen(8000, (server) => {
    console.log('Express app listening at http://localhost:8000');
})



/*********************************************************************
 * PROGRAM FUNCTIONS
 *********************************************************************/
