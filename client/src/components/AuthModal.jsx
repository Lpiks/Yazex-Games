import React, { useState, useEffect } from 'react';
import { X, Shield, UserCheck, LogIn } from 'lucide-react';
import { arcadeFetch } from '../utils/arcadeApi';

const CLUBS = [
    { id: 'mca', label: 'MC Alger' },
    { id: 'usma', label: 'USM Alger' },
    { id: 'crb', label: 'CR Belouizdad' },
    { id: 'jsk', label: 'JS Kabylie' },
    { id: 'ess', label: 'ES Sétif' },
    { id: 'csc', label: 'CS Constantine' },
    { id: 'mco', label: 'MC Oran' }
];

export default function AuthModal({ isOpen, onClose, onAuthSuccess, defaultClub = 'mca' }) {
    const [mode, setMode] = useState('login'); // 'login' | 'register'
    const [pseudo, setPseudo] = useState('');
    const [password, setPassword] = useState('');
    const [club, setClub] = useState(defaultClub);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setClub(defaultClub);
    }, [defaultClub]);

    useEffect(() => {
        if (!isOpen) return;
        const onKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const endpoint = mode === 'register' ? '/auth/register' : '/auth/login';
            const res = await arcadeFetch(endpoint, {
                method: 'POST',
                body: JSON.stringify({ pseudo: pseudo.trim(), password, club })
            });
            if (res.success) {
                onAuthSuccess(res.data);
                onClose();
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="relative w-full max-w-md bg-[#111216] border border-pirate-gold/40 rounded-2xl p-6 shadow-2xl text-white">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                    aria-label="Close"
                >
                    <X size={20} />
                </button>

                <div className="flex items-center gap-3 mb-5">
                    <div className="p-2.5 rounded-xl bg-pirate-gold/15 border border-pirate-gold/40 text-pirate-gold">
                        <Shield size={22} />
                    </div>
                    <div>
                        <h3 className="font-heading text-2xl text-pirate-gold">
                            {mode === 'login' ? 'CONNEXION CORSAIRE' : 'CRÉER UN COMPTE'}
                        </h3>
                        <p className="text-xs text-gray-400">
                            Protège ton pseudo, tes scores et tes codes promo.
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="grid grid-cols-2 gap-2 bg-black/50 p-1 rounded-xl border border-gray-800 mb-5">
                    <button
                        type="button"
                        onClick={() => { setMode('login'); setError(''); }}
                        className={`py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                            mode === 'login' ? 'bg-pirate-gold text-black' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        Connexion
                    </button>
                    <button
                        type="button"
                        onClick={() => { setMode('register'); setError(''); }}
                        className={`py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                            mode === 'register' ? 'bg-pirate-gold text-black' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        Inscription
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs text-gray-400 uppercase mb-1">Pseudo</label>
                        <input
                            type="text"
                            required
                            minLength={3}
                            maxLength={24}
                            value={pseudo}
                            onChange={(e) => setPseudo(e.target.value)}
                            placeholder="Capo_Alger"
                            className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:border-pirate-gold outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 uppercase mb-1">Mot de passe</label>
                        <input
                            type="password"
                            required
                            minLength={4}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••"
                            className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:border-pirate-gold outline-none"
                        />
                    </div>

                    {mode === 'register' && (
                        <div>
                            <label className="block text-xs text-gray-400 uppercase mb-1">Ton Club</label>
                            <div className="grid grid-cols-2 gap-2">
                                {CLUBS.map((c) => (
                                    <button
                                        key={c.id}
                                        type="button"
                                        onClick={() => setClub(c.id)}
                                        className={`py-1.5 px-2.5 rounded-lg text-xs font-semibold border text-left transition-colors ${
                                            club === c.id
                                                ? 'bg-pirate-gold/20 border-pirate-gold text-pirate-gold'
                                                : 'bg-black/60 border-gray-800 text-gray-400 hover:text-white'
                                        }`}
                                    >
                                        {c.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="p-2.5 rounded-lg bg-red-950/50 border border-red-700/60 text-red-300 text-xs">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-pirate-gold text-black font-bold py-3 rounded-xl hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2 uppercase tracking-wider text-sm disabled:opacity-50"
                    >
                        {mode === 'login' ? <LogIn size={16} /> : <UserCheck size={16} />}
                        <span>{loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}</span>
                    </button>
                </form>
            </div>
        </div>
    );
}
