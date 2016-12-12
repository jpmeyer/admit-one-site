'use strict';

/**
 * @ngdoc service
 * @name principal
 * @description
 * # principal
 * stores identity and authentication state for the application
 */
angular.module('admit-one-site')
    .factory('principal', [ '$base64', function($base64) {
      var _login, _password;
      return {
        token: function () {
          return _login && _password ? $base64.encode(_login + ':' + _password) : undefined;
        },
        login: function (login, password) {
          _login = login;
          _password = password;
        }
      };
    }]).run(['$rootScope', 'principal', function($root, principal) {
      $root.principal = principal;
    }]);
