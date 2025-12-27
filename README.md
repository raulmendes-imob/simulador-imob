# Simulador Imob — Sistema de Acesso Controlado

Este projeto é um sistema de controle de acesso para compradores, baseado em **convites únicos**, **autenticação por e-mail/senha** e **validade por tempo determinado**.

Ele foi construído com foco em:
- segurança
- simplicidade
- controle manual inicial
- preparação para automações futuras

Todo o backend é baseado em **Firebase (Auth + Firestore)**, sem servidor próprio.

---

## 🎯 Objetivo do Sistema

Permitir que compradores tenham acesso a uma área logada por um período definido (ex: 1 ano), utilizando:

- convites únicos
- login com e-mail e senha
- validação de status e validade
- painel administrativo para controle total

O sistema **não gerencia pagamentos**.  
Ele apenas controla **acesso após a compra**.

---

## 🧱 Arquitetura Geral

O sistema é dividido em camadas independentes:

1. **Autenticação** (Firebase Auth)
2. **Regras de negócio** (Firestore + guard.js)
3. **Área do usuário**
4. **Painel Admin**
5. **Convites**
6. **Automação futura (opcional, desacoplada)**

Nenhuma camada depende diretamente da outra de forma rígida.

---

## 🔐 Autenticação e Acesso

### Login
- Usuário entra com e-mail e senha
- Firebase Auth valida credenciais
- Após login, o sistema executa o `guard.js`

### Guard (`guard.js`)
Responsável por bloquear ou permitir acesso às páginas privadas.

O guard verifica:
1. Se o usuário está autenticado
2. Se o documento do usuário existe no Firestore
3. Se o status está `active`
4. Se a data `accessUntil` ainda é válida

### Possíveis bloqueios
- **Não logado** → redireciona para login
- **Conta suspensa** → mensagem informativa
- **Acesso expirado** → logout + aviso
- **Usuário inválido** → logout

O guard é a **principal regra de negócio do sistema**.

---

## 🎟️ Sistema de Convites

O acesso ao cadastro só é possível via **convite único**.

### O que é um convite
- Código único
- Uso único
- Pode ser vinculado a um e-mail
- Controlado via Firestore
- Não pode ser reutilizado

### Collection: `invites`

Campos do documento:

| Campo        | Tipo              | Descrição |
|-------------|-------------------|-----------|
| active      | boolean           | Se o convite está ativo |
| createdAt  | timestamp         | Data de criação |
| sentTo     | string \| null    | Para quem foi enviado |
| sentAt     | timestamp \| null | Quando foi enviado |
| emailBound | string \| null    | E-mail que utilizou |
| used       | boolean           | Se já foi usado |
| usedAt     | timestamp \| null | Quando foi usado |

📌 Convites não podem ser listados por usuários comuns.

---

## 👤 Usuários

### Collection: `users`

Cada usuário possui um documento com os seguintes campos:

| Campo        | Função |
|-------------|-------|
| email       | Identificação |
| role        | `admin` ou `buyer` |
| status      | `active` ou `suspended` |
| accessUntil| Data limite de acesso |
| inviteCode | Convite utilizado |
| createdAt  | Data de criação |

### Regras principais
- Validade padrão: **1 ano**
- Renovação feita manualmente pelo admin
- Usuários suspensos não conseguem acessar
- Usuários expirados são deslogados

---

## 🧑‍💼 Painel Admin

O painel administrativo permite:

- visualizar todos os usuários
- ver status (`active`, `suspended`)
- ver validade de acesso
- ver **dias restantes**
- suspender usuários
- reativar usuários
- renovar acesso por +1 ano

### Importante
- O painel admin **não interfere** no funcionamento das páginas do usuário
- Ele apenas lê e escreve campos específicos permitidos pelas regras
- Alterações no admin não afetam usuários ativos automaticamente

---

## ⏳ Dias Restantes

O painel admin calcula automaticamente:


Resultados possíveis:
- número positivo → dias até expirar
- “Vencido” → acesso já expirou

Esse campo serve para:
- controle manual
- contato com usuários
- priorização de renovação

---

## 🔁 Renovação de Acesso

A renovação:
- é manual
- feita pelo painel admin
- adiciona +1 ano à data atual
- redefine status para `active`

Não há renovação automática neste momento.

---

## 🔐 Segurança (Firestore Rules)

As regras do Firestore garantem que:

- usuários só leem o próprio documento
- usuários não listam outros usuários
- convites não podem ser listados
- convites não podem ser criados/deletados pelo front
- admin pode listar usuários
- alterações indevidas são bloqueadas

📌 **A segurança não depende do front-end.**

---

## 🔌 Automação (Futuro)

O sistema foi projetado para aceitar automações futuras sem refatoração.

Fluxo futuro esperado:
1. Compra confirmada em plataforma externa
2. Automação cria convite no Firestore
3. Convite é enviado automaticamente por e-mail
4. Usuário se cadastra normalmente

Essa automação:
- é externa (ex: n8n)
- não altera o core do sistema
- não interfere no login, guard ou admin

Atualmente, a criação de convites é **manual**.

---

## ⚠️ Pontos Sensíveis (Leia Antes de Alterar)

- Não alterar `guard.js` sem testes
- Não liberar `list` nas regras
- Não remover campos existentes
- Alterações visuais são seguras
- Alterações de regra devem ser testadas com usuário de teste
- Automações devem escrever apenas em `invites`

---

## 📌 Status Atual do Projeto

- Sistema funcional
- Controle manual completo
- Pronto para vendas iniciais
- Pronto para escalar quando necessário
- Automação planejada, não obrigatória

---

## 📄 Observação Final

Este sistema foi construído priorizando:
- controle
- segurança
- clareza
- evolução gradual

Ele funciona hoje sem automações e está preparado para crescer sem refazer a base.

