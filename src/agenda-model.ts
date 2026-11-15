export function agendaSlots<T extends {minutes:number}>(items:readonly T[],start:string){
 const valid=/^([01]\d|2[0-3]):[0-5]\d$/.test(start)?start:'09:00';let cursor=Number(valid.slice(0,2))*60+Number(valid.slice(3));
 return items.map(item=>{const from=cursor;cursor+=item.minutes;return {item,from,to:cursor}});
}
export function clockParts(minutes:number){const whole=Math.max(0,Math.round(minutes));return {hour:Math.floor(whole/60)%24,minute:whole%60,day:Math.floor(whole/1440)}}
