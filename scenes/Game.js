// URL to explain PHASER scene: https://rexrainbow.github.io/phaser3-rex-notes/docs/site/scene/

export default class Game extends Phaser.Scene {
  constructor() {
    super("game");
  }

  init() {
  // Estado general
  this.puedeSaltar = false;
  this.overlapsEdificios = [];
  this.tiempoSalidaOverlap = null; // Momento en que dejó de tocar un edificio
  this.delayCaida = 100; // ms antes de activar animación "caida"
  this.tiempoAcumulado = 0;

  // Cronómetro y puntaje
  this.tiempoInicial = 0;
  this.textoCronometro = null;
  this.marcoCronometro = null;
  this.puntaje = 0;
  this.textoPuntaje = null;
  this.segundosPrevios = 0;
  this.metros = 0;
  this.metrosPrevios = 0;

  // Velocidad de cámara
  this.camSpeed = 200;
  this.maxSpeed = 400;
  this.duration = 180;
  this.increment = (this.maxSpeed - this.camSpeed) / this.duration;

  // Velocidad ninja
  this.ninjaSpeedBase = 445;
  this.ninjaSpeedMax = 690;
  this.ninjaSpeedIncrement = (this.ninjaSpeedMax - this.ninjaSpeedBase) / this.duration;
  this.ninjaCurrentSpeed = this.ninjaSpeedBase;

  // Animaciones
  this.animFrameRateBase = 8;
  this.animFrameRateMax = 12;
  this.animDuration = 180;
  this.animFrameRateIncrement = (this.animFrameRateMax - this.animFrameRateBase) / this.animDuration;
  this.animFrameRateActual = this.animFrameRateBase;
  this.animacionActual = null;

  // Sigilo
  this.tieneSigilo = false;
  this.sigiloDuration = 5000;
  this.sigiloEndTime = 0;

  // Luz
  this.luzOffset = 0;
  this.luzBaseY = this.cameras.main.height - 15;
  this.luzOscilacion = 20;

  // Menú pausa
  this.menuPausaFondo = null;
  this.botonReiniciar = null;
  this.botonSalir = null;
}


  preload() {
  // Tilemaps
  this.load.tilemapTiledJSON('mapa', './public/tilemap/mapa.json');

  // Imágenes estáticas
  this.load.image("!", "public/assets/!.png")
  this.load.image("altura", "public/assets/altura.png")
  this.load.image('BotonPausa', 'public/assets/BotonPausa.png');
  this.load.image('BotonPlay', 'public/assets/BotonPlay.png');
  this.load.image('cubo', 'public/assets/cuadrado.png');
  this.load.image('dude', 'public/assets/Caida.png');
  this.load.image('edificio', 'public/assets/edificio.png');
  this.load.image('fondo', 'public/assets/fondo2.jpg');
  this.load.image("FondoMenu", "public/assets/FondoMenu.png");
  this.load.image('jarron', 'public/assets/jarron.png');
  this.load.image('luz', 'public/assets/luz.png');
  this.load.image("marcolargo", "public/assets/MarcoLargo.png");
  this.load.image('quieto_der', 'public/assets/quieto_der.png');
  this.load.image('quieto_izq', 'public/assets/quieto_izq.png');
  this.load.image("ReiniciarNegro", "public/assets/ReiniciarNegro.png");
  this.load.image("ReiniciarRosa", "public/assets/ReiniciarRosa.png");
  this.load.image('reloj', 'public/assets/reloj.png');
  this.load.image("shuriken", "public/assets/shuriken.png");
  this.load.image("SalirNegro", "public/assets/SalirNegro.png");
  this.load.image("SalirRosa", "public/assets/SalirRosa.png");
  this.load.image('sigilo', 'public/assets/sigilo.png');
  this.load.image('sierra', 'public/assets/sierra.png');
  this.load.image('Ventana', './public/assets/Ventana.png');

  // Spritesheets
  this.load.spritesheet('animacion_der', 'public/assets/animacion_der.png', {
    frameWidth: 196,
    frameHeight: 204
  });
  this.load.spritesheet('animacion_izq', 'public/assets/animacion_Izq.png', {
    frameWidth: 196,
    frameHeight: 204
  });
}

