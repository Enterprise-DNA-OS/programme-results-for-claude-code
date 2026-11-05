#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {getDb,REPO_ROOT} from './lib/db.mjs';
import {parseCsv,pick} from './lib/csv.mjs';

export const commands={
 'projects':'List projects and owners','indicators':'Read approved measurement definitions','periods':'Read reporting dates and closure state',
 'reporting-desk':'Read accepted results, targets and review counts','partner-chase':'Find missing and late submissions','review-queue':'Read pending results and evidence',
 'target-gaps':'Compare complete accepted results with targets','disaggregation':'Read location and subgroup figures without double counting','trend':'Compare like indicators across periods',
 'compliance':'Find evidence and measurement gaps','actions':'Read follow-up actions','stale':'Find projects without recent recorded work','history':'Read result versions and audit history',
 'add-project':'Register a project and its intended outcome','define-indicator':'Create or review a measurement definition','set-period':'Set the reporting calendar','expect':'Record an expected submission and target',
 'record-result':'Record a new result or a correction as a new version','review-result':'Accept or reject one pending result with reasons','add-action':'Assign follow-up work','complete-action':'Close work with evidence',
 'log-note':'Record programme context','close-period':'Close a complete reviewed period','import':'Import DevResults reporting-period CSV or XLSX','export':'Export every record and original import',
 'weekly-review':'Draft the weekly review from live reports','draft-partner':'Draft a missing-evidence request','draft-funder':'Draft a period report with completeness warnings','help':'List commands and flags'
};
const tables=['projects','indicators','periods','assignments','cells','result_versions','actions','notes','imports','audit'];
const writable=new Set(['add-project','define-indicator','set-period','expect','record-result','review-result','add-action','complete-action','log-note','close-period','import']);
const today=()=>new Date().toISOString().slice(0,10);
function req(o,k){const v=o[k];if(typeof v!=='string'||!v.trim())throw Error(`--${k}= is required`);return v.trim();}
function number(v,label,{optional=false}={}){if(v===undefined||v===''){if(optional)return null;throw Error(`${label} is required`);}if(!/^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(String(v)))throw Error(`${label} must be a non-negative decimal`);const n=Number(v);if(!Number.isFinite(n)||n>1e12)throw Error(`${label} exceeds supported range`);return n;}
function date(v,label){if(!/^\d{4}-\d{2}-\d{2}$/.test(v)||Number.isNaN(Date.parse(v))||new Date(v).toISOString().slice(0,10)!==v)throw Error(`${label} needs a valid ISO date`);return v;}
async function resolve(db,t,value){if(!tables.includes(t))throw Error('Unknown entity');const named=['projects','indicators','periods'];const field=named.includes(t)?'name':t==='cells'||t==='actions'?'code':null;const codes=named.includes(t)?'code':null;
 const rows=await db.query(`SELECT * FROM ${t} WHERE id::text ILIKE $1 ${field?`OR ${field} ILIKE $2`:''} ${codes?`OR ${codes} ILIKE $2`:''} ORDER BY id`,[String(value)+'%',String(value)].slice(0,field?2:1));
 const exact=rows.filter(r=>r.id===value||String(r.code||'').toLowerCase()===String(value).toLowerCase());if(exact.length===1)return exact[0];if(rows.length===1)return rows[0];throw Error(rows.length?`Ambiguous ${t}: ${rows.map(r=>`${r.id} ${r.code||''} ${r.name||''}`).join('; ')}`:`No ${t} matches ${value}`);
}
async function assignment(db,o){const p=await resolve(db,'projects',req(o,'project')),i=await resolve(db,'indicators',req(o,'indicator')),q=await resolve(db,'periods',req(o,'period'));const [a]=await db.query('SELECT * FROM assignments WHERE project_id=$1 AND indicator_id=$2 AND period_id=$3',[p.id,i.id,q.id]);if(!a)throw Error('No expected submission; use expect first');return a;}
async function openPeriod(db,id){const [p]=await db.query('SELECT * FROM periods WHERE id=$1 FOR UPDATE',[id]);if(p.state==='closed')throw Error('Period is closed');return p;}
async function log(db,actor,operation,record,detail){await db.query('INSERT INTO audit(actor,operation,record_id,detail) VALUES($1,$2,$3,$4)',[actor,operation,record,JSON.stringify(detail)]);}
async function insert(db,t,fields){const keys=Object.keys(fields);return (await db.query(`INSERT INTO ${t}(${keys.join(',')}) VALUES(${keys.map((_,i)=>'$'+(i+1)).join(',')}) RETURNING *`,Object.values(fields)))[0];}
function outputFile(file,data){const p=path.resolve(file);fs.mkdirSync(path.dirname(p),{recursive:true,mode:0o700});fs.writeFileSync(p,data,{flag:'wx',mode:0o600});return p;}
function dims(o){let d={};if(o.dimensions)d=JSON.parse(o.dimensions);if(!d||Array.isArray(d)||typeof d!=='object'||Object.values(d).some(v=>typeof v!=='string'))throw Error('dimensions must be a JSON object with string values');return JSON.stringify(d);}
async function read(db,cmd,o){let rows;
 const view={projects:'projects',indicators:'indicators',periods:'periods','reporting-desk':'v_reporting_desk','partner-chase':'v_attention',compliance:'v_compliance',actions:'actions'};
 if(view[cmd])rows=await db.query(`SELECT * FROM ${view[cmd]} ORDER BY ${['projects','indicators','periods','actions'].includes(cmd)?'code':'project,indicator,period'}`);
 else if(cmd==='review-queue'||cmd==='disaggregation')rows=await db.query(`SELECT d.project,d.indicator,d.period,r.* FROM v_current_results r JOIN v_reporting_desk d ON d.id=r.assignment_id ${cmd==='review-queue'?"WHERE r.state='pending'":''} ORDER BY d.project,d.indicator,d.period,r.code`);
 else if(cmd==='target-gaps')rows=await db.query('SELECT project,indicator,period,owner,target,actual,actual-target AS variance FROM v_reporting_desk WHERE actual IS NOT NULL AND target IS NOT NULL AND actual<target ORDER BY project,indicator,period');
 else if(cmd==='trend')rows=await db.query('SELECT project,indicator,period,unit,starts_on,actual,lag(actual) OVER(PARTITION BY project,indicator ORDER BY starts_on NULLS LAST,period) AS prior_actual FROM v_reporting_desk ORDER BY project,indicator,starts_on NULLS LAST,period');
 else if(cmd==='stale')rows=await db.query(`SELECT p.code,p.name,p.owner,max(n.created_at) AS last_note FROM projects p LEFT JOIN notes n ON n.project_id=p.id GROUP BY p.id HAVING max(n.created_at) IS NULL OR max(n.created_at)<now()-interval '14 days' ORDER BY p.code`);
 else if(cmd==='history'){if(o.cell){const c=await resolve(db,'cells',o.cell);return db.query('SELECT * FROM result_versions WHERE cell_id=$1 ORDER BY version',[c.id]);}return db.query('SELECT * FROM audit ORDER BY created_at,id');}
 else return null;
 if(cmd==='partner-chase')rows=rows.filter(r=>r.issue!=='ready');
 for(const key of ['project','indicator','period'])if(o[key]){const entity=await resolve(db,key==='project'?'projects':key==='indicator'?'indicators':'periods',o[key]);rows=rows.filter(r=>r[key]===entity.code||r[key+'_id']===entity.id);}
 return rows;
}

