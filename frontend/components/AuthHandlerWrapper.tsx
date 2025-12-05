'use client';

import { Suspense } from 'react';
import AuthHandler from './AuthHandler';

export default function AuthHandlerWrapper() {
  return (
    <Suspense fallback={null}>
      <AuthHandler />
    </Suspense>
  );
}
