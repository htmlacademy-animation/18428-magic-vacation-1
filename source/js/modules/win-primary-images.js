export default () => {

  function easeLinear(x) {
   return x;
 }


 function easeInCubic(x) {
   return x * x * x;
 }


 function easeOutCubic(x) {
   return 1 - Math.pow(1 - x, 3);
 }


 function easeInExpo(x) {
   if (x === 0) {
     return 0;
   } else {
     return Math.pow(2, 10 * x - 10);
   }
 }


 function easeOutExpo(x) {
   if (x === 1) {
     return 1;
   } else {
     return 1 - Math.pow(2, -10 * x);
   }
 }


 function easeInElastic(x) {
   const c4 = (2 * Math.PI) / 3;

   if (x === 0) {
     return 0;
   } else if (x === 1) {
     return 1;
   } else {
     return Math.pow(2, 10 * x - 10) * Math.sin((x * 10 - 10.75) * c4);
   }
 }


 function easeOutElastic(x) {
   const c4 = (2 * Math.PI) / 3;

   if (x === 0) {
     return 0;
   } else if (x === 1) {
     return 1;
   } else {
     return Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
   }
 }


 const _ = Object.freeze({
   easeLinear,
   easeInCubic,
   easeOutCubic,
   easeInExpo,
   easeOutExpo,
   easeInElastic,
   easeOutElastic
 });

 class Animation {
  constructor(options) {
    this.options = options;

    if (!this.options.easing) {
      this.options.easing = _.easeLinear;
    }

    if (!this.options.duration) {
      this.options.duration = 1000;
    }

    if (!this.options.delay) {
      this.options.delay = 0;
    }

    if (!this.options.fps) {
      this.options.fps = 60;
    }

    this.timeoutId = null;
    this.requestId = null;
  }


  start(options) {
    this.stop();

    this.timeoutId = setTimeout(() => {
      this.startTime = performance.now();
      this.interval = 1000 / this.options.fps;
      this.lastFrameTime = this.startTime;
      this.isFinished = false;

      let animateFrame;

      if (this.options.duration === `infinite`) {
        animateFrame = (currentTime) => {
          this.requestId = requestAnimationFrame(animateFrame);

          const delta = currentTime - this.lastFrameTime;

          if (delta > this.interval) {
            this.options.func(1, {
              startTime: this.startTime,
              currentTime,
              isFinished: false,
              options
            });

            this.lastFrameTime = currentTime - delta % this.interval;
          }
        };
      } else {
        animateFrame = (currentTime) => {
          this.requestId = requestAnimationFrame(animateFrame);

          const delta = currentTime - this.lastFrameTime;

          if (delta > this.interval) {
            let timeFraction = (currentTime - this.startTime) / this.options.duration;

            if (timeFraction > 1) {
              timeFraction = 1;
              this.isFinished = true;
            }

            if (timeFraction <= 1) {
              const progress = this.options.easing(timeFraction);

              this.options.func(progress, {
                startTime: this.startTime,
                currentTime,
                isFinished: this.isFinished,
                options
              });

              this.lastFrameTime = currentTime - delta % this.interval;
            }

            if (this.isFinished) {
              this.stop();

              if (typeof this.options.callback === `function`) {
                this.options.callback();
              }
            }
          }
        };
      }

      this.requestId = requestAnimationFrame(animateFrame);
    }, this.options.delay);
  }


  restart() {
    this.start();
  }


  stop() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    if (this.requestId) {
      cancelAnimationFrame(this.requestId);
    }
  }
}


class Scene2D {
  constructor(options) {
    this.canvas = options.canvas;
    this.ctx = this.canvas.getContext(`2d`);
    this.size = 100;
    this.images = {};
    this.objects = {};
    this.objectsSettings = options.objects;
    this.locals = {};
    this.isLoaded = false;
    this.isWaitingForImages = false;
    this.isStarted = false;
    this.animations = [];
    this.afterInit = () => {};

    this.initObjects();

    this.initEventListeners();
    this.updateSize();
    this.loadImages(options.imagesUrls);
  }


  initEventListeners() {
    window.addEventListener(`resize`, this.updateSize.bind(this));
  }


