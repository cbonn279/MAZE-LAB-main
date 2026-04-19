class DrugContainer {
    constructor(scene, x, y, width = 80, height = 80, color = 0x448844, alpha = 0.1, bubbleEnabled = false) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.drugData = null;
        this.sprite = null;
        this.occupied = false;
        this.bubbleEnabled = bubbleEnabled;
        this.bubbleEmitter = null;

        this.rect = scene.add.rectangle(x, y, width, height, color, alpha)
            //.setStrokeStyle(1, 0xffffff)
            .setInteractive();

        if (this.bubbleEnabled) {
            this.createBubbleEmitter();
        }
    }
    // preload() {
    //     this.scene.load.audio("Drag", "../assets/audio/Clinking.mp3");
    // }
    containsPoint(x, y) {
        return Phaser.Geom.Rectangle.Contains(this.rect.getBounds(), x, y);
    }

    hasDrug() {
        return this.sprite !== null;
    }

    setDrug(drugData, sprite) {
        this.drugData = drugData;
        this.sprite = sprite;
        this.occupied = !!sprite;

        if (sprite) {
            sprite.x = this.x - sprite.displayWidth / 2;
            sprite.y = this.y;

            this.scene.game.sound.play("Drag");

            if (this.bubbleEmitter) {
                this.bubbleEmitter.setVisible(true);
                this.bubbleEmitter.start();
            }
        }
    }

    clearDrug() {
        this.drugData = null;
        this.sprite = null;
        this.occupied = false;

        if (this.bubbleEmitter) {
            this.bubbleEmitter.stop();
            this.bubbleEmitter.setVisible(false);
        }
    }

    //bubble effect
    createBubbleEmitter() {
        const topY = this.y - this.height / 2 - 10;

        this.bubbleEmitter = this.scene.add.particles(
            this.x,
            topY,
            'bubble',
            {
                speedX: { min: -6, max: 6 },
                speedY: { min: -20, max: -45 },
                scale: { start: 0.14, end: 0.2 },
                alpha: { start: 1, end: 0 },
                lifespan: 900,
                frequency: 260,
                quantity: 1,
                gravityY: 0,
                blendMode: 'ADD',
                on: false
            }
        ).setDepth(2);

        this.bubbleEmitter.stop();
        this.bubbleEmitter.setVisible(false);
    }

    swapDrug(otherContainer) {
        const myDrugData = this.drugData;
        const mySprite = this.sprite;

        this.setDrug(otherContainer.drugData, otherContainer.sprite);
        otherContainer.setDrug(myDrugData, mySprite);
    }

    setHighlight(on) {
        this.rect.setStrokeStyle(on ? 3 : 1, on ? 0xffff00 : 0xffffff);
    }
}