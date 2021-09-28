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
var receiveMessagesTopic = `smartlight_data/floors/${floorId}/rooms/${roomId}/#`

// Define MQTT topic string for sending data to floor
var sendFloorTopicString = `smartlight_data/floors/${floorId}`

// Define MQTT topic string for sending data to lights
var sendRoomTopicString = `smartlight_data/floors/${floorId}/rooms/${roomId}/lights/`


// ############################################################
// # Event handlers
// ############################################################
// Code to fire for 'connect' event
client.on('connect', () =>
{
	// Subscribe to the all topics
	client.subscribe(receiveMessagesTopic);
	
	// Print connect message
	console.log(`${roomId} connected to MQTT broker`);
});

// Code to fire for 'message' event
client.on('message', (topic, payload) =>
{
	// Extract payload from JSON format
	var msg = JSON.parse(payload);

	// Get topic chain
	var topicChain = topic.split('/');

	// Check if message came from the floor server to switch light
	if (topicChain.at(-1) == 'lights')
	{
		// Print received message
		console.log("Received message from floor server, switch light: " + msg.lightId);

		// Call handler function
		HandleFloorMessage(msg);
	}
	// Otherwise, it came from a sensor
	else if (topicChain.at(-1) == 'sensor')
	{
		// Print received message
		console.log("Received message from sensor, forwarding to floor server")
		
		// Call handler function
		HandleSensorMessage(msg);
	}
});

// Script will loop through and instantiate multiple room instances running local. Details will be pulled from JSON file
// Floor servers remain in cloud

// ############################################################
// # Floor message outbound handler
// ############################################################
function HandleFloorMessage(msg)
{
	// Get lightId from payload
	var lightId = msg.lightId;

	// NEED TO CHECK FOR ALL LIGHTS MESSAGES

	// Get current light direction
	var currentStatus = GetLightStatus(lightId);

	// If different from payload status request, change it
	if (currentStatus != msg.direction)
	{
		SetLightStatus(lightId, msg.direction);
	}
}

function GetLightStatus(lightId)
{
	// Loop through lights in room config
	var lightStatus;
	for (var i = 0; i < roomConfig.lights.length; i++)
	{
		if (roomConfig.lights[i] == lightId)
		{
			lightStatus = light.lightStatus;
		}
	}
	return lightStatus;
}

function SetLightStatus(lightId, direction)
{
	// Loop through lights in room config
	for (var i = 0; i < roomConfig.lights.length; i++)
	{
		if (roomConfig.lights[i] == lightId)
		{
			roomConfig.lights[i].lightStatus = direction;
		}
	}
}

// ############################################################
// # Sensor message inbound handler
// ############################################################
function HandleSensorMessage(msg)
{
	// Attach additional contextual variables to JSON object to forward on to floor
	msg["floorId"] = floorId;
	msg["roomId"] = roomId;
	msg["roomStatus"] = roomConfig.lights;

	// Forward message on to room node
	PublishToFloor(sendFloorTopicString, msg)
}

// ############################################################
// # Generic functions
// ############################################################
function PublishToFloor(roomId, msg)
{
	// Forward message from processing server to the room node
	client.publish(sendFloorTopicString + "" + roomId, msg);
}
