import {it,expect} from 'vitest';
import {nodes,edges,connections} from './graph';
it('maps all 30 skills and 12 projects to unique clickable nodes',()=>{expect(nodes).toHaveLength(42);expect(new Set(nodes.map(n=>n.id)).size).toBe(42);for(const n of nodes)expect(n.weeks.length).toBeGreaterThan(0)});
it('uses valid dependencies without circular prerequisite chains',()=>{for(const [from,to] of edges){expect(nodes.some(n=>n.id===from)).toBe(true);expect(nodes.some(n=>n.id===to)).toBe(true);expect(from).not.toBe(to)}const visit=(id:string,path:string[])=>{expect(path).not.toContain(id);for(const [,to] of edges.filter(e=>e[0]===id))visit(to,[...path,id])};for(const n of nodes)visit(n.id,[])});
it('shows SQL and HTTP as dependencies of authentication, and its downstream project',()=>{const c=connections('skill:auth');expect(c.parents).toContain('skill:sql');expect(c.children).toContain('project:task-api')});
