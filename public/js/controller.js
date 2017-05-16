angular.module('shoppingApp.controllers', [])

.controller('navbarCtrl', function($scope,$timeout,$mdSidenav,$http,Cart, $rootScope,$window){

  $scope.toggleLeft = buildToggler('left');
  $scope.toggleRight = buildToggler('right');
  $rootScope.cartLength = 0;
  $scope.loading = true;

  function buildToggler(navID) {
    return function() {
      $mdSidenav(navID).toggle();
      getCart();
    }
  };

  function getCart() {
    $scope.cart = {};
    $scope.loading = true;
    $http.get('/cart').success(function(response){
      $scope.loading = false;
      Cart.saveCart(response);
      $rootScope.cartLength = Cart.getLength();
      $scope.cart = Cart.getCart();
    });
  };

  $scope.leftClose = function() {
    $mdSidenav('left').close();
  };

  $scope.rightClose = function() {
    $mdSidenav('right').close();
  };

  $scope.removeItem = function(data) {
    $scope.checkmark = data._id;
    $http.post('/removeCartItem', data).success(function(response){
      $scope.checkmark = false;
      var index = $scope.cart.items.indexOf(data);
      $scope.cart.items.splice(index,1);
      $rootScope.cartLength = $rootScope.cartLength - 1;
    })
  };

  $scope.kilograms = ["0.5","1","2","5","10"];

  $scope.search = function() {
    $http.get('/search/' + $scope.searchname).success(function(response){
      $window.location = '/search/'+$scope.searchname;
    })
  };

})

.controller('homeCtrl', function($scope,$window){

  $scope.howto = function() {
    $window.location = '/howto';
  }

})

.controller('signupCtrl', function($scope,$http,$window,$mdToast){
  $scope.loading = false;
	$scope.addUser = function() {
    $scope.loading = true;
		$http.post('/signup', $scope.user).success(function(response){
      $scope.loading = false;
			if('error' in response) {
				$window.location = '/signup';
			}
			else {
        showSimpleToast();
				$window.location = '/';
			}
		})
	};
  var showSimpleToast = function() {
    $mdToast.show(
      $mdToast.simple()
        .textContent('SUCCESSFULLY REGISTERED.')
        .position('top right')
        .hideDelay(3000)
    );
  };
})

.controller('loginCtrl', function($scope,$http,$window,$location,$mdToast){
  $scope.loading = false;
  $scope.login = function() {
    $scope.loading = true;
    $http.post('/login', $scope.user).success(function(response){
      $scope.loading = false;
      if('error' in response) {
        $window.location = '/login';
      }
      else {
        showSimpleToast();
        $window.location = '/';
      }
    });
  };

  var showSimpleToast = function() {
    $mdToast.show(
      $mdToast.simple()
        .textContent('SUCCESSFULLY LOGIN.')
        .position('top right')
        .hideDelay(3000)
    );
  };
})

.controller('allProductsCtrl', function($scope,$mdDialog, $mdMedia, $window, $http){

  $scope.click = function() {
    $scope.checkmark = true;
  }

	$scope.customFullscreen = $mdMedia('xs') || $mdMedia('sm');

  $scope.kilograms = ["0.5","1","2","5","10"];

})

.controller('productCtrl', function($scope,$window,$http,$mdMedia,$mdDialog,$rootScope){
  $scope.loading = true;
  var id = $window.location.pathname.slice(10);
  $scope.kg = 1;
  $scope.kilograms = ["0.5","1","2","5","10"];
  $scope.maxprice = 100;
  $scope.sortname = true;

  $http.get('/api/products/' + id).success(function(response){
    $scope.loading = false;
    $scope.products = response;
    $scope.product_length = response.length;
  });

  $scope.showAdvanced = function(ev,product) {
    $scope.eachProduct = product;
    $mdDialog.show({
      controller: DialogController,
      templateUrl: 'product-detail.tmpl.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true,
      scope: $scope.$new(),
    })
  };

  $scope.priceRange = function(product) {
    return ((product.price) <= $scope.maxprice);
  };

  $scope.sortbyprice = function() {
    $scope.predicate = 'price';
    $scope.sortdc = false;
    $scope.sortname = false;
  }

  $scope.sortbydc = function() {
    $scope.predicate = '-discount';
    $scope.sortprice = false;
    $scope.sortname = false;
  }

  $scope.sortbyname = function() {
    $scope.predicate = 'name';
    $scope.sortprice = false;
    $scope.sortdc = false;
  }


  $scope.addtocart = function(product,kg) {
    $scope.checkmark = product._id;
    if(product.discount === 0) {
      data = {
        'product_id': product._id,
        'totalPrice': product.price * kg,
        'quantity': kg
      }
    }
    else {
      data = {
        'product_id': product._id,
        'totalPrice': product.price * kg * (100 - product.discount)/100,
        'quantity': kg
      }
    }
    $http.post('/addtocart', data).success(function(response){
      $scope.checkmark = false;
      $rootScope.cartLength = $rootScope.cartLength + 1;
    });
  }

})

