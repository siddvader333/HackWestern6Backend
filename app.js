const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const keys = require('./config/keys');
const app = express();
const port = process.env.PORT || 3000;

mongoose
	.connect(keys.mongoURI, { useNewUrlParser: true })
	.then(() => console.log('MongoDB Connected'))
	.catch((err) => console.log(err));
mongoose.set('useNewUrlParser', true);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.get('/', (req, res) => res.send('Hello World!'));

require('./routes/authRoutes')(app);
require('./routes/gcpRoutes')(app);
require('./routes/inventoryRoutes')(app);
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
