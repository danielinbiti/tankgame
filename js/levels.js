/**
 * 关卡系统 - 地图数据和关卡管理
 */

// 关卡数据 (0=空, 1=砖墙, 2=钢墙, 3=草地, 4=水, 5=基地)
const LEVEL_DATA = [
    // 第一关 - 基础关卡
    {
        name: "第一关",
        enemyCount: 20,
        enemies: {
            basic: 0.7,
            fast: 0.2,
            heavy: 0.1
        },
        map: [
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1],
            [0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1],
            [0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1],
            [0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [2,2,0,0,1,1,2,2,1,1,0,0,1,1,2,2],
            [0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [1,1,0,0,2,2,1,1,1,1,2,2,0,0,1,1],
            [1,1,0,0,2,2,1,1,1,1,2,2,0,0,1,1],
            [0,0,0,0,0,0,0,5,5,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,5,5,0,0,0,0,0,0,0]
        ]
    },
    // 第二关 - 更多钢墙
    {
        name: "第二关",
        enemyCount: 20,
        enemies: {
            basic: 0.6,
            fast: 0.25,
            heavy: 0.15
        },
        map: [
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,2,2,0,0,1,1,1,1,0,0,2,2,0,0],
            [0,0,2,2,0,0,1,1,1,1,0,0,2,2,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [1,1,0,0,2,2,0,0,0,0,2,2,0,0,1,1],
            [1,1,0,0,2,2,0,0,0,0,2,2,0,0,1,1],
            [0,0,0,0,0,0,0,2,2,0,0,0,0,0,0,0],
            [0,0,1,1,0,0,0,2,2,0,0,0,1,1,0,0],
            [0,0,1,1,0,0,0,0,0,0,0,0,1,1,0,0],
            [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
            [0,0,2,2,0,0,1,1,1,1,0,0,2,2,0,0],
            [0,0,0,0,0,0,0,5,5,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,5,5,0,0,0,0,0,0,0]
        ]
    },
    // 第三关 - 水域障碍
    {
        name: "第三关",
        enemyCount: 25,
        enemies: {
            basic: 0.5,
            fast: 0.3,
            heavy: 0.2
        },
        map: [
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,1,1,0,0,4,4,4,4,0,0,1,1,0,0],
            [0,0,1,1,0,0,4,4,4,4,0,0,1,1,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [2,2,0,0,1,1,0,0,0,0,1,1,0,0,2,2],
            [2,2,0,0,1,1,0,0,0,0,1,1,0,0,2,2],
            [0,0,0,0,0,0,0,4,4,0,0,0,0,0,0,0],
            [0,0,1,1,0,0,0,4,4,0,0,0,1,1,0,0],
            [0,0,1,1,0,0,0,0,0,0,0,0,1,1,0,0],
            [4,4,0,0,0,0,2,2,2,2,0,0,0,0,4,4],
            [4,4,0,0,0,0,2,2,2,2,0,0,0,0,4,4],
            [0,0,0,0,0,0,0,5,5,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,5,5,0,0,0,0,0,0,0]
        ]
    },
    // 第四关 - 复杂地形
    {
        name: "第四关",
        enemyCount: 25,
        enemies: {
            basic: 0.4,
            fast: 0.35,
            heavy: 0.25
        },
        map: [
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,2,2,1,1,0,0,0,0,1,1,2,2,0,0],
            [0,0,2,2,1,1,0,0,0,0,1,1,2,2,0,0],
            [1,1,0,0,0,0,2,2,2,2,0,0,0,0,1,1],
            [1,1,0,0,0,0,2,2,2,2,0,0,0,0,1,1],
            [0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0],
            [0,0,0,1,1,0,0,3,3,0,0,1,1,0,0,0],
            [2,2,0,0,0,0,3,3,3,3,0,0,0,0,2,2],
            [2,2,0,0,0,0,0,3,3,0,0,0,0,0,2,2],
            [0,0,1,1,0,0,0,0,0,0,0,0,1,1,0,0],
            [0,0,1,1,0,0,4,4,4,4,0,0,1,1,0,0],
            [0,0,0,0,0,0,0,5,5,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,5,5,0,0,0,0,0,0,0]
        ]
    },
    // 第五关 - 最终挑战
    {
        name: "第五关",
        enemyCount: 30,
        enemies: {
            basic: 0.3,
            fast: 0.4,
            heavy: 0.3
        },
        map: [
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,2,2,2,2,0,0,0,0,2,2,2,2,0,0],
            [0,0,2,1,1,2,0,0,0,0,2,1,1,2,0,0],
            [0,0,2,1,1,2,0,4,4,0,2,1,1,2,0,0],
            [1,1,0,0,0,0,0,4,4,0,0,0,0,0,1,1],
            [1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
            [0,0,0,2,2,0,0,3,3,0,0,2,2,0,0,0],
            [0,0,0,2,2,0,3,3,3,3,0,2,2,0,0,0],
            [4,4,0,0,0,0,0,3,3,0,0,0,0,0,4,4],
            [4,4,0,0,1,1,0,0,0,0,1,1,0,0,4,4],
            [0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0],
            [0,0,2,2,2,2,0,5,5,0,2,2,2,2,0,0],
            [0,0,2,2,2,2,0,5,5,0,2,2,2,2,0,0]
        ]
    }
];

// 地图类
class GameMap {
    constructor() {
        this.walls = [];
        this.grass = []; // 草地单独存储，因为可以穿透
        this.base = null;
    }
    
    // 加载关卡
    loadLevel(levelIndex) {
        this.walls = [];
        this.grass = [];
        
        if (levelIndex >= LEVEL_DATA.length) {
            levelIndex = LEVEL_DATA.length - 1;
        }
        
        const level = LEVEL_DATA[levelIndex];
        
        for (let row = 0; row < level.map.length; row++) {
            for (let col = 0; col < level.map[row].length; col++) {
                const tileType = level.map[row][col];
                
                if (tileType !== CONSTANTS.TILE.EMPTY) {
                    const wall = new Wall(col, row, tileType);
                    
                    if (tileType === CONSTANTS.TILE.GRASS) {
                        this.grass.push(wall);
                    } else if (tileType === CONSTANTS.TILE.BASE) {
                        this.base = wall;
                        this.walls.push(wall);
                    } else {
                        this.walls.push(wall);
                    }
                }
            }
        }
        
        return level;
    }
    
    // 检查是否为固体墙
    isSolid(col, row) {
        if (col < 0 || col >= CONSTANTS.GRID_WIDTH || 
            row < 0 || row >= CONSTANTS.GRID_HEIGHT) {
            return true; // 边界视为固体
        }
        
        for (const wall of this.walls) {
            if (wall.col === col && wall.row === row && wall.active) {
                if (wall.type !== CONSTANTS.TILE.GRASS) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    // 获取指定位置的墙
    getWallAt(col, row) {
        for (const wall of this.walls) {
            if (wall.col === col && wall.row === row && wall.active) {
                return wall;
            }
        }
        return null;
    }
    
    // 获取与矩形碰撞的墙
    getCollidingWalls(bounds) {
        const colliding = [];
        
        for (const wall of this.walls) {
            if (wall.active && Utils.checkRectCollision(bounds, wall.getBounds())) {
                colliding.push(wall);
            }
        }
        
        return colliding;
    }
    
    // 更新
    update() {
        // 移除不活跃的墙
        this.walls = this.walls.filter(wall => wall.active);
    }
    
    // 渲染
    render(ctx) {
        // 先渲染非草地
        for (const wall of this.walls) {
            if (wall.type !== CONSTANTS.TILE.GRASS) {
                wall.render(ctx);
            }
        }
    }
    
    // 渲染草地（覆盖在坦克上方）
    renderGrass(ctx) {
        for (const grass of this.grass) {
            grass.render(ctx);
        }
    }
}

// 关卡管理器
class LevelManager {
    constructor() {
        this.currentLevel = 0;
        this.maxLevel = LEVEL_DATA.length;
        this.map = new GameMap();
    }
    
    loadLevel(levelIndex) {
        this.currentLevel = levelIndex;
        if (this.currentLevel >= this.maxLevel) {
            this.currentLevel = 0; // 循环或结束游戏
        }
        
        return this.map.loadLevel(this.currentLevel);
    }
    
    nextLevel() {
        return this.loadLevel(this.currentLevel + 1);
    }
    
    getCurrentLevelData() {
        return LEVEL_DATA[this.currentLevel];
    }
    
    isLastLevel() {
        return this.currentLevel >= this.maxLevel - 1;
    }
}

// 导出到全局
window.LEVEL_DATA = LEVEL_DATA;
window.GameMap = GameMap;
window.LevelManager = LevelManager;
