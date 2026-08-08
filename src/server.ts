import dotenv from "dotenv";
import app from "./app.js";
import { startSnapshotCleanupJob } from "./jobs/snapshot.cleanup.job.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

startSnapshotCleanupJob();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});