'use strict';

(function() {
  window.deferredBootstrapper.bootstrap({
    element: document.body,
    module: 'admit-one-site',
    bootstrapConfig: {
      strictDi: true
    },
    resolve: {
      config: ['$http', function ($http) {
        return $http.get('./config.json');
      }]
    }
  });
})();
