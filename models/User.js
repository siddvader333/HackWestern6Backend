const mongoose = require('mongoose');
const UserQuestDataSchema = require('./UserQuestData');

const UserSchema = new mongoose.Schema({
	utorid: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	preferredName: {
		type: String,
		required: true
	},
	age: {
		type: Number,
		required: true
	},
	discipline: {
		type: String,
		required: true
	},
	phone: {
		type: Number,
		required: true
	},
	questData: {
		type: UserQuestDataSchema
	}
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
