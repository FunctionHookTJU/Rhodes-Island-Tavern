// Preview only changes transforms; commit the lineup once the pointer is released.
let boardPointer=null, suppressBoardClickUntil=0;
document.head.insertAdjacentHTML('beforeend','<style>#board .unit-card,#bench .unit-card{touch-action:none}.board-drag-ghost{position:fixed!important;z-index:10000!important;pointer-events:none!important;opacity:.88;transform:translate(-50%,-50%);margin:0!important}.board-drag-source{opacity:.15!important}</style>');
document.addEventListener('pointerdown',ev=>{
  if(ev.button!==0||s.busy||s.phase!=='备战'||boardPointer)return;
  const card=ev.target.closest('#board .unit-card,#bench .unit-card');if(!card)return;
  const type=card.dataset.side,index=Number(card.dataset.slot)-1;
  boardPointer={id:ev.pointerId,type,index,card,x:ev.clientX,y:ev.clientY,active:false};
  card.classList.add('board-pressed');
},true);
// Cancel the inline native drag handler too: a canceled drag has no dragend.
document.addEventListener('dragstart',ev=>{if(boardPointer){ev.preventDefault();ev.stopImmediatePropagation()}},true);
document.head.insertAdjacentHTML('beforeend','<style>.card.board-pressed{opacity:.72}</style>');
function resetBoardPreview(p){
  for(const item of p.slots||[]){item.el.style.transform='';item.el.style.transition=''}
  p.card.classList.remove('board-drag-source','board-pressed','dragging');p.ghost?.remove();
}
function previewBoardPointer(ev){
  const p=boardPointer;if(!p||p.id!==ev.pointerId)return;
  if(ev.pointerType==='mouse'&&(ev.buttons&1)===0){resetBoardPreview(p);boardPointer=null;return}
  if(!p.active){
    if(Math.hypot(ev.clientX-p.x,ev.clientY-p.y)<8)return;
    p.active=true;clearTimeout(longPressTimer);document.querySelector('.detail-pop')?.remove();
    p.slots=[...document.querySelectorAll('#board > .board-slot')].map(el=>({el,rect:el.getBoundingClientRect(),index:Number(el.dataset.index)}));
    const rect=p.card.getBoundingClientRect();p.ghost=p.card.cloneNode(true);
    p.ghost.classList.remove('board-pressed','dragging');
    p.ghost.classList.add('board-drag-ghost');p.ghost.removeAttribute('id');
    p.ghost.style.width=rect.width+'px';p.ghost.style.height=rect.height+'px';
    p.ghost.removeAttribute('data-side');p.ghost.removeAttribute('data-slot');
    document.body.appendChild(p.ghost);p.card.classList.add('board-drag-source');
  }
  ev.preventDefault();p.ghost.style.left=ev.clientX+'px';p.ghost.style.top=ev.clientY+'px';
  const bounds=document.getElementById('board').getBoundingClientRect();
  p.inside=ev.clientX>=bounds.left&&ev.clientX<=bounds.right&&ev.clientY>=bounds.top&&ev.clientY<=bounds.bottom;
  const remaining=p.slots.filter(x=>p.type!=='board'||x.index!==p.index);
  p.gap=remaining.filter(x=>ev.clientX>x.rect.left+x.rect.width/2).length;
  const width=p.slots[0]?.rect.width||p.card.getBoundingClientRect().width;
  const step=p.slots.length>1?p.slots[1].rect.left-p.slots[0].rect.left:width+8;
  const count=remaining.length+1,start=bounds.left+bounds.width/2-(count*step-step+width)/2;
  remaining.forEach((item,i)=>{
    item.el.style.transition='transform 140ms ease';
    const target=i+(i>=p.gap?1:0);
    item.el.style.transform=p.inside&&(p.type==='board'||remaining.length<7)?'translateX('+(start+target*step-item.rect.left)+'px)':'';
  });
}
document.addEventListener('pointermove',previewBoardPointer,{capture:true,passive:false});
async function finishBoardPointer(ev){
  const p=boardPointer;if(!p||p.id!==ev.pointerId)return;
  boardPointer=null;resetBoardPreview(p);if(!p.active)return;
  suppressBoardClickUntil=Date.now()+500;ev.preventDefault();
  if(ev.type==='pointercancel'||s.busy||s.phase!=='备战')return;
  if(p.inside){
    s.dragging={type:p.type,index:p.index};
    const gap=p.type==='board'&&p.gap>p.index?p.gap+1:p.gap;
    try{await dropToBoardInsert({preventDefault(){},stopPropagation(){}},gap)}finally{s.dragging=null}
  }else if(['board','bench'].includes(p.type)&&document.elementFromPoint(ev.clientX,ev.clientY)?.closest('.shop-panel')){
    await sellCard(p.type,p.index);draw();
  }
}
document.addEventListener('pointerup',finishBoardPointer,{capture:true,passive:false});
document.addEventListener('pointercancel',finishBoardPointer,{capture:true,passive:false});
window.addEventListener('blur',()=>{if(boardPointer){resetBoardPreview(boardPointer);boardPointer=null}});
// Window capture runs before the existing document-level tap-to-deploy handler.
window.addEventListener('click',ev=>{if(Date.now()<suppressBoardClickUntil){ev.preventDefault();ev.stopImmediatePropagation()}},true);
