'use strict';

/**
 * @ngdoc service
 * @name api
 * @description
 * # api
 * Provides resource bindings to the Admit One REST API.
 */
angular.module('admit-one-site')
    .service('api', ['$http', '$q', '$log', 'lodash', 'CacheFactory', 'principal', 'jsonapi', 'config', function($http, $q, $log, _, cacheFactory, principal, jsonapi, config) {
      var orderCache = cacheFactory.createCache('orders');
      return {
        orders: {
          flush: function() {
            orderCache.removeAll();
          },
          query: function(params) {
            var cacheKey = JSON.stringify(_.extend({token: principal.token()}, params));
            var cached = orderCache.get(cacheKey);
            return cached ? $q.when(cached) : $http.get(config.api.endpoint + '/orders', {
              params: params,
              headers: {
                Authorization: 'Basic ' + principal.token()
              },
              transformResponse: $http.defaults.transformResponse.concat(function(data, getHeaders){
                var headers = getHeaders();
                return {
                  meta: {
                    count: parseInt(headers['x-total-count'])
                  },
                  data: jsonapi.resolve(data)
                };
              })
            }).then(function(response) {
              if (response.status === 200) {
                var orders = response.data.data;
                orders.total = response.data.meta.count;
                orderCache.put(cacheKey, orders);
                return orders;
              } else {
                return $q.reject(_.pick(response, ['status', 'statusText']));
              }
            });
          }
        }
      };
    }]);