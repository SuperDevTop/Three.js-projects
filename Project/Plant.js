
import * as THREE from 'three';
import {GUI} from './build/dat.gui.module.js';
import {FBXLoader} from './build/FBXLoader.js';
import {PointerLockControls} from "./build/PointerLockControls.js";
import {EffectComposer} from './build/EffectComposer.js';
import {RenderPass} from './build/RenderPass.js';
import {UnrealBloomPass} from './build/UnrealBloomPass.js';

//==================================
//=======Lindenmayer Plant==========
//==================================

//Lighting
var ambLight, ambLightColour, ambLightInten;
var dirLight, dirLightColour,dirLightInten;

//Grass Shader
let vertexShader, fragmentShader, uniforms, leavesMaterial;
//sky 
var container;

//Fireflies
const pLights = []
let pLight;
var fireflyColorHex = new THREE.Color(0x33ff33);
var intensity = 1;
var rate = Math.random() * 0.005 + 0.005;

//Delta Time
const clock = new THREE.Clock();

//Loading Manager
const loadingManager = new THREE.LoadingManager();

//Scene
let scene = new THREE.Scene();
let ratio = window.innerWidth/window.innerHeight;
//create the perspective camera
//for parameters see https://threejs.org/docs/#api/cameras/PerspectiveCamera
let camera = new THREE.PerspectiveCamera(45, ratio, 0.1, 1000);
//set the camera position
camera.position.set(0,10,50);
// and the direction
camera.lookAt(0,0,0);

//Fog
scene.fog = new THREE.FogExp2();
scene.fog.color = new THREE.Color(0xca465c);
scene.fog.density = 0.002;

//Raycaster
const raycaster = new THREE.Raycaster();

//Webgl Renderer
let renderer = new THREE.WebGLRenderer();
renderer.antialias = true;
renderer.precision = "highp";
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.powerPreference = "high-performance";
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth,window.innerHeight);
document.body.appendChild(renderer.domElement);

//First Person Controls
//Forward or backward variable declaration
var arrow;
let moveForward = false;
let moveBackword = false;
let moveLeft = false;
let moveRight = false;
//Definition of movement speed and direction of movement
const velocity = new THREE.Vector3(); //=0,0,0
const direction = new THREE.Vector3();
let prevTime = performance.now();
var controls = new PointerLockControls(camera, document.body);

//Effect Composer
const composer = new EffectComposer(renderer);

//Onlu add passes after render pass has been added first
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 0.5, 0.4, 0.85 );
//composer.addPass(bloomPass);

