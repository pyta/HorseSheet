# Product Requirements Document (PRD) - HorseSheet

## 1. Product Overview

HorseSheet is a web-based application designed to help stable owners organize and manage their stable operations efficiently. The system provides a flexible platform for managing schedules, instructors, participants, activities, services, and pricing information. The MVP focuses on core functionality that enables stable owners to set up their stable, manage schedules, and organize participant information without the complexity of authentication, notifications, or advanced features.

The application is built with a microservices architecture designed for deployment on the mikr.us platform. The system architecture is designed to support future authentication integration without requiring refactoring, even though authentication is not included in the MVP scope.

Key characteristics of the system include:
- Fast and flexible user experience with minimal validation
- Support for group activities and flexible scheduling
- Soft deletion pattern to preserve historical data
- Public read-only access to stable information, activities, and services
- Role-based access control architecture (Stable Owner, Schedule Manager, Viewer) ready for future implementation
- Incremental setup flow without forced wizards

## 2. User Problem

Stable owners face significant challenges in organizing their daily operations. The fast-paced nature of stable management requires a system that can accommodate rapid changes and dynamic scheduling needs. Current solutions are often too rigid, require extensive setup, or lack the flexibility needed for stable operations.

Specific pain points include:
- Difficulty managing schedules for multiple instructors and participants simultaneously
- Lack of a centralized system to track participants, contact persons, and their relationships
- Inability to quickly create and modify schedule entries without complex validation rules
- No efficient way to view and export schedule information for planning and analysis
- Need for multiple people to create schedules in different ways (e.g., Excel files) without a unified system
- Challenge in managing pricing for various activities and services
- Requirement for flexible system that can adapt to changing stable operations

The MVP addresses these core problems by providing a simple, fast, and flexible system that allows stable owners to set up their stable incrementally, manage all core entities through CRUD operations, and create schedules efficiently without unnecessary constraints.

## 3. Functional Requirements

### 3.1 Core Entities

The system must support full CRUD operations for the following entities:

#### 3.1.1 Stable
- Create stable with name (required field)
- Update stable information (address, contact info - all optional)
- View stable details
- Delete stable (soft deletion)
- All fields except name are optional to enable flexible, incremental setup

#### 3.1.2 Instructors
- Create instructor records
- Update instructor information
- View instructor list and details
- Delete instructor (soft deletion - prevents new schedule entries but preserves historical data)
- Support for multiple instructors per stable

#### 3.1.3 Activities
- Create activity types (e.g., sports, recreation, outdoor activities, walks)
- Update activity information
- View activity list and details
- Delete activity (soft deletion - prevents new schedule entries but preserves historical data)
- Support for multiple activity types per stable

#### 3.1.4 Services
- Create service records (e.g., horse boarding)
- Update service information
- View service list and details
- Delete service (soft deletion)
- Services are independent entities, separate from schedule entries
- Support for multiple services per stable

#### 3.1.5 Participants
- Create participant records with contact information (email/phone)
- Update participant information
- View participant list and details
- Delete participant (soft deletion - prevents new schedule entries but preserves historical data)
- Each participant must have one default contact person assigned
- Support for multiple participants per stable

#### 3.1.6 Contact Persons
- Create contact person records independently
- Update contact person information
- View contact person list and details
- Delete contact person (soft deletion)
- Contact persons can be assigned to multiple participants
- Each participant has one default contact person

#### 3.1.7 Price Lists
- Create price entries for activities (global pricing per activity)
- Create price entries for services (global pricing per service)
- Update price information
- View price list
- Delete price entries (soft deletion)
- Simple per-activity and per-service base pricing model
- No packages or complex pricing structures in MVP

#### 3.1.8 Schedule Entries
- Create schedule entries with date, time, instructor, multiple participants, and one activity type
- Update schedule entries (full CRUD regardless of date - past or future)
- View schedule entries with filtering and search capabilities
- Delete schedule entries (soft deletion)
- Support for group activities (multiple participants per entry)
- Allow instructors to have multiple simultaneous activities (no double-booking validation)
- Optional service association per participant (not linked to schedule entry itself)
- Support for concurrent edits with optimistic locking (version/timestamp)

### 3.2 Schedule Management Features

#### 3.2.1 Schedule Viewing
- Display schedule in calendar or list view
- Default view shows current week
- Filter by date range (customizable)
- Filter by instructor
- Filter by participant
- Simple search bar functionality
- Visual indicators for past vs. future entries
- Essential information displayed: date, time, instructor, participants, activity
- Detailed information available via expand/click interaction

#### 3.2.2 Schedule Export
- Export schedule to CSV format
- Include date, time, instructor, participants, activity, and price in export
- Support filtering before export (date range, instructor, participant)
- Export should provide summary overview for analysis

