// Pull the mqtt and mongoose modules
const mqtt = require('mqtt')
const mongoose = require('mongoose');

// Establish connection variable for the broker
const client = mqtt.connect("mqtt://broker.hivemq.com:1883");

// Define MQTT topic for receiving data
var receiveTopic = "smartlight/processing"

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
		HandleSensorMessage(topicChain, msg);
	}
	// Check if origin of message was from a physical switch
	else if (topicChain.at(-1) == 'switch')
	{
		HandleSwitchMessage(topicChain, msg);
	}
	// Check if message came from web application
	else if (topicChain.at(1) == 'webapp')
	{
		HandleWebMessage(topicChain, msg);
	}
});


// ############################################################
// # Sensor message handler
// ############################################################
function HandleSensorMessage(topicChain, msg)
{
	// Store sensor data in Mongoose DB
	StoreSensorData(topicChain, msg);

	// Check if lights in room should be switched on/off based on reading
	var roomId = topicChain.at(-2)
	var switchLight = CheckLuminosityReading(msg.roomId, msg.val, msg.time, msg.roomStatus);

	// Send message to floor if light needs to be switched
	if (switchLight)
	{
		ActivateAllLights(roomId);
	}
	// Else do nothing
}


// ############################################################
// # Switch message handler
// ############################################################
function HandleSwitchMessage(topicChain, msg)
{
	// Store request data in Mongoose DB
	StoreSensorData(topicChain, msg);

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
	StoreSensorData(topicChain, msg);

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
	// Publish message to the floor for fog level processing
	client.publish(outboundTopic + "floor_" + floorId, msg);
}

function StoreSensorData(topicChain, msg)
{

}