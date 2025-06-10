// Copyright (c) 2025 Peter Pany

const playerOne = {

    // game
    pos: 50,
    points: 0,
    speed: 5,

    // appereance
    length: 120,
    width: 6,
    color: 'red',
    side: 'left',
    
    // controll
    upkey: 'KeyW',
    upkeyPressed: false,
    downkey: 'KeyS',
    downkeyPressed: false,

    // bot
    type: "human", // human or bot
    botThreshold: 25, // line, the ball has to cross for the bot to move. from the player, direction middle
    botFollow: false,
    botNextPos: 0,
    botSkill: 0.4, // lower the better

    // internal
    reference: 'player-1',
    name: 'player one'
};

const playerTwo = {

    // game
    pos: 50,
    points: 0,
    speed: 5,

    // appereance
    length: 120,
    width: 6,
    color: 'red',
    side: 'right',
    
    // controll
    upkey: 'ArrowUp',
    upkeyPressed: false,
    downkey: 'ArrowDown',
    downkeyPressed: false,

    // bot
    type: "human",
    botThreshold: 25, // line, the ball has to cross for the bot to move. from the player, direction middle
    botFollow: false,
    botNextPos: 0,
    botSkill: 0.4, // lower the better

    // internal
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

    radius: 20,
    color: 'red',
    speed: 4,

    // speedup
    useTouchSpeedup: false,
    touchSpeedup: 0.35,
    usePointSpeedup: false,
    pointSpeedup: 0.07,
    pevTouchSpeed: 2,

    originalSpeed: 2
};

const field = {
    marginRL: 4, // right left
    marginTB: 15, // top bottom
    infoText: ''
};

const awaitKeyInput =  {
    state: false,
    player: playerOne,
    type: 'up' // or down
};

let ctx;
let infoLabel;
let paused; // game ready to start, waiting for infut
let started; // starting input given
let p1Score;
let p2Score;
let debugShown = false;
let settingsShown = false;


//-----MAIN PROCESS----------------------

const update = () => {

    if(started) {
        startGame();
    }

    // move player
    if (playerOne.type === 'human') {
        movePlayer(playerOne);
    }else {
        moveBot(playerOne);
    }

    if(playerTwo.type === 'human') {
        movePlayer(playerTwo);
    }else {
        moveBot(playerTwo);
    }

    // move ball
    ball.pos.x += ball.dir.x * ball.speed;
    ball.pos.y += ball.dir.y * ball.speed;

    // bounce ball off top and bottom wall
    if(ball.pos.y - ball.radius <= 0) {
        ball.dir.y = 1;
    }

    if(ball.pos.y + ball.radius >= ctx.canvas.height) {
        ball.dir.y = -1;
    }

    // player hits ball
    if(playerCollide(playerOne)) {
        ball.dir.x = 1;
        playerCollided(playerOne);
        calcBotTheshold(playerTwo);
    }
    if(playerCollide(playerTwo)) {
        ball.dir.x = -1;
        playerCollided(playerTwo);
        calcBotTheshold(playerOne);
    }

    // give points
    if(ball.pos.x - ball.radius <= 0) {
        playerTwo.points++;
        startScreen();
    }    
    if(ball.pos.x + ball.radius >= ctx.canvas.width) {
        playerOne.points++;
        startScreen();
    }
    
    fieldCheck(playerOne);
    fieldCheck(playerTwo);
    
    // colors, using random element
    ball.color = getComputedStyle(document.getElementById('top-bar-title-text')).getPropertyValue('--md-sys-color-on-primary-fixed');
    playerOne.color = getComputedStyle(document.getElementById('top-bar-title-text')).getPropertyValue('--md-sys-color-on-primary');
    playerTwo.color = getComputedStyle(document.getElementById('top-bar-title-text')).getPropertyValue('--md-sys-color-on-primary');
        
    draw();

    window.requestAnimationFrame(update);
}

