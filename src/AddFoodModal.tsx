import { useMemo, useState } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView, Modal, StyleSheet,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFood, Food } from './FoodContext';
import { MEALS, IconName } from './mealTypes';
import { t } from './strings';
import AiScanner, { AiResult } from './AiScanner';
import BarcodeScanner from './BarcodeScanner';

type Per100 = { name: string; cal: number; protein: number; carbs: number; fat: number };
type Method = 'search' | 'ai' | 'barcode' | 'manual';

const METHODS: { key: Method; icon: IconName; label: string }[] = [
  { key: 'search', icon: 'search', label: t.meals.methodSearch },
  { key: 'ai', icon: 'sparkles', label: t.meals.methodAi },
  { key: 'barcode', icon: 'barcode-outline', label: t.meals.methodBarcode },
  { key: 'manual', icon: 'create-outline', label: t.meals.methodManual },
];

const round1 = (n: number) => Math.round(n * 10) / 10;

// Packaged products (Open Food Facts)
async function searchFoods(query: string): Promise<Per100[]> {
  const url =
    'https://world.openfoodfacts.org/cgi/search.pl?search_simple=1&action=process&json=1' +
    '&page_size=12&fields=product_name,brands,nutriments&search_terms=' +
    encodeURIComponent(query);
  const res = await fetch(url);
  if (!res.ok) throw new Error('bad response');
  const json = await res.json();

  return (json.products ?? [])
    .filter((p: any) => p.product_name && p.nutriments?.['energy-kcal_100g'] != null)
    .map((p: any) => ({
      name: p.brands ? `${p.product_name} (${String(p.brands).split(',')[0]})` : p.product_name,
      cal: Number(p.nutriments['energy-kcal_100g']) || 0,
      protein: Number(p.nutriments['proteins_100g']) || 0,
      carbs: Number(p.nutriments['carbohydrates_100g']) || 0,
      fat: Number(p.nutriments['fat_100g']) || 0,
    }))
    .slice(0, 8);
}

// Plain foods like banana, rice, chicken (USDA FoodData Central)
async function searchGeneric(query: string): Promise<Per100[]> {
  const key = process.env.EXPO_PUBLIC_USDA_KEY || 'DEMO_KEY';
  const url =
    'https://api.nal.usda.gov/fdc/v1/foods/search?pageSize=6' +
    '&dataType=Foundation,SR%20Legacy&query=' +
    encodeURIComponent(query) +
    '&api_key=' +
    key;
  const res = await fetch(url);
  if (!res.ok) throw new Error('bad response');
  const json = await res.json();

  return (json.foods ?? [])
    .map((f: any) => {
      const n = (...ids: number[]) => {
        for (const id of ids) {
          const v = f.foodNutrients?.find((x: any) => x.nutrientId === id)?.value;
          if (v != null) return Number(v);
        }
        return 0;
      };
      return {
        name: String(f.description),
        cal: n(1008, 2047, 2048),
        protein: n(1003),
        carbs: n(1005),
        fat: n(1004),
      };
    })
    .filter((p: Per100) => p.cal > 0);
}

