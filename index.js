/**
 * Module dependencies
 */

var yaml = require('js-yaml');
var Mocha = require('mocha');
var read = require('fs').readFileSync;

module.exports = function(test, program, fn) {
  var runner = new Mocha();
  var str;
  try {
    str = read(test, 'utf8');
  } catch (err) {
    return fn(err);
  }
  var conf = parse(yaml.load(str));
  conf.host = program.host || conf.host;

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
        fn: parseShould(assert)
      };
    })
  };
}

function parseShould(str) {
  var parts = str.split(' ');
  if (parts.indexOf('should') !== 0) return;
  var s = parts.slice(1);
  var arg = s.pop();
  if (arg === 'exist') return function(val, should) {
    should.exist(val);
  };
  return function(val, should) {
    if (s.length === 1) return val.should[s[0]](arg);
    if (s.length === 2) return val.should[s[0]][s[1]](arg);
    if (s.length === 3) return val.should[s[0]][s[1]][s[2]](arg);
    if (s.length === 4) return val.should[s[0]][s[1]][s[2]][s[3]](arg);
    if (s.length === 5) return val.should[s[0]][s[1]][s[2]][s[3]][s[4]](arg);
  };
}
