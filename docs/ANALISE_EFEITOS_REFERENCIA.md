# Análise dos efeitos da referência e adaptação

Referência escolhida: [Gabriel Sodré](https://www.gabrielsodre.com/). A análise de código usa o HTML, `style.css?v=22` e `script.js?v=22` preservados em 05/10/2026. Os arquivos de diagnóstico da área original e de sua cópia histórica têm hashes idênticos; representam um mesmo snapshot.

As evidências abaixo são verificáveis nas fontes preservadas. A disponibilidade e a aparência do site ao vivo podem mudar. Não presumimos um shader, biblioteca ou efeito apenas por sua aparência.

## Mecanismos confirmados no snapshot v22

| Elemento | Implementação confirmada | Evidência no snapshot |
| --- | --- | --- |
| Retrato líquido | Canvas 2D; quatro campos do tipo metaball com força inversa ao quadrado da distância, perturbação senoidal e máscara alpha de baixa resolução | `script.js`, linhas 22–36 |
| Distorção da arte | Grade de 24 × 28 células com onda radial amortecida ao redor do ponteiro | `script.js`, linhas 38–48 |
| Recorte | Arte atravessa a máscara líquida e depois a transparência do retrato, com duas composições `destination-in` | `script.js`, linha 64 |
| Seleção de arte | Troca automática a cada 300 ms, transição de 100 ms, swipe horizontal acima de 55 px e setas do teclado | `script.js`, linhas 10–17 e 71 |
| Retrato em repouso | Dois pulsos curtos de baixa opacidade em cada ciclo de 4,2 s; recorte elíptico e eco mínimo | `script.js`, linhas 51–69 |
| Rolagem | Hero sticky, zoom até 2,9×, fade inicial e véu final; interpolação com constante de 75 ms | `script.js`, linhas 71–75 |
| Extensão da cena | 230svh no desktop e 210svh no mobile, após os overrides finais | `style.css`, linhas 163–169 |
| Nome metálico | Duas artes SVG: preenchimento atrás do retrato e contorno translúcido à frente; gradiente estático | `index.html`, linha 3; `style.css`, linhas 38–39, 58 e 61 |
| Parede de artes | Quatro colunas com cópias para loop; direções alternadas, 84 s, perspectiva e plano inclinado | `style.css`, linhas 79–101 |
| Profundidade | Pessoa, parede e texto deslocam-se em velocidades diferentes | `script.js`, linhas 113–119; `style.css`, linhas 118–124 |
| Entrada de conteúdo | IntersectionObserver com threshold .08 e transição de .8 s, removendo a observação após entrar | `script.js`, linhas 79–85; `style.css`, linha 69 |
| Cartões | Serviços sticky; cartões de processo inclinados, com tilt até ±6° no ponteiro e resposta ao foco | `style.css`, linhas 66, 71 e 139–147; `script.js`, linhas 139–144 |
| Cursor | Cursor complementar animado por mola, velocidade e alvo de interação, com mistura difference; a referência oculta o cursor do sistema | `script.js`, linhas 121–137; `style.css`, linhas 135–137 |
| Contato | Gradientes radiais violetas, blur e faixas verticais repetidas simulam vidro; luzes de 9/12 s, executadas somente quando a seção está visível | `style.css`, linhas 148–157; `script.js`, linhas 146–147 |
| Botões | Gradiente preto/cinza, reflexo superior, sombras, hover de -1 px e pressão de +2 px | `style.css`, linhas 125–130 |

Os números de linhas referem-se ao snapshot preservado, não à versão futura do site externo.

## Confirmações pela inspeção ao vivo

A inspeção no navegador integrado confirmou a revelação líquida, o zoom desktop, o plano de artes em perspectiva, o tilt das etapas e a digitação simulada de 1,5 s no FAQ. No desktop, após recarregar a referência, foi observado zoom aproximado de 2,06× com 471 px de rolagem. Esse valor depende do tamanho da tela e da extensão da cena; não é uma constante de implementação.

O contato ao vivo mostrou fundo quase preto, próximo de `#0b0b10`, feixe violeta diagonal predominante à esquerda e na parte inferior, e vidro canelado vertical estreito. Esses materiais orientam a adaptação, mantendo a estrutura e o texto do contato de Daniel.

A referência guardava a preferência de movimento reduzido na inicialização do JavaScript. Mudar a preferência sem recarregar podia alterar o CSS e manter a animação JS desativada, produzindo uma impressão incorreta de que o zoom desktop não existia. A adaptação reage à preferência dinamicamente.

### Empilhamento mobile dos cartões

A inspeção com viewport de 390 × 844 px confirmou quatro cartões de serviços com `position:sticky` e recuos de 14, 24, 34 e 44 px. O cartão seguinte cobre o anterior durante a rolagem nativa. Não há slider ou faixa de badges nesse trecho. No snapshot v22, os cartões têm altura mínima de 470 px e margem inferior de 35 px; foram medidos com cerca de 524 px nessa tela.

Nos dois projetos de Daniel, a adaptação usa recuos de 14/24 px, independentemente do zoom do retrato. Os espaçamentos internos mobile foram ajustados, preservando a tipografia e controles de pelo menos 44 px. Uma linha final do grid tem altura recalculada para sustentar as bordas da pilha mesmo quando um cartão expandido ainda cabe na tela. Cartões maiores que a área útil voltam ao fluxo normal, sem cortar conteúdo.

O empilhamento usa apenas layout nativo, sem escala ou transição. Ele permanece no modo de movimento reduzido, ao contrário do CSS da referência; o zoom e as animações decorativas continuam desativados. A navegação por teclado eleva o cartão com foco visível, enquanto o toque mantém a ordem normal das camadas.

Validação adicional em 05/10/2026: 360 × 640, 375 × 667, 390 × 844 e 320 × 568 px no navegador. Em 375 × 667, os cartões fechados mediram cerca de 590/566 px; o primeiro expandido mediu 698 px e voltou ao fluxo normal, com o resumo mantido na tela. Em 390 × 844, o cartão expandido continuou aderente e as duas bordas permaneceram nos recuos de 14/24 px. Na tela de 320 × 568, ambos ficaram em fluxo normal, sem excedente horizontal. Toque e foco por Tab foram conferidos. São testes de emulação, sem validação em aparelho físico.

## Elementos presentes no código, mas não ativos nessa versão

- Há estilos antigos de `.gallery`, mas não uma galeria correspondente no HTML nem um controlador de slider ativo.
- O filtro SVG `#button-glass` contém ruído e displacement; o acabamento final dos botões desativa esse backdrop filter. O resultado ativo usa gradientes e sombras.
- `.face-glow` está desativado no CSS final. Não explica a iluminação atual da fotografia.
- Não há evidência de WebGL, shaders, GSAP, partículas, ruído global ou grid animado nos scripts desse snapshot.
- O FAQ em formato de chat usa respostas fixas e atraso de 1,5 s. Não é uma inteligência artificial nem uma conversa com backend.

## Adaptação de Daniel

O objetivo é apresentar uma candidatura de desenvolvimento de software júnior e incentivar a leitura do currículo. O retrato, as artes e os fatos profissionais são de Daniel. Não são incorporados clientes, serviços, números ou senioridade da referência.

O motor de retrato e a cena de rolagem ficam em `effects.js` e `scroll.js`. A camada `refinements.css`/`refinements.js` acrescenta movimento editorial e acabamento ao conteúdo existente:

- **Entradas discretas:** deslocamento de 14 px e .65 s em grupos de introdução. Mesmo antes da entrada, a opacidade mínima é .82; nada fica oculto ou inacessível. Sem JavaScript, o conteúdo continua normal. Foco por teclado torna o grupo imediatamente estável e legível.
- **Profundidade por camadas:** parede até 23 px, pessoa até 55 px e texto até 12 px, usando o progresso `--about-depth` fornecido pela rolagem no ancestral da trajetória. No mobile, parede/texto usam 18/8 px. A perspectiva foi aproximada ao mecanismo da referência sem copiar suas artes.
- **Tilt pequeno:** apenas blocos já existentes de experiência e base técnica recebem até ±1,4° com ponteiro fino em desktop. Não foi criada uma sequência fictícia de processo. Teclado, toque, pausa e movimento reduzido mantêm os blocos estáveis.
- **Cursor complementar:** anel discreto com mola, limitado a telas de pelo menos 900 px com mouse/hover. O cursor nativo permanece visível. O anel sai ao usar Tab, rolar, perder a janela ou pausar os efeitos.
- **Materiais:** reflexo superior e sombra discreta dos botões; faixas e blur de vidro no contato, com tempos de luz próximos dos confirmados no snapshot. A iluminação fica atrás do texto.
- **Pausa geral:** botão “Pausar efeitos”/“Retomar efeitos” no contato, com `aria-pressed`. A classe `body.effects-paused` e o evento `visual:motion`, com `{paused}`, coordenam os scripts. Preferência de movimento reduzido e página oculta também produzem pausa efetiva; a pausa manual permanece ao retornar à página.

Entradas e cursor são complementares. Projetos, download, contato e explicação da experiência continuam sendo o conteúdo principal.

### Ritmo do retrato adaptado

O motor atualizado usa uma máscara orgânica de baixa resolução e distorção radial em uma grade de 18 colunas. A largura da máscara fica entre 64 e 128 pixels; DPR é limitado a 1,5 e há um intervalo programático mínimo de 32 ms entre pinturas contínuas. Isso é um limite de implementação, sem medição de FPS em aparelho físico. O recorte final continua respeitando o alpha do retrato.

O ritmo foi deliberadamente mais lento que o snapshot: troca de arte a cada **2,4 s**, transição de **550 ms** e um pulso discreto de **1,1 s** após **8 s** de repouso elegível. As artes são BankGuard e DataTrace AI. Não se reproduzem os 21 trabalhos de Gabriel nem seus flashes rápidos. Setas do teclado, swipe horizontal, Escape e o controle de exploração oferecem acesso às artes de Daniel.

Quando pausado ou em movimento reduzido, a resposta voluntária do retrato pode ficar estática, sem ciclo, ondulação ou pulso automático. O estado também considera visibilidade da página, entrada e saída da tela e bloqueio durante o zoom.

## Escolhas deliberadas de leitura e desempenho

O conteúdo não depende de animação para aparecer. Não há substituição do cursor do sistema, chatbot, catálogo de serviços, clientes fictícios ou imagens copiadas da referência.

O movimento voluntário de um botão continua respondendo ao usuário; a pausa geral interrompe movimento automático e profundidade decorativa. O motor de retrato pode oferecer uma resposta estática ao clique, respeitando o estado global.

Eventos de ponteiro são agrupados por quadro quando alteram o tilt. O cursor só mantém um loop enquanto precisa convergir; ele não consome quadros continuamente em repouso. Entradas usam IntersectionObserver e deixam de ser observadas após aparecer.

## Verificação da adaptação em 05/10/2026

Revisão no navegador com larguras de 1280, 390 e 320 px, incluindo a tela baixa de 320 × 568 px. Foram conferidos retrato, exploração manual, zoom desktop/mobile, parede em perspectiva, parallax, cursor, tilt, detalhes dos projetos abertos e pausa geral. A preferência de movimento reduzido foi alterada durante a visita; ela removeu a cena prolongada e pausou as animações. O console da versão local não apresentou erros.

A revisão corrigiu dois problemas: limitação simultânea da altura e largura do retrato para manter o quadrado em telas altas, e remoção da margem de recorte que criava excedente horizontal no celular. Na largura de 390 px, a largura de rolagem do documento passou a coincidir com sua largura útil. A foto foi conferida em uma caixa de 620 × 620 px na tela alta.

Essas verificações usam emulação de tamanho no navegador desktop. Não houve medição de desempenho ou teste em celular físico. O PDF e as prévias mantiveram seus hashes; a revisão trata da apresentação visual e das interações.

## Problemas tratados e limites de validação

- Evitada a falha de ocultar texto indefinidamente quando o JavaScript não carrega ou o observer não existe.
- Evitado conteúdo translúcido/deslocado durante navegação por teclado.
- Evitadas animações pendentes ao ocultar a página ou ativar movimento reduzido.
- Evitado loop de cursor em touch, janela oculta ou fora das condições de desktop.
- Evitado perder a pausa manual quando a página volta ao primeiro plano.
- Mantidos o PDF original, as prévias e a honestidade do conteúdo profissional.

A análise de fontes não mede fluidez em hardware real. A verificação visual, a interação com o retrato, a cena inteira de rolagem, os cartões expandidos e a navegação por teclado precisam ser avaliados no navegador integrado e, quando possível, em aparelho físico. A checagem de sintaxe não substitui esses testes.

Uma alteração do retrato deve preservar o alinhamento entre foto, alpha e Canvas. O ativo atual é quadrado 1:1; trocar por outra proporção exige o mesmo cálculo de enquadramento no desenho da máscara e na imagem exibida. O arquivo web permanece separado da exportação ampliada em 8K.
