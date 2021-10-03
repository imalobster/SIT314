// Pull the mqtt module
const mqtt = require('mqtt')

// Establish connection variable for the broker
const client = mqtt.connect("mqtt://broker.hivemq.com:1883");

// Define MQTT topic string for outbound commands to lights
var outboundTopic = "smartlight/web/webapp"

// Define MQTT topic string for inbound commands to handle switches from user phones
var inboundTopic = "smartlight/web"

// Code to fire for 'connect' event
client.on('connect', () =>
{
	client.subscribe(inboundTopic);
	console.log('web server connected to mqtt');
});

// Send messages at random intervals to random lights on floors
// Code to fire for 'message' event
client.on('message', (topic, payload) =>
{
	// Print message was received
	console.log("Web server recieved switch request");
	
	// Extract payload from JSON format
	var msg = JSON.parse(payload);

	// Handle message decomposition and forward to processing server
	HandleWebMessage(msg);
});

function HandleWebMessage(msg)
{
	// Get time of request
	var now = new Date();

	// Add timestamp
	msg["time"] = now;

	// Forward message on to processing node
	PublishToProcessing(outboundTopic, msg);
}


// ############################################################
// # Generic functions
// ############################################################
function PublishToProcessing(outboundTopic, msg)
{
	// Publish message to the floor for fog level processing
	client.publish(outboundTopic, JSON.stringify(msg));
}