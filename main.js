const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 480,
  backgroundColor: '#bde0fe',
  physics: { default: 'arcade', arcade: { debug: false } },
  scene: { preload, create, update }
};

let ghost, cursors, trees, snowflakes, scoreText, gameOverText, restartText, snowParticles, avalanches, goldenSnowflakes, scorePopups;
let score = 0;
let scrollSpeed = 100;
let obstacleTimer = 0;
let snowflakeTimer = 0;
let avalancheTimer = 0;
let goldenSnowflakeTimer = 0;
let gameOver = false;
let baseObstacleSpawnRate = 1000; // Base spawn rate in milliseconds
let currentObstacleSpawnRate = 1000; // Current spawn rate in milliseconds
let currentDifficultyLevel = "Easy";
let isNightmareMode = false;

// Wind effect tracking
let windEffect = {
  active: false,
  direction: 'none',
  strength: 0,
  duration: 0
};
let avalancheSpawnRate = 3000; // Avalanche spawn rate in milliseconds

// Gameplay variables
let comboCount = 0;
let comboTimer = 0;
let lastComboTime = 0;

// Power-up system variables
let powerUps = null;
let activePowerUps = {
  shield: { active: false, timeLeft: 0 },
  speedBoost: { active: false, timeLeft: 0 },
  magnet: { active: false, timeLeft: 0 },
  ghostMode: { active: false, timeLeft: 0 },
  timeSlow: { active: false, timeLeft: 0 },
  snowflakeRain: { active: false, timeLeft: 0 }
};
let powerUpTimer = 0;

// Environmental effects variables
let windCurrents = null;
let environmentTimer = 0;

// Game state variables
let isPaused = false;
let gameTime = 0;
let itemsCollected = 0;
let currentGhostVariant = 'default';
let ghostTrail = null;
let gameState = 'title'; // 'title','playing', 'gameOver'
let titleScreen = null;
 
// UI elements
let pauseButton = null;
let settingsMenu = null;
let statsPanel = null;

// Mobile control variables
let mobileControls = {};
let isMobile = false;

// Visual effects variables
let screenShake = {
  intensity: 0,
  duration: 0,
  originalX: 0,
  originalY: 0
};
let trailParticles = null;

// Collision cooldown to prevent rapid-fire effects
let collisionCooldown = 0;

function createSprites() {
  try {
    // Create ghost sprite
    const ghostGraphics = this.add.graphics();
    ghostGraphics.fillStyle(0xffffff);
    ghostGraphics.fillCircle(20, 20, 15); // Main body
    ghostGraphics.fillRect(5, 20, 30, 20); // Lower body
    // Make wavy bottom
    ghostGraphics.fillTriangle(5, 40, 12, 45, 5, 45);
    ghostGraphics.fillTriangle(12, 40, 20, 45, 12, 45);
    ghostGraphics.fillTriangle(20, 40, 28, 45, 20, 45);
    ghostGraphics.fillTriangle(28, 40, 35, 45, 28, 45);
    // Eyes
    ghostGraphics.fillStyle(0x000000);
    ghostGraphics.fillCircle(15, 18, 2);
    ghostGraphics.fillCircle(25, 18, 2);
    ghostGraphics.generateTexture('ghost', 40, 50);
    ghostGraphics.destroy();
    
    // Create tree sprite
    const treeGraphics = this.add.graphics();
    // Brown trunk
    treeGraphics.fillStyle(0x8B4513);
    treeGraphics.fillRect(28, 45, 8, 15);
    // Green tree layers
    treeGraphics.fillStyle(0x228B22);
    treeGraphics.fillTriangle(20, 45, 44, 45, 32, 30);
    treeGraphics.fillTriangle(22, 35, 42, 35, 32, 22);
    treeGraphics.fillTriangle(24, 27, 40, 27, 32, 15);
    // Star on top
    treeGraphics.fillTriangle(30, 15, 34, 15, 32, 10);
    treeGraphics.generateTexture('christmasTree', 64, 60);
    treeGraphics.destroy();
  
  // Create snowy rock sprite
  const snowyRockGraphics = this.add.graphics();
  // Rock base
  snowyRockGraphics.fillStyle(0x696969);
  snowyRockGraphics.fillEllipse(25, 35, 30, 20);
  snowyRockGraphics.fillEllipse(20, 30, 20, 15);
  // Snow cap
  snowyRockGraphics.fillStyle(0xffffff);
  snowyRockGraphics.fillEllipse(25, 25, 32, 12);
  snowyRockGraphics.generateTexture('snowyRock', 50, 45);
  snowyRockGraphics.destroy();
  
  // Create snowflake sprite
  const flakeGraphics = this.add.graphics();
  flakeGraphics.fillStyle(0xffffff);
  flakeGraphics.fillCircle(8, 8, 4);
  flakeGraphics.generateTexture('flake', 16, 16);
  flakeGraphics.destroy();
  
  // Create golden snowflake sprite
  const goldenFlakeGraphics = this.add.graphics();
  goldenFlakeGraphics.fillStyle(0xffd700); // Gold color
  goldenFlakeGraphics.fillCircle(10, 10, 6); // Slightly larger
  goldenFlakeGraphics.fillStyle(0xffef94); // Light gold center
  goldenFlakeGraphics.fillCircle(10, 10, 3);
  goldenFlakeGraphics.generateTexture('goldenFlake', 20, 20);
  goldenFlakeGraphics.destroy();
  
  // Create power-up sprites
  // Shield power-up (blue crystal)
  const shieldGraphics = this.add.graphics();
  shieldGraphics.fillStyle(0x4169e1); // Royal blue
  shieldGraphics.fillRect(0, 6, 24, 12);
  shieldGraphics.fillStyle(0x87ceeb); // Sky blue
  shieldGraphics.fillRect(3, 9, 18, 6);
  shieldGraphics.generateTexture('shieldPowerUp', 24, 24);
  shieldGraphics.destroy();
  
  // Speed boost power-up (yellow lightning)
  const speedGraphics = this.add.graphics();
  speedGraphics.fillStyle(0xffff00); // Yellow
  speedGraphics.fillTriangle(8, 2, 16, 12, 12, 12);
  speedGraphics.fillTriangle(16, 12, 8, 22, 12, 12);
  speedGraphics.generateTexture('speedPowerUp', 24, 24);
  speedGraphics.destroy();
  
  // Magnet power-up (red/black horseshoe)
  const magnetGraphics = this.add.graphics();
  magnetGraphics.fillStyle(0xff0000); // Red
  magnetGraphics.fillCircle(12, 8, 8);
  magnetGraphics.fillStyle(0x000000); // Black hole in middle
  magnetGraphics.fillCircle(12, 8, 4);
  magnetGraphics.generateTexture('magnetPowerUp', 24, 24);
  magnetGraphics.destroy();
  
  // New power-ups
  // Ghost Mode power-up (purple with transparency effect)
  const ghostModeGraphics = this.add.graphics();
  ghostModeGraphics.fillStyle(0x9932cc); // Purple
  ghostModeGraphics.fillCircle(12, 12, 10);
  ghostModeGraphics.fillStyle(0xdda0dd); // Light purple center
  ghostModeGraphics.fillCircle(12, 12, 6);
  ghostModeGraphics.generateTexture('ghostModePowerUp', 24, 24);
  ghostModeGraphics.destroy();
  
  // Time Slow power-up (blue clock)
  const timeSlowGraphics = this.add.graphics();
  timeSlowGraphics.fillStyle(0x4169e1); // Blue
  timeSlowGraphics.fillCircle(12, 12, 10);
  timeSlowGraphics.fillStyle(0x87ceeb); // Light blue
  timeSlowGraphics.fillRect(11, 5, 2, 7); // Clock hand
  timeSlowGraphics.fillRect(8, 11, 8, 2); // Clock hand
  timeSlowGraphics.generateTexture('timeSlowPowerUp', 24, 24);
  timeSlowGraphics.destroy();
  
  // Snowflake Rain power-up (cyan cloud)
  const snowflakeRainGraphics = this.add.graphics();
  snowflakeRainGraphics.fillStyle(0x00ffff); // Cyan
  snowflakeRainGraphics.fillEllipse(12, 10, 20, 12);
  snowflakeRainGraphics.fillStyle(0xffffff); // White snowflakes
  snowflakeRainGraphics.fillCircle(8, 8, 1);
  snowflakeRainGraphics.fillCircle(16, 8, 1);
  snowflakeRainGraphics.fillCircle(12, 12, 1);
  snowflakeRainGraphics.generateTexture('snowflakeRainPowerUp', 24, 24);
  snowflakeRainGraphics.destroy();
  
  // Environmental effects
  const windGraphics = this.add.graphics();
  
  // Circular background color matching the game background (#bde0fe)
  windGraphics.fillStyle(0xbde0fe, 1.0);
  windGraphics.fillCircle(30, 30, 30); // Circle centered at (30,30) with radius 30
  
  // Create swirl pattern in blue/white
  windGraphics.lineStyle(3, 0x4169e1); // Blue swirls
  
  // Main swirl - clockwise spiral
  windGraphics.beginPath();
  const centerX = 30;
  const centerY = 30;
  
  // Create spiral points
  for (let angle = 0; angle < Math.PI * 4; angle += 0.2) {
    const radius = angle * 3;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    if (angle === 0) {
      windGraphics.moveTo(x, y);
    } else {
      windGraphics.lineTo(x, y);
    }
  }
  windGraphics.strokePath();
  
  // Secondary smaller swirls for more wind effect
  windGraphics.lineStyle(2, 0x87ceeb); // Light blue
  
  // Small swirl top-left
  windGraphics.beginPath();
  for (let angle = 0; angle < Math.PI * 2.5; angle += 0.3) {
    const radius = angle * 1.5;
    const x = 18 + Math.cos(angle) * radius;
    const y = 18 + Math.sin(angle) * radius;
    
    if (angle === 0) {
      windGraphics.moveTo(x, y);
    } else {
      windGraphics.lineTo(x, y);
    }
  }
  windGraphics.strokePath();
  
  // Small swirl bottom-right
  windGraphics.beginPath();
  for (let angle = 0; angle < Math.PI * 2.5; angle += 0.3) {
    const radius = angle * 1.5;
    const x = 42 + Math.cos(angle + Math.PI) * radius;
    const y = 42 + Math.sin(angle + Math.PI) * radius;
    
    if (angle === 0) {
      windGraphics.moveTo(x, y);
    } else {
      windGraphics.lineTo(x, y);
    }
  }
  windGraphics.strokePath();
  
  windGraphics.generateTexture('windCurrent', 60, 60);
  windGraphics.destroy();
  
  // Create avalanche sprite
  const avalancheGraphics = this.add.graphics();
  avalancheGraphics.fillStyle(0xe0e0e0); // Light gray snow mass
  avalancheGraphics.fillCircle(40, 40, 35); // Large main mass
  avalancheGraphics.fillStyle(0xffffff); // White snow chunks
  avalancheGraphics.fillCircle(25, 25, 15);
  avalancheGraphics.fillCircle(55, 30, 18);
  avalancheGraphics.fillCircle(45, 60, 12);
  avalancheGraphics.fillCircle(20, 55, 10);
  avalancheGraphics.generateTexture('avalanche', 80, 80);
  avalancheGraphics.destroy();
  
  } catch (error) {
    console.error('Error creating sprites:', error);
    throw error; // Re-throw to trigger fallback in create function
  }
}

