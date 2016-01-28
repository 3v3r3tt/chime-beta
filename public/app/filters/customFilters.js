angular.module('customFilters', [])
  .filter('titleize', function() {
    return function(input) {
      if (!input) { return ''; }
      input = input.replace(/-/g, ' ');
      input = input.replace(/_/g, ' ');
      input = input.replace(/([a-z])([A-Z])/g, function(str, $1, $2) { return $1 + " " + $2; });
      input = input.replace(/(\s)([a-z])/g, function(str, $1, $2) { return $1 + $2.toUpperCase(); });
      input = input.charAt(0).toUpperCase() + input.slice(1);

      return input;
    };
  });
