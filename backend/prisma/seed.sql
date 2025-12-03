-- Crear configuración inicial para tenant wispchat
INSERT INTO "ReferralSettings" (
  "id",
  "tenantId",
  "tenantDomain",
  "installationCommission",
  "monthlyCommission",
  "commissionMonths",
  "enabled",
  "requireDocuments",
  "autoApplyToInvoice",
  "minInstallationDays",
  "companyName",
  "contactEmail",
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  'wispchat',
  'wispchat.net',
  500.00,
  50.00,
  6,
  true,
  true,
  true,
  30,
  'WispChat',
  'admin@wispchat.net',
  NOW(),
  NOW()
) ON CONFLICT (tenantId) DO NOTHING;
