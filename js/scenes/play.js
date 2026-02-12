/**
 * 游戏主场景
 */
class PlayScene extends Scene {
    constructor(game) {
        super(game);
    }
    
    enter() {
        super.enter();
        this.game.hideAllMenus();
    }
    
    update(deltaTime) {
        const game = this.game;
        
        if (game.state !== CONSTANTS.GAME_STATE.PLAYING) {
            return;
        }
        
        // 暂停检查
        if (game.input.isPausing()) {
            game.state = CONSTANTS.GAME_STATE.PAUSED;
            return;
        }
        
        // 更新地图
        game.levelManager.map.update();
        
        // 更新玩家
        if (game.player && game.player.active) {
            this.updatePlayer();
        } else if (game.player && !game.player.active && game.lives > 0) {
            // 玩家死亡，等待重生
            game.lives--;
            if (game.lives > 0) {
                game.spawnPlayer();
            } else {
                game.gameOver();
                return;
            }
            game.updateUI();
        }
        
        // 更新敌人
        this.updateEnemies();
        game.enemyManager.update(game.levelManager.map);
        
        // 更新子弹
        this.updateBullets();
        
        // 更新特效
        this.updateEffects();
        
        // 检查游戏状态
        this.checkGameState();
    }
    
    updatePlayer() {
        const game = this.game;
        
        // 移动
        const direction = game.input.getPrimaryDirection();
        if (direction !== null) {
            game.player.move(direction, game.levelManager.map);
            
            // 播放移动音效（间隔播放）
            if (Math.floor(Date.now() / 200) % 2 === 0) {
                game.audio.playMove();
            }
        } else {
            game.player.isMoving = false;
        }
        
        // 射击
        if (game.input.isShooting() && game.player.shootCooldown <= 0) {
            const bullet = game.player.shoot();
            if (bullet) {
                game.bullets.push(bullet);
                game.audio.playShoot();
            }
        }
        
        game.player.update();
    }
    
    updateEnemies() {
        const game = this.game;
        
        for (const enemy of game.enemyManager.enemies) {
            const aiDecision = enemy.ai.update(enemy, game.player, game.levelManager.map);
            
            if (aiDecision) {
                if (aiDecision.action === 'shoot') {
                    const bullet = enemy.shoot();
                    if (bullet) {
                        game.bullets.push(bullet);
                    }
                } else if (aiDecision.action === 'move') {
                    enemy.move(aiDecision.direction, game.levelManager.map);
                }
            }
        }
    }
    
    updateBullets() {
        const game = this.game;
        
        for (const bullet of game.bullets) {
            bullet.update();
            
            // 检查子弹碰撞
            this.checkBulletCollisions(bullet);
        }
        
        // 移除不活跃的子弹
        game.bullets = game.bullets.filter(b => b.active);
    }
    
    checkBulletCollisions(bullet) {
        const game = this.game;
        const bulletBounds = bullet.getBounds();
        
        // 检查与墙的碰撞
        const walls = game.levelManager.map.getCollidingWalls(bulletBounds);
        for (const wall of walls) {
            if (wall.type === CONSTANTS.TILE.STEEL) {
                // 钢墙不可破坏，子弹消失
                bullet.destroy();
                game.audio.playHit();
                return;
            } else if (wall.type === CONSTANTS.TILE.BRICK || wall.type === CONSTANTS.TILE.BASE) {
                bullet.destroy();
                
                if (wall.takeDamage(bullet.damage)) {
                    // 墙被破坏
                    if (wall.type === CONSTANTS.TILE.BASE) {
                        game.baseDestroyed();
                    }
                    game.createExplosion(wall.x + wall.width/2, wall.y + wall.height/2, 'normal');
                    game.audio.playExplosion();
                } else {
                    game.audio.playHit();
                }
                return;
            }
        }
        
        // 检查与坦克的碰撞
        if (bullet.isPlayerBullet) {
            // 玩家子弹打敌人
            for (const enemy of game.enemyManager.enemies) {
                if (Utils.checkRectCollision(bulletBounds, enemy.getBounds())) {
                    bullet.destroy();
                    
                    if (enemy.takeDamage(bullet.damage)) {
                        // 敌人被消灭
                        game.onEnemyKilled(enemy);
                    }
                    return;
                }
            }
        } else {
            // 敌人子弹打玩家
            if (game.player && game.player.active && 
                Utils.checkRectCollision(bulletBounds, game.player.getBounds())) {
                bullet.destroy();
                
                if (game.player.takeDamage(bullet.damage)) {
                    // 玩家死亡
                    game.createExplosion(
                        game.player.x + game.player.width/2, 
                        game.player.y + game.player.height/2, 
                        'large'
                    );
                    game.audio.playExplosion();
                }
                return;
            }
        }
        
        // 检查子弹与子弹的碰撞
        for (const otherBullet of game.bullets) {
            if (otherBullet !== bullet && otherBullet.active &&
                otherBullet.isPlayerBullet !== bullet.isPlayerBullet &&
                Utils.checkRectCollision(bulletBounds, otherBullet.getBounds())) {
                bullet.destroy();
                otherBullet.destroy();
                game.audio.playHit();
                return;
            }
        }
    }
    
    updateEffects() {
        const game = this.game;
        
        // 更新爆炸
        for (const explosion of game.explosions) {
            explosion.update();
        }
        game.explosions = game.explosions.filter(e => e.active);
    }
    
    checkGameState() {
        const game = this.game;
        
        // 检查关卡是否完成
        if (game.enemyManager.getRemainingCount() === 0) {
            game.levelComplete();
        }
        
        // 检查基地是否被摧毁
        if (game.levelManager.map.base && !game.levelManager.map.base.active) {
            game.gameOver();
        }
    }
    
    render(ctx) {
        const game = this.game;
        
        // 清空画布
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);
        
        // 绘制边框
        ctx.strokeStyle = '#4a4a6a';
        ctx.lineWidth = 4;
        ctx.strokeRect(0, 0, game.canvas.width, game.canvas.height);
        
        // 绘制地图
        game.levelManager.map.render(ctx);
        
        // 绘制基地
        if (game.levelManager.map.base && game.levelManager.map.base.active) {
            game.levelManager.map.base.render(ctx);
        }
        
        // 绘制玩家
        if (game.player && game.player.active) {
            game.player.render(ctx);
        }
        
        // 绘制敌人
        game.enemyManager.render(ctx);
        
        // 绘制子弹
        for (const bullet of game.bullets) {
            bullet.render(ctx);
        }
        
        // 绘制爆炸
        for (const explosion of game.explosions) {
            explosion.render(ctx);
        }
        
        // 绘制草地（覆盖在坦克上方）
        game.levelManager.map.renderGrass(ctx);
        
        // 绘制暂停文字
        if (game.state === CONSTANTS.GAME_STATE.PAUSED) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);
            
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 32px "Courier New", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('PAUSED', game.canvas.width/2, game.canvas.height/2);
            
            ctx.font = '16px "Courier New", monospace';
            ctx.fillText('按 P 继续', game.canvas.width/2, game.canvas.height/2 + 40);
        }
    }
}

window.PlayScene = PlayScene;
