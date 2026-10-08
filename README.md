# Financial Readiness Check™
### by Michael Angelo Somosa

A modern, AI-ready web application designed to generate high-quality insurance leads through financial readiness assessment.

## 🎯 Overview

This application helps Filipino families assess their financial preparedness through an interactive 60-second assessment, providing personalized recommendations and facilitating appointment bookings with a licensed financial advisor.

## ✨ Features

### Public-Facing Features
- **Premium Landing Page** - Golden Trident branded with professional design
- **8-Step Financial Assessment** - Comprehensive financial readiness evaluation
- **Rule-Based Scoring Engine** - Calculates Financial Readiness Score (0-100)
- **Personalized Results** - Instant feedback with strengths and improvement areas
- **Lead Capture** - Collects contact information before showing full report
- **Appointment Booking** - Simple scheduling for free consultation

### Admin Features
- **Dashboard** - Overview of leads, appointments, and key metrics
- **Lead Management** - View, filter, and manage all leads
- **Lead Details** - Complete assessment view with contact info
- **Notes System** - Add internal notes to leads
- **Status Tracking** - Track lead progression through sales funnel

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: TailwindCSS + shadcn/ui
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts (ready for future use)
- **Animations**: Framer Motion

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Supabase account (free tier works)

### 1. Environment Setup

Your `.env` file is already configured with:
```
NEXT_PUBLIC_SUPABASE_URL=https://wfnjlichwncplxghtpin.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_AquKAVINO3DsMzFmSFH7UA_8OiYPNc2
```

### 2. Database Setup

1. Go to your Supabase project: https://app.supabase.com/
2. Navigate to **SQL Editor**
3. Copy the contents of `/app/lib/supabase/schema.sql`
4. Paste and run the SQL script
5. This will create all necessary tables and RLS policies

### 3. Create Admin User

**Step 1: Create Auth User**
1. In Supabase dashboard, go to **Authentication** → **Users**
2. Click **Add User** → **Create new user**
3. Enter your email and password
4. Click **Create user**
5. Copy the User UUID (you'll need this)

**Step 2: Register as Admin**
1. Go to **SQL Editor** in Supabase
2. Run this command (replace with your actual user ID and email):
```sql
INSERT INTO public.admin_users (user_id, email, full_name)
VALUES ('<your-user-uuid>', 'your-email@example.com', 'Your Name');
```

### 4. Install Dependencies

The dependencies are already installed, but if needed:
```bash
cd /app
yarn install
```

### 5. Start the Application

The application is already running at:
- **Public Site**: https://financial-check-mail.preview.emergentagent.com
- **Admin Login**: https://financial-check-mail.preview.emergentagent.com/admin/login

## 📊 Database Schema

### Tables Created

1. **leads** - Stores lead contact information and scores
2. **assessment_responses** - Stores detailed assessment data
3. **appointments** - Stores appointment requests
4. **admin_users** - Links Supabase auth users to admin access
5. **notes** - Stores admin notes on leads

### Row Level Security (RLS)

- **Public Access**: Anyone can submit assessments (create leads/assessments/appointments)
- **Admin Access**: Only registered admins can view/manage all data
- Policies automatically enforce admin-only access on sensitive operations

## 🎨 Design System

### Branding
- **Product Brand**: Financial Readiness Check™
- **Personal Brand**: by Michael Angelo Somosa
- Independent financial wellness platform aesthetic

### Color Palette
- **Primary Gold**: #D4AF37
- **Dark Navy**: #0A2342
- **Emerald Green**: #059669 (success/positive indicators)
- **Red**: #EF4444 (alerts/low scores)

### Branding
- Premium, trustworthy design
- Mobile-first responsive
- Apple/Stripe-inspired aesthetics
- **Product**: Financial Readiness Check™
- **Advisor**: Michael Angelo Somosa

## 📱 Key Pages

### Public Pages
- `/` - Landing page
- `/assessment` - 8-step assessment form
- `/lead-capture` - Contact information form
- `/results` - Personalized results with score
- `/book-appointment` - Appointment booking
- `/appointment-confirmed` - Confirmation page

### Admin Pages
- `/admin/login` - Admin authentication
- `/admin/dashboard` - Overview dashboard
- `/admin/leads` - Lead listing with filters
- `/admin/leads/[id]` - Detailed lead view

## 🔒 Security Features

- Supabase Row Level Security (RLS) enabled
- Admin-only access to sensitive data
- Anonymous users can only create assessments
- Cookie-based authentication
- Environment variables for sensitive keys

## 📈 Financial Readiness Scoring

The rule-based scoring engine evaluates:

1. **Income Stability** (15%) - Income-to-expense ratio
2. **Emergency Fund** (20%) - Months of expenses covered
3. **Insurance Coverage** (25%) - Life, health, critical illness, etc.
4. **Debt Management** (20%) - Debt-to-income ratio
5. **Savings & Investments** (10%) - Savings ratio and investment activity
6. **Financial Planning** (10%) - Number of defined goals

**Score Interpretation:**
- 80-100: Excellent (Well protected)
- 60-79: Good (Some gaps)
- 40-59: Fair (Needs improvement)
- 0-39: Needs Attention (Critical gaps)

**Buying Intent Calculation:**
- Based on score + protection gaps + income + goals
- Ranges: Very High, High, Medium, Low

## 🔮 Future Enhancements (Ready for)

The architecture supports easy addition of:

- ✅ **OpenAI Integration** - AI-powered analysis (placeholder functions ready)
- ✅ **Facebook Pixel** - Campaign tracking
- ✅ **Meta Conversion API** - Enhanced tracking
- ✅ **Google Analytics** - Traffic analytics
- ✅ **Advanced Charts** - Recharts already installed
- ✅ **Email Notifications** - Lead notification system
- ✅ **SMS Integration** - Twilio for SMS
- ✅ **Document Upload** - File storage for client documents
- ✅ **Client Portal** - Self-service dashboard
- ✅ **Referral System** - Referral tracking and rewards

## 🧪 Testing

### Test the Public Flow
1. Visit the landing page
2. Click "Start Free Assessment"
3. Complete the 8-step form
4. Enter contact information
5. View results
6. Book an appointment

### Test the Admin Flow
1. Go to `/admin/login`
2. Enter your admin credentials
3. View dashboard stats
4. Navigate to leads
5. Click on a lead to see details
6. Add notes
7. Change lead status

## 📝 API Endpoints

### Public Endpoints
- `POST /api/submit-assessment` - Submit assessment and create lead
- `POST /api/book-appointment` - Book appointment
- `GET /api/results?leadId={id}` - Get assessment results

### Admin Endpoints (Authenticated)
- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/leads` - List all leads
- `GET /api/admin/lead?id={id}` - Get lead details
- `PUT /api/admin/lead/status` - Update lead status
- `POST /api/admin/notes` - Add note to lead

## 🐛 Troubleshooting

### Database Connection Issues
- Verify Supabase credentials in `.env`
- Check RLS policies are enabled
- Ensure admin user is registered in `admin_users` table

### Admin Login Fails
- Confirm user exists in Supabase Auth
- Verify user is registered in `admin_users` table
- Check that `active = true` for the admin user

### Assessment Not Submitting
- Check browser console for errors
- Verify Supabase connection
- Ensure RLS policies allow anonymous inserts

## 📞 Support

For questions or issues, contact Michael Angelo Somosa at Sun Life Financial.

## 📄 License

Proprietary - Golden Trident Financial Readiness System™

---

**Built with ❤️ for Filipino families by Michael Angelo Somosa**
