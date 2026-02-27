import { executeText } from "./text.service.js";
import { executeImage } from "./image.service.js";
// import { executeAudio } from "./audio.service.js";
// import { executeVideo } from "./video.service.js";
// import { executeFile } from "./file.service.js";

export const executeAI = async (task) => {
  switch (task.type) {
    case "TEXT":
      return executeText(task);
    case "IMAGE":
      return executeImage(task);
    // case "AUDIO":
    //   return executeAudio(task);
    // case "VIDEO":
    //   return executeVideo(task);
    // case "FILE":
    //   return executeFile(task);
    default:
      throw new Error("Unsupported task type");
  }
};