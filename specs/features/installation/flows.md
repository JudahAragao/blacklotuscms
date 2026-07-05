---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
feature: "installation"
---

# Installation Flows

## Fluxo de Instalacao

1. **Usuario acessa qualquer rota**
   - Proxy verifica: SecretsService.isInstalled()
   - Estado: Nao instalado

2. **Redirect para /install**
   - Estado: Wizard exibido

3. **Usuario preenche formulario**
   - Database config
   - Storage config
   - Admin credentials
   - Estado: Formulario completo

4. **Validacao do formulario**
   - InstallService.validateForm()
   - Estado: Dados validados

5. **Construcao do DATABASE_URL**
   - BuildDatabaseUrl()
   - Estado: URL pronta

6. **Geracao de NEXTAUTH_SECRET**
   - crypto.randomBytes(32)
   - Estado: Secret gerado

7. **Save SecretsService.save()**
   - Estado: .secrets.json atualizado

8. **Prisma db push**
   - Schema aplicado ao banco
   - Estado: Tabelas criadas

9. **resetPrismaInstance()**
   - Prisma reconecta com nova URL
   - Estado: Conexao ativa

10. **Criacao de roles padrao**
    - 5 roles com capabilities JSON
    - Estado: Roles criadas

11. **Criacao de PostTypes padrao**
    - post e page
    - Estado: PostTypes criados

12. **Criacao de admin user**
    - Email + bcrypt hash
    - Estado: Admin criado

13. **Save settings (storage_driver, s3_config)**
    - Estado: Settings salvas

14. **markAsInstalled()**
    - Cria arquivo .installed
    - Estado: Instalacao concluida

15. **Redirect para /auth/login**
