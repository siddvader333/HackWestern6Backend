const mongoose = require('mongoose');

const AsteroidSchema = new mongoose.Schema({
	asteroidName: {
		type: String,
		required: true
	},
	asteroidDate: {
		type: Date,
		required: true
	},
	value: {
		type: Number,
		required: true
	}
});

module.exports = AsteroidSchema;
