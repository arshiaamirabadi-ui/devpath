import {describe,it,expect,vi,beforeEach} from 'vitest';
import {freshState} from './logic';
const native=vi.hoisted(()=>({writeFile:vi.fn(),share:vi.fn()}));
vi.mock('@capacitor/core',()=>({Capacitor:{isNativePlatform:()=>true}}));
vi.mock('@capacitor/filesystem',()=>({Filesystem:{writeFile:native.writeFile},Directory:{Cache:'CACHE'},Encoding:{UTF8:'utf8'}}));
vi.mock('@capacitor/share',()=>({Share:{share:native.share}}));
import {saveBackup} from './backup-export';
import {nativeBackAction} from './native-back';
beforeEach(()=>{vi.resetAllMocks();native.writeFile.mockResolvedValue({uri:'file:///cache/backups/example.json'});native.share.mockResolvedValue({activityType:''})});
it('exports complete personal data through the Android share sheet using an app-cache file',async()=>{
 const state=freshState();state.notes=[{id:'note',target:'general',text:'یادداشت خصوصی',updatedAt:'2026-11-15T12:00:00Z'}];await saveBackup(state);const call=native.writeFile.mock.calls[0][0];expect(call.directory).toBe('CACHE');expect(call.path).toMatch(/^backups\/devpath-backup-\d{4}-\d{2}-\d{2}\.json$/);expect(JSON.parse(call.data)).toEqual(state);expect(native.share).toHaveBeenCalledWith(expect.objectContaining({files:['file:///cache/backups/example.json']}));
});
it('surfaces export failures instead of claiming the backup was saved',async()=>{native.writeFile.mockRejectedValue(new Error('disk full'));await expect(saveBackup(freshState())).rejects.toThrow('disk full');expect(native.share).not.toHaveBeenCalled()});
describe('Android back',()=>{it('closes overlays before navigating and minimizes at home',()=>{expect(nativeBackAction('#/week/1',true,true)).toBe('close-overlay');expect(nativeBackAction('#/',true,false)).toBe('minimize');expect(nativeBackAction('#/today',true,false)).toBe('back');expect(nativeBackAction('#/today',false,false)).toBe('home')})});
