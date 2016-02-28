angular.module('main').
	factory('item', ['$resource', '$q', '$rootScope', 'apiClient', 'cache', 'itemTypeMap', '$state',
	function($resource, $q, $rootScope, apiClient, cache, itemTypeMap, $state) {

		var collection_type_map = {'place': 'places'};

		var in_progress = false;

		var itemResource = $resource(apiClient.urls.item +'/:slugs');

		var item_service = {

			parse_slug: function(text) {
				var sep_index = text.indexOf('_'),
				    ret =  {full: text,
							collection: text.slice(0, sep_index),
							local_slug: text.slice(sep_index+1)}
				ret.item_type = collection_type_map[ret.collection];
				return ret;

			},
			get_url: function (item_data) {
				if (item_data.url !== undefined) {
					return item_data.url;
				}
				if (item_data.params && item_data.params.hasOwnProperty('tree_number')) {
					return $state.href('ftree-view',
									   	{individual_id: item_data.params.node_id,
										 tree_number: item_data.params.tree_number});
				}
				else {
					return $state.href('item-view', item_data.params);
				}
			},
			
			get_string: function(collection_name, item_id) {
				return [collection_name, item_id].join('.');
			},

			get_data_string: function(item_data) {
				return itemTypeMap.get_item_string(item_data);
			},

			get: function(some_slug) {
				if ( !in_progress ) {
					var self 				= this,
						deferred			= $q.defer(),
						slug,
						cached				= {}; // cache.get(slug);

					slug = angular.isString(some_slug)?  this.parse_slug(some_slug) : some_slug;

					if (cached.isNotEmpty()) {
						$rootScope.$broadcast('item-loaded', cached);
						deferred.resolve(cached);
					}
					else {
						try {
							itemResource.query({slugs: slug.full}).$promise
								.then(function(item_data) {
									// cache.put(item_data[0], slug);
									$rootScope.$broadcast('item-loaded', item_data[0]);
									deferred.resolve(item_data[0]);
								},
								function(error) {
									deferred.reject(error);
								}).
								finally(function() {
									in_progress = false;
								});
						}
						catch(e) {
							deferred.reject();
						}
					}

					return deferred.promise;
				}
			},

			get_items: function(slugs) {
				if ( !in_progress ) {
					var self 				= this,
						deferred			= $q.defer(),
						cached_items		= [],
						not_cached_items	= [];

					slugs.forEach(function(slug) {
						if(!slug) return;
						var cached 				= {}; // cache.get(item_id, collection_name);

						if (cached.isNotEmpty()) {
							cached_items.push(cached);
						}
						else {
							not_cached_items.push(slug);
						}
					});

					if (not_cached_items.isEmpty()) {
						$rootScope.$broadcast('item-loaded', cached_items);
						deferred.resolve(cached_items);
					} 
					else {
						try {
							// fetch the non-cached items
							// TODO: store items on the cache
							var not_cached_slugs = not_cached_items.join(',');
							itemResource.query({slugs: not_cached_slugs}).$promise.
								then(function(item_data_arr) {
									/*
									item_data_arr.forEach(function(item_data) {
										var collection_name = itemTypeMap.get_collection_name(item_data);
										cache.put(item_data, collection_name);
									});
									*/
									var ret = item_data_arr.concat(cached_items);
									$rootScope.$broadcast('item-loaded', ret);
									deferred.resolve(ret);
								},
								function() {
									deferred.resolve( cached_items );
									$rootScope.$broadcast('items-load');
								}).
								finally(function() {
									in_progress = false;
								});
						}
						catch(e) {
							deferred.reject();
						}
					}

					return deferred.promise;
				}
			}
		};

		return item_service;
	}]);
