// Pull the mqtt and mongoose modules
const mqtt = require('mqtt');
const mongoose = require('mongoose');
const Sensor = require('./models/sensor');
const Request = require('./models/request');
const sensor = require('./models/sensor');

// Establish connection to mongoose
mongoose.connect('mongodb+srv://bastone:bigpassword%211@smartlightdb.ak3dv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority');

// Establish connection with the broker
const client = mqtt.connect("mqtt://broker.hivemq.com:1883");

// Define MQTT topic for receiving data
var receiveTopic = "smartlight/processing/#"

// Define MQTT topic string for outbound commands to lights
var outboundTopic = "smartlight/floors/"

// Code to fire for 'connect' event
client.on('connect', () =>
{
	// Subscribe to the all topic (rest are beneath this in hierarchy)
	client.subscribe(receiveTopic);
	console.log('mqtt connected');
});

// Code to fire for 'message' event
client.on('message', (topic, payload) =>
{
	// Print message was received
	console.log("Processing message from: " + topic);
	
	// Get topic chain
	var topicChain = topic.split('/');

	// Extract payload from JSON format
	var msg = JSON.parse(payload);

	// Check if origin of message was from a sensor
	if (topicChain.at(-1) == 'sensor')
	{
		HandleSensorMessage(msg);
	}
	// Check if origin of message was from a physical switch
	else if (topicChain.at(-1) == 'switch')
	{
		HandleSwitchMessage(msg);
	}
	// Check if message came from web application
	else if (topicChain.at(-1) == 'web')
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

	// Check if lights in room should be switched on/off based on reading
	var switchLight = CheckLuminosityReading(msg.roomId, msg.val, msg.time, msg.roomStatus);

	// Send message to floor if light needs to be switched
	if (switchLight)
	{
		ActivateAllLights(msg.roomId);
	}
	// Else do nothing
}


// ############################################################
// # Switch message handler
// ############################################################
function HandleSwitchMessage(msg)
{
	// Store request data in Mongoose DB
	StoreRequestData(msg);

	// Determine which direction to switch light
	var lightDirection;
	if (msg.lightStatus == 'on')
	{
		lightDirection = 'off';
	}
	else
	{
		lightDirection = 'on';
	}

	// Send message to floor node to activate light in room
	ActivateLight(msg.roomId, msg.lightId, lightDirection);
}


// ############################################################
// # Web message handler (essentially same as above)
// ############################################################
function HandleWebMessage(topicChain, msg)
{
	// Store request data in Mongoose DB
	StoreRequestData(topicChain, msg);

	// Determine which direction to switch light
	var lightDirection;
	if (msg.lightStatus == 'on')
	{
		lightDirection = 'off';
	}
	else
	{
		lightDirection = 'on';
	}

	// Send message to floor node to activate light in room
	ActivateLight(msg.roomId, msg.lightId, lightDirection);
}


// ############################################################
// # Generic functions
// ############################################################
function ActivateLight(roomId, lightId, lightDirection)
{
	// Send message to turn switch lights on/of in specified room
	msg = JSON.stringify({ request: "switch_light", room: roomId, light: lightId, direction: lightDirection });
	PublishToFloor(msg);
}

function ActivateAllLights(roomId)
{
	// Send message to turn switch lights on/of in specified room
	msg = JSON.stringify({ request: "switch_all", room: roomId });
	PublishToFloor(msg);
}

function PublishToFloor(floorId, msg)
{
	console.log("hi");

	// Publish message to the floor for fog level processing
	client.publish(outboundTopic + "floor_" + floorId, msg);
}

function StoreSensorData(msg)
{
	sensor = new Sensor(
		{
			floorId: msg.floorId,
			roomId: msg.roomId,
			sensorId: msg.sensorId,
			time: msg.time,
			lux: msg.value
		}
	)

	sensor.save().then(doc => 
		{
			console.log(doc);
		}).then(() =>
		{
			mongoose.connection.close()
		})
}

function StoreRequestData(msg)
{
	request = new Request(
		{
			floorId: msg.floorId,
			roomId: msg.roomId,
			lightId: msg.lightId,
			time: msg.time,
			direction: msg.direction
		}
	)

	request.save().then(doc => 
		{
			console.log(doc);
		}).then(() =>
		{
			mongoose.connection.close()
		})

}