//========DEBUG===========
try {
  initRaycaster();
  initKeyboardControls();
  initEventListeners();
  initLoadingScreen();
  initLights();
  initFireFlies();
  initSkybox();
  initGrassShader();
  initGrassPlane();
  initLindenmayerPlant();
  initLizard();
  initBaseGround();
  initSuperstructure();
  initClawRockTerrain();
  initGui();
  animate(); 
} 
catch (error) {
  console.log("Something went wrong during initialisation.");
  console.error(error);
}
init();
function init() {
  container = document.createElement('div');
  document.body.appendChild(container);

  var canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = window.innerHeight;

  var context = canvas.getContext('2d');

  var gradient = context.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#1e4877');
  gradient.addColorStop(0.5, '#4584b4');

  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  container.style.background = 'url(' + canvas.toDataURL('image/png') + ')';
  container.style.backgroundSize = '35px 100%';

  camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 3000 );
  camera.position.z = 6000;
  
  scene = new THREE.Scene();

  var geometry = new THREE.BufferGeometry();

  var texture = new THREE.CubeTextureLoader('cloud1.png', null, animate);
  texture.magFilter = THREE.LinearMipMapLinearFilter;
  texture.minFilter = THREE.LinearMipMapLinearFilter;

  var fog = new THREE.Fog(0x4584b4, -100, 3000);

  var material = new THREE.ShaderMaterial({
      
      uniforms: {
          "map": {
              type:"t",
              value: texture
          },
          "fogColor":{
              type:"c",
              value: fog.color
          },
          "fogNear":{
              type:"f",
              value: fog.near
          },
          "fogfar":{
              type:"f",
              value: fog.far
          }
      },
      vertexShader: document.getElementById('vs').textContent,
      fragmentShader: document.getElementById('fs').textContent,
      deptWrite: false,
      deptTest: false,
      transparent: true
  });

  var plane = new THREE.Mesh(new THREE.PlaneGeometry(64, 64));

  for(var i = 0; i < 8000; i++ ) {
      plane.position.x = Math.random() * 1000 - 500;
      plane.position.y = -Math.random() * Math.random() * 200 - 15;
      plane.position.z = i;
      plane.rotation.z = Math.random() * Math.PI;
      plane.scale.x = plane.scale.y = Math.random() * Math.random() * 1.5 + 0.5;

      THREE.BufferGeometryUtils.mergeBufferGeometries(geometry, plane);
  }

  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  mesh = new THREE.Mesh(geometry, material);
  mesh.position.z = -8000;
  scene.add(mesh);

  renderer = new THREE.WebGLRenderer({
      antialias: false
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  document.addEventListener('mousemove', onDocumentMouseMove, false);
  window.addEventListener('resize', onWindowResize, false);
}

//========================
//First Person Controls and Raycaster
function initRaycaster(){
  function onPointerMove(event){
    // console.log("clicked");
     const pointer = new THREE.Vector2();
     pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1; //event.clientX
     pointer.y = -( event.clientY / window.innerHeight ) * 2 + 1;
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
         console.log("not hit");
     }
  }
  //event listener
  window.addEventListener('mousedown', onPointerMove, false);
  console.log("initRaycaster() loaded.");
}

function initKeyboardControls()
{
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

  //First Person Control
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);

  console.log("initKeyboardControls() loaded.");
}

