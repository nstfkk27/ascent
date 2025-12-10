# Ascent Real Estate

A modern real estate website built with Next.js, PostgreSQL, Supabase, Prisma, and Tailwind CSS.

## Features

- 🏠 **3 Main Categories**: Residential, Business, and Land
- 🔍 **Live Search**: Real-time property search with advanced filters
- 🗺️ **Grid/Map View**: Toggle between grid and map view
- 📱 **Responsive Design**: Mobile-first approach with Tailwind CSS
- 🏢 **Condo Projects**: Special support for condo project names
- 🔐 **Supabase Integration**: Ready for authentication and storage

## Property Categories

### Residential
- **House**: Traditional single-family homes
  - Features: Bedrooms, bathrooms, square feet, floors, parking, furnished status
- **Pool Villa**: Luxury homes with pool and garden
  - Features: All house features + pool size, garden size
- **Condo**: Apartment units in buildings
  - Features: Bedrooms, bathrooms, square feet, floors, parking, furnished, **project name**

### Business
- **Hotel**: Commercial hospitality properties
  - Features: Number of rooms, square feet, floors, parking
- **Commercial Building**: Office and retail spaces
  - Features: Square feet, floors, parking, office spaces

### Land
- **Land**: Raw land for development
  - Features: Land size, square feet, zoning type

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Database**: PostgreSQL via Supabase
- **ORM**: Prisma
- **Styling**: Tailwind CSS
- **Deployment**: Vercel
- **Authentication**: Supabase Auth (ready to implement)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Database URL (PostgreSQL from Supabase)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[YOUR-SUPABASE-HOST]:5432/postgres
```

#### Getting Your Supabase Credentials

1. Go to https://supabase.com and create a new project
2. Navigate to Project Settings > API
   - Copy your Project URL to `NEXT_PUBLIC_SUPABASE_URL`
   - Copy your anon/public key to `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Navigate to Project Settings > Database
   - Copy the Connection String (URI) to `DATABASE_URL`

### 3. Set Up the Database

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to Supabase
npx prisma db push

# (Optional) Open Prisma Studio to manage data
npx prisma studio
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the website.

## Project Structure

```
ascentweb/
├── prisma/
│   └── schema.prisma          # Database schema with Property and Contact models
├── public/
│   └── placeholder.jpg        # Placeholder image for properties
├── src/
│   ├── app/
│   │   ├── about/
│   │   │   └── page.tsx       # About page
│   │   ├── contact/
│   │   │   └── page.tsx       # Contact form page
│   │   ├── properties/
│   │   │   └── page.tsx       # Properties listing page
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout with Navbar and Footer
│   │   └── page.tsx           # Homepage with live search
│   ├── components/
│   │   ├── Footer.tsx         # Footer component
│   │   ├── MapView.tsx        # Map view placeholder
│   │   ├── Navbar.tsx         # Navigation bar
│   │   ├── PropertyCard.tsx   # Property card component
│   │   ├── SearchFilters.tsx  # Advanced search filters
│   │   └── ViewToggle.tsx     # Grid/Map view toggle
│   └── lib/
│       ├── constants.ts       # Property categories and types
│       ├── prisma.ts          # Prisma client
│       └── supabase.ts        # Supabase client
├── .env.example               # Example environment variables
├── .env.local                 # Your local environment variables (create this)
├── next.config.js             # Next.js configuration
├── package.json               # Dependencies and scripts
├── tailwind.config.ts         # Tailwind CSS configuration
└── tsconfig.json              # TypeScript configuration
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma generate` - Generate Prisma Client
- `npx prisma db push` - Push schema changes to database
- `npx prisma studio` - Open Prisma Studio GUI

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import repository on [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

Vercel will automatically:
- Run `prisma generate` during build
- Build the Next.js application
- Deploy to production

## Adding Properties

You can add properties through:
1. **Prisma Studio**: Run `npx prisma studio` for a GUI
2. **API Routes**: Create API endpoints in `src/app/api/`
3. **Admin Panel**: Build an admin interface (future feature)

## Next Steps

- [ ] Implement property detail pages
- [ ] Add image upload functionality (Supabase Storage)
- [ ] Integrate map service (Google Maps, Mapbox, or Leaflet)
- [ ] Add user authentication (Supabase Auth)
- [ ] Create admin panel for property management
- [ ] Implement property comparison feature
- [ ] Add favorites/wishlist functionality
- [ ] Set up email notifications for new listings

## License

MIT