#### 3.2.3 Bulk Operations
- Copy/duplicate schedule entries
- Adjust date/time when duplicating
- Support for multiple entry duplication

### 3.3 User Interface Requirements

#### 3.3.1 Setup Flow
- Flexible dashboard with clear "Add" buttons for each entity type
- No forced wizard - users can skip steps and return later
- Progress indicator to show setup completion status
- Incremental configuration support

#### 3.3.2 User Experience
- Fast workflow with minimal required fields
- Auto-populate defaults where possible
- Minimal validation - only required fields and existence/active status checks
- User-friendly, contextual, actionable error messages
- Technical error details logged server-side, not displayed to users

### 3.4 Public Access

The following information must be publicly accessible (read-only) without authentication:
- Stable information
- Available activities
- Available services
- Schedule view (read-only)

All CRUD operations require authentication (architecture ready, not implemented in MVP).

### 3.5 Role-Based Access Control (Architecture)

The system architecture must support three distinct roles, even though authentication is not implemented in MVP:

#### 3.5.1 Stable Owner
- Full CRUD access on all entities
- Can modify stable settings, instructors, activities, services, participants, contact persons, price lists, and schedule entries

#### 3.5.2 Schedule Manager
- CRUD access on schedule entries only
- Cannot modify stable settings, instructors, activities, services, participants, contact persons, or price lists
- Read-only access to all other entities

#### 3.5.3 Viewer
- Read-only access to all entities
- Cannot create, update, or delete any entity

### 3.6 Technical Requirements

#### 3.6.1 API Design
- RESTful API architecture
- All endpoints accept optional Bearer token (for future auth integration)
- Clear separation between public and authenticated endpoints
- Middleware pattern for future auth integration
- ISO 8601 date format for all date/time fields
- Single time zone per stable

#### 3.6.2 Data Model
- Soft deletion for all entities (mark as inactive, preserve historical data)
- Referential integrity: soft-deleted entities cannot be used in new entries, but historical entries are preserved
- Optimistic locking for concurrent edits (version/timestamp)
- Historical data preserved with inactive indicators

#### 3.6.3 Deployment
- Microservices architecture (2-3 services: API gateway, business logic, data persistence)
- Designed for deployment on mikr.us platform
- Architecture must support multiple small services

## 4. Product Boundaries

### 4.1 In Scope (MVP)

The following features are included in the MVP:
- Stable setup and configuration (incremental, flexible)
- Full CRUD operations for all core entities (Stable, Instructors, Activities, Services, Participants, Contact Persons, Price Lists, Schedule Entries)
- Schedule creation, viewing, editing, and deletion
- Schedule filtering and search
- Schedule export to CSV
- Bulk copy/duplicate operations for schedule entries
- Public read-only access to stable information, activities, services, and schedule
- Soft deletion pattern for all entities
- Architecture ready for authentication (Bearer token support, middleware pattern)
- Role-based access control architecture (not implemented, but designed)
- Flexible, fast UX with minimal validation
- Support for group activities
- Support for instructors with multiple simultaneous activities

### 4.2 Out of Scope (MVP)

The following features are explicitly excluded from the MVP:
- Authentication and login functionality (phone number or other methods)
- User registration and account management
- Notifications (email or SMS) - contact information is collected but not used
- Schedule sharing (email, calendar sync)
- Blog functionality
- Excel import functionality (post-MVP, but schema should be considered)
- Recurring schedules (duplicate/copy feature provided instead)
- Specific pricing per instructor or participant (global pricing only)
- Complex pricing packages
- Advanced validation and conflict detection
- Double-booking prevention for instructors
- Service duration/period management
- Data backup and recovery strategies (platform-dependent)
- API rate limiting (to be determined based on platform constraints)
- Performance requirements specification (to be determined)

### 4.3 Future Considerations

The following items are noted for post-MVP implementation but should be considered in the architecture:
- Authentication service integration
- Excel import with defined schema
- Notifications (email and SMS)
- Schedule sharing capabilities
- Specific pricing models
- Multi-stable support per account (schema designed for this, but MVP assumes one stable per account)
- Advanced scheduling features (recurring schedules, conflict detection)

## 5. User Stories

### 5.1 Stable Management

#### US-001: Create Stable
Description: As a stable owner, I want to create a new stable so that I can start organizing my stable operations.

Acceptance Criteria:
- I can create a stable with a name (required field)
- I can optionally add address information
- I can optionally add contact information
- The system validates that the name field is not empty
- Upon successful creation, I receive confirmation and can proceed to add other entities
- If creation fails, I receive a user-friendly error message

#### US-002: View Stable Details
Description: As any user (including public viewers), I want to view stable information so that I can see basic details about the stable.