function createTitleScreen() {
  // Create title screen elements
  titleScreen = this.add.group();
  
  // Background overlay
  const titleBG = this.add.graphics()
    .fillStyle(0x001122, 0.9)
    .fillRect(0, 0, 800, 480);
  titleScreen.add(titleBG);
  
  // Main title with glow effect
  const mainTitle = this.add.text(400, 170, 'Valley of the Ghosts', {
    fontSize: '48px',
    fill: '#ffffff',
    fontFamily: 'Arial',
    stroke: '#88ccff',
    strokeThickness: 3,
    shadow: {
      offsetX: 2,
      offsetY: 2,
      color: '#000000',
      blur: 10,
      fill: true
    }
  }).setOrigin(0.5);
  titleScreen.add(mainTitle);
  
  // Subtitle
  const subtitle = this.add.text(400, 220, 'A Winter Survival Adventure in the Monts-Valin, Qc', {
    fontSize: '20px',
    fill: '#ccddff',
    fontFamily: 'Arial',
    fontStyle: 'italic'
  }).setOrigin(0.5);
  titleScreen.add(subtitle);

  const subsubtitle = this.add.text(400, 250, ' To teach you real life stuff ', {
    fontSize: '16px',
    fill: '#ccddff',
    fontFamily: 'Arial',
    fontStyle: 'italic'
  }).setOrigin(0.5);
  titleScreen.add(subsubtitle);
  
  // Animated ghost in title
  const titleGhost = this.add.sprite(400, 80, 'ghost').setScale(1.5);
  titleScreen.add(titleGhost);
  
  // Floating animation for title ghost
  this.tweens.add({
    targets: titleGhost,
    y: titleGhost.y - 10,
    duration: 2000,
    ease: 'Sine.easeInOut',
    yoyo: true,
    repeat: -1
  });
  
  // Start button
  const startButton = this.add.text(400, 320, 'TAP TO START', {
    fontSize: '28px',
    fill: '#ffff00',
    fontFamily: 'Arial',
    fontWeight: 'bold'
  }).setOrigin(0.5).setInteractive();
  titleScreen.add(startButton);
  
  // Pulsing effect for start button
  this.tweens.add({
    targets: startButton,
    alpha: 0.6,
    duration: 1000,
    ease: 'Sine.easeInOut',
    yoyo: true,
    repeat: -1
  });
  
  // Version info
  const versionText = this.add.text(400, 450, 'October 2025 - 1.0.0', {
    fontSize: '14px',
    fill: '#666666',
    fontFamily: 'Arial'
  }).setOrigin(0.5);
  titleScreen.add(versionText);
  
  // Event handlers
  startButton.on('pointerdown', () => {
    this.tweens.add({
      targets: titleScreen.children.entries,
      alpha: 0,
      duration: 500,
      ease: 'Power2',
      onComplete: () => {
        titleScreen.setVisible(false);
        gameState = 'playing';
        startGame.call(this);
      }
    });
  });
}


function startGame() {
  // Initialize the actual game
  gameOver = false;
  score = 0;
  gameState = 'playing';
  
  // Show game UI
  scoreText.setVisible(true);
  ghost.setVisible(true);
  
  console.log('Game started!');
}

