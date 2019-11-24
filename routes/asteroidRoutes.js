module.exports = (app) => {
	const User = require('../models/User');
	app.post('/addAsteroid', async (req, res) => {
		const { asteroidName, asteroidDate, value, utorid } = req.body;
		const newAsteroid = {
			asteroidName: asteroidName,
			asteroidDate: asteroidDate,
			value: value
		};

		const user = await User.findOne({ utorid: utorid });
		if (user) {
			const newQuestData = user.questData;
			newQuestData.asteroidsRemaining.push(newAsteroid);
			console.log(newAsteroid);
			console.log(newQuestData);
			await User.findOneAndUpdate({ utorid: utorid }, { questData: newQuestData });
			res.status(200).send({ message: 'yeet it worked' });
		} else {
			res.status(400).send({ error: 'something not okay' });
		}
	});

	app.get('/getAsteroids', async (req, res) => {
		const { utorid } = req.body;
		const user = await User.findOne({ utorid: utorid });
		if (user) {
			res.status(200).send({
				asteroidsRemaining: user.questData.asteroidsRemaining
			});
		} else {
			res.status(400).send({ error: 'something not okay' });
		}
	});

	app.get('/getCompletedAsteroids', async (req, res) => {
		const { utorid } = req.body;
		const user = await User.findOne({ utorid: utorid });
		if (user) {
			res.status(200).send({
				asteroidsDestroyed: user.questData.asteroidsDestroyed
			});
		} else {
			res.status(400).send({ error: 'something not okay' });
		}
	});

	app.post('/destroyAsteroid', async (req, res) => {
		const { utorid, asteroidName, asteroidDate, value } = req.body;

		const asteroid = {
			asteroidName: asteroidName,
			asteroidDate: asteroidDate,
			value: value
		};
		//remove from asteroidsRemaining
		//add to asteroidsDestroyed
		const user = await User.findOne({ utorid: utorid });
		if (user) {
			const asteroidsRemaining = user.questData.asteroidsRemaining;
			const asteroidsDestroyed = user.questData.asteroidsDestroyed;
			asteroidsDestroyed.push(asteroid);
			const index = asteroidsRemaining.indexOf(asteroid);
			asteroidsRemaining.splice(index, 1);
			await User.findByIdAndUpdate(
				{ utorid: utorid },
				{
					asteroidsRemaining: asteroidsRemaining,
					asteroidsDestroyed: asteroidsDestroyed
				}
			);
		} else {
			res.status(400).send({ error: 'something not okay' });
		}
	});
};
