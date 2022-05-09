var express = require('express')
const { TwitterApi, MuteUserIdsV1Paginator } = require('twitter-api-v2');
const http = require('http')
const fs = require('fs')
const stream = require('youtube-audio-stream')
const path = require('path')


var app = express();
var server = app.listen(process.env.PORT || 3000, listen);
var playlist = []

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
  //    cors: {
  //      origin: "http://v-alhalla.herokuapp.com/",
  //      methods: ["GET", "POST"],
  //      transports: ['websocket', 'polling'],
  //      credentials: true
  //  },
  allowEIO3: true
  });

  
  io.sockets.on('connection', function (socket) {
    

    console.log("We have a new client: " + socket.id);

    socket.on('musicreq', function(data) {
      // var vidid = data.slice(17, 28);
      
      playlist.push(data)

      
      var stream = ytplay.stream("https://youtu.be/lXT4OdGw57s")
      console.log(stream)


      io.sockets.emit('musicreq', playlist)
      
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

    var newusrinfo = {
      id: socket.id,
      playlist: playlist
    }
    io.sockets.emit('newusr', newusrinfo)
  }
);
//socket.broadcast.emit('usr', data); //(send to all except sender)


//music


http.createServer(demo).listen(4000)

function demo (req, res) {
  if (req.url === '/') {
    return fs.createReadStream(path.join(__dirname, '/src/index.html')).pipe(res)
  } else if (req.url === '/ping') {
    res.end('pong')
  } else if (/youtube/.test(req.url)) {
    stream('http:/' + req.url).pipe(res)
  }
}
