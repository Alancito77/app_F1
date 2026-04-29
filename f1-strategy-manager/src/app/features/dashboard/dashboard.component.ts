import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  gameState: any = {
    season: {
      current_race: 1,
      total_races: 5,
      standings: [
        { pos: 1, name: 'Player', points: 0, is_player: true },
        { pos: 2, name: 'Max Verstappen', points: 0, is_player: false },
        { pos: 3, name: 'Lewis Hamilton', points: 0, is_player: false },
      ]
    },
    race: {
      circuit: 'Bahrain International Circuit',
      position: 3
    }
  };

  get seasonProgress(): number {
    return Math.round((this.gameState.season.current_race / this.gameState.season.total_races) * 100);
  }
}