.controller('paymentCtrl', function($scope,$http,$window) {

  delete $window.user.password;
  $scope.user = $window.user;

    $scope.updateProfile = function() {
      $http.put('/profile', $scope.user).success(function(response){
        $window.location = '/payment';
      });
    };

  $scope.payment_loading = true;
  $http.get('/cart').success(function(response){
    $scope.payment_loading = false;
    $scope.items = response;
  });

  $scope.stripeCallback = function (code, result) {
    if (result.error) {
        window.alert('it failed! error: ' + result.error.message);
    } else {
      var data = {
        'stripeToken': result.id,
        'stripeMoney': $scope.items.total
      }
      $http.post('/payment',data).success(function(response){
        console.log("555");
      });
        window.alert('success payment!');
        $window.location = '/';
    }
  };

})

.controller('profileCtrl', function($scope,$http,$window){

	$scope.tabs = 1;

	$scope.tabsVal = function(val) {
		$scope.tabs = val;
	}

	delete $window.user.password;
	$scope.user = $window.user;

    $scope.updateProfile = function() {
    	$http.put('/profile', $scope.user).success(function(response){
    		$window.location = '/profile';
    	});
    };

  $http.get('/history/'+ $scope.user._id).success(function(response){
    console.log(response);
    $scope.orderhistory = response;
  });

})

.controller('adminCtrl', function($scope,$http,$window){
  $scope.tab = 1;
  $scope.tabVal = function(n) {
    $scope.tab = n;
  };

  $scope.addCategory = function() {
    var data = {
      'name': $scope.categoryName,
      'image': $scope.categoryImage
    }
    $http.post('/addcategory',data).success(function(response){
      if('success' in response) {
        $window.location = '/admin';
      }
    });
  };

  $scope.addProduct = function() {
    var pData = {
      'category': $scope.productCategory,
      'name': $scope.productName,
      'image': $scope.productImage,
      'description': $scope.productDescription,
      'type': $scope.productType,
      'quantity': $scope.productQuantity,
      'discount': $scope.productDiscount,
      'price': $scope.productPrice,
    }
    $http.post('/addproduct',pData).success(function(response){
      if('success' in response) {
        $window.location = '/admin';
      }
    });
  };

  $http.get('/allorder').success(function(response){
    $scope.orders = response;
  });

  $scope.viewOrder = function(data) {
    $scope.tab = 4;
    $http.get('/order/'+data._id).success(function(response){
      $scope.eachorder = response;
    });
  }

  $http.get('/allproducts').success(function(response){
    $scope.allproducts = response;
  });

  $scope.categoryFilter = function(product) {
    return ((product.category) == $scope.editCategory);
  };

  $scope.viewProduct = function(product) {
    $scope.eachProduct = product;
    $scope.tab = 6;
  };

  $scope.editProduct = function(eachProduct) {
    $http.put('/editproduct', eachProduct).success(function(response){
      if('success' in response) {
        $window.location = '/admin';
      }
		});
  }

  $scope.deleteProduct = function(id) {
    $http.delete('/deleteproduct/'+id).success(function(response){
      if('success' in response) {
        $window.location = '/admin';
      }
    });
  };

  $scope.editCategory = function() {
    $http.put('/editcategory', $scope.categoryEdit).success(function(response){
      if('success' in response) {
        $window.location = '/admin';
      }
    });
  };

  $scope.deleteCategory = function(id) {
    $http.delete('/deletecategory/'+id).success(function(response){
      if('success' in response) {
        $window.location = '/admin';
      }
    });
  };

})

function DialogController($scope, $mdDialog, $http, $rootScope) {

  $scope.loading = false;

	$scope.hide = function() {
		$mdDialog.hide();
	};
	$scope.cancel = function() {
		$mdDialog.cancel();
	};
	$scope.answer = function(answer) {
		$mdDialog.hide(answer);
	};

  $scope.addtoCart = function() {

    $scope.loading = true;

    if($scope.eachProduct.discount === 0) {
      data = {
        'product_id': $scope.eachProduct._id,
        'totalPrice': $scope.eachProduct.price * $scope.kg,
        'quantity': $scope.kg
      }
    }
    else {
      data = {
        'product_id': $scope.eachProduct._id,
        'totalPrice': $scope.eachProduct.price * $scope.kg * (100 - $scope.eachProduct.discount)/100,
        'quantity': $scope.kg
      }
    }

    $http.post('/addtocart', data).success(function(response){
      $scope.loading = false;
      $rootScope.cartLength = $rootScope.cartLength + 1;
    });
  };

};
