/* Configuration */
const WHATSAPP_NUMBER = "919855071280"; // Replace with your number
const AUTO_ADVANCE_DELAY = 200; // 0.4 seconds delay for smooth transition

/* State Management */
let currentState = {
    step: 1,
    intent: null,
    location: null,
    hasSubLocation: false,
    block: null,
    type: null,
    size: null
};

/* DOM Elements */
const progressBar = document.getElementById('progressBar');
const prevBtn = document.getElementById('prevBtn');
const navControls = document.getElementById('navControls');
const successScreen = document.getElementById('successScreen');

// Mapping steps to IDs
const steps = {
    1: 'step1',
    2: 'step2',
    3: 'step2-sub', // Conditional Block
    4: 'step3',     // Type
    5: 'step4',     // Size
    6: 'step5'      // Summary
};

/* Initialization */
document.addEventListener('DOMContentLoaded', () => {
    updateUI();
    createParticles();
});

/* --- Selection Handlers with Auto-Advance --- */

function selectOption(key, value, element) {
    // 1. Update State
    currentState[key] = value;
    
    // 2. Visual Feedback
    highlightSelection(element);

    // 3. Auto Advance
    setTimeout(nextStep, AUTO_ADVANCE_DELAY);
}

function selectLocation(locationName, hasSub, element) {
    currentState.location = locationName;
    currentState.hasSubLocation = hasSub;
    currentState.block = null; // Reset block logic
    
    // Visual Feedback (Handle checkmarks vs arrows)
    const siblings = element.parentElement.children;
    for (let sib of siblings) {
        sib.classList.remove('selected');
        const icon = sib.querySelector('i');
        // Reset icons based on type
        if(icon) icon.className = sib.innerText.includes('Sector') ? 'fa-solid fa-chevron-right' : 'fa-solid fa-check';
    }
    
    element.classList.add('selected');
    // Change arrow to checkmark temporarily to show success
    const icon = element.querySelector('i');
    if(icon) icon.className = 'fa-solid fa-check';

    setTimeout(nextStep, AUTO_ADVANCE_DELAY);
}

function selectType(type, element) {
    currentState.type = type;
    currentState.size = null; 
    
    highlightSelection(element);
    renderSizes(); // Prepare the next step
    
    setTimeout(nextStep, AUTO_ADVANCE_DELAY);
}

/* Helper: Highlight Styling */
function highlightSelection(element) {
    const siblings = element.parentElement.children;
    for (let sib of siblings) {
        sib.classList.remove('selected');
    }
    element.classList.add('selected');
}

/* Logic: Render Sizes based on Type */
function renderSizes() {
    const container = document.getElementById('sizeOptionsContainer');
    container.innerHTML = ''; // Clear previous

    let sizes = [];
    if (currentState.type === 'Residential') {
        sizes = ['100 Gaj', '150 Gaj', '200 Gaj', '300 Gaj', '500 Gaj'];
    } else {
        sizes = ['25 Gaj Booth', '60 Gaj Bay Shop', '100 Gaj Showroom', '200 Gaj Showroom'];
    }

    sizes.forEach(size => {
        const div = document.createElement('div');
        div.className = 'option-row';
        div.innerHTML = `<span>${size}</span> <i class="fa-regular fa-circle"></i>`;
        
        // Add click listener
        div.onclick = function() {
            currentState.size = size;
            
            // Visual toggle
            Array.from(container.children).forEach(c => {
                c.classList.remove('selected');
                c.querySelector('i').className = 'fa-regular fa-circle';
            });
            this.classList.add('selected');
            this.querySelector('i').className = 'fa-solid fa-dot-circle';

            // Auto Advance to Summary
            setTimeout(nextStep, AUTO_ADVANCE_DELAY);
        };
        container.appendChild(div);
    });
}

/* Navigation Logic */
function nextStep() {
    // Determine next logical step
    let nextStepNum = currentState.step + 1;

    // Skip Block selection (Step 3) if location doesn't require it
    if (currentState.step === 2 && !currentState.hasSubLocation) {
        nextStepNum = 4; 
    }

    // Boundary check
    if(nextStepNum > 6) return;

    currentState.step = nextStepNum;
    updateUI();
}

function prevStep() {
    let prevStepNum = currentState.step - 1;

    // Skip Block selection going back if location didn't require it
    if (currentState.step === 4 && !currentState.hasSubLocation) {
        prevStepNum = 2;
    }

    if(prevStepNum < 1) return;

    currentState.step = prevStepNum;
    updateUI();
}

/* Core UI Updater */
function updateUI() {
    // Hide all steps
    document.querySelectorAll('.form-step').forEach(el => el.classList.remove('active'));

    // Show current step
    let activeStepId = steps[currentState.step];
    
    // Safety fallback for skip logic
    if(currentState.step === 3 && !currentState.hasSubLocation) {
        currentState.step = 4; 
        activeStepId = steps[4];
    }

    document.getElementById(activeStepId).classList.add('active');

    // Update Progress Bar
    let progress = (currentState.step / 6) * 100;
    progressBar.style.width = `${progress}%`;

    // Button States
    // Only show Back button if not on Step 1
    prevBtn.style.visibility = currentState.step === 1 ? 'hidden' : 'visible';
    
    // Special Case: Review Screen (Last Step)
    if (currentState.step === 6) {
        fillSummary();
    }
}

/* Final Submission */
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

    const message = `Hello LOI Bazaar,%0a%0aI am looking to *${currentState.intent.toUpperCase()}* an LOI.%0a%0a📍 *Location:* ${locationFull}%0a🏠 *Type:* ${currentState.type}%0a📏 *Size:* ${currentState.size}%0a%0aPlease contact me at the earliest.`;

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');

    // Show Success Screen
    document.querySelectorAll('.form-step').forEach(el => el.classList.remove('active'));
    navControls.style.display = 'none';
    progressBar.parentElement.style.display = 'none';
    
    // Hide title if present
    const titles = document.querySelectorAll('.step-title');
    titles.forEach(t => t.style.display = 'none');

    successScreen.style.display = 'block';
}

function resetForm() {
    location.reload();
}


/* --- Feature: Gold Particles (Updated) --- */
function createParticles() {
    const container = document.getElementById('particles');
    if(!container) return; 

    // Clear any existing particles first
    container.innerHTML = '';

    const particleCount = 20; // Increased count slightly
    
    for (let i = 0; i < particleCount; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        
        // Random horizontal position
        p.style.left = Math.random() * 100 + 'vw';
        
        // Random Size (Varied sizes look more organic/expensive)
        const size = Math.random() * 8 + 4 + 'px'; // Between 4px and 12px
        p.style.width = size;
        p.style.height = size;
        
        // Random Animation Speed (Slow and elegant)
        const duration = Math.random() * 15 + 15; // 15s to 30s
        p.style.animationDuration = duration + 's';
        
        // CRITICAL FIX: Negative delay fills the screen immediately
        // instead of waiting for them to fly up from the bottom.
        p.style.animationDelay = '-' + (Math.random() * duration) + 's';
        
        container.appendChild(p);
    }
}