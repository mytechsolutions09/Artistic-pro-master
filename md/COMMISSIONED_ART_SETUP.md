# Commissioned Art Management System

## Overview
The Commissioned Art Management System allows you to track and manage custom art commission requests from customers through a dedicated admin interface.

## Features

### Customer Management
- Track customer information (name, email, phone)
- Link commissions to user accounts
- View customer commission history

### Commission Details
- **Art Types**: Painting, Digital, Sculpture, Mixed Media, Illustration, Custom
- **Specifications**: Dimensions, medium, reference images
- **Budget Tracking**: Min/max budget, quoted price, final price
- **Payment Status**: Pending, Deposit Paid, Partially Paid, Fully Paid, Refunded

### Status Workflow
1. **Inquiry** - Initial customer request
2. **Quoted** - Price quote sent to customer
3. **Accepted** - Customer accepted the quote
4. **In Progress** - Artist working on commission
5. **Review** - Awaiting customer feedback
6. **Completed** - Commission finished
7. **Delivered** - Delivered to customer
8. **Cancelled** - Cancelled by either party

### Priority Levels
- **Low** - No rush
- **Normal** - Standard timeline
- **High** - Expedited
- **Urgent** - Rush order

## Installation

### Step 1: Database Setup

Run the SQL script in Supabase SQL Editor:

```bash
# Navigate to your Supabase project
# Go to SQL Editor
# Copy and paste the contents of database/commissioned_art_setup.sql
# Run the script
```

Or use the command line:

```bash
# If you have Supabase CLI installed
supabase db push
```

### Step 2: Verify Installation

1. Navigate to admin panel: `http://localhost:5173/admin`
2. Click on "Commissioned Art" in the sidebar
3. You should see sample data loaded

## Usage

### Creating a New Commission

1. Click "New Commission" button
2. Fill in the required fields:
   - Customer Name *
   - Customer Email *
   - Commission Title *
3. Optional fields:
   - Customer phone
   - Description
   - Art type, dimensions, medium
   - Budget range
   - Delivery dates
   - Notes

### Managing Commissions

#### View Modes
- **List View**: Detailed table with all information
- **Grid View**: Card-based layout for quick overview

#### Filters
- Filter by status (Inquiry, Quoted, In Progress, etc.)
- Filter by priority (Low, Normal, High, Urgent)
- Search by customer name, email, or title
- Sort by date, customer, delivery date, or price

#### Actions
- **Edit**: Update commission details
- **Delete**: Remove commission (with confirmation)
- **Update Status**: Change commission status
- **Track Progress**: Update percentage completion

### Dashboard Statistics

The admin page displays:
- Total commissions
- Count by status
- Count by priority
- Total revenue from completed commissions

## API Integration

### Service Methods

```typescript
// Get all commissions
const commissions = await commissionedArtService.getAllCommissions();

// Get single commission
const commission = await commissionedArtService.getCommissionById(id);

// Get by customer email
const customerCommissions = await commissionedArtService.getCommissionsByCustomer(email);

// Get by status
const activeCommissions = await commissionedArtService.getCommissionsByStatus('in_progress');

// Create new commission
const newCommission = await commissionedArtService.createCommission({
  customer_name: 'John Doe',
  customer_email: 'john@example.com',
  title: 'Custom Portrait',
  art_type: 'painting',
  status: 'inquiry',
  priority: 'normal'
});

// Update commission
await commissionedArtService.updateCommission(id, {
  status: 'in_progress',
  progress: 50
});

// Delete commission
await commissionedArtService.deleteCommission(id);

// Get statistics
const stats = await commissionedArtService.getStats();
```

## Database Schema

### Table: `commissioned_art`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| customer_name | VARCHAR(255) | Customer full name |
| customer_email | VARCHAR(255) | Customer email |
| customer_phone | VARCHAR(20) | Customer phone |
| customer_id | UUID | Link to auth.users |
| title | VARCHAR(255) | Commission title |
| description | TEXT | Detailed description |
| art_type | VARCHAR(50) | Type of art |
| dimensions | VARCHAR(100) | Artwork dimensions |
| medium | VARCHAR(100) | Art medium |
| reference_images | TEXT[] | Array of image URLs |
| budget_min | DECIMAL(10,2) | Minimum budget |
| budget_max | DECIMAL(10,2) | Maximum budget |
| quoted_price | DECIMAL(10,2) | Quoted price |
| final_price | DECIMAL(10,2) | Final agreed price |
| deposit_paid | DECIMAL(10,2) | Deposit amount paid |
| status | VARCHAR(20) | Commission status |
| priority | VARCHAR(20) | Priority level |
| requested_delivery_date | DATE | Customer requested date |
| estimated_completion_date | DATE | Estimated completion |
| actual_completion_date | DATE | Actual completion |
| progress | INTEGER | Progress percentage (0-100) |
| work_in_progress_images | TEXT[] | WIP images |
| final_artwork_images | TEXT[] | Final artwork images |
| notes | TEXT | Customer notes |
| admin_notes | TEXT | Internal admin notes |
| revision_count | INTEGER | Number of revisions |
| revision_limit | INTEGER | Max revisions allowed |
| payment_method | VARCHAR(50) | Payment method |
| payment_status | VARCHAR(20) | Payment status |
| razorpay_order_id | VARCHAR(255) | Razorpay order ID |
| razorpay_payment_id | VARCHAR(255) | Razorpay payment ID |
| tags | JSONB | Custom tags |
| featured | BOOLEAN | Featured commission |
| is_archived | BOOLEAN | Archive status |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |
| created_by | UUID | Creator user ID |
| updated_by | UUID | Last updater user ID |

## Security (RLS Policies)

The system implements Row Level Security (RLS):

1. **Admin Access**: Full CRUD access for admin users
2. **User Read**: Users can view their own commissions
3. **User Create**: Users can create new commission requests
4. **User Update**: Users can update their pending commissions

## Future Enhancements

### Planned Features
- [ ] Image upload for reference and WIP images
- [ ] Email notifications for status changes
- [ ] Customer-facing commission tracking page
- [ ] Payment integration for deposits
- [ ] Automated invoice generation
- [ ] Commission timeline/calendar view
- [ ] Artist assignment system
- [ ] Revision request workflow
- [ ] File attachment support
- [ ] Commission templates
- [ ] Bulk actions

### Integration Ideas
- Connect with existing product management
- Link to payment gateway for deposits
- Email templates for status updates
- Customer portal for commission tracking
- Gallery showcase for completed commissions

## Troubleshooting

### Common Issues

**Issue**: Commission not saving
- **Solution**: Check Supabase connection and RLS policies

**Issue**: Stats not loading
- **Solution**: Ensure database has data and service is properly imported

**Issue**: Cannot delete commission
- **Solution**: Verify admin permissions and check for foreign key constraints

**Issue**: Date fields not working
- **Solution**: Ensure date format is YYYY-MM-DD

## Support

For issues or questions:
1. Check the console for error messages
2. Verify database connection
3. Review RLS policies in Supabase
4. Check service layer implementation

## License

This feature is part of the Lurevi e-commerce platform.

