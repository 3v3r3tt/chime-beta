angular.module('userApp')
	.filter('titleize', function(){

		// expression is an implicit argument
		// it is the value you are trying to transform
		return function(expression){

			var expressionArray = expression.split('')
			for (i = 0; i < expressionArray.length; i++){
				if (expression[i] === '-' || '_'){
					expression[i] === ' '
				}
			}
		}


	})