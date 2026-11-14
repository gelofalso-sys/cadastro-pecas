from pathlib import Path
from io import BytesIO
import ast,csv,io,xml.etree.ElementTree as ET
from openpyxl import load_workbook
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parent.parent
mod=ast.parse((root/'tests/auditoria_xml_importacao.py').read_text(encoding='utf-8'))
xml=next(ast.literal_eval(n.value) for n in mod.body if isinstance(n,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='xml' for t in n.targets))
x=ET.fromstring(xml);ns={'n':'http://www.portalfiscal.inf.br/nfe'};inf=x.find('.//n:infNFe',ns);d=inf.findall('n:det',ns);inf.remove(d[1]);prod=d[0].find('n:prod',ns)
for tag,val in {'xProd':'Colar Teste','qCom':'1000','vUnCom':'1.234','vProd':'1234.00','vDesc':'0.00'}.items():prod.find('n:'+tag,ns).text=val
tot=x.find('.//n:ICMSTot',ns)
for tag,val in {'vProd':'1234.00','vDesc':'0.00','vFrete':'0.00','vNF':'1234.00'}.items():tot.find('n:'+tag,ns).text=val
buf=ET.tostring(x,encoding='utf-8',xml_declaration=True);url=(root/'Cadastro de Pecas - abrir no Chrome.html').as_uri()
with sync_playwright() as p:
 b=p.chromium.launch(channel='msedge');q=b.new_page(viewport={'width':1400,'height':900});errors=[];q.on('pageerror',lambda e:errors.append(str(e)));q.on('dialog',lambda d:d.accept());q.goto(url)
 q.locator('#nfFile').set_input_files({'name':'precisao.xml','mimeType':'application/xml','buffer':buf});print('NF custo UI',q.locator('[data-nf="custo"]').first.input_value(),flush=True);q.locator('#nfGo').click();print('Rom custo',q.locator('[data-rp="custo"]').first.input_value(),flush=True);card=q.locator('#romWrap .rc:not(.lote)').first;card.locator('[data-act="rom-div"]').click();card.locator('[data-rp="peso"]').fill('1');q.locator('#romCriar').click();q.locator('[data-act="rev-ok"]').click();q.locator('.rep').wait_for();q.wait_for_function("()=>(JSON.parse(localStorage.getItem('cadpecas4')||'{}').lanc||[]).length===1")
 d=q.evaluate("JSON.parse(localStorage.getItem('cadpecas4')).lanc");print('P persistido:',d[0]['v']['P']);assert abs(float(str(d[0]['v']['P']).replace(',','.'))-1.234)<1e-8,d
 q.locator('.rep [data-act="rel-fechar"]').first.click();q.locator('#side [data-vis="tudo"]').click()
 with q.expect_download() as dl:
  q.locator('[data-act="xlsx"]').first.click()
  if q.locator('[data-act="exp-assim"]').count() and q.locator('[data-act="exp-assim"]').is_visible():q.locator('[data-act="exp-assim"]').click()
 wb=load_workbook(BytesIO(Path(dl.value.path()).read_bytes()),data_only=False);rows=list(wb.active.iter_rows(values_only=True));h=list(rows[0]);pi=h.index('Custo de Compra');wi=h.index('Quantidade');actual=sum((r[pi] or 0)*(r[wi] or 0) for r in rows[1:]);print('XLSX total:',actual,'linhas:',len(rows)-1);assert abs(actual-1234)<0.001,rows;assert not errors,errors
 assert wb.active.cell(2,pi+1).number_format=='0.00##',wb.active.cell(2,pi+1).number_format
 wb.close()
 q.evaluate("""()=>{let s=JSON.parse(localStorage.getItem('cadpecas4'));let m=s.config.modelos.find(x=>x.id===s.config.modelo)||s.config.modelos[0];m.formato='csv';m.sep=';';m.dec=',';let c=m.cols.find(x=>x.k==='P');c.tipo='dinheiro';localStorage.setItem('cadpecas4',JSON.stringify(s))}""");q.reload();q.locator('#side [data-vis="tudo"]').click()
 with q.expect_download() as dc:
  q.locator('[data-act="xlsx"]').first.click()
  if q.locator('[data-act="exp-assim"]').count() and q.locator('[data-act="exp-assim"]').is_visible():q.locator('[data-act="exp-assim"]').click()
 data=list(csv.reader(io.StringIO(Path(dc.value.path()).read_text(encoding='utf-8-sig')),delimiter=';'));j=data[0].index('Custo de Compra');assert data[1][j]=='1,234',data[1][j]
 b.close();print('OK precisão de XML persistida, visível no XLSX e exportada em CSV')
