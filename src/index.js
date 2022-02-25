socket = io.connect("http://localhost:3000");
var x = 1
var y = 1
var dots = []

function setup() {
    var canvas = createCanvas(1900, 700);
    canvas.parent("canvasDiv")
    frameRate(30)
    background("#e4e4e4")
    socket.on('usr', function(data) {

        if(dots.some(dot => dot.id === data.id)){
            objIndex = dots.findIndex((obj => obj.id == data.id));
            dots[objIndex].x = data.x
            dots[objIndex].y = data.y

        } 
        else {
            dots.push({
                id: data.id,
                x: data.x,
                y: data.y
            });
            console.log(dots)
        }
    })
}
 
socket.on('disusr', function(data) {
    dots.splice(dots.findIndex((obj => obj.id == data)))
    console.log(dots.findIndex((obj => obj.id == data)))
})

socket.on('newusr', function(data) {
    console.log("New user: " + data + " connected")
})

function draw() {
    background("#e4e4e4")
    for (let value of dots) {
        noStroke()
        fill("#000000")
        ellipse(value.x, value.y, 10, 10)
    }

    
    
}

document.onkeydown = function (event) {
    switch (event.keyCode) {
        case 37:
            x = x - 2
            break;
        case 38:
            y = y - 2 
            break;
        case 39:
            x = x + 2
            break;
        case 40:
            y = y + 2
            break;
    }
    var data = {
        id: socket.id,
        x: x,
        y: y
    };

    socket.emit('usr', data);
};

var constraints = { audio: true };
navigator.mediaDevices.getUserMedia(constraints).then(function(mediaStream) {
    var mediaRecorder = new MediaRecorder(mediaStream);
    mediaRecorder.onstart = function(e) {
        this.chunks = [];
    };
    mediaRecorder.ondataavailable = function(e) {
        this.chunks.push(e.data);
    };
    mediaRecorder.onstop = function(e) {
        var blob = new Blob(this.chunks, { 'type' : 'audio/ogg; codecs=opus' });
        socket.emit('voice', blob);
        console.log("send audio" + blob)
    };

    // Start recording
    mediaRecorder.start();

    // Stop recording after 5 seconds and broadcast it to server
    setInterval(function() {
        mediaRecorder.stop()
        mediaRecorder.start()
      }, 5000);

});

// When the client receives a voice message it will play the sound
socket.on('voice', function(arrayBuffer) {
    var blob = new Blob([arrayBuffer], { 'type' : 'audio/ogg; codecs=opus' });
    var audio = document.createElement('audio');
    audio.src = window.URL.createObjectURL(blob);
    audio.play();
    console.log("recieved audio")
});