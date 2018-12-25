"use strict";
exports.__esModule = true;
var net = require("net");
var fs = require("fs");
var Client = /** @class */ (function () {
    function Client(host, p) {
        var socket = net.createConnection({
            port: Number(p),
            host: host
        }, function () {
            socket.write('client_ready');
        });
        socket.on('data', function (data) {
            var stringData = data.toString();
            console.log('client side', stringData);
            if (stringData == 'send_me_a_file') {
                socket.write('sending_file');
                var stream = fs.createReadStream("img/Lenna.png");
                stream.on('close', function () {
                    console.log('read stream finished');
                    socket.write('finished');
                });
                stream.pipe(socket, {
                    end: false
                });
            }
        });
        socket.on('end', function () {
            console.log('client disconected');
        });
    }
    return Client;
}());
exports.Client = Client;
var Server = /** @class */ (function () {
    function Server(port) {
        this.server = null;
        this.server = net.createServer(function (socket) {
            console.log('client connected');
            socket.on('data', function (data) {
                var stringData = data.toString();
                console.log('server side', stringData.substring(0, 10));
                if (stringData == 'client_ready') {
                    socket.write('send_me_a_file');
                }
                if (stringData == 'sending_file') {
                    var filestream_1 = fs.createWriteStream('image.png');
                    socket.pipe(filestream_1);
                    filestream_1.on("close", function () {
                        console.log('server side stream closed');
                    });
                    socket.read();
                    socket.on('data', function (d) {
                        //console.log('DATA');
                        if (d.toString() == 'finished') {
                            filestream_1.end();
                        }
                    });
                }
                // if(stringData == 'finished'){
                //     console.log('received finished');
                // }
            });
        });
        this.server.listen(port, function () {
            console.log('server listening');
        });
    }
    return Server;
}());
exports.Server = Server;
var server = new Server(5000);
var client = new Client('localhost', 5000);
