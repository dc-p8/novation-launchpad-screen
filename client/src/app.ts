import { LaunchpadClient, FakeImgClient} from "./client";

let server = new LaunchpadClient('localhost', 5000)

let fakeImgClient = new FakeImgClient('localhost', 5000);