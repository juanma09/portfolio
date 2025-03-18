import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Interactable, Tooltip } from './interactable';

import globalData from './globalData.js';

export const InteractableInstances = [
    new Interactable("Speaker", null, () => {console.log(globalData.camera)}, function(){showOutline(this.model)}, false),
    new Interactable("Termo", null, () => {console.log(globalData.camera)}, function(){showOutline(this.model)}, false),
    new Interactable("Skills", null, () => {showContainer("Skills")},function(){showOutline(this.model); hideTooltip(); this.customData.tooltip.show()}),
    new Interactable("Projects", null, () => {showContainer("Projects")}, function(){showOutline(this.model); hideTooltip(); this.customData.tooltip.show()}),
    new Interactable("Clock", null, function() { projectTextbox(this)}, null, false)
];

function showOutline(model)
{
    globalData.outlinePass.selectedObjects = [model]
    
    globalData.activeTooltip = model.userData.interactable.customData.tooltip;
}

export function hideTooltip()
{
    InteractableInstances.forEach(item => {
        if (item.customData.tooltip)
        {
            item.customData.tooltip.hide();
        }
    })
}

export function showContainer(elId){
    hideContainers();
    var cont = document.getElementById(elId);
    if (cont)
        document.getElementById(elId).classList.remove('inactive');
    console.log(cont);
}

function hideContainers()
{
    document.querySelectorAll('.container').forEach(item => {item.classList.add('inactive')})
}


export function setClockHour()
{
    var clock = InteractableInstances.find( item => item.name === "Clock");
    var d = new Date();

    var hour = clock.model.children.find(item => item.name === "Hour");
    var minute = clock.model.children.find(item => item.name === "Minutes");

    console.log(d.getHours());
    console.log(d.getMinutes());
    var m_rot = -1 * THREE.MathUtils.degToRad(d.getMinutes() * (360 / 60));
    var h_rot = -1 * THREE.MathUtils.degToRad(d.getHours() * (360 / 12));

    minute.rotation.set(0, m_rot, 0);
    hour.rotation.set(0, h_rot, 0);
    hour.scale.multiplyScalar(0.8)
    console.log(minute);
    console.log(hour);

}

export const mixers = [];

export function ManageInteractables(model)
{
    for (let i = 0; i < InteractableInstances.length; i++)
    {
        if (InteractableInstances[i].name === model.name)
        {
            InteractableInstances[i].setModel(model);
            if (InteractableInstances[i].customData.tooltip)
            {
                InteractableInstances[i].customData.tooltip.projectTextbox(InteractableInstances[i]);
            }
        }
    }
}


export function loadModel(modelPath, scene, model)
{   
    const loading_screen = document.getElementById("loading-screen");
    

    const loader = new GLTFLoader();
    loader.load(
    modelPath,
    function (gltf) 
    {
        console.log(gltf.scene)
        const mixer = new THREE.AnimationMixer(gltf.scene);
        gltf.scene.traverse((child) => {
            if (child.isMesh) {
                if (child.parent.name === "roomportfoliogltf")
                {
                    const path = child.name.replace(/\s+/g, '.');
                    setNestedProperty(model, path, child);
                    ManageInteractables(child);
                }
        }
    });
        console.log(model);

        gltf.animations.forEach((clip) => {
            const action = mixer.clipAction(clip);
            action.setLoop(THREE.LoopRepeat);
            action.play();
        });

        mixers.push(mixer);
        
        globalData.modelsReady = true;
        
        console.log(model);
        console.log(InteractableInstances);

        scene.add(gltf.scene);

        setTimeout(() => {
            loading_screen.remove(); 
        }, 2000);
        
        setClockHour();
    }, 
    function ( xhr ) {

		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

	},
	// called when loading has errors
	function ( error ) {
        console.warn(error)
		console.log( 'An error happened' );

	}
    );


}

function setNestedProperty(target, path, value) {
  const keys = path.split('.');  // Split the path into keys
  let current = target;
  for (let i = 0; i < keys.length - 1; i++) {
    // If the key doesn't exist yet, create it
    if (!current[keys[i]]) current[keys[i]] = {};
    current = current[keys[i]];
  }
  // Set the value at the final key
  current[keys[keys.length - 1]] = value;
}


export function updateInteractables()
{
    if (!globalData.modelsReady) return;
    InteractableInstances.forEach(item => {
        if (item.customData.tooltip)
        {
            item.customData.tooltip.projectTextbox(item);  
            item.customData.tooltip.show();
        }
    });
}

