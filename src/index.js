//socket = io.connect("https://v-alhalla.herokuapp.com/");
socket = io.connect("http://localhost:3000");

var x = 5
var y = 350
var dots = []
var speed = 2
var mic
var micLevel
var facing = "center"
var character = "b"
var acenter
var bcenter
var bright
var bleft


if (localStorage.character) {
    character = localStorage.getItem("character")
} else {
    character = "a"
}  

if (localStorage != 0) {
    if (localStorage.x != null && localStorage.y != null) {
        x = parseInt(localStorage.x)
        y = parseInt(localStorage.y)
    }
}  

function preload() {
    acenter = loadAnimation('sprites/myon0.png', 'sprites/myon1.png', 'sprites/myon2.png', 'sprites/myon3.png');
    bcenter = loadAnimation('sprites/red0.png', 'sprites/red1.png')
    bright = loadAnimation('sprites/redrun0.png', 'sprites/redrun1.png')
    bleft = loadAnimation('sprites/redrunl0.png', 'sprites/redrunl1.png')
    
}

function setup() {
    
    frameRate(15)
    
    
    var canvas = createCanvas(1900, 700);
    userStartAudio()
    mic = new p5.AudioIn();
    mic.start();
    noSmooth()
    canvas.parent("canvasDiv")
    img = loadImage("/background.png")  
    background(img)
    sendpos() 
    updateInfo()
    socket.on('usr', function(data) {
        if(dots.some(dot => dot.id === data.id)){
            var index = dots.findIndex((obj => obj.id == data.id));
            dots[index].x = data.x
            dots[index].y = data.y
            dots[index].character = data.character
            dots[index].facing = data.facing
        } 

        else {
            if (data.id !== undefined){
                dots.push({
                    id: data.id,
                    x: data.x,
                    y: data.y,
                    character: data.character,
                    talking: false,
                    facing: data.facing
                });
                console.log(dots)
            }
            
        }
        background(img)
        for (let value of dots) {
            
            if(value.talking == true) {
                noStroke()
                fill(255,255,0, 100)
                ellipse(value.x,value.y, 10,10)
            }
            var person = createSprite(value.x, value.y, 32,32)
            var anim = value.character + value.facing
            person.addAnimation('acenter', acenter)
            person.addAnimation('bcenter', bcenter)
            person.addAnimation('bright', bright)
            person.addAnimation('bleft', bleft)

            person.changeAnimation(anim)
            person.scale = 0.5;
            drawSprite(person)
            
            
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


function sendpos() {
    if (keys['w'] == true) { y = y - speed; facing = "center"}
    if (keys['a'] == true) { x = x - speed; facing = "left"} 
    if (keys['s'] == true) { y = y + speed; facing = "center"}
    if (keys['d'] == true) { x = x + speed; facing = "right"} 
    var data = {
        id: socket.id,
        x: x,
        y: y,
        character: character,
        facing: facing
    };
    socket.emit('usr', data)


    localStorage.setItem("character", character)
    localStorage.setItem("x", x)
    localStorage.setItem("y", y)
}

function tweet() {
    var val = document.querySelector('#tweet-input').value;
    console.log("tweeted: " + val)
    var data = {
        id: socket.id,
        tweet: val
    }
    socket.emit("tweet", data)
}

function updateInfo() {
    var xshow = document.getElementById("xshow").innerHTML = "x: " + x
    var yshow = document.getElementById("yshow").innerHTML = "y: " + y
    var numbershow = document.getElementById("connected-people").innerHTML = "connected: " + dots.length
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
            case 37:
                keys.a = true
                break;
            case 38:
                keys.w = true 
                break;
            case 39:
                keys.d = true
                break;
            case 40:
                keys.s = true
                break;
            
        }
        if (x > 920 && x < 980 && y > 0 && y < 40) {
            const tweetinput = document.getElementById("tweet-input")
            tweetinput.style.visibility = "visible"
            tweetinput.addEventListener("keydown", function(event) {
                if (event.keyCode == 13){
                    tweet()
                }
            });
        } else {
            const tweetinput = document.getElementById("tweet-input")
            tweetinput.style.visibility = "hidden"
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
        case 37:
            keys.a = false
            break;
        case 38:
            keys.w = false 
            break;
        case 39:
            keys.d = false
            break;
        case 40:
            keys.s = false
            break;
    }
    facing = "center"
    sendpos()
});

document.onkeydown = function (event) {
    if (x > 0 && x < 1900 && y > 0 && y < 700) {
        switch (event.keyCode) {
            
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
        
    }
    
    sendpos()

    updateInfo()
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
    dots[objIndex].talking = true
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
    audio.addEventListener("ended", function() {
        dots[objIndex].talking = false
    })
});


function changeChar() {
    if (character == "a") {
        character = "b"
    } else {
        character = "a"
    }
    sendpos()
}

console.log("hello there! i see you are quite curious, here's the git repo of this https://github.com/loloide/V-alhalla")   