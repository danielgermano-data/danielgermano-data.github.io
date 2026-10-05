# Manutenção do currículo e portfólio

Todas as indicações abaixo são relativas à raiz deste projeto. Edite o site independente; a cópia em `edicao/origem/` serve para consulta e recuperação histórica.

## 1. Textos e informações profissionais

O conteúdo está em `index.html`. As seções principais são:

| Seção | Identificador ou classe | Conteúdo |
| --- | --- | --- |
| Abertura | `#inicio`, `.hero-copy` | Nome, posicionamento, apresentação e download |
| Projetos | `#projetos` | BankGuard, DataTrace AI e protótipo de agentes |
| Currículo | `#curriculo` | Prévia, leitura e download do PDF |
| Trajetória | `#trajetoria` | Experiências profissionais |
| Formação | `.foundation-band` | Graduação, inglês, cursos e competências |
| Contato | `#contato` | E-mail e perfis públicos |

A apresentação curta aparece também em `.mobile-summary`. Se mudar sua mensagem, mantenha a versão mobile consistente.

Ao atualizar um cargo, mantenha o título real e as datas. Descreva contribuições verificáveis; não transforme um projeto pessoal em experiência empresarial. IA aplicada é a direção de estudo apresentada, sem alegar senioridade ou experiência em produção.

Há um cabeçalho único `.stage-top`, dentro da cena. Ele também mantém a classe `.mobile-top` para os ajustes responsivos; não existe mais uma navegação desktop separada para editar. Atualize seus links se acrescentar ou renomear seções e preserve os identificadores usados por links e scripts.

O sobrenome gráfico aparece em `.surname-back` e `.surname-front`. Ao mudar seu texto, mantenha as duas camadas iguais. Elas são decorativas e têm `aria-hidden`; o nome acessível continua no cabeçalho e na apresentação profissional.

## 2. Currículo e prévias

O nome usado nos botões é `curriculo-daniel-germano.pdf`. Para atualizar:

1. Revise o documento-fonte no material local de edição e exporte um PDF com texto selecionável.
2. Substitua o PDF da raiz, preservando seu nome.
3. Renderize as páginas do novo PDF para `assets/curriculo-1.png` e `assets/curriculo-2.png`.
4. Verifique se as prévias correspondem ao PDF disponibilizado, incluindo cargos, datas e cursos.
5. Abra o PDF por todos os botões e teste o download.

Se a quantidade de páginas mudar, atualize o título “Em duas páginas”, os textos alternativos das prévias e as imagens dentro de `.pdf-pages`. Não mantenha uma imagem antiga como se fosse uma prévia do documento atual.

`scripts/verificar.mjs` compara o SHA-256 do PDF com a versão preservada. Uma alteração intencional produz um aviso; isso não é uma falha de links ou sintaxe. Depois de conferir e aprovar a nova versão, o valor `expectedPdfSha256` pode ser atualizado para registrar a nova referência.

O site não é um teste de ATS. Para o PDF, confira a seleção e a ordem de extração do texto, contatos no corpo do documento e consistência das informações. Revise os campos importados quando enviar o currículo a uma plataforma de recrutamento.

## 3. Cores e composição

O navegador carrega `style.css`, depois `effects.css`, `theme.css` e por último `refinements.css`. Preserve essa ordem e verifique a regra final aplicada no navegador quando mudar um componente.

- `style.css`: espaçamento, tipografia, grids, títulos, cartões e estilos de impressão.
- `effects.css`: Canvas, botões, parede de projetos e contato com luz e vidro.
- `theme.css`: variáveis do tema violeta, máscaras, palco desktop/mobile, duas camadas do sobrenome e ajustes de movimento reduzido.
- `refinements.css`: entradas discretas, profundidade por camadas, acabamento de botões e vidro, tilt limitado e cursor complementar.

O tema atual usa papel claro, texto escuro, violeta `#7c3489`, ameixa `#241128` e lavanda `#d8b5e8`. O contato recebe fundo quase preto `#0b0b10` e iluminação violeta em `refinements.css`. Ao alterar cores, confira texto, botões, links e indicadores de foco sobre fundos claros e escuros. Algumas cores dos efeitos estão declaradas diretamente nos gradientes, em `effects.js` e nas artes SVG; trocar apenas `--accent` não recolore tudo.

As fontes ficam em `assets/manrope-regular.ttf`, `assets/manrope-semibold.ttf` e `assets/manrope-extrabold.ttf`. Preserve a licença OFL ao redistribuí-las.

