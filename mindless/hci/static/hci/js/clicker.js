'use strict';
import Easing from './easing.js';

class GameShape {
    constructor(x, y, colour, shapeType) {
        this.x = x;
        this.y = y;
        this.colour = colour;
        this.shapeType = shapeType;
        this.visible = true;
        this.transition = 1.0;
        this.hoverTransition = 0.0;
    }
}

class Clicker {
    constructor(canvasId, is_practice, shapeSize = 25) {
        // Create the canvas
        this.start = Date.now();
        this.then = Date.now();
        this.gameOverProgress = null;
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.shapeSize = shapeSize;
        this.rounds = is_practice ? 1 : 5;
        this.activeShape = null;
        this.discriminateOn = Math.round(Math.random()) ? 'shape' : 'colour';
        //true for blue, square. False for red, circle
        this.leftBlueSquare = (Math.random() * 2 >= 1);
        this.flagImage = new Image();
        this.flagImage.src = '/static/hci/img/flag.svg';

        $(this.canvas).mouseout(this.handleActivate.bind(this));
        $(this.canvas).mouseover(this.handleActivate.bind(this));
        $(this.canvas).click(this.handleClick.bind(this));
        $(this.canvas).contextmenu(this.handleClick.bind(this));
        $(this.canvas).mousemove(this.handleMouseMove.bind(this));

        // Game objects
        this.events = {};
        this.numShapes = is_practice ? 6 : 20;
        this.addRandomShapes();
    }

    handleActivate(jqEvent) {
        const isMouseIn = jqEvent.type === 'mouseover';
        this.recordEvent(isMouseIn ? 'mouseIn' : 'mouseOut');
        $(this.canvas).fadeTo(100, isMouseIn ? 1 : 0.3);
    }

    addRandomShapes(canvasPadding = 64, shapePadding = 30) {
        this.shapes = [];

        for (let i = 0; i < this.numShapes; i++) {
            let x = 0;
            let y = 0;
            do {
                x = canvasPadding / 2 + (Math.random() * (this.canvas.width - canvasPadding));
                y = canvasPadding / 2 + (Math.random() * (this.canvas.height * 0.9 - canvasPadding)) + this.canvas.height / 10;
            } while (this.findHit({x: x, y: y}, shapePadding));

            this.shapes.push(new GameShape(x, y,
                Math.round(Math.random()) ? 'red' : 'blue',
                Math.round(Math.random()) ? 'square' : 'circle'));
        }
    }

    recordEvent(eventCode) {
        this.events[Date.now() - this.start] = eventCode;
    }

    extractCoords(jqEvent) {
        jqEvent.preventDefault();
        return {
            x: jqEvent.pageX - $(this.canvas).offset().left,
            y: jqEvent.pageY - $(this.canvas).offset().top
        };
    }

    handleMouseMove(jqEvent) {
        const coords = this.extractCoords(jqEvent);
        this.activeShape = this.findHit(coords);
    }

    findHit(coords, padding = 0) {
        for (let obj of this.shapes.filter((s) => s.visible)) {
            let shapeHalfLength = this.shapeSize / 2 + padding;
            if (coords.x <= (obj.x + shapeHalfLength)
                && coords.x >= (obj.x - shapeHalfLength)
                && coords.y <= (obj.y + shapeHalfLength)
                && coords.y >= (obj.y - shapeHalfLength)) {
                return obj;
            }
        }

        return null;
    }

    // Reset when round of the game is over
    nextRound() {
        if (--this.rounds > 0) {
            this.discriminateOn = Math.round(Math.random()) ? 'shape' : 'colour';
            this.leftBlueSquare = (Math.random() * 2 >= 1);
            this.addRandomShapes();
        } else {
            this.onGameOver();
        }
    }

    onGameOver() {
        this.recordEvent('gameComplete');
        $('#clicker-data').val(JSON.stringify(this.events)).change();
        $(this.canvas).off('mouseover');
        $(this.canvas).off('mouseout');
        this.gameOverProgress = 0.0;
    }

