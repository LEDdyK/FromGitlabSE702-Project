'use strict';

class Forest {
    constructor(elementId = 'cloud-canvas') {
        this.canvas = document.getElementById(elementId);
        this.width = this.canvas.width;
        this.ctx = this.canvas.getContext('2d');

        // init background
        this.background = new Image();
        this.background.src = 'http://silveiraneto.net/wp-content/uploads/2011/06/forest.png';

        // init cloud
        this.cloud = new Image();
        this.cloud.src = 'http://silveiraneto.net/wp-content/uploads/2011/06/cloud.png';
        this.cloud.onload = () => {
            this.cloud_x = -this.cloud.width * 0.8;
        };
    }

    main() {
        this.draw();
        this.update();

        // Cross-browser support for requestAnimationFrame
        const w = window;
        const requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

        // Request to do this again ASAP
        requestAnimationFrame(this.main.bind(this));
    }

    draw() {
        this.ctx.drawImage(this.background, 0, 0);
        this.ctx.drawImage(this.cloud, this.cloud_x, 0);
    }

    update() {
        this.cloud_x += 0.3;
        if (this.cloud_x > this.width) {
            this.cloud_x = -this.cloud.width;
        }
    }
}

const forest = new Forest();
forest.main();