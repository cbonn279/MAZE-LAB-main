//LLMs were used for a few function, view the chat log here: https://gemini.google.com/share/fe7fd7289a33
class HealthBar {
    constructor(scene, x, y) {
        this.bar = new Phaser.GameObjects.Graphics(scene);
        this.gameManager = game.scene.getScene('GameManager');

        this.x = x;
        this.y = y;
        this.value = this.gameManager.battery;
        this.maxHealthbarSize = 246;
        this.p = this.maxHealthbarSize / 100;

        this.draw();

        scene.add.existing(this.bar);
    }

    decrease(amount) {
        this.value -= amount;
        this.gameManager.battery = this.value;

        if (this.value < 0) {
            this.value = 0;
        }

        this.draw();

        return (this.value === 0);
    }
    //increase amount for button - taylor
    increase(amount) {
        this.value += amount;

        if (this.value > 100) {
            this.value = 100;
        }

        this.draw();
    }

    draw() {
        this.bar.clear();

        //  BG
        this.bar.fillStyle(0x000000);
        this.bar.fillRect(this.x, this.y, 250, 16);

        //  Health

        this.bar.fillStyle(0xffffff);
        this.bar.fillRect(this.x + 2, this.y + 2, this.maxHealthbarSize, 12);

        if (this.value < 30) {
            this.bar.fillStyle(0xff0000);
        }
        else {
            this.bar.fillStyle(0x00ff00);
        }

        var d = Math.floor(this.p * this.value);

        this.bar.fillRect(this.x + 2, this.y + 2, d, 12);
    }

}

class Maze extends Phaser.Scene {
    constructor() {
        super("mazeScene");
    }

    preload() {
        //this.load.audio("MazeMusic", "../assets/audio/ethicsPendingBGM.wav");
        // this.load.audio("Static", "../assets/audio/static.mp3");
    }

    init() {
        this.TILESIZE = 16;
        this.SCALE = 1;
        // below is the size of the tilemap in tiles
        this.TILEWIDTH = 16;
        this.TILEHEIGHT = 16;
        this.gameManager = game.scene.getScene('GameManager');
        this.drugUI = game.scene.getScene('MainUI');
    }