function createMobileControls() {
  // Detect if we're on mobile
  isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (!isMobile) return; // Only create mobile controls on mobile devices
  
  // Create semi-transparent control buttons
  const buttonAlpha = 0.6;
  const buttonSize = 60;
  
  // Up arrow button
  mobileControls.upButton = this.add.graphics()
    .fillStyle(0x333333, buttonAlpha)
    .fillCircle(buttonSize/2, buttonSize/2, buttonSize/2)
    .setPosition(50, 50)
    .setInteractive(new Phaser.Geom.Circle(buttonSize/2, buttonSize/2, buttonSize/2), Phaser.Geom.Circle.Contains)
    .setScrollFactor(0); // Stay fixed on screen
    
  // Add arrow shape for up button
  const upArrow = this.add.graphics()
    .fillStyle(0xffffff)
    .fillTriangle(30, 15, 15, 35, 45, 35)
    .setPosition(50, 50)
    .setScrollFactor(0);
    
  // Down arrow button
  mobileControls.downButton = this.add.graphics()
    .fillStyle(0x333333, buttonAlpha)
    .fillCircle(buttonSize/2, buttonSize/2, buttonSize/2)
    .setPosition(50, 130)
    .setInteractive(new Phaser.Geom.Circle(buttonSize/2, buttonSize/2, buttonSize/2), Phaser.Geom.Circle.Contains)
    .setScrollFactor(0);
    
  // Add arrow shape for down button
  const downArrow = this.add.graphics()
    .fillStyle(0xffffff)
    .fillTriangle(30, 45, 15, 25, 45, 25)
    .setPosition(50, 130)
    .setScrollFactor(0);
    
  // Left arrow button
  mobileControls.leftButton = this.add.graphics()
    .fillStyle(0x333333, buttonAlpha)
    .fillCircle(buttonSize/2, buttonSize/2, buttonSize/2)
    .setPosition(700, 400)
    .setInteractive(new Phaser.Geom.Circle(buttonSize/2, buttonSize/2, buttonSize/2), Phaser.Geom.Circle.Contains)
    .setScrollFactor(0);
    
  // Add arrow shape for left button
  const leftArrow = this.add.graphics()
    .fillStyle(0xffffff)
    .fillTriangle(15, 30, 35, 15, 35, 45)
    .setPosition(700, 400)
    .setScrollFactor(0);
    
  // Right arrow button
  mobileControls.rightButton = this.add.graphics()
    .fillStyle(0x333333, buttonAlpha)
    .fillCircle(buttonSize/2, buttonSize/2, buttonSize/2)
    .setPosition(700, 320)
    .setInteractive(new Phaser.Geom.Circle(buttonSize/2, buttonSize/2, buttonSize/2), Phaser.Geom.Circle.Contains)
    .setScrollFactor(0);
    
  // Add arrow shape for right button
  const rightArrow = this.add.graphics()
    .fillStyle(0xffffff)
    .fillTriangle(45, 30, 25, 15, 25, 45)
    .setPosition(700, 320)
    .setScrollFactor(0);
    
  // Add mobile control instructions
  const mobileInstructions = this.add.text(400, 450, 'Tap buttons to move • Tap screen to restart when game over', {
    fontSize: '16px',
    fill: '#FFFFFF',
    fontFamily: 'Arial',
    align: 'center'
  }).setOrigin(0.5).setScrollFactor(0);
  
  // Button event handlers with visual feedback
  // Up button
  mobileControls.upButton.on('pointerdown', () => { 
    mobileControls.upPressed = true;
    // Visual feedback - scale down and brighten
    this.tweens.add({
      targets: [mobileControls.upButton, upArrow],
      scaleX: 0.9,
      scaleY: 0.9,
      alpha: 0.9,
      duration: 100,
      ease: 'Power2'
    });
  });
  mobileControls.upButton.on('pointerup', () => { 
    mobileControls.upPressed = false;
    // Visual feedback - scale back to normal
    this.tweens.add({
      targets: [mobileControls.upButton, upArrow],
      scaleX: 1.0,
      scaleY: 1.0,
      alpha: buttonAlpha,
      duration: 150,
      ease: 'Power2'
    });
  });
  mobileControls.upButton.on('pointerout', () => { 
    mobileControls.upPressed = false;
    // Reset visual state
    this.tweens.add({
      targets: [mobileControls.upButton, upArrow],
      scaleX: 1.0,
      scaleY: 1.0,
      alpha: buttonAlpha,
      duration: 150,
      ease: 'Power2'
    });
  });
  
  // Down button
  mobileControls.downButton.on('pointerdown', () => { 
    mobileControls.downPressed = true;
    this.tweens.add({
      targets: [mobileControls.downButton, downArrow],
      scaleX: 0.9,
      scaleY: 0.9,
      alpha: 0.9,
      duration: 100,
      ease: 'Power2'
    });
  });
  mobileControls.downButton.on('pointerup', () => { 
    mobileControls.downPressed = false;
    this.tweens.add({
      targets: [mobileControls.downButton, downArrow],
      scaleX: 1.0,
      scaleY: 1.0,
      alpha: buttonAlpha,
      duration: 150,
      ease: 'Power2'
    });
  });
  mobileControls.downButton.on('pointerout', () => { 
    mobileControls.downPressed = false;
    this.tweens.add({
      targets: [mobileControls.downButton, downArrow],
      scaleX: 1.0,
      scaleY: 1.0,
      alpha: buttonAlpha,
      duration: 150,
      ease: 'Power2'
    });
  });
  
  // Left button
  mobileControls.leftButton.on('pointerdown', () => { 
    mobileControls.leftPressed = true;
    this.tweens.add({
      targets: [mobileControls.leftButton, leftArrow],
      scaleX: 0.9,
      scaleY: 0.9,
      alpha: 0.9,
      duration: 100,
      ease: 'Power2'
    });
  });
  mobileControls.leftButton.on('pointerup', () => { 
    mobileControls.leftPressed = false;
    this.tweens.add({
      targets: [mobileControls.leftButton, leftArrow],
      scaleX: 1.0,
      scaleY: 1.0,
      alpha: buttonAlpha,
      duration: 150,
      ease: 'Power2'
    });
  });
  mobileControls.leftButton.on('pointerout', () => { 
    mobileControls.leftPressed = false;
    this.tweens.add({
      targets: [mobileControls.leftButton, leftArrow],
      scaleX: 1.0,
      scaleY: 1.0,
      alpha: buttonAlpha,
      duration: 150,
      ease: 'Power2'
    });
  });
  
  // Right button
  mobileControls.rightButton.on('pointerdown', () => { 
    mobileControls.rightPressed = true;
    this.tweens.add({
      targets: [mobileControls.rightButton, rightArrow],
      scaleX: 0.9,
      scaleY: 0.9,
      alpha: 0.9,
      duration: 100,
      ease: 'Power2'
    });
  });
  mobileControls.rightButton.on('pointerup', () => { 
    mobileControls.rightPressed = false;
    this.tweens.add({
      targets: [mobileControls.rightButton, rightArrow],
      scaleX: 1.0,
      scaleY: 1.0,
      alpha: buttonAlpha,
      duration: 150,
      ease: 'Power2'
    });
  });
  mobileControls.rightButton.on('pointerout', () => { 
    mobileControls.rightPressed = false;
    this.tweens.add({
      targets: [mobileControls.rightButton, rightArrow],
      scaleX: 1.0,
      scaleY: 1.0,
      alpha: buttonAlpha,
      duration: 150,
      ease: 'Power2'
    });
  });
}

function createScreenShake(scene, intensity = 5, duration = 200) {
  // Create mild screen shake effect to avoid glitches
  try {
    // Limit intensity to prevent graphics issues
    const safeIntensity = Math.min(intensity, 10);
    const safeDuration = Math.min(duration, 300);
    
    // Only shake if not already shaking
    if (!scene.cameras.main.isShaking) {
      scene.cameras.main.shake(safeDuration, safeIntensity);
    }
  } catch (error) {
    console.warn('Error creating screen shake:', error);
  }
}

function createImpactEffect(scene, x, y, color = 0xffffff) {
  // Create impact particles with limited quantity
  try {
    const impactParticles = scene.add.particles(x, y, 'flake', {
      speed: { min: 80, max: 150 },
      scale: { start: 0.4, end: 0 },
      lifespan: 250,
      quantity: 5, // Reduced from 8 to prevent overload
      tint: color,
      blendMode: 'ADD'
    });
    
    // Clean up after animation
    scene.time.delayedCall(250, () => {
      if (impactParticles && impactParticles.active) {
        impactParticles.destroy();
      }
    });
  } catch (error) {
    console.warn('Error creating impact effect:', error);
  }
}

