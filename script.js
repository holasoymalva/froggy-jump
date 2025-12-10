import * as THREE from 'three';

// --- Configuration & Constants ---
const COLORS = [
    { bg: 0x87CEEB, water: 0x4fc3f7, pad: 0x66bb6a, frog: 0x4CAF50 }, // Day
    { bg: 0x263238, water: 0x37474f, pad: 0x1b5e20, frog: 0x8bc34a }, // Night
    { bg: 0xffccbc, water: 0xffab91, pad: 0xff5722, frog: 0xffc107 }, // Sunset
    { bg: 0xe1bee7, water: 0xce93d8, pad: 0x8e24aa, frog: 0x00bcd4 }, // Magic
];

const GAME_CONFIG = {
    laneWidth: 1.5,
    jumpDuration: 0.3,
    jumpHeight: 1.5,
    cameraOffset: { x: 10, y: 10, z: 10 },
    platformSize: 1.2
};

// --- Global Variables ---
let scene, camera, renderer;
let frog;
let platforms = [];
let lanes = [-1, 0, 1]; // Left, Center, Right lanes
let currentLane = 1; // Start at center (index 1)
let currentRow = 0;
let score = 0;
let isPlaying = false;
let isDead = false;
let gameSpeed = 0;
let lastTime = 0;
let worldGroup;
let chosenPalette;

// UI Elements
const scoreEl = document.getElementById('score-container');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreEl = document.getElementById('final-score');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

// --- Initialization ---
function init() {
    // 1. Setup Scene
    scene = new THREE.Scene();

    // 2. Setup Camera (Orthographic implementation for Isometric look)
    const aspect = window.innerWidth / window.innerHeight;
    const d = 5;
    camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);

    // Position camera for isometric view
    camera.position.set(20, 20, 20);
    camera.lookAt(0, 0, 0);

    // 3. Setup Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('game-container').appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);

    worldGroup = new THREE.Group();
    scene.add(worldGroup);

    // Listeners
    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('keydown', onKeyDown);
    // Touch/Click handling
    document.addEventListener('mousedown', onInput);
    document.addEventListener('touchstart', onInput, { passive: false });

    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', resetGame);

    // Initial Render
    resetGame(false);
    animate(0);
}

function randomizePalette() {
    chosenPalette = COLORS[Math.floor(Math.random() * COLORS.length)];
    scene.background = new THREE.Color(chosenPalette.bg);
    scene.fog = new THREE.Fog(chosenPalette.bg, 10, 50);
}

function createFrog() {
    if (frog) scene.remove(frog.mesh);

    const frogGroup = new THREE.Group();

    // Materials
    const bodyMat = new THREE.MeshLambertMaterial({ color: chosenPalette.frog });
    const eyeMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const pupilMat = new THREE.MeshLambertMaterial({ color: 0x000000 });

    // Body
    const bodyGeo = new THREE.BoxGeometry(0.8, 0.6, 0.8);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.3;
    body.castShadow = true;
    frogGroup.add(body);

    // Eyes
    const eyeGeo = new THREE.BoxGeometry(0.25, 0.25, 0.25);
    const pupilGeo = new THREE.BoxGeometry(0.1, 0.1, 0.05);

    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.25, 0.6, 0.25);
    frogGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.25, 0.6, 0.25);
    frogGroup.add(rightEye);

    const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
    leftPupil.position.set(-0.25, 0.6, 0.38);
    frogGroup.add(leftPupil);

    const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
    rightPupil.position.set(0.25, 0.6, 0.38);
    frogGroup.add(rightPupil);

    frog = {
        mesh: frogGroup,
        lane: 1, // 0: Left, 1: Center, 2: Right
        row: 0,
        isJumping: false,
        jumpStartTime: 0,
        startPos: new THREE.Vector3(),
        targetPos: new THREE.Vector3()
    };

    scene.add(frog.mesh);

    // Initial Position
    updateFrogPosition(0);
}

function updateFrogPosition(duration = 0) {
    const x = (frog.lane - 1) * GAME_CONFIG.laneWidth;
    const z = -frog.row * GAME_CONFIG.laneWidth;

    frog.targetPos.set(x, 0, z);

    if (duration === 0) {
        frog.mesh.position.copy(frog.targetPos);
        frog.startPos.copy(frog.targetPos);
    }
}

