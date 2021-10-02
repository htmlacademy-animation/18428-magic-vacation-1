export default () => {

  let fpsInterval = 1000 / 12;
  let now,
      then = Date.now(),
      elapsed,
      i = 0,
      j = 0;


  let journeysCounter = document.querySelector('.counter_journeys');
  let casesCounter = document.querySelector('.counter_cases');
  let codesCounter = document.querySelector('.counter_codes');

  function draw(element) {
    let maxCount = element.dataset.number;
    element.innerHTML = '';
    if (i < maxCount && maxCount < 100) {
      i = ++i;
      element.appendChild(document.createTextNode(i));
    } else if (j < maxCount && maxCount >= 100) {
      j += 30;
      element.appendChild(document.createTextNode(j));
    } else {
      element.appendChild(document.createTextNode(maxCount));
    }
  }


  function tick() {
    requestAnimationFrame(tick);

    now = Date.now();
    elapsed = now - then;

    if (elapsed > fpsInterval) {
      then = now - (elapsed % fpsInterval);
      draw(journeysCounter);
      draw(casesCounter);
      draw(codesCounter);
    }
  }

  requestAnimationFrame(tick);
};