  create() {
  // --- CONFIGURACIÓN INICIAL Y MAPA ---
  this.map = this.make.tilemap({ key: 'mapa' });
  const tileset = this.map.addTilesetImage('Ventanas', 'Ventana');
  const fondo = this.map.createLayer('Edificios', tileset, 0, 0);
  this.cameras.main.setBackgroundColor("#00CCFF");

  const centerX = this.cameras.main.width / 2;
  const centerY = this.cameras.main.height / 2;

  this.add.image(centerX, centerY, "fondo").setScale(2).setScrollFactor(0.01);

  // --- LUZ ---
  this.luz = this.add.image(this.cameras.main.width / 2, this.cameras.main.height - 50, "luz")
    .setDepth(1)
    .setScale(1);

  // --- ANIMACIONES ---
  this.crearAnimaciones();

  // --- PERSONAJE ---
  const ninja = this.physics.add.sprite(centerX, centerY, "dude")
    .setCollideWorldBounds(false)
    .setScale(0.4)
    .refreshBody();
  ninja.setVelocityY(-this.ninjaCurrentSpeed * 1.2);
  this.ninja = ninja;

  // --- OVERLAPS EDIFICIOS ---
  this.edificio1Overlap = this.physics.add.image(0, 360, "cubo").setScale(2, 11.5).refreshBody();
  this.edificio1Overlap.setSize(this.edificio1Overlap.displayWidth + 5, this.edificio1Overlap.displayHeight + 5).setVisible(false);

  this.edificio2Overlap = this.physics.add.image(1280, 360, "cubo").setScale(2, 11.5).refreshBody();
  this.edificio2Overlap.setSize(this.edificio2Overlap.displayWidth + 9, this.edificio2Overlap.displayHeight + 7).setVisible(false);

  this.physics.add.overlap(ninja, this.edificio1Overlap, () => this.puedeSaltar = true);
  this.physics.add.overlap(ninja, this.edificio2Overlap, () => this.puedeSaltar = true);

  // --- INPUT ---
  this.cursors = this.input.keyboard.createCursorKeys();

  // --- JARRONES ---
  this.jarrones = this.physics.add.group({ defaultKey: "jarron", collideWorldBounds: false });
  this.time.addEvent({
    delay: Phaser.Math.Between(3000, 7000),
    callback: this.iniciarJarrones,
    callbackScope: this
  });

  this.physics.add.overlap(this.ninja, this.jarrones, this.recogerJarron, null, this);

  // --- SIGILO ---
  this.sigilos = this.physics.add.group({ defaultKey: "sigilo", collideWorldBounds: false });
  this.tieneSigilo = false;

  this.physics.add.overlap(this.ninja, this.sigilos, this.activarSigilo, null, this);
  this.time.addEvent({
    delay: Phaser.Math.Between(5000, 10000),
    callback: this.generarSigilo,
    callbackScope: this
  });

  this.sigiloBarBg = this.add.rectangle(centerX, 700, 950, 24, 0x000000, 0.5).setScrollFactor(0).setDepth(1000).setVisible(false);
  this.sigiloBar = this.add.rectangle(centerX - 473, 700, 946, 20, 0x00ff00).setOrigin(0, 0.5).setScrollFactor(0).setDepth(1001).setVisible(false);
  this.sigiloBarFullWidth = 946;

  // --- ESTADO GENERAL ---
  this.gameOver = false;
  this.gameOverText = null;

  // --- CÁMARA ---
  this.cameras.main.startFollow(this.ninja, false, 0, 1);
  this.cameras.main.setLerp(0, 1);
  this.cameras.main.setBounds(0, -100000000, this.cameras.main.width, 10000000000);
  this.maxCamY = this.ninja.y;
  this.cameras.main.stopFollow();

  fondo.setCollisionByProperty({ Colisionable: true });
  this.physics.add.collider(ninja, fondo);

  // --- TILEMAP INFINITO ---
  this.tilemapLayers = [];
  this.tilemapHeightPx = 24 * 32;
  this.crearNuevaCapaTilemap(0);

  // --- PAUSA ---
  this.configurarBotonPausa();

  // --- SIERRAS --- 
  this.time.addEvent({
    delay: Phaser.Math.Between(500, 4000),  // retraso inicial aleatorio
    callback: this.generarSierraAleatoria,
    callbackScope: this
  });

  // --- SHURIKENS --- iniciar con retraso aleatorio
  this.time.addEvent({
    delay: Phaser.Math.Between(15000, 25000),
    callback: this.generarLluviaShurikens,
    callbackScope: this
  });

  // --- CRONÓMETRO ---
// Guardar tiempo inicial
this.tiempoInicial = this.time.now;

// Crear texto
this.textoCronometro = this.add.text(50, 50, '0.00s', {
  fontSize: '32px',
  fill: '#fff',
  fontFamily: 'Consolas'
})
.setDepth(1000)
.setScrollFactor(0);

// Crear marco (por ejemplo con tu sprite "marcolargo")
this.marcoCronometro = this.add.image(50, 50, "marcolargo")
.setDepth(999)
.setScrollFactor(0);

// Ajustar escala inicial
this.marcoCronometro.displayWidth = this.textoCronometro.width + 20; // margen extra
this.marcoCronometro.displayHeight = this.textoCronometro.height + 10; // opcional
}

// --- FUNCIONES DE ANIMACIONES ---
crearAnimaciones() {
  if (!this.anims.exists('animacion_der')) {
    this.anims.create({ key: "animacion_der", frames: this.anims.generateFrameNumbers("animacion_der", { start: 0, end: 7 }), frameRate: 12, repeat: -1 });
  }
  if (!this.anims.exists('animacion_izq')) {
    this.anims.create({ key: "animacion_izq", frames: this.anims.generateFrameNumbers("animacion_izq", { start: 0, end: 7 }), frameRate: 12, repeat: -1 });
  }
  if (!this.anims.exists('quieto_izq')) {
    this.anims.create({ key: 'quieto_izq', frames: [{ key: 'quieto_izq', frame: 0 }], frameRate: 1, repeat: -1 });
  }
  if (!this.anims.exists('quieto_der')) {
    this.anims.create({ key: 'quieto_der', frames: [{ key: 'quieto_der', frame: 0 }], frameRate: 1, repeat: -1 });
  }
  if (!this.anims.exists('caida')) {
    this.anims.create({ key: 'caida', frames: [{ key: 'dude', frame: 0 }], frameRate: 1, repeat: -1 });
  }
}

// --- FUNCIONES DE PAUSA ---
configurarBotonPausa() {

  this.cortinaPausa = this.add.rectangle(this.cameras.main.width / 2, this.cameras.main.height / 2, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.75)
    .setScrollFactor(0)
    .setDepth(999)
    .setVisible(false);

  this.botonPausa = this.add.image(this.cameras.main.width - 50, 50, "BotonPausa")
    .setInteractive({ useHandCursor: true })
    .setScrollFactor(0)
    .setDepth(1000)
    .setScale(0.04);

  // Fondo menú pausa (oculto inicialmente)
  this.menuPausaFondo = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, "FondoMenu")
    .setScrollFactor(0)
    .setDepth(1001)
    .setVisible(false)
    .setScale(0.3);

