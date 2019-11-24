module.exports = (app) => {
	const User = require('../models/User');
	//update task status for all tasks of the day
	app.post('/updateTaskStatus', async (req, res) => {
		const { updatedTasks, day, utorid } = req.body;
		const user = await User.findOne({ utorid: utorid });
		if (user) {
			const schedule = user.schedule;
			schedule[day] = updatedTasks;
			await User.findOneAndUpdate({ utorid: utorid }, { schedule: schedule });
		} else {
			res.status(400).send({ error: 'nah fham' });
		}
	});

	//get tasks for the day, given a date
	app.post('/getDailyTasks', async (req, res) => {
		const { day, utorid } = req.body;
		if (day === 0 || day === 6) {
			res.status(200).send({ dailyTasks: [] });
		} else {
			const user = await User.findOne({ utorid: utorid });
			if (user) {
				const schedule = user.schedule;
				res.status(200).send({ dailyTasks: schedule[day - 1] });
			} else {
				res.status(400).send({ error: 'nah fham' });
			}
		}
	});

	app.post('/completeMorningTasks', async (req, res) => {
		const { utorid } = req.body;
		const user = await User.findOne({ utorid: utorid });
		if (user) {
			await User.findOneAndUpdate({ utorid: utorid }, { completedMorningTasks: true });
			res.status(200).send({ message: 'yeet' });
		} else {
			res.status(400).send({ error: 'boooo :(' });
		}
	});
};
