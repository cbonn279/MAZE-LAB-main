//For now entire use of this script is to control the mouse cursor image switching when clicked - Robert
class CursorScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CursorScene' });
    }

    preload() {
        //Cursor images
        this.load.image('cursorDefault', './assets/images/cursor/CursorIdle.png');
        this.load.image('cursorPress', './assets/images/cursor/CursorPressed.png');
        this.load.image('cursorEnd', './assets/images/cursor/CursorEnd.png');
    }

    create() {
        // Hide the default browser cursor
        this.input.setDefaultCursor('none');

        // Make sure this scene stays above others
        this.scene.bringToTop();

        // Create cursor image
        this.cursor = this.add.image(0, 0, 'cursorDefault');
        this.shadow = this.add.image(0, 0, 'shadow').setAlpha(0.5).setDepth(100); // Add shadow image behind cursor
        //I know its ugly as fuck and hard coded, my bad. Its so the mouse feels right
        this.cursor.setOrigin(0.62, 0.01);   

        // Keep this scene from pausing accidentally
        this.scene.setVisible(true);

        let lightsOff = this.registry.get('lightsOff');
        console.log('Initial lightsOff:', lightsOff);

        // Change to pressed texture
        this.input.on('pointerdown', () => {
            this.cursor.setTexture('cursorPress');
        });

        // Change back to idle texture
        this.input.on('pointerup', () => {
            this.cursor.setTexture('cursorDefault');
        });

    }

    update() {
        const pointer = this.input.activePointer;

        this.cursor.x = pointer.x;
        this.cursor.y = pointer.y;

        if (this.registry.get('lightsOff')) {
            // Follow the cursor when the lights are off
            console.log("lights are off");
            this.shadow.x = pointer.x;
            this.shadow.y = pointer.y;
            this.shadow.setAlpha(0.8); // Make shadow visible
        }else{  
            console.log("lights are on");
            this.shadow.setAlpha(0); // Hide shadow
        }

        if (this.registry.get('End')) {
            this.cursor.setTexture('cursorEnd');
        }
        // Safety: keep this scene above everything
        this.scene.bringToTop();
    }
}