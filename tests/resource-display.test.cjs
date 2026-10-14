const {test}=require('node:test'),assert=require('node:assert/strict'),R=require('../src/data/resource-display.js');
test('resource headers use ten-thousand units at the boundary and for large balances',()=>{
 assert.equal(R.format(9999),'9,999');assert.equal(R.format(10000),'1萬');assert.equal(R.format(2115337199),'211,533.72萬');assert.equal(R.format(2362205),'236.22萬');assert.equal(R.format(252),'252');assert.equal(R.format(0),'0');
});