Acceptance Criteria:
- I can view stable name
- I can view stable address (if provided)
- I can view stable contact information (if provided)
- Stable information is publicly accessible (read-only)
- The information is displayed in a clear, readable format

#### US-003: Update Stable Information
Description: As a stable owner, I want to update my stable information so that I can keep the details current.

Acceptance Criteria:
- I can update the stable name
- I can add or update address information
- I can add or update contact information
- All fields except name remain optional
- Changes are saved and immediately reflected
- If update fails, I receive a user-friendly error message

#### US-004: Delete Stable
Description: As a stable owner, I want to delete my stable so that I can remove it from the system.

Acceptance Criteria:
- I can mark the stable as deleted (soft deletion)
- The stable is marked as inactive but data is preserved
- Historical schedule entries and related data remain accessible
- The stable no longer appears in active listings
- I receive confirmation of the deletion

### 5.2 Instructor Management

#### US-005: Create Instructor
Description: As a stable owner, I want to add instructors to my stable so that I can assign them to schedule entries.

Acceptance Criteria:
- I can create an instructor record
- I can add instructor name and other relevant information
- The instructor is immediately available for selection in schedule entries
- If creation fails, I receive a user-friendly error message
- The system validates that required fields are provided

#### US-006: View Instructor List
Description: As any user, I want to view the list of instructors so that I can see who is available at the stable.

Acceptance Criteria:
- I can see a list of all active instructors
- The list displays instructor names and relevant information
- Inactive (soft-deleted) instructors are not shown in the default view
- I can view instructor details by selecting an instructor

#### US-007: Update Instructor Information
Description: As a stable owner, I want to update instructor information so that I can keep records current.

Acceptance Criteria:
- I can modify instructor name and other information
- Changes are saved and immediately reflected
- The instructor remains available for existing and new schedule entries
- If update fails, I receive a user-friendly error message

#### US-008: Delete Instructor
Description: As a stable owner, I want to remove an instructor from the system so that they are no longer available for new schedule entries.

Acceptance Criteria:
- I can mark an instructor as deleted (soft deletion)
- The instructor is marked as inactive but data is preserved
- The instructor cannot be selected for new schedule entries
- Historical schedule entries with this instructor remain visible and unchanged
- I receive confirmation of the deletion

### 5.3 Activity Management

#### US-009: Create Activity
Description: As a stable owner, I want to define activity types so that I can categorize schedule entries.

Acceptance Criteria:
- I can create activity types (e.g., sports, recreation, outdoor activities, walks)
- I can add activity name and description
- The activity is immediately available for selection in schedule entries
- If creation fails, I receive a user-friendly error message

#### US-010: View Activity List
Description: As any user (including public viewers), I want to view available activities so that I can see what types of activities the stable offers.

Acceptance Criteria:
- I can see a list of all active activities
- Activities are publicly accessible (read-only)
- The list displays activity names and descriptions
- Inactive (soft-deleted) activities are not shown in the default view

#### US-011: Update Activity Information
Description: As a stable owner, I want to update activity information so that I can keep activity details current.

Acceptance Criteria:
- I can modify activity name and description
- Changes are saved and immediately reflected
- The activity remains available for existing and new schedule entries
- If update fails, I receive a user-friendly error message

#### US-012: Delete Activity
Description: As a stable owner, I want to remove an activity type so that it is no longer available for new schedule entries.

Acceptance Criteria:
- I can mark an activity as deleted (soft deletion)
- The activity is marked as inactive but data is preserved
- The activity cannot be selected for new schedule entries
- Historical schedule entries with this activity remain visible and unchanged
- I receive confirmation of the deletion

### 5.4 Service Management

#### US-013: Create Service
Description: As a stable owner, I want to add services (e.g., horse boarding) so that I can manage service offerings separately from schedule entries.

Acceptance Criteria:
- I can create service records
- I can add service name and description
- Services are independent entities, not linked to schedule entries
- The service is immediately available in the system
- If creation fails, I receive a user-friendly error message

#### US-014: View Service List
Description: As any user (including public viewers), I want to view available services so that I can see what services the stable offers.

Acceptance Criteria:
- I can see a list of all active services
- Services are publicly accessible (read-only)
- The list displays service names and descriptions
- Inactive (soft-deleted) services are not shown in the default view

#### US-015: Update Service Information
Description: As a stable owner, I want to update service information so that I can keep service details current.

Acceptance Criteria:
- I can modify service name and description
- Changes are saved and immediately reflected
- If update fails, I receive a user-friendly error message

#### US-016: Delete Service
Description: As a stable owner, I want to remove a service so that it is no longer available.

