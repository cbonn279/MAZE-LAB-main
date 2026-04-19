class MessageUI extends Phaser.Scene {
    constructor() {
        super('MessageUI');
        this.messageTweens = null;
    }

    errorMessage(text) {
        if (!this.messageTweens) {
            const msg = this.add.text(this.cameras.main.centerX + 150, -50, text, {
                font: '50px Arial',
                color: '#ff5858',
                stroke: "#3b0000",
                strokeThickness: 4,
            }).setOrigin(0.5);

            this.messageTweens = this.tweens.add({
                targets: msg,
                y: '+=100',
                duration: 500,
                ease: "Cubic.easeInOut",
                onComplete: () => {
                    this.time.delayedCall(1500, () => {
                        this.messageTweens = this.tweens.add({
                            targets: msg,
                            y: '-=100',
                            duration: 500,
                            ease: "Cubic.easeInOut",
                            onComplete: () => {
                                this.messageTweens = null;
                                msg.destroy();
                            }
                        })
                    });
                }
            })
        }
    }
}