-- Script para crear datos de prueba en el sistema de referidos

-- 1. Crear cliente referidor (WISPHUB_01)
INSERT INTO "Client" (
    "wispChatClientId",
    "nombre",
    "email",
    "telefono",
    "referralCode",
    "isReferrer",
    "isPaymentCurrent",
    "shareUrl"
) VALUES (
    'WISPHUB_01',
    'Juan Pérez',
    'juan@example.com',
    '5551234567',
    'EASY-00001',
    true,
    true,
    'https://referidos.easyaccess.com/easyaccess/EASY-00001'
) ON CONFLICT ("wispChatClientId") DO UPDATE SET
    "nombre" = EXCLUDED."nombre",
    "email" = EXCLUDED."email";

-- 2. Crear código de referido
INSERT INTO "ReferralCode" (
    "code",
    "wispChatClientId",
    "isActive"
) VALUES (
    'EASY-00001',
    'WISPHUB_01',
    true
) ON CONFLICT ("code") DO NOTHING;

-- 3. Crear algunos referidos (leads)
INSERT INTO "Client" (
    "wispChatClientId",
    "nombre",
    "email",
    "telefono",
    "referralCode",
    "isReferral",
    "referredBy",
    "status"
) VALUES 
(
    'WISPHUB_02',
    'María López',
    'maria@example.com',
    '5559876543',
    'EASY-00002',
    true,
    'EASY-00001',
    'ACTIVE'
),
(
    'WISPHUB_03',
    'Carlos Ruiz',
    'carlos@example.com',
    '5556543210',
    'EASY-00003',
    true,
    'EASY-00001',
    'ACTIVE'
),
(
    'LEAD-001',
    'Ana Martínez',
    'ana@example.com',
    '5554321098',
    NULL,
    true,
    'EASY-00001',
    'LEAD'
)
ON CONFLICT ("wispChatClientId") DO NOTHING;

-- 4. Crear comisiones de prueba
INSERT INTO "Commission" (
    "wispChatClientId",
    "referredClientId",
    "type",
    "amount",
    "status",
    "month",
    "year"
) VALUES
-- Comisión de instalación - ACTIVE
(
    'WISPHUB_01',
    'WISPHUB_02',
    'INSTALLATION',
    500.00,
    'ACTIVE',
    12,
    2025
),
-- Comisión mensual 1 - ACTIVE
(
    'WISPHUB_01',
    'WISPHUB_02',
    'MONTHLY',
    50.00,
    'ACTIVE',
    12,
    2025
),
-- Comisión mensual 2 - ACTIVE
(
    'WISPHUB_01',
    'WISPHUB_02',
    'MONTHLY',
    50.00,
    'ACTIVE',
    1,
    2026
),
-- Comisión de instalación - EARNED (requiere pago)
(
    'WISPHUB_01',
    'WISPHUB_03',
    'INSTALLATION',
    500.00,
    'EARNED',
    12,
    2025
),
-- Comisión mensual - EARNED
(
    'WISPHUB_01',
    'WISPHUB_03',
    'MONTHLY',
    50.00,
    'EARNED',
    12,
    2025
)
ON CONFLICT DO NOTHING;

-- Ver resultados
SELECT 'Clientes creados:' as info, COUNT(*) as total FROM "Client";
SELECT 'Códigos de referido:' as info, COUNT(*) as total FROM "ReferralCode";
SELECT 'Comisiones creadas:' as info, COUNT(*) as total FROM "Commission";

-- Ver detalle del cliente de prueba
SELECT 
    "wispChatClientId",
    "nombre",
    "email",
    "referralCode",
    "isReferrer",
    "isPaymentCurrent",
    "status"
FROM "Client"
WHERE "wispChatClientId" = 'WISPHUB_01';