export default function AddFoodModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { addFood, days } = useFood();

  // Last 8 different foods you've logged, newest first
  const recent = useMemo(() => {
    const all = Object.values(days)
      .flatMap((day) => Object.values(day).flat())
      .sort((a, b) => b.id - a.id);
    const seen = new Set<string>();
    const list: Food[] = [];
    for (const f of all) {
      const key = f.name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      list.push(f);
      if (list.length >= 8) break;
    }
    return list;
  }, [days]);

  const [selected, setSelected] = useState('Breakfast');
  const [method, setMethod] = useState<Method>('search');
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  // Search
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Per100[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchMsg, setSearchMsg] = useState('');
  const [picked, setPicked] = useState<Per100 | null>(null);
  const [grams, setGrams] = useState('100');

  function close() {
    onClose();
    setName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    setQuery('');
    setResults([]);
    setSearchMsg('');
    setPicked(null);
    setGrams('100');
    setMethod('search');
  }

  function toGrams(v: string) {
    const n = parseFloat(v.replace(',', '.'));
    return isNaN(n) || n < 0 ? 0 : n;
  }

  async function handleSearch() {
    const q = query.trim();
    if (q.length < 2 || searching) return;
    setSearching(true);
    setSearchMsg('');
    setResults([]);

    const [generic, packaged] = await Promise.allSettled([
      searchGeneric(q),
      searchFoods(q),
    ]);
    const list = [
      ...(generic.status === 'fulfilled' ? generic.value : []),
      ...(packaged.status === 'fulfilled' ? packaged.value : []),
    ];

    setResults(list);
    if (list.length === 0) {
      const bothFailed = generic.status === 'rejected' && packaged.status === 'rejected';
      setSearchMsg(bothFailed ? t.meals.searchError : t.meals.noResults);
    }
    setSearching(false);
  }

  // Fill the fields from a food and an amount in grams
  function fill(food: Per100, g: number) {
    const k = g / 100;
    setName(food.name);
    setCalories(String(Math.round(food.cal * k)));
    setProtein(String(round1(food.protein * k)));
    setCarbs(String(round1(food.carbs * k)));
    setFat(String(round1(food.fat * k)));
  }

  function pick(food: Per100) {
    setPicked(food);
    setGrams('100');
    setResults([]);
    fill(food, 100);
  }

  function pickRecent(f: Food) {
    setPicked(null);
    setName(f.name);
    setCalories(String(f.calories));
    setProtein(f.protein ? String(f.protein) : '');
    setCarbs(f.carbs ? String(f.carbs) : '');
    setFat(f.fat ? String(f.fat) : '');
  }

  function pickAi(r: AiResult) {
    setPicked(null);
    setName(r.name);
    setCalories(String(Math.round(r.calories)));
    setProtein(String(round1(r.protein)));
    setCarbs(String(round1(r.carbs)));
    setFat(String(round1(r.fat)));
  }

  function changeGrams(v: string) {
    setGrams(v);
    const g = parseFloat(v.replace(',', '.'));
    if (picked && g > 0) fill(picked, g);
  }

  function handleAdd() {
    const cal = parseFloat(calories.replace(',', '.'));
    if (!name.trim() || isNaN(cal) || cal <= 0) return;
    addFood(selected, name.trim(), cal, {
      protein: toGrams(protein),
      carbs: toGrams(carbs),
      fat: toGrams(fat),
    });
    close();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modal}>
          <ScrollView
            contentContainerStyle={{ gap: 12 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Text style={styles.modalTitle}>{t.meals.addFood}</Text>
              <Pressable onPress={close} hitSlop={12}>
                <Ionicons name="close" size={26} color="#666" />
              </Pressable>
            </View>

            <View style={styles.chips}>
              {MEALS.map((m) => {
                const active = selected === m.name;
                return (
                  <Pressable
                    key={m.name}
                    style={[
                      styles.chip,
                      active && { backgroundColor: m.color, borderColor: m.color },
                    ]}
                    onPress={() => setSelected(m.name)}
                  >
                    <Ionicons
                      name={m.icon}
                      size={16}
                      color={active ? '#fff' : m.color}
                    />
                    <Text style={[styles.chipText, active && { color: '#fff' }]}>
                      {t.mealNames[m.name]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Method picker */}
            <View style={styles.methods}>
              {METHODS.map((m) => {
                const active = method === m.key;
                return (
                  <Pressable
                    key={m.key}
                    style={[styles.method, active && styles.methodActive]}
                    onPress={() => setMethod(m.key)}
                  >
                    <Ionicons
                      name={m.icon}
                      size={22}
                      color={active ? '#fff' : '#3b82f6'}
                    />
                    <Text style={[styles.methodText, active && { color: '#fff' }]}>
                      {m.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {method === 'ai' && <AiScanner onResult={pickAi} />}
            {method === 'barcode' && <BarcodeScanner onResult={pick} />}

            {method === 'search' && (
              <>
                <View style={styles.searchRow}>
                  <TextInput
                    style={[styles.input, { flex: 1, minWidth: 0 }]}
                    placeholder={t.meals.searchPlaceholder}
                    value={query}
                    onChangeText={setQuery}
                    onSubmitEditing={handleSearch}
                    returnKeyType="search"
                  />
                  <Pressable style={styles.searchBtn} onPress={handleSearch}>
                    <Ionicons name="search" size={20} color="#fff" />
                  </Pressable>
                </View>

                {searching && <Text style={styles.hint}>{t.meals.searching}</Text>}
                {searchMsg !== '' && <Text style={styles.hint}>{searchMsg}</Text>}

                {results.map((r, i) => (
                  <Pressable key={i} style={styles.result} onPress={() => pick(r)}>
                    <Text style={styles.resultName} numberOfLines={2}>
                      {r.name}
                    </Text>
                    <Text style={styles.resultCal}>
                      {Math.round(r.cal)} {t.meals.kcal} {t.meals.per100}
                    </Text>
                  </Pressable>
                ))}
              </>
            )}

            {(method === 'search' || method === 'manual') &&
              results.length === 0 && !picked && !name.trim() && recent.length > 0 && (
                <View style={{ gap: 8 }}>
                  <Text style={styles.recentTitle}>{t.meals.recent}</Text>
                  {recent.map((f) => (
                    <Pressable key={f.id} style={styles.result} onPress={() => pickRecent(f)}>
                      <Text style={styles.resultName} numberOfLines={1}>{f.name}</Text>
                      <Text style={styles.resultCal}>{f.calories} {t.meals.kcal}</Text>
                    </Pressable>
                  ))}
                </View>
              )}

            {picked && (
              <View style={styles.gramsRow}>
                <Text style={styles.gramsLabel}>{t.meals.grams}</Text>
                <TextInput
                  style={[styles.input, styles.gramsInput]}
                  keyboardType="numeric"
                  value={grams}
                  onChangeText={changeGrams}
                />
              </View>
            )}

            <TextInput
              style={styles.input}
              placeholder={t.meals.foodName}
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder={t.meals.caloriesPlaceholder}
              keyboardType="numeric"
              value={calories}
              onChangeText={setCalories}
            />

            <View style={styles.macroRow}>
              <TextInput
                style={[styles.input, styles.macroInput]}
                placeholder={t.meals.proteinPlaceholder}
                keyboardType="numeric"
                value={protein}
                onChangeText={setProtein}
              />
              <TextInput
                style={[styles.input, styles.macroInput]}
                placeholder={t.meals.carbsPlaceholder}
                keyboardType="numeric"
                value={carbs}
                onChangeText={setCarbs}
              />
              <TextInput
                style={[styles.input, styles.macroInput]}
                placeholder={t.meals.fatPlaceholder}
                keyboardType="numeric"
                value={fat}
                onChangeText={setFat}
                onSubmitEditing={handleAdd}
              />
            </View>

            <View style={styles.modalButtons}>
              <Pressable style={styles.cancelBtn} onPress={close}>
                <Text style={styles.cancelText}>{t.meals.cancel}</Text>
              </Pressable>
              <Pressable style={styles.addBtn} onPress={handleAdd}>
                <Text style={styles.addText}>{t.meals.add}</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  modal: { backgroundColor: '#fff', borderRadius: 16, padding: 20, maxHeight: '90%' },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e6',
  },
  chipText: { fontWeight: '600', color: '#333' },
  methods: { flexDirection: 'row', gap: 8 },
  method: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#eef4ff',
  },
  methodActive: { backgroundColor: '#3b82f6' },
  methodText: { fontSize: 11, fontWeight: '700', color: '#3b82f6' },
  input: {
    backgroundColor: '#f6f7f9',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  searchRow: { flexDirection: 'row', gap: 8 },
  searchBtn: {
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  hint: { color: '#999', textAlign: 'center' },
  recentTitle: { fontWeight: '700', color: '#444' },
  result: {
    backgroundColor: '#eef4ff',
    borderRadius: 10,
    padding: 12,
    gap: 2,
  },
  resultName: { fontWeight: '600' },
  resultCal: { color: '#666', fontSize: 12 },
  gramsRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  gramsLabel: { fontWeight: '700', color: '#444' },
  gramsInput: { width: 100, textAlign: 'center' },
  macroRow: { flexDirection: 'row', gap: 8 },
  macroInput: { flex: 1, minWidth: 0, paddingHorizontal: 8 },
  modalButtons: { flexDirection: 'row', gap: 8, marginTop: 4 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cancelBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 10,
    backgroundColor: '#f0f0f4', alignItems: 'center',
  },
  cancelText: { fontWeight: '700', color: '#555' },
  addBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 10,
    backgroundColor: '#3b82f6', alignItems: 'center',
  },
  addText: { color: '#fff', fontWeight: '700' },
});