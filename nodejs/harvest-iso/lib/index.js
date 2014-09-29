var fs = require('fs')
  , xml2json = require('xml2json')
  , iso2Cinergi = require('./iso-to-cinergi')
  ;

function read (filename, callback) {
  fs.readFile(filename, function (err, data) {
    if (err) callback(err);
    callback(null, data);
  })
}

function write (filename, data, callback) {
  fs.writeFile(filename, data, function (err) {
    if (err) callback(err);
    callback(null, data);
  })
}

function jsonOrXml (data, callback) {
  var json;
  if (JSON.parse(data)) {
    json = JSON.parse(data);
  } else if (JSON.stringify(data)) {
    json = data;
  } else if (xml2json.toJson(data, {object:true, reversible: true})) {
    json = xml2json.toJson(data, {object:true, reversible: true});
  } else {
    callback(new Error('input needs to be either json or xml'));
  }
  callback(null, json);
}

function mapIsoToCinergi (data, callback) {
  iso2Cinergi.map(data, function (err, data) {
    if (err) callback(err);
    callback(null, data);
  })
}

exports.read = read;
exports.write = write;
exports.jsonOrXml = jsonOrXml;
exports.mapIsoToCinergi = mapIsoToCinergi;