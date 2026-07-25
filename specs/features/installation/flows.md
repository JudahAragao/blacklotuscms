---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: approved
feature: "installation"
---

# Installation Flows

## Installation Flow

1. **User accesses any route**
   - Proxy checks: SecretsService.isInstalled()
   - State: Not installed

2. **Redirect to /install**
   - State: Wizard displayed

3. **User fills out form**
   - Database config
   - Storage config
   - Admin credentials
   - State: Form complete

4. **Form validation**
   - InstallService.validateForm()
   - State: Validated data

5. **DATABASE_URL construction**
   - BuildDatabaseUrl()
   - State: URL ready

6. **NEXTAUTH_SECRET generation**
   - crypto.randomBytes(32)
   - State: Secret generated

7. **Save SecretsService.save()**
   - State: .secrets.json updated

8. **Prisma db push**
   - Schema applied to database
   - State: Tables created

9. **resetPrismaInstance()**
   - Prisma reconnects with new URL
   - State: Connection active

10. **Creation of default roles**
    - 5 roles with JSON capabilities
    - State: Roles created

11. **Creation of default PostTypes**
    - post and page
    - State: PostTypes created

12. **Admin user creation**
    - Email + bcrypt hash
    - State: Admin created

13. **Save settings (storage_driver, s3_config)**
    - State: Settings saved

14. **markAsInstalled()**
    - Creates .installed file
    - State: Installation complete

15. **Redirect to /auth/login**
