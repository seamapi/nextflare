module.exports = {
  files: ["src/tests/**/*.test.ts"],
  extensions: ["ts"],
  require: ["esbuild-register", "./src/tests/fixture/_setup-browser-env.js"],
  ignoredByWatcher: [".next"],
}
