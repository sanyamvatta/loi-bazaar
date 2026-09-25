/* Configuration */
const WHATSAPP_NUMBER = "919855071280"; 
const AUTO_ADVANCE_DELAY = 200; 

/* State Management */
let currentState = {
    step: 1,
    intent: null,
    location: null,
    hasSubLocation: false,
    zone: null,
    block: null,
    type: null,
    size: null
};

/* DOM Elements */
const progressBar = document.getElementById('progressBar');
const prevBtn = document.getElementById('prevBtn');
const navControls = document.getElementById('navControls');
const successScreen = document.getElementById('successScreen');

// Mapping steps to HTML IDs (Now 7 steps total)
const steps = {
    1: 'step1',       // Intent
    2: 'step2',       // Location
    3: 'step2-zone',  // Zone (A-D or E-J)
    4: 'step2-block', // Specific Block
    5: 'step3',       // Type
    6: 'step4',       // Size
    7: 'step5'        // Summary
};

document.addEventListener('DOMContentLoaded', () => {
    updateUI();
    createParticles();
});

function selectOption(key, value, element) {
    currentState[key] = value;
    highlightSelection(element);
    setTimeout(nextStep, AUTO_ADVANCE_DELAY);
}

function selectLocation(locationName, hasSub, element) {
    currentState.location = locationName;
    currentState.hasSubLocation = hasSub;
    currentState.zone = null;
    currentState.block = null; 
    
    const siblings = element.parentElement.children;
    for (let sib of siblings) {
        sib.classList.remove('selected');
        const icon = sib.querySelector('i');
        if(icon) icon.className = sib.innerText.includes('Sector') ? 'fa-solid fa-chevron-right' : 'fa-solid fa-check';
    }
    
    element.classList.add('selected');
    const icon = element.querySelector('i');
    if(icon) icon.className = 'fa-solid fa-check';

    setTimeout(nextStep, AUTO_ADVANCE_DELAY);
}

// NEW: Zone & Dynamic Block Selection
function selectZone(zoneName, element) {
    currentState.zone = zoneName;
    highlightSelection(element);
    
    const container = document.getElementById('specificBlockGrid');
    container.innerHTML = ''; 
    
    const blockList = zoneName === 'Block A-D' ? ['A', 'B', 'C', 'D'] : ['E', 'F', 'G', 'H', 'I', 'J'];
    
    blockList.forEach(b => {
        const div = document.createElement('div');
        div.className = 'option-card';
        div.innerHTML = `<span>Block ${b}</span>`;
        div.onclick = function() {
            selectOption('block', `Block ${b}`, this);
        };
        container.appendChild(div);
    });

    setTimeout(nextStep, AUTO_ADVANCE_DELAY);
}

function selectType(type, element) {
    currentState.type = type;
    currentState.size = null; 
    highlightSelection(element);
    renderSizes(); 
    setTimeout(nextStep, AUTO_ADVANCE_DELAY);
}

function highlightSelection(element) {
    const siblings = element.parentElement.children;
    for (let sib of siblings) {
        sib.classList.remove('selected');
    }
    element.classList.add('selected');
}

function renderSizes() {
    const container = document.getElementById('sizeOptionsContainer');
    container.innerHTML = ''; 

    let sizes = [];

    if (currentState.location === 'Low Density' && currentState.type === 'Residential') {
        sizes = ['400 Gaj', '600 Gaj', '800 Gaj'];
    }
    else if ((currentState.location === 'Eco City 3' || (currentState.location === 'Aerotropolis' && currentState.zone === 'Block E-J')) && currentState.type === 'Residential') {
        sizes = ['200 Gaj', '300 Gaj', '500 Gaj'];
    }
    else if ((currentState.location === 'Eco City 3' || (currentState.location === 'Aerotropolis' && currentState.zone === 'Block E-J')) && currentState.type === 'Commercial') {
        sizes = ['100 Gaj Showroom', '200 Gaj Showroom'];
    }
    else if (currentState.type === 'Residential') {
        sizes = ['100 Gaj', '150 Gaj', '200 Gaj', '300 Gaj', '500 Gaj'];
    } 
    else if (currentState.type === 'Commercial') {
        sizes = ['25 Gaj Booth', '60 Gaj Bay Shop', '100 Gaj Showroom', '200 Gaj Showroom'];
    }
    else if (currentState.type === 'Industrial Plots') {
        sizes = ['275 Gaj', '550 Gaj'];
    }
    else if (currentState.type === 'Showrooms') {
        sizes = ['60 Gaj Bay Shop', '100 Gaj Showroom', '200 Gaj Showroom'];
    }
    
    sizes.forEach(size => {
        const div = document.createElement('div');
        div.className = 'option-row';
        div.innerHTML = `<div class="row-content"><span>${size}</span></div> <i class="fa-regular fa-circle action-icon"></i>`;
        
        div.onclick = function() {
            currentState.size = size;
            Array.from(container.children).forEach(c => {
                c.classList.remove('selected');
                c.querySelector('.action-icon').className = 'fa-regular fa-circle action-icon';
            });
            this.classList.add('selected');
            this.querySelector('.action-icon').className = 'fa-solid fa-dot-circle action-icon';
            setTimeout(nextStep, AUTO_ADVANCE_DELAY);
        };
        container.appendChild(div);
    });
}