  initObjects() {
    for (const name in this.objectsSettings) {
      if (Object.prototype.hasOwnProperty.call(this.objectsSettings, name)) {
        const o = this.objectsSettings[name];

        this.objects[name] = {};
        this.objects[name].imageId = o.imageId;
        this.objects[name].before = o.before;
        this.objects[name].after = o.after;
        this.objects[name].x = o.x;
        this.objects[name].y = o.y;
        this.objects[name].size = o.size;
        this.objects[name].opacity = o.opacity;

        this.objects[name].transforms = {};
        this.objects[name].transforms.rotate = o.transforms.rotate;
        this.objects[name].transforms.translateX = o.transforms.translateX;
        this.objects[name].transforms.translateY = o.transforms.translateY;
        this.objects[name].transforms.scaleX = o.transforms.scaleX;
        this.objects[name].transforms.scaleY = o.transforms.scaleY;
      }
    }

    if (this.afterInit && typeof this.afterInit === `function`) {
      this.afterInit();
    }
  }


  initLocals() {

  }


  initAnimations() {

  }


  loadImages(imagesUrls) {
    let loadingCounter = 0;

    for (const name in imagesUrls) {
      if (Object.prototype.hasOwnProperty.call(imagesUrls, name)) {
        const image = new Image();

        image.addEventListener(`load`, () => {
          loadingCounter++;

          if (loadingCounter === Object.keys(imagesUrls).length) {
            this.isLoaded = true;

            if (this.isWaitingForImages) {
              this.start();
            } else {
              this.drawScene();
            }
          }
        });

        this.images[name] = image;

        image.src = imagesUrls[name];
      }
    }
  }


  start() {
    if (!this.isLoaded) {
      this.isWaitingForImages = true;

      return;
    }

    if (this.isStarted) {
      this.stop();
      this.initObjects();
    }

    if (this.animations.length === 0) {
      this.initAnimations();
    }

    this.animations.forEach((animation) => {
      animation.start();
    });

    this.isStarted = true;
  }


  stop() {
    this.animations.forEach((animation) => {
      animation.stop();
    });
  }


  drawImage(image, object) {
    let x = object.x;
    let y = object.y;
    let size = object.size;
    let opacity = object.opacity;
    let transforms = object.transforms;

    if (opacity === 0) {
      return;
    }

    if (transforms && (transforms.scaleX === 0 || transforms.scaleY === 0)) {
      return;
    }

    let width = this.size * (size / 100);
    let height = this.size * (size / 100) * image.height / image.width;

    x = this.size * (x / 100) - width / 2;
    y = this.size * (y / 100) - height / 2;

    const isContextTransforming = opacity
      || (transforms && (transforms.rotate || transforms.scaleX || transforms.scaleY));

    if (isContextTransforming) {
      this.ctx.save();
    }

    if (transforms) {
      if (transforms.translateX) {
        x += this.size * (transforms.translateX / 100);
      }

      if (transforms.translateY) {
        y += this.size * (transforms.translateY / 100);
      }

      if (transforms.rotate) {
        this.ctx.translate(x + width / 2, y + height / 2);
        this.ctx.rotate(transforms.rotate * Math.PI / 180);
      }

      if (transforms.scaleX) {
        width *= transforms.scaleX;

        if (transforms.scaleX < 0) {
          this.ctx.scale(-1, 1);

          x = -x;
        }
      }

      if (transforms.scaleY) {
        height *= transforms.scaleY;

        if (transforms.scaleY < 0) {
          this.ctx.scale(1, -1);

          y = -y;
        }
      }

      if (transforms.rotate) {
        this.ctx.translate(-x - width / 2, -y - height / 2);
      }

    }

    if (opacity) {
      this.ctx.globalAlpha = opacity;
    }

    this.ctx.drawImage(
        image,
        x,
        y,
        width,
        height
    );

    if (isContextTransforming) {
      this.ctx.restore();
    }
  }


  clearScene() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }


  drawScene() {
    this.clearScene();

    for (const name in this.objects) {
      if (Object.prototype.hasOwnProperty.call(this.objects, name)) {
        const object = this.objects[name];

        if (object.before && typeof object.before === `function`) {
          object.before();
        }

        this.drawImage(
            this.images[object.imageId],
            object
        );

        if (object.after && typeof object.after === `function`) {
          object.after();
        }
      }
    }
  }


  updateSize() {
    this.size = Math.min(window.innerWidth, window.innerHeight);

    this.canvas.height = this.size;
    this.canvas.width = this.size;
  }
}


