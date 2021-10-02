const mongoose = require('mongoose');

module.exports = mongoose.model('Request', new mongoose.Schema(
	{
		floorId: String,
		roomId: String,
		lightId: String,
		time: Date,
		direction: String
	}
));