import React from 'react';
import { Check, Crown, ExternalLink, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const ProSubscriptionModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  if (!isOpen) return null;

  const billing = async (action: 'checkout' | 'portal') => {
    if (!supabase) { setError('Supabase is not configured.'); return; }
    setLoading(true); setError(null);
    const { data: auth } = await supabase.auth.getSession();
    if (!auth.session) { setError('Please sign in first.'); setLoading(false); return; }
    const { data, error: invokeError } = await supabase.functions.invoke('vistora-billing', { body: { action } });
    if (invokeError || !data?.url) { setError(invokeError?.message || data?.error || 'Billing request failed.'); setLoading(false); return; }
    window.location.assign(data.url);
  };

  return <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
    <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#181818] border border-[#EAEAEA] dark:border-[#303030] shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between p-6 border-b border-[#EAEAEA] dark:border-[#303030]">
        <div className="flex items-center gap-3"><div className="w-11 h-11 rounded-2xl bg-[#FFD21F] flex items-center justify-center"><Crown className="w-5 h-5" /></div><div><h2 className="text-xl font-black">Vistora Pro</h2><p className="text-xs text-[#666] dark:text-[#aaa]">$4.99 / month</p></div></div>
        <button onClick={onClose} className="p-2 rounded-full"><X className="w-5 h-5" /></button>
      </div>
      <div className="p-6">
        <ul className="space-y-3 text-sm mb-6">{['Premium discovery and visual research tools','Expanded collections and creator workflows','Server-verified Pro access'].map(x => <li key={x} className="flex gap-3"><Check className="w-4 h-4 mt-0.5" /><span>{x}</span></li>)}</ul>
        {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-xs">{error}</div>}
        <button disabled={loading} onClick={() => billing('checkout')} className="w-full py-3 rounded-full bg-[#FFD21F] font-black text-sm disabled:opacity-60">{loading ? 'Opening secure checkout…' : 'Upgrade to Pro'}</button>
        <button disabled={loading} onClick={() => billing('portal')} className="w-full mt-3 py-3 rounded-full border border-[#DDD] dark:border-[#444] font-bold text-sm flex items-center justify-center gap-2"><ExternalLink className="w-4 h-4" />Manage subscription</button>
        <p className="text-[11px] text-[#777] text-center mt-4">Payments are processed by Stripe. Card details are never stored by Vistora.</p>
      </div>
    </div>
  </div>;
};
