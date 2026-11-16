export const t = {

  appName: 'MyFitnessApp',

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

  // Macros card (Today page)
  macros: {
    title: 'Macros',
    formula: 'Share of calories from each macro',
    protein: 'Protein',
    carbs: 'Carbs',
    fat: 'Fat',
    shortProtein: 'P',
    shortCarbs: 'C',
    shortFat: 'F',
    g: 'g',
    total: 'Total',
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
    proteinPlaceholder: 'Protein (g)',
    carbsPlaceholder: 'Carbs (g)',
    fatPlaceholder: 'Fat (g)',
    kcal: 'kcal',
    cancel: 'Cancel',
    add: 'Add',
    editFood: 'Edit food',
    save: 'Save',
    searchPlaceholder: 'Search food (e.g. banana)',
    search: 'Search',
    searching: 'Searching...',
    noResults: 'No results. Try another word or enter it by hand.',
    searchError: 'Search failed. Check your connection.',
    grams: 'Grams',
    per100: 'per 100 g',
    recent: 'Recent foods',
    methodSearch: 'Search',
    methodAi: 'AI scan',
    methodBarcode: 'Barcode',
    methodManual: 'Manual',
    comingSoon: 'Coming soon',
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
        sex: 'Sex',
    sexOptions: {
      male: 'Male',
      female: 'Female',
    } as Record<string, string>,
    activityLevel: 'Activity level',
    activityOptions: {
      sedentary: 'Sedentary',
      light: 'Lightly active',
      moderate: 'Moderately active',
      active: 'Very active',
    } as Record<string, string>,
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
    edit: 'Edit',
    editTitle: 'Edit weights',
    date: 'Date',
    close: 'Close',
    noEntries: 'No weights logged yet',
  },

  // Day picker
  days: {
    today: 'Today',
    weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  },

    // Bottom navigation bar
  nav: {
    home: 'Home',
    meals: 'Meals',
    settings: 'Settings',
    workouts: 'Workouts',
  },

    // Register page
  register: {
    title: 'Create account',
    subtitle: 'Tell us about you so we can build your plan',
    email: 'Email',
    password: 'Password',
    passwordHint: 'At least 6 characters',
    createAccount: 'Create account',
    invalidInput: 'Check your email, password (6+ characters), height and weight',
    error: 'Could not create the account',
    checkEmail: 'Account created. Check your email to confirm it, then log in.',
     confirmPassword: 'Confirm password',
    passwordsDontMatch: 'Passwords do not match',
    dateOfBirth: 'Date of birth',
    day: 'DD',
    month: 'MM',
    year: 'YYYY',
    invalidDate: 'Enter a valid date of birth',
  },

    // Login page
  login: {
    title: 'Log in',
    subtitle: 'Welcome back',
    logIn: 'Log in',
    error: 'Could not log in',
    noAccount: "Don't have an account? Register",
    haveAccount: 'Already have an account? Log in',
  },

    // Settings page
  settings: {
    account: 'Account',
    email: 'Email',
    yourProfile: 'Your profile',
    editProfile: 'Edit profile',
    notSet: 'Not set',
    cm: 'cm',
    logOut: 'Log out',
  },

    // Fasting tracker (Today page)
  fasting: {
    title: 'Fasting',
    subtitle: 'Choose a fasting window and track it',
    hoursShort: 'h',
    minutesShort: 'm',
    ofGoal: 'of',
    start: 'Start fasting',
    end: 'End fasting',
    started: 'Started',
    goalAt: 'Goal reached at',
    goalReached: 'Goal reached!',
    notFasting: 'Not fasting',
    completed: 'Completed fasts',
    custom: 'Custom',
    customPlaceholder: 'Hours (1-72)',
    set: 'Set',
    edit: 'Edit',
    done: 'Done',
  },

    // Notifications
  notifications: {
    title: 'Notifications',
    webOnly: 'Notifications work in the phone app, not in the browser.',
    denied: 'Notifications are blocked. Allow them in your phone settings.',
    fastGoal: 'Fasting goal reached',
    fastOneHour: 'Fasting: 1 hour left',
    meals: 'Meal reminders',
    weight: 'Weight reminder (weekly)',
    day: 'Day',
    timePlaceholder: 'HH:MM',
    fastGoalTitle: 'Fasting goal reached',
    fastGoalBody: 'You made it! You can end your fast now.',
    fastHourTitle: 'Almost there',
    fastHourBody: 'One hour left in your fast.',
    mealTitle: 'Meal reminder',
    mealBody: {
      Breakfast: 'Time to log your breakfast',
      Lunch: 'Time to log your lunch',
      Dinner: 'Time to log your dinner',
    } as Record<string, string>,
    weightTitle: 'Weigh-in time',
    weightBody: 'Log your weight to track your progress.',
  },

    // User card (Settings)
  userCard: {
    noName: 'Add your name',
    namePlaceholder: 'Your name',
    edit: 'Edit',
    save: 'Save',
    changePhoto: 'Change photo',
    memberFor: 'Account age',
    day: 'day',
    days: 'days',
    month: 'month',
    months: 'months',
    year: 'year',
    years: 'years',
    today: 'Joined today',
    uploadError: 'Could not upload the photo',
    saveError: 'Could not save',
  },

    // AI scanner
  ai: {
    takePhoto: 'Take photo',
    choosePhoto: 'Choose photo',
    analyzing: 'Analyzing your meal...',
    done: 'AI estimate filled in below. Check and edit the numbers.',
    notFood: 'No food found in the photo. Try another one.',
    error: 'Could not analyze the photo',
    cameraDenied: 'Camera access is blocked. Allow it in your phone settings.',
  },
  
    // Barcode scanner
  barcode: {
    scan: 'Scan with camera',
    stop: 'Stop scanning',
    typeIt: 'Or type the barcode number',
    placeholder: 'Barcode number',
    lookup: 'Look up',
    looking: 'Looking up...',
    notFound: 'Product not found. Try another or enter it by hand.',
    noNutrition: 'This product has no calorie data. Enter it by hand.',
    error: 'Lookup failed. Check your connection.',
    cameraDenied: 'Camera access is blocked. Allow it in your settings.',
    allowCamera: 'Allow camera',
  },
  
    // Workouts
  workouts: {
    burned: 'kcal burned',
    activeMinutes: 'active minutes',
    addWorkout: 'Add workout',
    nothingLogged: 'No workouts logged yet',
    min: 'min',
    namePlaceholder: 'Activity name',
    minutesPlaceholder: 'Duration (minutes)',
    kcalPlaceholder: 'Calories burned (kcal)',
    estimateHint: 'Calories are estimated from your weight. You can edit them.',
    types: {
      Walking: 'Walking',
      Running: 'Running',
      Cycling: 'Cycling',
      Gym: 'Gym / Weights',
      Swimming: 'Swimming',
      Custom: 'Custom',
    } as Record<string, string>,
  },
  
};