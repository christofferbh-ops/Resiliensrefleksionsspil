import { useState, useMemo } from "react";
const FONT = "https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,700&family=IBM+Plex+Mono:wght@400;500;600&display=swap";
const BUDGET = 10000000, REVENUE = 24000000;

const CATS = [
  { id:"network",title:"Netværksstruktur",icon:"🌐",
    description:"Hvor sourcer I fra — og hvor afhængige er I af én region?",
    source:"WEF/Kearney 2026 · OECD Resilience Review 2025",
    options:[
      {id:"global_single",label:"Global single-source (Kina)",cost:0,eff:100,passive:0,desc:"Én leverandør i Kina. Laveste pris, 100% afhængig.",costNote:"Ingen meromkostning. Men al forsyning forsvinder ved ét nedbrud."},
      {id:"china_plus_one",label:"China + 1 (f.eks. Vietnam)",cost:600000,eff:91,passive:4,desc:"Primær i Kina + sekundær i Vietnam. Billigere end fuld diversificering, men Vietnam har strukturelle lofter: arbejdskraftmangel (Bac Ninh mangler 330.000+ arbejdere), begrænset industriland og kapacitet der ikke matcher Kinas skala.",costNote:"600k + 2,2 mio./år (9%). Backup — men backup'en har begrænsninger."},
      {id:"global_dual",label:"Global dual-source (spredt)",cost:1000000,eff:86,passive:7,desc:"To leverandører i forskellige regioner (f.eks. Tyrkiet + Sydøstasien). Ægte diversificering.",costNote:"1 mio. + 3,4 mio./år (14%). Reel diversificering — ikke afhængig af én regions kapacitet."},
      {id:"regional",label:"Regionalt netværk (nearshore)",cost:1800000,eff:75,passive:11,desc:"Leverandører i Europa. Kortere leadtimes, toldvenligt, dyrere enheder.",costNote:"1,8 mio. + 6 mio./år (25%). Næsten upåvirket af Asien-disruptions."},
      {id:"local",label:"Lokalt netværk hvor muligt",cost:2800000,eff:65,passive:15,desc:"Dansk/nordisk sourcing + produktion hvor muligt. Ikke alt kan sources lokalt, men det der kan, er tæt på og kontrollerbart.",costNote:"2,8 mio. + 8,4 mio./år (35%). Mest resilient, men dyrest. Visse specialkomponenter skal stadig importeres."},
    ]},
  { id:"supplier_rel",title:"Leverandørrelationer",icon:"🤝",
    description:"Kontrakttype og samarbejdsdybde med jeres leverandører.",
    source:"Maersk/Deloitte 2025 · SupplyChainBrain 2026: Partnerskaber bygger gensidig resiliens.",
    options:[
      {id:"contract_based",label:"Kontraktbaseret (standard)",cost:0,eff:100,passive:0,desc:"Standard indkøbskontrakter med fast pris og leveringsbetingelser. Ingen informationsdeling ud over ordrer. Leverandøren har intet incitament til at prioritere jer.",costNote:"Ingen meromkostning. Men I er sidst i køen når alle kæmper om kapacitet."},
      {id:"preferred",label:"Foretrukken leverandør",cost:300000,eff:96,passive:4,desc:"Længere kontrakter, noget informationsdeling, kvartalsvis review. Leverandøren kender jer og giver forrang.",costNote:"300k + 960k/år (4%). I får prioritet ved kapacitetsmangel."},
      {id:"strategic",label:"Strategisk partnerskab",cost:700000,eff:89,passive:8,desc:"Fælles planlægning, kapacitetsreservation, delt forecast. Leverandøren investerer i fleksibilitet for jer.",costNote:"700k + 2,6 mio./år (11%). Leverandøren holder kapacitet og deler risiko."},
      {id:"integrated",label:"Integreret samarbejde",cost:1200000,eff:82,passive:12,desc:"Fuld integration: delt data, joint business planning, fælles investeringer. Nærmest en forlængelse af jer.",costNote:"1,2 mio. + 4,3 mio./år (18%). Leverandøren behandler jer som en del af deres forretning."},
    ]},
  { id:"product_design",title:"Produktdesign",icon:"🔧",
    description:"Er produktet designet så komponenter kan substitueres mellem leverandører?",
    source:"SupplyChainBrain 2026: 'Standardized designs producible in different regions' som nøgle-tiltag.",
    options:[
      {id:"proprietary",label:"Proprietært design",cost:0,eff:100,passive:0,desc:"Unikke komponenter fra specifikke leverandører. Højeste ydeevne, men komponent X kan KUN komme fra leverandør Y.",costNote:"Ingen meromkostning. Men én manglende komponent stopper alt."},
      {id:"some_standard",label:"Delvist standardiseret",cost:400000,eff:94,passive:5,desc:"Nøglekomponenter er standardiserede og kan leveres af flere. Resten proprietært.",costNote:"400k + 1,4 mio./år (6%). De vigtigste dele kan skaffes andetsteds."},
      {id:"modular",label:"Modulært design",cost:900000,eff:86,passive:9,desc:"Produktet er bygget i moduler med åbne interfaces. De fleste komponenter kan substitueres.",costNote:"900k + 3,4 mio./år (14%). De fleste dele kan erstattes uden redesign."},
      {id:"platform",label:"Platform-arkitektur",cost:1500000,eff:78,passive:13,desc:"Fælles platform på tværs af produktlinjer. Maksimal substituerbarhed.",costNote:"1,5 mio. + 5,3 mio./år (22%). Næsten alle komponenter kan substitueres."},
    ]},
  { id:"inventory",title:"Lagerstrategi",icon:"📦",
    description:"Hvor mange ugers forbrug har I på lager?",
    source:"Prologis 2026 · McKinsey Supply Chain Survey 2024",
    options:[
      {id:"jit",label:"Just-in-Time (2 uger)",cost:0,eff:100,passive:4,desc:"Minimalt lager. 2 ugers stop = tom hylde.",costNote:"Ingen meromkostning. Men enhver forsinkelse over 2 uger rammer kunderne."},
      {id:"moderate",label:"Moderat buffer (6 uger)",cost:600000,eff:87,passive:13,desc:"6 ugers sikkerhedslager.",costNote:"600k + 3,1 mio./år (13%). 6 ugers pusterum ved disruption."},
      {id:"strategic",label:"Strategisk lager (12 uger)",cost:1400000,eff:72,passive:22,desc:"12 ugers buffer + kritiske komponenter.",costNote:"1,4 mio. + 6,7 mio./år (28%). Levér normalt i 3 måneder uden forsyning."},
    ]},
  { id:"flexibility",title:"Produktions-fleksibilitet",icon:"🔄",
    description:"Kan linjer skifte marked/produkt? Har I ledig kapacitet?",
    source:"WEF/Kearney 2026 · McKinsey: Kapacitets-omallokering minimerer nedetid",
    options:[
      {id:"dedicated",label:"Dedikerede linjer (0% buffer)",cost:0,eff:100,passive:0,desc:"Hver linje kun ét produkt. 100% udnyttelse. Nul omstilling.",costNote:"Ingen meromkostning. Men I kan hverken omstille eller skalere op."},
      {id:"some_flex",label:"Delvis fleksibel (10% buffer)",cost:500000,eff:92,passive:4,desc:"Visse linjer omstilles med 1-2 ugers varsel. 10% ledig kapacitet.",costNote:"500k + 1,9 mio./år (8%). Delvis omstilling og 10% opskalering."},
      {id:"multi_capable",label:"Multi-market + 20% buffer",cost:1200000,eff:82,passive:9,desc:"De fleste linjer kan skifte marked inden for dage. 20% bufferkapacitet.",costNote:"1,2 mio. + 4,3 mio./år (18%). Omdirigér produktion OG skalér 20% op."},
    ]},
  { id:"digital",title:"Digital modenhed",icon:"🤖",
    description:"Hvor hurtigt opdager I problemer — og kan I handle på viden?",
    source:"BCG Supply Chain Planning 2026 · ASCM Maturity Report 2026",
    costExplainer:"Reaktionstid = penge: Basis 14 dage, ERP 8, APS 4, AI 1. Hver dag ~65.000 kr. Digital modenhed påvirker sandsynligheden for at operationelle handlinger lykkes.",
    options:[
      {id:"basic",label:"Basis (Excel + telefon)",cost:0,eff:82,passive:0,tier:0,desc:"Manuel planlægning. Opdager disruptions 1-2 uger for sent.",costNote:"Ingen investering, men 4,3 mio./år i lavere drift (18%). 910k ekstra per chok i reaktionstid."},
      {id:"erp",label:"ERP + dashboards",cost:500000,eff:91,passive:3,tier:1,desc:"Leverandør- og ordresynlighed. Reaktionstid 8 dage.",costNote:"500k + 2,2 mio./år (9%). 520k per chok. Åbner basale handlinger."},
      {id:"advanced",label:"Avanceret planlægning (APS)",cost:1200000,eff:95,passive:5,tier:2,desc:"Scenariemodellering, what-if, multi-tier synlighed. 4 dage.",costNote:"1,2 mio. + 1,2 mio./år (5%). 260k per chok. OBS: BCG finder at kun 20% får fuld værdi — kræver disciplinerede processer."},
      {id:"ai_tower",label:"AI-kontoltårn",cost:2500000,eff:97,passive:7,tier:3,desc:"Real-time, prædiktivt. 1 dag. Kan handle proaktivt — men kun hvis data og processer er i orden.",costNote:"2,5 mio. + 720k/år (3%). 65k per chok. Forbedrer sandsynligheder for alle handlinger med +10%. Men BCG: kun 20% udnytter AI fuldt."},
    ]},
  { id:"sustainability",title:"Bæredygtighed & compliance",icon:"🌱",
    description:"CO₂-dokumentation, CBAM-parathed, egen energi.",
    source:"UNCTAD 2026: EU's CBAM · Prologis: 87% oplevede energi-disruptions",
    options:[
      {id:"minimum",label:"Minimum compliance",cost:0,eff:96,passive:0,desc:"Overholder lov. Ingen CO₂-sporing, ingen egen energi.",costNote:"Ingen investering. Men CBAM rammer fuldt og energikriser koster 100%."},
      {id:"moderate_green",label:"Moderat grøn",cost:400000,eff:91,passive:7,desc:"CBAM-dokumentation, CO₂-sporing, ESG-rapportering.",costNote:"400k + 2,2 mio./år (9%). Reducerer CBAM-afgifter."},
      {id:"leader",label:"Bæredygtighedsleder",cost:1000000,eff:83,passive:14,desc:"Science-based targets, fuld transparens, solcellepark + batterilager.",costNote:"1 mio. + 4,1 mio./år (17%). CBAM neutraliseret, energikriser rammer minimalt."},
    ]},
];

