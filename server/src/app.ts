import { LaunchpadServer } from "./server";

let server = new LaunchpadServer(5000)
process.on('SIGINT', () => { console.log("Bye bye!"); process.exit(); });