#!/usr/bin/env node

var program = require('commander')
  , async = require('async')
  , lib = require('./lib')
  ;

program
  .version('0.0.1')
  .option('-f, --file [value]', 'convert iso data in a text file to cinergi json')
  .option('-o, --out [value]', 'output text file to write transformed data to')
  .option('-s, --stream', 'perform transformation on a stream of text')
  ;

program.on('--help', function () {
  console.log(' Examples:');
  console.log('');
  console.log('   Operate on text files --');
  console.log('   $ iso-to-cinergi -f input.xml -o output.json');
  console.log('');
  console.log('   Operate on streams and UNIX pipes --');
  console.log('   $ cat iso.xml | iso-to-cinergi -s');
  console.log('');
});

program.parse(process.argv);

var queue = [];
if (program.file && program.out) queue.push(text);
if (program.stream) queue.push(stream);
if (program.rest) queue.push(rest);
async.series(queue);

function text (input, output, callback) {
  if (!input || typeof input === 'function') {
    input = program.file;
  }
  if (!output || typeof output === 'function') {
    output = program.out;
  }
  async.waterfall([
    function (callback) {
      lib.read(input, function (err, data) {
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
      lib.map(iso, function (err, data) {
        if (err) throw err;
        callback(null, data);
      })
    },
    function (cinergi, callback) {
      lib.write(output, cinergi, function (err) {
        if (err) throw err;
        callback(null, 'done');
      })
    }
  ], function (err) {
    if (typeof callback === 'function') {
      if (err) callback(err);
      callback(null, {'input': input, 'output': output});
    } else {
      if (err) throw err;
      console.log('Successfully mapped', input, 'to', output);
    }
  })
}

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
        lib.map(iso, function (err, data) {
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

exports.text = text;
exports.stream = stream;