import React, { useState, useEffect } from 'react';
import { Trophy, Crown, Flame, ArrowLeft, RefreshCw, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { arcadeFetch } from '../utils/arcadeApi';

export default function Leaderboard({ onBack }) {
    const { t } = useTranslation();
    const [tab, setTab] = useState('daily'); // 'daily' | 'weekly' | 'allTime'
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadLeaderboard = async () => {
        try {
            setLoading(true);
            setError('');
            const res = await arcadeFetch('/game/leaderboard');
            if (res.success) setData(res.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadLeaderboard();
    }, []);

    const rows =
        tab === 'daily'
            ? (data?.daily || [])
            : tab === 'weekly'
                ? (data?.weekly || [])
                : (data?.allTime || []);

    const getScore = (row) => {
        if (tab === 'daily') return row.dailyBestScore;
        if (tab === 'weekly') return row.weeklyBestScore;
        return row.bestRunnerScore;
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <button
                    onClick={onBack}
                    className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-pirate-gold transition-colors"
                >
                    <ArrowLeft size={16} /> Retour au Lobby
                </button>
                <button
                    onClick={loadLeaderboard}
                    className="p-2 rounded-lg bg-black/50 border border-gray-800 text-gray-300 hover:border-pirate-gold"
                    title="Actualiser"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            <div className="bg-[#111216] border border-pirate-gold/30 rounded-2xl p-4 sm:p-6 shadow-2xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="font-heading text-2xl sm:text-3xl text-pirate-gold flex items-center gap-2">
                            <Trophy className="text-pirate-gold shrink-0" /> {t('leaderboard.title')}
                        </h1>
                        {data && (
                            <p className="text-xs text-gray-400 mt-1 tabular-nums">
                                {t('leaderboard.season')} : <span className="text-white font-mono">{data.weekId}</span> ·{' '}
                                {t('leaderboard.daily_bonus')} ({data.dailyTargetScore}m) : <span className="text-amber-300 font-bold">+{data.dailyCoinReward} Coins</span>
                            </p>
                        )}
                    </div>

                    <div className="flex flex-wrap bg-black/60 border border-gray-800 rounded-xl p-1 gap-1 w-full md:w-auto">
                        <button
                            onClick={() => setTab('daily')}
                            className={`flex-1 md:flex-none justify-center px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors flex items-center gap-1.5 ${
                                tab === 'daily' ? 'bg-pirate-gold text-black' : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            <Sun size={14} /> {t('leaderboard.today')}
                        </button>
                        <button
                            onClick={() => setTab('weekly')}
                            className={`flex-1 md:flex-none justify-center px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors flex items-center gap-1.5 ${
                                tab === 'weekly' ? 'bg-pirate-gold text-black' : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            <Flame size={14} /> {t('leaderboard.week')}
                        </button>
                        <button
                            onClick={() => setTab('allTime')}
                            className={`flex-1 md:flex-none justify-center px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors flex items-center gap-1.5 ${
                                tab === 'allTime' ? 'bg-pirate-gold text-black' : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            <Crown size={14} /> {t('leaderboard.hall')}
                        </button>
                    </div>
                </div>

                {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

                {loading ? (
                    <p className="text-gray-400 text-center py-10 text-sm">Chargement du classement...</p>
                ) : rows.length === 0 ? (
                    <p className="text-gray-500 text-center py-10 text-sm">Aucun score enregistré pour le moment. Lance une partie !</p>
                ) : (
                    <div className="space-y-2">
                        {rows.map((row, idx) => (
                            <div
                                key={row._id || idx}
                                className={`flex items-center justify-between p-3.5 rounded-xl border ${
                                    idx === 0
                                        ? 'bg-pirate-gold/10 border-pirate-gold/50'
                                        : 'bg-black/40 border-gray-800/80'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className={`font-mono font-bold w-7 tabular-nums ${idx === 0 ? 'text-pirate-gold text-lg' : 'text-gray-400'}`}>
                                        #{idx + 1}
                                    </span>
                                    <span className="font-bold text-white">@{row.pseudo}</span>
                                    <span className="text-[11px] px-2 py-0.5 rounded bg-gray-900 text-gray-300 uppercase">
                                        {row.club || 'free'}
                                    </span>
                                </div>
                                <span className="font-mono font-bold text-emerald-400 text-lg tabular-nums">
                                    {getScore(row)}m
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
