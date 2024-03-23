const CANVAS = document.querySelector("canvas")
const CONTEXT = CANVAS.getContext("2d")

CANVAS.width = 400, CANVAS.height = 700

const INSTRUCTIONS = document.getElementById("instructions")
const GAME_OVER = document.getElementById("gameover")
const POINT_BOX = document.querySelector(".pointBox")
const POINT_TEXT = document.getElementById("point")
let POINT_INT = parseInt(POINT_TEXT.innerHTML)

///////////////////////////////////////

const GRAVITY = .3

let pipeAndFloorVelocity = -2.25
let rotation = 0
let alive = true
let start = false
let flag = false
let sounds = true

///////////////////////////////////////
//////////////////// assets

////// sprites

const BIRD_SPRITE = new Image()
BIRD_SPRITE.src = "assets/sprites/birdHalf.png"

const FLOOR_SPRITE = new Image()
FLOOR_SPRITE.src = "assets/sprites/floor.png"

const PIPE_SPRITE = new Image()
PIPE_SPRITE.src = "assets/sprites/pipe.png"
const PIPE_SPRITE2 = new Image()
PIPE_SPRITE2.src = "assets/sprites/pipe2.png"

CANVAS.style.background = "url(assets/sprites/background-day.png)"
CANVAS.style.backgroundSize = "100% 100%"

////// sounds

const WING_SOUND = new Audio("assets/sounds/wing.wav")
WING_SOUND.volume = .15

const HIT_SOUND = new Audio("assets/sounds/hit.wav")
HIT_SOUND.volume = .15

const POINT_SOUND = new Audio("assets/sounds/point.wav")
POINT_SOUND.volume = .15

const DIE_SOUND = new Audio("assets/sounds/die.wav")
DIE_SOUND.volume = .3

///////////////////////////////////////
//////////////////// playerClass

let i = 1
let t = ""

setInterval(function() {

    if (alive) { i += 1 } else { i = 1 }

         if (i == 1) { t = "birdHalf" }
    else if (i == 2) { t = "birdDown" }
    else if (i == 3) { t = "birdUp"   }

    BIRD_SPRITE.src = "assets/sprites/" + t + ".png" 

    if (i >= 3) { i = 1 }

}, 75)

class Player {
    constructor() {
        this.x = CANVAS.width / 3, this.y = CANVAS.height / 2
        this.r = CANVAS.width / 16
        this.vx = 0, this.vy = 0
        this.c = "gold"
    }

    draw() {
        CONTEXT.save()

        CONTEXT.translate(this.x, this.y)
        CONTEXT.rotate(rotation)
        CONTEXT.beginPath()
        CONTEXT.arc(
            this.x,
            this.y,
            this.r,
            0,
            2 * Math.PI
        )
        CONTEXT.drawImage(BIRD_SPRITE, -this.r, -this.r, this.r * 2, this.r * 2)

        CONTEXT.restore()
    }


    update() {
        this.draw()

        this.x += this.vx, this.y += this.vy

        if (this.y + this.r <= FLOOR.y && start) {

            this.vy += GRAVITY

        } else if (start) {

            if (sounds) { HIT_SOUND.play() }

            setTimeout(function() { HIT_SOUND.pause(), sounds = false }, 500)

            pipeStorage.forEach(PIPE2 => { PIPE2.vx = 0 })

            this.vy = 0
            pipeAndFloorVelocity = 0
            FLOOR.vx = 0
            alive = false

        }

        if (this.y + this.r <= 0) {

            this.vy = 0

            if (sounds) { HIT_SOUND.play() }

            setTimeout(function() { HIT_SOUND.pause(), sounds = false }, 500)

            pipeAndFloorVelocity = 0

            pipeStorage.forEach(PIPE2 => { PIPE2.vx = 0 })

            FLOOR.vx = 0
            alive = false

        }
    }
}

const PLAYER = new Player()

///////////////////////////////////////
//////////////////// floorClass

class Floor {
    constructor() {
        this.x = 0, this.y = CANVAS.height - CANVAS.height / 8
        this.w = CANVAS.width * 2, this.h = CANVAS.height / 8
        this.vx = pipeAndFloorVelocity
        this.c = "green"
    }

    draw() {
        CONTEXT.fillRect(
            this.x,
            this.y,
            this.w,
            this.h
        )
        CONTEXT.drawImage(FLOOR_SPRITE, this.x, this.y, this.w, this.h)
    }

    update() {
        this.draw()

        this.x += this.vx

        if (this.x + this.w / 2 < 0) { this.x = 0 }
    }
}

