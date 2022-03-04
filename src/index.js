socket = io.connect("https://v-alhalla.herokuapp.com/");
var x = 1
var y = 350
var dots = []
var speed = 1

function setup() {
    var canvas = createCanvas(1900, 700);
    canvas.parent("canvasDiv")
    frameRate(30)
    img = loadImage("/background.png")
    var data = {
        id: socket.id,
        x: x,
        y: y
    };

    socket.emit('usr', data);
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
})

socket.on('newusr', function(data) {
    console.log("New user: " + data + " connected")
})

function draw() {
    background(img)
    for (let value of dots) {
        fill("#ffffff")
        ellipse(value.x, value.y, 10, 10)
    }
}

//audio
document.onkeydown = function (event) {
    if (x > 0 && x < 1900 && y > 0 && y < 700) {
        switch (event.keyCode) {
            case 65:
                x = x - speed
                break;
            case 87:
                y = y - speed
                break;
            case 68:
                x = x + speed
                break;
            case 83:
                y = y + speed
                break;
        }
        // switch (event.keyCode) {
        //     case 37 || 65:
        //         x = x - speed
        //         break;
        //     case 38 || 87:
        //         y = y - speed
        //         break;
        //     case 39 || 68:
        //         x = x + speed
        //         break;
        //     case 40 || 83:
        //         y = y + speed
        //         break;
        // }
    }
    else {
        if (x == 0) {
            x = 1
        }
        if (x == 1900) {
            x = 1899
        }
        if (y == 0) {
            y = 1
        }
        if (y == 700) {
            y = 699
        }
        
        if (x < 2 && y > 300 && y < 400) {
            if (confirm("Get out of V-alhalla?")) {
                close();
            }
        }
    }
    
    var data = {
        id: socket.id,
        x: x,
        y: y
    };

    socket.emit('usr', data);

    const xshow = document.getElementById("xshow").innerHTML = "x: " + x
    const yshow = document.getElementById("yshow").innerHTML = "y: " + y
    const numbershow = document.getElementById("connected-people").innerHTML = "connected: " + dots.length
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
        var datav = {
            b:blob,
            id:socket.id
        }
        socket.emit('voice', datav);
    };

    // Start recording
    mediaRecorder.start();

    // Stop recording after 5 seconds and broadcast it to server
    setInterval(function() {
        mediaRecorder.stop()
        mediaRecorder.start()
    }, 500);
});

// When the client receives a voice message it will play the sound
socket.on('voice', function(data) {
    objIndex = dots.findIndex((obj => obj.id == data.id));
    distance = Math.hypot(dots[objIndex].x - x, dots[objIndex].y - y)
        if (distance < 100) {
            var blob = new Blob([data.b], { 'type' : 'audio/ogg; codecs=opus' });
            var audio = document.createElement('audio');
            audio.src = window.URL.createObjectURL(blob);
            
            if (distance > 50) {
                audio.volume = 0.5
            }
            audio.play();
        }
    
});