## 4. Retratos e transparência

O retrato ativo é `assets/daniel-portrait-studio.webp`. Ele aparece na abertura e no painel da trajetória. Os arquivos de imagens anteriores permanecem no material preservado; não são a origem usada para gerar a máscara atual.

Para substituir a foto com o mínimo de alterações:

1. Preserve a foto original no material local de edição.
2. Prepare um recorte quadrado **1:1**, com fundo transparente real.
3. Enquadre cabelo, rosto, pescoço e ombros dentro desse quadrado, mantendo margem para o zoom.
4. Exporte um ativo web de tamanho adequado. Não use a exportação 8K de aproximadamente 46 MB no site.
5. Atualize os dois elementos de imagem em `.hero-portrait` e `.work-person`, além de seus atributos `width`, `height` e textos alternativos quando necessário.

A luz atual está no próprio arquivo fotográfico. Não acrescente `grayscale(1)` ou uma nova camada de cor sem revisar o resultado.

### Alinhar foto, máscara e Canvas

O Canvas usa o canal alpha da imagem de `.hero-portrait` em `effects.js`. A função `resize()` mede a superfície e desenha a foto na máscara com `alphaCtx.drawImage(portrait, 0, 0, width, height)`. O retrato e o Canvas precisam ocupar o mesmo retângulo, com o mesmo enquadramento.

Manter **1:1** evita distorção e mantém compatibilidade com `aspect-ratio:1` na composição mobile. Se receber uma foto retangular, a opção mais simples é colocá-la em uma tela quadrada transparente antes de exportar, preservando a proporção do rosto.

Se optar por uma proporção diferente, não basta trocar o arquivo. Será necessário ajustar a geometria de `.hero-portrait`, as dimensões declaradas no HTML e o desenho da máscara em `resize()`. O recorte e o posicionamento usados no Canvas devem reproduzir exatamente os da imagem exibida. Caso use `object-fit:cover`, implemente o mesmo recorte ao desenhar o alpha; o desenho atual preenche o retângulo inteiro e não calcula esse recorte automaticamente.

Confira também os degradês de `mask-image` em `theme.css`, o enquadramento da `.work-person` e a origem do zoom mobile. A transparência do arquivo define o contorno da pessoa; os degradês suavizam ombros e bordas.

Na abertura, a geometria base do retrato mantém `aspect-ratio:1` e limites de 620 px de largura/altura, com ajustes específicos para celular. Revise esses limites junto da altura do palco; ampliar apenas o tamanho da foto pode deslocar o rosto ou interferir nos botões.

## 5. Interação e movimento

Os scripts são carregados com `defer` nesta ordem: `effects.js`, `scroll.js`, `refinements.js`.

`effects.js` controla a exploração do retrato, o Canvas e a pausa das animações fora da tela. A lista atual chama-se `artwork` e contém `{name, src}` para BankGuard (`assets/project-bankguard.svg`) e DataTrace AI (`assets/project-datatrace.svg`). Se trocar os caminhos, atualize essa lista e as imagens do painel da trajetória no HTML. Os nomes também alimentam os rótulos acessíveis dos controles.

O retrato pode ser explorado por mouse, toque ou teclado. Setas esquerda/direita trocam a arte, swipe horizontal troca no toque e `Escape` fecha a exploração. Os controles só aparecem quando as imagens e o efeito estão prontos. Preserve os atributos `aria-pressed`, os nomes acessíveis e `aria-keyshortcuts`.

`scroll.js` usa rolagem nativa em desktop e mobile. O palco tem altura de `100svh` com mínimos de composição definidos no CSS. A cena prolongada só é ativada quando esse palco cabe na altura estável da janela: `stage.offsetHeight <= viewportHeight + 1`. Se não couber, o script mantém a apresentação com rolagem normal, sem sticky ou zoom. Não retire esse fallback para forçar a animação em telas baixas.

Quando habilitada, a faixa de cena tem **2,3 vezes a altura do palco no desktop** e **2,1 vezes no mobile**, com breakpoint de 600 px. O máximo de zoom é 2,9×, o deslocamento vertical é de até 45 px e a origem do retrato é 50% 55%. Textos desaparecem no início e o véu claro encerra a cena. Se mudar a foto, revise esse enquadramento antes de aumentar o zoom.

O script distingue foco de teclado com `keyboardMode`. Foco visível dentro do palco restaura a composição estática e os controles; `pointerdown` ou a roda do mouse retiram esse modo. Não bloqueie os eventos de roda ou toque para manter a foto parada.