function createGhostTrail(scene) {
  // Prevent multiple trail systems
  if (trailParticles && trailParticles.active) {
    return; // Trail already exists
  }
  
  try {
    // Create trail particles for the ghost
    if (trailParticles) {
      trailParticles.destroy();
    }
    
    trailParticles = scene.add.particles(0, 0, 'flake', {
      follow: ghost,
      quantity: 2, // Reduced from 3
      speed: { min: 15, max: 30 },
      scale: { start: 0.2, end: 0 },
      lifespan: 400, // Reduced from 500
      alpha: { start: 0.5, end: 0 },
      tint: 0xaaddff,
      blendMode: 'ADD'
    });
  } catch (error) {
    console.warn('Error creating ghost trail:', error);
  }
}

function createPowerUpEffect(scene, x, y, text, color = 0x00ff00) {
  // Simplified power-up effect to prevent glitches
  try {
    // Just a simple sparkle burst
    createImpactEffect(scene, x, y, color);
  } catch (error) {
    console.warn('Error creating simple power-up effect:', error);
  }
}

function preload() {
  console.log('Preload completed');
  // Error handling
  this.load.on('loaderror', function(file) {
    console.error('Error loading file:', file);
  });
}

function create() {
  console.log('Create function started');
  
  // Create graphics textures first
  try {
    createSprites.call(this);
    console.log('Sprites created successfully');
  } catch (error) {
    console.error('Error creating sprites:', error);
    // Create fallback simple sprites
    this.add.graphics().fillStyle(0xffffff).fillRect(0, 0, 40, 50).generateTexture('ghost', 40, 50);
    this.add.graphics().fillStyle(0x228B22).fillRect(0, 0, 64, 60).generateTexture('christmasTree', 64, 60);
    this.add.graphics().fillStyle(0x696969).fillRect(0, 0, 50, 45).generateTexture('snowyRock', 50, 45);
    this.add.graphics().fillStyle(0xffffff).fillRect(0, 0, 16, 16).generateTexture('flake', 16, 16);
    console.log('Fallback sprites created');
  }
  
  // Create snowfall background with reduced particles
  snowParticles = this.add.particles(0, 0, 'flake', {
    x: { min: 0, max: 800 },
    y: 0,
    lifespan: 4000, // Reduced lifespan
    speedY: { min: 40, max: 80 }, // Slightly slower
    scale: { start: 0.25, end: 0.05 }, // Smaller particles
    frequency: 150, // Less frequent (was 100)
    blendMode: 'ADD'
  });

  // Store scene reference for background changes
  this.scene = this;

  // Create obstacle groups for scrolling
  trees = this.physics.add.group();

  // Add ghost (player) - initially hidden, centered vertically on left side
  ghost = this.physics.add.sprite(100, 240, 'ghost').setScale(0.8);
  ghost.setOrigin(0.5, 0.5);
  ghost.setCollideWorldBounds(true);
  ghost.setVisible(false); // Hide until game starts

  // Snowflakes (collectibles)
  snowflakes = this.physics.add.group();
  
  // Avalanches (danger)
  avalanches = this.physics.add.group();

  // Golden snowflakes (rare collectibles)
  goldenSnowflakes = this.physics.add.group();

  // Power-ups (temporary abilities)
  powerUps = this.physics.add.group();
  
  // Environmental effects groups
  windCurrents = this.physics.add.group();
  
  // Score popups group for floating text animations
  scorePopups = this.add.group();
  
  // Ghost trail for visual effects
  ghostTrail = this.add.group();

  // Score text - initially hidden
  scoreText = this.add.text(16, 16, 'Score: 0\nLevel: Easy', {
    fontSize: '20px',
    fill: '#000',
    fontFamily: 'Arial'
  });
  scoreText.setVisible(false); // Hide until game starts
  
  // Collisions and overlaps
  this.physics.add.overlap(ghost, trees, handleObstacleCollision, null, this);
  this.physics.add.overlap(ghost, snowflakes, collectFlake, null, this);
  this.physics.add.overlap(ghost, goldenSnowflakes, collectGoldenFlake, null, this);
  this.physics.add.overlap(ghost, powerUps, collectPowerUp, null, this);
  this.physics.add.overlap(ghost, avalanches, handleAvalancheHit, null, this);
  
  // Environmental effects collisions
  this.physics.add.overlap(ghost, windCurrents, handleWindCollision, null, this);

  // Controls
  cursors = this.input.keyboard.createCursorKeys();
  cursors.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  
  // Create mobile controls for touch devices
  createMobileControls.call(this);

  // Game over text (hidden initially)
  gameOverText = this.add.text(400, 200, 'GAME OVER!', {
    fontSize: '48px',
    fill: '#FF0000',
    fontFamily: 'Arial'
  }).setOrigin(0.5).setVisible(false);

  restartText = this.add.text(400, 280, 'Press to restart', {
    fontSize: '24px',
    fill: '#FFFFFF',
    fontFamily: 'Arial'
  }).setOrigin(0.5).setVisible(false);

  // Touch input for mobile (fallback)
  this.input.on('pointerdown', (pointer) => {
    if (gameOver) {
      restartGame.call(this);
      return;
    }
    
    // If mobile controls are available, don't use tap-to-move
    if (isMobile && mobileControls.upButton) {
      return;
    }
    
    const targetY = pointer.y;
    const currentY = ghost.y;
    const targetX = pointer.x;
    const currentX = ghost.x;
    
    // Vertical movement
    if (targetY < currentY - 20) {
      ghost.setVelocityY(-200);
    } else if (targetY > currentY + 20) {
      ghost.setVelocityY(200);
    }
    
    // Horizontal movement
    if (targetX < currentX - 20) {
      ghost.setVelocityX(-150);
    } else if (targetX > currentX + 20) {
      ghost.setVelocityX(150);
    }
  });
  
  // Initialize with title screen
  gameState = 'title';
  createTitleScreen.call(this);
  
  console.log('Game initialized with title screen');
}

function collectFlake(ghost, flake) {
  // Create sparkle effect for flake collection
  createImpactEffect.call(this, this, flake.x, flake.y, 0xaaddff);
  
  flake.disableBody(true, true);
  
  // Update combo system
  const currentTime = Date.now();
  if (currentTime - lastComboTime < 2000) { // Within 2 seconds = combo
    comboCount++;
  } else {
    comboCount = 1; // Reset combo
  }
  lastComboTime = currentTime;
  
  // Calculate points with combo bonus
  let points = 10;
  if (comboCount >= 5) points = 25; // 5+ combo = 2.5x
  else if (comboCount >= 3) points = 20; // 3+ combo = 2x
  else if (comboCount >= 2) points = 15; // 2+ combo = 1.5x
  
  score += points;
  
  // Create score popup
  createScorePopup.call(this, flake.x, flake.y, `+${points}`, comboCount > 1 ? 'combo' : 'normal');
  
  // Show combo indicator
  if (comboCount > 1) {
    createScorePopup.call(this, flake.x, flake.y - 20, `${comboCount}x COMBO!`, 'combo');
  }
  
  // Continuously increase difficulty (spawn rate and speed)
  // Reduce spawn time by 50ms for every 10 points
  // Minimum spawn rate of 200ms for ultimate challenge
  currentObstacleSpawnRate = Math.max(200, baseObstacleSpawnRate - (score * 5));
  
  // Increase scroll speed for extra challenge
  scrollSpeed = Math.min(250, 100 + (score * 0.8));
  
  // Determine difficulty level for display
  let newDifficultyLevel = "Easy";
  if (score >= 500) newDifficultyLevel = "Nightmare";
  else if (score >= 300) newDifficultyLevel = "Insane";
  else if (score >= 200) newDifficultyLevel = "Hard";
  else if (score >= 100) newDifficultyLevel = "Medium";
  
  // Check if we've entered nightmare mode for the first time
  if (newDifficultyLevel === "Nightmare" && !isNightmareMode) {
    activateNightmareMode.call(this);
  }
  
  // Update difficulty level if it has changed
  if (newDifficultyLevel !== currentDifficultyLevel) {
    currentDifficultyLevel = newDifficultyLevel;
    console.log(`Difficulty level increased to: ${currentDifficultyLevel}!`);
  }
  
  scoreText.setText(`Score: ${score}\nLevel: ${currentDifficultyLevel}`);
  
  console.log(`Score: ${score}, Spawn rate: ${currentObstacleSpawnRate}ms, Speed: ${scrollSpeed}`);
  
  flake.destroy();
}

