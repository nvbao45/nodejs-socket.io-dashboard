require('dotenv').config();

var http = require('http');
var express = require('express');
var socketio = require('socket.io')
var ip = require('ip');
var app = express();
var server = http.Server(app)
var io = socketio(server);
var webapp_nsp = io.of('/webapp')
var esp8266_nsp = io.of('/esp8266')
var middleware = require('socketio-wildcard')();
var mqtt = require('mqtt');
var mqttClient = mqtt.connect(process.env.MQTT_BROKER);

esp8266_nsp.use(middleware);
webapp_nsp.use(middleware);

server.listen(process.env.PORT);
console.log("Server nodejs chay tai dia chi: " + ip.address() + ":" + process.env.PORT)

app.use(express.static("node_modules/"))

app.use(express.static("webapp"))

function ParseJson(jsondata) {
	try {
		return JSON.parse(jsondata);
	} catch (error) {
		return null;
	}
}

mqttClient.on('connect', () => {
	mqttClient.subscribe('/dht/+', (error) => {
		if (!error) {

		}
	})
})

mqttClient.on('message', function (topic, message) {
	console.log(topic + ': ' + message);
	switch (topic) {
		case '/dht/tc':
			webapp_nsp.emit('TC', message.toString());
			break;
		case '/dht/hum':
			webapp_nsp.emit('HUM', message.toString());
			break;
		default:
			break;
	}
})

esp8266_nsp.on('connection', function (socket) {
	console.log('esp8266 connected')

	socket.on('disconnect', function () {
		console.log("Disconnect socket esp8266")
	})

	socket.on("*", function (packet) {
		console.log("ESP8266: ", packet.data)
		var eventName = packet.data[0]
		var eventJson = packet.data[1] || {}
		webapp_nsp.emit(eventName, eventJson)
	})
})


webapp_nsp.on('connection', function (socket) {

	console.log('webapp connected')

	socket.emit('CAMERA', process.env.CAMERA_STREAM);

	socket.on('disconnect', function () {
		console.log("Disconnect socket webapp")
	})

	socket.on('LED', function (msg){
		mqttClient.publish('LED', JSON.stringify(msg));
	})
})