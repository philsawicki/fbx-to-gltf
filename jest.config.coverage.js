const jestConfig = require('./jest.config');


module.exports = {
    ...jestConfig,

    // Indicates whether the coverage information should be collected while
    // executing the tests:
    collectCoverage: true,

    // A list of reporter names that Jest uses when writing coverage reports.
    // NOTE: Any istanbul reporter can be used.
    coverageReporters: ['html', 'json']
};
