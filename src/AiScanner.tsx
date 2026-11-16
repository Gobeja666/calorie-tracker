import { useState } from 'react';
import {
  View, Text, Pressable, Image, ActivityIndicator, Platform, StyleSheet,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from './supabase';
import { t } from './strings';

export type AiResult = {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

// Shrinks the photo so it uploads fast (about 768 px wide)
async function shrink(uri: string) {
  const ctx = ImageManipulator.manipulate(uri);
  ctx.resize({ width: 768 });
  const image = await ctx.renderAsync();
  const out = await image.saveAsync({
    format: SaveFormat.JPEG,
    compress: 0.5,
    base64: true,
  });
  return out.base64 as string;
}

export default function AiScanner({ onResult }: { onResult: (r: AiResult) => void }) {
  const [uri, setUri] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [ok, setOk] = useState(false);

  async function analyze(result: ImagePicker.ImagePickerResult) {
    if (result.canceled) return;
    const asset = result.assets[0];
    setUri(asset.uri);
    setBusy(true);
    setMsg('');
    setOk(false);

    try {
      const base64 = await shrink(asset.uri);

      const call = supabase.functions.invoke('analyze-meal', {
        body: { image: base64, mimeType: 'image/jpeg' },
      });
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Timed out, try again')), 60000)
      );
      const { data, error } = await Promise.race([call, timeout]);

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (!data?.isFood) {
        setMsg(t.ai.notFood);
      } else {
        onResult({
          name: String(data.name),
          calories: Number(data.calories) || 0,
          protein: Number(data.protein) || 0,
          carbs: Number(data.carbs) || 0,
          fat: Number(data.fat) || 0,
        });
        setOk(true);
      }
    } catch (e: any) {
      let detail = e.message ?? '';
      try {
        const body = await e.context?.json?.();
        if (body?.error) detail = body.error;
      } catch {}
      setMsg(`${t.ai.error}: ${detail}`);
    }
    setBusy(false);
  }

  async function choosePhoto() {
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    analyze(r);
  }

  async function takePhoto() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      setMsg(t.ai.cameraDenied);
      return;
    }
    const r = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    analyze(r);
  }

  return (
    <View style={{ gap: 10 }}>
      <View style={styles.row}>
        {Platform.OS !== 'web' && (
          <Pressable style={styles.btn} onPress={takePhoto} disabled={busy}>
            <Ionicons name="camera" size={18} color="#fff" />
            <Text style={styles.btnText}>{t.ai.takePhoto}</Text>
          </Pressable>
        )}
        <Pressable style={styles.btn} onPress={choosePhoto} disabled={busy}>
          <Ionicons name="image" size={18} color="#fff" />
          <Text style={styles.btnText}>{t.ai.choosePhoto}</Text>
        </Pressable>
      </View>

      {uri && <Image source={{ uri }} style={styles.preview} />}
      {busy && (
        <View style={styles.center}>
          <ActivityIndicator color="#3b82f6" />
          <Text style={styles.hint}>{t.ai.analyzing}</Text>
        </View>
      )}
      {ok && <Text style={styles.okText}>{t.ai.done}</Text>}
      {msg !== '' && <Text style={styles.error}>{msg}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  btn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    paddingVertical: 12,
  },
  btnText: { color: '#fff', fontWeight: '700' },
  preview: { width: '100%', height: 180, borderRadius: 12, backgroundColor: '#eef4ff' },
  center: { alignItems: 'center', gap: 6 },
  hint: { color: '#999', textAlign: 'center' },
  okText: { color: '#30a46c', textAlign: 'center' },
  error: { color: '#e5484d', textAlign: 'center' },
});