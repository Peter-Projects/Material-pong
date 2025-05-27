const playerOne = {
    pos: 30,
    points: 0,
    type: "human",
    length: 15,
    width: 10,
};

const playerTwo = {
    pos: 0,
    points: 0,
    type: "human",
    length: 15,
    width: 10,   
};

let ctx;
const update = () => {
    
}

const draw = () => {

    ctx.clearRect(0,0, ctx.widht, ctx.height);
    ctx.fillStyle = "red";
    ctx.strokeStyle = "red";

    ctx.stroke();
    ctx.fill();
    window.requestAnimationFrame(draw);
}


const init = () => {
    ctx = document.getElementById("canvas").getContext("2d", {alpha: true})
    window.requestAnimationFrame(draw);
}

window.addEventListener("load", init);