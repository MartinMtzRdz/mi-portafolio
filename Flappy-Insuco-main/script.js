class Game {
    constructor() {
        this.boardWidth = 360;
        this.boardHeight = 640;
        this.backgroundImg = new Image();
        this.backgroundImg.src = "./Imagenes/fondomejorado.png";
        this.inputLocked = false;
        this.playBtn = document.getElementById("playBtn");

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
        this.pipeGap = 200;
        this.pipeArray = [];
        this.pipeIntervalId = null;

        this.score = 0;

        this.logo = {
            x: this.boardWidth / 2 - 150 / 2,
            y: this.boardHeight / 5,
            width: 150,
            height: 100
        };

        this.playButton = {
            x: this.boardWidth / 2 - 115.5 / 2,
            y: this.boardHeight / 2 - 64 / 2,
            width: 115,
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
        this.birdImg.src = "./Imagenes/doberman.png";

        this.topPipeImg = new Image();
        this.topPipeImg.src = "./Imagenes/huesoalto.png";

        this.bottomPipeImg = new Image();
        this.bottomPipeImg.src = "./Imagenes/huesoalto.png";

        this.playButtonImg = new Image();
        this.playButtonImg.src = "./Imagenes/flappyBirdPlayButton.png";

        this.flappyBirdTextImg = new Image();
        this.flappyBirdTextImg.src = "./Imagenes/Logomejorado.png";

        this.gameOverImg = new Image();
        this.gameOverImg.src = "./Imagenes/flappy-gameover.png";

        this.jumpSound = new Audio("./Sonidos/salto.mp3");
        this.pointSound = new Audio("./Sonidos/punto.mp3");
        this.hitSound = new Audio("./Sonidos/golpe.mp3");

    }

    init() {
        window.onload = () => {

const unlockAudio = () => {
    if (this.jumpSound) {
        this.jumpSound.play().then(() => {
            this.jumpSound.pause();
            this.jumpSound.currentTime = 0;
            console.log("🔊 Audio desbloqueado");
        }).catch((err) => {
            console.warn("🔇 Audio bloqueado por navegador:", err);
        });
    }

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
            requestAnimationFrame(this.update.bind(this));
            this.playBtn.addEventListener("click", () => {
                if (this.currentState === this.GAME_STATE.MENU){
                    this.startGame();

                    this.playBtn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    if (this.currentState === this.GAME_STATE.MENU) {
        this.startGame();
    }
}, { passive: false });

                }
            });
        };
        this.restartBtn = document.getElementById("restartBtn");
        this.restartBtn.addEventListener("click", () => {
            this.resetGame();
            this.currentState = this.GAME_STATE.MENU;
        });

    }

    update() {
        requestAnimationFrame(this.update.bind(this));
        this.context.clearRect(0, 0, this.board.width, this.board.height);

        switch (this.currentState) {
            case this.GAME_STATE.MENU:
                this.renderMenu();
                break;
            case this.GAME_STATE.PLAYING:
                this.renderGame();
                break;
            case this.GAME_STATE.GAME_OVER:
                this.renderGameOver();
                break;
        }
    }

    renderMenu() {
        if (this.backgroundImg.complete) {
            this.context.drawImage(this.backgroundImg, 0, 0, this.boardWidth, this.boardHeight);
        }

        if (this.flappyBirdTextImg.complete) {
            let scaledWidth = this.logo.width;
            let scaledHeight = (this.flappyBirdTextImg.height / this.flappyBirdTextImg.width) * scaledWidth;
            this.context.drawImage(this.flappyBirdTextImg, this.logo.x, this.logo.y, scaledWidth, scaledHeight);
        }

        this.playBtn.style.display = "block";
    }

    renderGame() {
        if(this.backgroundImg.complete){
            this.context.drawImage(this.backgroundImg, 0, 0, this.boardWidth, this.boardHeight);
        }
        this.velocityY += this.gravity;
        this.bird.y = Math.max(this.bird.y + this.velocityY, 0);
        this.context.drawImage(this.birdImg, this.bird.x, this.bird.y, this.bird.width, this.bird.height);

        if (this.bird.y > this.board.height) {
            this.currentState = this.GAME_STATE.GAME_OVER;
        }

        for (let i = 0; i < this.pipeArray. length; i++) {
            const pipe = this.pipeArray[i];
            pipe.x += this.velocityX;
            this.context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

            if(i % 2 === 0 && !pipe.passed && this.bird.x > pipe.x + pipe.width) {
                this.score += 1;
                pipe.passed = true;
                this.pointSound.play().catch(() => {})
            }

            console.log(
    "Debug Colisión →",
    "Bird:", this.bird.x, this.bird.y,
    "Pipe:", pipe.x, pipe.y,
    "Overlap X:", (this.bird.x < pipe.x + pipe.width && this.bird.x + this.bird.width > pipe.x),
    "Overlap Y:", (this.bird.y < pipe.y + pipe.height && this.bird.y + this.bird.height > pipe.y)
  );

                 if (this.detectCollision(this.bird, pipe)) {
    console.warn("💥 Colisión detectada con tubo índice", i);
    this.hitSound.play().catch(() => {});
    this.currentState = this.GAME_STATE.GAME_OVER;
    break;
  }
}

        while (this.pipeArray.length > 0 && this.pipeArray[0].x < -this.pipeWidth) {
            this.pipeArray.shift();
        }

        this.context.fillStyle = "black";
        this.context.font = "45px sans-serif";
        this.context.textAlign = "left";
        this.context.fillText(Math.floor(this.score), 5, 45);
    }

    renderGameOver() {
        if(this.backgroundImg.complete) {
            this.context.drawImage(this.backgroundImg, 0, 0, this.boardWidth, this.boardHeight);
        }
        if (this.gameOverImg.complete) {
            let imgWidth = 400;
            let imgHeight = 80;
            let x = (this.boardWidth - imgWidth) / 2;
            let y = this.boardHeight / 3;

            this.context.drawImage(this.gameOverImg, x, y, imgWidth, imgHeight);

            let scoreText = `Your score: ${Math.floor(this.score)}`;
            if (this.score > this.highScore) {
                this.highScore = this.score;
                localStorage.setItem("flappyHighScore", this.highScore);
            }
            this.context.fillStyle = "black";
            this.context.font = "45px sans-serif";
            this.context.textAlign = "center";
            this.context.fillText(scoreText, this.boardWidth / 2, y + imgHeight + 50);
            let highScoreText = `Record: ${Math.floor(this.highScore)}`;
            this.context.fillText(highScoreText, this.boardWidth / 2, y + imgHeight + 100);
            this.playBtn.style.display = "none";

            this.inputLocked = true;
            setTimeout(() => {
                this.inputLocked = false;
            }, 1000);
        }
        this.restartBtn.style.display = "block";
        this.restartBtn.style.left = "50%";
        this.restartBtn.style.transform = "translate(-50%, -500%)";
        this.restartBtn.stlyle.top = `${this.boardHeight / 2 + 100}px`;

        if (this.bird.y + this.bird.height >= this.boardHeight) {
            this.hitSound.play().catch(() => {});
            this.currentState = this.GAME_STATE.GAME_OVER;
        }
    }

    handleKeyDown(e) {
        if (this.inputLocked) return;

        if (e.code === "Space") {
            if (this.currentState === this.GAME_STATE.MENU) {
                this.startGame();
            } else if (this.currentState === this.GAME_STATE.GAME_OVER) {
                this.resetGame();
                this.currentState = this.GAME_STATE.MENU;
            } else if (this.currentState === this.GAME_STATE.PLAYING) {
                this.velocityY = -8;
                this.jumpSound.play().catch(() => {});
            }
        }
    }

    handleTouch(e) {
            if(this.inputLocked) return;

        e.preventDefault();

        const touch = e.touches[0];
        const rect = this.board.getBoundingClientRect();
        
        const scaleX = this.board.width / rect.width;
        const scaleY = this.board.height / rect.height;

        const x = (touch.clientX - rect.left) * scaleX;
        const y = (touch.clientY - rect.top) * scaleY;

        if (this.currentState === this.GAME_STATE.MENU) {

            if (
                x >= this.playButton.x &&
                x <= this.playButton.x + this.playButton.width &&
                y >= this.playButton.y &&
                y <= this.playButton.y + this.playButton.height
            ) {
                this.startGame();
            }
        } else if (this.currentState === this.GAME_STATE.GAME_OVER) {
            this.resetGame();
            this.currentState = this.GAME_STATE.MENU;
        } else if (this.currentState === this.GAME_STATE.PLAYING) {
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
        this.highScore = localStorage.getItem("flappyHighScore") || 0;
        this.playBtn.style.display = "none";

        if (this.pipeIntervalId) clearInterval(this.pipeIntervalId);
        this.pipeIntervalId = setInterval(() => this.placePipes(), 1500);

        this.restartBtn.style.display = "none";
    }

    resetGame() {
        this.bird.y = this.birdY;
        this.pipeArray = [];
        this.score = 0;

        this.restartBtn.style.display = "none";
    }

    placePipes() {
        this.createPipes();
    }

    createPipes() {
        let maxTopPipeHeight = this.boardHeight - this.pipeGap - 50;
        let topPipeHeight = Math.floor(Math.random() * maxTopPipeHeight);
        let bottomPipeHeight = this.boardHeight - topPipeHeight - this.pipeGap;

        let topPipe = {
            x: this.boardWidth,
            y: 0,
            width: this.pipeWidth,
            height: topPipeHeight,
            img: this.topPipeImg,
            passed: false
        };

        let bottomPipe = {
            x: this.boardWidth,
            y: topPipeHeight + this.pipeGap,
            width: this.pipeWidth,
            height: bottomPipeHeight,
            img: this.bottomPipeImg,
            passed: false
        };

        this.pipeArray.push(topPipe, bottomPipe);
    }

    detectCollision(rect1, rect2) {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
    }
}

const game = new Game();
//prueba de cambio