function collectGoldenFlake(ghost, goldenFlake) {
  goldenFlake.disableBody(true, true);
  
  // Golden snowflakes are worth 50 points regardless of combo
  score += 50;
  
  // Create special golden score popup
  createScorePopup.call(this, goldenFlake.x, goldenFlake.y, '+50', 'golden');
  createScorePopup.call(this, goldenFlake.x, goldenFlake.y - 25, 'GOLDEN!', 'golden');
  
  scoreText.setText(`Score: ${score}\nLevel: ${currentDifficultyLevel}`);
  
  console.log(`✨ Golden snowflake collected! +50 points! Total: ${score}`);
  
  goldenFlake.destroy();
}

function collectPowerUp(ghost, powerUp) {
  const powerUpType = powerUp.getData('type');
  
  // Create simple effect based on type (reduced intensity)
  let effectColor = 0x00ff00;
  if (powerUpType === 'shield') effectColor = 0x00aaff;
  else if (powerUpType === 'speed') effectColor = 0xffff00;
  else if (powerUpType === 'magnet') effectColor = 0xff00ff;
  else if (powerUpType === 'ghostMode') effectColor = 0xffffff;
  else if (powerUpType === 'timeSlow') effectColor = 0x00ffff;
  
  // Simple sparkle effect instead of complex power-up effect
  createImpactEffect(this, powerUp.x, powerUp.y, effectColor);
  
  powerUp.disableBody(true, true);
  
  // Activate the power-up
  if (powerUpType === 'shield') {
    activePowerUps.shield.active = true;
    activePowerUps.shield.timeLeft = 5000; // 5 seconds
    createScorePopup.call(this, powerUp.x, powerUp.y, 'SHIELD!', 'powerup');
  } else if (powerUpType === 'speed') {
    activePowerUps.speedBoost.active = true;
    activePowerUps.speedBoost.timeLeft = 3000; // 3 seconds
    createGhostTrail.call(this, this); // Add trail effect for speed boost
    createScorePopup.call(this, powerUp.x, powerUp.y, 'SPEED!', 'powerup');
  } else if (powerUpType === 'magnet') {
    activePowerUps.magnet.active = true;
    activePowerUps.magnet.timeLeft = 4000; // 4 seconds
    createScorePopup.call(this, powerUp.x, powerUp.y, 'MAGNET!', 'powerup');
  } else if (powerUpType === 'ghostMode') {
    activePowerUps.ghostMode.active = true;
    activePowerUps.ghostMode.timeLeft = 6000; // 6 seconds
    ghost.setAlpha(0.5); // Make ghost semi-transparent
    createScorePopup.call(this, powerUp.x, powerUp.y, 'GHOST MODE!', 'powerup');
  } else if (powerUpType === 'timeSlow') {
    activePowerUps.timeSlow.active = true;
    activePowerUps.timeSlow.timeLeft = 4000; // 4 seconds
    // Slow down time by reducing game speed
    this.physics.world.timeScale = 0.5;
    createScorePopup.call(this, powerUp.x, powerUp.y, 'TIME SLOW!', 'powerup');
  } else if (powerUpType === 'snowflakeRain') {
    activePowerUps.snowflakeRain.active = true;
    activePowerUps.snowflakeRain.timeLeft = 5000; // 5 seconds
    createScorePopup.call(this, powerUp.x, powerUp.y, 'SNOWFLAKE RAIN!', 'powerup');
    // Trigger extra snowflake spawning
    triggerSnowflakeRain.call(this);
  }
  
  console.log(`🚀 Power-up collected: ${powerUpType}`);
  powerUp.destroy();
}

function triggerSnowflakeRain() {
  // Spawn multiple snowflakes for the rain effect
  const scene = this; // Capture the scene context
  for (let i = 0; i < 15; i++) {
    scene.time.delayedCall(i * 200, () => {
      if (activePowerUps.snowflakeRain.active) {
        spawnSnowflake.call(scene);
      }
    });
  }
}

function createScorePopup(x, y, text, type) {
  let color = '#FFFFFF';
  let fontSize = '16px';
  
  if (type === 'golden') {
    color = '#FFD700';
    fontSize = '20px';
  } else if (type === 'combo') {
    color = '#FF6B6B';
    fontSize = '14px';
  } else if (type === 'damage') {
    color = '#FF0000';
    fontSize = '18px';
  } else if (type === 'powerup') {
    color = '#00FF00';
    fontSize = '18px';
  }
  
  const popup = this.add.text(x, y, text, {
    fontSize: fontSize,
    fill: color,
    fontFamily: 'Arial',
    stroke: '#000000',
    strokeThickness: 2
  }).setOrigin(0.5);
  
  // Add to score popups group
  scorePopups.add(popup);
  
  // Animate the popup
  this.tweens.add({
    targets: popup,
    y: y - 50,
    alpha: 0,
    duration: 1000,
    ease: 'Power2',
    onComplete: () => {
      popup.destroy();
    }
  });
}

function handleObstacleCollision(ghost, obstacle) {
  // Collision cooldown to prevent rapid-fire effects
  if (collisionCooldown > 0) {
    return; // Skip visual effects but still handle collision
  }
  
  // Check if shield is active
  if (activePowerUps.shield.active) {
    // Shield blocks the obstacle - simple effect
    createImpactEffect(this, obstacle.x, obstacle.y, 0x00aaff);
    obstacle.destroy();
    activePowerUps.shield.active = false; // Shield is consumed
    createScorePopup.call(this, obstacle.x, obstacle.y, 'BLOCKED!', 'powerup');
    console.log('Shield blocked obstacle!');
    return;
  }
  
  // Check if ghost mode is active (pass through obstacles)
  if (activePowerUps.ghostMode.active) {
    return; // Pass through obstacles without damage
  }
  
  // Set collision cooldown
  collisionCooldown = 300; // 300ms cooldown
  
  // Push back
  const pushDistance = 15; // Small, controlled push distance
  ghost.x = Math.max(20, ghost.x - pushDistance);
  
  // Stop any rightward velocity to prevent pushing through
  if (ghost.body.velocity.x > 0) {
    ghost.setVelocityX(0);
  }
  
  // Check for game over only if ghost has been pushed to the left edge
  if (ghost.x <= 20) {
    triggerGameOver.call(this);
  }
}

function handleAvalancheHit(ghost, avalanche) {
  // Avalanche hits decrease score by 10 points
  avalanche.destroy();
  score = Math.max(0, score - 10); // Prevent negative scores
  
  // Reset combo on hit
  comboCount = 0;
  
  // Create damage popup
  createScorePopup.call(this, avalanche.x, avalanche.y, '-10', 'damage');
  
  // Update score display
  scoreText.setText(`Score: ${score}\nLevel: ${currentDifficultyLevel}`);
  
  // Visual feedback
  this.cameras.main.shake(200, 0.01); // Screen shake
  this.cameras.main.flash(200, 255, 100, 100); // Red flash
  
  console.log('Hit by avalanche! Score decreased by 10. Current score:', score);
}

