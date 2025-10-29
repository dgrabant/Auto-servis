// 🔹 Uvoz svih potrebnih modula i funkcija iz vanjskih JS datoteka i biblioteka
//import * as THREE from '/node_modules/three'; // Glavna Three.js biblioteka
import * as THREE from 'three';
import { LoadGLTFByPath, LoadCameraPath, LoadSvjetlaPath } from '../called/modelLoader.js'; // Funkcija za učitavanje .gltf modela
import { setupRenderer } from '../called/rendererSetup.js'; // Funkcija za postavljanje renderera
// *** NOVO: Uvoz cleanupSpawnedModels za čišćenje statičkih referenci ***
import { spawnMultipleModels, justLogedIn, justLogedOut, cleanupSpawnedModels } from '../called/spawn_menu.js'; 
import { getFirstObjectHit, cameraNext, cameraPrev, clickTransition, returnToPrevCam, lightUpModel, transitionLight } from '../called/controls.js'; // Funkcije za kontrole kamere i interakciju
import { getFirstCameraInScene, updateCameraAspect } from '../called/cameraSetup.js'; // Funkcije za rad s kamerama u sceni
import { checkIfLogedIn } from '../called/loginCheck.js';


//Putanje do modela i teksture
const scenePathPC = '/assets/models/audi_scena.glb'; // Putanja do .gltf 3D scene
const scenePathMoblie = '/assets/models/audi_scena_mobitel.glb';
const texturePathPC = '/assets/textures/background.jpg'; // Putanja do panoramske pozadinske teksture (HDRI)
const texturePathMobile = '/assets/textures/backgroundMobile.jpg';
const cameraPath = '/assets/models/kamere.gltf';
const svjetlaPath = '/assets/models/svjetla.gltf';
const djeloviHTML = document.getElementById("djelovi");
const loadingText = document.getElementById("loadText");

let navDjeloviHTML = document.getElementById("navDjelovi");
let uTranziciji=true;
let mobileOptimization;
let scenePath;
let texturePath;
let hoverOn = true;
let fps;
const movingLight = new THREE.PointLight(0xffffff, 50, 0);
movingLight.position.set(-4.5, 1.6, 0.1);
const maxFps = 60;//za animacije
const fpsPC = 20; //sve ostalo
const fpsMobile = 5; //sve ostalo mobiteli
let isLoaded = false;
//provjera na kojem uređaju se stranica ucita

function provjeriUredjaj() {

    const imaDodir = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    const sirinaEkrana = window.innerWidth;

    if (imaDodir) {
      mobileOptimization = true;
      fps = fpsMobile;
      lightUpModel(null,movingLight, true);
      scenePath = scenePathMoblie;
      texturePath = texturePathMobile;
        if (sirinaEkrana < 768) {
            return 'Mobitel';
        } else {
            return 'Tablet';
        }
    } else {
      fps = fpsPC;
      scenePath = scenePathPC;
      mobileOptimization = false;
      texturePath = texturePathPC;
        return 'Desktop';
    }
}

// === Primjer korištenja ===
const tipUredjaja = provjeriUredjaj();
console.log("Tip uređaja:", tipUredjaja);



window.onload=()=>{

  navDjeloviHTML = document.getElementById("navDjelovi");
  console.log(navDjeloviHTML);
  djeloviHTML.hidden = true;

};


// 🔹 Globalne varijable za čišćenje
let animationFrameId; // Za zaustavljanje render petlje
let initialLoadTimeout1, initialLoadTimeout2, initialLoadTimeout3; // Za timere tijekom inicijalizacije
let transitionTimeout; // Za timere tijekom klikova i Esc
let touchStartX = 0;
let touchEndX = 0;
let touchStartTime = 0;
let mouseInside = false;

let renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
  antialias: !mobileOptimization,
});


// 🔹 Kreiranje nove Three.js scene (let umjesto const za lakše čišćenje)
let scene = new THREE.Scene();

// 🔹 Lista svih kamera u sceni i varijabla aktivne kamere
let cameraList = [];
let activeCamera;
let interactableModels = [];

// 🔹 Postavljanje renderera
//renderer = setupRenderer(scene, renderer);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


if (mobileOptimization) {
  // 🔹 Dodavanje svjetla u scenu
const hemiLight = new THREE.HemisphereLight(0x00527a, 0xffaa00, 1);
scene.add(hemiLight);
}

await spawnMultipleModels(scene, checkIfLogedIn(), loadingText).then(models => {
  interactableModels = models;
})
  .catch((error) => console.error('Error loading JSON scene:', error));
console.log("Interactable objects: ", interactableModels);


// 🔹 Učitavanje .gltf scene (asinhrono)
await LoadGLTFByPath(scene, scenePath, loadingText)
  .catch((error) => console.error('Error loading JSON scene:', error));

