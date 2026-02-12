/**
 * 坦克类
 */
class Tank extends Entity {
    constructor(x, y, type, isPlayer = false) {
        super(x, y, CONSTANTS.TANK_SIZE, CONSTANTS.TANK_SIZE);
        this.type = type;
        this.isPlayer = isPlayer;
        this.direction = CONSTANTS.DIRECTION.UP;
        this.speed = 2;
        this.bulletSpeed = 6;
        this.maxBullets = 1;
        this.health = 1;
        this.invulnerable = 0; // 无敌时间
        
        // 根据类型设置属性
        this.setTypeProperties();
        
        // 射击冷却
        this.shootCooldown = 0;
        this.shootCooldownMax = 15;
        
        // 移动动画
        this.moveAnimation = 0;
        this.isMoving = false;
        
        // 当前子弹数
        this.currentBullets = 0;
    }
    
    setTypeProperties() {
        switch (this.type) {
            case CONSTANTS.TANK_TYPE.PLAYER:
                this.speed = 2.5;
                this.health = 1;
                this.color = CONSTANTS.COLORS.PLAYER_TANK;
                break;
            case CONSTANTS.TANK_TYPE.ENEMY_BASIC:
                this.speed = 1.5;
                this.health = 1;
                this.color = CONSTANTS.COLORS.ENEMY_BASIC;
                this.maxBullets = 1;
                break;
            case CONSTANTS.TANK_TYPE.ENEMY_FAST:
                this.speed = 3;
                this.health = 1;
                this.color = CONSTANTS.COLORS.ENEMY_FAST;
                this.maxBullets = 1;
                break;
            case CONSTANTS.TANK_TYPE.ENEMY_HEAVY:
                this.speed = 1;
                this.health = 4;
                this.color = CONSTANTS.COLORS.ENEMY_HEAVY;
                this.maxBullets = 1;
                break;
        }
    }
    
    update(deltaTime) {
        // 更新无敌时间
        if (this.invulnerable > 0) {
            this.invulnerable--;
        }
        
        // 更新射击冷却
        if (this.shootCooldown > 0) {
            this.shootCooldown--;
        }
        
        // 更新移动动画
        if (this.isMoving) {
            this.moveAnimation += 0.2;
        }
    }
    
    move(direction, map) {
        this.direction = direction;
        this.isMoving = true;
        
        const vector = Utils.getDirectionVector(direction);
        const newX = this.x + vector.x * this.speed;
        const newY = this.y + vector.y * this.speed;
        
        // 检查碰撞
        if (this.canMoveTo(newX, newY, map)) {
            this.x = newX;
            this.y = newY;
            return true;
        }
        
        return false;
    }
    
