"""Executor de cenários históricos com galvânica de teste explícita e isolada.
A aplicação continua iniciando vazia; cenários de instalação nova não usam esta preparação.
"""
import json, runpy, sys
from pathlib import Path
from playwright.sync_api import Page
fixture={'config':{'v9':True,'v10':True,'v11':True,'v12':True,'v13':True,'v14':True,'banhistas':[{'id':'scarlat','nome':'Galvânica 1','verniz':'0.42','vernizOn':True,'banhos':[{'id':'ouro','nome':'Ouro','letra':'A','cor':'Ouro','mil':'1','modo':'peso','mult':'1.5','coluna':'R','sufixo':'','marcado':True,'vz':True},{'id':'prata','nome':'Prata','letra':'B','cor':'Prata','mil':'50','modo':'peso','mult':'1.54','coluna':'T','sufixo':' banho prata','marcado':True,'vz':True}]}]},'lanc':[],'form':{'tipo':'bruta','desconto':'0','banhista':'scarlat','v':{'I':'Brincos'},'on':{'ouro':True,'prata':True},'ov':{},'vz':{},'vinc':False,'grade':'','gsel':[],'csel':[],'semGrade':False}}
base=json.loads((Path(__file__).parent/'fixture_config.json').read_text(encoding='utf-8'))
base['banhistas']=fixture['config']['banhistas']
fixture['config']=base
seed=json.dumps(json.dumps(fixture,ensure_ascii=True))
script='try { if (!localStorage.getItem("cadpecas4") && !sessionStorage.getItem("teste-galvanica")) { localStorage.setItem("cadpecas4",'+seed+'); sessionStorage.setItem("teste-galvanica","1"); if(!localStorage.getItem("cadpecas-abertos")) localStorage.setItem("cadpecas-abertos",JSON.stringify({catc:false})); } } catch(e) {}'
original=Page.goto
def goto(self,*args,**kwargs):
    self.add_init_script(script=script)
    return original(self,*args,**kwargs)
Page.goto=goto
sys.argv=sys.argv[1:]
runpy.run_path(sys.argv[0],run_name='__main__')
