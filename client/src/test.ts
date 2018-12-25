import * as net from "net";
import * as fs from "fs";
import { WriteStream } from "tty";

export class Client{
    constructor(host:string, p:Number)
    {
        let socket = net.createConnection({
            port:Number(p),
            host
        }, () => {
            socket.write('client_ready');
        });
        socket.on('data', (data) => {
            let stringData = data.toString();
            console.log('client side', stringData);
            if(stringData == 'send_me_a_file'){
                socket.write('sending_file');
                let stream = fs.createReadStream("img/Lenna.png");

                stream.on('close', () => {
                    console.log('read stream finished');
                    socket.write('finished');
                });
                
                stream.pipe(socket, {
                    end:false
                });
            }
        });
        socket.on('end', () => {
            console.log('client disconected');
        })
    }
}

export class Server{
    server:net.Server = null;
    constructor(port:number){
        
        this.server = net.createServer((socket) => {
            
            console.log('client connected');
            socket.on('data', (data) => {
                let stringData = data.toString();
                console.log('server side', stringData.substring(0, 10));
                if(stringData == 'client_ready'){
                    socket.write('send_me_a_file');
                }
                
                if(stringData == 'sending_file'){
                    let filestream = fs.createWriteStream('image.png');
                    socket.pipe(filestream);
                    
                    filestream.on("close", () => {
                        console.log('server side stream closed');
                    });
                    socket.read();
                    socket.on('data', (d) => {
                        //console.log('DATA');
                        if(d.toString() == 'finished'){
                            filestream.end();
                        }
                    });
                }
                
                // if(stringData == 'finished'){
                //     console.log('received finished');
                // }
            });
        });
        this.server.listen(port, () => {
            console.log('server listening');
        });
    }
}

let server = new Server(5000);
let client = new Client('localhost', 5000);