    canMoveTo(x, y, map) {
        // 检查边界
        if (!Utils.isInCanvas(x, y, this.width, this.height)) {
            return false;
        }
        
        // 检查地图碰撞
        const bounds = { x, y, width: this.width, height: this.height };
        
        // 获取覆盖的网格
        const startCol = Math.floor(x / CONSTANTS.TILE_SIZE);
        const endCol = Math.floor((x + this.width) / CONSTANTS.TILE_SIZE);
        const startRow = Math.floor((y - CONSTANTS.OFFSET_Y) / CONSTANTS.TILE_SIZE);
        const endRow = Math.floor((y + this.height - CONSTANTS.OFFSET_Y) / CONSTANTS.TILE_SIZE);
        
        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                if (map.isSolid(col, row)) {
                    const tileBounds = {
                        x: col * CONSTANTS.TILE_SIZE,
                        y: row * CONSTANTS.TILE_SIZE + CONSTANTS.OFFSET_Y,
                        width: CONSTANTS.TILE_SIZE,
                        height: CONSTANTS.TILE_SIZE
                    };
                    
                    if (Utils.checkRectCollision(bounds, tileBounds)) {
                        return false;
                    }
                }
            }
        }
        
        return true;
    }
    
    shoot() {
        if (this.shootCooldown > 0 || this.currentBullets >= this.maxBullets) {
            return null;
        }
        
        this.shootCooldown = this.shootCooldownMax;
        this.currentBullets++;
        
        // 计算子弹发射位置（坦克炮管前方）
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const offset = this.width / 2 + 4;
        
        let bulletX = centerX;
        let bulletY = centerY;
        
        switch (this.direction) {
            case CONSTANTS.DIRECTION.UP:
                bulletY -= offset;
                break;
            case CONSTANTS.DIRECTION.DOWN:
                bulletY += offset;
                break;
            case CONSTANTS.DIRECTION.LEFT:
                bulletX -= offset;
                break;
            case CONSTANTS.DIRECTION.RIGHT:
                bulletX += offset;
                break;
        }
        
        return new Bullet(bulletX, bulletY, this.direction, this.isPlayer, this.bulletSpeed, this);
    }
    
    takeDamage(damage) {
        if (this.invulnerable > 0) return false;
        
        this.health -= damage;
        
        if (this.health <= 0) {
            this.destroy();
            return true;
        }
        
        // 受伤时短暂无敌
        this.invulnerable = 10;
        return false;
    }
    
    onBulletDestroyed() {
        this.currentBullets = Math.max(0, this.currentBullets - 1);
    }
    
    render(ctx) {
        // 无敌时闪烁
        if (this.invulnerable > 0 && Math.floor(Date.now() / 100) % 2 === 0) {
            return;
        }
        
        const x = Math.floor(this.x);
        const y = Math.floor(this.y);
        const size = this.width;
        const halfSize = size / 2;
        
        ctx.fillStyle = this.color;
        
        // 绘制坦克主体（像素风格）
        // 履带
        const trackOffset = Math.sin(this.moveAnimation) * 2;
        ctx.fillStyle = '#333';
        ctx.fillRect(x, y, 6, size);
        ctx.fillRect(x + size - 6, y, 6, size);
        
        // 履带纹理
        ctx.fillStyle = '#555';
        for (let i = 0; i < size; i += 6) {
            ctx.fillRect(x, y + i + trackOffset, 6, 3);
            ctx.fillRect(x + size - 6, y + i + trackOffset, 6, 3);
        }
        
        // 坦克主体
        ctx.fillStyle = this.color;
        ctx.fillRect(x + 6, y + 4, size - 12, size - 8);
        
        // 坦克炮塔
        ctx.fillStyle = this.lightenColor(this.color, 20);
        ctx.fillRect(x + 10, y + 10, size - 20, size - 20);
        
        // 炮管
        ctx.fillStyle = '#333';
        const barrelWidth = 6;
        const barrelLength = 12;
        
        switch (this.direction) {
            case CONSTANTS.DIRECTION.UP:
                ctx.fillRect(x + halfSize - barrelWidth/2, y - barrelLength + 6, barrelWidth, barrelLength);
                break;
            case CONSTANTS.DIRECTION.DOWN:
                ctx.fillRect(x + halfSize - barrelWidth/2, y + size - 6, barrelWidth, barrelLength);
                break;
            case CONSTANTS.DIRECTION.LEFT:
                ctx.fillRect(x - barrelLength + 6, y + halfSize - barrelWidth/2, barrelLength, barrelWidth);
                break;
            case CONSTANTS.DIRECTION.RIGHT:
                ctx.fillRect(x + size - 6, y + halfSize - barrelWidth/2, barrelLength, barrelWidth);
                break;
        }
        
        // 重型坦克显示血量
        if (this.type === CONSTANTS.TANK_TYPE.ENEMY_HEAVY && this.health > 1) {
            ctx.fillStyle = '#fff';
            ctx.font = '10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(this.health.toString(), x + halfSize, y + halfSize + 3);
        }
    }
    
    lightenColor(color, percent) {
        // 简单的颜色变亮
        return color;
    }
}

window.Tank = Tank;
