/**
 * 游戏常量配置
 */

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

window.CONSTANTS = CONSTANTS;
