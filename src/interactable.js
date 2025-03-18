import * as THREE from 'three';
import globalData from './globalData';

export class Interactable {
    constructor(name, model = null, onClick = () => {}, onHover = () => {}, hasTooltip = true) {
        this.name = name;
        this.model = model;
        this.onClick = onClick;
        this.onHover = onHover;

        this.customData = {};

        if (hasTooltip)
            this.customData.tooltip = new Tooltip(this.name);

        // Enable raycast interactions
        this.setupInteractions();
    }

    setupInteractions() {
        if (this.model) {
            this.model.userData.interactable = this; // Store reference in model for easy access
            if (this.customData.onStart)
            {
                this.customData.onStart();
            }
        }
    }

    triggerClick() {
        if (this.onClick) this.onClick(this);
    }

    triggerHover() {
        if (this.onHover) this.onHover(this);
    }

    setModel(model)
    {
        this.model = model;
        this.setupInteractions();
    }
}


export class Tooltip {
    constructor(text) {
        this.text = text;
        this.tooltipHTML = `
            <div id="tooltip-${this.text.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-_]/g, '')}" class="hint" data-position="4">
                <span class="hint-radius"></span>
                <span class="hint-dot"></span>
                <div class="hint-content do--split-children">
                    <p>${this.text}</p>
                </div>
            </div>
        `;

        const itemHints = document.querySelector('.item-hints');
    
        this.tooltipElement = document.createElement('div');
        this.tooltipElement.innerHTML = this.tooltipHTML;
        this.tooltipElement = this.tooltipElement.querySelector(".hint");


        if (itemHints) {
            itemHints.appendChild(this.tooltipElement);
        } else {
            console.warn('No container found for item hints.');
        }

        console.log(this.tooltipElement);  
     }
 


    projectTextbox(obj)
    {
        if (!obj)
        {
            console.warn("No model associated with tooltip object");
            return;
        }

        const boxPosition = new THREE.Vector3();
        const canvas = globalData.canvas;
        const camera = globalData.camera;
        boxPosition.setFromMatrixPosition(obj.model.matrixWorld);
        boxPosition.project(camera);
    
        var widthHalf = canvas.clientWidth / 2, heightHalf = canvas.clientHeight / 2;
    
        boxPosition.x = (boxPosition.x * widthHalf) + widthHalf;
        boxPosition.y = -(boxPosition.y * heightHalf) + heightHalf;
    
        var hint = this.tooltipElement;
    
        var offsetX, offsetY;
        offsetX = -hint.querySelector(".hint-dot").offsetWidth/ 2;
        offsetY = -hint.querySelector(".hint-dot").offsetHeight / 2;

        this.offset = {x: offsetX, y: offsetY};
    
        this.boxPosition = boxPosition;
    
      
        
    }

    show() {
        if (!this.tooltipElement) return;

        // Add 'active' class to show the tooltip and start the animation
        this.tooltipElement.classList.add('active');
        this.tooltipElement.style.left = `${this.boxPosition.x + this.offset.x}px`;
        this.tooltipElement.style.top = `${this.boxPosition.y + this.offset.y}px`;
    }

    hide() {
        if (this.tooltipElement) {
            // Remove 'active' class to hide the tooltip and stop the animation
            this.tooltipElement.classList.remove('active');
        }
    }
}
