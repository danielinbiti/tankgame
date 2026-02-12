/**
 * 工具函数和常量定义
 */

// 游戏常量
const CONSTANTS = {
    // 画布大小
    CANVAS_WIDTH: 512,
    CANVAS_HEIGHT: 448,
    
    // 格子大小（32x32像素一个格子）
    TILE_SIZE: 32,
    GRID_WIDTH: 16,
    GRID_HEIGHT: 14,
    
    // 游戏区域偏移（留出UI空间）
    OFFSET_X: 0,
    OFFSET_Y: 16,
    
    // 坦克大小
    TANK_SIZE: 28,
    
    // 子弹大小
    BULLET_SIZE: 8,
    
    // 方向
    DIRECTION: {
        UP: 0,
        RIGHT: 1,
        DOWN: 2,
        LEFT: 3
    },
    
    // 墙体类型
    TILE: {
        EMPTY: 0,
        BRICK: 1,      // 砖墙（可破坏）
        STEEL: 2,      // 钢墙（不可破坏）
        GRASS: 3,      // 草地（可隐藏）
        WATER: 4,      // 水（不可通过）
        BASE: 5        // 基地
    },
    
    // 坦克类型
    TANK_TYPE: {
        PLAYER: 0,
        ENEMY_BASIC: 1,
        ENEMY_FAST: 2,
        ENEMY_HEAVY: 3
    },
    
    // 游戏状态
    GAME_STATE: {
        MENU: 0,
        PLAYING: 1,
        PAUSED: 2,
        GAME_OVER: 3,
        LEVEL_COMPLETE: 4
    },
    
    // 颜色
    COLORS: {
        PLAYER_TANK: '#f0e68c',
        ENEMY_BASIC: '#c0392b',
        ENEMY_FAST: '#3498db',
        ENEMY_HEAVY: '#e67e22',
        BULLET: '#fff',
        BRICK: '#d35400',
        STEEL: '#95a5a6',
        GRASS: '#27ae60',
        WATER: '#2980b9',
        BASE: '#f1c40f'
    }
};

// 工具函数
const Utils = {
    // 检查两个矩形是否碰撞
    checkRectCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    },
    
    // 计算距离
    getDistance(obj1, obj2) {
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        return Math.sqrt(dx * dx + dy * dy);
    },
    
    // 生成随机整数
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    // 限制值在范围内
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },
    
    // 方向向量
    getDirectionVector(direction) {
        const vectors = [
            { x: 0, y: -1 },  // UP
            { x: 1, y: 0 },   // RIGHT
            { x: 0, y: 1 },   // DOWN
            { x: -1, y: 0 }   // LEFT
        ];
        return vectors[direction];
    },
    
    // 坐标对齐到网格
    alignToGrid(value) {
        return Math.round(value / CONSTANTS.TILE_SIZE) * CONSTANTS.TILE_SIZE;
    },
    
    // 检查坐标是否在画布内
    isInCanvas(x, y, width, height) {
        return x >= 0 && x + width <= CONSTANTS.CANVAS_WIDTH &&
               y >= CONSTANTS.OFFSET_Y && y + height <= CONSTANTS.CANVAS_HEIGHT;
    },
    
    // 获取网格坐标
    getGridPosition(x, y) {
        return {
            col: Math.floor(x / CONSTANTS.TILE_SIZE),
            row: Math.floor((y - CONSTANTS.OFFSET_Y) / CONSTANTS.TILE_SIZE)
        };
    },
    
    // 绘制像素风格的矩形（带边框）
    drawPixelRect(ctx, x, y, width, height, color, borderColor = null) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, width, height);
        
        if (borderColor) {
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, width, height);
        }
    },
    
    // 绘制像素文字
    drawPixelText(ctx, text, x, y, size = 16, color = '#fff', align = 'center') {
        ctx.fillStyle = color;
        ctx.font = `bold ${size}px 'Courier New', monospace`;
        ctx.textAlign = align;
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x, y);
    },
    
    // 生成唯一ID
    generateId() {
        return Date.now() + Math.random().toString(36).substr(2, 9);
    }
};

// 导出到全局
window.CONSTANTS = CONSTANTS;
window.Utils = Utils;