Acceptance Criteria:
- I can mark a service as deleted (soft deletion)
- The service is marked as inactive but data is preserved
- I receive confirmation of the deletion

### 5.5 Participant Management

#### US-017: Create Participant
Description: As a stable owner, I want to add participants so that I can assign them to schedule entries.

Acceptance Criteria:
- I can create a participant record
- I can add participant name
- I can add contact information (email and/or phone)
- I must assign one default contact person to the participant
- The participant is immediately available for selection in schedule entries
- If creation fails, I receive a user-friendly error message
- The system validates that required fields are provided

#### US-018: View Participant List
Description: As any user with appropriate permissions, I want to view the list of participants so that I can see who is registered at the stable.

Acceptance Criteria:
- I can see a list of all active participants
- The list displays participant names and contact information
- I can see which contact person is assigned as default
- Inactive (soft-deleted) participants are not shown in the default view
- I can view participant details by selecting a participant

#### US-019: Update Participant Information
Description: As a stable owner, I want to update participant information so that I can keep records current.

Acceptance Criteria:
- I can modify participant name
- I can update contact information (email and/or phone)
- I can change the default contact person assignment
- Changes are saved and immediately reflected
- The participant remains available for existing and new schedule entries
- If update fails, I receive a user-friendly error message

#### US-020: Delete Participant
Description: As a stable owner, I want to remove a participant so that they are no longer available for new schedule entries.

Acceptance Criteria:
- I can mark a participant as deleted (soft deletion)
- The participant is marked as inactive but data is preserved
- The participant cannot be selected for new schedule entries
- Historical schedule entries with this participant remain visible and unchanged
- I receive confirmation of the deletion

### 5.6 Contact Person Management

#### US-021: Create Contact Person
Description: As a stable owner, I want to create contact person records so that I can manage emergency contacts and communication information.

Acceptance Criteria:
- I can create a contact person record independently (not tied to a participant)
- I can add contact person name
- I can add contact information (email and/or phone)
- The contact person is immediately available for assignment to participants
- If creation fails, I receive a user-friendly error message

#### US-022: View Contact Person List
Description: As any user with appropriate permissions, I want to view contact persons so that I can see available contacts.

Acceptance Criteria:
- I can see a list of all active contact persons
- The list displays contact person names and contact information
- I can see which participants have this contact person assigned
- Inactive (soft-deleted) contact persons are not shown in the default view
- I can view contact person details by selecting a contact person

#### US-023: Assign Contact Person to Multiple Participants
Description: As a stable owner, I want to assign the same contact person to multiple participants so that I can manage families or groups efficiently.

Acceptance Criteria:
- I can assign an existing contact person to a participant
- The same contact person can be assigned to multiple participants
- Each participant can have only one default contact person
- When assigning a contact person that is already a default for another participant, I can still assign it
- Changes are saved and immediately reflected

#### US-024: Set Default Contact Person for Participant
Description: As a stable owner, I want to set a default contact person for each participant so that the system knows the primary contact.

Acceptance Criteria:
- When creating a participant, I must assign one default contact person
- When updating a participant, I can change the default contact person
- Each participant has exactly one default contact person at all times
- The default contact person is clearly indicated in the participant record
- If I try to remove the default contact person without assigning a new one, I receive an error

#### US-025: Update Contact Person Information
Description: As a stable owner, I want to update contact person information so that I can keep contact details current.

Acceptance Criteria:
- I can modify contact person name
- I can update contact information (email and/or phone)
- Changes are saved and immediately reflected for all participants using this contact person
- If update fails, I receive a user-friendly error message

#### US-026: Delete Contact Person
Description: As a stable owner, I want to remove a contact person so that they are no longer available for assignment.

Acceptance Criteria:
- I can mark a contact person as deleted (soft deletion)
- The contact person is marked as inactive but data is preserved
- The contact person cannot be assigned to new participants
- If the contact person is a default for any participant, I receive a warning and must reassign before deletion
- Historical assignments remain visible
- I receive confirmation of the deletion

### 5.7 Price List Management

#### US-027: Create Activity Price
Description: As a stable owner, I want to set prices for activities so that I can track pricing for schedule entries.

Acceptance Criteria:
- I can create a price entry for an activity
- I can set a base price (global pricing per activity)
- The price is immediately available for use in schedule entries and exports
- If creation fails, I receive a user-friendly error message
- The system validates that the activity exists and is active

#### US-028: Create Service Price
Description: As a stable owner, I want to set prices for services so that I can track service pricing.

Acceptance Criteria:
- I can create a price entry for a service
- I can set a base price (global pricing per service)
- The price is immediately available in the system
- If creation fails, I receive a user-friendly error message
- The system validates that the service exists and is active