const IMAGES_URLS = Object.freeze({
  plane: `/img/module-4/win-primary-images/airplane.png`,
  tree: `/img/module-4/win-primary-images/tree.png`,
  tree2: `/img/module-4/win-primary-images/tree 2.png`,
  ice: `/img/module-4/win-primary-images/ice.png`,
  seaCalf: `/img/module-4/win-primary-images/sea-calf-2.png`,
  snowflake: `/img/module-4/win-primary-images/snowflake.png`
});


const OBJECTS = Object.freeze({
  plane: {
    imageId: `plane`,
    x: 90,
    y: 50,
    size: 10,
    opacity: 0,
    transforms: {
      translateY: -10
    }
  },
  tree: {
    imageId: `tree`,
    x: 65,
    y: 62,
    size: 5,
    opacity: 0,
    transforms: {
      translateY: 30
    }
  },
  tree2: {
    imageId: `tree2`,
    x: 60,
    y: 60,
    size: 5,
    opacity: 0,
    transforms: {
      translateY: 30
    }
  },
  ice: {
    imageId: `ice`,
    x: 50,
    y: 70,
    size: 50,
    opacity: 0,
    transforms: {
      translateY: 30
    }
  },
  seaCalf: {
    imageId: `seaCalf`,
    x: 50,
    y: 60,
    size: 50,
    opacity: 0,
    transforms: {
      translateY: 30
    }
  },
  snowflake: {
    imageId: `snowflake`,
    x: 25,
    y: 55,
    size: 30,
    opacity: 0,
    transforms: {
      rotate: -30
    }
  },
  snowflake2: {
    imageId: `snowflake`,
    x: 75,
    y: 65,
    size: 15,
    opacity: 0,
    transforms: {
      rotate: 30,
      scaleX: -1
    }
  },
});


const LOCALS = Object.freeze({
  blob: {
    centerX: 45,
    centerY: 55,
    radius: 15,
    endX: 87,
    endY: 53,
    angle: 45,
    deltasLength: 10,
    opacity: 0
  }
});


class Scene2DSeaCalf extends Scene2D {
  constructor() {
    const canvas = document.getElementById(`sea-calf-scene`);

    super({
      canvas,
      objects: OBJECTS,
      locals: LOCALS,
      imagesUrls: IMAGES_URLS,
    });

    this.initLocals();

    this.afterInit = () => {
      this.objects.plane.before = this.drawBlob.bind(this);
    };

    this.initEventListeners();
    this.initObjects(OBJECTS);
    this.initLocals();
    this.start();
    this.updateSize();
  }


  initLocals() {
    this.locals = {
      blob: {
        centerX: LOCALS.blob.centerX,
        centerY: LOCALS.blob.centerY,
        radius: LOCALS.blob.radius,
        endX: LOCALS.blob.endX,
        endY: LOCALS.blob.endY,
        angle: LOCALS.blob.angle,
        deltasLength: LOCALS.blob.deltasLength,
        opacity: LOCALS.blob.opacity
      }
    };
  }


  initEventListeners() {
    window.addEventListener(`resize`, this.updateSize.bind(this));
  }


  initAnimations() {
    this.animations.push(new Animation({
      func: () => {
        this.drawScene();
      },
      duration: `infinite`,
      fps: 60
    }));

    this.initPlaneAnimations();
    this.initBlobAnimations();
    this.initTreesAnimations();
    this.initSeaCalfAnimations();
    this.initSnowflakesAnimations();
  }


  initPlaneAnimations() {
    this.animations.push(new Animation({
      func: (progress) => {
        const progressReversed = 1 - progress;

        this.objects.plane.transforms.translateX = -40 * progressReversed;
        this.objects.plane.transforms.translateY =
          5 * Math.sin(Math.PI * progressReversed) - 15 * progressReversed;
        this.objects.plane.transforms.rotate =
          45 * Math.sin(Math.PI * progressReversed) + 45 * progressReversed;
        this.objects.plane.opacity = progress;
      },
      duration: 500,
      delay: 1200,
      easing: _.easeInQuad
    }));
  }


