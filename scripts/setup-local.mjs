import { existsSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";

process.chdir(path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."));
if (existsSync(".env.local")) {
  console.log("Existing .env.local preserved. Ensure local storage and your own credentials are configured.");
} else {
  const username = "showcase_owner";
  const password = randomBytes(18).toString("base64url");
  const secret = randomBytes(32).toString("hex");
  writeFileSync(".env.local", `ARTIQUE_STORAGE=local\nADMIN_USERNAME=${username}\nADMIN_PASSWORD=${password}\nSESSION_SECRET=${secret}\nNEXT_PUBLIC_SITE_URL=http://localhost:3000\n`, { mode: 0o600 });
  writeFileSync("LOCAL-ACCESS.txt", `Local demo only\nhttp://localhost:3000/admin\nUsername: ${username}\nPassword: ${password}\nDo not share or commit this file.\n`, { mode: 0o600 });
  console.log("Local demo configured. Your generated credentials are in the ignored LOCAL-ACCESS.txt file. Run npm run dev -- --hostname 127.0.0.1");
}
