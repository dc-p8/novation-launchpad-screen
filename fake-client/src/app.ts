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
            console.log('img client connected to server!');
        });
        socket.on('data', (data) => {
            let stringData = data.toString();
            console.log('client side', stringData);
            if(stringData == 'send_me_a_file'){
                socket.write('sending_file');
                let stream = fs.createReadStream("input");

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

let client = new Client('localhost', 3001);