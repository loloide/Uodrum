socket = io.connect("https://uodrum.herokuapp.com/");
//socket = io.connect("http://localhost:3000");

var x = 3426
var y = 1474
var dots = []
const speed = 4
var mic
var miclvl
var facing = "right"   
var charactername = "Myon"
var character = "b"
var notfound
var aright; var aleft
var bright; var bleft
var cright; var cleft
var viewport


//localstorage
if (localStorage.character) {
    character = localStorage.getItem("character")
    charactername = localStorage.getItem("charactername")
} else {
    character = "a"
    alert("Welcome to Uodrum  ヽ(*≧ω≦)ﾉ. Move with wasd. Enable microphone access to speak with others. Press E to open the menu")
}  

if (localStorage != 0) {
    if (localStorage.x != null && localStorage.y != null) {
        x = parseInt(localStorage.x)
        y = parseInt(localStorage.y)
    }
}  

var lastcoords = {
    x: x,
    y:y
}


//p5js
function preload() {
    notfound = loadAnimation('sprites/404.png')
    aright = loadAnimation('sprites/playerA1right.png', 'sprites/playerA2right.png', 'sprites/playerA3right.png', 'sprites/playerA4right.png', 'sprites/playerA5right.png', 'sprites/playerA6right.png')
    aleft = loadAnimation('sprites/playerA1left.png', 'sprites/playerA2left.png', 'sprites/playerA3left.png', 'sprites/playerA4left.png', 'sprites/playerA5left.png', 'sprites/playerA6left.png')
    bright = loadAnimation('sprites/playerB1right.png', 'sprites/playerB2right.png', 'sprites/playerB3right.png', 'sprites/playerB4right.png', 'sprites/playerB5right.png', 'sprites/playerB6right.png')
    bleft = loadAnimation('sprites/playerB1left.png', 'sprites/playerB2left.png', 'sprites/playerB3left.png', 'sprites/playerB4left.png', 'sprites/playerB5left.png', 'sprites/playerB6left.png')
    cright = loadAnimation('sprites/404.png')
    cleft = loadAnimation('sprites/404.png')
    img = loadImage("/background.png")
}

function setup() {
    frameRate(15)
    var canvas = createCanvas(window.innerWidth, window.innerHeight);
    userStartAudio()
    mic = new p5.AudioIn();
    mic.start();
    canvas.parent("canvasDiv")
    var backgr = img.get(x - window.innerWidth / 2, y - window.innerHeight / 2, window.innerWidth, window.innerHeight)
    background(backgr)
    sendpos() 
    socket.on('usr', function(data) {
        if(dots.some(dot => dot.id === data.id)){
            var index = dots.findIndex((obj => obj.id == data.id));
            dots[index].x = data.x
            dots[index].y = data.y
            dots[index].character = data.character
            dots[index].facing = data.facing
        } else {
            if (data.id !== undefined){
                dots.push({
                    id: data.id,
                    x: data.x,
                    y: data.y,
                    character: data.character,
                    facing: data.facing
                });
            }
            
        }  
    })
    document.getElementById("current-char").innerText = "current: " + charactername
}

function windowResized() {
    resizeCanvas(window.innerWidth, window.innerHeight);
    translate(window.innerWidth / 2, window.innerHeight / 2)
}

function draw() {
    translate(window.innerWidth / 2, window.innerHeight / 2)
    background("#78741c")
    var backgr = img.get(x - window.innerWidth / 2, y - window.innerHeight / 2, window.innerWidth, window.innerHeight)
    background(backgr)
    var person = character + facing
    stroke('#f5942c')
    fill(245, 208, 44, 100)
    miclvl = mic.getLevel();
    try {
        animation(window[person], 0, 0)
    } 
    catch(err) {
        animation(notfound, 0, 0)
    }
    for (let value of dots) {
        var person = value.character + value.facing
        stroke('#f5942c')
        fill(245, 208, 44, 100)
        //ellipse(value.x ,value.y  + 32 , 20,10)
        animation(window[person], value.x - x, value.y - y)
        try {
            animation(window[person], value.x - x, value.y - y)
        } 
        catch(err) {
            animation(notfound, value.x - x, value.y - y)
        }
    }   
    var displayx = x - 3840
    var displayy = y - 1504
    document.getElementById("xpos").innerHTML = "x:" + displayx
    document.getElementById("ypos").innerHTML = "y:" + displayy
}


//Socket
socket.on('songname', function(data) {
    document.getElementById("song-title").innerText = "Playing: " + data
})

socket.on("nosong", function() {
    document.getElementById("song-title").innerText = ""
})

socket.on('disusr', function(data) {
    dots.splice(dots.findIndex((obj => obj.id == data)))
    sendpos()
})

socket.on('newusr', function(data) {
    console.log("New user: " + data.id + " connected")
    sendpos()
})

socket.on('newsong', function() {
    console.log("new song!")
    document.getElementById("player").load()
}) 

socket.on("playlist", function(data){
    document.getElementById("playlist").replaceChildren();
    var playlist = document.getElementById("playlist")
    if (data.length > 0) {
        document.getElementById("playlistlabel").innerText = "Playlist: "
    } else {
        document.getElementById("playlistlabel").innerText = ""
    }

    for (var song of data) {
        var playlistsong = document.createElement("li")
        playlistsong.innerText = song.name
        playlist.appendChild(playlistsong)
    }
    console.log("playlist req")
})

function musicreq() {
    var val = document.querySelector('#music-input').value;
    var p = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
    if (val.length > 1) {
        if(val.match(p)){
            socket.emit('musicreq', val)
        }
        document.querySelector('#music-input').value = ""
        document.getElementById("music-input").placeholder = "Request sent!"
    }
    socket.emit("playlist")
}

function tweet() {
    var val = document.querySelector('#tweet-input').value;
    if (val.length > 1) {
        var data = {
            tweet:val,
            id:socket.id
        }
        socket.emit('tweet', data)
        document.querySelector('#tweet-input').value = ""
        document.getElementById("tweet-input").placeholder = "Message sent!"
    }
}


//Movement
var keys = {
    w: false,
    a: false,
    s: false,
    d: false
};

function sendpos() {
    if (keys['w'] == true) { y = y - speed}
    if (keys['a'] == true) { x = x - speed; facing = "left"} 
    if (keys['s'] == true) { y = y + speed}
    if (keys['d'] == true) { x = x + speed; facing = "right"} 
    var data = {
        id: socket.id,
        x: x,
        y: y,
        character: character,
        facing: facing
    };
    localStorage.setItem("charactername", charactername)
    localStorage.setItem("character", character)
    localStorage.setItem("x", x)
    localStorage.setItem("y", y)
    if (x > 7606 || x < 76 || y > 2806 || y < 186) {
        x = lastcoords.x
        y = lastcoords.y
    }   else {
        lastcoords.x = x
        lastcoords.y = y
    }
    socket.emit('usr', data)
}

addEventListener("keydown", (event) => {
    

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
        case 69:
            document.getElementById('myModal').style.display = 'block'
            
            
            break;
        case 27:
            document.getElementById('myModal').style.display = 'none';
            
    }

    const musicInput = document.getElementById("music-input")
    musicInput.addEventListener("keyup", function(event) {
        if (event.keyCode == 13) {
            musicreq()
            socket.emit("playlist")
        }
    });

    const tweetInput = document.getElementById("tweet-input")
    tweetInput.addEventListener("keyup", function(event) {
        if (event.keyCode == 13) {
            tweet()
        }
    })

    sendpos()
    var displayx = x - 3840
    var displayy = y - 1504
    // if (displayx > -700 && displayx < -130 && displayy > -300 && displayy < 270) {
    //     document.getElementById("input-div").style.setProperty("visibility", "visible") 
    // } else {
    //     document.getElementById("input-div").style.setProperty("visibility", "hidden")  
    // }
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
        case 69:
            socket.emit("playlist")
            break;
    }
    
    sendpos()
});


//Voice
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
        
        var data = {
            b:blob,
            id: socket.id
        };
        if (miclvl > 0.005   ) {
            socket.emit('voice', data);
        }
        
    };

    // Start recording
    mediaRecorder.start();

    // Stop recording after 5 seconds and broadcast it to server
    setInterval(function() {
        mediaRecorder.stop()
        mediaRecorder.start()

    }, 250);
}); 



socket.on('voice', function(data) {
    objIndex = dots.findIndex((obj => obj.id == data.id));
    function distanceFunction( x1, y1, x2, y2 ) {
	
        var 	xs = x2 - x1,
            ys = y2 - y1;		
        
        xs *= xs;
        ys *= ys;
         
        return Math.sqrt( xs + ys );
    };
    dots.length > 0 ? distance = distanceFunction(x,y,dots[objIndex].x,dots[objIndex].y) : distance = 100;
    
    var blob = new Blob([data.b], { 'type' : 'audio/ogg; codecs=opus' });
    var audio = document.createElement('audio');
    audio.src = window.URL.createObjectURL(blob);
    if (distance > 500) {
        audio.volume = 0.01
    }
    if (distance > 150 && distance < 500) {
        audio.volume = 0.3
    }
    if (distance < 150) {
        audio.volume = 1
    }
    audio.play();
});


//Change character
function changeChar() {
    document.getElementById("current-char").innerText = "current: " + charactername
    switch (character) {
        case "a": 
            charactername = "Myon"
            character = "b"
            break;
        case "b":
            charactername = "404"
            character = "c"
            break;
        case "c": 
            charactername = "Eric"
            character = "a"
            break;
    }
    sendpos()
    document.getElementById("current-char").innerText = "current: " + charactername
}

console.log("hello there! i see you are quite curious, here's the git repo of this https://github.com/loloide/Uodrum")   