#### US-029: View Price List
Description: As any user with appropriate permissions, I want to view the price list so that I can see current pricing for activities and services.

Acceptance Criteria:
- I can see all activity prices
- I can see all service prices
- Prices are displayed in a clear, organized format
- Inactive prices (for deleted activities/services) are clearly marked or filtered
- I can see which activity or service each price applies to

#### US-030: Update Price
Description: As a stable owner, I want to update prices so that I can adjust pricing as needed.

Acceptance Criteria:
- I can modify the price for an activity
- I can modify the price for a service
- Changes are saved and immediately reflected
- Historical schedule entries retain their original price information
- If update fails, I receive a user-friendly error message

#### US-031: Delete Price
Description: As a stable owner, I want to remove a price entry so that it is no longer used.

Acceptance Criteria:
- I can mark a price as deleted (soft deletion)
- The price is marked as inactive but data is preserved
- The price is no longer used for new schedule entries
- Historical data retains price information
- I receive confirmation of the deletion

### 5.8 Schedule Entry Management

#### US-032: Create Schedule Entry
Description: As a stable owner or schedule manager, I want to create schedule entries so that I can organize activities and track participant schedules.

Acceptance Criteria:
- I can create a schedule entry with date and time
- I must select one instructor (from active instructors)
- I can select one or more participants (from active participants)
- I must select one activity type (from active activities)
- I can optionally associate a service with a participant (participant-specific, not entry-specific)
- The entry is saved and immediately visible in the schedule view
- Minimal validation is applied (only required fields and existence/active status checks)
- If creation fails, I receive a user-friendly error message
- The system validates that instructor, participants, and activity exist and are active

#### US-033: Create Group Activity Schedule Entry
Description: As a stable owner or schedule manager, I want to create schedule entries with multiple participants so that I can schedule group activities.

Acceptance Criteria:
- I can select multiple participants for a single schedule entry
- All participants share the same date, time, instructor, and activity type
- The entry is saved as a single schedule entry with multiple participants
- All participants are clearly displayed in the schedule view
- The entry appears once in the schedule with all participants listed

#### US-034: Create Schedule Entry with Service Association
Description: As a stable owner or schedule manager, I want to associate a service with a participant in a schedule entry so that I can track service usage.

Acceptance Criteria:
- When creating a schedule entry, I can optionally associate a service with a specific participant
- The service association is participant-specific, not entry-specific
- Multiple participants in the same entry can have different services associated
- The service association is visible in the schedule entry details
- The system validates that the service exists and is active

#### US-035: View Schedule Entries (Default View)
Description: As any user, I want to view schedule entries so that I can see what activities are scheduled.

Acceptance Criteria:
- The schedule displays entries in a calendar or list view
- The default view shows the current week
- Essential information is displayed: date, time, instructor, participants, activity
- Detailed information is available via expand/click interaction
- Past entries are visually distinguished from future entries
- The schedule is publicly viewable (read-only for non-authenticated users)

#### US-036: Filter Schedule by Date Range
Description: As any user, I want to filter schedule entries by date range so that I can view specific time periods.

Acceptance Criteria:
- I can select a custom date range for filtering
- The schedule view updates to show only entries within the selected range
- I can change the date range and see updated results
- The default view (current week) can be restored

#### US-037: Filter Schedule by Instructor
Description: As any user, I want to filter schedule entries by instructor so that I can see a specific instructor's schedule.

Acceptance Criteria:
- I can select an instructor from a filter dropdown
- The schedule view updates to show only entries for the selected instructor
- I can clear the filter to see all entries
- Multiple filters can be combined (e.g., date range and instructor)

#### US-038: Filter Schedule by Participant
Description: As any user, I want to filter schedule entries by participant so that I can see a specific participant's schedule.

Acceptance Criteria:
- I can select a participant from a filter dropdown
- The schedule view updates to show only entries that include the selected participant
- I can clear the filter to see all entries
- Multiple filters can be combined (e.g., date range and participant)

#### US-039: Search Schedule Entries
Description: As any user, I want to search schedule entries so that I can quickly find specific information.

Acceptance Criteria:
- I can use a search bar to search across schedule entries
- Search works across relevant fields (instructor name, participant names, activity name)
- Search results are displayed in the schedule view
- I can clear the search to return to the full view
- Search can be combined with other filters

#### US-040: View Schedule Entry Details
Description: As any user, I want to view detailed information about a schedule entry so that I can see all relevant details.

Acceptance Criteria:
- I can click or expand a schedule entry to see detailed information
- Details include: full date and time, instructor details, all participants, activity details, associated services (if any), price information
- The detailed view is clearly formatted and easy to read
- I can close the detailed view to return to the schedule list

