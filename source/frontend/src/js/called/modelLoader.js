import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';


export const LoadGLTFByPath = (scene, startingModelPath, loadingText) => {
  return new Promise((resolve, reject) => {

    const loader = new GLTFLoader();

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      startingModelPath,
      (gltf) => {
        console.log('Model učitan:', gltf.scene);
        scene.add(gltf.scene);
        resolve(gltf.scene);
      },
      (xhr) => {
        if (xhr.total) {
          const progress = (xhr.loaded / xhr.total) * 100;
          loadingText.textContent = `Učitavanje modela: ${progress.toFixed(1)}%`;
          //console.log(`Loading model: ${progress.toFixed(1)}%`);
        }
      },
      (error) => {
        console.error('Greška pri učitavanju modela:', error);
        reject(error);
      }
    );
  });
};


export const LoadSvjetlaPath = (scene, svjetlaPath, loadingText) => {
  loadingText.textContent = 'Učitavanje svjetala...';
    return new Promise((resolve, reject) => {
      
      // Create a loader
      const loader = new GLTFLoader();
  
      // Load the GLTF file
      loader.load(svjetlaPath, (gltf) => {
        console.log(gltf.scene);
        scene.add(gltf.scene);
        
        resolve();
      }, undefined, (error) => {
        reject(error);
      });
    });
    
};

/*export const LoadGLTFByPath = (scene, startingModelPath) => {
    return new Promise((resolve, reject) => {
      
      // Create a loader
      const loader = new GLTFLoader();
  
      // Load the GLTF file
      loader.load(startingModelPath, (glb) => {
        console.log(glb.scene);
        scene.add(glb.scene);
        
        resolve();
      }, undefined, (error) => {
        reject(error);
      });
    });
    
};
*/
export const LoadCameraPath = (scene, cameraPath, loadingText) => {
  loadingText.textContent = 'Učitavanje kamera....';
    return new Promise((resolve, reject) => {
      
      // Create a loader
      const loader = new GLTFLoader();
  
      // Load the GLTF file
      loader.load(cameraPath, (gltf) => {
        console.log(gltf.scene);
        scene.add(gltf.scene);
        
        resolve();
      }, undefined, (error) => {
        reject(error);
      });
    });
    
};