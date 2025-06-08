const playerOne = {

    // game
    pos: 50,
    points: 0,
    speed: 3,

    // appereance
    length: 80,
    width: 4,
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
    botNetxtPos: 0,
    botSkill: 0.2, // lower the better

    // internal
    reference: 'player-1',
    name: 'player one'
};

const playerTwo = {

    // game
    pos: 50,
    points: 0,
    speed: 3,

    // appereance
    length: 80,
    width: 4,
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
    botNetxtPos: 0,
    botSkill: 0.2,

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

    radius: 18,
    color: 'red',
    speed: 1,

    // speedup
    useTouchSpeedup: false,
    touchSpeedup: 0.1,
    pevTouchSpeed: 2,

    usePointSpeedup: false,
    pointSpeedup: 0.2,

    originalSpeed: 2
}

const field = {
    marginRL: 3,
    marginTB: 15,
    infoText: 'k'
}

const awaitKeyInput =  {
    state: false,
    player: playerOne,
    type: 'up' // or down
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
        field.infoText = '';
        return;
    }

    // starting game
    if(paused) {
        started = true;
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

const startGame = () => {
    field.infoText = '';

    ball.dir.x = randomDirection();
    ball.dir.y = randomDirection();

    started = false;
    paused = false;
}

const update = () => {

    if(started) {
        startGame();
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

    ball.pos.x += ball.dir.x * ball.speed;
    ball.pos.y += ball.dir.y * ball.speed;

    // player doesn't hit ball, point
    if(ball.pos.x - ball.radius <= 0) {
        playerTwo.points++;
        startScreen();
    }
    
    if(ball.pos.x + ball.radius >= ctx.canvas.width) {
        playerOne.points++;
        startScreen();
    }
    
    // ball bounces off top and bottom wall
    if(ball.pos.y + ball.radius >= ctx.canvas.height) {
        ball.dir.y = -1;
    }
    
    if(ball.pos.y - ball.radius <= 0) {
        ball.dir.y = 1;
    }

    // player hits ball
    if(playerCollide(playerOne)) {
        ball.dir.x = 1;
        if(ball.useTouchSpeedup) {
            ball.speed += ball.touchSpeedup;
        }
        playerOne.botFollow = false;
        calcBotTheshold(playerTwo);
        console.log('Player one collided');
    }
    if(playerCollide(playerTwo)) {
        ball.dir.x = -1;
        if(ball.useTouchSpeedup) {
            ball.speed += ball.touchSpeedup;
        }
        playerTwo.botFollow = false;
        calcBotTheshold(playerOne);
        console.log('Player two collided');

    }
    
    if(awaitKeyInput.state) {
        field.infoText = `Press Key to set the ${awaitKeyInput.type}-key for ${awaitKeyInput.player.name}!`;
    }

    fieldCheck(playerOne, 'all');
    fieldCheck(playerTwo, 'all');
    
    draw();
    window.requestAnimationFrame(update);
}

// ensures players are inside field, if not sets them on the side they wanted to "escape"
const fieldCheck = (player) => {
    
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

// gets called, when a point was made and when the game starts (loads)
const startScreen = () => {

    paused = true;

    // stopping ball
    ball.pos.x = ctx.canvas.width / 2;
    ball.pos.y = ctx.canvas.height / 2;
    ball.dir.x = 0;
    ball.dir.y = 0;

    field.infoText = 'To start game, press any key!';

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

const draw = () => {

    //-------CANVAS-------//
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

    // info
    if(field.infoText === '') {
        infoLabel.style.display = 'none';
        infoLabel.innerText = '';
    }
    else {
        infoLabel.style.display = 'inline';
        infoLabel.innerText = field.infoText;
    }
    
    //------DEBUG---------//
    if(debugShown) {
        document.getElementById('general-info').innerText = `Field margin RL: ${field.marginRL}
            Field margin TB: ${field.marginTB}`;
        document.getElementById('ball-info').innerText = `Speed: ${Math.round(ball.speed * 10) / 10}
            Pos: x:${Math.round(ball.pos.x * 10) / 10} y:${Math.round(ball.pos.y * 10) / 10}
            Direction: x${ball.dir.x} y:${ball.dir.y}
            Radius: ${ball.radius}\nUse touch speedup: ${ball.useTouchSpeedup}
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
            Skill: ${playerOne.botSkill}
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
            Skill: ${playerTwo.botSkill}
            `;
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

    if(player.side === 'left') {
        if(ball.pos.x < player.botThreshold + field.marginRL + player.width) {
            player.botFollow = true;
            player.botNetxtPos = ball.pos.y - (player.length / 2)
            player.botThreshold = -1000; // outside playingfield 
        }
    }

    if(player.side === 'right') {
        if(ball.pos.x > ctx.canvas.width - (player.botThreshold +  field.marginRL + player.width)) {
            player.botFollow = true;
            player.botNetxtPos = ball.pos.y - (player.length / 2)
            player.botThreshold = -1000; // outside playingfield 
        }
    }

    if(player.botFollow === true) {

        if(player.pos - 2 > player.botNetxtPos) {
            player.pos -= player.speed;
        }
        else if (player.pos + 2 < player.botNetxtPos) {
            player.pos += player.speed;
        }
    }
}

const calcBotTheshold = (player) => {
    player.botThreshold = Math.round(Math.random() * (player.botSkill * ctx.canvas.width));
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
