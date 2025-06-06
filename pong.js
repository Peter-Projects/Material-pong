const playerOne = {
    pos: 50,
    points: 0,
    speed: 3,

    length: 75,
    width: 3,
    color: 'lightblue',
    
    type: "human", // human or bot
    upkey: 'ArrowUp',
    downkey: 'ArrowDown',
    side: 'right',
    botRandomPos: 50,
    gotoRandomPos:  false,
    botSkill: 0.9
};

const playerTwo = {
    pos: 50,
    points: 0,
    speed: 3,

    length: 75,
    width: 3,
    color: 'lightblue',
    
    type: "human",
    upkey: 'KeyW',
    downkey: 'KeyS',
    side: 'left',
    botRandomPos: 50,
    gotoRandomPos:  false,
    botSkill: 0.8
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

    radius: 10,
    color: 'red',
    speed: 2
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
let debugShown = false;
let settingsShown = false;


const onKeyDown = (event) => {

    if(paused) {
        started = true;
    }

    if (playerOne.type === 'human') {
        if(event.code === playerOne.upkey && fieldCheck(playerOne, 'up')) {
            playerOne.pos -= playerOne.speed;
        }
        
        if(event.code === playerOne.downkey && fieldCheck(playerOne, 'down')) {
            playerOne.pos += playerOne.speed;
        }
    }

    if(playerTwo.type == 'human') {
        if(event.code === playerTwo.upkey && fieldCheck(playerTwo, 'up')) {
            playerTwo.pos -= playerTwo.speed;
        }

        if(event.code === playerTwo.downkey && fieldCheck(playerTwo, 'down')) {
            playerTwo.pos += playerTwo.speed;
        }
    }
}


const update = () => {

    if(started) {
        infoLabel.innerText = '';
        ball.dir.x = randomDirection();
        ball.dir.y = randomDirection();
        started = false;
        paused = false;
    }
    
    if(playerOne.type === 'bot') {
        calcBotPosition(playerOne);
    }

    if(playerTwo.type === 'bot') {
        calcBotPosition(playerTwo);
    }

    fieldCheck(playerOne, 'all');
    fieldCheck(playerTwo, 'all');

    if(ball.pos.x - ball.radius <= 0) {
        playerTwo.points++;
        startScreen();
    }

    if(ball.pos.x + ball.radius >= ctx.canvas.width) {
        playerOne.points++;
        startScreen();
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

    draw();
    window.requestAnimationFrame(update);
}

const fieldCheck = (player, mode) => {
    
    if(player.pos <= 0 + field.margin && (mode === 'up' || mode === 'all')) {
        player.pos = 0 + field.margin;
        return false;
    }

    if(player.pos + player.length >= ctx.canvas.height - field.margin && (mode === 'down' || mode === 'all')) {
        player.pos = ctx.canvas.height - field.margin - player.length;
        return false;
    }
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
}

const draw = () => {

    //-------CANVAS-------//
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

    //-------BUTTONS------//
    // gamemode
    document.getElementById('player-1-mode').innerText = playerOne.type;
    document.getElementById('player-2-mode').innerText = playerTwo.type;


    //-------TEXT---------//
    // scores
    p1Score.innerText = playerOne.points;
    p2Score.innerText = playerTwo.points;

    // keybindings
    document.getElementById('player-1-upkey-label').innerText = playerOne.upkey;
    document.getElementById('player-1-downkey-label').innerText = playerOne.downkey;
    document.getElementById('player-2-upkey-label').innerText = playerTwo.upkey;
    document.getElementById('player-2-downkey-label').innerText = playerTwo.downkey;
    // debug info
    if(debugShown) {
        document.getElementById('general-info').innerText = `Field margin: ${field.margin}`;
        document.getElementById('ball-info').innerText = `Speed: ${ball.speed}\nPos: x:${ball.pos.x} y:${ball.pos.y}\nDirection: x${ball.dir.x} y:${ball.dir.y}\nRadius: ${ball.radius}`;
        document.getElementById('player-1-info').innerText = `Positio: ${Math.round(playerOne.pos)}\nPoints: ${playerOne.points}\nSpeed: ${playerOne.speed}\nLenght: ${playerOne.length}\nWidth: ${playerOne.width}\nType: ${playerOne.type}\nUp-Key: '${playerOne.upkey}'\nDown-Key: '${playerOne.downkey}'\nBot:\nRandom Position: ${Math.round(playerOne.botRandomPos)}\nGoto random Position: ${playerOne.gotoRandomPos}\nSkill: ${playerOne.botSkill}`;
        document.getElementById('player-2-info').innerText = `Positio: ${Math.round(playerTwo.pos)}\nPoints: ${playerTwo.points}\nSpeed: ${playerTwo.speed}\nLenght: ${playerTwo.length}\nWidth: ${playerTwo.width}\nType: ${playerTwo.type}\nUp-Key: '${playerTwo.upkey}'\nDown-Key: '${playerTwo.downkey}'\nBot:\nRandom Position: ${Math.round(playerTwo.botRandomPos)}\nGoto random Position: ${playerTwo.gotoRandomPos}\nSkill: ${playerTwo.botSkill}`;
    }
}


const init = () => {
    ctx = document.getElementById("playingfield").getContext("2d", {alpha: true});
    p1Score = document.getElementById('player-1-score-label');
    p2Score = document.getElementById('player-2-score-label');
    infoLabel = document.getElementById('info-label');
    ball.color = getComputedStyle(document.getElementById('top-bar-title-text')).getPropertyValue('--md-sys-color-on-primary-fixed');
    playerOne.color = getComputedStyle(document.getElementById('top-bar-title-text')).getPropertyValue('--md-sys-color-on-primary');
    playerTwo.color = getComputedStyle(document.getElementById('top-bar-title-text')).getPropertyValue('--md-sys-color-on-primary');
    startScreen();
    window.requestAnimationFrame(update);
}

const randomDirection = () => {
    return Math.random() >= 0.5 ? 1 : -1;
}

const calcBotPosition = (player) => {

    if (!player.gotoRandomPos && Math.random() >= player.botSkill) {
      player.botRandomPos = (Math.random() * (ctx.canvas.height - (field.margin * 2) - player.length) + field.margin);
      player.gotoRandomPos = true;
    }
    if(player.gotoRandomPos) {
        if(player.pos <= player.botRandomPos + 2 && player.pos >= player.botRandomPos - 2) { // player is inside random position
            player.gotoRandomPos = false;
        }

        if(player.pos < player.botRandomPos) {
            player.pos += player.speed / 6;
        }
        
        else if (player.pos > player.botRandomPos) {
            player.pos -= player.speed / 6;
        }
    }
    else {
        if(player.pos + (player.length / 2) - 2 > ball.pos.y) {
            player.pos -= player.speed / 5;
        }
        else if (player.pos + (player.length / 2) + 2 < ball.pos.y) {
            player.pos += player.speed / 5;
        }
    }
}

const changePlayerMode = (player) => {
    if(player.type === 'human') {
        player.type = 'bot';
    }
    else if(player.type === 'bot') {
        player.type = 'human';
    }
}

const showDebug = () => {
    debugShown = !debugShown;
    if(debugShown) {
        document.getElementById('debug-drawer').style.display = 'block';
        return;
    }
    document.getElementById('debug-drawer').style.display = 'none';
}

const showSettings = () => {
    settingsShown = !settingsShown;
    if(settingsShown) {
        document.getElementById('settings-drawer').style.display = 'block';
        return;
    }
    document.getElementById('settings-drawer').style.display = 'none';
}
window.addEventListener("load", init);
window.addEventListener("keydown", onKeyDown);
