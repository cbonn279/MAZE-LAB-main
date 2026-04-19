class GameComplete extends Phaser.Scene{
    constructor() {
        super('GameComplete')
    }

    create(){
        this.DragSystemUI = this.scene.get('MainUI');
        this.gameManager = this.scene.get('GameManager');
        this.Maze = this.scene.get('mazeScene');
        this.MiniGame = this.scene.get('MiniGame');
        this.Shop = this.scene.get('ShopScene')
    }

    preload() {
        this.load.audio("PoliceSiren", "./assets/audio/PoliceSiren.wav");
        this.load.audio("BreakingDoor", "./assets/audio/BreakingDoor.flac");
        
    }
    
    EndGame(){
        const { width, height } = this.cameras.main;

        console.log("complete");
        this.MiniGame.scene.stop();
        this.Maze.scene.stop();
        this.DragSystemUI.scene.stop();
        this.Shop.scene.stop();
        this.Maze.mazeBGM.stop();
        this.registry.set('End', true);
        
        this.sound.play("FNAFPowerOff");

        this.endScreen = this.add.rectangle(0, 0, width, height, 0x0b0b17, 1).setOrigin(0).setAlpha(0);

        this.FBI = this.sound.add("PoliceSiren", {
            loop: true,
            volume: 0
        });

        this.FBI.play();

        this.tweens.add({
            targets: this.FBI,
            volume: 0.5,
            duration: 10000,
            onComplete: () => {
                this.time.delayedCall(3000, () => {
                    this.sound.play("BreakingDoor", {
                        volume: 0.8
                    });
                });
            }
        });

        
        this.tweens.add({
            targets: this.endScreen,
            duration: 10000,
            ease: "Cubic.easeInOut",
            alpha: 1,
            onComplete: () => {
            this.label = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, `THANKS FOR PLAYING`, {
            font: '24px Arial',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
            }
        })


        
    }
}