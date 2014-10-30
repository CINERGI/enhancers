var fs = require('fs')
  , xml2json = require('xml2json')
  , libxmljs = require('libxmljs')
  ;

function read (filename, callback) {
  fs.readFile(filename, 'utf8', function (err, data) {
    if (err) callback(err);
    callback(null, data);
  })
}

function write (filename, data, callback) {
  var json = JSON.stringify(data);
  fs.writeFile(filename, json, function (err) {
    if (err) callback(err);
    callback(null, json);
  })
}

function jsonOrXml (data, callback) {
  var json
    , dataIsXml
    , dataIsJson
    ;

  function checkJson () {
    try {
      JSON.parse(data);
      return true;
    } catch (err) {
      return false;
    }
  }

  function checkXml () {
    try {
      libxmljs.parseXml(data);
      return true;
    } catch (err) {
      return false
    }
  }

  dataIsJson = checkJson();
  dataIsXml = checkXml();

  if (dataIsJson) {
    json = JSON.parse(data);
  } else if (dataIsXml) {
    json = xml2json.toJson(data, {object:true, reversible: true});
  } else {
    callback(new Error('input needs to be either json or xml'));
  }
  callback(null, json);
}

exports.read = read;
exports.write = write;
exports.jsonOrXml = jsonOrXml;
