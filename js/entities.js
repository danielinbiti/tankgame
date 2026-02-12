/**
 * 游戏实体类 - 坦克、子弹、墙壁、爆炸等
 */

// 基础实体类
class Entity {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.active = true;
        this.id = Utils.generateId();
    }
    
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
    
    update(deltaTime) {
        // 子类实现
    }
    
    render(ctx) {
        // 子类实现
    }
    
    destroy() {
        this.active = false;
    }
}

// 子弹类
class Bullet extends Entity {
    constructor(x, y, direction, isPlayerBullet, speed = 8) {
        super(x, y, CONSTANTS.BULLET_SIZE, CONSTANTS.BULLET_SIZE);
        this.direction = direction;
        this.isPlayerBullet = isPlayerBullet;
        this.speed = speed;
        this.damage = 1;
        
        // 调整子弹位置使其从坦克中心射出
        this.x = x - CONSTANTS.BULLET_SIZE / 2;
        this.y = y - CONSTANTS.BULLET_SIZE / 2;
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

// 坦克类
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
        
        return new Bullet(bulletX, bulletY, this.direction, this.isPlayer, this.bulletSpeed);
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

// 墙壁类
class Wall {
    constructor(col, row, type) {
        this.col = col;
        this.row = row;
        this.type = type;
        this.x = col * CONSTANTS.TILE_SIZE;
        this.y = row * CONSTANTS.TILE_SIZE + CONSTANTS.OFFSET_Y;
        this.width = CONSTANTS.TILE_SIZE;
        this.height = CONSTANTS.TILE_SIZE;
        this.active = true;
        
        // 砖墙有血量
        this.health = type === CONSTANTS.TILE.BRICK ? 1 : 999;
    }
    
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
    
    takeDamage(damage) {
        if (this.type === CONSTANTS.TILE.STEEL) {
            return false; // 钢墙不可破坏
        }
        
        if (this.type === CONSTANTS.TILE.BRICK) {
            this.health -= damage;
            if (this.health <= 0) {
                this.active = false;
                return true;
            }
        }
        
        return false;
    }
    
    render(ctx) {
        const x = Math.floor(this.x);
        const y = Math.floor(this.y);
        const size = this.width;
        
        switch (this.type) {
            case CONSTANTS.TILE.BRICK:
                ctx.fillStyle = CONSTANTS.COLORS.BRICK;
                ctx.fillRect(x, y, size, size);
                
                // 砖块纹理
                ctx.fillStyle = '#a04000';
                ctx.fillRect(x + 2, y + 2, size - 4, 4);
                ctx.fillRect(x + 2, y + 10, size - 4, 4);
                ctx.fillRect(x + 2, y + 18, size - 4, 4);
                ctx.fillRect(x + 2, y + 26, size - 4, 4);
                
                ctx.strokeStyle = '#802000';
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, size, size);
                break;
                
            case CONSTANTS.TILE.STEEL:
                ctx.fillStyle = CONSTANTS.COLORS.STEEL;
                ctx.fillRect(x, y, size, size);
                
                // 金属光泽
                ctx.fillStyle = '#bdc3c7';
                ctx.fillRect(x + 4, y + 4, size - 8, 4);
                ctx.fillRect(x + 4, y + 12, 4, size - 16);
                
                ctx.strokeStyle = '#7f8c8d';
                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, size, size);
                break;
                
            case CONSTANTS.TILE.GRASS:
                ctx.fillStyle = CONSTANTS.COLORS.GRASS;
                // 草丛纹理（随机草叶）
                for (let i = 0; i < 8; i++) {
                    const gx = x + Math.random() * size;
                    const gy = y + Math.random() * size;
                    ctx.fillRect(gx, gy, 3, 8);
                }
                break;
                
            case CONSTANTS.TILE.WATER:
                ctx.fillStyle = CONSTANTS.COLORS.WATER;
                ctx.fillRect(x, y, size, size);
                
                // 水波纹
                ctx.fillStyle = '#3498db';
                const offset = Math.sin(Date.now() / 500) * 4;
                ctx.fillRect(x + offset, y + size/2 - 2, size - Math.abs(offset) * 2, 4);
                break;
                
            case CONSTANTS.TILE.BASE:
                // 基地外观
                ctx.fillStyle = '#555';
                ctx.fillRect(x + 4, y + 4, size - 8, size - 8);
                
                ctx.fillStyle = CONSTANTS.COLORS.BASE;
                ctx.fillRect(x + 10, y + 10, size - 20, size - 20);
                
                // 基地图标
                ctx.fillStyle = '#e74c3c';
                ctx.beginPath();
                ctx.moveTo(x + size/2, y + 14);
                ctx.lineTo(x + size/2 + 6, y + size - 14);
                ctx.lineTo(x + size/2 - 6, y + size - 14);
                ctx.closePath();
                ctx.fill();
                break;
        }
    }
}

// 爆炸效果类
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

// 导出到全局
window.Entity = Entity;
window.Bullet = Bullet;
window.Tank = Tank;
window.Wall = Wall;
window.Explosion = Explosion;
