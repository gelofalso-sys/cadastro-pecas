/* ===== utilidades ===== */
/* bhDe: a galvânica de uma peça (hoje sempre a cadastrada: custo do banho e do verniz acompanham o cadastro) */
/* O Preço de Varejo só existe na peça lançada se o usuário o DIGITOU dentro da peça. O fator gera apenas uma SUGESTÃO (mostrada no formulário); o valor definitivo é do usuário. */
   /* lançamentos anteriores conservam o texto automático que usavam */
/* uma categoria pode usar os tamanhos de outra (grade.usa = nome da categoria de origem): edita-se uma vez só */
/* a variação de cada peça vem só da categoria (e subcategoria) escolhida */
/* ids das opções para uma faixa digitada: 12-16 (de 12 a 16), 12, 18 (esses), todos */
/* categoria "sem banho" (ex.: Prata 925): entra como peça pronta, sem galvânica; ao sair dela volta ao tipo anterior */
function aplicarSemBanho(f){if(estadoBase.editId||f.conj)return;const c=catBy(f.v.I);
  if(c&&c.semBanho){if(!f._sb){f._tipoAntes=f.tipo;f._sb=true}f.tipo="pronta";f.onP={}}
  else if(f._sb){f._sb=false;f.tipo=f._tipoAntes||"bruta";if(f.tipo==="bruta"&&!Object.values(f.on||{}).some(Boolean)&&typeof marcadosPadrao==="function")marcadosPadrao(f)}}
/* categoria vendida por grama: Custo de Compra = peso × valor do grama, enquanto o usuário não digitar o custo à mão */
function compraGramaAuto(f){const c=catBy(f.v.I),r=c&&num(c.compraGrama);
  if(!(r>0)){if(f._pAuto&&f.v.P===f._pAuto)delete f.v.P;f._pAuto=null;return}
  if(!(vazio(f.v.P)||f.v.P===f._pAuto))return;
  const n=num(f.v.N);if(n>0){f.v.P=r2c(n*r).toFixed(2).replace(".",",");f._pAuto=f.v.P}else{if(f.v.P===f._pAuto)delete f.v.P;f._pAuto=null}
  const el=document.getElementById("f-P");if(el&&document.activeElement!==el)el.value=f.v.P||""}
/* Atalhos digitados: "argolinhas" vira Brincos › Argolas; "choker" vira Colares › Choker. Vale nome da categoria/subcategoria ou apelido cadastrado (singular/plural tanto faz). */
/* descrição do fornecedor ("argolinhas lisas") → categoria e subcategoria pelos nomes e apelidos cadastrados */
/* palavras que o usuário escreveria no começo da descrição: "Brinco" (categoria Brincos) e "Argola" (subcategoria Argolas). Cadastradas em Categorias; sem cadastro, deduz do nome (singular). */
/* Vocabulário inicial: termos observados no estoque, editáveis por categoria e subcategoria. */
/* Cache descartável: histórico em IndexedDB + tabela atual, sem contar a mesma peça duas vezes. */
function usoSugPecas(){const vistos=new Set(),out=[];for(const l of [...(S.lanc||[]),...estadoBase.HIST_SUG]){if(!l||!l.v)continue;if(l.id&&vistos.has(l.id))continue;if(l.id)vistos.add(l.id);out.push(l)}return out}
   /* sem lista própria vale o vocabulário inicial */

