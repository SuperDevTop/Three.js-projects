import * as THREE from 'three';
import {OrbitControls} from './build/OrbitControls.js';
import {RGBELoader} from './build/RGBELoader.js';

//create the scene
var scene = new THREE.Scene( );
var ratio = window.innerWidth/window.innerHeight;
//create the perspective camera
//for parameters see https://threejs.org/docs/#api/cameras/PerspectiveCamera
var camera = new THREE.PerspectiveCamera(45,ratio,0.1,1000);

//set the camera position
camera.position.set(0,0,15);
// and the direction
  camera.lookAt(0,0,1);

//create the webgl renderer
var renderer = new THREE.WebGLRenderer( );

//set the size of the rendering window
renderer.setSize(window.innerWidth,window.innerHeight);

//add the renderer to the current document
document.body.appendChild(renderer.domElement );

renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

const loader = new RGBELoader();
loader.load('./BathroomHard_Pierre.hdr', function(texture){
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture;
    scene.environment = texture;

    const sphereGeo = new THREE.BoxGeometry(10, 8, 10)
    const sphereMat = new THREE.MeshPhysicalMaterial({
        roughness: 0,
        metalness: 0,
        color: 0xDDFFFF,
        transmission: 1,
        ior: 2.33,
        thickness: 0.1,
        specularIntensity: 1.0,
        clearcoat: 1.0
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(sphereMesh);
    //sphereMesh.position.x += 1.5;

    /*
    const sphere2Geo = new THREE.SphereGeometry(1, 50, 50)
    const sphere2Mat = new THREE.MeshStandardMaterial({
        roughness: 0,
        metalness: 0.5,
        color: 0x00FF00,
        envMap: texture
    });
    const sphere2Mesh = new THREE.Mesh(sphere2Geo, sphere2Mat);
    scene.add(sphere2Mesh);
    sphere2Mesh.position.x -= 1.5
    */
    const cubeGeo = new THREE.BoxGeometry(2, 2, 2)
    const cubeMat = new THREE.MeshStandardMaterial({
        color: 0xFF0000
    });
    const cubeMesh = new THREE.Mesh(cubeGeo, cubeMat);
    scene.add(cubeMesh);
})

//////////////
// CONTROLS //
//////////////

// move mouse and: left   click to rotate,
//                 middle click to zoom,
//                 right  click to pan
// add the new control and link to the current camera to transform its position

var controls = new OrbitControls( camera, renderer.domElement );

//final update loop
var MyUpdateLoop = function ( )
{
//call the render with the scene and the camera
renderer.render(scene,camera);

controls.update();

//finally perform a recoursive call to update again
//this must be called because the mouse change the camera position
requestAnimationFrame(MyUpdateLoop);

};

requestAnimationFrame(MyUpdateLoop);

//this fucntion is called when the window is resized
var MyResize = function ( )
{
var width = window.innerWidth;
var height = window.innerHeight;
renderer.setSize(width,height);
camera.aspect = width/height;
camera.updateProjectionMatrix();
renderer.render(scene,camera);
};

//link the resize of the window to the update of the camera
window.addEventListener( 'resize', MyResize);