  // Botón Reiniciar
  this.botonReiniciar = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2 - 50, "ReiniciarNegro")
    .setScrollFactor(0)
    .setDepth(1002)
    .setInteractive({ useHandCursor: true })
    .setScale(0.3)
    .setVisible(false);

  // Botón Salir
  this.botonSalir = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2 + 50, "SalirNegro")
    .setScrollFactor(0)
    .setDepth(1002)
    .setInteractive({ useHandCursor: true })
    .setScale(0.3)
    .setVisible(false);

  this.pausado = false;

  this.botonPausa.on("pointerdown", () => { this.botonPausa.setScale(0.035); });
  this.botonPausa.on("pointerup", () => {
    this.botonPausa.setScale(0.04);
    this.pausado = !this.pausado;

    if (this.pausado) {
      this.physics.pause();
      this.time.paused = true;
      this.ninja.anims.pause();
      this.botonPausa.setTexture("BotonPlay");
      this.cortinaPausa.setVisible(true);

      // Mostrar menú pausa
      this.menuPausaFondo.setVisible(true);
      this.botonReiniciar.setVisible(true);
      this.botonSalir.setVisible(true);
    } else {
      this.physics.resume();
      this.time.paused = false;
      this.ninja.anims.resume();
      this.botonPausa.setTexture("BotonPausa");
      this.cortinaPausa.setVisible(false);

      // Ocultar menú pausa
      this.menuPausaFondo.setVisible(false);
      this.botonReiniciar.setVisible(false);
      this.botonSalir.setVisible(false);
    }
  });

  this.botonPausa.on("pointerout", () => { this.botonPausa.setScale(0.04); });

  /// Evento para botón Reiniciar
