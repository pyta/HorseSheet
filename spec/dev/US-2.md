# US-2: Admin panel

## Functional Requirements

### US-2.1: FE services

**Priority**: High  
**Description**: FE part need a services to use a BE API. For all BE controllers we need to have a services to handle CRUD operation (and more if defined).

**API Details**:
- **Base URL**: `/api` (configured via environment variable `VITE_API_BASE_URL`)
- **API Documentation**: Available at `/api/docs` (Swagger UI)
- **Authentication**: Bearer token architecture ready (not enforced in MVP, but should be prepared)
- **All endpoints follow RESTful pattern**: `POST /api/{resource}`, `GET /api/{resource}`, `GET /api/{resource}/:id`, `PATCH /api/{resource}/:id`, `DELETE /api/{resource}/:id`

**Entities requiring services** (13 main entities):
1. **Stables** (`/api/stables`)
2. **Services** (`/api/services`)
3. **Contact Persons** (`/api/contact-persons`)
4. **Participants** (`/api/participants`)
5. **Instructors** (`/api/instructors`)
6. **Activities** (`/api/activities`)
7. **Service Schedule Entries** (`/api/service-schedule-entries`)
8. **Activity Schedule Entries** (`/api/activity-schedule-entries`)
9. **Service Price Lists** (`/api/service-price-lists`)
10. **Activity Price Lists** (`/api/activity-price-lists`)
11. **Individual Service Price Lists** (`/api/individual-service-price-lists`)
12. **Individual Activity Price Lists** (`/api/individual-activity-price-lists`)
13. **Payments** (`/api/payments`)

**DTOs/Type Definitions**: 
- All DTO structures are available in Swagger documentation at `/api/docs`
- DTOs follow pattern: `Create{Entity}Dto` and `Update{Entity}Dto`
- Update DTOs extend `PartialType(CreateDto)` and include optional `version` field for optimistic locking
- All entities extend `BaseEntity` with: `id`, `createdAt`, `updatedAt`, `deletedAt`, `version`

**Acceptance Criteria**:

- [ ] All 13 entity services are implemented in the FE.
- [ ] The HTTP client (Axios) is defined and setup correctly.
- [ ] API base URL is configured via environment variable.
- [ ] Request interceptor is prepared for Bearer token (even if not used in MVP).
- [ ] Response interceptor handles errors appropriately.
- [ ] Solution is aligned to the best practice in Vue ecosystem (Composition API, TypeScript).
- [ ] All service methods match BE controller endpoints (Create, Read All, Read One, Update, Delete).

### US-2.2: Aplication structure

**Priority**: High  
**Description**: The goal is to create a platform for public use (blog), and for login user (like admin panel). Now we have to focus on the admin panel, but keep in mind we gonna have a public part in the future. We need a routing architecture to handle out needs. Right now we gonna skip auth part, but admin panel will have a auth in the near future. 

**Routing Structure** (Admin Panel):
- `/admin` - Admin dashboard/overview
- `/admin/stables` - Stables list
- `/admin/stables/:id` - Stable details/edit
- `/admin/stables/new` - Create new stable
- `/admin/services` - Services list
- `/admin/services/:id` - Service details/edit
- `/admin/services/new` - Create new service
- `/admin/contact-persons` - Contact persons list
- `/admin/contact-persons/:id` - Contact person details/edit
- `/admin/contact-persons/new` - Create new contact person
- `/admin/participants` - Participants list
- `/admin/participants/:id` - Participant details/edit
- `/admin/participants/new` - Create new participant
- `/admin/instructors` - Instructors list
- `/admin/instructors/:id` - Instructor details/edit
- `/admin/instructors/new` - Create new instructor
- `/admin/activities` - Activities list
- `/admin/activities/:id` - Activity details/edit
- `/admin/activities/new` - Create new activity
- `/admin/service-schedule-entries` - Service schedule entries list
- `/admin/service-schedule-entries/:id` - Service schedule entry details/edit
- `/admin/service-schedule-entries/new` - Create new service schedule entry
- `/admin/activity-schedule-entries` - Activity schedule entries list
- `/admin/activity-schedule-entries/:id` - Activity schedule entry details/edit
- `/admin/activity-schedule-entries/new` - Create new activity schedule entry
- `/admin/service-price-lists` - Service price lists list
- `/admin/service-price-lists/:id` - Service price list details/edit
- `/admin/service-price-lists/new` - Create new service price list
- `/admin/activity-price-lists` - Activity price lists list
- `/admin/activity-price-lists/:id` - Activity price list details/edit
- `/admin/activity-price-lists/new` - Create new activity price list
- `/admin/individual-service-price-lists` - Individual service price lists list
- `/admin/individual-service-price-lists/:id` - Individual service price list details/edit
- `/admin/individual-service-price-lists/new` - Create new individual service price list
- `/admin/individual-activity-price-lists` - Individual activity price lists list
- `/admin/individual-activity-price-lists/:id` - Individual activity price list details/edit
- `/admin/individual-activity-price-lists/new` - Create new individual activity price list
- `/admin/payments` - Payments list
- `/admin/payments/:id` - Payment details/edit
- `/admin/payments/new` - Create new payment

