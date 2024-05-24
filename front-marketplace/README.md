# Front-Marketplace

## Introdução

Este projeto é uma aplicação web para um marketplace desenvolvida com React.js. Foi iniciado com Create React App

## Pré-requisitos

Certifique-se de ter as seguintes ferramentas instaladas:

- Node.js (v14.x ou mais recente)
- Yarn (v1.22.x ou mais recente)

## Instalação

1. Clone o repositório:

    ```bash
    git clone https://github.com/seu-usuario/seu-repositorio.git
    cd seu-repositorio
    ```

2. Remova qualquer arquivo `package-lock.json` existente:

    ```bash
    rm package-lock.json
    ```

3. Instale as dependências usando Yarn:

    ```bash
    yarn install
    ```

## Scripts Disponíveis

No diretório do projeto, você pode executar:

### `yarn start`

Executa o aplicativo no modo de desenvolvimento.\
Abra [http://localhost:3000](http://localhost:3000) para visualizá-lo no navegador.

A página será recarregada quando você fizer alterações.\
Você também verá quaisquer erros de lint no console.

### `yarn test`

Inicia o executor de testes no modo interativo de observação.\
Veja a seção sobre [executando testes](https://facebook.github.io/create-react-app/docs/running-tests) para mais informações.

### `yarn build`

Compila o aplicativo para produção na pasta `build`.\
Ele empacota corretamente o React no modo de produção e otimiza a construção para o melhor desempenho.

A construção é minificada e os nomes dos arquivos incluem os hashes.\
Seu aplicativo está pronto para ser implantado!

Veja a seção sobre [implantação](https://facebook.github.io/create-react-app/docs/deployment) para mais informações.

### `yarn eject`

**Nota: esta é uma operação unilateral. Depois de `eject`, você não pode voltar atrás!**

Se você não estiver satisfeito com a ferramenta de construção e as escolhas de configuração, você pode `eject` a qualquer momento. Este comando removerá a dependência única de construção do seu projeto.

# UI Components

Esta pasta contém componentes de UI reutilizáveis, como botões, ícones, etc.

## Button

O componente Button é usado para criar botões com diferentes textos, cores de fundo e ícones.

### Uso

```javascript
import Button from './components/UI/Button/Button';

<Button text="Clique aqui" backgroundColor="#007bff" icon={infoIcon} />

# Auth Components

Esta pasta contém componentes relacionados à autenticação, como cabeçalhos, formulários de login, etc.

## Header

O componente Header é usado nas páginas de login, cadastro e redefinição de senha.

### Uso

```javascript
import Header from './components/Auth/Header/Header';

<Header />