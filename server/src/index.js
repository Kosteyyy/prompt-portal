import { createApp } from "./app.js";
import { config } from "./config/index.js";

const app = await createApp();
app.listen(config.port, () => console.log(`API: http://localhost:${config.port}`));
