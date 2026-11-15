import {describe,it,expect,afterEach} from 'vitest';
import {createTranslator,applyLocale,numberLocale,dateLocale,getLanguage} from './locale';
import {entries} from './locales/en/catalogue';
afterEach(()=>applyLocale('fa'));
describe('English localization',()=>{
 it('fully translates every catalogue entry without Persian text or empty placeholders',()=>{const full=createTranslator(entries);expect(entries.length).toBeGreaterThan(3700);expect(new Set(entries.map(([key])=>key)).size).toBe(entries.length);for(const [source,target]of entries){expect(target.trim(),source).not.toBe('');expect(target,source).not.toMatch(/[\u0621-\u064a\u067e\u0686\u0698\u06a9\u06af\u06cc]/);expect(full(source),source).toBe(target)}});
 const translate=createTranslator([['هفته','Week'],['برنامه امروز','Today'],['تکمیل','Complete'],['مبانی Go','Go basics'],['من','Me']]);
 it('translates complete messages and preserves surrounding whitespace',()=>{expect(translate(' برنامه امروز ')).toBe(' Today ')});
 it('handles combined labels and English digits without corrupting unknown words',()=>{expect(translate('تکمیل مبانی Go')).toBe('Complete Go basics');expect(translate('هفته ۱۲ · ۳۵٪')).toBe('Week 12 · 35%');expect(translate('منطق')).toBe('منطق')});
 it('leaves URLs and identifiers intact',()=>{expect(translate('https://go.dev/tour/basics/1')).toBe('https://go.dev/tour/basics/1')});
 it('uses English formatting only for the selected language',()=>{expect(getLanguage()).toBe('fa');applyLocale('en');expect(numberLocale()).toBe('en-US');expect(dateLocale()).toBe('en-US');applyLocale('fa');expect(dateLocale()).toBe('fa-IR')});
});
