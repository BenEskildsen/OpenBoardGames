var renderResponses = {};
var WIDTH = 750;
var HEIGHT = 750;

renderResponses.handleSequence = function(sequence) {
  for (var i = 0, response; response = sequence[i]; i++) {
    console.log(response.type);
    switch (response.type) {
      case "DRAW_CIRCLE":
        console.log(response.coords);
        this.renderItem("circle", response.coords, response.color, response.radius);
        break;
      case "CLEAR_CANVAS":
        this.renderBlankCanvas(response.gridSize);
        break;
      case "BEGIN":
        this.renderBlankCanvas(response.gridSize);
        this.listenForClicks(response.gridSize);
        break;
    }
  }
}.bind(renderResponses);

renderResponses.renderItem = function(shape, coords, color, radius) {
  var context = document.getElementById("c").getContext("2d");
  switch (shape) {
    case "circle":
      context.strokeStyle = color;
      context.fillStyle = color;
      context.beginPath();
      context.arc(coords.x, coords.y, radius, 0, 2*Math.PI);
      context.stroke();
      context.fill();
  }
}.bind(renderResponses);

renderResponses.renderBlankCanvas = function(gridSize) {
  var context = document.getElementById("c").getContext("2d");
  context.fillStyle = "beige";
  context.fillRect(0, 0, WIDTH, HEIGHT);

  // render grid lines
  gridSize -= 1; // off-by-one with the edges of the board
  for (var i = 0; i < gridSize; i++) {
    context.strokeStyle = "black";
    context.beginPath();
    // horizontal
    context.moveTo(0, i / gridSize * HEIGHT);
    context.lineTo(WIDTH, i / gridSize * HEIGHT);
    // vertical
    context.moveTo(i / gridSize * WIDTH, 0);
    context.lineTo(i / gridSize * WIDTH, HEIGHT);

    context.stroke();
  }

  // render location markers
  for (var x = 3; x < gridSize; x+=3) {
    for (var y = 3; y < gridSize; y += 3) {
      if (x == 6 || x == 12 || y == 6 || y == 12) {
        continue;
      }
      var row = y / gridSize * WIDTH;
      var col = x / gridSize * HEIGHT;
      context.fillStyle = "black";
      context.beginPath();
      context.arc(row, col, 5, 0, 2*Math.PI);
      context.stroke();
      context.fill();
    }
  }

}.bind(renderResponses);

renderResponses.listenForClicks = function(gridSize) {
  var canvas = document.getElementById("c");
  canvas.addEventListener("mouseup", createHandleClick(WIDTH, HEIGHT, gridSize));
}

client.listen(renderResponses.handleSequence);
