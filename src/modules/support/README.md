# Support Module

Provides comprehensive support ticket management and FAQ functionality for the application.

## Features

- **Support Tickets**: Allow users to submit support requests and track their status
- **FAQ Management**: Admins can create and maintain frequently asked questions
- **Search**: Users can search through FAQs to find answers before submitting tickets
- **Status Tracking**: Tickets can be in states: open, in_progress, resolved, closed

## Usage

### Creating a Support Ticket

```typescript
import { SupportService } from '@/modules/support';

const ticket = await SupportService.createTicket(userId, {
  subject: 'Help with billing',
  message: 'I have a question about my invoice...',
});
```

### Responding to a Ticket (Admin)

```typescript
import { SupportService } from '@/modules/support';

const updatedTicket = await SupportService.updateTicket(ticketId, {
  response: 'Thank you for contacting us...',
  status: 'resolved',
});
```

### Managing FAQs

```typescript
import { SupportService } from '@/modules/support';

// Create a new FAQ entry
const faq = await SupportService.createFAQ({
  question: 'How do I reset my password?',
  answer: 'Click on "Forgot Password" on the login page...',
  category: 'Account',
  orderIndex: 1,
}, adminUserId);

// Search FAQs
const results = await SupportService.searchFAQs('password reset');
```

## Database Schema

### support_tickets

- `id`: UUID (primary key)
- `user_id`: UUID (references auth.users)
- `subject`: TEXT
- `message`: TEXT
- `status`: TEXT (open, in_progress, resolved, closed)
- `response`: TEXT (nullable)
- `responded_at`: TIMESTAMP (nullable)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

### faq_entries

- `id`: UUID (primary key)
- `question`: TEXT
- `answer`: TEXT
- `category`: TEXT
- `order_index`: INTEGER
- `created_by`: UUID (references auth.users, nullable)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

## API

See `types.ts` for complete type definitions and `service.ts` for available methods.
