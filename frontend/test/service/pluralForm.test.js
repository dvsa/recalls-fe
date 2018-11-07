const assert = require('assert');
const pluralForm = require('../../service/pluralForm.js');

describe('PluralForm', () => {
  describe('getSingularOrPlural()', () => {
    it('should create singular form for multiple choice sentence', () => {
      assert.equal(pluralForm.getSingularOrPlural('{We|He} {are|is}.', 1), 'He is.');
    });
    it('should create plural form for multiple choice sentence', () => {
      assert.equal(pluralForm.getSingularOrPlural('{We|He} {are|is}.', 10), 'We are.');
    });
    it('should create singular form for single choice sentence and replace number', () => {
      assert.equal(pluralForm.getSingularOrPlural('It has <hr>[num] recall{s}.</hr>', 1), 'It has <hr>1 recall.</hr>');
    });
    it('should create plural form for single choice sentence and replace number', () => {
      assert.equal(pluralForm.getSingularOrPlural('It has <hr>[num] recall{s}.</hr>', 2), 'It has <hr>2 recalls.</hr>');
    });
  });
});