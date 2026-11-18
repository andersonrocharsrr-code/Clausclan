# O Pacto da Mata — O Último Caçador

Lenda amazônica em animação 2D, **10:00 exatos**, 1920×1080, três capítulos. Vídeo pronto: `videos/pacto-da-mata.mp4`.

## Vozes (ElevenLabs)

| Personagem | Voz | Observação |
| --- | --- | --- |
| Narrador | **Onildo Rocha** (biblioteca de vozes da ElevenLabs, já na conta) | contador de histórias, velocidade 1,16 para caber nos 10 min |
| Firmino | Gélson Bertol | "Mas que diabo foi isso?" mais baixo, quase sussurrado |
| Seu Anselmo | Matheus Moretti | |
| Homem de preto | Rodrigo Custódio | 3 semitons mais grave e com eco curto (`audio.py`) |

O texto é o do roteiro, sem cortes. Como a fala inteira dá 8 min 7 s, as pausas entre as falas foram
ajustadas (`tempos.py`) para fechar exatamente 10:00 com as cenas sem fala (cartões de capítulo, a passagem do
indígena, a entrada de Firmino na mata na última noite e o final).

## Visual

- Floresta em camadas com profundidade (céu, copas ao longe, troncos, chão/trilha, troncos de perto, folhas na frente),
  neblina andando, raios de luz entre as copas, vaga-lumes à noite, chuva. Camadas pesadas ficam guardadas (`camada()`).
- Paleta do pedido: verde-esmeralda/musgo na mata, azul-petróleo/marinho à noite, lua branco-prateada,
  âmbar/laranja no fogo e no entardecer, preto e vermelho-brasa no homem de preto.
- Personagens sempre iguais: Firmino (chapéu de couro, camisa bege, calça escura, botas de borracha, a mesma
  espingarda de dois canos com coronha de madeira, cães e guarda-mato), o homem de preto (sobretudo, chapéu de aba
  larga, olhos em brasa), Seu Anselmo (bigode grisalho, camisa branca, suspensórios) e o indígena (aturá de fibra
  nas costas com o jabuti visível).
- Animais com jeito próprio de correr: capivara, macaco-prego, queixadas, onça-pintada (rosetas), anta, araras
  (vermelha e canindé), veado e jabuti.
- Legenda palavra por palavra no rodapé (narração em branco, falas com travessão; a do homem de preto em vermelho),
  placas no canto e cartões "CAPÍTULO N" — o sistema de textos do Recorte Dourado.

## Capítulos e cenas

| Tempo | Cena |
| --- | --- |
| 0:00 | Cartão CAPÍTULO 1 · O HOMEM QUE NUNCA ERRAVA; voo noturno sobre as copas, título |
| 0:14 | Firmino na trilha à luz da lua; close da ambição; o vulto junto à árvore gigante |
| 0:43 | O pacto: diálogo com o homem de preto; os bichos oferecidos aparecem na névoa; "Está feito."; vento, relâmpago, ele some |
| 1:46 | O seringal: Firmino chega com a caça, Seu Anselmo; montagem das caçadas (seringueiras, veado na névoa, anta no alagado, rastro da vara, chuva), dinheiro |
| 2:52 | À noite, olhos vermelhos na mata: "Vinha de um pacto." |
| 3:04 | Fim de tarde no banco: a ganância; Firmino no alto ao pôr do sol |
| 3:43 | Cartão CAPÍTULO 2 · O DIA EM QUE A FLORESTA CORREU; amanhecer na varanda; cartuchos na bolsa; a mata diferente |
| 4:35 | A correria: capivara, macaco, queixadas, onça (câmera acompanhando, câmera lenta), anta (chão tremendo), araras, a mata inteira fugindo |
| 5:41 | Silêncio; o indígena com o jabuti no aturá passa correndo e os dois se olham; "Mas que diabo foi isso?"; lembrança em câmera lenta |
| 6:13 | O silêncio absoluto (só a respiração) |
| 6:42 | Cartão CAPÍTULO 3 · O ÚLTIMO RASTRO DE FIRMINO; o dom desaparece (rastros que terminam, araras longe) |
| 7:21 | A floresta não responde: sol, chuva, igarapé; Firmino envelhece; "Ela não quer mais me dar nada." |
| 8:15 | Última noite de lua cheia: ele entra na mata, para, vê o vulto de olhos vermelhos, que some |
| 8:30 | A procura (Seu Anselmo esperando, seringueiros de dia e de lamparina à noite); passos pesados; o homem de chapéu na trilha |
| 9:43 | "Estou esperando o último caçador."; a câmera sobe sobre as copas; O PACTO DA MATA · *Algumas dívidas não são pagas com dinheiro.* · FIM |

## Som

Ambiente da mata por cena (noite com grilos e sapos, dia com pássaros, seringal, chuva, entardecer), efeitos
(passos nas folhas, vento, trovão, correria, queixadas, macaco, onça, anta, araras, revoada, respiração, passos
pesados) gerados na ElevenLabs (`sfx.py`), e trilha de suspense sintetizada (cordas graves, pulso de tímpano,
flauta leve no tempo das caçadas boas, crescendo no desaparecimento). A música some na fuga dos bichos e na cena do
silêncio, e abaixa sozinha quando alguém fala.

## Como refazer

```
python3 narracao.py <pasta>/nar        # vozes + tempo de cada palavra (palavras.json)
python3 tempos.py                      # pausas para fechar 10:00, legendas (tempos.js / tempos.json)
python3 sfx.py <pasta>/sfx             # efeitos (ElevenLabs)
node render.js <pasta>/v1.mp4 0 200    # imagem (pode rodar 0–200, 200–400 e 400–600 ao mesmo tempo)
python3 audio.py <pasta> <pasta>/audio.wav
ffmpeg -f concat ... + áudio → ../pacto-da-mata.mp4
```
Conferir quadros soltos: `node render.js --fotos <pasta> 10 60 300 ...`. Desenhos: `mata.js` (floresta, céu, luz),
`gente.js` (personagens e rostos), `bichos.js` (animais), `lugares.js` (barracão, seringueira, lamparina, relâmpago),
`cenas.js` (as tomadas), `motor.js` (textos, legenda, acabamento).
