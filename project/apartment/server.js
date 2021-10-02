// ############################################################
// # apartment NODE
// ############################################################
// Create new apartment node using JSON string passed as argument
var args = process.argv.slice(2);

// apartment configuration is passed once server is instantiated, kept as JSON object
var apartmentConfig = JSON.parse(args[0]);
var floorId = "floor_" + args[1];

// Define apartment from ID in config object
var apartmentId = "apartment_" + apartmentConfig.apartmentId;

// Pull the mqtt module
const mqtt = require('mqtt')

// Establish connection variable for the broker
const client = mqtt.connect("mqtt://broker.hivemq.com:1883");

// Define MQTT topic for receiving data from sensors and floor
var inboundTopic = `smartlight/floors/${floorId}/apartments/${apartmentId}`;

// Define MQTT topic string for sending data to floor
var outboundTopic = `smartlight/floors/${floorId}/apartments`;


// ############################################################
// # Event handlers
// ############################################################
// Code to fire for 'connect' event
client.on('connect', () =>
{
	// Subscribe to the inbound topic
	client.subscribe(inboundTopic);
	
	// Print connect message
	console.log(`${apartmentId} connected to MQTT broker`);
});


// Code to fire for 'message' event
client.on('message', (topic, payload) =>
{
	// Extract payload from JSON format
	var msg = JSON.parse(payload);

	// Check if message came from a physical switch
	if (msg.type == 'switch')
	{
		// Print received message
		console.log("Received message from physical switch server, forwarding to floor server");

		// Call handler function
		HandleSwitchMessage(msg);
	}
	// ..or a sensor
	else if (msg.type == 'sensor')
	{
		// Print received message
		console.log("Received message from sensor, forwarding to floor server")
		
		// Call handler function
		HandleSensorMessage(msg);
	}
	// ..or a request from processing
	else if (msg.type == 'request')
	{
		// Print received message
		console.log("Received new request from floor server, switching light direction")
		
		// Call handler function
		HandleRequestMessage(msg);
	}
});

// Script will loop through and instantiate multiple apartment instances running local. Details will be pulled from JSON file
// Floor servers remain in cloud

// ############################################################
// # Request message inbound handler
// ############################################################
function HandleRequestMessage(msg)
{
	// Get lightId from payload
	var lightId = msg.lightId;

	// Get current light direction
	var currentStatus = GetLightStatus(lightId);

	// If different from payload status request, change it
	if (currentStatus != msg.direction)
	{
		SetLightStatus(lightId, msg.direction);
	}

	// Print all lights status
	for (var i = 0; i < apartmentConfig.lights.length; i++)
	{
		light = apartmentConfig.lights[i];
		console.log("Light " + light.lightId + " status: " + light.lightStatus);
	}
}

function GetLightStatus(lightId)
{
	// Loop through lights in apartment config
	var lightStatus;
	for (var i = 0; i < apartmentConfig.lights.length; i++)
	{
		if (apartmentConfig.lights[i].lightId == lightId)
		{
			lightStatus = apartmentConfig.lights[i].lightStatus;
			break;
		}
	}
	return lightStatus;
}

function SetLightStatus(lightId, direction)
{
	// Loop through lights in apartment config
	for (var i = 0; i < apartmentConfig.lights.length; i++)
	{
		if (apartmentConfig.lights[i].lightId == lightId)
		{
			apartmentConfig.lights[i].lightStatus = direction;
		}
	}
}


// ############################################################
// # Sensor message outbound handler
// ############################################################
function HandleSensorMessage(msg)
{
	// Get time of reading
	var now = new Date();

	// Attach additional contextual variable to JSON object to forward on to floor
	msg["lightStatus"] = apartmentConfig.lights[msg.sensorId].lightStatus;
	msg["time"] = now;

	// Forward message on to apartment node
	PublishToFloor(outboundTopic, msg)
}


// ############################################################
// # Switch message outbound handler
// ############################################################
function HandleSwitchMessage(msg)
{
	// Get time of request
	var now = new Date();

	// Attach additional contextual variable to JSON object to forward on to floor
	msg["time"] = now;

	// Forward message on to apartment node
	PublishToFloor(outboundTopic, msg)
}


// ############################################################
// # Generic functions
// ############################################################
function PublishToFloor(outboundTopic, msg)
{
	console.log("publishing message to " + outboundTopic);

	// Forward message from processing server to the apartment node
	client.publish(outboundTopic, JSON.stringify(msg));
}
