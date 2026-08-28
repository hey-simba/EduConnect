import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { getSocket, personId } from '../services/socket';

const API_BASE = 'http://localhost:5000/api';

export default function Messages() {
    const [searchParams] = useSearchParams();
    const [user] = useState(() => {
        try { return JSON.parse(localStorage.getItem('user')) || null; } catch { return null; }
    });
    const userId = user?._id || user?.id;

    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesContainerRef = useRef(null);
    const selectedRef = useRef(null);

    const loadConversations = useCallback(async () => {
        if (!userId) return;
        try {
            const res = await axios.get(`${API_BASE}/messages/recent/${userId}`);
            setConversations(res.data);
        } catch (err) {
            console.error('Load conversations error:', err);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const loadMessages = useCallback(async (otherUserId) => {
        if (!userId) return;
        try {
            const res = await axios.get(`${API_BASE}/messages/${userId}/${otherUserId}`);
            setMessages(res.data);
        } catch (err) {
            console.error('Load messages error:', err);
        }
    }, [userId]);

    const appendMessage = (msg) => {
        setMessages(prev => {
            if (!msg?._id || prev.some(m => m._id === msg._id)) return prev;
            return [...prev, msg];
        });
    };

    const belongsToSelected = (msg, conv) => {
        if (!conv) return false;
        const otherId = conv.otherUserId;
        const sender = personId(msg.senderId);
        const receiver = personId(msg.receiverId);
        return (
            (sender === String(userId) && receiver === otherId) ||
            (sender === otherId && receiver === String(userId))
        );
    };

    const handleSelectConversation = (conv) => {
        selectedRef.current = conv;
        setSelectedConversation(conv);
        loadMessages(conv.otherUserId);
        getSocket(userId).emit('markRead', { readerId: userId, senderId: conv.otherUserId });
        setConversations(prev => prev.map(c =>
            c.otherUserId === conv.otherUserId ? { ...c, unread: false } : c
        ));
    };

    useEffect(() => {
        if (!userId) return;
        getSocket(userId);
        loadConversations();
    }, [userId, loadConversations]);

    const targetUserId = searchParams.get('userId');
    useEffect(() => {
        if (!targetUserId || !userId || targetUserId === userId) return;

        const openTarget = async () => {
            let name = `User ${targetUserId.slice(-6)}`;
            try {
                const res = await axios.get(`${API_BASE}/messages/contact/${targetUserId}`);
                name = res.data.name;
            } catch {
                /* contact lookup is optional */
            }
            handleSelectConversation({
                otherUserId: targetUserId,
                otherUserName: name,
                lastMessage: '',
                lastMessageTime: new Date(),
                unread: false
            });
        };
        openTarget();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [targetUserId, userId]);

    useEffect(() => {
        if (!userId) return;
        const socket = getSocket(userId);

        const onIncoming = (msg) => {
            if (belongsToSelected(msg, selectedRef.current)) {
                appendMessage(msg);
            }
        };

        socket.on('newMessage', onIncoming);
        socket.on('messageSent', onIncoming);

        return () => {
            socket.off('newMessage', onIncoming);
            socket.off('messageSent', onIncoming);
        };
    }, [userId, appendMessage]);

    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation) return;

        const content = newMessage.trim();
        setNewMessage('');

        try {
            const res = await axios.post(`${API_BASE}/messages/send`, {
                senderId: userId,
                receiverId: selectedConversation.otherUserId,
                content,
                type: 'text'
            });
            appendMessage(res.data);
        } catch (err) {
            console.error('Send message error:', err);
            setNewMessage(content);
        }
    };

    if (!userId) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F19] flex items-center justify-center">
                <p className="text-gray-500">Please log in to view messages.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F19] text-gray-900 dark:text-gray-100 font-sans">
            <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
                <h1 className="text-3xl font-extrabold mb-6">Messages</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
                    <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                            <h2 className="font-extrabold text-lg">Conversations</h2>
                        </div>
                        <div className="overflow-y-auto h-full">
                            {loading ? (
                                <div className="p-4 text-center text-gray-500">Loading...</div>
                            ) : conversations.length === 0 && !selectedConversation ? (
                                <div className="p-4 text-center text-gray-500 text-sm">No conversations yet.</div>
                            ) : (
                                <>
                                    {selectedConversation && !conversations.some(c => c.otherUserId === selectedConversation.otherUserId) && (
                                        <button
                                            onClick={() => handleSelectConversation(selectedConversation)}
                                            className="w-full text-left p-4 border-b border-gray-100 dark:border-gray-800 bg-blue-50 dark:bg-blue-900/20"
                                        >
                                            <div className="font-semibold text-sm">{selectedConversation.otherUserName}</div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">New conversation</p>
                                        </button>
                                    )}
                                    {conversations.map(conv => (
                                        <button
                                            key={conv.otherUserId}
                                            onClick={() => handleSelectConversation(conv)}
                                            className={`w-full text-left p-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${selectedConversation?.otherUserId === conv.otherUserId ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="font-semibold text-sm">{conv.otherUserName || `User ${conv.otherUserId.slice(-6)}`}</div>
                                                {conv.unread && (
                                                    <span className="w-2 h-2 rounded-full bg-cyan-400 mt-1 flex-shrink-0"></span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">{conv.lastMessage}</p>
                                            <p className="text-[10px] text-gray-400 mt-1">
                                                {new Date(conv.lastMessageTime).toLocaleDateString()}
                                            </p>
                                        </button>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>

                    <div className="md:col-span-2 bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden flex flex-col">
                        {selectedConversation ? (
                            <>
                                <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                                    <h3 className="font-extrabold">
                                        Chat with {selectedConversation.otherUserName || `User ${selectedConversation.otherUserId.slice(-6)}`}
                                    </h3>
                                </div>
                                <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                                    {messages.map(msg => {
                                        const mine = personId(msg.senderId) === String(userId);
                                        return (
                                            <div key={msg._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                                                <div
                                                    className={`max-w-[70%] rounded-xl px-4 py-2 text-sm ${
                                                        mine
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                                                    } ${msg.type === 'application' ? 'border border-amber-400/50' : ''}`}
                                                >
                                                    <p>{msg.content}</p>
                                                    <p className={`text-[10px] mt-1 ${mine ? 'text-blue-200' : 'text-gray-400'}`}>
                                                        {new Date(msg.createdAt).toLocaleTimeString()}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={e => setNewMessage(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendMessage();
                                                }
                                            }}
                                            placeholder="Type a message..."
                                            className="flex-1 px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-blue-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleSendMessage}
                                            disabled={!newMessage.trim()}
                                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all disabled:opacity-50"
                                        >
                                            Send
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-gray-500">
                                <p>Select a conversation to start messaging.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
