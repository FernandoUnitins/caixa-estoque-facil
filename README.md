# Caixa & Estoque Fácil
**Solução Digital para Pequenos Comércios**

## Sobre o Projeto
O "Caixa & Estoque Fácil" é uma aplicação web responsiva projetada para atender às necessidades de um minimercado local na cidade de Arapoema-TO. O objetivo principal é oferecer uma ferramenta digital prática e acessível para centralizar o registro de entradas e saídas financeiras, gerar relatórios e permitir uma visão clara e em tempo real da situação econômica do estabelecimento, além de integrar essas movimentações à gestão do estoque.

Este projeto é desenvolvido como requisito parcial da disciplina de **Elaboração e Gestão de Projetos do Curso de TADS da Universidade Estadual do Tocantins (UNITINS)**.

## Stack Tecnológica
A arquitetura do sistema adota um modelo Serverless/BaaS, focando em alta performance e sincronização em tempo real:
* **Frontend:** React com Vite (Interface componentizada, rápida e responsiva).
* **Backend e Banco de Dados:** Supabase / PostgreSQL (Autenticação e banco de dados robusto com WebSockets para atualização em tempo real).

## Funcionalidades do MVP (Mínimo Produto Viável)
O escopo inicial foca no tripé essencial para o funcionamento do negócio:
- [x] **Sprint 1:** Setup do projeto, UI do Resumo do Caixa e simulação de Saldo em Tempo Real (RF03).
- [ ] Registro detalhado de Entradas (RF01) e Saídas (RF02).
- [ ] Cadastro de Produtos (RF05) e Atualização Automática de Estoque (RF06).
- [ ] Consulta e Relatórios de Lançamentos em tempo real (RF14).

## Como executar o projeto localmente

1. Clone o repositório:
```bash
git clone https://github.com/FernandoUnitins/caixa-estoque-facil.git
```