const draw = () => {

    //-------CANVAS-------
    // clear
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // player one
    ctx.beginPath();
    ctx.fillStyle = playerOne.color;
    ctx.roundRect(field.marginRL, playerOne.pos, playerOne.width, playerOne.length, playerOne.width / 2)
    ctx.fill();
    
    // player two
    ctx.beginPath();
    ctx.fillStyle = playerTwo.color;
    ctx.roundRect(ctx.canvas.width - field.marginRL - playerTwo.width, playerTwo.pos , playerTwo.width, playerTwo.length, playerTwo.width / 2);
    ctx.fill();

    // ball
    ctx.beginPath();
    ctx.fillStyle = ball.color;
    ctx.arc(ball.pos.x, ball.pos.y, ball.radius, 0, 2 * Math.PI);
    ctx.fill();


    //-------SETTINGS-----
    // gamemode
    if(settingsShown) {
        document.getElementById('player-1-mode').innerText = playerOne.type;
        document.getElementById('player-2-mode').innerText = playerTwo.type;
    }

    //-------PLAYINGFIELD-
    // scores
    p1Score.innerText = playerOne.points;
    p2Score.innerText = playerTwo.points;

    // keybindings
    document.getElementById('player-1-upkey-label').innerText = playerOne.upkey;
    document.getElementById('player-1-downkey-label').innerText = playerOne.downkey;
    document.getElementById('player-2-upkey-label').innerText = playerTwo.upkey;
    document.getElementById('player-2-downkey-label').innerText = playerTwo.downkey;

    // info
    if(field.infoText === '') {
        infoLabel.style.display = 'none';
        infoLabel.innerText = '';
    }
    else {
        infoLabel.style.display = 'inline';
        infoLabel.innerText = field.infoText;
    }
    
    //------DEBUG---------
    if(debugShown) {
        document.getElementById('general-info').innerText = `Field margin RL: ${field.marginRL}
            Field margin TB: ${field.marginTB}`;
        document.getElementById('ball-info').innerText = `Speed: ${Math.round(ball.speed * 10) / 10}
            Position x: ${Math.round(ball.pos.x * 10) / 10}
            Position y: ${Math.round(ball.pos.y * 10) / 10}
            Direction x: ${ball.dir.x}
            Direction y: ${ball.dir.y}
            Radius: ${ball.radius}
            Use touch speedup: ${ball.useTouchSpeedup}
            Touch speedup: ${ball.touchSpeedup}
            Use point speedup: ${ball.usePointSpeedup}
            Point speedup ${ball.pointSpeedup}
            Prev point speed: ${Math.round(ball.prevPointSpeed * 10) / 10}
            Original speed: ${Math.round(ball.originalSpeed * 10) / 10}`;
        
        document.getElementById('player-1-info').innerText = `Position: ${Math.round(playerOne.pos)}
            Points: ${playerOne.points}
            Speed: ${playerOne.speed}
            Lenght: ${playerOne.length}
            Width: ${playerOne.width}
            Up-key: '${playerOne.upkey}'
            Down-key: '${playerOne.downkey}'
            Up-key pressed: ${playerOne.upkeyPressed}
            Down-key pressed: ${playerOne.downkeyPressed}
            
            Type: ${playerOne.type}
            Bot threshold: ${playerOne.botThreshold}
            Bot follow: ${playerOne.botFollow}
            Bot next pos ${playerOne.botNextPos}
            Bot skill: ${playerOne.botSkill}
            `;

        document.getElementById('player-2-info').innerText = `Position: ${Math.round(playerTwo.pos)}
            Points: ${playerTwo.points}
            Speed: ${playerTwo.speed}
            Lenght: ${playerTwo.length}
            Width: ${playerTwo.width}
            Up-Key: '${playerTwo.upkey}'
            Down-Key: '${playerTwo.downkey}'
            Up-key pressed:${playerTwo.upkeyPressed}
            Down-key pressed: ${playerTwo.downkeyPressed}
            
            Type: ${playerTwo.type}
            Bot threshold: ${playerTwo.botThreshold}
            Bot follow: ${playerTwo.botFollow}
            Bot next pos ${playerTwo.botNextPos}
            Bot skill: ${playerTwo.botSkill}
            `;
    }
}

const startGame = () => {
    field.infoText = '';

    ball.dir.x = randomDirection();
    ball.dir.y = randomDirection();

    started = false;
    paused = false;
}

const startScreen = () => {
    // gets called, when a point was made and when the game starts (loads)

    paused = true;

    // stopping ball
    ball.pos.x = ctx.canvas.width / 2;
    ball.pos.y = ctx.canvas.height / 2;
    ball.dir.x = 0;
    ball.dir.y = 0;

    field.infoText = 'To start game, press any controll-key!';
    
    // speed controll
    if(ball.usePointSpeedup) {
        ball.prevPointSpeed += ball.pointSpeedup;
    }
    ball.speed = ball.prevPointSpeed; 
    
    // bot
    playerOne.botFollow = false;
    playerTwo.botFollow = false;
    calcBotTheshold(playerOne);
    calcBotTheshold(playerTwo);

    // auto start
    if(playerOne.type === 'bot' && playerTwo.type === 'bot') {
        startGame();
    }
}


//-----MOTION----------------------------
// Player

const movePlayer = (player) => {

    if(player.upkeyPressed) {
        player.pos -= player.speed;
    }
    
    if(player.downkeyPressed) {
        player.pos += player.speed;
    }
}

const fieldCheck = (player) => {
    // ensures players are inside field, if not sets them on the side they wanted to "escape"

    if(player.pos <= 0 + field.marginTB) {
        player.pos = 0 + field.marginTB;
        return;
    }
    
    if(player.pos + player.length >= ctx.canvas.height - field.marginTB) {
        player.pos = ctx.canvas.height - field.marginTB - player.length;
        return;
    }
}

