export interface LessonGuide {
 intro:string[];
 steps:{title:string;body:string}[];
 resourceSections:{title:string;url:string;focus:string;read:string;action:string}[];
 exercise:{task:string;input:string;expected:string;hint:string};
 checks:string[];
 pitfalls:string[];
 example?:{language:string;code:string;explanation:string};
}
export interface ChecklistGuide {why:string;steps:string[];verify:string;lessonIds:string[]}
