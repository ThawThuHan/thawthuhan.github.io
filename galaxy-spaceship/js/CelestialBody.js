class CelestialBody {
  constructor(x, y, velocity, mass) {
    this.position = new Vector2D(x, y);
    this.velocity = velocity;
    this.mass = mass;
  }
}

class Planet extends CelestialBody {
  // gravity မြှား ဧရိယာ radius = radius × GLOW_SCALE (ring ကို မဆွဲတော့ပေမဲ့ game.js က ဂြိုဟ်တွေ နေရာချတဲ့အခါလည်း သုံးတယ်)
  static GLOW_SCALE = 2.5;

  constructor(x, y, velocity, mass, radius, color = '#6c5ce7', minDist = 1) {
    super(x, y, velocity, mass);
    this.radius = radius;
    this.color = color;
    this.minDist = minDist;
    this.minDistSq = minDist * minDist;
    this.phase = Math.random() * Math.PI * 2;   // gravity မြှားတွေ ဂြိုဟ်တိုင်း မတူအောင်
    this.isTarget = false;                      // mission target — ဒီဂြိုဟ်ကို ရောက်ရင် ဂိမ်းနိုင်
  }

  /**
 * other object နေရာမှာ ဒီဂြိုဟ်ကြောင့် ဖြစ်တဲ့ gravity acceleration
 * ရလဒ်: ဂြိုဟ်ဆီ ညွှန်ပြီး ဆွဲအား ပမာဏ အရှည်ရှိတဲ့ vector
 * (other object ရဲ့ mass မလိုဘူး — acceleration က mass-independent ဖြစ်တယ်)
 */
  getGravitationalAcc(otherObjPos, G = 20) {
    const toPlanet = this.position.subtract(otherObjPos);          // otherObj → planet ဦးတည်ရာ မြှား
    const rawDistSq = toPlanet.magnitudeSquared();              // အကွာအဝေး² (ပုံသေနည်းက r² ကို တိုက်ရိုက် လိုတယ်)

    if (rawDistSq === 0) return new Vector2D(0, 0);  // ဗဟိုအတိအကျ — ဦးတည်ရာ မရှိ (NaN ကာကွယ်)

    const distSq = Math.max(rawDistSq, this.minDistSq); // အလွန်နီးရင် ကန့်သတ် (Infinity ကာကွယ်)
    const strength = (G * this.mass) / distSq;           // Newton: a = G·M / r²

    return toPlanet.normalize().multiply(strength);          // ဦးတည်ရာ (အရှည် 1) × ပမာဏ
  }

  /**
  * ship က ဂြိုဟ်ကိုယ်ထည်ကို ထိနေလား
  * √ မသုံးဘဲ magnitudeSquared နဲ့ နှိုင်းယှဉ်တယ်:  dist ≤ r  ⇔  dist² ≤ r²
  */
  isColliding(shipPos, shipRadius = 0) {
    const r = this.radius + shipRadius;
    return this.position.subtract(shipPos).magnitudeSquared() <= r * r;
  }

  /**
  * ship က from → to ကို တစ်လှမ်းတည်း ရွေ့တဲ့အခါ ဂြိုဟ်ကို ဘယ်နေရာမှာ စထိလဲ
  * step ကြားမှာ ဂြိုဟ်ကို ဖြတ်ကျော်သွားတာကိုပါ ဖမ်းမိတယ် (endpoint ကိုပဲ စစ်ရင် လွတ်သွားနိုင်တယ်)
  * ရလဒ်: t (0 = from, 1 = to) — မထိရင် null
  */
  sweepCollision(from, to, shipRadius = 0) {
    if (this.isColliding(from, shipRadius)) return 0;    // စကတည်းက ထိနေပြီ

    // |toShip + move·t|² = r² ဖြစ်တဲ့ t ကို ရှာ (quadratic: a·t² + b·t + c = 0)
    const r = this.radius + shipRadius;
    const move = to.subtract(from);
    const toShip = from.subtract(this.position);
    const a = move.dot(move);
    const b = 2 * toShip.dot(move);
    const c = toShip.dot(toShip) - r * r;

    const disc = b * b - 4 * a * c;
    if (a === 0 || disc < 0) return null;                // မရွေ့ဘူး / လမ်းကြောင်းက ဂြိုဟ်ကို မရောက်ဘူး

    const t = (-b - Math.sqrt(disc)) / (2 * a);          // ပထမဆုံး ထိတဲ့ t (ငယ်တဲ့ အဖြေ)
    return t >= 0 && t <= 1 ? t : null;                  // ဒီ step အတွင်း မဟုတ်ရင် null
  }

