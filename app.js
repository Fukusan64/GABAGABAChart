var fs = require('fs');
var server = require('http').createServer((req, res) => {
	switch (req.url) {
		//HTML
		case '/':
			res.writeHead(200, {'Content-Type': 'text/html'});
			res.end(fs.readFileSync('./view/index.html', 'utf-8'));
			console.log(`\u001b[32mGET\u001b[37m:${req.url}\u001b[0m`);
			break;
		//CSS
		case '/css/font-awesome.min.css':
			res.writeHead(200, {'Content-Type': 'text/css'});
			res.end(fs.readFileSync('./public/css/font-awesome.min.css', 'utf-8'));
			console.log(`\u001b[32mGET\u001b[37m:${req.url}\u001b[0m`);
			break;
		case '/css/style.css':
			res.writeHead(200, {'Content-Type': 'text/css'});
			res.end(fs.readFileSync('./public/css/style.css', 'utf-8'));
			console.log(`\u001b[32mGET\u001b[37m:${req.url}\u001b[0m`);
			break;
		//FONT
		case '/fonts/fontawesome-webfont.eot?v=4.7.0':
			res.writeHead(200, {'Content-Type': 'application/vnd.ms-fontobject'});
			res.end(fs.readFileSync('./public/fonts/fontawesome-webfont.eot'), 'binary');
			console.log(`\u001b[32mGET\u001b[37m:${req.url}\u001b[0m`);
			break;
		case '/fonts/fontawesome-webfont.svg?v=4.7.0':
			res.writeHead(200, {'Content-Type': 'image/svg'});
			res.end(fs.readFileSync('./public/fonts/fontawesome-webfont.svg'), 'binary');
			console.log(`\u001b[32mGET\u001b[37m:${req.url}\u001b[0m`);
			break;
		case '/fonts/fontawesome-webfont.ttf?v=4.7.0':
			res.writeHead(200, {'Content-Type': 'application/x-font-ttf'});
			res.end(fs.readFileSync('./public/fonts/fontawesome-webfont.ttf'), 'binary');
			console.log(`\u001b[32mGET\u001b[37m:${req.url}\u001b[0m`);
			break;
		case '/fonts/fontawesome-webfont.woff?v=4.7.0':
			res.writeHead(200, {'Content-Type': 'application/font-woff'});
			res.end(fs.readFileSync('./public/fonts/fontawesome-webfont.woff'), 'binary');
			console.log(`\u001b[32mGET\u001b[37m:${req.url}\u001b[0m`);
			break;
		case '/fonts/fontawesome-webfont.woff2?v=4.7.0':
			res.writeHead(200, {'Content-Type': 'application/font-woff2'});
			res.end(fs.readFileSync('./public/fonts/fontawesome-webfont.woff2'), 'binary');
			console.log(`\u001b[32mGET\u001b[37m:${req.url}\u001b[0m`);
			break;
		case 'public/fonts/FontAwesome.otf?v=4.7.0':
			res.writeHead(200, {'Content-Type': 'application/x-font-otf'});
			res.end(fs.readFileSync('./public/fonts/FontAwesome.otf'), 'binary');
			console.log(`\u001b[32mGET\u001b[37m:${req.url}\u001b[0m`);
			break;
		//JS
		case '/js/main.js':
			res.writeHead(200, {'Content-Type': 'text/javascript'});
			res.end(fs.readFileSync('./public/js/main.js', 'utf-8'));
			console.log(`\u001b[32mGET\u001b[37m:${req.url}\u001b[0m`);
			break;
		//OTHER(404)
		default:
			res.writeHead(404, {'Content-Type': 'text/html'});
			res.end('<h1>Error 404: Not Found...</h1>');
			console.log(`\u001b[31mERR\u001b[37m:${req.url} is not found.\u001b[0m`);
			console.error(new Error('404 Not Found'));
			break;
	}
}).listen(3000, () => console.log('Server Runing!'));

var io = require('socket.io').listen(server);

var userHash = {};
var userCount = 0;
io.on('connection', (socket) => {
	socket.on('c2sLoginNotice', (data) => {
		if(Object.keys(userHash).length < 50) {
			var userName = data.name;
			userHash[socket.id] = userName;
			socket.emit("s2cLoginStatusMessage", {error: false});
			io.sockets.emit(
				's2cLoginNotice',
				{message: `${userName}さんが参加しました`}
			);
			console.log(`[Chat] Join: {Account: ${userName}(socketID:${socket.id}), MemberCount: ${Object.keys(userHash).length}}`);
		}else{
			socket.emit("s2cLoginStatusMessage", {error: true, message: `すみません,接続数が多いため参加できません.`});
			console.log(`[Chat] Can't Join: {Account: ${userName}(socketID:${socket.id}), MemberCount: ${Object.keys(userHash).length}}`);
		}
	});

	socket.on('c2sChatMessage', (data) => {
		var userName = userHash[socket.id];
		if (userName) {
			io.sockets.emit(
				's2cChatMessage',
				{
					name: userName,
					fromId: socket.id,
					message: data.message
				}
			);
		}
		console.log(`[Chat] sendMessage: {Account: ${userName}(socketID:${socket.id}), Message: ${data.message}}`);
	});

	socket.on('disconnect', () => {
		var userName = userHash[socket.id];
		if (userName) {
			delete userHash[socket.id];
			io.sockets.emit(
				's2cDisconnectNotice',
				{message: `${userName}さんが退会しました`}
			);
			console.log(`[Chat] Logout: {Account: ${userName}(socketID:${socket.id}), MemberCount: ${Object.keys(userHash).length}}`);
		}
	});
});