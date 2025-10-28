export function cleanMemory(){
    console.log('Čišćenje memorije prije inicijalizacije...');

  // Oslobodi sve globalne varijable i reference (ako postoje)
  if (typeof scene !== 'undefined' && scene) {
    while (scene.children.length > 0) {
      const obj = scene.children[0];
      scene.remove(obj);

      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach(mat => {
            if (mat.map) mat.map.dispose();
            mat.dispose();
          });
        } else {
          if (obj.material.map) obj.material.map.dispose();
          obj.material.dispose();
        }
      }
    }
  }
  window.removeEventListener('resize', onWindowResize);
  window.removeEventListener('wheel', wheelHandler);
  window.removeEventListener('mouseenter', mouseEnterHandler);
  window.removeEventListener('mouseleave', mouseLeaveHandler);
  window.removeEventListener('touchstart', touchStartHandler);
  window.removeEventListener('touchmove', touchMoveHandler);
  window.removeEventListener('touchend', touchEndHandler);
  document.removeEventListener('click', clickHandler);
  document.removeEventListener('keydown', keyDownHandler);
  

  if (typeof renderer !== 'undefined' && renderer) {
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement = null;
    renderer.context = null;
  }

  //Ukloni sve event listenere sa windowa i dokumenta
  window.onresize = null;
  window.onmousemove = null;
  window.onclick = null;
  window.onkeydown = null;
  window.onkeyup = null;
  document.onpointermove = null;
  document.onwheel = null;

  //Očisti sve timeoutove i intervale
  let lastId = setTimeout(() => {});
  for (let i = 0; i <= lastId; i++) {
    clearTimeout(i);
    clearInterval(i);
  }

  //Očisti sve globalne reference (ako koristiš npr. modeli[], texture[], itd.)
  if (typeof models !== 'undefined' && Array.isArray(models)) {
    models.length = 0;
  }

  //Pokreni ručno garbage collector (ako je podržano — samo u nekim okruženjima)
  if (window.gc) window.gc();

  console.log('✅ Memorija očišćena. Sigurno za novu inicijalizaciju.');
}
