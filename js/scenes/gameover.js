/**
 * 游戏结束场景
 */
class GameOverScene extends Scene {
    constructor(game) {
        super(game);
    }
    
    enter() {
        super.enter();
        const game = this.game;
        
        // 保存最高分
        if (game.score > game.highScore) {
            game.highScore = game.score;
            game.saveHighScore();
        }
        
        // 更新UI
        document.getElementById('final-score').textContent = game.score;
        document.getElementById('final-level').textContent = game.level;
        game.gameOverMenu.classList.remove('hidden');
    }
    
    render(ctx) {
        // 游戏结束场景主要使用DOM UI，这里只绘制背景
        const game = this.game;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);
    }
    
    handleInput(input) {
        if (input.isKeyPressed('Enter')) {
            this.game.restart();
        }
    }
}

window.GameOverScene = GameOverScene;
