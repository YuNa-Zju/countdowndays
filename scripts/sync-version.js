// scripts/sync-version.js
const fs = require("fs");
const path = require("path");
const pkg = require("../package.json");

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
// 使用正则精准替换第一处 version (即 [package] 下的 version)
cargoConf = cargoConf.replace(
  /^version\s*=\s*".*"/m,
  `version = "${newVersion}"`,
);
fs.writeFileSync(cargoPath, cargoConf);
console.log("✅ Cargo.toml 已更新");

console.log("🎉 版本号全量同步完成！");