const playerCollide = (player) =>{

    // player 1
    if(player.side === 'left') {
        if(ball.pos.x - ball.radius <= 0 + field.marginRL + player.width) { // ball would touch bar on the side
            if(ball.pos.y + ball.radius > player.pos && ball.pos.y - ball.radius < player.pos + player.length) { // ball "inside" player
                return true;
            }
        }
    }

    // player 2
    if(player.side === 'right') {
        if(ball.pos.x + ball.radius >= ctx.canvas.width - field.marginRL - player.width) {
            if(ball.pos.y + ball.radius > player.pos && ball.pos.y - ball.radius < player.pos + player.length) {
                return true;
            }
        }
    }

    return false;
}

const playerCollided = (player) => {

    if(ball.useTouchSpeedup) {
        ball.speed += ball.touchSpeedup;
    }
    player.botFollow = false;
}

// Bot

const moveBot = (player) => {

    if(player.side === 'left') {
        if(ball.pos.x < player.botThreshold + field.marginRL + player.width) {
            player.botFollow = true;
            player.botNextPos = ball.pos.y - (player.length / 2)
            player.botThreshold = -1000; // outside playingfield 
        }
    }

    if(player.side === 'right') {
        if(ball.pos.x > ctx.canvas.width - (player.botThreshold +  field.marginRL + player.width)) {
            player.botFollow = true;
            player.botNextPos = ball.pos.y - (player.length / 2)
            player.botThreshold = -1000; // outside playingfield 
        }
    }

    if(player.botFollow === true) {

        if(player.pos - 2 > player.botNextPos) {
            player.pos -= player.speed;
        }
        else if (player.pos + 2 < player.botNextPos) {
            player.pos += player.speed;
        }
    }
}

const calcBotTheshold = (player) => {
    player.botThreshold = (Math.round(Math.random() * (player.botSkill * ctx.canvas.width) - 20)) + (field.marginRL + player.width + ball.radius) + 20;
}

// Ball

const resetSpeed = () => {
    ball.speed = ball.originalSpeed;
    ball.prevPointSpeed = ball.speed;
}


//-----GAME INPUT------------------------

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
        field.infoText = '';
        return;
    }

    // moving player
    let starting = false;
    // activating the inputs for continuous input
    if (playerOne.type === 'human') {
        if(event.code === playerOne.upkey) {
            playerOne.upkeyPressed = true;
            starting = true;
        }
        
        if(event.code === playerOne.downkey) {
            playerOne.downkeyPressed = true;
            starting = true;
        }
    }

    if(playerTwo.type === 'human') {
        if(event.code === playerTwo.upkey) {
            playerTwo.upkeyPressed = true;
            starting = true;
        }

        if(event.code === playerTwo.downkey) {
            playerTwo.downkeyPressed = true;
            starting = true;
        }
    }

    if(playerOne.type === 'bot' && playerTwo.type === 'bot') {
        starting = true;
    }

    if(paused && starting) {
        started = true;
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

//-----UI INPUT--------------------------

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
    field.infoText = `Press Key to set the ${awaitKeyInput.type}-key for ${awaitKeyInput.player.name}!`;
}

const setPointSpeedup = (event) => {
    ball.usePointSpeedup = event.target.selected;
}

const setTouchSpeedup = (event) => {
    ball.useTouchSpeedup = event.target.selected;
}

const resetPoints = () => {
    playerOne.points = 0;
    playerTwo.points = 0;
}
//-----HELPERS---------------------------

const init = () => {

    // often used elemets
    ctx = document.getElementById("playingfield").getContext("2d", {alpha: true});
    p1Score = document.getElementById('player-1-score-label');
    p2Score = document.getElementById('player-2-score-label');
    infoLabel = document.getElementById('info-label');

    // setting up toggles
    const pointSpeedupSwitch = document.getElementById('point-speedup');
    pointSpeedupSwitch.addEventListener('change', setPointSpeedup);
    pointSpeedupSwitch.selected = ball.usePointSpeedup;

    const touchSpeedupSwitch = document.getElementById('touch-speedup');
    touchSpeedupSwitch.addEventListener('change', setTouchSpeedup);
    touchSpeedupSwitch.selected = ball.useTouchSpeedup;

    // centering players
    playerOne.pos = ctx.canvas.height / 2 - playerOne.length / 2;
    playerTwo.pos = ctx.canvas.height / 2 - playerTwo.length / 2;

    // speed control
    ball.prevPointSpeed = ball.speed;
    ball.originalSpeed = ball.speed;

    startScreen();

    window.requestAnimationFrame(update);
}

const randomDirection = () => {
    return Math.random() >= 0.5 ? 1 : -1;
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

window.addEventListener('load', init);
window.addEventListener('keydown', onKeyDown);
window.addEventListener('keyup', onKeyUp);
