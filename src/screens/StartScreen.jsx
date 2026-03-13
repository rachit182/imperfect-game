import { PixelButton, PixelPanel } from "../ui/components/PixelUI";

export default function StartScreen({ onStart }) {
  return (
    <div className="screen screen--start">
      <PixelPanel className="start-card">
        <p className="start-kicker">A Pixel Survival Story</p>
        <h1 className="start-title">Imperfect</h1>
        <p className="start-tagline">
          Keep your family afloat while the costs of survival reshape your island.
        </p>
        <PixelButton onClick={onStart}>Start</PixelButton>
      </PixelPanel>

      <p className="start-credit-line">
        An artistic project for ENV S 3 (Winter 2026) at the University of California,
        Santa Barbara. Created by{" "}
        <a href="https://github.com/samanthwest" target="_blank" rel="noreferrer">
          Samantha West
        </a>{" "}
        and{" "}
        <a href="https://github.com/rachit182" target="_blank" rel="noreferrer">
          Rachit Gupta
        </a>
        .
      </p>
    </div>
  );
}
