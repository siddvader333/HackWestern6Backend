const mongoose = require('mongoose');

const UserQuestDataSchema = new mongoose.Schema({
	daysOnQuest: {
		type: Number,
		default: 0
	},
	lightYearsTravelled: {
		type: Number,
		default: 0
	},
	asteroidsDetroyed: {
		type: Number,
		default: 0
	},
	gold: {
		type: Number,
		default: 0
	},
	inventory: {
		type: [ Object ],
		default: []
	}
});

module.exports = UserQuestDataSchema;