    // Update game objects
    update(modifier) {
        for (const shape of this.shapes) {
            if (!shape.visible && shape.transition < 1) {
                // Transition out
                shape.transition = Math.min(1, shape.transition + (1000 / 250) * modifier);
            } else if (shape.visible && shape.transition > 0) {
                // Transition in
                shape.transition = Math.max(0, shape.transition - (1000 / 500) * modifier);
            }
        }

        const hoverMs = 150;

        if (this.activeShape) {
            this.activeShape.hoverTransition = Math.min(1, this.activeShape.hoverTransition + (1000 / hoverMs) * modifier);
        }

        for (let shape of this.shapes.filter(s => s !== this.activeShape && s.hoverTransition > 0)) {
            shape.hoverTransition = Math.max(0, shape.hoverTransition - (1000 / hoverMs) * modifier);
        }

        const roundFinishedAndTransitioned = !this.shapes.filter(s => s.visible || s.transition < 1).length;
        if (roundFinishedAndTransitioned && this.rounds > 0) {
            this.recordEvent('roundComplete');
            this.nextRound();
        }

        // Update game over
        if (this.gameOverProgress !== null) {
            this.gameOverProgress = Math.min(1, this.gameOverProgress + (1000 / 500) * modifier);
        }
    }

    // Draw everything
    render() {
        // Background
        let grd = this.ctx.createRadialGradient(this.canvas.width / 2, this.canvas.height / 2, 0.000,
            this.canvas.width / 2, this.canvas.height / 2, this.canvas.height);

        grd.addColorStop(0.000, 'rgba(235, 235, 235, 1.000)');
        grd.addColorStop(1.000, 'rgba(205, 205, 205, 1.000)');
        this.ctx.fillStyle = grd;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Shapes
        for (let shape of this.shapes.filter(s => s.transition < 1)) {
            const easedTransition = Easing.easeOutQuad(shape.transition);
            const easedHoverTransition = Easing.easeOutQuad(shape.hoverTransition);
            const modifiedSize = this.shapeSize + easedTransition * 60 + easedHoverTransition * 5;
            const opacity = 1 - easedTransition;

            this.ctx.beginPath();
            if (shape.shapeType === 'circle') {
                let circleDimen = modifiedSize * 1.1;
                this.ctx.arc(shape.x, shape.y, circleDimen / 2, 0, 2 * Math.PI);
            } else if (shape.shapeType === 'square') {
                this.ctx.rect(shape.x - modifiedSize / 2, shape.y - modifiedSize / 2, modifiedSize, modifiedSize);
            }

            if (shape.colour === 'red') {
                this.ctx.fillStyle = `rgba(238, 50, 51, ${opacity})`;
            } else if (shape.colour === 'blue') {
                this.ctx.fillStyle = `rgba(102, 167, 197, ${opacity})`;
            }

            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
            this.ctx.shadowBlur = 10 * easedHoverTransition;
            this.ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
            this.ctx.fill();
        }

        // Score
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.font = '18px Helvetica';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText('Remaining Screens: ' + this.rounds, 8, 8);

        //render boxes showing controls
        this.ctx.beginPath();
        this.ctx.rect(4 * (this.canvas.width / 10) - 1, 0, this.canvas.width / 10, this.canvas.height / 10);
        this.ctx.fillStyle = 'rgba(0, 0, 0, 1)';
        this.ctx.stroke();
        this.ctx.fill();

        this.ctx.rect(5 * (this.canvas.width / 10) + 1, 0, this.canvas.width / 10, this.canvas.height / 10);
        this.ctx.fillStyle = 'rgba(0, 0, 0, 1)';
        this.ctx.stroke();
        this.ctx.fill();

        if (this.discriminateOn === 'shape') {
            if (this.leftBlueSquare) {
                this.ctx.beginPath();
                this.ctx.fillStyle = 'rgba(102, 167, 197,1)';
                this.ctx.rect(4 * (this.canvas.width / 10) + 39, 39, (this.canvas.width / 20) - 40, (this.canvas.width / 10) - 80);
                this.ctx.fill();
                this.ctx.beginPath();
                this.ctx.fillStyle = 'rgba(102, 167, 197,1)';
                this.ctx.arc(11 * (this.canvas.width / 20), (this.canvas.height / 20), Math.abs((this.canvas.width / 20) - 40), 1.5 * Math.PI, 0.5 * Math.PI);
                this.ctx.fill();

                this.ctx.beginPath();
                this.ctx.fillStyle = 'rgba(238, 50, 51, 1)';
                this.ctx.arc(11 * (this.canvas.width / 20), (this.canvas.height / 20), Math.abs((this.canvas.width / 20) - 40), 0.5 * Math.PI, 1.5 * Math.PI);
                this.ctx.fill();
                this.ctx.beginPath();
                this.ctx.fillStyle = 'rgba(238, 50, 51, 1)';
                this.ctx.rect(8 * (this.canvas.width / 20) + 25, 39, (this.canvas.width / 20) - 40, (this.canvas.width / 10) - 80);
                this.ctx.fill();
            } else {
                this.ctx.beginPath();
                this.ctx.fillStyle = 'rgba(238, 50, 51, 1)';
                this.ctx.rect(5 * (this.canvas.width / 10) + 39, 39, (this.canvas.width / 20) - 40, (this.canvas.width / 10) - 80);
                this.ctx.fill();
                this.ctx.beginPath();
                this.ctx.fillStyle = 'rgba(238, 50, 51, 1)';
                this.ctx.arc(9 * (this.canvas.width / 20), (this.canvas.height / 20), Math.abs((this.canvas.width / 20) - 40), 1.5 * Math.PI, 0.5 * Math.PI);
                this.ctx.fill();

                this.ctx.beginPath();
                this.ctx.fillStyle = 'rgba(102, 167, 197,1)';
                this.ctx.arc(9 * (this.canvas.width / 20), (this.canvas.height / 20), Math.abs((this.canvas.width / 20) - 40), 0.5 * Math.PI, 1.5 * Math.PI);
                this.ctx.fill();
                this.ctx.beginPath();
                this.ctx.fillStyle = 'rgba(102, 167, 197,1)';
                this.ctx.rect(10 * (this.canvas.width / 20) + 25, 39, (this.canvas.width / 20) - 40, (this.canvas.width / 10) - 80);
                this.ctx.fill();

            }

        } else {
            if (this.leftBlueSquare) {
                this.ctx.beginPath();
                this.ctx.fillStyle = 'rgba(102, 167, 197,1)';
                this.ctx.arc(9 * (this.canvas.width / 20) - 1, (this.canvas.height / 20), Math.abs((this.canvas.width / 20) - 40), Math.PI / 2, 1.5 * Math.PI);
                this.ctx.rect(4 * (this.canvas.width / 10) + 42, 38, (this.canvas.width / 20) - 40, (this.canvas.width / 10) - 80);
                this.ctx.fill();

                this.ctx.beginPath();
                this.ctx.fillStyle = 'rgba(238, 50, 51, 1)';
                this.ctx.arc(11 * (this.canvas.width / 20), (this.canvas.height / 20), Math.abs((this.canvas.width / 20) - 40), Math.PI / 2, 1.5 * Math.PI);
                this.ctx.rect(5 * (this.canvas.width / 10) + 42, 38, (this.canvas.width / 20) - 40, (this.canvas.width / 10) - 80);
                this.ctx.fill();

            } else {
                this.ctx.beginPath();
                this.ctx.fillStyle = 'rgba(102, 167, 197,1)';
                this.ctx.arc(11 * (this.canvas.width / 20), (this.canvas.height / 20), Math.abs((this.canvas.width / 20) - 40), Math.PI / 2, 1.5 * Math.PI);
                this.ctx.rect(5 * (this.canvas.width / 10) + 42, 38, (this.canvas.width / 20) - 40, (this.canvas.width / 10) - 80);
                this.ctx.fill();

                this.ctx.beginPath();
                this.ctx.fillStyle = 'rgba(238, 50, 51, 1)';
                this.ctx.arc(9 * (this.canvas.width / 20) - 1, (this.canvas.height / 20), Math.abs((this.canvas.width / 20) - 40), Math.PI / 2, 1.5 * Math.PI);
                this.ctx.rect(4 * (this.canvas.width / 10) + 42, 38, (this.canvas.width / 20) - 40, (this.canvas.width / 10) - 80);
                this.ctx.fill();
            }
        }

        // Game over
        if (this.gameOverProgress !== null) {
            const easedProgress = Easing.easeInCubic(this.gameOverProgress);

            // Dark overlay
            this.ctx.beginPath();
            this.ctx.rect(0, 0, this.canvas.width, this.canvas.height);
            const overlayOpacity = easedProgress * 0.6;
            this.ctx.fillStyle = `rgba(0, 0, 0, ${overlayOpacity}`;
            this.ctx.fill();

            // Game finished text
            const fontSize = 144 - 120 * easedProgress;
            this.ctx.beginPath();
            this.ctx.fillStyle = `rgba(255, 255, 255, ${easedProgress})`;
            this.ctx.font = `${fontSize}px Helvetica`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('Game Finished!', this.canvas.width / 2, this.canvas.height / 2);

            // Game finished flag
            this.ctx.beginPath();
            this.ctx.save();
            this.ctx.globalAlpha = easedProgress;
            const flagLen = 48;
            this.ctx.drawImage(this.flagImage, (this.canvas.width - flagLen) / 2, (this.canvas.width - flagLen) / 2 - 60, flagLen, flagLen);
            this.ctx.restore();
        }
    }

