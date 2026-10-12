'use strict';
// Cache only inside one synchronous animation frame; UI actions always read fresh state.
const CombatFrameCache=(()=>{let depth=0,memo=new Map();function clear(){memo=new Map();}function run(fn){if(!depth)clear();depth++;try{return fn();}finally{depth--;if(!depth)clear();}}function read(key,owner,compute){if(!depth)return compute();let owners=memo.get(key);if(!owners){owners=new Map();memo.set(key,owners);}if(!owners.has(owner))owners.set(owner,compute());return owners.get(owner);}return {run,read,clear};})();
if(typeof module!=='undefined')module.exports=CombatFrameCache;
