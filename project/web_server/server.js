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
	console.log('mqtt connected');
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
	// Forward message on to processing node
	PublishToProcessing(msg);
}

// ############################################################
// # Looping function
// ############################################################
function Loop()
{
	// Generate random interval time
	var rand = Math.round(Math.random() * (3000 - 500)) + 500;

	setTimeout(function()
	{
		// Simulate new request sent to processing server
		SimulateNewRequest();

		// Loop again with another random time
		Loop();
	}, rand)
}


// ############################################################
// # Web-app message simulator
// ############################################################
function SimulateNewRequest()
{
	// Generate random values for floor, apartment, and light (capped at 3 for testing purposes)
	

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
function PublishToProcessing(outboundTopic, msg)
{
	// Publish message to the floor for fog level processing
	client.publish(outboundTopic, JSON.stringify(msg));
}