async function importData(db,o,actor){
 const file=req(o,'file'),raw=fs.readFileSync(file);if(raw.length>25*1024*1024)throw Error('Import exceeds 25 MB; split by reporting period');
 const mapping=o.map?JSON.parse(fs.readFileSync(o.map,'utf8')):{};
 if(!mapping||Array.isArray(mapping)||typeof mapping!=='object'||Object.values(mapping).some(x=>typeof x!=='string'))throw Error('Mapping must map canonical headings to source headings');
 const digest=crypto.createHash('sha256').update(raw).update(JSON.stringify(mapping)).update(String(o.sheet||'raw')).digest('hex');
 const prior=await db.query('SELECT id FROM imports WHERE digest=$1',[digest]);if(prior.length)return {already_imported:true,id:prior[0].id,rows:0};
 let rows;
 if(/\.xlsx$/i.test(file)){
  const {default:ExcelJS}=await import('exceljs');const wb=new ExcelJS.Workbook();await wb.xlsx.load(raw);const sheet=wb.getWorksheet(o.sheet||'raw');if(!sheet)throw Error('Missing raw worksheet; select --sheet= explicitly');
  const csv=[];sheet.eachRow({includeEmpty:false},row=>{const values=[];for(let n=1;n<=sheet.columnCount;n++){const cell=row.getCell(n);if(cell.type===ExcelJS.ValueType.Formula)throw Error('Formula cells are not supported; export raw values');values.push('"'+String(cell.value instanceof Date?cell.value.toISOString().slice(0,10):cell.text).replaceAll('"','""')+'"');}csv.push(values.join(','));});rows=parseCsv(csv.join('\n'));
 }else if(/\.csv$/i.test(file))rows=parseCsv(raw.toString('utf8'));else throw Error('Use a reporting-period .csv or .xlsx export');
 if(!rows.length)throw Error('No data rows');
 const get=(r,k,...aliases)=>pick(r,mapping[k]||k,...(mapping[k]?[]:aliases));
 for(const k of ['Result','Indicator Title','Indicator Code','Activity','Activity Code','Reporting Period','Location'])if(!Object.keys(rows[0]).some(h=>h.toLowerCase()===(mapping[k]||k).toLowerCase())&&!(['Activity','Activity Code'].includes(k)&&Object.keys(rows[0]).includes(k.replace('Activity','Project'))))throw Error(`Missing ${k} column; supply --map= when needed`);
 const imported=await insert(db,'imports',{digest,file_name:path.basename(file),original_base64:raw.toString('base64'),mapping:JSON.stringify({...mapping,_sheet:o.sheet||'raw'}),actor});
 const warnings=new Set();let count=0;
 for(const row of rows){
  const val=number(get(row,'Result'),'Result'),pc=get(row,'Activity Code','Project Code'),pn=get(row,'Activity','Project'),ic=get(row,'Indicator Code'),name=get(row,'Indicator Title'),period=get(row,'Reporting Period'),location=get(row,'Location');
  if([pc,pn,ic,name,period,location].some(x=>!String(x).trim()))throw Error('Each result needs project, indicator, period and location');
  const ensure=async(t,code,name,extras)=>{const [old]=await db.query(`SELECT * FROM ${t} WHERE lower(code)=lower($1)`,[code]);if(old){if(old.name!==name)throw Error(`Name conflict for ${code}; reconcile before import`);return old;}return insert(db,t,{code,name,...extras});};
  const p=await ensure('projects',pc,pn,{owner:'UNASSIGNED'}),i=await ensure('indicators',ic,name,{}),q=await ensure('periods',period,period,{});await openPeriod(db,q.id);
  let [a]=await db.query('SELECT * FROM assignments WHERE project_id=$1 AND indicator_id=$2 AND period_id=$3',[p.id,i.id,q.id]);if(!a)a=await insert(db,'assignments',{project_id:p.id,indicator_id:i.id,period_id:q.id,owner:'UNASSIGNED'});
  const standard=['Result','Indicator Title','Indicator Code','Activity','Activity Code','Project','Project Code','Reporting Period','Location'];
  const ignored=new Set([...standard.map(x=>mapping[x]||x)].map(x=>x.toLowerCase()));const dimensions=Object.fromEntries(Object.entries(row).filter(([k])=>!ignored.has(k.toLowerCase())));
  const d=JSON.stringify(dimensions);const [exists]=await db.query('SELECT id FROM cells WHERE assignment_id=$1 AND location=$2 AND dimensions=$3::jsonb',[a.id,location,d]);
  if(exists)throw Error('Duplicate or existing result cell; nothing overwritten. Import a nonoverlapping export or record a correction.');
  const c=await insert(db,'cells',{code:'IMP-'+crypto.randomUUID(),assignment_id:a.id,location,dimensions:d});
  await insert(db,'result_versions',{cell_id:c.id,version:1,value:val,evidence:'',reporter:actor,import_id:imported.id,source_row:JSON.stringify(row)});count++;
  warnings.add('Imported results are pending. Review measurement definitions, dates, targets, disaggregation and source evidence before acceptance.');
 }
 return {rows:count,import_id:imported.id,dry_run:!!o['dry-run'],warnings:[...warnings]};
}