// Map Generation
function createPlatform(lane, row, isWater = false) {
    const x = (lane - 1) * GAME_CONFIG.laneWidth;
    const z = -row * GAME_CONFIG.laneWidth;

    const geometry = new THREE.BoxGeometry(GAME_CONFIG.platformSize, 0.5, GAME_CONFIG.platformSize);
    // Slight random color variation
    const baseColor = new THREE.Color(chosenPalette.pad);
    baseColor.offsetHSL(0.0, 0.0, (Math.random() - 0.5) * 0.1);

    const material = new THREE.MeshLambertMaterial({ color: baseColor });
    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(x, -0.25, z);
    mesh.receiveShadow = true;

    // Decor (Flowers)
    if (Math.random() > 0.8) {
        const flowerGeo = new THREE.BoxGeometry(0.3, 0.1, 0.3);
        const flowerMat = new THREE.MeshLambertMaterial({ color: 0xFFC0CB }); // Pink
        const flower = new THREE.Mesh(flowerGeo, flowerMat);
        flower.position.set(0, 0.3, 0);
        mesh.add(flower);
    }

    worldGroup.add(mesh);
    platforms.push({ mesh, lane, row, active: true });
}

let lastSafeLane = 1;

function generateRow(row) {
    // 1. Determine a guaranteed safe lane connected to the previous one
    // Possible moves from lastSafeLane: -1, 0, +1
    const possibleMoves = [];
    if (lastSafeLane > 0) possibleMoves.push(-1);
    possibleMoves.push(0);
    if (lastSafeLane < 2) possibleMoves.push(1);

    const move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    const safeLane = lastSafeLane + move;
    lastSafeLane = safeLane;

    // 2. Create the pads
    for (let l = 0; l < 3; l++) {
        let hasPad = false;

        if (l === safeLane) {
            hasPad = true; // Guaranteed path
        } else {
            // 40% chance of random extra pad
            hasPad = Math.random() > 0.6;
        }

        if (hasPad) {
            createPlatform(l, row);
        }
    }
}

function generateInitialWorld() {
    // Clear old
    while (worldGroup.children.length > 0) {
        const obj = worldGroup.children[0];
        worldGroup.remove(obj);
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
    }
    platforms = [];
    lastSafeLane = 1; // Reset path tracker

    // Basic water plane (visual only)
    const waterGeo = new THREE.PlaneGeometry(100, 200);
    const waterMat = new THREE.MeshLambertMaterial({ color: chosenPalette.water });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -1;
    worldGroup.add(water);

    // Initial safe zone - full row for first 3 rows
    for (let i = 0; i < 3; i++) {
        createPlatform(0, i);
        createPlatform(1, i);
        createPlatform(2, i);
    }

    // Start generating random path
    for (let i = 3; i < 20; i++) {
        generateRow(i);
    }
}

function spawnNextRows() {
    const furthestRow = Math.max(...platforms.map(p => p.row));
    // Generate 5 more rows
    for (let i = 1; i <= 5; i++) {
        generateRow(furthestRow + i);
    }

    // Cleanup old platforms behind camera to save memory
    const cullThreshold = frog.row - 5;
    platforms = platforms.filter(p => {
        if (p.row < cullThreshold) {
            worldGroup.remove(p.mesh);
            if (p.mesh.geometry) p.mesh.geometry.dispose();
            return false;
        }
        return true;
    });
}

// --- Gameplay Logic ---

function jump(laneOffset) {
    if (frog.isJumping || isDead || !isPlaying) return;

    const nextLane = frog.lane + laneOffset;

    // Constrain lanes
    if (nextLane < 0 || nextLane > 2) return; // Can't jump off sides? Or maybe jumping off sides kills you?
    // Let's keep it safe: wall at edges.

    frog.isJumping = true;
    frog.jumpStartTime = performance.now();
    frog.startPos.copy(frog.mesh.position);

    frog.lane = nextLane;
    frog.row++; // Always move forward

    updateFrogPosition();
    score++;
    scoreEl.innerText = score;

    // Generate more world
    if (score % 5 === 0) {
        spawnNextRows();
    }
}

function checkCollision() {
    // If not mid-jump (roughly landed)
    // Check if there is a platform at frog.lane & frog.row
    const landTime = frog.jumpStartTime + GAME_CONFIG.jumpDuration * 1000;
    const now = performance.now();

    if (now >= landTime && frog.isJumping) {
        // Landed
        frog.isJumping = false;

        // Check platform
        const hasPlatform = platforms.some(p => p.lane === frog.lane && p.row === frog.row);

        if (!hasPlatform) {
            die();
        }
    }
}

