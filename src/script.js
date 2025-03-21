import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import globalData from './globalData.js'

import {loadModel, mixers, updateInteractables, hideTooltip, showContainer, deleteTooltips} from './modelLoader.js'

import Stats from 'three/addons/libs/stats.module.js';


import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';



var mouse, raycaster;

let container, stats, clock;
let composer, outlinePass;

const model = {}
let camera, scene, renderer;
const canvas = document.querySelector('canvas');


let isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
console.log(isMobile);

function init()
{
  
    // initialize the scene
    scene = new THREE.Scene()
    //scene.fog = new THREE.Fog(0xa5a5a5, 0.5, 20);
    //scene.background = new THREE.Color(0xafafaf);
    
    
    
    
    loadModel('/roomportfolio_opt.gltf', scene, model);
    

    mouse = new THREE.Vector2()
    raycaster = new THREE.Raycaster();
    
    
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    const directionalLight = new THREE.DirectionalLight(0xffffff, .5);
    
    
    scene.add(ambientLight);
    scene.add(directionalLight);
    
    scene.background = new THREE.Color(0x141619)
    
    // initialize the camera
    camera = new THREE.PerspectiveCamera(
      75, 
      window.innerWidth / window.innerHeight,
      0.1,
      30);
    
    camera.position.set(
      3.803140345741882,
      4.114402818533132,
      2.0820341820698127
    );
    camera.lookAt(new THREE.Vector3(0,2,2))
    // initialize the renderer
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
    })
    
    renderer.setPixelRatio( window.devicePixelRatio );
    
    // Initialize the controls
    //const controls = new OrbitControls(camera, renderer.domElement)
    //controls.enableDamping = true;
    
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    renderer.domElement.addEventListener('click', onClick, false);
    renderer.domElement.addEventListener('mousemove', onHover, false);
    
    window.addEventListener('resize', () => {
        resize();
    })
    
    
    
    // postprocessing
    
    const outlineParams = 
    {
      hiddenEdgeColor:  new THREE.Color("#ffffff")
    }
    
    
    composer = new EffectComposer( renderer );
    
    const renderPass = new RenderPass( scene, camera );
    composer.addPass( renderPass );
    
    outlinePass = new OutlinePass( new THREE.Vector2( window.innerWidth, window.innerHeight ), scene, camera );
    Object.assign(outlinePass, outlineParams);
    composer.addPass( outlinePass );
    
    let fxaaPass = new ShaderPass( FXAAShader );
    
    
    const outputPass = new OutputPass();
    composer.addPass( outputPass );
    
    const pixelRatio = renderer.getPixelRatio();
    globalData.camera = camera;
    globalData.canvas = canvas;
    globalData.outlinePass = outlinePass;
    globalData.pixelRatio = pixelRatio;
    
    fxaaPass.material.uniforms[ 'resolution' ].value.x = 1 / ( window.innerWidth * pixelRatio );
    fxaaPass.material.uniforms[ 'resolution' ].value.y = 1 / ( window.innerHeight * pixelRatio );
    
    composer.addPass(fxaaPass);
    
    
    
    // Add stats
    
    container = document.getElementById('info');
    stats = new Stats();
    stats.dom.style.top = '50%';
    // container.appendChild( stats.dom );
    
    
    clock = new THREE.Clock();
  }
  
init();

    
let previousTime = 0;
const renderloop = () => {

    const currentTime = clock.getElapsedTime();
    const delta = currentTime - previousTime;
       
    //Physics
    mixers.forEach((mixer) => mixer.update(delta));
  
    
    
    previousTime = currentTime;
    //controls.update()
    stats.update();
    renderer.render(scene, camera);
    composer.render();
    window.requestAnimationFrame(renderloop)
}

renderloop()


function resize()
{

  updateInteractables();
  

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

}

setInterval(resize, 5000);

function onClick() {

  event.preventDefault();

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  

  raycaster.setFromCamera(mouse, camera);

  var intersects = raycaster.intersectObject(scene, true);

  if (intersects.length > 0) {
	
		var object = intersects[0].object;

    if (object.userData.interactable)
    {
      object.userData.interactable.triggerClick();
    }
  }
	

}


function onHover(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
  globalData.outlinePass.selectedObjects = [];
  hideTooltip();

  raycaster.setFromCamera(mouse, camera);
  
  const intersects = raycaster.intersectObjects(scene.children, true);
  
  if (intersects.length > 0) {
      const object = intersects[0].object;
      let max_steps = 4, cur_step = 0;
      let cur_obj = object;
      while (cur_step < max_steps)
      {
        if (!cur_obj) break;
        if (cur_obj.userData.interactable)
        {
          cur_obj.userData.interactable.triggerHover();
          break;
        }
        cur_obj = cur_obj.parent;
        cur_step++;
      }
    
  }
}

window.showContainer = showContainer;

const swiper = new Swiper('.slider-wrapper', {
  // Optional parameters
  grabCursor: true,
  centeredSlides: true,
  spaceBetween: true,

  // If we need pagination
  pagination: {
    el: '.swiper-pagination',
    clickable: true,
    dynamicBullets: true
  },

  // Navigation arrows
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },

  slidesPerView:'auto'

});


