function roundTo( value, decimalPlaces ) {
	
	if( typeof decimalPlaces === "number" ) {

		return Math.round( Math.pow(10, decimalPlaces) * value ) / Math.pow(10, decimalPlaces);

	} else {
		
		return value;
		
	}
	
}

THREE.Console = {
	
	vector : function( vectorOrList, decimalPlaces ) {
		
		var results = [];
		var list;
		
		if( vectorOrList instanceof THREE.Vector2 || vectorOrList instanceof THREE.Vector3  || vectorOrList instanceof THREE.Vector4 ) {
			list = [ vectorOrList ];
		} else {
			list = vectorOrList;
		}
		
		console.table(
			_.map( list, function( vector ) {
				return _.map( vector.toArray(), function( x ) {
					return roundTo( x, decimalPlaces );
				});
			})
		);
		
	},
	
	face : function( faceOrList ) {
		
		var results = [];
		var list;
		
		if( faceOrList instanceof THREE.Face3 ) {
			list = [ faceOrList ];
		} else {
			list = faceOrList;
		}
		
		console.table(
			_.map( list, function( face ) {
				return [face.a, face.b, face.c];
			})
		);
		
	},
	
	matrix : function( matrixOrElements, decimalPlaces ) {
 
		var i, j, el, els, results;
 
		results = [];
		j = 0;
		
		if( matrixOrElements instanceof THREE.Matrix4 ) {
			els = matrixOrElements.elements;
		} else {
			els = matrixOrElements;
		}
 
		for( i=0; i < els.length; i++ ) {
		
			if( j === 0 ) {
				results.push([]);
			}
 
			el = roundTo( els[i], decimalPlaces );
 
			results[Math.floor(i / 4) % 4].push( el );
 
			j++;
			j %= 4;
		
			if( i % 16 === 15 ) {
				console.table( results );
				results = [];
			}
 
		}
 
	},
};

window.consoleMatrix = THREE.Console.matrix;
window.consoleVector = THREE.Console.vector;
window.consoleFace = THREE.Console.face;

module.exports = THREE.Console;