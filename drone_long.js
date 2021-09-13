// Pull the mqtt module
const mqtt = require('mqtt')

// Establish connection variable for the broker
const client = mqtt.connect("mqtt://broker.hivemq.com:1883");

// Define topic category
var topic = "/drones/long"

// Define number of drones
var droneCount = 1;

// Create drone array to hold details for each drone
var droneArr = [];
for (var i = 0; i < droneCount; i++)
{
	droneArr.push({
		'battery': 100.0,
		'latitude': -38.150002,
		'longitude': 144.350006,
		'altitude': 10.0,
		'speed': 0.0
	})
}

// Define function to update drone values
function UpdateData()
{
	for (var i = 0; i < droneArr.length; i++)
	{
		// Update battery
		droneArr[i]['battery'] -= Math.random() * 0.1;

		// Update latitude and longitude
		droneArr[i]['latitude'] += Math.ceil(Math.random() * 9) * (Math.round(Math.random()) ? 1 : -1) * 0.00001;
		droneArr[i]['longitude'] += Math.ceil(Math.random() * 9) * (Math.round(Math.random()) ? 1 : -1) * 0.00001;

		// Update altitude
		var alt = Math.ceil(Math.random() * 9) * (Math.round(Math.random()) ? 1 : -1) * 0.01;
		if (droneArr[i]['altitude'] + alt < 0)
		{
			alt = alt * -1;
		}
		droneArr[i]['altitude'] += alt;

		// Update speed
		var vel = Math.ceil(Math.random() * 9) * (Math.round(Math.random()) ? 1 : -1) * 0.1;
		if (droneArr[i]['speed'] + vel < 0)
		{
			vel = vel * -1;
		}
		droneArr[i]['speed'] += vel;
	}
}

// Define function to publish updates to the broker service
function PublishData()
{
	//for (var drone in droneArr)
	for (var i = 0; i < droneArr.length; i++)
	{
		// Publish battery
		client.publish(topic + "/battery", `long-ranged drone ${i} battery: ${droneArr[i]['battery'].toFixed(2)}`);

		// Publish latitude and longitude
		client.publish(topic + "/location", `long-ranged drone ${i} latitude, longitude: ${droneArr[i]['latitude'].toFixed(5)}, ${droneArr[i]['longitude'].toFixed(5)}`);

		// Publish altitude
		client.publish(topic + "/altitude", `long-ranged drone ${i} altitude: ${droneArr[i]['altitude'].toFixed(2)}`);

		// Publish speed
		client.publish(topic + "/speed", `long-ranged drone ${i} speed: ${droneArr[i]['speed'].toFixed(2)}`);
	}
}

// Set timers for update and publishing
var timer_id = setInterval(function() {UpdateData();}, 2000);
var timer_id = setInterval(function() {PublishData();}, 5000);

// Define on connect message
client.on('connect', () =>
{
	console.log('mqtt connected for drone_long handler');
	client.publish(topic, "drone_long handler connected");
});