O empilhamento dos projetos funciona independentemente da cena do retrato. Usa rolagem nativa e `position:sticky`, com recuos de 14/24 px no mobile e 40/54 px no desktop. O próximo cartão cobre o anterior. `--stack-tail` reserva uma pequena área final, recalculada conforme a altura dos cartões, para manter as bordas da pilha visíveis.

O script avalia se cada cartão cabe na altura da tela antes de ativar sticky: altura útil menos o recuo e 24 px. Abrir detalhes refaz a avaliação; cartões maiores voltam ao fluxo normal, mantendo o resumo visível. Não force sticky em cartões que ultrapassam a área útil. A elevação por foco usa `:has(:focus-visible)` para atender ao teclado sem interferir na sobreposição após toque.

`refinements.js` acrescenta a pausa geral no contato, entradas discretas e interações de ponteiro. A classe `body.effects-paused` e o evento `visual:motion`, com `{paused}`, coordenam os três scripts. Na pausa manual, a altura da faixa prolongada é preservada para evitar saltos de página, mas zoom, fade e profundidade voltam ao estado estático. A pausa manual continua ativa ao voltar de outra aba.

`prefers-reduced-motion` desativa a faixa prolongada, zoom e animações contínuas, reagindo a mudanças durante a visita. O empilhamento nativo dos cartões permanece disponível, sem escala, transição ou loop de animação; só acompanha a rolagem voluntária. Essa é uma adaptação deliberada: o snapshot da referência desativa sticky nesse modo. Mantenha acesso aos mesmos textos, projetos e downloads. O controle local da parede de projetos permanece separado da pausa geral.

O progresso `--about-depth` é escrito tanto em `.work-visual` quanto em `.career`; parede, pessoa e texto herdam suas velocidades de `refinements.css`. O cursor complementar e o tilt ficam restritos a ponteiro fino com hover em telas de pelo menos 900 px. O cursor nativo não é ocultado; o PDF não recebe tilt.

A pintura animada do Canvas tem um intervalo programático mínimo de aproximadamente 32 ms e DPR limitado a 1,5. Isso é uma configuração de execução, não uma medição ou garantia de FPS em um dispositivo.

## 6. Conferência local

Execute `node scripts/verificar.mjs` e depois `node scripts/serve.mjs` (ou as tarefas do VS Code). Abra a página em `http://127.0.0.1:8767/` e confira:

- Desktop e larguras mobile de 390, 375 e 320 px, incluindo telas baixas.
- Ausência de rolagem horizontal ou textos cortados.
- Entrada, ampliação e saída da cena em desktop e mobile; fallback em telas que não comportam sua altura mínima.
- Projetos com detalhes abertos e links alcançáveis.
- Navegação por `Tab`, foco visível, `Enter`, setas e `Escape` na exploração do retrato; retorno à rolagem normal pela roda do mouse.
- Movimento reduzido e retorno ao modo normal durante a visita.
- Pausa geral, mudança de aba e retomada; a pausa manual deve ser preservada.
- Download do PDF e correspondência das duas prévias.
- Console do navegador sem falhas de carregamento ou erros dos efeitos.

A emulação de tamanho no navegador ajuda a verificar o layout, mas não substitui um teste em celular físico.

Veja [Análise dos efeitos da referência](ANALISE_EFEITOS_REFERENCIA.md) para consultar mecanismos confirmados, escolhas da adaptação e limites dos testes.

## 7. Publicar e preservar o histórico

Para GitHub Pages, use a branch `main` e a pasta `/(root)` na configuração Pages. Mantenha `.nojekyll` e os ativos referenciados na raiz pública. Os caminhos relativos permitem hospedar em um repositório de projeto sem mudar os links internos.

Antes de enviar alterações, confira `git status`. `edicao/` contém snapshots, exportações grandes e arquivos locais de contexto; deve continuar ignorada. Não use um envio forçado de arquivos ignorados para publicar o histórico. Credenciais e arquivos locais de contexto não fazem parte do site público.

O servidor local também bloqueia o acesso HTTP à área de edição. Para consultar os originais, abra seus arquivos localmente; não remova esse bloqueio para disponibilizar o site.

A cópia em `edicao/origem/` preserva a versão anterior completa. Os backups aprovados e os originais das fotos devem permanecer nessa área de edição. Para recuperar algo, copie apenas os arquivos necessários para a raiz do projeto independente e verifique novamente antes de publicar.
