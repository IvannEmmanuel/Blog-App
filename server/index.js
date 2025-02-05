const express = require('express');
const app = express();

app.use('/', (req, res) => {
    res.send("Server is running.");
})

const port = 5000

app.listen(port, console.log(`Server started on port ${port}`))