  draw(ctx) {
    ctx.save(); // ctx ရဲ့ လက်ရှိ setting တွေ မှတ်ထား (အပြင်က ပုံဆွဲတဲ့ code ကို မထိခိုက်အောင်)

    // ဂြိုဟ်ကိုယ်ထည်
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Mission target — ဘယ်ဂြိုဟ်လဲ သိသာအောင် အပေါ်မှာ စာတန်းလေး
    if (this.isTarget) {
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillStyle = '#7ee08a';
      ctx.fillText('Your Home Planet', this.position.x, this.position.y - this.radius - 8);
    }

    ctx.restore(); // fillStyle စတာတွေ မူလအတိုင်း ပြန်ထား
  }

  /**
  * Gravity မြှားလေးတွေ — radius × GLOW_SCALE ကနေ ဂြိုဟ်ဆီ စီးဝင်ပြီး မှိတ်တုတ်မှိတ်တုတ် လင်းတယ် (အလှသက်သက်)
  * mass များတဲ့ ဂြိုဟ်မှာ မြှားတွေ ပိုမြန်တယ် — ဆွဲအား ပြင်းတာကို မြင်ရအောင်
  * time: စက္ကန့် (game loop ရဲ့ now / 1000)
  */
  drawGravityField(ctx, time) {
    const size = 3;                                             // မြှားထိပ် အရွယ် (px)
    const inner = this.radius + 3;                              // ဂြိုဟ်မျက်နှာပြင်နား
    const outer = this.radius * Planet.GLOW_SCALE - size - 2;   // ဧရိယာ အပြင်စွန်းနား (မြှားနောက်ဘက်ပါ ဧရိယာထဲမှာ ရှိအောင်)
    const spokes = Math.max(6, Math.round(this.radius / 3));    // ဂြိုဟ်ကြီးရင် မြှား များ
    const speed = this.mass / 15000;                            // တစ်စက္ကန့်မှာ ring → မျက်နှာပြင် ဘယ်နှခေါက်

    ctx.save();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let i = 0; i < spokes; i++) {
      const angle = this.phase + (i / spokes) * Math.PI * 2;
      const inward = new Vector2D(-Math.cos(angle), -Math.sin(angle)); // ဂြိုဟ်ဗဟိုဆီ ဦးတည်ရာ
      const side = new Vector2D(-inward.y, inward.x);

      for (let j = 0; j < 2; j++) {
        // t: 0 = ring နား → 1 = မျက်နှာပြင်နား (ရောက်ရင် ring ကနေ ပြန်စ)
        const t = (time * speed + j / 2 + i * 0.37) % 1;
        const tip = this.position.subtract(inward.multiply(outer - t * (outer - inner)));
        const back = tip.subtract(inward.multiply(size));

        // အစ/အဆုံးမှာ မှိန်သွား + တစ်ခုချင်း မှိတ်တုတ်မှိတ်တုတ် (bling)
        const fade = Math.sin(t * Math.PI);
        const twinkle = 0.5 + 0.5 * Math.sin(time * 6 + i * 2.3 + j * 3.1);
        ctx.globalAlpha = 0.4 * fade * twinkle;

        ctx.beginPath();
        ctx.moveTo(back.x + side.x * size, back.y + side.y * size);
        ctx.lineTo(tip.x, tip.y);
        ctx.lineTo(back.x - side.x * size, back.y - side.y * size);
        ctx.stroke();
      }
    }

    ctx.restore();
  }
}

function totalGravity(planets, pos) {
  let acc = new Vector2D(0, 0);
  for (const planet of planets) {
    acc = acc.add(planet.getGravitationalAcc(pos));
  }
  return acc;
}

// from → to လမ်းကြောင်းပေါ်မှာ အရင်ဆုံး ထိမယ့် ဂြိုဟ် + ဂြိုဟ်မျက်နှာပြင်ကို ထိတဲ့နေရာ (point)
function findFirstCollision(planets, from, to, otherObjRadius = 0) {
  let hit = null;
  for (const planet of planets) {
    const t = planet.sweepCollision(from, to, otherObjRadius);
    if (t !== null && (hit === null || t < hit.t)) {
      hit = { planet, t };
    }
  }
  if (hit) hit.point = from.add(to.subtract(from).multiply(hit.t));
  return hit;
}