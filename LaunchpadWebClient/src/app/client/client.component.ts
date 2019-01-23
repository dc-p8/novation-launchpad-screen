import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Client } from 'src/classes/Client';
import { MidiDevicesService } from '../midi-devices.service';
import { ReceiveDataService } from '../receive-data.service';
import { ColorsConverterService } from '../colors-converter.service';


@Component({
	selector: 'app-client',
	templateUrl: './client.component.html',
	styleUrls: ['./client.component.scss'],
	providers:[ReceiveDataService]
})
export class ClientComponent implements OnInit {
	availableInputs: Array<WebMidi.MIDIInput> = [];
	availableOutputs: Array<WebMidi.MIDIOutput> = [];

	@Output()
	delete = new EventEmitter<void>();

	@Input()
	client: Client = null;

	Connect(){
		console.log('test')
		console.log(this.client);
		this.client.output.send([0xB0, 0, 0]);
		this.receiveDataService.Reset(this.client.serverUrl);
		//let x = 0;
		//let y = 0;
		//this.client.output.send([0x90, 16*y+x, 0b110000]);
	}
	Delete() {
		if(this.client && this.client.input){
			this.client.input.close();
		}
		if(this.client && this.client.output){
			this.client.output.close();
		}
		this.receiveDataService.CloseConnection();
		this.delete.emit();
	}
	constructor(
		private midiDevicesService: MidiDevicesService,
		private receiveDataService: ReceiveDataService,
		private colorsConverterService: ColorsConverterService) {
	}

	ngOnInit() {
		this.midiDevicesService.GetInputs().subscribe((inputs) => {
			this.availableInputs = inputs;
		});
		this.midiDevicesService.GetOutputs().subscribe((outputs) => {
			this.availableOutputs = outputs;
		});
		this.receiveDataService.GetAction().subscribe((action) => {
			console.log('received action', action);
			if(
				this.client &&
				this.client.output &&
				this.client.output.state == 'connected' /*&&
				this.client.output.connection == 'open' */)
			{
				let launchpadColor = this.colorsConverterService.FindLaunchpadColor([action.r, action.g, action.b]);
				console.log('output color ', launchpadColor);
				this.client.output.send([0x90, 16 * action.y + action.x, launchpadColor]);
				//TODO:ENVOYER la couleur au launchpad
			}
		});
	}
}
