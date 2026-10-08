from PIL import Image, ImageDraw, ImageFont, ImageFilter
import sys, datetime
W,H=760,1240
im=Image.new('RGB',(W,H),'#fbfaf6'); d=ImageDraw.Draw(im)
mono='/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'; monob='/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf'
F=lambda s,b=False: ImageFont.truetype(monob if b else mono,s)
y=50
def c(t,s=30,b=False):
    global y; w=d.textlength(t,font=F(s,b)); d.text(((W-w)/2,y),t,fill='#222',font=F(s,b)); y+=s+14
def lr(l,r,s=28,b=False):
    global y; d.text((50,y),l,fill='#222',font=F(s,b)); w=d.textlength(r,font=F(s,b)); d.text((W-50-w,y),r,fill='#222',font=F(s,b)); y+=s+14
def line():
    global y; d.text((50,y),'-'*36,fill='#555',font=F(26)); y+=40
c('SUPERMERCADO',38,True); c('BOM PRECO LTDA',34,True)
c('CNPJ 12.345.678/0001-90',24); c('Av. Brasil, 1500 - Centro',24); line()
c('CUPOM FISCAL ELETRONICO',28,True); line()
for n,v in [('ARROZ TIPO 1 5KG','27,90'),('FEIJAO CARIOCA 1KG','8,49'),('LEITE INTEGRAL 1L','5,99'),('CAFE TORRADO 500G','18,90'),('PAO DE FORMA','9,72'),('BANANA PRATA KG','6,98'),('DETERGENTE 500ML','2,49'),('OVOS DUZIA','9,43')]:
    lr(n,v,26)
line(); lr('QTD. ITENS','8',28); lr('TOTAL R$','89,90',38,True); lr('PIX','89,90',28); line()
c('06/10/2026  18:42:15',26); c('OBRIGADO PELA PREFERENCIA',24)
im=im.filter(ImageFilter.GaussianBlur(.4)); im.save(sys.argv[1])
