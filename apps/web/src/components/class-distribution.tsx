"use client";
import { useState } from "react";
import type { CharacterClassInput } from "../../../../packages/contracts/src/characters";
import { library, type CharacterCatalog } from "../../../../packages/catalog/src/library";
import { CatalogChoice } from "./catalog-choice";
export const emptyClass = (): CharacterClassInput => ({classId:null,className:"",subclassId:null,subclassName:"",level:1,rulesVersion:"2024",sourceId:"custom",subclassSourceId:null,acquisitionLevels:[]});
export function ClassDistribution({rows,onChange,catalog=library}:{rows:CharacterClassInput[];onChange:(rows:CharacterClassInput[])=>void;catalog?:CharacterCatalog}){
 const [expanded,setExpanded]=useState(0);
 const total=rows.reduce((sum,row)=>sum+row.level,0);
 const ordered=rows.some(row=>row.acquisitionLevels.length>0);
 function change(index:number,values:Partial<CharacterClassInput>){onChange(rows.map((row,i)=>({...row,...(i===index?values:{}),...(values.level!==undefined?{acquisitionLevels:[]}:{} )})));}
 function initialize(){let offset=0;onChange(rows.map(row=>({...row,acquisitionLevels:Array.from({length:row.level},()=>++offset)})));}
 function assign(level:number,target:number){
  const result=rows.map((row,index)=>({...row,acquisitionLevels:[...row.acquisitionLevels.filter(n=>n!==level),...(index===target?[level]:[])].sort((a,b)=>a-b)}));
  onChange(result.map(row=>({...row,level:row.acquisitionLevels.length})));
 }
 return <div className="class-cards"><h3>Classes · Nível total {total} / 20</h3><p>Comece com uma classe. Você pode combinar outras, respeitando os requisitos da sua mesa.</p>
 {rows.map((row,index)=><article className="class-card" key={index}>
 <header><div><h4>{row.className||`Classe ${index+1}`} · nível {row.level}</h4><p>{row.subclassName||"Sem subclasse selecionada"} · classe {row.rulesVersion}</p></div><button type="button" className="button" aria-expanded={expanded===index} onClick={()=>setExpanded(expanded===index?-1:index)}>{expanded===index?"Recolher":"Editar"} classe {index+1}</button></header>
 {expanded===index&&<div className="catalog-grid">
 <CatalogChoice label={`Classe ${index+1}`} options={catalog.classes} id={row.classId} name={row.className} onChange={(classId,className)=>{const selected=catalog.classes.find(item=>item.id===classId);change(index,{classId,className,subclassId:null,subclassName:"",sourceId:selected?.source.id??"custom",rulesVersion:(selected?.source.edition??"custom") as CharacterClassInput["rulesVersion"]});}}/>
 <label>Níveis na classe {index+1}<input type="number" required min={1} max={20} value={Number.isNaN(row.level)?"":row.level} onChange={e=>change(index,{level:e.target.valueAsNumber})}/></label>
 <CatalogChoice key={`subclass-${index}-${row.classId??"manual"}`} label={`Subclasse ${index+1}`} options={catalog.subclasses.filter(s=>s.classId===row.classId&&row.level>=(s.minimumLevel??3))} id={row.subclassId} name={row.subclassName} optional onChange={(subclassId,subclassName)=>change(index,{subclassId,subclassName})}/>
 {!row.classId&&<p className="field-help">Classe manual: selecione explicitamente uma classe do catálogo acima para consultar suas subclasses. O nome não vincula regras automaticamente.</p>}
 {row.classId&&row.level<3&&<p className="field-help">As subclasses SRD ficam disponíveis no nível 3 desta classe.</p>}
 <details><summary>Regras avançadas da classe {index+1}</summary><label>Regras da classe {index+1}<select value={row.rulesVersion} disabled={Boolean(row.classId)} onChange={e=>change(index,{rulesVersion:e.target.value as CharacterClassInput["rulesVersion"]})}><option value="2024">2024</option><option value="2014">2014 (manual)</option><option value="custom">Personalizadas</option></select></label></details>
 </div>}
 {rows.length>1&&<button type="button" className="button" onClick={()=>{onChange(rows.filter((_,i)=>i!==index).map(row=>({...row,acquisitionLevels:[]})));setExpanded(0);}}>Remover classe {index+1}</button>}
 </article>)}
 <button type="button" className="button" disabled={total>=20||rows.length>=20} onClick={()=>{onChange([...rows.map(row=>({...row,acquisitionLevels:[]})),emptyClass()]);setExpanded(rows.length);}}>Adicionar outra classe</button>
 <details className="progression"><summary>Progressão por nível (opcional)</summary><p>Registre qual classe recebeu cada nível. Alterar a quantidade de níveis ou remover/adicionar classes limpa esta ordem; navegar entre etapas preserva suas escolhas.</p>
 {!ordered?<button type="button" className="button" disabled={!Number.isInteger(total)||total<1||total>20} onClick={initialize}>Organizar progressão</button>:<><div className="progression-grid">{Array.from({length:Math.min(total,20)},(_,i)=>i+1).map(level=><label key={level}>Nível {level}<select aria-label={`Classe no nível ${level}`} value={rows.findIndex(row=>row.acquisitionLevels.includes(level))} onChange={e=>assign(level,Number(e.target.value))}>{rows.map((row,index)=><option key={index} value={index}>{row.className||`Classe ${index+1}`}</option>)}</select></label>)}</div><button className="button" type="button" onClick={()=>onChange(rows.map(row=>({...row,acquisitionLevels:[]})))}>Não registrar ordem</button></>}
 </details></div>;
}