// ============================================================
// SHOCKS — actions with clear cost/benefit/probability layout
// AI tower adds +10% to good probability on all actions
// ============================================================
const SHOCKS = [
  { id:"sf",title:"Fabriksbrand hos nøgleleverandør",type:"Leverandør-chok",icon:"🔥",
    description:"Primær leverandør i Kina rammes af storbrand. Produktion stoppet 10 uger.",
    baseDamage:3200000, passiveCats:["inventory","network","product_design"],
    actions:[
      {id:"a1",label:"Aktivér backup-leverandør",
        extraCost:200000,
        reqDigi:1,reqNet:"china_plus_one",reqSupRel:"preferred",
        goodPct:60,goodSave:900000,goodText:"Backup-leverandøren leverer. Men Vietnam har kapacitetsloft (330.000+ manglende arbejdere i Bac Ninh) — de dækker kun 60% af behovet.",
        badPct:40,badSave:250000,badText:"Backup er også overbelastet — alle aktiverer samme strategi og Vietnams kapacitet er brugt op. Minimal hjælp.",
        betterIfDual:"Hvis I havde valgt spredt dual-source (ikke kun China+1), stiger sandsynligheden til 80% — fordi jeres alternativ ikke har Vietnams kapacitetsloft.",
        mechanism:"ERP finder alternativ leverandør. Leverandøren prioriterer jer pga. foretrukken status.",
        lockExplain:"LÅST: Kræver mindst China+1 (backup), ERP (overblik) og foretrukken leverandørstatus (prioritet)."},
      {id:"a2",label:"Substituér med alternativ komponent",
        extraCost:100000,
        reqDigi:0,reqProd:"some_standard",
        goodPct:75,goodSave:700000,goodText:"Standardiseret design: komponenten erstattes af alternativ fra anden leverandør. Produktion genstartes inden for dage.",
        badPct:25,badSave:200000,badText:"Substitutionen virker, men kvalitetstest afslører afvigelser. 2 ugers ekstra tilpasning.",
        mechanism:"Modulært/standardiseret design gør substitution mulig.",
        lockExplain:"LÅST: Proprietært design — der er ingen alternativ komponent der passer. Kræver mindst delvist standardiseret."},
      {id:"a3",label:"Bed leverandør prioritere jer i genopbygning",
        extraCost:0,
        reqDigi:-1,reqSupRel:"strategic",
        goodPct:70,goodSave:500000,goodText:"Strategisk partnerskab: leverandøren prioriterer jer. I får leverance 3 uger før andre.",
        badPct:30,badSave:80000,badText:"Branden var for alvorlig — ingen kapacitet at fordele, uanset partnerskab.",
        mechanism:"Partnerskab giver forrang. Men kun hvis der er kapacitet at fordele.",
        lockExplain:"LÅST: Standard kontraktforhold — leverandøren har intet incitament til at prioritere jer. Kræver strategisk partnerskab."},
      {id:"a4",label:"Proaktiv kundekommunikation",
        extraCost:0,reqDigi:-1,
        goodPct:85,goodSave:300000,goodText:"Kunderne accepterer 2 ugers forsinkelse. I beholder ordrerne.",
        badPct:15,badSave:80000,badText:"Én nøglekunde accepterer ikke og flytter ordren.",
        mechanism:"Koster intet — men kræver hurtig og ærlig kommunikation.",lockExplain:null},
    ]},
  { id:"pb",title:"Blokade af Rødehavet-ruten",type:"Logistik-disruption",icon:"🚢",
    description:"Bab el-Mandeb lukket. Container-costs +40%. Leveringstider fordobles.",
    baseDamage:2400000, passiveCats:["inventory","network"],
    actions:[
      {id:"b1",label:"Omdirigér fragt via Kap det Gode Håb",
        extraCost:300000,reqDigi:1,
        goodPct:75,goodSave:550000,goodText:"Ombooking lykkes. 10 dage ekstra forsinkelse, men I undgår blokaden. Fragt +35%.",
        badPct:25,badSave:150000,badText:"Alle omdirigerer — Kap-ruten er overbelastet. 4 ugers forsinkelse.",
        mechanism:"ERP viser påvirkede shipments. I ombooken inden for timer.",
        lockExplain:"LÅST: Uden ERP kan I ikke se hvilke containere der er påvirket."},
      {id:"b2",label:"Aktivér europæisk leverandør",
        extraCost:150000,reqDigi:-1,reqNet:"regional",reqSupRel:"preferred",
        goodPct:80,goodSave:650000,goodText:"Europæisk leverandør leverer inden for dage via lastbil. Ingen skib, ingen blokade.",
        badPct:20,badSave:250000,badText:"Leverandøren kan levere, men til 50% højere pris og kun 60% af behovet.",
        mechanism:"I har allerede relationer med europæiske leverandører.",
        lockExplain:"LÅST: Kræver regionalt netværk + mindst foretrukken status. Uden disse ingen europæisk relation at aktivere."},
      {id:"b3",label:"Luftfragt for kritiske dele",
        extraCost:400000,reqDigi:2,
        goodPct:65,goodSave:450000,goodText:"APS identificerer de 5 kritiske komponenter. Kun dem flyves ind.",
        badPct:35,badSave:100000,badText:"Analysen var delvist forkert — I fløj de forkerte dele ind. Dyr fejl.",
        mechanism:"APS analyserer styklisten. Men under pres er der risiko for datafejl.",
        lockExplain:"LÅST: Uden APS gætter I — og risikerer at flyve alt eller det forkerte ind."},
    ]},
  { id:"ds",title:"Storkunde tredobler ordre",type:"Efterspørgsels-chok",icon:"📈",
    description:"Akut offshore-kontrakt. Markedet +25%. I leverer eller mister ordren.",
    baseDamage:2000000, passiveCats:["inventory","flexibility"],
    actions:[
      {id:"c1",label:"Skalér op med bufferkapacitet",
        extraCost:250000,reqDigi:1,reqFlex:"multi_capable",
        goodPct:75,goodSave:550000,goodText:"20% buffer + omstilling. Første delleverance om 5 dage. Kunden er tilfreds.",
        badPct:25,badSave:200000,badText:"Omstilling giver kvalitetsproblemer. Én uge ekstra. Kunden er utålmodig men bliver.",
        mechanism:"Bufferkapacitet + ERP-overblik over linjer.",
        lockExplain:"LÅST: Kræver multi-market linjer med buffer + ERP."},
      {id:"c2",label:"Tilbyd alternativt produkt fra lager",
        extraCost:0,reqDigi:1,reqProd:"some_standard",
        goodPct:55,goodSave:350000,goodText:"Kunden accepterer alternativet — det opfylder 90% af specs.",
        badPct:45,badSave:50000,badText:"Kunden afviser — matcher ikke specs. Spildt tid.",
        mechanism:"ERP viser lager. Standardiseret design = alternative produkter.",
        lockExplain:"LÅST: Kræver ERP (lageroverblik) + mindst delvist standardiseret design."},
      {id:"c3",label:"Overarbejde og weekendskift",
        extraCost:180000,reqDigi:-1,
        goodPct:85,goodSave:220000,goodText:"Output +12%. Ikke nok til at dække alt, men hjælper.",
        badPct:15,badSave:100000,badText:"Udbrændthed og fejl. En batch kasseres.",
        mechanism:"Overtidsbetaling. Risiko for fejl.",lockExplain:null},
    ]},
  { id:"mr",title:"Nøglemarked lukker — omdirigér produktion",type:"Markeds-chok",icon:"🔀",
    description:"Næststørste eksportmarked indfører importforbud. 30% skal omdirigeres.",
    baseDamage:2600000, passiveCats:["network","flexibility"],
    actions:[
      {id:"d1",label:"Omstil linjer til nyt marked",
        extraCost:350000,reqDigi:1,reqFlex:"multi_capable",reqProd:"modular",
        goodPct:70,goodSave:700000,goodText:"Modulært design + fleksible linjer = omstilling inden for dage. 80% omdirigeret.",
        badPct:30,badSave:200000,badText:"Certificering til nyt marked tager 3 uger ekstra. Omsætningstab i ventetiden.",
        mechanism:"Multi-market linjer + modulært design + ERP certificerings-tracking.",
        lockExplain:"LÅST: Kræver multi-market linjer + modulært design + ERP."},
      {id:"d2",label:"Brug leverandørpartners netværk",
        extraCost:100000,reqDigi:-1,reqSupRel:"strategic",
        goodPct:60,goodSave:450000,goodText:"Partneren introducerer jer til kunder i nyt marked. 40% af volumen placeret.",
        badPct:40,badSave:80000,badText:"Kontakterne er interesserede, men aftaler tager måneder. Minimal kortsigtet effekt.",
        mechanism:"Strategisk partnerskab giver adgang til leverandørens netværk.",
        lockExplain:"LÅST: Standard kontrakt — leverandøren deler ikke sit netværk. Kræver strategisk partnerskab."},
      {id:"d3",label:"Akut salgsindsats",
        extraCost:50000,reqDigi:-1,
        goodPct:60,goodSave:200000,goodText:"Sælgerne finder et par nye kunder. 15% af volumen placeret.",
        badPct:40,badSave:50000,badText:"Lav hitrate. Nye kunder kræver prøveordrer.",
        mechanism:"Cold calling fra bunden. Billigt men usikkert.",lockExplain:null},
    ]},
  { id:"ts",title:"EU indfører 25% told + CBAM-afgift",type:"Regulatorisk chok",icon:"🏛️",
    description:"25% told på Asien-import. CBAM (CO₂-afgift) rammer importører uden klimadokumentation ekstra.",
    baseDamage:2800000, passiveCats:["network","sustainability"],
    actions:[
      {id:"e1",label:"Flyt indkøb væk fra Asien",
        extraCost:200000,reqDigi:1,reqNet:"global_dual",reqSupRel:"preferred",
        goodPct:70,goodSave:750000,goodText:"Ægte alternativ leverandør uden for Asien. Told undgås på 60% af indkøbet.",
        badPct:30,badSave:200000,badText:"Alternativ-leverandøren kan ikke matche pris/kvalitet fuldt. Besparelsen halveres.",
        betterIfRegional:"Med regionalt netværk stiger sandsynligheden til 85% — europæiske leverandører rammes slet ikke af Asien-tolden.",
        mechanism:"Spredt dual-source (ikke kun China+1, da Vietnam også er i Asien) + ERP cost-benefit.",
        lockExplain:"LÅST: Kræver spredt dual-source (China+1 hjælper ikke — Vietnam er også Asien), ERP og mindst foretrukken status."},
      {id:"e2",label:"CBAM-dokumentation reducerer CO₂-afgift",
        extraCost:50000,reqDigi:1,reqSust:"moderate_green",
        goodPct:75,goodSave:500000,goodText:"Dokumentation accepteres. CBAM-tillæg reduceret 70%.",
        badPct:25,badSave:150000,badText:"Huller i dokumentation — myndighederne kræver supplerende data. 4 uger. Fuld afgift imens.",
        mechanism:"CO₂-sporing + ERP til CBAM-rapportering.",
        lockExplain:"LÅST: Kræver moderat grøn compliance (CO₂-data) + ERP (CBAM-rapportering)."},
      {id:"e3",label:"Absorbér tolden kortsigtet",
        extraCost:0,reqDigi:-1,
        goodPct:80,goodSave:250000,goodText:"I beholder kunderne. Marginen er tynd.",
        badPct:20,badSave:50000,badText:"Nøglekunde forhandler rabat oveni. Dobbelt tab.",
        mechanism:"Koster på bundlinjen, men bevarer relationer.",lockExplain:null},
    ]},
  { id:"ec",title:"Energikrise: strømpriser +300%",type:"Energi-disruption",icon:"⚡",
    description:"Strømpriser eksploderer. El-regningen tredobles.",
    baseDamage:1800000, passiveCats:["sustainability"],
    actions:[
      {id:"f1",label:"Aktivér egen energiproduktion",
        extraCost:0,reqDigi:-1,reqSust:"leader",
        goodPct:85,goodSave:600000,goodText:"Solceller + batteri dækker 70% af forbrug. Konkurrenter betaler 300% ekstra.",
        badPct:15,badSave:350000,badText:"Batteribanken underdimensioneret til vinter. 50% dækning i stedet for 70%.",
        mechanism:"Egen energi. Vintermåneder = risiko for lav solproduktion.",
        lockExplain:"LÅST: Kræver bæredygtighedsleder (solceller + batteri). Uden egen energi betaler I 300% ekstra."},
      {id:"f2",label:"Optimér produktionsplan efter strømpris",
        extraCost:80000,reqDigi:2,
        goodPct:60,goodSave:350000,goodText:"APS optimerer: energi-tunge processer i off-peak. 20% lavere energiregning.",
        badPct:40,badSave:100000,badText:"Forskudte tider giver logistikproblemer og medarbejdermodstand. Gevinst halveres.",
        mechanism:"APS + el-børsdata. Men menneskelige faktorer kan modvirke optimeringen.",
        lockExplain:"LÅST: Kræver APS for energipris-integration i planlægning."},
      {id:"f3",label:"Reducer produktion i dyre timer",
        extraCost:0,reqDigi:-1,
        goodPct:75,goodSave:250000,goodText:"Output -25%, men I sparer på energi. Lager kompenserer.",
        badPct:25,badSave:80000,badText:"Output falder OG kunder mærker forsinkelser. I mister en ordre.",
        mechanism:"Simpelt. Risiko for kundetab.",lockExplain:null},
    ]},
];

