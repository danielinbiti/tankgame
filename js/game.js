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
        
        // 场景管理
        this.scenes = {};
        this.currentScene = null;
        
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
        
        // 初始化场景
        this.initScenes();
        
        // 初始化UI
        this.updateUI();
    }
    
    // 初始化场景
    initScenes() {
        this.scenes = {
            menu: new MenuScene(this),
            play: new PlayScene(this),
            gameOver: new GameOverScene(this),
            victory: new VictoryScene(this)
        };
    }
    
    // 切换场景
    changeScene(sceneName) {
        if (this.currentScene) {
            this.currentScene.exit();
        }
        
        this.currentScene = this.scenes[sceneName];
        if (this.currentScene) {
            this.currentScene.enter();
        }
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
        this.changeScene('play');
        
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
        // 玩家起始位置（左下角），确保在空地上
        // 格子坐标 (4, 12) 对应像素位置
        const gridX = 4;
        const gridY = 12;
        const startX = gridX * CONSTANTS.TILE_SIZE + (CONSTANTS.TILE_SIZE - CONSTANTS.TANK_SIZE) / 2;
        const startY = gridY * CONSTANTS.TILE_SIZE + CONSTANTS.OFFSET_Y + (CONSTANTS.TILE_SIZE - CONSTANTS.TANK_SIZE) / 2;
        
        this.player = new Tank(startX, startY, CONSTANTS.TANK_TYPE.PLAYER, true);
        this.player.invulnerable = 120; // 2秒无敌时间
    }
    
    // 游戏循环
    startGameLoop() {
        this.lastTime = performance.now();
        this.gameLoop();
    }
    
    gameLoop() {
        if (this.state === CONSTANTS.GAME_STATE.GAME_OVER && !this.currentScene) {
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
        // 更新当前场景
        if (this.currentScene) {
            this.currentScene.update(deltaTime);
        }
        
        // 处理输入
        if (this.currentScene) {
            this.currentScene.handleInput(this.input);
        }
    }
    
    // 渲染
    render() {
        if (this.currentScene) {
            this.currentScene.render(this.ctx);
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
    
    // 关卡完成
    levelComplete() {
        this.state = CONSTANTS.GAME_STATE.LEVEL_COMPLETE;
        this.audio.playLevelComplete();
        this.changeScene('victory');
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
        this.changeScene('play');
    }
    
    // 游戏结束
    gameOver() {
        this.state = CONSTANTS.GAME_STATE.GAME_OVER;
        this.audio.playGameOver();
        this.changeScene('gameOver');
    }
    
    // 重新开始
    restart() {
        this.hideAllMenus();
        this.start();
    }
    
    // 显示菜单
    showMenu() {
        this.startMenu.classList.remove('hidden');
        this.gameOverMenu.classList.add('hidden');
        this.levelCompleteMenu.classList.add('hidden');
    }
    
    // 隐藏所有菜单
    hideAllMenus() {
        this.startMenu.classList.add('hidden');
        this.gameOverMenu.classList.add('hidden');
        this.levelCompleteMenu.classList.add('hidden');
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
