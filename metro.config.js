// // Learn more https://docs.expo.io/guides/customizing-metro
// const { getDefaultConfig } = require('expo/metro-config');

// const { withNativeWind } = require('nativewind/metro');

// /** @type {import('expo/metro-config').MetroConfig} */

// const config = getDefaultConfig(__dirname);

// module.exports = withNativeWind(config, { input: './global.css' });


// Learn more: https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Ajoute les fichiers .hcscript comme assets
config.resolver.assetExts.push("hcscript");

// Ajoute le plugin pour le hashing des assets
config.transformer.assetPlugins = ["expo-asset/tools/hashAssetFiles"];

// Applique NativeWind avec ton fichier CSS
module.exports = withNativeWind(config, { input: "./global.css" });
