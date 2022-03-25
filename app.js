var express = require('express');
var Twit = require('twit')
var config = require('./config')
var app = express();

var server = app.listen(process.env.PORT || 3000, listen);

var T = new Twit(config)

function listen() {
  var host = "localhost"
  var port = server.address().port;
  console.log('Example app listening at http://' + host + ':' + port);
}
  
app.use(express.static('src'));

var io = require('socket.io')(server, {
  //    cors: {
  //      origin: "http://v-alhalla.herokuapp.com/",
  //      methods: ["GET", "POST"],
  //      transports: ['websocket', 'polling'],
  //      credentials: true
  //  },
  allowEIO3: true
  });

  io.sockets.on('connection', function (socket) {
    io.sockets.emit('newusr', socket.id)


    console.log("We have a new client: " + socket.id);

    socket.on('voice', function(data) {
      // can choose to broadcast it to whoever you want
      socket.broadcast.emit('voice', data);
    });

    socket.on('usr', function(data) {
      io.sockets.emit('usr', data) 
    }) 
      
    
    socket.on('usr', function(data){
      io.sockets.emit('usr', data)
    })

    socket.on('disconnect', function() {
      console.log("Client has disconnected " + socket.id);
      io.sockets.emit('disusr', socket.id)
    });

    socket.on('tweet', function(data) {
      var tweet = {
        status: data.id + " Said: \n" + data.tweet
      }
      function tweeted(err, response) {
        console.log(err)
      }
      T.post('statuses/update', tweet, tweeted)
    })
  }
);
//socket.broadcast.emit('usr', data); //(send to all except sender)

