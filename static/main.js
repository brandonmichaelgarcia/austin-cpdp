(function () {
    'use strict';
  
    angular.module('PoliceDataApp', [])
  
    .directive('dashboardChart', ['$parse', function ($parse) {
        return {
          restrict: 'E',
          replace: true,
          template: '<div id="chart"></div>',
          link: function (scope) {
            
          }
         };
      }]);
  
  }());