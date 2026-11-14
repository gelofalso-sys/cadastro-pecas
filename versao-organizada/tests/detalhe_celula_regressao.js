const assert=require('node:assert/strict');
const {ligar}=require('./unit/_contexto.mjs');
const S={config:{categorias:[],colcfg:{},seqs:{},banhistas:[]},lanc:[{id:'x'}]};const f=ligar(S);
const r={lancId:'x',v:{N:'3',W:'2'},ovs:[],banho:{coluna:'R',modo:'peso',mult:2},verniz:0.5};let t=f.detalheCelulaSelecionada(r,'R',0);assert.match(t,/3 g × R\$ 2\/g = R\$ 6,00 por unidade × 2 un\. = R\$ 12,00/);r.banho.modo='fixo';t=f.detalheCelulaSelecionada(r,'R',0);assert.match(t,/valor fixo/);r.ovs=['R'];assert.match(f.detalheCelulaSelecionada(r,'R',0),/informado na peça/);S.lanc[0].conj=true;assert.match(f.detalheCelulaSelecionada(r,'R',0),/componentes/);console.log('OK explicação da célula: grama, quantidade, fixo, manual e conjunto');