function activateNightmareMode() {
  isNightmareMode = true;
  console.log("NIGHTMARE MODE ACTIVATED!");
  
  // Darken the background to a stormy dark blue
  this.cameras.main.setBackgroundColor('#1a237e'); // Dark blue instead of light blue
  
  // Change score text to red for nightmare atmosphere
  scoreText.setStyle({ fill: '#FF0000' }); // Red score text
  
  // Intensify the snow storm
  snowParticles.setConfig({
    x: { min: -100, max: 900 }, // Wider spawn area
    y: { min: -50, max: 0 },
    lifespan: { min: 3000, max: 7000 }, // Varied lifespan
    speedY: { min: 100, max: 200 }, // Much faster falling snow
    speedX: { min: -50, max: 50 }, // Add horizontal wind effect
    scale: { start: 0.5, end: 0.1 }, // Larger snowflakes
    frequency: 50, // Double the snow density
    blendMode: 'ADD',
    alpha: { start: 0.8, end: 0.3 } // More visible snow
  });
  
  // Flash the screen briefly to indicate the mode change
  this.cameras.main.flash(500, 100, 100, 255); // Blue flash
}

function update(time, delta) {
  // Handle different game states
  if (gameState === 'title') {
    // Only update background effects in title
    return;
  }
  
  // Check if game is over
  if (gameOver) {
    ghost.setVelocity(0);
    // Check for restart input
    if (Phaser.Input.Keyboard.JustDown(cursors.space)) {
      restartGame.call(this);
    }
    return;
  }
  
  // Only proceed if we're actually playing
  if (gameState !== 'playing') {
    return;
  }

  // Keyboard and mobile controls
  let baseVelocityX = 0;
  let baseVelocityY = 0;
  
  // Apply speed boost if active
  const speedMultiplier = activePowerUps.speedBoost.active ? 1.5 : 1.0;
  
  // Keyboard controls
  if (cursors.up.isDown) baseVelocityY = -200 * speedMultiplier;
  if (cursors.down.isDown) baseVelocityY = 200 * speedMultiplier;
  if (cursors.left.isDown) baseVelocityX = -150 * speedMultiplier; // Backward movement
  if (cursors.right.isDown) baseVelocityX = 150 * speedMultiplier; // Forward movement
  
  // Mobile controls (if available)
  if (isMobile && mobileControls) {
    if (mobileControls.upPressed) baseVelocityY = -200 * speedMultiplier;
    if (mobileControls.downPressed) baseVelocityY = 200 * speedMultiplier;
    if (mobileControls.leftPressed) baseVelocityX = -150 * speedMultiplier;
    if (mobileControls.rightPressed) baseVelocityX = 150 * speedMultiplier;
  }
  
  // Apply wind effects if active - DIRECT velocity application
  if (windEffect.active) {
    windEffect.duration -= delta;
    
    if (windEffect.duration > 0) {
      const windForce = 250 * windEffect.strength; // Moderate force
      let windVelX = 0;
      let windVelY = 0;
      
      switch(windEffect.direction) {
        case 'up':
          windVelY = -windForce; // Push UP (negative Y)
          break;
        case 'down':
          windVelY = windForce; // Push DOWN (positive Y)
          break;
        case 'left':
          windVelX = -windForce * 0.8; // Push LEFT (negative X)
          break;
        case 'right':
          windVelX = windForce * 0.8; // Push RIGHT (positive X)
          break;
        case 'spiral':
          const angle = Date.now() * 0.01;
          windVelX = Math.cos(angle) * windForce * 0.7;
          windVelY = Math.sin(angle) * windForce * 0.7;
          break;
      }
      
      // Apply wind force as additional velocity
      baseVelocityX += windVelX;
      baseVelocityY += windVelY;
      
      // Debug log to verify wind is being applied
      console.log(`Wind ${windEffect.direction}: adding velocity (${windVelX}, ${windVelY})`);
    } else {
      windEffect.active = false;
      windEffect.direction = 'none';
      windEffect.strength = 0;
      console.log('Wind effect ended');
    }
  }
  
  // Set final velocity
  ghost.setVelocity(baseVelocityX, baseVelocityY);

  // Continuous collision check to prevent pass-through when stationary
  if (!activePowerUps.ghostMode.active) {
    trees.children.entries.forEach(obstacle => {
      if (this.physics.overlap(ghost, obstacle)) {
        // Ghost is overlapping with obstacle - push it away
        const pushDistance = 15;
        ghost.x = Math.max(20, ghost.x - pushDistance);
        
        // Stop any rightward velocity
        if (ghost.body.velocity.x > 0) {
          ghost.setVelocityX(0);
        }
        
        // Check for game over
        if (ghost.x <= 20) {
          triggerGameOver.call(this);
        }
      }
    });
  }

  // Move all obstacles to the left (scrolling effect)
  trees.children.entries.forEach(obstacle => {
    obstacle.x -= scrollSpeed * delta / 1000;
    
    // Remove obstacles that have moved off screen
    if (obstacle.x < -50) {
      obstacle.destroy();
    }
  });

  // Move all snowflakes to the left
  snowflakes.children.entries.forEach(flake => {
    flake.x -= scrollSpeed * delta / 1000;
    
    // Remove snowflakes that have moved off screen
    if (flake.x < -50) {
      flake.destroy();
    }
  });
  
  // Move all golden snowflakes to the left with sparkle effect
  goldenSnowflakes.children.entries.forEach(goldenFlake => {
    goldenFlake.x -= scrollSpeed * delta / 1000;
    
    // Add subtle floating animation
    goldenFlake.y += Math.sin(goldenFlake.x * 0.01) * 0.5;
    
    // Remove golden snowflakes that have moved off screen
    if (goldenFlake.x < -50) {
      goldenFlake.destroy();
    }
  });

  // Move all power-ups to the left with gentle bob
  powerUps.children.entries.forEach(powerUp => {
    powerUp.x -= scrollSpeed * delta / 1000;
    
    // Add gentle bobbing animation
    powerUp.y += Math.sin(powerUp.x * 0.02) * 0.3;
    
    // Remove power-ups that have moved off screen
    if (powerUp.x < -50) {
      powerUp.destroy();
    }
  });
  
  // Move all avalanches to the left and down
  avalanches.children.entries.forEach(avalanche => {
    // Basic horizontal movement
    avalanche.x -= scrollSpeed * delta / 1000 * 1.2;
    
    // Handle special movement patterns
    const pattern = avalanche.getData('pattern');
    const timer = avalanche.getData('timer') || 0;
    const newTimer = timer + delta;
    avalanche.setData('timer', newTimer);
    
    if (pattern === 'zigzag') {
      // Zigzag pattern, change vertical direction every 800ms
      if (Math.floor(newTimer / 800) % 2 === 0) {
        avalanche.setVelocityY(Math.abs(avalanche.body.velocity.y));
      } else {
        avalanche.setVelocityY(-Math.abs(avalanche.body.velocity.y));
      }
    } else if (pattern === 'curved') {
      // Curved pattern, gradually increase downward speed
      const newVelY = 30 + (newTimer / 20); // Accelerating fall
      avalanche.setVelocityY(Math.min(newVelY, 180));
    }
    
    // Remove avalanches that have moved off screen or fallen too low
    if (avalanche.x < -100 || avalanche.y > 500 || avalanche.y < -50) {
      avalanche.destroy();
    }
  });
  
  // Cleanup environmental effects that move off screen
  windCurrents.children.entries.forEach(wind => {
    wind.x -= scrollSpeed * delta / 1000 * 0.6;
    if (wind.x < -120) {
      wind.destroy();
    }
  });

  // Spawn new obstacles dynamically based on current spawn rate
  obstacleTimer += delta;
  if (obstacleTimer > currentObstacleSpawnRate) {
    spawnObstacle.call(this);
    obstacleTimer = 0;
  }

  // Spawn new snowflakes
  snowflakeTimer += delta;
  if (snowflakeTimer > 1200) {
    spawnSnowflake.call(this);
    snowflakeTimer = 0;
  }
  
  // Spawn golden snowflakes (every 8-15 seconds)
  goldenSnowflakeTimer += delta;
  if (goldenSnowflakeTimer > Phaser.Math.Between(8000, 15000)) {
    spawnGoldenSnowflake.call(this);
    goldenSnowflakeTimer = 0;
  }
  
  // Spawn power-ups (every 15-25 seconds, only after score 30)
  if (score >= 30) {
    powerUpTimer += delta;
    if (powerUpTimer > Phaser.Math.Between(15000, 25000)) {
      spawnPowerUp.call(this);
      powerUpTimer = 0;
    }
  }
  
  // Spawn environmental effects based on score
  environmentTimer += delta;
  if (environmentTimer > Phaser.Math.Between(8000, 15000)) {
    spawnEnvironmentalEffect.call(this);
    environmentTimer = 0;
  }
  
  // Update active power-ups
  updatePowerUps.call(this, delta);
  
  // Spawn avalanches when score is between 200-500 (Hard and Insane difficulty)
  if (score >= 200 && score < 500) {
    avalancheTimer += delta;
    if (avalancheTimer > avalancheSpawnRate) {
      spawnAvalanche.call(this);
      avalancheTimer = 0;
    }
  }

  // Check for game over condition = pushed to left screen edge
  if (ghost.x < 20) {
    triggerGameOver.call(this);
  }
}

