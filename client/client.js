// A client does:
//
// keep a list of responses via pushResponse
// emits on response.type == "START_SEQUENCE"
// register listeners that get a callback whenever this emits
// Ideally just the gameRenderer
// Sends to server with client.serverProxy.dispatch({type: ...})

var client = new Eureca.Client();

client.ready(function(proxy) {
  this.server = proxy;
}.bind(client));

client.responses = [];
client.listeners = [];
client.index = -1;

client.exports.pushResponse = function (response) {
  switch (response.type) {
    case "SET_INDEX":
      this.index = response.clientIndex;
      break;
    case "START_SEQUENCE":
      this.emit();
      this.responses = [];
      break;
    default:
      this.responses.push(response);
  }
}.bind(client);

client.listen = function(fn) {
  this.listeners.push(fn);
}.bind(client);

client.emit = function() {
  for (var i = 0, fn; fn = this.listeners[i]; i++) {
    fn(this.responses);
  }
}.bind(client);
