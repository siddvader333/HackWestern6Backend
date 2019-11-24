const mongoose = require('mongoose');
const InventoryItemSchema = require('./InventoryItem.js');
const AsteroidSchema = require('./Asteroid.js');

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
		type: [ InventoryItemSchema ],
		default: []
	},
	asteroidsDetroyed: {
		type: [ AsteroidSchema ],
		default: []
	},
	asteroidsRemaining: {
		type: [ AsteroidSchema ],
		default: []
	}
});

module.exports = UserQuestDataSchema;
