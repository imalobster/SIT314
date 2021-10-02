const mongoose = require('mongoose');

module.exports = mongoose.model('Sensor', new mongoose.Schema(
	{
		floorId: String,
		roomId: String,
		sensorId: String,
		time: Date,
		lux: Number
	}
));