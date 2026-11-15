import {describe,it,expect} from 'vitest';
import {agendaSlots,clockParts} from './agenda-model';
describe('day agenda',()=>{
 it('lays out real duration portions consecutively from the chosen time',()=>{expect(agendaSlots([{minutes:30},{minutes:90}],'07:30').map(s=>[s.from,s.to])).toEqual([[450,480],[480,570]])});
 it('retains next-day offsets rather than presenting wrapped times as the same day',()=>{const slots=agendaSlots([{minutes:90},{minutes:30}],'23:30');expect(clockParts(slots[0].to)).toEqual({hour:1,minute:0,day:1});expect(slots[1].from).toBe(1500)});
 it('uses a valid fallback for an invalid saved time',()=>{expect(agendaSlots([{minutes:60}],'99:99')[0].from).toBe(540)});
});
