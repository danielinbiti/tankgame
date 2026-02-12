/**
 * 子弹类
 */
class Bullet extends Entity {
    constructor(x, y, direction, isPlayerBullet, speed = 8, owner = null) {
        super(x, y, CONSTANTS.BULLET_SIZE, CONSTANTS.BULLET_SIZE);
        this.direction = direction;
        this.isPlayerBullet = isPlayerBullet;
        this.speed = speed;
        this.damage = 1;
        this.owner = owner; // 记录发射者，用于回调
        
        // 调整子弹位置使其从坦克中心射出
        this.x = x - CONSTANTS.BULLET_SIZE / 2;
        this.y = y - CONSTANTS.BULLET_SIZE / 2;
    }
    
    destroy() {
        this.active = false;
        // 通知所有者子弹已销毁
        if (this.owner && this.owner.currentBullets > 0) {
            this.owner.currentBullets--;
        }
    }
    
    update(deltaTime) {
        const vector = Utils.getDirectionVector(this.direction);
        this.x += vector.x * this.speed;
        this.y += vector.y * this.speed;
        
        // 检查是否超出边界
        if (!Utils.isInCanvas(this.x, this.y, this.width, this.height)) {
            this.destroy();
        }
    }
    
    render(ctx) {
        ctx.fillStyle = CONSTANTS.COLORS.BULLET;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 添加发光效果
        ctx.shadowColor = CONSTANTS.COLORS.BULLET;
        ctx.shadowBlur = 4;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
    }
}

window.Bullet = Bullet;
