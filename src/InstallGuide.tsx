import {Capacitor} from '@capacitor/core';
import {Share2,MonitorSmartphone} from 'lucide-react';
import {tx} from './locale';
export default function InstallGuide(){
 if(Capacitor.isNativePlatform())return null;
 return <section className="panel install-guide"><h2><MonitorSmartphone size={23}/>{tx('DevPath روی آیپد')}</h2><p>{tx('این صفحه را در Safari باز کن. از منوی اشتراک‌گذاری، Add to Home Screen را بزن و اگر گزینهٔ Open as Web App نمایش داده شد، آن را روشن نگه دار.')}</p><span><Share2 size={18}/><b>Share → Add to Home Screen</b></span><p className="muted">{tx('برای استفادهٔ آفلاین، بار اول برنامه را با اینترنت باز کن و بگذار بارگذاری کامل شود. منابع بیرونی همچنان به اینترنت نیاز دارند.')}</p></section>;
}
