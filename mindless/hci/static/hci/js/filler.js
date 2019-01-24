class FillerGameShape {
    constructor(x, y, shapeArray) {
        this.x = x;
        this.y = y;
        this.shapeArray = shapeArray;
        this.transition = 1.0;
        this.hoverTransition = 0.0;
    }
}

class Filler {
    constructor(canvasId, is_practice, numShapes = 8, shapeSize = 80, canvasPadding = 20, shapePadding = 10) {
        // Create the canvas
        this.start = Date.now();
        this.then = Date.now();
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.shapeSize = shapeSize;
        this.rounds = (is_practice ? 1 : 2) + 1;
        this.hoverShape = null;
        this.clickedShape = null;
        this.roundFinished = false;
        this.canvasPadding = canvasPadding;
        this.shapePadding = shapePadding;


        $(this.canvas).mouseout(() => {
            this.recordEvent('mouseOut');
            $(this.canvas).fadeTo(100, 0.3);
        });

        $(this.canvas).mouseover(() => {
            this.recordEvent('mouseIn');
            $(this.canvas).fadeTo(100, 1);
        });

        $(this.canvas).mousedown((jqEvent) => this.handleClick(jqEvent, true, false));
        $(this.canvas).mouseup((jqEvent) => this.handleClick(jqEvent, false, false));
        $(this.canvas).contextmenu((jqEvent) => this.handleClick(jqEvent, false, true));
        $(this.canvas).mousemove((jqEvent) => this.handleMouseMove(jqEvent));

        // Game objects
        this.events = {};
        this.numShapes = numShapes;
        this.addRandomShapes();
    }

    //ALTERED
    addRandomShapes() {
        this.shapes = [];

        for (let i = 0; i < this.numShapes; i++) {
            let newShapeX = this.canvasPadding + (this.shapePadding * 2 + this.shapeSize) * (Math.floor(i / 4)) + this.shapePadding + this.shapeSize / 2;
            let newShapeY = this.canvasPadding + (this.shapePadding * 2 + this.shapeSize) * (i % 4) + this.shapePadding + this.shapeSize / 2;

            let blockStack = [];
            let numBlocks = 0;
            let shapeArray = new Array(4);

            // One for one visual representation of the blocks that the shape contains
            // e.g. if you draw a 4x4 grid, then elements in the shape array are true if the shape covers them.
            shapeArray = [[false, false, false, false],
                [false, false, false, false],
                [false, false, false, false],
                [false, false, false, false]];

            let maximumBlockSize = Math.floor(4 * Math.random());
            shapeArray[Math.floor(maximumBlockSize / 2)][1 + maximumBlockSize % 2] = true;
            blockStack.push([Math.floor(maximumBlockSize / 2), 1 + maximumBlockSize % 2]);
            numBlocks++;

            do {
                let block = blockStack.pop();
                const canPlaceBlockLeft = block[0] > 0 && !shapeArray[block[0] - 1][block[1]] && (Math.random() < (2 / numBlocks));
                if (canPlaceBlockLeft) {
                    shapeArray[block[0] - 1][block[1]] = true;
                    numBlocks++;
                    blockStack.push([block[0] - 1, block[1]]);
                }
                const canPlaceBlockAbove = block[1] > 0 && !shapeArray[block[0]][block[1] - 1] && (Math.random() < (2 / numBlocks));
                if (canPlaceBlockAbove) {
                    shapeArray[block[0]][block[1] - 1] = true;
                    numBlocks++;
                    blockStack.push([block[0], block[1] - 1]);
                }
                const canPlaceBlockRight = block[0] < 3 && !shapeArray[block[0] + 1][block[1]] && (Math.random() < (2 / numBlocks));
                if (canPlaceBlockRight) {
                    shapeArray[block[0] + 1][block[1]] = true;
                    numBlocks++;
                    blockStack.push([block[0] + 1, block[1]]);
                }
                const canPlaceBlockBelow = block[1] < 3 && !shapeArray[block[0]][block[1] + 1] && (Math.random() < (2 / numBlocks));
                if (canPlaceBlockBelow) {
                    shapeArray[block[0]][block[1] + 1] = true;
                    numBlocks++;
                    blockStack.push([block[0], block[1] + 1]);
                }
            } while (blockStack.length > 0);

            this.shapes.push(new FillerGameShape(newShapeX, newShapeY, shapeArray));
        }
    }

