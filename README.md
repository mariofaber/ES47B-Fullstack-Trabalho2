Projeto 2 – Teste de Software (Resumo)

Este trabalho implementa testes automatizados no projeto open-source ES47B-Fullstack, conforme solicitado na disciplina.

✅ Projeto Escolhido

ES47B-Fullstack (fork no GitHub)

Testes realizados no backend, no arquivo:

backend/src/config/validation.js

🧪 Estratégia de Teste

Tipo: Testes unitários

Abordagem: Funcional (caixa preta)

Módulo testado: Validações de email, username, senha, IDs, títulos, URLs e busca

Mocks utilizados: Mock do isomorphic-dompurify para evitar dependências de DOM
→ demonstra uso de Fakes/Mocks, conforme exigido.

📁 Arquivos Criados
Testes

backend/__tests__/validation.test.js
Contém testes cobrindo:

Todas as funções do serverValidation

Middleware validateRequest

Configuração do Jest

backend/jest.config.cjs

Script no package.json

"test": "node --experimental-vm-modules node_modules/jest/bin/jest.js"

⚙️ Pipeline (CI)

Arquivo criado:

.github/workflows/backend-tests.yml

A pipeline do GitHub Actions:

Instala dependências do backend

Executa npm test

Roda automaticamente em push e pull request

▶️ Executar Testes Localmente
cd backend
npm install
npm test

✔️ Resultado

Testes automatizados funcionando

Pipeline CI integrado

Estratégia de testes atendendo todos os requisitos do Projeto 2
