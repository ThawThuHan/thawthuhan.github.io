// Rocket ပုံ — load မပြီးသေးခင်မှာ draw() က စက်ဝိုင်းနဲ့ ဆွဲထားတယ်
const SHIP_IMAGE = new Image();
SHIP_IMAGE.src = 'images/spaceship.png';

// ဂြိုဟ်ကို ထိပြီး ဆင်းသက်သွားတဲ့အခါ သုံးမယ့် ပုံ
const LANDED_IMAGE = new Image();
LANDED_IMAGE.src = 'images/landed_spaceship.png';

class Spaceship {
    // physics တစ်လှမ်းရဲ့ dt — update() နဲ့ predictTrajectory() တူနေမှ prediction မှန်မယ်
    static SIM_DT = 0.16;
    // တစ်စက္ကန့်မှာ physics ဘယ်နှလှမ်း run မလဲ (FPS နဲ့ မဆိုင်)
    static STEPS_PER_SECOND = 60;

    // ပုံထဲမှာ rocket nose က ညာဘက်အပေါ် (-45°) ကို ညွှန်နေတယ်
    static SPRITE_ANGLE = -Math.PI / 4;
    // ပုံထဲက ကိုယ်ထည် အလယ်ကနေ ဘေးအစွန်းထိ (image pixel) — ဒါကို this.radius နဲ့ ညီအောင် scale ချတယ်
    static SPRITE_RADIUS = 400;
    // this.pos နဲ့ ကိုက်မယ့် ပုံထဲက နေရာ — nose ထိပ် (2338, 54) ကနေ SPRITE_RADIUS နောက်ဆုတ်ထားတယ်
    // ဒါမှ nose ထိပ်က collision circle အစွန်းမှာ ကျပြီး ဂြိုဟ်ကို ထိရင် မျက်နှာပြင်မှာပဲ ရပ်မယ်
    static SPRITE_PIVOT = new Vector2D(2055, 337);

    // landed_spaceship.png — ပုံထဲမှာ nose က အပေါ် (-90°) ကို ညွှန်နေတယ်
    static LANDED_ANGLE = -Math.PI / 2;
    // ကိုယ်ထည် အလယ်ကနေ ဘေးအစွန်းထိ (image pixel) — ပျံနေတဲ့ rocket နဲ့ အရွယ်တူအောင် this.radius နဲ့ ညီအောင် scale ချတယ်
    static LANDED_RADIUS = 122;
    // အောက်ခြေ အလယ် (image pixel) — ဒီနေရာကို ဂြိုဟ်မျက်နှာပြင်ပေါ် ချတယ်
    static LANDED_BASE = new Vector2D(299, 600);
    // အလယ်ကနေ fin ထိပ်ထိ (image pixel) — ဂြိုဟ်က ကွေးနေလို့ fin ထိပ်တွေ ထိအောင် ဘယ်လောက် နှိမ့်ရမလဲ တွက်ဖို့
    static LANDED_FIN_HALF_SPAN = 155;

    constructor(x, y, radius) {
        this.startPos = new Vector2D(x, y);
        this.pos = new Vector2D(x, y);
        this.vel = new Vector2D(0, 0);
        this.radius = radius;
        this.angle = Spaceship.SPRITE_ANGLE;   // rocket ညွှန်နေတဲ့ ဦးတည်ရာ (radian)
        this.isLaunched = false;
        this.crashed = false;
        this.hitPlanet = null;
        this.trail = [];
    }

    launch(velocity) {
        this.vel = velocity;
        this.isLaunched = true;
    }

    reset() {
        this.pos = new Vector2D(this.startPos.x, this.startPos.y);
        this.vel = new Vector2D(0, 0);
        this.angle = Spaceship.SPRITE_ANGLE;
        this.isLaunched = false;
        this.crashed = false;
        this.hitPlanet = null;
        this.trail = [];
    }

    update(planets, dt = Spaceship.SIM_DT) {
        if (!this.isLaunched || this.crashed) return;

        const totalAcc = totalGravity(planets, this.pos);

        const { newPos, newVel } = physicsStep(this.pos, this.vel, totalAcc, dt);

        // collision detection — step တစ်ခုလုံးရဲ့ လမ်းကြောင်းကို စစ်ပြီး ထိတဲ့နေရာမှာ ရပ် (ဂြိုဟ်ထဲ မဝင်/မဖြတ်အောင်)
        const hit = findFirstCollision(planets, this.pos, newPos, this.radius);
        if (hit) {
            this.pos = hit.point;
            this.crashed = true;
            this.hitPlanet = hit.planet;
            this.trail = [];
        } else {
            this.pos = newPos;
            this.vel = newVel;
            this.angle = newVel.heading();     // rocket ကို သွားနေတဲ့ ဦးတည်ရာ လှည့်
        }

        // trail update
        this.trail.push(new Vector2D(this.pos.x, this.pos.y));
        if (this.trail.length > 10) {
            this.trail.shift();
        }
    }