function spawnObstacle() {
  const obstacleType = Phaser.Math.RND.pick(['christmasTree', 'snowyRock']);
  const y = Phaser.Math.Between(100, 400); // MIXED throughout screen
  const obstacle = trees.create(850, y, obstacleType);
  obstacle.setScale(0.8);
  obstacle.body.setImmovable(true); // Immovable for collision detection only
  obstacle.body.setSize(obstacle.displayWidth * 0.8, obstacle.displayHeight * 0.8); // Tighter collision box
}

function spawnSnowflake() {
  const x = 850;
  const y = Phaser.Math.Between(50, 430); // MIXED throughout screen
  const flake = snowflakes.create(x, y, 'flake');
  flake.setScale(0.8);
}

function spawnGoldenSnowflake() {
  const x = 850;
  const y = Phaser.Math.Between(100, 380); // Slightly more centered spawn
  const goldenFlake = goldenSnowflakes.create(x, y, 'goldenFlake');
  goldenFlake.setScale(1.0);
  
  // Add glowing effect
  goldenFlake.setTint(0xffd700);
  
  console.log('✨ Golden snowflake spawned! Worth 50 points!');
}

function spawnPowerUp() {
  const x = 850;
  const y = Phaser.Math.Between(120, 360); // Safe spawn area
  
  // Randomly choose power-up type, add new types based on score
  let powerUpTypes = ['shield', 'speed', 'magnet'];
  
  if (score >= 50) {
    powerUpTypes.push('ghostMode', 'ghostMode'); // Add twice for higher frequency
  }
  if (score >= 100) {
    powerUpTypes.push('timeSlow');
  }
  if (score >= 150) {
    powerUpTypes.push('snowflakeRain');
  }
  
  const powerUpType = Phaser.Math.RND.pick(powerUpTypes);
  
  let spriteKey;
  if (powerUpType === 'shield') spriteKey = 'shieldPowerUp';
  else if (powerUpType === 'speed') spriteKey = 'speedPowerUp';
  else if (powerUpType === 'magnet') spriteKey = 'magnetPowerUp';
  else if (powerUpType === 'ghostMode') spriteKey = 'ghostModePowerUp';
  else if (powerUpType === 'timeSlow') spriteKey = 'timeSlowPowerUp';
  else if (powerUpType === 'snowflakeRain') spriteKey = 'snowflakeRainPowerUp';
  
  const powerUp = powerUps.create(x, y, spriteKey);
  powerUp.setScale(1.0);
  powerUp.setData('type', powerUpType);
  
  console.log(`Power-up spawned: ${powerUpType}`);
}

function spawnEnvironmentalEffect() {
  const x = 850;
  const y = Phaser.Math.Between(80, 400);
  
  // Only wind currents now
  const wind = windCurrents.create(x, y, 'windCurrent');
  wind.setScale(1.2);
  wind.setVelocityX(-scrollSpeed * 0.6);
  
  // Enhanced wind types with varying difficulty
  let direction, strength;
  if (score < 150) {
    // Basic winds
    direction = Phaser.Math.RND.pick(['up', 'down', 'left', 'right']);
    strength = Phaser.Math.Between(0.8, 1.2);
  } else if (score < 250) {
    // Stronger winds
    direction = Phaser.Math.RND.pick(['up', 'down', 'left', 'right']);
    strength = Phaser.Math.Between(1.0, 1.8);
  } else {
    // Add spiral winds for high scores
    direction = Phaser.Math.RND.pick(['up', 'down', 'left', 'right', 'spiral']);
    strength = Phaser.Math.Between(1.2, 2.0);
  }
  
  wind.setData('direction', direction);
  wind.setData('strength', strength);
  
  // Visual indication of wind direction and strength
  const rotation = direction === 'up' ? 0 : direction === 'right' ? Math.PI/2 : 
                  direction === 'down' ? Math.PI : direction === 'spiral' ? 0 : -Math.PI/2;
  wind.setRotation(rotation);
  
  // Stronger winds are larger and more transparent
  if (strength > 1.5) {
    wind.setScale(1.5);
    wind.setAlpha(0.8);
  }
  
  console.log(`Wind current spawned: ${direction} (strength: ${strength})`);
}

function updatePowerUps(delta) {
  // Update collision cooldown
  if (collisionCooldown > 0) {
    collisionCooldown -= delta;
    if (collisionCooldown < 0) collisionCooldown = 0;
  }
  
  // Update shield power-up
  if (activePowerUps.shield.active) {
    activePowerUps.shield.timeLeft -= delta;
    if (activePowerUps.shield.timeLeft <= 0) {
      activePowerUps.shield.active = false;
      console.log('Shield power-up expired');
    }
  }
  
  // Update speed boost power-up
  if (activePowerUps.speedBoost.active) {
    activePowerUps.speedBoost.timeLeft -= delta;
    if (activePowerUps.speedBoost.timeLeft <= 0) {
      activePowerUps.speedBoost.active = false;
      // Clean up trail effect when speed boost expires
      if (trailParticles && trailParticles.active) {
        trailParticles.destroy();
        trailParticles = null;
      }
      console.log('⚡ Speed boost expired');
    }
  }
  
  // Update magnet power-up
  if (activePowerUps.magnet.active) {
    activePowerUps.magnet.timeLeft -= delta;
    if (activePowerUps.magnet.timeLeft <= 0) {
      activePowerUps.magnet.active = false;
      console.log('Magnet power-up expired');
    }
    
    // Apply magnet effect - attract nearby snowflakes
    snowflakes.children.entries.forEach(flake => {
      const distance = Phaser.Math.Distance.Between(ghost.x, ghost.y, flake.x, flake.y);
      if (distance < 100) { // Within magnet range
        const angle = Phaser.Math.Angle.Between(flake.x, flake.y, ghost.x, ghost.y);
        flake.x += Math.cos(angle) * 3;
        flake.y += Math.sin(angle) * 3;
      }
    });
  }
  
  // Update ghost mode power-up
  if (activePowerUps.ghostMode.active) {
    activePowerUps.ghostMode.timeLeft -= delta;
    if (activePowerUps.ghostMode.timeLeft <= 0) {
      activePowerUps.ghostMode.active = false;
      ghost.setAlpha(1); // Restore full opacity
      console.log('Ghost mode expired');
    }
  }
  
  // Update time slow power-up
  if (activePowerUps.timeSlow.active) {
    activePowerUps.timeSlow.timeLeft -= delta;
    if (activePowerUps.timeSlow.timeLeft <= 0) {
      activePowerUps.timeSlow.active = false;
      this.physics.world.timeScale = 1; // Restore normal time
      console.log('Time slow expired');
    }
  }
  
  // Update snowflake rain power-up
  if (activePowerUps.snowflakeRain.active) {
    activePowerUps.snowflakeRain.timeLeft -= delta;
    if (activePowerUps.snowflakeRain.timeLeft <= 0) {
      activePowerUps.snowflakeRain.active = false;
      console.log('Snowflake rain expired');
    }
  }
}

