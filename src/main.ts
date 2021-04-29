class Vector {
    x: number = null;
    y: number = null;

    constructor(x: number, y: number) {
        this.x  = x;
        this.y = y;
    }
}

function random(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

class Particle{
    chance: number = 0.03;

    pos: Vector = null;
    velocity: Vector = null;
    old_positions: Vector[] = null;
    hue: number = null;
    size: number = null;
    is_rocket: boolean = null;

    constructor(position: Vector, hue: number = random(1, 360), is_rocket: boolean = true) {
        this.pos = position;
        this.old_positions = [this.pos, this.pos];
        this.hue = hue;
        this.is_rocket = is_rocket;

        if (this.is_rocket) {
            this.velocity = new Vector(random(-3, 3), random(-7, -3));
        } else {
            let angle = random(0, Math.PI * 2);
            let speed = Math.cos(random(0, Math.PI * 2)) * 2;
            this.velocity = new Vector(Math.cos(angle) * speed, Math.sin(angle) * speed);
        }

        this.size = 5;
    }

    shouldRemove(): boolean {
        if (this.size <= 1) {
            return true;
        }
        return false;
    }

    clone(): Particle {
        return new Particle(new Vector(this.pos.x, this.pos.y), this.hue, false);
    }

    shouldExplode(max_ex_height: number, min_ex_height: number): boolean {
        if (!this.is_rocket) {
            return false;
        }

        if (this.pos.y <= max_ex_height) {
            return true;
        }

        if (this.pos.y >= min_ex_height) {
            return false;
        }

        return random(0, 1) <= this.chance;
    }

    update(): void {
        this.old_positions.pop();
        this.old_positions.unshift(new Vector(this.pos.x, this.pos.y));
        this.pos.x += this.velocity.x;
        this.pos.y += this.velocity.y;

        if(!this.is_rocket) {
            this.size *= 0.96;
        }
    }

    draw(context: CanvasRenderingContext2D): void {
        const oldest_position = this.old_positions[this.old_positions.length - 1];
        context.beginPath();
        context.moveTo(oldest_position.x, oldest_position.y);
        context.lineTo(this.pos.x, this.pos.y);
        context.lineWidth = this.size;
        context.lineCap = 'round';
        context.strokeStyle = `hsla(${this.hue}, 100%, 50%, 1)`;
        context.stroke();
    }
}

class Firework {
    particles_per_rocket = 100;
    rocket_spawn_interval = 150;
    max_rockets = 10;
    rockets = 0;

    context: CanvasRenderingContext2D = null;
    public particles: Particle[] = [];

    constructor(context: CanvasRenderingContext2D) {
        this.context = context;

        window.setInterval(() => this.spawnRockets(), this.rocket_spawn_interval);
    }

    remove(particle: Particle): void{
        let i = this.particles.indexOf(particle);
        this.particles.splice(i, 1);
    }

    update(context: CanvasRenderingContext2D): void {
        for (let particle of this.particles) {
            particle.draw(context);
            particle.update();

            if (particle.shouldRemove()) {
                this.remove(particle);
            } else if (particle.shouldExplode(this.context.canvas.height * (0.1), this.context.canvas.height * (0.8))) {
                this.explode(particle);
            }
        }
    }

    explode(particle: Particle): void {
        for (let i = 0; i < this.particles_per_rocket; i += 1) {
            this.particles.push(particle.clone());
        }
        this.remove(particle);
        this.rockets--;
    }

    on_click_explosion(x: number ,y: number): void {
        for (let i = 0; i < this.particles_per_rocket; i += 1) {
            this.particles.push(new Particle(new Vector(x, y), random(1, 360), false));
        }
    }

    spawnRocket(): void {
        this.rockets++;
        this.particles.push( new Particle(new Vector(random(0, this.context.canvas.width), this.context.canvas.height)));
    }

    spawnRockets(): void {
        if (this.rockets < this.max_rockets) {
            this.spawnRocket();
        }
    }
}

const canvas: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;
const context: CanvasRenderingContext2D = canvas.getContext('2d');
const fireworks: Firework = new Firework(context);

function startApp() {
    update();
    canvas.addEventListener("mousedown", pressEventHandler);
}
startApp();

function draw(){
    // Make sure canvas covers the whole screen
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    context.font = "30px Arial";
    context.fillStyle = "White";
    context.textAlign = "center";

    context.fillText("Happy birthday gotoAndPlay!!!", canvas.width/2, canvas.height/2);
}

function update(){
    draw();
    fireworks.update(context);
    requestAnimationFrame(update);
}

function pressEventHandler(e: MouseEvent){
    fireworks.on_click_explosion(e.x, e.y);
}
