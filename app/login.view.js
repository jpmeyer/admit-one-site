'use strict';

/**
 * @ngdoc function
 * @name admit-one-site.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Controller of the admit-one-site
 */
angular.module('admit-one-site')
    .controller('LoginCtrl', ['$state', 'principal', function ($state, principal) {
      var vm = this;
      vm.submit = function() {
        principal.login(vm.login, vm.password);
        var to = $state.params.to;
        if(to && to !== 'root.login') {
          $state.go(to, $state.params.params);
        } else {
          $state.go('root.orders');
        }
      };
    }]);
