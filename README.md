# Physics Simulations

An interactive collection of educational physics simulations built with Next.js, TypeScript, TailwindCSS, p5.js, and Python.

## 🎯 Features

- **Beautiful Modern UI**: Built with Next.js 14, TypeScript, and TailwindCSS
- **Interactive Visualizations**: Real-time physics simulations using p5.js
- **Python Backend**: Serverless functions for complex calculations
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Vercel-Ready**: Optimized for one-click deployment

## 🚀 Current Simulations

### 1. Light and Shadow
Explore how light sources create shadows with fully adjustable parameters:
- **1-3 light sources** (point or extended/area light)
- Adjustable position (x, y), color, and intensity for each light
- **Point lights**: Create sharp shadows (umbra)
- **Extended lights**: Create soft shadows with penumbra regions
- Interactive controls with real-time updates
- Visual representation of shadow formation and light interaction

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: TailwindCSS
- **Graphics**: p5.js via react-p5
- **Backend**: Python serverless functions
- **Deployment**: Vercel

## 📦 Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd physics-simulations
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🌐 Deployment

### Deploy to Vercel

1. **Push your code to GitHub**

2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your repository
   - Vercel will automatically detect Next.js and configure the build

3. **Deploy**:
   - Click "Deploy"
   - Your app will be live in minutes!

The Python API routes in `/api` will automatically be deployed as serverless functions.

## 📁 Project Structure

```
physics-simulations/
├── app/
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page (simulation gallery)
│   └── simulations/
│       └── light-and-shadow/
│           └── page.tsx         # Light and Shadow simulation page
├── components/
│   └── LightAndShadowSimulation.tsx  # Main simulation component
├── api/
│   ├── shadow.py                # Python backend for shadow calculations
│   └── requirements.txt         # Python dependencies
├── public/                      # Static assets
├── package.json                 # Node dependencies
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.js          # TailwindCSS configuration
├── next.config.js              # Next.js configuration
└── vercel.json                 # Vercel deployment configuration
```

## 🎨 Adding New Simulations

To add a new simulation:

1. **Create the simulation component** in `/components/YourSimulation.tsx`
2. **Create a page** in `/app/simulations/your-simulation/page.tsx`
3. **Add backend logic** (if needed) in `/api/your-simulation.py`
4. **Update the home page** to include your simulation in the gallery

Example simulations to add:
- **Refraction**: Light bending through different media
- **Projectile Motion**: Trajectory calculations with gravity
- **Pendulum**: Simple harmonic motion
- **Wave Interference**: Constructive and destructive interference
- **Doppler Effect**: Sound wave frequency changes

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Environment

The project uses:
- Node.js 18+ 
- Python 3.9+ (for API routes)
- Modern browsers with Canvas support

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [p5.js Reference](https://p5js.org/reference/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Vercel Documentation](https://vercel.com/docs)

## 📝 License

MIT License - feel free to use this project for educational purposes!

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Add new physics simulations
- Improve existing visualizations
- Enhance the UI/UX
- Fix bugs or optimize performance
- Add documentation

---

Built with ❤️ for physics education
