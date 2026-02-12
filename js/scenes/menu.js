/**
 * 开始菜单场景
 */
class MenuScene extends Scene {
    constructor(game) {
        super(game);
        this.title = '坦克大战';
        this.subtitle = '按回车开始游戏';
        this.blinkTimer = 0;
    }
    
    enter() {
        super.enter();
        this.game.showMenu();
    }
    
    update(deltaTime) {
        this.blinkTimer += deltaTime;
    }
    
    render(ctx) {
        const canvas = this.game.canvas;
        
        // 清空画布
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 绘制边框
        ctx.strokeStyle = '#4a4a6a';
        ctx.lineWidth = 4;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
        
        // 绘制标题
        ctx.fillStyle = '#f1c40f';
        ctx.font = 'bold 48px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.title, canvas.width / 2, canvas.height / 2 - 60);
        
        // 绘制标题描边
        ctx.strokeStyle = '#e67e22';
        ctx.lineWidth = 2;
        ctx.strokeText(this.title, canvas.width / 2, canvas.height / 2 - 60);
        
        // 闪烁副标题
        if (Math.floor(this.blinkTimer / 500) % 2 === 0) {
            ctx.fillStyle = '#fff';
            ctx.font = '20px "Courier New", monospace';
            ctx.fillText(this.subtitle, canvas.width / 2, canvas.height / 2 + 20);
        }
        
        // 操作说明
        ctx.fillStyle = '#95a5a6';
        ctx.font = '14px "Courier New", monospace';
        ctx.fillText('WASD / 方向键 - 移动', canvas.width / 2, canvas.height / 2 + 70);
        ctx.fillText('空格 / J - 射击', canvas.width / 2, canvas.height / 2 + 90);
        ctx.fillText('P - 暂停', canvas.width / 2, canvas.height / 2 + 110);
    }
    
    handleInput(input) {
        if (input.isKeyPressed('Enter')) {
            this.game.start();
        }
    }
}

window.MenuScene = MenuScene;
