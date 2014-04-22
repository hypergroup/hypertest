/**
 * Module dependencies
 */

var should = require('should');
var hypertest = require('..');

describe('hypertest', function() {
  it('should work', function(done) {
    this.timeout(0);
    hypertest(__dirname + '/fixtures/localhost-5000', {reporter: 'spec'}, function() {
      done();
    });
  });
});
