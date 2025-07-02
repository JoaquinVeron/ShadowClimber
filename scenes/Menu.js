export default class Menu extends Phaser.Scene {
  constructor() {
    super("menu");
  }

  preload() {
    this.load.image("FondoMenu", "public/assets/FondoMenu.png");
    this.load.image("Titulo", "public/assets/titulo.png");

    this.load.image("JugarNegro", "public/assets/JugarNegro.png");
    this.load.image("JugarRosa", "public/assets/JugarRosa.png");

    this.load.image("TiendaNegro", "public/assets/TiendaNegro.png");
    this.load.image("TiendaRosa", "public/assets/TiendaRosa.png");

    this.load.image("AjustesNegro", "public/assets/AjustesNegro.png");
    this.load.image("AjustesRosa", "public/assets/AjustesRosa.png");

    this.load.image("FondoBoton", "public/assets/FondoBoton.png");
    this.load.image("Fondo", "public/assets/fondo.jpg");
  }

  create() {
    const { width, height } = this.scale;

    const centroX = width / 2;
    const centroY = height / 2;
    const posYBase = height / 2 - 55;
    const espaciado = 110;
    const escalaBoton = 0.3;

    // Fondo general
    this.add.image(centroX, -50, "Fondo").setScale(2);

    // Fondo menú
    const fondoMenu = this.add.image(-width, centroY, "FondoMenu").setScale(0.3).setDepth(0);

    // Título
    const titulo = this.add.image(centroX, -200, "Titulo").setScale(0.1).setDepth(2);

    // --- Fondos individuales (ya en posición final, pero invisibles) ---
    const fondoJugar = this.add.image(centroX, posYBase, "FondoBoton")
      .setScale(escalaBoton)
      .setDepth(1)
      .setAlpha(0);

    const fondoTienda = this.add.image(centroX, posYBase + espaciado, "FondoBoton")
      .setScale(escalaBoton)
      .setDepth(1)
      .setAlpha(0);

    const fondoAjustes = this.add.image(centroX, posYBase + espaciado * 2, "FondoBoton")
      .setScale(escalaBoton)
      .setDepth(1)
      .setAlpha(0);

    // --- Botón JUGAR ---
    const btnJugar = this.add.image(-200, posYBase, "JugarNegro")
      .setScale(escalaBoton)
      .setInteractive()
      .setDepth(2);

    btnJugar.setInteractive(
      new Phaser.Geom.Rectangle(-btnJugar.displayWidth / 2, -btnJugar.displayHeight / 2, btnJugar.displayWidth, btnJugar.displayHeight),
      Phaser.Geom.Rectangle.Contains
    );
    btnJugar.input.cursor = "pointer";

    btnJugar.on("pointerover", () => {
      btnJugar.setTexture("JugarRosa");
      btnJugar.setScale(0.4);
    });

    btnJugar.on("pointerout", () => {
      btnJugar.setTexture("JugarNegro");
      btnJugar.setScale(escalaBoton);
    });

    btnJugar.on("pointerdown", () => {
      this.scene.start("game");
    });

    // --- Botón TIENDA ---
    const btnTienda = this.add.image(-200, posYBase + espaciado, "TiendaNegro")
      .setScale(escalaBoton)
      .setInteractive()
      .setDepth(2);

    btnTienda.setInteractive(
      new Phaser.Geom.Rectangle(-btnTienda.displayWidth / 2, -btnTienda.displayHeight / 2, btnTienda.displayWidth, btnTienda.displayHeight),
      Phaser.Geom.Rectangle.Contains
    );
    btnTienda.input.cursor = "pointer";

    btnTienda.on("pointerover", () => {
      btnTienda.setTexture("TiendaRosa");
      btnTienda.setScale(0.4);
    });

    btnTienda.on("pointerout", () => {
      btnTienda.setTexture("TiendaNegro");
      btnTienda.setScale(escalaBoton);
    });

    // --- Botón AJUSTES ---
    const btnAjustes = this.add.image(-200, posYBase + espaciado * 2, "AjustesNegro")
      .setScale(escalaBoton)
      .setInteractive()
      .setDepth(2);

    btnAjustes.setInteractive(
      new Phaser.Geom.Rectangle(-btnAjustes.displayWidth / 2, -btnAjustes.displayHeight / 2, btnAjustes.displayWidth, btnAjustes.displayHeight),
      Phaser.Geom.Rectangle.Contains
    );
    btnAjustes.input.cursor = "pointer";

    btnAjustes.on("pointerover", () => {
      btnAjustes.setTexture("AjustesRosa");
      btnAjustes.setScale(0.4);
    });

    btnAjustes.on("pointerout", () => {
      btnAjustes.setTexture("AjustesNegro");
      btnAjustes.setScale(escalaBoton);
    });

    // --- Animaciones fondo menu y título ---
    this.tweens.add({
      targets: fondoMenu,
      x: centroX,
      ease: 'Back.easeOut',
      duration: 1000
    });

    this.tweens.add({
      targets: titulo,
      y: 190,
      ease: 'Back.easeOut',
      duration: 1000,
      delay: 300
    });

    // --- Fade in de fondos (sin mover) ---
    this.tweens.add({
      targets: fondoJugar,
      alpha: 1,
      duration: 1250,
      delay: 1500
    });

    this.tweens.add({
      targets: fondoTienda,
      alpha: 1,
      duration: 1250,
      delay: 1700
    });

    this.tweens.add({
      targets: fondoAjustes,
      alpha: 1,
      duration: 1250,
      delay: 1900
    });

    // --- Animación de botones ---
    this.tweens.add({
      targets: btnJugar,
      x: centroX,
      ease: 'Back.easeOut',
      duration: 1000,
      delay: 1000
    });

    this.tweens.add({
      targets: btnTienda,
      x: centroX,
      ease: 'Back.easeOut',
      duration: 1000,
      delay: 1200
    });

    this.tweens.add({
      targets: btnAjustes,
      x: centroX,
      ease: 'Back.easeOut',
      duration: 1000,
      delay: 1400
    });
  }
}