    predictTrajectory(planets, steps = 100, launchVel, dt = Spaceship.SIM_DT) {
        let tempPos = new Vector2D(this.pos.x, this.pos.y);
        let tempVel = new Vector2D(launchVel.x, launchVel.y);
        const trajectory = [];

        for (let i = 0; i < steps; i++) {
            const totalAcc = totalGravity(planets, tempPos);
            const { newPos, newVel } = physicsStep(tempPos, tempVel, totalAcc, dt);

            // collision detection — ထိတဲ့နေရာမှာ path ကို ရပ်
            const hit = findFirstCollision(planets, tempPos, newPos, this.radius);
            if (hit) {
                trajectory.push(hit.point);
                break;
            }

            trajectory.push(newPos);
            tempPos = newPos;
            tempVel = newVel;
        }

        return trajectory;
    }

    draw(ctx) {
        ctx.save();

        // Trail
        if (this.trail.length > 1) {
            ctx.strokeStyle = 'rgba(0, 210, 211, 0.5)';
            ctx.lineWidth = 2;
            ctx.lineJoin = 'round';
            ctx.beginPath();
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for (const p of this.trail) ctx.lineTo(p.x, p.y);
            ctx.stroke();
        }

        if (this.crashed && this.hitPlanet && LANDED_IMAGE.complete && LANDED_IMAGE.naturalWidth > 0) {
            // ဆင်းသက်ပြီး rocket — ဂြိုဟ်ဗဟိုကနေ အပြင်ဘက် မတ်မတ်ရပ်ပြီး fin ထိပ်တွေက ဂြိုဟ်မျက်နှာပြင်ကို ထိတယ်
            const planet = this.hitPlanet;
            const scale = this.radius / Spaceship.LANDED_RADIUS;
            const up = this.pos.subtract(planet.position).normalize();   // ဂြိုဟ်ကနေ အပြင်ဘက် ဦးတည်ရာ
            // ဂြိုဟ်က ကွေးနေလို့ fin ထိပ်တွေ ထိအောင် အောက်ခြေကို နည်းနည်း နှိမ့်တယ်
            // (နှိမ့်တဲ့ အပိုင်းက ဂြိုဟ်နောက်ကွယ်မှာ — game.js က ဒီ rocket ကို ဂြိုဟ်တွေ မဆွဲခင် ဆွဲတယ်)
            const finHalf = Spaceship.LANDED_FIN_HALF_SPAN * scale;
            const sink = planet.radius - Math.sqrt(Math.max(planet.radius ** 2 - finHalf ** 2, 0));
            const ground = planet.position.add(up.multiply(planet.radius - sink));
            ctx.translate(ground.x, ground.y);
            ctx.rotate(up.heading() - Spaceship.LANDED_ANGLE);
            ctx.scale(scale, scale);
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(LANDED_IMAGE, -Spaceship.LANDED_BASE.x, -Spaceship.LANDED_BASE.y);
        } else if (SHIP_IMAGE.complete && SHIP_IMAGE.naturalWidth > 0) {
            // Rocket ပုံ — pos ကို pivot ထား၊ angle အတိုင်း လှည့်၊ ကိုယ်ထည် အကျယ် = collision circle ဖြစ်အောင် scale ချ
            const scale = this.radius / Spaceship.SPRITE_RADIUS;
            ctx.translate(this.pos.x, this.pos.y);
            ctx.rotate(this.angle - Spaceship.SPRITE_ANGLE);
            ctx.scale(scale, scale);
            ctx.imageSmoothingQuality = 'high';  // ပုံကြီးကို အများကြီး ချုံ့ရလို့
            if (this.crashed) ctx.globalAlpha = 0.5; // တိုက်မိရင် မှိန်
            ctx.drawImage(SHIP_IMAGE, -Spaceship.SPRITE_PIVOT.x, -Spaceship.SPRITE_PIVOT.y);
        } else {
            // ပုံ load မပြီးသေးခင် — စက်ဝိုင်း (တိုက်မိရင် မီးခိုးရောင်)
            ctx.fillStyle = this.crashed ? '#636e72' : '#ff9f43';
            ctx.beginPath();
            ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    drawTrajectory(ctx, path) {
        if (path.length === 0) return;

        ctx.save();
        ctx.strokeStyle = 'rgba(255, 159, 67, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(this.pos.x, this.pos.y);
        for (const p of path) ctx.lineTo(p.x, p.y);
        ctx.stroke();
        ctx.restore();
    }

}

function drawAimArrow(ctx, from, offset) {
    const to = from.add(offset);

    ctx.save();
    ctx.strokeStyle = '#378ADD';
    ctx.fillStyle = '#378ADD';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();

    // မြှားထိပ်: မြှားထိပ်ဆီ ရွှေ့ပြီး heading() ထောင့်အတိုင်း လှည့်ကာ တြိဂံဆွဲ
    ctx.translate(to.x, to.y);
    ctx.rotate(offset.heading());
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-10, -5);
    ctx.lineTo(-10, 5);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

