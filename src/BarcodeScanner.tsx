import { useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { t } from './strings';

type Per100 = { name: string; cal: number; protein: number; carbs: number; fat: number };

async function lookupBarcode(code: string): Promise<Per100 | 'nodata' | null> {
  const url =
    `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json` +
    '?fields=product_name,brands,nutriments';
  const res = await fetch(url);
  if (!res.ok) throw new Error('bad response');
  const json = await res.json();
  if (json.status !== 1 || !json.product) return null;

  const p = json.product;
  const n = p.nutriments ?? {};
  if (n['energy-kcal_100g'] == null) return 'nodata';

  const base = p.product_name || code;
  return {
    name: p.brands ? `${base} (${String(p.brands).split(',')[0]})` : base,
    cal: Number(n['energy-kcal_100g']) || 0,
    protein: Number(n['proteins_100g']) || 0,
    carbs: Number(n['carbohydrates_100g']) || 0,
    fat: Number(n['fat_100g']) || 0,
  };
}

export default function BarcodeScanner({ onResult }: { onResult: (f: Per100) => void }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const locked = useRef(false); // stops the camera from firing many times

  async function search(value: string) {
    const c = value.trim();
    if (c.length < 6 || busy) return;
    setBusy(true);
    setMsg('');
    try {
      const found = await lookupBarcode(c);
      if (found === null) setMsg(t.barcode.notFound);
      else if (found === 'nodata') setMsg(t.barcode.noNutrition);
      else onResult(found);
    } catch {
      setMsg(t.barcode.error);
    }
    setBusy(false);
  }

  async function startScan() {
    if (!permission?.granted) {
      const r = await requestPermission();
      if (!r.granted) {
        setMsg(t.barcode.cameraDenied);
        return;
      }
    }
    locked.current = false;
    setMsg('');
    setScanning(true);
  }

  function handleScanned(data: string) {
    if (locked.current) return;
    locked.current = true;
    setScanning(false);
    setCode(data);
    search(data);
  }

  return (
    <View style={{ gap: 10 }}>
      {scanning ? (
        <View style={styles.cameraBox}>
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'] }}
            onBarcodeScanned={({ data }) => handleScanned(data)}
          />
        </View>
      ) : null}

      <Pressable
        style={styles.btn}
        onPress={scanning ? () => setScanning(false) : startScan}
      >
        <Ionicons name={scanning ? 'close' : 'barcode-outline'} size={20} color="#fff" />
        <Text style={styles.btnText}>{scanning ? t.barcode.stop : t.barcode.scan}</Text>
      </Pressable>

      <Text style={styles.label}>{t.barcode.typeIt}</Text>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder={t.barcode.placeholder}
          keyboardType="numeric"
          value={code}
          onChangeText={setCode}
          onSubmitEditing={() => search(code)}
        />
        <Pressable style={styles.lookupBtn} onPress={() => search(code)} disabled={busy}>
          <Text style={styles.btnText}>{t.barcode.lookup}</Text>
        </Pressable>
      </View>

      {busy && <Text style={styles.hint}>{t.barcode.looking}</Text>}
      {msg !== '' && <Text style={styles.error}>{msg}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  cameraBox: { height: 220, borderRadius: 12, overflow: 'hidden', backgroundColor: '#000' },
  btn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    paddingVertical: 12,
  },
  btnText: { color: '#fff', fontWeight: '700' },
  label: { color: '#666', fontSize: 12 },
  row: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1,
    minWidth: 0,
    backgroundColor: '#f6f7f9',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  lookupBtn: {
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  hint: { color: '#999', textAlign: 'center' },
  error: { color: '#e5484d', textAlign: 'center' },
});