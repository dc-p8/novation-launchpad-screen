import * as net from "net"
import * as readline from "readline"
import * as fs from "fs"
import * as Jimp from "jimp";

class Position{
    x:number = 0;
    y:number = 0;
}

class Client{
    socket:net.Socket;
    position:Position = {x:0, y:0};
    active:boolean = false;
}

enum ClientType{
    LAUNCHPAD,
    IMG,
    NONE
}

export class LaunchpadServer{
    img:Jimp;
    imgSender:net.Socket = null;
    server:net.Server = null;
    launchpadClients:Array<Client> = []
    min_x = 0;
    min_y = 0;
    max_x = 0;
    max_y = 0;
    width = 0;
    height = 0;
    ratio = 1;

    CheckPosition(p:Position):boolean
    {
        return (this.launchpadClients.find((client) => {
            return client.position == p;
        }) || null) != null;
    }

    FindEmptySlot():Position|null{
        for(let y = this.min_y; y < this.max_y; y+=1){
            for(let x = this.min_x; x < this.max_x; x+=1){
                if(this.CheckPosition({y:y, x:x}))
                    return({y:y, x:x});
            }
        }
        return null;
    }
    AddClient(client:Client){
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
        console.log('updating image');
        
        if(fs.existsSync('image')){
            Jimp.read('image').then((img) => {
                console.log('success');
                img.resize(this.width * 8, this.height * 8, Jimp.RESIZE_NEAREST_NEIGHBOR);
                for(let y = 0; y < this.height; ++y){
                    for(let x = 0; x < this.width; ++x){
                        let partImg = img.crop(x, y, 8, 8);
                        partImg.write(`debug-${y}-${x}`);
                    }
                }
            }).catch((err) => {

            })
        }
    }
    
    UpdateLayout(){
        console.log('reseting layout');
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
        if((this.launchpadClients.length > 0) &&
            (prevHeight != this.height || prevWidth != this.width)){
            this.UpdateImage();
        }

    }

    RemoveClient(client:Client){
        let index = this.launchpadClients.indexOf(client, 0);
        if (index > -1) {
            this.launchpadClients.splice(index, 1);
        }
        this.UpdateLayout();
    }
    

    SetupServer(port:number){
        this.server = net.createServer((socket) => {
            let clientType = ClientType.NONE;
            let buffer:Buffer = Buffer.alloc(0, '');
            console.log('client connected : ' + socket.remoteAddress + ':' + socket.remotePort);
    
            socket.on('data', (data) => {

                if(data.toString() == 'launchpad client'){
                    if(clientType == ClientType.NONE)
                    {
                        clientType = ClientType.LAUNCHPAD;
                        let client = new Client()
                        client.socket = socket;
                        this.AddClient(client);
                        socket.on('end', () => {
                            this.RemoveClient(client);
                            console.log('launchpad client disconected : ' + socket.remoteAddress);
                        });
                    }
                    else{
                        console.log('client already set');
                    }
                }
                else if(data.toString() == 'img client'){
                    if(clientType == ClientType.NONE){
                        if(!this.imgSender){
                            clientType = ClientType.IMG;
                            this.imgSender = socket;
                        }
                        socket.on('end', () => {
                            console.log('img client disconected : ' + socket.remoteAddress);
                            this.imgSender = null;
                        });
                        console.log('sending ok');
                        socket.write('ok');
                    }
                }
                if(clientType == ClientType.IMG){
                    if(data.toString() == 'sending image'){
                        let filestream = fs.createWriteStream('image');
                        socket.pipe(filestream);
                        filestream.on('close', () => {
                            console.log('FILESTREAM CLOSE');
                        });
                    }
                    
                    if(data.toString() == 'finished'){
                        console.log('RECEIVED finished');
                        // console.log('end file');
                        // fs.writeFileSync("out.png", buffer);
                        // buffer = new Buffer('');
                    }
                    
                    //console.log('\nreceived from img client : ', data.toString().substr(0, 10), data.length);
                }
            });
        });
        this.server.listen(port, () => {
            console.log('server open on port ' + port);
        });
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
                    console.log('client : ' + index + ' - ' + client.socket.remoteAddress + ':' + client.socket.remotePort + ' ' + JSON.stringify(client.position) + ' active : ' + client.active);
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
    
    constructor(port:number)
    {
        this.SetupCLI();
        this.SetupServer(port);
        fs.watchFile('image', () => {
            console.log('file changed');
            this.UpdateImage();
        });
    }
}