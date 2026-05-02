'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

type Identity = {
  id: number;
  entity_type: string;
  legal_name: string;
  ein: string;
  license_number: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  notes: string;
};

type Decision = {
  id: number;
  title: string;
  context: string;
  recommended: string;
  priority: string;
  status: string;
};

export default function PurePage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [identities, setIdentities] = useState<Identity[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('vault');

  useEffect(() => {
    async function load() {
      const [{ data: ids }, { data: decs }] = await Promise.all([
        supabase.from('pure_identity').select('*').order('id'),
        supabase.from('pure_decision_queue').select('*').order('created_at', { ascending: false }),
      ]);
      setIdentities(ids || []);
      setDecisions(decs || []);
      setLoading(false);
    }
    load();
  }, []);

  async function updateDecision(id: number, status: string) {
    await supabase.from('pure_decision_queue')
      .update({ status, decided_by: 'Daniel Ebuehi', decided_at: new Date().toISOString() })
      .eq('id', id);
    setDecisions(prev => prev.map(d => d.id === id ? { ...d, status } : d));
  }

  const priorityColor = (p: string) => {
    if (p === 'HIGH') return '#FF3C6E';
    if (p === 'MEDIUM') return '#FFB800';
    return '#00E5FF';
  };

  const statusColor = (s: string) => {
    if (s === 'APPROVED') return '#2ECC71';
    if (s === 'REJECTED') return '#FF3C6E';
    if (s === 'PENDING') return '#FFB800';
    return '#484860';
  };

  const entityColor = (e: string) => {
    if (e === 'C-CORP') return '#FFD700';
    if (e === 'LLC') return '#00E5FF';
    if (e === 'INDIVIDUAL') return '#2ECC71';
    if (e === 'BROKERAGE') return '#C77DFF';
    return '#484860';
  };

  if (loading) return (
    <div style={{ background: '#04
