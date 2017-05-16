angular.module('shoppingApp.services', [])

.factory('Cart', function(){
  var product = {};

  return {
    saveCart: function(data) {
      product= data;
    },
    pushItem: function(data) {
      product.items.push(data);
    },
    getLength: function() {
      return product.items.length;
    },
    getCart: function() {
      return product;
    },
    deleteItem: function(data) {
      product.items.pop(data);
      return product;
    }
  };

})
