const playerOne = {
    pos: 50,
    points: 0,
    speed: 3,

    length: 50,
    width: 10,
    color: 'lightblue',
    
    type: "human",
    upkey: 'ArrowUp',
    downkey: 'ArrowDown',
    side: 'right'
};

const playerTwo = {
    pos: 50,
    points: 0,
    speed: 3,

    length: 40,
    width: 10,
    color: 'lightblue',
    
    type: "human",
    upkey: 'KeyW',
    downkey: 'KeyS',
    side: 'left'
};

const ball = {
    pos: {
        x: 50,
        y: 50
    },
    dir: {
        x: 0,
        y: 0
    },

    radius: 5,
    color: 'red',
    speed: 1
}

const field = {
    margin: 5
}

let ctx;
let infoLabel;
let started;
let paused;
let p1Score;
let p2Score;


const onKeyDown = (event) => {

    if(paused) {
        started = true;
    }

    if(event.code === playerOne.upkey && fieldCheck(playerOne, 'up')) {
        playerOne.pos -= playerOne.speed;
    }
    
    if(event.code === playerOne.downkey && fieldCheck(playerOne, 'down')) {
        playerOne.pos += playerOne.speed;
    }

    if(event.code === playerTwo.upkey && fieldCheck(playerTwo, 'up')) {
        playerTwo.pos -= playerTwo.speed;
    }
    
    if(event.code === playerTwo.downkey && fieldCheck(playerTwo, 'down')) {
        playerTwo.pos += playerTwo.speed;
    }
}


const update = () => {

    if(started) {
        infoLabel.innerText = '';
        ball.dir.x = 1;
        ball.dir.y = 1;
        started = false;
        paused = false;
    }
    
    if(ball.pos.x - ball.radius <= 0) {
        playerOne.points++;
        startScreen();
    }

    if(ball.pos.x + ball.radius >= ctx.canvas.width) {
        playerTwo.points++;
        startScreen()
    }
    
    if(ball.pos.y + ball.radius >= ctx.canvas.height) {
        ball.dir.y = -1;
    }

    if(ball.pos.y - ball.radius <= 0) {
        ball.dir.y = 1;
    }
    
    ball.pos.x += ball.dir.x * ball.speed;
    ball.pos.y += ball.dir.y * ball.speed;

    if(playerCollide(playerOne, ball)) {
        ball.dir.x = 1;
    }
    if(playerCollide(playerTwo, ball)) {
        ball.dir.x = -1;
    }

    infoLabel.innerText = `Ball: dirx:${ball.dir.x}, diry:${ball.dir.y}\nSpeed:${ball.speed}`;
    draw();
    window.requestAnimationFrame(update);
}

const fieldCheck = (player, mode) => {
    
    if(player.pos <= 0 + field.margin && mode === 'up') {
        return false;
    }

    if(player.pos + player.length >= ctx.canvas.height - field.margin && mode === 'down') {
        return false;
    }
    //console.log(`Player pos: ${player.pos},\n height ${player.length},\n mode ${mode},\n canvas height ${ctx.canvas.height}`);
    return true;
}

const playerCollide = (player, collide) =>{

    if(player.side === 'right') {
        if(collide.pos.x - collide.radius <= 0 + field.margin + player.width) { // Ball touches player one
            if(collide.pos.y + collide.radius >= player.pos && collide.pos.y + collide.radius <= player.pos + player.length) {
                return true;
            }
        }
    }

    if(player.side === 'left') {
        if(collide.pos.x + collide.radius >= ctx.canvas.width - field.margin - player.width) { // Ball touches player one
            if(collide.pos.y + collide.radius >= player.pos && collide.pos.y + collide.radius <= player.pos + player.length) {
                return true;
            }
        }
    }

    return false;
}

const startScreen = () => {

    paused = true;

    ball.pos.x = ctx.canvas.width / 2;
    ball.pos.y = ctx.canvas.height / 2;
    ball.dir.x = 0;
    ball.dir.y = 0;

    infoLabel.innerText = 'To start game, press any key!';

    requestAnimationFrame(update);
}

const draw = () => {
    // clear
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // player one
    ctx.fillStyle = playerOne.color;
    ctx.fillRect(field.margin, playerOne.pos , playerOne.width, playerOne.length);
    
    // player two
    ctx.fillStyle = playerTwo.color;
    ctx.fillRect(ctx.canvas.width - field.margin - playerTwo.width, playerTwo.pos , playerTwo.width, playerTwo.length);


    // ball
    ctx.beginPath();
    ctx.fillStyle = ball.color;
    ctx.arc(ball.pos.x, ball.pos.y, ball.radius, 0, 2 * Math.PI);
    ctx.fill();

    // scores
    p1Score.innerText = playerOne.points;
    p2Score.innerText = playerTwo.points;
}


const init = () => {
    ctx = document.getElementById("canvas").getContext("2d", {alpha: true});
    p1Score = document.getElementById('p1Score');
    p2Score = document.getElementById('p2Score');
    infoLabel = document.getElementById('info');

    window.requestAnimationFrame(startScreen);
}

window.addEventListener("load", init);
window.addEventListener("keydown", onKeyDown);