this.botonReiniciar.on("pointerdown", () => {
  this.physics.resume();
  this.time.paused = false;
  this.scene.restart();
});
this.botonReiniciar.on("pointerover", () => {
  this.botonReiniciar.setTexture("ReiniciarRosa");
  this.botonReiniciar.setScale(0.4);
});
this.botonReiniciar.on("pointerout", () => {
  this.botonReiniciar.setTexture("ReiniciarNegro");
  this.botonReiniciar.setScale(0.3);
});

  // Evento para botón Salir
this.botonSalir.on("pointerdown", () => {
  this.physics.resume();
  this.time.paused = false;
  this.scene.start("menu");
});
this.botonSalir.on("pointerover", () => {
  this.botonSalir.setTexture("SalirRosa");
  this.botonSalir.setScale(0.4);
});
this.botonSalir.on("pointerout", () => {
  this.botonSalir.setTexture("SalirNegro");
  this.botonSalir.setScale(0.3);
});
}

// --- FUNCIONES AUXILIARES DE JARRONES ---
iniciarJarrones() {
  const crearJarron = () => {
    const cam = this.cameras.main;
    const x = Phaser.Math.Between(500, this.cameras.main.width - 500);
    const y = cam.scrollY - Phaser.Math.Between(50, 150);

    const jarron = this.jarrones.create(x, y, "jarron").setVelocityY(Phaser.Math.Between(100, 200)).setScale(1.5);
    jarron.setBounce(0).setAngularVelocity(Phaser.Math.Between(-500, 500));

    this.time.addEvent({
      delay: Phaser.Math.Between(3000, 7000),
      callback: crearJarron,
      callbackScope: this
    });
  };
  crearJarron();
}

// --- FUNCIONES PARA TILEMAP INFINITO ---

crearNuevaCapaTilemap(offsetY) {
  const map = this.make.tilemap({ key: 'mapa' });
  const tileset = map.addTilesetImage('Ventanas', 'Ventana');
  const layer = map.createLayer('Edificios', tileset, 0, offsetY);

  layer.setCollisionByProperty({ Colisionable: true });
  layer.setDepth(1);

  const collider = this.physics.add.collider(this.ninja, layer);
  this.tilemapLayers.push({ layer, offsetY, collider });
}

crearOverlapsEdificios(offsetY) {
  const edificio1Overlap = this.physics.add.staticImage(0, offsetY + 360, "cubo");
  edificio1Overlap.setScale(5, 11.5).refreshBody();
  edificio1Overlap.setSize(edificio1Overlap.displayWidth + 5, edificio1Overlap.displayHeight + 5);
  edificio1Overlap.setVisible(false);

  const edificio2Overlap = this.physics.add.staticImage(1280, offsetY + 360, "cubo");
  edificio2Overlap.setScale(5, 11.5).refreshBody();
  edificio2Overlap.setSize(edificio2Overlap.displayWidth + 7, edificio2Overlap.displayHeight + 7);
  edificio2Overlap.setVisible(false);

  this.overlapsEdificios.push({ edificio1Overlap, edificio2Overlap, offsetY });

  if (this.ninja && edificio1Overlap) {
    this.physics.add.overlap(this.ninja, edificio1Overlap, () => {
      this.puedeSaltar = true;
    });
  }
  if (this.ninja && edificio2Overlap) {
    this.physics.add.overlap(this.ninja, edificio2Overlap, () => {
      this.puedeSaltar = true;
    });
  }
}

