/**
 * 碰撞检测系统
 */
class CollisionSystem {
    constructor() {
        // 网格空间分割优化
        this.gridSize = CONSTANTS.TILE_SIZE;
        this.grid = new Map();
    }
    
    // 清空网格
    clearGrid() {
        this.grid.clear();
    }
    
    // 将对象添加到网格
    addToGrid(obj) {
        const bounds = obj.getBounds();
        const startCol = Math.floor(bounds.x / this.gridSize);
        const endCol = Math.floor((bounds.x + bounds.width) / this.gridSize);
        const startRow = Math.floor(bounds.y / this.gridSize);
        const endRow = Math.floor((bounds.y + bounds.height) / this.gridSize);
        
        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                const key = `${col},${row}`;
                if (!this.grid.has(key)) {
                    this.grid.set(key, []);
                }
                this.grid.get(key).push(obj);
            }
        }
    }
    
    // 获取网格中的对象
    getObjectsInGrid(col, row) {
        const key = `${col},${row}`;
        return this.grid.get(key) || [];
    }
    
    // 检查两个矩形是否碰撞
    static checkRectCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    // 检查点是否在矩形内
    static isPointInRect(point, rect) {
        return point.x >= rect.x &&
               point.x <= rect.x + rect.width &&
               point.y >= rect.y &&
               point.y <= rect.y + rect.height;
    }
    
    // 获取两个对象之间的距离
    static getDistance(obj1, obj2) {
        const dx = (obj1.x + obj1.width / 2) - (obj2.x + obj2.width / 2);
        const dy = (obj1.y + obj1.height / 2) - (obj2.y + obj2.height / 2);
        return Math.sqrt(dx * dx + dy * dy);
    }
}

window.CollisionSystem = CollisionSystem;