function die() {
    isDead = true;
    isPlaying = false;

    // Splash animation or sinking
    const tl = performance.now();

    // Simply show game over for now
    setTimeout(() => {
        finalScoreEl.innerText = "Puntuación: " + score;
        gameOverScreen.classList.remove('hidden');
        gameOverScreen.classList.add('active');
        scoreEl.classList.add('hidden');
    }, 500);
}

function animate(time) {
    requestAnimationFrame(animate);

    const deltaTime = (time - lastTime) / 1000;
    lastTime = time;

    if (isPlaying && !isDead) {
        // Handle Jump Animation
        if (frog.isJumping) {
            const elapsed = (time - frog.jumpStartTime) / 1000;
            const progress = Math.min(elapsed / GAME_CONFIG.jumpDuration, 1);

            // Linear X/Z interpolation
            const currentPos = new THREE.Vector3().lerpVectors(frog.startPos, frog.targetPos, progress);

            // Parabolic Y (Jump) - 4 * h * x * (1-x)
            const height = 4 * GAME_CONFIG.jumpHeight * progress * (1 - progress);
            currentPos.y = height;

            frog.mesh.position.copy(currentPos);

            // Rotation for flair
            frog.mesh.rotation.x = -progress * Math.PI; // Flip forward?

            checkCollision();
        } else {
            frog.mesh.rotation.x = 0;
            frog.mesh.position.y = 0;
        }

        // Camera Follow (Smooth)
        const targetCamZ = frog.mesh.position.z + 10;
        const targetCamX = 10; // Keep centered horizontally roughly

        // Simple lerp?
        // Actually for isometric, we usually keep fixed offset
        // But we want to follow the frog forward

        // We set camera at (20, 20, 20) looking at (0,0,0) initially.
        // Frog moves in -Z
        // So camera should move in -Z as well.

        const idealCamPos = new THREE.Vector3(20, 20, 20 + frog.mesh.position.z);
        camera.position.lerp(idealCamPos, 0.1);

    } else if (isDead) {
        // Sinking animation if dead
        if (frog.mesh.position.y > -2) {
            frog.mesh.position.y -= 0.05;
        }
    }

    renderer.render(scene, camera);
}

// --- Inputs ---
function onKeyDown(e) {
    if (!isPlaying) return;
    switch (e.key) {
        case 'ArrowLeft': jump(-1); break;
        case 'ArrowRight': jump(1); break;
        case 'ArrowUp': jump(0); break; // Jump forward same lane
    }
}

function onInput(e) {
    if (!isPlaying) return;

    // Simple logic: tap left half = left, right half = right, center = straight?
    // Let's do: Tap left side = Left+Forward, Tap Right side = Right+Forward
    // Tap center area = Forward? 

    // Normalize coordinates
    let clientX;
    if (e.touches) {
        clientX = e.touches[0].clientX;
    } else {
        clientX = e.clientX;
    }

    const width = window.innerWidth;

    if (clientX < width * 0.33) {
        jump(-1);
    } else if (clientX > width * 0.66) {
        jump(1);
    } else {
        jump(0);
    }
}

function onWindowResize() {
    const aspect = window.innerWidth / window.innerHeight;
    const d = 5;
    camera.left = -d * aspect;
    camera.right = d * aspect;
    camera.top = d;
    camera.bottom = -d;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function startGame() {
    startScreen.classList.remove('active');
    startScreen.classList.add('hidden');
    scoreEl.classList.remove('hidden'); // Show score when game starts
    isPlaying = true;
}

function resetGame(startPlaying = true) {
    randomizePalette();
    generateInitialWorld();
    createFrog();

    score = 0;
    scoreEl.innerText = score;
    isDead = false;
    gameOverScreen.classList.remove('active');
    gameOverScreen.classList.add('hidden');

    // Reset camera
    camera.position.set(20, 20, 20);
    camera.lookAt(0, 0, 0);

    if (startPlaying) {
        isPlaying = true;
        scoreEl.classList.remove('hidden');
    } else {
        isPlaying = false;
        scoreEl.classList.add('hidden'); // Hide score initially
        startScreen.classList.remove('hidden');
        startScreen.classList.add('active');
    }
}

// Start
init();
