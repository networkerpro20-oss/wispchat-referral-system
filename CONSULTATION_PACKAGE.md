# 📦 PAQUETE DE CONSULTA PARA OTRAS IAs

## 🎯 CONTEXTO BREVE

Sistema de autenticación JWT con inconsistencia de nombres entre:
- **JWT externo (WispChat):** usa `rol` (sin "e")
- **Sistema interno:** usa `role` (con "e")

Esto causa errores de compilación TypeScript en Render.

## ❓ PREGUNTA PRINCIPAL

**¿Cuál es la mejor solución?**

**OPCIÓN A:** Unificar TODO a `rol` (español)
- Cambiar `User.role` → `User.rol`
- Eliminar mapeos
- Código más simple

**OPCIÓN B:** Mantener `role` interno y mapear `rol` del JWT
- Mantener `User.role`
- Mapear explícitamente en middleware
- Más código pero "estándar"

## 📋 DATOS TÉCNICOS

### Estructura Actual:

```typescript
// JWT de WispChat (externo - no podemos cambiar)
interface JWTPayload {
  userId: string;
  email: string;
  rol: string;  // ← español
  tenantId: string;
}

// Sistema interno (podemos cambiar)
interface User {
  id: string;
  email: string;
  role: string;  // ← inglés
  tenantId: string;
}

// Middleware (problema)
const decoded = jwt.verify(token) as JWTPayload;
req.user = {
  role: decoded.rol  // ← TypeScript error: asignando 'rol' a propiedad 'role'
}
```

### Errores de Compilación:

```
TS2561: Object literal may only specify known properties, 'role' does not exist in type 'JWTPayload'
TS2551: Property 'role' does not exist on type 'JWTPayload'
```

## 🤔 FACTORES A CONSIDERAR

1. **Consistencia con fuente externa:** WispChat usa `rol`
2. **Estándares de industria:** TypeScript/JavaScript suelen usar inglés
3. **Mantenibilidad:** Menos código = menos bugs
4. **Claridad:** ¿`rol` confunde a desarrolladores angloparlantes?
5. **Escalabilidad:** ¿Futuras integraciones con otros sistemas?

## 💭 PREGUNTAS ESPECÍFICAS

1. **Arquitectura:** ¿Mejor aislar diferencias en la capa de integración o propagar el modelo externo?

2. **TypeScript:** ¿Usar `type` aliases vs `interface` para hacer el mapeo más explícito?

3. **Naming:** En sistemas multiidioma, ¿mejor consistencia interna o consistencia con API externa?

4. **Testing:** ¿Cómo validar que el mapeo funciona correctamente sin añadir complejidad?

5. **Documentación:** Si vamos con `rol`, ¿cómo documentar para que no confunda?

## 📊 TRADE-OFFS

### Opción A (Unificar a "rol"):
| Pros | Contras |
|------|---------|
| ✅ Simple | ❌ Menos "estándar" (español) |
| ✅ Consistente con JWT | ❌ Puede confundir a devs anglófonos |
| ✅ Menos código | ❌ Diverge de convenciones TS |
| ✅ Sin mapeo | |

### Opción B (Mapear role ← rol):
| Pros | Contras |
|------|---------|
| ✅ Estándar (inglés) | ❌ Más código |
| ✅ Familiar para devs | ❌ Mapeo manual |
| ✅ Consistente con TS | ❌ Duplicación conceptual |
| | ❌ Punto extra de fallo |

## 🎨 IMPLEMENTACIONES ALTERNATIVAS

### Alt. 1: Type Union
```typescript
type RoleName = 'rol' | 'role';
interface User {
  [key in RoleName]: string;
}
```

### Alt. 2: Utility Type
```typescript
type MapRole<T> = Omit<T, 'rol'> & { role: string };
const user: MapRole<JWTPayload> = { ...decoded, role: decoded.rol };
```

### Alt. 3: Adapter Pattern
```typescript
class JWTAdapter {
  static toUser(jwt: JWTPayload): User {
    return { ...jwt, role: jwt.rol };
  }
}
```

## 🔍 LO QUE NECESITO SABER

1. ¿Cuál opción es **más maintainable** a 2-3 años?
2. ¿Hay algún **pattern estándar** para este caso?
3. ¿**Performance implications** del mapeo?
4. ¿Cómo afecta **developer experience**?
5. ¿Hay forma de hacer ambos **sin duplicación**?

## 📁 ARCHIVOS INVOLUCRADOS

```
backend/
├── src/
│   ├── middleware/
│   │   ├── auth.ts              ← En uso, tiene el bug
│   │   └── authMiddleware.ts    ← Redundante, eliminar
│   ├── types/
│   │   └── express.d.ts         ← Define User.role
│   └── routes/
│       ├── admin.ts
│       ├── clients.ts
│       └── leads.ts
```

## 🎯 DECISIÓN BUSCADA

**Formato de respuesta ideal:**

```
RECOMENDACIÓN: [Opción A/B/Alt]

RAZÓN PRINCIPAL: [1-2 líneas]

PASOS IMPLEMENTACIÓN:
1. [Paso concreto]
2. [Paso concreto]
3. [Paso concreto]

RIESGOS:
- [Riesgo 1]
- [Riesgo 2]

MITIGACIONES:
- [Mitigación 1]
- [Mitigación 2]
```

## 📚 CONTEXTO ADICIONAL

- **Framework:** Express + TypeScript
- **Auth:** JWT from external API (WispChat)
- **Deploy:** Render (cloud platform)
- **Team:** Pequeño (1-2 devs)
- **Stage:** MVP/Early stage
- **i18n:** No planeado por ahora

---

**Archivo generado:** $(date)  
**Para consulta con:** Claude, GPT-4, Gemini, etc.

