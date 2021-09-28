// Pull the mqtt module
const mqtt = require('mqtt')

// Establish connection variable for the broker
const client = mqtt.connect("mqtt://broker.hivemq.com:1883");

// Define topic category
var topicAll="/drones/#"

// Code to fire for 'connect' event
client.on('connect', () =>
{
	// Subscribe to the all topic (rest are beneath this in hierarchy)
	client.subscribe(topicAll);
	console.log('mqtt connected');
});

// Code to fire for 'message' event
client.on('message', (topic, message) =>
{
	console.log("Topic: " + parts + " | Message: " + message);
});