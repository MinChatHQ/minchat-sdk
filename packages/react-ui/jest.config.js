module.exports = {
  // ...
  transformIgnorePatterns: [
    "node_modules/(?!(axios)/)"
  ],
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "<rootDir>/__mocks__/styleMock.js"
  },
  // ...
};