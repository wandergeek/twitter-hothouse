//@ninjahhtest
//iht32y

//hothousetest@mailinator.com
//iht32y

var Twitter = require('node-twitter');
var http = require('follow-redirects').http;
var _ = require('underscore');
var hue = require('hue.js');
var stationIP = "";
var defaultColor = [10,10,10];
var colors = {
  green:[0,255,0],
  red: [255,0,0]
};

var DISCO_LIGHT_ON = "100010100010101011011110";
var DISCO_LIGHT_OFF = "100010100010101011010110";
var twitterStreamClient = new Twitter.StreamClient(
    'CGjUrM86Nf8HnpEYkCmVJzU80',
    'qLkFbKQVmlMrDzNLUqutJZar1e8SRmD5Pj6DIocxUJWRcnXtyI',
    '2532227376-arirkCB5NMTE1yQUnhYaNMPtV5JhWrAwKnzC2Kv',
    'WrDwBVp3rpfThpoOvWTIV0beHXUGX2P6GV4dIIonCN24K'
);
var ninjaIP = "10.0.1.103"; //TODO test w/ ninjablock.local?
var GUID433 = "3913BBBK0155_0_0_11";
var APItoken = "cca5a2123f13eb4e57544afea152f4341a14352c";
var hueclient;

hue.discover(function(stations) {
  console.dir("Setting base station to " + stations[0]);
  stationIP = stations[0]

hueclient = hue.createClient({
  stationIp:stationIP, //#TODO this should be dynamic
  appName:"hothouse"
});


hueclient.lights(function(err,lights) {
  if (err && err.type === 1) {
    // App has not been registered

    console.log("Please go and press the link button on your base station(s)");
    hueclient.register(function(err) {

      if (err) {
        console.log("Couldnt register " + err)
      } else {
        console.log("Registered")
      }
    });
  } else {
    process.stdout.write(stationIP + " has the following lights: ");
    console.log(lights);
    hueclient.rgb(1, defaultColor[0],defaultColor[1],defaultColor[2], function(err) {
        if (err) {
        console.log("can't change color: " + err)
      }
    });
  }
});
});




twitterStreamClient.on('close', function() {
    console.log('Connection closed.');
});
twitterStreamClient.on('end', function() {
    console.log('End of Line.');
});
twitterStreamClient.on('error', function(error) {
    console.log('Error: ' + (error.code ? error.code + ' ' + error.message : error.message));
});
twitterStreamClient.on('tweet', function(tweet) {
    console.log("Received: " + tweet.text);
    var res = tweet.text.split(" ");
    var device = res[0];

    if(device.indexOf("light") > -1) {
      var deviceArr = device.split("")
      var lightNum = deviceArr[5]
      var color = colors[res[1]]
      console.log("Device is " + device + ", number is " + lightNum + ", color is " + color)
      setColor(color)


    } else if(device.indexOf("disco") > -1) {
      var state = res[1]
      console.log("Turning disco " + state)
      setDisco(state)
    }
});


twitterStreamClient.start(['#ninjablocks']);

function setColor(color) {
  console.log("received color at setcolor " + color[0] + "," + color[1] + "," + color[2])
  console.log(color)
  hueclient.rgb(1, color[0],color[1],color[2], function(err) {

      if (err) {
      console.log("can't change color: " + err)
    }
  });

}

function setDisco(state) {
  var bitStr = ""
  if(state == "on") {
      bitStr = DISCO_LIGHT_ON
  } else if(state == "off") {
    bitStr = DISCO_LIGHT_OFF
  }

  var opt = {
    host: ninjaIP, //TODO deviceID dynamic?
    port: '8000',
    path: "/rest/v0/device/" + GUID433,
    method: 'PUT',
    headers: {
      "Content-Type": "application/json"
    }
  };

  if(bitStr != "") {
    console.log("  sending " + bitStr + " to " + opt.host );
    var req = http.request(opt, function(res) {
    console.log("    Got response: " + res.statusCode);
  }).on('error', function(e) {
    console.log("    Got error: " + e.message);
  });
  req.write(JSON.stringify({DA: bitStr }));
  req.end();
} else {
    console.log("  Bad state sent to setDisco " + state)
}
}
