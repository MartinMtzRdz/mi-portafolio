class Game {
    constructor() {
        this.boardWidth = 360;
        this.boardHeight = 640;

        this.backgroundImg = new Image();
        this.backgroundImg.src = "Imagenes/fondomejorado.png";

        this.inputLocked = false;
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

        this.pipeWidth = 40;
        this.pipeGap = 180;
        this.pipeArray = [];
        this.pipeIntervalId = null;

        this.score = 0;
        this.highScore = localStorage.getItem("flappyHighScore") || 0;

        this.logo = {
            x: this.boardWidth / 2 - 75,
            y: this.boardHeight / 5,
            width: 150,
            height: 100
        };

        this.playButton = {
            x: this.boardWidth / 2 - 60,
            y: this.boardHeight / 2 - 32,
            width: 120,
            height: 64
        };

        this.bird = {
            x: 50,
            y: this.birdY,
            width: 40,
            height: 30
        };

        this.loadAssets();
        this.init();
    }

    loadAssets() {
        this.birdImg = new Image();
        this.birdImg.src = "Imagenes/doberman.png";

        this.topPipeImg = new Image();
        this.topPipeImg.src = "Imagenes/toppipe.png";

        this.bottomPipeImg = new Image();
        this.bottomPipeImg.src = "Imagenes/bottompipe.png";

        this.flappyBirdTextImg = new Image();
        this.flappyBirdTextImg.src = "Imagenes/Logomejorado.png";

        this.gameOverImg = new Image();
        this.gameOverImg.src = "Imagenes/flappy-gameover.png";

        this.jumpSound = new Audio("Sonidos/salto.mp3");
        this.pointSound = new Audio("Sonidos/punto.mp3");
        this.hitSound = new Audio("Sonidos/golpe.mp3");
    }

    init() {
        window.onload = () => {
            const unlockAudio = () => {
                this.jumpSound.play().then(() => {
                    this.jumpSound.pause();
                    this.jumpSound.currentTime = 0;
                }).catch(() => {});
                window.removeEventListener("click", unlockAudio);
                window.removeEventListener("keydown", unlockAudio);
                window.removeEventListener("touchstart", unlockAudio);
            };

            window.addEventListener("click", unlockAudio);
            window.addEventListener("keydown", unlockAudio);
            window.addEventListener("touchstart", unlockAudio);

            this.board = document.getElementById("board");
            this.board.height = this.boardHeight;
            this.board.width = this.boardWidth;
            this.context = this.board.getContext("2d");

            document.addEventListener("keydown", this.handleKeyDown.bind(this));
            this.board.addEventListener("touchstart", this.handleTouch.bind(this), { passive: false });

            this.playBtn.addEventListener("click", () => {
                if (this.currentState === this.GAME_STATE.MENU) this.startGame();
            });

            this.restartBtn.addEventListener("click", () => {
                this.resetGame();
                this.currentState = this.GAME_STATE.MENU;
            });

            requestAnimationFrame(this.update.bind(this));
        };
    }

    update() {
        requestAnimationFrame(this.update.bind(this));
        this.context.clearRect(0, 0, this.board.width, this.board.height);

        if (this.currentState === this.GAME_STATE.MENU) this.renderMenu();
        if (this.currentState === this.GAME_STATE.PLAYING) this.renderGame();
        if (this.currentState === this.GAME_STATE.GAME_OVER) this.renderGameOver();
    }

    renderMenu() {
        if (this.backgroundImg.complete)
            this.context.drawImage(this.backgroundImg, 0, 0, this.boardWidth, this.boardHeight);

        if (this.flappyBirdTextImg.complete)
            this.context.drawImage(this.flappyBirdTextImg, this.logo.x, this.logo.y, this.logo.width, this.logo.height);

        this.playBtn.style.display = "block";
    }

    renderGame() {
        if (this.backgroundImg.complete)
            this.context.drawImage(this.backgroundImg, 0, 0, this.boardWidth, this.boardHeight);

        this.velocityY += this.gravity;
        this.bird.y = Math.max(this.bird.y + this.velocityY, 0);

        this.context.drawImage(this.birdImg, this.bird.x, this.bird.y, this.bird.width, this.bird.height);

        if (this.bird.y > this.board.height) this.currentState = this.GAME_STATE.GAME_OVER;

        for (let pipe of this.pipeArray) {
            pipe.x += this.velocityX;
            this.context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

            if (this.detectCollision(this.bird, pipe)) {
                this.hitSound.play().catch(() => {});
                this.currentState = this.GAME_STATE.GAME_OVER;
            }
        }

        while (this.pipeArray.length && this.pipeArray[0].x < -this.pipeWidth) {
            this.pipeArray.shift();
        }

        this.context.fillStyle = "black";
        this.context.font = "45px sans-serif";
        this.context.fillText(this.score, 10, 45);
    }

    renderGameOver() {
        if (this.backgroundImg.complete)
            this.context.drawImage(this.backgroundImg, 0, 0, this.boardWidth, this.boardHeight);

        if (this.gameOverImg.complete)
            this.context.drawImage(this.gameOverImg, -20, this.boardHeight / 3, 400, 80);

        this.restartBtn.style.display = "block";
        this.restartBtn.style.left = "50%";
        this.restartBtn.style.top = "60%";
        this.restartBtn.style.transform = "translate(-50%, 0)";
    }

    handleKeyDown(e) {
        if (e.code === "Space") {
            if (this.currentState === this.GAME_STATE.MENU) this.startGame();
            else if (this.currentState === this.GAME_STATE.PLAYING) {
                this.velocityY = -8;
                this.jumpSound.play().catch(() => {});
            }
        }
    }

    handleTouch(e) {
        e.preventDefault();
        if (this.currentState === this.GAME_STATE.MENU) this.startGame();
        else if (this.currentState === this.GAME_STATE.PLAYING) {
            this.velocityY = -8;
            this.jumpSound.play().catch(() => {});
        }
    }

    startGame() {
        this.currentState = this.GAME_STATE.PLAYING;
        this.bird.y = this.birdY;
        this.velocityY = 0;
        this.pipeArray = [];
        this.score = 0;
        this.playBtn.style.display = "none";

        if (this.pipeIntervalId) clearInterval(this.pipeIntervalId);
        this.pipeIntervalId = setInterval(() => this.createPipes(), 1500);
    }

    resetGame() {
        this.restartBtn.style.display = "none";
        this.currentState = this.GAME_STATE.MENU;
    }

    createPipes() {
        let maxTop = this.boardHeight - this.pipeGap - 100;
        let topHeight = Math.random() * maxTop;

        let topPipe = {
            x: this.boardWidth,
            y: 0,
            width: this.pipeWidth,
            height: topHeight,
            img: this.topPipeImg
        };

        let bottomPipe = {
            x: this.boardWidth,
            y: topHeight + this.pipeGap,
            width: this.pipeWidth,
            height: this.boardHeight,
            img: this.bottomPipeImg
        };

        this.pipeArray.push(topPipe, bottomPipe);
        this.score++;
        this.pointSound.play().catch(() => {});
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
