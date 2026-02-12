/**
 * 游戏主逻辑类
 */
class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // 游戏系统
        this.input = new InputManager();
        this.audio = new AudioManager();
        this.levelManager = new LevelManager();
        this.enemyManager = new EnemyManager();
        
        // 游戏状态
        this.state = CONSTANTS.GAME_STATE.MENU;
        this.score = 0;
        this.highScore = this.loadHighScore();
        this.lives = 3;
        this.level = 1;
        
        // 游戏实体
        this.player = null;
        this.bullets = [];
        this.explosions = [];
        this.particles = [];
        
        // 游戏循环
        this.lastTime = 0;
        this.animationId = null;
        
        // UI元素
        this.scoreDisplay = document.getElementById('score-display');
        this.highScoreDisplay = document.getElementById('highscore-display');
        this.levelDisplay = document.getElementById('level-display');
        this.livesDisplay = document.getElementById('lives-display');
        this.enemiesDisplay = document.getElementById('enemies-display');
        
        // 菜单
        this.startMenu = document.getElementById('start-menu');
        this.gameOverMenu = document.getElementById('game-over-menu');
        this.levelCompleteMenu = document.getElementById('level-complete-menu');
        
        // 初始化UI
        this.updateUI();
    }
    
    // 开始游戏
    start() {
        this.audio.init();
        this.audio.playStart();
        
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.loadLevel(0);
        
        this.state = CONSTANTS.GAME_STATE.PLAYING;
        this.hideAllMenus();
        
        this.startGameLoop();
    }
    
    // 加载关卡
    loadLevel(levelIndex) {
        const levelData = this.levelManager.loadLevel(levelIndex);
        this.enemyManager.initLevel(levelData);
        
        // 重置玩家位置
        this.spawnPlayer();
        
        // 清空子弹和特效
        this.bullets = [];
        this.explosions = [];
        
        this.updateUI();
    }
    
    // 生成玩家
    spawnPlayer() {
        // 玩家起始位置（左下角）
        const startX = 128;
        const startY = 384;
        
        this.player = new Tank(startX, startY, CONSTANTS.TANK_TYPE.PLAYER, true);
        this.player.invulnerable = 120; // 2秒无敌时间
    }
    
    // 游戏循环
    startGameLoop() {
        this.lastTime = performance.now();
        this.gameLoop();
    }
    
    gameLoop() {
        if (this.state === CONSTANTS.GAME_STATE.GAME_OVER) {
            return;
        }
        
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        this.input.update();
        
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }
    
    // 更新游戏逻辑
    update(deltaTime) {
        if (this.state !== CONSTANTS.GAME_STATE.PLAYING) {
            return;
        }
        
        // 暂停检查
        if (this.input.isPausing()) {
            this.state = CONSTANTS.GAME_STATE.PAUSED;
            return;
        }
        
        // 更新地图
        this.levelManager.map.update();
        
        // 更新玩家
        if (this.player && this.player.active) {
            this.updatePlayer();
        } else if (this.player && !this.player.active && this.lives > 0) {
            // 玩家死亡，等待重生
            this.lives--;
            if (this.lives > 0) {
                this.spawnPlayer();
            } else {
                this.gameOver();
                return;
            }
            this.updateUI();
        }
        
        // 更新敌人
        this.updateEnemies();
        this.enemyManager.update(this.levelManager.map);
        
        // 更新子弹
        this.updateBullets();
        
        // 更新特效
        this.updateEffects();
        
        // 检查游戏状态
        this.checkGameState();
    }
    
    // 更新玩家
    updatePlayer() {
        // 移动
        const direction = this.input.getPrimaryDirection();
        if (direction !== null) {
            this.player.move(direction, this.levelManager.map);
            
            // 播放移动音效（间隔播放）
            if (Math.floor(Date.now() / 200) % 2 === 0) {
                this.audio.playMove();
            }
        } else {
            this.player.isMoving = false;
        }
        
        // 射击
        if (this.input.isShooting() && this.player.shootCooldown <= 0) {
            const bullet = this.player.shoot();
            if (bullet) {
                this.bullets.push(bullet);
                this.audio.playShoot();
            }
        }
        
        this.player.update();
    }
    
    // 更新敌人
    updateEnemies() {
        for (const enemy of this.enemyManager.enemies) {
            const aiDecision = enemy.ai.update(enemy, this.player, this.levelManager.map);
            
            if (aiDecision) {
                if (aiDecision.action === 'shoot') {
                    const bullet = enemy.shoot();
                    if (bullet) {
                        this.bullets.push(bullet);
                    }
                } else if (aiDecision.action === 'move') {
                    enemy.move(aiDecision.direction, this.levelManager.map);
                }
            }
        }
    }
    
    // 更新子弹
    updateBullets() {
        for (const bullet of this.bullets) {
            bullet.update();
            
            // 检查子弹碰撞
            this.checkBulletCollisions(bullet);
        }
        
        // 移除不活跃的子弹
        this.bullets = this.bullets.filter(b => b.active);
    }
    
    // 检查子弹碰撞
    checkBulletCollisions(bullet) {
        const bulletBounds = bullet.getBounds();
        
        // 检查与墙的碰撞
        const walls = this.levelManager.map.getCollidingWalls(bulletBounds);
        for (const wall of walls) {
            if (wall.type === CONSTANTS.TILE.STEEL) {
                // 钢墙不可破坏，子弹消失
                if (wall.type === CONSTANTS.TILE.STEEL) {
                    bullet.destroy();
                    this.audio.playHit();
                    return;
                }
            } else if (wall.type === CONSTANTS.TILE.BRICK || wall.type === CONSTANTS.TILE.BASE) {
                bullet.destroy();
                
                if (wall.takeDamage(bullet.damage)) {
                    // 墙被破坏
                    if (wall.type === CONSTANTS.TILE.BASE) {
                        this.baseDestroyed();
                    }
                    this.createExplosion(wall.x + wall.width/2, wall.y + wall.height/2, 'normal');
                    this.audio.playExplosion();
                } else {
                    this.audio.playHit();
                }
                return;
            }
        }
        
        // 检查与坦克的碰撞
        if (bullet.isPlayerBullet) {
            // 玩家子弹打敌人
            for (const enemy of this.enemyManager.enemies) {
                if (Utils.checkRectCollision(bulletBounds, enemy.getBounds())) {
                    bullet.destroy();
                    
                    if (enemy.takeDamage(bullet.damage)) {
                        // 敌人被消灭
                        this.onEnemyKilled(enemy);
                    }
                    return;
                }
            }
        } else {
            // 敌人子弹打玩家
            if (this.player && this.player.active && 
                Utils.checkRectCollision(bulletBounds, this.player.getBounds())) {
                bullet.destroy();
                
                if (this.player.takeDamage(bullet.damage)) {
                    // 玩家死亡
                    this.createExplosion(
                        this.player.x + this.player.width/2, 
                        this.player.y + this.player.height/2, 
                        'large'
                    );
                    this.audio.playExplosion();
                }
                return;
            }
        }
        
        // 检查子弹与子弹的碰撞
        for (const otherBullet of this.bullets) {
            if (otherBullet !== bullet && otherBullet.active &&
                otherBullet.isPlayerBullet !== bullet.isPlayerBullet &&
                Utils.checkRectCollision(bulletBounds, otherBullet.getBounds())) {
                bullet.destroy();
                otherBullet.destroy();
                this.audio.playHit();
                return;
            }
        }
    }
    
    // 敌人被消灭
    onEnemyKilled(enemy) {
        // 计分
        let points = 0;
        switch (enemy.type) {
            case CONSTANTS.TANK_TYPE.ENEMY_BASIC:
                points = 100;
                break;
            case CONSTANTS.TANK_TYPE.ENEMY_FAST:
                points = 200;
                break;
            case CONSTANTS.TANK_TYPE.ENEMY_HEAVY:
                points = 400;
                break;
        }
        this.score += points;
        
        // 创建爆炸
        this.createExplosion(
            enemy.x + enemy.width/2, 
            enemy.y + enemy.height/2, 
            'large'
        );
        
        this.audio.playExplosion();
        this.updateUI();
    }
    
    // 基地被摧毁
    baseDestroyed() {
        this.createExplosion(
            this.levelManager.map.base.x + 16,
            this.levelManager.map.base.y + 16,
            'large'
        );
        this.audio.playExplosion();
        this.gameOver();
    }
    
    // 创建爆炸
    createExplosion(x, y, size) {
        this.explosions.push(new Explosion(x - 16, y - 16, size));
    }
    
    // 更新特效
    updateEffects() {
        // 更新爆炸
        for (const explosion of this.explosions) {
            explosion.update();
        }
        this.explosions = this.explosions.filter(e => e.active);
    }
    
    // 检查游戏状态
    checkGameState() {
        // 检查关卡是否完成
        if (this.enemyManager.getRemainingCount() === 0) {
            this.levelComplete();
        }
        
        // 检查基地是否被摧毁
        if (this.levelManager.map.base && !this.levelManager.map.base.active) {
            this.gameOver();
        }
    }
    
    // 关卡完成
    levelComplete() {
        this.state = CONSTANTS.GAME_STATE.LEVEL_COMPLETE;
        this.audio.playLevelComplete();
        
        // 更新UI
        document.getElementById('level-score').textContent = this.score;
        document.getElementById('next-level').textContent = this.level + 1;
        
        this.levelCompleteMenu.classList.remove('hidden');
        
        // 检查是否是最后一关
        if (this.levelManager.isLastLevel()) {
            document.getElementById('next-level').textContent = '已完成所有关卡！';
        }
    }
    
    // 下一关
    nextLevel() {
        this.level++;
        
        if (this.levelManager.isLastLevel() && this.level > LEVEL_DATA.length) {
            // 通关了，重新开始
            this.level = 1;
        }
        
        this.loadLevel(this.level - 1);
        this.state = CONSTANTS.GAME_STATE.PLAYING;
        this.hideAllMenus();
    }
    
    // 游戏结束
    gameOver() {
        this.state = CONSTANTS.GAME_STATE.GAME_OVER;
        this.audio.playGameOver();
        
        // 保存最高分
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
        }
        
        // 更新UI
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('final-level').textContent = this.level;
        this.gameOverMenu.classList.remove('hidden');
    }
    
    // 重新开始
    restart() {
        this.hideAllMenus();
        this.start();
    }
    
    // 隐藏所有菜单
    hideAllMenus() {
        this.startMenu.classList.add('hidden');
        this.gameOverMenu.classList.add('hidden');
        this.levelCompleteMenu.classList.add('hidden');
    }
    
    // 渲染
    render() {
        // 清空画布
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制边框
        this.ctx.strokeStyle = '#4a4a6a';
        this.ctx.lineWidth = 4;
        this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制地图
        this.levelManager.map.render(this.ctx);
        
        // 绘制基地
        if (this.levelManager.map.base && this.levelManager.map.base.active) {
            this.levelManager.map.base.render(this.ctx);
        }
        
        // 绘制玩家
        if (this.player && this.player.active) {
            this.player.render(this.ctx);
        }
        
        // 绘制敌人
        this.enemyManager.render(this.ctx);
        
        // 绘制子弹
        for (const bullet of this.bullets) {
            bullet.render(this.ctx);
        }
        
        // 绘制爆炸
        for (const explosion of this.explosions) {
            explosion.render(this.ctx);
        }
        
        // 绘制草地（覆盖在坦克上方）
        this.levelManager.map.renderGrass(this.ctx);
        
        // 绘制暂停文字
        if (this.state === CONSTANTS.GAME_STATE.PAUSED) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 32px "Courier New", monospace';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('PAUSED', this.canvas.width/2, this.canvas.height/2);
            
            this.ctx.font = '16px "Courier New", monospace';
            this.ctx.fillText('按 P 继续', this.canvas.width/2, this.canvas.height/2 + 40);
        }
    }
    
    // 更新UI显示
    updateUI() {
        this.scoreDisplay.textContent = this.score;
        this.highScoreDisplay.textContent = this.highScore;
        this.levelDisplay.textContent = this.level;
        this.enemiesDisplay.textContent = this.enemyManager.getRemainingCount();
        
        // 更新生命显示
        this.livesDisplay.innerHTML = '';
        for (let i = 0; i < this.lives; i++) {
            const tankIcon = document.createElement('div');
            tankIcon.className = 'tank-icon';
            this.livesDisplay.appendChild(tankIcon);
        }
    }
    
    // 保存最高分
    saveHighScore() {
        try {
            localStorage.setItem('tankGameHighScore', this.highScore.toString());
        } catch (e) {
            console.warn('无法保存最高分');
        }
    }
    
    // 加载最高分
    loadHighScore() {
        try {
            const saved = localStorage.getItem('tankGameHighScore');
            return saved ? parseInt(saved, 10) : 0;
        } catch (e) {
            return 0;
        }
    }
}

// 导出到全局
window.Game = Game;
