import { Injectable } from '@angular/core';


interface ColorToLaunchpad {
	RGBColor: Array<number>,
	LaunchpadColor: number
}

const RgbToLaunchpad: Array<ColorToLaunchpad> = [
	{
		RGBColor: [250, 0, 40],
		LaunchpadColor: 0b000011
	},
	{
		RGBColor: [250, 170, 0],
		LaunchpadColor: 0b100011
	},
	{
		RGBColor: [250, 215, 0],
		LaunchpadColor: 0b110011
	},
	{
		RGBColor: [190, 255, 0],
		LaunchpadColor: 0b110010
	},
	{
		RGBColor: [0, 255, 40],
		LaunchpadColor: 0b110000
	}
]

@Injectable()
export class ColorsConverterService {

	mapRgbToLaunchpad = new Map<Array<number>, number>();

	private DisanceRGB(RGBa:Array<number>, RGBb:Array<number>):number{
		return Math.sqrt(
			(Math.pow(RGBa[0] - RGBb[0], 2.0)) + 
			(Math.pow(RGBa[1] - RGBb[1], 2.0)) +
			(Math.pow(RGBa[2] - RGBb[2], 2.0))
		);
	}
	private GetClosestColor(RGBa:Array<number>):number{
		let minDelta = Number.MAX_SAFE_INTEGER;
		return RgbToLaunchpad.reduce((minColor, currentColor) => {
			let newDelta = this.DisanceRGB(RGBa, currentColor.RGBColor);
			if(newDelta < minDelta)
			{
				minDelta = newDelta;
				return currentColor.LaunchpadColor;
			}
			return minColor;
		}, RgbToLaunchpad[0].LaunchpadColor);
	}
	public FindLaunchpadColor(color: Array<number>): number {
		let existingLaunchpadColor = this.mapRgbToLaunchpad.get(color);
		if (existingLaunchpadColor != null) {
			return existingLaunchpadColor;
		}
		else {
			let closestLaunchpadColor = this.GetClosestColor(color);
			this.mapRgbToLaunchpad.set(color, closestLaunchpadColor);
			return closestLaunchpadColor;
		}
	}
	constructor() { }
}
