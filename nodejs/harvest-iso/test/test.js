var path = require('path')
  , fs = require('fs')
  , exec = require('child_process').exec
  , index = require('../index.js')
  ;

describe('Map ISO to CINERGI', function () {

  it('should read from text file, transform, write to text', function (done) {
    var testXml = path.join(__dirname, 'sample-iso.xml')
      , outJson = path.join(__dirname, 'sample-out.json')
      ;

    index.text(testXml, outJson, function (err, res) {
      if (err) throw err;
      fs.unlink(res.output, function (err) {
        if (err) throw err;
        done();
      })
    })
  });

  it('should read a text stream, transform and stream it out', function (done) {
    var testXml = path.join(__dirname, 'sample-iso.xml')
      , cmd = 'cat ' + testXml + ' | iso-to-cinergi -s'
      ;

    exec(cmd , function (err, stdout, stderr) {
        if (err) throw err;
        if (stderr) throw stderr;
        done();
      })
  });

});