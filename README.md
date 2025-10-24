# 💰 KidsCoins Mobile - Educação Financeira Infantil

Aplicativo mobile de educação financeira infantil gamificada, desenvolvido com React Native + Expo.

## 📱 Sobre o Projeto

O KidsCoins é um sistema que ensina crianças de 6-14 anos sobre educação financeira através de tarefas domésticas gamificadas. Crianças ganham moedas virtuais completando tarefas, podem poupar, resgatar recompensas e acompanhar seu progresso através de níveis e badges.

**Contexto:** Projeto de TCC - Ciência da Computação
**Foco:** Aplicativo funcional e apresentável para demonstração

---

## 🎯 Funcionalidades

### Para Pais 👨‍👩‍👧‍👦
- ✅ Cadastro e login
- 📋 Criar e gerenciar tarefas
- 🎁 Criar e gerenciar recompensas
- ✔️ Aprovar/rejeitar conclusões de tarefas
- ✔️ Aprovar/rejeitar pedidos de resgate
- 👶 Criar e gerenciar perfis de crianças
- 📊 Visualizar progresso das crianças

### Para Crianças 👦👧
- 🔐 Login com PIN de 4 dígitos
- 📋 Visualizar e completar tarefas
- 💰 Acompanhar carteira virtual
- 🏦 Sistema de poupança com rendimentos
- 🛒 Loja de recompensas
- 🏆 Sistema de gamificação (níveis, XP, badges)
- 🔔 Notificações de eventos

---

## 🛠️ Tecnologias Utilizadas

- **React Native** 0.81.5 - Framework para desenvolvimento mobile
- **Expo** ~54.0 - Plataforma de desenvolvimento
- **TypeScript** - Tipagem estática
- **React Native Paper** - Componentes Material Design
- **React Navigation** 6 - Navegação entre telas
- **Axios** - Cliente HTTP para API
- **AsyncStorage** - Persistência local
- **React Context API** - Gerenciamento de estado

---

## 📁 Estrutura do Projeto

```
src/
├── screens/          # Telas do aplicativo
│   ├── auth/        # Login, Cadastro, Login da Criança
│   ├── parent/      # Telas do pai
│   └── child/       # Telas da criança
├── components/      # Componentes reutilizáveis
├── navigation/      # Navegação (Auth, Parent, Child)
├── services/        # Serviços de API (auth, task, wallet, etc.)
├── contexts/        # Contextos React (AuthContext)
├── types/           # Tipos TypeScript
└── utils/           # Utilitários e constantes
```

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos

- **Node.js** 18+ instalado
- **npm** ou **yarn**
- **Expo CLI** (instalado globalmente ou via npx)
- **Expo Go** app no celular (iOS/Android) para testar

### Passos para Instalação

1. **Clone o repositório:**
```bash
git clone https://github.com/seu-usuario/kidscoin-mobile.git
cd kidscoin-mobile
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure a URL da API:**

Edite o arquivo `src/utils/constants.ts`:

```typescript
export const API_URL = __DEV__
  ? 'http://SEU_IP_LOCAL:8080/api'  // Altere para o IP da sua máquina
  : 'https://seu-app.railway.app/api';
