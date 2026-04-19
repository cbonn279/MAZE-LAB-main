class Animal extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame, map) {
        super(scene, x, y, texture, frame);
        this.Maze = scene.scene.get('mazeScene');
        this.miniGame = scene.scene.get('MiniGame');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // base stats
        this.baseStats = {
            speed: 600,
            thinkingTime: 2000,
            maxCompleteMoney:  1, // random number betw
            minCompleteMoney:  3, // random number betw
            wallbreak: false
        }; 

        // sprites
        this.drugSprites = {
            high: "LobsterHigh",
            crack: "LobsterCrack",
            trip: "LobsterTrip",
            meds: "LobsterMeds",
            hc: "LobsterHC",
            ht: "LobsterHT",
            hm: "LobsterHM",
            ct: "LobsterCT",
            cm: "LobsterCM",
            tm: "LobsterTM"
        };
        this.baseTexture = "Lobster";

        // drug system
        this.drugs = {
            high: {
                key: "high",
                active: false,
                unlocked: false
            },

            crack: {
                key: "crack",
                active: false,
                unlocked: false,
            },

            trip: {
                key: "trip",
                active: false,
                unlocked: false,
            },

            meds: {
                key: "meds",
                active: false,
                unlocked: false,
            }
        };

        // drug array
        this.activeDrugs = [];
      
        //this.Path = path;
        this.mapref = map;
        this.ignoreTile = false;
        this.lastPos = new Phaser.Math.Vector2(x, y);
        // this.direction = 1;

        // update active drug
        scene.events.on('update', this.updateDrugs, this);

        // keyboard testing
        this.keys = scene.input.keyboard.addKeys({
            one: Phaser.Input.Keyboard.KeyCodes.ONE,
            two: Phaser.Input.Keyboard.KeyCodes.TWO,
            three: Phaser.Input.Keyboard.KeyCodes.THREE,
            four: Phaser.Input.Keyboard.KeyCodes.FOUR
        });

        // movement state machine
        this.statemachine = new StateMachine('Moving',
            {
                Moving: new MoveState(),
                Thinking: new ThinkingState()
            },
            [this]);

        return this;
    }

    // maze pathing
    moveCharacter(character, path) {
        var movementTweens = [];
        for (var i = 0; i < path.length - 1; i++) {
            var ex = path[i + 1].x;
            var ey = path[i + 1].y;
            movementTweens.push({
                x: ex * this.mapref.tileWidth,
                y: ey * this.mapref.tileHeight,
                duration: this.baseStats.speed
            });
        }
        this.activeTweens = this.scene.tweens.chain({
            targets: character,
            tweens: movementTweens
        });
    }

    getRandomNumber(min, max){
        return Math.floor(Math.random() * (max - min) ) + min;
    }
    // update speed stats during set tween pathing
    updateTweenSpeed() {
        if (!this.activeTweens) return;

        this.activeTweens.setTimeScale(this.currentSpeedMultiplier);
    }

    // activate drugs
    activateDrugs(key) {
        const drug = this.drugs[key];
        if (!drug.unlocked) return;

        // toggle off
        if (drug.active) {
            console.log(`${key} off`);
            this.deactivateDrugs(drug);
            return;
        }

        // max 2 drugs
        if (this.activeDrugs.length >= 2) {
            console.log("max 2 drugs only");
            return;
        }

        this.miniGame.sound.play("DrugActivate");
        // toggle on
        drug.active = true;
        console.log(`${key} on`)
        this.activeDrugs.push(drug);

    }

    // deactivate drugs
    deactivateDrugs(drug) {
        drug.active = false;

        // deactivate wallbreak when crack or trip is removed from the combo (i dont know a better way)
        if (drug.key == "crack" || drug.key == "trip"){
            console.log(drug)
            if (this.wallbreak){
                this.Maze.exitWallBreak();
                this.wallbreak = false;
                console.log(this.wallbreak)
            }
        }

        // specify drug
        this.activeDrugs = this.activeDrugs.filter(d => d !== drug);
        this.spriteIndex = 0; 
    }
    

    // update
    updateDrugs(time, delta) {

        // make sure drugs are unlocked
        for (let key in this.drugs) {
            this.drugs[key].unlocked = window.drugUnlocks[key];
        }

        // key inputs (for now)
        if (Phaser.Input.Keyboard.JustDown(this.keys.one)) {
            this.activateDrugs("high");
        }
        if (Phaser.Input.Keyboard.JustDown(this.keys.two)) {
            this.activateDrugs("crack");
        }
        if (Phaser.Input.Keyboard.JustDown(this.keys.three)) {
            this.activateDrugs("trip");
        }
        if (Phaser.Input.Keyboard.JustDown(this.keys.four)) {
            this.activateDrugs("meds");
        }

        // apply effects
        this.applyDrugEffects();

        // sprites
        this.updateSprite(delta);
    }

    // set drugs qualities
    applyDrugEffects() {
        // reset values
        this.healthDrainMultiplier = 1;
        this.speed = this.baseStats.speed;
        this.thinkingTime = this.baseStats.thinkingTime;
        this.maxCompleteMoney = this.baseStats.maxCompleteMoney;
        this.minCompleteMoney = this.baseStats.minCompleteMoney;
        this.wallbreak = this.baseStats.wallbreak;
        this.healMultiplier = 1;
        let speedMultiplier = 1;

        // combo tracking
        const keys = this.activeDrugs.map(d => d.key).sort().join("");
        this.currentCombo = this.activeDrugs.length === 2 ? keys : null;
        

        this.activeDrugs.forEach(drug => {
            switch (drug.key) {
                case "high":
                    this.thinkingTime = 1100;
                    speedMultiplier *= 1.75;
                    this.maxCompleteMoney = 5;
                    this.minCompleteMoney = 3;
                    break;

                case "crack":
                    speedMultiplier *= 3;
                    this.maxCompleteMoney = 3;
                    this.minCompleteMoney = 10;
                    break;

                case "trip":
                    this.maxCompleteMoney = 15;
                    this.minCompleteMoney = 30;
                    break;

                case "meds":
                    speedMultiplier *= 0.85;
                    this.healMultiplier = 3;
                    this.maxCompleteMoney = 2;
                    this.minCompleteMoney = 2;
                    break;
                }
            });

        // combo effects
        switch (this.currentCombo) {

            case "crackhigh": 
                this.minCompleteMoney = 10;
                this.maxCompleteMoney = 70;
                this.thinkingTime = 100;
                speedMultiplier *= 4;
                this.healthDrainMultiplier = 4; 
                break;

            case "hightrip": 
                this.minCompleteMoney = 50;
                this.maxCompleteMoney = 80;
                this.thinkingTime = 600;
                this.healthDrainMultiplier = 1.5; 
                break;
                
                case "highmeds": 
                speedMultiplier *= 0.70;
                this.healMultiplier = 2;
                this.thinkingTime = 0;
                this.healthDrainMultiplier = 1.5;
                this.maxCompleteMoney = 60;
                this.minCompleteMoney = 80;
                break;
                
                case "cracktrip": 
                speedMultiplier *= 2.5;
                this.minCompleteMoney = 0;
                this.maxCompleteMoney = 100;
                this.healthDrainMultiplier = 2.5;
                this.wallbreak = true;
                this.Maze.wallBreak();
                break;
                
                case "crackmeds": 
                speedMultiplier *= 2;
                this.healMultiplier = 2;
                this.healthDrainMultiplier = 1.25;
                this.thinkingTime = 250;
                this.minCompleteMoney = 40;
                this.maxCompleteMoney = 60;
                break;

            case "medstrip": 
                speedMultiplier *= 0.20;
                this.maxCompleteMoney = 150;
                this.minCompleteMoney = 250;
                this.healMultiplier = 5;
                this.thinkingTime = 0;
                this.healthDrainMultiplier = 0.50;
                break;
        }

        // tile boost
        if (this.currentCombo === "highmeds" && this.onThinkingTile) {
            speedMultiplier *= 7; 
        }

        // speed check
        this.currentSpeedMultiplier = speedMultiplier;
        this.updateTweenSpeed();

        // heal increase
        if (this.miniGame) {
            this.miniGame.healAmount = this.healMultiplier || 1;
        }
    }

    updateSprite() {
        const count = this.activeDrugs.length;

        // no drugs
        if (count === 0) {
            this.setTexture(this.baseTexture);
            return;
        }

        // one drug
        if (count === 1) {
            const drug = this.activeDrugs[0];
            this.setTexture(this.drugSprites[drug.key]);
            return;
        }

        // two drug combos
        if (count === 2) {
            const keys = this.activeDrugs.map(d => d.key).sort().join("");

            switch (keys) {
                case "crackhigh":
                    this.setTexture(this.drugSprites.hc);
                    break;

                case "hightrip":
                    this.setTexture(this.drugSprites.ht);
                    break;

                case "highmeds":
                    this.setTexture(this.drugSprites.hm);
                    break;

                case "cracktrip":
                    this.setTexture(this.drugSprites.ct);
                    break;

                case "crackmeds":
                    this.setTexture(this.drugSprites.cm);
                    break;

                case "medstrip":
                    this.setTexture(this.drugSprites.tm);
                    break;
            }
        }
    }
    // extra health gain
    getHealMultiplier() {
        return this.healMultiplier || 1;
    }

    // extra health drain per drug
    getHealthDrainMultiplier() {
        return this.healthDrainMultiplier || Math.max(2, this.activeDrugs.length);
    }

}


// movement state classes
class MoveState extends State {
    enter(character, path) {
        //console.log("moving")
        //animation for moving
        if (path) {
            character.moveCharacter(character, path)
        }
        else {
            //had LLMs fix the below code
            if (character.activeTweens && character.activeTweens.callbacks) {
                character.activeTweens.resume();
            } 
        }
    }
}

class ThinkingState extends State {
    enter(character) {
        //animation for thinking
        //console.log("thinking");
        if (character.activeTweens) {
            character.activeTweens.pause();
        }
        character.scene.time.delayedCall(character.thinkingTime, () => { 
            character.statemachine.transition("Moving");
        }, null, this);
    }
}
