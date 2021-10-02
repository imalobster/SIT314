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

// Define MQTT topic for receiving data from rooms
var receiveRoomTopic = `smartlight/floors/${floorId}/sensors`

// Define MQTT topic string for sending data to room
var sendRoomTopic = `smartlight/floors/${floorId}/rooms/`

// Define MQTT topic for receiving data from processing server(s)
var receiveProcessingTopic = `smartlight/floors/${floorId}`

// Define MQTT topic string for sending data to room
var sendProcessingTopic = `smartlight/processing/switch`

// ############################################################
// # Event handlers
// ############################################################
// Code to fire for 'connect' event
client.on('connect', () =>
{
	// Subscribe to the all topics
	client.subscribe(receiveRoomTopic);
	client.subscribe(receiveProcessingTopic);

	console.log('mqtt connected');
});

// Code to fire for 'message' event
client.on('message', (topic, payload) =>
{
	// Extract payload from JSON format
	var msg = JSON.parse(payload);

	// Get topic chain
	var topicChain = topic.split('/');

	// Check if message came from the processing server
	if (topic == receiveProcessingTopic)
	{
		// Print received message
		console.log("Received message from processing server, redirecting to: " + msg.roomId);

		// Call handler function
		HandleProcessingMessage(msg);
	}
	// Otherwise, it came from a sensor
	else
	{
		// Print received message
		console.log("Received message from room node, forwarding to processing server")
		
		// Call handler function
		HandleSensorMessage(topicChain, msg);
	}
});

// Script will loop through and instantiate multiple room instances running local. Details will be pulled from JSON file
// Floor servers remain in cloud

// ############################################################
// # Processing message outbound handler
// ############################################################
function HandleProcessingMessage(msg)
{
	// Get roomId to forward to room node
	var roomId = msg.roomId;

	// Forward message on to room node
	PublishToRoom(roomId, msg)
}


// ############################################################
// # Room message outbound handler
// ############################################################
function HandleSensorMessage(topicChain, msg)
{
	// Set subTopic string
	var subTopic = "sensor";

	// Forward message on to room node
	PublishToProcessing(subTopic, msg)
}

// ############################################################
// # Generic functions
// ############################################################
function PublishToRoom(roomId, msg)
{
	// Construct topic string
	subTopic = sendRoomTopic + `room_${roomId}/lights`

	// Forward message from processing server to the room node
	client.publish(subTopic, msg);
}

function PublishToProcessing(subTopic, msg)
{
	// Publish message to the processing server
	client.publish(sendProcessingTopic + "/" + subTopic, msg);
}