#### US-041: Update Schedule Entry
Description: As a stable owner or schedule manager, I want to update schedule entries so that I can modify schedules as needed.

Acceptance Criteria:
- I can edit any schedule entry regardless of date (past or future)
- I can modify date, time, instructor, participants, activity, and service associations
- Changes are saved and immediately reflected in the schedule view
- The system validates that modified entities (instructor, participants, activity) exist and are active
- If update fails, I receive a user-friendly error message
- Optimistic locking prevents conflicting concurrent edits

#### US-042: Handle Concurrent Schedule Entry Edits
Description: As a user, I want the system to handle concurrent edits gracefully so that data integrity is maintained when multiple users edit the same entry.

Acceptance Criteria:
- When two users edit the same schedule entry simultaneously, the last write wins
- The system uses optimistic locking (version/timestamp) to detect conflicts
- If a conflict is detected, I receive a user-friendly message indicating the entry was modified by another user
- I can refresh and see the latest version before making changes
- Technical conflict details are logged server-side

#### US-043: Delete Schedule Entry
Description: As a stable owner or schedule manager, I want to delete schedule entries so that I can remove entries that are no longer needed.

Acceptance Criteria:
- I can mark a schedule entry as deleted (soft deletion)
- The entry is marked as inactive but data is preserved
- The entry no longer appears in the default schedule view
- Historical data is preserved for reporting and analysis
- I receive confirmation of the deletion

#### US-044: Allow Instructor Multiple Simultaneous Activities
Description: As a stable owner or schedule manager, I want to create schedule entries where an instructor has multiple activities at the same time so that I can support mixed group activities.

Acceptance Criteria:
- I can create multiple schedule entries with the same instructor at the same date and time
- The system does not prevent or warn about instructor double-booking
- All entries are saved and displayed normally
- This allows for flexible scheduling scenarios (e.g., instructor supervising multiple groups)

### 5.9 Schedule Export

#### US-045: Export Schedule to CSV
Description: As a stable owner or schedule manager, I want to export schedule entries to CSV so that I can analyze schedules externally or create reports.

Acceptance Criteria:
- I can export schedule entries to CSV format
- The CSV includes: date, time, instructor, participants, activity, and price
- I can apply filters (date range, instructor, participant) before exporting
- The exported CSV is properly formatted and can be opened in spreadsheet applications
- The export includes all visible entries based on current filters
- If export fails, I receive a user-friendly error message

#### US-046: Export Filtered Schedule
Description: As a stable owner or schedule manager, I want to export a filtered schedule so that I can export specific subsets of data.

Acceptance Criteria:
- I can apply filters (date range, instructor, participant) before exporting
- The export includes only entries matching the applied filters
- The CSV format is consistent regardless of filters applied
- All relevant information (date, time, instructor, participants, activity, price) is included

### 5.10 Bulk Operations

#### US-047: Duplicate Schedule Entry
Description: As a stable owner or schedule manager, I want to duplicate a schedule entry so that I can quickly create similar entries for different dates or times.

Acceptance Criteria:
- I can select a schedule entry and choose to duplicate it
- The system creates a new entry with the same instructor, participants, activity, and service associations
- I can adjust the date and/or time for the duplicated entry
- The new entry is saved and immediately visible in the schedule
- All participant and service associations are copied to the new entry

#### US-048: Copy Schedule Entry with Date Adjustment
Description: As a stable owner or schedule manager, I want to copy a schedule entry and adjust the date so that I can create recurring-like patterns without a recurring schedule feature.

Acceptance Criteria:
- I can copy a schedule entry
- I can specify a new date for the copied entry
- The time, instructor, participants, activity, and service associations are preserved
- The new entry is created and saved
- I can repeat this process to create multiple entries with date adjustments

### 5.11 Dashboard and Setup Flow

#### US-049: Access Flexible Dashboard
Description: As a stable owner, I want to access a flexible dashboard so that I can set up my stable incrementally without being forced through a wizard.

Acceptance Criteria:
- I can access a dashboard after creating a stable
- The dashboard displays clear "Add" buttons for each entity type (instructors, activities, services, participants, contact persons, prices, schedule entries)
- I can click any "Add" button to create that entity type
- I am not forced to complete setup in a specific order
- I can skip steps and return to them later

#### US-050: View Setup Progress
Description: As a stable owner, I want to see my setup progress so that I know what I've completed and what remains.

Acceptance Criteria:
- The dashboard displays a progress indicator
- The progress shows which entity types have been created (instructors, activities, services, participants, etc.)
- The progress indicator is visual and easy to understand
- The progress does not block me from using the system - it's informational only

#### US-051: Navigate to Entity Management
Description: As a stable owner, I want to navigate to entity management screens so that I can view and manage entities I've created.

