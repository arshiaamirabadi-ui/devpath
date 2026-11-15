export function nativeBackAction(hash:string,canGoBack:boolean,overlay:boolean){
 if(overlay)return 'close-overlay';if(!hash||hash==='#'||hash==='#/'||hash==='#/dashboard')return 'minimize';return canGoBack?'back':'home';
}