export async function execute(db,cmd,o={}){
 if(!commands[cmd])throw Error(`Unknown command ${cmd}; use help`);
 if(cmd==='help')return {commands,usage:'npm run results -- <command> --key=value --json',mutation_flags:'--actor required; use help documentation for each command'};
 const rows=await read(db,cmd,o);if(rows!==null)return rows;
 if(cmd==='export'){const out={format:'programme-results/v1',exported_at:new Date().toISOString(),tables:{}};await db.exec('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');try{for(const t of tables)out.tables[t]=await db.query(`SELECT * FROM ${t} ORDER BY id`);}finally{await db.exec('ROLLBACK');}return {file:outputFile(req(o,'file'),JSON.stringify(out,null,2)+'\n'),tables:tables.length};}
 if(['weekly-review','draft-partner','draft-funder'].includes(cmd)){
  const desk=await read(db,'reporting-desk',o),issues=await read(db,'compliance',o),chase=await read(db,'partner-chase',o);
  const body=`# ${cmd}: internal draft\n\nPrepared ${today()}. Review definitions, coverage and evidence before sharing. Missing and pending results are not zero. Counts do not establish causation.\n\n## Reporting desk\n${formatRows(desk.map(({project,indicator,period,actual,target,accepted,pending})=>({project,indicator,period,actual,target,accepted,pending})))}\n\n## Follow-up\n${formatRows(chase)}\n\n## Evidence checks\n${formatRows(issues)}\n`;
  return {file:outputFile(o.file||path.join(process.env.OUTPUT_DIR||REPO_ROOT,'drafts',`${cmd}-${crypto.randomUUID()}.md`),body),rows:desk.length};
 }
 if(!writable.has(cmd))throw Error('Unsupported command');
 const actor=req(o,'actor');await db.exec('BEGIN');
 try{
  let result;
  if(cmd==='add-project')result=await insert(db,'projects',{code:req(o,'code'),name:req(o,'name'),owner:req(o,'owner'),outcome:req(o,'outcome')});
  else if(cmd==='define-indicator'){
   const code=req(o,'code'),aggregation=req(o,'aggregation');if(!['sum','weighted-rate','snapshot'].includes(aggregation))throw Error('Choose sum, weighted-rate or snapshot');
   const fields={name:req(o,'name'),unit:req(o,'unit'),aggregation,definition:req(o,'definition'),method:req(o,'method'),approved_by:actor};
   const [old]=await db.query('SELECT * FROM indicators WHERE lower(code)=lower($1) FOR UPDATE',[code]);
   if(old){const used=await db.query('SELECT r.id FROM result_versions r JOIN cells c ON c.id=r.cell_id JOIN assignments a ON a.id=c.assignment_id WHERE a.indicator_id=$1',[old.id]);if(used.length&&old.aggregation!=='unreviewed')throw Error('Used definitions are immutable; create a new indicator code for a changed method');result=(await db.query('UPDATE indicators SET name=$2,unit=$3,aggregation=$4,definition=$5,method=$6,approved_by=$7 WHERE id=$1 RETURNING *',[old.id,...Object.values(fields)]))[0];}
   else result=await insert(db,'indicators',{code,...fields});
  }else if(cmd==='set-period'){
   const code=req(o,'code'),start=date(req(o,'start'),'start'),end=date(req(o,'end'),'end'),due=date(req(o,'due'),'due');
   const [old]=await db.query('SELECT * FROM periods WHERE lower(code)=lower($1)',[code]);
   if(old){await openPeriod(db,old.id);const values=await db.query('SELECT r.id FROM result_versions r JOIN cells c ON c.id=r.cell_id JOIN assignments a ON a.id=c.assignment_id WHERE a.period_id=$1 AND r.state=$2',[old.id,'accepted']);if(values.length)throw Error('Calendar with accepted results is immutable');result=(await db.query('UPDATE periods SET starts_on=$2,ends_on=$3,due_on=$4 WHERE id=$1 RETURNING *',[old.id,start,end,due]))[0];}
   else result=await insert(db,'periods',{code,name:o.name||code,starts_on:start,ends_on:end,due_on:due});
  }else if(cmd==='expect'){
   const p=await resolve(db,'projects',req(o,'project')),i=await resolve(db,'indicators',req(o,'indicator')),q=await resolve(db,'periods',req(o,'period'));await openPeriod(db,q.id);
   const target=number(o.target,'target',{optional:true});if(i.aggregation==='weighted-rate'&&target>100)throw Error('Rate target must not exceed 100');
   const [old]=await db.query('SELECT * FROM assignments WHERE project_id=$1 AND indicator_id=$2 AND period_id=$3 FOR UPDATE',[p.id,i.id,q.id]);
   if(old){if(old.target!==null)throw Error('Existing targets are immutable; create a new reporting plan');result=(await db.query('UPDATE assignments SET target=$2,owner=$3 WHERE id=$1 RETURNING *',[old.id,target,req(o,'owner')]))[0];}
   else result=await insert(db,'assignments',{project_id:p.id,indicator_id:i.id,period_id:q.id,owner:req(o,'owner'),target});
  }else if(cmd==='record-result'){
   const a=await assignment(db,o),period=await openPeriod(db,a.period_id);const observed=date(req(o,'observed'),'observed');if(observed>today())throw Error('Observation cannot be in the future');if(period.starts_on&&(observed<period.starts_on||observed>period.ends_on))throw Error('Observation is outside the reporting period');
   const location=req(o,'location'),dimensions=dims(o),value=number(o.value,'value'),denominator=number(o.denominator,'denominator',{optional:true});
   const [ind]=await db.query('SELECT * FROM indicators WHERE id=$1',[a.indicator_id]);if(ind.aggregation==='weighted-rate'&&!(denominator>0))throw Error('Rate requires a positive denominator');
   let [c]=await db.query('SELECT * FROM cells WHERE assignment_id=$1 AND location=$2 AND dimensions=$3::jsonb FOR UPDATE',[a.id,location,dimensions]);
   if(c&&!o.reason)throw Error('Correction requires --reason=; earlier versions are retained');
   if(!c)c=await insert(db,'cells',{code:o.code||'RES-'+crypto.randomUUID(),assignment_id:a.id,location,dimensions});
   const [{next}]=await db.query('SELECT coalesce(max(version),0)+1 AS next FROM result_versions WHERE cell_id=$1',[c.id]);
   result=await insert(db,'result_versions',{cell_id:c.id,version:next,value,denominator,evidence:req(o,'evidence'),reporter:actor,observed_on:observed});
  }else if(cmd==='review-result'){
   const r=await resolve(db,'result_versions',req(o,'result'));const [a]=await db.query('SELECT a.* FROM assignments a JOIN cells c ON c.assignment_id=a.id WHERE c.id=$1',[r.cell_id]);const p=await openPeriod(db,a.period_id);
   if(r.state!=='pending')throw Error('Result is already reviewed');const [latest]=await db.query('SELECT result_id FROM v_current_results WHERE cell_id=$1',[r.cell_id]);if(latest.result_id!==r.id)throw Error('Review only the current version');
   const decision=req(o,'decision');if(!['accepted','rejected'].includes(decision))throw Error('Choose accepted or rejected');
   if(decision==='accepted'){
    const [i]=await db.query('SELECT * FROM indicators WHERE id=$1',[a.indicator_id]);if(i.aggregation==='unreviewed'||!i.definition||!i.method||!i.approved_by)throw Error('Review indicator definition first');
    if(!p.starts_on||!p.ends_on||!p.due_on)throw Error('Review reporting calendar first');if(!r.evidence||!r.observed_on)throw Error('Record a correction with evidence and observation date first');
    if(r.observed_on<p.starts_on||r.observed_on>p.ends_on||r.observed_on>today())throw Error('Observation date is outside the valid period');
    if(i.aggregation==='weighted-rate'&&!r.denominator)throw Error('Rate needs a denominator');
   }
   result=(await db.query('UPDATE result_versions SET state=$2,reviewed_by=$3,review_note=$4 WHERE id=$1 RETURNING *',[r.id,decision,actor,req(o,'note')]))[0];
  }else if(cmd==='add-action'){const a=await assignment(db,o);await openPeriod(db,a.period_id);result=await insert(db,'actions',{code:req(o,'code'),assignment_id:a.id,description:req(o,'description'),owner:req(o,'owner'),due_on:date(req(o,'due'),'due')});}
  else if(cmd==='complete-action'){const a=await resolve(db,'actions',req(o,'action'));if(a.state==='done')throw Error('Action already complete');const [assignment]=await db.query('SELECT period_id FROM assignments WHERE id=$1',[a.assignment_id]);await openPeriod(db,assignment.period_id);result=(await db.query("UPDATE actions SET state='done',evidence=$2 WHERE id=$1 RETURNING *",[a.id,req(o,'evidence')]))[0];}
  else if(cmd==='log-note'){const p=await resolve(db,'projects',req(o,'project'));result=await insert(db,'notes',{project_id:p.id,note:req(o,'note'),actor});}
  else if(cmd==='close-period'){
   const q=await resolve(db,'periods',req(o,'period'));await openPeriod(db,q.id);if(!q.ends_on||q.ends_on>=today())throw Error('Period must have ended before closure');
   const desk=await db.query('SELECT * FROM v_reporting_desk WHERE period_id=$1',[q.id]);if(!desk.length||desk.some(x=>x.actual===null))throw Error('Every expected submission needs complete accepted results');
   const gaps=await db.query('SELECT * FROM v_compliance WHERE period=$1',[q.code]);if(gaps.length)throw Error('Resolve compliance findings before closure');
   const open=await db.query("SELECT x.id FROM actions x JOIN assignments a ON a.id=x.assignment_id WHERE a.period_id=$1 AND x.state='open'",[q.id]);if(open.length)throw Error('Close outstanding actions first');
   result=(await db.query("UPDATE periods SET state='closed',closed_by=$2,closure_note=$3 WHERE id=$1 RETURNING *",[q.id,actor,req(o,'note')]))[0];
  }else if(cmd==='import'){if(o.vendor!=='devresults')throw Error('Use import devresults');result=await importData(db,o,actor);}
  await log(db,actor,cmd,result.id||result.import_id||null,{...o,map:o.map||null,file:o.file?path.basename(o.file):null,result:result.id||null});
  await db.exec(o['dry-run']?'ROLLBACK':'COMMIT');return result;
 }catch(e){await db.exec('ROLLBACK');throw e;}
}
export function formatRows(rows){if(!Array.isArray(rows))return JSON.stringify(rows,null,2);if(!rows.length)return 'No records.';const keys=Object.keys(rows[0]);const flat=v=>v===null?'unknown':typeof v==='object'?JSON.stringify(v):String(v);return '| '+keys.join(' | ')+' |\n| '+keys.map(()=> '---').join(' | ')+' |\n'+rows.map(r=>'| '+keys.map(k=>flat(r[k]).replaceAll('|','/').replaceAll('\n',' ')).join(' | ')+' |').join('\n');}
const allowed={
 'add-project':['code','name','owner','outcome'],'define-indicator':['code','name','unit','aggregation','definition','method'],'set-period':['code','name','start','end','due'],expect:['project','indicator','period','owner','target'],
 'record-result':['project','indicator','period','location','dimensions','code','value','denominator','evidence','observed','reason'],'review-result':['result','decision','note'],'add-action':['project','indicator','period','code','description','owner','due'],'complete-action':['action','evidence'],'log-note':['project','note'],'close-period':['period','note'],import:['vendor','file','map','sheet','dry-run'],export:['file'],history:['cell'],'weekly-review':['project','period','file'],'draft-partner':['project','period','file'],'draft-funder':['project','period','file']};
