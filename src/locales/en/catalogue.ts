import backendSource from '../../../scripts/i18n-source/backend.json';
import aiSource from '../../../scripts/i18n-source/ai.json';
import systemsSource from '../../../scripts/i18n-source/systems.json';
import projectsSource from '../../../scripts/i18n-source/projects.json';
import curriculumSource from '../../../scripts/i18n-source/curriculum.json';
import uiSource from '../../../scripts/i18n-source/ui.json';
import backend from './backend.json';
import ai from './ai.json';
import systems from './systems.json';
import projects from './projects.json';
import curriculum from './curriculum.json';
import ui from './ui.json';
import {accountEntries} from './account';
const pair=(source:string[],target:string[]):[string,string][]=>{
 if(source.length!==target.length)throw new Error('Incomplete English catalogue');
 return source.map((text,index)=>[text,target[index]]);
};
export const entries=[...pair(backendSource,backend),...pair(aiSource,ai),...pair(systemsSource,systems),...pair(projectsSource,projects),...pair(curriculumSource,curriculum),...pair(uiSource,ui),...accountEntries];
