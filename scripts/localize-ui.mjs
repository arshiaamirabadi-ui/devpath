/** One-time codemod: make presentation translation explicit in React source.
 * Stored values, identifiers, form values and user-authored text stay untouched.
 */
import fs from 'node:fs';
import {parse} from '@babel/parser';
import traverseModule from '@babel/traverse';
import generatorModule from '@babel/generator';
import * as t from '@babel/types';
const traverse=traverseModule.default,generate=generatorModule.default;
const ignored=new Set(['main.tsx','LanguageProvider.tsx']);
const attributes=new Set(['aria-label','aria-description','aria-valuetext','title','placeholder','alt']);
const privateNames=new Set(['text','evidence','saved']);
const privateFields=new Set(['text','evidence','notes','learned','built','blocked','review']);
function privateExpression(node){let result=false;t.traverseFast(node,item=>{if(t.isIdentifier(item)&&privateNames.has(item.name))result=true;if(t.isMemberExpression(item)&&!item.computed&&t.isIdentifier(item.property)&&privateFields.has(item.property.name))result=true});return result}
for(const file of fs.readdirSync('src').filter(f=>f.endsWith('.tsx')&&!ignored.has(f))){
 const path='src/'+file,source=fs.readFileSync(path,'utf8');if(source.includes("from './locale'"))continue;
 const ast=parse(source,{sourceType:'module',plugins:['typescript','jsx']});let used=false;
 const wrap=node=>{used=true;return t.callExpression(t.identifier('tx'),[node])};
 traverse(ast,{
  JSXElement(path){if(path.node.openingElement.name.type!=='JSXIdentifier'||path.node.openingElement.name.name!=='option')return;const attrs=path.node.openingElement.attributes;if(attrs.some(a=>t.isJSXAttribute(a)&&a.name.name==='value'))return;const children=path.node.children.filter(c=>!t.isJSXText(c)||c.value.trim());if(children.length===1){const child=children[0];const value=t.isJSXText(child)?t.stringLiteral(child.value.trim()):t.isJSXExpressionContainer(child)?child.expression:null;if(value&&!t.isJSXEmptyExpression(value))attrs.push(t.jsxAttribute(t.jsxIdentifier('value'),t.jsxExpressionContainer(t.cloneNode(value,true))))}},
  JSXText(path){if(!/[\u0621-\u064a\u067e\u0686\u0698\u06a9\u06af\u06cc]/.test(path.node.value))return;path.replaceWith(t.jsxExpressionContainer(wrap(t.stringLiteral(path.node.value.replace(/\s+/g,' ')))));path.skip()},
  JSXExpressionContainer:{exit(path){const expression=path.node.expression;if(t.isJSXEmptyExpression(expression)||t.isCallExpression(expression)&&t.isIdentifier(expression.callee,{name:'tx'}))return;if(t.isJSXAttribute(path.parent)){if(!attributes.has(path.parent.name.name))return}else if(privateExpression(expression))return;path.node.expression=wrap(expression)}},
  JSXAttribute(path){if(!attributes.has(path.node.name.name)||!t.isStringLiteral(path.node.value))return;path.node.value=t.jsxExpressionContainer(wrap(path.node.value))},
  CallExpression(path){if(!t.isIdentifier(path.node.callee)||!['confirm','alert','prompt'].includes(path.node.callee.name)||!path.node.arguments.length)return;const first=path.node.arguments[0];if(t.isExpression(first)){path.node.arguments[0]=wrap(first);path.skip()}},
 });
 if(used){ast.program.body.unshift(t.importDeclaration([t.importSpecifier(t.identifier('tx'),t.identifier('tx'))],t.stringLiteral('./locale')));fs.writeFileSync(path,generate(ast,{retainLines:false,comments:true},source).code+'\n')}
}
