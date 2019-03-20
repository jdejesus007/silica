#!/usr/bin/env node

// Node Provided modules
const exec = require('child_process').exec
const path = require('path')

// Third party dependencies
const livereload = require('livereload')
const serveStatic = require('node-static')
const watch = require('watch')
const program = require('commander')

var fileServer = new serveStatic.Server('./build', {gzip: true})

program
  .option('-p --port [value]', 'The port to listen on')
  .option('-s --styles [path]', 'Directory of additional style imports relative to the src directory')
  .option('-z --nolivereload', "Don't turn on livereload")
  .option('-d --done [script]', 'Path to a script to run after build')
  .option('-i --ignore [patteern]', 'RegExp pattern of files/folders to ignore')
  .option('-a --additional [path]', 'Directory of additional JS imports relative to the src directory')
  .option('-m --source-map [bool]', 'Create a source map (default = false)')
  .option('-o --optimization-level [int]', 'Optimization level (0 = debug+simple, 1=simple, 2=advanced)')
  .parse(process.argv)

var afterScript = program.done
var styleIncludes = program.styles

var childCallback = function (error, stdout, stderr) {
  console.log(stdout)
  console.error(stderr)

  if (error !== null) {
    console.error('exec error: ' + error)
  } else {
    console.log('Done!')
  }
}

var wait = false

var rebuild = function () {
  if (wait) {
    return
  }
  wait = true
  setTimeout(function () {
    wait = false
  }, 1000)
  console.log('Rebuilding...')
  var cmd = 'silica build'
  if (styleIncludes && styleIncludes.length > 0) {
    cmd += ' -s ' + styleIncludes
  }
  if (afterScript && afterScript.length > 0) {
    cmd += ' -d ' + afterScript
  }
  if (program.ignore && program.ignore.length > 0) {
    cmd += ' -i ' + program.ignore
  }
  if (program.additional && program.additional.length > 0) {
    cmd += ' -a ' + program.additional
  }
  if (program.sourceMap) {
    cmd += ' -m ' + program.sourceMap
  }
  if (program.optimizationLevel) {
    cmd += ' -o ' + program.optimizationLevel
  }
  exec(cmd, childCallback)
}

watch.createMonitor('./src', { 'ignoreDotFiles': true }, function (monitor) {
  monitor.on('created', rebuild)
  monitor.on('changed', rebuild)
  monitor.on('removed', rebuild)
})

function handler (request, response) {
  request.addListener('end', function () {
    fileServer.serve(request, response, function (e, res) {
      if (e && (e.status === 404)) {
        // If the file wasn't found
        fileServer.serveFile('/index.html', 404, {}, request, response)
      }
    })
  }).resume()
}

require('http').createServer(handler).listen(program.port || 8080)

rebuild()

if (!program.nolivereload) {
  var server = livereload.createServer()
  server.watch(path.join(process.cwd(), '/build'))
}
