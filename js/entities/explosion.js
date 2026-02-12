/**
 * 爆炸效果类
 */
class Explosion extends Entity {
    constructor(x, y, size = 'normal') {
        super(x, y, 32, 32);
        this.size = size;
        this.frame = 0;
        this.maxFrames = size === 'large' ? 16 : 10;
        this.radius = size === 'large' ? 40 : 20;
    }
    
    update(deltaTime) {
        this.frame++;
        
        if (this.frame >= this.maxFrames) {
            this.destroy();
        }
    }
    
    render(ctx) {
        const progress = this.frame / this.maxFrames;
        const currentRadius = this.radius * (0.5 + progress * 0.5);
        
        const x = this.x + this.width / 2;
        const y = this.y + this.height / 2;
        
        // 爆炸颜色从白到黄到红
        let colors;
        if (progress < 0.3) {
            colors = ['#fff', '#ffeb3b', '#ff9800'];
        } else if (progress < 0.6) {
            colors = ['#ffeb3b', '#ff9800', '#f44336'];
        } else {
            colors = ['#ff9800', '#f44336', '#333'];
        }
        
        // 绘制爆炸圆环
        for (let i = 0; i < colors.length; i++) {
            ctx.beginPath();
            ctx.arc(x, y, currentRadius * (1 - i * 0.2), 0, Math.PI * 2);
            ctx.fillStyle = colors[i];
            ctx.fill();
        }
        
        // 爆炸碎片
        ctx.fillStyle = '#fff';
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + progress * Math.PI;
            const dist = currentRadius * 0.8;
            const px = x + Math.cos(angle) * dist;
            const py = y + Math.sin(angle) * dist;
            const particleSize = (1 - progress) * 6;
            
            ctx.fillRect(px - particleSize/2, py - particleSize/2, particleSize, particleSize);
        }
    }
}

window.Explosion = Explosion;
