'use strict';
const BattleNotices=(()=>{
 const messages=[];let unread=0;
 function add(text,at=Date.now()){text=String(text);const last=messages[0];if(last?.text===text){last.count++;last.at=at;}else messages.unshift({text,at,count:1});messages.length=Math.min(messages.length,30);unread=Math.min(99,unread+1);}
 function read(){unread=0;return messages.map(m=>({...m}));}
 return {add,read,list:()=>messages.map(m=>({...m})),unread:()=>unread};
})();
if(typeof module!=='undefined')module.exports=BattleNotices;
