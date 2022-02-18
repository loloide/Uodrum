var express = require('express');


var app = express();


var server = app.listen(process.env.PORT || 3000, listen);

function listen() {
    var host = "localhost"
    var port = server.address().port;
    console.log('Example app listening at http://' + host + ':' + port);
  }
  
app.use(express.static('src'));

var io = require('socket.io')(server, {
//     cors: {
//       origin: "https://socialpixels.herokuapp.com/",
//       methods: ["GET", "POST"],
//       transports: ['websocket', 'polling'],
//       credentials: true
//   },
  allowEIO3: true
  });

  io.sockets.on('connection', function (socket) {
    io.sockets.emit('newusr', socket.id)


    console.log("We have a new client: " + socket.id);
  
    
    socket.on('usr', function(data) {
        //console.log(socket.id + data.x + data.y)
        // Send it to all other clients
        //socket.broadcast.emit('usr', data); //(send to all except sender)
        io.sockets.emit('usr', data) 

      }
    );
    
    socket.on('disconnect', function() {
      console.log("Client has disconnected");
    });
  }
);