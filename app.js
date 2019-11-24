const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const keys = require('./config/keys');
const app = express();
const port = process.env.PORT || 3000;
var schedule = require('node-schedule');
const User = require('./models/User');

mongoose
	.connect(keys.mongoURI, { useNewUrlParser: true })
	.then(() => console.log('MongoDB Connected'))
	.catch((err) => console.log(err));
mongoose.set('useNewUrlParser', true);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.get('/', (req, res) => res.send('Hello World!'));

/**CHRON JOB TO SET ALL TASKS TO INCOMPLETE FOR THE NEW DAY */
var rule = new schedule.RecurrenceRule();
rule.hour = 23;
rule.minute = 59;

var j = schedule.scheduleJob(rule, async function() {
	console.log('The answer to life, the universe, and everything!');
	//set all values for all user schedules to incomplete
	const allUsers = await User.find({});
	for (let i = 0; i < allUsers.length; i++) {
		const currentUser = allUsers[i];
		const schedule = currentUser.schedule;
		for (let j = 0; j < schedule; j++) {
			for (let k = 0; k < schedule[j].length; k++) {
				schedule[j][k].status = 'Incomplete';
			}
		}
		User.findOneAndUpdate({ utorid: currentUser.utorid }, { schedule: schedule, completedMorningTasks: false });
	}
});
require('./routes/authRoutes')(app);
require('./routes/asteroidRoutes')(app);
require('./routes/gcpRoutes')(app);
require('./routes/inventoryRoutes')(app);
require('./routes/dailyTaskRoutes')(app);
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
