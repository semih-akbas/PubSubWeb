var express     = require('express');
var app         = express();
var http        = require('http').Server(app);
var path        = require('path');
var exphbs      = require('express-handlebars');
var io          = require('socket.io')(http);
var common      = require('./helpers/common');
var cors 		= require('cors');

const mqtt 		= require('mqtt');
const client 	= mqtt.connect('mqtt://172.16.2.89:1883');

var application_root = __dirname;



const dataInterval = 1000;
console.log(Date());
client.on('connect', () => {
	console.log("Connected to mosquitto client");
    client.subscribe('opcua');
	/*
    setInterval(function(){
		var airQ = (Math.random() * 50).toFixed(0);
        client.publish("opcua_sam", "{\"air\": {\"humidity\": 40,\"quality\": " + airQ + "}}");
	}, dataInterval);
	*/
});

io.on('connection',function(socket){  
	console.log("A user is connected on opc.js");
});

client.on('message', (topic, message) => {
	switch (topic) {
        case 'opcua':{
			//console.log(message);
            var data = JSON.parse(message);
            console.log(Date() + " Humidity: " + data.Nem + " Temperature: " + data.Sicaklik);
            common.logAirQuality(200,io, data.Sicaklik);
            common.logAirHumidity(200,io, data.Nem);
      }
	}
});

var airRouter = require('./routes/air')(io);
var hbs = exphbs.create({
	defaultLayout: "air",
	extname: "html",
	helpers: {
		section: function (name, options) {
			if (!this._sections) this._sections = {};
			this._sections[name] = options.fn(this);
			return null;
		}
	}
});

app.use( express.static( application_root ));

app.use(cors());
app.engine('html', hbs.engine);
app.set('view engine', 'html');
/*app.use(function timeLog (req, res, next) {
	console.log('Request time: ', Date.now());
    next();
});*/
app.get('/dist', function (req, res) {
	console.log('app.get');
	res.send('GET request to the homepage');
  });

app.use('/air', airRouter);

http.listen(3000, function () {
    console.log('listening on *:3000');
});


