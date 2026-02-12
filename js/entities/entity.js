/**
 * 基础实体类
 */
class Entity {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.active = true;
        this.id = Utils.generateId();
    }
    
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
    
    update(deltaTime) {
        // 子类实现
    }
    
    render(ctx) {
        // 子类实现
    }
    
    destroy() {
        this.active = false;
    }
}

window.Entity = Entity;