// ============================================================
function getOpt(c,o){return CATS.find(x=>x.id===c)?.options.find(x=>x.id===o)}
function getIdx(c,o){const cat=CATS.find(x=>x.id===c);return cat?cat.options.findIndex(x=>x.id===o):-1}
function calcPassive(ev,s){let t=0;(ev.passiveCats||[]).forEach(c=>{t+=(getOpt(c,s[c])?.passive||0)});return Math.min(t,40)}
function isUnlocked(a,s){
  if(a.reqDigi!=null&&a.reqDigi>=0){const t=getOpt("digital",s.digital)?.tier??0;if(t<a.reqDigi)return false}
  if(a.reqNet&&getIdx("network",s.network)<getIdx("network",a.reqNet))return false;
  if(a.reqFlex&&getIdx("flexibility",s.flexibility)<getIdx("flexibility",a.reqFlex))return false;
  if(a.reqSust&&getIdx("sustainability",s.sustainability)<getIdx("sustainability",a.reqSust))return false;
  if(a.reqSupRel&&getIdx("supplier_rel",s.supplier_rel)<getIdx("supplier_rel",a.reqSupRel))return false;
  if(a.reqProd&&getIdx("product_design",s.product_design)<getIdx("product_design",a.reqProd))return false;
  return true;
}
function getAIBonus(s){return (getOpt("digital",s.digital)?.tier??0)>=3?10:0}
function fmt(n){const a=Math.abs(n),s=n<0?"-":"";if(a>=1e6)return s+(a/1e6).toFixed(1)+" mio.";if(a>=1e3)return s+Math.round(a/1e3)+"k";return s+Math.round(a).toLocaleString("da-DK")}
function fmtKr(n){return fmt(n)+" kr."}
function Bar({value,max,color,h=6}){return(<div style={{background:"rgba(255,255,255,0.06)",borderRadius:h/2,height:h,width:"100%",overflow:"hidden"}}><div style={{width:`${Math.min(100,Math.max(0,(value/max)*100))}%`,height:"100%",background:color,borderRadius:h/2,transition:"width 0.6s"}}/></div>)}

