/**
 * 墙壁类
 */
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

window.Wall = Wall;
