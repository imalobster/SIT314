// ############################################################
// # FLOOR SERVER
// ############################################################
// Create new floor server using floor identifier passed as argument
var args = process.argv.slice(2);

// Define variable from ID passed as argument
var floorId = "floor_" + args[0];

// Pull the mqtt module
const mqtt = require('mqtt')

// Establish connection variable for the broker
const client = mqtt.connect("mqtt://broker.hivemq.com:1883");

// Define MQTT topics for receiving data from senors and switches, as well as requests
var inboundTopic = `smartlight/floors/${floorId}/apartments`;

// Define MQTT topic string for sending data to apartments
var outboundTopicapartment = `smartlight/floors/${floorId}/apartments/apartment_`;

// Define MQTT topic string for sending data to processing server
var outboundTopicProcessing = `smartlight/floors/`;


// ############################################################
// # Event handlers
// ############################################################
// Code to fire for 'connect' event
client.on('connect', () =>
{
	// Subscribe to the inbound topic
	client.subscribe(inboundTopic);

	console.log(`${floorId} connected to MQTT broker`);
});

// Code to fire for 'message' event
client.on('message', (topic, payload) =>
{
	// Extract payload from JSON format
	var msg = JSON.parse(payload);

	// Check if message came from the processing server
	if (msg.type == 'request')
	{
		// Print received message
		console.log("Received message from processing server, redirecting to: " + msg.apartmentId);

		// Call handler function
		HandleRequestMessage(msg);
	}
	// ...or sensor
	else if (msg.type == 'sensor')
	{
		// Print received message
		console.log("Received sensor message from apartment node, forwarding to processing server");
		
		// Call handler function
		HandleSensorMessage(msg);
	}
	// ...or switch
	else if (msg.type == 'switch')
	{
		// Print received message
		console.log("Received switch message from apartment node, forwarding to processing server");
		
		// Call handler function
		HandleSwitchMessage(msg);
	}
});

// Script will loop through and instantiate multiple apartment instances running local. Details will be pulled from JSON file
// Floor servers remain in cloud

// ############################################################
// # Processing message outbound handler
// ############################################################
function HandleRequestMessage(msg)
{
	// Forward message on to apartment node
	PublishToTopic(outboundTopicapartment + msg.apartmentId, msg)
}


// ############################################################
// # Sensor message outbound handler
// ############################################################
function HandleSensorMessage(msg)
{
	console.log("lux value: " + msg.lux);

	// Forward message on to processing server
	PublishToTopic(outboundTopicProcessing, msg)
}


// ############################################################
// # Switch message outbound handler
// ############################################################
function HandleSwitchMessage(msg)
{
	console.log("switch direction: " + msg.direction);

	// Forward message on to processing server
	PublishToTopic(outboundTopicProcessing, msg)
}


// ############################################################
// # Generic functions
// ############################################################
function PublishToTopic(outboundTopic, msg)
{
	console.log("publishing message to " + outboundTopic);

	// Publish message to the processing server
	client.publish(outboundTopic, JSON.stringify(msg));
}
