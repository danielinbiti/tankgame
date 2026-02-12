/**
 * 敌人生成器系统
 */
class EnemyManager {
    constructor() {
        this.enemies = [];
        this.spawnQueue = [];
        this.spawnTimer = 0;
        this.spawnInterval = 120; // 生成间隔帧数
        this.maxEnemiesOnScreen = 4;
        this.spawnPositions = [
            { x: 64, y: 48 },
            { x: 256, y: 48 },
            { x: 448, y: 48 }
        ];
        this.spawnIndex = 0;
    }
    
    // 初始化关卡
    initLevel(levelData) {
        this.enemies = [];
        this.spawnQueue = [];
        this.spawnTimer = 0;
        this.spawnIndex = 0;
        
        // 生成敌人队列
        const totalEnemies = levelData.enemyCount;
        const ratios = levelData.enemies;
        
        for (let i = 0; i < totalEnemies; i++) {
            const rand = Math.random();
            let type;
            
            if (rand < ratios.basic) {
                type = CONSTANTS.TANK_TYPE.ENEMY_BASIC;
            } else if (rand < ratios.basic + ratios.fast) {
                type = CONSTANTS.TANK_TYPE.ENEMY_FAST;
            } else {
                type = CONSTANTS.TANK_TYPE.ENEMY_HEAVY;
            }
            
            this.spawnQueue.push(type);
        }
    }
    
    // 更新
    update(map) {
        // 更新现有敌人
        for (const enemy of this.enemies) {
            enemy.update();
        }
        
        // 移除死亡敌人
        this.enemies = this.enemies.filter(e => e.active);
        
        // 生成新敌人
        if (this.spawnQueue.length > 0 && this.enemies.length < this.maxEnemiesOnScreen) {
            this.spawnTimer--;
            
            if (this.spawnTimer <= 0) {
                this.spawnTimer = this.spawnInterval;
                this.spawnEnemy(map);
            }
        }
    }
    
    // 生成敌人
    spawnEnemy(map) {
        if (this.spawnQueue.length === 0) return;
        
        const type = this.spawnQueue.shift();
        const pos = this.spawnPositions[this.spawnIndex % this.spawnPositions.length];
        this.spawnIndex++;
        
        // 检查生成位置是否被占用
        const tempEnemy = new Tank(pos.x, pos.y, type, false);
        const bounds = tempEnemy.getBounds();
        
        for (const enemy of this.enemies) {
            if (Utils.checkRectCollision(bounds, enemy.getBounds())) {
                // 位置被占用，延迟生成
                this.spawnQueue.unshift(type);
                this.spawnTimer = 30;
                return;
            }
        }
        
        const enemy = new Tank(pos.x, pos.y, type, false);
        enemy.ai = new EnemyAI();
        this.enemies.push(enemy);
    }
    
    // 获取剩余敌人数量
    getRemainingCount() {
        return this.spawnQueue.length + this.enemies.length;
    }
    
    // 渲染
    render(ctx) {
        for (const enemy of this.enemies) {
            enemy.render(ctx);
        }
    }
    
    // 清空所有敌人
    clear() {
        this.enemies = [];
        this.spawnQueue = [];
    }
}

window.EnemyManager = EnemyManager;
