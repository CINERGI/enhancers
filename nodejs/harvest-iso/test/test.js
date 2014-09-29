var path = require('path')
  , async = require('async')
  , fs = require('fs')
  , lib = require('../lib')
  ;

describe('Map ISO to CINERGI', function () {

  it('should read from text file, transform, write to text', function (done) {
    var testXml = path.join(__dirname, 'sample-iso.xml')
      , outJson = path.join(__dirname, 'sample-out.json')
      ;

    async.waterfall([
      function (callback) {
        lib.read(testXml, function (err, data) {
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
        lib.write(outJson, cinergi, function (err) {
          if (err) throw err;
          callback(null, 'done');
        })
      }
    ], function (err) {
      if (err) throw err;
      fs.unlink(outJson, function (err) {
        if (err) throw err;
        done();
      });
    })
  });

});