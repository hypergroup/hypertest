hypertest
=========

test a hyper+json api interface

Installation
------------

```sh
$ npm install -g hypertest
```

Usage
-----

```sh
$ hypertest path/to/test.spec.yml

  ....

  4 passing (2s)
```

`hypertest(1)` accepts the same flags as [mocha](https://github.com/visionmedia/mocha)

See [format](#format) for details.

Format
------

`hypertest` expects a yaml document describing the tests. A document includes the host name and a set of paths with one or more assertions.

The most basic assertion is a simple string. The available methods are described by [should.js](https://github.com/visionmedia/should.js/)

```yaml
host: http://api.example.com

.account.name: should exist
```

Since `should exist` is so common it is the default assertion.

```yaml
host: http://api.example.com

.account.name:
```

Assertions can also be a list of assertion statements.

```yaml
.account.name:
  - should eql 'Frank'
  - should startWith 'F'
  - should endWith 'nk'
  - should be type 'string'
  - should be a String
```

If more complex assertions are needed inline javascript functions are available.

```yaml
.account.name:
  - !!js/function >
    function(value, done) {
      // complex testing here
      done();
    }
```

The function can also be given a human-readable name.


```yaml
.account.name:
  -
    name: should do some really complex thing
    fn: !!js/function >
      function(value, done) {
        // complex testing here
        done();
      }
```

The values for the custom functions get injected in by reading the names of the arguments specified. A list of default values includes:

#### val, value

The value of the body at the end of the path

#### res

The response object returned by [superagent](https://github.com/visionmedia/superagent)

#### path, key

The path used in the test

#### should

[should.js](https://github.com/visionmedia/should.js/) module used for testing

#### hyperagent, hyper

[hyperagent](https://github.com/hypergroup/hyperagent) context used to make the request

#### require

CommonJS `require` function to require any other needed modules

#### done, cb, fn

Function to be called when the assertions are done executing. This is required for any async assertions.
