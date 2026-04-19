class GameManager extends Phaser.Scene {
    constructor() {
        super('GameManager')

        // Initialize player stats
        this.money = 0;
        this.battery = 100;
    }

    create(){
        this.add.sprite(0, 0, 'background').setOrigin(0, 0).setDepth(-1);
        this.add.sprite(390, 250, 'wire').setOrigin(0, 0).setDepth(10);
        this.add.sprite(390, 280, 'wire').setOrigin(0, 0).setDepth(10);
        this.add.sprite(390, 310, 'wire').setOrigin(0, 0).setDepth(10);
        this.add.sprite(390, 340, 'wire').setOrigin(0, 0).setAngle(30);
        this.add.sprite(0,50, 'monitor').setDepth(1).setOrigin(0,0)
        this.add.sprite(436,392, 'drugSafe').setDepth(1).setOrigin(0,0)

        // drug unlocks
        window.drugUnlocks = {
            high: false,
            crack: false,
            trip: false
        };
    }   
}