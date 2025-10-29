import * as THREE from 'three';
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// *** PROMJENA OVDJE: Dodan 'event' kao prvi argument ***
export function getFirstObjectHit(event, window, camera, scene, maxDistance = Infinity) {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  // Convert mouse position to normalized device coordinates (-1 to +1)
  // *** PROMJENA OVDJE: Koristi se 'event' koji je proslijeđen ***
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Update raycaster
  raycaster.setFromCamera(mouse, camera);
  raycaster.far = maxDistance; // limit how far the ray goes

  // Intersect all meshes in the scene (recursively)
  const intersects = raycaster.intersectObjects(scene.children, true);

  if (intersects.length > 0) {
    const firstHit = intersects[0].object;

    if (!firstHit.isMesh) return; // ignore non-meshes

    // Return clicked object (optional)
    return firstHit.name;
  } else {
     return "No object hit.";
  }
}

export function cameraNext(cameraList, cameraPosition) {
  cameraPosition++;
  if (cameraPosition == cameraList.length) {
    cameraPosition = cameraList.length - 3;
    console.log("if");
  }
  console.log(cameraPosition);
  return cameraPosition;
}

export function cameraPrev(cameraList, cameraPosition) {
  cameraPosition--;
  if (cameraPosition == (cameraList.length - 4)) {
    console.log("if");
  cameraPosition = cameraList.length - 1;
  }

  console.log(cameraPosition, cameraList.length);

  return cameraPosition;
}

export function clickTransition(cameraPosition, firstHitName) {
  if (firstHitName == "djelovi") {
    return 3;
  }
  else if (firstHitName == "servis") {
    return 2;
  }
  else return cameraPosition;

}

export function returnToPrevCam(cameraPosition) {
  if (cameraPosition == 3) {
    return 6;
  }
  else if (cameraPosition == 2) {
    return 4;
  }
  else return cameraPosition;
}

export function lightUpModel(firstHitButtonName, movingLight, lightUpAll = false){
  if (lightUpAll) {
    movingLight.intensity = 2.5;
  }
  else{
    if (firstHitButtonName.startsWith("djelovi") || firstHitButtonName == "servis" || firstHitButtonName == "login") {
      movingLight.intensity = 2.5;
      return true;
    }
    else{
      
      movingLight.intensity = 0;
      return false;
    }
  }
}

export function transitionLight(cameraPosition, movingLight, mobileOptimization){
  if (!mobileOptimization) {
    movingLight.intensity = 0;
  }
  if (cameraPosition == 6){
    movingLight.position.set(-4.654, 2.003, 0.1);
  }
  if (cameraPosition == 4){
    movingLight.position.set(-8, 2, 5.25);
  }
  if (cameraPosition == 5){
    movingLight.position.set(-11.476, 2.474, 4.674);
  }
}