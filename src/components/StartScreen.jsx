import React from "react";

export default function StartScreen({ onStart }) {
    return (
        <div className="start-screen">
            <div className="start-card">
                <h1 className="start-title">Imperfect</h1>

                <p className="start-tagline">
                    Keep your family afloat while the costs of “survival” reshape your island.
                </p>

                <button className="start-button" onClick={onStart}>
                    Start Game
                </button>

                <p className="start-hint">
                    Every choice helps somewhere — and hurts somewhere else.
                </p>
            </div>
        </div>
    );
}