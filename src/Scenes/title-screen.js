//title screen and instructions - taylor
class TitleScreen extends Phaser.Scene {
    constructor() {
        super('TitleScreen');
    }

    preload() {
        // this.load.audio("Press", "../assets/audio/ButtonPress.mp3");
    }
    create() {
        // Fixed issue with phone still showing above the title screen
        this.scene.bringToTop('TitleScreen');

        this.Maze = game.scene.getScene('mazeScene');
        this.Maze.scene.sleep();
        this.Maze.mazeBGM.stop();

        const { width, height } = this.cameras.main;

        this.add.rectangle(0, 0, width, height, 0x0b0b17, 0.95).setOrigin(0);

        this.add.image(width / 2, height * .45, 'title_logo')
            .setOrigin(0.5)
            .setScale(1)
            .setDepth(0);

        this.createButton(width / 3, height * 0.6, 'Play', () => this.startGame());
        this.createButton(width / 1.5, height * 0.6, 'Instructions', () => this.showInstructions());

        this.instructionsPanel = null;
    }

    createButton(x, y, label, callback) {
        const button = this.add.image(x, y, 'buttonUp')
            .setOrigin(0.5)
            .setScale(.9)
            .setInteractive({ useHandCursor: true });

        const buttonText = this.add.text(x, y, label, {
            font: '24px Arial',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        button.on('pointerover', () => button.setTint(0xdddddd));
        button.on('pointerout', () => button.clearTint());
        button.on('pointerdown', () => {
            const resumePromise = this.sound.context.state === 'running'
                ? Promise.resolve()
                : this.sound.context.resume();

            resumePromise.then(() => {
                if (!this.Maze.blackBGM.isPlaying) {
                    this.Maze.blackBGM.play();
                }
                this.sound.play("Press");
            });

            button.setTexture('buttonDown');
        });
        button.on('pointerup', () => {
            button.setTexture('buttonUp');
            callback();
        });

        return { button, buttonText };
    }

    startGame() {
        if (this.instructionsPanel) {
            this.instructionsPanel.destroy();
            this.instructionsPanel = null;
        }

        const resumePromise = this.sound.context.state === 'running'
            ? Promise.resolve()
            : this.sound.context.resume();

        resumePromise.then(() => {
            this.sound.play("MazeScreenOn");
            this.Maze.blackBGM.stop();
            this.Maze.mazeBGM.play();
        });

        this.scene.stop();
        this.Maze.scene.wake();
    }

    showInstructions() {
        if (this.instructionsPanel) {
            this.instructionsPanel.destroy();
            this.instructionsPanel = null;
            return;
        }

        const { width, height } = this.cameras.main;

        const panelWidth = Math.min(width * 0.85, 680);
        const panelHeight = Math.min(height * 0.72, 420);
        const panelX = width / 2;
        const panelY = height / 2;

        const background = this.add.rectangle(panelX, panelY, panelWidth, panelHeight, 0x12121c, 0.98)
            .setStrokeStyle(3, 0xffffff);

        const title = this.add.text(panelX, panelY - panelHeight / 2 + 40, 'Instructions', {
            font: '28px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);

        const instructionsText = 
            '• Click Play to begin the game.\n• Use the phone to purchase drugs.\n• Drag the drugs into the IV bags to activate them and combine them for special effects. \n• Be mindful of your battery usage. To avoid power outage, smash the button as fast as possible. \n\nGood luck! ';

        const content = this.add.text(panelX - panelWidth / 2 + 24, panelY - panelHeight / 2 + 90, instructionsText, {
            font: '18px Arial',
            fill: '#e8e8ff',
            wordWrap: { width: panelWidth - 48 }
        });

        const closeButton = this.add.text(panelX, panelY + panelHeight / 2 - 50, 'Close', {
            font: '22px Arial',
            fill: '#88ff88',
            backgroundColor: '#112233',
            padding: { x: 12, y: 8 }
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.showInstructions());

        this.instructionsPanel = this.add.container(0, 0, [background, title, content, closeButton])
            .setDepth(2);
    }
}