Acceptance Criteria:
- From the dashboard, I can navigate to view lists of entities (instructors, activities, services, participants, contact persons, prices)
- I can view, edit, and delete entities from these management screens
- Navigation is clear and intuitive
- I can return to the dashboard easily

### 5.12 Error Handling and Validation

#### US-052: Receive User-Friendly Error Messages
Description: As a user, I want to receive clear, actionable error messages so that I can understand what went wrong and how to fix it.

Acceptance Criteria:
- When an error occurs, I receive a user-friendly, contextual error message
- Error messages are written in plain language, not technical jargon
- Error messages suggest how to resolve the issue
- Technical error details are logged server-side but not displayed to me
- Error messages appear in a consistent location and format

#### US-053: Validate Required Fields
Description: As a user, I want the system to validate required fields so that I don't submit incomplete data.

Acceptance Criteria:
- When creating or updating entities, required fields are clearly marked
- If I try to save without required fields, I receive a clear error message indicating which fields are missing
- The system prevents submission until required fields are provided
- Validation occurs before data is sent to the server (client-side) and is confirmed server-side

#### US-054: Validate Entity Existence and Active Status
Description: As a user, I want the system to ensure I'm only using active, existing entities so that data integrity is maintained.

Acceptance Criteria:
- When creating a schedule entry, I can only select active instructors, participants, and activities
- If I try to use an inactive or deleted entity, I receive an error message
- The system checks entity existence and active status before saving
- Dropdown lists and selection interfaces only show active entities

### 5.13 Public Access

#### US-055: View Public Stable Information
Description: As a public user (without authentication), I want to view stable information so that I can learn about the stable.

Acceptance Criteria:
- I can view stable name, address, and contact information without authentication
- The information is read-only (I cannot edit)
- The information is clearly displayed and easy to read
- I can access this information directly via a public URL

#### US-056: View Public Activities
Description: As a public user, I want to view available activities so that I can see what the stable offers.

Acceptance Criteria:
- I can view a list of all active activities without authentication
- I can see activity names and descriptions
- The information is read-only
- I can access this information directly via a public URL

#### US-057: View Public Services
Description: As a public user, I want to view available services so that I can see what services the stable offers.

Acceptance Criteria:
- I can view a list of all active services without authentication
- I can see service names and descriptions
- The information is read-only
- I can access this information directly via a public URL

#### US-058: View Public Schedule
Description: As a public user, I want to view the schedule so that I can see when activities are scheduled.

Acceptance Criteria:
- I can view schedule entries without authentication
- I can use filters (date range, instructor, participant) and search
- I cannot create, edit, or delete schedule entries
- The schedule view shows the same information as authenticated users (read-only)
- I can access the schedule directly via a public URL

### 5.14 API and Architecture

#### US-059: Access Public API Endpoints
Description: As a developer or system integrator, I want to access public API endpoints so that I can retrieve stable information without authentication.

Acceptance Criteria:
- Public endpoints are available without Bearer token authentication
- Public endpoints return stable information, activities, services, and schedule (read-only)
- API responses use ISO 8601 format for dates
- API responses are in a standard format (JSON)
- Public endpoints are clearly documented and separated from authenticated endpoints

#### US-060: Access Authenticated API Endpoints (Architecture)
Description: As a developer, I want the API to support Bearer token authentication so that authenticated endpoints can be secured in the future.

Acceptance Criteria:
- All API endpoints accept an optional Bearer token in the Authorization header
- When a Bearer token is provided, it is processed by middleware (even if not validated in MVP)
- The API architecture supports future authentication integration
- Authenticated endpoints are clearly separated from public endpoints
- The middleware pattern allows easy addition of authentication logic without refactoring

#### US-061: Handle Time Zone Information
Description: As a user, I want the system to handle time zones correctly so that schedule times are accurate.

Acceptance Criteria:
- Each stable has one time zone setting
- All schedule entries use the stable's time zone
- API responses use ISO 8601 format for dates and times
- Time zone information is preserved and displayed correctly

### 5.15 Data Integrity and Soft Deletion

#### US-062: Preserve Historical Data with Soft Deletion
Description: As a stable owner, I want historical data to be preserved when I delete entities so that I can maintain records and reports.

Acceptance Criteria:
- When I delete any entity (stable, instructor, activity, service, participant, contact person, price, schedule entry), it is marked as inactive (soft deletion)
- The entity data is preserved in the database
- Historical schedule entries referencing deleted entities remain visible and unchanged
- I can distinguish between active and inactive entities in the system
- Reports and exports can include historical data

#### US-063: Prevent Use of Inactive Entities
Description: As a user, I want the system to prevent using inactive entities in new entries so that data integrity is maintained.

