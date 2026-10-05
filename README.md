# Daniel Germano — currículo e portfólio

Site pessoal que conecta a experiência de Daniel em sistemas e dados aos seus projetos de desenvolvimento com Python. O currículo em PDF é a peça principal; os projetos e a trajetória sustentam sua apresentação para oportunidades de desenvolvimento de software júnior.

O site usa HTML, CSS e JavaScript, com fontes, imagens e PDF locais. Não precisa de framework, compilação ou dependências npm. Não há formulários, rastreamento ou envio de dados pelo site.

## Executar localmente

Com Node.js 18 ou superior, abra um terminal na raiz deste projeto:

```sh
node scripts/serve.mjs
```

Abra `http://127.0.0.1:8767/`. Para encerrar, pressione `Ctrl+C` no terminal.

O `index.html` também pode ser aberto diretamente, mas o servidor local é o caminho recomendado para conferir imagens, PDF e efeitos Canvas.

## Verificar antes de publicar

```sh
node scripts/verificar.mjs
```

A verificação automatizada confere arquivos locais, âncoras e sintaxe JavaScript, além de avisar quando o PDF difere da versão preservada. Ela complementa a revisão visual. Confira também a página no celular, o download do PDF, a navegação por teclado e o modo de movimento reduzido. Um resultado positivo não certifica aprovação por ATS ou funcionamento em todos os navegadores.

No VS Code, use **Terminal → Executar Tarefa** e escolha **Site: abrir servidor local** ou **Site: verificar arquivos e referências**. Nenhuma instalação de pacotes é necessária.

## Estrutura

```text
index.html                    Conteúdo e estrutura da página
style.css                     Layout, tipografia e componentes
effects.css                   Máscara do retrato e efeitos visuais
theme.css                     Tema violeta e cenas desktop/mobile
refinements.css               Profundidade e acabamento editorial
effects.js                    Canvas e controle de animações
scroll.js                     Cenas vinculadas à rolagem nativa
refinements.js                Entradas, tilt, cursor e pausa geral
curriculo-daniel-germano.pdf    Currículo oferecido para download
assets/                       Fontes, retratos, artes e prévias do PDF
scripts/                      Servidor e verificações locais
docs/                         Manutenção e histórico visual
.nojekyll                     Publicação estática no GitHub Pages
edicao/origem/                Arquivos históricos locais; fora do Git
```

As folhas de estilo são carregadas nesta ordem: `style.css`, `effects.css`, `theme.css`, `refinements.css`. Os scripts com `defer` usam `effects.js`, `scroll.js`, `refinements.js`, nessa ordem. Preserve essa sequência: tema e refinamentos sobrescrevem a base, e a pausa geral coordena os motores de efeito.

A abertura usa um cabeçalho único `.stage-top`, com a classe `.mobile-top` mantida como apoio à composição responsiva. O sobrenome tem duas camadas, `.surname-back` e `.surname-front`, atrás e à frente do retrato.

## Atualizar o site

- Textos, experiências, projetos, formação e links: `index.html`.
- Currículo: substitua o PDF da raiz e regenere `assets/curriculo-1.png` e `assets/curriculo-2.png` a partir dele.
- Cores e composição mobile: `theme.css`.
- Layout geral: `style.css`.
- Efeitos e interação no retrato: `effects.css` e `effects.js`.
- Zoom desktop/mobile e empilhamento de projetos: `scroll.js`.
- Entradas, profundidade, tilt, cursor complementar e pausa geral: `refinements.css` e `refinements.js`.

As instruções completas estão em [Manutenção](docs/MANUTENCAO.md). A origem da composição, os tratamentos do retrato e as limitações da exportação 8K estão em [Histórico visual](docs/HISTORICO_VISUAL.md). A [Análise dos efeitos da referência](docs/ANALISE_EFEITOS_REFERENCIA.md) distingue mecanismos confirmados, escolhas da adaptação e limites de validação.

## Movimento e acesso

Quando o palco cabe na altura útil, a cena usa 2,3 vezes sua altura no desktop e 2,1 vezes no mobile, com zoom máximo de 2,9×. Em telas baixas que não comportam o palco, a leitura segue pela rolagem normal.

“Pausar efeitos” preserva a altura da cena e apresenta o retrato sem zoom. Movimento reduzido desativa a cena prolongada e reage a mudanças durante a visita. Foco por teclado mantém os controles legíveis, enquanto mouse e roda de rolagem continuam usando a navegação nativa. O cursor do sistema permanece disponível.

## Publicação no GitHub Pages

Destino da publicação: [danielgermano-data/danielgermano-data.github.io](https://github.com/danielgermano-data/danielgermano-data.github.io). Endereço do site após a implantação: [danielgermano-data.github.io](https://danielgermano-data.github.io/).

Na configuração de **Pages** do repositório, escolha **Deploy from a branch**, branch **main** e pasta **/(root)**. Mantenha `.nojekyll` na raiz. Não é necessário um build para os arquivos públicos.

Depois de cada alteração enviada à branch `main`, acompanhe a implantação na aba **Actions**. A publicação só está confirmada quando o job concluir e o endereço público exibir a versão nova.

## Arquivos históricos e imagens

`edicao/origem/` preserva localmente a versão de trabalho, exportações, arquivos de apoio e backups anteriores. Essa pasta é ignorada pelo Git e não deve ser enviada ao GitHub Pages. O site público usa os arquivos da raiz e de `assets/`.

O retrato ativo é `assets/daniel-portrait-studio.webp`: 1254 × 1254 pixels, com transparência, aproximadamente 400 KB. Ele foi preparado a partir de uma foto fornecida por Daniel, com edição de iluminação e recorte por ferramenta generativa. Não é um recorte idêntico pixel a pixel à foto original.

A exportação local de 7680 × 7680 pixels foi ampliada com interpolação Lanczos. Ela não contém detalhe nativo capturado em 8K e não é usada no site. O arquivo de aproximadamente 46 MB fica no material de edição local.

As artes de BankGuard e DataTrace AI são representações gráficas próprias dos projetos, não capturas de sistemas em produção. As fontes Manrope são locais; sua licença está em `assets/Manrope-OFL.txt`.

## Representação profissional

O conteúdo apresenta uma candidatura júnior. BankGuard usa dados simulados; DataTrace registra a limitação de sua integração opcional de IA; o protótipo de agentes é um projeto de aprendizagem. Atualizações devem preservar essas distinções e acrescentar resultados somente quando houver evidência.

O HTML ajuda a apresentar a trajetória, mas o PDF continua sendo o documento para candidaturas. O arquivo do currículo deve manter texto selecionável, contatos legíveis e informações consistentes com o site.
