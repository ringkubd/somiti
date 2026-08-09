import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { type BreadcrumbItem } from '@/types';
import {
    ArrowLeft, Send, MessageCircle,
    Smile, Paperclip, Mic, AtSign, X
} from 'lucide-react';

declare global { interface Window { Echo: any; Pusher: any; } }

interface Message {
    id: number; somiti_id: number; message: string;
    message_type: string; attachment_url: string | null;
    created_at: string;
    user: { id: number; name: string };
}

interface ChatUser { id: number; name: string; }

interface Props {
    somiti: { id: number; name: string };
    messages: { data: Message[]; next_page_url: string | null };
    onlineUsers: ChatUser[];
    members: { id: number; name: string }[];
}

const EMOJIS = ['😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇','🙂','🙃','😉','😌','😍','🥰','😘','😗','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🤧','🥵','🥶','🥴','😵','🤯','🤠','🥳','😎','🤓','🧐','😕','😟','🙁','😮','😯','😲','😳','🥺','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱','😤','😡','😠','💀','☠️','👋','🤚','🖐','✋','🖖','👌','🤌','🤏','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏','✍️','💅','🤳','💪','🦵','🦶','👂','🦻','👃','🧠','🫀','🫁','🦷','🦴','👀','👁','👅','👄','💋','🩸','❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','👍','👎','👊','✊','🤛','🤜','👏','🙌','👐','🤲' ];