Acceptance Criteria:
- When creating new schedule entries, I cannot select inactive (soft-deleted) instructors, participants, or activities
- When assigning contact persons to participants, I cannot select inactive contact persons
- When creating prices, I cannot select inactive activities or services
- The system validates entity active status before saving
- If I try to use an inactive entity, I receive a clear error message

#### US-064: Maintain Referential Integrity
Description: As a system administrator, I want the system to maintain referential integrity so that data relationships are consistent.

Acceptance Criteria:
- When an entity is soft-deleted, existing relationships are preserved
- Historical schedule entries maintain references to deleted entities
- New entries cannot reference inactive entities
- The system prevents orphaned records
- Data relationships are consistent and traceable

## 6. Success Metrics

### 6.1 Primary Success Criteria

#### 6.1.1 Fast and Flexible User Experience
Metric: Time to create a schedule entry
Target: Less than 30 seconds from start to completion
Measurement Method: User testing, time tracking during schedule entry creation
Success Indicator: Average time to create a schedule entry is under 30 seconds, with positive user feedback on ease of use

Metric: User feedback on system flexibility
Target: Positive feedback indicating the system accommodates fast-paced operations
Measurement Method: User interviews, feedback surveys, adoption rate
Success Indicator: Users report that the system is flexible and accommodates their dynamic workflow needs

#### 6.1.2 Understanding Stable Owner Needs
Metric: System adoption and usage
Target: Stable owners successfully set up and use the system for daily operations
Measurement Method: User interviews, usage analytics, feedback collection
Success Indicator: Stable owners adopt the system and report that it meets their operational needs

Metric: Flexibility feedback
Target: Users report the system is flexible enough for their operations
Measurement Method: User interviews, feedback surveys
Success Indicator: Positive feedback on system flexibility and ability to handle rapid changes

#### 6.1.3 Well-Defined Architecture
Metric: Architecture readiness for authentication
Target: Authentication can be added without major refactoring
Measurement Method: Code review, architecture documentation review, implementation of auth middleware test
Success Indicator: Authentication middleware can be integrated with minimal changes to existing code structure

Metric: Architecture documentation completeness
Target: Architecture is documented and supports future enhancements
Measurement Method: Documentation review, developer feedback
Success Indicator: Architecture documentation exists and clearly describes the system design

#### 6.1.4 Complete CRUD APIs
Metric: API coverage
Target: All entities have full CRUD operations implemented
Measurement Method: API coverage audit, endpoint testing
Success Indicator: 100% of required CRUD operations are implemented and functional for all entities (Stable, Instructors, Activities, Services, Participants, Contact Persons, Price Lists, Schedule Entries)

Metric: API functionality
Target: All CRUD operations work correctly
Measurement Method: Endpoint testing, integration testing
Success Indicator: All CRUD operations pass functional tests and handle errors appropriately

### 6.2 Secondary Success Criteria

#### 6.2.1 Public Accessibility
Metric: Public endpoint availability
Target: Public endpoints are accessible without authentication
Measurement Method: Public endpoint testing, access logs
Success Indicator: Public endpoints return data correctly without requiring authentication, and access logs show successful public access

Metric: Public endpoint functionality
Target: Public endpoints provide read-only access to stable information, activities, services, and schedule
Measurement Method: Functional testing of public endpoints
Success Indicator: All public endpoints function correctly and return appropriate data

#### 6.2.2 Data Integrity
Metric: Historical data preservation
Target: Soft-deleted entities preserve historical data
Measurement Method: Data retention testing, database queries
Success Indicator: Historical schedule entries and relationships are preserved when entities are soft-deleted

Metric: Referential integrity
Target: Data relationships remain consistent
Measurement Method: Referential integrity validation, database constraint testing
Success Indicator: All data relationships are maintained correctly, and inactive entities cannot be used in new entries

#### 6.2.3 Export Functionality
Metric: Export feature availability
Target: Schedule export to CSV is functional
Measurement Method: Export feature testing, CSV format validation
Success Indicator: Users can successfully export schedules to CSV with all required fields (date, time, instructor, participants, activity, price)

Metric: Export data accuracy
Target: Exported data matches schedule view data
Measurement Method: Data comparison between schedule view and exported CSV
Success Indicator: Exported CSV data accurately reflects the schedule entries visible in the filtered view

### 6.3 Measurement Timeline

- Initial measurement: After MVP deployment
- Ongoing measurement: Weekly during initial usage period
- Long-term measurement: Monthly after stabilization

### 6.4 Success Thresholds

For the MVP to be considered successful:
- Primary success criteria must be met (all four categories)
- At least 80% of secondary success criteria must be met
- User feedback must be generally positive (target: 70% positive feedback)
- System must be functional and usable for daily stable operations
