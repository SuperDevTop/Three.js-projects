var poemMenu = require('poem-menu');
var	routing	= require('./routing');
var mute = require('../sound/mute');
var manifestToPoem = require('./manifestToPoem');

window.mute = mute;

function handlers( menu ) {
	
	var poem;

	console.log('menu handlers');
	manifestToPoem.emitter.on( 'load', function( e ) {
		poem = e.graph;
	});

	menu.emitter.on('close', function() {
		if( poem ) poem.start();
	});

	menu.emitter.on('open', function() {
		if( poem ) poem.stop();
	});
	
}

//Start

module.exports = function startUI( manifests ) {
	
	var menu = poemMenu( manifests, {
		top: "Growth",
		bottom : mute.el
	});

	handlers( menu );
	
};