**Acceptance Criteria**:

- [ ] Architecture is ready for admin panel & public parts (in the future).
- [ ] All routes listed above are implemented.
- [ ] Route structure follows consistent pattern (`/admin/{entity}`, `/admin/{entity}/:id`, `/admin/{entity}/new`).
- [ ] Router is configured with proper guards structure (ready for future auth implementation).
- [ ] Layout component structure supports admin panel navigation.

### US-2.3: CRUD

**Priority**: High  
**Description**: We need to create a CRUD for all entities. Each entity should have full Create, Read (list & detail), Update, and Delete operations.

**CRUD Requirements per Entity**:

**List View**:
- Display all entities in a table/list format
- Show key fields (name, status, dates, etc.)
- Include action buttons (Edit, Delete)
- Include "Create New" button
- Handle soft-deleted items (hide by default, or show with indicator)
- Support filtering/searching (optional for MVP, but architecture should support it)

**Detail/Create/Edit View**:
- Form with all required and optional fields
- Proper input types (text, email, phone, date, time, number, select, etc.)
- Handle foreign key relationships (dropdowns/selectors for: stableId, participantId, instructorId, serviceId, activityId, contactPersonId)
- Client-side validation matching BE DTO validation rules
- Display validation errors clearly
- Handle optimistic locking (include `version` field in update requests)
- Handle 409 Conflict errors (version mismatch) with user-friendly message
- Success/error notifications
- Redirect after successful create/update

**Delete Operation**:
- Confirmation dialog before deletion
- Soft delete (BE handles this, FE should refresh list)
- Success/error notifications

**Entity-Specific Considerations**:

1. **Schedule Entries** (Service & Activity):
   - Handle `participantIds` array (multi-select for participants)
   - Activity Schedule Entry: handle `time` (TIME format) and `duration` (number in minutes)
   - Service Schedule Entry: handle `duration` (string: day/month/etc.)

2. **Price Lists**:
   - Handle `price` as decimal/number with 2 decimal places
   - Handle `currency` (default: 'PLN')
   - Individual price lists: handle nullable `serviceId`/`activityId`

3. **Participants**:
   - Handle `defaultContactPersonId` (must be valid contact person from same stable)

4. **Payments**:
   - Handle `amount` and `balance` as decimal numbers
   - Handle `paymentDate` as date

**Error Handling**:
- Display user-friendly error messages
- Handle network errors gracefully
- Handle validation errors (400 Bad Request)
- Handle not found errors (404)
- Handle conflict errors (409) with retry option
- Handle server errors (500) with generic message

**Acceptance Criteria**:

- [ ] All 13 entities have complete CRUD operations implemented.
- [ ] List views display entities correctly with key information.
- [ ] Create/Edit forms handle all fields with proper input types.
- [ ] Foreign key relationships are handled with dropdowns/selectors.
- [ ] Client-side validation matches BE validation rules.
- [ ] Optimistic locking is handled (version field included in updates).
- [ ] 409 Conflict errors are handled with user-friendly messages.
- [ ] Delete operations include confirmation dialogs.
- [ ] Success/error notifications are displayed for all operations.
- [ ] Soft-deleted items are handled appropriately (hidden or marked).
- [ ] All forms redirect appropriately after successful operations.