/* Só esconde sugestões redundantes; o banco personalizado continua intacto. */
function bancoEditarAbrir(){const d=document.querySelector(".banco-painel details");if(d)d.open=true}
function bancoAtualizar(){const el=document.querySelector("#form .banco-palavras");if(!el)return;const busca=el.querySelector("[data-banco-busca]"),texto=busca?busca.value:"",aberto=!!el.querySelector("details[open]");el.outerHTML=bancoHtml(S.form);const novo=document.querySelector("#form .banco-palavras"),campo=novo&&novo.querySelector("[data-banco-busca]"),det=novo&&novo.querySelector("details");if(det&&aberto)det.open=true;if(campo&&texto){campo.value=texto;campo.dispatchEvent(new Event("input",{bubbles:true}))}}
function bancoHtml(f){const c=catBy(f.v.I);if(!c||f.conj)return "";const sub=f.v.J||"",lista=bancoComplementos(f),proprias=[...bancoLista(f.v.I,"") ,...(sub?bancoLista(f.v.I,sub):[])],pk=new Set(proprias.map(semAc)),rapidas=lista.filter(x=>pk.has(semAc(x))).concat(lista.filter(x=>!pk.has(semAc(x))).slice(0,9)),escopo=sub?"subcategoria "+sub:"categoria "+c.nome,edit=bancoLista(c.nome,sub);return `<div class="banco-palavras"><div class="banco-rapido"><span class="hint" title="Com o foco na descrição, Alt+Shift+1 a 9 insere o complemento correspondente. Na categoria, cor ou banho, usa a opção correspondente.">Complementos (Alt+Shift+1–9):</span>${rapidas.map(w=>`<button type="button" class="gi tod" data-act="desc-palavra" data-w="${esc(w)}">${esc(w)}</button>`).join("")}<button type="button" class="btn ghost sm" data-act="banco-toggle" aria-expanded="${estadoBase.bancoAberto}">${estadoBase.bancoAberto?"Fechar palavras":"Mais palavras"}</button></div>${estadoBase.bancoAberto?`<div class="banco-painel"><label>Buscar palavra <input type="search" data-banco-busca placeholder="Digite para filtrar" aria-label="Buscar palavras"></label><div class="banco-lista">${lista.map(w=>`<button type="button" class="gi tod" data-banco-item data-act="desc-palavra" data-w="${esc(w)}">${esc(w)}</button>`).join("")||'<span class="hint">Ainda não há sugestões para este contexto.</span>'}</div><details><summary>Editar palavras da ${esc(escopo)}</summary><p class="hint">Apenas esta ${sub?"subcategoria":"categoria"} será alterada. Separe várias palavras por ponto e vírgula.</p><div class="banco-editar">${edit.map(w=>`<span class="banco-edit-item">${esc(w)} <button type="button" data-act="banco-remover" data-w="${esc(w)}" aria-label="Remover ${esc(w)}">×</button></span>`).join("")}</div><label>Nova palavra ou expressão <input data-banco-nova maxlength="200" placeholder="ex.: Ponto de luz; Lisa"></label><button type="button" class="btn sm" data-act="banco-adicionar">Adicionar palavras</button></details></div>`:""}</div>`}
/* preenche a descrição sozinho com as palavras (só enquanto vazia ou ainda igual ao que foi preenchido antes) */
   /* a descrição é preenchida pelo usuário ou por sugestões escolhidas */
/* entradas extras da lista de categorias do formulário: apelidos e subcategorias, cada uma com o caminho completo */
/* verniz por variação de banho: o que foi marcado nesta peça vale; sem marca, vale o padrão do banho */
/* banhos marcados: peça bruta usa "on"; peça pronta usa "onP" (só cor, letra e milésimos — sem custo de banho) */
/* sufixo da referência: letra do banho + letra (AA, BA…) ou nome (A12) da opção, conforme a variação */
/* Texto, coluna e valor de cada opção seguem a variação (rótulo, coluna e nome) até serem digitados à mão: trocar "aro" por "tamanho" ou o nome de uma opção atualiza tudo. */
/* sigla sugerida a partir do nome (Azul → AZ, Rosa → RO); se já existe na categoria tenta outras letras; por fim cai no número */
/* biblioteca de cores (aba Cores, tamanhos e variações): vale para qualquer categoria; a peça escolhe */
/* O identificador da cor deve sobreviver a renomeações: ele também integra as chaves das quantidades. */
/* Se a descrição já traz o tamanho ("aro 14" ou o rótulo antigo), ele é trocado pelo da linha em vez de somado ("aro 14 aro 12"). */
/* barra fixa "Numeração do sistema": só os prefixos que existem nas categorias; os próprios de subcategorias ficam num grupo à parte */
function renderNum(){const el=document.getElementById("numbar");if(!el)return;const C=cfg(),{m,sec}=prefixosTodos(),ps=[...m.keys()],ss=[...sec.keys()],sig=ps.join(",")+"|"+ss.join(",");
  const lanc=new Set(S.lanc.map(l=>prefDe(val(l,"I"),val(l,"J")))),atual=new Set([prefDe(S.form.v.I,S.form.v.J)]);
  if(estadoRomaneio.ROM)estadoRomaneio.ROM.rows.forEach(r=>{if(!r.skip)atual.add(prefDe(r.cat,r.sub))});
  const lab=(p,mp)=>`<label class="nb" data-p="${esc(p)}" title="${esc(mp.get(p).join(" · "))}"><span>${esc(p)}</span><input class="n" data-ult="${esc(p)}" inputmode="numeric" aria-label="Última peça ${esc(p)}"><small></small></label>`;
  if(el.dataset.sig!==sig){el.dataset.sig=sig;const aberto=el.querySelector("details.nb-x")&&el.querySelector("details.nb-x").open;
    el.innerHTML=`<b class="nb-t">Numeração do sistema</b><span class="hint nb-h">última peça de cada categoria — vale para o lançamento manual e para o romaneio · com zeros à esquerda (ex.: 0050) as referências mantêm a largura (CL0051)</span><div class="nb-l">${ps.map(p=>lab(p,m)).join("")}</div>${ss.length?`<details class="nb-x" ${aberto?"open":""}><summary>Prefixos só de subcategorias (${ss.length}): ${ss.map(esc).join(", ")}</summary><div class="nb-l">${ss.map(p=>lab(p,sec)).join("")}</div></details>`:""}`}
  [...ps,...ss].forEach(p=>{const lb=el.querySelector(`label[data-p="${CSS.escape(p)}"]`);if(!lb)return;const inp=lb.querySelector("input"),v=String(C.seqs[p]??"");
    if(document.activeElement!==inp&&inp.value!==v)inp.value=v;
    const uso=atual.has(p)||lanc.has(p);lb.classList.toggle("on",atual.has(p));lb.classList.toggle("bad",uso&&!(ultimo(p)>0));
    lb.querySelector("small").textContent="→ "+p+fnum(p,proxDe(p))})}
