/**
 * 场景基类
 */
class Scene {
    constructor(game) {
        this.game = game;
        this.active = false;
    }
    
    enter() {
        this.active = true;
    }
    
    exit() {
        this.active = false;
    }
    
    update(deltaTime) {
        // 子类实现
    }
    
    render(ctx) {
        // 子类实现
    }
    
    handleInput(input) {
        // 子类实现
    }
}

window.Scene = Scene;
