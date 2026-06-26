# NextNews

A modern, feature-rich news aggregation platform built with Next.js that provides real-time news updates from various categories. The application includes premium features accessible through Razorpay payment integration.

## 🚀 Features

- **Hot Topics Carousel**: Auto-rotating featured news articles with smooth transitions
- **Latest News Grid**: Paginated display of the most recent news articles
- **Category Filtering**: Browse news by categories (Technology, Business, Sports, Entertainment, Health, Gaming, General)
- **Search Functionality**: Premium search feature to find articles by keywords
- **Article Details**: Detailed article view with full content and metadata
- **Payment Integration**: Razorpay integration for premium features (search and article access)
- **Saved Articles**: Save articles to read later (requires authentication)
- **Responsive Design**: Fully responsive UI built with Tailwind CSS
- **Smooth Navigation**: Intuitive navigation with sidebar menu and smooth scrolling

## 🛠️ Tech Stack

- **Framework**: Next.js 16.0.3 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Payment Gateway**: Razorpay
- **News API**: NewsAPI.org
- **React**: 19.2.0
- **Database**: MongoDB with Mongoose
- **React Compiler**: Enabled for optimized performance

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or higher)
- npm, yarn, pnpm, or bun
- A NewsAPI.org API key ([Get one here](https://newsapi.org/))
- Razorpay account (for payment features) - [Sign up here](https://razorpay.com/)

## 🔧 Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd nextnews
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Create a `.env.local` file in the root directory and add the following environment variables:

```env
# NewsAPI Configuration
NEWS_API_KEY=your_newsapi_key_here

# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id

# Database Configuration
MONGODB_URI=your_mongodb_connection_string
```

4. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 📁 Project Structure

nextnews/
├── src/
│ └── app/
│ ├── api/
│ │ ├── articles/
│ │ │ ├── [id]/
│ │ │ │ └── route.ts # Fetch single article by ID
│ │ │ └── route.ts # Fetch all database articles
│ │ ├── news/
│ │ │ └── route.ts # NewsAPI.org proxy endpoint
│ │ ├── razorpay/
│ │ │ ├── order/
│ │ │ │ └── route.ts # Create payment order
│ │ │ └── verify/
│ │ │ └── route.ts # Verify payment signature
│ │ ├── save/
│ │ │ └── route.ts # Save article to user profile
│ │ └── seed/
│ │ └── route.ts # Seed database with initial data
│ ├── article/
│ │ ├── [id]/
│ │ │ └── page.tsx # Dynamic article detail page
│ │ └── page.tsx # Article main page
│ ├── category/
│ │ └── [slug]/
│ │ └── page.tsx # Dynamic category news page
│ ├── saved/
│ │ ├── loading.tsx # Loading state for saved page
│ │ └── page.tsx # User's saved articles page
│ ├── search/
│ │ ├── SearchContent.tsx # Search results client component
│ │ └── page.tsx # Search page wrapper
│ ├── components/
│ │ ├── skeletons/ # Loading UI components
│ │ │ ├── ArticleSkeleton.tsx
│ │ │ ├── CategorySkeleton.tsx
│ │ │ ├── DbNewsFeedSkeleton.tsx
│ │ │ ├── HotTopicsSkeleton.tsx
│ │ │ ├── LatestNewsSkeleton.tsx
│ │ │ ├── MainSkeleton.tsx
│ │ │ └── SearchSkeleton.tsx
│ │ ├── DbNewsFeed.tsx # Feed from local database
│ │ ├── Footer.tsx # Application footer
│ │ ├── Header.tsx # Main navigation header
│ │ ├── HotTopics.tsx # Trending news carousel
│ │ ├── LatestNews.tsx # Latest news grid
│ │ ├── Main.tsx # Homepage main container
│ │ ├── SideBar.tsx # Navigation sidebar
│ │ └── Skeleton.tsx # Base skeleton component
│ ├── lib/
│ │ ├── db.ts # Database connection utility
│ │ └── mockNews.ts # Mock data for testing
│ ├── models/
│ │ ├── Article.ts # Mongoose content schema
│ │ └── User.ts # Mongoose user schema
│ ├── layout.tsx # Root layout definition
│ ├── page.tsx # Homepage
│ └── globals.css # Global CSS styles
├── public/ # Static public assets
├── next.config.ts # Next.js configuration
├── tsconfig.json # TypeScript configuration
└── package.json # Project dependencies

## 🔌 API Routes

### `/api/news`

Fetches news articles from NewsAPI.org with support for:

- **Query Parameters**:
  - `category`: Filter by news category (optional)
  - `search`: Search for articles by keyword (optional)
- **Response**: JSON array of news articles

### `/api/razorpay/order`

Creates a Razorpay order for payment processing.

- **Method**: POST
- **Body**: `{ amount: number }`
- **Response**: Razorpay order object

### `/api/razorpay/verify`

Verifies Razorpay payment signature.

- **Method**: POST
- **Body**: Payment response from Razorpay
- **Response**: `{ success: boolean }`

## 💳 Payment Features

The application includes premium features that require payment:

1. **Search Functionality**: ₹99 - Unlocks the ability to search for news articles
2. **Article Access**: ₹299 - Grants access to read full articles from original sources

Payments are processed through Razorpay and verified server-side for security.

## 🎨 Features in Detail

### Home Page

- Displays hot topics in an auto-rotating carousel (changes every 3 seconds)
- Shows latest news in a paginated grid layout
- Responsive design that works on all screen sizes

### Category Pages

- Filter news by specific categories
- Paginated results (6 articles per page)
- Smooth navigation and scrolling

### Search Page

- Premium feature requiring payment
- Search across all news articles
- Results displayed in a grid layout

### Article Page

- Detailed view of individual articles
- Shows article image, title, description, and content
- Option to read original source (premium feature)

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Deploy on Vercel

The easiest way to deploy is using [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy!

For more deployment options, check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).

## 🔒 Environment Variables

Make sure to set up the following environment variables:

| Variable                      | Description               | Required                 |
| ----------------------------- | ------------------------- | ------------------------ |
| `NEWS_API_KEY`                | Your NewsAPI.org API key  | Yes                      |
| `RAZORPAY_KEY_ID`             | Razorpay Key ID           | Yes (for payments)       |
| `RAZORPAY_KEY_SECRET`         | Razorpay Key Secret       | Yes (for payments)       |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Public Razorpay Key ID    | Yes (for payments)       |
| `MONGODB_URI`                 | MongoDB Connection String | Yes (for saved articles) |

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is private and proprietary.

## 🙏 Acknowledgments

- [NewsAPI.org](https://newsapi.org/) for providing news data
- [Razorpay](https://razorpay.com/) for payment processing
- [Next.js](https://nextjs.org/) for the amazing framework
- [Tailwind CSS](https://tailwindcss.com/) for styling utilities

---

Built with ❤️ using Next.js
