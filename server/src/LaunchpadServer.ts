import http from 'http';
import SocketIO from 'socket.io';
import * as net from "net"
import * as readline from "readline"
import * as fs from "fs"
import Jimp from "jimp";

class Position{
    x:number = 0;
    y:number = 0;
}

class LaunchpadClient{
    position:Position = {x:0, y:0};
    active:boolean = false;
    socket:any;

    SendImage(image:Jimp){
        for(let y = 0; y < 8; y+=1)
        {
            for(let x = 0; x < 8; x+=1)
            {
                let color = Jimp.intToRGBA(image.getPixelColor(x, y));
                this.socket.emit('launchpad:set', {
                    x : x,
                    y : y,
                    r : color.r,
                    g : color.g,
                    b : color.b
                });
            }
        }
    }
}

export class LaunchpadServer{
    launchpadClients:Array<LaunchpadClient> = []
    min_x = 0;
    min_y = 0;
    max_x = 0;
    max_y = 0;
    width = 0;
    height = 0;
    ratio = 1;

    FindClientAt(p:Position):LaunchpadClient
    {
        return this.launchpadClients.find((client) => {
            return p.x == client.position.x && p.y == client.position.y;
        });
    }

    FindEmptySlot():Position|null{
        for(let y = this.min_y; y < this.max_y; y+=1){
            for(let x = this.min_x; x < this.max_x; x+=1){
                if(this.FindClientAt({y:y, x:x}) != null)
                    return({y:y, x:x});
            }
        }
        return null;
    }
    AddClient(client:LaunchpadClient){
        if(this.launchpadClients.length == 0){
            client.active = true;
        }else{
            let emptyslot = this.FindEmptySlot();
            if(emptyslot != null)
            {
                client.position = emptyslot;
                client.active = true;
            }
        }
        this.launchpadClients.push(client);
        this.UpdateLayout();
        
    }

    UpdateImage(){
        console.log('Launchpad server : nb clients : ', this.launchpadClients.length);
        console.log('Launchpad Server : updating image');
        console.log(`Launchpad Server : height ${this.height} width ${this.width}`);
        
        if(fs.existsSync('image.png')){
            Jimp.read('image.png').then((img) => {
                console.log('Launchpad Server : read image success');
                img.resize(this.width * 8, this.height * 8, Jimp.RESIZE_NEAREST_NEIGHBOR);
                for(let y = 0; y < this.height; ++y){
                    for(let x = 0; x < this.width; ++x){
                        let imgClone = img.clone();
                        imgClone.crop(x, y, 8, 8);
                        let client = this.FindClientAt({x:x, y:y});
                        console.log(x, y);
                        console.log('sending to client ' + client);
                        client.SendImage(new Jimp(imgClone));
                        imgClone.write(`debug-${y}-${x}`);
                    }
                }
            }).catch((err) => {
                console.log('Launchpad Server : error ' + err);
            })
        }
    }
    
    UpdateLayout(){
        console.log('Launchpad Server : reseting layout');
        let prevWidth = this.width;
        let prevHeight = this.height;
        if(this.launchpadClients.length == 0){
            this.min_x = 0;
            this.min_y = 0;
            this.max_x = 0;
            this.max_y = 0;
            this.width = 0;
            this.height = 0
            this.ratio = 0;
            return;
        }

        let _min_x = Number.MAX_VALUE;
        let _min_y = Number.MAX_VALUE;
        let _max_x = Number.MIN_SAFE_INTEGER;
        let _max_y = Number.MIN_SAFE_INTEGER;
        for(let client of this.launchpadClients){
            if(client.active == true)
            {
                if(client.position.x < _min_x )
                    _min_x = client.position.x;
                if(client.position.x > _max_x)
                    _max_x = client.position.x;
                if(client.position.y < _min_y)
                    _min_y = client.position.y;
                if(client.position.y > _max_y)
                    _max_y = client.position.y;
            }
        }
        this.min_x = _min_x;
        this.min_y = _min_y;
        this.max_x = _max_x;
        this.max_y = _max_y;
        
        this.width = (this.max_x - this.min_x) + 1;
        this.height = (this.max_y - this.min_y) + 1;
        this.ratio = (this.width / this.height);
        /*
        if((this.launchpadClients.length > 0) && 
            (force ||
            (prevHeight != this.height || prevWidth != this.width)))
        {
            this.UpdateImage();
        }
        */
        if(this.launchpadClients.length > 0)
        {
            this.UpdateImage();
        }
    }

    RemoveClient(client:LaunchpadClient){
        let index = this.launchpadClients.indexOf(client, 0);
        if (index > -1) {
            this.launchpadClients.splice(index, 1);
        }
        this.UpdateLayout();
    }

    SetupCLI(){
        readline.createInterface({
            input:process.stdin,
            terminal:true
        }).on('line', (data:String) => {
            let words = data.trim().split(/\s/)
            if(words[0] == 'p') //print all clients and server state
            {
                console.log('min_x ' + this.min_x);
                console.log('min_y ' + this.min_y);
                console.log('max_x ' + this.max_x);
                console.log('max_y ' + this.max_y);
                console.log('width ' + this.width);
                console.log('height ' + this.height);
                console.log('ratio l ' + this.ratio);
                //console.log(this.clients);
                for(let [index, client] of this.launchpadClients.entries())
                {
                    console.log('client : ' + index + JSON.stringify(client.position) + ' active : ' + client.active);
                }
            }
            else if(words[0] == 'mv') //move client position
            {
                let xy = words[2].split(',')
                this.launchpadClients[Number(words[1])].position = {x:Number(xy[0]), y:Number(xy[1])};
                this.UpdateLayout();
            }
            else if(words[0] == 'on') //set client active
            {
                this.launchpadClients[Number(words[1])].active = true;
                this.UpdateLayout();
            }
            else if(words[0] == 'off') //set client inactive
            {
                this.launchpadClients[Number(words[1])].active = false;
                this.UpdateLayout();
            }
        });
    }

    constructor(port:number){
        
        let server = http.createServer();
        let io = SocketIO(server);
        io.on('connection', (socket) => {
            console.log('Launchpad Server : client connected');
            let launchpadClient = new LaunchpadClient();
            launchpadClient.socket = socket;
            this.AddClient(launchpadClient);

            socket.on('disconnect', () => {
                console.log('Launchpad Server : disc');
                this.RemoveClient(launchpadClient);
            });
        });

        server.listen(port, () => {
            this.SetupCLI();
            console.log('Launchpad Server : Server open on port ' + port);
        });

        // Actualisation des launchpads quand l'image change
        fs.watchFile('image.png', () => {
            console.log('Launchpad Server : file changed');
            this.UpdateImage();
        });
    }
}

