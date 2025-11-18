# Hustle Village - Project Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Current Features](#current-features)
3. [Database Schema](#database-schema)
4. [Frontend Structure](#frontend-structure)
5. [What's Working](#whats-working)
6. [Known Issues](#known-issues)
7. [Next Steps](#next-steps)

---

## 🎯 Project Overview

**Hustle Village** is a student marketplace platform where students can:
- **Buyers**: Find and book services from other students
- **Sellers**: List and offer services to other students
- **Both**: Users can be both buyers and sellers

The platform is built with:
- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth

---

## ✨ Current Features

### 1. **Authentication & User Management**
- ✅ User signup with role selection (buyer, seller, both)
- ✅ Email verification flow
- ✅ Login/Logout functionality
- ✅ User profile management
- ✅ Role-based access control

### 2. **Homepage (Landing Page)**
- ✅ Hero section with dynamic student count
- ✅ Dynamic category counts (tutoring, tech_dev)
- ✅ Student initials in avatar circles
- ✅ Category grid with tabs (fetched from database)
- ✅ Featured services section (verified services)
- ✅ Testimonials section (reviews from database)
- ✅ How It Works section
- ✅ Trust badges
- ✅ Footer

### 3. **Services**
- ✅ Browse all services with filtering
- ✅ Service detail page with:
  - Service information
  - Seller profile link
  - Reviews display
  - Related services
  - Similar services
- ✅ Category-based filtering
- ✅ Search functionality

### 4. **Seller Dashboard** (`/seller/*` or `/my-services`)
- ✅ **Dashboard** (`/seller/dashboard`):
  - Real-time stats (active services, bookings, earnings)
  - Recent bookings display
  - Upcoming bookings
  - Monthly earnings calculation

- ✅ **My Services** (`/seller/services` or `/my-services`):
  - View all seller's services
  - Create new services
  - Edit existing services
  - Toggle service status (active/paused)
  - Service management table

- ✅ **Bookings** (`/seller/bookings`):
  - View all bookings for seller's services
  - Filter by status (All, New, In Progress, Completed)
  - Booking details with buyer info
  - Service and amount display

- ✅ **Payments** (`/seller/payments`):
  - Available to withdraw (completed bookings)
  - Funds in escrow (pending/in-progress bookings)
  - Monthly earnings
  - Earnings history
  - Escrow items list

- ✅ **Profile** (`/seller/profile`):
  - View and edit profile information
  - Update first name, last name, phone
  - Email verification badge

### 5. **Categories**
- ✅ Dynamic category system
- ✅ Categories fetched from database
- ✅ Category icons (Lucide icons)
- ✅ Category tabs on homepage
- ✅ Category filtering on services page

### 6. **Reviews & Testimonials**
- ✅ Reviews table in database
- ✅ Reviews displayed on:
  - Service detail pages
  - Seller profile pages
  - Homepage testimonials section
- ✅ Review ratings (1-5 stars)
- ✅ Review text display
- ✅ Reviewer information

### 7. **Navigation**
- ✅ Responsive navbar
- ✅ User menu dropdown
- ✅ Role-based navigation items
- ✅ Protected routes

---

## 🗄️ Database Schema

### Tables

#### `profiles`
- `id` (UUID, Primary Key, references auth.users)
- `first_name` (text, nullable)
- `last_name` (text, nullable)
- `phone` (text, nullable)
- `role` (text: 'buyer', 'seller', 'both')
- `profile_pic` (text, nullable)
- `created_at` (timestamp)

#### `categories`
- `id` (UUID, Primary Key)
- `slug` (text, unique)
- `name` (text)
- `description` (text, nullable)
- `icon_name` (text, nullable)
- `display_order` (integer)
- `is_active` (boolean)

#### `services`
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → profiles.id)
- `title` (text)
- `description` (text)
- `category` (text, Foreign Key → categories.slug)
- `default_price` (numeric, nullable)
- `express_price` (numeric, nullable)
- `default_delivery_time` (text, nullable)
- `express_delivery_time` (text, nullable)
- `portfolio` (text, nullable)
- `is_active` (boolean, nullable)
- `is_verified` (boolean, nullable)
- `created_at` (timestamp)

#### `bookings`
- `id` (UUID, Primary Key)
- `buyer_id` (UUID, Foreign Key → profiles.id)
- `service_id` (UUID, Foreign Key → services.id)
- `date` (date)
- `time` (time)
- `status` (text: 'pending', 'accepted', 'in_progress', 'completed')
- `created_at` (timestamp)

#### `reviews`
- `id` (UUID, Primary Key)
- `reviewer_id` (UUID, Foreign Key → profiles.id)
- `reviewee_id` (UUID, Foreign Key → profiles.id)
- `service_id` (UUID, Foreign Key → services.id, nullable)
- `rating` (integer, 1-5)
- `review_text` (text, nullable)
- `created_at` (timestamp)

---

## 📁 Frontend Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── dashboard/          # Dashboard components
│   │   │   ├── DashboardHeader.tsx
│   │   │   ├── SellerSidebar.tsx
│   │   │   └── StatCard.tsx
│   │   ├── landing/             # Landing page components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── CategoryGrid.tsx
│   │   │   ├── FeaturedServices.tsx
│   │   │   ├── Testimonials.tsx
│   │   │   ├── HowItWorks.tsx
│   │   │   ├── TrustBadges.tsx
│   │   │   └── Footer.tsx
│   │   ├── services/           # Service-related components
│   │   │   └── ServiceCard.tsx
│   │   └── ui/                  # shadcn/ui components
│   ├── contexts/
│   │   └── AuthContext.tsx      # Authentication context
│   ├── hooks/
│   │   ├── useCategories.ts     # Categories hook
│   │   └── useUserType.ts       # User type hook
│   ├── integrations/
│   │   └── supabase/
│   │       └── client.ts        # Supabase client
│   ├── layouts/
│   │   └── SellerDashboardLayout.tsx
│   ├── lib/
│   │   └── api.ts               # API client
│   ├── pages/
│   │   ├── Index.tsx            # Homepage
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   ├── Services.tsx         # Browse services
│   │   ├── ServiceDetail.tsx    # Service detail page
│   │   ├── SellerProfile.tsx    # Public seller profile
│   │   ├── ListService.tsx      # Create service (public)
│   │   └── seller/              # Seller dashboard pages
│   │       ├── SellerDashboard.tsx
│   │       ├── SellerServices.tsx
│   │       ├── SellerBookings.tsx
│   │       ├── SellerPayments.tsx
│   │       └── SellerProfile.tsx
│   └── App.tsx                  # Main app with routes
```

---

## ✅ What's Working

### Fully Functional Features:

1. **User Authentication**
   - ✅ Signup with role selection
   - ✅ Email verification
   - ✅ Login/Logout
   - ✅ Session management

2. **Service Management**
   - ✅ Create services
   - ✅ Edit services
   - ✅ View services
   - ✅ Toggle service status
   - ✅ Category assignment

3. **Service Discovery**
   - ✅ Browse all services
   - ✅ Filter by category
   - ✅ Search services
   - ✅ View service details
   - ✅ View seller profiles

4. **Seller Dashboard**
   - ✅ Real-time statistics
   - ✅ Booking management
   - ✅ Payment tracking
   - ✅ Profile management

5. **Reviews System**
   - ✅ Display reviews
   - ✅ Show ratings
   - ✅ Reviewer information

6. **Dynamic Content**
   - ✅ Categories from database
   - ✅ Services from database
   - ✅ Reviews from database
   - ✅ User profiles from database

---

## ⚠️ Known Issues

1. **Booking Functionality**
   - ⚠️ Booking creation UI exists but may need backend integration
   - ⚠️ Booking status updates need seller actions

2. **Payment System**
   - ⚠️ Withdrawal functionality is disabled (UI exists)
   - ⚠️ Escrow system is calculated but not fully implemented
   - ⚠️ Payment processing not integrated

3. **Profile Features**
   - ⚠️ Bio field exists but not in database schema yet
   - ⚠️ Profile picture upload not implemented

4. **Service Images**
   - ⚠️ Service images not implemented (using placeholders)
   - ⚠️ Image upload functionality missing

5. **Messaging**
   - ⚠️ "Message Seller" button exists but not functional

6. **Email Verification**
   - ⚠️ Email verification flow exists but may need SMTP configuration

---

## 🚀 Next Steps

### Priority 1: Core Functionality

#### 1. **Booking System**
- [ ] Implement booking creation from service detail page
- [ ] Add booking acceptance/rejection for sellers
- [ ] Implement booking status updates (in_progress → completed)
- [ ] Add booking cancellation functionality
- [ ] Create booking detail page

#### 2. **Payment Integration**
- [ ] Integrate payment gateway (e.g., Stripe, Paystack)
- [ ] Implement escrow system
- [ ] Add withdrawal functionality
- [ ] Create payment history with real transactions
- [ ] Add payment status tracking

#### 3. **Service Images**
- [ ] Add image upload functionality
- [ ] Implement image storage (Supabase Storage)
- [ ] Update service creation/edit forms with image upload
- [ ] Display images on service cards and detail pages
- [ ] Add image gallery for services

### Priority 2: Enhanced Features

#### 4. **Messaging System**
- [ ] Create messaging/chat system
- [ ] Add real-time messaging (Supabase Realtime)
- [ ] Implement message notifications
- [ ] Add message history

#### 5. **Profile Enhancements**
- [ ] Add bio field to profiles table
- [ ] Implement profile picture upload
- [ ] Add portfolio/gallery section
- [ ] Add social media links
- [ ] Add verification badges

#### 6. **Reviews & Ratings**
- [ ] Implement review creation form
- [ ] Add review submission after completed bookings
- [ ] Add review editing/deletion
- [ ] Implement review moderation
- [ ] Add review helpfulness voting

### Priority 3: User Experience

#### 7. **Search & Filtering**
- [ ] Enhance search with filters (price range, rating, location)
- [ ] Add sorting options (price, rating, newest)
- [ ] Implement saved searches
- [ ] Add search suggestions

#### 8. **Notifications**
- [ ] Implement notification system
- [ ] Add email notifications
- [ ] Add in-app notifications
- [ ] Add notification preferences

#### 9. **Mobile Optimization**
- [ ] Optimize for mobile devices
- [ ] Add mobile-specific features
- [ ] Implement responsive design improvements
- [ ] Add mobile app (optional)

### Priority 4: Business Features

#### 10. **Analytics & Reporting**
- [ ] Add seller analytics dashboard
- [ ] Implement sales reports
- [ ] Add booking trends
- [ ] Create admin dashboard

#### 11. **Admin Panel**
- [ ] Create admin authentication
- [ ] Add service verification system
- [ ] Implement user management
- [ ] Add category management
- [ ] Add dispute resolution

#### 12. **Marketing Features**
- [ ] Add service promotion system
- [ ] Implement featured listings
- [ ] Add discount/coupon system
- [ ] Create referral program

### Priority 5: Technical Improvements

#### 13. **Performance**
- [ ] Implement caching strategy
- [ ] Optimize database queries
- [ ] Add pagination for large lists
- [ ] Implement lazy loading

#### 14. **Security**
- [ ] Add rate limiting
- [ ] Implement CSRF protection
- [ ] Add input validation
- [ ] Implement file upload security

#### 15. **Testing**
- [ ] Add unit tests
- [ ] Add integration tests
- [ ] Add E2E tests
- [ ] Set up CI/CD pipeline

---

## 📝 Development Notes

### Environment Variables Required

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Setup

1. Run migrations to create tables
2. Set up Row Level Security (RLS) policies
3. Create indexes for performance
4. Set up foreign key constraints

### Role System

- **buyer**: Can book services, leave reviews
- **seller**: Can create services, manage bookings
- **both**: Can do both buyer and seller actions

### Important Files

- `frontend/src/integrations/supabase/client.ts` - Supabase configuration
- `frontend/src/contexts/AuthContext.tsx` - Authentication logic
- `frontend/src/hooks/useCategories.ts` - Categories hook
- `frontend/src/App.tsx` - Routing configuration

---

## 🔗 Useful Links

- Supabase Dashboard: [https://supabase.com/dashboard](https://supabase.com/dashboard)
- React Router Docs: [https://reactrouter.com](https://reactrouter.com)
- shadcn/ui: [https://ui.shadcn.com](https://ui.shadcn.com)

---

## 📞 Support

For issues or questions, please refer to the codebase or contact the development team.

---

**Last Updated**: December 2024
**Version**: 1.0.0

