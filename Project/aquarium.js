//import "./style.css";

import * as THREE from "three";
import { PointerLockControls } from "./build/PointerLockControls.js";
import { OrbitControls } from './build/OrbitControls.js'

//Forward or backward variable declaration
let moveForward = false;
let moveBackword = false;
let moveLeft = false;
let moveRight = false;


var down = false;

//Definition of movement speed and direction of movement
const velocity = new THREE.Vector3(); //=0,0,0
const direction = new THREE.Vector3();

const color = new THREE.Color();

/**
 *  scene 
 **/
const scene = new THREE.Scene();
//scene.background = new THREE.Color(0xffffff);
//scene.fog = new THREE.Fog(0xffffff, 0, 750);

/**
 *  camera 
 **/
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 1, 2);

//background texture
const texture = new THREE.TextureLoader().load(
  '../Image/Skybox2-deseart/desertdawn_bk.jpg');

  const texture1 = new THREE.TextureLoader().load(
    '../Image/Skybox1/Skybox1Right.png');

  scene.background = texture;

/**
 * raycaster 
 */
const raycaster = new THREE.Raycaster();



function onPointerMove( event ){
   // console.log("clicked");
    const pointer = new THREE.Vector2();
    pointer.x = ( camera.position.x / window.innerWidth ) * 2 - 1; //event.clientX
    pointer.y = -( camera.position.y / window.innerHeight ) * 2 + 1;
    console.log(pointer.x)
    console.log(pointer.y);

    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects( scene.children, false );
   // const intersects1 = raycaster.intersectObjects( plane, false );
  // raycaster.layers.set( 1 ); 
//plane.layers.enable( 1 );
    if (intersects.length > 0){
       intersects[0].object.material.color.set(0xff0000);
       console.log("hit");
    }
    else {
        console.log(" not hit");
    }
    
}
window.addEventListener( 'mousedown', onPointerMove, false);

/**
 *  renderer 
 **/
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.shadowMap.enable = true;

var arrow;

const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(5, 15, -5);
pointLight.castShadow = true;
scene.add(pointLight);

const pointLightHelper = new THREE.PointLightHelper(pointLight, 3);
scene.add(pointLightHelper);

//FPS point of view setting 
const controls = new PointerLockControls(camera, document.body);//renderer.domElement);
window.addEventListener("click", ()=> {
    controls.lock();
});


//plane
const planeGeometry = new THREE.PlaneGeometry(70, 70);
//mesh-plane
const planeMaterial = new THREE.MeshStandardMaterial({
    color: "gray",
    map: texture1
  })
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI * 0.5;
plane.receiveShadow = true;
plane.name = "plane";
scene.add(plane);

//test box
const boxGeometry = new THREE.BoxGeometry(7, 7, 7);
//mesh-box
const boxMaterial = new THREE.MeshStandardMaterial({
    color: "orange"
    
  })
const box = new THREE.Mesh(boxGeometry, boxMaterial);
box.position.y = 6.5; //3.5
box.position.z = -10;
box.castShadow = true;
box.name = "box";
scene.add(box);

//test box
const boxGeometry2 = new THREE.BoxGeometry(7, 7, 7);
//mesh-box
const boxMaterial2 = new THREE.MeshStandardMaterial({
    color: "white",
    map: texture1
  })
const box2 = new THREE.Mesh(boxGeometry2, boxMaterial2);
box2.position.x = 10;
box2.position.y = 5; //3.5
box2.position.z = -10;
box2.castShadow = true;
box2.name = "box2";
scene.add(box2);

/*const dotGeometry = new THREE.BufferGeometry();
dotGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0,0,0]), 3));
const dotMaterial = new THREE.PointsMaterial({ size: 0.1, color: 0xff0000 });
const dot = new THREE.Points(dotGeometry, dotMaterial);
scene.add(dot);*/

// -- Keyboard controls --
const onKeyDown = (e) => {
    switch(e.code) {
        case "KeyW":
            moveForward = true;
            break;
        case "KeyA":
            moveLeft = true;
            break;
        case "KeyS":
        moveBackword = true;
            break;
        case "KeyD":
        moveRight = true;
            break;
    }
};

const onKeyUp = (e) => {
    switch(e.code) {
        case "KeyW":
            moveForward = false;
            break;
        case "KeyA":
            moveLeft = false;
            break;
        case "KeyS":
        moveBackword = false;
            break;
        case "KeyD":
        moveRight = false;
            break;
    }
};


document.addEventListener("keydown", onKeyDown);
document.addEventListener("keyup", onKeyUp);

let prevTime = performance.now();

function animate() {
  requestAnimationFrame(animate);
   //render();
  //raycaster.setFromCamera(clickMouse, camera);
  
  const time = performance.now();

  // forward and backward decisions
  direction.z = Number(moveForward) - Number(moveBackword); //cast two variable to 1 to 0
  direction.x = Number(moveRight) - Number(moveLeft);

  // When the pointer turns ON
  if(controls.isLocked){
    
    const delta = (time - prevTime) / 1000;

    raycaster.setFromCamera( new THREE.Vector2(), camera );  
    scene.remove ( arrow );
    arrow = new THREE.ArrowHelper(raycaster.ray.direction, raycaster.ray.origin, 0.25, 0x000000 );
    scene.add( arrow );
    //Decay 
    velocity.z -= velocity.z * 5.0 * delta;
    velocity.x -= velocity.x * 5.0 * delta;

    if(moveForward || moveBackword){
        velocity.z -= direction.z * 200 * delta; //change movement speed here
    }
    if(moveRight || moveLeft){
        velocity.x -= direction.x * 200 * delta; //change movement speed here
    }
    

    controls.moveForward(-velocity.z * delta);
    controls.moveRight(-velocity.x * delta);
  } 
  
  prevTime = time;
  renderer.render(scene, camera);
  //window.addEventListener( 'mousemove', onPointerMove);
  
  
}

animate();

/**
 * screen resize 
 **/
window.addEventListener("resize", onWindowResize);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
