import { useState, useMemo } from "react";
const FONT = "https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,700&family=IBM+Plex+Mono:wght@400;500;600&display=swap";
const BUDGET = 10000000, REVENUE = 24000000;
const CATS = [
  { id:"network",title:"Netværksstruktur",icon:"🌐",description:"Hvor sourcer I fra — og hvor afhængige er I af én leverandør eller region?",source:"WEF/Kearney 2026 · OECD Supply Chain Resilience Review 2025",options:[
    {id:"global_single",label:"Global single-source",cost:0,eff:100,res:15,passive:0,desc:"Én leverandør i Kina. Laveste pris, men 100% afhængige af én kilde og én rute.",costNote:"Ingen meromkostning i drift. Men ved leverandør-nedbrud mister I al forsyning."},
    {id:"global_dual",label:"Global dual-source",cost:800000,eff:88,res:50,passive:5,desc:"To leverandører i forskellige lande. Dyrere i drift, men I har en backup.",costNote:"800k kr. investering + 2,9 mio./år i driftsmeromkostning (12% af 24 mio.). Til gengæld: backup ved leverandør-nedbrud."},
    {id:"regional",label:"Regionalt netværk (nearshore)",cost:1800000,eff:75,res:70,passive:10,desc:"Leverandører i Europa og Tyrkiet. Kortere leadtimes, toldvenligt, dyrere enheder.",costNote:"1,8 mio. kr. + 6 mio./år i drift (25% meromkostning). Næsten upåvirket af Asien-disruptions og told."},
    {id:"multi_local",label:"Multi-lokalt netværk",cost:3500000,eff:60,res:90,passive:15,desc:"Produktion og leverandører tæt på hvert marked. Maksimal resiliens.",costNote:"3,5 mio. kr. + 9,6 mio./år i drift (40% meromkostning). Næsten immun over for geopolitiske chok."}]},
  { id:"inventory",title:"Lagerstrategi",icon:"📦",description:"Hvor mange ugers forbrug har I på lager? Lager beskytter automatisk — men binder kapital.",source:"Prologis 2026 · McKinsey Global Supply Chain Survey 2024",options:[
    {id:"jit",label:"Just-in-Time (2 uger)",cost:0,eff:100,res:10,passive:5,desc:"Minimalt lager. Frigjort kapital, men 2 ugers stop = tom hylde.",costNote:"Ingen meromkostning. Men enhver forsinkelse over 2 uger rammer kunderne direkte."},
    {id:"moderate",label:"Moderat buffer (6 uger)",cost:600000,eff:85,res:50,passive:15,desc:"6 ugers sikkerhedslager. Klarer de fleste korte forstyrrelser.",costNote:"600k kr. bundet kapital + 3,6 mio./år i drift. Køber 6 ugers pusterum ved disruption."},
    {id:"strategic",label:"Strategisk lager (12 uger)",cost:1400000,eff:70,res:75,passive:25,desc:"12 ugers buffer + kritiske komponenter. Klarer lange forsyningsstop.",costNote:"1,4 mio. kr. + 7,2 mio./år. I kan levere normalt i 3 måneder uden forsyning."},
    {id:"heavy",label:"Stort sikkerhedslager (6 mdr)",cost:2800000,eff:55,res:90,passive:35,desc:"6 måneders buffer. Næsten umuligt at løbe tør — men dyrt.",costNote:"2,8 mio. kr. + 10,8 mio./år. Immune over for næsten alle forsyningsstop."}]},
  { id:"flexibility",title:"Produktions-fleksibilitet",icon:"🔄",description:"Kan jeres linjer skifte marked/produkt? Har I ledig kapacitet til at skalere op?",source:"WEF/Kearney 2026 · McKinsey: Kapacitets-omallokering minimerer nedetid",options:[
    {id:"dedicated",label:"Dedikerede linjer (0% buffer)",cost:0,eff:100,res:10,passive:0,desc:"Hver linje kun ét produkt. 100% udnyttelse. Nul omstilling.",costNote:"Ingen meromkostning. Men I kan hverken omstille eller skalere op."},
    {id:"some_flex",label:"Delvis fleksibel (10% buffer)",cost:500000,eff:92,res:40,passive:5,desc:"Visse linjer omstilles med 1-2 ugers varsel. 10% ledig kapacitet.",costNote:"500k kr. + 1,9 mio./år (8% tab). Delvis omstilling og 10% opskalering."},
    {id:"multi_capable",label:"Multi-market + 20% buffer",cost:1200000,eff:82,res:70,passive:10,desc:"De fleste linjer kan skifte marked inden for dage. 20% bufferkapacitet.",costNote:"1,2 mio. kr. + 4,3 mio./år (18% tab). Omdirigér produktion OG skalér 20% op."},
    {id:"full_agile",label:"Fuld agil + modulært design",cost:2200000,eff:70,res:90,passive:15,desc:"Alle linjer servicerer alle markeder. Modulært produktdesign. 30% buffer.",costNote:"2,2 mio. kr. + 7,2 mio./år (30% tab). Omstil inden for timer, substituer komponenter, skalér 30% op."}]},
  { id:"digital",title:"Digital modenhed",icon:"🤖",description:"Hvor hurtigt opdager I problemer — og kan I handle på viden? Afgør hvilke operationelle handlinger I kan tage.",source:"BCG Supply Chain Planning 2026 · ASCM Maturity Report 2026",
    costExplainer:"Digital modenhed afgør hvor mange operationelle handlinger I kan tage under et chok. Basis = de fleste handlinger er LÅST. AI-kontoltårn = næsten alt tilgængeligt.",
    options:[
    {id:"basic",label:"Basis (Excel + telefon)",cost:0,eff:80,res:10,passive:0,tier:0,desc:"Manuel planlægning. Opdager disruptions 1-2 uger for sent. De fleste handlinger er LÅST.",costNote:"Ingen investering, men 4,8 mio./år i lavere drift (20% tab). Ved disruption: 14 dage × 65k/dag = 910k kr. ekstra. Og de fleste operationelle handlinger er utilgængelige."},
    {id:"erp",label:"ERP + dashboards",cost:500000,eff:90,res:35,passive:5,tier:1,desc:"Leverandør- og ordresynlighed. Reaktionstid 8 dage. Åbner basale handlinger.",costNote:"500k kr. + 2,4 mio./år (10% tab). Reaktion halveret → 520k per chok. Åbner handlinger der kræver leverandøroverblik."},
    {id:"advanced",label:"Avanceret planlægning (APS)",cost:1200000,eff:95,res:65,passive:10,tier:2,desc:"Scenariemodellering, what-if, multi-tier synlighed. 4 dage. Åbner avancerede handlinger.",costNote:"1,2 mio. kr. + 1,2 mio./år (5% tab). 260k per chok. Åbner scenariebaseret omfordeling og optimering."},
    {id:"ai_orchestrated",label:"AI-orkestreret kontoltårn",cost:2500000,eff:98,res:85,passive:15,tier:3,desc:"Real-time, prædiktivt. 1 dag. Åbner proaktive handlinger — I handler FØR chokket rammer.",costNote:"2,5 mio. kr. + 480k/år (2% tab). 65k per chok. Proaktive handlinger: systemet forudser og reagerer automatisk."}]},
  { id:"sustainability",title:"Bæredygtighed & compliance",icon:"🌱",description:"CO₂-dokumentation, CBAM-parathed, egen energi — og kundernes tillid.",source:"UNCTAD 2026: EU's CBAM · Prologis: 87% oplevede energi-disruptions",options:[
    {id:"minimum",label:"Minimum compliance",cost:0,eff:95,res:10,passive:0,desc:"Overholder lov. Ingen CO₂-sporing, ingen CBAM-forberedelse, ingen egen energi.",costNote:"Ingen investering. Men CBAM rammer fuldt, energikriser koster 100%, og kunder spørger til ESG."},
    {id:"moderate_green",label:"Moderat grøn",cost:400000,eff:90,res:45,passive:10,desc:"CBAM-dokumentation, CO₂-sporing, basis ESG. Noget energi-resiliens.",costNote:"400k kr. + 1,2 mio./år (5% tab). Reducerer CBAM-afgifter og giver grundlag for energi-optimering."},
    {id:"leader",label:"Bæredygtighedsleder",cost:1000000,eff:82,res:70,passive:15,desc:"Science-based targets, fuld transparens, solcellepark + batterilager.",costNote:"1 mio. kr. + 4,3 mio./år (18% tab). CBAM neutraliseret, energikriser rammer minimalt, kunder ser jer som sikker partner."},
    {id:"pioneer",label:"Pioner / net-zero",cost:2200000,eff:72,res:88,passive:20,desc:"Carbon-neutral, regenerativ sourcing, fuld energi-uafhængighed.",costNote:"2,2 mio. kr. + 6,7 mio./år (28% tab). Immun over for CBAM og energichok."}]}
];
const SHOCKS = [
  { id:"sf",title:"Fabriksbrand hos nøgleleverandør",type:"Leverandør-chok",icon:"🔥",description:"Primær leverandør i Kina rammes af storbrand. Produktion stoppet 10 uger. 40% af forsyningen forsvinder.",source:"McKinsey Global Supply Chain Survey",baseDamage:3200000,passiveCats:["inventory","network"],actions:[
    {id:"a1",label:"Aktivér backup-leverandør",savesPct:30,reqDigi:1,reqNet:"global_dual",desc:"Skift ordrer til sekundær leverandør inden for dage.",
      mechanism:"Jeres ERP indeholder en opdateret leverandørdatabase med priser, leadtimes og ledig kapacitet. Da branden rammer, trækker I inden for 2 timer en liste over hvem der kan levere — og sender ordreforespørgsler samme dag. Uden ERP bruger I 1-2 uger på at ringe rundt.",
      lockExplain:"LÅST: I har ingen backup-leverandør (kræver mindst dual-source) og/eller intet system til hurtigt at finde alternativer (kræver mindst ERP). Uden disse bruger I uger på at finde en ny leverandør fra bunden — og betaler spotmarkedspriser."},
    {id:"a2",label:"Flyt produktion til anden site/linje",savesPct:25,reqDigi:2,reqFlex:"multi_capable",desc:"Omfordel manglende volumen til andre produktionssteder.",
      mechanism:"Jeres APS beregner hvilke linjer der har ledig kapacitet, hvad omstilling koster, og hvor lang tid det tager. Inden for 4 timer har I en plan. Fordi jeres linjer er multi-market, kan omstillingen ske inden for dage.",
      lockExplain:"LÅST: Jeres linjer kan kun producere ét produkt (kræver multi-market linjer) og/eller I mangler planlægningsværktøj til at beregne omfordeling (kræver APS). Uden disse kan I ikke flytte produktion."},
    {id:"a3",label:"Tilbyd kunder alternativt produkt",savesPct:15,reqDigi:1,desc:"Styr kunder mod produkter I har på lager i stedet for at annullere.",
      mechanism:"Jeres ERP viser i realtid hvad der ligger på lager. Salgsteamet tilbyder straks et alternativ der opfylder kundens behov. I beholder omsætningen.",
      lockExplain:"LÅST: Uden ERP ved I ikke hvad der ligger på lager. Kunden får 'vi vender tilbage' — og ringer til konkurrenten."},
    {id:"a4",label:"Proaktiv kundekommunikation",savesPct:10,reqDigi:-1,desc:"Ring før kunden opdager problemet. Forhandl forlænget leveringstid.",
      mechanism:"I ringer selv og forklarer ærligt. De fleste accepterer 1-2 ugers forsinkelse hvis de hører det tidligt.",lockExplain:null}]},
  { id:"pb",title:"Blokade af Rødehavet-ruten",type:"Logistik-disruption",icon:"🚢",description:"Geopolitisk spænding lukker Bab el-Mandeb. Container-costs +40%. Leveringstider fra Asien fordobles.",source:"WEF Global Value Chains Outlook 2026",baseDamage:2400000,passiveCats:["inventory"],actions:[
    {id:"b1",label:"Omdirigér fragt via Kap det Gode Håb",savesPct:25,reqDigi:1,desc:"Book om til længere rute. Dyrere, men undgår blokaden.",
      mechanism:"Jeres ERP har integration til speditøren og viser alle aktive shipments. I identificerer inden for timer hvilke containere der er påvirket og ombooken dem. Uden ERP ringer I til speditøren og venter dage på svar.",
      lockExplain:"LÅST: Uden ERP med shipping-synlighed kan I ikke se hvilke containere der er påvirket. I venter passivt mens forsinkelsen vokser."},
    {id:"b2",label:"Aktivér europæisk nødleverandør",savesPct:25,reqDigi:0,reqNet:"regional",desc:"Køb fra europæisk leverandør der ikke er påvirket af søblokade.",
      mechanism:"I har allerede relationer med europæiske leverandører. De kender jeres specs, har kreditaftaler, og kan levere inden for dage via lastbil. Ingen skib, ingen blokade.",
      lockExplain:"LÅST: I har ingen europæiske leverandør-relationer (kræver regionalt netværk). At finde en ny europæisk leverandør fra bunden tager måneder."},
    {id:"b3",label:"Luftfragt for kritiske komponenter",savesPct:15,reqDigi:2,desc:"Fly de 10% mest kritiske dele ind. Dyrt men hurtigt.",
      mechanism:"Jeres APS analyserer hele styklisten og identificerer de 5-10 komponenter der er flaskehals. Kun dem flyver I ind. Uden APS gætter I — og flyver enten for meget (for dyrt) eller det forkerte.",
      lockExplain:"LÅST: Uden APS kan I ikke analysere hvilke komponenter der er kritiske. I risikerer at flyve det forkerte ind."}]},
  { id:"ds",title:"Storkunde tredobler ordre",type:"Efterspørgsels-chok",icon:"📈",description:"Akut offshore-kontrakt. Markedet +25%. I leverer — eller mister ordren til en konkurrent.",source:"Prologis 2026 · BCG Planning Report 2026",baseDamage:2000000,passiveCats:["inventory"],actions:[
    {id:"c1",label:"Skalér op med bufferkapacitet",savesPct:30,reqDigi:1,reqFlex:"multi_capable",desc:"Brug jeres ledige 20% kapacitet + omstil linjer.",
      mechanism:"I har bevidst holdt 20% kapacitet ledig. ERP viser hvilke linjer der kan omstilles hurtigst. I skalerer op inden for en uge. Uden buffer kører I allerede på 100% — der er intet at skalere med.",
      lockExplain:"LÅST: Jeres linjer kører på 100% (kræver multi-market + buffer), og/eller I har intet overblik over hvad der kan flyttes (kræver ERP). I kan ikke levere."},
    {id:"c2",label:"Proaktiv opskalering — I var allerede klar",savesPct:30,reqDigi:3,desc:"AI opfangede signalet og begyndte opskalering FØR kunden ringede.",
      mechanism:"Jeres AI-kontoltårn analyserer løbende markedsdata: offshore-kontrakter, kundens indkøbsmønstre, branchenyheder. For 2 uger siden flaggede systemet 70% sandsynlighed for øget efterspørgsel og boostede produktionen automatisk. Da kunden ringer, har I allerede ekstra enheder.",
      lockExplain:"LÅST: Uden AI-kontoltårn opdager I først efterspørgslen da kunden ringer — og da er det for sent. Kunden venter ikke 4 uger."},
    {id:"c3",label:"Overarbejde og weekendskift",savesPct:15,reqDigi:-1,desc:"Pres ekstra volumen ud med ekstra timer.",
      mechanism:"Alle medarbejdere på overarbejde + weekendskift. Output +15%, men det tager 1-2 uger at organisere og er dyrt.",lockExplain:null}]},
  { id:"mr",title:"Nøglemarked lukker — omdirigér produktion",type:"Markeds-chok",icon:"🔀",description:"Næststørste eksportmarked indfører importforbud. 30% af produktionen skal omdirigeres inden for uger.",source:"WEF/Kearney 2026",baseDamage:2600000,passiveCats:["network"],actions:[
    {id:"d1",label:"Omstil linjer til andet marked",savesPct:30,reqDigi:1,reqFlex:"multi_capable",desc:"Tilpas produktspecs, emballage og certificeringer.",
      mechanism:"Jeres linjer er designet til at skifte marked — specs og certificeringer er modulært opsat. ERP tracker hvilke certificeringer I har for hvilke markeder. Omstilling tager dage. Uden multi-market linjer kræver det ny certificering (3-6 mdr).",
      lockExplain:"LÅST: Jeres linjer er låst til ét marked (kræver multi-market) og/eller I har ikke overblik over certificeringskrav (kræver ERP). Omstilling tager måneder — ikke dage."},
    {id:"d2",label:"Automatisk omfordeling af ordreportefølje",savesPct:25,reqDigi:2,desc:"APS beregner optimal fordeling på tværs af markeder.",
      mechanism:"APS kører scenariemodeller: givet at marked X er lukket, hvad er optimal fordeling baseret på margin, kapacitet, transport og kundeaftaler? Systemet leverer en plan inden for timer. Uden APS sidder I med et regneark og gætter.",
      lockExplain:"LÅST: Uden APS kan I ikke modellere optimal omfordeling. I risikerer at sende varer til forkerte markeder og miste margin."},
    {id:"d3",label:"Akut salgsindsats",savesPct:10,reqDigi:-1,desc:"Salgsteam på overarbejde for at finde nye kunder.",
      mechanism:"Sælgerne ringer til eksisterende kontakter. Det tager tid og giver lav hitrate, men det er bedre end usolgte varer.",lockExplain:null}]},
  { id:"ts",title:"EU indfører 25% told + CBAM-afgift",type:"Regulatorisk chok",icon:"🏛️",description:"EU indfører 25% told på komponenter fra Asien. Samtidig træder CBAM i kraft — en CO₂-afgift der rammer importører uden dokumenteret lavt klimaaftryk ekstra hårdt.",source:"UNCTAD Global Trade Update 2026",baseDamage:2800000,passiveCats:["network","sustainability"],actions:[
    {id:"e1",label:"Flyt indkøb fra Asien til europæiske leverandører",savesPct:30,reqDigi:1,reqNet:"global_dual",desc:"Omfordel ordrer til leverandører der ikke rammes af Asien-tolden.",
      mechanism:"I har allerede en sekundær leverandør. ERP viser hvilke ordrer der er på vej fra Asien, hvad alternativprisen er, og hvad besparelsen er versus tolden. I omfordeler inden for dage. Uden dual-source har I ingen at flytte til.",
      lockExplain:"LÅST: I har ingen alternativ leverandør uden for Asien (kræver dual-source) og/eller I kan ikke beregne cost-benefit (kræver ERP). I betaler den fulde told."},
    {id:"e2",label:"Brug CBAM-dokumentation til at reducere CO₂-afgift",savesPct:20,reqDigi:2,reqSust:"moderate_green",desc:"Jeres CO₂-data beviser lavt klimaaftryk — CBAM-afgiften reduceres.",
      mechanism:"CBAM kræver at importører dokumenterer CO₂-udledning per produkt. I har CO₂-sporing og APS kan automatisk generere dokumentation. Resultat: I betaler lavere CBAM end konkurrenter uden data. Uden CO₂-sporing betaler I maks-afgiften.",
      lockExplain:"LÅST: I har ingen CO₂-sporingsdata (kræver mindst moderat grøn) og/eller I kan ikke integrere data i CBAM-rapportering (kræver APS). I betaler den fulde CO₂-tillægsafgift."},
    {id:"e3",label:"Absorbér tolden kortsigtet",savesPct:10,reqDigi:-1,desc:"Spis omkostningen for at beholde markedsandelen.",
      mechanism:"I hæver ikke priserne og accepterer lavere margin. Bevarer kundeforhold, men ikke holdbart.",lockExplain:null}]},
  { id:"ec",title:"Energikrise: strømpriser +300%",type:"Energi-disruption",icon:"⚡",description:"Strømpriser eksploderer. Lager, produktion og transport rammes. El-regningen tredobles.",source:"Prologis 2026: 87% oplevede energi-disruptions",baseDamage:1800000,passiveCats:["sustainability"],actions:[
    {id:"f1",label:"Aktivér egen solcellepark + batteribank",savesPct:35,reqDigi:0,reqSust:"leader",desc:"Jeres egen energiproduktion overtager — uafhængige af netprisen.",
      mechanism:"I investerede i solceller og batterilager. Når netpriserne tredobles, kører I på egen strøm. Driftsomkostninger stiger kun marginalt. Konkurrenterne betaler 300% ekstra.",
      lockExplain:"LÅST: I har ingen egen energiproduktion (kræver bæredygtighedsleder-niveau). I er 100% afhængige af netpriser og betaler den fulde stigning."},
    {id:"f2",label:"AI-optimeret energi-planlægning",savesPct:25,reqDigi:2,desc:"System flytter energi-tunge processer til billige timer.",
      mechanism:"APS er integreret med el-børsdata og kender timepriserne. Energi-tunge processer flyttes til nat/weekend. Lette processer i dagtimerne. Resultat: 25% lavere energiregning end uden optimering.",
      lockExplain:"LÅST: Uden APS med energi-integration planlægger I produktion uden hensyn til strømpris. I betaler toppris i de dyreste timer."},
    {id:"f3",label:"Reducer til ét skift i dyre timer",savesPct:15,reqDigi:-1,desc:"Kør kun produktion når strømmen er billigst. Output falder.",
      mechanism:"I lukker produktion i de dyreste 8 timer. El-regningen falder, men output falder ~30%. Kompensér delvist med lager.",lockExplain:null}]}
];
function getOpt(cid,oid){return CATS.find(c=>c.id===cid)?.options.find(o=>o.id===oid)}
function getIdx(cid,oid){const c=CATS.find(c2=>c2.id===cid);return c?c.options.findIndex(o=>o.id===oid):-1}
function calcPassive(ev,sels){let t=0;(ev.passiveCats||[]).forEach(cid=>{t+=(getOpt(cid,sels[cid])?.passive||0)});return Math.min(t,40)}
function isUnlocked(a,sels){if(a.reqDigi<0)return true;const dT=getOpt("digital",sels.digital)?.tier??0;if(a.reqDigi>=0&&dT<a.reqDigi)return false;if(a.reqNet&&getIdx("network",sels.network)<getIdx("network",a.reqNet))return false;if(a.reqFlex&&getIdx("flexibility",sels.flexibility)<getIdx("flexibility",a.reqFlex))return false;if(a.reqSust&&getIdx("sustainability",sels.sustainability)<getIdx("sustainability",a.reqSust))return false;return true}
function fmt(n){const a=Math.abs(n),s=n<0?"-":"";if(a>=1e6)return s+(a/1e6).toFixed(1)+" mio.";if(a>=1e3)return s+Math.round(a/1e3)+"k";return s+Math.round(a).toLocaleString("da-DK")}
function fmtKr(n){return fmt(n)+" kr."}
function Bar({value,max,color,h=6}){return(<div style={{background:"rgba(255,255,255,0.06)",borderRadius:h/2,height:h,width:"100%",overflow:"hidden"}}><div style={{width:`${Math.min(100,Math.max(0,(value/max)*100))}%`,height:"100%",background:color,borderRadius:h/2,transition:"width 0.6s"}}/></div>)}
function InvestCard({cat,sel,onSel}){return(<div style={{marginBottom:28}}><div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}><span style={{fontSize:22}}>{cat.icon}</span><div><h3 style={{margin:0,fontSize:16,fontWeight:700,color:"#E8EDF2"}}>{cat.title}</h3><p style={{margin:0,fontSize:13,color:"#8899AA"}}>{cat.description}</p></div></div><div style={{fontSize:11,color:"#5A7A6B",fontStyle:"italic",marginBottom:cat.costExplainer?4:10,padding:"6px 10px",background:"rgba(42,157,143,0.06)",borderRadius:4,borderLeft:"2px solid #2A9D8F33",lineHeight:1.5}}>{"📚 "+cat.source}</div>{cat.costExplainer&&<div style={{fontSize:11,color:"#A08C5A",marginBottom:10,padding:"6px 10px",background:"rgba(233,196,106,0.06)",borderRadius:4,borderLeft:"2px solid #E9C46A33",lineHeight:1.5}}>{"💡 "+cat.costExplainer}</div>}<div style={{display:"grid",gap:8}}>{cat.options.map(o=>{const isSel=sel===o.id;return(<button key={o.id} onClick={()=>onSel(cat.id,o.id)} style={{background:isSel?"rgba(42,157,143,0.12)":"rgba(255,255,255,0.02)",border:`1px solid ${isSel?"#2A9D8F":"#1E2D45"}`,borderRadius:8,padding:"14px 16px",cursor:"pointer",textAlign:"left",transition:"all 0.2s",color:"inherit"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}><div style={{fontWeight:600,fontSize:14,color:isSel?"#2A9D8F":"#D0D8E0"}}>{isSel?"✓ ":""}{o.label}</div><div style={{fontFamily:"'IBM Plex Mono', monospace",fontSize:13,fontWeight:600,color:o.cost===0?"#667788":"#E9C46A",marginLeft:12}}>{o.cost===0?"Gratis":fmtKr(o.cost)}</div></div><div style={{fontSize:12,color:"#7A8A9A",lineHeight:1.5,marginBottom:4}}>{o.desc}</div><div style={{fontSize:11,color:"#8A7A5A",lineHeight:1.5,padding:"4px 8px",background:"rgba(233,196,106,0.04)",borderRadius:4}}>{"💰 "+o.costNote}</div></button>)})}</div></div>)}
function ShockCard({ev,sels,onComplete}){const ppct=calcPassive(ev,sels);const pSaved=Math.round(ev.baseDamage*ppct/100);const aftP=ev.baseDamage-pSaved;const[chosen,setChosen]=useState(new Set());const[done,setDone]=useState(false);const totAP=[...chosen].reduce((s,id)=>s+(ev.actions.find(a=>a.id===id)?.savesPct||0),0);const capA=Math.min(totAP,50);const aSaved=Math.round(aftP*capA/100);const fin=aftP-aSaved;const sc=fin<ev.baseDamage*0.3?"#2A9D8F":fin<ev.baseDamage*0.6?"#E9C46A":"#E63946";
  const pNames=(ev.passiveCats||[]).map(cid=>{const cat=CATS.find(c=>c.id===cid);const opt=getOpt(cid,sels[cid]);return{icon:cat?.icon,title:cat?.title,label:opt?.label,p:opt?.passive||0}}).filter(x=>x.p>0);
  return(<div style={{background:"rgba(255,255,255,0.02)",border:`1px solid ${done?sc:"#E63946"}33`,borderLeft:`3px solid ${done?sc:"#E63946"}`,borderRadius:8,padding:"18px 20px",marginBottom:16}}>
    <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:6,marginBottom:6}}><div><span style={{fontSize:20,marginRight:8}}>{ev.icon}</span><span style={{fontWeight:700,color:"#E8EDF2",fontSize:15}}>{ev.title}</span></div><span style={{fontSize:11,color:"#667788",padding:"2px 6px",background:"rgba(255,255,255,0.04)",borderRadius:3}}>{ev.type}</span></div>
    <p style={{fontSize:13,color:"#8899AA",margin:"0 0 14px",lineHeight:1.6}}>{ev.description}</p>
    <div style={{padding:"12px 14px",background:"rgba(0,0,0,0.12)",borderRadius:6,marginBottom:14}}>
      <div style={{fontFamily:"'IBM Plex Mono', monospace",fontSize:14,color:"#E63946",fontWeight:600,marginBottom:8}}>{"Potentiel skade: "+fmtKr(ev.baseDamage)}</div>
      {pNames.length>0?(<div><div style={{fontSize:12,color:"#8899AA",marginBottom:6}}>Automatisk beskyttelse (passiv — virker uden at I gør noget):</div>{pNames.map((p,i)=>(<div key={i} style={{fontSize:12,color:"#5A9A6B",marginBottom:2}}>{p.icon+" "+p.title+": \""+p.label+"\" → reducerer automatisk "+p.p+"% = "+fmtKr(Math.round(ev.baseDamage*p.p/100))}</div>))}<div style={{fontFamily:"'IBM Plex Mono', monospace",fontSize:13,color:"#E9C46A",fontWeight:600,marginTop:6}}>{"Resterende skade: "+fmtKr(aftP)+" (passiv beskyttelse sparede "+fmtKr(pSaved)+")"}</div></div>):(<div style={{fontSize:12,color:"#AA6666"}}>Ingen automatisk beskyttelse for dette chok. Kun operationelle handlinger kan reducere skaden.</div>)}
    </div>
    {!done?(<div style={{padding:"14px",background:"rgba(42,157,143,0.04)",borderRadius:8,border:"1px solid #2A9D8F22"}}>
      <div style={{fontSize:14,fontWeight:700,color:"#E8EDF2",marginBottom:4}}>{"🛠️ Operationel respons — hvad gør I?"}</div>
      <div style={{fontSize:12,color:"#8899AA",marginBottom:12,lineHeight:1.5}}>{"Den resterende skade er "+fmtKr(aftP)+". Vælg handlinger for at reducere den. Låste handlinger viser præcis hvad I mangler."}</div>
      {ev.actions.map(a=>{const ul=isUnlocked(a,sels);const ic=chosen.has(a.id);const sv=Math.round(aftP*a.savesPct/100);return(<div key={a.id} style={{padding:"14px",marginBottom:10,borderRadius:8,background:ul?(ic?"rgba(42,157,143,0.1)":"rgba(255,255,255,0.02)"):"rgba(230,57,70,0.03)",border:`1px solid ${ul?(ic?"#2A9D8F":"#1E2D45"):"#E6394622"}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
          <div style={{flex:1}}>
            <div style={{fontWeight:600,fontSize:14,color:ul?"#D0D8E0":"#776666",marginBottom:4}}>{(ul?"":"🔒 ")+a.label}</div>
            <div style={{fontSize:12,color:"#7A8A9A",marginBottom:8,lineHeight:1.4}}>{a.desc}</div>
            <div style={{fontSize:12,lineHeight:1.6,padding:"10px 12px",borderRadius:6,background:ul?"rgba(42,157,143,0.05)":"rgba(230,57,70,0.05)",borderLeft:`3px solid ${ul?"#2A9D8F44":"#E6394644"}`,color:ul?"#8A9AA4":"#AA7777"}}>{ul?a.mechanism:a.lockExplain}</div>
          </div>
          <div style={{textAlign:"right",minWidth:80}}>
            <div style={{fontFamily:"'IBM Plex Mono', monospace",fontSize:14,fontWeight:600,color:ul?"#2A9D8F":"#667788"}}>{fmtKr(sv)}</div>
            <div style={{fontSize:10,color:"#667788"}}>{"-"+a.savesPct+"% af skade"}</div>
            {ul&&<button onClick={()=>setChosen(p=>{const n=new Set(p);n.has(a.id)?n.delete(a.id):n.add(a.id);return n})} style={{marginTop:8,background:ic?"#2A9D8F":"transparent",color:ic?"#fff":"#8899AA",border:`1px solid ${ic?"#2A9D8F":"#445566"}`,borderRadius:4,padding:"6px 14px",cursor:"pointer",fontSize:12,fontWeight:600}}>{ic?"Valgt ✓":"Vælg"}</button>}
          </div>
        </div></div>)})}
      {chosen.size>0&&<div style={{fontFamily:"'IBM Plex Mono', monospace",fontSize:12,color:"#2A9D8F",marginTop:8}}>{"Operationel besparelse: "+fmtKr(aSaved)}{totAP>50&&<span style={{color:"#E9C46A"}}> (max 50%)</span>}</div>}
      <button onClick={()=>{setDone(true);onComplete(fin)}} style={{marginTop:8,background:"#2A9D8F",color:"#fff",border:"none",borderRadius:8,padding:"12px 24px",fontSize:14,fontWeight:600,cursor:"pointer",width:"100%"}}>Bekræft handlinger</button>
    </div>):(
    <div style={{padding:"14px",background:`${sc}08`,borderRadius:8,border:`1px solid ${sc}33`}}>
      <div style={{fontSize:14,fontWeight:700,color:"#E8EDF2",marginBottom:10}}>Resultat:</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,fontSize:12}}>
        {[{l:"Potentiel skade",v:ev.baseDamage,c:"#E63946"},{l:"Passiv beskyttelse",v:pSaved,c:"#5A9A6B"},{l:"Operationel respons",v:aSaved,c:"#2A9D8F"},{l:"Endeligt tab",v:fin,c:sc}].map((r,i)=>(<div key={i} style={{textAlign:"center",padding:"8px 4px",background:"rgba(0,0,0,0.1)",borderRadius:4}}><div style={{color:"#667788",fontSize:9,textTransform:"uppercase",letterSpacing:0.5}}>{r.l}</div><div style={{fontFamily:"'IBM Plex Mono', monospace",fontWeight:600,color:r.c,fontSize:14}}>{fmtKr(r.v)}</div></div>))}
      </div>
      <div style={{marginTop:10,fontSize:12}}>{[...chosen].map(id=>{const a=ev.actions.find(x=>x.id===id);return a?<div key={id} style={{color:"#5A9A6B",marginBottom:3}}>{"✓ "+a.label}</div>:null})}{chosen.size===0&&<div style={{color:"#887777",fontStyle:"italic"}}>Ingen operationelle handlinger valgt.</div>}</div>
    </div>)}
  </div>)}
export default function App(){const[mode,setMode]=useState(null);const[at,setAt]=useState(0);const[names]=useState(["Hold 1","Hold 2"]);const[phase,setPhase]=useState("intro");const[sels,setSels]=useState([{},{}]);const[si,setSi]=useState(0);const[fd,setFd]=useState([[],[]]);const[locked,setLocked]=useState([false,false]);
  const cs=sels[at],ti=useMemo(()=>CATS.reduce((s,c)=>s+(getOpt(c.id,cs[c.id])?.cost||0),0),[cs]),br=BUDGET-ti;
  const ae=useMemo(()=>{const o=CATS.map(c=>getOpt(c.id,cs[c.id])).filter(Boolean);return o.length?Math.round(o.reduce((s,x)=>s+x.eff,0)/o.length):100},[cs]);
  const allS=CATS.every(c=>cs[c.id]),driftKr=Math.round(REVENUE*(1-ae/100));
  const lockTeam=()=>{const nl=[...locked];nl[at]=true;setLocked(nl);if(mode==="1team"){setPhase("shocks");setSi(0)}else if(!nl[1-at])setAt(1-at);else{setPhase("shocks");setSi(0)}};
  const totDmg=fd[0].reduce((s,d)=>s+d,0);
  const r0=useMemo(()=>{const opts=CATS.map(c=>getOpt(c.id,sels[0][c.id])).filter(Boolean);const inv=opts.reduce((s,o)=>s+o.cost,0);const eff=opts.length===CATS.length?Math.round(opts.reduce((s,o)=>s+o.eff,0)/opts.length):100;const dr=Math.round(REVENUE*(1-eff/100));return{inv,eff,dr,net:REVENUE-dr-inv-totDmg}},[sels,totDmg]);
  const reset=()=>{setMode(null);setAt(0);setPhase("intro");setSels([{},{}]);setFd([[],[]]);setSi(0);setLocked([false,false])};
  const tc=at===0?"#2A9D8F":"#E9C46A",shDone=fd[0].length>si;
  return(<><link href={FONT} rel="stylesheet"/><div style={{fontFamily:"'DM Sans', sans-serif",color:"#C8D0DA",background:"#080E1A",minHeight:"100vh",padding:"20px 16px",maxWidth:900,margin:"0 auto"}}>
    <div style={{marginBottom:20,paddingBottom:14,borderBottom:"1px solid #141E33"}}><div style={{fontFamily:"'IBM Plex Mono', monospace",fontSize:10,letterSpacing:2,color:"#2A9D8F",textTransform:"uppercase",marginBottom:4}}>Supply Chain Resilience Game</div><h1 style={{margin:0,fontSize:22,fontWeight:700,color:"#E8EDF2"}}>Byg din forsyningskæde — overlev disruptionerne</h1><p style={{margin:"4px 0 0",fontSize:13,color:"#667788"}}>Baseret på WEF/Kearney, McKinsey, OECD, Prologis, BCG, UNCTAD og ASCM 2025–2026</p></div>
    {phase==="intro"&&!mode&&(<div style={{maxWidth:660,margin:"30px auto"}}>
      <div style={{background:"rgba(255,255,255,0.03)",borderRadius:10,padding:"20px 24px",marginBottom:24,border:"1px solid #1A2744"}}><div style={{fontSize:14,fontWeight:700,color:"#E8EDF2",marginBottom:10}}>{"🏭 Jeres virksomhed: NordicParts A/S"}</div><div style={{fontSize:13,color:"#8899AA",lineHeight:1.7}}><p style={{margin:"0 0 8px"}}>NordicParts er en mellemstor dansk producent af præcisionskomponenter til vindmølle- og offshore-industrien. Ca. 200 ansatte, centrallager i Taulov, eksport til Norden, Tyskland og UK.</p><p style={{margin:"0 0 8px"}}>Årlig omsætning: <strong style={{color:"#E9C46A"}}>24 mio. kr.</strong> Bestyrelsen har frigivet <strong style={{color:"#E9C46A"}}>10 mio. kr.</strong> til strategiske supply chain-investeringer.</p><p style={{margin:0}}>I dag: én leverandør i Kina, Just-in-Time, dedikerede linjer, Excel-planlægning, minimum compliance. Det fungerer — indtil det ikke gør.</p></div></div>
      <div style={{background:"rgba(255,255,255,0.03)",borderRadius:10,padding:"20px 24px",marginBottom:24}}><div style={{fontSize:14,fontWeight:700,color:"#E8EDF2",marginBottom:10}}>{"📋 Sådan fungerer spillet"}</div><div style={{fontSize:13,color:"#8899AA",lineHeight:1.7}}>
        <p style={{margin:"0 0 10px"}}><strong style={{color:"#2A9D8F"}}>Fase 1 — Investér:</strong> Fordel budgettet på 5 områder. Hvert valg viser hvad det koster i kroner — engangsinvestering og årlig driftsmeromkostning.</p>
        <p style={{margin:"0 0 10px"}}><strong style={{color:"#E63946"}}>Fase 2 — Chok + operationel respons:</strong> 6 disruptions rammer. Ved hvert chok:</p>
        <div style={{padding:"8px 12px",background:"rgba(0,0,0,0.12)",borderRadius:6,marginBottom:10,fontSize:12,lineHeight:1.8}}>
          <strong style={{color:"#D0D8E0"}}>1. Passiv beskyttelse</strong> — noget mitigeres automatisk (f.eks. lager der allerede ligger der). Lille effekt.<br/>
          <strong style={{color:"#D0D8E0"}}>2. Operationelle handlinger</strong> — her ligger den store besparelse. I vælger aktivt hvad I gør. Men handlingerne kræver at I har investeret rigtigt. <strong>Låste handlinger viser præcis hvad I mangler og hvorfor.</strong><br/>
          Jo mere digital modenhed, jo flere handlinger er tilgængelige.
        </div>
        <p style={{margin:0}}><strong style={{color:"#E9C46A"}}>Fase 3 — Bundlinje:</strong> Netto = Omsætning – Driftsomkostninger – Investeringer – Chok-skader. Flest penge vinder.</p>
      </div></div>
      <div style={{textAlign:"center"}}><div style={{fontSize:14,fontWeight:700,color:"#D0D8E0",marginBottom:12}}>Hvor mange hold spiller?</div><div style={{display:"flex",gap:12,justifyContent:"center"}}><button onClick={()=>{setMode("1team");setPhase("invest")}} style={{background:"#2A9D8F",color:"#fff",border:"none",borderRadius:8,padding:"14px 32px",fontSize:15,fontWeight:700,cursor:"pointer"}}>1 hold</button><button onClick={()=>{setMode("2team");setPhase("invest")}} style={{background:"#E9C46A",color:"#080E1A",border:"none",borderRadius:8,padding:"14px 32px",fontSize:15,fontWeight:700,cursor:"pointer"}}>2 hold</button></div></div>
    </div>)}
    {phase==="invest"&&(<>
      {mode==="2team"&&<div style={{background:`${tc}15`,border:`1px solid ${tc}44`,borderRadius:8,padding:"12px 16px",marginBottom:16,textAlign:"center"}}><span style={{fontWeight:700,color:tc,fontSize:16}}>{names[at]}</span><span style={{color:"#8899AA",fontSize:13,marginLeft:8}}>{"— vælg strategi"}</span></div>}
      <div style={{position:"sticky",top:0,zIndex:10,background:"#080E1A",padding:"12px 0",marginBottom:16,borderBottom:"1px solid #141E33"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,flexWrap:"wrap",gap:8}}>
          <div style={{fontSize:13}}><span style={{color:"#667788"}}>Budget: </span><span style={{fontFamily:"'IBM Plex Mono', monospace",fontWeight:600,color:br>=0?"#E9C46A":"#E63946"}}>{fmtKr(br)}</span><span style={{color:"#667788"}}>{" af "+fmtKr(BUDGET)}</span></div>
          <div style={{fontSize:12,color:"#667788"}}>{"Årlig driftsmeromkostning: "}<strong style={{color:"#E9C46A",fontFamily:"'IBM Plex Mono', monospace"}}>{fmtKr(driftKr)}</strong></div>
        </div>
        <Bar value={Math.max(0,br)} max={BUDGET} color={br>=0?"#E9C46A":"#E63946"}/>{br<0&&<div style={{color:"#E63946",fontSize:11,marginTop:4}}>{"⚠ Budget overskredet"}</div>}
      </div>
      {CATS.map(c=>(<InvestCard key={c.id} cat={c} sel={cs[c.id]} onSel={(cid,oid)=>{const n=[...sels];n[at]={...n[at],[cid]:oid};setSels(n)}}/>))}
      <div style={{textAlign:"center",paddingBottom:24}}><button onClick={lockTeam} disabled={!allS||br<0} style={{background:allS&&br>=0?tc:"#2A3654",color:allS&&br>=0?(at===0?"#fff":"#080E1A"):"#667788",border:"none",borderRadius:8,padding:"14px 40px",fontSize:15,fontWeight:700,cursor:allS&&br>=0?"pointer":"not-allowed"}}>{!allS?"Vælg alle 5 kategorier":br<0?"Budget overskredet":mode==="2team"&&!locked[1-at]?`Lås ${names[at]} → ${names[1-at]}`:"Lås → kør chok-scenarier →"}</button></div>
    </>)}
    {phase==="shocks"&&(<>
      <div style={{fontSize:14,color:"#8899AA",marginBottom:16}}><strong style={{color:"#E8EDF2"}}>Fase 2: </strong>{"Chok "+(si+1)+" af "+SHOCKS.length}</div>
      <ShockCard key={SHOCKS[si].id} ev={SHOCKS[si]} sels={sels[0]} onComplete={d=>{const n=[...fd];n[0]=[...n[0],d];setFd(n)}}/>
      {shDone&&<div style={{textAlign:"center",padding:"12px 0 20px"}}><button onClick={()=>{if(si<SHOCKS.length-1)setSi(si+1);else setPhase("results")}} style={{background:si<SHOCKS.length-1?"rgba(230,57,70,0.15)":"#2A9D8F",color:si<SHOCKS.length-1?"#E63946":"#fff",border:`1px solid ${si<SHOCKS.length-1?"#E6394644":"#2A9D8F"}`,borderRadius:8,padding:"14px 36px",fontSize:15,fontWeight:700,cursor:"pointer"}}>{si<SHOCKS.length-1?`⚡ Næste chok (${si+2}/${SHOCKS.length})`:"Se bundlinje →"}</button></div>}
    </>)}
    {phase==="results"&&(<div style={{maxWidth:740,margin:"0 auto"}}>
      <h2 style={{textAlign:"center",color:"#E8EDF2",fontSize:20,marginBottom:24}}>{"📊 NordicParts A/S — Årsresultat"}</h2>
      <div style={{background:"rgba(255,255,255,0.02)",borderRadius:10,padding:"20px 24px",marginBottom:20}}>
        {[{l:"Årlig omsætning",v:REVENUE,c:"#D0D8E0"},{l:"Driftsmeromkostninger",v:-r0.dr,c:"#E9C46A"},{l:"Engangsinvesteringer",v:-r0.inv,c:"#E9C46A"},{l:"Chok-skader (efter respons)",v:-totDmg,c:"#E63946"}].map((rr,i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:i<3?"1px solid #141E33":"none",fontSize:13}}><span style={{color:"#8899AA"}}>{rr.l}</span><span style={{fontFamily:"'IBM Plex Mono', monospace",fontWeight:600,color:rr.c}}>{rr.v>=0?"+":""}{fmtKr(rr.v)}</span></div>))}
        <div style={{display:"flex",justifyContent:"space-between",padding:"14px 0 0",marginTop:8,borderTop:"2px solid #2A3654",fontSize:16}}><span style={{fontWeight:700,color:"#E8EDF2"}}>Netto</span><span style={{fontFamily:"'IBM Plex Mono', monospace",fontWeight:700,fontSize:22,color:r0.net>=0?"#2A9D8F":"#E63946"}}>{fmtKr(r0.net)}</span></div>
      </div>
      <div style={{background:"rgba(255,255,255,0.02)",borderRadius:8,padding:"16px 20px",marginBottom:20}}><div style={{fontWeight:600,color:"#D0D8E0",marginBottom:8,fontSize:13}}>Skade per chok</div>{SHOCKS.map((ev,i)=>(<div key={ev.id} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #0E1829",fontSize:12}}><span>{ev.icon+" "}<span style={{color:"#8899AA"}}>{ev.title}</span></span><span style={{fontFamily:"'IBM Plex Mono', monospace",color:(fd[0][i]||0)<ev.baseDamage*0.3?"#2A9D8F":(fd[0][i]||0)<ev.baseDamage*0.6?"#E9C46A":"#E63946",fontWeight:500}}>{fmtKr(fd[0][i]||0)}<span style={{color:"#556677"}}>{" / "+fmtKr(ev.baseDamage)}</span></span></div>))}</div>
      <div style={{background:"rgba(255,255,255,0.03)",borderRadius:8,padding:"16px 20px",marginBottom:20,fontSize:13,color:"#8899AA",lineHeight:1.8}}>
        <div style={{fontWeight:700,color:"#E8EDF2",marginBottom:10}}>{"💬 Refleksion"}</div>
        <div style={{marginBottom:6}}><strong style={{color:"#D0D8E0"}}>1.</strong> Hvor mange handlinger var låst? Hvad ville ét trin højere investering have åbnet?</div>
        <div style={{marginBottom:6}}><strong style={{color:"#D0D8E0"}}>2.</strong> Ligner NordicParts udgangspunkt jeres virksomhed? Hvor er I længst — og hvor halter I?</div>
        <div style={{marginBottom:6}}><strong style={{color:"#D0D8E0"}}>3.</strong> Hvis én af jeres produktionssites lukkede i morgen, kan en anden tage over? Hvad kræver det?</div>
        <div style={{marginBottom:6}}><strong style={{color:"#D0D8E0"}}>4.</strong> Oplevede I at digital investering åbnede handlinger I ellers var låst ude fra?</div>
        <div style={{marginBottom:6}}><strong style={{color:"#D0D8E0"}}>5.</strong> Hvis I fik 1 mio. ekstra — ét tiltag — hvad åbner flest handlinger?</div>
        <div><strong style={{color:"#D0D8E0"}}>6.</strong> Hvilken låst handling ville I ønske I havde? Hvad koster det at låse den op?</div>
      </div>
      <div style={{textAlign:"center",paddingBottom:24}}><button onClick={reset} style={{background:"transparent",color:"#8899AA",border:"1px solid #2A3654",borderRadius:8,padding:"12px 30px",fontSize:14,cursor:"pointer"}}>{"↻ Nyt spil"}</button></div>
    </div>)}
  </div></>)}
