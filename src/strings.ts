export const t = {
  // Top bar titles
  screenTitles: {
    today: 'Today',
    meals: 'Meals',
    profile: 'Profile',
  },

  // Today page
  today: {
    calories: 'Calories',
    formula: 'Remaining = Goal - Food + Exercise',
    remaining: 'Remaining',
    baseGoal: 'Base Goal',
    food: 'Food',
    exercise: 'Exercise',
  },

  // Meal names (only change the text on the right side)
  mealNames: {
    Breakfast: 'Breakfast',
    Lunch: 'Lunch',
    Dinner: 'Dinner',
    Snacks: 'Snacks',
  } as Record<string, string>,

  // Meals page
  meals: {
    nothingLogged: 'Nothing logged yet',
    addFood: 'Add food',
    foodName: 'Food name',
    caloriesPlaceholder: 'Calories (kcal)',
    kcal: 'kcal',
    cancel: 'Cancel',
    add: 'Add',
  },

  // Profile page
  profile: {
    age: 'Age',
    agePlaceholder: 'Years',
    height: 'Height',
    heightPlaceholder: 'cm',
    weight: 'Weight',
    weightPlaceholder: 'kg',
    goal: 'Goal',
    goalOptions: {
      lose: 'Lose weight',
      maintain: 'Maintain weight',
      gain: 'Gain weight',
    } as Record<string, string>,
    yourDailyGoal: 'Your daily goal',
    fillAllFields: 'Fill in age, height and weight to see your goal',
    save: 'Save',
  },
    // Weight tracking (Today page)
  weight: {
    currentWeight: 'Current weight',
    noWeight: '—',
    kg: 'kg',
    logWeight: 'Log weight',
    weightPlaceholder: 'Weight (kg)',
    hint: 'Log your weight to see the graph',
    cancel: 'Cancel',
    save: 'Save',
  },
};
