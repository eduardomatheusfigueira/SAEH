# Sistema de Auxílio ao Estudo Histórico (SAEH)

## Visão Geral

O SAEH é uma aplicação web interativa projetada para auxiliar no estudo e visualização de dados históricos. Ele permite aos usuários carregar, explorar e correlacionar informações sobre eventos históricos, personagens, lugares, temas e as fontes dessas informações. A aplicação apresenta os dados em um mapa interativo, uma linha do tempo e listas detalhadas, com foco em uma interface de usuário onde o mapa ocupa o centro da tela e outros elementos são apresentados como sobreposições.

## Funcionalidades Principais

*   **Visualização em Mapa:** Eventos com coordenadas geográficas são exibidos em um mapa interativo (Mapbox GL JS).
*   **Linha do Tempo:** Eventos são plotados em uma linha do tempo cronológica (Chart.js).
*   **Carregamento de Dados Flexível:** Os usuários podem carregar seus próprios conjuntos de dados históricos a partir de arquivos JSON formatados por fonte.
*   **Filtragem Dinâmica:**
    *   Filtre eventos e entidades por fonte histórica.
    *   Filtre eventos no mapa por uma janela de tempo ajustável em relação a uma data de referência.
*   **Visualização de Detalhes:** Clique em eventos (no mapa ou linha do tempo) ou em entidades (personagens, lugares, temas, fontes) nas listas para ver informações detalhadas em um modal.
*   **Gerenciamento de Perfil:**
    *   Salve o estado atual da aplicação (arquivos de dados carregados, configurações de UI como data de referência, filtros ativos) em um arquivo de perfil JSON.
    *   Carregue um arquivo de perfil para restaurar uma sessão de estudo anterior (requer que o usuário selecione novamente os arquivos de dados de origem listados no perfil).
*   **Interface Orientada ao Mapa:** O mapa ocupa a tela cheia, com outros painéis (controles, linha do tempo, listas) aparecendo como sobreposições.

## Estrutura de Dados

A aplicação utiliza arquivos JSON formatados por "fonte histórica" para carregar dados. Cada arquivo representa uma fonte (ex: um livro, um autor) e contém todos os eventos, personagens, lugares e temas associados a essa fonte.

Consulte os seguintes esquemas para detalhes sobre a formatação esperada:

*   `public/data/schemas/source_data_schema.json`: Define a estrutura para cada arquivo de dados de fonte.
*   `public/data/schemas/profile_schema.json`: Define a estrutura para os arquivos de perfil salvos.

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
    Navegue até o diretório raiz do projeto e execute:
    ```bash
    npm install
    ```

3.  **Configure o Token de Acesso do Mapbox:**
    *   Abra o arquivo `src/config.js`.
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

1.  **Carregar Dados de Fonte:**
    *   Use o campo "Load Source Data (JSON)" no painel de controles para selecionar um ou mais arquivos JSON de dados de fonte.
    *   Os dados de múltiplos arquivos serão adicionados (acumulados). Se você recarregar um arquivo de fonte que já foi carregado (mesmo `source_info.id`), os dados dessa fonte específica serão atualizados.
2.  **Explorar:**
    *   Use os filtros de fonte, data de referência e janela de tempo para refinar os dados exibidos no mapa e na linha do tempo.
    *   Navegue pelas listas de Personagens, Lugares, Temas e Fontes no painel de controles.
    *   Clique em marcadores no mapa, pontos na linha do tempo ou itens nas listas para ver detalhes no modal.
3.  **Salvar Perfil:**
    *   Clique em "Save Profile" para baixar um arquivo JSON contendo os nomes dos arquivos de dados carregados e suas configurações de UI atuais.
4.  **Carregar Perfil:**
    *   Use o campo "Load Profile (JSON)" para selecionar um arquivo de perfil salvo anteriormente.
    *   Siga as instruções no alerta para recarregar os arquivos de dados de fonte listados no perfil. As configurações de UI do perfil (como data de referência) serão aplicadas.

## Estrutura do Projeto (Principais Pastas e Arquivos)

*   `public/data/schemas/`: Contém os esquemas JSON para os dados de fonte e perfis.
*   `public/data/`: Local para colocar arquivos de dados de exemplo (ex: `example_source_data.json`).
*   `src/`: Contém o código fonte da aplicação React.
    *   `components/`: Componentes React reutilizáveis (MapView, TimelineView, UIControls, etc.).
    *   `App.jsx`: O componente principal da aplicação que gerencia o estado e o layout.
    *   `main.jsx`: O ponto de entrada da aplicação React.
    *   `dataManager.js`: Módulo para carregar, processar e gerenciar os dados históricos.
    *   `config.js`: Configurações da aplicação, como o token do Mapbox.
    *   `App.css`, `index.css`: Arquivos de estilo.
*   `index.html`: O arquivo HTML principal.
*   `package.json`: Define as dependências do projeto e scripts.
*   `vite.config.js`: Configuração do Vite.

## Próximos Passos e Melhorias Potenciais (Pós-Fase 6 Inicial)

*   Renderização de Markdown para `article_full` no modal de detalhes.
*   Melhorias na interface do usuário e experiência (transições mais suaves, feedback visual aprimorado).
*   Tratamento de erro mais sofisticado com feedback visual para o usuário.
*   Funcionalidade de "descarregar" arquivos de dados específicos da sessão atual.
*   Opções de filtragem mais avançadas (ex: por tags secundárias, por intervalo de datas específico).
*   Persistência de configurações de UI mais detalhadas no perfil (zoom/centro do mapa, estado de colapso de painéis).
*   Otimizações de performance para grandes conjuntos de dados.
