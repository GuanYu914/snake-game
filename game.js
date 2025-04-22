class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.snake = [{x: 5, y: 5}];
        this.walls = [];  // 新增牆壁數組
        this.food = this.generateFood();
        this.direction = 'right';
        this.score = 0;
        this.gameLoop = null;
        this.speed = 150;
        this.isGameOver = false;

        this.startButton = document.getElementById('startButton');
        this.scoreElement = document.getElementById('score');
        
        this.bindEvents();
    }

    bindEvents() {
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        this.startButton.addEventListener('click', () => this.startGame());
    }

    handleKeyPress(event) {
        const keyMap = {
            'ArrowUp': 'up',
            'ArrowDown': 'down',
            'ArrowLeft': 'left',
            'ArrowRight': 'right'
        };

        const newDirection = keyMap[event.key];
        if (!newDirection) return;

        const opposites = {
            'up': 'down',
            'down': 'up',
            'left': 'right',
            'right': 'left'
        };

        if (opposites[newDirection] !== this.direction) {
            this.direction = newDirection;
        }
    }

    generateWalls() {
        this.walls = [];
        const maxX = this.canvas.width / this.gridSize - 1;
        const maxY = this.canvas.height / this.gridSize - 1;
        const wallCount = 10;  // 牆壁數量

        for (let i = 0; i < wallCount; i++) {
            let wall;
            do {
                wall = {
                    x: Math.floor(Math.random() * maxX),
                    y: Math.floor(Math.random() * maxY)
                };
            } while (
                // 確保牆壁不會出現在蛇身上
                this.snake.some(segment => segment.x === wall.x && segment.y === wall.y) ||
                // 確保牆壁不會出現在食物位置
                (this.food.x === wall.x && this.food.y === wall.y) ||
                // 確保牆壁不會出現在其他牆壁上
                this.walls.some(w => w.x === wall.x && w.y === wall.y)
            );
            this.walls.push(wall);
        }
    }

    generateFood() {
        const maxX = this.canvas.width / this.gridSize - 1;
        const maxY = this.canvas.height / this.gridSize - 1;
        
        while (true) {
            const food = {
                x: Math.floor(Math.random() * maxX),
                y: Math.floor(Math.random() * maxY)
            };
            
            // 確保食物不會出現在蛇身上或牆壁上
            if (!this.snake.some(segment => segment.x === food.x && segment.y === food.y) &&
                !this.walls.some(wall => wall.x === food.x && wall.y === food.y)) {
                return food;
            }
        }
    }

    update() {
        if (this.isGameOver) return;

        const head = {...this.snake[0]};

        switch (this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        // 檢查是否撞牆
        if (head.x < 0 || head.x >= this.canvas.width / this.gridSize ||
            head.y < 0 || head.y >= this.canvas.height / this.gridSize) {
            this.gameOver();
            return;
        }

        // 檢查是否撞到自己
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }

        // 檢查是否撞到灰色牆壁
        if (this.walls.some(wall => wall.x === head.x && wall.y === head.y)) {
            this.gameOver();
            return;
        }

        this.snake.unshift(head);

        // 檢查是否吃到食物
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.scoreElement.textContent = this.score;
            this.food = this.generateFood();
            // 加快遊戲速度
            if (this.speed > 50) {
                this.speed -= 5;
                this.restartGameLoop();
            }
        } else {
            this.snake.pop();
        }
    }

    restartGameLoop() {
        clearInterval(this.gameLoop);
        this.gameLoop = setInterval(() => {
            this.update();
            this.draw();
        }, this.speed);
    }

    draw() {
        // 清空畫布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 繪製灰色牆壁
        this.ctx.fillStyle = '#808080';
        this.walls.forEach(wall => {
            this.ctx.fillRect(
                wall.x * this.gridSize,
                wall.y * this.gridSize,
                this.gridSize - 1,
                this.gridSize - 1
            );
        });

        // 繪製蛇
        this.ctx.fillStyle = '#4CAF50';
        this.snake.forEach(segment => {
            this.ctx.fillRect(
                segment.x * this.gridSize,
                segment.y * this.gridSize,
                this.gridSize - 1,
                this.gridSize - 1
            );
        });

        // 繪製食物
        this.ctx.fillStyle = '#FF0000';
        this.ctx.fillRect(
            this.food.x * this.gridSize,
            this.food.y * this.gridSize,
            this.gridSize - 1,
            this.gridSize - 1
        );

        // 如果遊戲結束，顯示遊戲結束文字
        if (this.isGameOver) {
            this.ctx.fillStyle = '#000';
            this.ctx.font = '30px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('遊戲結束!', this.canvas.width / 2, this.canvas.height / 2);
        }
    }

    gameOver() {
        this.isGameOver = true;
        clearInterval(this.gameLoop);
        this.startButton.textContent = '重新開始';
    }

    startGame() {
        // 重置遊戲狀態
        this.snake = [{x: 5, y: 5}];
        this.direction = 'right';
        this.score = 0;
        this.scoreElement.textContent = this.score;
        this.speed = 150;
        this.isGameOver = false;
        
        // 生成新的牆壁和食物
        this.generateWalls();
        this.food = this.generateFood();
        
        this.startButton.textContent = '遊戲中';

        // 清除之前的遊戲循環
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }

        // 開始新的遊戲循環
        this.restartGameLoop();
    }
}

// 初始化遊戲
window.onload = () => {
    new SnakeGame();
}; 