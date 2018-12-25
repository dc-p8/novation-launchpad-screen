import * as net from "net";
import * as readline from "readline";
import * as fs from "fs";

export class LaunchpadClient{
    constructor(host:string, p:Number)
    {
        let socket = net.createConnection({
            port:Number(p),
            host
        }, () => {
            socket.write('launchpad client');
            console.log('launchpad client connected to server!');
        });
        socket.on('data', (data) => {
            console.log('launchpad client received : ' + data);
        });
        socket.on('end', () => {
            console.log('launchpad client desc');
        });
    }
}

export class FakeImgClient{
    constructor(host:string, p:Number)
    {
        let socket = net.createConnection({
            port:Number(p),
            host
        }, () => {
            socket.write('img client');
            console.log('img client connected to server!');
        });
        socket.on('data', (data) => {
            if(data.toString() == 'ok'){
                console.log('sending image');
                socket.write('sending image');
                let stream = fs.createReadStream("img/Lenna.png");

                    socket.once('drain', () => {
                        console.log('finished');
                        socket.write('finished');
                    })
                    
                    setTimeout(() => {
                        
                    }, 100);
                    
                
                stream.pipe(socket, {
                    end:false
                });
                /*
                socket.once('unpipe', () => {
                    
                    //
                });
                */
            }
            console.log('img client received : ' + data);
        });
        socket.on('end', () => {
            console.log('img client desc');
        });
    }
}