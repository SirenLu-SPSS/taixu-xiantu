const D=require('../src/data/economy.js'),E=require('../src/systems/economy.js');
const seed=42,samples=200000;const random=()=>{let state=seed;return ()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;}};
const report={seed,samplesPerCategory:samples,totalSamples:samples*7,encounters:{},boss:{}};
for(const [kind,expected]of Object.entries(D.config.encounters)){const r=random();let high=0,legend=0;for(let i=0;i<samples;i++){const q=E.encounterQuality(kind,r);high+=q!==null;legend+=q===4;}report.encounters[kind]={expectedHigh:expected,actualHigh:high/samples,expectedLegendary:expected*.05,actualLegendary:legend/samples};}
for(const [kind,expected]of Object.entries(D.config.boss)){const r=random();let gold=0,legend=0;for(let i=0;i<samples;i++){const qs=E.bossQualities(kind,r);gold+=qs.includes(3);legend+=qs.includes(4);}report.boss[kind]={expectedGold:expected.gold,actualGold:gold/samples,expectedLegendary:expected.legendary,actualLegendary:legend/samples};}
console.log(JSON.stringify(report,null,2));
