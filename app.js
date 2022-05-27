var express = require('express')
const { TwitterApi, MuteUserIdsV1Paginator } = require('twitter-api-v2');
const stream = require('youtube-audio-stream')
const ytinfo = require('ytdl-core')

var app = express();
var server = app.listen(process.env.PORT || 3000, listen);
var playlist = ["https://youtu.be/a_6quQ994JI"]

function listen() {
  var host = "localhost"
  var port = server.address().port;
  console.log('Example app listening at http://' + host + ':' + port);
}
  
app.use(express.static('src'));

const userClient = new TwitterApi({
  appKey: process.env.APP_KEY,
  appSecret: process.env.APP_KEY_SECRET,
  accessToken: process.env.ACCESS_TOKEN,
  accessSecret: process.env.ACCESS_TOKEN_SECRET,
});

var io = require('socket.io')(server, {
  allowEIO3: true
});

app.get('/music', (req, res) => {
  if (playlist.length > 0) {
    stream(playlist[0].link).pipe(res)
  }
})

function changeSong() {
    playlist.shift();
    if (playlist.length != 0) {
      setTimeout(changeSong, playlist[0].milis)
      console.log(playlist.length)
      io.sockets.emit("newsong")
    }
}

io.sockets.on('connection', function (socket) {
  
  console.log("We have a new client: " + socket.id);

  socket.on('musicreq', function(data) {
    ytinfo.getInfo(data).then(info => {
      var milis = info.videoDetails.lengthSeconds * 1000
      var song = {
        link: data,
        milis: milis
      }
      if (playlist.length == 0) {
        io.sockets.emit("newsong")
        console.log("newsong")
        setTimeout(changeSong, song.milis)
      }
      playlist.push(song)
    })
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
});
//socket.broadcast.emit('usr', data); //(send to all except sender)

