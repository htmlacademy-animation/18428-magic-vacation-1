export default () => {

  let fpsInterval = 1000 / 24;
  let now,
      then = Date.now(),
      start = Date.now(),
      elapsed;
  let finalTime = 1000*60*5;

  function draw() {
    let minCounter = document.querySelector('.counter_min');
    let secCounter = document.querySelector('.counter_sec');

    let timeNow = parseInt((finalTime - (Date.now() - start))/1000),
        secNow = timeNow%60,
        minNow = (timeNow - secNow)/60;

    if (timeNow >= 0) {
        minCounter.innerHTML = '';
        secCounter.innerHTML = '';
        minCounter.appendChild(document.createTextNode((minNow > 10) ? minNow : '0' + minNow));
        secCounter.appendChild(document.createTextNode((secNow > 10) ? secNow : '0' + secNow));
    }
  }


  function tick() {
    requestAnimationFrame(tick);

    now = Date.now();
    elapsed = now - then;

    if (elapsed > fpsInterval) {
      then = now - (elapsed % fpsInterval);
      draw();
    }
  }


  requestAnimationFrame(tick);
  
};
