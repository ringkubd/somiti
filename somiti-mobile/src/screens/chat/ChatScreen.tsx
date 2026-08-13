import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Modal, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { useLanguage } from '../../i18n/LanguageContext';
import { colors, radius, spacing, typography } from '../../theme';

const EMOJIS = ['😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇','🙂','🙃','😉','😌','😍','🥰','😘','😗','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🤧','🥵','🥶','🥴','😵','🤯','🤠','🥳','😎','🤓','🧐','😕','😟','🙁','😮','😯','😲','😳','🥺','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱','😤','😡','😠','💀','☠️','👋','🤚','🖐','✋','🖖','👌','🤌','🤏','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏','✍️','💅','🤳','💪','❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝'];

export default function ChatScreen({ navigation }: any) {
    const user = useAuthStore((s) => s.user);
    const { t } = useLanguage();
    const [messages, setMessages] = useState<any[]>([]);
    const [text, setText] = useState('');
    const [somitiId, setSomitiId] = useState<number | null>(null);
    const [somitis, setSomitis] = useState<any[]>([]);
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
            setSomitis(somitis?.data || []);
            const first = somitis?.data?.[0];
            if (!first) return;
            setSomitiId(first.id);
            await loadSomiti(first.id);
        } catch {}
    };

    const loadSomiti = async (id: number) => {
        setSomitiId(id);
        try {
            const [msgs, m] = await Promise.all([
                client.get(`/somitis/${id}/messages`),
                client.get(`/somitis/${id}/members`),
            ]);
            setMessages((msgs.data?.data || []).reverse());
            setMembers(m.data || []);
        } catch {}
    };

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
        if (!result.canceled && result.assets[0]) setAttachedImage(result.assets[0].uri);
    };

    const send = async () => {
        const msgText = text.trim();
        if (!msgText && !attachedImage) return;
        const caption = msgText || (attachedImage ? '📷 Image' : '');
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

    const canSend = text.trim().length > 0 || !!attachedImage;

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.title}>{t('chat')}</Text>
                    {somitis.length > 1 && (
                        <View style={styles.switcher}>
                            {somitis.map((s: any) => (
                                <TouchableOpacity
                                    key={s.id}
                                    style={[styles.switchChip, somitiId === s.id && styles.switchChipActive]}
                                    onPress={() => loadSomiti(s.id)}
                                >
                                    <Text style={[styles.switchText, somitiId === s.id && styles.switchTextActive]} numberOfLines={1}>
                                        {s.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                    {typingUsers.length > 0 && <Text style={styles.typing}>{typingUsers.map((t: any) => t.name).join(', ')} {t('typing')}</Text>}
                </View>
            </View>

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

            {attachedImage && (
                <View style={styles.attachPreview}>
                    <Image source={{ uri: attachedImage }} style={styles.attachImg} />
                    <TouchableOpacity onPress={() => setAttachedImage(null)} style={styles.removeAttach}><Ionicons name="close" size={16} color="#fff" /></TouchableOpacity>
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
                            {isImage ? <Image source={{ uri: item.attachment_url }} style={styles.bubbleImg} /> : null}
                            {item.message && item.message !== '📷 Image' && (
                                <Text style={[styles.msg, isMe && styles.myMsg]}>{item.message}</Text>
                            )}
                            <Text style={[styles.time, isMe && styles.myTime]}>
                                {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        </View>
                    );
                }}
                ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>{t('noMessages')}</Text></View>}
                contentContainerStyle={messages.length === 0 ? { flex: 1, justifyContent: 'center' } : { padding: spacing.lg, paddingBottom: spacing.sm }}
            />

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
                <TouchableOpacity onPress={pickImage} style={styles.iconBtn}><Ionicons name="attach-outline" size={22} color={colors.textSecondary} /></TouchableOpacity>
                <TouchableOpacity onPress={() => setShowEmoji(true)} style={styles.iconBtn}><Ionicons name="happy-outline" size={22} color={colors.textSecondary} /></TouchableOpacity>
                <TextInput style={styles.input} value={text} onChangeText={handleTextChange}
                    placeholder="Type @ to mention..." placeholderTextColor={colors.textMuted} multiline />
                <TouchableOpacity style={[styles.sendBtn, !canSend && styles.sendBtnDisabled]} onPress={send} disabled={!canSend}>
                    <Ionicons name="send" size={18} color={colors.textOnPrimary} />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
    headerLeft: { flex: 1 },
    title: { ...typography.h2, color: colors.text },
    switcher: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
    switchChip: { backgroundColor: colors.bg, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5, maxWidth: 160 },
    switchChipActive: { backgroundColor: colors.primary },
    switchText: { fontSize: 12, color: colors.textSecondary },
    switchTextActive: { color: colors.textOnPrimary, fontWeight: '600' },
    typing: { fontSize: 11, color: colors.primary, fontStyle: 'italic', marginTop: 2 },
    mentionsList: { backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border, maxHeight: 200 },
    mentionItem: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
    mentionText: { ...typography.body, color: colors.text },
    attachPreview: { flexDirection: 'row', padding: spacing.sm, backgroundColor: colors.surfaceAlt, alignItems: 'center' },
    attachImg: { width: 60, height: 60, borderRadius: radius.sm },
    removeAttach: { marginLeft: spacing.sm, backgroundColor: colors.danger, borderRadius: radius.full, width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
    bubble: { maxWidth: '80%', padding: spacing.md, borderRadius: radius.lg, marginBottom: spacing.sm },
    myBubble: { alignSelf: 'flex-end', backgroundColor: colors.primary, borderBottomRightRadius: 4 },
    otherBubble: { alignSelf: 'flex-start', backgroundColor: colors.surface, borderBottomLeftRadius: 4 },
    name: { fontSize: 11, fontWeight: '600', color: colors.textSecondary, marginBottom: 2 },
    msg: { ...typography.body, color: colors.text, lineHeight: 20 },
    myMsg: { color: colors.textOnPrimary },
    bubbleImg: { width: 200, height: 150, borderRadius: radius.sm, marginBottom: 4 },
    time: { fontSize: 10, color: colors.textMuted, marginTop: 4, alignSelf: 'flex-end' },
    myTime: { color: colors.primaryLight },
    empty: { alignItems: 'center' },
    emptyText: { ...typography.body, color: colors.textMuted },
    emojiOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.backdrop },
    emojiPicker: { backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.lg, maxHeight: '50%' },
    emojiTitle: { ...typography.h3, marginBottom: spacing.md, color: colors.text },
    emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
    emojiItem: { fontSize: 28, padding: 4 },
    inputBar: { flexDirection: 'row', padding: spacing.sm, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, alignItems: 'flex-end' },
    iconBtn: { padding: spacing.sm },
    input: { flex: 1, backgroundColor: colors.surfaceAlt, borderRadius: radius.full, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, fontSize: 15, maxHeight: 80, marginHorizontal: 4 },
    sendBtn: { backgroundColor: colors.primary, borderRadius: radius.full, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, justifyContent: 'center' },
    sendBtnDisabled: { opacity: 0.4 },
});
