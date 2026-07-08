---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: approved
feature: "installation"
---

# Instalacao Flows

## Flow de Instalacao

1. **User acessa qualquer rota**
   - Proxy verifica: SecretsService.isInstalled()
   - State: Nao instalado

2. **Redirect para /install**
   - State: Wizard exibido

3. **User preenche formulario**
   - Database config
   - Storage config
   - Admin credentials
   - State: Form completo

4. **Validacao do formulario**
   - InstallService.validateForm()
   - State: Validated data

5. **Construcao do DATABASE_URL**
   - BuildDatabaseUrl()
   - State: URL pronta

6. **Geracao de NEXTAUTH_SECRET**
   - crypto.randomBytes(32)
   - State: Secret gerado

7. **Save SecretsService.save()**
   - State: .secrets.json atualizado

8. **Prisma db push**
   - Schema aplicado ao banco
   - State: Tabelas criadas

9. **resetPrismaInstance()**
   - Prisma reconecta com nova URL
   - State: Connection ativa

10. **Criacao de roles default**
    - 5 roles com capabilities JSON
    - State: Roles criadas

11. **Criacao de PostTypes default**
    - post e page
    - State: PostTypes criados

12. **Criacao de admin user**
    - Email + bcrypt hash
    - State: Admin criado

13. **Save settings (storage_driver, s3_config)**
    - State: Settings salvas

14. **markAsInstalled()**
    - Cria arquivo .installed
    - State: Instalacao concluida

15. **Redirect para /auth/login**
