/* jshint node: true */

module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'dayjot',
    environment: environment,
    baseURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    },

    'simple-auth': {
      crossOriginWhitelist: ['http://localhost:3000','http://localhost:4202','https://api.dayjot.com'],
      authorizer: 'simple-auth-authorizer:devise',
      authenticationRoute: 'index'
    }    
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    ENV.APP.LOG_VIEW_LOOKUPS = true;

    ENV.APP.API_HOST = "http://localhost:3000"
    // ENV.APP.API_HOST = "http://localhost:4202/development-gdsc3"    

    ENV.APP.STRIPE_KEY = "pk_test_2undx7H0CeDLSDUX01k5bXfn";
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.baseURL = '/';
    ENV.locationType = 'auto';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'production') {
    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;
    
    ENV.APP.API_HOST = "https://dayjot.com"
    ENV.APP.STRIPE_KEY = "pk_live_0pfal3NW90qouuEPy6LDuuUm";
  }

  ENV['simple-auth-devise'] = {
    serverTokenEndpoint: ENV.APP.API_HOST+'/users/sign_in'
  }

  return ENV;
};
