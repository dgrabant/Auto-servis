// 🔹 Uvoz svih potrebnih modula i funkcija iz vanjskih JS datoteka i biblioteka
//import * as THREE from '/node_modules/three'; // Glavna Three.js biblioteka
import * as THREE from 'three';
import { LoadGLTFByPath, LoadCameraPath, LoadSvjetlaPath } from '../called/modelLoader.js'; // Funkcija za učitavanje .gltf modela
import { setupRenderer } from '../called/rendererSetup.js'; // Funkcija za postavljanje renderera
// *** NOVO: Uvoz cleanupSpawnedModels za čišćenje statičkih referenci ***
import { spawnMultipleModels, cleanupSpawnedModels, justLogedOut } from '../called/spawn_menu.js'; 
import { getFirstObjectHit, cameraNext, cameraPrev, clickTransition, returnToPrevCam, lightUpModel, transitionLight } from '../called/controls.js'; // Funkcije za kontrole kamere i interakciju
import { getFirstCameraInScene, updateCameraAspect } from '../called/cameraSetup.js'; // Funkcije za rad s kamerama u sceni
import { checkIfLogedIn } from '../called/loginCheck.js';
import { updateIndicators } from './indicator.js';
import { dohvatiPodatkeZaServis } from '../dijelovi/servisScript.js';


//Putanje do modela i teksture
const scenePathPC = '/assets/models/audi_scena.glb'; // Putanja do .gltf 3D scene
const scenePathMoblie = '/assets/models/audi_scena_mobitel.glb';
const texturePathPC = '/assets/textures/background.jpg'; // Putanja do panoramske pozadinske teksture (HDRI)
const texturePathMobile = '/assets/textures/backgroundMobile.jpg';
const cameraPath = '/assets/models/kamere.gltf';
const svjetlaPath = '/assets/models/svjetla.gltf';
const dijeloviHTML = document.getElementById("dijelovi");
const servisHTML = document.getElementById("servis");
const loginHTML = document.getElementById("login");
const loadingText = document.getElementById("loadText");
const hudHTML = document.getElementById("hud");
const forma = document.getElementById("performance");
const tutorial = document.getElementById("tutorial");
const loadingScreen = document.getElementById("loading-screen");
const performanceMem = localStorage.getItem('performance');
//let navDijeloviHTML = document.getElementById("navDijelovi");
let uTranziciji=true;
let mobileOptimization;
let scenePath;
let texturePath;
let hoverOn = false;
let fps;
let stranicaUpaljena = true;
const movingLight = new THREE.PointLight(0x38bff8, 50, 0);
movingLight.position.set(-4.5, 1.6, 0.1);
const maxFps = 60;//za animacije
const fpsPC = 30;
const fpsMobile = 5; //sve ostalo mobiteli
let isLoaded = false;
let pcPerformance = false;
//provjera na kojem uređaju se stranica ucita


function disableScroll() {
    // Postavlja CSS svojstvo overflow na 'hidden' za body element.
    // Time se sakrivaju scrollbarovi i onemogućuje skrolanje.
    window.scrollTo({
      top: 0,
      behavior: 'smooth' // Ključna riječ za glatku animaciju
    });
    document.body.style.overflow = 'hidden';
    // Također je dobra praksa postaviti overflow: hidden i na <html> element
    // radi bolje konzistencije u različitim preglednicima, posebno mobilnim.
    document.documentElement.style.overflow = 'hidden';
}

function enableScroll() {
    // Vraća CSS svojstvo overflow na defaultnu vrijednost ('auto' ili 'initial' / prazan string)
    // što ponovno omogućuje skrolanje.
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
}
function provjera() {
  return new Promise(resolve => {
    loadingText.textContent = 'Čeka se odgovor servera...';
    fetch("https://auto-servis.onrender.com/api/korisnik/about", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer "+localStorage.getItem("authToken")
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
              return response.json();
            })
        .then(data => {
            console.log("Response data:", data);
            if (data.uloga == "admin") {
              document.getElementById("logo").href = "/admin.html";
            }
            resolve();
        })
        .catch(error => {
            console.error("Fetch error:", error);
            resolve();
        });
  });
}