/* se a última peça foi digitada com zeros à esquerda (ex.: 0050), as referências novas mantêm a largura (CL0051) */
function proxDe(p){return Math.max(inicioDe(p),(estadoBase.G&&estadoBase.G.cont&&estadoBase.G.cont[p])||0)+1}
function inicioDe(p,g){return Math.max(ultimo(p),((g||estadoBase.G||{}).manual||{})[p]||0)}
/* NCM, CFOP, FCP e Custo de Insumos podem ter valor próprio em cada categoria; sem ele vale o padrão da coluna */
/* Itens detalhados só alteram Q após escolha explícita de uma regra nos Cadastros. */
/* banho sem cálculo: modo "Sem cálculo" ou sem coluna de custo (nada vai para R/S/T) */
function listaDe(L,catNome){const C=cfg();let base=[];
  if(L==="H")base=C.fornecedores.map(f=>f.nome);else if(L==="I")base=C.categorias.map(c=>c.nome);
  else if(L==="J"){const c=catBy(catNome);base=c?c.subs:[]}else if(L==="L")base=C.cores;else if(L==="M")base=C.observacoes;
  else if(L==="AD")base=["Não","Sim"];else if(L==="AE")base=["Ativo","Inativo"];
  const valores=[...new Set([...base,...opcoesDe(L)])];
  if(!["H","I","J","L","M"].includes(L))return valores;
  const usos=new Map();for(const item of usoSugPecas()){if(L==="J"&&item.v.I!==catNome)continue;const k=String(item.v[L]||"").trim().toLocaleLowerCase("pt-BR");if(k)usos.set(k,(usos.get(k)||0)+1)}
  return valores.map((v,i)=>({v,i,n:usos.get(String(v).trim().toLocaleLowerCase("pt-BR"))||0})).sort((a,b)=>b.n-a.n||a.i-b.i).map(x=>x.v)}
function toast(msg,acao){if(/NÃO (?:consegui|salv|foi possível)|não consegui (?:salvar|gravar|guardar)|dados (?:danificados|corrompidos)|memória (?:do navegador )?cheia/i.test(String(msg))){let box=document.getElementById("avisosCriticos");if(!box){box=document.createElement("div");box.id="avisosCriticos";box.setAttribute("aria-live","assertive");box.style.cssText="position:fixed;top:12px;right:12px;z-index:10000;display:grid;gap:8px;max-width:min(440px,calc(100vw - 24px))";document.body.appendChild(box)}if([...box.children].some(x=>x.dataset.msg===String(msg)))return;const item=document.createElement("div");item.dataset.msg=String(msg);item.setAttribute("role","alert");item.style.cssText="background:#fff;border:2px solid #a52222;color:#621717;padding:12px;border-radius:8px;box-shadow:0 4px 16px #0003";const texto=document.createElement("span");texto.textContent=msg;item.appendChild(texto);if(acao){const botao=document.createElement("button");botao.type="button";botao.textContent=acao.t;botao.onclick=()=>{item.remove();acao.fn()};item.appendChild(botao)}const fechar=document.createElement("button");fechar.type="button";fechar.textContent="Fechar";fechar.setAttribute("aria-label","Fechar aviso crítico");fechar.onclick=()=>item.remove();item.appendChild(fechar);box.appendChild(item);return}const t=document.getElementById("toast");t.innerHTML=`<span>${esc(msg)}</span>`+(acao?`<button type="button" id="tBtn">${esc(acao.t)}</button>`:"")+`<button type="button" id="tFechar" aria-label="Fechar aviso">×</button>`;t.hidden=false;if(acao)document.getElementById("tBtn").onclick=()=>{t.hidden=true;acao.fn()};document.getElementById("tFechar").onclick=()=>{t.hidden=true;clearTimeout(toast._t)};clearTimeout(toast._t);toast._t=setTimeout(()=>t.hidden=true,Math.min(20000,Math.max(acao?10000:6000,String(msg).length*90)))}

