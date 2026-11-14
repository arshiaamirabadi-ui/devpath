import {it,expect} from 'vitest';
import {zoomAt,panBy} from './map-camera';
it('zooms about the pointer without moving the world point under it',()=>{const c={x:40,y:-120,scale:1};const p={x:240,y:300};const n=zoomAt(c,p,1.4);expect((p.x-n.x)/n.scale).toBeCloseTo((p.x-c.x)/c.scale);expect((p.y-n.y)/n.scale).toBeCloseTo((p.y-c.y)/c.scale)});
it('clamps zoom and preserves the anchor at both limits',()=>{expect(zoomAt({x:0,y:0,scale:1},{x:50,y:50},100).scale).toBe(2);expect(zoomAt({x:0,y:0,scale:1},{x:50,y:50},.001).scale).toBe(.4)});
it('pans by screen pixels independently of zoom',()=>{expect(panBy({x:10,y:20,scale:1.5},35,-50)).toEqual({x:45,y:-30,scale:1.5})});
