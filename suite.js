/**
 * Module dependencies
 */

var should = require('should');
var conf = global['hypertest-' + __filename];
var hyperagent = require('hyperagent')(conf.host);

describe(conf.host, function() {
  conf.tests.forEach(function(test) {
    describe(test.path, function() {
      before(function(done) {
        var self = this;
        hyperagent(test.path, function(err, value, res) {
          if (err) return done(err);
          self.val = value;
          self.res = res;
          done();
        });
      });

      test.assertions.forEach(function(assert) {
        it(assert.name, function(done) {
          var aliases = {
            val: this.val,
            value: this.val,
            res: this.res,
            path: test.path,
            key: test.path,
            should: should,
            hyperagent: hyperagent,
            hyper: hyperagent,
            done: done,
            fn: done,
            cb: done,
            require: require
          };
          var args = getArgs(assert.fn);
          var vals = args.map(function(arg) {
            if (!~['val', 'value'].indexOf(arg) && typeof aliases[arg] === 'undefined') throw new Error('invalid argument ' + arg);
            return aliases[arg];
          });
          assert.fn.apply(this, vals);
          if (!~args.indexOf('done')) done();
        });
      });
    });
  });
});

function getArgs(fn) {
  var str = fn.toString();
  return str.slice(str.indexOf('(') + 1, str.indexOf(')')).match(/([^\s,]+)/g);
}
