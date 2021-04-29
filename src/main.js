class Vector {
    constructor(x, y) {
        this.x = null;
        this.y = null;
        this.x = x;
        this.y = y;
    }
}
function random(min, max) {
    return Math.random() * (max - min) + min;
}
class Particle {
    constructor(position, hue = random(1, 360), is_rocket = true) {
        this.chance = 0.03;
        this.pos = null;
        this.velocity = null;
        this.old_positions = null;
        this.hue = null;
        this.size = null;
        this.is_rocket = null;
        this.pos = position;
        this.old_positions = [this.pos, this.pos];
        this.hue = hue;
        this.is_rocket = is_rocket;
        if (this.is_rocket) {
            this.velocity = new Vector(random(-3, 3), random(-7, -3));
        }
        else {
            let angle = random(0, Math.PI * 2);
            let speed = Math.cos(random(0, Math.PI * 2)) * 2;
            this.velocity = new Vector(Math.cos(angle) * speed, Math.sin(angle) * speed);
        }
        this.size = 5;
    }
    shouldRemove() {
        if (this.size <= 1) {
            return true;
        }
        return false;
    }
    clone() {
        return new Particle(new Vector(this.pos.x, this.pos.y), this.hue, false);
    }
    shouldExplode(max_ex_height, min_ex_height) {
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
    update() {
        this.old_positions.pop();
        this.old_positions.unshift(new Vector(this.pos.x, this.pos.y));
        this.pos.x += this.velocity.x;
        this.pos.y += this.velocity.y;
        if (!this.is_rocket) {
            this.size *= 0.96;
        }
    }
    draw(context) {
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
    constructor(context) {
        this.particles_per_rocket = 100;
        this.rocket_spawn_interval = 150;
        this.max_rockets = 10;
        this.rockets = 0;
        this.context = null;
        this.particles = [];
        this.context = context;
        window.setInterval(() => this.spawnRockets(), this.rocket_spawn_interval);
    }
    remove(particle) {
        let i = this.particles.indexOf(particle);
        this.particles.splice(i, 1);
    }
    update(context) {
        for (let particle of this.particles) {
            particle.draw(context);
            particle.update();
            if (particle.shouldRemove()) {
                this.remove(particle);
            }
            else if (particle.shouldExplode(this.context.canvas.height * (0.1), this.context.canvas.height * (0.8))) {
                this.explode(particle);
            }
        }
    }
    explode(particle) {
        for (let i = 0; i < this.particles_per_rocket; i += 1) {
            this.particles.push(particle.clone());
        }
        this.remove(particle);
        this.rockets--;
    }
    on_click_explosion(x, y) {
        for (let i = 0; i < this.particles_per_rocket; i += 1) {
            this.particles.push(new Particle(new Vector(x, y), random(1, 360), false));
        }
    }
    spawnRocket() {
        this.rockets++;
        this.particles.push(new Particle(new Vector(random(0, this.context.canvas.width), this.context.canvas.height)));
    }
    spawnRockets() {
        if (this.rockets < this.max_rockets) {
            this.spawnRocket();
        }
    }
}
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const fireworks = new Firework(context);
function startApp() {
    update();
    canvas.addEventListener("mousedown", pressEventHandler);
}
startApp();
function draw() {
    // Make sure canvas covers the whole screen
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    context.font = "30px Arial";
    context.fillStyle = "White";
    context.textAlign = "center";
    context.fillText("Happy birthday gotoAndPlay!!!", canvas.width / 2, canvas.height / 2);
}
function update() {
    draw();
    fireworks.update(context);
    requestAnimationFrame(update);
}
function pressEventHandler(e) {
    fireworks.on_click_explosion(e.x, e.y);
}
//# sourceMappingURL=main.js.map