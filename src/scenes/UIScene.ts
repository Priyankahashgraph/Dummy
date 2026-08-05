import Phaser from "phaser";
import { EventBus, GameEvents } from "../core/EventBus";
import { level1 } from "../levels/level1";

const DEATH_LINES = [
  "Bob did not see that coming.",
  "Bob has left the chat.",
  "That's gonna leave a mark.",
  "Bob's insurance does not cover this.",
  "RIP Bob (again).",
];

export class UIScene extends Phaser.Scene {
  private attemptText!: Phaser.GameObjects.Text;
  private panel!: Phaser.GameObjects.Container;

  constructor() {
    super("UI");
  }

  create(): void {
    this.attemptText = this.add
      .text(16, 12, `${level1.title} — Attempt 1`, {
        fontFamily: "monospace",
        fontSize: "16px",
        color: "#ffffff",
      })
      .setScrollFactor(0);

    this.panel = this.add.container(this.scale.width / 2, this.scale.height / 2);
    this.panel.setScrollFactor(0);
    this.panel.setVisible(false);

    EventBus.on(GameEvents.LevelStarted, this.onLevelStarted, this);
    EventBus.on(GameEvents.BobDied, this.onBobDied, this);
    EventBus.on(GameEvents.BobWon, this.onBobWon, this);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      EventBus.off(GameEvents.LevelStarted, this.onLevelStarted, this);
      EventBus.off(GameEvents.BobDied, this.onBobDied, this);
      EventBus.off(GameEvents.BobWon, this.onBobWon, this);
    });
  }

  private onLevelStarted(data: { attempt: number }): void {
    this.attemptText.setText(`${level1.title} — Attempt ${data.attempt}`);
    this.panel.setVisible(false);
    this.panel.removeAll(true);
  }

  private onBobDied(): void {
    const line = Phaser.Utils.Array.GetRandom(DEATH_LINES);
    this.showPanel("YOU DIED", line, 0xd64550);
  }

  private onBobWon(data: { timeMs: number }): void {
    const seconds = (data.timeMs / 1000).toFixed(1);
    this.showPanel("LEVEL COMPLETE!", `Bob survived in ${seconds}s`, 0x3ec46d);
  }

  private showPanel(title: string, subtitle: string, color: number): void {
    this.panel.removeAll(true);

    const bg = this.add.rectangle(0, 0, 360, 180, 0x10121a, 0.9).setStrokeStyle(2, color);
    const titleText = this.add
      .text(0, -50, title, { fontFamily: "monospace", fontSize: "28px", color: "#ffffff" })
      .setOrigin(0.5);
    const subtitleText = this.add
      .text(0, -10, subtitle, { fontFamily: "monospace", fontSize: "14px", color: "#cccccc" })
      .setOrigin(0.5);

    const button = this.add
      .rectangle(0, 50, 160, 44, color, 1)
      .setInteractive({ useHandCursor: true });
    const buttonText = this.add
      .text(0, 50, "RETRY (R)", { fontFamily: "monospace", fontSize: "16px", color: "#10121a" })
      .setOrigin(0.5);
    button.on("pointerdown", () => EventBus.emit(GameEvents.RetryRequested));

    this.panel.add([bg, titleText, subtitleText, button, buttonText]);
    this.panel.setVisible(true);
  }
}
