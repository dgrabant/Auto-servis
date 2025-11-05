import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
const modelData = [
    { 
        path: '/assets/models/login.glb', 
        position: { x: -11, y: 0.5, z: 4 },
        rotation: { x: 0, y: THREE.MathUtils.degToRad(120), z: 0 },
        name: 'login'
    },
    { 
        path: '/assets/models/djelovi.glb', 
        position: { x: -5, y: 1.6, z: 0.1 }, 
        name: 'djelovi'
    },
    { 
        path: '/assets/models/servis.glb', 
        position: { x: -8, y: 1.7, z: 5 }, 
        name: 'servis'
    },
    { 
        path: '/assets/models/loginNeeded.glb', 
        position: { x: -8, y: 1.7, z: 5 }, 
        name: 'loginNeeded'
    }
];
const modelDataMob = [
    { 
        path: '/assets/models/login_mobitel.glb', 
        position: { x: -11, y: 0.5, z: 4 },
        rotation: { x: 0, y: THREE.MathUtils.degToRad(120), z: 0 },
        name: 'login'
    },
    { 
        path: '/assets/models/djelovi_mobitel.glb', 
        position: { x: -5, y: 1.6, z: 0.1 }, 
        name: 'djelovi'
    },
    { 
        path: '/assets/models/servis_mobitel.glb', 
        position: { x: -8, y: 1.7, z: 5 }, 
        name: 'servis'
    },
    { 
        path: '/assets/models/loginNeeded.glb', 
        position: { x: -8, y: 1.7, z: 5 }, 
        name: 'loginNeeded'
    }
];
let models = [];

export const spawnMultipleModels = (scene, isLogedIn = false, loadingText, mobileOptimization = false) =>{
  loadingText.textContent = 'Loading main menu....';
  return new Promise(async (resolve, reject) => {
    console.log('Počinje učitavanje više modela sa DRACO kompresijom...');

    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    loader.setDRACOLoader(dracoLoader);
    let loadPromises;
    let data;
    try {
      if (!mobileOptimization){
      loadPromises = modelData.map(data => loader.loadAsync(data.path));
      }
      else{
      loadPromises = modelDataMob.map(data => loader.loadAsync(data.path));
      }
      const loadedGltfs = await Promise.all(loadPromises);

      loadedGltfs.forEach((glb, index) => {
        const model = glb.scene;
        if (!mobileOptimization) {
          data = modelData[index];
        }
        else{
          data = modelDataMob[index];
        }
        

        model.position.set(data.position.x, data.position.y, data.position.z);
        model.name = data.name;

        console.log('Model učitan:', model);
        models.push(model);
        scene.add(model);
        console.log(`Model "${data.name}" učitan i postavljen na poziciju (${data.position.x}, ${data.position.y}, ${data.position.z})`);
      });

      if (isLogedIn) {
        scene.remove(models[models.length - 1]);
      } else {
        scene.remove(models[models.length - 2]);
      }

      resolve(models);
    } catch (error) {
      console.error('Greška pri učitavanju modela:', error);
      reject(error);
    }
  });
};


export function justLogedIn(scene){
    scene.remove(models[models.length - 1]);
    scene.add(models[models.length - 2]);
}
export function justLogedOut(scene){
    scene.add(models[models.length - 1]);
    scene.remove(models[models.length - 2]);
}

export function cleanupSpawnedModels() {
    console.log("Čišćenje modela iz spawn_menu.js...");
    // Uklanjamo reference iz polja
    models.forEach(model => {
        // Dodatna provjera: Iako bi Three.js resursi trebali biti očišćeni s cleanup() u loaf.js,
        // brisanje referenci ovdje je ključno za oslobađanje memorije iz modula.
        if (model.parent) {
          model.parent.remove(model);
        }
    });
    // Brisanje polja
    models.length = 0; 
}