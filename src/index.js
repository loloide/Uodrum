socket = io.connect("http://localhost:3000");
var x = 1
var y = 1

function setup() {
    var canvas = createCanvas(1900, 700);
    canvas.parent("canvasDiv")
    frameRate(30)
}


function draw() {
    //background("#e4e4e4")

    
    noStroke()
    fill("#000000")
    ellipse(x, y, 10, 10)

    var data = {
        x: x,
        y: y
      };
    socket.emit('usr', data);

    socket.on('usr', function(data) {
        noStroke()
        fill("#ff0055")
        ellipse(data.x, data.y, 10, 10)
        
    })
}
