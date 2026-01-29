import { useState } from 'react'
import './GameIntro.css'

function GameIntro({ onStart }) {
  return (
    <div className="game-intro">
      <h1>IMPERFECT</h1>
      <p className="tagline">Every solution breaks something</p>
      
      <div className="intro-content">
        <p>
          Welcome to a low-lying island community facing economic and environmental precarity.
        </p>
        <p>
          You'll navigate daily life through three roles:
        </p>
        <ul>
          <li>Working at the local factory</li>
          <li>Voting on community policies</li>
          <li>Managing your household</li>
        </ul>
        <p>
          Balance four factors: <strong>environment</strong>, <strong>economy</strong>, 
          <strong>social equity</strong>, and <strong>public satisfaction</strong>.
        </p>
        <p className="warning">
          But remember: some forces are beyond your control.
        </p>
      </div>

      <button onClick={onStart} className="start-button">
        Begin
      </button>
    </div>
  )
}

export default GameIntro
