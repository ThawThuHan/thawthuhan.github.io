function randomBetween(min, max) {
    return min + Math.random() * (max - min);
}

// Places planets at random spots, retrying any spot that would overlap an existing planet
// sizeScale: shrinks planet sizes and gaps on small screens (phones) so more planets fit
function createRandomPlanets(width, height, count = 10, safeZone = null, sizeScale = 1) {
    const MIN_RADIUS = 15 * sizeScale;
    const MAX_RADIUS = 45 * sizeScale;
    const MIN_MASS = 2000;
    const MAX_MASS = 10000;
    const GAP = 20 * sizeScale; // minimum space between glow rings (and from planet surface to screen edge)
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
// minRadius: သေးလွန်းရင် ထိဖို့ ခက်လွန်းလို့
function chooseTargetPlanet(planets, shipPos, minRadius = 25) {
    const bigEnough = planets.filter(p => p.radius >= minRadius);
    const candidates = bigEnough.length > 0 ? bigEnough : planets;
    if (candidates.length === 0) return null;

    const distSq = p => p.position.subtract(shipPos).magnitudeSquared();
    const target = candidates.reduce((far, p) => (distSq(p) > distSq(far) ? p : far));
    target.isTarget = true;
    return target;
}

function startSpaceshipSimulationGame(canvas) {
    const ctx = canvas.getContext('2d');
    let width = 0;       // canvas အရွယ် (CSS pixel) — resize() က သတ်မှတ်တယ်
    let height = 0;
    let sizeScale = 1;   // screen သေးရင် ဂြိုဟ်တွေ ချုံ့ဖို့ — resize() က တွက်တယ်

    const ship = new Spaceship(0, 0, 10);   // စမယ့်နေရာကို resize() က ချတယ်

    // ဂြိုဟ်အသစ်တွေ + target အသစ် (ဂိမ်းစတုန်းနဲ့ R နှိပ်တိုင်း)
    let planets = [];
    function newGalaxy() {
        planets = createRandomPlanets(width, height, 15, { center: ship.startPos, radius: 120 * sizeScale }, sizeScale);
        chooseTargetPlanet(planets, ship.startPos, 25 * sizeScale);
    }

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

        // card ကို အပေါ်အလယ်ကို ရွှေ့ — ဖုန်းလို screen ကျဉ်းရင် card တစ်ခုလုံး ချုံ့ (ဘေးက ပြတ်မသွားအောင်)
        const scale = Math.min(1, (width - 24) / boxWidth);
        ctx.translate(width / 2, 20);
        ctx.scale(scale, scale);

        ctx.fillStyle = 'rgba(18, 20, 30, 0.92)';
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(-boxWidth / 2, 0, boxWidth, 84, 10);
        ctx.fill();
        ctx.stroke();

        ctx.textAlign = 'center';
        ctx.fillStyle = color;
        ctx.font = TITLE_FONT;
        ctx.fillText(title, 0, 38);
        ctx.fillStyle = '#c8ccd8';
        ctx.font = SUBTITLE_FONT;
        ctx.fillText(subtitle, 0, 64);
        ctx.restore();
    }

    // Mission အခြေအနေ — TARGET ဂြိုဟ်ကို ရောက်ရင် နိုင်၊ တခြားဂြိုဟ်ကို ထိရင် ရှုံး
    function updateMissionStatus() {
        if (!ship.isLaunched) setStatus('Status: Ready — land on the TARGET planet');
        else if (!ship.crashed) setStatus('Status: Flying...');
        else if (ship.hitPlanet.isTarget) setStatus('Status: Mission complete! 🎉');
        else setStatus('Status: Crashed — press R or tap New game');
    }

    function drawMissionResult() {
        if (!ship.crashed) return;
        if (ship.hitPlanet.isTarget) drawBanner('Mission Complete!', 'You reached your home planet. Press R / tap New game to fly again.', '#7ee08a');
        else drawBanner('Mission Failed', 'You landed on the wrong planet. Press R / tap New game to try again.', '#ff7b72');
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
    // ဂိမ်း အသစ်ပြန်စ — ကွန်ပျူတာမှာ R ကီး၊ ဖုန်းမှာ "New game" ခလုတ် (ဖုန်းမှာ ကီးဘုတ် မရှိလို့)
    function restart() {
        ship.reset();
        newGalaxy();
        aimVel = null;
    }
    window.addEventListener('keydown', e => {
        if (e.key === 'r' || e.key === 'R') restart();
    });
    document.getElementById('restart').addEventListener('click', restart);

    // canvas ကို game window (text bar အောက်က box) အရွယ်အတိုင်း ချိန်ပြီး ဂိမ်းအသစ် စ
    //   - ဖုန်း / Retina screen မှာ မဝါးအောင် devicePixelRatio ဆ pixel နဲ့ ဆွဲ (ဆွဲတဲ့ code က CSS pixel နဲ့ပဲ ဆက်တွက်)
    //   - ဖုန်းလှည့်တာ / window အရွယ်ပြောင်းတာနဲ့ ဂြိုဟ်တွေ screen အသစ်ထဲ ဆံ့အောင် ဂိမ်းအသစ် ပြန်စ
    function resize() {
        const box = canvas.parentElement;
        const dpr = window.devicePixelRatio || 1;
        width = box.clientWidth;
        height = box.clientHeight;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // ဖုန်းလို screen သေးရင် ဂြိုဟ်တွေ ချုံ့ (အနည်းဆုံး 60%)
        sizeScale = Math.min(1, Math.max(0.6, Math.min(width, height) / 650));

        // ဘယ်အောက်ထောင့်နား — canvas မှာ y = 0 က အပေါ်ဆုံးမို့ height ကနေ နုတ်
        // 10% ဒါမှမဟုတ် အနည်းဆုံး 70px (ဖုန်းမှာ rocket အမြီးနဲ့ မီးလျှံ frame အပြင် မထွက်အောင်)
        ship.startPos = new Vector2D(Math.max(width * 0.1, 70), height - Math.max(height * 0.1, 70));
        restart();
    }

    // window အရွယ်ပြောင်းရင် (ဖုန်းလှည့်တာ အပါအဝင်) ခဏစောင့်ပြီးမှ တစ်ခါပဲ ချိန် (ဆွဲနေတုန်း အကြိမ်ကြိမ် ပြန်မစအောင်)
    let resizeTimer = null;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const box = canvas.parentElement;
            if (box.clientWidth !== width || box.clientHeight !== height) resize();
        }, 200);
    });

    resize();

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

// canvas အရွယ်ကို startSpaceshipSimulationGame() ထဲက resize() က game window အတိုင်း ချိန်တယ်
const canvas = document.getElementById('gameCanvas');
startSpaceshipSimulationGame(canvas);
