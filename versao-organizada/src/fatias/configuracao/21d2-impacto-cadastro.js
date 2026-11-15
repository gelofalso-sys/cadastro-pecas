
/* ===== aviso de impacto: quando um cadastro muda e as peças já criadas passam a custar outro valor ===== */
/* Compara a MESMA lista de peças com os cadastros anterior e atual. Uma edição de
   peça ocorrida antes do cadastro não pode ser atribuída à alteração do cadastro. */
function custoPorLanc(config,pecas){const anterior=S.config;try{S.config=config;const g=gerar(clone(pecas)),m={};g.linhas.forEach(r=>{const q=num(r.v.W);m[r.lancId]=(m[r.lancId]||0)+custoLinhaDe(g,r)*(q==null?1:q)});return m}finally{S.config=anterior}}
function impactoAgendar(){if(estadoArmazenamento.restaurando)return;
  if(!estadoConfig.impT){try{estadoConfig.impConfigAntes=estadoArmazenamento.snapC?JSON.parse(estadoArmazenamento.snapC):null}catch(e){estadoConfig.impConfigAntes=null}}
  clearTimeout(estadoConfig.impT);estadoConfig.impT=setTimeout(impactoConferir,1500)}
function impactoConferir(){const anterior=estadoConfig.impConfigAntes;estadoConfig.impConfigAntes=null;estadoConfig.impT=null;if(!anterior)return;
  let antes,depois;try{const pecas=clone(S.lanc);antes=custoPorLanc(anterior,pecas);depois=custoPorLanc(S.config,pecas)}catch(e){return}
  let n=0,a=0,b=0;Object.keys(depois).forEach(id=>{if(!(id in antes))return;const x=antes[id],y=depois[id];if(Math.abs(x-y)>=0.005){n++;a+=x;b+=y}});
  if(n)toast(`Esta mudança alterou o custo de ${n} peça(s) já criadas: de R$ ${brl(r2c(a))} para R$ ${brl(r2c(b))} (${b>=a?"+":"−"}R$ ${brl(r2c(Math.abs(b-a)))}).`)}
