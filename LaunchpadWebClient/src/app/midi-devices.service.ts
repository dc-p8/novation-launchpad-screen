import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscriber} from 'rxjs';
import {debounceTime} from 'rxjs/operators'

@Injectable()
export class MidiDevicesService {
	private $availableInputs = new BehaviorSubject<Array<WebMidi.MIDIInput>>([]);
	private availableInputs = this.$availableInputs.asObservable();

	private $availableOutputs = new BehaviorSubject<Array<WebMidi.MIDIOutput>>([]);
	private availableOutputs = this.$availableOutputs.asObservable();

	public GetInputs() {
		return this.availableInputs;
	}

	public GetOutputs() {
		return this.availableOutputs;
	}


	constructor() {
		console.log('construct midi device service');
		navigator.requestMIDIAccess().then(midiAccess => {
			let o:Observable<void> = Observable.create((observer:Subscriber<void>) => {
				observer.next(); //force device detection if no change happened
				midiAccess.onstatechange = () => {
					observer.next();
				};
			});
			o.pipe(
				debounceTime(100) // because multiple events are fired in the same time and we are interested in only few of them
			).subscribe(() => {
				console.log('device changed');
				this.$availableInputs.next([...midiAccess.inputs.values()]);
				this.$availableOutputs.next([...midiAccess.outputs.values()]);
			});
			
			/*
			this.$availableInputs.next([...midiAccess.inputs.values()]);
			this.$availableOutputs.next([...midiAccess.outputs.values()]);
			midiAccess.onstatechange = () => {
				console.log('device change');
				
			};
			*/
		});
	}
}
