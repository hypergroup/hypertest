/**
 * Module dependencies
 */

var yaml = require('js-yaml');
var Mocha = require('mocha');
var read = require('fs').readFileSync;

module.exports = function(test, opts, fn) {
  var runner = new Mocha(opts);
  var conf = parse(yaml.load(read(test, 'utf8')));

  runner.suite.on('pre-require', function(g, file, self) {
    var name = 'hypertest-' + file;
    runner.globals(name);
    g[name] = conf;
  });

  runner.addFile(__dirname + '/suite.js');

  runner.run(fn);
};

function parse(conf) {
  var obj = {host: conf.host};
  delete conf.host;
  obj.tests = Object.keys(conf).map(function(path) {
    var val = conf[path] || 'should exist';
    if (typeof val === 'string' || typeof val === 'function') val = [val];
    if (!Array.isArray(val) && typeof val === 'object') val = [val];
    if (Array.isArray(val)) val = {it: val};
    return toFn(val, path);
  });
  return obj;
}

function toFn(val, path) {
  return {
    path: path,
    assertions: val.it.map(function(assert) {
      if (typeof assert === 'object') return assert;
      if (typeof assert === 'function') return {
        name: 'should pass custom assertions',
        fn: assert
      };
      return {
        name: assert,
        fn: function(val, done) {
          done();
        }
      }
    })
  };
}
