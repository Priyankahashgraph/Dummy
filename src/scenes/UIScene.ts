import Phaser from "phaser";
import { EventBus, GameEvents } from "../core/EventBus";
import { GameState } from "../core/GameState";
import { getLevelById } from "../levels/registry";
import { Sfx } from "../core/Sfx";

const DEATH_LINES = [
  "Bob did not see that coming.",
  "Bob has left the chat.",
  "That's gonna leave a mark.",
  "Bob's insurance does not cover this.",
  "RIP Bob (again).",
];

interface PanelButton {
  label: string;
  primary: boolean;
  onClick: () => void;
}

export class UIScene extends Phaser.Scene {
  private attemptText!: Phaser.GameObjects.Text;
  private panel!: Phaser.GameObjects.Container;
  private muteButton!: Phaser.GameObjects.Text;

  constructor() {
    super("UI");
  }

  create(): void {
    this.attemptText = this.add
      .text(16, 12, "", {
        fontFamily: "monospace",
        fontSize: "16px",
        color: "#ffffff",
      })
      .setScrollFactor(0);
    this.syncAttemptTextFromCurrentRun();

    this.muteButton = this.add
      .text(this.scale.width - 16, 12, Sfx.isMuted() ? "\u{1F507}" : "\u{1F50A}", { fontSize: "20px" })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true });
    this.muteButton.on("pointerdown", () => {
      const muted = Sfx.toggleMuted();
      this.muteButton.setText(muted ? "\u{1F507}" : "\u{1F50A}");
    });

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

  private syncAttemptTextFromCurrentRun(): void {
    const state = GameState.get();
    if (!state.levelId) return;
    const title = getLevelById(state.levelId)?.title ?? state.levelId;
    this.setAttemptText(title, state.attempt);
  }

  private setAttemptText(title: string, attempt: number): void {
    this.attemptText.setText(`${title} — Attempt ${attempt}`);
  }

  private onLevelStarted(data: { title: string; attempt: number }): void {
    this.setAttemptText(data.title, data.attempt);
    this.panel.setVisible(false);
    this.panel.removeAll(true);
  }

  private onBobDied(): void {
    const line = Phaser.Utils.Array.GetRandom(DEATH_LINES);
    this.showPanel("YOU DIED", line, 0xd64550, [
      { label: "RETRY (R)", primary: true, onClick: () => EventBus.emit(GameEvents.RetryRequested) },
      { label: "LEVEL SELECT", primary: false, onClick: () => EventBus.emit(GameEvents.LevelSelectRequested) },
    ]);
  }

  private onBobWon(data: { timeMs: number; nextLevelId: string | null }): void {
    const seconds = (data.timeMs / 1000).toFixed(1);
    const buttons: PanelButton[] = [];

    if (data.nextLevelId) {
      buttons.push({
        label: "NEXT LEVEL",
        primary: true,
        onClick: () => EventBus.emit(GameEvents.NextLevelRequested, { levelId: data.nextLevelId }),
      });
      buttons.push({
        label: "LEVEL SELECT",
        primary: false,
        onClick: () => EventBus.emit(GameEvents.LevelSelectRequested),
      });
      this.showPanel("LEVEL COMPLETE!", `Bob survived in ${seconds}s`, 0x3ec46d, buttons);
    } else {
      buttons.push({
        label: "LEVEL SELECT",
        primary: true,
        onClick: () => EventBus.emit(GameEvents.LevelSelectRequested),
      });
      this.showPanel("YOU BEAT ALL LEVELS!", `Bob survived in ${seconds}s`, 0x3ec46d, buttons);
    }
  }

  private showPanel(title: string, subtitle: string, color: number, buttons: PanelButton[]): void {
    this.panel.removeAll(true);

    const buttonHeight = 44;
    const buttonGap = 12;
    const panelHeight = 140 + buttons.length * (buttonHeight + buttonGap);

    const bg = this.add.rectangle(0, 0, 360, panelHeight, 0x10121a, 0.92).setStrokeStyle(2, color);
    const titleText = this.add
      .text(0, -panelHeight / 2 + 36, title, { fontFamily: "monospace", fontSize: "26px", color: "#ffffff" })
      .setOrigin(0.5);
    const subtitleText = this.add
      .text(0, -panelHeight / 2 + 74, subtitle, { fontFamily: "monospace", fontSize: "13px", color: "#cccccc" })
      .setOrigin(0.5);

    const elements: Phaser.GameObjects.GameObject[] = [bg, titleText, subtitleText];
    const startY = -panelHeight / 2 + 110;

    buttons.forEach((btn, i) => {
      const y = startY + i * (buttonHeight + buttonGap);
      const fill = btn.primary ? color : 0x2b2f3a;
      const rect = this.add
        .rectangle(0, y, 200, buttonHeight, fill, 1)
        .setInteractive({ useHandCursor: true });
      const text = this.add
        .text(0, y, btn.label, {
          fontFamily: "monospace",
          fontSize: "15px",
          color: btn.primary ? "#10121a" : "#ffffff",
        })
        .setOrigin(0.5);
      rect.on("pointerdown", btn.onClick);
      elements.push(rect, text);
    });

    this.panel.add(elements);
    this.panel.setVisible(true);
  }
}
