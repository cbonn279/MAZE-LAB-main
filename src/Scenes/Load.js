class Load extends Phaser.Scene{
    constructor() {
        super('loadScene')
    }

    preload(){
        this.load.setPath("./assets/");

        this.load.image('background', './images/BackgroundV1.png');
        this.load.image('buttonDown', './images/ButtonDown.png');
        this.load.image('buttonUp', './images/ButtonUp.png');
        this.load.image('blackScreen', './images/blackscreen4.png');
        this.load.image('monitor', './images/ComputerV2.png');
        this.load.image("phoneUp", "./images/PhoneUp.png");
        this.load.image("IVBag", "./images/IvBag.png");
        this.load.image("shadow", "./images/Shadow.png");
        this.load.image("wire", "./images/Wire.png");
        this.load.image("drugSafe", "./images/DrugSafe.png");

        // New addition: Money icon for UI
        this.load.image("money_icon", "./images/money_icon.png");

        // lobster sprite
        this.load.image("Lobster", "./sprites/Lobster16.png");
        this.load.image("LobsterHigh", "./sprites/LobsterHigh.png");
        this.load.image("LobsterCrack", "./sprites/LobsterCrack.png");
        this.load.image("LobsterTrip", "./sprites/LobsterTrip.png");
        this.load.image("LobsterMeds", "./sprites/LobsterMeds.png");
        this.load.image("LobsterHC", "./sprites/LobsterHC.png");
        this.load.image("LobsterHT", "./sprites/LobsterHT.png");
        this.load.image("LobsterHM", "./sprites/LobsterHM.png");
        this.load.image("LobsterCT", "./sprites/LobsterCT.png");
        this.load.image("LobsterCM", "./sprites/LobsterCM.png");
        this.load.image("LobsterTM", "./sprites/LobsterTM.png");
        

        // drug icons
        this.load.image("high", "high.png");
        this.load.image("Phigh", "Phigh.png");
        this.load.image("crack", "crack.png");
        this.load.image("Pcrack", "Pcrack.png");
        this.load.image("trip", "trip.png");
        this.load.image("Ptrip", "Ptrip.png");
        this.load.image("meds", "meds.png");
        this.load.image("final", "FinalDrug.png");

        // sound effects
        this.load.audio("PhoneOpen", "./audio/iphoneUnlock.mp3");
        this.load.audio("Pay", "./audio/iphonePay.mp3");
        this.load.audio("PhoneClose", "./audio/iphoneLock.mp3");
        this.load.audio("Press", "./audio/ButtonPress.mp3");
        this.load.audio("Drag", "./audio/Clinking.mp3");
        this.load.audio("MazeMusic", "./audio/ethicsPendingBGM.wav");
        this.load.audio("Static", "./audio/static.mp3");
        this.load.audio("GetMoney", "./audio/Smoney.wav");
        this.load.audio("MazeScreenOn", "./audio/Sscreenon.wav");
        this.load.audio("MazeScreenOff", "./audio/Sscreenoff.wav");
        this.load.audio("BuyDrug", "./audio/Sbuydrug.wav");
        this.load.audio("DrugActivate", "./audio/Sdrugup.wav");
        this.load.audio("FNAFPowerOff", "./audio/FNAFPowerOff.mp3");
        this.load.audio("PoliceSiren", "./audio/PoliceSiren.wav");
        this.load.audio("BreakingDoor", "./audio/BreakingDoor.flac");

        // goal item
        this.load.image("goal", "Tfruit.png");

        this.load.json('drugData', '../lib/drugs.json');   
        
        // Load tilemap information
        this.load.image("maze_tiles", "tileset_full.png");  //tileset
        this.load.image("new_maze_tiles", "mazetiles32.png");  //tileset
        this.load.tilemapTiledJSON("TestingMaze", "Maze.tmj");   // JSON (tmj) tilemap

        // NEW: Load phone assets for shop UI (from earlier branch)
        this.load.image("phone_closed", "phone_closed.png");
        this.load.image("phone_open", "phone_open.png");

        //title screen logo
        this.load.image("title_logo", "title.png");
        this.load.image("lightning", "lightning.png");
        this.load.image("bubble", "bubble.png");
    }

    create(){
        //this.add.text(20, 20, "Load Scene", { font: "16px Arial", fill: "#ffffff" });
        //use .launch to start your scenes so they can run in parallel and not interrupt each other - Robert
        
        this.scene.launch('GameManager')
        this.scene.launch('mazeScene')
        this.scene.launch('ShopScene')
        this.scene.launch('MiniGame')
        this.scene.launch("MainUI");
        this.scene.launch('TitleScreen');
        this.scene.launch('CursorScene');
        this.scene.launch('MessageUI');
        this.scene.launch('GameComplete');
        this.scene.bringToTop('CursorScene');
        
        this.scene.moveAbove('ShopScene', 'mainUI') //moves the maze scene to be below the shop scene
        this.scene.bringToTop('MainUI') 
        this.scene.bringToTop('TitleScreen')
        this.scene.bringToTop('MessageUI');
    }

}