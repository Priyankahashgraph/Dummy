import Phaser from "phaser";

type InteractiveGameObject = Phaser.GameObjects.GameObject & {
  width: number;
  height: number;
  input: Phaser.Types.Input.InteractiveObject | null;
};

/**
 * Expands a game object's tap/click hit area beyond its visual bounds.
 * Small sprites (levers, icon buttons) render well under the ~44px
 * touch-target guideline once scaled down to a phone screen, so we grow
 * the interactive rectangle without changing how anything looks.
 */
export function padHitArea(gameObject: InteractiveGameObject, marginX = 14, marginY = 14): void {
  const rect = new Phaser.Geom.Rectangle(
    -marginX,
    -marginY,
    gameObject.width + marginX * 2,
    gameObject.height + marginY * 2
  );
  gameObject.setInteractive(rect, Phaser.Geom.Rectangle.Contains);
  if (gameObject.input) {
    gameObject.input.cursor = "pointer";
  }
}