function InvestCard({cat,sel,onSel}){return(<div style={{marginBottom:22}}><div style={{display:"flex",alignItems:"center",gap:9,marginBottom:5}}><span style={{fontSize:19}}>{cat.icon}</span><div><h3 style={{margin:0,fontSize:14,fontWeight:700,color:"#E8EDF2"}}>{cat.title}</h3><p style={{margin:0,fontSize:11,color:"#8899AA"}}>{cat.description}</p></div></div>
  <div style={{fontSize:10,color:"#5A7A6B",fontStyle:"italic",marginBottom:cat.costExplainer?3:7,padding:"4px 8px",background:"rgba(42,157,143,0.06)",borderRadius:4,borderLeft:"2px solid #2A9D8F33",lineHeight:1.5}}>{"📚 "+cat.source}</div>
  {cat.costExplainer&&<div style={{fontSize:10,color:"#A08C5A",marginBottom:7,padding:"4px 8px",background:"rgba(233,196,106,0.06)",borderRadius:4,borderLeft:"2px solid #E9C46A33",lineHeight:1.5}}>{"💡 "+cat.costExplainer}</div>}
  <div style={{display:"grid",gap:6}}>{cat.options.map(o=>{const is=sel===o.id;return(<button key={o.id} onClick={()=>onSel(cat.id,o.id)} style={{background:is?"rgba(42,157,143,0.12)":"rgba(255,255,255,0.02)",border:`1px solid ${is?"#2A9D8F":"#1E2D45"}`,borderRadius:7,padding:"11px 13px",cursor:"pointer",textAlign:"left",transition:"all 0.2s",color:"inherit"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:3}}><div style={{fontWeight:600,fontSize:13,color:is?"#2A9D8F":"#D0D8E0"}}>{is?"✓ ":""}{o.label}</div><div style={{fontFamily:"'IBM Plex Mono', monospace",fontSize:12,fontWeight:600,color:o.cost===0?"#667788":"#E9C46A",marginLeft:10}}>{o.cost===0?"Gratis":fmtKr(o.cost)}</div></div>
    <div style={{fontSize:11,color:"#7A8A9A",lineHeight:1.5,marginBottom:3}}>{o.desc}</div>
    <div style={{fontSize:10,color:"#8A7A5A",lineHeight:1.4,padding:"3px 7px",background:"rgba(233,196,106,0.04)",borderRadius:3}}>{"💰 "+o.costNote}</div>
  </button>)})}</div></div>)}

