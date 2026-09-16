// Adapted from Depth Gallery's target/current/velocity model (Houmahani Kane, MIT).
// A bounded gesture gate replaces unbounded input accumulation for a live lecture.
export class ThanksScroll {
  constructor(count, reduced) { this.count = count; this.reduced = reduced; this.reset(); }
  reset() { this.current = -.85; this.target = 0; this.velocity = 0; this.previous = this.current; this.lastWheel = 0; this.gestureUsed = false; this.wheelSum = 0; this.lastMove = -Infinity; this.kick = 0; }
  move(direction, now, strength = .4) {
    if (now - this.lastMove < 450) return false;
    if (Math.abs(this.target - this.current) > .025) return false;
    const next = Math.max(0, Math.min(this.count, this.target + Math.sign(direction)));
    if (next === this.target) return false;
    this.target = next; this.lastMove = now; this.kick = Math.min(1, Math.abs(strength));
    return true;
  }
  wheel(event, now) {
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 800 : 1);
    if (now - this.lastWheel > 320 && Math.abs(this.target-this.current)<.025) { this.gestureUsed = false; this.wheelSum = 0; }
    this.lastWheel = now;
    if (this.gestureUsed) return false;
    this.wheelSum += delta;
    if (Math.abs(this.wheelSum) < 28) return false;
    const moved = this.move(this.wheelSum, now, Math.abs(delta) / 130);
    if (moved) this.gestureUsed = true;
    return moved;
  }
  update(dt) {
    // A discrete lecture step should feel like travelling through the gap,
    // not like swapping slides. Velocity only trims the easing slightly.
    const tau = this.reduced ? .055 : .62 - this.kick * .055;
    this.current += (this.target - this.current) * (1 - Math.exp(-dt / tau));
    const raw = (this.current - this.previous) / Math.max(dt, .001);
    this.velocity += (raw - this.velocity) * (1 - Math.exp(-dt / .12));
    this.kick *= Math.exp(-dt / .25);
    if (Math.abs(this.target - this.current) < .0001) this.current = this.target;
    if (Math.abs(this.velocity) < .001) this.velocity = 0;
    this.previous = this.current;
  }
}