function LogedOut(){
  hide("login");
  localStorage.removeItem('authToken');
  localStorage.removeItem('performance');
  console.log('Logged out...');
    unHide("login");
  justLogedOut(scene);
}

//const data = await response.json();
function hide(stranica){
  if (stranica == "dijelovi") {
    dijeloviHTML.hidden = true;
    document.getElementById('logo').hidden = true;
    document.getElementById('back').hidden = true;
    document.getElementById('sidebarInfo').hidden = true;
    document.getElementById('category-select').hidden = true;
  }
  if (stranica == "servis") {
    servisHTML.hidden = true;
    document.getElementById('logoServis').hidden = true;
    document.getElementById('backServis').hidden = true;
    document.getElementById('sidebarInfoServis').hidden = true;
  }
  if (stranica == "login") {
    document.getElementById("backPicLogin").src="/assets/pictures/dijelovi/back.png";
    if (checkIfLogedIn()) {
      document.getElementById("logoutGumb").hidden = true;
    }
    else
    document.getElementById("loginGumbi").hidden = true;
    document.getElementById("backLogin").hidden = true;
  }
}
function unHide(stranica){
  if (stranica == "dijelovi") {
    dijeloviHTML.hidden = false;
    document.getElementById('logo').hidden = false;
    document.getElementById('back').hidden = false;
    document.getElementById('sidebarInfo').hidden = false;
    document.getElementById('category-select').hidden = false;
  }
  if (stranica == "servis") {
    servisHTML.hidden = false;
    document.getElementById('logoServis').hidden = false;
    document.getElementById('backServis').hidden = false;
    document.getElementById('sidebarInfoServis').hidden = false;
    //dohvatiPodatkeZaServis();
    if (typeof dohvatiPodatkeZaServis === 'function') {
        dohvatiPodatkeZaServis();
    }
  }
  if (stranica == "login") {
    document.getElementById("backPicLogin").src="/assets/pictures/dijelovi/back.png";
    if (checkIfLogedIn()) {
      document.getElementById("logoutGumb").hidden = false;
    }
    else
    document.getElementById("loginGumbi").hidden = false;
    document.getElementById("backLogin").hidden = false;
  }
}


if (!checkIfLogedIn()) {
    tutorial.hidden = false;
    tutorial.style.display = 'flex';
    loadingScreen.hidden = false;
    console.log("maknut hidden");
  }
  else{
    loadingScreen.hidden = false;
    loadingScreen.style.display = 'flex';
  }
disableScroll();
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
        mobileOptimization = false;
        return 'Desktop';
    }
}
const tipUredjaja = provjeriUredjaj();


if (tipUredjaja == "Desktop") {
  document.getElementById("tutorialPC").hidden = false;
}
else
{
  document.getElementById("tutorialMob").hidden = false;
}


function cekajPotvrdu(idGumba) {
  return new Promise(resolve => {
    document.getElementById(idGumba).addEventListener("click", () => {
      forma.hidden = false
      if (tipUredjaja=="Desktop") forma.style.display = 'flex';
      tutorial.hidden = true;
      tutorial.style.display = 'none'
      resolve();
    }, { once: true });
  });

}

document.getElementById("logoutGumb").addEventListener("click", () => {
  LogedOut();
});

