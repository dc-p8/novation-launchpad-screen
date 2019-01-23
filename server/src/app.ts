//import { LaunchpadServer } from "./server";
import { LaunchpadServer } from "./LaunchpadServer";
import {ImageReceiver} from "./ImageReceiver";
//let server = new LaunchpadServer(5000)
let launchpadServer = new LaunchpadServer(3000);
let imageReceiver = new ImageReceiver(3001);
process.on('SIGINT', () => { console.log("Bye bye!"); process.exit(); });