await LoadSvjetlaPath(scene, svjetlaPath, loadingText)
  .catch((error) => console.error('Error loading JSON scene:', error));

await LoadCameraPath(scene, cameraPath, loadingText)
  .then(() => {
    cameraList = getFirstCameraInScene(scene);
    activeCamera = cameraList[0];
    updateCameraAspect(activeCamera);
    initCameraSystem(); // Pokreni sustav kamera i kontrole
  })
  .catch((error) => console.error('Error loading JSON scene:', error));





//postavljanje sjena 
scene.add(movingLight);
renderer = setupRenderer(scene, renderer, mobileOptimization);

if (mobileOptimization) movingLight.castShadow = false;
if (!mobileOptimization) movingLight.intensity = 0;
// 🔹 Učitavanje HDRI pozadine i refleksije
const loader = new THREE.TextureLoader();

loader.load(
  
  texturePath,
  (texture) => {
    loadingText.textContent = 'Loading textures....';
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.colorSpace = THREE.SRGBColorSpace;

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    const envMap = pmremGenerator.fromEquirectangular(texture).texture;

    scene.background = envMap;
    if(!mobileOptimization) scene.environment = envMap;

    texture.dispose();
    pmremGenerator.dispose();

    console.log("Pozadina i refleksije su uspješno postavljene!");
    
    // *** SPREMANJE ID-A TIMERA 1 ***
      loadingText.textContent = 'Almost done.....';
      initialLoadTimeout2 = setTimeout(() => {
        activeCamera=cameraList[1];
        isLoaded =true;
        renderer.render(scene, activeCamera);
        onWindowResize();
        main.hidden = true;
        //onWindowResize();
        if (renderer && activeCamera) {
          renderer.setSize(window.innerWidth, window.innerHeight);
          updateCameraAspect(activeCamera);
        }
          // *** SPREMANJE ID-A TIMERA 2 ***
        initialLoadTimeout2 = setTimeout(() => {
          console.log("Pokrećem prijelaz na kameru 6...");
          transitionCamera(activeCamera, cameraList[6], 1500);
        
        }, 1500);
      }, 1000);
  },  
  undefined,
  (err) => console.error("Greška pri učitavanju teksture:", err)
);


const main = document.querySelector('main');
const isFirst = main === document.body.firstElementChild;
console.log(isFirst ? 'MAIN je prvi u body-ju' : 'MAIN NIJE prvi u body-ju');



// ======================================================
// 🔹 IMENOVANE FUNKCIJE ZA EVENT LISTENERE
// ======================================================

let cameraPosition = 6;
let cameraPositionPrev;
let firstHitName;


// 🔸 Klik mišem
function onDocumentClick(event) {
  if (cameraPosition != 3 && !uTranziciji && cameraPosition != 2) {
    // *** PROSLJEĐIVANJE 'event' OBJEKTA ***
    firstHitName = getFirstObjectHit(event, window, activeCamera, scene, 7); 
    console.log(firstHitName);
    
    document.body.style.cursor = 'default';
    cameraPosition = clickTransition(cameraPosition, firstHitName);
    console.log(cameraPosition, activeCamera, cameraList[cameraPosition]);
    if (cameraPosition == 2) {
      transitionCamera(activeCamera, cameraList[cameraPosition], 2000);
    }
    else{
      transitionCamera(activeCamera, cameraList[cameraPosition], 1500);
    }
    // *** SPREMANJE ID-A TIMERA ZA PRIJELAZ ***
    transitionTimeout = setTimeout(() => { 
      if (cameraPosition == 3) {
        if (djeloviHTML.classList.contains('hidden')) {
            djeloviHTML.classList.remove('hidden');
            djeloviHTML.classList.add('visible'); 
            document.getElementById("navDjelovi").hidden = false;
        } 
        else {
            djeloviHTML.classList.remove('visible');
            djeloviHTML.classList.add('hidden');
            document.getElementById("navDjelovi").hidden = true;
        }
      }
    }, 1500);
  
  }
}

// 🔸 Scroll kotačić miša
function onWindowWheel(event) {

  if (cameraPosition < cameraList.length && cameraPosition >= (cameraList.length - 3) && isLoaded) {
    if (!uTranziciji) {
      if (event.deltaY < 0) {
        cameraPositionPrev = cameraPosition;
        cameraPosition = cameraPrev(cameraList, cameraPosition);
        
      } else {
        cameraPositionPrev = cameraPosition;
        cameraPosition = cameraNext(cameraList, cameraPosition);
      }
      uTranziciji = true;
      document.body.style.cursor = 'default';
      transitionLight(cameraPosition, movingLight, mobileOptimization);
      if ((cameraPositionPrev == 4 && cameraPosition == 5) || (cameraPositionPrev == 5 && cameraPosition == 4)) {
        transitionCamera(activeCamera, cameraList[cameraPosition], 1000);
      }
      else
      transitionCamera(activeCamera, cameraList[cameraPosition], 1500);
    }
  }
}

