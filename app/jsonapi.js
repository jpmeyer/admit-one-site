'use strict';

/**
 * @ngdoc service
 * @name jsonapi
 * @description
 * # jsonapi
 * a service that resolves jsonapi documents and links entities
 */
angular.module('admit-one-site')
    .factory('jsonapi', ['lodash', function(_) {
      var map = function(a, f) {
        return _.isArray(a) ? _.map(a, f) : f(a);
      };
      var indexIncludes = function(document) {
        var includes = {};
        function index(include) {
          var type = includes[include.type];
          if (!type) {
            includes[include.type] = (type = {});
          }
          type[include.id] = include;
        }
        if(document.included) {
          map(document.included, index);
        }
        if(document.data) {
          map(document.data, index);
        }
        return includes;
      };
      var lookup = function(includes, link) {
        return (link && _.isObject(link) && link.linkage) ?
            map(link.linkage, function(l) {
              return includes[l.type][l.id];
            }) : link;
      };
      var resolveLinks = function(result, links, includes) {
        _.assign(result, _.mapValues(links, _.bind(lookup, null, includes)));
      };
      var resolveEntity = function(includes, entity, delayedResolutions) {
        var result = _.merge({id: entity.id, type: entity.type}, entity.attributes);
        if (entity.links) {
          if (delayedResolutions && _.isArray(delayedResolutions)) {
            delayedResolutions.push(_.bind(resolveLinks, null, result, entity.links));
          } else {
            resolveLinks(result, entity.links, includes);
          }
        }
        return result;
      };
      var resolveIncludes = function(includes) {
        var delayedResolutions = [];
        var result = _.mapValues(includes, _.bind(_.mapValues, null, _, _.bind(resolveEntity, null, includes, _, delayedResolutions)));
        _.each(delayedResolutions, function(f) {f(result);});
        return result;
      };
      return {
        resolve: function(document) {
          if(document && _.isObject(document) && document.data) {
            return map(document.data, _.bind(resolveEntity, null, resolveIncludes(indexIncludes(document))));
          }
          return document;
        }
      };
    }]);






