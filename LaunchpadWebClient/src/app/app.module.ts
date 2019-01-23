import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {FormsModule} from '@angular/forms';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatOptionModule, MatIconModule} from '@angular/material';
import { ClientComponent } from './client/client.component';
import { MidiDevicesService } from './midi-devices.service';
import { ColorsConverterService } from './colors-converter.service';

@NgModule({
  declarations: [
    AppComponent,
    ClientComponent
  ],
  imports: [
    MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatOptionModule, MatIconModule,
    BrowserModule,
    FormsModule,
    BrowserAnimationsModule
  ],
  providers: [
    {
      provide:MidiDevicesService,
      useValue:new MidiDevicesService()
    },
    ColorsConverterService
  ], // force service to be loaded without DI
  bootstrap: [AppComponent],
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
