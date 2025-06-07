const playerOne = {
    pos: 50,
    points: 0,
    speed: 3,

    length: 80,
    width: 4,
    color: 'lightblue',
    
    type: "human", // human or bot
    upkey: 'ArrowUp',
    upkeyPressed: false,
    downkey: 'ArrowDown',
    downkeyPressed: false,
    side: 'right',
    botRandomPos: 50,
    gotoRandomPos:  false,
    botSkill: 0.9,

    reference: 'player-1',
    name: 'player one'

};

const playerTwo = {
    pos: 50,
    points: 0,
    speed: 3,

    length: 80,
    width: 4,
    color: 'lightblue',
    
    type: "human",
    upkey: 'KeyW',
    upkeyPressed: false,
    downkey: 'KeyS',
    downkeyPressed: false,
    side: 'left',
    botRandomPos: 50,
    gotoRandomPos:  false,
    botSkill: 0.8,

    reference: 'player-2',
    name: 'player two'
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

    radius: 18,
    color: 'red',
    speed: 2,

    // speedup
    useTouchSpeedup: false,
    touchSpeedup: 0.1,
    pevTouchSpeed: 2,
    usePointSpeedup: false,
    pointSpeedup: 0.2,
    originalSpeed: 2
}

const field = {
    margin: 5
}

const awaitKeyInput =  {
    state: false,
    player: playerOne,
    type: 'up'
}

let ctx;
let infoLabel;
let paused; // game ready to start, waiting for infut
let started; // starting input given
let p1Score;
let p2Score;
let debugShown = false;
let settingsShown = false;


const onKeyDown = (event) => {

    // changing input keys
    if(awaitKeyInput.state === true) {
        if (awaitKeyInput.type === 'up') {
            awaitKeyInput.player.upkey = event.code;
        }
        if (awaitKeyInput.type === 'down') {
            awaitKeyInput.player.downkey = event.code;
        }
        awaitKeyInput.state = false;
        return;
    }

    // starting game
    if(paused) {
        started = true;
        return;
    }

    // activating the inputs for continuous input
    if (playerOne.type === 'human') {
        if(event.code === playerOne.upkey) {
            playerOne.upkeyPressed = true;
        }
        
        if(event.code === playerOne.downkey) {
            playerOne.downkeyPressed = true;
        }
    }

    if(playerTwo.type === 'human') {
        if(event.code === playerTwo.upkey) {
            playerTwo.upkeyPressed = true;
        }

        if(event.code === playerTwo.downkey) {
            playerTwo.downkeyPressed = true;
        }
    }
}

const onKeyUp = (event) => {

    // deactivating the inputs for continuous input
    if (playerOne.type === 'human') {
        if(event.code === playerOne.upkey) {
            playerOne.upkeyPressed = false;
        }
        
        if(event.code === playerOne.downkey) {
            playerOne.downkeyPressed = false;
        }
    }

    if(playerTwo.type === 'human') {
        if(event.code === playerTwo.upkey) {
            playerTwo.upkeyPressed = false;
        }

        if(event.code === playerTwo.downkey) {
            playerTwo.downkeyPressed = false;
        }
    }
}

