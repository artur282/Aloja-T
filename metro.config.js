// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add resolver for Node.js modules used by ws
config.resolver.extraNodeModules = {
  // Minimal set of polyfills needed for ws package
  stream: require.resolve('stream-browserify'),
  https: require.resolve('https-browserify'),
  http: require.resolve('stream-http'),
  crypto: require.resolve('crypto-browserify'),
  events: require.resolve('events'),
  net: require.resolve('net'),
  // Add additional polyfills that might be needed by ws
  url: require.resolve('url'),
  buffer: require.resolve('buffer'),
  process: require.resolve('process/browser'),
  // Add additional utilities that ws might need
  util: require.resolve('util'),
  assert: require.resolve('assert'),
  zlib: require.resolve('browserify-zlib'),
  _stream_duplex: require.resolve('readable-stream/lib/_stream_duplex.js'),
  _stream_passthrough: require.resolve('readable-stream/lib/_stream_passthrough.js'),
  _stream_readable: require.resolve('readable-stream/lib/_stream_readable.js'),
  _stream_transform: require.resolve('readable-stream/lib/_stream_transform.js'),
  _stream_writable: require.resolve('readable-stream/lib/_stream_writable.js')
};

// Allow .cjs files to be processed
config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs'];

module.exports = config;