function FPCanimate(){
    //FPS 
    const time = performance.now();

    // forward and backward decisions
    direction.z = Number(moveForward) - Number(moveBackword); //cast two variable to 1 to 0
    direction.x = Number(moveRight) - Number(moveLeft);

    // When the pointer turns ON
    if(controls.isLocked){

      const delta = (time - prevTime) / 1000;

      raycaster.setFromCamera( new THREE.Vector2(), camera );  
      scene.remove (arrow);
      arrow = new THREE.ArrowHelper(raycaster.ray.direction, raycaster.ray.origin, 0.25, 0x000000 );
      scene.add(arrow);
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
}

//Event Listeners
function initEventListeners()
{
  //Window Resize
  window.addEventListener('resize', onWindowResize);

  //Audio
  window.addEventListener('click', () => {initPlayAudio()}, {once: true});
  //Dynamic Loading Screen
  const dynamicLoadscreen = document.querySelector(".progress-bar-container");
  dynamicLoadscreen.addEventListener("mousemove", (e) => {
    dynamicLoadscreen.style.backgroundPositionX = -e.offsetX * 0.05 + "px";
    dynamicLoadscreen.style.backgroundPositionY = -e.offsetY * 0.05 + "px";
  });

  //Pointer Lock Controls
  window.addEventListener("click", ()=> {
    controls.lock();
  });
  console.log("initEventListeners() loaded.");
}

//Handle window resize
function onWindowResize() 
{
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

//Loading Screen
function initLoadingScreen(){

  //Description disabled while loading screen is active
  const descriptionContainer = document.getElementById("info");
  descriptionContainer.style.display = "none";

  const progressBar = document.getElementById('progress-bar');
  loadingManager.onProgress = function(url, loaded, total)
  {
    progressBar.value = (loaded / total) * 100;
    console.log(`Started loading assets: ${url}`);
  }

  const progressBarContainer = document.querySelector(".progress-bar-container");
  loadingManager.onLoad = function(){
    //When loaded disable loading screen and enable description
    descriptionContainer.style.display = "true";
    progressBarContainer.style.opacity = "0";
    setTimeout(callback, 4000); //fade-out animation 4sec, meaning this has to be 4000 
  }
  //completely remove loading screen after fading out animation
  //so you can access orbit controls
  var callback = function() {
    progressBarContainer.style.display = "none";
  }
  console.log("initLoadingScreen() loaded.");
}

//Lighting
function initLights(){
  ambLight = new THREE.AmbientLight(ambLightColour, ambLightInten);
  scene.add(ambLight);

  dirLight = new THREE.DirectionalLight(dirLightColour, dirLightInten);
  dirLight.position.set(0, 500, 500);
  scene.add(dirLight);
  console.log("initLights() loaded.");
}

//Fireflies
function initFireFlies()
{
  
  function getPointLight(){

    var light = new THREE.PointLight(fireflyColorHex, intensity, 15.0);

    //light ball
    const geo = new THREE.SphereGeometry(0.05, 30, 30);
    var mat = new THREE.MeshBasicMaterial({color: fireflyColorHex});
    const mesh = new THREE.Mesh(geo, mat);
    mesh.add(light);

    const circle = new THREE.Object3D();
    circle.position.x = (25 * Math.random()) - 12.5;
    circle.position.y = (5 * Math.random()) + 10;
    circle.position.z = (25 * Math.random()) - 12.5;
    const radius = 5;
    mesh.position.x = radius;
    mesh.position.y = radius;
    mesh.position.z = radius;
    circle.rotation.x = THREE.MathUtils.degToRad(90);
    circle.rotation.y = Math.random() * Math.PI * 2;
    circle.add(mesh)

    var glowMat = new THREE.MeshBasicMaterial({
        color: fireflyColorHex,
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

    function update(){
        circle.rotation.z += rate;
        light.color = fireflyColorHex;
        light.intensity = intensity;
        mat.color = fireflyColorHex;
        glowMat.color = fireflyColorHex;
    }

    return{
        obj: circle,
        update,
    }
  }

  for(let i = 0; i< 10; i+= 1){
    pLight = getPointLight()
    scene.add(pLight.obj);
    pLights.push(pLight);
  }
  console.log("initFireFlies() loaded.");
}

//Skybox
function initSkybox(){
  //adding textures 
  const cubeTextureLoader = new THREE.CubeTextureLoader();
  scene.background = cubeTextureLoader.load([
    './images/rwcc/right.png',
    './images/rwcc/left.png',
    './images/rwcc/up.png',
    './images/rwcc/bottom.png',
    './images/rwcc/front.png',
    './images/rwcc/back.png',
  ])
  console.log("initSkybox() loaded."); 
}

//Grass Shader
function initGrassShader(){

  vertexShader = `
    varying vec2 vUv;
    uniform float time;
    
    void main() {

      vUv = uv;
      
      // VERTEX POSITION
      
      vec4 mvPosition = vec4(position, 1.0);
      #ifdef USE_INSTANCING
        mvPosition = instanceMatrix * mvPosition;
      #endif
      
      // DISPLACEMENT
      
      // here the displacement is made stronger on the blades tips.
      float dispPower = 1.0 - cos( uv.y * 3.1416 / 2.0 );
      
      float displacement = sin( mvPosition.z + time * 10.0 ) * ( 0.1 * dispPower );
      mvPosition.z += displacement;
      
      //
      
      vec4 modelViewPosition = modelViewMatrix * mvPosition;
      gl_Position = projectionMatrix * modelViewPosition;

    }
  `;

  fragmentShader = `
    varying vec2 vUv;
    
    void main() {
      vec3 baseColor = vec3(1, 0.2, 0.7); // was 0.41, 1.0, 0.5 
      float clarity = (vUv.y * 0.5 ) + 0.5;
      gl_FragColor = vec4(baseColor * clarity, 1 );
    }
  `;

  uniforms = {
    time: {
      value: 0
    }
  }

  leavesMaterial = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    side: THREE.DoubleSide
  });

  console.log("initGrassShader() loaded."); 
}

//Grass Plane
function initGrassPlane(){
  const instanceNumber = 500; //was 5000
  const grass = new THREE.Object3D();

  const geometry = new THREE.PlaneGeometry(0.1, 1, 1, 4);// was 0.1, 1, 1, 4
  geometry.translate(0, 3, 0); // move grass blade geometry lowest point at 0. // original position is 0, 0.5, 0

  const instancedMesh = new THREE.InstancedMesh(geometry, leavesMaterial, instanceNumber);

  scene.add(instancedMesh);

  //Position and scale the grass blade instances randomly.

  for (let i = 0 ; i < instanceNumber; i++) {

    grass.position.set(
      ( Math.random() - 0.5 ) * 40, //original rand is ( Math.random() - 0.5 ) * 10, 0, ( Math.random() - 0.5 ) * 10
      0,
      ( Math.random() - 0.5 ) * 40
    ); 

    grass.userData.name = "grassPlane";
    grass.scale.setScalar(0.5 + Math.random() * 0.5);
    grass.rotation.y = Math.random() * Math.PI;
    grass.updateMatrix();
    instancedMesh.setMatrixAt(i, grass.matrix);
  }
  console.log("initGrassPlane() loaded."); 
}

//L-System Plant
function initLindenmayerPlant(){
//Reference: https://codepen.io/mikkamikka/pen/DrdzVK

  function Params() {
    this.iterations = 2;
    this.theta = 18;
    this.thetaRandomness = 100;
    this.angle = 0;
    this.scale = 4;
    this.scaleRandomness = 100;
    this.constantWidth = true;
    this.deltarota = 30;
  }

  function Rules()  {
    this.axiom = 'F';
    this.mainRule = 'FF-[-F+F+F]+[+F-F-F]';
    this.Rule2 = '';
  }

  var rules = new Rules();
  var params = new Params();

  function GetAxiomTree() {
    var Waxiom = rules.axiom;
    var newf = rules.mainRule;
    var newb = 'bb';
    var newx = rules.Rule2;
    var level = params.iterations;    
    while (level > 0) {        
        var m = Waxiom.length;
        var T = '';        
        for (var j=0; j < m; j++) {
            var a = Waxiom[j];
            if (a == 'F'){T += newf;}
            else
              if (a == 'b'){T += newb;}
              else                   
                if (a == 'X'){T += newx;}
                else
                  T += a;
        }
        Waxiom = T;
        level--;
    }
    return Waxiom;
  }

  function DrawTheTree(plantGeometry, x_init, y_init, z_init){   
    let plantVertices = plantGeometry;
    var Wrule = GetAxiomTree();
    var n = Wrule.length;
    var stackA = [];
    var stackV = []; 

    var theta = params.theta * Math.PI / 180; 
    var scale = params.scale;
    var angle = params.angle * Math.PI / 180;

    var x0 = x_init; var y0 = y_init; var z0 = z_init;
    var rota = 0, rota2 = 0,
        deltarota = 18 * Math.PI/180;  
    var axis_y = new THREE.Vector3( 0, 1, 0 );
    var axis_delta = new THREE.Vector3(),
      prev_startpoint = new THREE.Vector3();

    var startpoint = new THREE.Vector3(x0,y0,z0), 
        endpoint = new THREE.Vector3();
    var bush_mark;
    var vector_delta = new THREE.Vector3(scale, scale, 0);

    for (var j=0; j<n; j++){        
        var a = Wrule[j];
        if (a == "+")
        {
          angle -= theta;                     
        }
        if (a == "-")
        {
          angle += theta;                                 
        }
        if (a == "F"){
          var a = vector_delta.clone().applyAxisAngle( axis_y, angle );          
          endpoint.addVectors(startpoint, a);  
          
          plantVertices.push(startpoint.clone());
          plantVertices.push(endpoint.clone());

          prev_startpoint.copy(startpoint);
          startpoint.copy(endpoint);
          axis_delta = new THREE.Vector3().copy(a).normalize();
          rota += deltarota;// + (5.0 - Math.random()*10.0);
          
        } 
        if (a == "L")
        {
          endpoint.copy(startpoint);
          endpoint.add(new THREE.Vector3(0, scale*1.5, 0));
          var vector_delta2 = new THREE.Vector3().subVectors(endpoint, startpoint);
          vector_delta2.applyAxisAngle( axis_delta, rota2 );
          endpoint.addVectors(startpoint, vector_delta2); 
          
          plantVertices.push(startpoint.clone());
          plantVertices.push(endpoint.clone());          

          rota2 += 45 * Math.PI/180;
        }
        if (a == "%"){}
        if (a == "["){
            stackV.push(new THREE.Vector3(startpoint.x, startpoint.y, startpoint.z));            
            stackA[stackA.length] = angle;            
        }
        if (a == "]"){
            var point = stackV.pop();
            startpoint.copy(new THREE.Vector3(point.x, point.y, point.z));
            angle = stackA.pop();
        }        
      bush_mark = a;
    }
  return plantVertices;
  }

  function setRules(){
    rules.axiom = "F";
    rules.mainRule = "F-F[-F+F[LLLLLLLL]]++F[+F[LLLLLLLL]]--F[+F[LLLLLLLL]]";
    params.iterations = 3;
    params.angle = 0;
    params.theta = 30;
    params.scale = 6;    
  }

  function plantInit() {

  setRules();

  let plantGeometry = [];
  var material = new THREE.LineBasicMaterial({color: 0xA91B60}); //pink
  material.linewidth = 3;
  plantGeometry = DrawTheTree(plantGeometry, 0, -150, 0);  
  var geometry = new THREE.BufferGeometry().setFromPoints(plantGeometry);

  //plant = new THREE.Mesh(line_geometry, material);
  var plant = new THREE.Line(geometry, material);
  plant.position.set(8,7,-6);
  plant.scale.setScalar(0.05);
  scene.add(plant);       
  }
  plantInit();
  console.log("initLindenmayerPlant() loaded."); 
}

//Pink Lizard
function initLizard(){
  const fbxLoader = new FBXLoader(loadingManager);
  fbxLoader.setResourcePath("./textures/pink_lizard/");
  fbxLoader.load('./model/pink_lizard.fbx', function(lizard) {

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
  lizard.position.set(-10, 2.2, -10);
  lizard.rotation.set(0, 0, 0);
  scene.add(lizard);
  });
  console.log("initLizard() loaded."); 
}

//Base Ground Model
function initBaseGround(){
  const fbxLoader = new FBXLoader(loadingManager);
    fbxLoader.setResourcePath("./textures/base/");
    fbxLoader.load('./model/chimney_canopy_base.fbx', function(chimneyCanopyBase) {

    chimneyCanopyBase.traverse(function(child){
        if (child.isMesh) 
        {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      } 
    );

    chimneyCanopyBase.userData.name = "Chimney Canopy Base";
    chimneyCanopyBase.scale.setScalar(0.04);
    dirLight.target = chimneyCanopyBase;
    scene.add(chimneyCanopyBase);
  });
  console.log("initBaseGroundModel() loaded."); 
}

function initSuperstructure(){
  const fbxLoader = new FBXLoader(loadingManager);
    fbxLoader.load('./model/superstructure.fbx', function(superstructure) {

      superstructure.traverse(function(child){
        if (child.isMesh) 
        {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      } 
    );

    superstructure.userData.name = "5P Superstructure";
    superstructure.position.set(500, 0, -700);
    superstructure.scale.setScalar(10);
    scene.add(superstructure);
  });
  console.log("initSuperstructure() loaded."); 
}

//Claw Rock Terrain
function initClawRockTerrain(){
  const fbxLoader = new FBXLoader(loadingManager);
  fbxLoader.setResourcePath("./textures/claw_rock/");
  fbxLoader.load('./model/claw_rock.fbx', function(clawRockTerrain) {

    clawRockTerrain.traverse(function(child){
      if (child.isMesh) 
      {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    } 
  );

    clawRockTerrain.userData.name = "Claw Rock Terrain";
    clawRockTerrain.scale.setScalar(0.3);
    clawRockTerrain.position.set(0, 0, 0);
    scene.add(clawRockTerrain);
  });
  console.log("initClawRockTerrain() loaded."); 
}

//Music Player
function initPlayAudio(){
  const listener = new THREE.AudioListener();
  //laod audio file 
  camera.add( listener );
  const sound = new THREE.Audio(listener);
  const audioLoader = new THREE.AudioLoader();
  audioLoader.load('./music/progfox-overcast.mp3', function(buffer){
    sound.setBuffer( buffer );
    sound.setLoop( true );
    sound.setVolume( 0.5 );
    sound.play();
  });
  console.log("initPlayAudio() loaded."); 
}

//Dat GUI
function initGui()
{
  const gui = new GUI();

  //parameters for GUI
//colour variables
  let params = {
    ambLightColour: 0xe52b50,  //dark pink - Amaranth shade
    ambLightInten: 0.05,
    dirLightColour: 0xfd8535, //orange - Coral shade
    dirLightInten: 0.05,
    plantFirstColour: 0xffffff, //white
    plantSecondColour: 0xffffff, //white
    plantThirdColour: 0xffffff, //white
    fireflyColor: 0x33ff33,
    fireflySpeed: 0.0005,
    fireflyIntensity: 1,
    fogColor: 0xe52b50,
    fogDensity: 0.5
  }

  let colourFolder = gui.addFolder("Scene Light");

  //Ambient Light Control
  let ambLightFolder = colourFolder.addFolder("Ambient Light");
  ambLightFolder.addColor(params, "ambLightColour").name("AL Colour").onChange(() => 
  {
      ambLight.color.setHex(params.ambLightColour);
  });
  ambLightFolder.add(params, "ambLightInten", 0, 10, 0.005).name("AL Intensity").onChange(() =>
  {
      ambLight.intensity = params.ambLightInten;
  });

  //Directional Light Control
  let dirLightFolder = colourFolder.addFolder("Directional Light");
  dirLightFolder.addColor(params, "dirLightColour").name("Directional Light").onChange(() => 
  {
    dirLight.color.setHex(params.dirLightColour);
  })
  dirLightFolder.add(params, "dirLightInten", 0, 1, 0.005).name("Dir Light Intensity").onChange(() => 
  {
    dirLight.intensity = params.dirLightInten;
  })

  //Fog Control
  let fogFolder = gui.addFolder("Fog Weather");
   fogFolder.addColor(params, "fogColor").name("Fog Colour").onChange(function(){
       scene.fog.color.set(params.fogColor);
   });
   fogFolder.add(params, "fogDensity", 0, 0.01, 0.001).name("Fog Density").onChange(function(){
       scene.fog.density = params.fogDensity;
   });

  //Fireflies Control
  let fireflyFolder = gui.addFolder("Fireflies");
  fireflyFolder.addColor(params, 'fireflyColor').name("Color").onChange(() => {
    fireflyColorHex.setHex(params.fireflyColor);
  });
  fireflyFolder.add(params, "fireflySpeed", 0.0005, 0.05, 0.0005).name("Speed").onChange(() =>
  {
      rate = params.fireflySpeed;
  });
  fireflyFolder.add(params, "fireflyIntensity", 0, 5, 1).name("Intensity").onChange(() =>
  {
      intensity = params.fireflyIntensity;
  });

  console.log("initGui() loaded."); 
}

//Animate
function animate(){
  requestAnimationFrame(animate);
  composer.render(scene,camera);
  //Fireflies movement
  pLights.forEach( l => l.update());

  //grass shader animation
  // Hand a time variable to vertex shader for wind displacement.
	leavesMaterial.uniforms.time.value = clock.getElapsedTime();
  leavesMaterial.uniformsNeedUpdate = true;
  FPCanimate();
}

