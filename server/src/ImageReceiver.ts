import * as net from "net"
import * as readline from "readline"
import * as fs from "fs"
import * as Jimp from "jimp";



export class ImageReceiver{
    img:Jimp;
    imgSender:net.Socket = null;
    server:net.Server = null;
    
    SetupServer(port:number){
        this.server = net.createServer((socket) => {
            console.log('Image receiver : client connected : ' + socket.remoteAddress + ':' + socket.remotePort);
            let timer = null;
            socket.on('data', (data) => {
                let stringData = data.toString();
                
                if(stringData == 'client_ready'){
                    socket.write('send_me_a_file');
                    /*
                    timer = setInterval(() => {
                        socket.write('send_me_a_file');
                    }, 1000);
                    */
                }
                if(stringData == 'sending_file'){
                    let filestream = fs.createWriteStream('image.png');
                    socket.pipe(filestream);
                    
                    filestream.on("close", () => {
                        console.log('Image receiver : server side stream closed');
                    });
                    socket.read();
                    socket.on('data', (d) => {
                        //console.log('DATA');
                        if(d.toString() == 'finished'){
                            filestream.end();
                        }
                    })
                }
            });
            socket.on('end', () => {
                console.log('Image receiver : disc');
                if(timer != null)
                    clearInterval(timer);
            })
        });
        this.server.listen(port, () => {
            console.log('Image receiver : server open on port ' + port);
        });
    }

    
    
    constructor(port:number)
    {
        this.SetupServer(port);
        
    }
}