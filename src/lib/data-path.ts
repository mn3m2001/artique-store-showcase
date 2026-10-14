import path from "node:path";

export function dataDirectory() {
  return process.env.ARTIQUE_DATA_DIR || path.join(process.cwd(), ".demo-data");
}
