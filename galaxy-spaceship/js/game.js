function randomBetween(min, max) {
    return min + Math.random() * (max - min);
}

// Places planets at random spots, retrying any spot that would overlap an existing planet
function createRandomPlanets(width, height, count = 10, safeZone = null) {
    const MIN_RADIUS = 15;
    const MAX_RADIUS = 45;
    const MIN_MASS = 2000;
    const MAX_MASS = 10000;
    const GAP = 20;            // minimum space between glow rings (and from planet surface to screen edge)
    const MAX_ATTEMPTS = 1000; // stop retrying if the canvas is too small to fit them all

    const planets = [];
    let attempts = 0;

    while (planets.length < count && attempts < MAX_ATTEMPTS) {
        attempts++;

        const radius = randomBetween(MIN_RADIUS, MAX_RADIUS);
        const pos = new Vector2D(
            randomBetween(radius + GAP, width - radius - GAP),
            randomBetween(radius + GAP, height - radius - GAP)
        );

        // keep the ship's start area clear so it doesn't spawn inside (or right next to) a planet
        if (safeZone) {
            const minDist = safeZone.radius + radius;
            if (safeZone.center.subtract(pos).magnitudeSquared() < minDist * minDist) continue;
        }

        // compare glow rings (not just bodies) so no planet or ring crosses another one
        const overlaps = planets.some(p => {
            const minDist = (p.radius + radius) * Planet.GLOW_SCALE + GAP;
            return p.position.subtract(pos).magnitudeSquared() < minDist * minDist;
        });
        if (overlaps) continue;

        const mass = randomBetween(MIN_MASS, MAX_MASS);
        const color = `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`;
        planets.push(new Planet(pos.x, pos.y, new Vector2D(0, 0), mass, radius, color));
    }

    if (planets.length < count) {
        console.warn(`Only ${planets.length} of ${count} planets fit on a ${width}x${height} canvas`);
    }

    return planets;
}

// Mission target — ship နဲ့ အဝေးဆုံး ဂြိုဟ် (သိပ်မသေးတာ) ကို ရွေး၊ ဒီဂြိုဟ်ကို ရောက်ရင် ဂိမ်းနိုင်
function chooseTargetPlanet(planets, shipPos) {
    const MIN_TARGET_RADIUS = 25;   // သေးလွန်းရင် ထိဖို့ ခက်လွန်းလို့
    const bigEnough = planets.filter(p => p.radius >= MIN_TARGET_RADIUS);
    const candidates = bigEnough.length > 0 ? bigEnough : planets;
    if (candidates.length === 0) return null;

    const distSq = p => p.position.subtract(shipPos).magnitudeSquared();
    const target = candidates.reduce((far, p) => (distSq(p) > distSq(far) ? p : far));
    target.isTarget = true;
    return target;
}

