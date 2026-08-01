import React, { useState } from 'react';
import axios from 'axios';

export default function BuyTokensModal({ isOpen, onClose, user }) {
    const [tokenCount, setTokenCount] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const TOKEN_PRICE = 100; // 100 BDT per token

    const handleBuy = async () => {
        setLoading(true);
        setError('');

        const amount = tokenCount * TOKEN_PRICE;

        try {
            const res = await axios.post('http://localhost:5000/api/wallet/buy', {
                userId: user._id || user.id || '650000000000000000000002',
                amount: amount,
                name: user.name,
                email: user.email
            });

            if (res.data.paymentUrl) {
                // Redirect to SSLCommerz gateway
                window.location.href = res.data.paymentUrl;
            } else {
                setError('Failed to get payment URL from gateway.');
                setLoading(false);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to initiate payment.');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#111827] w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                <div className="bg-amber-500 px-6 py-5 flex justify-between items-center text-white">
                    <h2 className="text-xl font-extrabold tracking-tight">Buy Tokens</h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-all">
                        ✕
                    </button>
                </div>

                <div className="p-6 md:p-8 space-y-6">
                    <div className="text-center">
                        <div className="text-6xl mb-4">🪙</div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                            Tokens allow you to apply for tuition posts. <br/> 1 Token = {TOKEN_PRICE} BDT.
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm font-semibold p-3 rounded-xl border border-red-200 text-center">
                            {error}
                        </div>
                    )}

                    <div className="flex items-center justify-between bg-gray-50 dark:bg-[#1F2937] p-2 rounded-xl border border-gray-200 dark:border-gray-700">
                        <button 
                            onClick={() => setTokenCount(Math.max(1, tokenCount - 1))}
                            className="w-12 h-12 bg-white dark:bg-[#111827] rounded-lg shadow font-bold text-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            -
                        </button>
                        <div className="text-2xl font-extrabold">
                            {tokenCount}
                        </div>
                        <button 
                            onClick={() => setTokenCount(tokenCount + 1)}
                            className="w-12 h-12 bg-white dark:bg-[#111827] rounded-lg shadow font-bold text-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            +
                        </button>
                    </div>

                    <div className="flex justify-between items-center px-2 font-bold text-gray-700 dark:text-gray-300">
                        <span>Total:</span>
                        <span className="text-xl text-amber-600 dark:text-amber-400">{tokenCount * TOKEN_PRICE} BDT</span>
                    </div>

                    <button 
                        onClick={handleBuy}
                        disabled={loading}
                        className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold shadow-lg transition-all hover:-translate-y-0.5 mt-4"
                    >
                        {loading ? 'Processing...' : 'Pay with SSLCommerz'}
                    </button>
                </div>
            </div>
        </div>
    );
}
