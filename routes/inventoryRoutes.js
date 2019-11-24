module.exports = (app) => {
	const User = require('../models/User');

	app.post('/buy_item', async (req, res) => {
		const { item, cost, img, utorid } = req.body;

		//add item to user Inventory
		const newItem = {
			item: item,
			cost: cost,
			img: img
		};

		//subtract cost from available gold
		const user = await User.findOne({ utorid: utorid });
		if (user) {
			const userQuestData = user.questData;
			userQuestData.gold = userQuestData.gold - cost;
			userQuestData.inventory.push(newItem);
			await User.findOneAndUpdate({ utorid: utorid }, { questData: userQuestData });
			res.status(200).send({ message: 'noice' });
		} else {
			res.status(400).send({ error: 'error occurred' });
		}
	});

	app.get('/inventory', async (req, res) => {
		const { utorid } = req.body;

		const user = await User.findOne({ utorid: utorid });
		if (user) {
			const inventory = user.questData.inventory;
			res.status(200).send({ inventory: inventory });
		} else {
			res.status(400).send({ error: 'something happened :(' });
		}
	});

	app.post('/addGold', async (req, res) => {
		const { utorid, goldToAdd } = req.body;
		const user = await User.findOne({ utorid: utorid });
		if (user) {
			const questData = user.questData;
			questData.gold = questData.gold + goldToAdd;
			await User.findOneAndUpdate({ utorid: utorid }, { questData: questData });
			res.status(200).send('everything went okay');
		} else {
			res.status(400).send({ error: 'user not found' });
		}
	});
};
