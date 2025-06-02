const playerOne = {
    pos: 30,
    points: 0,
    type: "human",
    length: 15,
    width: 10,
    speed: 2
};

const playerTwo = {
    pos: 0,
    points: 0,
    type: "human",
    length: 15,
    width: 10,
    speed: 2   
};

const ball = {
    pos: {
        x: 7,
        y: 7
    },
    speed: 2
}


let ctx;
let canvas;


const onKeyDown = (event) => {
    // console.log("Button pressed!");
    if(event.keyCode === 38) {
        playerOne.pos -= playerOne.speed;
        // console.log(`Pressed ${event.code}`);
    }
    
    if(event.keyCode === 40) {
        playerOne.pos += playerOne.speed;
    }
}


const update = () => {
    draw();
}


const draw = () => { 
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = "blue";
    ctx.fillRect(10, playerOne.pos , 10, 30);
    window.requestAnimationFrame(update);
}


const init = () => {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d", {alpha: true});
    window.requestAnimationFrame(update);
}

window.addEventListener("load", init);
window.addEventListener("keydown", onKeyDown);