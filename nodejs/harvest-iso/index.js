#!/usr/bin/env node

var yargs = require('yargs')
  , async = require('async')
  , lib = require('./lib')
  ;

// Command line parameters
var args = yargs.usage('Command line utility for mapping iso to cinergi json')

  .alias('f', 'file')
  .describe('f', 'convert iso data in a text file to cinergi json')

  .alias('o', 'out')
  .describe('')

  .alias('s', 'stdout')
  .describe()

  .alias('j', 'json')
  .describe('j', 'convert iso data in a json string to cinergi json')

  .alias('r', 'rest')
  .describe('r', 'rest server to receive iso data and return cinergi json')

  .argv;

var queue = [];
if (argv.file) queue.push(textFile);
if (argv.json) queue.push(jsonString);
if (argv.rest) queue.push(restServer);

function textFile () {
  async.waterfall([
    function (callback) {
      lib.read(argv.file, function (err, data) {
        if (err) throw err;
        callback(null, data);
      })
    },
    function (data, callback) {
      lib.jsonOrXml(data, function (err, data) {
        if (err) throw err;
        callback(null, data);
      })
    },
    function (iso, callback) {
      lib.mapIsoToCinergi(iso, function (err, data) {
        if (err) throw err;
        callback(null, data);
      })
    },
    function (cinergi, callback) {
      lib.write(argv.out, cinergi, function (err) {
        if (err) throw err;
        callback(null, 'done');
      })
    }
  ], function (err) {
    if (err) throw err;
    console.log('Successfully mapped', argv.file, 'to', argv.out);
  })
}

function jsonString () {

}

function restServer () {

}