moverOverlapsEdificiosHaciaArriba() {
  const camTop = this.cameras.main.scrollY; 
  const offsetY = camTop - this.tilemapHeightPx;
  this.edificio1Overlap.y = offsetY + 360;
  this.edificio2Overlap.y = offsetY + 360;
  this.edificio1Overlap.setPosition(30, this.edificio1Overlap.y);
  this.edificio2Overlap.setPosition(1252, this.edificio2Overlap.y);
}

// --- FUNCIONES DE SIGILO ---

generarSigilo() {
  const cam = this.cameras.main;
  const x = Phaser.Math.Between(500, this.cameras.main.width - 500);
  const y = cam.scrollY - Phaser.Math.Between(100, 300);

  const sigilo = this.sigilos.create(x, y, "sigilo");
  sigilo.setScale(0.2).refreshBody();
  sigilo.setVelocityY(Phaser.Math.Between(50, 100));
  sigilo.setAlpha(0.8);
  sigilo.setDepth(10);

  this.time.addEvent({
    delay: Phaser.Math.Between(15000, 25000),
    callback: this.generarSigilo,
    callbackScope: this
  });
}

activarSigilo(ninja, sigilo) {
  sigilo.destroy();
  this.tieneSigilo = true;
  this.sigiloEndTime = this.time.now + this.sigiloDuration;
  ninja.setAlpha(0.5);

  this.sigiloBarBg.setVisible(true);
  this.sigiloBar.setVisible(true);
}

recogerJarron(ninja, jarron) {
  const textoDinero = this.add.text(jarron.x, jarron.y - 50, '$$$', { fontSize: '48px', fill: '#00ff00', fontFamily: 'Consolas', stroke: '#003300', strokeThickness: 2 }).setDepth(1000);

  this.tweens.add({
    targets: textoDinero,
    y: textoDinero.y - 30,
    alpha: 0,
    duration: 2000,
    ease: 'Power1',
    onComplete: () => textoDinero.destroy()
  });

  jarron.destroy();
  this.puntaje += 100;
  if (this.textoPuntaje) this.textoPuntaje.setText(`Puntaje: ${this.puntaje}`);
}

  mostrarGameOver() {
  this.gameOver = true;
  this.ninja.setVelocity(0, 0);
  this.ninja.setVisible(false);

  // Detener la física y los temporizadores
  this.physics.pause();
  this.time.paused = true;

  // Mostrar texto de Game Over
  this.gameOverText = this.add.text(
    this.cameras.main.scrollX + this.cameras.main.width / 2,
    this.cameras.main.scrollY + this.cameras.main.height / 2,
    'GAME OVER\nPresiona R para reiniciar',
    {
      fontSize: '48px',
      fill: '#ff0000',
      fontFamily: 'Consolas',
      align: 'center'
    }
  ).setOrigin(0.5);
}

generarSierraAleatoria() {
  const lado = Phaser.Math.Between(0, 1); // 0 = izquierda, 1 = derecha
  const x = lado === 0 ? 160 : this.cameras.main.width - 160;
  const y = this.cameras.main.scrollY - 100; // Generar arriba de la cámara

  const sierra = this.physics.add.image(x, y, "sierra");
  sierra.setScale(0.15).refreshBody();
  sierra.setGravityY(200);
  sierra.setAngularVelocity(1000);
  sierra.setCollideWorldBounds(false);
  sierra.setDepth(0);

  // Destruir la sierra al salir
  this.time.addEvent({
    delay: 10000,
    callback: () => {
      if (sierra && sierra.active) sierra.destroy();
    },
    callbackScope: this
  });

  // Colisión con ninja
  this.physics.add.overlap(this.ninja, sierra, () => {
    if (!this.tieneSigilo) {
      this.mostrarGameOver();
    }
  });

  // Nueva sierra tras delay
  this.time.addEvent({
    delay: Phaser.Math.Between(500, 4000),
    callback: this.generarSierraAleatoria,
    callbackScope: this
  });
}