    create() {
        this.map = this.add.tilemap("TestingMaze", this.TILESIZE, this.TILESIZE, this.TILEHEIGHT, this.TILEWIDTH);
        this.registry.set('lightsOff', false);
        // Add a tileset to the map
        //this.tileset = this.map.addTilesetImage("TESTING TILESET FOR MAZE", "maze_tiles");
        this.tileset = this.map.addTilesetImage("UpdatedTileset", "new_maze_tiles");

        // Create the layers
        this.groundLayer = this.map.createLayer("Ground", this.tileset, 0, 0);
        this.wallLayer = this.map.createLayer("MazeWalls", this.tileset, 0, 0);

        // Black Screen
        const blankLayer = this.map.getLayer("BlankScreen");
        if (blankLayer) {
            const layerData = this.map.images.find(layer => layer.name === "BlankScreen");
            this.blackScreen = this.map.createLayer("BlankScreen", this.tileset, 0, 0);
            if (layerData) {
                this.blackScreen = this.add.image(layerData.x, layerData.y, "blackScreen");
                this.blackScreen.setOrigin(0, 0);
                this.blackScreen.setVisible(false);
            }
        } else {
            this.blackScreen = this.add.container();
        }

        // Camera settings
        // holy shit i should've found out that i could've changed the maze position using this earlier 
        this.cameras.main.setBounds(1, -3.5, this.map.widthInPixels, this.map.heightInPixels); 
        this.cameras.main.setZoom(this.SCALE);

        // Create grid of visible tiles for use with path planning
        let tinyTownGrid = this.layersToGrid([this.groundLayer, this.wallLayer]);

        //18: GREY TILES | 36: GOAL TILES (stairs) | 370: THINKING TILES (green tiles) | 0: EMPTY TILES (just in case)
        //let walkables = [18, 36, 0, 370]; //old walkables for old tilset
        
        //401: BLACK TILES | 403: GOAL TILES | 402: THINKING TILES | 0: EMPTY TILES (just in case)
        this.walkables = [401, 403, 0, 402];

        this.finder = new EasyStar.js();
        this.finder.setGrid(tinyTownGrid);

        this.finder.setAcceptableTiles(this.walkables);

        this.pointMap = new Map()
        let pointMapIndex = 0;

        this.groundLayer.setCollisionByProperty({
            GOAL: true
        });

        this.groundLayer.forEachTile(tile => {
            if (tile.properties.GOAL) {
                this.pointMap.set(`GOAL${pointMapIndex}`, { x: tile.x, y: tile.y });
                console.log(`stored GOAL${pointMapIndex} at point ${tile.x}, ${tile.y}`);
                pointMapIndex++;
            }
        })

        this.startingLocation = { x: this.tileXtoWorld(1), y: this.tileYtoWorld(10) }
        this.startingLocation2 = { x: this.tileXtoWorld(15), y: this.tileYtoWorld(13) }

        // set up goal item
        this.goal = new Goal(this);

        // create lobster sprite
        my.sprite.lobster = new Animal(this, this.startingLocation2.x, this.startingLocation2.y, "Lobster", null, this.map).setOrigin(0, 0);

        this.activeCharacter = my.sprite.lobster;

        this.physics.add.overlap(this.activeCharacter, this.groundLayer, this.TileEffecthandler, null, this);

        this.initiatePath(); //start animal pathfinding and movement

        //Health bar spawns using lobster spawn location as basis (will change)
        this.HP = new HealthBar(this, this.startingLocation.x + 100, this.startingLocation.y + 214);

        // health bar goes down over time - taylor

        this.healthDeplete = this.time.addEvent({
            delay: 575, //this value can also be adjusted to change health drain
            callback: () => {
                const isEmpty = this.HP.decrease(2 * this.activeCharacter.getHealthDrainMultiplier());
                if (isEmpty) {
                    if (!this.healthDeplete.paused) {
                        this.hideScreen(this.activeCharacter);
                    }
                    this.healthDeplete.paused = true;
                }
            },
            callbackScope: this,
            loop: true
        });

        // BGM setup
        this.mazeBGM = this.sound.add("MazeMusic", { loop: true, volume: 0.3 });
        this.blackBGM = this.sound.add("Static", { loop: true, volume: 5 });

    }

    wallBreak(){
        this.walkables = [401, 403, 402, 404]; //404 is the walls
        this.finder.setAcceptableTiles(this.walkables);
    }

    exitWallBreak(){
        this.walkables = [401, 403, 402];
        this.finder.setAcceptableTiles(this.walkables);
    }


    tileXtoWorld(tileX) {
        return tileX * this.TILESIZE;
    }

    tileYtoWorld(tileY) {
        return tileY * this.TILESIZE;
    }

    layersToGrid(arr) {
        let grid = [];
        for (let y = 0; y < this.map.height; y++) {
            grid[y] = [];
            for (let x = 0; x < this.map.width; x++) {
                grid[y][x] = -1;
            }
        }
        for (let i = 0; i < arr.length; i++) {
            for (let y = 0; y < this.map.height; y++) {
                for (let x = 0; x < this.map.width; x++) {
                    let tile = arr[i].getTileAt(x, y);
                    if (tile) {
                        grid[y][x] = tile.index
                    }
                }
            }
        }
        return grid;
    }

    //Selects one of the goals at random whenever this function is called
    chooseGoal() {
        let goalNum = Math.floor(Math.random() * this.pointMap.size)
        let Goal = {
            Goal: goalNum,
            x: this.pointMap.get(`GOAL${goalNum}`).x,
            y: this.pointMap.get(`GOAL${goalNum}`).y
        }
        return Goal
    }