  initBlobAnimations() {
    this.animations.push(new Animation({
      func: (progress) => {
        const progressReversed = 1 - progress;

        this.locals.blob.radius = 15 * progress;
        this.locals.blob.centerY = 55 - 15 * progressReversed;
        this.locals.blob.endX = 87 - 35 * progressReversed;
        this.locals.blob.endY = 53 - 12 * progressReversed;
        this.locals.blob.angle = 40 + 120 * progressReversed;
        this.locals.blob.deltasLength = 10 * progress;
        this.locals.blob.opacity = progress;
      },
      duration: 500,
      delay: 1200,
      easing: _.easeInQuad
    }));
  }


  initTreesAnimations() {
    this.animations.push(new Animation({
      func: (progress) => {
        this.objects.tree.transforms.translateY = 30 * (1 - progress);
        this.objects.tree.opacity = progress;
      },
      duration: 500,
      delay: 1200,
      easing: _.easeInQuad
    }));

    this.animations.push(new Animation({
      func: (progress) => {
        this.objects.tree2.transforms.translateY = 30 * (1 - progress);
        this.objects.tree2.opacity = progress;
      },
      duration: 500,
      delay: 1500,
      easing: _.easeInQuad
    }));
  }


  initSeaCalfAnimations() {
    this.animations.push(new Animation({
      func: (progress) => {
        const progressReversed = 1 - progress;

        this.objects.seaCalf.transforms.translateY = 30 * progressReversed;
        this.objects.seaCalf.transforms.rotate = -30 * Math.sin(progressReversed * 2);

        this.objects.ice.transforms.translateY = 30 * progressReversed;
        this.objects.ice.transforms.rotate = -30 * Math.sin(progressReversed * 2);
      },
      duration: 2000,
      delay: 1000,
      easing: _.easeOutElastic
    }));

    this.animations.push(new Animation({
      func: (progress) => {
        this.objects.seaCalf.opacity = progress;
        this.objects.ice.opacity = progress;
      },
      duration: 100,
      delay: 1000,
      easing: _.easeInQuad
    }));
  }


  initSnowflakesAnimations() {
    this.animations.push(new Animation({
      func: (progress, details) => {
        this.objects.snowflake.transforms.translateY =
          2 * Math.sin(1.5 * (details.currentTime - details.startTime) / 1000);
      },
      duration: `infinite`
    }));

    this.animations.push(new Animation({
      func: (progress, details) => {
        this.objects.snowflake2.transforms.translateY =
          2 * Math.sin(1.5 * (details.currentTime - details.startTime) / 1000);
      },
      duration: `infinite`,
      delay: 800
    }));

    this.animations.push(new Animation({
      func: (progress) => {
        this.objects.snowflake.opacity = progress;
      },
      duration: 500,
      delay: 1500,
      easing: _.easeInQuad
    }));

    this.animations.push(new Animation({
      func: (progress) => {
        this.objects.snowflake2.opacity = progress;
      },
      duration: 500,
      delay: 1900,
      easing: _.easeInQuad
    }));
  }


  drawBlob() {
    const b = this.locals.blob;
    const angle = b.angle * Math.PI / 180;

    if (b.opacity === 0) {
      return;
    }

    const s = this.size / 100;

    this.ctx.save();
    this.ctx.globalAlpha = b.opacity;
    this.ctx.fillStyle = `#acc3ff`;

    this.ctx.beginPath();
    this.ctx.arc(
        b.centerX * s,
        b.centerY * s,
        b.radius * s,
        Math.PI / 2,
        Math.PI * 3 / 2
    );
    this.ctx.bezierCurveTo(
        (b.centerX + 10) * s,
        (b.centerY - b.radius) * s,
        (b.endX - b.deltasLength * Math.sin(angle)) * s,
        (b.endY + b.deltasLength * Math.cos(angle)) * s,
        b.endX * s,
        b.endY * s
    );
    this.ctx.bezierCurveTo(
        (b.endX - b.deltasLength * Math.sin(angle)) * s,
        (b.endY + b.deltasLength * Math.cos(angle)) * s,
        (b.centerX + 10) * s,
        (b.centerY + b.radius) * s,
        b.centerX * s,
        (b.centerY + b.radius) * s
    );

    this.ctx.fill();
    this.ctx.restore();
  }
}

const scene = new Scene2DSeaCalf();

};
