var express = require('express')
const { TwitterApi, MuteUserIdsV1Paginator } = require('twitter-api-v2');
const http = require('http')
const fs = require('fs')
const stream = require('youtube-audio-stream')
const path = require('path')


var app = express();
var server = app.listen(process.env.PORT || 3000, listen);
var playlist = ["https://youtu.be/PGJKeESLBpQ","https://youtu.be/lXT4OdGw57s"]

function listen() {
  var host = "localhost"
  var port = server.address().port;
  console.log('Example app listening at http://' + host + ':' + port);
}
  
app.use(express.static('src'));

const userClient = new TwitterApi({
  // appKey: process.env.APP_KEY,
  // appSecret: process.env.APP_KEY_SECRET,
  // accessToken: process.env.ACCESS_TOKEN,
  // accessSecret: process.env.ACCESS_TOKEN_SECRET,
});

var io = require('socket.io')(server, {
  allowEIO3: true
});

app.get('/music', (req, res) => {
  stream(playlist[0]).pipe(res)
})

io.sockets.on('connection', function (socket) {
  
  console.log("We have a new client: " + socket.id);

  socket.on('musicreq', function(data) {
    playlist.push(data)
  })

  socket.on('voice', function(data) {
    // can choose to broadcast it to whoever you want
    socket.broadcast.emit('voice', data);
  });

  socket.on('usr', function(data) {
    io.sockets.emit('usr', data) 
  }) 

  socket.on('disconnect', function() {
    console.log("Client has disconnected " + socket.id);
    io.sockets.emit('disusr', socket.id)
  });

  socket.on('tweet', function(data) {
    userClient.v2.tweet(data.id + " says: \n" + data.tweet)
    console.log("user: " + data.id + " tweeted: '" + data.tweet + "'")
  })

  socket.on('finishedSong', function() {
    playlist.arr.shift();
    console.log(playlist)
  })

  var newusrinfo = {
    id: socket.id,
    playlist: playlist
  }
  io.sockets.emit('newusr', newusrinfo)
});
//socket.broadcast.emit('usr', data); //(send to all except sender)

