const MINUTES_PER_DAY = 24 * 60;

export class TimeSystem {
  private minute = 8 * 60;
  private speed = 1;
  private readonly minutesPerSecond: number;

  /** @param dayLengthSeconds real seconds for one full in-game day at 1x speed */
  constructor(dayLengthSeconds: number) {
    this.minutesPerSecond = MINUTES_PER_DAY / dayLengthSeconds;
  }

  update(deltaSeconds: number): void {
    this.minute = (this.minute + deltaSeconds * this.minutesPerSecond * this.speed) % MINUTES_PER_DAY;
  }

  getMinute(): number {
    return this.minute;
  }

  getSpeed(): number {
    return this.speed;
  }

  setSpeed(speed: number): void {
    this.speed = speed;
  }

  getClockLabel(): string {
    const totalMinutes = Math.floor(this.minute);
    const hours = Math.floor(totalMinutes / 60) % 24;
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }
}
