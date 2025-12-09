'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Gift, 
  Copy, 
  Share2, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Loader2,
  CheckCircle,
  ExternalLink,
  LogOut
} from 'lucide-react';

interface ReferralInfo {
  id: string;
  wispChatClientId: string;
  nombre: string;
  email: string;
  shareUrl: string;
  referralCode: string;
  shareUrl: string;
  active: boolean;
  totalEarned: number;
  totalActive: number;
  totalApplied: number;
  referrals: Array<{
    id: string;
    nombre: string;
    email: string;
    status: string;
    installedAt: string;
  }>;
  commissions: Array<{
    id: string;
    type: string;
    amount: number;

interface Settings {
  installationAmount: number;
  monthlyAmount: number;
  monthsToEarn: number;
  currency: string;
}
    status: string;
    createdAt: string;
  }>;
  const [settings, setSettings] = useState<Settings | null>(null);
}

interface Settings {
  installationAmount: number;
  monthlyAmount: number;
  monthsToEarn: number;
  currency: string;
}

export default function ClienteDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ReferralInfo | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/');
        return;
      }

      const API_URL = 'https://wispchat-backend.onrender.com/api/v1';
      const REFERRAL_API = 'https://wispchat-referral-backend.onrender.com/api/v1';

      // Cargar settings públicos
      const settingsResponse = await fetch(`${REFERRAL_API}/settings/public`);
      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json();
        setSettings(settingsData.data);
      }
      const REFERRAL_API = 'https://wispchat-referral-backend.onrender.com/api/v1';
      
      // Cargar settings y datos en paralelo
      const [settingsResponse, dataResponse] = await Promise.all([
        fetch(`${REFERRAL_API}/settings/public`),
        fetch(`${API_URL}/referrals/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'x-tenant-domain': 'soporte.easyaccessnet.com'
          }
        })
      ]);

      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json();
        setSettings(settingsData.data);
      }

      if (dataResponse.ok) {
        const result = await response.json();
        setData(result.data);
        // Usar el shareUrl que viene del backend
        setShareUrl(result.data.shareUrl || `https://referidos.wispchat.net/easyaccess/${result.data.referralCode}`);
      } else {
        throw new Error('No se pudo cargar la información');
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };
