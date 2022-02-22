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
            console.log("Object found inside the array.")
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
 


socket.on('newusr', function(data) {
    console.log(data)
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
            console.log("Left key is pressed.");
            x = x - 2
            break;
        case 38:
            console.log("Up key is pressed.");
            y = y - 2 
            break;
        case 39:
            console.log("Right key is pressed.");
            x = x + 2
            break;
        case 40:
            console.log("Down key is pressed.");
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