    // Create outline to fit shapes into
    constructMap(shapes) {
        let tempshapeList = shapes.slice();
        let shapeList = new Array(tempshapeList.length);
        let idx = 0;
        while (tempshapeList.length > 0) {
            // Randomise shape list
            let i = Math.floor(Math.random() * tempshapeList.length);
            shapeList[idx] = tempshapeList[i];
            idx++;
            tempshapeList = tempshapeList.slice(0, i).concat(tempshapeList.slice(i + 1));
        }

        // Create map
        this.map = new Array(shapeList.length * 2);
        for (let i = 0; i < this.map.length; i++) {
            this.map[i] = new Array(shapeList.length * 2).fill(false);
        }

        // Iterate through map for empty space
        for (let i = 0; i < this.map.length; i++) {
            for (let j = 0; j < this.map[i].length; j++) {
                if (this.map[i][j]) {
                    continue;
                }
                let listCopy = shapeList.slice();
                while (listCopy.length > 0) {
                    //try adding a candidate
                    let shape = listCopy.pop();
                    if (!Filler.checkFitAndFill(shape, this.map, [i, j])) {
                        continue;
                    }
                    if (shapeList.length === 1) {
                        return true;
                    }
                    for (let k = 0; k < shapeList.length; k++) {
                        if (shapeList[k] !== shape) {
                            continue;
                        }
                        if (k === shapeList.length - 1) {
                            shapeList = shapeList.slice(0, k);
                        } else if (k === 0) {
                            shapeList = shapeList.slice(1);
                        } else {
                            shapeList = shapeList.slice(0, k).concat(shapeList.slice(k + 1));
                        }
                    }
                }
            }
        }
        return false;
    }

    // Checks if a shape fits into the position trying to be allocated in the map
    // If a shape fits, place it in the desired location.
    // This is used when building a map.
    static checkFitAndFill(shape, map, indices) {
        for (let i = 0; i < shape.shapeArray.length; i++) {
            for (let j = 0; j < shape.shapeArray[i].length; j++) {
                if ((
                    (i + indices[0]) >= map.length ||
                    (j + indices[1]) >= map[i + indices[0]].length
                ) && shape.shapeArray[i][j]) {
                    return false;
                } else if (shape.shapeArray[i][j] && map[(i + indices[0])][(j + indices[1])]) {
                    return false;
                }
            }
        }
        for (let i = 0; i < shape.shapeArray.length; i++) {
            for (let j = 0; j < shape.shapeArray[i].length; j++) {
                if (shape.shapeArray[i][j]) {
                    map[i + indices[0]][j + indices[1]] = true;
                }
            }
        }
        return true;
    }

    // Denote that an event occured within the game, such as an incorrect click, and log this for final output.
    recordEvent(eventCode) {
        this.events[Date.now() - this.start] = eventCode;
    }

    // Gets the coordinate of a mouse click or other event
    extractCoords(jqEvent) {
        jqEvent.preventDefault();
        return {
            x: jqEvent.pageX - $(this.canvas).offset().left,
            y: jqEvent.pageY - $(this.canvas).offset().top
        };
    }

    // Handle dragging shapes
    handleMouseMove(jqEvent) {
        const coords = this.extractCoords(jqEvent);
        if (this.clickedShape) {
            // If we're holding a shape, keep the shape attached to the mouse.
            let xMapDistanceFromTopLeft = this.shapeSize * 2 + this.shapePadding * 4 + this.canvasPadding + 40;
            let yMapDistanceFromTopLeft = this.canvasPadding + this.shapePadding;
            const isMouseOverMap = coords.x >= (xMapDistanceFromTopLeft) && coords.y >= (yMapDistanceFromTopLeft);
            if (isMouseOverMap) {
                // If mouse is over map, then we snap the shape to the map grid.
                this.clickedShape.x = coords.x - ((coords.x - xMapDistanceFromTopLeft) % (this.shapeSize / 4));
                this.clickedShape.y = coords.y - ((coords.y - yMapDistanceFromTopLeft) % (this.shapeSize / 4));
            } else {
                // Otherwise, shape stays as free-floating object.
                this.clickedShape.x = coords.x;
                this.clickedShape.y = coords.y;
            }
        }
    }

    // Handle unique outline of shapes when determining if shapes are correctly placed on the map.
    findHit(coords, padding = 10) {
        for (let obj of this.shapes) {
            let shapeHalfLength = this.shapeSize / 2 + padding;
            if (!(coords.x <= (obj.x + shapeHalfLength)
                && coords.x >= (obj.x - shapeHalfLength)
                && coords.y <= (obj.y + shapeHalfLength)
                && coords.y >= (obj.y - shapeHalfLength))) {
                continue;
            }
            for (let i = 0; i < obj.shapeArray.length; i++) {
                const isShapeDroppedOutsideX = !(coords.x >= (obj.x + (i - 2) * this.shapeSize / 4)
                    && coords.x <= (obj.x + (i - 2) * this.shapeSize / 4) + this.shapeSize / 4);
                if (isShapeDroppedOutsideX) {
                    continue;
                }
                for (let j = 0; j < obj.shapeArray[i].length; j++) {
                    const isBlockHere = obj.shapeArray[i][j];
                    const isShapeDroppedInsideY = coords.y >= obj.y + ((j - 2) * this.shapeSize / 4) && coords.y <= obj.y + ((j - 2) * this.shapeSize / 4) + this.shapeSize / 4;
                    if (isBlockHere && isShapeDroppedInsideY) {
                        return obj;
                    }
                }

            }
        }

        return null;
    }

