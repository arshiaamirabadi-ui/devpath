import {backendLessons} from './lessons-backend';
import {aiLessons} from './lessons-ai';
import {systemsLessons} from './lessons-systems';
import {projectLessons} from './lessons-projects';
import type {LessonGuide} from './lesson-types';
export {checklistGuides} from './lessons-projects';
export const lessonGuides:Record<string,LessonGuide>={...backendLessons,...aiLessons,...systemsLessons,...projectLessons};
// Setup tools have their own reading; a language tutorial alone does not cover installing Jupyter.
if(lessonGuides['w1-ai-practice']){const guide=lessonGuides['w1-ai-practice'];lessonGuides['w1-ai-practice']={...guide,resourceSections:[{title:'Project Jupyter — Installing Jupyter',url:'https://jupyter.org/install',focus:'Jupyter Notebook در صفحه نصب رسمی',read:'در بخش Notebook، دستور نصب و اجرای Notebook را بخوان؛ آن را با مفسر محیط مجزای خودت اجرا کن. نصب JupyterHub یا سرویس چندکاربره برای این درس لازم نیست.',action:'با همان Python محیط مجزا، -m pip install notebook و سپس -m notebook را اجرا کن. یک سلول 2+3 بساز و نتیجه 5 را ببین؛ بعد Kernel را Restart و Run All کن.'},...guide.resourceSections]}}
if(lessonGuides['w1-ai-study']){const guide=lessonGuides['w1-ai-study'];lessonGuides['w1-ai-study']={...guide,resourceSections:[...guide.resourceSections,{title:'Python — Virtual Environments and Packages',url:'https://docs.python.org/3/tutorial/venv.html',focus:'Creating Virtual Environments و Managing Packages with pip',read:'فقط ایجاد محیط و نصب بسته با همان مفسر را بخوان. تفاوت pip سیستم و pip محیط پروژه را مشخص کن؛ تغییر سیاست امنیت PowerShell برای این تمرین لازم نیست.',action:'محیط .venv را بساز و با مفسر همان محیط -m pip --version بگیر؛ مسیر چاپ‌شده باید به محیط پروژه مربوط باشد.'}]}}
