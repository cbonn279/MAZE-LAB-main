class MainUI extends Phaser.Scene {
    constructor() {
        super('MainUI');
    }

    preload() {
        this.load.json('drugData', 'lib/Drugs.json');
        this.load.image('Drug1', 'assets/DrugT1.png');
        this.load.image('Drug2', 'assets/DrugT2.png');

        this.load.image('high', 'assets/high.png');
        this.load.image('crack', 'assets/crack.png');
        this.load.image('trip', 'assets/trip.png');
        this.load.image('meds', 'assets/meds.png');

        this.load.audio("Drag", "../assets/audio/Clinking.mp3");
    }

    create() {
        this.initConfig();
        this.initState();

        // Scene References 
        this.Maze = game.scene.getScene('mazeScene');
        this.gameManager = game.scene.getScene('GameManager');

        /*
        this.moneyUI = this.add.text(660, 20, 'Money:', {
            font: '24px Arial',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 5
        });
        */

        // The Money Icon Sprite -- Added for testing
        this.moneyIcon = this.add.sprite(675, 35, 'money_icon')
            .setScale(0.15)            
            .setDepth(10);

        // 2. The Number Text (positioned slightly to the right of the icon)
        this.moneyText = this.add.text(710, 20, '$0', {
            font: '24px Arial',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setDepth(10);

        this.createDrugPack();
        this.createPackSlots();
        this.createTargetBoxes();
        // hiding shop
        //this.createShop();
        
        // Global input handling for dragging and dropping drugs
        this.bindGlobalInput();

        this.events.on('sleep', () => {
            // Clear out the current selected drug just to be safe
            if (this.selectedDrug) {
                this.selectedDrug.clearTint();
                this.selectedDrug = null;
            }

            // Force the input manager to drop whatever it's currently holding
            this.input.setDragState(this.input.activePointer, 0);
        });

    }

    initConfig() {
        this.maxSlot = 5;
        this.slotSpacing = 100;
        this.slotPadding = 20;
        this.packHeight = 120;

        this.shopHeight = 320;
        this.shopWidth = 120;
        this.shopPadding = 30;
    }

    initState() {
        this.drugs = this.cache.json.get('drugData');

        this.drugSlots = [];
        this.targetBoxes = [];

        this.selectedDrug = null;
        this.dragSource = null;
        this.dragGhost = null;
    }

    // For the purposes of updating the money - Ryle
    update() {
        // this.moneyUI.setText(`Money: $${this.gameManager.money}`);

        this.moneyText.setText(`: $${this.gameManager.money}`);
    }

    createDrugPack() {
        const cam = this.cameras.main;
        const packWidth = this.slotPadding + this.slotSpacing * this.maxSlot;

        // Draw the drug pack area on the right side of the screen, maybe you want to change the cordinates and size?
        this.drugPack = this.add.rectangle(
            cam.width,
            cam.height,
            packWidth,
            this.packHeight,
            //0x333366
        )
            .setOrigin(1, 1)
          //  .setStrokeStyle(2, 0xffffff);

        this.packStartX = this.drugPack.x - this.drugPack.width;
        this.packCenterY = this.drugPack.y - this.drugPack.height / 2;
    }

    createPackSlots() {
        for (let i = 0; i < this.maxSlot; i++) {
            const x = this.packStartX + 20 + i * this.slotSpacing + 30;
            const y = this.packCenterY;

            const slot = new DrugContainer(this, x, y, 60, 60, 0xffffff, 0.08);
            this.drugSlots.push(slot);

            slot.rect.setStrokeStyle(1, 0xffffff);
        }
    }

    createTargetBoxes() {
        // cordinates and size of target boxes
        this.targetBoxes = [
            // x, y, width, height, color, alpha
            new DrugContainer(this, 480, 100, 80, 80, 0x448844, 0, 1),
            new DrugContainer(this, 580, 100, 80, 80, 0x448844, 0.1, 1)
        ];
        //Delete later, this is just a more test 
        this.add.image(460, 130, 'IVBag').setDepth(-1)
        this.add.image(560, 130, 'IVBag').setDepth(-1)


        this.targetBoxes.forEach(container => {
            // AI helped with drag and drop funcitonality
            container.rect.setInteractive();
            container.rect.input.dropZone = true;
            container.rect.parent = container;

            container.rect.on('pointerdown', () => {
                if (!this.selectedDrug) {
                    if (container.hasDrug()) {
                        const emptySlot = this.getFirstEmptyContainer(this.drugSlots);
                        if (!emptySlot) {
                            this.showSlotFullMessage();
                            return;
                        }

                        this.Maze.activeCharacter.activateDrugs(container.drugData.id);
                        container.sprite.setInteractive({ useHandCursor: true });
                        emptySlot.setDrug(container.drugData, container.sprite);
                        container.clearDrug();

                        return;

                    } else {
                        return;
                    }
                }

                this.drugMovement(this.selectedDrug, container);

            });

            this.input.on('drop', (pointer, drug, dropZone) => {
                const targetContainer = dropZone.parent;
                this.drugMovement(drug, targetContainer);
            });
        });

    }

    //moved block of code into this function, nothing inside changed
    drugMovement(drug, container) {
        const sourceContainer = this.getContainerBySprite(drug);
        if (!sourceContainer || sourceContainer === container) return;

        if (!container.hasDrug()) {
            container.setDrug(sourceContainer.drugData, sourceContainer.sprite);
            sourceContainer.clearDrug();
            this.time.delayedCall(10, () => {
                container.sprite.disableInteractive();
            });
        } else {
            this.Maze.activeCharacter.activateDrugs(container.drugData.id);
            container.sprite.setInteractive({ useHandCursor: true });
            sourceContainer.sprite.setInteractive({ useHandCursor: true });
            sourceContainer.swapDrug(container);
            this.time.delayedCall(10, () => {
                container.sprite.disableInteractive();
            });
        }

        this.Maze.activeCharacter.activateDrugs(container.drugData.id);

        drug.clearTint();
        this.selectedDrug = null;
    }

    createShop() {
        const cam = this.cameras.main;

        this.shop = this.add.rectangle(
            50,
            cam.height,
            this.shopWidth,
            this.shopHeight,
            0x663333
        )
            .setOrigin(0, 1)
            .setStrokeStyle(2, 0xffffff);

        const shopStartY = this.shop.y - this.shop.height;
        const shopCenterX = this.shop.x + this.shop.width / 2;

        this.drugs.forEach((drug, index) => {
            const y = shopStartY + 20 + index * 80;

            const shopSprite = this.add.sprite(shopCenterX, y, drug.texture)
                .setScale(2)
                .setOrigin(0.5, 0)
                .setInteractive({ useHandCursor: true });

            const soldOutText = this.add.text(shopSprite.x, shopSprite.y + 30, 'Sold Out', {
                font: '14px Arial',
                color: '#ff6666'
            }).setOrigin(0.5, 1).setVisible(!!drug.bought);

            drug.shopSprite = shopSprite;
            drug.soldOutText = soldOutText;

            shopSprite.on('pointerdown', () => {
                this.buyDrug(drug);
            });
        });
    }

    buyDrug(drug) {
        // If the drug is already bought, return
        if (drug.bought) return;

        // Find the first empty slot in the drug pack
        const emptySlot = this.getFirstEmptyContainer(this.drugSlots);

        // We might not using this function, could be deleted if needed
        if (!emptySlot) {
            this.showSlotFullMessage();
            return;
        }

        // Create a new sprite for the drug in the pack and make it draggable
        const packSprite = this.add.sprite(emptySlot.x, emptySlot.y, drug.texture)
            .setScale(3.5)
            .setOrigin(0, 0.5)
            .setInteractive({ useHandCursor: true });

        this.input.setDraggable(packSprite);

        packSprite.on('pointerdown', () => {
            // Set the selected drug to this one when clicked
            this.selectedDrug = packSprite;
            // Highlight the selected drug and clear highlights from other drugs
            this.drugs.forEach(d => {
                if (d.packSprite) d.packSprite.clearTint();
            });

            packSprite.setTint(0xffff88);
        });

        emptySlot.setDrug(drug, packSprite);

        // Update drug state to bought and show sold out text in the shop, 
        // if want to change to "Owned", just chage it in json file
        /* drug.packSprite = packSprite;
        drug.bought = true;
        drug.soldOutText.setVisible(true); */
        // ABOVE IS TEMP COMMENTED OUT
    }

    getFirstEmptyContainer(containers) {
        return containers.find(container => !container.hasDrug());
    }

    // ... means combine two array into one array, and I just know that(This is suggest by AI btw)
    getContainerBySprite(sprite) {
        const allContainers = [...this.drugSlots, ...this.targetBoxes];
        return allContainers.find(container => container.sprite === sprite);
    }

    getContainerAtPoint(x, y) {
        const allContainers = [...this.drugSlots, ...this.targetBoxes];
        return allContainers.find(container => container.containsPoint(x, y));
    }

    // We probably won't use this function, I just did not deleted just in case, actually useless.
    showSlotFullMessage() {
        const msg = this.add.text(this.cameras.main.centerX, 50, 'All slots are full!', {
            font: '20px Arial',
            color: '#ff6666'
        }).setOrigin(0.5);

        this.time.delayedCall(1000, () => msg.destroy());
    }

    bindGlobalInput() {
        this.input.on('dragstart', (pointer, gameObject) => {
            this.dragSource = gameObject;

            // Create a ghost sprite that follows the pointer during dragging
            this.dragGhost = this.add.sprite(gameObject.x, gameObject.y, gameObject.texture.key)
                .setOrigin(gameObject.originX, gameObject.originY)
                .setScale(gameObject.scaleX, gameObject.scaleY)
                .setAlpha(0.5)
                .setDepth(1000);
        });

        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            // Move the ghost sprite with the pointer
            if (!this.dragGhost) return;

            // Keep the ghost centered on the pointer
            this.dragGhost.x = dragX;
            this.dragGhost.y = dragY;

            // Highlight potential drop targets
            const targetContainer = this.getContainerAtPoint(dragX, dragY);
            [...this.drugSlots, ...this.targetBoxes].forEach(container => {
                container.setHighlight(container === targetContainer);
            });
        });

        this.input.on('dragend', () => {
            if (!this.dragGhost || !this.dragSource) return;

            // Find the source container and the target container based on the drag source and the final pointer position
            const sourceContainer = this.getContainerBySprite(this.dragSource);
            const targetContainer = this.getContainerAtPoint(this.dragGhost.x, this.dragGhost.y);

            // Handle drug swapping logic
            if (sourceContainer && targetContainer && sourceContainer !== targetContainer) {
                if (!targetContainer.hasDrug()) {
                    targetContainer.setDrug(sourceContainer.drugData, sourceContainer.sprite);
                    sourceContainer.clearDrug();
                } else {
                    sourceContainer.swapDrug(targetContainer);
                }
            }

            // Clear highlights and destroy the ghost sprite
            [...this.drugSlots, ...this.targetBoxes].forEach(container => {
                container.setHighlight(false);
            });

            this.dragGhost.destroy();
            this.dragGhost = null;
            this.dragSource = null;
        });
    }
}