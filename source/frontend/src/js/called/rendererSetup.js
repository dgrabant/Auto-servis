import * as THREE from 'three';

export function setupRenderer(scene, renderer, mobileOptimization, pcPerformance) {

    // --- Postavke Renderera ---

    renderer.setSize(window.innerWidth, window.innerHeight);

    // Ograniči PixelRatio da uštediš performanse
    let pixelRatio = Math.min(window.devicePixelRatio, 2); // Max 2x za desktop
    if (mobileOptimization) {
        pixelRatio = Math.min(window.devicePixelRatio, 1); // Max 1.5x (ili čak 1) za mobitele
    }
    renderer.setPixelRatio(pixelRatio);

    // Postavke sjena
    if (!mobileOptimization && !pcPerformance) {
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.VSMShadowMap; // VSM je OK, ali PCFSoftShadowMap je često brži
    }

    // Postavke boja i tonova
    // renderer.toneMapping = THREE.LinearToneMapping; // (Vrijednost 1)
    renderer.toneMapping = THREE.NoToneMapping; // (Vrijednost 0) - Najbrže. 
    // renderer.toneMapping = THREE.ACESFilmicToneMapping; // (Vrijednost 5) - Najljepše.
    
    // toneMappingExposure nema efekta ako je toneMapping = NoToneMapping
    // renderer.toneMappingExposure = 1; 
    
    renderer.useLegacyLights = false;
    renderer.outputColorSpace = THREE.SRGBColorSpace;


    // --- JEDAN PROLAZ KROZ SCENU (Optimizacija) ---

    const meshes = [];
    const pointLights = [];
    const spotLights = [];
    const hemisphereLights = [];

    scene.traverse(function (object) {

        // 1. Provjera za Mesheve
        if (object.isMesh) {
            meshes.push(object);

            if (!mobileOptimization && !pcPerformance) {
                object.castShadow = true;
                object.receiveShadow = true;
            }

            // Provjera roditelja (parent)
            let parent = object.parent;
            let isChildOfSteer = false;
            while (parent) {
                if (parent.name === 'STEER_HR') {
                    isChildOfSteer = true;
                    break;
                }
                parent = parent.parent;
            }

            // Provjera materijala
            const materials = Array.isArray(object.material)
                ? object.material
                : [object.material];

            materials.forEach(mat => {
                // *** ISPRAVAK: 'side' se postavlja na materijal, ne na mesh ***
                mat.side = THREE.DoubleSide; 

                // Uključi dubinu za specifične objekte
                if (isChildOfSteer || (object.name.toLowerCase().includes('login') || object.name.toLowerCase().includes('djelovi') || object.name.toLowerCase().includes('servis'))) {
                    mat.depthWrite = true;
                    mat.depthTest = true;
                }
            });
        
        // 2. Provjera za PointLights (samo ako NISMO na mobitelu)
        } else if (!mobileOptimization && object.isPointLight && !pcPerformance) {
            pointLights.push(object);
            object.castShadow = true;
            // NAPOMENA: 256 je jako niska rezolucija. 512 je bolji balans.
            object.shadow.mapSize.width = 512; 
            object.shadow.mapSize.height = 512;
            object.shadow.camera.near = 0.5;
            object.shadow.camera.far = 25;
            object.shadow.radius = 15;
            object.shadow.blurSamples = 2;

        // 3. Provjera za SpotLights (samo ako NISMO na mobitelu)
        } else if (!mobileOptimization && object.isSpotLight && !pcPerformance) {
            spotLights.push(object);
            object.castShadow = true;
            object.shadow.mapSize.width = 512;
            object.shadow.mapSize.height = 512;
            object.shadow.camera.near = 0.5;
            object.shadow.camera.far = 25;
            object.shadow.radius = 15;
            object.shadow.blurSamples = 2;

        // 4. Provjera za HemisphereLights
        } else if (object.isHemisphereLight) {
            hemisphereLights.push(object);
        }
    });

    console.log(`Pronađeno u jednom prolazu: ${meshes.length} mesheva, ${pointLights.length} point lightova, ${spotLights.length} spot lightova, ${hemisphereLights.length} HemiLightova.`);

    return renderer;
}