import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import {LaunchpadReceiveAction} from '../classes/LaunchpadReceiveAction';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class ReceiveDataService {
  private $receiveAction = new BehaviorSubject<LaunchpadReceiveAction>(null);
  private receiveAction = this.$receiveAction.asObservable();

  private socket:SocketIOClient.Socket = null;

  public CloseConnection(){
    console.log('closing connection');
    if(this.socket){
      this.socket.disconnect();
    }
  }

  public GetAction(){
    return this.receiveAction;
  }
  public Reset(server:string){
    this.CloseConnection();
    console.log(server);
    this.socket = io.connect(server);
    this.socket.on('launchpad:set', (data:LaunchpadReceiveAction) => {
      this.$receiveAction.next(data);
    });
  }
  constructor() {
  }
}
