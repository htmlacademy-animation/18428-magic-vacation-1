// modules
import mobileHeight from './modules/mobile-height-adjust.js';
import slider from './modules/slider.js';
import menu from './modules/menu.js';
import footer from './modules/footer.js';
import chat from './modules/chat.js';
import result from './modules/result.js';
import form from './modules/form.js';
import social from './modules/social.js';
import FullPageScroll from './modules/full-page-scroll';
import game from './modules/game.js';

// init modules
mobileHeight();
slider();
menu();
footer();
chat();
result();
form();
social();
game();

const fullPageScroll = new FullPageScroll();
fullPageScroll.init();

window.onload = function () {
  document.body.classList.add('loaded');
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

class AccentTypographyBuild {
  constructor(
    elementSelector,
    timer,
    classForActivate,
    property
  ) {
    this._TIME_SPACE = 100;

    this._elementSelector = elementSelector;
    this._timer = timer;
    this._classForActivate = classForActivate;
    this._property = property;
    this._element = document.querySelector(this._elementSelector);
    this._timeOffset = 0;

    this.prePareText();
  }

  createElement(letter) {
    const span = document.createElement(`span`);
    span.textContent = letter;
    span.style.transition = `${this._property} ${this._timer}ms ease ${this._timeOffset}ms`;
    this._timeOffset = getRandomInt(0, 200);
    return span;
  }

  prePareText() {
    if (!this._element) {
      return;
    }
    const text = this._element.textContent.trim().split(` `).filter((latter)=>latter !== '');

    const content = text.reduce((fragmentParent, word) => {
      const wordElement = Array.from(word).reduce((fragment, latter) => {
        fragment.appendChild(this.createElement(latter));
        return fragment;
      }, document.createDocumentFragment());
      const wordContainer = document.createElement(`span`);
      wordContainer.classList.add(`text__word`);
      wordContainer.appendChild(wordElement);
      fragmentParent.appendChild(wordContainer);
      return fragmentParent;
    }, document.createDocumentFragment());

    this._element.innerHTML = ``;
    this._element.appendChild(content);
  }

  runAnimation() {
    if (!this._element) {
      return;
    }
    this._element.classList.add(this._classForActivate);
  }

  destroyAnimation() {
    this._element.classList.remove(this._classForActivate);
  }
}


const animationTopScreenTextLine = new AccentTypographyBuild(`.intro__title`, 500, `active`, `transform`);
setTimeout(()=>{
  animationTopScreenTextLine.runAnimation();
}, 500);

const animationTopScreenTextLine2 = new AccentTypographyBuild(`.slider__item-title`, 500, `active`, `transform`);
setTimeout(()=>{
  animationTopScreenTextLine2.runAnimation();
}, 500);

const animationTopScreenTextLine3 = new AccentTypographyBuild(`.intro__date`, 500, `active`, `transform`);
setTimeout(()=>{
  animationTopScreenTextLine3.runAnimation();
}, 1300);

const animationTopScreenTextLine4 = new AccentTypographyBuild(`.prizes__title`, 500, `active`, `transform`);
setTimeout(()=>{
  animationTopScreenTextLine4.runAnimation();
}, 500);

const animationTopScreenTextLine5 = new AccentTypographyBuild(`.rules__title`, 500, `active`, `transform`);
setTimeout(()=>{
  animationTopScreenTextLine5.runAnimation();
}, 500);

const animationTopScreenTextLine6 = new AccentTypographyBuild(`.game__title`, 500, `active`, `transform`);
setTimeout(()=>{
  animationTopScreenTextLine6.runAnimation();
}, 500);
