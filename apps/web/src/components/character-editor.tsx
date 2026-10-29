"use client";
import { useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { abilityKeys, abilityLabels, createCharacterSchema, characterFieldsSchema, type CharacterSheet, type CharacterInput } from "../../../../packages/contracts/src/characters";
import { library, type CharacterCatalog } from "../../../../packages/catalog/src/library";
import { ClassDistribution, emptyClass } from "./class-distribution";
import { abilityModifier } from "../../../../packages/rules/src/index";
import { CatalogChoice } from "./catalog-choice";
import { apiRequest } from "./core-form";
const subscribe = () => () => {};
const stages = ["Identidade", "Espécie e antecedente", "Classes", "Atributos", "Recursos", "Revisão"];
export function CharacterEditor({campaignId,campaignName,initial,members,ownId,isGM,canCreate,returnSessionId,catalog = library}: {
 campaignId:string; campaignName?:string; initial?:CharacterSheet; members:{userId:string;label:string}[];
 ownId:string;isGM:boolean;canCreate:boolean;returnSessionId?:string;catalog?:CharacterCatalog;
}) {
 const {species,backgrounds,subclasses} = catalog;
 const router=useRouter();
 const ready=useSyncExternalStore(subscribe,()=>true,()=>false);
 const formRef=useRef<HTMLFormElement>(null), heading=useRef<HTMLHeadingElement>(null);
 const [data,setData]=useState<CharacterInput>(()=> initial ? {...initial, classes: initial.classes?.length ? initial.classes : [{...emptyClass(),classId:initial.classId??null,className:initial.className,subclassId:initial.subclassId??null,subclassName:initial.subclassName??"",level:initial.level,rulesVersion:initial.classId?"2024":"custom"}]} : {
 name:"",portraitUrl:"",biography:"",className:"",species:"",classId:null,speciesId:null,backgroundId:null,subclassId:null,backgroundName:"",subclassName:"",classes:[emptyClass()],level:1,experience:0,hitPoints:1,maxHitPoints:1,temporaryHitPoints:0,armorClass:10,ownerId:ownId,attributes:{STR:10,DEX:10,CON:10,INT:10,WIS:10,CHA:10}
 });
 const [version,setVersion]=useState(initial?.version??0), [step,setStep]=useState(0), [busy,setBusy]=useState(false), [message,setMessage]=useState(""), [failed,setFailed]=useState(false);
 const editable=initial?initial.canEdit:canCreate;
 const change=(values:Partial<CharacterInput>)=>{setData(previous=>({...previous,...values}));setMessage("");};
 function move(index:number){setStep(index);setMessage("");setTimeout(()=>heading.current?.focus(),0);}
 function advance(){
  const fields=formRef.current?.querySelectorAll<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>("input,select,textarea");
  if(fields&&[...fields].some(field=>!field.reportValidity()))return;
  if(step===1&&!data.species.trim()){setFailed(true);setMessage("Selecione uma espécie ou informe uma opção personalizada.");return;}
  if(step===2){
   const rows=data.classes??[];
   if(!rows.length||rows.some(row=>!row.className.trim())||data.level>20){setFailed(true);setMessage("Escolha suas classes e distribua entre 1 e 20 níveis no total.");return;}
  }
  if(step===4){const parsed=characterFieldsSchema.strip().refine(value=>value.hitPoints<=value.maxHitPoints,{message:"PV atuais não podem ultrapassar os máximos."}).safeParse(data);if(!parsed.success){setFailed(true);setMessage(parsed.error.issues.map(issue=>issue.message).join(" "));return;}}
  move(step+1);
 }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step < 5) {
      advance();
      return;
    }
    setBusy(true);
    setMessage("");
    setFailed(false);
    // Envie apenas campos do contrato, sem metadados da resposta (id, modifiers, canEdit).
    const input = {
      classes: data.classes,
      portraitUrl: data.portraitUrl,
      biography: data.biography,
      multiclassAdjustment: data.multiclassAdjustment,
      name: data.name,
      className: data.className,
      species: data.species,
      classId: data.classId ?? null,
      speciesId: data.speciesId ?? null,
      backgroundId: data.backgroundId ?? null,
      subclassId: data.subclassId ?? null,
      backgroundName: data.backgroundName ?? "",
      subclassName: data.subclassName ?? "",
      level: data.level,
      experience: data.experience,
      hitPoints: data.hitPoints,
      maxHitPoints: data.maxHitPoints,
      temporaryHitPoints: data.temporaryHitPoints,
      armorClass: data.armorClass,
      attributes: data.attributes,
      ...(isGM ? { ownerId: data.ownerId } : {}),
    };
    try {
      const parsed = createCharacterSchema.safeParse(input);
      if (!parsed.success)
        throw new Error(
          parsed.error.issues.map((issue) => issue.message).join(" "),
        );
      const result = await apiRequest(
        `/api/campaigns/${campaignId}/characters${initial ? `/${initial.id}` : ""}`,
        initial ? "PATCH" : "POST",
        { ...input, ...(initial ? { expectedVersion: version } : {}) },
      );
      setMessage("Ficha salva com sucesso.");
      if (initial) {
        setVersion(Number(result.version));
      } else {
        router.push(
          returnSessionId
            ? `/campanhas/${campaignId}/sessoes/${returnSessionId}`
            : `/campanhas/${campaignId}/personagens/${result.id}`,
        );
        router.refresh();
      }
    } catch (error) {
      setFailed(true);
      setMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar. Tente novamente.",
      );
    } finally {
      setBusy(false);
    }
  }
  function numberField(
    key:
      | "level"
      | "experience"
      | "hitPoints"
      | "maxHitPoints"
      | "temporaryHitPoints"
      | "armorClass",
    label: string,
    min: number,
    max: number,
  ) {
    return (
      <label>
        {label}
        <input
          name={key}
          readOnly={key === "level" && Boolean(data.classes)}
          type="number"
          required
          min={min}
          max={max}
          value={Number.isNaN(data[key]) ? "" : data[key]}
          onChange={(event) => {
            const value = event.target.valueAsNumber;
            change({
              [key]: value,
              ...(key === "level" && data.subclassId && value < 3
                ? { subclassId: null, subclassName: "" }
                : {}),
            });
          }}
        />
      </label>
    );
  }

 return <>
 <p className="lead">{campaignName}. Monte sua ficha, uma escolha de cada vez. Você só salva ao confirmar a revisão.</p>
 <form ref={formRef} className="character-sheet" onSubmit={submit} noValidate>
 <fieldset disabled={!ready||busy||!editable}>
 <div className="sheet-heading"><Sparkles/><div><p className="eyebrow">REGISTRO DO AVENTUREIRO</p><h2 ref={heading} tabIndex={-1}>Etapa {step+1} de 6 · {stages[step]}</h2></div>{initial&&<span className="badge">VERSÃO {version}</span>}</div>
 <ol className="creation-progress" aria-label="Progresso da criação">{stages.map((stage,index)=><li key={stage} aria-current={index===step?"step":undefined}>{index+1}. {stage}</li>)}</ol>
 <section className="wizard-section" aria-label={stages[step]}>
 {step===0&&<><h3>Quem é seu aventureiro?</h3><div className="sheet-grid">
 <label>Nome do personagem<input name="name" required minLength={2} maxLength={120} value={data.name} onChange={e=>change({name:e.target.value})}/></label>
 <label>Imagem do personagem (URL HTTPS)<input type="url" maxLength={2048} value={data.portraitUrl??""} onChange={e=>change({portraitUrl:e.target.value})}/><small>Opcional. Use uma imagem que você tenha direito de compartilhar. Upload de arquivos ainda não está disponível.</small></label>
 <label>História e aparência<textarea maxLength={2000} value={data.biography??""} onChange={e=>change({biography:e.target.value})}/></label>
 {numberField("experience","Experiência",0,2000000000)}
 {isGM&&<label>Responsável pela ficha<select name="ownerId" value={data.ownerId??ownId} onChange={e=>change({ownerId:e.target.value})}>{members.map(member=><option key={member.userId} value={member.userId}>{member.label}</option>)}</select></label>}
 </div></>}
 {step===1&&<><h3>Suas origens</h3><p>Escolha uma espécie e, se desejar, um antecedente. Características e bônus ainda não são aplicados automaticamente.</p><div className="catalog-grid">
 <CatalogChoice label="Espécie" options={species} id={data.speciesId} name={data.species} onChange={(speciesId,species)=>change({speciesId,species})}/>
 <CatalogChoice label="Antecedente" options={backgrounds} id={data.backgroundId} name={data.backgroundName??""} optional onChange={(backgroundId,backgroundName)=>change({backgroundId,backgroundName})}/>
 </div></>}
 {step===2&&<><ClassDistribution rows={data.classes!} catalog={catalog} onChange={rows=>change({classes:rows,level:rows.reduce((sum,row)=>sum+row.level,0),className:rows[0]!.className,classId:rows[0]!.classId,subclassName:rows[0]!.subclassName,subclassId:rows[0]!.subclassId})}/>
 {isGM?<details><summary>Ajustes autorizados pelo mestre</summary><label>Ajuste de multiclasse autorizado pelo mestre<textarea maxLength={1000} value={data.multiclassAdjustment??""} onChange={e=>change({multiclassAdjustment:e.target.value})}/></label><p>A justificativa e o autor ficam registrados no histórico.</p></details>:data.multiclassAdjustment&&<p>Ajuste do mestre: {data.multiclassAdjustment}</p>}
 </>}
 {step===3&&<><h3>Atributos finais</h3><p>Informe os valores acordados com o mestre. Os modificadores são calculados automaticamente.</p>
            <div className="ability-grid">
              {abilityKeys.map((ability) => {
                const value = data.attributes[ability];
                const mod =
                  Number.isInteger(value) && value >= 1 && value <= 30
                    ? abilityModifier(value)
                    : null;
                return (
                  <label className="ability-card" key={ability}>
                    <span>{abilityLabels[ability]}</span>
                    <input
                      aria-label={abilityLabels[ability]}
                      type="number"
                      min={1}
                      max={30}
                      required
                      value={Number.isNaN(value) ? "" : value}
                      onChange={(event) =>
                        change({
                          attributes: {
                            ...data.attributes,
                            [ability]: event.target.valueAsNumber,
                          },
                        })
                      }
                    />
                    <output
                      aria-label={`Modificador de ${abilityLabels[ability]}`}
                    >
                      {mod === null ? "—" : `${mod >= 0 ? "+" : ""}${mod}`}
                    </output>
                    <small>modificador</small>
                  </label>
                );
              })}
            </div>
</>}
 {step===4&&<><h3>Recursos disponíveis</h3><p>Já disponíveis: pontos de vida e classe de armadura, preenchidos manualmente.</p><div className="sheet-grid">
 {numberField("hitPoints","PV atuais",0,100000)}{numberField("maxHitPoints","PV máximos",1,100000)}{numberField("temporaryHitPoints","PV temporários",0,100000)}{numberField("armorClass","Classe de armadura",0,100)}
 </div><p className="field-help">Habilidades, magias e equipamentos serão adicionados em próximas etapas. Nenhum recurso dessas categorias é concedido automaticamente nesta versão.</p></>}
 {step===5&&<><h3>Revise sua ficha</h3>
              <dl className="review-grid">
                {[
                  ["Campanha", campaignName ?? campaignId],
                  ["Personagem", data.name],
                  [
                    "Classe",
                    data.classes
                      ? data.classes
                          .map(
                            (row) =>
                              `${row.className} ${row.level} (classe ${row.rulesVersion}) — ${row.subclassName || "Sem subclasse"}${row.subclassId ? ` · ${subclasses.find((item) => item.id === row.subclassId)?.source.name ?? "Fonte manual"}` : ""}`,
                          )
                          .join(" / ")
                      : data.className,
                  ],
                  ["Espécie", data.species],
                  ["Antecedente", data.backgroundName || "Não escolhido"],
                  ...(data.classes
                    ? []
                    : [["Subclasse", data.subclassName || "Não escolhida"]]),
                  [
                    "Fonte da espécie",
                    species.find((item) => item.id === data.speciesId)?.source
                      .name ?? "Personalizada",
                  ],
                  [
                    "Fonte do antecedente",
                    backgrounds.find((item) => item.id === data.backgroundId)
                      ?.source.name ?? "Personalizado / não escolhido",
                  ],
                  ["Nível / XP", `${data.level} / ${data.experience}`],
                  [
                    "PV / máximos / temporários",
                    `${data.hitPoints} / ${data.maxHitPoints} / ${data.temporaryHitPoints}`,
                  ],
                  ["CA", data.armorClass],
                  ...(isGM
                    ? [
                        [
                          "Responsável",
                          members.find(
                            (member) => member.userId === data.ownerId,
                          )?.label ?? "",
                        ],
                      ]
                    : []),
                  ...abilityKeys.map((ability) => [
                    abilityLabels[ability],
                    `${data.attributes[ability]} (${abilityModifier(data.attributes[ability]) >= 0 ? "+" : ""}${abilityModifier(data.attributes[ability])})`,
                  ]),
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>

 {data.portraitUrl&&<p><a href={data.portraitUrl} target="_blank" rel="noopener noreferrer">Abrir imagem do personagem</a></p>}
 {data.biography&&<p>{data.biography}</p>}
 <p>Referências externas não aplicam regras automaticamente. Confira suas escolhas antes de salvar.</p></>}
 </section>
 <div className="inline-links">{step>0&&<button type="button" className="button" onClick={()=>move(step-1)}>Anterior</button>}{step<5?<button key="advance" type="button" className="button primary" onClick={e=>{e.preventDefault();advance();}}>Continuar</button>:editable&&<button key="save" type="submit" className="button primary">{busy?"Salvando…":"Salvar personagem"}</button>}</div>
 </fieldset>
 {message&&<p role={failed?"alert":"status"} className={failed?"form-error":"form-success"}>{message}</p>}
 {!editable&&<p>Ficha somente para leitura. A campanha está arquivada ou o mestre bloqueou a edição.</p>}
 </form>
 {returnSessionId&&<Link className="button" href={`/campanhas/${campaignId}/sessoes/${returnSessionId}`}>Voltar à sessão</Link>}
 <p className="sheet-help">Consulte as <Link href="/atribuicoes">fontes e atribuições</Link>. As referências não substituem as regras originais.</p>
 </>;
}
