/**
 * 输入管理器 - 处理键盘输入
 */
class InputManager {
    constructor() {
        this.keys = {};
        this.keysPressed = {};
        this.keysReleased = {};
        
        // 按键映射
        this.keyMap = {
            // 移动
            'w': 'up',
            'arrowup': 'up',
            's': 'down',
            'arrowdown': 'down',
            'a': 'left',
            'arrowleft': 'left',
            'd': 'right',
            'arrowright': 'right',
            
            // 射击
            ' ': 'shoot',
            'space': 'shoot',
            'spacebar': 'shoot',
            
            // 暂停
            'p': 'pause',
            'escape': 'pause'
        };
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // 键盘按下
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            
            if (!this.keys[key]) {
                this.keysPressed[key] = true;
            }
            this.keys[key] = true;
            
            // 阻止默认行为（防止页面滚动）
            if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) {
                e.preventDefault();
            }
        });
        
        // 键盘释放
        document.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            this.keys[key] = false;
            this.keysReleased[key] = true;
        });
    }
    
    // 检查按键是否按下
    isPressed(action) {
        for (const [key, mappedAction] of Object.entries(this.keyMap)) {
            if (mappedAction === action && this.keys[key]) {
                return true;
            }
        }
        return false;
    }
    
    // 检查按键是否刚按下（一帧内）
    isJustPressed(action) {
        for (const [key, mappedAction] of Object.entries(this.keyMap)) {
            if (mappedAction === action && this.keysPressed[key]) {
                return true;
            }
        }
        return false;
    }
    
    // 检查按键是否刚释放
    isJustReleased(action) {
        for (const [key, mappedAction] of Object.entries(this.keyMap)) {
            if (mappedAction === action && this.keysReleased[key]) {
                return true;
            }
        }
        return false;
    }
    
    // 获取移动方向
    getMovementDirection() {
        let dx = 0;
        let dy = 0;
        
        if (this.isPressed('up')) dy -= 1;
        if (this.isPressed('down')) dy += 1;
        if (this.isPressed('left')) dx -= 1;
        if (this.isPressed('right')) dx += 1;
        
        // 归一化对角线移动
        if (dx !== 0 && dy !== 0) {
            const length = Math.sqrt(dx * dx + dy * dy);
            dx /= length;
            dy /= length;
        }
        
        return { x: dx, y: dy };
    }
    
    // 获取主要方向（用于坦克朝向）
    getPrimaryDirection() {
        // 返回优先级：上下左右
        if (this.isPressed('up')) return CONSTANTS.DIRECTION.UP;
        if (this.isPressed('down')) return CONSTANTS.DIRECTION.DOWN;
        if (this.isPressed('left')) return CONSTANTS.DIRECTION.LEFT;
        if (this.isPressed('right')) return CONSTANTS.DIRECTION.RIGHT;
        
        return null;
    }
    
    // 检查是否请求射击
    isShooting() {
        return this.isPressed('shoot');
    }
    
    // 检查是否请求暂停
    isPausing() {
        return this.isJustPressed('pause');
    }
    
    // 更新（每帧调用，清除just pressed/released状态）
    update() {
        this.keysPressed = {};
        this.keysReleased = {};
    }
}

// 导出到全局
window.InputManager = InputManager;
