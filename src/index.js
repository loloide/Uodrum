socket = io.connect("https://v-alhalla.herokuapp.com/");
//socket = io.connect("http://localhost:3000");
var x = 1
var y = 350
var hex
var dots = []
var speed = 1
var mic
var micLevel


function setup() {
    mic = new p5.AudioIn();
    mic.start();
    var canvas = createCanvas(1900, 700);
    canvas.parent("canvasDiv")
    frameRate(30)
    img = loadImage("/background.png")  
    sendpos() 
   
    socket.on('usr', function(data) {
        if(dots.some(dot => dot.id === data.id)){
            var index = dots.findIndex((obj => obj.id == data.id));
            dots[index].x = data.x
            dots[index].y = data.y
            dots[index].hex = data.hex
        } 

        else {
            if (data.id !== undefined){
                dots.push({
                    id: data.id,
                    x: data.x,
                    y: data.y,
                    hex: data.hex
                });
                console.log(dots)
            }
            
        }
    })
}
 
socket.on('disusr', function(data) {
    dots.splice(dots.findIndex((obj => obj.id == data)))
    sendpos()
})

socket.on('newusr', function(data) {
    sendpos()
    console.log("New user: " + data + " connected")
})

function draw() {
    background(img)
    for (let value of dots) {
        if (value.hex !== undefined){
            fill(value.hex)
        }
        ellipse(value.x, value.y, 10, 10)
    }
}

function sendpos() {
    if (keys['w'] == true) { y = y - speed }
    if (keys['a'] == true) { x = x - speed }
    if (keys['s'] == true) { y = y + speed }
    if (keys['d'] == true) { x = x + speed }
    var data = {
        id: socket.id,
        x: x,
        y: y,
        hex: hex
    };

    socket.emit('usr', data)
}

//movement
var keys = {
    w: false,
    a: false,
    s: false,
    d: false
};

addEventListener("keydown", (event) => {
    if (x > 0 && x < 1900 && y > 0 && y < 700) {
        switch (event.keyCode) {
            case 65:
                keys.a = true
                break;
            case 87:
                keys.w = true 
                break;
            case 68:
                keys.d = true
                break;
            case 83:
                keys.s = true
                break;
        }
    }
});

addEventListener("keyup", (event) => {
    switch (event.keyCode) {
        case 65:
            keys.a = false
            break;
        case 87:
            keys.w = false 
            break;
        case 68:
            keys.d = false
            break;
        case 83:
            keys.s = false
            break;
    }
});

document.onkeydown = function (event) {
    if (x > 0 && x < 1900 && y > 0 && y < 700) {
        switch (event.keyCode) {
            case 37:
            alert("Move with the [w], [a], [s] & [d] keys. NOT the arrow keys")
            break;
            case 38:
            alert("Move with the [w], [a], [s] & [d] keys. NOT the arrow keys")
                break;
            case 39:
            alert("Move with the [w], [a], [s] & [d] keys. NOT the arrow keys")
                break;
            case 40:
            alert("Move with the [w], [a], [s] & [d] keys. NOT the arrow keys")
                break;
        }
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
        
        if (x < 1 && y > 300 && y < 400) {
            if (confirm("Get out of V-alhalla?")) {
                close();
            }
        }
    }
    
    sendpos()

    const xshow = document.getElementById("xshow").innerHTML = "x: " + x
    const yshow = document.getElementById("yshow").innerHTML = "y: " + y
    const numbershow = document.getElementById("connected-people").innerHTML = "connected: " + dots.length
};


//audio
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
        micLevel = mic.getLevel();

        var data = {
            b:blob,
            id: socket.id
        };
        if (micLevel > 0.01    ) {
            socket.emit('voice', data);
        }
        
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
    function distanceFunction( x1, y1, x2, y2 ) {
	
        var 	xs = x2 - x1,
            ys = y2 - y1;		
        
        xs *= xs;
        ys *= ys;
         
        return Math.sqrt( xs + ys );
    };

    dots.length > 1 ? distance = distanceFunction(x,y,dots[objIndex].x,dots[objIndex].y) : distance = 100;
    
    var blob = new Blob([data.b], { 'type' : 'audio/ogg; codecs=opus' });
    var audio = document.createElement('audio');
    audio.src = window.URL.createObjectURL(blob);
    if (distance >= 500) {
        audio.volume = 0.01
    }
    if (distance >= 200 && distance < 500) {
        audio.volume = 0.2
    }
    if (distance < 200) {
        audio.volume = 1
    }
    audio.play();
});

//clolor picker
var colorWell;
var defaultColor = "#ffffff";

window.addEventListener("load", startup, false);

function startup() {
    colorWell = document.querySelector("#colorWell");   
    colorWell.addEventListener("input", updateAll, false);
    colorWell.addEventListener("change", sendpos, false);
}

function updateAll() {
    hex = colorWell.value;
}

console.log("hello there! i see you are quite curious, here's the git repo of this https://github.com/loloide/V-alhalla")