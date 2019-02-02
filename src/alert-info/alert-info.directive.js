angular.module("hcLib").directive("alertInfo", function() {
	
    controller.$inject = ['$scope','purchasebillMedicineService'];
    function controller($scope,purchasebillMedicineService){
	
        $scope.getAlertMedicines = getAlertMedicines;
        $scope.fetchMoreAlertMedicines = fetchMoreAlertMedicines;
        $scope.setMedicineName = setMedicineName;
        function init(){
            $scope.filters = [ {
                key: 'Expiry', flag: 'isExpired'
            },
            {
                key: 'MinCount', flag: 'isMin'
            },
            {
                key: 'MaxCount', flag: 'isMax'
            }];
            $scope.searchObj = {};
            getPurchaseMedicines();
            getAlertMedicines();
        }
        function getPurchaseMedicines(){
            purchasebillMedicineService.purchaseBillMedicines({isAvailable:true}).then(function(res){
                $scope.medicines = res;
            });
        }
        
        function setMedicineName(selected){
            $scope.chosenMedicine = selected;
        }
        function getAlertMedicines(){
            $scope.formLoader = true;
            $scope.searchObj.latestLimit = 0;
            if($scope.searchObj.filter != 'isExpired'){
                $scope.searchObj.expiryYear = undefined;
                $scope.searchObj.expiryMonth = undefined;
            }
            if($scope.chosenMedicine){
                $scope.searchObj.name = $scope.chosenMedicine.name;
            }else{
                $scope.searchObj.name = undefined;
            }
            purchasebillMedicineService.alertInfo($scope.searchObj).then(function(res){
                $scope.alertMedicines = res;
                $scope.formLoader = false;
            });
        }
        
        function fetchMoreAlertMedicines(){
            $scope.searchObj.latestLimit = $scope.alertMedicines.length;
            purchasebillMedicineService.alertInfo($scope.searchObj).then(function(res){
                $scope.alertMedicines = $scope.alertMedicines.concat(res);
                $scope.formLoader = false;
            });
        }
        init();
    }
    return {
		restrict : 'E',
		scope : {
            
		},
		controller : controller,
		templateUrl : "src/alert-info/alert-info.tpl.html"
    };
});
