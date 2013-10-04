"use strict";
process.title = 'node-message';
var webSocketsServerPort = 1337;
var webSocketServer = require('websocket').server;
var http = require('http');
var history = [];
var clients = [];
// function htmlEntities(str) {
// return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g,
// '&gt;').replace(/"/g, '&quot;');
// }

var server = http.createServer(function(request, response) {
}).listen(webSocketsServerPort, function() {
	console.log(" Server is listening on port " + webSocketsServerPort);
});

var wsServer = new webSocketServer({
	httpServer : server
}).on('request', function(request) {
	console.log(' Connection from origin ' + request.origin + '.');
	var connection = request.accept(null, request.origin);
	var index = clients.push(connection) - 1;
	console.log((new Date()) + ' Connection accepted.');

	if (history.length > 0) {
		connection.sendUTF(JSON.stringify({
			type : 'history',
			data : history
		}));
	}

	connection.on('message', function(message) {
				
				var test = JSON.stringify(message);
				console.log("message : " + test);
				// var msg = htmlEntities(message.utf8Data);
				var msg = message.utf8Data; 
				console.log("msg: " + msg);
				var fromClient = JSON.parse(msg);
				console.log("meg memberIdx:" +fromClient.memberIdx);
				console.log("msg productIdx: " + fromClient.productIdx);
				console.log("msg customerIdx: " + fromClient.customerIdx);
				console.log("msg reserveQty: " + fromClient.reserveQty);
				console.log("msg reserveReceiveTime: " + fromClient.reserveReceiveTime);
				console.log("msg reserveMemo: " + fromClient.reserveMemo);
				console.log("msg memberName: " + fromClient.memberName);
				console.log("msg memberId: " + fromClient.memberId);

				var headers = {
					'Content-Type' : 'application/json',
					'Content-Length' : msg.length
				};

				var options = {
					host : 'localhost',
					port : 8080,
					path : '/cpr/reserve/register',
					method : 'POST',
					headers : headers
				};
				// var toAnotherServer = JSON.stringify(msg);
				var req = http.request(options, function(res) {
					console.log('status: ' + res.statusCode);
					console.log('headers: ' + JSON.stringify(res.headers));
					res.setEncoding('utf8');
					res.on('data', function(chunk) {						
						console.log("body: " + chunk);
						// 트랜젝션 처리를 위해 체크값을 받음....
						// 0이 실패 1이 성공 2는 널값...
						if (chunk == 1) {
							console.log("성공");							
							// 성공했으므로 위에있는 주문데이터를
							// 상품에 해당되는 상인에게 특정지어서 보내주자...
						} else if(chunk == 0) {// 실패
							console.log("실패");
						}else {// 으읭?
							console.log("알수없는 오류");
						}
					});
				});
				req.write(msg);
				req.end();

				// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

				var obj = {
					// text: htmlEntities(message.utf8Data)
					text : message.utf8Data
				};
				history.push(obj);
				//history = history.slice(-100);
				history.slice(-1);
							
				// 여기서 메세지 보내주고 있음. 받을곳(clients:상인...)을 잘 지정(해당되는 상인으로)하면됨
				var json = JSON.stringify({
					type : 'message',
					data : obj					
				});
				for ( var i = 0; i < clients.length; i++) {
					console.log(json);
					clients[i].sendUTF(json);
				}
			});
	// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	// user disconnected
	connection.on('close', function(connection) {
		console.log(" Peer " + connection.remoteAddress + " disconnected.");
		// remove user from the list of connected clients
		clients.splice(index, 1);
	});
});