export function parseArgs(args){const [cmd='help',...rest]=args,o={};for(const a of rest){if(cmd==='import'&&a==='devresults'&&!o.vendor){o.vendor=a;continue;}if(!a.startsWith('--'))throw Error('Flags use --key=value');const [key,...parts]=a.slice(2).split('=');if(Object.hasOwn(o,key))throw Error(`Duplicate flag ${key}`);if(!['json','actor',...(allowed[cmd]||['project','indicator','period'])].includes(key))throw Error(`Unknown flag ${key}`);o[key]=parts.length?parts.join('='):true;}return {cmd,o};}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){let db;try{const {cmd,o}=parseArgs(process.argv.slice(2));db=await getDb();const result=await execute(db,cmd,o);const columns={'reporting-desk':['project','indicator','period','target','actual','accepted','pending'],'partner-chase':['project','indicator','period','owner','issue','days_overdue'],compliance:['project','indicator','period','rule'],disaggregation:['project','indicator','period','location','value','denominator','state'],'review-queue':['code','project','indicator','location','value','state']};const human=Array.isArray(result)&&columns[cmd]?result.map(row=>Object.fromEntries(columns[cmd].map(k=>[k,row[k]]))):result;console.log(o.json?JSON.stringify(result):formatRows(human));}catch(e){console.error(e.message);process.exitCode=1;}finally{if(db)await db.close();}}
