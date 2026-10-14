import { randomBytes } from "node:crypto";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

// Every test worker gets isolated records and never changes the owner's catalog.
process.env.ARTIQUE_DATA_DIR = mkdtempSync(path.join(tmpdir(), "artique-tests-"));

process.env.ARTIQUE_STORAGE = "local";
delete process.env.VERCEL;
process.env.SESSION_SECRET = randomBytes(32).toString("hex");
