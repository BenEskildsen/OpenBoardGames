function createHandleClick(width, height, gridSize) {
  return function(event) {
    // snap to grid
    var x = Math.round(event.clientX / width * (gridSize-1));
    var y = Math.round(event.clientY / height * (gridSize-1));

    console.log("click", x, y);
    console.log("client", client.index);

    client.server.dispatch({
      type: "CLICK",
      clientIndex: client.index,
      row: y, col: x,
      gridSize: gridSize,
      width: width,
      height: height
    });
  }

}
