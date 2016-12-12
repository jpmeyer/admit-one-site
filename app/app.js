'use strict';

/**
 * @ngdoc overview
 * @name admit-one-site
 * @description
 * # Admit One Admin App
 *
 * Main module of the application.
 */
angular
  .module('admit-one-site', [
    'ngAnimate',
    'ngRoute',
    'ngSanitize',
    'ngLodash',
    'ngStorage',
    'angularMoment',
    'angular-cache',
    'ui.bootstrap',
    'ui.router',
    'base64'
  ])
  .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('root', {
        url: '',
        abstract: true,
        views: {}
      })
      .state('root.login', {
        url: '/login',
        views: {
          'content@': {
            templateUrl: 'login.view.html',
            controller: 'LoginCtrl as login'
          }
        },
        public: true,
        params: {
          returnState: {
            value: {
              to: 'root.orders',
              params: undefined
            }
          }
        }
      })
      .state('root.orders', {
        url: '/orders',
        views: {
          'content@': {
            templateUrl: 'orders.view.html',
            controller: 'OrdersCtrl as orders'
          }
        }
      });
    $urlRouterProvider
      .when('', '/orders')
      .when('/', '/orders')
      .otherwise('/orders');
  }]).factory('$', [
    '$window',
    function ($window) {
      return $window.$;
    }
  ]).config(['$logProvider', function($logProvider) {
    $logProvider.debugEnabled(true);
  }]).run(['$rootScope', '$state', '$stateParams', function($root, $state, $stateParams) {
    $root.$state = $state;
    $root.$stateParams = $stateParams;
  }]).run(['$rootScope', '$state', '$window', 'principal', function($rootScope, $state, $window, principal) {
    $rootScope.$on('$stateChangeStart', function(event, to, params) {
      if (!to.public) {
        if (!principal.token()) {
          event.preventDefault();
          $state.go('root.login', {returnState: {to: to, params: params}});
        }
      }
    });
    $rootScope.$on('$stateChangeSuccess', function() {
      $window.scrollTo(0,0);
    });
  }]);
