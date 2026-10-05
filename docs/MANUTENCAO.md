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

Os links de navegação existem em duas versões de cabeçalho, `.desktop-top` e `.mobile-top`. Atualize ambas se acrescentar ou renomear seções. Preserve os identificadores usados por links e scripts.

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

O navegador carrega `style.css`, depois `effects.css` e por último `theme.css`. A última folha concentra a direção visual atual e as alterações para celular.

- `style.css`: espaçamento, tipografia, grids, títulos, cartões e estilos de impressão.
- `effects.css`: Canvas, botões, parede de projetos e contato com luz e vidro.
- `theme.css`: variáveis do tema violeta, máscaras, cena mobile e ajustes de movimento reduzido.

O tema atual usa papel claro, texto escuro, violeta `#7c3489`, ameixa `#241128` e lavanda `#d8b5e8`. Ao alterar cores, confira texto, botões, links e indicadores de foco sobre fundos claros e escuros. Algumas cores dos efeitos estão declaradas diretamente nos gradientes, em `effects.js` e nas artes SVG; trocar apenas `--accent` não recolore tudo.

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

## 5. Interação e movimento

`effects.js` controla a exploração do retrato, o Canvas e a pausa das animações fora da tela. As artes utilizadas são `assets/project-bankguard.svg` e `assets/project-datatrace.svg`. Se trocar seus caminhos, atualize também a lista `posters` nesse script e as imagens do painel da trajetória no HTML.

O retrato pode ser explorado por mouse, toque ou teclado. Os controles só aparecem quando as imagens e o efeito estão prontos. Preserve os atributos `aria-pressed`, os nomes acessíveis e a possibilidade de fechar a exploração com `Escape`.

`scroll.js` usa rolagem nativa para a cena mobile em telas de até 600 px. O zoom é controlado por variáveis CSS; a origem visual está em `theme.css`. O máximo atual é 2,9× e o deslocamento vertical é de até 45 px. Se mudar a foto, revise esse enquadramento antes de aumentar o zoom.

O script avalia se os cartões cabem na altura da tela antes de ativar o empilhamento sticky. Não force sticky em cartões que ultrapassam a área útil, pois isso pode ocultar conteúdo e links ao abrir os detalhes.

`prefers-reduced-motion` desativa a rolagem prolongada, zoom e animações contínuas. Mantenha esse caminho estático com acesso aos mesmos textos, projetos e downloads. A pausa da parede de projetos é independente da preferência do sistema.

## 6. Conferência local

Execute `node scripts/verificar.mjs` e depois `node scripts/serve.mjs` (ou as tarefas do VS Code). Abra a página em `http://127.0.0.1:8767/` e confira:

- Desktop e larguras mobile de 390, 375 e 320 px, incluindo telas baixas.
- Ausência de rolagem horizontal ou textos cortados.
- Entrada, ampliação e saída da cena mobile.
- Projetos com detalhes abertos e links alcançáveis.
- Navegação por `Tab`, foco visível, `Enter` e `Escape` na exploração do retrato.
- Movimento reduzido e retorno ao modo normal durante a visita.
- Download do PDF e correspondência das duas prévias.
- Console do navegador sem falhas de carregamento ou erros dos efeitos.

A emulação de tamanho no navegador ajuda a verificar o layout, mas não substitui um teste em celular físico.

## 7. Publicar e preservar o histórico

Para GitHub Pages, use a branch `main` e a pasta `/(root)` na configuração Pages. Mantenha `.nojekyll` e os ativos referenciados na raiz pública. Os caminhos relativos permitem hospedar em um repositório de projeto sem mudar os links internos.

Antes de enviar alterações, confira `git status`. `edicao/` contém snapshots, exportações grandes e arquivos locais de contexto; deve continuar ignorada. Não use um envio forçado de arquivos ignorados para publicar o histórico. Credenciais e arquivos locais de contexto não fazem parte do site público.

O servidor local também bloqueia o acesso HTTP à área de edição. Para consultar os originais, abra seus arquivos localmente; não remova esse bloqueio para disponibilizar o site.

A cópia em `edicao/origem/` preserva a versão anterior completa. Os backups aprovados e os originais das fotos devem permanecer nessa área de edição. Para recuperar algo, copie apenas os arquivos necessários para a raiz do projeto independente e verifique novamente antes de publicar.
