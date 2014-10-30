### ISO to CINERGI Schema Command-line Utility

Enhancer for transforming ISO.xml and ISO.json into CINERGI federation schema
json.  Inputs can be text files or streams of xml and json.  Outputs can be
text files or streams of json.

#### Base Requirements
* [Node.js v0.10.29 64-bit](http://nodejs.org/)
* [npmjs v1.4.16](https://www.npmjs.org/)

#### Installation
```
$ git clone https://github.com/CINERGI/enhancers.git
$ cd enhancers/harvest-iso
$ npm install -g
```

#### Tests
Run the tests with [mocha](https://visionmedia.github.io/mocha/):
```
$ npm install -g mocha
$ cd enhancers/harvest-iso
$ mocha test
```

#### Usage
Once installed, command-line kung-fu can be done via `xml-to-cinergi`:
```
$ xml-to-cinergi --help

  Usage: xml-to-cinergi [options]
  
  Options:
    -i, --input [value]   Text file containing data to be transformed
    -o, --output [value]  Text file to write transformed data out to
    -s, --stream          Operate on a stream of text
    -h, --hydro10         Use transformation method for Hydro10 metadata
    -c, --czo             Use transformation method for CZO metadata

  Examples:

    Operate on text files --
    $ xml-to-cinergi -i test/sample-hydro10-iso.xml -o output.json -h

    Operate on streams and Bash pipes --
    $ cat test/sample-czo-iso.xml | iso-to-cinergi -s -c 
```
