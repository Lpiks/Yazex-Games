import React, { useState, useEffect } from 'react';
import { Gift, Copy, Check, ExternalLink, ArrowLeft, Lock, Package, X, CheckCircle2, Ban } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { arcadeFetch, SHOP_URL } from '../utils/arcadeApi';

export default function Rewards({ authUser, setAuthUser, onOpenAuth, onBack, club }) {
    const { t } = useTranslation();
    const [copiedCode, setCopiedCode] = useState(null);
    const [claimModal, setClaimModal] = useState({ isOpen: false, reward: null });
    const [claimForm, setClaimForm] = useState({ name: '', phone: '', wilaya: '', address: '', consentAccepted: false });
    const [claimError, setClaimError] = useState('');
    const [claiming, setClaiming] = useState(false);
    const [liveRewards, setLiveRewards] = useState(null);

    useEffect(() => {
        if (!authUser) {
            setLiveRewards(null);
            return;
        }
        let cancelled = false;
        arcadeFetch('/game/rewards')
            .then((res) => {
                if (!cancelled && res.success && Array.isArray(res.data)) {
                    setLiveRewards(res.data);
                }
            })
            .catch(() => {});
        return () => { cancelled = true; };
    }, [authUser]);

    const rewards = liveRewards || authUser?.rewards || [];

    const handleCopy = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const handleClaimSubmit = async (e) => {
        e.preventDefault();
        setClaimError('');
        setClaiming(true);
        try {
            const res = await arcadeFetch(`/game/rewards/${encodeURIComponent(claimModal.reward.code)}/claim-gift`, {
                method: 'POST',
                body: JSON.stringify(claimForm)
            });
            if (res.success && setAuthUser) {
                setAuthUser((prev) => (prev ? { ...prev, rewards: res.data.rewards } : prev));
            }
            setClaimModal({ isOpen: false, reward: null });
            setClaimForm({ name: '', phone: '', wilaya: '', address: '', consentAccepted: false });
        } catch (err) {
            setClaimError(err.message);
        } finally {
            setClaiming(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 py-4">
            <button
                onClick={onBack}
                className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-pirate-gold transition-colors"
            >
                <ArrowLeft size={16} /> {t('rewards.back')}
            </button>

            <div className="bg-[#111216] border border-pirate-gold/30 rounded-2xl p-4 sm:p-6 shadow-2xl">
                <h1 className="font-heading text-2xl sm:text-3xl text-pirate-gold flex items-center gap-2 mb-2">
                    <Gift className="text-pirate-gold shrink-0" /> {t('rewards.title')}
                </h1>
                <p className="text-sm text-gray-400 mb-6">
                    {t('rewards.subtitle')}
                </p>

                {!authUser ? (
                    <div className="text-center py-12 bg-black/40 border border-gray-800 rounded-xl space-y-4 px-4">
                        <Lock className="mx-auto text-pirate-gold" size={36} />
                        <p className="text-gray-300 text-sm">
                            {t('rewards.login_prompt')}
                        </p>
                        <button
                            onClick={onOpenAuth}
                            className="bg-pirate-gold text-black font-bold px-6 py-2.5 rounded-xl hover:bg-yellow-400 transition-colors text-sm uppercase"
                        >
                            {t('rewards.login_btn')}
                        </button>
                    </div>
                ) : rewards.length === 0 ? (
                    <div className="text-center py-12 bg-black/40 border border-gray-800 rounded-xl px-4">
                        <p className="text-gray-400 text-sm">
                            {t('rewards.empty')}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {rewards.map((rw, i) => {
                            const isFreeProduct = rw.rewardType === 'free_product' || rw.discountType === 'free_product';
                            const isUsed = !isFreeProduct && Boolean(rw.used);
                            const isExpired = !isFreeProduct && (Boolean(rw.expired) || rw.active === false) && !isUsed;
                            const isInactive = isUsed || isExpired;
                            const shopLink = `${SHOP_URL}/checkout?promo=${encodeURIComponent(rw.code)}&club=${encodeURIComponent(club || authUser.club || '')}`;
                            return (
                                <div
                                    key={`${rw.code}-${i}`}
                                    className={`rounded-xl p-5 flex flex-col justify-between gap-4 border transition-opacity ${
                                        isInactive
                                            ? 'bg-black/35 border-gray-800 opacity-65'
                                            : 'bg-black/50 border-pirate-gold/40'
                                    }`}
                                >
                                    <div>
                                        <div className="flex items-center justify-between gap-2 mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded tabular-nums ${
                                                    isInactive
                                                        ? 'bg-gray-800 text-gray-400'
                                                        : isFreeProduct
                                                            ? 'bg-pirate-gold text-black'
                                                            : 'bg-emerald-950 text-emerald-400'
                                                }`}>
                                                    {isFreeProduct ? t('rewards.free_gift') : `-${rw.value}${rw.discountType === 'percent' ? '%' : ' DA'}`}
                                                </span>
                                                {isUsed && (
                                                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-700/50 text-emerald-400">
                                                        ✓ {t('rewards.used_badge')}
                                                    </span>
                                                )}
                                                {isExpired && (
                                                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-red-950/70 border border-red-800/50 text-red-400">
                                                        {t('rewards.expired_badge')}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-[11px] text-gray-500 font-mono">{rw.source}</span>
                                        </div>
                                        <p className={`font-mono text-2xl font-extrabold tracking-wider ${
                                            isInactive ? 'text-gray-500 line-through' : 'text-pirate-gold'
                                        }`}>
                                            {isFreeProduct ? (rw.giftName || rw.code) : rw.code}
                                        </p>
                                        {rw.label && <p className="text-xs text-gray-400 mt-1">{rw.label}</p>}
                                        {isFreeProduct && (
                                            <p className="text-[11px] text-gray-500 font-mono mt-1">Code: {rw.code}</p>
                                        )}
                                    </div>

                                    {isFreeProduct ? (
                                        rw.claimed ? (
                                            <div className="py-2 px-3 rounded-lg bg-emerald-950/50 border border-emerald-700/50 text-emerald-400 text-xs font-bold text-center">
                                                {t('rewards.claimed')}
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => { setClaimModal({ isOpen: true, reward: rw }); setClaimError(''); }}
                                                className="w-full py-2.5 rounded-lg bg-pirate-gold text-black hover:bg-yellow-400 text-xs font-bold flex items-center justify-center gap-1.5 uppercase"
                                            >
                                                <Package size={15} /> {t('rewards.claim_btn')}
                                            </button>
                                        )
                                    ) : isInactive ? (
                                        <div className="py-2 px-3 rounded-lg bg-gray-900/80 border border-gray-800 text-gray-400 text-xs font-bold flex items-center justify-center gap-1.5">
                                            {isUsed ? (
                                                <>
                                                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                                                    <span>{t('rewards.used_notice')}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Ban size={14} className="text-red-400 shrink-0" />
                                                    <span>{t('rewards.expired_notice')}</span>
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleCopy(rw.code)}
                                                className="flex-1 py-2 rounded-lg bg-gray-900 border border-gray-700 text-gray-200 hover:border-pirate-gold text-xs font-bold flex items-center justify-center gap-1.5"
                                            >
                                                {copiedCode === rw.code ? <><Check size={14} /> {t('rewards.copied')}</> : <><Copy size={14} /> {t('rewards.copy')}</>}
                                            </button>
                                            <a
                                                href={shopLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 py-2 rounded-lg bg-pirate-gold text-black hover:bg-yellow-400 text-xs font-bold flex items-center justify-center gap-1.5"
                                            >
                                                <span>{t('rewards.use')}</span> <ExternalLink size={14} />
                                            </a>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Free Gift Claim Modal */}
            {claimModal.isOpen && claimModal.reward && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <form
                        onSubmit={handleClaimSubmit}
                        className="relative w-full max-w-md bg-[#111216] border border-pirate-gold/50 rounded-2xl p-6 shadow-2xl space-y-4 text-white"
                    >
                        <button
                            type="button"
                            onClick={() => setClaimModal({ isOpen: false, reward: null })}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <X size={20} />
                        </button>
                        <h3 className="font-heading text-2xl text-pirate-gold">
                            🎁 Réclamer : {claimModal.reward.giftName || claimModal.reward.code}
                        </h3>
                        <p className="text-xs text-gray-400">
                            Entre tes coordonnées pour recevoir ton cadeau gratuitement via Yazix Ship (0 DA).
                        </p>

                        <input
                            type="text"
                            required
                            placeholder="Nom complet"
                            value={claimForm.name}
                            onChange={(e) => setClaimForm({ ...claimForm, name: e.target.value })}
                            className="w-full bg-black border border-gray-700 rounded-lg p-2.5 text-sm"
                        />
                        <input
                            type="tel"
                            required
                            placeholder="Téléphone (05 / 06 / 07...)"
                            value={claimForm.phone}
                            onChange={(e) => setClaimForm({ ...claimForm, phone: e.target.value })}
                            className="w-full bg-black border border-gray-700 rounded-lg p-2.5 text-sm font-mono"
                        />
                        <input
                            type="text"
                            required
                            placeholder="Wilaya (ex: Alger, Oran, Tizi Ouzou)"
                            value={claimForm.wilaya}
                            onChange={(e) => setClaimForm({ ...claimForm, wilaya: e.target.value })}
                            className="w-full bg-black border border-gray-700 rounded-lg p-2.5 text-sm"
                        />
                        <input
                            type="text"
                            required
                            placeholder="Adresse exacte"
                            value={claimForm.address}
                            onChange={(e) => setClaimForm({ ...claimForm, address: e.target.value })}
                            className="w-full bg-black border border-gray-700 rounded-lg p-2.5 text-sm"
                        />
                        <label className="flex items-start gap-2 text-xs text-gray-300 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={claimForm.consentAccepted}
                                onChange={(e) => setClaimForm({ ...claimForm, consentAccepted: e.target.checked })}
                                className="mt-0.5 accent-[#C5A365]"
                            />
                            <span>J&apos;accepte les CGV et la Politique de Confidentialité de Yazix Ship (Loi 18-07).</span>
                        </label>

                        {claimError && <p className="text-red-400 text-xs">{claimError}</p>}

                        <button
                            type="submit"
                            disabled={claiming || !claimForm.consentAccepted}
                            className="w-full py-3 rounded-xl bg-pirate-gold text-black font-bold text-sm uppercase hover:bg-yellow-400 disabled:opacity-50"
                        >
                            {claiming ? 'Envoi...' : 'Confirmer ma livraison gratuite'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
