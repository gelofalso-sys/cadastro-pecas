from pathlib import Path
from playwright.sync_api import sync_playwright
url=(Path(__file__).resolve().parent.parent/'Cadastro de Pecas - abrir no Chrome.html').as_uri()
xml='''<?xml version="1.0" encoding="UTF-8"?><nfeProc xmlns="http://www.portalfiscal.inf.br/nfe"><NFe><infNFe Id="NFe12345678901234567890123456789012345678901234"><ide><nNF>123</nNF><serie>1</serie><dhEmi>2026-01-03T12:00:00-03:00</dhEmi></ide><emit><xNome>Fornecedor Teste</xNome><CNPJ>12345678000190</CNPJ></emit><det nItem="1"><prod><cProd>001</cProd><xProd>Anel aço &lt;img src=x onerror=alert(1)&gt;</xProd><NCM>71131100</NCM><CFOP>5102</CFOP><uCom>UN</uCom><qCom>3</qCom><vUnCom>10.00</vUnCom><vProd>30.00</vProd><vDesc>1.20</vDesc></prod></det><det nItem="2"><prod><cProd>002</cProd><xProd>Brinco</xProd><NCM>71131100</NCM><CFOP>5102</CFOP><uCom>UN</uCom><qCom>2</qCom><vUnCom>5.00</vUnCom><vProd>10.00</vProd></prod></det><total><ICMSTot><vProd>40.00</vProd><vDesc>1.20</vDesc><vFrete>3.00</vFrete><vNF>41.80</vNF></ICMSTot></total></infNFe></NFe></nfeProc>'''
with sync_playwright() as p:
 b=p.chromium.launch(channel='msedge');page=b.new_page(viewport={'width':1200,'height':900});errors=[];dialogs=[]
 page.on('pageerror',lambda e:errors.append(str(e)));page.on('dialog',lambda d:(dialogs.append(d.message),d.dismiss()));page.goto(url)
 parsed=page.evaluate('(x)=>window.__nf.lerXml(x)',xml)
 assert [(r['cod'],r['qtd'],r['vUn'],r['vProd'],r['vDesc']) for r in parsed['itens']]==[('001',3,10,30,1.2),('002',2,5,10,0)]
 assert parsed['totais']=={'prod':40,'desc':1.2,'nota':41.8,'extra':3}
 page.locator('#nfFile').set_input_files({'name':'nota-teste.xml','mimeType':'application/xml','buffer':xml.encode()})
 page.wait_for_timeout(800)
 assert 'Anel aço' in page.locator('[data-nf=desc]').first.input_value()
 assert not page.locator('.nf-body img[src="x"]').count() and not dialogs and not errors
 print('OK XML: duas linhas, desconto, frete, descrição escapada e visualização',flush=True);b.close()
