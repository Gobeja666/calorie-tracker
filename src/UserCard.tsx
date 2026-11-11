import { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, Image, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from './supabase';
import { useAuth } from './AuthContext';
import { t } from './strings';

function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}

function accountAge(createdAt?: string) {
  if (!createdAt) return '—';
  const created = new Date(createdAt);
  const now = new Date();
  const totalDays = Math.floor((now.getTime() - created.getTime()) / 86400000);
  if (totalDays < 1) return t.userCard.today;
  if (totalDays < 30) return plural(totalDays, t.userCard.day, t.userCard.days);

  let months =
    (now.getFullYear() - created.getFullYear()) * 12 +
    (now.getMonth() - created.getMonth());
  if (now.getDate() < created.getDate()) months--;
  if (months < 12) return plural(Math.max(months, 1), t.userCard.month, t.userCard.months);

  const y = Math.floor(months / 12);
  const m = months % 12;
  const years = plural(y, t.userCard.year, t.userCard.years);
  return m > 0 ? `${years} ${plural(m, t.userCard.month, t.userCard.months)}` : years;
}

export default function UserCard() {
  const { session } = useAuth();
  const user = session?.user;

  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        setName(data?.full_name ?? '');
        setAvatar(data?.avatar_url ?? null);
      });
  }, [user?.id]);

  async function saveName() {
    if (!user) return;
    const value = draft.trim();
    const { error: err } = await supabase
      .from('profiles')
      .update({ full_name: value || null })
      .eq('id', user.id);
    if (err) {
      setError(`${t.userCard.saveError}: ${err.message}`);
      return;
    }
    setError('');
    setName(value);
    setEditing(false);
  }

  async function pickPhoto() {
    if (!user || busy) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (result.canceled) return;

    setBusy(true);
    setError('');
    try {
      const asset = result.assets[0];
      const buffer = await (await fetch(asset.uri)).arrayBuffer();
      const path = `${user.id}/avatar.jpg`;

      const { error: upErr } = await supabase.storage
        .from('avatars')
        .upload(path, buffer, {
          contentType: asset.mimeType ?? 'image/jpeg',
          upsert: true,
        });
      if (upErr) throw upErr;

      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      const url = `${data.publicUrl}?t=${Date.now()}`; // avoids showing the old cached photo

      const { error: dbErr } = await supabase
        .from('profiles')
        .update({ avatar_url: url })
        .eq('id', user.id);
      if (dbErr) throw dbErr;

      setAvatar(url);
    } catch (e: any) {
      setError(`${t.userCard.uploadError}: ${e.message ?? ''}`);
    }
    setBusy(false);
  }

  const initial = (name || user?.email || '?').charAt(0).toUpperCase();

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <Pressable onPress={pickPhoto} style={styles.avatarWrap}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.placeholder]}>
              <Text style={styles.initial}>{initial}</Text>
            </View>
          )}
          <View style={styles.camera}>
            <Ionicons name="camera" size={14} color="#fff" />
          </View>
        </Pressable>

        <View style={{ flex: 1 }}>
          {editing ? (
            <View style={styles.editRow}>
              <TextInput
                style={styles.input}
                placeholder={t.userCard.namePlaceholder}
                value={draft}
                onChangeText={setDraft}
                onSubmitEditing={saveName}
                autoFocus
                maxLength={40}
              />
              <Pressable style={styles.saveBtn} onPress={saveName}>
                <Text style={styles.saveText}>{t.userCard.save}</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              style={styles.nameRow}
              onPress={() => {
                setDraft(name);
                setEditing(true);
              }}
            >
              <Text style={[styles.name, !name && { color: '#999' }]} numberOfLines={1}>
                {name || t.userCard.noName}
              </Text>
              <Ionicons name="pencil" size={16} color="#3b82f6" />
            </Pressable>
          )}
          <Text style={styles.email} numberOfLines={1}>
            {user?.email}
          </Text>
        </View>
      </View>

      <View style={styles.ageBox}>
        <Text style={styles.ageLabel}>{t.userCard.memberFor}</Text>
        <Text style={styles.ageValue}>{accountAge(user?.created_at)}</Text>
      </View>

      {busy && <Text style={styles.hint}>…</Text>}
      {error !== '' && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 18, gap: 14 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatarWrap: { width: 72, height: 72 },
  avatar: { width: 72, height: 72, borderRadius: 36 },
  placeholder: { backgroundColor: '#dbe7fb', justifyContent: 'center', alignItems: 'center' },
  initial: { fontSize: 30, fontWeight: '800', color: '#3b82f6' },
  camera: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { fontSize: 20, fontWeight: '700', flexShrink: 1 },
  email: { color: '#777', marginTop: 2, fontSize: 13 },
  editRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  input: {
    flex: 1,
    minWidth: 0,
    backgroundColor: '#f6f7f9',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  saveBtn: {
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  saveText: { color: '#fff', fontWeight: '700' },
  ageBox: {
    backgroundColor: '#eef4ff',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ageLabel: { color: '#666' },
  ageValue: { fontWeight: '700' },
  hint: { color: '#999', textAlign: 'center' },
  error: { color: '#e5484d' },
});