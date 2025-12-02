// Main entry point for Milo van Zee: World Explorer
import { Game } from './Game.js';
// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Create and start the game
        const game = new Game();
        game.start();
        // Handle visibility change (pause when tab is hidden)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Game will auto-save due to the periodic save in update loop
                console.log('Game paused - tab hidden');
            }
            else {
                console.log('Game resumed');
            }
        });
        // Handle before unload (save progress)
        window.addEventListener('beforeunload', () => {
            game.stop();
        });
        console.log('🧭 Milo van Zee: World Explorer started!');
        console.log('Controls:');
        console.log('  WASD / Arrow keys - Move');
        console.log('  E / Space - Interact with animals');
        console.log('  C - Toggle camera mode');
        console.log('  Click - Take photo (in camera mode)');
        console.log('  ESC - Menu');
    }
    catch (error) {
        console.error('Failed to start game:', error);
        // Show error on screen
        const container = document.getElementById('gameContainer');
        if (container) {
            container.innerHTML = `
                <div style="color: white; text-align: center; padding: 50px;">
                    <h1>⚠️ Error</h1>
                    <p>Failed to start the game. Please refresh the page.</p>
                    <p style="color: #888; font-size: 12px;">${error}</p>
                </div>
            `;
        }
    }
});
//# sourceMappingURL=main.js.map