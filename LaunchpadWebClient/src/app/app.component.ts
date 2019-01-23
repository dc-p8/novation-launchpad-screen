import { Component } from '@angular/core';
import {Client} from '../classes/Client';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
})
export class AppComponent {
	availableInputs = [];
	availableOutputs = [];
	title = 'LaunchpadWebClient';
	clients:Array<Client> = [];
	DeleteClient(client:Client){
		this.clients.splice(this.clients.indexOf(client), 1);
	}
	AddClient(){
		this.clients.push(new Client());
	}
	ngOnInit()
	{
	}
}
