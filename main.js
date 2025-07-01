import Menu from "./scenes/Menu.js"
import Game from './scenes/Game.js';

// Create a new Phaser config object
const config = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    min: {
      width: 800,
      height: 600,
    },
    max: {
      width: 1600,
      height: 1200,
    },
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 250 },
      debug: false,
    },
  },
  
  // List of scenes to load
  // Only the first scene will be shown
  // Remember to import the scene before adding it to the list
  scene: [Menu, Game],
};



// Create a new Phaser game instance
window.game = new Phaser.Game(config);