generarLluviaShurikens() {
  const cam = this.cameras.main;

  // Límites de edificios
  const xIzq = this.edificio1Overlap.x + this.edificio1Overlap.displayWidth / 2;
  const xDer = this.edificio2Overlap.x - this.edificio2Overlap.displayWidth / 2;

  const anchoLibre = xDer - xIzq;
  const numShurikens = 12; // Cantidad de shurikens
  const separacionX = anchoLibre / (numShurikens + 1);

  // Línea fija para avisos - guardamos la Y relativa a la cámara
  this.avisoYRel = 150; // posición Y relativa a la cámara

  // Índice libre para hueco
  const indiceLibre = Phaser.Math.Between(1, numShurikens);

  // Array para guardar los avisos "!" y sus posiciones X
  this.avisos = [];

  // Mostrar avisos "!" en línea fija
  for (let i = 1; i <= numShurikens; i++) {
    if (i === indiceLibre) continue; // Hueco libre

    const x = xIzq + i * separacionX;
    // Posición Y inicial acorde a la cámara
    const aviso = this.add.image(x, cam.scrollY + this.avisoYRel, "!");
    aviso.setScale(0.02).setDepth(10);
    this.avisos.push({ aviso, x });
  }

  // Después de un delay, destruir avisos y crear shurikens cayendo desde arriba
  this.time.addEvent({
    delay: 2500, // Tiempo para que el jugador vea el aviso antes de que caigan
    callback: () => {
      // Destruir avisos
      this.avisos.forEach(({ aviso }) => {
        if (aviso && aviso.active) aviso.destroy();
      });

      // Crear shurikens en Y alto, mismos X que avisos
      const shurikenY = cam.scrollY - 100; // Generar arriba de la cámara para que caigan

      this.avisos.forEach(({ x }) => {
        const shuriken = this.physics.add.image(x, shurikenY, "shuriken");
        shuriken.setScale(0.05).refreshBody();
        shuriken.setVelocityY(Phaser.Math.Between(250, 350));
        
        // Giro aleatorio (sentido y velocidad)
        const giroVelocidad = Phaser.Math.Between(300, 800); // velocidad angular entre 300 y 800
        const giroSentido = Phaser.Math.Between(0, 1) === 0 ? -1 : 1; // -1 o 1
        shuriken.setAngularVelocity(giroVelocidad * giroSentido);

        shuriken.setDepth(5);

        // Destruir si baja demasiado
        this.time.addEvent({
          delay: 5000,
          callback: () => {
            if (shuriken && shuriken.active) shuriken.destroy();
          },
          callbackScope: this
        });

        // Colisión con ninja
        this.physics.add.overlap(this.ninja, shuriken, () => {
          if (!this.tieneSigilo) {
            this.mostrarGameOver();
          }
        });
      });

      this.avisos = []; // Limpiar array después de crear shurikens
    },
    callbackScope: this
  });

  // Repetir lluvia en 15-25 seg
  this.time.addEvent({
    delay: Phaser.Math.Between(15000, 25000),
    callback: this.generarLluviaShurikens,
    callbackScope: this
  });
}