// 🔸 Tipka "Escape"
function onKeydownEsc(event) {
  if ((cameraPosition == 3 || cameraPosition == 2) && !uTranziciji) {
    if (event.key === "Escape" || event.key === "Esc") {
      uTranziciji=true;
      console.log("esc", cameraPosition, uTranziciji);
      
      navDjeloviHTML = document.getElementById("navDjelovi");

      console.log(djeloviHTML);
      console.log(navDjeloviHTML);
      
      if (cameraPosition == 3) {
        cameraPosition = returnToPrevCam(cameraPosition);
        if (djeloviHTML.classList.contains('hidden')) {
            djeloviHTML.classList.remove('hidden');
            djeloviHTML.classList.add('visible'); 
            document.getElementById("navDjelovi").hidden = false;
        } 
        else {
            djeloviHTML.classList.remove('visible');
            djeloviHTML.classList.add('hidden');
            document.getElementById("navDjelovi").hidden = true;
        }
      }
      if (cameraPosition == 2) {
        cameraPosition = returnToPrevCam(cameraPosition);
        // *** SPREMANJE ID-A TIMERA ZA PRIJELAZ ***
        transitionTimeout = setTimeout(() => {
        transitionCamera(activeCamera, cameraList[cameraPosition], 1500);
      }, 1000);
        
      }
      else
        // *** SPREMANJE ID-A TIMERA ZA PRIJELAZ ***
      transitionTimeout = setTimeout(() => {
        transitionCamera(activeCamera, cameraList[cameraPosition], 1500);
      }, 1000);
      
   
  }
  }
 
}

// 🔸 Mobilni touch - Start
function onTouchStart(e) {
  if (e.touches.length > 1) return;
  touchStartX = e.touches[0].clientX;
  touchEndX = touchStartX;
  touchStartTime = Date.now();
}

// 🔸 Mobilni touch - Move
function onTouchMove(e) {
  if (e.touches.length > 1) return;
  touchEndX = e.touches[0].clientX;
}

// 🔸 Mobilni touch - End
function onTouchEnd(e) {
  const deltaX = touchStartX - touchEndX;
  const elapsed = Date.now() - touchStartTime;

 if (Math.abs(deltaX) > 80 && elapsed > 100 && elapsed < 600 && !uTranziciji) {
    const direction = deltaX < 0 ? 1 : -1;
    const wheelEvent = new WheelEvent('wheel', { deltaY: direction });
    window.dispatchEvent(wheelEvent);
  }
}

// 🔸 UI Izbornik - Tipka "E"
function onKeydownE(event) {
  if (event.key === "e" || event.key === "E") {
    justLogedIn(scene);
    renderer.render(scene, activeCamera);
  }
}

// 🔸 UI Izbornik - Tipka "Q"
function onKeydownQ(event) {
  if (event.key === "q" || event.key === "Q") {
    justLogedOut(scene);
    renderer.render(scene, activeCamera);
  }
}
let lastOnMouseMove;
function onMouseMove(event) {
  lastOnMouseMove = event;
  if (hoverOn && !uTranziciji) {
    hoverOn = false;
		const firstHitButtonName = getFirstObjectHit(event, window, activeCamera, scene, 7);
    //console.log("Hover: ",firstHitButtonName);
		if(lightUpModel(firstHitButtonName, movingLight, false)){
      document.body.style.cursor = 'pointer';
      
      renderer.render(scene, activeCamera);
    }
    else document.body.style.cursor = 'default';
  }
	}

// ======================================================
// 🔹 FUNKCIJA ZA POSTAVLJANJE SUSTAVA KAMERA I KONTROLA
// ======================================================
function initCameraSystem() {
  // 🔸 Dodavanje svih listenera
  document.addEventListener('click', onDocumentClick);
  window.addEventListener('wheel', onWindowWheel);
  document.addEventListener('keydown', onKeydownEsc);
  document.addEventListener('keydown', onKeydownE);
  document.addEventListener('keydown', onKeydownQ);

  // Mobilna podrška
  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: true });
  window.addEventListener('touchend', onTouchEnd);

  // Praćenje miša
  if (!mobileOptimization) {
    document.addEventListener('mousemove', onMouseMove, false);
  }
 

 
  //onWindowResize(); // Pozovi odmah
  
}
  // 🔹 Funkcija za resize
  function onWindowResize() {
    if (renderer && activeCamera) {
    renderer.setSize(window.innerWidth, window.innerHeight);
    updateCameraAspect(activeCamera);
    renderer.render(scene, activeCamera);
    }
  }

 // 🔹 Reakcija na promjenu veličine prozora
  window.addEventListener('resize', onWindowResize, false);

