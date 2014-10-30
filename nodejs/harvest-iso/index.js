#!/usr/bin/env node

var program = require('commander')
  , async = require('async')
  , lib = require('./lib')
  , transform = require('./lib/transform')
  ;

program
  .version('0.0.1')
  .option('-i, --input [value]', 'Text file containing data to be transformed')
  .option('-o, --output [value]', 'Text file to write transformed data out to')
  .option('-s, --stream', 'Operate on a stream of text')
  .option('-h, --hydro10', 'Use transformation method for Hydro10 metadata')
  .option('-c, --czo', 'Use transformation method for CZO metadata')
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

var algorithm;
if (program.hydro10) algorithm = transform.isoMap;
if (program.czo) algorithm = transform.czoMap;

var queue = [];
if (program.input && program.output) queue.push(text);
if (program.stream) queue.push(stream);
if (program.rest) queue.push(rest);
async.series(queue);

function text (input, output, method, callback) {
  if (!input || typeof input === 'function') {
    input = program.input;
  }
  if (!output || typeof output === 'function') {
    output = program.output;
  }
  if (!method || typeof method === 'function') {
    method = algorithm;
  }
  if (method) {
    switch (method) {
      case 'hydro10':
        method = transform.isoMap;
        break;
      case 'czo':
        method = transform.czoMap;
        break;
    }
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
      method(iso, function (err, data) {
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
        algorithm(iso, function (err, data) {
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