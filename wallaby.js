module.exports = function (w) {

  return {
    env: {
      type: 'node'
    },

    files: [
      { pattern: 'src/**/*.ts', load: false },
    ],

    tests: [
      'package.json',
      'test/**/*.ts'
    ],

    testFramework: 'mocha'
  };
};
