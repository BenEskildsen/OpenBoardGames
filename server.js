var express = require('express')
    , app = express(app)
    , server = require('http').createServer(app);
var Eureca = require('eureca.io');

var eurecaServer = new Eureca.Server({allow: ['pushResponse']});

eurecaServer.attach(server);

// see browser client side code for index.html content
app.get('/', function (req, res, next) {
    res.sendfile('index.html');
});

app.use(express.static('client'));
server.listen(8000);

//------------------------------------------

var GRID_SIZE = 19;

eurecaServer.clients = {0: null, 1: null};
eurecaServer.colors = ["black", "white"];

function createGameBoard() {
  var grid = [];
  for (var i = 0; i < GRID_SIZE; i++) {
    var row = [];
    for (var j = 0; j < GRID_SIZE; j++) {
      row.push({color: null, response: null});
    }
    grid.push(row);
  }
  return grid;
}
eurecaServer.gameBoard = createGameBoard();

eurecaServer.onDisconnect(function(socket){
  var nextClients = [];
  for (var i = 0; i <= 1; i++) {
    var client = this.clients[i];
    if (client == socket.clientProxy) {
      this.clients[i] = null;
      console.log("player " + (i+1) + " disconnecting");
    }
  }
});

eurecaServer.onConnect(function(socket) {

  if (!this.clients[0]) {
    console.log("player 1 connecting");
    this.clients[0] = socket.clientProxy;
  } else if (!this.clients[1]) {
    console.log("player 2 connecting");
    this.clients[1] = socket.clientProxy;
  }

  if (this.clients[0] && this.clients[1]) {
    this.exports.dispatch({type: "BEGIN_GAME"});
  }
}.bind(eurecaServer));


// functions under "exports" namespace will be exposed to client side
// Client calls dispatch with the action that occurred, then this function
// decides what the server side will do next
eurecaServer.exports.dispatch = function (action) {
  if (action.row && action.col) {
    var wantToDelete = this.gameBoard[action.row][action.col].color !== null;
  }

  // TODO / HACK: this is perfect information...
  for (var z = 0; z <= 1; z++) {
    console.log("executing client number: ", z);
    var client = this.clients[z];
    if (!client) {
      console.log("dispatching without all clients: ", this.clients);
      return;
    }
    if (action.type === "BEGIN_GAME") {
      console.log("begin game called");
      client.pushResponse({type: "BEGIN", gridSize: GRID_SIZE});
      client.pushResponse({type: "SET_INDEX", clientIndex: z});
      // replay game state
      for (var i = 0; i < GRID_SIZE; i++) {
        for (var j = 0; j < GRID_SIZE; j++) {
          if (this.gameBoard[i][j].response) {
            client.pushResponse(this.gameBoard[i][j].response);
          }
        }
      }
      console.log("gonna start sequence");

      client.pushResponse({type: "START_SEQUENCE"});
    } else if (action.type == "CLICK") {
      // HACK: they might be deleting a piece here...
      console.log("detected: ", this.gameBoard[action.row][action.col].color);
      if (wantToDelete) {
        console.log("want to delete a piece");
        // delete piece from board:
        this.gameBoard[action.row][action.col] = {color: null, response: null};
        // replay the game state w/o that piece
        client.pushResponse({type: "CLEAR_CANVAS", gridSize: GRID_SIZE});
        for (var i = 0; i < GRID_SIZE; i++) {
          for (var j = 0; j < GRID_SIZE; j++) {
            if (this.gameBoard[i][j].response) {
              client.pushResponse(this.gameBoard[i][j].response);
            }
          }
        }
        client.pushResponse({type: "START_SEQUENCE"});
      } else {
        console.log("want to add a piece");
        var response = {
          type: "DRAW_CIRCLE",
          coords: { // convert back to canvas space
            x: action.col / (action.gridSize-1) * action.width,
            y: action.row / (action.gridSize-1) * action.height,
          },
          radius: 20,
          color: this.colors[action.clientIndex]
        };
        this.gameBoard[action.row][action.col].response = response;
        this.gameBoard[action.row][action.col].color = this.colors[action.clientIndex];
        client.pushResponse(response);

      }
      client.pushResponse({type: "START_SEQUENCE"});
    } else if (action.type == "RESTART") {
      this.gameBoard = createGameBoard();
      client.pushResponse({type: "BEGIN", gridSize: GRID_SIZE});
      client.pushResponse({type: "SET_INDEX", clientIndex: z});
    }
    console.log("reached end of for loop");
  }
  console.log("reaced end of function");
}.bind(eurecaServer);
//------------------------------------------
