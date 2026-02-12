/**
 * 游戏入口 - 初始化并启动游戏
 */
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    const game = new Game(canvas);
    
    // 绑定按钮事件
    document.getElementById('start-btn').addEventListener('click', () => {
        game.start();
    });
    
    document.getElementById('restart-btn').addEventListener('click', () => {
        game.restart();
    });
    
    document.getElementById('next-level-btn').addEventListener('click', () => {
        game.nextLevel();
    });
    
    // 暂停功能
    document.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 'p' || e.key === 'Escape') {
            if (game.state === CONSTANTS.GAME_STATE.PAUSED) {
                game.state = CONSTANTS.GAME_STATE.PLAYING;
            }
        }
    });
    
    // 防止右键菜单
    canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
    
    // 窗口失焦时暂停
    window.addEventListener('blur', () => {
        if (game.state === CONSTANTS.GAME_STATE.PLAYING) {
            game.state = CONSTANTS.GAME_STATE.PAUSED;
        }
    });
    
    console.log('坦克大战已加载完成！点击"开始游戏"开始');
});
