/* Ações de clique (data-act) da fatia exportacao. Registradas em ACOES (src/core/acoes.js).
   Convenção: o que era `break` no switch virou `return`. O estado de exportar/importar fica em estadoExportacao (19b-assistente-outro-sistema.js). */
registrarAcoes(ACOES,"exportacao",{
  "mod-novo":()=>{abrirNovoSistema()},
  "novo-ok":({C})=>{const N=estadoExportacao.novo;if(!N)return;const mo={id:uid(),nome:(String(N.nome||"").trim()||"Novo sistema"),formato:N.formato,sep:N.sep,dec:N.dec,enc:"utf8bom",
      cols:N.cols.map(c=>{const x={k:c.k||"",h:c.h||"",on:true};if(c.tipo)x.tipo=c.tipo;if(c.fator)x.fator=c.fator;return x})};
      C.modelos.push(mo);C.modelo=mo.id;estadoExportacao.novo=null;const o=document.querySelector(".rep");if(o)o.remove();salvar(true,false);render();
      toast(`“${mo.nome}” pronto: é só escolher “${mo.nome}” em Exportar para e baixar. Faça um teste pequeno no outro sistema antes de importar tudo.`);return},
  "mod-conferir":()=>{const g=gerar();if(!g.linhas.length){toast("A tabela está vazia: lance ou cole peças antes de conferir.");return}if(!abrirConferencia(g,colunasExport(),null))toast("Tudo certo: a tabela atende às regras do modelo.");return},
  "mod-salvar":()=>{modeloParaJson(modeloAtual())},
  "exp-ir":({t})=>{const ref=t.dataset.ref,ri=G&&G.linhas.findIndex(r=>String(r.v.E||"")===ref);if(ri==null||ri<0){toast("A peça não está na tabela atual.");return}if(estadoPlanilha.fv&&!estadoPlanilha.fv.has(ri)){toast("Esta peça está fora do filtro atual. Feche esta janela e limpe o filtro para encontrá-la.");return}const o=t.closest(".rep");if(o)o.remove();estadoExportacao.pend=null;visPara(celular()?"planilha":"tudo");const col=LET.findIndex(L=>NOME[L]===t.dataset.colnome);selecionar(ri,col>=0?col:LET.indexOf("F"));rolarAte();setTimeout(()=>{const e=document.querySelector("#sheet td.sa");if(e)e.focus()},100);return},
  "exp-assim":()=>{const o=document.querySelector(".rep");if(o)o.remove();const a=estadoExportacao.pend;estadoExportacao.pend=null;if(a&&a.tipo==="copiar")copiar(a.ids,true);else baixar(true,a&&a.ids);return},
  "xlsx":()=>{baixar()},
  "copiar":()=>{copiar()},
  "exp-limpar":()=>{gravarExport(true)},
  "exp-so":()=>{gravarExport(false)},
  "exp-nao":()=>{lastExport=null;renderTopo()},
  "exp-agrupar":()=>{estadoExportacao.agrupa=!estadoExportacao.agrupa;if(estadoExportacao.ult)mostrarConferencia(estadoExportacao.ult.p,estadoExportacao.ult.podeSeguir);return},
  "imp-ok":()=>{aplicarImp()},
  "backup":()=>{backup()}
});