function nextStep() {
    let nextStepNum = currentState.step + 1;
    // Skip Zones & Blocks if location doesn't require them
    if (currentState.step === 2 && !currentState.hasSubLocation) {
        nextStepNum = 5; 
    }
    if(nextStepNum > 7) return;
    currentState.step = nextStepNum;
    updateUI();
}

function prevStep() {
    let prevStepNum = currentState.step - 1;
    // Skip back over Zones & Blocks if location didn't require them
    if (currentState.step === 5 && !currentState.hasSubLocation) {
        prevStepNum = 2;
    }
    if(prevStepNum < 1) return;
    currentState.step = prevStepNum;
    updateUI();
}

function updateUI() {
    document.querySelectorAll('.form-step').forEach(el => el.classList.remove('active'));

    let activeStepLogical = currentState.step;
    
    if(activeStepLogical === 3 && !currentState.hasSubLocation) {
        currentState.step = 5;
        activeStepLogical = 5;
    }

    let activeStepId = steps[activeStepLogical];
    document.getElementById(activeStepId).classList.add('active');

    if (activeStepLogical === 5) {
        const typeContainer = document.querySelector('#step3 .options-grid');
        
        if (currentState.location === 'Sector 101 Dhurali') {
            typeContainer.innerHTML = `
                <div class="option-card" onclick="selectType('Industrial Plots', this)">
                    <div class="icon-circle"><i class="fa-solid fa-industry"></i></div>
                    <span>Industrial Plots</span>
                </div>
                <div class="option-card" onclick="selectType('Showrooms', this)">
                    <div class="icon-circle"><i class="fa-solid fa-shop"></i></div>
                    <span>Showrooms</span>
                </div>
            `;
        } else if (currentState.location === 'Low Density') {
            typeContainer.innerHTML = `
                <div class="option-card" onclick="selectType('Residential', this)">
                    <div class="icon-circle"><i class="fa-solid fa-house-chimney"></i></div>
                    <span>Residential</span>
                </div>
            `;
        } else {
            typeContainer.innerHTML = `
                <div class="option-card" onclick="selectType('Residential', this)">
                    <div class="icon-circle"><i class="fa-solid fa-house-chimney"></i></div>
                    <span>Residential</span>
                </div>
                <div class="option-card" onclick="selectType('Commercial', this)">
                    <div class="icon-circle"><i class="fa-solid fa-city"></i></div>
                    <span>Commercial</span>
                </div>
            `;
        }
    }

    let progress = (currentState.step / 7) * 100;
    progressBar.style.width = `${progress}%`;

    prevBtn.style.visibility = currentState.step === 1 ? 'hidden' : 'visible';
    
    if (currentState.step === 7) {
        fillSummary();
    }
}

function fillSummary() {
    document.getElementById('summaryIntent').innerText = currentState.intent;
    let locString = currentState.location;
    if(currentState.hasSubLocation && currentState.block) {
        locString += ` - ${currentState.block}`;
    }
    document.getElementById('summaryLocation').innerText = locString;
    document.getElementById('summaryType').innerText = currentState.type;
    document.getElementById('summarySize').innerText = currentState.size;
}

function submitForm() {
    let locationFull = currentState.location;
    if(currentState.hasSubLocation) locationFull += ` (${currentState.block})`;

    // Updated custom message formatting with single line breaks
    const message = `Hello Happy from GMADA ${currentState.location} LOI Bazaar,%0aI am looking to *${currentState.intent.toUpperCase()}* an LOI.%0a📍 *Location:* ${locationFull}%0a🏠 *Type:* ${currentState.type}%0a📏 *Size:* ${currentState.size}%0a%0aPlease contact me at the earliest.`;

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');

    document.querySelectorAll('.form-step').forEach(el => el.classList.remove('active'));
    navControls.style.display = 'none';
    progressBar.parentElement.style.display = 'none';
    document.querySelectorAll('.step-title').forEach(t => t.style.display = 'none');
    successScreen.style.display = 'block';
}

function resetForm() {
    location.reload();
}

function createParticles() {
    const container = document.getElementById('particles');
    if(!container) return; 
    container.innerHTML = '';
    const particleCount = 20; 
    for (let i = 0; i < particleCount; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random() * 100 + 'vw';
        const size = Math.random() * 8 + 4 + 'px'; 
        p.style.width = size;
        p.style.height = size;
        const duration = Math.random() * 15 + 15; 
        p.style.animationDuration = duration + 's';
        p.style.animationDelay = '-' + (Math.random() * duration) + 's';
        container.appendChild(p);
    }
}
