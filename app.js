const express = require('express');
const cors = require('cors');
const routes = require('./res/routes');
const app = express();
const port = process.env.PORT || 8653;

app.use(express.json());
app.use(cors());
app.use('/api', routes);

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
})