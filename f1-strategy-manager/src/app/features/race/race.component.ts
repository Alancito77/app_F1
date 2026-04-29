import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-race',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './race.component.html',
  styleUrls: ['./race.component.css']
})
export class RaceComponent {
  gameState: any = {
    race: {
      lap: 1,
      total_laps: 5,
      position: 3,
      circuit: 'Bahrain International Circuit',
      tyre: 'MEDIUM',
      tyre_wear: 15,
      weather: 'DRY',
      lap_time: '1:32.456',
      narrative: 'Lights out! The race begins.',
      engineer_msg: 'Good start! Maintain pace.',
      driver_msg: 'Car feels good!',
      decisions: [
        { key: 'A', text: 'Push Hard - Faster lap, more wear' },
        { key: 'B', text: 'Conserve - Slower lap, less wear' },
        { key: 'C', text: 'Pit Stop - Change tires now' }
      ],
      race_order: [
        { pos: 1, name: 'Max Verstappen', gap: 'Leader', is_player: false },
        { pos: 2, name: 'Lewis Hamilton', gap: '+0.876', is_player: false },
        { pos: 3, name: 'Player', gap: '+1.234', is_player: true },
      ]
    }
  };

  raceLog: string[] = ['Race 1 at Bahrain International Circuit - Lap 1/5'];
  raceFinished = false;

  onDecision(decisionKey: string): void {
    const race = this.gameState.race;
    if (race.lap >= race.total_laps) {
      this.raceFinished = true;
      this.raceLog.push('Race finished!');
      return;
    }
    race.lap++;
    this.raceLog.push('Lap ' + race.lap + ': ' + race.narrative);
  }
}
