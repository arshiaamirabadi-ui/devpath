import {describe,it,expect} from 'vitest';
import {voyageGeometry,voyageStops} from './Odyssey';
describe('Odyssey route',()=>{
 it('starts directly at Troy, with exactly six story locations and no extra starting harbor',()=>{expect(voyageStops).toHaveLength(6);expect(voyageGeometry(0).position).toEqual(voyageStops[0])});
 it('moves away from Troy with learning and ends at Ithaca',()=>{expect(voyageGeometry(1).position.x).toBeGreaterThan(voyageStops[0].x);expect(voyageGeometry(100).position).toEqual(voyageStops[5]);expect(voyageGeometry(-20).position).toEqual(voyageStops[0]);expect(voyageGeometry(120).position).toEqual(voyageStops[5])});
});
