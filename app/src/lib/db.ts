import mongoose from "mongoose";
import { MONGODB_URI } from "@/utils/constants";

const connect = async () => {
  const connectionState = mongoose.connection.readyState;

  if (connectionState === 1) {
    console.log("Database is already connected!");
    return;
  }

  if (connectionState === 2) {
    console.log("Connecting...");
  }

  try {
    mongoose.connect(MONGODB_URI!, {
      dbName: "solventDb",
      bufferCommands: true,
    });

    console.log("Connected!");
  } catch (err: any) {
    console.log("Error: " + err);
    throw new Error("Error: ", err);
  }
};

export default connect;