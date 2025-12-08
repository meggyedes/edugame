// Main Game class - the heart of Milo van Zee: World Explorer

import type { SceneType, GameProgress, Language, Photo, BiomeType } from './types/index.js';
import { Player } from './entities/Player.js';
import { Animal } from './entities/Animal.js';
import { World } from './world/World.js';
import { Menu, type MenuAction } from './ui/Menu.js';
import { HUD } from './ui/HUD.js';
import { GameCamera } from './ui/GameCamera.js';
import { ProgressScreen } from './ui/ProgressScreen.js';
import { PhotoGallery } from './ui/PhotoGallery.js';
import { WorldMap } from './ui/WorldMap.js';
import { Backpack } from './ui/Backpack.js';
import { BadgeSystem } from './ui/BadgeSystem.js';
import { InputHandler } from './utils/input.js';
import { Storage } from './utils/storage.js';
import { I18n } from './i18n/translations.js';
import { AudioManager } from './utils/audio.js';
import { ZoneManager, type Zone, type MiniLevel } from './zones/ZoneManager.js';
import { LevelManager, type LevelState, type InteractiveObject } from './zones/LevelManager.js';
import { LevelRenderer } from './zones/LevelRenderer.js';
import { ZoneSelectScreen } from './ui/ZoneSelectScreen.js';
import { Journal } from './ui/Journal.js';
import { TilesetRenderer, type BiomeType as TilesetBiome } from './world/TilesetRenderer.js';
import { Evidence } from './entities/Evidence.js';
// NEW: Biome-based system
import { BiomeLevel, BIOME_LEVELS } from './game/BiomeLevel.js';
import { VHSCamera } from './ui/VHSCamera.js';
import { BackpackMenu } from './ui/BackpackMenu.js';
import { BiomeSelectScreen } from './ui/BiomeSelectScreen.js';

export class Game {
    // Core elements
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private width: number = 1280;
    private height: number = 720;

    // Game state
    private currentScene: SceneType = 'menu';
    private lastTime: number = 0;
    private isRunning: boolean = false;
    private progress: GameProgress;

    // Game objects
    private player: Player;
    private world: World;
    private gameCamera: GameCamera;
    private tilesetRenderer: TilesetRenderer;  // NEW: Tileset-based background

    // Zone system
    private zoneManager: ZoneManager;
    private levelManager: LevelManager;
    private levelRenderer: LevelRenderer;
    private zoneSelectScreen: ZoneSelectScreen;
    private inZoneMode: boolean = false;
    private currentLevelState: LevelState | null = null;

    // UI components
    private menu: Menu;
    private hud: HUD;
    private progressScreen: ProgressScreen;
    private photoGallery: PhotoGallery;
    private worldMap: WorldMap;
    private backpack: Backpack;
    private badgeSystem: BadgeSystem;
    private journal: Journal;
    private showBadgePanel: boolean = false;
    
    // NEW: Biome-based system components
    private vhsCamera: VHSCamera;
    private backpackMenu: BackpackMenu;
    private biomeSelectScreen: BiomeSelectScreen;
    private currentBiomeLevel: BiomeLevel | null = null;
    private inBiomeMode: boolean = false;

    // Mouse position for UI
    private mouseX: number = 0;
    private mouseY: number = 0;

    // Utilities
    private input: InputHandler;
    private storage: Storage;
    private i18n: I18n;
    private audio: AudioManager;

    // Interaction state
    private nearbyAnimal: Animal | null = null;
    private nearbyEvidence: Evidence | null = null;  // NEW: Evidence system
    private showAnimalInfo: boolean = false;
    private animalInfoTimer: number = 0;
    private currentAnimalFact: string = '';
    private lastBiome: BiomeType = 'beach';

    // World dimensions - MUCH LARGER WORLD!
    private readonly WORLD_WIDTH = 8000;
    private readonly WORLD_HEIGHT = 6000;

    constructor() {
        // Get canvas
        this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        if (!this.canvas) {
            throw new Error('Canvas element not found!');
        }

        // Get context
        const ctx = this.canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Could not get 2D context!');
        }
        this.ctx = ctx;

        // Set dimensions - Dynamic based on screen size
        this.updateCanvasSize();

        // Initialize utilities (singletons)
        this.input = InputHandler.getInstance();
        this.storage = Storage.getInstance();
        this.i18n = I18n.getInstance();
        this.audio = AudioManager.getInstance();

        // Load saved language
        this.i18n.setLanguage(this.storage.getLanguage());

        // Initialize game objects
        this.world = new World(this.WORLD_WIDTH, this.WORLD_HEIGHT);
        this.player = new Player(this.WORLD_WIDTH / 2, this.WORLD_HEIGHT / 2);
        this.gameCamera = new GameCamera(this.width, this.height, this.WORLD_WIDTH, this.WORLD_HEIGHT);
        
        // Initialize tileset renderer
        this.tilesetRenderer = new TilesetRenderer();
        this.tilesetRenderer.generateTileMap(this.WORLD_WIDTH, this.WORLD_HEIGHT);

        // Initialize UI
        this.menu = new Menu(this.width, this.height);
        this.hud = new HUD();
        this.progressScreen = new ProgressScreen(this.width, this.height);
        this.photoGallery = new PhotoGallery(this.width, this.height);
        this.worldMap = new WorldMap(this.width, this.height);
        this.backpack = new Backpack(this.width, this.height);
        this.badgeSystem = new BadgeSystem();
        this.journal = new Journal(this.width, this.height);

        // NEW: Initialize biome-based system components
        this.vhsCamera = new VHSCamera(this.width, this.height);
        this.backpackMenu = new BackpackMenu(this.width, this.height);
        this.biomeSelectScreen = new BiomeSelectScreen(this.width, this.height);
        
        // Setup biome select callbacks
        this.biomeSelectScreen.setOnBiomeSelect((biomeId: string) => {
            this.startBiomeLevel(biomeId);
        });
        this.biomeSelectScreen.setOnBack(() => {
            this.currentScene = 'menu';
        });
        
        // Setup backpack menu callbacks
        this.backpackMenu.setOnCameraClick(() => {
            this.backpackMenu.close();
            this.activateVHSCamera();
        });
        this.backpackMenu.setOnJournalClick(() => {
            this.backpackMenu.close();
            this.journal.setPhotos(this.progress.photos);
            this.journal.open();
        });
        this.backpackMenu.setOnMapClick(() => {
            this.backpackMenu.close();
            this.worldMap.open();
        });

        // Initialize zone system
        this.zoneManager = ZoneManager.getInstance();
        this.levelManager = LevelManager.getInstance();
        this.levelRenderer = LevelRenderer.getInstance();
        this.zoneSelectScreen = new ZoneSelectScreen(this.width, this.height);
        
        // Setup zone select callbacks
        this.zoneSelectScreen.setOnSelect((zoneId: string, levelId: string) => {
            this.startLevel(zoneId, levelId);
        });

        // Setup backpack callbacks
        this.backpack.setOnOpenMap(() => {
            this.worldMap.open();
        });
        this.backpack.setOnOpenGallery(() => {
            this.journal.setPhotos(this.progress.photos);
            this.journal.open();
            this.backpack.close();
        });

        // Initialize progress
        this.progress = this.storage.getDefaultProgress();

        // Give first steps badge
        this.badgeSystem.updateProgress('exploration', 1, 'first_steps');

        // Setup event listeners
        this.setupEventListeners();
        this.setupMobileControls();
        this.setupFullscreen();

