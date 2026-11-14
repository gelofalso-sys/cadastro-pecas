const assert=require('node:assert/strict');
const {semAc}=require('../src/core/utilidades.js');
const antigo=s=>String(s==null?'':s).normalize('NFD').replace(new RegExp('['+String.fromCharCode(768)+'-'+String.fromCharCode(879)+']','g'),'').trim().toLowerCase();
const casos=[null,undefined,'','  ANÉIS & peça  ','A\u0301 e\u036f','\u0370','\u{1F48E}',0,123];for(let i=0;i<1000;i++)casos.push(String.fromCharCode(i,768+i%112,5000+i));for(const x of casos)assert.equal(semAc(x),antigo(x));console.log('OK normalização equivalente em 1009 casos');
