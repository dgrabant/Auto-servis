import * as THREE from 'three';
export function setupRenderer(scene, renderer) {
	//Renderer does the job of rendering the graphics
	

	renderer.setSize(window.innerWidth, window.innerHeight);

	//set up the renderer with the default settings for threejs.org/editor - revision r153
	//renderer.shadowMap.enabled = true;
	//renderer.shadowMap.type = THREE.VSMShadowMap;
	//renderer.shadowMap.type = THREE.PCFSoftShadowMap
	//renderer.shadows = true;
	//renderer.shadowType = 2;
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.toneMapping = 1;
	renderer.toneMappingExposure = 1
	renderer.useLegacyLights  = false;
	renderer.toneMapping = THREE.NoToneMapping;
	//renderer.setClearColor(0xffffff, 0);
	renderer.outputColorSpace = THREE.SRGBColorSpace //make sure three/build/three.module.js is over r152 or this feature is not available. 

const mesh = [];
	
	scene.traverse(function (object) {
    if (object.isMesh) {
        // provjera da li je dijete od STEER_HR
        let parent = object.parent;
        let isChildOfSteer = false;

        while (parent) {
            if (parent.name === 'STEER_HR') {
                isChildOfSteer = true;
                break;
            }
            parent = parent.parent;
        }


        // uvijek dodaj mesh u listu i uključi sjene
        mesh.push(object);
        object.castShadow = true;
        object.receiveShadow = true;
		object.side = THREE.DoubleSide;
        // ako je dijete od STEER_HR, uključi dubinu
        if (isChildOfSteer || (object.isMesh && (object.name.toLowerCase().includes('login') || object.name.toLowerCase().includes('djelovi') || object.name.toLowerCase().includes('servis')))) {
            const materials = Array.isArray(object.material)
                ? object.material
                : [object.material];

            materials.forEach(mat => {
                mat.depthWrite = true;
                mat.depthTest = true;
                //mat.side = THREE.DoubleSide; // ispravna postavka umjesto object.doubleSided
            });
        }

    }
});


// Create an empty array to store the lights
const pointLights = [];
const spotLights = [];
const hemisphereLights = [];

// Traverse the scene
scene.traverse((object) => {
  // Check if the object is a PointLight
  if (object.isPointLight) {
    pointLights.push(object);
	object.castShadow = true;
	object.shadow.mapSize.width = 256;
	object.shadow.mapSize.height = 256;
	object.shadow.camera.near = 0.5;
	object.shadow.camera.far = 25;
	object.shadow.camera.left = -10;
	object.shadow.camera.right = 10;
	object.shadow.camera.top = 10;
	object.shadow.camera.bottom = -10;
	object.shadow.radius = 15;
	object.shadow.blurSamples = 2;
  }
});

// Now, the `pointLights` array contains all point lights in the scene

console.log(scene.children);
	scene.traverse(function (object) {
	if (object.isSpotLight) {
		object.castShadow = true;
		object.shadow.mapSize.width = 256;
		object.shadow.mapSize.height = 256;
		object.shadow.camera.near = 0.5;
		object.shadow.camera.far = 25;
		object.shadow.camera.left = -10;
		object.shadow.camera.right = 10;
		object.shadow.camera.top = 10;
		object.shadow.camera.bottom = -10;
		object.shadow.radius = 15;
		object.shadow.blurSamples = 2;
		spotLights.push(object);
	}
	});
	scene.traverse(function (object) {
    if (object.isHemisphereLight) {
        hemisphereLights.push(object);
    }
});

	console.log(`Found ${pointLights.length} point lights:`, pointLights,`Found ${spotLights.length} spot lights:`, spotLights, `Found ${mesh.length} meshes:`, mesh, `Found ${hemisphereLights.length} HemiLight:`, hemisphereLights  );

	return renderer
}