// Input handler for keyboard and touch controls
export class InputHandler {
    constructor() {
        this.joystickElement = null;
        this.joystickKnob = null;
        this.joystickCenter = { x: 0, y: 0 };
        this.joystickRadius = 50;
        this.inputState = {
            up: false,
            down: false,
            left: false,
            right: false,
            action: false,
            camera: false,
            escape: false,
            map: false,
            backpack: false,
            badges: false,
            journal: false,
            zoomIn: false,
            zoomOut: false,
            focusUp: false,
            focusDown: false,
        };
        this.joystickState = { active: false, dx: 0, dy: 0 };
        this.isMobile = this.detectMobile();
        this.setupKeyboardListeners();
    }
    static getInstance() {
        if (!InputHandler.instance) {
            InputHandler.instance = new InputHandler();
        }
        return InputHandler.instance;
    }
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
    }
    getIsMobile() {
        return this.isMobile;
    }
    setupKeyboardListeners() {
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }
    handleKeyDown(e) {
        switch (e.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.inputState.up = true;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.inputState.down = true;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.inputState.left = true;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.inputState.right = true;
                break;
            case 'Space':
            case 'KeyE':
                this.inputState.action = true;
                e.preventDefault();
                break;
            case 'KeyC':
                this.inputState.camera = true;
                break;
            case 'Escape':
                this.inputState.escape = true;
                break;
            case 'KeyM':
                this.inputState.map = true;
                break;
            case 'KeyB':
                this.inputState.backpack = true;
                break;
            case 'KeyT':
                this.inputState.badges = true;
                break;
            case 'KeyJ':
                this.inputState.journal = true;
                break;
            // Camera controls
            case 'KeyQ':
                this.inputState.zoomOut = true;
                break;
            case 'KeyE':
                this.inputState.zoomIn = true;
                break;
            case 'KeyX':
                this.inputState.zoomOut = true;
                break;
            case 'KeyY':
                this.inputState.zoomIn = true;
                break;
            case 'KeyR':
                this.inputState.focusUp = true;
                break;
            case 'KeyF':
                this.inputState.focusDown = true;
                break;
        }
    }
    handleKeyUp(e) {
        switch (e.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.inputState.up = false;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.inputState.down = false;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.inputState.left = false;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.inputState.right = false;
                break;
            case 'Space':
            case 'KeyE':
                this.inputState.action = false;
                break;
            case 'KeyC':
                this.inputState.camera = false;
                break;
            case 'Escape':
                this.inputState.escape = false;
                break;
            case 'KeyM':
                this.inputState.map = false;
                break;
            case 'KeyB':
                this.inputState.backpack = false;
                break;
            case 'KeyT':
                this.inputState.badges = false;
                break;
            case 'KeyJ':
                this.inputState.journal = false;
                break;
            // Camera controls
            case 'KeyQ':
                this.inputState.zoomOut = false;
                break;
            case 'KeyE':
                this.inputState.zoomIn = false;
                break;
            case 'KeyX':
                this.inputState.zoomOut = false;
                break;
            case 'KeyY':
                this.inputState.zoomIn = false;
                break;
            case 'KeyR':
                this.inputState.focusUp = false;
                break;
            case 'KeyF':
                this.inputState.focusDown = false;
                break;
        }
    }
    setupJoystick(joystick, knob) {
        this.joystickElement = joystick;
        this.joystickKnob = knob;
        const rect = joystick.getBoundingClientRect();
        this.joystickCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        this.joystickRadius = rect.width / 2 - 20;
        joystick.addEventListener('touchstart', (e) => this.handleJoystickStart(e));
        joystick.addEventListener('touchmove', (e) => this.handleJoystickMove(e));
        joystick.addEventListener('touchend', () => this.handleJoystickEnd());
    }
    handleJoystickStart(e) {
        e.preventDefault();
        this.joystickState.active = true;
        this.handleJoystickMove(e);
    }
    handleJoystickMove(e) {
        if (!this.joystickState.active || !e.touches[0])
            return;
        e.preventDefault();
        const touch = e.touches[0];
        const dx = touch.clientX - this.joystickCenter.x;
        const dy = touch.clientY - this.joystickCenter.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        const limitedDistance = Math.min(distance, this.joystickRadius);
        this.joystickState.dx = (limitedDistance / this.joystickRadius) * Math.cos(angle);
        this.joystickState.dy = (limitedDistance / this.joystickRadius) * Math.sin(angle);
        if (this.joystickKnob) {
            this.joystickKnob.style.transform =
                `translate(${limitedDistance * Math.cos(angle)}px, ${limitedDistance * Math.sin(angle)}px)`;
        }
    }
    handleJoystickEnd() {
        this.joystickState.active = false;
        this.joystickState.dx = 0;
        this.joystickState.dy = 0;
        if (this.joystickKnob) {
            this.joystickKnob.style.transform = 'translate(0px, 0px)';
        }
    }
    getInputState() {
        return { ...this.inputState };
    }
    getJoystickState() {
        return { ...this.joystickState };
    }
    getMovementVector() {
        if (this.joystickState.active) {
            return { x: this.joystickState.dx, y: this.joystickState.dy };
        }
        let x = 0, y = 0;
        if (this.inputState.left)
            x -= 1;
        if (this.inputState.right)
            x += 1;
        if (this.inputState.up)
            y -= 1;
        if (this.inputState.down)
            y += 1;
        const length = Math.sqrt(x * x + y * y);
        if (length > 0) {
            x /= length;
            y /= length;
        }
        return { x, y };
    }
    resetAction() {
        this.inputState.action = false;
    }
    resetCamera() {
        this.inputState.camera = false;
    }
    resetEscape() {
        this.inputState.escape = false;
    }
    resetMap() {
        this.inputState.map = false;
    }
    resetBackpack() {
        this.inputState.backpack = false;
    }
    resetBadges() {
        this.inputState.badges = false;
    }
    resetJournal() {
        this.inputState.journal = false;
    }
}
//# sourceMappingURL=input.js.map