class Shop extends Phaser.Scene {
    constructor() {
        super('ShopScene')
    }
    // preload() {
    //     this.load.audio("Pay", "../assets/audio/iphonePay.mp3");
    //     this.load.audio("PhoneOpen", "../assets/audio/iphoneUnlock.mp3");
    //     this.load.audio("PhoneClose", "../assets/audio/iphoneLock.mp3");
    //     this.load.audio("Drag", "../assets/audio/Clinking.mp3");
    // }
    create() {
        //this.cameras.main.setBackgroundColor("#2b2b2b")
        //this.load.json('drugData', 'lib/Drugs.json');
        this.drugs = this.cache.json.get('drugData');
        this.registry.set('End', false);
        console.log(this.drugs)

        this.load.image('high', 'assets/high.png');
        this.load.image('crack', 'assets/crack.png');
        this.load.image('trip', 'assets/trip.png');
        this.load.image('meds', 'assets/meds.png');
        this.load.image('final', 'assets/FinalDrug.png');
        
        // Added this line here to fix phone layering issue
        this.scene.bringToTop('ShopScene');

        // Track whether shop is open
        this.shopOpen = false

        // references to scenes to access variables
        this.DragSystemUI = game.scene.getScene('MainUI');
        this.MessageUI = game.scene.getScene('MessageUI');
        this.gameManager = game.scene.getScene('GameManager');
        this.EndGame = game.scene.getScene('GameComplete');

        this.cameras.main.setBackgroundColor('rgba(0,0,0,0)');

        // Added this line here to fix phone layering issue
        //this.scene.bringToTop('ShopScene');

        // -----------------------------
        // SMALL PHONE ICON (closed state)
        // Will be replaced later with a custom sprite
        // -----------------------------
        // OLD: replaced with phone_closed asset from earlier branch
        /*
        this.closedPhone = this.add.rectangle(700, 500, 50, 90, 0x111111)
            .setStrokeStyle(3, 0x666666)
            .setInteractive({ useHandCursor: true })

        this.add.rectangle(700, 470, 20, 4, 0x555555) // speaker
        this.add.circle(700, 535, 6, 0x444444)        // home button
        */

        // Phone sprite using asset
        //this.closedPhone = this.add.image(400, 480, 'phone_closed')
        this.closedPhone = this.add.image(70, 520, 'phone_closed')
            .setInteractive({ useHandCursor: true })
            .setDepth(100)
            .setScale(0.4)

        // hover effect
        this.closedPhone.on('pointerover', () => {
            this.closedPhone.setTint(0xaaaaaa)
        })

        this.closedPhone.on('pointerout', () => {
            this.closedPhone.clearTint()
        })

        this.closedPhone.on("pointerdown", () => {
            this.openShop()
        })

        // scrolling variable
        this.scrollVal = 0;
        this.scrollTweens = null;

        // -----------------------------
        // FULL SHOP PHONE (open state)
        // -----------------------------
        this.createShopUI()

        // Start hidden
        this.shopContainer.setVisible(false)
        this.shopScreen.setVisible(false)
    }

