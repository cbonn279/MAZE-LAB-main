//mini-game.js-taylor
'use strict';

class MiniGame extends Phaser.Scene {
  constructor() {
    super('MiniGame');
    this.gameManager = game.scene.getScene('GameManager');
    
  }
  preload() {
      //this.load.audio("Press", "../assets/audio/ButtonPress.mp3");
  }

  create() {  
    this.Maze = game.scene.getScene('mazeScene');
    this.button = this.add.sprite(600, 300, 'buttonUp').setDepth(0).setInteractive();
    
    // lightning effect
    this.lightningEmitter = this.add.particles(0, 0, 'lightning', {
      speedX: { min: -220, max: 220 },
      speedY: { min: -360, max: -240 },
      gravityY: 900,
      scale: { start: 0.4, end: 0.1 },
      lifespan: 1000,
      rotate: { min: -40, max: 40 },
      alpha: { start: 1, end: 0 },
      blendMode: 'ADD',
      frequency: -1,
      quantity: 1
    }).setDepth(1);
    this.healAmount = 5;

    //health bar
    this.button.on('pointerdown', () => {
     // this.sound.play("Press");

      const lightningY = this.button.y - 24;
      this.lightningEmitter.setPosition(this.button.x, lightningY);
      this.lightningEmitter.explode(4);

      if (this.gameManager.battery != 100){
        if (this.Maze.healthDeplete.paused) {
          this.Maze.healthDeplete.paused = false;
          this.Maze.showScreen()
        }
        this.Maze.HP.increase(this.healAmount || 1);
      }
      console.log(`Battery: ${ this.gameManager.battery}`);
       this.button.setTexture('buttonDown');

    });

    this.button.on('pointerup', () => {
      this.button.setTexture('buttonUp');
    });
    
    this.button.on('pointerover', () => {
      
    });

    this.button.on('pointerout', () => {
      this.button.setTexture('buttonUp');
    });
  }

};