# Quick Start Guide - Physics Simulations

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

### 3. Open in Browser
Navigate to **http://localhost:3000**

---

## ✨ What You'll See

### Home Page
- A beautiful landing page with a gallery of available simulations
- Currently includes the **Light and Shadow** simulation
- Clean, modern UI with gradient effects

### Light and Shadow Simulation
- **Canvas Area**: 800x600px interactive physics visualization
- **Control Panel**: Right sidebar with all adjustable parameters

---

## 🎮 How to Use the Light and Shadow Simulation

### Adding Light Sources
1. Click **"+ Add Light Source"** button (up to 3 lights)
2. Each light source is labeled L1, L2, L3

### Adjusting Light Properties
For each light source, you can control:
- **Position X**: Horizontal position (50-750)
- **Position Y**: Vertical position (50-450)
- **Color**: Click color picker to choose any color
- **Intensity**: Light brightness (0.1-1.0)
- **Extended Light Source**: Toggle for soft shadows
  - When enabled, adjust **Radius** (10-50) to control penumbra size

### Object Controls
- **Stick Height**: Adjust from 50-250px
- **Stick Position**: Move horizontally across the canvas

### Observing the Physics
- **Point lights** create sharp, defined shadows (umbra)
- **Extended lights** create soft shadows with gradient edges (penumbra)
- Multiple lights create overlapping shadow patterns
- Shadows dynamically update as you move sliders
- Ground illumination shows colored light influence

---

## 🎯 Physics Concepts Demonstrated

### Umbra
The darkest part of a shadow where all light is blocked (point light sources)

### Penumbra
The partial shadow region where only some light is blocked (extended light sources)

### Light Intensity
Affects the opacity and visibility of shadows

### Color Mixing
Multiple colored lights blend where their illumination overlaps

---

## 🌐 Deploy to Vercel

### Method 1: Vercel CLI
```bash
npm i -g vercel
vercel
```

### Method 2: GitHub Integration
1. Push code to GitHub
2. Import repository in Vercel dashboard
3. Deploy with one click!

### What Gets Deployed
- ✅ Next.js frontend (static + server-side)
- ✅ Python API endpoints (`/api/shadow`)
- ✅ All assets and styles
- ✅ Automatic HTTPS and CDN

---

## 📂 File Structure Overview

```
physics-simulations/
├── app/                                    # Next.js 14 App Router
│   ├── page.tsx                           # Home page (gallery)
│   ├── layout.tsx                         # Root layout
│   ├── globals.css                        # Global styles
│   └── simulations/
│       └── light-and-shadow/page.tsx      # Simulation page
│
├── components/
│   └── LightAndShadowSimulation.tsx       # Main simulation logic
│
├── api/
│   └── shadow.py                          # Python shadow calculations
│
├── package.json                           # Dependencies
├── tsconfig.json                          # TypeScript config
├── tailwind.config.js                     # Tailwind config
├── vercel.json                           # Vercel deployment config
└── README.md                             # Full documentation
```

---

## 🔧 Customization Tips

### Change Canvas Size
Edit `canvasWidth` and `canvasHeight` in `LightAndShadowSimulation.tsx`:
```typescript
const canvasWidth = 800  // Change to your desired width
const canvasHeight = 600 // Change to your desired height
```

### Adjust Light Limits
Change the maximum number of lights:
```typescript
if (lightSources.length < 3) // Change 3 to your desired maximum
```

### Modify Colors
Update the color scheme in `app/globals.css` or component classes

### Add New Simulations
1. Create component in `/components/YourSim.tsx`
2. Add page in `/app/simulations/your-sim/page.tsx`
3. Update home page gallery in `/app/page.tsx`

---

## 🐛 Troubleshooting

### "Module not found" errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### p5.js not rendering
- Check browser console for errors
- Ensure JavaScript is enabled
- Try hard refresh (Ctrl+Shift+R)

### Python API not working locally
- Python APIs are for Vercel deployment
- Simulation works without backend (client-side fallback)

### Build errors
```bash
npm run build
```
Check output for specific errors

---

## 📚 Next Steps

### Extend the Project
- Add more simulations (refraction, projectile motion, waves)
- Implement 3D rendering with three.js
- Add educational tooltips and explanations
- Create simulation presets
- Add export/share functionality

### Learn More
- [Next.js Documentation](https://nextjs.org/docs)
- [p5.js Examples](https://p5js.org/examples/)
- [Physics of Light and Shadow](https://en.wikipedia.org/wiki/Shadow)

---

**Enjoy exploring physics! 🔬✨**
