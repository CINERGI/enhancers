#!/usr/bin/env node

var program = require('commander')
  , async = require('async')
  , lib = require('./lib')
  ;

program
  .version('0.0.1')
  .option('-f, --file', 'convert iso data in a text file to cinergi json')
  .option('-o, --out', 'output text file to write transformed data to')
  .option('-s, --stream', 'perform transformation on a stream of text')
  .parse(process.argv);

var queue = [];
if (program.file && program.out) queue.push(text);
if (program.stream) queue.push(stream);
if (program.rest) queue.push(rest);
async.series(queue);

function text () {
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

// cat test/sample-iso.xml | iso-to-cinergi -s
function stream () {
  var response = '';
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', function (data) {
    response += data;
  });

  process.stdin.on('end', function () {
    async.waterfall([
      function (callback) {
        lib.jsonOrXml(response, function (err, data) {
          if (err) throw err;
          callback(null, data);
        })
      },
      function (iso, callback) {
        lib.mapIsoToCinergi(iso, function (err, data) {
          if (err) throw err;
          var json = JSON.stringify(data);
          callback(null, json);
        })
      }
    ], function (err, res) {
      if (err) throw err;
      process.stdout.write(res);
    })
  })
}