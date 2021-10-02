// Pull the mqtt and mongoose modules
const mqtt = require('mqtt');
const mongoose = require('mongoose');
const Sensor = require('./models/sensor');
const Request = require('./models/request');

// Establish connection to mongoose
mongoose.connect('mongodb+srv://bastone:bigpassword%211@smartlightdb.ak3dv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority');

// Establish connection with the broker
const client = mqtt.connect("mqtt://broker.hivemq.com:1883");

// Define MQTT topics for receiving data from floors and web server
var inboundTopicFloors = "smartlight/processing/floors"
var inboundTopicWeb = "smartlight/processing/webapp"

// Define MQTT topic string for outbound commands to lights
var outboundTopic = "smartlight/floors/"

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
	// Print message was received
	console.log("Processing message from: " + topic);
	
	// Get topic chain
	var topicChain = topic.split('/');

	// Extract payload from JSON format
	var msg = JSON.parse(payload);

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

	// Check if lights in apartment should be switched on/off based on reading
	var switchLight = CheckLuminosityReading(MessagePort);

	// Send message to floor if light needs to be switched
	if (switchLight)
	{
		ActivateAllLights(msg.apartmentId);
	}
	// Else do nothing
}

function CheckLuminosityReading(msg)
{
	// If light is on or off
	if (msg.lightStatus == "off")
	// Check the lux level (less than 200 needs light)
		if (msg.luxLow <= 200)
		{
			// And if motion detected coming in
			if (msg.motion == 'in')
			{
				return true;
			}
		}
	var luxLow = msg.lux <= 200;
	// Check the direction of motion (turn on if in, turn off if out)
	var motionIn = msg.motion == ;

	{

	}
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

	// Send message to floor node to activate light in apartment
	ActivateLight(msg.apartmentId, msg.lightId, lightDirection);
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

	// Send message to floor node to activate light in apartment
	ActivateLight(msg.apartmentId, msg.lightId, lightDirection);
}


// ############################################################
// # Generic functions
// ############################################################
function ActivateLight(apartmentId, lightId, lightDirection)
{
	// Send message to turn switch lights on/of in specified apartment
	msg = JSON.stringify({ request: "switch_light", apartment: apartmentId, light: lightId, direction: lightDirection });
	PublishToFloor(msg);
}

function ActivateAllLights(apartmentId)
{
	// Send message to turn switch lights on/of in specified apartment
	msg = JSON.stringify({ request: "switch_all", apartment: apartmentId });
	PublishToFloor(msg);
}

function PublishToFloor(floorId, msg)
{
	console.log("hi");

	// Publish message to the floor for fog level processing
	client.publish(outboundTopic + "floor_" + floorId, JSON.stringify(msg));
}

function StoreSensorData(msg)
{
	sensor = new Sensor(
		{
			floorId: msg.floorId,
			apartmentId: msg.apartmentId,
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
			apartmentId: msg.apartmentId,
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