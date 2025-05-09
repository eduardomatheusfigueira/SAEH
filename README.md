# Sistema de Auxílio ao Estudo Histórico (SAEH)

## Visão Geral

O SAEH é uma aplicação web interativa projetada para auxiliar no estudo e visualização de dados históricos. Ele permite aos usuários carregar, explorar e correlacionar informações sobre eventos históricos, personagens, lugares, temas e as fontes dessas informações. A aplicação apresenta os dados em um mapa interativo, uma linha do tempo altamente configurável e listas detalhadas, com painéis de interface que podem ser ajustados e recolhidos para focar na visualização principal.

A versão mais recente da aplicação está disponível para acesso online em: [https://saeh.netlify.app/](https://saeh.netlify.app/)

## Funcionalidades Principais

*   **Visualização em Mapa Interativo:**
    *   Eventos com coordenadas geográficas são exibidos em um mapa (Mapbox GL JS).
    *   A cor de preenchimento dos pontos no mapa é determinada pelo tema principal do evento.
    *   A cor da borda dos pontos no mapa indica a relação temporal do evento com a data de referência selecionada (ex: vermelho para anterior, azul para posterior, branco para na data).

*   **Linha do Tempo Dinâmica e Detalhada (D3.js):**
    *   Eventos são plotados cronologicamente em pistas temáticas.
    *   **Linha do Tempo Expansível:** Pode ser expandida para ocupar uma maior porção da tela, oferecendo mais espaço vertical para os eventos e revelando controles de navegação adicionais. O mapa se ajusta automaticamente ao tamanho da linha do tempo.
    *   **Navegação Avançada:** Quando expandida, a linha do tempo oferece controles para zoom progressivo, pan (arrastar), salto para um ano específico e visualizações predefinidas (década, século).
    *   **Detalhes Aprimorados:** Na visualização expandida, os títulos completos dos eventos são exibidos diretamente na linha do tempo para melhor identificação.
    *   **Codificação Visual Clara:**
        *   Eventos de período são representados por barras, cuja cor de preenchimento é baseada no tema principal.
        *   Eventos únicos são representados por círculos, com preenchimento branco e borda colorida de acordo com o tema principal.

*   **Carregamento de Dados Flexível:**
    *   Os usuários podem carregar seus próprios conjuntos de dados históricos a partir de arquivos JSON formatados por fonte.
    *   Múltiplos arquivos podem ser carregados, e seus dados são acumulados. Recarregar um arquivo de fonte atualiza os dados dessa fonte específica.

*   **Filtragem Dinâmica:**
    *   Filtre eventos e entidades por uma ou mais fontes históricas.
    *   Filtre eventos exibidos no mapa e na linha do tempo por uma janela de tempo ajustável (em anos) em relação a uma data de referência central.

*   **Visualização de Detalhes Aprofundada:**
    *   Clique em marcadores no mapa, pontos/barras na linha do tempo, ou itens nas listas de entidades para abrir um modal com informações detalhadas.
    *   **Conteúdo Rico no Modal:** O campo "artigo completo" das entidades é renderizado a partir de Markdown, permitindo a exibição de texto formatado, listas, links, imagens e outros elementos ricos para uma leitura e análise mais aprofundadas.

*   **Gerenciamento de Perfil:**
    *   Salve o estado atual da aplicação (arquivos de dados carregados, configurações de UI como data de referência, janela de tempo, filtros ativos, estado de expansão da linha do tempo) em um arquivo de perfil JSON.
    *   Carregue um arquivo de perfil para restaurar uma sessão de estudo anterior. (Nota: os arquivos de dados de origem referenciados no perfil precisam ser selecionados novamente pelo usuário por questões de segurança e acesso a arquivos locais).

*   **Interface Orientada ao Mapa e Configurável:**
    *   O mapa ocupa a posição central, com outros painéis (controles, linha do tempo, listas) aparecendo como sobreposições.
    *   **Painel de Controles Principal (Esquerda):**
        *   Inicialmente recolhido para maximizar a área de visualização.
        *   Acessível através de um botão (☰), permite carregar dados de fonte e perfis, gerenciar filtros de fonte, e controlar opções da linha do tempo (expandir, travar na data de referência).
    *   **Painéis de Informação e Exploração (Direita):**
        *   **Controles de Data:** Permite ao usuário definir a data de referência central e a janela de tempo (em anos) para filtrar os eventos exibidos.
        *   **Explorar Entidades:** Apresenta listas de Personagens, Lugares, Temas e Fontes em abas. O conteúdo da aba ativa pode ser recolhido ou expandido clicando no respectivo botão da aba, otimizando o espaço vertical. Ícones (▸/▾) indicam o estado.
        *   **Painel de Legenda Detalhado:** Um painel abrangente com múltiplas seções, cada uma explicando uma codificação visual específica usada no mapa e na linha do tempo. Cada seção (ex: "Mapa: Cor de Preenchimento", "Linha do Tempo: Cor da Barra") é individualmente recolhível clicando em seu título e possui ícones (▸/▾) para indicar seu estado.

## Estrutura de Dados

A aplicação utiliza arquivos JSON formatados por "fonte histórica" para carregar dados. Cada arquivo representa uma fonte (ex: um livro, um autor) e contém todos os eventos, personagens, lugares e temas associados a essa fonte.

Consulte os seguintes esquemas para detalhes sobre a formatação esperada:

*   [`public/data/schemas/source_data_schema.json`](public/data/schemas/source_data_schema.json): Define a estrutura para cada arquivo de dados de fonte.
*   [`public/data/schemas/profile_schema.json`](public/data/schemas/profile_schema.json): Define a estrutura para os arquivos de perfil salvos.

Arquivos de exemplo podem ser encontrados em `public/data/`.

## Configuração e Execução Local

### Pré-requisitos

*   [Node.js](https://nodejs.org/) (que inclui npm) instalado.
*   Um token de acesso do [Mapbox](https://www.mapbox.com/).

### Passos para Configuração

1.  **Clone o Repositório (se aplicável) ou Descompacte os Arquivos do Projeto:**
    ```bash
    # Se estiver clonando
    # git clone <url_do_repositorio>
    cd Sistema-de-Auxilio-ao-Estudo-Historico-SAEH
    ```

2.  **Instale as Dependências:**
    Navegue até o diretório raiz do projeto (`Sistema-de-Auxilio-ao-Estudo-Historico-SAEH`) e execute:
    ```bash
    npm install
    ```
    Isso instalará todas as dependências necessárias, incluindo React, D3.js, Mapbox GL JS, react-markdown, etc.

3.  **Configure o Token de Acesso do Mapbox:**
    *   Abra o arquivo [`src/config.js`](Sistema-de-Auxilio-ao-Estudo-Historico-SAEH/src/config.js:1).
    *   Substitua o placeholder `'YOUR_MAPBOX_ACCESS_TOKEN_HERE'` pela sua chave de acesso real do Mapbox:
        ```javascript
        // src/config.js
        const MAPBOX_ACCESS_TOKEN = 'pk.eyJ...'; // Sua chave aqui
        ```
    *   **Importante:** Não comite sua chave de acesso do Mapbox em repositórios públicos. Para implantações, considere usar variáveis de ambiente.

4.  **Execute o Servidor de Desenvolvimento:**
    ```bash
    npm run dev
    ```
    Isso iniciará o servidor de desenvolvimento Vite e, geralmente, abrirá a aplicação no seu navegador padrão (ex: `http://localhost:5173`).

## Como Usar

1.  **Acessar Controles e Carregar Dados:**
    *   Clique no botão (☰) no canto superior esquerdo para expandir o Painel de Controles.
    *   Use o campo "Carregar Dados de Fonte (JSON)" para selecionar um ou mais arquivos JSON de dados de fonte.
    *   Os dados de múltiplos arquivos serão adicionados. Se você recarregar um arquivo de fonte que já foi carregado (mesmo `source_info.id`), os dados dessa fonte específica serão atualizados.

2.  **Explorar e Interagir:**
    *   **Painel Direito:**
        *   Ajuste a **Data de Referência** e a **Janela de Tempo (Anos)** nos Controles de Data para filtrar os eventos no mapa e na linha do tempo.
        *   No painel **Explorar Entidades**, clique nas abas (Personagens, Lugares, Temas, Fontes) para ver as listas correspondentes. Clique novamente no botão da aba ativa para recolher/expandir a lista.
        *   Consulte o **Painel de Legenda** para entender as diferentes cores e símbolos. Clique nos títulos das seções da legenda para recolhê-las ou expandi-las.
    *   **Linha do Tempo:**
        *   Clique no botão "Expandir Linha do Tempo" (no Painel de Controles Principal) para uma visualização maior e acesso a controles como "Saltar para Ano", "Visão Década" e "Visão Século". Clique em "Recolher Linha do Tempo" para retornar à visualização compacta.
        *   Use o scroll do mouse ou gestos de pinça para zoom, e arraste para pan (navegar lateralmente) na linha do tempo (quando não travada).
    *   **Modal de Detalhes:** Clique em marcadores no mapa, eventos na linha do tempo, ou itens nas listas de entidades para abrir um modal com informações detalhadas, incluindo o "artigo completo" renderizado a partir de Markdown.

3.  **Gerenciar Sessão:**
    *   **Salvar Perfil:** No Painel de Controles Principal, clique em "Salvar Perfil" para baixar um arquivo JSON contendo os nomes dos arquivos de dados carregados e suas configurações de UI atuais.
    *   **Carregar Perfil:** Use o campo "Carregar Perfil (JSON)" no Painel de Controles Principal para selecionar um arquivo de perfil salvo anteriormente. Siga as instruções para recarregar os arquivos de dados de fonte.

## Estrutura do Projeto (Principais Pastas e Arquivos)

*   `public/data/schemas/`: Contém os esquemas JSON para os dados de fonte e perfis.
*   `public/data/`: Local para colocar arquivos de dados de exemplo (ex: `example_source_data.json`).
*   `src/`: Contém o código fonte da aplicação React.
    *   `components/`: Componentes React reutilizáveis (MapView, TimelineView (D3.js), UIControls, DetailModal, EntityListView, LegendPanel, DateControls, etc.).
    *   `App.jsx`: O componente principal da aplicação que gerencia o estado e o layout.
    *   `main.jsx`: O ponto de entrada da aplicação React.
    *   `dataManager.js`: Módulo para carregar, processar e gerenciar os dados históricos.
    *   `config.js`: Configurações da aplicação, como o token do Mapbox.
    *   `App.css`, `index.css`: Arquivos de estilo.
*   `index.html`: O arquivo HTML principal.
*   `package.json`: Define as dependências do projeto e scripts.
*   `vite.config.js`: Configuração do Vite.

## Próximos Passos e Melhorias Potenciais

*   Melhorias na interface do usuário e experiência (transições mais suaves para colapsáveis, feedback visual aprimorado).
*   Tratamento de erro mais sofisticado com feedback visual para o usuário.
*   Funcionalidade de "descarregar" arquivos de dados específicos da sessão atual.
*   Opções de filtragem mais avançadas (ex: por tags secundárias, por intervalo de datas específico para além da janela de referência).
*   Persistência de configurações de UI mais detalhadas no perfil (zoom/centro do mapa, estados de colapso de painéis individuais).
*   Otimizações de performance para grandes conjuntos de dados.
*   Testes unitários e de integração.
*   Internacionalização (i18n) da interface.
