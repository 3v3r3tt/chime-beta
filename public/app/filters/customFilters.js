angular.module('customFilters', [])
  .filter('titleize', function() {
    return function(input) {
      if (!input) { return ''; }
      input = input.replace(/-/g, ' '); //remove -
      input = input.replace(/_/g, ' '); //remove _
      input = input.replace(/([a-z])([A-Z])/g, function(str, $1, $2) { return $1 + " " + $2; }); //separate camel casing
      input = input.replace(/(\s)([a-z])/g, function(str, $1, $2) { return $1 + $2.toUpperCase(); }); //capitalize first character of every word
      input = input.replace(/([A-Z]{2,})/g, function(str, $1) { return $1.charAt(0).toUpperCase() + $1.slice(1).toLowerCase(); }); //lowercase everything but first character of word
      input = input.charAt(0).toUpperCase() + input.slice(1);

      return input;
    };
  });
