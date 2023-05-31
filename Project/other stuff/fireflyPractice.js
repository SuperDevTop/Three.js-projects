import * as THREE from 'three';
import {OrbitControls} from './build/OrbitControls.js';
import {FBXLoader} from './build/FBXLoader.js';
import {EffectComposer} from './build/EffectComposer.js';
import {RenderPass} from './build/RenderPass.js';
import {RGBELoader} from './build/RGBELoader.js';

//create the scene
var scene = new THREE.Scene( );
var ratio = window.innerWidth/window.innerHeight;
//create the perspective camera
//for parameters see https://threejs.org/docs/#api/cameras/PerspectiveCamera
var camera = new THREE.PerspectiveCamera(45,ratio,0.1,1000);

//set the camera position
camera.position.set(0,0,30);
// and the direction
  camera.lookAt(0,0,1);

//create the webgl renderer
var renderer = new THREE.WebGLRenderer( );

//set the size of the rendering window
renderer.setSize(window.innerWidth,window.innerHeight);

//add the renderer to the current document
document.body.appendChild(renderer.domElement );

//Effect Composer
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// Create directional light
// const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1.5);
// scene.add(directionalLight);
// directionalLight.position.set(50, 50, 10);
// directionalLight.castShadow = true;

function loadLizard(){
    const fbxLoader = new FBXLoader();
    fbxLoader.setResourcePath("./textures/pink_lizard/");
    fbxLoader.load('./model/pink_lizard2.fbx', function(lizard) {
      lizard.traverse(function(child){
        if (child.isMesh) 
        {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      } 
    );
    
    lizard.userData.name = "Pink Lizard";
    lizard.scale.setScalar(0.12);
    lizard.rotation.set(0, 0, 0);
    scene.add(lizard);
});
}

  loadLizard();

function getPointLight(color){

    const light = new THREE.PointLight(color, 4, 15.0);


    //light ball
    const geo = new THREE.SphereGeometry(0.05, 30, 30);
    const mat = new THREE.MeshBasicMaterial({color});
    const mesh = new THREE.Mesh(geo, mat);
    mesh.add(light);

    const circle = new THREE.Object3D();
    circle.position.x = (20 * Math.random()) - 10;
    circle.position.y = (20 * Math.random()) - 10;
    circle.position.z = (20 * Math.random()) - 10;
    const radius = 5.5;
    mesh.position.x = radius;
    mesh.position.y = radius;
    mesh.position.z = radius;
    circle.rotation.x = THREE.MathUtils.degToRad(90);
    circle.rotation.y = Math.random() * Math.PI * 2;
    circle.add(mesh)

    const glowMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.15
      });
  
      const glowMesh = new THREE.Mesh(geo, glowMat);
      glowMesh.scale.multiplyScalar(1.5);
      const glowMesh2 = new THREE.Mesh(geo, glowMat);
      glowMesh2.scale.multiplyScalar(2.5);
      const glowMesh3 = new THREE.Mesh(geo, glowMat);
      glowMesh3.scale.multiplyScalar(4);
      const glowMesh4 = new THREE.Mesh(geo, glowMat);
      glowMesh4.scale.multiplyScalar(6);
  
      mesh.add(glowMesh);
      mesh.add(glowMesh2);
      mesh.add(glowMesh3);
      mesh.add(glowMesh4);

    const rate = Math.random() * 0.005 + 0.005;
    function update(){
        circle.rotation.z += rate;
    }

    return{
        obj: circle,
        update,
    }
}

const colors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF, 0x00FFFF];
const pLights = []
let pLight;

for (let i = 0; i < colors.length; i += 1) {
    pLight = getPointLight(colors[i])
    scene.add(pLight.obj);
    pLights.push(pLight);
}

//////////////
// CONTROLS //
//////////////

// move mouse and: left   click to rotate,
//                 middle click to zoom,
//                 right  click to pan
// add the new control and link to the current camera to transform its position

var controls = new OrbitControls( camera, renderer.domElement );

function animate(){
    requestAnimationFrame(animate);
    pLights.forEach( l => l.update());
    render();
  
    let increment = 0.001;
    scene.rotation.y += increment;
    controls.update();
  
}

animate();

function render() 
{
    composer.render(scene,camera);
}

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