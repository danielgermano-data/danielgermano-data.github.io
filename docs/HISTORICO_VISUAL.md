# Histórico visual e origem dos ativos

Registro da evolução do site em **05/10/2026**. A documentação descreve a composição e as decisões de edição; não atribui ao candidato senioridade ou experiência que os projetos não demonstram.

## Direção inicial

A primeira versão conectava a identidade do GitHub de Daniel a um currículo-portfólio: azul profundo, ciano e um fluxo de BankGuard ao lado da apresentação. Essa estrutura evidenciava o projeto, mas deixava o currículo com menos destaque.

O foco mudou para apresentar a pessoa e sua trajetória, com o currículo como download principal. Projetos públicos passaram a funcionar como evidências: BankGuard para validação de dados e API; DataTrace AI para investigação de diferenças por registro.

## Referência editorial

O site de [Gabriel Sodré](https://www.gabrielsodre.com/) foi a referência visual escolhida para a composição: fundo claro, retrato recortado central, sobrenome grande em sobreposição, título curto à esquerda, navegação discreta, botões em cápsula e seções amplas em duas colunas.

A adaptação usa o nome, os textos, a foto e os projetos de Daniel. Os elementos da referência que sugeriam clientes, volume de entregas ou outra senioridade foram substituídos por empregadores reais e pelo objetivo de uma oportunidade júnior. Retratos, marcas e artes de Gabriel não foram incorporados ao site.

## Efeitos e tema atual

A composição recebeu uma exploração do retrato em Canvas 2D, usando sua transparência para revelar artes próprias de BankGuard e DataTrace AI. O painel da trajetória organiza essas artes em perspectiva. O contato usa luz difusa e faixas de vidro simuladas em CSS.

O tema começou em azul/ciano. Um pedido posterior aproximou a iluminação do violeta da referência. A direção atual usa papel `#f5f5f5`, tinta `#14191c`, violeta `#7c3489`, ameixa `#241128` e lavanda `#d8b5e8`. O PDF manteve seu documento aprovado e sua apresentação própria.

As artes dos projetos são representações gráficas, não telas de aplicações em produção. A exploração permite mouse, toque e teclado; a parede de projetos pode ser pausada. As animações respeitam movimento reduzido e são suspensas quando não são necessárias à apresentação.

## Primeira cena mobile — 05/10/2026, antes da revisão de efeitos

No celular, a cena de abertura fica temporariamente fixa enquanto o retrato amplia, o nome e os textos desaparecem e uma camada clara encerra a transição. A rolagem continua nativa; os scripts não interceptam os gestos para simular uma rolagem própria.

O zoom máximo adotado é 2,9×. O deslocamento foi reduzido para até 45 px ao revisar o enquadramento do rosto. A origem atual do zoom é 50% 55%. Cartões de projeto só recebem sticky quando cabem na altura útil; abrir os detalhes refaz essa avaliação.

Nessa etapa, com movimento reduzido, a apresentação permanecia estática, sem a distância adicional de rolagem ou o zoom. Conteúdo, contatos e download continuavam disponíveis.

## Revisão de efeitos e cena desktop/mobile — 05/10/2026

A revisão aprofundou a comparação com o snapshot público v22 e a inspeção da referência no navegador. Os mecanismos confirmados e as diferenças deliberadas estão em [Análise dos efeitos da referência](ANALISE_EFEITOS_REFERENCIA.md).

O cabeçalho passou a ser único, `.stage-top`, dentro do palco. A classe `.mobile-top` foi mantida para os ajustes responsivos. O sobrenome ganhou duas camadas: preenchimento atrás do retrato (`.surname-back`) e contorno à frente (`.surname-front`). São letras próprias de Daniel, sem importar a arte de nome da referência.

A cena de rolagem passou a funcionar em desktop e mobile. O palco usa `100svh` com mínimos de composição; se não couber na altura estável da janela, a cena não é ativada e a página mantém rolagem normal. Quando habilitada, a faixa ocupa 2,3 vezes a altura do palco no desktop e 2,1 vezes no mobile. O zoom máximo continua em 2,9×, com deslocamento vertical de até 45 px e origem 50% 55%. O retrato da abertura recebeu limites base de largura e altura de 620 px, com ajustes mobile.

O estado `keyboardMode` distingue navegação por teclado: foco visível restaura a composição e os controles, enquanto ponteiro ou roda do mouse devolvem o comportamento de rolagem. Não há interceptação dos gestos de rolagem.

O motor do retrato passou de círculos suaves e faixas verticais para máscara orgânica de baixa resolução e distorção radial. A lista `artwork` usa as artes próprias de BankGuard e DataTrace AI. O ritmo é mais lento que o da referência: troca de 2,4 s, transição de 550 ms e pulso curto depois de 8 s de repouso elegível. Setas, swipe e Escape completam os controles.

Os refinamentos acrescentaram entradas discretas sem ocultar conteúdo, profundidade distinta de parede/pessoa/texto, tilt pequeno em blocos de experiência e base técnica, e um anel de cursor complementar restrito a desktop com mouse. O cursor nativo e o currículo PDF permanecem preservados.

O contato recebeu fundo quase preto `#0b0b10`, luz violeta diagonal à esquerda e na base, e vidro canelado vertical. Os botões conservaram a estrutura em cápsula, com reflexo e sombras refinados.

“Pausar efeitos” coordena os scripts pelo evento `visual:motion` e pela classe `effects-paused`. A pausa manual preserva a altura da faixa, mas apresenta a cena sem zoom, fade ou profundidade; movimento reduzido desativa a faixa prolongada e reage a mudanças durante a visita. A pausa manual é mantida ao retornar à página.

A ordem integrada é `style.css` → `effects.css` → `theme.css` → `refinements.css`, com scripts `effects.js` → `scroll.js` → `refinements.js`. Isso substitui a configuração anterior de três folhas de estilo e cena exclusivamente mobile.

O intervalo programático do Canvas limita a frequência de pintura animada, e o DPR permanece limitado a 1,5. Esses limites não são uma medição de desempenho em hardware real. Inspeção em navegador ou emulação de viewport não equivale a teste em aparelho físico.

## Retratos preservados

Houve três etapas principais de preparação do retrato:

1. Recorte de uma foto pública de Daniel, com remoção do fundo.
2. Substituição pela foto `IMG_4702.PNG` fornecida por Daniel, com fundo transparente e enquadramento quadrado.
3. Edição de iluminação e composição de estúdio a partir dessa foto, produzindo o retrato ativo.

As edições usaram a ferramenta nativa `image_gen`. O centro do retrato final ficou predominantemente neutro, com luz violeta nas bordas, cabelo inteiro, pescoço mais visível e integração suave na base. Uma ferramenta generativa pode reconstruir detalhes; essas versões não devem ser descritas como recortes idênticos pixel a pixel aos originais.

O arquivo ativo é `assets/daniel-portrait-studio.webp`, com **1254 × 1254 pixels**, alpha e **400.536 bytes**. A luz já está no arquivo: o filtro de escala de cinza e a sobreposição violeta CSS usados anteriormente foram removidos.

Os originais, os prompts e as versões anteriores permanecem no material local de edição. A cópia histórica preserva os prompts `PROMPT_RETRATO.txt`, `PROMPT_RETRATO_4702.txt` e `PROMPT_RETRATO_ESTUDIO.txt`, junto de seus arquivos de trabalho.

## Exportação 8K: o que ela representa

A ferramenta retornou uma imagem de **1254 × 1254 pixels**. A exportação de **7680 × 7680 pixels** foi produzida posteriormente por interpolação **Lanczos**, preservando o canal alpha.

Portanto, “8K” descreve as dimensões do arquivo ampliado, e não detalhe nativo capturado ou gerado nessa resolução. A ampliação não recupera informação ausente no retorno original.

O retorno nativo e a versão ampliada foram preservados no material de edição. A versão de aproximadamente **46 MB** não é carregada pela página; o WebP menor é o ativo usado na abertura e na trajetória.

## Preservação do projeto

O projeto independente mantém o site publicável na raiz. `edicao/origem/` preserva localmente a estrutura completa anterior, incluindo site, arquivos de trabalho, exportações e backups. Essa área fica fora do Git.

O backup `site_aprovado_2026-10-05_135341` registra uma composição aprovada antes das mudanças posteriores. A existência de um backup não significa que todas as versões sejam visualmente iguais: o histórico permite comparar e recuperar uma etapa deliberadamente.

A manutenção da foto exige preservar o alinhamento entre imagem, alpha e Canvas. O enquadramento **1:1** atual é uma parte funcional da composição, especialmente no zoom mobile. Consulte [Manutenção](MANUTENCAO.md) antes de substituir por uma foto com outra proporção.

## Fontes, autoria e limites

Manrope é distribuída localmente nos três pesos usados no site. A licença está em `assets/Manrope-OFL.txt` e deve acompanhar a fonte.

A apresentação usa informações profissionais de Daniel e artes próprias de seus projetos. O site é uma vitrine de candidatura júnior. Ele não comprova por si só domínio técnico, operação de IA em produção ou aprovação por um ATS; os repositórios, o currículo e a capacidade de explicar as implementações continuam sendo as evidências relevantes.