const FLOOR = new Floor()

///////////////////////////////////////
//////////////////// pipeClass

let pipeStorage = []

class Pipe {
    constructor( x, y, vx, w, h, c, s ) {
        this.x = x, this.y = y
        this.vx = vx
        this.w = w, this.h = h
        this.c = c
        this.s = s

        this.pt = {
            x: this.x, y: this.y + this.h,
            w: this.w / 8, h: this.h / 2,
            c: "red"
        }
    }

    draw() {
        CONTEXT.drawImage(this.s, this.x, this.y, this.w, this.h)
    }

    update() {
        this.draw()

        this.x += this.vx

        this.pt.x = this.x + this.w, this.pt.y = this.y / 2

        if (PLAYER.x + PLAYER.r >= this.pt.x
         && PLAYER.x - PLAYER.r <= this.pt.x + this.pt.w
         && PLAYER.y + PLAYER.r >= this.pt.y
         && PLAYER.y - PLAYER.r <= this.pt.y + this.pt.h) {

            this.pt.w = 0, this.pt.h = 0
            POINT_SOUND.play()
            POINT_INT += 1
            POINT_TEXT.innerHTML = POINT_INT

        }

        if (PLAYER.x + PLAYER.r >= this.x
         && PLAYER.x - PLAYER.r <= this.x + this.w
         && PLAYER.y + PLAYER.r >= this.y
         && PLAYER.y - PLAYER.r <= this.y + this.h) {
      
            pipeAndFloorVelocity = 0 

            if (sounds) { HIT_SOUND.play(), DIE_SOUND.play() }
            
            setTimeout(function() { HIT_SOUND.pause(), sounds = false }, 500)

            setTimeout(function() { DIE_SOUND.pause() }, 1000)

            pipeStorage.forEach(PIPE2 => { PIPE2.vx = 0 })

            FLOOR.vx = 0
            alive = false
      
            }
    }
}

function spawnPipes() {

    let yRandom = Math.floor(Math.random() * CANVAS.height / 2 + 1)

    let X = CANVAS.width, Y = (-CANVAS.height / 1.75 / 2) + yRandom / 2
    let VX = pipeAndFloorVelocity
    let W = CANVAS.width / 5.25, H = CANVAS.height / 1.75
    let C = "green", S = PIPE_SPRITE

    let PIPE = new Pipe( X, Y, VX, W, H, C, S )
    pipeStorage.push(PIPE)

    let X2 = CANVAS.width, Y2 =  PIPE.y + PIPE.h * 1.4
    let VX2 = pipeAndFloorVelocity
    let W2 = CANVAS.width / 5.25, H2 = CANVAS.height / 1.75
    let C2 = "green", S2 = PIPE_SPRITE2

    let PIPE2 = new Pipe( X2, Y2, VX2, W2, H2, C2, S2 )
    pipeStorage.push(PIPE2)

}

function startPipes() {

    setInterval(() => { spawnPipes() }, 1500)
    
}

///////////////////////////////////////
//////////////////// mainLoop

function mainLoop() {
    requestAnimationFrame(mainLoop)
    CONTEXT.clearRect(0, 0, CANVAS.width, CANVAS.height)

    if (start) {

        if (!flag) { 
            
            startPipes()

            flag = true

            INSTRUCTIONS.style.animation = "removeInstructions .5s forwards linear"
        
        }

        POINT_BOX.style.display = "flex"

    }

    pipeStorage.forEach(PIPE => { PIPE.update() })    
    PLAYER.update()
    FLOOR.update()

    if (alive == false) { 
        
        GAME_OVER.style.animation = "showGameOver .75s forwards" 
        POINT_BOX.style.display = "none"

    }

    if (rotation <= 1.45 && start && alive) { rotation += 0.03 }
}

mainLoop()

///////////////////////////////////////
//////////////////// gameControls

addEventListener("keydown", evt => {

    if (evt.key == " "  && alive
        || evt.key == "W" && alive
        || evt.key == "w" && alive
        || evt.key == "ArrowUp" && alive) {

        PLAYER.vy = -6.5
        rotation = -1
        start = true

        WING_SOUND.play()
    }

    if (evt.key == "r") { CONTEXT.clearRect(0, 0, CANVAS.width, CANVAS.height); }
})

document.querySelector(".container").onclick = function() {

    if (alive) { 
        
        PLAYER.vy = -6.5
        rotation = -1
        start = true

        WING_SOUND.play()

    }

}