    // Reset when round of the game is over
    nextRound() {
        if (--this.rounds > 0) {
            this.roundFinished = false;
            this.addRandomShapes();
            while (!this.constructMap(this.shapes)) {
                // If we didn't succeed at generating a valid map, make new shapes and try again.
                this.addRandomShapes();
            }
            this.emptyMap = this.map.map(function (arr) {
                // Make a deep copy of the map
                return arr.slice();
            });
        } else {
            this.finishGame();
        }
    }

    finishGame() {
        this.recordEvent('gameComplete');
        $('#filler-data').val(JSON.stringify(this.events)).change();
    }

    update() {
        if (this.roundFinished && this.rounds > 0) {
            this.recordEvent('roundComplete');
            this.nextRound();
        }
    }

    // Draw everything
    render() {
        let blockSize = this.shapeSize / 4;
        this.drawBackground();
        this.drawMap(blockSize);
        this.drawShapes(blockSize);
        this.drawScore();
    }

    drawScore() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.font = '18px Helvetica';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText('Remaining Screens: ' + this.rounds, 8, 8);
    }

    drawShapes(blockSize) {
        for (let shape of this.shapes) {

            this.ctx.beginPath();
            for (let i = 0; i < shape.shapeArray.length; i++) {
                for (let j = 0; j < shape.shapeArray[i].length; j++) {
                    if (!shape.shapeArray[i][j]) {
                        continue;
                    }
                    let x = (shape.x + (i - 2) * blockSize);
                    let y = shape.y + ((j - 2) * blockSize);
                    let w = blockSize;
                    let h = blockSize;
                    this.ctx.rect(x, y, w, h);
                }
            }
            this.ctx.fillStyle = 'rgba(238, 50, 51, 1)';
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
            this.ctx.fill();
        }
        this.ctx.beginPath();
        const shapeTrayRightEdge = this.shapeSize * 2 + this.shapePadding * 4 + this.canvasPadding + 20;
        this.ctx.moveTo(shapeTrayRightEdge, 0);
        this.ctx.lineTo(shapeTrayRightEdge, this.canvas.height);
        this.ctx.stroke();
    }

    drawMap(blockSize) {
        for (let i = 0; i < this.map.length; i++) {
            for (let j = 0; j < this.map[i].length; j++) {
                if (!this.map[i][j]) {
                    continue;
                }
                this.ctx.beginPath();
                const mapBlockX = this.shapeSize * 2 + this.shapePadding * 4 + this.canvasPadding + 40 + i * blockSize;
                const mapBlockY = this.canvasPadding + this.shapePadding + j * blockSize;
                this.ctx.rect(mapBlockX, mapBlockY, blockSize, blockSize);
                this.ctx.fillStyle = 'rgba(50, 50, 50, 1)';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
                this.ctx.fill();
            }

        }
    }

    drawBackground() {
        let backgroundGradient = this.ctx.createRadialGradient(this.canvas.width / 2, this.canvas.height / 2, 0.000,
            this.canvas.width / 2, this.canvas.height / 2, this.canvas.height);

        backgroundGradient.addColorStop(0.000, 'rgba(235, 235, 235, 1.000)');
        backgroundGradient.addColorStop(1.000, 'rgba(205, 205, 205, 1.000)');
        this.ctx.fillStyle = backgroundGradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // The main game loop
    main() {
        this.update();
        this.render();

        // Cross-browser support for requestAnimationFrame
        const w = window;
        const requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

        // Request to do this again ASAP
        requestAnimationFrame(this.main.bind(this));
    }

    //Altered
    handleClick(jqEvent, isMouseDown, isRightClick) {
        if (isRightClick) {
            // We should never right click in this game
            this.recordEvent('incorrectRightClick');
            return;
        }

        let blockSize = this.shapeSize / 4;
        let xAdjust = this.shapeSize * 2 + this.shapePadding * 4 + this.canvasPadding + 40;
        let yAdjust = this.canvasPadding + this.shapePadding;
        const shapeReleased = !isMouseDown && this.clickedShape;
        if (shapeReleased) {
            const shapeOverMap = this.clickedShape.x >= xAdjust && this.clickedShape.y >= yAdjust;
            if (shapeOverMap) {
                let mapWhereShapeDroppedX = Math.floor((this.clickedShape.x - xAdjust - 2 * blockSize - ((this.clickedShape.x - xAdjust) % blockSize)) / blockSize);
                let mapWhereShapeDroppedY = Math.floor((this.clickedShape.y - yAdjust - 2 * blockSize - ((this.clickedShape.y - yAdjust) % (blockSize))) / blockSize);
                let validDrop = true;
                // Loop through map blocks in X-direction
                for (let i = 0; i < this.clickedShape.shapeArray.length; i++) {
                    if (!validDrop) {
                        break;
                    }
                    
                    // Loop through map blocks in Y-direction
                    for (let j = 0; j < this.clickedShape.shapeArray[i].length; j++) {
                        // If invalid spot (in order: outside on right, outside underneath,
                        // already occupied/empty square) then label invalid.
                        if ((i + mapWhereShapeDroppedX) >= this.emptyMap.length || (j + mapWhereShapeDroppedY) >= this.emptyMap[i + mapWhereShapeDroppedX].length || (this.clickedShape.shapeArray[i][j] && !this.emptyMap[i + mapWhereShapeDroppedX][j + mapWhereShapeDroppedY])) {
                            if(this.clickedShape.shapeArray[i][j]) {
                                validDrop = false;
                                break;
                            }
                        }
                    }
                }

                // If drop invalid, offset block off-centre.
                // A shape will move half-block down and a half-block right so that the user can see that their action
                // was invalid.
                if (!validDrop) {
                    this.clickedShape.x = this.clickedShape.x + blockSize / 2;
                    this.clickedShape.y = this.clickedShape.y + blockSize / 2;
                    this.recordEvent('dropshapeInvalid');
                } else {
                    // Confirmed valid position
                    // Loop through map blocks in X-direction
                    for (let i = 0; i < this.clickedShape.shapeArray.length; i++) {
                        // Loop through map blocks in Y-direction
                        for (let j = 0; j < this.clickedShape.shapeArray[i].length; j++) {
                            const shapeHasBlockInSection = this.clickedShape.shapeArray[i][j];
                            if (shapeHasBlockInSection) {
                                // Fill the section
                                this.emptyMap[i + mapWhereShapeDroppedX][j + mapWhereShapeDroppedY] = false;
                            }
                        }
                    }
                    let completeMap = true;

                    // Loop through shape allocations on map to check if remaining slots are to be filled.
                    // If not, we've finished the round.
                    for (let i = 0; i < this.emptyMap.length; i++) {
                        for (let j = 0; j < this.emptyMap[i].length; j++) {
                            if (this.emptyMap[i][j]) {
                                completeMap = false;
                            }
                        }
                    }
                    if (completeMap) {
                        this.roundFinished = true;
                    }
                    this.recordEvent('dropshapeValid');
                }

            }
            this.clickedShape = null;
        }
        // If a mousedown...
        else {
            const coords = this.extractCoords(jqEvent);
            const hit = this.findHit(coords);
            if (hit) {
                const isHitInsideMap = hit.x >= xAdjust && hit.y >= yAdjust;
                const hasHitBlockBeenPlaced = ((hit.x - xAdjust) % blockSize) === 0 && ((hit.y - yAdjust) % blockSize) === 0;
                if (isHitInsideMap && hasHitBlockBeenPlaced) {
                    let mapX = Math.floor((hit.x - xAdjust - 2 * blockSize - ((hit.x - xAdjust) % blockSize)) / blockSize);
                    let mapY = Math.floor((hit.y - yAdjust - 2 * blockSize - ((hit.y - yAdjust) % (blockSize))) / blockSize);
                    // Iterate over X of shape array of clicked object
                    for (let i = 0; i < hit.shapeArray.length; i++) {
                        // Iterate over Y of shape array of clicked object
                        for (let j = 0; j < hit.shapeArray[i].length; j++) {
                            const playerPickedUpShape = hit.shapeArray[i][j];
                            if (playerPickedUpShape) {
                                // Remove this shape from the empty map, because the player has picked it up.
                                this.emptyMap[i + mapX][j + mapY] = true;
                            }
                        }
                    }
                    this.recordEvent('pickUpPlacedShape');
                    this.clickedShape = hit;
                } else {
                    this.recordEvent('pickUpUnplacedShape');
                    this.clickedShape = hit;
                }
            } else {
                this.recordEvent('noHitLeft');
            }
        }
    }
}

// Let's play this game!
const filler = new Filler('filler', !!$('#is-practice').length);
filler.nextRound();
filler.main();