    //Finds a path and then immediately lets the animal start moving
    initiatePath() {
        let Goal = this.chooseGoal();
        var fromX = Math.floor(this.activeCharacter.x / this.TILESIZE);
        var fromY = Math.floor(this.activeCharacter.y / this.TILESIZE);
        let goalX = Goal.x;
        let goalY = Goal.y;

        // update goal sprite position
        this.goal.setPosition(goalX, goalY);

        console.log('going from (' + fromX + ',' + fromY + ') to (' + goalX + ',' + goalY + ')');

        this.finder.findPath(fromX, fromY, goalX, goalY, (path) => {
            if (path === null) {
                console.warn("Path was not found.");
            } else {
                //console.log(path);
                this.activeCharacter.statemachine.transition("Moving", path);
            }
        });
        this.finder.calculate();
    }

    hideScreen(player) {
        player.x = this.startingLocation2.x;
        player.y = this.startingLocation2.y;
        this.activeCharacter.activeTweens.stop();

        this.activeCharacter.setVisible(false);
        this.blackScreen.setVisible(true);
        this.scene.setVisible(false);

        // hide goal item
        this.goal.sprite.setVisible(false);

        //In some scenarios the lobster will still end up in the "moving" state while the screen is blank
        //And they are not moving. Right now there is no issues but could be an issue if other functionality is added
        //to the moving state while it's active
        this.activeCharacter.statemachine.transition("Thinking");
        
        this.sound.play("MazeScreenOff", {volume: 1.5});
        this.sound.play("FNAFPowerOff", {volume: 0.3});
        this.registry.set('lightsOff', true);
        console.log("lightsOff set to false in registry");
        this.mazeBGM.stop();
        this.blackBGM.play();
        this.scene.sleep(); 

        //follow mouse cursor with shadow
    }
    
    //this function is called by mini-game.js
    showScreen() {
        this.sound.play("MazeScreenOn");
        this.scene.wake();
        this.activeCharacter.setVisible(true);
        this.blackScreen.setVisible(false);
        this.scene.setVisible(true);

        this.registry.set('lightsOff', false);
        console.log("lightsOff set to true in registry");
        // show goal item
        this.goal.sprite.setVisible(true);
        this.mazeBGM.play();
        this.blackBGM.stop();
        this.resetCharacter(this.activeCharacter);
    }

    resetCharacter(player) {
        player.x = this.startingLocation2.x;
        player.y = this.startingLocation2.y;
        //sets a new goal
        this.initiatePath();
        //prevents multiple tweens from occuring (no buggy looking movement)
        this.activeCharacter.activeTweens.stop();
    }

    //pulled from past project
    async TileEffecthandler(player, tile) {
        if (tile.properties.GOAL) {
            console.log("reached goal");
            this.gameManager.money += this.activeCharacter.getRandomNumber(this.activeCharacter.minCompleteMoney, this.activeCharacter.maxCompleteMoney);
            console.log(this.gameManager.money);
            this.sound.play("GetMoney");
            //resets to starting location
            this.resetCharacter(player)
        }
        

        if (tile.properties.THINKING) {

            // detecting tile for combos
            if (this.activeCharacter.currentCombo === "highmeds") {
                this.activeCharacter.onThinkingTile = true;

                this.time.delayedCall(500, () => {
                    this.activeCharacter.onThinkingTile = false;
                });

                return; 
            }

            if (this.activeCharacter.statemachine.state === "Moving") {
                tile.properties.THINKING = false;
                this.activeCharacter.statemachine.transition("Thinking");
                //thinking tiles turn themselves off for the characters thinking time + 2s in order to prevent the lobster 
                //from being stuck thinking on the same tile for so long
                this.time.delayedCall((this.activeCharacter.thinkingTime + 2000), () => {
                    tile.properties.THINKING = true;
                }, null, this);
            }
        }
    }

    update(time, delta) {
        this.goal.update(time, delta);
    }
}
