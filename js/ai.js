/**
 * AI 系统 - 敌人坦克行为控制
 */
class EnemyAI {
    constructor() {
        this.changeDirectionTimer = 0;
        this.shootTimer = 0;
        this.moveTimer = 0;
        
        // AI行为参数
        this.directionChangeInterval = { min: 30, max: 90 };
        this.shootInterval = { min: 20, max: 60 };
        this.moveDuration = { min: 30, max: 120 };
    }
    
    // 更新AI
    update(enemy, player, map) {
        if (!enemy.active) return;
        
        // 更新计时器
        this.changeDirectionTimer--;
        this.shootTimer--;
        this.moveTimer--;
        
        // 决定是否射击
        if (this.shootTimer <= 0) {
            this.shootTimer = Utils.randomInt(this.shootInterval.min, this.shootInterval.max);
            
            // 根据敌人类型调整射击欲望
            if (enemy.type === CONSTANTS.TANK_TYPE.ENEMY_FAST) {
                this.shootTimer = Math.floor(this.shootTimer * 0.6); // 快速坦克射击更频繁
            }
            
            return { action: 'shoot' };
        }
        
        // 决定是否改变方向
        let shouldChangeDirection = false;
        
        if (this.changeDirectionTimer <= 0) {
            shouldChangeDirection = true;
            this.changeDirectionTimer = Utils.randomInt(
                this.directionChangeInterval.min, 
                this.directionChangeInterval.max
            );
        }
        
        // 检测前方是否有障碍物
        if (this.checkObstacleAhead(enemy, map)) {
            shouldChangeDirection = true;
        }
        
        // 检测是否靠近边界
        if (this.checkNearBoundary(enemy)) {
            shouldChangeDirection = true;
        }
        
        // 简单追踪玩家
        if (player && player.active && Math.random() < 0.3) {
            const direction = this.getDirectionTowardsPlayer(enemy, player);
            if (direction !== null) {
                return { action: 'move', direction };
            }
        }
        
        if (shouldChangeDirection || this.moveTimer <= 0) {
            this.moveTimer = Utils.randomInt(this.moveDuration.min, this.moveDuration.max);
            const direction = this.chooseRandomDirection(enemy, map);
            return { action: 'move', direction };
        }
        
        // 继续当前方向移动
        return { action: 'move', direction: enemy.direction };
    }
    
    // 检查前方障碍物
    checkObstacleAhead(enemy, map) {
        const vector = Utils.getDirectionVector(enemy.direction);
        const checkDistance = CONSTANTS.TILE_SIZE;
        
        const checkX = enemy.x + enemy.width / 2 + vector.x * checkDistance;
        const checkY = enemy.y + enemy.height / 2 + vector.y * checkDistance;
        
        const gridPos = Utils.getGridPosition(checkX, checkY);
        return map.isSolid(gridPos.col, gridPos.row);
    }
    
    // 检查是否靠近边界
    checkNearBoundary(enemy) {
        const margin = CONSTANTS.TILE_SIZE;
        
        switch (enemy.direction) {
            case CONSTANTS.DIRECTION.UP:
                return enemy.y < CONSTANTS.OFFSET_Y + margin;
            case CONSTANTS.DIRECTION.DOWN:
                return enemy.y > CONSTANTS.CANVAS_HEIGHT - enemy.height - margin;
            case CONSTANTS.DIRECTION.LEFT:
                return enemy.x < margin;
            case CONSTANTS.DIRECTION.RIGHT:
                return enemy.x > CONSTANTS.CANVAS_WIDTH - enemy.width - margin;
        }
        return false;
    }
    
    // 朝向玩家的方向
    getDirectionTowardsPlayer(enemy, player) {
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        
        // 随机选择水平或垂直方向
        if (Math.random() < 0.5) {
            if (Math.abs(dx) > Math.abs(dy)) {
                return dx > 0 ? CONSTANTS.DIRECTION.RIGHT : CONSTANTS.DIRECTION.LEFT;
            } else {
                return dy > 0 ? CONSTANTS.DIRECTION.DOWN : CONSTANTS.DIRECTION.UP;
            }
        }
        
        return null;
    }
    
    // 选择随机方向
    chooseRandomDirection(enemy, map) {
        const directions = [
            CONSTANTS.DIRECTION.UP,
            CONSTANTS.DIRECTION.DOWN,
            CONSTANTS.DIRECTION.LEFT,
            CONSTANTS.DIRECTION.RIGHT
        ];
        
        // 打乱方向顺序
        for (let i = directions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [directions[i], directions[j]] = [directions[j], directions[i]];
        }
        
        // 优先选择可以继续前进的方向
        for (const dir of directions) {
            if (dir === enemy.direction) {
                if (!this.checkObstacleAhead(enemy, map)) {
                    return dir;
                }
            }
        }
        
        // 选择没有障碍物的方向
        for (const dir of directions) {
            const vector = Utils.getDirectionVector(dir);
            const checkX = enemy.x + vector.x * enemy.speed * 5;
            const checkY = enemy.y + vector.y * enemy.speed * 5;
            
            if (enemy.canMoveTo(checkX, checkY, map)) {
                return dir;
            }
        }
        
        // 随机返回一个方向
        return directions[0];
    }
}

// 敌人管理器
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

// 导出到全局
window.EnemyAI = EnemyAI;
window.EnemyManager = EnemyManager;
