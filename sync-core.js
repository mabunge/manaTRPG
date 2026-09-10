(function(root){
'use strict';
const clone=x=>JSON.parse(JSON.stringify(x));
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function board(s){return {party:s.party,combat:s.combat};}
function plan(before,after,records,uid,gm){
 let patches=[];let old=new Map(before.heroes.map(h=>[h.id,h])),now=new Map(after.heroes.map(h=>[h.id,h]));
 for(let id of new Set([...old.keys(),...now.keys()])){
  let a=old.get(id),b=now.get(id);if(same(a,b))continue;
  const rec=records[id];
  if(!gm&&((rec&&rec.ownerUid!==uid)||(!rec&&id!=='pc_'+uid)))throw Error('다른 플레이어의 캐릭터는 수정할 수 없습니다.');
  if(!gm&&!b)throw Error('공유 중인 캐릭터 삭제는 GM에게 요청해주세요.');
  if(id==='board'||!/^[-_a-zA-Z0-9]+$/.test(id))throw Error('캐릭터 식별자가 올바르지 않습니다.');
  patches.push({id,before:a?clone(a):null,after:b?clone(b):null,expected:rec?rec.token:null,ownerUid:rec?.ownerUid||uid,kind:'hero'});
 }
 if(!same(board(before),board(after))){if(!gm)throw Error('전투·공용 골드·파티 기록은 GM만 수정할 수 있습니다.');let rec=records.board;patches.push({id:'board',before:clone(board(before)),after:clone(board(after)),expected:rec?.token||null,ownerUid:uid,kind:'board'});}
 return patches;
}
function checkVersions(patches,current){for(let p of patches){if((current[p.id]?.token||null)!==p.expected)throw Error('다른 사람이 같은 기록을 수정했습니다. 최신 상태를 확인한 뒤 다시 시도해주세요.');}}
function reverse(patches,afterTokens){return patches.map(p=>({...p,before:clone(p.after),after:clone(p.before),expected:afterTokens[p.id]||null}));}
function applyPatch(s,patches){let next=clone(s);for(let p of patches){if(p.id==='board'){next.party=clone(p.after.party);next.combat=clone(p.after.combat);}else{next.heroes=next.heroes.filter(h=>h.id!==p.id);if(p.after)next.heroes.push(clone(p.after));}}if(!next.heroes.some(h=>h.id===next.activeId))next.activeId=next.heroes[0]?.id||null;return next;}
function code(){const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',bytes=new Uint8Array(20);crypto.getRandomValues(bytes);return Array.from(bytes,b=>chars[b%32]).join('');}
function cleanCode(s){const c=String(s).replace(/[\s-]/g,'').toUpperCase();if(!/^[A-HJ-NP-Z2-9]{20}$/.test(c))throw Error('20자리 초대 코드를 확인해주세요.');return c;}
root.SyncCore={clone,same,board,plan,checkVersions,reverse,applyPatch,code,cleanCode};
})(globalThis);
