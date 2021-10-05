// Pull the mqtt and mongoose modules
const mqtt = require('mqtt');
const mongoose = require('mongoose');
const Sensor = require('./models/sensor');
const Request = require('./models/request');

// Establish connection to mongoose
mongoose.connect('mongodb+srv://[REDACTED]@smartlightdb.ak3dv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority');

// Establish connection with the broker
const client = mqtt.connect("mqtt://broker.hivemq.com:1883");

// Define MQTT topics for receiving data from floors and web server
var inboundTopicFloors = "smartlight/floors"
var inboundTopicWeb = "smartlight/web/webapp"

// Define MQTT topic string for outbound commands to lights
var outboundTopic = "smartlight/floors/floor_"

// Code to fire for 'connect' event
client.on('connect', () =>
{
	// Subscribe to all inbound topics
	client.subscribe(inboundTopicFloors);
	client.subscribe(inboundTopicWeb);
	console.log('processing server connected to mqtt');
});

// Code to fire for 'message' event
client.on('message', (topic, payload) =>
{
	// Get topic chain
	var topicChain = topic.split('/');

	// Extract payload from JSON format
	var msg = JSON.parse(payload);

	// Print message was received
	console.log(`[INFO]: processing ${msg.type} message from floor_${msg.floorId} | apartment_${msg.apartmentId}`);

	// Check if origin of message was from a floor server
	if (topicChain.at(-1) == 'floors')
	{
		if (msg.type == "sensor")
		{
			HandleSensorMessage(msg);
		}
		else if (msg.type == "switch")
		{
			HandleSwitchMessage(msg);
		}
	}
	// Check if message came from web application
	else if (topicChain.at(-1) == 'webapp')
	{
		HandleWebMessage(msg);
	}
});


// ############################################################
// # Sensor message handler
// ############################################################
function HandleSensorMessage(msg)
{
	// Store sensor data in Mongoose DB
	StoreSensorData(msg);

	// Check if lights in apartment should be switched on/off based on sensor
	var switchLight = CheckSensorReading(msg);

	// Send message to floor if light needs to be switched
	if (switchLight)
	{
		// Get direction (will be opposite whatever it is currently)
		var lightDirection;
		if (msg.lightStatus == "on")
		{
			lightDirection = "off";
		}
		else if (msg.lightStatus == "off")
		{
			lightDirection ="on";
		}
		ActivateLight(msg, lightDirection);
	}
	// Else do nothing
}

function CheckSensorReading(msg)
{
	// If light is on or off
	if (msg.lightStatus == "off")
	{
		// Check the lux level (less than 200 needs light)
		if (msg.lux <= 200)
		{
			// If motion detected coming in, return true
			if (msg.motion == 'in')
			{
				return true;
			}
		}
	}
	else if (msg.lightStatus == "on")
	{
		// If motion detected coming out, return true
		if (msg.motion == 'out')
		{
			return true;
		}
	}
	return false;
}

function ActivateLight(msg, lightDirection)
{
	// Get time of request
	var now = new Date();

	// Generate new request message
	newMsg = {
			type: "request",
			floorId: msg.floorId,
			apartmentId: msg.apartmentId,
			lightId: msg.sensorId,
			time: now,
			direction: lightDirection 
		};

	StoreRequestData(newMsg, "sensor_req");

	PublishToTopic(outboundTopic + msg.floorId + "/apartments", newMsg);
}


// ############################################################
// # Switch message handler
// ############################################################
function HandleSwitchMessage(msg)
{
	// Store request data in Mongoose DB
	StoreRequestData(msg, "switch_req");

	// Use existing details but swap type from switch to request
	msg.type = "request";

	// Send message to floor node to activate light in apartment
	PublishToTopic(outboundTopic + msg.floorId + "/apartments", msg);
}


// ############################################################
// # Web message handler (essentially same as above)
// ############################################################
function HandleWebMessage(msg)
{
	// Store request data in Mongoose DB
	StoreRequestData(msg, "webapp_req");

	// Use existing details but swap type from switch to request
	msg.type = "request";

	// Send message to floor node to activate light in apartment
	PublishToTopic(outboundTopic + msg.floorId + "/apartments", msg);
}


// ############################################################
// # Generic functions
// ############################################################
function PublishToTopic(outboundTopic, msg)
{
	// Publish message to the floor for fog level processing
	client.publish(outboundTopic, JSON.stringify(msg));
}

function StoreSensorData(msg)
{
	sensor = new Sensor(
		{
			floorId: msg.floorId,
			apartmentId: msg.apartmentId,
			sensorId: msg.sensorId,
			time: msg.time,
			motion: msg.motion,
			lux: msg.lux
		}
	)

	sensor.save().then(doc => 
		{
			//console.log(doc);
		}).then(() =>
		{
			//mongoose.connection.close()
		})
}

function StoreRequestData(msg, type)
{
	request = new Request(
		{
			type: type,
			floorId: msg.floorId,
			apartmentId: msg.apartmentId,
			lightId: msg.lightId,
			time: msg.time,
			direction: msg.direction
		}
	)

	request.save().then(doc => 
		{
			//console.log(doc);
		}).then(() =>
		{
			//mongoose.connection.close()
		})

}
