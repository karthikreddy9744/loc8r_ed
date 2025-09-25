(function() {
  'use strict';

  angular.module('loc8rApp')
    .controller('aboutCtrl', [function() {
      var vm = this;
      vm.pageHeader = { title: 'About Loc8r' };
      vm.content = "Loc8r is a demo app that lists places with wifi. This is a small single page AngularJS app used for teaching and prototyping.";
    }]);
})();