module.exports = {
	name : "Growth",
	description : "From seedling to tree",
	order : 0,
	config : {
		camera : {
			z : -300,
			y : 25
		},
		// renderer : {
		// 	useEffects : true
		// },
		fog : {
			nearFactor : 0.8,
			farFactor : 1.1
		}
	},
	components : {
		info : {
			construct: require("../js/components/Info"),
			properties : {
				documentTitle : "Growth #1: From Seedling To Tree | Greg Tatum",
				title : "Growth #1",
				subtitle : "From Seedling To Tree",
				// titleCss : { "font-size": "3.35em" },
				subtitleCss : {	"font-size": "1.29em" },
				arrowPrevHref : false,
				arrowNextHref : false,
			}
		},
		slider : {
			function: require("../js/components/slider"),
			properties: {
		  		message : "Adjust the Intensity",
		  		min: 300,
		  		max: 600,
		  		step: 1,
				value: 500,
		  		callToAction: "Start Growing",
				destroyOnSubmit : true,
		    	callback : function( poem, number ) {
					poem.treeGrowth.start( number )
				}
			}
		},
		controls : {
			construct: require("../js/components/cameras/Controls"),
			properties: {
				target : new THREE.Vector3(0, 110, 0)
			}
		},
		treeGrowth : {
			function: require("../js/demos/treeGrowth"),
			properties: {
				autoStart : false
			}
		},
		// grid : {
		// 	construct: require("../js/components/Grid"),
		// },
		lights : {
			construct: require("../js/components/lights/TrackCameraLights")
		},
		stats : {
			construct: require("../js/components/utils/Stats")
		}
	}
};