# 🚀 AuraGen - Portfolio Generator

<div align="center">
  <img src="./public/AuraGen%20logo.png" alt="AuraGen Logo" width="120" height="120">
  
  #### Transform your developer journey into a stunning portfolio in minutes
  
  [![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.1.9-38B2AC)](https://tailwindcss.com/)
  [![Supabase](https://img.shields.io/badge/Supabase-Latest-green)](https://supabase.com/)
  [![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
</div>

---

## ✨ Features

### 🎨 **Professional Templates**
- **Minimal Dark Theme**: Clean, modern design focused on readability
- **Responsive Design**: Perfect on desktop, tablet, and mobile
- **Customizable Color Schemes**: Match your personal brand

### 🔧 **Powerful Tools**
- **Multi-Step Form Builder**: Intuitive portfolio creation process
- **Real-time Preview**: See changes as you build
- **Template Renderer**: Dynamic portfolio generation
- **Custom Domain Support**: Host on your own domain

### 🌐 **Domain Management**
- **Domain Search & Purchase**: Find and buy domains directly
- **DNS Configuration**: Automated setup with A and CNAME records
- **SSL Support**: Secure HTTPS for all portfolios
- **Domain Verification**: Automated verification process

### 💳 **Payment Integration**
- **Stripe Integration**: Secure payment processing
- **Razorpay Support**: Multiple payment options
- **Coupon System**: Promotional codes and discounts
- **INR Pricing**: Localized pricing for Indian market

### 🔐 **Authentication & Security**
- **Supabase Auth**: Secure user authentication
- **Protected Routes**: Role-based access control
- **Middleware Security**: Request validation and protection
- **User Profile Management**: Complete profile customization

---

## 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | Next.js 15, React 19, TypeScript |
| **Styling** | Tailwind CSS, Radix UI, Lucide Icons |
| **Backend** | Supabase, PostgreSQL |
| **Payment** | Razorpay |
| **Forms** | React Hook Form, Zod validation |
| **Deployment** | Vercel |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0 or later
- pnpm (recommended) or npm
- Supabase account
- Stripe account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/portfolio-generator.git
   cd portfolio-generator
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   
   # Stripe Configuration
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   
   # Razorpay Configuration
   NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   
   # Application URLs
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_DOMAIN=localhost:3000
   ```

4. **Database Setup**
   Run the SQL scripts in the `scripts/` directory to set up your Supabase database:
   ```bash
   # Execute scripts in order
   001_create_users_table.sql
   002_create_tech_stacks_table.sql
   003_create_projects_table.sql
   004_create_contact_details_table.sql
   005_create_portfolios_table.sql
   # ... and so on
   ```

5. **Run the development server**
   ```bash
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
portfolio-generator/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   ├── api/                      # API endpoints
│   │   ├── domains/              # Domain management API
│   │   ├── portfolio/            # Portfolio generation API
│   │   ├── webhooks/             # Payment webhooks
│   │   └── user-domains/         # User domain API
│   ├── create/                   # Portfolio creation page
│   ├── domain/                   # Custom domain handler
│   ├── edit/                     # Portfolio editing
│   ├── payment/                  # Payment processing
│   ├── portfolio/                # Portfolio management
│   └── public/                   # Public portfolio views
├── components/                   # React components
│   ├── form-steps/               # Multi-step form components
│   ├── templates/                # Portfolio templates
│   └── ui/                       # Reusable UI components
├── lib/                          # Utility libraries
│   ├── supabase/                 # Supabase configuration
│   ├── portfolio-generator.ts    # Core portfolio logic
│   └── templates.ts              # Template definitions
├── scripts/                     # Database migration scripts
└── public/                      # Static assets
```

---

## 🎯 Key Features Deep Dive

### Portfolio Creation Flow
1. **Personal Details**: Name, about, location, profile photo
2. **Tech Stack**: Technologies and skill levels
3. **Projects**: Project showcase with GitHub/live links
4. **Contact Details**: Social media and professional links
5. **Template Selection**: Choose from available templates
6. **Preview & Publish**: Review and make portfolio live

### Domain Management
- Search available domains using integrated domain API
- Purchase domains with secure payment processing
- Automatic DNS configuration for custom domains
- Domain verification and SSL certificate setup
- Portfolio mapping to custom domains

### Template System
- Modular template architecture
- Easy template creation and customization
- Responsive design patterns
- SEO optimization built-in
- Dynamic content rendering

---

## 🔧 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/portfolio/generate` | POST | Generate portfolio from user data |
| `/api/domains/check` | GET | Check domain availability |
| `/api/domains/purchase` | POST | Purchase domain |
| `/api/user-domains` | GET/POST | Manage user domains |
| `/api/webhooks/stripe` | POST | Handle Stripe webhooks |
| `/api/webhooks/razorpay` | POST | Handle Razorpay webhooks |

---

## 🚀 Deployment

### Vercel (Recommended)

1. **Deploy to Vercel**
   ```bash
   pnpm vercel
   ```

2. **Add Environment Variables**
   Configure all environment variables in Vercel dashboard

3. **Set Up Webhooks**
   Configure webhook URLs for payment processing

### Other Platforms

- **Netlify**: Use `netlify.toml` configuration
- **Railway**: Use `railway.json` for deployment
- **Docker**: Dockerfile included for containerization

---

## 🧪 Development

### Running Tests
```bash
pnpm test
```

### Linting
```bash
pnpm lint
```

### Type Checking
```bash
pnpm type-check
```

### Database Migrations
```bash
node scripts/migrate.js
```

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Supabase](https://supabase.com/) for backend-as-a-service
- [Tailwind CSS](https://tailwindcss.com/) for utility-first CSS
- [Radix UI](https://www.radix-ui.com/) for accessible components
- [Stripe](https://stripe.com/) & [Razorpay](https://razorpay.com/) for payment processing

---

## 📞 Support

- **Documentation**: [Link to docs]
- **Issues**: [GitHub Issues](https://github.com/your-username/portfolio-generator/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/portfolio-generator/discussions)
- **Email**: support@aurangen.com

---

<div align="center">
  <h3>Built with ❤️ by developers, for developers</h3>
  
  ⭐ Star this repository if you found it helpful!
</div>