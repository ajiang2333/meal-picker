import { spawn } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const [command = "build", platform = "h5"] = process.argv.slice(2);
const appRoot = process.cwd();
const manifestPath = resolve(appRoot, "src", "manifest.json");
const originalManifest = readFileSync(manifestPath, "utf8");
let restored = false;
let child;

const env = {
  ...process.env,
  ...loadEnvFile(resolve(appRoot, ".env")),
  ...loadEnvFile(resolve(appRoot, ".env.local")),
  ...loadEnvFile(resolve(appRoot, ".env." + platform)),
  ...loadEnvFile(resolve(appRoot, ".env." + platform + ".local"))
};

env.VITE_API_BASE = (env.VITE_API_BASE || "http://127.0.0.1:8787/api").replace(/\/$/, "");

writeManifestForPlatform(platform, env);

const uniCli = resolve(appRoot, "node_modules", "@dcloudio", "vite-plugin-uni", "bin", "uni.js");
const uniArgs = command === "dev" ? [uniCli, "-p", platform] : [uniCli, "build", "-p", platform];
try {
  child = spawn(process.execPath, uniArgs, {
    cwd: appRoot,
    env,
    stdio: "inherit"
  });
} catch (error) {
  restoreManifest();
  throw error;
}

child.on("exit", (code, signal) => {
  restoreManifest();
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 0);
});

child.on("error", (error) => {
  restoreManifest();
  console.error(error);
  process.exit(1);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    if (child && !child.killed) child.kill(signal);
    restoreManifest();
    process.exit(signal === "SIGINT" ? 130 : 143);
  });
}

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return {};
  const result = {};
  const content = readFileSync(filePath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const index = line.indexOf("=");
    if (index < 0) continue;
    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();
    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }
  return result;
}

function writeManifestForPlatform(targetPlatform, currentEnv) {
  const manifest = JSON.parse(originalManifest.replace(/^\uFEFF/, ""));
  if (currentEnv.VITE_MP_WEIXIN_APPID) {
    manifest["mp-weixin"] = manifest["mp-weixin"] || {};
    manifest["mp-weixin"].appid = currentEnv.VITE_MP_WEIXIN_APPID;
  }
  if (currentEnv.VITE_MP_ALIPAY_APPID) {
    manifest["mp-alipay"] = manifest["mp-alipay"] || {};
    manifest["mp-alipay"].appid = currentEnv.VITE_MP_ALIPAY_APPID;
  }

  if (targetPlatform === "mp-weixin" && !manifest["mp-weixin"]?.appid) {
    console.warn("[miniapp-env] VITE_MP_WEIXIN_APPID is empty. WeChat DevTools may ask for an AppID.");
  }
  if (targetPlatform === "mp-alipay" && !manifest["mp-alipay"]?.appid) {
    console.warn("[miniapp-env] VITE_MP_ALIPAY_APPID is empty. Alipay DevTools may ask for an AppID.");
  }

  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");
}

function restoreManifest() {
  if (restored) return;
  writeFileSync(manifestPath, originalManifest, "utf8");
  restored = true;
}

