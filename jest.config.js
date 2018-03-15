module.exports = {
    moduleFileExtensions: ['js', 'json', 'jsx', 'node', 'mjs'],
    testMatch: [
        '**/__tests__/**/*.(js|mjs)?(x)',
        '**/?(*.)(spec|test).(js|mjs)?(x)'
    ],
    transform: {
        '^.+\\.(js|mjs)$': '<rootDir>/node_modules/babel-jest'
    }
};
