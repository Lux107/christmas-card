
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/controls/OrbitControls.js';

import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/loaders/GLTFLoader.js';

// SCENE
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x130018);

// CAMERA
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);
camera.position.set(4, 3, 5);

// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;

document.getElementById('scene').appendChild(renderer.domElement);

// CONTROLS
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enablePan = false;
controls.minDistance = 2;
controls.maxDistance = 10;

// LIGHTS
scene.add(new THREE.AmbientLight(0xffffff, 2));

const light = new THREE.DirectionalLight(0xffffff, 3);
light.position.set(3, 5, 4);
scene.add(light);

// VIDEO TEXTURE
const video = document.createElement('video');

video.src = './assets/texture.webm';
video.loop = true;
video.muted = true;
video.playsInline = true;
video.autoplay = true;

video.addEventListener('loadeddata', () => {
    const texture = new THREE.VideoTexture(video);
    texture.colorSpace = THREE.SRGBColorSpace;
    //texture.rotation = 30;
    texture.flipY = false;
    texture.needsUpdate = true;

    // LOAD 3D MODEL
    const loader = new GLTFLoader();

    loader.load(
        './assets/Card.glb',

        (gltf) => {
            const card = gltf.scene;

            card.traverse((child) => {
                if (!child.isMesh) return;

                const materials = Array.isArray(child.material)
                    ? child.material
                    : [child.material];

                materials.forEach((material) => {
                    if (material.name === 'Material') {
                        material.map = texture;
                        material.needsUpdate = true;
                    }
                });
            });

            scene.add(card);

            // CENTER MODEL
            const box = new THREE.Box3().setFromObject(card);
            const center = box.getCenter(new THREE.Vector3());

            card.position.sub(center);
            card.userData.originalY = card.position.y;

            window.card = card;

            console.log('Christmas card loaded!');
        },

        undefined,

        (error) => {
            console.error('Model loading error:', error);
        }
    );
});

video.addEventListener('error', () => {
    console.error('Could not load texture.webm');
});

video.load();

// ANIMATION
function animate() {
    requestAnimationFrame(animate);

    if (window.card) {
        window.card.position.y =
            window.card.userData.originalY +
            Math.sin(Date.now() * 0.0015) * 0.12;
    }

    controls.update();
    renderer.render(scene, camera);
}

animate();

// RESPONSIVE
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
});
const voiceMessage = document.getElementById('voiceMessage');

voiceMessage.volume = 0.2;

voiceMessage.play().catch(error => {
    console.log('Browser requires user interaction before playing audio.');
});


const welcomeScreen = document.getElementById('welcome');
const openGiftButton = document.getElementById('openGift');

openGiftButton.addEventListener('click', async () => {

    document.body.classList.add('unlocked');
    welcomeScreen.classList.add('hidden');

    try {
        await voiceMessage.play();
    } catch (error) {
        console.error('Audio playback error:', error);
    }

});
document.getElementById('openGift').addEventListener('click', async () => {
    document.body.classList.add('unlocked');
    document.getElementById('welcome').classList.add('hidden');

    const audio = document.getElementById('voiceMessage');

    try {
        await audio.play();
    } catch (error) {
        console.error('Audio error:', error);
    }
});