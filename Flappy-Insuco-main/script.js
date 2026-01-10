class Game {
    constructor() {
        this.boardWidth = 360;
        this.boardHeight = 640;

        this.board = document.getElementById("board");
        this.board.width = this.boardWidth;
        this.board.height = this.boardHeight;
        this.context = this.board.getContext("2d");

        this.playBtn = document.getElementById("playBtn");
        this.restartBtn = document.getElementById("restartBtn");

        this.GAME_STATE = {
            MENU: "menu",
            PLAYING: "playing",
            GAME_OVER: "gameOver"
        };
        this.currentState = this.GAME_STATE.MENU;

        this.birdY = this.boardHeight / 2;
        this.velocityY = 0;
        this.velocityX = -2;
        this.gravity = 0.5;

        this.pipeWidth = 50;
        this.pipeGap = 170;
        this.pipeArray = [];
        this.pipeIntervalId = null;

        this.score = 0;

        this.bird = {
            x: 60,
            y: this.birdY,
            width: 40,
            height: 30
        };

        this.inputLocked = false;

        this.loadAssets();
        this.addEvents();

        requestAnimationFrame(this.update.bind(this));
    }

    loadAssets() {
        this.backgroundImg = new Image();
        this.backgroundImg.src = "./Imagenes/fondomejorado.png";

        this.birdImg = new Image();
        this.birdImg.src = "./Imagenes/doberman.png";

        this.topPipeImg = new Image();
        this.topPipeImg.src = "./Imagenes/toppipe.png";

        this.bottomPipeImg = new Image();
        this.bottomPipeImg.src = "./Imagenes/bottompipe.png";

        this.flappyBirdTextImg = new Image();
        this.flappyBirdTextImg.src = "./Imagenes/Logomejorado.png";

        this.gameOverImg = new Image();
        this.gameOverImg.src = "./Imagenes/flappy-gameover.png";

        this.jumpSound = new Audio("./Sonidos/salto.mp3");
        this.pointSound = new Audio("./Sonidos/punto.mp3");
        this.hitSound = new Audio("./Sonidos/golpe.mp3");
    }

    addEvents() {
        document.addEventListener("keydown", (e) => {
            if (e.code === "Space") this.handleJump();
        });

        this.board.addEventListener("mousedown", () => {
            this.handleJump();
        });

        this.board.addEventListener("touchstart", (e) => {
            e.preventDefault();
            this.handleJump();
        }, { passive: false });

        this.playBtn.addEventListener("click", () => {
            if (this.currentState === this.GAME_STATE.MENU) this.startGame();
        });

        this.restartBtn.addEventListener("click", () => {
            this.resetGame();
        });

        const unlockAudio = () => {
            this.jumpSound.play().then(() => {
                this.jumpSound.pause();
                this.jumpSound.currentTime = 0;
            }).catch(() => {});

            window.removeEventListener("click", unlockAudio);
            window.removeEventListener("touchstart", unlockAudio);
        };

        window.addEventListener("click", unlockAudio);
        window.addEventListener("touchstart", unlockAudio);
    }

    handleJump() {
        if (this.inputLocked) return;

        if (this.currentState === this.GAME_STATE.MENU) {
            this.startGame();
        } else if (this.currentState === this.GAME_STATE.PLAYING) {
            this.velocityY = -8;
            this.jumpSound.play().catch(() => {});
        } else if (this.currentState === this.GAME_STATE.GAME_OVER) {
            this.resetGame();
        }
    }

    startGame() {
        this.currentState = this.GAME_STATE.PLAYING;
        this.bird.y = this.birdY;
        this.velocityY = 0;
        this.pipeArray = [];
        this.score = 0;

        this.playBtn.style.display = "none";
        this.restartBtn.style.display = "none";

        if (this.pipeIntervalId) clearInterval(this.pipeIntervalId);
        this.pipeIntervalId = setInterval(() => this.placePipes(), 1500);
    }

    resetGame() {
        this.currentState = this.GAME_STATE.MENU;
        this.bird.y = this.birdY;
        this.pipeArray = [];
        this.score = 0;

        clearInterval(this.pipeIntervalId);
        this.playBtn.style.display = "block";
        this.restartBtn.style.display = "none";
    }

    placePipes() {
        const minTop = 50;
        const maxTop = this.boardHeight - this.pipeGap - 50;
        const topHeight = Math.floor(Math.random() * (maxTop - minTop)) + minTop;
        const bottomHeight = this.boardHeight - topHeight - this.pipeGap;

        this.pipeArray.push({
            x: this.boardWidth,
            y: 0,
            width: this.pipeWidth,
            height: topHeight,
            img: this.topPipeImg,
            passed: false,
            isTop: true
        });

        this.pipeArray.push({
            x: this.boardWidth,
            y: topHeight + this.pipeGap,
            width: this.pipeWidth,
            height: bottomHeight,
            img: this.bottomPipeImg,
            passed: false,
            isTop: false
        });
    }

    update() {
        requestAnimationFrame(this.update.bind(this));
        this.context.clearRect(0, 0, this.boardWidth, this.boardHeight);

        if (this.backgroundImg.complete) {
            this.context.drawImage(this.backgroundImg, 0, 0, this.boardWidth, this.boardHeight);
        }

        if (this.currentState === this.GAME_STATE.MENU) {
            if (this.flappyBirdTextImg.complete) {
                this.context.drawImage(this.flappyBirdTextImg, 60, 100, 240, 100);
            }
            this.playBtn.style.display = "block";
            return;
        }

        if (this.currentState === this.GAME_STATE.PLAYING) {
            this.velocityY += this.gravity;
            this.bird.y += this.velocityY;

            this.context.drawImage(this.birdImg, this.bird.x, this.bird.y, this.bird.width, this.bird.height);

            for (const pipe of this.pipeArray) {
                pipe.x += this.velocityX;
                this.context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

                if (pipe.isTop && !pipe.passed && this.bird.x > pipe.x + pipe.width) {
                    this.score++;
                    pipe.passed = true;
                    this.pointSound.play().catch(() => {});
                }

                if (this.detectCollision(this.bird, pipe)) {
                    this.hitSound.play().catch(() => {});
                    this.gameOver();
                }
            }

            this.pipeArray = this.pipeArray.filter(p => p.x > -this.pipeWidth);

            if (this.bird.y + this.bird.height > this.boardHeight || this.bird.y < 0) {
                this.gameOver();
            }

            this.context.fillStyle = "white";
            this.context.font = "bold 42px Arial";
            this.context.shadowColor = "black";
            this.context.shadowBlur = 4;
            this.context.fillText(this.score, 20, 50);
            this.context.shadowBlur = 0;
        }

        if (this.currentState === this.GAME_STATE.GAME_OVER) {
            this.context.fillStyle = "rgba(0,0,0,0.55)";
            this.context.fillRect(0, 0, this.boardWidth, this.boardHeight);

            if (this.gameOverImg.complete) {
                this.context.drawImage(this.gameOverImg, 40, 200, 280, 80);
            }

            this.context.fillStyle = "white";
            this.context.font = "28px Arial";
            this.context.fillText(`Puntos: ${this.score}`, 95, 330);

            this.restartBtn.style.display = "block";
        }
    }

    gameOver() {
        this.currentState = this.GAME_STATE.GAME_OVER;
        clearInterval(this.pipeIntervalId);
        this.inputLocked = true;
        setTimeout(() => this.inputLocked = false, 500);
    }

    detectCollision(a, b) {
        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
        );
    }
}

const game = new Game();
