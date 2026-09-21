const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync('index.html','utf8');
function extract(start,end){return html.slice(html.indexOf(start),html.indexOf(end,html.indexOf(start)))}
async function testAnimation(kind,expected){
  let active=0,max=0,finished=0;
  const applied=[];
  const ctx=vm.createContext({s:{},battleAnchors:new Map(),cacheBattleAnchors(){},draw(){},sleep:async()=>{},
    animateBullet:async()=>{active++;max=Math.max(max,active);await new Promise(setImmediate);active--;finished++},
    applyBattleEventState:e=>{if(e.type==='cumulative_counter')assert.equal(finished,3);if(kind==='bullet_batch'&&e.damage_type==='bullet')assert.equal(finished,applied.filter(x=>x.damage_type==='bullet').length+1);applied.push(e)},applyEventLog(){}});
  vm.runInContext(extract('async function animateEvents(', 'async function refresh('),ctx);
  const shot={damage_type:'bullet',side:'left',from_slot:1,target_side:'right',to_slot:1};
  await ctx.animateEvents({events:[{type:kind+'_start'},shot,shot,shot,{type:kind+'_end'},{type:'cumulative_counter'}],left:[],right:[]});
  assert.equal(max,expected);
}
async function testSelling(){
  const ctx=vm.createContext({document:{head:{insertAdjacentHTML(){}},addEventListener(){},elementFromPoint:()=>({closest:()=>true})},window:{addEventListener(){}},s:{phase:'备战',busy:false},Date,draw(){},compact:a=>a.filter(Boolean),pad:a=>a,log(){},syncPlayer(){}});
  vm.runInContext(fs.readFileSync('board-drag.js','utf8'),ctx);
  vm.runInContext(extract('async function sellCard(', 'window.allowUnitSkillDrop='),ctx);
  for(const where of ['bench','board'])for(const id of ['Hoederer','Ines','U-Official','ordinary'])for(const golden of [false,true]){
    const card={id,card_type:'unit',name:id,golden};let refunded=0,triggered=0;
    ctx.s.bench=[card];ctx.s.board=[card];
    ctx.api=async(url,body)=>{assert.equal(url,'/api/sell');assert.equal(body.card_id,id);refunded++;return {refund:1}};
    ctx.triggerSale=async u=>{assert.equal(u,card);assert.ok(where==='bench'?ctx.s.bench[0]===null:ctx.s.board.length===0);triggered++};
    vm.runInContext(`boardPointer={id:1,type:'${where}',index:0,active:true,inside:false,card:{classList:{remove(){}}}}`,ctx);
    await ctx.finishBoardPointer({pointerId:1,type:'pointerup',clientX:0,clientY:0,preventDefault(){}});
    assert.equal(refunded,1);assert.equal(triggered,1);
  }
}
function loadFunctions(ctx,names){for(const name of names){const line=html.split(/\r?\n/).find(x=>x.startsWith('function '+name+'(')||x.startsWith('async function '+name+'('));assert.ok(line,name);vm.runInContext(line,ctx)}}
function testGuard(){
  const ctx=vm.createContext({});loadFunctions(ctx,['hasMark','setGuard','mechanicDetails']);
  const podenco={description:'上场：选择1个棋子，使其获得嘲讽，并使所有友方具有嘲讽的棋子获得+3/+3',mechanics:['on_deploy']};
  assert.equal(ctx.hasMark(podenco,'guard'),false);
  assert.ok(!ctx.mechanicDetails(podenco).includes('会优先被选为攻击目标'));
  ctx.setGuard(podenco,true);assert.equal(ctx.hasMark(podenco,'guard'),true);
  assert.ok(ctx.mechanicDetails(podenco).includes('会优先被选为攻击目标'));
  ctx.setGuard(podenco,false);assert.equal(ctx.hasMark(podenco,'guard'),false);
  assert.equal(ctx.hasMark({mechanics:['guard']},'guard'),true);
}
async function testBattleMerge(skip,owned=2){
  const base={id:'Fiammetta',name:'菲亚梅塔',card_type:'unit',attack:4,max_hp:4,mechanics:['legacy']};
  const compact=a=>a.filter(Boolean),pad=a=>{a=compact(a);return a.concat(Array(7-a.length).fill(null))};
  const state={cards:[base],board:pad(Array.from({length:owned},()=>({...base,attack:6}))),bench:Array(12).fill(null),enemy:[],phase:'备战',hp:50,round:2,shopLocked:true,skipBattle:skip};
  // Combat-only summoned copy must not count towards permanent triples.
  const res={left:[...structuredClone(state.board).filter(Boolean),{...base,summoned_by_phase:'legacy'}],right:[],winner:'left',round:3,events:[{type:'gain_card',side:'left',from:'死芒',card:{...base},card_name:base.name}]};
  const ctx=vm.createContext({s:state,compact,pad,cloneData:structuredClone,emptyBench:()=>state.bench.findIndex(x=>!x),log(){},draw(){},clearInterval(){},setTimeout(){},api:async()=>res,syncPlayer(){},startPrep:async()=>{},battleAnchors:new Map(),cacheBattleAnchors(){},sleep:async()=>{}});
  loadFunctions(ctx,['hasMark','setGuard','baseUnitById','applyGoldenOverrides','extraStatSum','goldenCopy','collectMergePieces','phantomCanReplace','findTripleMerge','tryCombineTriples','cleanupAfterBattle','restoreBoardAfterBattle','applyEventLog','fight']);
  ctx.applyBattleEventState=()=>{};
  vm.runInContext(extract('async function animateEvents(', 'async function refresh('),ctx);
  await ctx.fight();
  const all=[...state.board,...state.bench].filter(Boolean);
  assert.equal(all.filter(u=>u.golden).length,owned===2?1:0);
  assert.equal(all.length,owned===2?1:2);
  if(owned===2){assert.equal(state.bench.find(u=>u)?.attack,12);assert.equal(compact(state.board).length,0)}
}
function testTripleHints(){
  const s={board:[],bench:[]},ctx=vm.createContext({s});
  loadFunctions(ctx,['collectMergePieces','phantomCanReplace','findTripleMerge','canCompleteTriple','tripleHint']);
  const unit=(id,extra={})=>({id,card_type:'unit',stars:4,...extra}),candidate=unit('Fiammetta');
  s.board=[unit('Fiammetta')];assert.equal(ctx.canCompleteTriple(candidate),false);
  s.bench=[unit('Fiammetta')];assert.equal(ctx.canCompleteTriple(candidate),true);
  for(const side of ['shop','discover','sale-pick'])assert.ok(ctx.tripleHint(candidate,side).includes('⬆'));
  for(const side of ['board','bench','enemy','codex','select-target'])assert.equal(ctx.tripleHint(candidate,side),'');
  assert.equal(ctx.canCompleteTriple({...candidate,golden:true}),false);
  assert.equal(ctx.canCompleteTriple({card_type:'skill',id:candidate.id}),false);
  s.bench=[unit('Fiammetta',{golden:true})];assert.equal(ctx.canCompleteTriple(candidate),false);
  s.bench=[unit('Phantom')];assert.equal(ctx.canCompleteTriple(candidate),false);
  s.bench=[unit('Phantom',{golden:true})];assert.equal(ctx.canCompleteTriple(candidate),true);
  s.board=[unit('Fiammetta'),unit('Fiammetta')];s.bench=[];
  assert.equal(ctx.canCompleteTriple(unit('Phantom',{golden:true})),true);
  assert.equal(ctx.canCompleteTriple(unit('Other')),false);
}
async function testPointerRelease(){
  const handlers={},windows={},classes=new Set(),card={dataset:{side:'board',slot:'1'},classList:{add:x=>classes.add(x),remove:(...xs)=>xs.forEach(x=>classes.delete(x))}};
  const ctx=vm.createContext({document:{head:{insertAdjacentHTML(){}},addEventListener:(type,fn)=>handlers[type]=fn},window:{addEventListener:(type,fn)=>windows[type]=fn},s:{phase:'备战'},Date});
  vm.runInContext(fs.readFileSync('board-drag.js','utf8'),ctx);
  const down=()=>handlers.pointerdown({button:0,pointerId:1,clientX:0,clientY:0,target:{closest:()=>card}});
  down();assert.ok(classes.has('board-pressed'));
  let stopped=false,canceled=false;handlers.dragstart({preventDefault(){canceled=true},stopImmediatePropagation(){stopped=true}});
  assert.ok(canceled&&stopped);
  await handlers.pointerup({pointerId:1});assert.equal(classes.size,0);
  down();await handlers.pointercancel({pointerId:1});assert.equal(classes.size,0);
  down();windows.blur();assert.equal(classes.size,0);
  down();handlers.pointermove({pointerId:1,pointerType:'mouse',buttons:0});assert.equal(classes.size,0);
}
(async()=>{await testAnimation('bullet_batch',1);await testAnimation('w_barrage',3);await testSelling();testGuard();for(const skip of [false,true]){await testBattleMerge(skip);await testBattleMerge(skip,1)}testTripleHints();await testPointerRelease();console.log('PASS: bullets, sales, guard, battle merge, triple hints and pointer release/cancel/blur')})().catch(e=>{console.error(e);process.exitCode=1});