        // Handle window resize
        this.handleResize();
        window.addEventListener('resize', () => this.handleResize());
    }

    private setupEventListeners(): void {
        // Mouse click handler
        this.canvas.addEventListener('click', (e) => this.handleClick(e));

        // Mouse move handler
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            this.mouseX = (e.clientX - rect.left) * scaleX;
            this.mouseY = (e.clientY - rect.top) * scaleY;
        });

        // Wheel event for scrolling
        this.canvas.addEventListener('wheel', (e) => {
            if (this.currentScene === 'photoGallery') {
                this.photoGallery.scroll(e.deltaY);
            }
        });

        // Prevent context menu on canvas
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

        // Touch events for VHSCamera (mobile support)
        this.canvas.addEventListener('touchstart', (e) => {
            if (this.vhsCamera && this.vhsCamera.isActiveMode()) {
                e.preventDefault();
                this.vhsCamera.handleTouchStart(e.touches);
            }
        }, { passive: false });

        this.canvas.addEventListener('touchmove', (e) => {
            if (this.vhsCamera && this.vhsCamera.isActiveMode()) {
                e.preventDefault();
                this.vhsCamera.handleTouchMove(e.touches);
            }
        }, { passive: false });

        this.canvas.addEventListener('touchend', (e) => {
            if (this.vhsCamera && this.vhsCamera.isActiveMode()) {
                e.preventDefault();
                this.vhsCamera.handleTouchEnd();
            }
        }, { passive: false });
    }

    private setupMobileControls(): void {
        const joystick = document.getElementById('joystick');
        const joystickKnob = document.getElementById('joystickKnob');
        const actionBtn = document.getElementById('actionBtn');
        const cameraBtn = document.getElementById('cameraBtn');

        if (joystick && joystickKnob) {
            this.input.setupJoystick(joystick, joystickKnob);
        }

        if (actionBtn) {
            actionBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.handleAction();
            });
        }

        if (cameraBtn) {
            cameraBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.handleCameraToggle();
            });
        }
    }

    private updateMobileControlsVisibility(): void {
        const mobileControls = document.getElementById('mobileControls');
        if (!mobileControls) return;

        // Only show mobile controls during gameplay
        if (this.currentScene === 'gameplay' && this.input.getIsMobile()) {
            mobileControls.style.display = 'block';
        } else {
            mobileControls.style.display = 'none';
        }
    }

    private updateCanvasSize(): void {
        // Get the actual screen/window size
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        
        // Use the full screen size
        this.width = screenWidth;
        this.height = screenHeight;
        
        // Set canvas resolution
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        // Update camera if it exists
        if (this.gameCamera) {
            this.gameCamera.updateViewport(this.width, this.height);
        }
        
        // Update UI components if they exist
        if (this.menu) this.menu.updateSize(this.width, this.height);
        if (this.progressScreen) this.progressScreen.updateSize(this.width, this.height);
        if (this.photoGallery) this.photoGallery.updateSize(this.width, this.height);
        if (this.worldMap) this.worldMap.updateSize(this.width, this.height);
        if (this.backpack) this.backpack.updateSize(this.width, this.height);
        if (this.zoneSelectScreen) this.zoneSelectScreen.updateSize(this.width, this.height);
        if (this.journal) this.journal.updateSize(this.width, this.height);
        if (this.vhsCamera) this.vhsCamera.updateSize(this.width, this.height);
        if (this.backpackMenu) this.backpackMenu.updateSize(this.width, this.height);
        if (this.biomeSelectScreen) this.biomeSelectScreen.updateSize(this.width, this.height);
    }

    private setupFullscreen(): void {
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        }
        
        // F11 key for fullscreen
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F11') {
                e.preventDefault();
                this.toggleFullscreen();
            }
        });
        
        // Listen for fullscreen changes
        document.addEventListener('fullscreenchange', () => {
            setTimeout(() => this.updateCanvasSize(), 100);
        });
    }

    private toggleFullscreen(): void {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log('Fullscreen error:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }

    private handleResize(): void {
        this.updateCanvasSize();
    }

    private handleClick(e: MouseEvent): void {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        switch (this.currentScene) {
            case 'menu':
                this.handleMenuClick(x, y);
                break;
            case 'zoneSelect':
                this.zoneSelectScreen.handleClick(x, y);
                break;
            case 'biomeSelect':
                this.biomeSelectScreen.handleClick(x, y);
                break;
            case 'gameplay':
                // Check if VHS camera is active - photo capture on click
                if (this.vhsCamera.isActiveMode()) {
                    this.handleVHSPhotoCapture();
                    return;
                }
                // Check if journal is open
                if (this.journal.isJournalOpen()) {
                    this.journal.handleClick(x, y);
                    return;
                }
                // Check if backpack menu is open
                if (this.backpackMenu.isMenuOpen()) {
                    this.backpackMenu.handleClick(x, y);
                    return;
                }
                // Check backpack menu button (top-left)
                if (this.backpackMenu.handleClick(x, y)) {
                    return;
                }
                // Check if backpack is open
                if (this.backpack.isBackpackOpen()) {
                    this.backpack.handleClick(x, y);
                    return;
                }
                // Check if map is open
                if (this.worldMap.isMapOpen()) {
                    this.worldMap.handleClick(x, y);
                    return;
                }
                
                // NEW: Check backpack menu click first
                if (this.backpackMenu.handleClick(x, y)) {
                    return;
                }
                
                // Check backpack button (now opens dropdown)
                const backpackBtn = this.getBackpackButtonBounds();
                if (x >= backpackBtn.x && x <= backpackBtn.x + backpackBtn.width &&
                    y >= backpackBtn.y && y <= backpackBtn.y + backpackBtn.height) {
                    this.backpackMenu.toggle();
                    return;
                }
                // Check map button
                const mapBtn = this.getMapButtonBounds();
                if (x >= mapBtn.x && x <= mapBtn.x + mapBtn.width &&
                    y >= mapBtn.y && y <= mapBtn.y + mapBtn.height) {
                    this.worldMap.toggle();
                    return;
                }
                // Check journal button
                const journalBtn = this.getJournalButtonBounds();
                if (x >= journalBtn.x && x <= journalBtn.x + journalBtn.width &&
                    y >= journalBtn.y && y <= journalBtn.y + journalBtn.height) {
                    this.journal.setPhotos(this.progress.photos);
                    this.journal.toggle();
                    return;
                }
                
                // VHS Camera photo capture
                if (this.vhsCamera.isActiveMode()) {
                    this.handleVHSPhotoCapture();
                    return;
                }
                break;
            case 'progress':
                if (this.progressScreen.handleClick(x, y)) {
                    this.currentScene = 'menu';
                }
                break;
            case 'photoGallery':
                if (this.photoGallery.handleClick(x, y)) {
                    this.currentScene = 'gameplay';
                }
                break;
        }
    }

    private getBackpackButtonBounds(): { x: number; y: number; width: number; height: number } {
        return { x: this.width - 110, y: 60, width: 45, height: 45 };
    }

    private getMapButtonBounds(): { x: number; y: number; width: number; height: number } {
        return { x: this.width - 60, y: 60, width: 45, height: 45 };
    }

    private getJournalButtonBounds(): { x: number; y: number; width: number; height: number } {
        return { x: this.width - 60, y: 115, width: 45, height: 45 };
    }

    private handleMenuClick(x: number, y: number): void {
        const action: MenuAction = this.menu.handleClick(x, y);

        switch (action) {
            case 'start':
                // Go to biome selection
                this.currentScene = 'biomeSelect';
                break;
            case 'language':
                this.toggleLanguage();
                // Refresh menu buttons after language change
                this.menu.updateSize(this.width, this.height);
                break;
        }
    }

    private openZoneSelect(): void {
        this.zoneSelectScreen.reset();
        this.currentScene = 'zoneSelect';
    }

    private startLevel(zoneId: string, levelId: string): void {
        // Load the level
        const state = this.levelManager.loadLevel(zoneId, levelId);
        if (!state) {
            console.error('Failed to load level:', zoneId, levelId);
            return;
        }

        this.currentLevelState = state;
        this.inZoneMode = true;

        // Setup level renderer
        this.levelRenderer.loadLevel(state.zone, state.level);

        // Update camera for level size
        this.gameCamera = new GameCamera(this.width, this.height, state.level.width, state.level.height);

        // Set player position
        const start = this.levelManager.getPlayerStart();
        this.player.setPosition(start.x, start.y);

        // Center camera on player
        this.gameCamera.setPosition(
            this.player.getCenter().x - this.width / 2,
            this.player.getCenter().y - this.height / 2
        );

        // Show level notification
        const levelName = state.level.name[this.i18n.getLanguage()];
        this.hud.showNotification(`📍 ${levelName}`, 4);

        this.currentScene = 'gameplay';
    }

    private exitLevel(): void {
        // Update zone badges before exiting
        if (this.currentLevelState) {
            const zone = this.zoneManager.getZone(this.currentLevelState.zone.id);
            if (zone) {
                const completedLevels = zone.levels.filter(l => l.completed).length;
                this.badgeSystem.updateZoneBadge(zone.id, completedLevels);
            }
        }

        this.inZoneMode = false;
        this.currentLevelState = null;
        this.levelManager.unloadLevel();
        this.levelRenderer.unloadLevel();

        // Restore world camera
        this.gameCamera = new GameCamera(this.width, this.height, this.WORLD_WIDTH, this.WORLD_HEIGHT);
        
        // Return to zone select
        this.currentScene = 'zoneSelect';
        this.zoneSelectScreen.reset();
    }

    // NEW: Start a biome level
    private startBiomeLevel(biomeId: string): void {
        const levelData = BIOME_LEVELS.find(b => b.id === biomeId);
        if (!levelData) {
            console.error('Biome not found:', biomeId);
            return;
        }

        // Create new biome level instance
        this.currentBiomeLevel = new BiomeLevel(levelData);
        this.inBiomeMode = true;

        // Setup camera for level size
        this.gameCamera = new GameCamera(this.width, this.height, levelData.width, levelData.height);

        // Set player position at level start
        this.player.setPosition(levelData.width / 2, levelData.height - 200);

        // Center camera on player
        this.gameCamera.setPosition(
            this.player.getCenter().x - this.width / 2,
            this.player.getCenter().y - this.height / 2
        );

        // Show level notification
        const levelName = levelData.name[this.i18n.getLanguage()];
        this.hud.showNotification(`🌍 ${levelName}`, 4);

        this.currentScene = 'gameplay';
    }

    // NEW: Activate VHS camera mode
    private activateVHSCamera(): void {
        this.vhsCamera.activate();
        this.canvas.classList.add('cameraMode');
        this.canvas.classList.remove('defaultMode');
        this.audio.playCameraOn();
    }

    // NEW: Deactivate VHS camera
    private deactivateVHSCamera(): void {
        this.vhsCamera.deactivate();
        this.canvas.classList.remove('cameraMode');
        this.canvas.classList.add('defaultMode');
        this.audio.playCameraOff();
    }

    // NEW: Handle VHS camera photo capture
    private handleVHSPhotoCapture(): void {
        if (!this.vhsCamera.isActiveMode() || !this.inBiomeMode || !this.currentBiomeLevel) return;

        const crosshair = this.vhsCamera.getWorldCrosshairPosition(
            this.gameCamera.getX(),
            this.gameCamera.getY()
        );

        // Check for evidence at crosshair
        for (const evidence of this.currentBiomeLevel.getEvidence()) {
            if (evidence.isCollected()) continue;
            
            const pos = evidence.getPosition();
            const size = evidence.getSize();
            const centerX = pos.x + size.width / 2;
            const centerY = pos.y + size.height / 2;
            
            const dx = crosshair.x - centerX;
            const dy = crosshair.y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 60) {
                // Photo of evidence!
                const photo = this.vhsCamera.takePhoto(
                    this.canvas, 
                    'evidence', 
                    evidence.getData().type, 
                    this.currentBiomeLevel.getLevelData().biome,
                    this.gameCamera.getX(),
                    this.gameCamera.getY()
                );
                
                if (photo) {
                    this.audio.playPhotoCapture();
                    
                    // Process evidence photograph
                    const animalRevealed = this.currentBiomeLevel.onEvidencePhotographed(evidence);
                    
                    // Add to journal
                    this.journal.addEvidence(evidence.getLinkedAnimal(), evidence.getData());
                    
                    // Show notification
                    const lang = this.i18n.getLanguage();
                    let message = `📷 ${evidence.getData().icon} ${evidence.getData().name[lang]} (+5⭐)`;
                    
                    if (animalRevealed) {
                        message += `\n🎉 ${lang === 'nl' ? 'Dier onthuld!' : 'Animal revealed!'}`;
                        this.audio.playAnimalDiscovered();
                    }
                    
                    this.hud.showNotification(message, 3);
                    this.progress.totalPoints += 5;
                    this.saveProgress();
                }
                return;
            }
        }

        // Check for animals at crosshair
        for (const animal of this.currentBiomeLevel.getAnimals()) {
            const pos = animal.getPosition();
            const size = animal.getSize();
            const centerX = pos.x + size.width / 2;
            const centerY = pos.y + size.height / 2;
            
            const dx = crosshair.x - centerX;
            const dy = crosshair.y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < size.width / 2 + 50) {
                // Photo of animal!
                const photo = this.vhsCamera.takePhoto(
                    this.canvas, 
                    'animal', 
                    animal.getId(), 
                    this.currentBiomeLevel.getLevelData().biome,
                    this.gameCamera.getX(),
                    this.gameCamera.getY()
                );
                
                if (photo) {
                    this.audio.playPhotoCapture();
                    this.audio.playPointsEarned();
                    
                    // Process animal photograph
                    this.currentBiomeLevel.onAnimalPhotographed(animal);
                    animal.photograph();
                    
                    // Add photo to progress
                    const newPhoto: Photo = {
                        id: photo.id,
                        animalId: animal.getId(),
                        animalName: { 
                            nl: animal.getName('nl'), 
                            en: animal.getName('en') 
                        },
                        dataUrl: photo.dataUrl,
                        timestamp: photo.timestamp,
                        location: photo.biome as BiomeType,
                        points: Math.round(animal.getPoints() * (photo.quality / 100))
                    };
                    this.progress.photos.push(newPhoto);
                    this.progress.totalPoints += newPhoto.points;
                    
                    // Show notification
                    const message = `📷 ${animal.getName(this.i18n.getLanguage())} +${newPhoto.points}⭐`;
                    this.hud.showNotification(message, 3);
                    
                    // Check level completion
                    if (this.currentBiomeLevel.isLevelComplete()) {
                        this.onBiomeLevelComplete();
                    }
                    
                    this.saveProgress();
                }
                return;
            }
        }

        // Missed shot - just flash
        this.vhsCamera.takePhoto(
            this.canvas, 
            'evidence', 
            'missed', 
            'beach',
            this.gameCamera.getX(),
            this.gameCamera.getY()
        );
        this.audio.playPhotoCapture();
    }

    // NEW: Handle biome level completion
    private onBiomeLevelComplete(): void {
        const lang = this.i18n.getLanguage();
        const levelData = this.currentBiomeLevel?.getLevelData();
        
        if (!levelData) return;

        // Update biome progress
        this.biomeSelectScreen.updateBiomeProgress(levelData.id, 100, true);

        // Show completion message
        setTimeout(() => {
            this.hud.showNotification(
                `🎉 ${levelData.name[lang]} ${lang === 'nl' ? 'voltooid!' : 'completed!'}`,
                5
            );
            
            // Return to biome select after delay
            setTimeout(() => {
                this.exitBiomeLevel();
            }, 3000);
        }, 1000);
    }

    // NEW: Exit current biome level
    private exitBiomeLevel(): void {
        this.inBiomeMode = false;
        this.currentBiomeLevel = null;
        
        // Restore world camera
        this.gameCamera = new GameCamera(this.width, this.height, this.WORLD_WIDTH, this.WORLD_HEIGHT);
        
        // Return to biome select
        this.currentScene = 'biomeSelect' as SceneType;
    }

    private startNewGame(): void {
        // Reset progress
        this.progress = this.storage.getDefaultProgress();
        this.storage.clearProgress();

        // Reset player position to center of beach biome
        this.player.setPosition(this.WORLD_WIDTH / 2, this.WORLD_HEIGHT * 0.85);

        // Create new world
        this.world = new World(this.WORLD_WIDTH, this.WORLD_HEIGHT);

        // Center camera on player
        this.gameCamera.setPosition(
            this.player.getCenter().x - this.width / 2,
            this.player.getCenter().y - this.height / 2
        );

        this.currentScene = 'gameplay';
        this.hud.showNotification(this.i18n.t('controls_keyboard'), 5);
    }

    private continueGame(): void {
        const savedProgress = this.storage.loadProgress();
        if (savedProgress) {
            this.progress = savedProgress;
            this.progress.exploredAreas = new Set(savedProgress.exploredAreas);
        }

        // Load photos
        const photos = this.storage.loadPhotos();
        this.progress.photos = photos;

        // Load zone progress
        this.zoneManager.loadProgress();
        this.progress.photos = photos;

        this.currentScene = 'gameplay';
    }

    private toggleLanguage(): void {
        const newLang: Language = this.i18n.getLanguage() === 'nl' ? 'en' : 'nl';
        this.i18n.setLanguage(newLang);
        this.storage.setLanguage(newLang);
        this.progress.language = newLang;
        // Menu buttons will use new language on next render
    }

    private handleAction(): void {
        if (this.currentScene !== 'gameplay') return;

        const inputState = this.input.getInputState();

        // First check for evidence (priority over animals when not in camera mode)
        if (this.nearbyEvidence && !this.vhsCamera.isActiveMode()) {
            this.interactWithEvidence(this.nearbyEvidence);
            return;
        }

        if (this.nearbyAnimal && !this.vhsCamera.isActiveMode()) {
            this.interactWithAnimal(this.nearbyAnimal);
        }
    }

    private handleCameraToggle(): void {
        if (this.currentScene !== 'gameplay') return;

        if (this.vhsCamera.isActiveMode()) {
            this.deactivateVHSCamera();
        } else {
            this.activateVHSCamera();
        }
    }

    // handlePhotoCapture now uses VHS camera - see handleVHSPhotoCapture
    private handlePhotoCapture(): void {
        // Redirect to VHS camera capture
        this.handleVHSPhotoCapture();
    }

    private interactWithAnimal(animal: Animal): void {
        if (!animal.isDiscovered()) {
            // First discovery
            animal.discover();
            this.progress.discoveredAnimals.push(animal.getId());
            this.progress.totalPoints += animal.getPoints();

            // Play discovery sound
            this.audio.playAnimalDiscovered();

            const message = `🦎 ${this.i18n.t('animal_discovered')} ${animal.getName(this.i18n.getLanguage())} +${animal.getPoints()}⭐`;
            this.hud.showNotification(message, 3);

            // Update badges
            this.badgeSystem.updateProgress('animals', this.progress.discoveredAnimals.length);

            this.saveProgress();
        }

        // Show animal fact
        this.showAnimalInfo = true;
        this.animalInfoTimer = 5;
        this.currentAnimalFact = animal.getRandomFact(this.i18n.getLanguage());
    }

    private findAnimalAtPosition(x: number, y: number): Animal | null {
        const animals = this.world.getAnimals();
        for (const animal of animals) {
            const bounds = animal.getBounds();
            if (
                x >= bounds.x &&
                x <= bounds.x + bounds.width &&
                y >= bounds.y &&
                y <= bounds.y + bounds.height
            ) {
                return animal;
            }
        }
        return null;
    }

    private findNearbyAnimal(): Animal | null {
        const playerCenter = this.player.getCenter();
        const interactionRadius = 150; // Increased for larger animals (360px size)

        for (const animal of this.world.getAnimals()) {
            const animalPos = animal.getPosition();
            const animalSize = animal.getSize();
            const animalCenterX = animalPos.x + animalSize.width / 2;
            const animalCenterY = animalPos.y + animalSize.height / 2;
            const dx = playerCenter.x - animalCenterX;
            const dy = playerCenter.y - animalCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < interactionRadius + animalSize.width / 2) {
                return animal;
            }
        }
        return null;
    }

    // NEW: Find nearby evidence
    private findNearbyEvidence(): Evidence | null {
        const playerCenter = this.player.getCenter();
        const interactionRadius = 80;

        for (const evidence of this.world.getEvidence()) {
            if (evidence.isCollected()) continue;
            
            const pos = evidence.getPosition();
            const size = evidence.getSize();
            const centerX = pos.x + size.width / 2;
            const centerY = pos.y + size.height / 2;
            const dx = playerCenter.x - centerX;
            const dy = playerCenter.y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < interactionRadius) {
                return evidence;
            }
        }
        return null;
    }

    // NEW: Handle evidence interaction
    private interactWithEvidence(evidence: Evidence): void {
        if (evidence.isCollected()) return;

        const lang = this.i18n.getLanguage();
        const data = evidence.getData();
        
        // Discover if not discovered yet
        if (!evidence.isDiscovered()) {
            evidence.discover();
        }
        
        // Collect the evidence
        evidence.collect();
        
        // Add to collected evidence for journal
        this.journal.addEvidence(evidence.getLinkedAnimal(), data);
        
        // Play sound
        this.audio.playPointsEarned();
        
        // Add some points
        this.progress.totalPoints += 5;
        
        // Show notification
        const message = `🔍 ${data.icon} ${data.name[lang]} (+5⭐)`;
        this.hud.showNotification(message, 3);
        
        // Show fact about what this evidence means
        this.showAnimalInfo = true;
        this.animalInfoTimer = 4;
        this.currentAnimalFact = data.description[lang];
        
        this.saveProgress();
    }

    private saveProgress(): void {
        this.progress.lastPlayed = Date.now();
        this.storage.saveProgress(this.progress);
        
        // Also save zone progress
        this.zoneManager.saveProgress();
    }

    public start(): void {
        this.isRunning = true;
        this.lastTime = performance.now();
        this.gameLoop();

        // Hide loading screen
        setTimeout(() => {
            const loadingScreen = document.getElementById('loadingScreen');
            if (loadingScreen) {
                loadingScreen.classList.add('hidden');
            }
        }, 1500);
    }

    private gameLoop(): void {
        if (!this.isRunning) return;

        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.render();

        requestAnimationFrame(() => this.gameLoop());
    }

    private update(deltaTime: number): void {
        const inputState = this.input.getInputState();

        // Update mobile controls visibility based on current scene
        this.updateMobileControlsVisibility();

        switch (this.currentScene) {
            case 'menu':
                this.menu.update(deltaTime);
                break;

            case 'gameplay':
                this.updateGameplay(deltaTime, inputState);
                break;

            case 'zoneSelect':
                this.zoneSelectScreen.update(deltaTime, this.mouseX, this.mouseY);
                break;
            
            case 'biomeSelect':
                this.biomeSelectScreen.update(deltaTime, this.mouseX, this.mouseY);
                break;
        }

        // Handle escape key to return to menu
        if (inputState.escape) {
            if (this.currentScene === 'gameplay') {
                // If VHS camera is active, close it first
                if (this.vhsCamera.isActiveMode()) {
                    this.deactivateVHSCamera();
                    this.input.resetEscape();
                    return;
                }
                // If in biome mode, exit level first
                if (this.inBiomeMode) {
                    this.exitBiomeLevel();
                    this.input.resetEscape();
                    return;
                }
                // If in zone mode, exit level first
                if (this.inZoneMode) {
                    this.exitLevel();
                    this.input.resetEscape();
                    return;
                }
                // First close any open UI
                if (this.journal.isJournalOpen()) {
                    this.journal.close();
                } else if (this.backpackMenu.isMenuOpen()) {
                    this.backpackMenu.close();
                } else if (this.worldMap.isMapOpen()) {
                    this.worldMap.close();
                } else if (this.backpack.isBackpackOpen()) {
                    this.backpack.close();
                } else if (this.showBadgePanel) {
                    this.showBadgePanel = false;
                } else {
                    this.saveProgress();
                    this.currentScene = 'menu';
                }
            } else if (this.currentScene === 'zoneSelect') {
                this.currentScene = 'menu';
            } else if (this.currentScene === 'biomeSelect') {
                this.currentScene = 'menu';
            } else if (this.currentScene !== 'menu') {
                this.currentScene = 'menu';
            }
            this.input.resetEscape();
        }
    }

    private updateGameplay(deltaTime: number, inputState: { action: boolean; camera: boolean; map: boolean; backpack: boolean; badges: boolean; journal: boolean }): void {
        // Update backpack menu (top-left)
        this.backpackMenu.update(deltaTime, this.mouseX, this.mouseY);
        
        // Update VHS camera
        this.vhsCamera.update(deltaTime);
        
        // Check mobile button triggers
        if (this.vhsCamera.checkMobileClose()) {
            this.deactivateVHSCamera();
        }
        if (this.vhsCamera.checkMobileCapture()) {
            this.handleVHSPhotoCapture();
        }
        
        // Update backpack UI
        this.backpack.update(deltaTime, this.mouseX, this.mouseY);

        // Update world map
        this.worldMap.update(deltaTime, this.player.getPosition(), this.WORLD_WIDTH, this.WORLD_HEIGHT);

        // Update journal
        this.journal.update(deltaTime, this.mouseX, this.mouseY);

        // If map, backpack, journal or backpack menu is open, don't update player movement
        if (this.worldMap.isMapOpen() || this.backpack.isBackpackOpen() || this.journal.isJournalOpen() || this.backpackMenu.isMenuOpen()) {
            // Handle map key to close
            if (inputState.map) {
                if (this.worldMap.isMapOpen()) {
                    this.worldMap.close();
                } else {
                    this.worldMap.open();
                }
                this.input.resetMap();
            }
            // Handle backpack key to close
            if (inputState.backpack) {
                if (this.backpack.isBackpackOpen()) {
                    this.backpack.close();
                } else {
                    this.backpack.open();
                }
                this.input.resetBackpack();
            }
            return;
        }

        // Handle camera toggle (C key)
        if (inputState.camera) {
            if (this.vhsCamera.isActiveMode()) {
                this.deactivateVHSCamera();
            } else {
                this.activateVHSCamera();
            }
            this.input.resetCamera();
        }

        // Handle VHS camera zoom and focus controls
        if (this.vhsCamera.isActiveMode()) {
            const fullInputState = this.input.getInputState();
            
            // X / Q to zoom out (deltaTime based for smooth zooming)
            if (fullInputState.zoomOut) {
                const currentZoom = this.vhsCamera.getZoom();
                this.vhsCamera.setZoom(currentZoom - deltaTime * 1.5);
            }
            // Y to zoom in (deltaTime based for smooth zooming)
            if (fullInputState.zoomIn) {
                const currentZoom = this.vhsCamera.getZoom();
                this.vhsCamera.setZoom(currentZoom + deltaTime * 1.5);
            }
            // R to increase focus
            if (fullInputState.focusUp) {
                this.vhsCamera.adjustFocus(deltaTime * 0.5);
            }
            // F to decrease focus
            if (fullInputState.focusDown) {
                this.vhsCamera.adjustFocus(-deltaTime * 0.5);
            }
            
            // WASD to move handheld camera (not player!)
            let camDx = 0, camDy = 0;
            if (fullInputState.up) camDy = -1;
            if (fullInputState.down) camDy = 1;
            if (fullInputState.left) camDx = -1;
            if (fullInputState.right) camDx = 1;
            
            if (camDx !== 0 || camDy !== 0) {
                this.vhsCamera.moveCamera(camDx, camDy, deltaTime);
            }
            
            // Space to recenter camera on player
            if (fullInputState.action) {
                this.vhsCamera.recenterCamera();
            }
        }

        // Get current level bounds
        const levelWidth = this.inBiomeMode && this.currentBiomeLevel ? 
            this.currentBiomeLevel.getWidth() :
            (this.inZoneMode ? this.levelManager.getLevelWidth() : this.WORLD_WIDTH);
        const levelHeight = this.inBiomeMode && this.currentBiomeLevel ?
            this.currentBiomeLevel.getHeight() :
            (this.inZoneMode ? this.levelManager.getLevelHeight() : this.WORLD_HEIGHT);

        // Update player (but NOT when camera is active - player stays still while aiming)
        if (!this.vhsCamera.isActiveMode()) {
            this.player.update(deltaTime, levelWidth, levelHeight);
        }

        // Update camera
        this.gameCamera.follow(this.player.getCenter());
        this.gameCamera.update(deltaTime);

        // NEW: Biome mode updates
        if (this.inBiomeMode && this.currentBiomeLevel) {
            this.currentBiomeLevel.update(deltaTime);
            
            // In biome mode, we don't use E key interaction
            // Everything is done with camera photos!
            
        } else if (this.inZoneMode && this.currentLevelState) {
            // Zone mode updates
            this.levelManager.update(deltaTime);

            // Update level animals
            for (const animal of this.levelManager.getAnimals()) {
                animal.update(deltaTime);
            }

            // Check for nearby animals in level
            this.nearbyAnimal = this.findNearbyLevelAnimal();

            // Check for panorama points
            const playerPos = this.player.getPosition();
            const panoramaCheck = this.levelManager.checkPanoramaPoint(playerPos.x, playerPos.y);
            if (panoramaCheck) {
                const bonusXP = this.levelManager.recordPanorama(panoramaCheck.index);
                if (bonusXP > 0) {
                    this.progress.totalPoints += bonusXP;
                    this.hud.showNotification(`📷 ${this.i18n.t('panorama_bonus')} +${bonusXP}⭐`, 3);
                    this.audio.playPointsEarned();
                }
            }

            // Check for nearby interactives
            const nearbyInteractive = this.levelManager.findNearbyInteractive(playerPos.x, playerPos.y);
            if (nearbyInteractive && inputState.action) {
                this.levelManager.interact(nearbyInteractive.id);
                this.audio.playUIOpen();
            }

            // Check if level is complete
            if (this.levelManager.isLevelComplete() && !this.showAnimalInfo) {
                // Show completion message
                this.showAnimalInfo = true;
                this.animalInfoTimer = 4;
                this.currentAnimalFact = `🎉 ${this.i18n.t('level_complete')} +${this.currentLevelState.photosToken * 10}⭐`;
                
                // After delay, exit level
                setTimeout(() => {
                    this.exitLevel();
                }, 4000);
            }
        } else {
            // World mode updates
            this.world.update(deltaTime);
            this.nearbyAnimal = this.findNearbyAnimal();
            this.nearbyEvidence = this.findNearbyEvidence();  // NEW: Check for evidence

            // Check biome badge
            const playerPos = this.player.getPosition();
            const currentBiome = this.world.getBiomeAtPosition(playerPos.x, playerPos.y);
            
            // Check for biome change and play sound
            if (currentBiome !== this.lastBiome) {
                this.audio.playBiomeEnter(currentBiome);
                this.lastBiome = currentBiome;
                
                // Update tileset renderer biome
                const biomeToTileset: Record<string, TilesetBiome> = {
                    'beach': 'jungle',
                    'forest': 'forest',
                    'jungle': 'jungle',
                    'desert': 'desert',
                    'arctic': 'tundra',
                    'savannah': 'desert',
                    'coral': 'jungle'
                };
                const tilesetBiome = biomeToTileset[currentBiome] || 'forest';
                this.tilesetRenderer.setBiome(tilesetBiome);
            }
            
            this.hud.setCurrentBiome(currentBiome);
            this.hud.setMinimapData(playerPos.x, playerPos.y, this.WORLD_WIDTH, this.WORLD_HEIGHT, this.world.getExploredChunks());
            this.badgeSystem.checkBiomeBadge(currentBiome);

            // Mark explored chunks
            this.world.markChunkExplored(playerPos.x, playerPos.y);

            // Calculate exploration percentage for badges
            const exploredChunks = this.world.getExploredChunks().size;
            const totalChunks = Math.ceil(this.WORLD_WIDTH / (32 * 10)) * Math.ceil(this.WORLD_HEIGHT / (32 * 10));
            const explorationPercent = Math.round((exploredChunks / totalChunks) * 100);
            this.badgeSystem.updateProgress('exploration', explorationPercent);
        }

        this.hud.setShowInteractionPrompt(this.nearbyAnimal !== null && !this.vhsCamera.isActiveMode());

        // Handle action key
        if (inputState.action) {
            this.handleAction();
            this.input.resetAction();
        }

        // Handle camera key
        if (inputState.camera) {
            this.handleCameraToggle();
            this.input.resetCamera();
        }

        // Handle map key
        if (inputState.map) {
            this.worldMap.toggle();
            this.input.resetMap();
        }

        // Handle backpack key (now opens dropdown menu)
        if (inputState.backpack) {
            if (this.backpackMenu.isMenuOpen()) {
                this.backpackMenu.close();
                this.audio.playUIClose();
            } else {
                this.backpackMenu.open();
                this.audio.playUIOpen();
            }
            this.input.resetBackpack();
        }

        // Handle badges key
        if (inputState.badges) {
            this.showBadgePanel = !this.showBadgePanel;
            if (this.showBadgePanel) {
                this.audio.playUIOpen();
            } else {
                this.audio.playUIClose();
            }
            this.input.resetBadges();
        }

        // Handle journal key
        if (inputState.journal) {
            if (this.journal.isJournalOpen()) {
                this.journal.close();
                this.audio.playUIClose();
            } else {
                this.journal.setPhotos(this.progress.photos);
                this.journal.open();
                this.audio.playUIOpen();
            }
            this.input.resetJournal();
        }

        // Update HUD
        this.hud.setPoints(this.progress.totalPoints);
        this.hud.setAnimalsDiscovered(this.progress.discoveredAnimals.length);
        this.hud.setPhotosTaken(this.progress.photos.length);
        this.hud.setBadgeCount(this.badgeSystem.getUnlockedCount(), this.badgeSystem.getTotalCount());
        this.hud.update(deltaTime);

        // Update badge system
        this.badgeSystem.update(deltaTime);

        // Update animal info timer
        if (this.showAnimalInfo) {
            this.animalInfoTimer -= deltaTime;
            if (this.animalInfoTimer <= 0) {
                this.showAnimalInfo = false;
            }
        }

        // Auto-save periodically
        if (Math.random() < 0.001) {
            this.saveProgress();
        }
    }

    private findNearbyLevelAnimal(): Animal | null {
        const playerCenter = this.player.getCenter();
        const interactionRadius = 50;

        for (const animal of this.levelManager.getAnimals()) {
            const animalPos = animal.getPosition();
            const dx = playerCenter.x - (animalPos.x + animal.getSize().width / 2);
            const dy = playerCenter.y - (animalPos.y + animal.getSize().height / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < interactionRadius) {
                return animal;
            }
        }
        return null;
    }

    private render(): void {
        // Clear canvas
        this.ctx.fillStyle = '#1a365d';
        this.ctx.fillRect(0, 0, this.width, this.height);

        switch (this.currentScene) {
            case 'menu':
                this.menu.render(this.ctx);
                break;

            case 'gameplay':
                this.renderGameplay();
                break;

            case 'zoneSelect':
                this.zoneSelectScreen.render(this.ctx);
                break;

            case 'biomeSelect':
                this.biomeSelectScreen.render(this.ctx);
                break;

            case 'progress':
                this.progressScreen.render(this.ctx);
                break;

            case 'photoGallery':
                this.photoGallery.render(this.ctx);
                break;
        }
    }

    private renderGameplay(): void {
        let cameraX = this.gameCamera.getX();
        let cameraY = this.gameCamera.getY();

        // Apply handheld camera offset when VHS camera is active
        if (this.vhsCamera.isActiveMode()) {
            const offset = this.vhsCamera.getCameraOffset();
            cameraX += offset.x;
            cameraY += offset.y;
        }

        // Apply zoom transformation when camera is active
        const isZoomed = this.vhsCamera.isActiveMode() && this.vhsCamera.getZoom() > 1.0;
        if (isZoomed) {
            const zoom = this.vhsCamera.getZoom();
            const centerX = this.width / 2;
            const centerY = this.height / 2;
            
            // Save context and apply zoom transform
            this.ctx.save();
            this.ctx.translate(centerX, centerY);
            this.ctx.scale(zoom, zoom);
            this.ctx.translate(-centerX, -centerY);
            
            // Adjust camera position to keep center point stable
            // When zoomed, we see less of the world, so adjust camera
            cameraX += (centerX / zoom - centerX) + centerX * (1 - 1/zoom);
            cameraY += (centerY / zoom - centerY) + centerY * (1 - 1/zoom);
        }

        if (this.inBiomeMode && this.currentBiomeLevel) {
            // === BIOME MODE RENDERING ===
            const biomeType = this.currentBiomeLevel.getBiomeType();
            
            // Render biome background based on type
            this.renderBiomeBackground(biomeType, cameraX, cameraY);

            // Render evidence markers (only uncollected ones)
            for (const evidence of this.currentBiomeLevel.getEvidenceMarkers()) {
                if (!evidence.photographed) {
                    const screenX = evidence.x - cameraX;
                    const screenY = evidence.y - cameraY;
                    
                    // Check if on screen
                    if (screenX > -50 && screenX < this.width + 50 && 
                        screenY > -50 && screenY < this.height + 50) {
                        // Render evidence based on type
                        this.renderEvidenceMarker(evidence, screenX, screenY);
                    }
                }
            }

            // Render revealed animals only
            for (const animal of this.currentBiomeLevel.getRevealedAnimals()) {
                const screenX = animal.x - cameraX;
                const screenY = animal.y - cameraY;
                
                if (screenX > -200 && screenX < this.width + 200 && 
                    screenY > -200 && screenY < this.height + 200) {
                    this.renderBiomeAnimal(animal, screenX, screenY);
                }
            }

            // Render biome progress
            this.renderBiomeProgress();
        } else if (this.inZoneMode && this.currentLevelState) {
            // Render level-specific background and decorations
            this.levelRenderer.renderBackground(this.ctx, cameraX, cameraY, this.width, this.height);
            this.levelRenderer.renderDecorations(this.ctx, cameraX, cameraY, this.width, this.height);

            // Render interactive objects
            this.levelRenderer.renderInteractives(this.ctx, this.levelManager.getInteractives(), cameraX, cameraY);

            // Render panorama points
            this.levelRenderer.renderPanoramaPoints(this.ctx, this.levelManager.getPanoramaPoints(), cameraX, cameraY);

            // Render level animals
            for (const animal of this.levelManager.getAnimals()) {
                const pos = animal.getPosition();
                const size = animal.getSize();
                
                if (this.gameCamera.isVisible(pos.x, pos.y, size.width, size.height)) {
                    animal.render(this.ctx, cameraX, cameraY);
                    
                    if (animal === this.nearbyAnimal && !this.vhsCamera.isActiveMode()) {
                        animal.renderInteractionPrompt(this.ctx, cameraX, cameraY, this.i18n.getLanguage());
                    }
                }
            }

            // Render level objectives
            this.renderLevelObjectives();
        } else {
            // Render world with tileset background
            this.tilesetRenderer.render(this.ctx, cameraX, cameraY, this.width, this.height);
            
            // Render additional world elements (decorations)
            this.world.render(this.ctx, cameraX, cameraY, this.width, this.height);

            // Render evidence (before animals so animals appear on top)
            for (const evidence of this.world.getEvidence()) {
                if (!evidence.isCollected()) {
                    const pos = evidence.getPosition();
                    const size = evidence.getSize();
                    if (this.gameCamera.isVisible(pos.x, pos.y, size.width, size.height)) {
                        evidence.render(this.ctx, cameraX, cameraY);
                        
                        // Show interaction prompt for nearby evidence
                        if (evidence === this.nearbyEvidence && !this.vhsCamera.isActiveMode()) {
                            evidence.renderInteractionPrompt(this.ctx, cameraX, cameraY, this.i18n.getLanguage());
                        }
                    }
                }
            }

            // Render animals
            for (const animal of this.world.getAnimals()) {
                const pos = animal.getPosition();
                const size = animal.getSize();
                
                // Only render visible animals
                if (this.gameCamera.isVisible(pos.x, pos.y, size.width, size.height)) {
                    animal.render(this.ctx, cameraX, cameraY);
                    
                    // Show interaction prompt for nearby animal
                    if (animal === this.nearbyAnimal && !this.vhsCamera.isActiveMode()) {
                        animal.renderInteractionPrompt(this.ctx, cameraX, cameraY, this.i18n.getLanguage());
                    }
                }
            }
        }

        // Render player
        this.player.render(this.ctx, cameraX, cameraY);

        // Restore zoom transform before rendering UI overlays
        if (this.vhsCamera.isActiveMode() && this.vhsCamera.getZoom() > 1.0) {
            this.ctx.restore();
        }

        // Render VHS camera overlay if active (on top, not zoomed)
        if (this.vhsCamera.isActiveMode()) {
            this.vhsCamera.render(this.ctx);
        }

        // Render HUD
        this.hud.render(this.ctx, this.width, this.height);

        // Render animal info popup
        if (this.showAnimalInfo && this.currentAnimalFact) {
            this.renderAnimalInfo();
        }

        // Render mini instructions (first few seconds)
        this.renderControls();

        // Render UI buttons (backpack, map)
        this.renderUIButtons();

        // Render backpack dropdown menu
        this.backpackMenu.render(this.ctx);

        // Render backpack overlay (old system - for transition)
        this.backpack.render(this.ctx);

        // Render world map overlay
        this.worldMap.render(this.ctx);

        // Render journal overlay
        this.journal.render(this.ctx);

        // Render badge notifications
        this.badgeSystem.render(this.ctx, this.width, this.height);

        // Render badge panel if open
        if (this.showBadgePanel) {
            this.badgeSystem.renderBadgePanel(this.ctx, this.width, this.height);
        }
    }

    private renderBiomeBackground(biomeType: string, cameraX: number, cameraY: number): void {
        // Biome-specific colors and patterns
        const biomeColors: Record<string, { bg: string; ground: string; accent: string }> = {
            beach: { bg: '#87CEEB', ground: '#F4D03F', accent: '#5DADE2' },
            forest: { bg: '#228B22', ground: '#2E7D32', accent: '#81C784' },
            jungle: { bg: '#006400', ground: '#1B5E20', accent: '#4CAF50' },
            desert: { bg: '#DEB887', ground: '#D2691E', accent: '#FFD54F' },
            arctic: { bg: '#E0F7FA', ground: '#FFFFFF', accent: '#B3E5FC' },
            savannah: { bg: '#DAA520', ground: '#CD853F', accent: '#F5DEB3' }
        };

        const colors = biomeColors[biomeType] || biomeColors.forest;

        // Fill background
        this.ctx.fillStyle = colors.bg;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw ground tiles
        const tileSize = 64;
        const startX = Math.floor(cameraX / tileSize) * tileSize;
        const startY = Math.floor(cameraY / tileSize) * tileSize;

        for (let x = startX - tileSize; x < cameraX + this.width + tileSize; x += tileSize) {
            for (let y = startY - tileSize; y < cameraY + this.height + tileSize; y += tileSize) {
                const screenX = x - cameraX;
                const screenY = y - cameraY;

                // Alternate tile colors slightly
                const alternate = ((x / tileSize) + (y / tileSize)) % 2 === 0;
                this.ctx.fillStyle = alternate ? colors.ground : colors.accent;
                this.ctx.fillRect(screenX, screenY, tileSize - 1, tileSize - 1);
            }
        }
    }

    private renderEvidenceMarker(evidence: { type: string; x: number; y: number; photographed: boolean }, screenX: number, screenY: number): void {
        // Draw evidence based on type
        const size = 40;
        
        this.ctx.save();
        
        // Glowing effect
        this.ctx.shadowColor = '#FFD700';
        this.ctx.shadowBlur = 15;
        
        // Background circle
        this.ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(screenX + size/2, screenY + size/2, size/2 + 5, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Evidence icon based on type
        this.ctx.font = '28px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        const icons: Record<string, string> = {
            footprint: '🐾',
            droppings: '💩',
            feather: '🪶',
            fur: '🦊',
            nest: '🪺',
            scratch: '✖️',
            burrow: '🕳️',
            shell: '🐚'
        };
        
        this.ctx.fillText(icons[evidence.type] || '❓', screenX + size/2, screenY + size/2);
        
        this.ctx.restore();
    }

    private renderBiomeAnimal(animal: { id: string; name: string; x: number; y: number; photographed: boolean; revealed: boolean }, screenX: number, screenY: number): void {
        const size = 120; // Big animal sprites
        
        this.ctx.save();
        
        // Animal shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.beginPath();
        this.ctx.ellipse(screenX + size/2, screenY + size - 10, size/2.5, 15, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Animal placeholder (colored circle with first letter)
        const hue = animal.id.charCodeAt(0) * 137.5 % 360;
        this.ctx.fillStyle = `hsl(${hue}, 60%, 50%)`;
        this.ctx.beginPath();
        this.ctx.arc(screenX + size/2, screenY + size/2, size/2 - 10, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Border
        this.ctx.strokeStyle = `hsl(${hue}, 70%, 30%)`;
        this.ctx.lineWidth = 4;
        this.ctx.stroke();
        
        // Animal name initial
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(animal.name.charAt(0).toUpperCase(), screenX + size/2, screenY + size/2);
        
        // Name label below
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(screenX, screenY + size - 5, size, 24);
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.fillText(animal.name, screenX + size/2, screenY + size + 7);
        
        // Photo indicator if already photographed
        if (animal.photographed) {
            this.ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
            this.ctx.font = '24px Arial';
            this.ctx.fillText('📷✓', screenX + size - 20, screenY + 20);
        }
        
        this.ctx.restore();
    }

    private renderBiomeProgress(): void {
        if (!this.currentBiomeLevel) return;

        const progress = this.currentBiomeLevel.getProgress();
        const x = 15;
        const y = 120;
        const width = 220;
        const height = 100;

        // Background panel
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(x, y, width, height);
        this.ctx.strokeStyle = '#FFD700';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, width, height);

        // Biome name
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(this.currentBiomeLevel.getBiomeType().toUpperCase(), x + 10, y + 25);

        // Evidence progress
        this.ctx.fillStyle = 'white';
        this.ctx.font = '14px Arial';
        this.ctx.fillText(`Evidence: ${progress.evidenceCollected}/${progress.totalEvidence}`, x + 10, y + 50);

        // Animals revealed
        this.ctx.fillText(`Animals Found: ${progress.animalsRevealed}/${progress.totalAnimals}`, x + 10, y + 70);

        // Animals photographed
        this.ctx.fillText(`Photographed: ${progress.animalsPhotographed}/${progress.totalAnimals}`, x + 10, y + 90);
    }

    private renderLevelObjectives(): void {
        if (!this.currentLevelState) return;

        const objectives = this.levelManager.getObjectives();
        const x = 15;
        let y = 120;

        // Background panel
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(x - 5, y - 20, 200, objectives.length * 28 + 30);

        // Title
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.fillText(this.i18n.t('level_objectives') || 'Objectives', x, y);
        y += 20;

        // Objectives
        for (const obj of objectives) {
            const icon = obj.completed ? '✅' : '⬜';
            const text = obj.description[this.i18n.getLanguage()];
            const progress = obj.type === 'photos' ? ` (${obj.current}/${obj.target})` : '';
            
            this.ctx.fillStyle = obj.completed ? '#4CAF50' : '#FFF';
            this.ctx.font = '12px Arial';
            this.ctx.fillText(`${icon} ${text}${progress}`, x, y);
            y += 22;
        }

        // Completion percentage
        const percent = this.levelManager.getCompletionPercentage();
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.font = '11px Arial';
        this.ctx.fillText(`${percent}% ${this.i18n.t('complete') || 'complete'}`, x, y + 5);
    }

    private renderUIButtons(): void {
        // Don't show buttons if overlays are open
        if (this.backpack.isBackpackOpen() || this.worldMap.isMapOpen() || 
            this.journal.isJournalOpen() || this.vhsCamera.isActiveMode() || this.showAnimalInfo) {
            return;
        }

        // Backpack button (top right area)
        const backpackBounds = this.getBackpackButtonBounds();
        this.renderIconButton(
            backpackBounds.x, backpackBounds.y,
            backpackBounds.width, backpackBounds.height,
            'backpack', 'B'
        );

        // Map button
        const mapBounds = this.getMapButtonBounds();
        this.renderIconButton(
            mapBounds.x, mapBounds.y,
            mapBounds.width, mapBounds.height,
            'map', 'M'
        );

        // Journal button (for photos)
        const journalBounds = this.getJournalButtonBounds();
        this.renderIconButton(
            journalBounds.x, journalBounds.y,
            journalBounds.width, journalBounds.height,
            'journal', 'J'
        );
    }

    private renderIconButton(x: number, y: number, w: number, h: number, icon: string, key: string): void {
        // Check if hovered
        const isHovered = this.mouseX >= x && this.mouseX <= x + w &&
                          this.mouseY >= y && this.mouseY <= y + h;

        // Button background
        this.ctx.fillStyle = isHovered ? 'rgba(139, 90, 43, 0.95)' : 'rgba(101, 67, 33, 0.9)';
        this.ctx.strokeStyle = '#DEB887';
        this.ctx.lineWidth = 3;
        
        // Rounded rect
        this.ctx.beginPath();
        const radius = 8;
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + w - radius, y);
        this.ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
        this.ctx.lineTo(x + w, y + h - radius);
        this.ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
        this.ctx.lineTo(x + radius, y + h);
        this.ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        const cx = x + w / 2;
        const cy = y + h / 2;

        if (icon === 'backpack') {
            // Draw backpack icon
            // Main body
            this.ctx.fillStyle = '#8B4513';
            this.ctx.fillRect(cx - 12, cy - 6, 24, 20);
            
            // Top flap
            this.ctx.fillStyle = '#A0522D';
            this.ctx.fillRect(cx - 10, cy - 10, 20, 8);
            
            // Buckle
            this.ctx.fillStyle = '#FFD700';
            this.ctx.fillRect(cx - 4, cy - 4, 8, 4);
            
            // Straps
            this.ctx.strokeStyle = '#5D3A1A';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(cx - 8, cy - 6);
            this.ctx.lineTo(cx - 8, cy + 14);
            this.ctx.moveTo(cx + 8, cy - 6);
            this.ctx.lineTo(cx + 8, cy + 14);
            this.ctx.stroke();
            
            // Pocket
            this.ctx.fillStyle = '#6B3E26';
            this.ctx.fillRect(cx - 6, cy + 4, 12, 8);
        } else if (icon === 'map') {
            // Draw map icon
            // Rolled map
            this.ctx.fillStyle = '#F5DEB3';
            this.ctx.fillRect(cx - 14, cy - 10, 28, 20);
            
            // Map edges (rolled)
            this.ctx.fillStyle = '#DEB887';
            this.ctx.beginPath();
            this.ctx.arc(cx - 14, cy, 3, Math.PI / 2, -Math.PI / 2);
            this.ctx.fill();
            this.ctx.beginPath();
            this.ctx.arc(cx + 14, cy, 3, -Math.PI / 2, Math.PI / 2);
            this.ctx.fill();
            
            // Map lines (representing terrain)
            this.ctx.strokeStyle = '#228B22';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(cx - 8, cy - 4);
            this.ctx.lineTo(cx - 2, cy - 2);
            this.ctx.lineTo(cx + 4, cy - 6);
            this.ctx.lineTo(cx + 10, cy - 2);
            this.ctx.stroke();
            
            // Water lines
            this.ctx.strokeStyle = '#4169E1';
            this.ctx.beginPath();
            this.ctx.moveTo(cx - 10, cy + 4);
            this.ctx.quadraticCurveTo(cx, cy + 2, cx + 10, cy + 6);
            this.ctx.stroke();
            
            // X marks the spot
            this.ctx.strokeStyle = '#DC143C';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(cx - 3, cy - 2);
            this.ctx.lineTo(cx + 3, cy + 4);
            this.ctx.moveTo(cx + 3, cy - 2);
            this.ctx.lineTo(cx - 3, cy + 4);
            this.ctx.stroke();
        } else if (icon === 'journal') {
            // Draw journal/photo album icon
            // Book cover
            this.ctx.fillStyle = '#5D4037';
            this.ctx.fillRect(cx - 12, cy - 12, 24, 24);
            
            // Book spine
            this.ctx.fillStyle = '#3E2723';
            this.ctx.fillRect(cx - 12, cy - 12, 4, 24);
            
            // Pages
            this.ctx.fillStyle = '#FFF8E1';
            this.ctx.fillRect(cx - 6, cy - 10, 16, 20);
            
            // Photo icon on cover
            this.ctx.fillStyle = '#4CAF50';
            this.ctx.fillRect(cx - 2, cy - 6, 10, 8);
            
            // Camera flash
            this.ctx.fillStyle = '#FFEB3B';
            this.ctx.fillRect(cx, cy - 8, 4, 3);
            
            // Page lines
            this.ctx.strokeStyle = '#BDBDBD';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(cx - 4, cy - 4);
            this.ctx.lineTo(cx + 8, cy - 4);
            this.ctx.moveTo(cx - 4, cy);
            this.ctx.lineTo(cx + 8, cy);
            this.ctx.moveTo(cx - 4, cy + 4);
            this.ctx.lineTo(cx + 8, cy + 4);
            this.ctx.stroke();
        }

        // Key hint
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = 'bold 10px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(key, cx, y + h - 4);
        this.ctx.textAlign = 'left';
    }

    private renderAnimalInfo(): void {
        const boxWidth = 350;
        const boxHeight = 80;
        const boxX = (this.width - boxWidth) / 2;
        const boxY = this.height - 150;

        // Background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        this.ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

        // Border
        this.ctx.strokeStyle = '#FFD700';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

        // Fact text
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';

        // Word wrap the fact
        const words = this.currentAnimalFact.split(' ');
        let line = '';
        let y = boxY + 30;
        const maxWidth = boxWidth - 20;

        for (const word of words) {
            const testLine = line + word + ' ';
            const metrics = this.ctx.measureText(testLine);
            if (metrics.width > maxWidth && line !== '') {
                this.ctx.fillText(line, this.width / 2, y);
                line = word + ' ';
                y += 20;
            } else {
                line = testLine;
            }
        }
        this.ctx.fillText(line, this.width / 2, y);

        this.ctx.textAlign = 'left';
    }

    private renderControls(): void {
        // Only show on desktop
        if (this.input.getIsMobile()) return;

        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(this.width - 180, this.height - 110, 170, 100);

        this.ctx.fillStyle = '#AAA';
        this.ctx.font = '11px Arial';
        this.ctx.fillText('WASD / ← ↑ → ↓  Move', this.width - 170, this.height - 90);
        this.ctx.fillText('E / Space       Interact', this.width - 170, this.height - 72);
        this.ctx.fillText('C               Camera', this.width - 170, this.height - 54);
        this.ctx.fillText('Click           Take Photo', this.width - 170, this.height - 36);
        this.ctx.fillText('ESC             Menu', this.width - 170, this.height - 18);
    }

    public stop(): void {
        this.isRunning = false;
        this.saveProgress();
    }
}
