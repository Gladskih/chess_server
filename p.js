var io = require('socket.io').listen(81);
var fs = require('fs');
var AloneRoom;

function Log(data)
{
	fs.appendFile('message.txt', data, function (err) {
	  if (err) throw err;
	});
}
//We need to set listener functions in one list and dont use removeEventListener
io.sockets.on('connection', function (socket) {
	socket.emit("connected");
	AloneRooms.pop
	// socket.on('message', function(data) {
		// console.log('* ' + socket.id + ': ' + data);
		// //socket.emit('resp', data + ' too');
		// socket.broadcast.emit('resp', data);
	// });
	socket.on('readyToPlay', function(data) {		
		if (AloneRoom)
		{
			socket.join(AloneRoom);
			Log("Room #" + AloneRoom + "is full.");
			io.sockets.in(AloneRoom).emit("gameStarted");
			io.sockets.in(AloneRoom).on("makeMove", function(data)
			{
				if (data.xfrom && data.yfrom && data.xto && data.yto)
					socket.broadcast.to(AloneRoom).emit("makeMove", data);
				else
				{
					io.sockets.in(AloneRoom).emit("disconnect", false);
					io.sockets.in(AloneRoom).disconnect();
					Log(AloneRoom + "must be leaved.");
					//io.sockets.in(AloneRoom).leave(AloneRoom);
				}
			});
			AloneRoom = undefined;
		}
		else
		{
			AloneRoom = socket.id;
			socket.join(AloneRoom);
			Log("Room #" + AloneRoom + "has been created.");
			socket.emit("waitingForPlayers");
		}
	});
		// console.log('* ' + socket.id + ' selected room ' + data);
		// socket.join(data);
		// socket.leave('');
		// console.log(io.sockets.clients[data]);
		// console.log(io.sockets.manager.rooms);
	socket.on('leave_room', function(data) {
		console.log('* ' + socket.id + ' left room' + data);
		socket.leave(data);
		socket.join('');
	});
	socket.on('message', function(data) {
		if (data.room)
			socket.broadcast.to(data.room).emit('message', '* ' + socket.id + ': ' + data.msg)
		else
			socket.broadcast.emit('message', '* ' + socket.id + ': ' + data.msg)
	});
});