function ShockCard({ev,sels,onComplete}){
  const ppct=calcPassive(ev,sels),pSaved=Math.round(ev.baseDamage*ppct/100),aftP=ev.baseDamage-pSaved;
  const aiBonus=getAIBonus(sels);
  const[chosen,setChosen]=useState(new Set());
  const[done,setDone]=useState(false);
  const[outcomes,setOutcomes]=useState({});

  const doResolve=()=>{
    let totalSaved=0,totalCost=0;const oc={};
    [...chosen].forEach(id=>{
      const a=ev.actions.find(x=>x.id===id);if(!a)return;
      totalCost+=a.extraCost||0;
      const adjGood=Math.min(95,a.goodPct+aiBonus);
      const roll=Math.random()*100;
      const good=roll<adjGood;
      const saved=good?a.goodSave:a.badSave;
      totalSaved+=saved;
      oc[id]={good,saved,text:good?a.goodText:a.badText,adjGood};
    });
    const capSaved=Math.min(totalSaved,Math.round(aftP*0.65));
    setOutcomes(oc);setDone(true);onComplete(aftP-capSaved+totalCost);
  };

  const pNames=(ev.passiveCats||[]).map(c=>{const cat=CATS.find(x=>x.id===c);const opt=getOpt(c,sels[c]);return{icon:cat?.icon,title:cat?.title,label:opt?.label,p:opt?.passive||0}}).filter(x=>x.p>0);
  const totalExtraCost=[...chosen].reduce((s,id)=>s+(ev.actions.find(x=>x.id===id)?.extraCost||0),0);

  return(<div style={{background:"rgba(255,255,255,0.02)",border:`1px solid ${done?"#2A9D8F":"#E63946"}33`,borderLeft:`3px solid ${done?"#2A9D8F":"#E63946"}`,borderRadius:8,padding:"16px 18px",marginBottom:16}}>
    <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:6,marginBottom:5}}>
      <div><span style={{fontSize:18,marginRight:7}}>{ev.icon}</span><span style={{fontWeight:700,color:"#E8EDF2",fontSize:14}}>{ev.title}</span></div>
      <span style={{fontSize:10,color:"#667788",padding:"2px 6px",background:"rgba(255,255,255,0.04)",borderRadius:3}}>{ev.type}</span>
    </div>
    <p style={{fontSize:12,color:"#8899AA",margin:"0 0 12px",lineHeight:1.5}}>{ev.description}</p>

    <div style={{padding:"10px 12px",background:"rgba(0,0,0,0.12)",borderRadius:6,marginBottom:12}}>
      <div style={{fontFamily:"'IBM Plex Mono', monospace",fontSize:13,color:"#E63946",fontWeight:600,marginBottom:5}}>{"Potentiel skade: "+fmtKr(ev.baseDamage)}</div>
      {pNames.length>0&&<div style={{marginBottom:4}}><div style={{fontSize:11,color:"#8899AA",marginBottom:3}}>Passiv beskyttelse:</div>{pNames.map((p,i)=>(<div key={i} style={{fontSize:11,color:"#5A9A6B",marginBottom:1}}>{p.icon+" "+p.title+": \""+p.label+"\" → "+fmtKr(Math.round(ev.baseDamage*p.p/100))}</div>))}</div>}
      <div style={{fontFamily:"'IBM Plex Mono', monospace",fontSize:12,color:"#E9C46A",fontWeight:600}}>{"Resterende skade: "+fmtKr(aftP)}</div>
    </div>

    {!done?(<div style={{padding:"12px",background:"rgba(42,157,143,0.03)",borderRadius:8,border:"1px solid #2A9D8F22"}}>
      <div style={{fontSize:13,fontWeight:700,color:"#E8EDF2",marginBottom:3}}>{"🛠️ Operationel respons"}</div>
      <div style={{fontSize:11,color:"#8899AA",marginBottom:10,lineHeight:1.4}}>{"Vælg handlinger. Udfaldet er usikkert — I ser sandsynligheder, men først resultatet efter bekræftelse."}{aiBonus>0&&<span style={{color:"#2A9D8F"}}>{" AI-kontoltårn giver +"+aiBonus+"% på alle sandsynligheder."}</span>}</div>

      {ev.actions.map(a=>{const ul=isUnlocked(a,sels);const ic=chosen.has(a.id);const adjGood=Math.min(95,a.goodPct+(ul?aiBonus:0));const adjBad=100-adjGood;
      return(<div key={a.id} style={{padding:"12px",marginBottom:8,borderRadius:7,background:ul?(ic?"rgba(42,157,143,0.08)":"rgba(255,255,255,0.02)"):"rgba(230,57,70,0.03)",border:`1px solid ${ul?(ic?"#2A9D8F":"#1E2D45"):"#E6394622"}`}}>
        <div style={{fontWeight:600,fontSize:13,color:ul?"#D0D8E0":"#776666",marginBottom:6}}>{(ul?"":"🔒 ")+a.label}</div>

        {ul?(<>
          <div style={{fontSize:11,color:"#7A8A9A",marginBottom:8,lineHeight:1.4}}>{a.mechanism}</div>
          {/* COST-BENEFIT TABLE */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:8}}>
            <div style={{padding:"8px",background:"rgba(233,196,106,0.06)",borderRadius:5,textAlign:"center"}}>
              <div style={{fontSize:9,color:"#8A7A5A",textTransform:"uppercase",letterSpacing:0.5}}>Ekstra omkostning</div>
              <div style={{fontFamily:"'IBM Plex Mono', monospace",fontSize:13,fontWeight:600,color:"#E9C46A"}}>{a.extraCost>0?fmtKr(a.extraCost):"Gratis"}</div>
            </div>
            <div style={{padding:"8px",background:"rgba(42,157,143,0.06)",borderRadius:5,textAlign:"center"}}>
              <div style={{fontSize:9,color:"#5A7A6B",textTransform:"uppercase",letterSpacing:0.5}}>{"Udfald A ("+adjGood+"%)"}</div>
              <div style={{fontFamily:"'IBM Plex Mono', monospace",fontSize:13,fontWeight:600,color:"#2A9D8F"}}>{fmtKr(a.goodSave)}</div>
            </div>
            <div style={{padding:"8px",background:"rgba(230,57,70,0.06)",borderRadius:5,textAlign:"center"}}>
              <div style={{fontSize:9,color:"#AA7777",textTransform:"uppercase",letterSpacing:0.5}}>{"Udfald B ("+adjBad+"%)"}</div>
              <div style={{fontFamily:"'IBM Plex Mono', monospace",fontSize:13,fontWeight:600,color:"#E63946"}}>{fmtKr(a.badSave)}</div>
            </div>
          </div>
          <div style={{fontSize:10,color:"#667788",marginBottom:6}}>{"Forventet besparelse: ~"+fmtKr(Math.round(a.goodSave*adjGood/100+a.badSave*adjBad/100))+(a.extraCost>0?" (minus "+fmtKr(a.extraCost)+" omkostning)":"")}</div>
          {a.betterIfDual&&getIdx("network",sels.network)<getIdx("network","global_dual")&&<div style={{fontSize:10,color:"#AA8855",fontStyle:"italic",marginBottom:4}}>{"💡 "+a.betterIfDual}</div>}
          {a.betterIfRegional&&getIdx("network",sels.network)<getIdx("network","regional")&&<div style={{fontSize:10,color:"#AA8855",fontStyle:"italic",marginBottom:4}}>{"💡 "+a.betterIfRegional}</div>}
          <div style={{textAlign:"right"}}><button onClick={()=>setChosen(p=>{const n=new Set(p);n.has(a.id)?n.delete(a.id):n.add(a.id);return n})} style={{background:ic?"#2A9D8F":"transparent",color:ic?"#fff":"#8899AA",border:`1px solid ${ic?"#2A9D8F":"#445566"}`,borderRadius:4,padding:"5px 14px",cursor:"pointer",fontSize:11,fontWeight:600}}>{ic?"Valgt ✓":"Vælg"}</button></div>
        </>):(<div style={{fontSize:11,lineHeight:1.5,padding:"8px 10px",borderRadius:5,background:"rgba(230,57,70,0.05)",borderLeft:"3px solid #E6394644",color:"#AA7777"}}>{a.lockExplain}</div>)}
      </div>)})}

      {chosen.size>0&&<div style={{fontSize:11,color:"#8899AA",marginTop:6,marginBottom:4}}>{"Samlet ekstra omkostning: "+fmtKr(totalExtraCost)}</div>}
      <button onClick={doResolve} disabled={chosen.size===0} style={{marginTop:6,background:chosen.size>0?"#2A9D8F":"#2A3654",color:chosen.size>0?"#fff":"#667788",border:"none",borderRadius:7,padding:"11px 24px",fontSize:13,fontWeight:600,cursor:chosen.size>0?"pointer":"not-allowed",width:"100%"}}>{chosen.size>0?"Bekræft — se udfald":"Vælg mindst én handling"}</button>
    </div>):(
    <div style={{padding:"12px",background:"rgba(42,157,143,0.04)",borderRadius:8,border:"1px solid #2A9D8F33"}}>
      <div style={{fontSize:13,fontWeight:700,color:"#E8EDF2",marginBottom:8}}>Udfald:</div>
      {Object.entries(outcomes).map(([id,oc])=>{const a=ev.actions.find(x=>x.id===id);return a?(<div key={id} style={{padding:"10px",marginBottom:7,borderRadius:6,background:oc.good?"rgba(42,157,143,0.06)":"rgba(233,196,106,0.06)",border:`1px solid ${oc.good?"#2A9D8F22":"#E9C46A22"}`}}>
        <div style={{fontWeight:600,fontSize:12,color:oc.good?"#2A9D8F":"#E9C46A",marginBottom:3}}>{(oc.good?"✓ ":"⚠ ")+a.label+" → "+(oc.good?"Lykkes":"Delvist")+" ("+fmtKr(oc.saved)+" sparet)"}</div>
        <div style={{fontSize:11,color:"#8A96A4",lineHeight:1.5}}>{oc.text}</div>
      </div>):null})}
      {chosen.size===0&&<div style={{fontSize:11,color:"#887777",fontStyle:"italic"}}>Ingen handlinger valgt.</div>}
    </div>)}
  </div>)}

