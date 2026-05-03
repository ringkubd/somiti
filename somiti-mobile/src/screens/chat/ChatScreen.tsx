import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Modal, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';

const EMOJIS = ['😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇','🙂','🙃','😉','😌','😍','🥰','😘','😗','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🤧','🥵','🥶','🥴','😵','🤯','🤠','🥳','😎','🤓','🧐','😕','😟','🙁','😮','😯','😲','😳','🥺','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱','😤','😡','😠','💀','☠️','👋','🤚','🖐','✋','🖖','👌','🤌','🤏','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏','✍️','💅','🤳','💪','❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝'];

export default function ChatScreen({ navigation }: any) {
    const user = useAuthStore((s) => s.user);
    const [messages, setMessages] = useState<any[]>([]);
    const [text, setText] = useState('');
    const [somitiId, setSomitiId] = useState<number | null>(null);
    const [showEmoji, setShowEmoji] = useState(false);
    const [typingUsers, setTypingUsers] = useState<any[]>([]);
    const [members, setMembers] = useState<any[]>([]);
    const [showMentions, setShowMentions] = useState(false);
    const [mentionFilter, setMentionFilter] = useState('');
    const [attachedImage, setAttachedImage] = useState<string | null>(null);
    const flatRef = useRef<FlatList>(null);
    const typingRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => { loadChat(); }, []);

    const loadChat = async () => {
        try {
            const { data: somitis } = await client.get('/somitis');
            const first = somitis?.data?.[0];
            if (!first) return;
            setSomitiId(first.id);
            const { data: msgs } = await client.get(`/somitis/${first.id}/messages`);
            setMessages((msgs?.data || []).reverse());
            const { data: m } = await client.get(`/somitis/${first.id}/members`);
            setMembers(m || []);
        } catch {}
    };

    // Poll
    useEffect(() => {
        if (!somitiId) return;
        const interval = setInterval(async () => {
            try {
                const { data } = await client.get(`/somitis/${somitiId}/messages`);
                const all = (data?.data || []).reverse();
                if (all.length > messages.length) setMessages(all);
            } catch {}
        }, 3000);
        return () => clearInterval(interval);
    }, [somitiId, messages.length]);

    const handleTyping = () => {
        if (!somitiId) return;
        if (typingRef.current) return;
        typingRef.current = setTimeout(() => { typingRef.current = null; }, 2000);
        client.post(`/somitis/${somitiId}/typing`).catch(() => {});
    };

    const handleTextChange = (val: string) => {
        setText(val);
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
        const lastAt = text.lastIndexOf('@');
        setText(text.slice(0, lastAt) + '@' + name + ' ');
        setShowMentions(false);
    };

    const filteredMembers = members.filter((m: any) =>
        m.name?.toLowerCase().includes(mentionFilter) && m.id !== user?.id
    );

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
        if (!result.canceled && result.assets[0]) {
            setAttachedImage(result.assets[0].uri);
        }
    };

    const send = async () => {
        const msgText = text.trim();
        if (!msgText && !attachedImage) return;
        const caption = msgText || (attachedImage ? '📷 Image' : '');

        // Optimistic
        const tempId = Date.now();
        setMessages(prev => [...prev, { id: tempId, message: caption, message_type: attachedImage ? 'image' : 'text', attachment_url: attachedImage, user: { id: user?.id, name: 'You' }, created_at: new Date().toISOString() }]);
        setText('');
        setAttachedImage(null);

        try {
            let url = null;
            if (attachedImage) {
                const form = new FormData();
                const filename = attachedImage.split('/').pop() || 'photo.jpg';
                form.append('file', { uri: attachedImage, name: filename, type: 'image/jpeg' } as any);
                const { data: uploadData } = await client.post('/chat/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
                url = uploadData.url;
            }
            const { data } = await client.post(`/somitis/${somitiId}/messages`, { message: caption, message_type: attachedImage ? 'image' : 'text', attachment_url: url });
            setMessages(prev => prev.map(m => m.id === tempId ? { ...data, user: { id: user?.id, name: user?.name || 'You' } } : m));
        } catch {}
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
            <View style={styles.header}>
                <Text style={styles.title}>Chat</Text>
                {typingUsers.length > 0 && <Text style={styles.typing}>{typingUsers.map((t: any) => t.name).join(', ')} typing...</Text>}
            </View>

            {/* @mentions */}
            {showMentions && filteredMembers.length > 0 && (
                <View style={styles.mentionsList}>
                    {filteredMembers.slice(0, 5).map((m: any) => (
                        <TouchableOpacity key={m.id} style={styles.mentionItem} onPress={() => insertMention(m.name)}>
                            <Text style={styles.mentionText}>@ {m.name}</Text>
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity style={styles.mentionItem} onPress={() => insertMention('all')}>
                        <Text style={[styles.mentionText, { fontWeight: 'bold' }]}>@all — everyone</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Image preview */}
            {attachedImage && (
                <View style={styles.attachPreview}>
                    <Image source={{ uri: attachedImage }} style={styles.attachImg} />
                    <TouchableOpacity onPress={() => setAttachedImage(null)} style={styles.removeAttach}><Text style={{ color: '#fff' }}>✕</Text></TouchableOpacity>
                </View>
            )}

            <FlatList ref={flatRef} data={messages} keyExtractor={(i) => i.id?.toString() || Math.random().toString()}
                onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: true })}
                renderItem={({ item }) => {
                    const isMe = item.user?.id === user?.id;
                    const isImage = item.message_type === 'image' && item.attachment_url;
                    return (
                        <View style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}>
                            {!isMe && <Text style={styles.name}>{item.user?.name || 'Unknown'}</Text>}
                            {isImage ? (
                                <Image source={{ uri: item.attachment_url }} style={styles.bubbleImg} />
                            ) : null}
                            {item.message && item.message !== '📷 Image' && (
                                <Text style={[styles.msg, isMe && styles.myMsg]}>{item.message}</Text>
                            )}
                            <Text style={[styles.time, isMe && styles.myTime]}>
                                {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        </View>
                    );
                }}
                ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>No messages yet</Text></View>}
                contentContainerStyle={messages.length === 0 ? { flex: 1, justifyContent: 'center' } : { padding: 16, paddingBottom: 8 }}
            />

            {/* Emoji picker */}
            <Modal visible={showEmoji} transparent animationType="slide" onRequestClose={() => setShowEmoji(false)}>
                <View style={styles.emojiOverlay}>
                    <View style={styles.emojiPicker}>
                        <Text style={styles.emojiTitle}>Emoji</Text>
                        <View style={styles.emojiGrid}>
                            {EMOJIS.map((e, i) => (
                                <TouchableOpacity key={i} onPress={() => { setText(prev => prev + e); setShowEmoji(false); }}>
                                    <Text style={styles.emojiItem}>{e}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>
            </Modal>

            <View style={styles.inputBar}>
                <TouchableOpacity onPress={pickImage} style={styles.iconBtn}><Text style={styles.iconText}>📎</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => setShowEmoji(true)} style={styles.iconBtn}><Text style={styles.iconText}>😊</Text></TouchableOpacity>
                <TextInput style={styles.input} value={text} onChangeText={handleTextChange}
                    placeholder="Type @ to mention..." placeholderTextColor="#94a3b8" multiline />
                <TouchableOpacity style={[styles.sendBtn, !text.trim() && !attachedImage && styles.sendBtnDisabled]} onPress={send} disabled={!text.trim() && !attachedImage}>
                    <Text style={styles.sendText}>Send</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
    typing: { fontSize: 11, color: '#2563eb', fontStyle: 'italic', marginTop: 2 },
    mentionsList: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', maxHeight: 200 },
    mentionItem: { paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    mentionText: { fontSize: 15, color: '#1e293b' },
    attachPreview: { flexDirection: 'row', padding: 8, backgroundColor: '#f1f5f9', alignItems: 'center' },
    attachImg: { width: 60, height: 60, borderRadius: 8 },
    removeAttach: { marginLeft: 8, backgroundColor: '#ef4444', borderRadius: 12, width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
    bubble: { maxWidth: '80%', padding: 12, borderRadius: 16, marginBottom: 8 },
    myBubble: { alignSelf: 'flex-end', backgroundColor: '#2563eb', borderBottomRightRadius: 4 },
    otherBubble: { alignSelf: 'flex-start', backgroundColor: '#fff', borderBottomLeftRadius: 4 },
    name: { fontSize: 11, fontWeight: '600', color: '#64748b', marginBottom: 2 },
    msg: { fontSize: 15, color: '#1e293b', lineHeight: 20 },
    myMsg: { color: '#fff' },
    bubbleImg: { width: 200, height: 150, borderRadius: 8, marginBottom: 4 },
    time: { fontSize: 10, color: '#94a3b8', marginTop: 4, alignSelf: 'flex-end' },
    myTime: { color: '#bfdbfe' },
    empty: { alignItems: 'center' },
    emptyText: { fontSize: 16, color: '#94a3b8' },
    emojiOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' },
    emojiPicker: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, maxHeight: '50%' },
    emojiTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#1e293b' },
    emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
    emojiItem: { fontSize: 28, padding: 4 },
    inputBar: { flexDirection: 'row', padding: 8, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f1f5f9', alignItems: 'flex-end' },
    iconBtn: { padding: 8 },
    iconText: { fontSize: 20 },
    input: { flex: 1, backgroundColor: '#f1f5f9', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, fontSize: 15, maxHeight: 80, marginHorizontal: 4 },
    sendBtn: { backgroundColor: '#2563eb', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
    sendBtnDisabled: { opacity: 0.4 },
    sendText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});
