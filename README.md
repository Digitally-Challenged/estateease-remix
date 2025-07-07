# EstateEase - Modern Estate Planning Management System

A comprehensive estate planning management platform built with Remix, TypeScript, and SQLite. EstateEase helps high-net-worth individuals and families organize, track, and manage their complete financial portfolio including assets, trusts, legal documents, and family information.

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Remix](https://img.shields.io/badge/remix-%23000.svg?style=for-the-badge&logo=remix&logoColor=white)
![SQLite](https://img.shields.io/badge/sqlite-%2307405e.svg?style=for-the-badge&logo=sqlite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

## 🎯 Overview

EstateEase provides a centralized platform for managing complex estate portfolios with features including:

- **Asset Management**: Track 20+ asset types across real estate, financial accounts, insurance, business interests, and personal property
- **Trust Administration**: Manage revocable and irrevocable trusts with beneficiary tracking
- **Financial Analytics**: Real-time net worth calculations, tax projections, and cash flow analysis
- **Family Directory**: Organize family members, legal roles, and professional advisors
- **Document Management**: Centralized storage for wills, trusts, deeds, and legal documents

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- SQLite3 (automatically installed with better-sqlite3)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/estateease-remix.git
cd estateease-remix

# Install dependencies
npm install

# Initialize the database
npm run db:init

# Start the development server
npm run dev
```

The application will be available at `http://localhost:5173` (or the port shown in your terminal).

## 📊 Features

### Core Functionality

#### 📈 Dashboard

- Real-time net worth tracking
- Asset allocation visualization
- Recent activity timeline
- Quick stats and metrics

#### 💰 Asset Management

- **Categories**: Real Estate, Financial Accounts, Insurance, Business Interests, Personal Property
- **Ownership Types**: Individual, Joint, Trust, Business Entity
- **Features**:
  - Create, read, update, delete operations
  - Asset valuation tracking
  - Ownership percentage management
  - Detailed metadata for each asset type

#### 🏛️ Trust Management

- Revocable and irrevocable trust tracking
- Trustee and beneficiary management
- Asset-to-trust mapping
- Distribution planning

#### 👨‍👩‍👧‍👦 Family & Contacts

- Family member profiles
- Legal role assignments (Executor, Trustee, POA)
- Professional advisor directory
- Emergency contact information

#### 📊 Financial Overview

- Net worth calculations
- Estate tax projections
- Cash flow analysis
- Liquidity ratios
- Asset allocation breakdowns

## 🛠️ Technical Stack

### Frontend

- **Framework**: [Remix](https://remix.run/) v2.16.8 with Vite
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React

### Backend

- **Database**: SQLite with better-sqlite3
- **Validation**: Zod schemas
- **Type Safety**: Full TypeScript coverage

### Architecture

- **Data Access Layer (DAL)**: Type-safe database queries
- **CRUD Operations**: Comprehensive create, read, update, delete functionality
- **Soft Deletes**: Data integrity with `is_active` flags
- **Audit Trail**: Built-in `created_at` and `updated_at` timestamps

## 📁 Project Structure

```text
estateease-remix/
├── app/
│   ├── components/         # Reusable UI components
│   │   ├── forms/         # Form components
│   │   ├── layout/        # Layout components
│   │   └── ui/           # UI primitives
│   ├── constants/         # Application constants and enums
│   ├── lib/              # Core libraries
│   │   ├── database.ts   # Database connection
│   │   ├── dal.ts        # Data access layer
│   │   └── dal-crud.ts   # CRUD operations
│   ├── routes/           # Remix routes
│   └── utils/            # Utility functions
├── db/
│   ├── schema.sql        # Database schema
│   └── data-migrations/  # Initial data
├── public/               # Static assets
└── tests/               # Test files
```

## 💾 Database Schema

The application uses a normalized SQLite database with 15+ tables:

### Core Tables

- **users**: Multi-tenant user management
- **assets**: Comprehensive asset tracking
- **trusts**: Trust administration
- **family_members**: Family relationships
- **professionals**: Advisor management

### Features

- Foreign key constraints for data integrity
- Indexes for query performance
- Soft delete pattern for data recovery
- Audit fields on all tables

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Database
npm run db:init      # Initialize/reset database
npm run db:migrate   # Run migrations

# Code Quality
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript compiler
npm run test         # Run tests (when implemented)
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=./data/estateease.db

# Session
SESSION_SECRET=your-secret-here

# Environment
NODE_ENV=development
```

## 📈 Roadmap

### Phase 1: Core Features ✅

- [x] Database integration
- [x] Asset CRUD operations
- [x] Trust management
- [x] Family directory
- [x] Financial calculations

### Phase 2: Enhanced Forms 🚧

- [ ] Multi-step trust creation
- [ ] Dynamic beneficiary management
- [ ] Document upload integration
- [ ] Advanced search and filtering

### Phase 3: Advanced Features 📋

- [ ] Authentication system
- [ ] Document management
- [ ] PDF report generation
- [ ] Email notifications
- [ ] Data import/export

### Phase 4: Production Ready 🎯

- [ ] Security hardening
- [ ] Performance optimization
- [ ] Backup automation
- [ ] Deployment guides

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

- TypeScript strict mode enabled
- ESLint configuration enforced
- Prettier for code formatting
- Comprehensive type coverage
- Tests for new features

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Remix](https://remix.run/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Icons by [Lucide](https://lucide.dev/)
- Charts by [Recharts](https://recharts.org/)

## 📞 Support

For support, please open an issue in the GitHub repository or contact the maintainers.

---

**Note**: This is a demo application. For production use with real financial data, ensure proper security measures, encryption, and compliance with relevant regulations.
