const express = require('express')
const app = express()

app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(8000, (server) => {
    console.log('Express app listening at http://localhost:8000')
})