export default function App(){
  const[phase,setPhase]=useState("intro");
  const[sels,setSels]=useState({});
  const[si,setSi]=useState(0);
  const[fd,setFd]=useState([]);
  const ti=useMemo(()=>CATS.reduce((s,c)=>s+(getOpt(c.id,sels[c.id])?.cost||0),0),[sels]);
  const br=BUDGET-ti;
  const ae=useMemo(()=>{const o=CATS.map(c=>getOpt(c.id,sels[c.id])).filter(Boolean);return o.length?Math.round(o.reduce((s,x)=>s+x.eff,0)/o.length):100},[sels]);
  const allS=CATS.every(c=>sels[c.id]);
  const driftKr=Math.round(REVENUE*(1-ae/100));
  const totDmg=fd.reduce((s,d)=>s+d,0);
  const inv=useMemo(()=>CATS.map(c=>getOpt(c.id,sels[c.id])).filter(Boolean).reduce((s,o)=>s+o.cost,0),[sels]);
  const net=REVENUE-driftKr-inv-totDmg;
  const reset=()=>{setPhase("intro");setSels({});setSi(0);setFd([])};
  const shDone=fd.length>si;

  return(<><link href={FONT} rel="stylesheet"/><div style={{fontFamily:"'DM Sans', sans-serif",color:"#C8D0DA",background:"#080E1A",minHeight:"100vh",padding:"20px 16px",maxWidth:900,margin:"0 auto"}}>
    <div style={{marginBottom:18,paddingBottom:12,borderBottom:"1px solid #141E33"}}>
      <div style={{fontFamily:"'IBM Plex Mono', monospace",fontSize:10,letterSpacing:2,color:"#2A9D8F",textTransform:"uppercase",marginBottom:3}}>Supply Chain Resilience Game</div>
      <h1 style={{margin:0,fontSize:20,fontWeight:700,color:"#E8EDF2"}}>Byg din forsyningskæde — overlev disruptionerne</h1>
    </div>

    {phase==="intro"&&(<div style={{maxWidth:660,margin:"24px auto"}}>
      <div style={{background:"rgba(255,255,255,0.03)",borderRadius:10,padding:"18px 22px",marginBottom:18,border:"1px solid #1A2744"}}>
        <div style={{fontSize:14,fontWeight:700,color:"#E8EDF2",marginBottom:8}}>{"🏭 NordicParts A/S"}</div>
        <div style={{fontSize:12,color:"#8899AA",lineHeight:1.7}}>
          <p style={{margin:"0 0 6px"}}>Mellemstor dansk producent af præcisionskomponenter til vindmølle- og offshore-industrien. ~200 ansatte, centrallager i Taulov, eksport til Norden, Tyskland og UK.</p>
          <p style={{margin:"0 0 6px"}}>Omsætning: <strong style={{color:"#E9C46A"}}>24 mio. kr./år.</strong> Investeringsbudget: <strong style={{color:"#E9C46A"}}>10 mio. kr.</strong></p>
          <p style={{margin:0}}>I dag: én leverandør i Kina, standard kontrakter, proprietært design, JIT, dedikerede linjer, Excel-planlægning, minimum compliance.</p>
        </div>
      </div>
      <div style={{background:"rgba(255,255,255,0.03)",borderRadius:10,padding:"18px 22px",marginBottom:18}}>
        <div style={{fontSize:14,fontWeight:700,color:"#E8EDF2",marginBottom:8}}>{"📋 Sådan fungerer spillet"}</div>
        <div style={{fontSize:12,color:"#8899AA",lineHeight:1.7}}>
          <p style={{margin:"0 0 6px"}}><strong style={{color:"#2A9D8F"}}>Fase 1:</strong> Fordel budgettet på 7 områder. Hvert valg viser omkostning i kroner.</p>
          <p style={{margin:"0 0 6px"}}><strong style={{color:"#E63946"}}>Fase 2:</strong> 6 chok rammer. Ved hvert chok vælger I operationelle handlinger med klart beslutningsgrundlag:</p>
          <div style={{padding:"7px 11px",background:"rgba(0,0,0,0.12)",borderRadius:5,marginBottom:6,fontSize:11,lineHeight:1.7}}>
            Hver handling viser: <strong style={{color:"#D0D8E0"}}>ekstra omkostning</strong>, <strong style={{color:"#2A9D8F"}}>mulig besparelse ved succes</strong>, <strong style={{color:"#E63946"}}>mulig besparelse ved delvist udfald</strong>, og <strong style={{color:"#D0D8E0"}}>sandsynligheder for begge</strong>. Jeres investeringer fra fase 1 afgør hvilke handlinger der er tilgængelige — og forbedrer sandsynlighederne.
          </div>
          <p style={{margin:0}}><strong style={{color:"#E9C46A"}}>Fase 3:</strong> Netto = Omsætning – Drift – Investeringer – Skader – Ekstra handlingsomkostninger.</p>
        </div>
      </div>
      <div style={{textAlign:"center"}}><button onClick={()=>setPhase("invest")} style={{background:"#2A9D8F",color:"#fff",border:"none",borderRadius:8,padding:"14px 36px",fontSize:15,fontWeight:700,cursor:"pointer"}}>Start spillet →</button></div>
    </div>)}

    {phase==="invest"&&(<>
      <div style={{position:"sticky",top:0,zIndex:10,background:"#080E1A",padding:"10px 0",marginBottom:12,borderBottom:"1px solid #141E33"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5,flexWrap:"wrap",gap:8}}>
          <div style={{fontSize:12}}><span style={{color:"#667788"}}>Budget: </span><span style={{fontFamily:"'IBM Plex Mono', monospace",fontWeight:600,color:br>=0?"#E9C46A":"#E63946"}}>{fmtKr(br)}</span><span style={{color:"#667788"}}>{" / "+fmtKr(BUDGET)}</span></div>
          <div style={{fontSize:11,color:"#667788"}}>{"Drift: "}<strong style={{color:"#E9C46A",fontFamily:"'IBM Plex Mono', monospace"}}>{fmtKr(driftKr)+"/år"}</strong></div>
        </div>
        <Bar value={Math.max(0,br)} max={BUDGET} color={br>=0?"#E9C46A":"#E63946"}/>{br<0&&<div style={{color:"#E63946",fontSize:10,marginTop:3}}>⚠ Overskredet</div>}
      </div>
      {CATS.map(c=>(<InvestCard key={c.id} cat={c} sel={sels[c.id]} onSel={(cid,oid)=>setSels(p=>({...p,[cid]:oid}))}/>))}
      <div style={{textAlign:"center",paddingBottom:20}}>
        <button onClick={()=>{setPhase("shocks");setSi(0)}} disabled={!allS||br<0} style={{background:allS&&br>=0?"#2A9D8F":"#2A3654",color:allS&&br>=0?"#fff":"#667788",border:"none",borderRadius:8,padding:"13px 36px",fontSize:14,fontWeight:700,cursor:allS&&br>=0?"pointer":"not-allowed"}}>{!allS?"Vælg alle 7 kategorier":br<0?"Overskredet":"Lås strategi → chok-scenarier →"}</button>
      </div>
    </>)}

    {phase==="shocks"&&(<>
      <div style={{fontSize:13,color:"#8899AA",marginBottom:12}}><strong style={{color:"#E8EDF2"}}>Fase 2: </strong>{"Chok "+(si+1)+" / "+SHOCKS.length}</div>
      <ShockCard key={SHOCKS[si].id} ev={SHOCKS[si]} sels={sels} onComplete={d=>setFd(p=>[...p,d])}/>
      {shDone&&<div style={{textAlign:"center",padding:"10px 0 18px"}}><button onClick={()=>{if(si<SHOCKS.length-1)setSi(si+1);else setPhase("results")}} style={{background:si<SHOCKS.length-1?"rgba(230,57,70,0.15)":"#2A9D8F",color:si<SHOCKS.length-1?"#E63946":"#fff",border:`1px solid ${si<SHOCKS.length-1?"#E6394644":"#2A9D8F"}`,borderRadius:8,padding:"12px 32px",fontSize:14,fontWeight:700,cursor:"pointer"}}>{si<SHOCKS.length-1?`⚡ Næste (${si+2}/${SHOCKS.length})`:"Se bundlinje →"}</button></div>}
    </>)}

    {phase==="results"&&(<div style={{maxWidth:700,margin:"0 auto"}}>
      <h2 style={{textAlign:"center",color:"#E8EDF2",fontSize:18,marginBottom:18}}>{"📊 Årsresultat"}</h2>
      <div style={{background:"rgba(255,255,255,0.02)",borderRadius:9,padding:"16px 20px",marginBottom:16}}>
        {[{l:"Omsætning",v:REVENUE,c:"#D0D8E0"},{l:"Driftsmeromkostninger",v:-driftKr,c:"#E9C46A"},{l:"Investeringer",v:-inv,c:"#E9C46A"},{l:"Chok-skader + handlingsomkostninger",v:-totDmg,c:"#E63946"}].map((r,i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:i<3?"1px solid #141E33":"none",fontSize:12}}><span style={{color:"#8899AA"}}>{r.l}</span><span style={{fontFamily:"'IBM Plex Mono', monospace",fontWeight:600,color:r.c}}>{r.v>=0?"+":""}{fmtKr(r.v)}</span></div>))}
        <div style={{display:"flex",justifyContent:"space-between",padding:"12px 0 0",marginTop:6,borderTop:"2px solid #2A3654",fontSize:15}}><span style={{fontWeight:700,color:"#E8EDF2"}}>Netto</span><span style={{fontFamily:"'IBM Plex Mono', monospace",fontWeight:700,fontSize:19,color:net>=0?"#2A9D8F":"#E63946"}}>{fmtKr(net)}</span></div>
      </div>
      <div style={{background:"rgba(255,255,255,0.02)",borderRadius:7,padding:"12px 16px",marginBottom:16}}><div style={{fontWeight:600,color:"#D0D8E0",marginBottom:5,fontSize:11}}>Skade per chok</div>{SHOCKS.map((ev,i)=>(<div key={ev.id} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:"1px solid #0E1829",fontSize:11}}><span>{ev.icon+" "}<span style={{color:"#8899AA"}}>{ev.title}</span></span><span style={{fontFamily:"'IBM Plex Mono', monospace",color:(fd[i]||0)<ev.baseDamage*0.3?"#2A9D8F":(fd[i]||0)<ev.baseDamage*0.6?"#E9C46A":"#E63946",fontWeight:500}}>{fmtKr(fd[i]||0)}<span style={{color:"#556677"}}>{" / "+fmtKr(ev.baseDamage)}</span></span></div>))}</div>
      <div style={{background:"rgba(255,255,255,0.03)",borderRadius:7,padding:"14px 16px",marginBottom:16,fontSize:12,color:"#8899AA",lineHeight:1.8}}>
        <div style={{fontWeight:700,color:"#E8EDF2",marginBottom:8}}>{"💬 Refleksion"}</div>
        <div style={{marginBottom:4}}><strong style={{color:"#D0D8E0"}}>1.</strong> Hvilke handlinger var låst — og hvad ville det koste at åbne dem?</div>
        <div style={{marginBottom:4}}><strong style={{color:"#D0D8E0"}}>2.</strong> Var der handlinger der slog fejl? Ville I vælge anderledes næste gang?</div>
        <div style={{marginBottom:4}}><strong style={{color:"#D0D8E0"}}>3.</strong> Ligner NordicParts jeres virksomhed? Hvor halter I mest?</div>
        <div style={{marginBottom:4}}><strong style={{color:"#D0D8E0"}}>4.</strong> Hvis én produktionssite lukker i morgen, kan en anden tage over?</div>
        <div style={{marginBottom:4}}><strong style={{color:"#D0D8E0"}}>5.</strong> Behandler I jeres leverandører som partnere? Hvad koster forskellen?</div>
        <div style={{marginBottom:4}}><strong style={{color:"#D0D8E0"}}>6.</strong> Er jeres produkter designet så komponenter kan substitueres?</div>
        <div><strong style={{color:"#D0D8E0"}}>7.</strong> 1 mio. ekstra — ét tiltag — hvad giver mest?</div>
      </div>
      <div style={{textAlign:"center",paddingBottom:20}}><button onClick={reset} style={{background:"transparent",color:"#8899AA",border:"1px solid #2A3654",borderRadius:7,padding:"10px 26px",fontSize:12,cursor:"pointer"}}>{"↻ Nyt spil"}</button></div>
    </div>)}
  </div></>)}
