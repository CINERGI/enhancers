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
Once installed, the command-line kung-fu can be done via `iso-to-cinergi`:
```
$ iso-to-cinergi --help

  Usage: iso-to-cinergi [options]
  
  Options:
    -h, --help      output the usage information
    -V, --version   output the version number
    -f, --file      convert iso data in a text file to cinergi json
    -o, --out       output text file to write transformed data to
    -s, --stream    perform transformation on a stream of text

  Examples:

    Operate on text files --
    $ iso-to-cinergi -f input.xml -o output.json

    Operate on streams and UNIX pipes --
    $ cat iso.xml | iso-to-cinergi -s
```