update(time, delta) {
  // --- Luz ---
  this.luz.y = this.cameras.main.scrollY + this.cameras.main.height - 10;
  this.luzOffset += delta / 1000;
  const oscilacion = Math.sin(this.luzOffset * 2) * this.luzOscilacion;
  this.luz.y = this.cameras.main.scrollY + this.luzBaseY + oscilacion;
  this.luz.x = this.cameras.main.scrollX + this.cameras.main.width / 2;

  // --- Game Over ---
  if (this.gameOver) {
    if (this.input.keyboard.addKey('R').isDown) {
      this.physics.resume();
      this.time.paused = false;
      this.scene.restart();
    }
    return;
  }

  // --- Pausa ---
  if (this.pausado) return;

  // --- Sigilo ---
  if (this.tieneSigilo) {
    const remaining = Phaser.Math.Clamp(
      (this.sigiloEndTime - time) / this.sigiloDuration,
      0, 1
    );

    this.sigiloBar.width = this.sigiloBarFullWidth * remaining;
    const r = Math.floor(255 * (1 - remaining));
    const g = Math.floor(255 * remaining);
    const hex = (r << 16) | (g << 8);
    this.sigiloBar.setFillStyle(hex, 1);

    if (remaining <= 0) {
      this.tieneSigilo = false;
      this.ninja.setAlpha(1);
      this.sigiloBarBg.setVisible(false);
      this.sigiloBar.setVisible(false);
    }
  }

  // --- Animación dinámica ---
  if (this.animFrameRateActual < this.animFrameRateMax) {
    this.animFrameRateActual += this.animFrameRateIncrement * (delta / 1000);
    if (this.animFrameRateActual > this.animFrameRateMax) {
      this.animFrameRateActual = this.animFrameRateMax;
    }
    this.ninja.anims.msPerFrame = 1000 / this.animFrameRateActual;
  }

  // --- Overlaps ---
  this.puedeSaltar = false;
  const tocandoIzq = this.physics.overlap(this.ninja, this.edificio1Overlap);
  const tocandoDer = this.physics.overlap(this.ninja, this.edificio2Overlap);
  const arriba = this.cursors.up.isDown || this.input.keyboard.addKey('W').isDown;
  const lados = this.cursors.left.isDown || this.input.keyboard.addKey('A').isDown || this.cursors.right.isDown || this.input.keyboard.addKey('D').isDown;
  const abajo = arriba && this.puedeSaltar;
  this.puedeSaltar = tocandoIzq || tocandoDer;

  const ahora = this.time.now;

  // --- Movimiento izquierda ---
  if (tocandoIzq && arriba) {
    if (this.animacionActual !== "animacion_izq") {
      this.ninja.play("animacion_izq", true);
      this.ninja.x += 11;
      this.ninja.setSize(180, 180);
      this.ninja.setVelocityY(-this.ninjaCurrentSpeed);
      this.animacionActual = "animacion_izq";
    }
    this.tiempoSalidaOverlap = null;
  } else if (tocandoIzq && (!arriba || lados)) {
    if (this.animacionActual !== "quieto_izq") {
      this.ninja.play("quieto_izq");
      this.ninja.x -= 10.5;
      this.ninja.setSize(120, 210);
      this.ninja.setOffset(0, 0);
      this.animacionActual = "quieto_izq";
    }
    this.tiempoSalidaOverlap = null;
  }

  // --- Movimiento derecha ---
  if (tocandoDer && arriba) {
    if (this.animacionActual !== "animacion_der") {
      this.ninja.play("animacion_der", true);
      this.ninja.x -= 11;
      this.ninja.setSize(180, 180);
      this.ninja.setVelocityY(-this.ninjaCurrentSpeed);
      this.animacionActual = "animacion_der";
    }
    this.tiempoSalidaOverlap = null;
  } else if (tocandoDer && (!arriba || lados)) {
    if (this.animacionActual !== "quieto_der") {
      this.ninja.play("quieto_der");
      this.ninja.x += 10.5;
      this.ninja.setSize(120, 210);
      this.ninja.setOffset(0, 0);
      this.animacionActual = "quieto_der";
    }
    this.tiempoSalidaOverlap = null;
  }

  // --- Caída ---
  if (!tocandoIzq && !tocandoDer) {
    if (this.tiempoSalidaOverlap === null) {
      this.tiempoSalidaOverlap = ahora;
    } else if (ahora - this.tiempoSalidaOverlap > this.delayCaida) {
      if (this.animacionActual !== "caida") {
        this.ninja.play("caida");
        this.ninja.setSize(180, 180);
        this.ninja.setOffset(20, -10);
        this.animacionActual = "caida";
      }
    }
  } else {
    this.tiempoSalidaOverlap = null;
  }

  // --- Ajustes de velocidad y movimiento vertical ---
  if (this.puedeSaltar) {
    this.ninja.setVelocityY(100);
  }

  if (this.ninjaCurrentSpeed < this.ninjaSpeedMax) {
    this.ninjaCurrentSpeed += this.ninjaSpeedIncrement * (delta / 1000);
    if (this.ninjaCurrentSpeed > this.ninjaSpeedMax) {
      this.ninjaCurrentSpeed = this.ninjaSpeedMax;
    }
  }

  // --- Movimiento horizontal ---
  if (this.cursors.left.isDown || this.input.keyboard.addKey('A').isDown) {
    this.ninja.setVelocityX(-this.ninjaCurrentSpeed);
  } else if (this.cursors.right.isDown || this.input.keyboard.addKey('D').isDown) {
    this.ninja.setVelocityX(this.ninjaCurrentSpeed);
  } else {
    this.ninja.setVelocityX(0);
  }

  // --- Saltar / bajar rápido ---
  if ((this.cursors.up.isDown || this.input.keyboard.addKey('W').isDown) && this.puedeSaltar) {
    this.ninja.setVelocityY(-this.ninjaCurrentSpeed);
  }

  if ((this.cursors.down.isDown || this.input.keyboard.addKey('S').isDown) && this.puedeSaltar) {
    this.ninja.setVelocityY(this.ninjaCurrentSpeed / 3);
  }

  // --- Destruir jarrones ---
  this.jarrones.children.iterate(jarron => {
    if (jarron && jarron.y > this.cameras.main.height + 50) {
      jarron.destroy();
    }
  });

  // --- Perder si sale ---
  if (this.ninja.y > this.cameras.main.scrollY + this.cameras.main.height) {
    this.mostrarGameOver();
    return;
  }

  // --- Scroll de cámara ---
  let desplazamiento = 0;
  if (!this.pausado) {
    this.tiempoAcumulado += delta;

    if (this.camSpeed < this.maxSpeed) {
      this.camSpeed += this.increment * (delta / 1000);
      if (this.camSpeed > this.maxSpeed) this.camSpeed = this.maxSpeed;
    }

    desplazamiento = this.camSpeed * (delta / 1000);
    this.maxCamY -= desplazamiento;
    this.cameras.main.scrollY = this.maxCamY - this.cameras.main.height / 2;

    this.physics.world.setBounds(
      this.cameras.main.scrollX,
      this.cameras.main.scrollY,
      this.cameras.main.width,
      this.cameras.main.height
    );

    // Nueva capa tilemap si necesario
    const camTop = this.cameras.main.scrollY;
    const capaMasAlta = this.tilemapLayers[this.tilemapLayers.length - 1];
    if (camTop < capaMasAlta.offsetY + 32) {
      this.crearNuevaCapaTilemap(capaMasAlta.offsetY + 3 - this.tilemapHeightPx);
    }

    // Eliminar capas viejas
    const camBottom = this.cameras.main.scrollY + this.cameras.main.height;
    while (
      this.tilemapLayers.length > 1 &&
      this.tilemapLayers[0].offsetY > camBottom
    ) {
      const capa = this.tilemapLayers.shift();
      if (capa.collider) this.physics.world.removeCollider(capa.collider);
      if (capa.layer) capa.layer.destroy();

      const overlaps = this.overlapsEdificios.shift();
      if (overlaps) {
        if (overlaps.edificio1Overlap && overlaps.edificio1Overlap.body) overlaps.edificio1Overlap.destroy();
        if (overlaps.edificio2Overlap && overlaps.edificio2Overlap.body) overlaps.edificio2Overlap.destroy();
      }
    }

  // --- Limite superior ---
  const limiteSuperior = this.cameras.main.scrollY;
  const distancia = this.ninja.y - limiteSuperior;

  if (distancia <= 0) {
    this.ninja.y = limiteSuperior;
    this.ninja.setVelocityY(0);
  } else if (distancia < 100) {
    const factor = distancia / 100;
    this.ninja.setVelocityY(this.ninja.body.velocity.y * factor);
  }

  this.moverOverlapsEdificiosHaciaArriba();
}
// Actualizar posición Y de los avisos "!" para que sigan la cámara
  if (this.avisos && this.avisos.length > 0) {
    const camY = this.cameras.main.scrollY;
    this.avisos.forEach(({ aviso }) => {
      aviso.y = camY + this.avisoYRel;
    });
  }

  // --- CRONÓMETRO ---
const elapsed = (this.time.now - this.tiempoInicial) / 1000;
this.textoCronometro.setText(`${elapsed.toFixed(2)}s`);
this.marcoCronometro.displayWidth = this.textoCronometro.width + 20;

}
}