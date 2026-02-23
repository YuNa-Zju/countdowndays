import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// 在 ES Module 中手动模拟 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取 package.json
const pkgPath = path.join(__dirname, "../package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
const newVersion = pkg.version;

console.log(`🚀 准备将所有组件版本同步至: v${newVersion}`);

// 1. 同步 tauri.conf.json
const tauriPath = path.join(__dirname, "../src-tauri/tauri.conf.json");
let tauriConf = JSON.parse(fs.readFileSync(tauriPath, "utf8"));
tauriConf.version = newVersion;
fs.writeFileSync(tauriPath, JSON.stringify(tauriConf, null, 2) + "\n");
console.log("✅ tauri.conf.json 已更新");

// 2. 同步 Cargo.toml
const cargoPath = path.join(__dirname, "../src-tauri/Cargo.toml");
let cargoConf = fs.readFileSync(cargoPath, "utf8");
// 精准替换 Cargo.toml 里的 version 字段
cargoConf = cargoConf.replace(
  /^version\s*=\s*".*"/m,
  `version = "${newVersion}"`,
);
fs.writeFileSync(cargoPath, cargoConf);
console.log("✅ Cargo.toml 已更新");

console.log("🎉 版本号全量同步完成！");