export default function SomitiChat({ somiti, messages: initialMessages, onlineUsers: initialOnline, members }: Props) {
    const { auth } = usePage().props as any;
    const userId = auth?.user?.id;
    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Somitis', url: '/somitis' },
        { label: somiti.name, url: `/somitis/${somiti.id}` },
        { label: 'Chat', url: '#' },
    ];

    const [messages, setMessages] = useState<Message[]>([...initialMessages.data].reverse());
    const [newMessage, setNewMessage] = useState('');
    const [onlineUsers, setOnlineUsers] = useState<ChatUser[]>(initialOnline);
    const [typingUsers, setTypingUsers] = useState<{ userId: number; name: string }[]>([]);
    const [showEmoji, setShowEmoji] = useState(false);
    const [showMentions, setShowMentions] = useState(false);
    const [mentionFilter, setMentionFilter] = useState('');
    const [attachedFile, setAttachedFile] = useState<File | null>(null);
    const [attachedPreview, setAttachedPreview] = useState<string | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const msgListRef = useRef<HTMLDivElement>(null);

    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    // Echo + Polling
    useEffect(() => {
        // Echo
        if (typeof window.Echo !== 'undefined') {
            try {
                const channel = (window.Echo as any).join(`somiti.${somiti.id}`);
                channel
                    .here((users: ChatUser[]) => setOnlineUsers(users))
                    .joining((u: ChatUser) => setOnlineUsers(p => p.find(x => x.id === u.id) ? p : [...p, u]))
                    .leaving((u: ChatUser) => setOnlineUsers(p => p.filter(x => x.id !== u.id)))
                    .listen('.message.sent', (e: any) => setMessages(p => p.find(m => m.id === e.id) ? p : [...p, e]))
                    .listen('.typing', (e: any) => {
                        if (e.user_id === userId) return;
                        setTypingUsers(p => {
                            if (p.find(t => t.userId === e.user_id)) return p;
                            return [...p, { userId: e.user_id, name: e.user_name }];
                        });
                        setTimeout(() => setTypingUsers(p => p.filter(t => t.userId !== e.user_id)), 3000);
                    });
                return () => { try { (window as any).Echo.leaveChannel(`presence-somiti.${somiti.id}`); } catch {} };
            } catch {}
        }

        // Polling fallback — fetch messages every 5s
        const poll = setInterval(async () => {
            try {
                const res = await fetch(`/somitis/${somiti.id}/chat`);
                const html = await res.text();
                // Extract messages from the HTML by parsing the Inertia page
                const match = html.match(/messages&quot;:(\[.*?\])/);
                if (match) {
                    try {
                        const parsed = JSON.parse(match[1].replace(/&quot;/g, '"'));
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            setMessages(prev => {
                                const reversed = [...parsed].reverse();
                                return reversed.length > prev.length ? reversed : prev;
                            });
                        }
                    } catch {}
                }
            } catch {}
        }, 5000);

        return () => { clearInterval(poll); };
    }, [somiti.id, userId]);

    // Real-time via Echo (Pusher) — no HTTP polling needed

    // Typing indicator — debounced, fires at most every 2s via Echo client event
    const handleTyping = useCallback(() => {
        if (typingTimeoutRef.current) return;
        typingTimeoutRef.current = setTimeout(() => { typingTimeoutRef.current = undefined; }, 2000);

        const token = document.querySelector('meta[name=csrf-token]')?.getAttribute('content');
        fetch(`/somitis/${somiti.id}/typing`, {
            method: 'POST',
            headers: { 'X-CSRF-TOKEN': token || '', 'Accept': 'application/json' },
        }).catch(() => {});
    }, [somiti.id]);

    // Mentions
    const handleInputChange = (val: string) => {
        setNewMessage(val);
        handleTyping();
        const lastAt = val.lastIndexOf('@');
        if (lastAt >= 0 && !val.slice(lastAt).includes(' ')) {
            setShowMentions(true);
            setMentionFilter(val.slice(lastAt + 1).toLowerCase());
        } else {
            setShowMentions(false);
        }
    };

    const insertMention = (name: string) => {
        const lastAt = newMessage.lastIndexOf('@');
        const before = newMessage.slice(0, lastAt);
        setNewMessage(before + '@' + name + ' ');
        setShowMentions(false);
    };

    const filteredMembers = members.filter(m =>
        m.name.toLowerCase().includes(mentionFilter) && m.id !== userId
    );

    const insertEmoji = (emoji: string) => {
        setNewMessage(prev => prev + emoji);
        setShowEmoji(false);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAttachedFile(file);
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (ev) => setAttachedPreview(ev.target?.result as string);
            reader.readAsDataURL(file);
        } else {
            setAttachedPreview(null);
        }
    };

    const uploadFile = async (): Promise<string | null> => {
        if (!attachedFile) return null;
        const form = new FormData();
        form.append('file', attachedFile);
        try {
            const res = await fetch('/api/chat/upload', { method: 'POST', body: form, headers: { 'Accept': 'application/json' } });
            const data = await res.json();
            setAttachedFile(null);
            return data.url || null;
        } catch { return null; }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        let text = newMessage.trim();
        if (!text && !attachedFile) return;

        const attachmentUrl = attachedFile ? await uploadFile() : null;
        if (!text && !attachmentUrl) return;

        const msgText = text + (attachmentUrl ? ` [${attachedFile?.name || 'file'}]` : '');
        const msgType = attachmentUrl ? (attachedFile?.type?.startsWith('image/') ? 'image' : 'file') : 'text';

        const tempMsg: Message = {
            id: Date.now(), somiti_id: somiti.id, message: msgText,
            message_type: msgType, attachment_url: attachmentUrl,
            created_at: new Date().toISOString(),
            user: { id: userId, name: auth?.user?.name || 'You' },
        };
        setMessages(p => [...p, tempMsg]);
        setNewMessage('');
        setAttachedFile(null);

        router.post(`/somitis/${somiti.id}/chat`, { message: msgText, message_type: msgType, attachment_url: attachmentUrl || '' }, {
            preserveScroll: true,
        });
    };

    const getInitials = (n: string) => n.split(' ').map(s => s[0]).join('').toUpperCase();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${somiti.name} Chat`} />
            <div className="max-w-full mx-auto py-4 px-4 h-[calc(100vh-8rem)] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b">
                    <div className="flex items-center gap-3">
                        <Link href={`/somitis/${somiti.id}`}>
                            <Button variant="outline" size="icon" className="rounded-full h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>
                        </Link>
                        <MessageCircle className="h-6 w-6 text-blue-600" />
                        <div>
                            <h1 className="text-xl font-bold">{somiti.name}</h1>
                            <p className="text-xs text-gray-500">
                                {onlineUsers.length > 0 ? `${onlineUsers.length} online` : 'Chat with members'}
                            </p>
                        </div>
                    </div>
                    <div className="flex -space-x-2">
                        {onlineUsers.slice(0, 5).map(u => (
                            <Avatar key={u.id} className="h-8 w-8 border-2 border-white">
                                <AvatarFallback className="text-xs bg-blue-100 text-blue-700">{getInitials(u.name)}</AvatarFallback>
                            </Avatar>
                        ))}
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto py-4 space-y-3">
                    {messages.map(msg => {
                        const isMe = msg.user?.id === userId;
                        const isImage = msg.message_type === 'image' && msg.attachment_url;
                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] ${isMe ? 'order-1' : 'order-1'}`}>
                                    {!isMe && <p className="text-xs text-gray-500 mb-1 ml-1">{msg.user?.name}</p>}
                                    <div className={`rounded-2xl px-4 py-2 ${
                                        isMe ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                                    }`}>
                                        {isImage ? (
                                            <img src={msg.attachment_url ?? undefined} alt="attachment" className="max-w-full rounded-lg mb-1" />
                                        ) : msg.message_type === 'file' && msg.attachment_url ? (
                                            <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer" className="underline text-sm">
                                                📎 {msg.message.replace(/\[.*?\]/, '').trim() || 'Download file'}
                                            </a>
                                        ) : (
                                            <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                                        )}
                                        <p className={`text-[10px] mt-1 ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {/* Typing indicator */}
                    {typingUsers.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-500 italic">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                            {typingUsers.map(t => t.name).join(', ')} typing...
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Mentions dropdown */}
                {showMentions && filteredMembers.length > 0 && (
                    <div className="relative mb-2">
                        <div className="absolute bottom-full left-0 w-64 bg-white border rounded-lg shadow-lg max-h-40 overflow-y-auto z-10">
                            {filteredMembers.map(m => (
                                <button key={m.id} className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm flex items-center gap-2"
                                    onClick={() => insertMention(m.name)}>
                                    <AtSign className="h-3 w-3 text-gray-400" /> {m.name}
                                </button>
                            ))}
                            <button className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm flex items-center gap-2 border-t"
                                onClick={() => insertMention('all')}>
                                <AtSign className="h-3 w-3 text-blue-500" /> <strong>@all</strong> — notify everyone
                            </button>
                        </div>
                    </div>
                )}

                {/* Emoji picker */}
                {showEmoji && (
                    <div className="bg-white border rounded-lg shadow-lg mb-2 p-2 max-h-40 overflow-y-auto">
                        <div className="flex flex-wrap gap-1">
                            {EMOJIS.map((e, i) => (
                                <button key={i} className="hover:bg-gray-100 rounded p-1 text-lg" onClick={() => insertEmoji(e)}>{e}</button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Attached file preview */}
                {attachedFile && (
                    <div className="bg-gray-50 rounded-lg px-3 py-2 mb-2 text-sm flex items-center gap-2">
                        {attachedPreview ? (
                            <img src={attachedPreview} alt="preview" className="h-16 w-16 object-cover rounded-lg" />
                        ) : (
                            <span className="text-2xl">📎</span>
                        )}
                        <span className="text-gray-500 truncate flex-1">{attachedFile.name}</span>
                        <button onClick={() => { setAttachedFile(null); setAttachedPreview(null); }}><X className="h-4 w-4 text-red-500" /></button>
                    </div>
                )}

                {/* Input */}
                <form onSubmit={sendMessage} className="flex items-end gap-2 pt-4 border-t">
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-gray-100 rounded-full">
                        <Paperclip className="h-5 w-5 text-gray-500" />
                    </button>
                    <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" />
                    <button type="button" onClick={() => setShowEmoji(!showEmoji)} className="p-2 hover:bg-gray-100 rounded-full">
                        <Smile className="h-5 w-5 text-gray-500" />
                    </button>
                    <Textarea
                        value={newMessage}
                        onChange={e => handleInputChange(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(e); } }}
                        placeholder="Type a message... Use @ to mention"
                        className="flex-1 min-h-[40px] max-h-[120px] resize-none rounded-2xl"
                        rows={1}
                    />
                    <Button type="submit" size="icon" className="rounded-full h-10 w-10 shrink-0" disabled={!newMessage.trim() && !attachedFile}>
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
