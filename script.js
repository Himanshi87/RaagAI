// Initialize music generation count if not exists
if (!localStorage.getItem('musicGenerationCount')) {
    localStorage.setItem('musicGenerationCount', '0');
}

// Initialize Tone.js
Tone.start();

// DOM Elements
const recordButton = document.getElementById('recordButton');
const generateButton = document.getElementById('generateButton');
const ragaName = document.getElementById('ragaName');
const instrumentItems = document.querySelectorAll('.instrument-item');
const visualization = document.getElementById('visualization');

// State variables
let isRecording = false;
let mediaRecorder = null;
let audioChunks = [];
let selectedInstrument = null;
let currentAudio = null;

// Audio objects for each instrument
const audioFiles = {
    sitar: new Audio('./audio/sitar.mp3'),
    tabla: new Audio('./audio/tabla-150-bpm-264330.mp3'),
    flute: new Audio('./audio/flute.mp3'),
    veena: new Audio('./audio/veena.mp3'),
    tanpura: new Audio('./audio/tanpura.mp3'),
    santoor: new Audio('./audio/santoor.mp3'),
    kanjira: new Audio('./audio/kanjira.mp3'),
    sarangi: new Audio('./audio/sarangi.mp3')
};

// Add error handling for audio loading
Object.entries(audioFiles).forEach(([instrument, audio]) => {
    audio.addEventListener('error', (e) => {
        console.error(`Error loading ${instrument} audio:`, e);
        alert(`Error loading ${instrument} audio. Please check if the file exists.`);
    });
    
    audio.addEventListener('canplaythrough', () => {
        console.log(`${instrument} audio loaded successfully`);
    });
});

// Set loop for all audio files
Object.values(audioFiles).forEach(audio => {
    audio.loop = true;
});

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    if (recordButton) {
        recordButton.addEventListener('click', toggleRecording);
    }
    
    if (generateButton) {
        generateButton.addEventListener('click', generateMusic);
    }
    
    if (instrumentItems.length > 0) {
        instrumentItems.forEach(item => {
            item.addEventListener('click', () => {
                // Remove selection from all items
                instrumentItems.forEach(i => i.classList.remove('selected'));
                // Add selection to clicked item
                item.classList.add('selected');
                selectedInstrument = item.dataset.instrument;
                generateButton.disabled = false;
            });
        });
    }
});

// Recording functions
async function toggleRecording() {
    if (!isRecording) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                await analyzeAudio(audioBlob);
            };

            mediaRecorder.start();
            isRecording = true;
            recordButton.textContent = 'Stop Recording';
            recordButton.style.background = 'linear-gradient(45deg,rgb(244, 230, 230),rgb(237, 39, 122))';
        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Error accessing microphone. Please ensure you have granted microphone permissions.');
        }
    } else {
        mediaRecorder.stop();
        isRecording = false;
        recordButton.textContent = 'Start Recording';
        recordButton.style.background = 'linear-gradient(45deg,rgb(44, 56, 227),rgb(206, 36, 160))';
    }
}

// Audio analysis function (simulated)
async function analyzeAudio(audioBlob) {
    // Simulate AI analysis
    const ragas = ['Raga Bhairavi', 'Raga Yaman', 'Raga Bhupali', 'Raga Malkauns'];
    const randomRaga = ragas[Math.floor(Math.random() * ragas.length)];
    
    ragaName.textContent = randomRaga;
}

// Music generation function
async function generateMusic() {
    if (!selectedInstrument) return;

    // Check music generation count
    const generationCount = parseInt(localStorage.getItem('musicGenerationCount')) + 1;
    localStorage.setItem('musicGenerationCount', generationCount.toString());

    // If user has generated music twice, show popup and redirect to login
    if (generationCount >= 4) {
        alert("You have used all your free trials. Please login to generate more music.");
        setTimeout(() => {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('musicGenerationCount');
            window.location.href = 'login.html';
        }, 1000);
        return;
    }

    try {
        // Stop any currently playing audio
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
        }

        // Get the audio file for the selected instrument
        currentAudio = audioFiles[selectedInstrument];
        
        // Check if audio is loaded
        if (currentAudio.readyState < 2) {
            console.log(`Loading ${selectedInstrument} audio...`);
            await new Promise((resolve, reject) => {
                currentAudio.addEventListener('canplaythrough', resolve, { once: true });
                currentAudio.addEventListener('error', reject, { once: true });
            });
        }

        // Play the audio
        await currentAudio.play();
        console.log(`Playing ${selectedInstrument} audio`);

        // Stop after 8 seconds
        setTimeout(() => {
            if (currentAudio) {
                currentAudio.pause();
                currentAudio.currentTime = 0;
                console.log(`Stopped ${selectedInstrument} audio`);
            }
        }, 8000);
        
        createVisualization();
    } catch (error) {
        console.error(`Error playing ${selectedInstrument} audio:`, error);
        alert(`Error playing ${selectedInstrument} audio. Please check if the file exists and is in the correct format.`);
    }
}

// Musical symbols visualization
function createVisualization() {
    const canvas = document.createElement('canvas');
    canvas.width = visualization.clientWidth;
    canvas.height = visualization.clientHeight;
    visualization.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let animationFrame;

    // Musical symbols array
    const symbols = ['𝄠', '♪', '♩', '♫', '🎶', '𝅘𝅥𝅯', '𝅗𝅥'];
    
    // Note class to manage individual symbols
    class Note {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = canvas.width + 20; // Start from right side
            this.y = Math.random() * canvas.height; // Random vertical position
            this.size = 45 + Math.random() * 35; // Bigger size range
            this.speed = 2 + Math.random() * 2; // Speed range
            this.symbol = symbols[Math.floor(Math.random() * symbols.length)];
            // Alternate between blue and pink colors
            this.color = Math.random() > 0.5 ? '#4169E1' : '#FF69B4';
            this.rotation = Math.random() * Math.PI * 2; // Random initial rotation
            this.rotationSpeed = (Math.random() - 0.5) * 0.02; // Random rotation speed
            this.verticalSpeed = (Math.random() - 0.5) * 0.5; // Random vertical movement speed
            this.verticalRange = 20 + Math.random() * 30; // Random vertical movement range
            this.initialY = this.y; // Store initial Y position
        }

        update() {
            this.x -= this.speed; // Move left
            this.rotation += this.rotationSpeed; // Update rotation
            
            // Dancing movement
            this.y = this.initialY + Math.sin(Date.now() * 0.001 + this.x * 0.02) * this.verticalRange;
            this.y += this.verticalSpeed;

            if (this.x < -20) { // Reset when off screen to the left
                this.reset();
            }
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.globalAlpha = 1;

            // Draw the musical symbol
            ctx.font = `${this.size}px Arial`;
            ctx.fillStyle = this.color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.symbol, 0, 0);

            ctx.restore();
        }
    }

    // Create multiple notes
    const notes = Array(10).fill().map(() => new Note()); // Reduced number for better spacing

    function animate() {
        // Clear the canvas completely
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update and draw all notes
        notes.forEach(note => {
            note.update();
            note.draw();
        });

        animationFrame = requestAnimationFrame(animate);
    }

    animate();

    // Cleanup function
    return () => {
        cancelAnimationFrame(animationFrame);
    };
}

// Initialize visualization
createVisualization(); 