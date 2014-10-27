var path = require('path')
  , fs = require('fs')
  , exec = require('child_process').exec
  , index = require('../index.js')
  ;

describe('Map Hydro10 ISO to CINERGI', function () {

  it('should read from text file, transform, write to text', function (done) {
    var testXml = path.join(__dirname, 'sample-hydro10-iso.xml')
      , outJson = path.join(__dirname, 'sample-hydro10-out.json')
      ;

    index.text(testXml, outJson, 'hydro10', function (err, res) {
      if (err) throw err;
      fs.unlink(res.output, function (err) {
        if (err) throw err;
        done();
      })
    })
  });

  it('should read a text stream, transform, stream it out', function (done) {
    var testXml = path.join(__dirname, 'sample-hydro10-iso.xml')
      , cmd = 'cat ' + testXml + ' | iso-to-cinergi -s -h'
      ;

    exec(cmd , function (err, stdout, stderr) {
        if (err) throw err;
        if (stderr) throw stderr;
        done();
      })
  });

});

describe('Map CZO ISO to CINERGI', function () {

  it('should read from text file, transform, write to text', function (done) {
    var testXml = path.join(__dirname, 'sample-czo-iso.xml')
      , outJson = path.join(__dirname, 'sample-czo-out.json')
      ;

      index.text(testXml, outJson, 'czo', function (err, res) {
        if (err) throw err;
        fs.unlink(res.output, function (err) {
          if (err) throw err;
          done();
        })
      })
  });

  it('should read a text stream, transform, stream it out', function (done) {
    var testXml = path.join(__dirname, 'sample-czo-iso.xml')
      , cmd = 'cat ' + testXml + ' | iso-to-cinergi -s -c'
      ;

    exec(cmd, function (err, stdout, stderr) {
      if (err) throw err;
      if (stderr) throw stderr;
      done();
    })
  });

});