class Goal {
    constructor(scene) {
        this.scene = scene;

        // visual bob vars
        this.baseY = 0;
        this.bobTimer = 0;

        // create sprite
        this.sprite = scene.add.image(0, 0, "goal").setOrigin(0, 0).setDepth(5).setVisible(false);
    }

    // move goal sprite to tile position
    setPosition(tileX, tileY) {
        const worldX = tileX * this.scene.TILESIZE;
        const worldY = tileY * this.scene.TILESIZE;
        this.baseY = worldY;
        this.bobTimer = 0;
        this.sprite.setPosition(worldX, worldY);
        this.sprite.setVisible(true);
    }

    update(time, delta) {
        if (!this.sprite.visible) return;

        // bob speed
        this.bobTimer += delta * 0.005;

        // bob height
        const offset = Math.sin(this.bobTimer) * 3;
        this.sprite.y = this.baseY + offset;
    }
}