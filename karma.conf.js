module.exports = function(config) {
  config.set({
	basePath: '',
	frameworks: ['qunit'],
	files: [
		'node_modules/sinon/pkg/sinon.js',
		'test/**/*Test.js',
		{pattern: 'chrome-extension/*.js', included: false}
	],
	reporters: ['progress'],
	port: 9876,
	colors: true,
	logLevel: config.LOG_INFO,
	browsers: ['Chrome', 'PhantomJS'],
	singleRun: true
  });
};
