// ############################################################
// # ROOM NODE
// ############################################################
// Create new room node using JSON string passed as argument
var args = process.argv.slice(2);

// Room configuration is passed once server is instantiated, kept as JSON object
var roomConfig = JSON.parse(args[0]);
var floorId = "floor_" + args[1];

// Define room from ID in config object
var roomId = "room_" + roomConfig.roomId;

// Pull the mqtt module
const mqtt = require('mqtt')

// Establish connection variable for the broker
const client = mqtt.connect("mqtt://broker.hivemq.com:1883");

// Define MQTT topic for receiving data from sensors and floor
var inboundTopic = `smartlight/floors/${floorId}/rooms/${roomId}/#`;

// Define MQTT topic string for sending data to floor
var outboundTopic = `smartlight/floors/${floorId}`;


// ############################################################
// # Event handlers
// ############################################################
// Code to fire for 'connect' event
client.on('connect', () =>
{
	// Subscribe to the inbound topic
	client.subscribe(inboundTopic);
	
	// Print connect message
	console.log(`${roomId} connected to MQTT broker`);
});


// Code to fire for 'message' event
client.on('message', (topic, payload) =>
{
	// Extract payload from JSON format
	var msg = JSON.parse(payload);

	// Check if message came from a physical switch
	if (msg.type: == 'switches')
	{
		// Print received message
		console.log("Received message from physical switch server, forwarding to floor server");

		// Call handler function
		HandleSwitchMessage(msg);
	}
	// ..or a sensor
	else if (topicChain.at(-1) == 'sensors')
	{
		// Print received message
		console.log("Received message from sensor, forwarding to floor server")
		
		// Call handler function
		HandleSensorMessage(msg);
	}
	// ..or a request from processing
	else if (topicChain.at(-1) == 'requests')
	{
		// Print received message
		console.log("Received new request from floor server, switching light direction")
		
		// Call handler function
		HandleRequestMessage(msg);
	}
});

// Script will loop through and instantiate multiple room instances running local. Details will be pulled from JSON file
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
	for (var i = 0; i < roomConfig.lights.length; i++)
	{
		light = roomConfig.lights[i];
		console.log("Light " + light.lightId + " status: " + light.lightStatus);
	}
}

function GetLightStatus(lightId)
{
	// Loop through lights in room config
	var lightStatus;
	for (var i = 0; i < roomConfig.lights.length; i++)
	{
		if (roomConfig.lights[i].lightId == lightId)
		{
			lightStatus = roomConfig.lights[i].lightStatus;
			break;
		}
	}
	return lightStatus;
}

function SetLightStatus(lightId, direction)
{
	// Loop through lights in room config
	for (var i = 0; i < roomConfig.lights.length; i++)
	{
		if (roomConfig.lights[i].lightId == lightId)
		{
			roomConfig.lights[i].lightStatus = direction;
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
	msg["roomStatus"] = roomConfig.lights;
	msg["time"] = now;

	// Forward message on to room node
	PublishToFloor(outboundTopic + "/sensors", msg)
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

	// Forward message on to room node
	PublishToFloor(outboundTopic + "/requests", msg)
}


// ############################################################
// # Generic functions
// ############################################################
function PublishToFloor(outboundTopic, msg)
{
	// Forward message from processing server to the room node
	client.publish(outboundTopic, msg);
}