function startSpaceshipSimulationGame(canvas) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // canvas မှာ y = 0 က အပေါ်ဆုံး — အောက်ထောင့်လိုချင်ရင် height ကနေ နုတ်ရတယ်
    const ship = new Spaceship(width * 0.1, height * 0.9, 10);

    // ဂြိုဟ်အသစ်တွေ + target အသစ် (ဂိမ်းစတုန်းနဲ့ R နှိပ်တိုင်း)
    let planets = [];
    function newGalaxy() {
        planets = createRandomPlanets(width, height, 15, { center: ship.startPos, radius: 120 });
        chooseTargetPlanet(planets, ship.startPos);
    }
    newGalaxy();

    const statusEl = document.getElementById('status');
    function setStatus(text) {
        if (statusEl.textContent !== text) statusEl.textContent = text;   // ပြောင်းမှပဲ DOM ကို ထိ
    }

    // ဂိမ်းပြီးရင် (နိုင် / ရှုံး) canvas အပေါ်အလယ်မှာ ပြမယ့် card
    // (target က ship နဲ့ အဝေးဆုံး — များသောအားဖြင့် ညာဘက်မှာ ရှိလို့ ဆင်းသက်တဲ့နေရာကို မဖုံးမိအောင် အပေါ်မှာ ထား)
    function drawBanner(title, subtitle, color) {
        const TITLE_FONT = 'bold 26px sans-serif';
        const SUBTITLE_FONT = '15px sans-serif';

        ctx.save();
        ctx.font = TITLE_FONT;
        const titleWidth = ctx.measureText(title).width;
        ctx.font = SUBTITLE_FONT;
        const boxWidth = Math.max(titleWidth, ctx.measureText(subtitle).width) + 48;
        const boxX = (width - boxWidth) / 2;
        const boxY = 20;

        ctx.fillStyle = 'rgba(18, 20, 30, 0.92)';
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxWidth, 84, 10);
        ctx.fill();
        ctx.stroke();

        ctx.textAlign = 'center';
        ctx.fillStyle = color;
        ctx.font = TITLE_FONT;
        ctx.fillText(title, width / 2, boxY + 38);
        ctx.fillStyle = '#c8ccd8';
        ctx.font = SUBTITLE_FONT;
        ctx.fillText(subtitle, width / 2, boxY + 64);
        ctx.restore();
    }

    // Mission အခြေအနေ — TARGET ဂြိုဟ်ကို ရောက်ရင် နိုင်၊ တခြားဂြိုဟ်ကို ထိရင် ရှုံး
    function updateMissionStatus() {
        if (!ship.isLaunched) setStatus('Status: Ready — land on the TARGET planet');
        else if (!ship.crashed) setStatus('Status: Flying...');
        else if (ship.hitPlanet.isTarget) setStatus('Status: Mission complete! 🎉');
        else setStatus('Status: Crashed — press R to try again');
    }

    function drawMissionResult() {
        if (!ship.crashed) return;
        if (ship.hitPlanet.isTarget) drawBanner('Mission Complete!', 'You reached your home planet. Press R to fly again.', '#7ee08a');
        else drawBanner('Mission Failed', 'You landed on the wrong planet. Press R to try again.', '#ff7b72');
    }

    const AIM_SCALE = 0.25;
    const MAX_SPEED = 40;

    let aimVel = null; // null = not aiming

    function mouseToCanvas(event) {
        const rect = canvas.getBoundingClientRect();
        return new Vector2D(
            event.clientX - rect.left,
            event.clientY - rect.top
        );
    }

    function aimVectorFromMouse(event) {
        const mousePos = mouseToCanvas(event);
        const aimVector = mousePos.subtract(ship.pos).multiply(AIM_SCALE);

        // Limit the speed of the aim vector
        if (aimVector.magnitude() > MAX_SPEED) {
            return aimVector.normalize().multiply(MAX_SPEED);
        }

        return aimVector;
    }

    canvas.addEventListener('pointerdown', e => {
        if (ship.isLaunched) return;
        canvas.setPointerCapture(e.pointerId);
        aimVel = aimVectorFromMouse(e);
    });
    canvas.addEventListener('pointermove', e => {
        if (aimVel) aimVel = aimVectorFromMouse(e);
    });
    canvas.addEventListener('pointerup', () => {
        if (aimVel) ship.launch(aimVel);
        aimVel = null;
    });
    canvas.addEventListener('pointercancel', () => {
        aimVel = null;
    });
    window.addEventListener('keydown', e => {
        if (e.key === 'r' || e.key === 'R') {
            ship.reset();
            newGalaxy();
            aimVel = null;
        }
    });

    // ---- Fixed timestep ----
    // Physics ကို dt ပုံသေ (SIM_DT) နဲ့ပဲ run ပြီး တစ်စက္ကန့်ကို STEPS_PER_SECOND လှမ်း
    // အတိအကျ ဖြစ်အောင် run တဲ့ အကြိမ်ရေကို ညှိတယ်
    //   → FPS ဘယ်လောက်ပဲဖြစ်ဖြစ် ship အမြန်နှုန်း တူတယ်
    //   → dt ပုံသေမို့ predictTrajectory() နဲ့ ပျံသန်းမှုအစစ် အတိအကျ ကိုက်တယ်
    const STEP_TIME = 1 / Spaceship.STEPS_PER_SECOND;   // physics တစ်လှမ်း = အချိန်အစစ် ဘယ်နှစက္ကန့်
    let accumulator = 0;

    let lastTime = performance.now();

    function gameLoop(now) {
        // tab ပြောင်းပြီး ပြန်လာရင် အချိန်အများကြီး တစ်ခါတည်း မ run အောင် 0.25 စက္ကန့်နဲ့ ကန့်သတ်
        accumulator += Math.min((now - lastTime) / 1000, 0.25);
        lastTime = now;

        // 60 FPS ဆို frame တစ်ခါ ~1 လှမ်း၊ 30 FPS ဆိຯ ~2 လ຾ມີ້၊ 120 FPS ဆີ້ ~2 frame ເປັນ 1 ລ຾ມີ້
        while (accumulator >= STEP_TIME) {
            ship.update(planets);        // dt = Spaceship.SIM_DT အမြဲ
            accumulator -= STEP_TIME;
        }

        updateMissionStatus();

        ctx.clearRect(0, 0, width, height);

        // gravity မြှားလေးတွေကို အရင်ဆုံး ဆွဲ — ship၊ ဂြိုဟ်၊ aim path တွေ အောက်မှာ ရှိနေအောင်
        for (const p of planets) p.drawGravityField(ctx, now / 1000);

        // ဆင်းသက်ပြီး rocket ကို ဂြိုဟ်တွေ မဆွဲခင် ဆွဲ — အောက်ခြေ နည်းနည်းက ဂြိုဟ်နောက်ကွယ်သွားပြီး fin တွေက မျက်နှာပြင်ပေါ် ရပ်နေသလို ဖြစ်တယ်
        if (ship.crashed) ship.draw(ctx);
        for (const p of planets) p.draw(ctx);

        if (aimVel) {
            // rocket ကို aim ဦးတည်ရာ လှည့် (mouse က ship ပေါ် တည့်တည့်ဆိုရင် ဦးတည်ရာ မရှိလို့ မလှည့်)
            if (aimVel.magnitudeSquared() > 0) ship.angle = aimVel.heading();
            ship.drawTrajectory(ctx, ship.predictTrajectory(planets, 100, aimVel));
            drawAimArrow(ctx, ship.pos, aimVel.multiply(1 / AIM_SCALE));
        }
        if (!ship.crashed) ship.draw(ctx);

        drawMissionResult();

        requestAnimationFrame(gameLoop);
    }

    requestAnimationFrame(gameLoop);
}

// Size the canvas to fill its game window (the framed box under the text bar) before starting,
// since the game reads canvas.width/height
const canvas = document.getElementById('gameCanvas');
canvas.width = canvas.parentElement.clientWidth;
canvas.height = canvas.parentElement.clientHeight;
startSpaceshipSimulationGame(canvas);
