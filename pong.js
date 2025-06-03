const playerOne = {
    pos: 50,
    points: 0,
    speed: 3,

    type: "human",
    length: 50,
    width: 10,
    color: 'lightblue',

    upkey: 'ArrowUp',
    downkey: 'ArrowDown'
};

const playerTwo = {
    pos: 50,
    points: 0,
    speed: 3,

    type: "human",
    length: 15,
    width: 10,
    color: 'lightblue',

    upkey: 'KeyW',
    downkey: 'KeyS'
};

const ball = {
    pos: {
        x: 50,
        y: 50
    },
    dir: {
        x: -1,
        y: -1
    },

    radius: 5,
    color: 'red',
    speed: 0.6
}

const field = {
    margin: 5
}


let ctx;
let canvas;


const onKeyDown = (event) => {
    // console.log("Button pressed!");
    if(event.code === playerOne.upkey && fieldCheck(playerOne, 'up')) {
        playerOne.pos -= playerOne.speed;
        // console.log(`Pressed ${event.code}`);
    }
    
    if(event.code === playerOne.downkey && fieldCheck(playerOne, 'down')) {
        playerOne.pos += playerOne.speed;
    }

    if(event.code === playerTwo.upkey && fieldCheck(playerTwo, 'up')) {
        playerTwo.pos -= playerTwo.speed;
        // console.log(`Pressed ${event.code}`);
    }
    
    if(event.code === playerTwo.downkey && fieldCheck(playerTwo, 'down')) {
        playerTwo.pos += playerTwo.speed;
    }
}


const update = () => {

    if(ball.pos.x + ball.radius >= ctx.canvas.width) {
        ball.dir.x = -1;
    }

    if(ball.pos.x - ball.radius <= 0) {
        ball.dir.x = 1;
    }

    if(ball.pos.y + ball.radius >= ctx.canvas.height) {
        ball.dir.y = -1;
    }

    if(ball.pos.y - ball.radius <= 0) {
        ball.dir.y = 1;
    }
    
    ball.pos.x += ball.dir.x * ball.speed;
    ball.pos.y += ball.dir.y * ball.speed;

    if(ball.pos.x + ball.radius + 1  <= 0 + field.margin + playerOne.width) { // Ball touches player one
        console.log("precollision detected");
        if(ball.pos.y + ball.radius >= playerOne.pos && ball.pos.y + ball.radius <= playerOne.pos + playerOne.length) {
            ball.dir.x = 1;
            console.log("player collided");
        }

    }

    draw();
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

    window.requestAnimationFrame(update);
}


const init = () => {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d", {alpha: true});
    window.requestAnimationFrame(update);
}

window.addEventListener("load", init);
window.addEventListener("keydown", onKeyDown);