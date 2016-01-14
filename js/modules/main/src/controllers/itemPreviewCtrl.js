var ItemPreviewCtrl = function($state, $scope, itemTypeMap, mjs, notification, $window) {
    this.$state = $state;
    this.$window = $window;
    this.mjs = mjs;
    this.$scope = $scope;
    this.notification = notification;
    this.item_string = itemTypeMap.get_item_string($scope.previewData);
    this.item_type = itemTypeMap.get_type($scope.previewData.UnitType);
    this.url = $scope.previewData.url;
    this.collection_name = itemTypeMap.get_collection_name($scope.previewData);
	console.log($scope);
};

ItemPreviewCtrl.prototype = {

    get_item_url: function() {
        if (this.url !== undefined) {
            return this.url;
        }
        if (this.collection_name === 'genTreeIndividuals') {
            return this.$state.href('ftree-item', {individual_id: this.$scope.previewData.II, tree_number: this.$scope.previewData.GTN});
        }
        else {
			var parts = this.item_string.split('.')
			return this.$state.href('item-view', {collection: parts[0], id: parts[1]});
        }
    },

    remove_from_mjs: function($event) {
    	$event.stopPropagation();
    	
    	var self = this;

    	this.mjs.remove(self.item_string).
			then(function() {
				self.notification.put({
					en: 'Item removed',
					he: 'הפריט הוסר'
				});
			}, function() {
				self.notification.put({
					en: 'Failed to remove item',
					he: 'הסרת הפריט נכשלה'
				});
			});
    }
};

angular.module('main').controller('ItemPreviewCtrl', ['$state', '$scope', 'itemTypeMap', 'mjs', 'notification', '$window', ItemPreviewCtrl]);
