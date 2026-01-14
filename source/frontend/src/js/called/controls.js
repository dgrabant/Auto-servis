import * as THREE from 'three';
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const hudHTML = document.getElementById("hud");
const userHTML = document.getElementById("user");

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
  if (firstHitName.startsWith("djelovi") || firstHitName.startsWith("dijelovi")) {
    hideHud(true, 500);
    return 4;
  }
  else if (firstHitName == "servis") {
    hideHud(true, 500); 
    return 3;
  }
  else if (firstHitName == "login"){
    hideHud(true, 500); 
    return 2;
  }
  else return cameraPosition;

}

export function returnToPrevCam(cameraPosition) {
  if (cameraPosition == 3) {
    hideHud(false, 1300);
    return 5;
  }
  else if (cameraPosition == 2) {
    hideHud(false, 800);
    return 6;
  }
  else if (cameraPosition == 4) {
    hideHud(false, 1500);
    return 7;
  }
  else return cameraPosition;
}

export function lightUpModel(firstHitButtonName, movingLight, lightUpAll = false){
  if (lightUpAll) {
    movingLight.intensity = 2.5;
    movingLight.color.set(0xffffff);
  }
  else{
    if (firstHitButtonName.startsWith("djelovi") || firstHitButtonName.startsWith("dijelovi") || firstHitButtonName == "servis" || firstHitButtonName.startsWith("login")) {
      movingLight.intensity = 2.5;
      movingLight.color.set(0xffffff);
      return true;
    }
    else{
      movingLight.intensity = 1.7;
      movingLight.color.set(0x38bff8);
      return false;
    }
  }
}

export function transitionLight(cameraPosition, movingLight, mobileOptimization){
  if (!mobileOptimization) {
    movingLight.intensity = 1.7;
    movingLight.color.set(0x38bff8);
  }
  if (cameraPosition == 7){
    movingLight.position.set(-4.654, 2.003, 0.1);
  }
  if (cameraPosition == 5){
    movingLight.position.set(-8, 2, 5.25);
  }
  if (cameraPosition == 6){
    movingLight.position.set(-11.476, 2.474, 4.674);
  }
}


function hideHud(hidden, timeout){
  if (hidden == true) {
    hudHTML.classList.add('hidden');
    userHTML.classList.add('hidden');
    setTimeout(() => {
      hudHTML.style.display = 'none';
      userHTML.style.display = 'none';
      hudHTML.hidden = hidden;
      userHTML.hidden = hidden;
  },timeout);
  }
  else{
    setTimeout(() => {
      hudHTML.classList.remove('hidden');
      userHTML.classList.remove('hidden');
      hudHTML.hidden = hidden;
      userHTML.hidden = hidden;
    },timeout);
    setTimeout(() => {
      hudHTML.style.display = 'flex';
      userHTML.style.display = 'flex';
    },timeout+200);
  }
}