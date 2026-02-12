/**
 * 过关场景
 */
class VictoryScene extends Scene {
    constructor(game) {
        super(game);
    }
    
    enter() {
        super.enter();
        const game = this.game;
        
        // 更新UI
        document.getElementById('level-score').textContent = game.score;
        document.getElementById('next-level').textContent = game.level + 1;
        game.levelCompleteMenu.classList.remove('hidden');
        
        // 检查是否是最后一关
        if (game.levelManager.isLastLevel()) {
            document.getElementById('next-level').textContent = '已完成所有关卡！';
        }
    }
    
    render(ctx) {
        // 过关场景主要使用DOM UI，这里只绘制背景
        const game = this.game;
        
        ctx.fillStyle = 'rgba(0, 50, 0, 0.8)';
        ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);
        
        ctx.fillStyle = '#2ecc71';
        ctx.font = 'bold 32px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('关卡完成！', game.canvas.width/2, game.canvas.height/2 - 50);
    }
    
    handleInput(input) {
        if (input.isKeyPressed('Enter')) {
            this.game.nextLevel();
        }
    }
}

window.VictoryScene = VictoryScene;