function spawnAvalanche() {
  const x = 850;
  const y = Phaser.Math.Between(50, 300); // Upper part of screen
  const avalanche = avalanches.create(x, y, 'avalanche');
  avalanche.setScale(0.6);
  
  // Randomize avalanche direction each time
  const direction = Phaser.Math.RND.pick(['diagonal-down', 'straight-down', 'zigzag', 'curved']);
  
  switch(direction) {
    case 'diagonal-down':
      // Diagonal movement - down and left
      avalanche.setVelocityX(-scrollSpeed * 1.5);
      avalanche.setVelocityY(Phaser.Math.Between(80, 120));
      break;
      
    case 'straight-down':
      // Straight down fall
      avalanche.setVelocityX(-scrollSpeed * 0.8);
      avalanche.setVelocityY(Phaser.Math.Between(150, 200));
      break;
      
    case 'zigzag':
      // Starts diagonal, will change direction in update
      avalanche.setVelocityX(-scrollSpeed * 1.2);
      avalanche.setVelocityY(60);
      avalanche.setData('pattern', 'zigzag');
      avalanche.setData('timer', 0);
      break;
      
    case 'curved':
      // Curved path - starts slow vertically, accelerates
      avalanche.setVelocityX(-scrollSpeed * 1.3);
      avalanche.setVelocityY(30);
      avalanche.setData('pattern', 'curved');
      avalanche.setData('timer', 0);
      break;
  }
  
  avalanche.setData('direction', direction);
  console.log(`🏔️ Avalanche spawned with ${direction} pattern!`);
}

function triggerGameOver() {
  if (!gameOver) {
    gameOver = true;
    gameOverText.setVisible(true);
    restartText.setVisible(true);
    console.log('Game Over!');
  }
}

// Environmental Effects Handlers
function handleWindCollision(ghost, wind) {
  // Clear directional wind currents that push ghost in arrow direction
  if (!activePowerUps.shield.active) {
    const windDirection = wind.getData('direction') || 'up';
    const windStrength = wind.getData('strength') || 1;
    
    // Apply immediate wind push for instant feedback
    const immediateForce = 150 * windStrength;
    let pushX = ghost.body.velocity.x;
    let pushY = ghost.body.velocity.y;
    
    switch(windDirection) {
      case 'up':
        pushY = -immediateForce;
        break;
      case 'down':
        pushY = immediateForce;
        break;
      case 'left':
        pushX = -immediateForce * 0.8;
        break;
      case 'right':
        pushX = immediateForce * 0.8;
        break;
      case 'spiral':
        const angle = Date.now() * 0.01;
        pushX = Math.cos(angle) * immediateForce * 0.7;
        pushY = Math.sin(angle) * immediateForce * 0.7;
        break;
    }
    
    // Apply immediate velocity
    ghost.setVelocity(pushX, pushY);
    
    // Also activate wind effect for sustained duration
    windEffect.active = true;
    windEffect.direction = windDirection;
    windEffect.strength = windStrength;
    windEffect.duration = 1500; // Increased to 1500ms for more noticeable effect
    
    // Enhanced visual feedback based on wind strength
    const tintColor = windStrength > 1.5 ? 0xffaaaa : 0xffeeaa; // Red tint for strong winds
    ghost.setTint(tintColor);
    
    const scene = ghost.scene;
    scene.time.delayedCall(600, () => { // Longer visual feedback
      ghost.clearTint();
    });
    
    console.log(`IMMEDIATE ${windDirection} push applied! Force: ${immediateForce}`);
  }
}

function restartGame() {
  // Reset game state
  gameOver = false;
  score = 0;
  obstacleTimer = 0;
  snowflakeTimer = 0;
  avalancheTimer = 0;
  goldenSnowflakeTimer = 0;
  
  // Reset gameplay enhancements
  comboCount = 0;
  lastComboTime = 0;
  powerUpTimer = 0;
  
  // Reset power-ups
  activePowerUps.shield.active = false;
  activePowerUps.shield.timeLeft = 0;
  activePowerUps.speedBoost.active = false;
  activePowerUps.speedBoost.timeLeft = 0;
  activePowerUps.magnet.active = false;
  activePowerUps.magnet.timeLeft = 0;
  activePowerUps.ghostMode.active = false;
  activePowerUps.ghostMode.timeLeft = 0;
  activePowerUps.timeSlow.active = false;
  activePowerUps.timeSlow.timeLeft = 0;
  activePowerUps.snowflakeRain.active = false;
  activePowerUps.snowflakeRain.timeLeft = 0;
  
  // Reset ghost appearance and physics
  ghost.setAlpha(1);
  ghost.clearTint(); // Clear any tint from damage
  this.physics.world.timeScale = 1;
  
  // Reset wind effects that might be affecting ghost movement
  windEffect.active = false;
  windEffect.direction = 'none';
  windEffect.strength = 0;
  windEffect.duration = 0;
  
  // Reset collision cooldown
  collisionCooldown = 0;
  
  // Reset difficulty to base level
  currentObstacleSpawnRate = baseObstacleSpawnRate;
  scrollSpeed = 100;
  currentDifficultyLevel = "Easy";
  isNightmareMode = false;
  
  // Reset background color to normal
  this.cameras.main.setBackgroundColor('#bde0fe');
  
  // Reset font color to white
  scoreText.setStyle({ fill: '#FFFFFF' });
  
  // Hide game over text
  gameOverText.setVisible(false);
  restartText.setVisible(false);
  
  // Reset ghost position and velocity
  ghost.setPosition(150, 240);
  ghost.setVelocity(0, 0); // Ensure both X and Y velocity are zero
  
  // Reset mobile controls state if they exist
  if (isMobile && mobileControls) {
    mobileControls.upPressed = false;
    mobileControls.downPressed = false;
    mobileControls.leftPressed = false;
    mobileControls.rightPressed = false;
  }
  
  // Clear all obstacles, snowflakes, avalanches, golden snowflakes, power-ups, and environmental effects
  trees.clear(true, true);
  snowflakes.clear(true, true);
  avalanches.clear(true, true);
  goldenSnowflakes.clear(true, true);
  powerUps.clear(true, true);
  scorePopups.clear(true, true);
  windCurrents.clear(true, true);
  
  // Reset score display
  scoreText.setText('Score: 0\nLevel: Easy');
  
  console.log('Game restarted! Difficulty reset to base level.');
}

new Phaser.Game(config);
