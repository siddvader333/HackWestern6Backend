const mongoose = require('mongoose');

const InventoryItemSchema = new mongoose.Schema({
	item: {
		type: String,
		required: true
	},
	cost: {
		type: Number,
		required: true
	},
	img: {
		type: String,
		required: true
	}
});

module.exports = InventoryItemSchema;
