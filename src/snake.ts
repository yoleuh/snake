type Position = {
  x: number;
  y: number;
};

class SnakeGame {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private snake: Position[];
  private food: Position;
  private direction: string;
  private gridSize: number;
  private cellSize: number;
  private score: number;
  private highScore: number;
  private gameOver: boolean;
  private gameLoop: number | null;
  private isPlaying: boolean;

  constructor() {
    this.canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d")!;
    this.gridSize = 20;
    this.cellSize = this.canvas.width / this.gridSize;
    this.score = 0;
    this.highScore = 0;
    this.gameOver = false;
    this.gameLoop = null;
    this.isPlaying = false;

    // init
    this.snake = [
      { x: 10, y: 10 },
      { x: 10, y: 11 },
    ];
    this.direction = "UP";
    this.food = this.generateFood();

    document.addEventListener("keydown", this.handleKeyPress.bind(this));

    this.draw();
    this.drawStartMessage();
  }

  private drawStartMessage(): void {
    this.ctx.fillStyle = "#000";
    this.ctx.font = "20px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText(
      "press SPACE to start",
      this.canvas.width / 2,
      this.canvas.height / 2
    );
  }

  private generateFood(): Position {
    const food: Position = {
      x: Math.floor(Math.random() * this.gridSize),
      y: Math.floor(Math.random() * this.gridSize),
    };

    // fix: food spawning on snake
    for (const segment of this.snake) {
      if (segment.x === food.x && segment.y === food.y) {
        return this.generateFood();
      }
    }
    return food;
  }

  private handleKeyPress(event: KeyboardEvent): void {
    if (event.code === "Space") {
      if (this.gameOver || !this.isPlaying) {
        this.start();
        return;
      }
    }

    if (!this.isPlaying) return;

    switch (event.key) {
      case "ArrowUp":
        if (this.direction !== "DOWN") this.direction = "UP";
        break;
      case "ArrowDown":
        if (this.direction !== "UP") this.direction = "DOWN";
        break;
      case "ArrowLeft":
        if (this.direction !== "RIGHT") this.direction = "LEFT";
        break;
      case "ArrowRight":
        if (this.direction !== "LEFT") this.direction = "RIGHT";
        break;
    }
  }

  private update(): void {
    if (this.gameOver || !this.isPlaying) return;

    const head = { ...this.snake[0] };

    switch (this.direction) {
      case "UP":
        head.y--;
        break;
      case "DOWN":
        head.y++;
        break;
      case "LEFT":
        head.x--;
        break;
      case "RIGHT":
        head.x++;
        break;
    }

    // collision-detection: wall
    if (
      head.x < 0 ||
      head.x >= this.gridSize ||
      head.y < 0 ||
      head.y >= this.gridSize
    ) {
      this.endGame();
      return;
    }

    // collision-detection: snake
    for (const segment of this.snake) {
      if (head.x === segment.x && head.y === segment.y) {
        this.endGame();
        return;
      }
    }

    this.snake.unshift(head);

    // Check food collision
    if (head.x === this.food.x && head.y === this.food.y) {
      this.score++;
      if (this.score > this.highScore) {
        this.highScore = this.score;
        document.getElementById("high-score")!.textContent =
          this.highScore.toString();
      }
      document.getElementById("score")!.textContent = this.score.toString();
      this.food = this.generateFood();
    } else {
      this.snake.pop();
    }
  }

  private draw(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // draw: snake
    this.ctx.fillStyle = "#4CAF50";
    for (const segment of this.snake) {
      this.ctx.fillRect(
        segment.x * this.cellSize,
        segment.y * this.cellSize,
        this.cellSize - 1,
        this.cellSize - 1
      );
    }

    // draw: food
    this.ctx.fillStyle = "#FF0000";
    this.ctx.fillRect(
      this.food.x * this.cellSize,
      this.food.y * this.cellSize,
      this.cellSize - 1,
      this.cellSize - 1
    );
  }

  private endGame(): void {
    this.gameOver = true;
    this.isPlaying = false;
    if (this.gameLoop) {
      cancelAnimationFrame(this.gameLoop);
      this.gameLoop = null;
    }

    const gameOverDiv = document.getElementById("game-over")!;
    gameOverDiv.innerHTML = `
              <div style="color: red; font-size: 1.5rem; font-weight: bold;">game over!</div>
              ${
                this.score === this.highScore && this.score > 0
                  ? '<div style="color: purple; font-size: 1.2rem; margin: 10px 0;">new high score!</div>'
                  : ""
              }
              <div style="font-size: 1rem; margin: 10px 0;">press SPACE to play again</div>
          `;
  }

  private startGameLoop(): void {
    this.update();
    this.draw();
    if (!this.gameOver && this.isPlaying) {
      setTimeout(() => {
        requestAnimationFrame(this.startGameLoop.bind(this));
      }, 100);
    }
  }

  public start(): void {
    // reset: game state
    this.gameOver = false;
    this.isPlaying = true;
    this.score = 0;
    this.snake = [
      { x: 10, y: 10 },
      { x: 10, y: 11 },
    ];
    this.direction = "UP";
    this.food = this.generateFood();

    // reset: ui
    document.getElementById("score")!.textContent = "0";
    document.getElementById("game-over")!.innerHTML = "";

    this.startGameLoop();
  }
}

window.onload = () => {
  new SnakeGame();
};