function cekajKlik(idGumba) {
  return new Promise(resolve => {
    if (mobileOptimization) {
      resolve();
    }
    document.getElementById(idGumba).addEventListener("click", () => {
      const odabrano = document.querySelector('input[name="odgovor"]:checked');
      console.log(forma, odabrano.value);
      forma.hidden = true;
      forma.style.display = 'none'
      
      loadingScreen.hidden = false;
      loadingScreen.style.display = 'flex'

      if (odabrano.value == 'true') {
        pcPerformance = true;
        texturePath = texturePathMobile;
        scenePath = scenePathPC;
        localStorage.setItem('performance', 1);
      }
      else if (odabrano.value == "ultra") {
        pcPerformance = true;
        texturePath = texturePathMobile;
        scenePath = scenePathMoblie;
        localStorage.setItem('performance', 2);
      }
      else{
        scenePath = scenePathPC;
        texturePath = texturePathPC;
        localStorage.setItem('performance', 0);
      }
      resolve();
    }, { once: true });
  });
}

if (!(checkIfLogedIn())) 
  await cekajPotvrdu("understood");
if (!mobileOptimization){
  if (checkIfLogedIn()) {
    forma.hidden = true;
    if (performanceMem == 1) {
        pcPerformance = true;
        texturePath = texturePathMobile;
        scenePath = scenePathPC;
      }
      else if (performanceMem == 2) {
        pcPerformance = true;
        texturePath = texturePathMobile;
        scenePath = scenePathMoblie;
      }
      else{
        scenePath = scenePathPC;
        texturePath = texturePathPC;
      }
  }
  else

  await cekajKlik("submit"); // gumb s ID-jem "pokreniBtn"
  
}
else{
  loadingScreen.hidden = false;
  loadingScreen.style.display = 'flex';
  forma.hidden = true;
} 

document.getElementById("logo_pic").src = "/assets/pictures/dijelovi/logo.gif";
document.getElementById("backPic").src = "/assets/pictures/dijelovi/back.gif";

await provjera();

document.getElementById("logo_pic").src = "/assets/pictures/dijelovi/logo.png";
document.getElementById("backPic").src = "/assets/pictures/dijelovi/back.png";
// Tek nakon klika nastavljaš s ostatkom:
console.log("Kliknuto — pokrećem učitavanje Three.js scene...");


// === Primjer korištenja ===

console.log("Tip uređaja:", tipUredjaja);



/*function onload(event){
  if (!checkIfLogedIn()) {
    tutorial.hidden = false;
    loadingScreen.hidden = false;
    console.log("maknut hidden");
    

  }
  navDijeloviHTML = document.getElementById("navDijelovi");
  console.log(navDijeloviHTML);
  dijeloviHTML.hidden = true;
};
*/

// 🔹 Globalne varijable za čišćenje
let animationFrameId; // Za zaustavljanje render petlje
let initialLoadTimeout1, initialLoadTimeout2, initialLoadTimeout3; // Za timere tijekom inicijalizacije
let transitionTimeout; // Za timere tijekom klikova i Esc
let touchStartX = 0;
let touchEndX = 0;
let touchStartTime = 0;

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


if (mobileOptimization || pcPerformance) {
  // 🔹 Dodavanje svjetla u scenu
const hemiLight = new THREE.HemisphereLight(0x00527a, 0xffaa00, 1);
scene.add(hemiLight);
}


await LoadCameraPath(scene, cameraPath, loadingText)
  .then(() => {
    cameraList = getFirstCameraInScene(scene);
    activeCamera = cameraList[0];
    updateCameraAspect(activeCamera);
    initCameraSystem(); // Pokreni sustav kamera i kontrole
  })
  .catch((error) => console.error('Error loading JSON scene:', error));

  

await spawnMultipleModels(scene, checkIfLogedIn(), loadingText, mobileOptimization).then(models => {
  interactableModels = models;
})
  .catch((error) => console.error('Error loading JSON scene:', error));
console.log("Interactable objects: ", interactableModels);


// 🔹 Učitavanje .gltf scene (asinhrono)
await LoadGLTFByPath(scene, scenePath, loadingText)
  .catch((error) => console.error('Error loading JSON scene:', error));

await LoadSvjetlaPath(scene, svjetlaPath, loadingText)
  .catch((error) => console.error('Error loading JSON scene:', error));


//postavljanje sjena 
scene.add(movingLight);
renderer = setupRenderer(scene, renderer, mobileOptimization, pcPerformance);

