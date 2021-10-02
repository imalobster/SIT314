const mongoose = require('mongoose');

module.exports = mongoose.model('Request', new mongoose.Schema(
	{
		type: String,
		floorId: Number,
		apartmentId: Number,
		lightId: Number,
		time: Date,
		direction: String
	}
));