// ======================================================
// 🔹 FUNKCIJA ZA GLATKI PRIJELAZ IZMEĐU DVIJE KAMERE
// ======================================================
function transitionCamera(fromCam, toCam, duration) {
  console.log("camera transition");
  uTranziciji=true;
  setTimeout(() => {
    uTranziciji = false;
    const firstHitButtonName = getFirstObjectHit(lastOnMouseMove, window, activeCamera, scene, 7);
    //console.log("Hover: ",firstHitButtonName);
		if(lightUpModel(firstHitButtonName, movingLight, false)){
      document.body.style.cursor = 'pointer';
      
      renderer.render(scene, activeCamera);
    }
    else document.body.style.cursor = 'default';
    animate();
  }, duration);
  if (!fromCam || !toCam || !renderer) {
    console.warn("Kamera ili renderer nisu definirani!");
    return;
  }

  const startPos = fromCam.position.clone();
  const startQuat = fromCam.quaternion.clone();
  const endPos = toCam.position.clone();
  const endQuat = toCam.quaternion.clone();

  const startTime = performance.now();

  function animate2() {
    const elapsed = performance.now() - startTime;
    const t = Math.min(elapsed / duration, 1);

    activeCamera.position.lerpVectors(startPos, endPos, t);
    activeCamera.quaternion.slerpQuaternions(startQuat, endQuat, t);
    
    if (renderer) {
      renderer.render(scene, activeCamera);
    }
    setTimeout(() => {
        if (t < 1) 
          requestAnimationFrame(animate2);
      }, 1000/ maxFps);
    
      
  }
  animate2();
}

animate(); // Pokreni render petlju

  // Glavna petlja renderiranja
  function animate() {
    //console.log("animate");
    setTimeout( function() {
      if (!uTranziciji) {
        hoverOn = true;
        animationFrameId = requestAnimationFrame(animate); 
      }
      }, 1000 / fps );

    if (renderer && activeCamera) {
      renderer.render(scene, activeCamera);
    }
  }
// ======================================================
// 🔹 FUNKCIJA ZA ČIŠĆENJE MEMORIJE (FINALNI CLEANUP)
// ======================================================

function cleanup() {
  console.log("Pokrećem čišćenje scene i listenera...");

  // 1. Zaustavi render loop
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  // 2. Očisti sve setTimeout pozive
    clearTimeout(initialLoadTimeout1);
    clearTimeout(initialLoadTimeout2);
    clearTimeout(initialLoadTimeout3);
    clearTimeout(transitionTimeout);

  // 3. Ukloni SVE event listenere
  document.removeEventListener('click', onDocumentClick);
  window.removeEventListener('wheel', onWindowWheel);
  window.removeEventListener('resize', onWindowResize);
  document.removeEventListener('keydown', onKeydownEsc);
  document.removeEventListener('keydown', onKeydownE);
  document.removeEventListener('keydown', onKeydownQ);
  window.removeEventListener('touchstart', onTouchStart);
  window.removeEventListener('touchmove', onTouchMove);
  window.removeEventListener('touchend', onTouchEnd);
  document.removeEventListener('mousemove', onMouseMove, false);

  // 4. Očisti modele iz modula 'spawn_menu.js' (KLJUČNO ZA STATIČKE REFERENCE)
    cleanupSpawnedModels(); 

  // 5. Isprazni scenu i uništi materijale/geometrije
  if (scene) {
    scene.traverse(object => {
      if (object.isMesh) {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(mat => {
              if (mat.map) mat.map.dispose();
              mat.dispose();
            });
          } else {
            if (object.material.map) object.material.map.dispose();
            object.material.dispose();
          }
        }
      }
    });
    scene.clear();
  }

  // 6. Uništi renderer
  if (renderer) {
    renderer.dispose();
    renderer.forceContextLoss();
    if (renderer.domElement && renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
    renderer.domElement = null;
    renderer.context = null;
  }

  // 7. Poništi glavne reference
  scene = null;
  renderer = null;
  activeCamera = null;
  cameraList = [];
  interactableModels = [];

  console.log("✅ Memorija očišćena. Svi dinamički resursi su oslobođeni.");
}

// ======================================================
// 🔹 POZIVANJE CLEANUP FUNKCIJE PRI PONOVNOM UČITAVANJU
// ======================================================

// Pozovi cleanup prije nego što se stranica osvježi ili zatvori
window.addEventListener('beforeunload', cleanup);

// Podrška za Hot Module Replacement (HMR - npr. Vite, Webpack)
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    cleanup();
  });
}