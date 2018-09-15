const Spinner = require('cli-spinner').Spinner;

var spinner = new Spinner('processing.. %s');
spinner.setSpinnerString('|/-\\');

module.exports = spinner;