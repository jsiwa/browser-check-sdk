
import { Plugin } from '../core';

// Mouse/Touch Entropy Detection
export const entropyPlugin: Plugin = {
  name: 'User Behavior Entropy',
  key: 'entropy',
  execute: () => {
    // This plugin provides a collector for mouse movements
    // The actual entropy calculation should be done by the implementation
    const collector = {
      movements: [] as {x: number, y: number, t: number}[],
      
      start() {
        const handler = (e: MouseEvent | TouchEvent) => {
          if (this.movements.length < 50) {
            let clientX, clientY;
            if (window.TouchEvent && e instanceof TouchEvent) {
              clientX = e.touches[0]?.clientX;
              clientY = e.touches[0]?.clientY;
            } else if (e instanceof MouseEvent) {
              clientX = e.clientX;
              clientY = e.clientY;
            }
            if (clientX !== undefined) {
              this.movements.push({ x: clientX, y: clientY!, t: Date.now() });
            }
          }
        };
        
        window.addEventListener('mousemove', handler);
        window.addEventListener('touchmove', handler);
      },
      
      calculate() {
        const moves = this.movements;
        if (moves.length < 5) return null;
        let irregularMoves = 0;
        for(let i = 1; i < moves.length; i++) {
          const dx = moves[i].x - moves[i-1].x;
          const dy = moves[i].y - moves[i-1].y;
          const dt = moves[i].t - moves[i-1].t;
          if (dt > 0 && Math.abs(dx/dt) < 5 && Math.abs(dy/dt) < 5) irregularMoves++;
        }
        return Math.min(Math.floor((irregularMoves / moves.length) * 100 + 20), 99);
      }
    };
    
    return collector;
  }
};