if (mobileOptimization || pcPerformance) {
  movingLight.castShadow = false;
  movingLight.color.set(0xffffff);
}
movingLight.intensity = 2.5;

// 🔹 Učitavanje HDRI pozadine i refleksije
const loader = new THREE.TextureLoader();

loader.load(
  
  texturePath,
  (texture) => {
    loadingText.textContent = 'Učitavanje tekstura...';
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.colorSpace = THREE.SRGBColorSpace;

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    const envMap = pmremGenerator.fromEquirectangular(texture).texture;

    scene.background = envMap;
    if(!mobileOptimization && !pcPerformance) scene.environment = envMap;

    texture.dispose();
    pmremGenerator.dispose();

    console.log("Pozadina i refleksije su uspješno postavljene!");
    
    // *** SPREMANJE ID-A TIMERA 1 ***
      loadingText.textContent = 'Učitavanje...';
      initialLoadTimeout2 = setTimeout(() => {
        activeCamera=cameraList[1];
        renderer.render(scene, activeCamera);
        onWindowResize();
        main.hidden = true;
        hudHTML.hidden = false;
        if(hudHTML.classList.contains('hidden')) {
          hudHTML.classList.remove('hidden');
          hudHTML.classList.add('visible');
        } 
        //onWindowResize();
        if (renderer && activeCamera) {
          renderer.setSize(window.innerWidth, window.innerHeight);
          updateCameraAspect(activeCamera);
        }
          // *** SPREMANJE ID-A TIMERA 2 ***
        initialLoadTimeout2 = setTimeout(() => {
          console.log("Pokrećem prijelaz na kameru 6...");
          transitionCamera(activeCamera, cameraList[7], 1500);
          
          setTimeout(() => {
            isLoaded = true;
            stranicaUpaljena = false;
            animate();
          },2000);
        }, 1000);
      }, 500);
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

let cameraPosition = cameraList.length - 1;
let cameraPositionPrev;
let firstHitName;

function loginNeeded() {
  cameraPositionPrev = cameraPosition;
  cameraPosition = 6;
  uTranziciji = true;
  document.body.style.cursor = 'default';
  transitionLight(cameraPosition, movingLight, mobileOptimization);
  if ((cameraPositionPrev == 5 && cameraPosition == 6) || (cameraPositionPrev == 6 && cameraPosition == 5)) {
      transitionCamera(activeCamera, cameraList[cameraPosition], 1000);
    }
  else
    transitionCamera(activeCamera, cameraList[cameraPosition], 1500);
}


// 🔸 Klik mišem
function onDocumentClick(event) {
  if (!uTranziciji && !stranicaUpaljena) {
    // *** PROSLJEĐIVANJE 'event' OBJEKTA ***
    firstHitName = getFirstObjectHit(event, window, activeCamera, scene, 7); 
    console.log(firstHitName);
    
    document.body.style.cursor = 'default';
    cameraPosition = clickTransition(cameraPosition, firstHitName);
    console.log(cameraPosition, activeCamera, cameraList[cameraPosition]);
    if (firstHitName == "servis") {
      transitionCamera(activeCamera, cameraList[cameraPosition], 2000);
      stranicaUpaljena = true;
      unHide("servis");
      transitionTimeout = setTimeout(() => {
        
        if (servisHTML.classList.contains('hidden')) {
            servisHTML.classList.remove('hidden');
            servisHTML.classList.add('visible'); 
            //document.getElementById("navDijelovi").hidden = false;
        } 
        
        enableScroll();
      }, 2000);
    }
    if (firstHitName.startsWith("djelovi") || firstHitName.startsWith("dijelovi")) {
      transitionCamera(activeCamera, cameraList[cameraPosition], 1240);
      stranicaUpaljena = true;
      unHide("dijelovi");
      transitionTimeout = setTimeout(() => { 
        if (dijeloviHTML.classList.contains('hidden')) {
            dijeloviHTML.classList.remove('hidden');
            dijeloviHTML.classList.add('visible'); 
            //document.getElementById("navDijelovi").hidden = false;
        } 
        
        enableScroll();
      }, 1250);
    }
    if (firstHitName == "login") {
      transitionCamera(activeCamera, cameraList[cameraPosition], 700);
      stranicaUpaljena = true;
      unHide("login");
      transitionTimeout = setTimeout(() => { 
        if (loginHTML.classList.contains('hidden')) {
            loginHTML.classList.remove('hidden');
            loginHTML.classList.add('visible');
            loginHTML.hidden = false;
            //document.getElementById("google").hidden = false;
            //document.getElementById("github").hidden = false;
            console.log("hidden false");
        } 
        
        //enableScroll();
      }, 700);
    }
    if (firstHitName.startsWith("loginNeeded")) {
      loginNeeded();
      updateIndicators(3);
    }

    // *** SPREMANJE ID-A TIMERA ZA PRIJELAZ ***
    /*transitionTimeout = setTimeout(() => { 
      if (cameraPosition == 4) {
        if (dijeloviHTML.classList.contains('hidden')) {
            dijeloviHTML.classList.remove('hidden');
            dijeloviHTML.classList.add('visible'); 
            document.getElementById("navDijelovi").hidden = false;
        } 
      }
      if (cameraPosition == 2) {
            console.log("camera 2");
            
        if (loginHTML.classList.contains('hidden')) {
            loginHTML.classList.remove('hidden');
            loginHTML.classList.add('visible');
            loginHTML.hidden = false;
            document.getElementById("google").hidden = false;
            document.getElementById("github").hidden = false;
            console.log("hidden false");
        } 
      }
    }, 1250);
      */  
  
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
        if (cameraPosition == 7) {
          updateIndicators(1);
        }
        if (cameraPosition == 6) {
          updateIndicators(3); 
        }
        if (cameraPosition == 5) {
          updateIndicators(2);
        }
      uTranziciji = true;
      document.body.style.cursor = 'default';
      transitionLight(cameraPosition, movingLight, mobileOptimization);
      if ((cameraPositionPrev == 5 && cameraPosition == 6) || (cameraPositionPrev == 6 && cameraPosition == 5)) {
        transitionCamera(activeCamera, cameraList[cameraPosition], 1000);
      }
      else
      transitionCamera(activeCamera, cameraList[cameraPosition], 1500);
    }
  }
}
export function inTransition(){
  return uTranziciji;
}
export function indicatorClick(position){
  cameraPositionPrev = cameraPosition;
  if (position == 1) {
      cameraPosition = 7;
    }
  if (position == 3) {
      cameraPosition = 6;
    }
  if (position == 2) {
      cameraPosition = 5;
    }
  uTranziciji = true;
  document.body.style.cursor = 'default';
  transitionLight(cameraPosition, movingLight, mobileOptimization);
  if ((cameraPositionPrev == 5 && cameraPosition == 6) || (cameraPositionPrev == 6 && cameraPosition == 5)) {
      transitionCamera(activeCamera, cameraList[cameraPosition], 1000);
    }
  else
    transitionCamera(activeCamera, cameraList[cameraPosition], 1500);
}

// 🔸 Tipka "Escape"
function onKeydownEsc(event) {
    if (event.key === "Escape" || event.key === "Esc") {
      povratak();
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
function onTouchEnd() {
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
    console.log(checkIfLogedIn());
    
  }
}

// 🔸 UI Izbornik - Tipka "Q"
function onKeydownQ(event) {
  if (event.key === "q" || event.key === "Q") {
    localStorage.setItem('authToken', "proba");
    console.log("token dodan");
  }
}
let lastOnMouseMove;
function onMouseMove(event) {
  lastOnMouseMove = event;
  //console.log("hover: ", hoverOn, !uTranziciji, isLoaded);
  
  if (hoverOn && !uTranziciji && isLoaded) {
    hoverOn = false;
    //console.log("hoverd");
    
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
    if (isLoaded) {
  
    const firstHitButtonName = getFirstObjectHit(lastOnMouseMove, window, activeCamera, scene, 7);
    //console.log("Hover: ",firstHitButtonName);
		if(lightUpModel(firstHitButtonName, movingLight, false)){
      document.body.style.cursor = 'pointer';
      
      renderer.render(scene, activeCamera);
    }
    else document.body.style.cursor = 'default';
            
    }
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
    //console.log("Is loaded: ",isLoaded);
    
    //console.log("animate");
    setTimeout( function() {
      //console.log("animate: ", !uTranziciji, !stranicaUpaljena);
      
      if (!uTranziciji && !stranicaUpaljena) {
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
document.getElementById("backPic").addEventListener("click", () => {
  povratak();
});

document.getElementById("backPicLogin").addEventListener("click", () => {
  povratak();
});
document.getElementById("backPicServis").addEventListener("click", () => {
  povratak();
});

function povratak(){
  if ((cameraPosition == 3 || cameraPosition == 2 || cameraPosition == 4) && !uTranziciji) {
      uTranziciji=true;
      console.log("esc", cameraPosition, uTranziciji);
      
      //navDijeloviHTML = document.getElementById("navDijelovi");

      console.log(dijeloviHTML);
      //console.log(navDijeloviHTML);
      
      if (cameraPosition == 4) {
        cameraPosition = returnToPrevCam(cameraPosition);
        if (dijeloviHTML.classList.contains('visible')) 
            dijeloviHTML.classList.remove('visible');
            dijeloviHTML.classList.add('hidden');
            stranicaUpaljena = false;
            disableScroll();
            //document.getElementById("navDijelovi").hidden = true;
            transitionTimeout = setTimeout(() => {
            hide("dijelovi");
            transitionCamera(activeCamera, cameraList[cameraPosition], 1250);
        }, 1000);
        }
      else if (cameraPosition == 3) {
        cameraPosition = returnToPrevCam(cameraPosition);
        // *** SPREMANJE ID-A TIMERA ZA PRIJELAZ ***
        servisHTML.classList.remove('visible');
        servisHTML.classList.add('hidden');
        stranicaUpaljena = false;
        disableScroll();
        transitionTimeout = setTimeout(() => {
          hide("servis");
          transitionCamera(activeCamera, cameraList[cameraPosition], 1500);
      }, 1000);
      }
      else if (cameraPosition == 2) {
        //disableScroll();
        cameraPosition = returnToPrevCam(cameraPosition);
        // *** SPREMANJE ID-A TIMERA ZA PRIJELAZ ***
        if (loginHTML.classList.contains('visible')) {
            loginHTML.classList.remove('visible');
            loginHTML.classList.add('hidden');
            //loginHTML.hidden = false;
            
            //document.getElementById("google").hidden = true;
            //document.getElementById("github").hidden = true;
            
        }
        transitionTimeout = setTimeout(() => {
          hide("login");
          stranicaUpaljena = false;
          transitionCamera(activeCamera, cameraList[cameraPosition], 700);
        }, 700);
      }
    }
  }

  window.addEventListener('pageshow', function(event) {
    // Svojstvo 'persisted' je true ako je stranica učitana iz bfcache memorije.
    if (event.persisted) {
        // --- KOD KOJI SE IZVRŠAVA NAKON KLIKA NA 'NAZAD' ---
        
        console.log('Stranica je učitana iz bfcache (korisnik se vratio sa "Nazad" gumbom)!');
        
        // Ovdje možete dodati funkcije koje želite pokrenuti, npr.:
        // updateIndicators();
        // provjera();
        window.location.href = 'https://autoservis-progi.onrender.com/';

    } else {
        // Stranica se učitava na uobičajeni način (prvi put, ili tvrdim reloadom)
        console.log('Stranica je učitana prvi put ili nakon klasičnog reloada.');
    }
});