const update = () => {

    if(started) {
        
        // "start" game
        infoLabel.style.display = 'none';
        infoLabel.innerText = '';

        ball.dir.x = randomDirection();
        ball.dir.y = randomDirection();

        started = false;
        paused = false;
    }

    if (playerOne.type === 'human') {
        if(playerOne.upkeyPressed) {
            playerOne.pos -= playerOne.speed;
        }
        
        if(playerOne.downkeyPressed) {
            playerOne.pos += playerOne.speed;
        }
    }

    if(playerTwo.type === 'human') {
        if(playerTwo.upkeyPressed) {
            playerTwo.pos -= playerTwo.speed;
        }

        if(playerTwo.downkeyPressed) {
            playerTwo.pos += playerTwo.speed;
        }
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

    if(playerCollide(playerOne)) {
        ball.dir.x = 1;
        if(ball.useTouchSpeedup) {
            ball.speed += ball.touchSpeedup;
        }
    }
    if(playerCollide(playerTwo)) {
        ball.dir.x = -1;
        if(ball.useTouchSpeedup) {
            ball.speed += ball.touchSpeedup;
        }
    }

    draw();
    window.requestAnimationFrame(update);
}

// ensures players are inside field, if not sets them on the side they wanted to "escape"
const fieldCheck = (player, mode) => {
    
    if(player.pos <= 0 + field.margin && (mode === 'up' || mode === 'all')) {
        player.pos = 0 + field.margin;
        return;
    }

    if(player.pos + player.length >= ctx.canvas.height - field.margin && (mode === 'down' || mode === 'all')) {
        player.pos = ctx.canvas.height - field.margin - player.length;
        return;
    }
}

const playerCollide = (player) =>{

    // player 1
    if(player.side === 'right') {
        if(ball.pos.x - ball.radius <= 0 + field.margin + player.width) { // ball would touch bar on the side
            if(ball.pos.y + ball.radius > player.pos && ball.pos.y - ball.radius < player.pos + player.length) { // ball "inside" player
                return true;
            }
        }
    }

    // player 2
    if(player.side === 'left') {
        if(ball.pos.x + ball.radius >= ctx.canvas.width - field.margin - player.width) {
            if(ball.pos.y + ball.radius > player.pos && ball.pos.y - ball.radius < player.pos + player.length) {
                return true;
            }
        }
    }

    return false;
}

// gets called, when a point was made and when the game starts (loads)
const startScreen = () => {

    paused = true;

    // stopping ball
    ball.pos.x = ctx.canvas.width / 2;
    ball.pos.y = ctx.canvas.height / 2;
    ball.dir.x = 0;
    ball.dir.y = 0;
    infoLabel.style.display = 'inline';
    infoLabel.innerText = 'To start game, press any key!';

    // speed conroll
    if(ball.useTouchSpeedup) {
        ball.prevPointSpeed += ball.pointSpeedup;
        ball.speed = ball.prevPointSpeed; 
    }
}

const draw = () => {

    //-------CANVAS-------//
    // clear
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // player one
    ctx.beginPath();
    ctx.fillStyle = playerOne.color;
    ctx.roundRect(field.margin, playerOne.pos, playerOne.width, playerOne.length, playerOne.width / 2)
    ctx.fill();
    
    // player two
    ctx.beginPath();
    ctx.fillStyle = playerTwo.color;
    ctx.roundRect(ctx.canvas.width - field.margin - playerTwo.width, playerTwo.pos , playerTwo.width, playerTwo.length, playerTwo.width / 2);
    ctx.fill();

    // ball
    ctx.beginPath();
    ctx.fillStyle = ball.color;
    ctx.arc(ball.pos.x, ball.pos.y, ball.radius, 0, 2 * Math.PI);
    ctx.fill();


    //-------SETTINGS-----//
    // gamemode
    if(settingsShown) {
        document.getElementById('player-1-mode').innerText = playerOne.type;
        document.getElementById('player-2-mode').innerText = playerTwo.type;
    }

    //-------PLAYINGFIELD-//
    // scores
    p1Score.innerText = playerOne.points;
    p2Score.innerText = playerTwo.points;

    // keybindings
    document.getElementById('player-1-upkey-label').innerText = playerOne.upkey;
    document.getElementById('player-1-downkey-label').innerText = playerOne.downkey;
    document.getElementById('player-2-upkey-label').innerText = playerTwo.upkey;
    document.getElementById('player-2-downkey-label').innerText = playerTwo.downkey;
    
    // keybindings info
    if(awaitKeyInput.state) {
        infoLabel.style.display = 'inline';
        infoLabel.innerText = `Press Key to set the ${awaitKeyInput.type}-key as controll for ${awaitKeyInput.player.name}!`;
    }

    //------DEBUG---------//
    if(debugShown) {
        document.getElementById('general-info').innerText = `Field margin: ${field.margin}`;
        document.getElementById('ball-info').innerText = `Speed: ${Math.round(ball.speed * 10) / 10}\nPos: x:${Math.round(ball.pos.x * 10) / 10} y:${Math.round(ball.pos.y * 10) / 10}\nDirection: x${ball.dir.x} y:${ball.dir.y}\nRadius: ${ball.radius}\nUse touch speedup: ${ball.useTouchSpeedup}\nTouch speedup: ${ball.touchSpeedup}\nUse point speedup: ${ball.usePointSpeedup}\nPoint speedup ${ball.pointSpeedup}\nPrev point speed: ${Math.round(ball.prevPointSpeed * 10) / 10}\nOriginal speed: ${Math.round(ball.originalSpeed * 10) / 10}`;
        document.getElementById('player-1-info').innerText = `Position: ${Math.round(playerOne.pos)}\nPoints: ${playerOne.points}\nSpeed: ${playerOne.speed}\nLenght: ${playerOne.length}\nWidth: ${playerOne.width}\nType: ${playerOne.type}\nUp-Key: '${playerOne.upkey}'\nDown-Key: '${playerOne.downkey}'\nBot:\nRandom Position: ${Math.round(playerOne.botRandomPos)}\nGoto random Position: ${playerOne.gotoRandomPos}\nSkill: ${playerOne.botSkill}\nDownkey pressed: ${playerOne.downkeyPressed}\nUpkey pressed: ${playerOne.upkeyPressed}`;
        document.getElementById('player-2-info').innerText = `Position: ${Math.round(playerTwo.pos)}\nPoints: ${playerTwo.points}\nSpeed: ${playerTwo.speed}\nLenght: ${playerTwo.length}\nWidth: ${playerTwo.width}\nType: ${playerTwo.type}\nUp-Key: '${playerTwo.upkey}'\nDown-Key: '${playerTwo.downkey}'\nBot:\nRandom Position: ${Math.round(playerTwo.botRandomPos)}\nGoto random Position: ${playerTwo.gotoRandomPos}\nSkill: ${playerTwo.botSkill}`;
    }
}


const init = () => {
    // often used elemets
    ctx = document.getElementById("playingfield").getContext("2d", {alpha: true});
    p1Score = document.getElementById('player-1-score-label');
    p2Score = document.getElementById('player-2-score-label');
    infoLabel = document.getElementById('info-label');

    // colors
    ball.color = getComputedStyle(document.getElementById('top-bar-title-text')).getPropertyValue('--md-sys-color-on-primary-fixed');
    playerOne.color = getComputedStyle(document.getElementById('top-bar-title-text')).getPropertyValue('--md-sys-color-on-primary');
    playerTwo.color = getComputedStyle(document.getElementById('top-bar-title-text')).getPropertyValue('--md-sys-color-on-primary');
    
    // setting toggles
    const pointSpeedupSwitch = document.getElementById('point-speedup');
    pointSpeedupSwitch.addEventListener('change', setPointSpeedup);
    pointSpeedupSwitch.selected = ball.usePointSpeedup;

    const touchSpeedupSwitch = document.getElementById('touch-speedup');
    touchSpeedupSwitch.addEventListener('change', setTouchSpeedup);
    touchSpeedupSwitch.selected = ball.useTouchSpeedup;

    // speed control
    ball.prevPointSpeed = ball.speed;
    ball.originalSpeed = ball.speed;
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
        document.getElementById(player.reference + '-upkey').style.display = 'none';
        document.getElementById(player.reference + '-downkey').style.display = 'none';
    }
    else if(player.type === 'bot') {
        player.type = 'human';
        document.getElementById(player.reference + '-upkey').style.display = 'flex';
        document.getElementById(player.reference + '-downkey').style.display = 'flex';
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
        document.getElementById('settings-drawer').style.display = 'flex';
        return;
    }
    document.getElementById('settings-drawer').style.display = 'none';
}

const selectKey = (player, mode) => {
    awaitKeyInput.state = true;
    awaitKeyInput.player = player;
    awaitKeyInput.type = mode;
}

const setPointSpeedup = (event) => {
    ball.usePointSpeedup = event.target.selected;
}

const setTouchSpeedup = (event) => {
    ball.useTouchSpeedup = event.target.selected;
}

const resetSpeed = () => {
    ball.speed = ball.originalSpeed;
    ball.prevPointSpeed = ball.speed;
} 

window.addEventListener('load', init);
window.addEventListener('keydown', onKeyDown);
window.addEventListener('keyup', onKeyUp);
