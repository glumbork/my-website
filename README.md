# RepFuel

A lightweight training and nutrition tracker. Log meals, lifts and daily goals, all in the browser with no build step and no dependencies.

## Features

- **Overview** – daily calorie and macro progress, today's food, recent lifts, quick note
- **Nutrition** – search built-in and custom foods, log by grams, live macro preview
- **Training log** – record sets, reps and load (kg/lb) and track weekly volume
- **Goal calendar** – monthly view, mark days complete, see each day's totals
- **Food library** – create and delete custom foods
- **Editable targets** – set your own calorie and macro goals
- Responsive layout, keyboard-friendly dialogs, and `prefers-reduced-motion` support

## Run it

No install needed. Open `index.html` in a browser.

Or serve it locally:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploy with GitHub Pages

1. Push this repo to GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/ (root)`, then save.

## Project structure

```
repfuel/
├── index.html      # markup
├── css/styles.css  # styles and design tokens (CSS variables)
├── js/app.js       # state, rendering and event handling
├── LICENSE
└── README.md
```

## Data and privacy

All data (goals, diary, lifts, custom foods, notes, completed days) is stored in your browser's `localStorage` under keys starting with `rf_`. Nothing is sent anywhere. Clearing site data or switching browsers or devices starts you fresh.

## Roadmap

- Live food search (e.g. USDA FoodData Central) behind a small backend
- Accounts and shared club data
- Weekly charts and lift progress graphs
- Meal types (breakfast, lunch, dinner)
- Data export and import (JSON/CSV)

## Contributing

Issues and pull requests are welcome. Keep it dependency-free and test in a desktop and a mobile-width browser before submitting.

## License

[MIT](LICENSE)
