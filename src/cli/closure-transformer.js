const spawnSync = require('child_process').spawnSync
const ClosureCompiler = require('google-closure-compiler').compiler

ClosureCompiler.prototype.runSync = function () {
  if (this.logger) {
    this.logger(this.getFullCommand() + '\n')
  }

  return spawnSync(this.javaPath, this.commandArguments, this.spawnOptions)
}

var flags = {
  js: './src/**/*.js',
  compilation_level: 'SIMPLE',
  externs: 'src/externs.js',
  debug: true,
  formatting: 'pretty_print',
  dependency_mode: 'STRICT'
}

/**
 * goog.module('my.test.example')
 * const MyClass = goog.require('my.class')
 *
 * test('something', () => {
 *   expect(true).toBe(true)
 * })
 */

const moduleRegex = /goog\.module\((?:'|")(.*?)(?:'|")\)/

const crypto = require('crypto')

function createCacheKey () {
  return (src, file, configString, options) => {
    return crypto
      .createHash('md5')
      .update(process(src, file))
      .update(options && options.instrument ? 'instrument' : '')
      .digest('hex')
  }
}

function process (src, path) {
  let match = src.match(moduleRegex)
  if (match.length > 1) {
    flags['entry_point'] = `goog:${match[1]}`
  }
  let closureCompiler = new ClosureCompiler(flags)
  let child = closureCompiler.runSync()
  if (child.status !== 0) {
    throw new Error(child.stderr.toString())
  }
  return child.stdout.toString()
}

module.exports = {
  process: process,
  getCacheKey: createCacheKey()
}