    createShopUI() {
        const phoneX = 300
        const phoneY = 325

        const mask = this.make.graphics();
        mask.fillStyle(0xffffff);
        mask.fillRect(phoneX - 150, phoneY - 250, 160, 700);
        const scrollMask = mask.createGeometryMask();

        // This creates a container to hold all shop UI elements
        this.shopContainer = this.add.container(0, 0).setDepth(200)

        // This container ONLY contains the buttons
        this.shopScreen = this.add.container(0, 0).setDepth(200)

        //This will most likely be replaced with a custom sprite but for now we can just use shapes to make a phone UI
        // OLD: replaced with phone_open asset from earlier branch
        /*
        // Main phone body 
        const body = this.add.rectangle(phoneX, phoneY, 260, 440, 0x111111)
            .setStrokeStyle(4, 0x777777)

        // Screen
        const screen = this.add.rectangle(phoneX, phoneY, 220, 350, 0x222222)
            .setStrokeStyle(2, 0x999999)

        // Speaker
        const speaker = this.add.rectangle(phoneX, phoneY - 185, 60, 8, 0x555555)

        // Home button
        const homeButton = this.add.circle(phoneX, phoneY + 185, 14, 0x333333)
            .setStrokeStyle(2, 0x777777)
        */

        // Use phone open asset as background
        const phoneBody = this.add.image(phoneX, phoneY, 'phoneUp')
        // .setScale(0.3)

        // Shop title text
        const title = this.add.text(phoneX - 65, phoneY - 235, "SHOP", {
            fontSize: "22px",
            color: "#ffffff",
            fontStyle: "bold",
            fontFamily: 'monospace'
        }).setOrigin(0.5).setDepth(201)

        // Close button
        const closeText = this.add.text(phoneX, phoneY - 235, "X", {
            fontSize: "22px",
            color: "#ff6666",
            fontStyle: "bold",
            fontFamily: 'monospace'
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .setDepth(201)

        closeText.on("pointerdown", () => {
            this.closeShop()
        })

        const scrollNext = this.add.text(phoneX + 12, phoneY - 85, ">", {
            fontSize: "25px",
            color: "#ffffff",
            fontStyle: "bold",
            fontFamily: 'monospace'
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true }).setDepth(999)

        scrollNext.on("pointerdown", () => {
            this.scrollRight()
        })


        const scrollPrev = this.add.text(phoneX - 142, phoneY - 85, "<", {
            fontSize: "25px",
            color: "#ffffff",
            fontStyle: "bold",
            fontFamily: 'monospace'
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true }).setDepth(999)

        scrollPrev.on("pointerdown", () => {
            this.scrollLeft()
        })

        // Shop buttons
        this.shopButtons = []

        //Might change this layout to just be in a column but for now this is fine for testing purposes
        const buttonData = [
            { key: "high", icon: "high", x: phoneX - 65, y: phoneY - 145, price: 1},
            { key: "crack", icon: "crack", x: phoneX + 415, y: phoneY - 145, price: 400},
            { key: "trip", icon: "trip", x: phoneX + 255, y: phoneY - 145, price: 400},
            { key: "meds", icon: "meds", x: phoneX + 95, y: phoneY - 145, price: 10},
            { key: "miracle!!!", icon: "final", x: phoneX + 575, y: phoneY - 145, price:999 }
        ];
        /*{ label: "Upgrade 1", x: phoneX - 40, y: phoneY - 50 },
        { label: "Upgrade 2", x: phoneX + 40, y: phoneY - 50 },
        { label: "Upgrade 3", x: phoneX - 40, y: phoneY + 50 },
        { label: "Upgrade 4", x: phoneX + 40, y: phoneY + 50 }
    ]*/

        buttonData.forEach((data, index) => {
            const button = this.add.rectangle(data.x, data.y, 110, 110, 0x00aa00)
                .setStrokeStyle(2, 0xffffff)
                .setInteractive({ useHandCursor: true })
                .setDepth(201);
                

            // added icons
            let icon = null;
            if (data.icon) {
                icon = this.add.image(data.x, data.y, data.icon)
                    .setScale(8.5) //max scale is around 9-9.5
                    .setDepth(102);

                
            }

            /*
            const label = this.add.text(data.x, data.y, data.key, {
                fontSize: "11px",
                color: "#000000",
                align: "center",
                wordWrap: { width: 70 }
            }).setOrigin(0.5).setDepth(201)
            */
            const label = this.add.text(data.x, data.y + 55, data.key, {
                fontSize: "18px",
                color: "#000000",
                fontStyle: 'bold',
                align: "center",
                wordWrap: { width: 70 }
            }).setOrigin(0.5).setDepth(201).setVisible(false); // Start hidden
            
            const cost = this.add.text(data.x, data.y - 35, `$${data.price}`, {
                fontSize: "70px",
                fontStyle: "bold",
                color: "#0b4400",
                stroke: "#000000",
                strokeThickness: 0,
                //backgroundColor: '#ff00ff',
                align: "center",
                wordWrap: { width: 50 }
            }).setOrigin(0.5).setDepth(202).setVisible(false).setAlpha(0.55); // Start hidden

            button.on("pointerdown", () => {
                // Used AI for the below line of code
                if ((this.shopScreen.x + button.x) >= phoneX - 150 && (this.shopScreen.x + button.x) <= phoneX){
                    if (this.gameManager.money >= data.price){
                        this.buyItem(index, data.key, icon, cost, data.price);
                    } else {
                        this.MessageUI.errorMessage(`You're too poor`);
                    }
                }
            });

            this.shopButtons.push({
                button,
                icon,
                label, // Store reference to the label
                cost,
                key: data.key,
                bought: false
            });

        });

        //Okay this was somewhat new to me but a container is really OP, it works kinda like an 
        //empty game object from unity in which everything inside it will be affected by changes to the container 
        //itself. The really weird looking part is at the bottom that uses flatMaps and the spread operator (...).
        //Basically flatMap builds a list of all buttons and labels
        //... injects them into the main array
        //container.add() groups them all into one UI object

        // OLD: body, screen, speaker, homeButton replaced with phoneBody asset
        /*
        this.shopContainer.add([
            body,
            screen,
            speaker,
            homeButton,
            title,
            closeText,
            ...this.shopButtons.flatMap(item => [item.button, item.label])
        ])
        */

        // Add only the core UI elements
        this.shopContainer.add([
            phoneBody,
            title,
            closeText,
            scrollNext,
            scrollPrev
        ])

        this.shopScreen.add([
            ...this.shopButtons.flatMap(item => [item.button, item.icon, item.label, item.cost].filter(Boolean))
        ])

        this.shopScreen.setMask(scrollMask);
        this.shopContainer.setScale(0);
    }


    openShop() {
        if (this.shopOpen) return
        this.shopOpen = true

        this.sound.play("PhoneOpen")

        this.closedPhone.setVisible(false)
        this.shopContainer.setVisible(true)
        
        // Show labels ONLY after the scale animation completes
        this.tweens.add({
            targets: [this.shopContainer, this.shopScreen],
            scaleX: 1,
            scaleY: 1,
            duration: 200,
            ease: "Cubic.easeInOut",
            onComplete: () => {
                this.shopScreen.setVisible(true)
                this.shopButtons.forEach(item => {
                    if (item.label) {
                        item.label.setVisible(true);
                        item.cost.setVisible(true);
                    }
                });
            }
        })
    }

    closeShop() {
        if (!this.shopOpen) return
        this.shopOpen = false

        this.sound.play("PhoneClose")

        // Hide labels IMMEDIATELY when closing starts, so they don't linger during shrink
        this.shopButtons.forEach(item => {
            if (item.label) {
                item.label.setVisible(false);
                 item.cost.setVisible(false);
            }
        });

        this.tweens.add({
            targets: [this.shopContainer, this.shopScreen],
            scaleX: 0,
            scaleY: 0,
            duration: 150,
            ease: "Cubic.easeInOut",
            onComplete: () => {
                this.shopContainer.setVisible(false)
                this.closedPhone.setVisible(true)
            }
        })
    }

    scrollRight() {
        if (this.scrollVal < 4 && !this.scrollTweens) {
            console.log(this.scrollVal)
            this.scrollVal++;
            this.scrollTweens = this.tweens.add({
                targets: [this.shopScreen],
                x: '-=161',
                duration: 400,
                ease: "Cubic.easeInOut",
                onComplete: () => {
                    this.scrollTweens = null;
                }
            })

        }
    }

    scrollLeft() {
        if (this.scrollVal > 0 && !this.scrollTweens) {
            this.scrollVal--;
            this.scrollTweens = this.tweens.add({
                targets: [this.shopScreen],
                x: '+=161',
                duration: 400,
                ease: "Cubic.easeInOut",
                onComplete: () => {
                    this.scrollTweens = null;
                }
            })
        }
    }

    //We can use this function to handle the logic for buying items
    //for now it just changes the button color and text but we can easily expand 
    //this so that it spawns the drugs or whatever we want to add to the game when an item is bought
    buyItem(index, key, icon, costLabel, price) {
        const item = this.shopButtons[index];

        if (item.bought) return;
        if (key === "none") return;

        if (key === "miracle!!!"){
            this.sound.play("Pay");
            this.EndGame.EndGame();
            return;
        }
        item.bought = true;

        // unlock the drug
        window.drugUnlocks[key] = true;
        const drugObject = this.drugs.find(d => d.id === key);

        if (drugObject) {
            this.DragSystemUI.buyDrug(drugObject);
            this.sound.play("Pay");
        } else {
            console.log("none wtf")
        }


        // unlocked means gray
        if (icon) {
            icon.setTint(0x555555);
        }
        if (costLabel){
            costLabel.setText(`SOLD!`).setFontSize(45).setColor("#000000");
            this.gameManager.money -= price;
        }

        item.button.disableInteractive();
        console.log(`Unlocked ${key}`);
    }
}