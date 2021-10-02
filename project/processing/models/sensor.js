const mongoose = require('mongoose');

module.exports = mongoose.model('Sensor', new mongoose.Schema(
	{
		floorId: Number,
		apartmentId: Number,
		sensorId: Number,
		time: Date,
		lux: Number,
		motion: String
	}
));