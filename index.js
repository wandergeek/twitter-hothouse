//@ninjahhtest
//iht32y

//hothousetest@mailinator.com
//iht32y

var Twitter = require('node-twitter');
var http = require('follow-redirects').http;
var hue = require('hue.js')
var colors = {
  green:[0,255,0],
  red: [255,0,0]
}

var DISCO_LIGHT_ON = "http://a.ninja.is/rest/v0/device/WEBHOOK_0_0_108/subdevice/lfOPt/tickle/4c0b751b3c9a023f1f11fbc7ef5c1a826426b2e4"
var DISCO_LIGHT_OFF = "http://a.ninja.is/rest/v0/device/WEBHOOK_0_0_108/subdevice/RDZf5/tickle/9fc93b04acdbda4cbb489056474855866578385d"
var twitterStreamClient = new Twitter.StreamClient(
    'CGjUrM86Nf8HnpEYkCmVJzU80',
    'qLkFbKQVmlMrDzNLUqutJZar1e8SRmD5Pj6DIocxUJWRcnXtyI',
    '2532227376-arirkCB5NMTE1yQUnhYaNMPtV5JhWrAwKnzC2Kv',
    'WrDwBVp3rpfThpoOvWTIV0beHXUGX2P6GV4dIIonCN24K'
);



var hueclient = hue.createClient({
  stationIp:"10.0.1.139",
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
    console.log(lights);
    hueclient.rgb(1, 10,10,10, function(err) {
        if (err) {
        console.log("can't change color: " + err)
      }
    });
  }
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
      var color = colors[res[2]]
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

  var HOOK = "";
  if(state == "on") {
    HOOK = DISCO_LIGHT_ON
  } else if(state == "off") {
    HOOK = DISCO_LIGHT_OFF
  }

  if(HOOK != "") {
    http.get(HOOK, function(res) {
    console.log("Got response: " + res.statusCode);
  }).on('error', function(e) {
    console.log("Got error: " + e.message);
  });
  }
}