    // The main game loop
    main() {
        const now = Date.now();
        const delta = now - this.then;

        this.update(delta / 1000);
        this.render();

        this.then = now;

        // Cross-browser support for requestAnimationFrame
        const w = window;
        const requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

        // Request to do this again ASAP
        requestAnimationFrame(this.main.bind(this));
    }

    handleClick(jqEvent) {
        const isLeftClick = jqEvent.type === 'click';
        const coords = this.extractCoords(jqEvent);
        const hit = this.findHit(coords);
        if (hit) {
            if (this.discriminateOn === 'shape') {
                if (hit.shapeType === 'square') {
                    if (isLeftClick && this.leftBlueSquare || (!isLeftClick && !this.leftBlueSquare)) {
                        hit.visible = false;
                        this.recordEvent('goodHitSquare');
                    } else {
                        this.recordEvent('badHitSquare');
                    }
                } else {
                    if (isLeftClick && !this.leftBlueSquare || (!isLeftClick && this.leftBlueSquare)) {
                        hit.visible = false;
                        this.recordEvent('goodHitCircle');
                    } else {
                        this.recordEvent('badHitCircle');
                    }
                }
            } else {
                if (hit.colour === 'blue') {
                    if (isLeftClick && this.leftBlueSquare || (!isLeftClick && !this.leftBlueSquare)) {
                        hit.visible = false;
                        this.recordEvent('goodHitBlue');
                    } else {
                        this.recordEvent('badHitBlue');
                    }
                } else {
                    if (isLeftClick && !this.leftBlueSquare || (!isLeftClick && this.leftBlueSquare)) {
                        hit.visible = false;
                        this.recordEvent('goodHitRed');
                    } else {
                        this.recordEvent('badHitRed');
                    }
                }
            }
        } else {
            this.recordEvent(isLeftClick ? 'noLeftHit' : 'noRightHit');
        }
    }
}

// Let's play this game!
const clicker = new Clicker('clicker', !!$('#is-practice').length);
// clicker.nextRound();
clicker.main();
