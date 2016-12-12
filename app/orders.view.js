'use strict';

/**
 * @ngdoc function
 * @name admit-one-site.controller:OrdersCtrl
 * @description
 * # OrdersCtrl
 * Controller of the admit-one-site
 */
angular.module('admit-one-site')
    .controller('OrdersCtrl', ['$scope', '$controller', '$state', '$q', '$log', '$localStorage', 'lodash', 'principal', 'api', function ($scope, $controller, $state, $q, $log, $localStorage, _, principal, api) {
      var vm = this;
      vm.sorting = {
        open: false,
        by: 'id',
        order: 'ascending',
        options: [
          {property: 'show.doorsOpen', order: 'ascending', text:'Event Date'},
          {property: 'user.login', order: 'ascending', text:'User'},
          {property: 'id', order: 'ascending', text:'Order Id'}
        ]
      };

      vm.sort = function (property, order) {
        if (this.sorting.by === property) {
          this.sorting.order = order ? order :(this.sorting.order === 'descending' ? 'ascending' : 'descending');
        } else {
          this.sorting.by = property;
          this.sorting.order = order || 'ascending';
        }
        vm.refresh();
      };

      var itemsPerPageProperty = 'orders.itemsPerPage';
      vm.paging = {
        currentPage: 1,
        numberOfPagesToShow: 5,
        itemsPerPage: {
          value: $localStorage[itemsPerPageProperty] || 20,
          options: [20, 50, 100],
          maxValue: 100
        },
        itemStartIndex: function () {
          return (this.currentPage - 1) * Number(this.itemsPerPage.get()) + 1;
        },
        itemEndIndex: function () {
          return Math.min(this.currentPage * Number(this.itemsPerPage.get()), this.total);
        },
        pageChanged: function() {
          vm.refresh();
          window.scrollTo(0,0);
        }
      };

      vm.filter = function () {
        var expression;
        if(_.isNumber(vm.min) && vm.min >= 0) {
          expression = 'id >= ' + vm.min;
        }
        if(_.isNumber(vm.max) && vm.max >= (vm.min || 0)) {
          var max = 'id <= ' + vm.max;
          if(expression) {
            expression += ' && ' + max;
          } else {
            expression = max;
          }
        }
        return expression;
      };

      var apiState = {};

      vm.refresh = function(force) {
        if (force) {
          api.orders.flush();
        }
        apiState.force = apiState.force || force;
        if (apiState.loading) {
          return apiState.promise;
        }
        var sorting = vm.sorting;
        var paging = vm.paging;
        var filter = vm.filter();
        var criteria = {};
        if (filter) {
          criteria.filter = filter;
        }
        if (sorting) {
          criteria.order = sorting.by + ' ' + sorting.order;
        }
        if (paging) {
          criteria.skip = (paging.currentPage - 1) * paging.itemsPerPage.get();
          criteria.limit = paging.itemsPerPage.get();
        }
        if(criteria.skip === 0) {
          delete criteria.skip;
        }
        var desired = JSON.stringify(_.extend({token: principal.token()}, criteria));
        if(!apiState.force && desired === apiState.current) {
          return $q.when(desired);
        }
        apiState.loading = desired;
        apiState.promise = api.orders.query(criteria).then(
            function (orders) {
              vm.orders = orders;
              vm.paging.total = orders.total;
              delete apiState.force;
              delete apiState.loading;
              delete vm.error;
              apiState.current = desired;
              return vm.refresh();
            }, function(response) {
              if(response.status === 401) {
                $state.go('root.login');
              } else {
                vm.orders = [];
                vm.paging.total = 0;
                vm.error = true;
                $log.error('Failed to load data: ' + JSON.stringify(response));
                delete apiState.force;
                delete apiState.loading;
                apiState.current = desired;
                return vm.refresh();
              }
            }
        );
        return apiState.promise;
      };

      vm.paging.itemsPerPage.isValid = function(value) {
        var me = vm.paging.itemsPerPage;
        if (!value) {
          value = me.value;
        }
        return _.isNumber(value) && value > 0 && value <= me.maxValue;
      };

      vm.paging.itemsPerPage.get = function() {
        var me = vm.paging.itemsPerPage;
        return me.isValid(me.value) ? Number(me.value) : me.maxValue;
      };

      $scope.$watch(function() { return vm.paging.itemsPerPage.value; }, _.debounce(function (newValue, oldValue) {
        if (itemsPerPageProperty && newValue && vm.paging.itemsPerPage.isValid(newValue) && $localStorage[itemsPerPageProperty] !== newValue) {
          $localStorage[itemsPerPageProperty] = newValue;
        }
        vm.paging.currentPage = Math.ceil(((vm.paging.currentPage - 1) * Number(oldValue) + 1) / vm.paging.itemsPerPage.get());
        if (_.isNumber(vm.paging.currentPage) || vm.paging.currentPage <= 0) {
          vm.paging.currentPage = 1;
        }
        vm.refresh();
      }, true), 500);

      $scope.$watch(function() {return _.pick(vm, ['min', 'max'])}, vm.refresh, true);
    }]);
