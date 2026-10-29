class Vector2D {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    // Adds another vector to this vector and returns a new vector
    add(vector) {
        return new Vector2D(this.x + vector.x, this.y + vector.y);
    }

    // Subtracts another vector from this vector and returns a new vector
    subtract(vector) {
        return new Vector2D(this.x - vector.x, this.y - vector.y);
    }

    // Multiplies the vector by a scalar and returns a new vector
    multiply(scalar) {
        return new Vector2D(this.x * scalar, this.y * scalar);
    }

    // Divides the vector by a scalar and returns a new vector
    divide(scalar) {
        return new Vector2D(this.x / scalar, this.y / scalar);
    }

    // Dot product with another vector (x1·x2 + y1·y2)
    dot(vector) {
        return this.x * vector.x + this.y * vector.y;
    }

    // Calculates the squared magnitude (length) of the vector
    // အရှည်ရဖို့ Pythagoras အရ hypotenuse ကိုရဖို့ adjacent နဲ့ opposite ကို square လုပ်တယ်
    magnitudeSquared() {
        return this.x * this.x + this.y * this.y;
    }

    // Calculates the magnitude (length) of the vector
    // ဦးတည်ရာ အရှည်ကိုတွက်ချက်တယ်၊ hypotenuse ကို တွက်တာ
    magnitude() {
        return Math.sqrt(this.magnitudeSquared());
    }

    // Normalizes the vector (makes it a unit vector) and returns a new vector
    // ဦးတည်ရာ အတူတူထားပြီး အရှည်ကို 1 ဖြစ်အောင် ပြောင်းတယ်
    normalize() {
        let m = this.magnitude();
        return m !== 0 ? this.multiply(1 / m) : new Vector2D(0, 0);
    }

    // heading() method calculates the angle of the vector in radians relative to the positive x-axis. It uses the Math.atan2 function, which takes the y and x components of the vector as arguments and returns the angle in radians. This method is useful for determining the direction of the vector in a 2D space.
    // x ဝင်ရိုးနဲ့ လုပ်ထားတဲ့ ထောင့် (radian)
    heading() {
        return Math.atan2(this.y, this.x);
    }
}

// let pos = new Vector2D(0, 0);
// const target = new Vector2D(10, 5);
// const speed = 5; // တစ်စက္ကန့် 5 unit

// function update(dt) {
//   const toTarget = target.sub(pos); // target နဲ့ pos အကြား vector (အကွာအဝေး)
//   const move = toTarget.normalize().mult(speed * dt); // ဒီ frame ရွေ့မယ့် vector (အရှည် = speed * dt, ဦးတည်ရာ = target သို့)
//   if (move.magSq() >= toTarget.magSq()) { // ဒီ frame ရွေ့မယ့်အရှည် ≥ ကျန်တဲ့အကွာအဝေး
//     pos = target;                          // ကျော်မသွားအောင် target ပေါ် တန်းတင်
//     return;
//   }
//   pos = pos.add(move);
// }

// dt ဆိုတာ ဘာလဲ

// dt (delta time) ဆိုတာ ယခင် frame နဲ့ ဒီ frame ကြား ကြာခဲ့တဲ့ အချိန် (စက္ကန့်) ပါ။ Game တွေ၊ animation တွေက update() ကို frame တိုင်း ခေါ်ပါတယ်။ ဒါပေမဲ့ တစ်စက္ကန့်မှာ frame ဘယ်နှခါ ရမလဲဆိုတာ စက်ပေါ် မူတည်ပါတယ်။ ဖုန်းဟောင်းက 30 FPS၊ ကွန်ပျူတာ သာမန်က 60 FPS၊ gaming monitor က 144 FPS ရနိုင်ပါတယ်။

// speed = 5 က "တစ်စက္ကန့် 5 unit" လို့ ဆိုလိုတာပါ။ Frame တစ်ခုအတွင်း ဘယ်လောက်ရွေ့ရမလဲ ဆိုတာကို speed × dt နဲ့ တွက်ပါတယ်။

// ဥပမာ - 60 FPS နဲ့ dt = 1/60 စက္ကန့်ဆိုရင်
// update() ကို 1 စက္ကန့်အတွင်း 60 ကြိမ်ခေါ်ပါတယ်။ speed = 5 ဆိုရင် တစ် frame အတွင်း ရွေ့မယ့်အရှည် = 5 × (1/60) = 0.0833 unit ဖြစ်ပါတယ်။

// ဥပမာ - 30 FPS နဲ့ dt = 1/30 စက္ကန့်ဆိုရင်
// update() ကို 1 စက္ကန့်အတွင်း 30 ကြိမ်ခေါ်ပါတယ်။ speed = 5 ဆိုရင် တစ် frame အတွင်း ရွေ့မယ့်အရှည် = 5 × (1/30) = 0.1667 unit ဖြစ်ပါတယ်။

// ဒီလိုနဲ့ dt ကို အသုံးပြုပြီး frame rate မတူညီတဲ့ စက်ပေါ်မှာလည်း အချိန်အတိုင်းအတာကို တူညီအောင် ရွေ့နိုင်ပါတယ်။ speed ကို "တစ်စက္ကန့်" အတိုင်း သတ်မှတ်ထားတာကြောင့် dt နဲ့ တွက်ပြီး frame တိုင်း ရွေ့မယ့်အရှည်ကို ချိန်ညှိနိုင်ပါတယ်။