```

⚠️ **Importante:** Em desenvolvimento, não use `localhost`. Use o IP da sua máquina (ex: `192.168.1.100`) para que o celular consiga acessar o backend.

4. **Inicie o projeto:**
```bash
npm start
# ou
npx expo start
```

5. **Abra no celular:**
- Escaneie o QR code com o app **Expo Go** (Android) ou câmera (iOS)
- Aguarde o app carregar

---

## 🔐 Backend

Este aplicativo mobile requer um backend REST API rodando. A API deve estar disponível e acessível.

### Configuração do Backend

- **Desenvolvimento:** Configure `API_URL` com o IP local da máquina onde o backend está rodando
- **Produção:** Configure com a URL do backend em produção (ex: Railway, Render, etc.)

### Documentação da API

Consulte o arquivo `docs/BACKEND_API_GUIDE.md` para detalhes completos sobre todos os endpoints disponíveis.

**Principais endpoints:**
- `POST /api/auth/register` - Cadastro de pais
- `POST /api/auth/login` - Login
- `GET /api/tasks` - Listar tarefas
- `POST /api/tasks/{id}/complete` - Completar tarefa
- `GET /api/wallet` - Ver carteira
- `GET /api/gamification` - Ver gamificação

---

## 🎨 Design

### Paleta de Cores

**Para Crianças:**
- Primária: #6366F1 (Índigo vibrante)
- Secundária: #EC4899 (Rosa)
- Sucesso: #10B981 (Verde)
- Alerta: #F59E0B (Laranja)

**Para Pais:**
- Primária: #3B82F6 (Azul profissional)
- Secundária: #8B5CF6 (Roxo)

### Princípios de Design

- Interface limpa e intuitiva
- Material Design (React Native Paper)
- Cores vibrantes para crianças
- Visual profissional para pais
- Feedback visual para todas as ações

---

## 📱 Fluxo do Usuário

### Primeiro Acesso (Pai)

1. Abrir app → Tela de Login
2. Clicar em "Cadastre-se"
3. Preencher dados (nome, email, senha, nome da família)
4. Após cadastro, automaticamente logado
5. Navegar para aba "Crianças" e criar perfil de criança
6. Criar tarefas e recompensas

### Acesso da Criança

1. Abrir app → Tela de Login
2. Clicar em "Sou uma criança"
3. Digitar email (fornecido pelo pai)
4. Digitar PIN de 4 dígitos
5. Explorar tarefas, completar, acompanhar moedas e badges

---

## 🧪 Testando o App

### Dados de Teste Sugeridos

**Pai:**
- Nome: João Silva
- Email: joao@example.com
- Senha: senha123
- Família: Família Silva

**Criança:**
- Nome: Maria Silva
- PIN: 1234
- Email: (gerado automaticamente pelo backend)

### Fluxo de Teste Completo

1. Cadastrar pai
2. Criar perfil de criança
3. Criar tarefas variadas
4. Fazer login como criança
5. Completar tarefas
6. Fazer login como pai
7. Aprovar tarefas
8. Ver moedas creditadas e XP adicionado
9. Criar recompensas
10. Fazer login como criança
11. Solicitar resgate
12. Aprovar resgate como pai

---

## 🏗️ Build para Produção

### Android (APK)

```bash
npx expo build:android
```

### iOS (apenas em Mac)

```bash
npx expo build:ios
```

### Publicação

Consulte a [documentação do Expo](https://docs.expo.dev/distribution/building-standalone-apps/) para mais detalhes sobre builds e publicação.

---

## 🐛 Troubleshooting

### Erro de Conexão com API

```
Sem conexão com a internet
```

**Solução:** Verifique se:
- Backend está rodando
- `API_URL` está configurada com IP correto (não use localhost)
- Celular e computador estão na mesma rede Wi-Fi

### Erro de Token Expirado

```
Token inválido ou expirado
```

**Solução:** Faça logout e login novamente. O token JWT tem validade de 24 horas.

### App não carrega no Expo Go

**Solução:**
- Limpe o cache: `npx expo start -c`
- Verifique se está na mesma rede
- Reinicie o Expo Go

---

## 📚 Documentação Adicional

- `docs/PROJECT_CONTEXT.md` - Contexto completo do projeto
- `docs/BACKEND_API_GUIDE.md` - Guia completo da API backend

---

## 👥 Equipe

Projeto desenvolvido por estudantes de Ciência da Computação - UNIP

---

## 📄 Licença

Este projeto é acadêmico e foi desenvolvido para fins educacionais.

---

## 🎯 Status do Projeto

✅ Estrutura base criada
✅ Autenticação implementada
✅ Navegação configurada
✅ Services de API implementados
✅ Telas principais criadas
🚧 Implementação de features detalhadas em andamento

---

## 📞 Suporte

Para dúvidas sobre o projeto, consulte a documentação ou entre em contato com a equipe.

---

**Feito com ❤️ e ☕ pela equipe KidsCoins**
