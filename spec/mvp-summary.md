<conversation_summary>
<decisions>
RBAC: Stable owner (full CRUD), schedule manager (schedule CRUD only), viewer (read-only)
Pricing: Global pricing per activity/service for MVP; specific pricing deferred
Contact info: Collect email/phone during participant creation; no sending in MVP
Schedule creation: Manual UI for MVP; Excel import post-MVP with defined schema
Multi-tenancy: One stable per account for MVP; schema designed for future multi-stable support
Schedule data model: One instructor, multiple participants, one activity type, date/time; service is participant-only and separate from schedule entries
Public access: Stable info, activities, services publicly viewable (read-only); all CRUD requires authentication
Schedule conflicts: Instructors can have multiple activities at same time (mixed groups); no double-booking validation for MVP
Services: Independent entities with separate CRUD; not linked to schedule entries
Group activities: Single schedule entry supports multiple participants with one activity type
UX priority: Fast workflow with minimal required fields, auto-populate defaults, bulk copy/duplicate actions; no wizards
Recurring schedules: Excluded from MVP; duplicate/copy feature provided instead
Stable setup: Name required; all other fields optional; flexible incremental setup
Price structure: Simple per-activity and per-service base prices; no packages
Soft deletion: All entities use soft deletion (mark inactive); historical data preserved
Schedule editing: Full CRUD on all schedule entries regardless of date
Time zones: One time zone per stable; ISO 8601 format in API
Validation: Minimal - only required fields and existence/active status checks
Contact person: Can exist independently; assigned to multiple participants; each participant has one default
Schedule filtering: Date range (default current week), instructor, participant; simple search bar
Export: CSV export for schedules with date, time, instructor, participants, activity, and price
Schedule view: Essential info only (date, time, instructor, participants, activity); details via expand/click
Concurrent edits: Last-write-wins with optimistic locking (version/timestamp)
Setup flow: Flexible dashboard with "Add" buttons; no forced wizard; progress indicator
API design: All endpoints accept optional Bearer token; middleware pattern for future auth
Error messages: User-friendly, contextual, actionable; technical details logged server-side
Bulk operations: Schedule copy/duplicate in MVP; other bulk operations deferred
Referential integrity: Soft deletion prevents new entries; historical entries preserved with indicators
</decisions>
<matched_recommendations>
Implement RBAC with three distinct roles and clear permission boundaries
Start with global pricing model; design data model to support specific pricing later
Collect contact information only; defer communication features to post-MVP
Provide manual schedule creation UI; plan Excel import as post-MVP with defined schema
Create clear schedule data model with defined relationships (instructor-participant-activity-service)
Design API with clear public vs. authenticated endpoint separation
Allow flexible scheduling (instructors can have multiple simultaneous activities)
Separate services from schedule entries in data model
Support group activities through multi-participant schedule entries
Prioritize speed and simplicity in UX design
Implement duplicate/copy functionality instead of recurring schedules
Enable flexible, incremental stable setup
Use simple pricing structure for MVP
Implement soft deletion pattern across all entities
Allow full CRUD on all schedule entries
Use single time zone per stable with standard date format
Keep validation minimal to maintain speed and flexibility
Design flexible contact person relationship model
Provide basic filtering and search capabilities
Include CSV export with activity and price for summary overview
Keep schedule view uncluttered with expandable details
Use optimistic locking for concurrent edit protection
Create flexible, non-blocking setup flow
Design auth-ready API architecture from the start
Provide user-friendly error messaging
Focus bulk operations on schedule-related features
Maintain referential integrity with soft deletion
</matched_recommendations>
<prd_planning_summary>
Main Functional Requirements
Core Entities and CRUD Operations
Stable: Create with name (required), optional address/contact info; full CRUD
Instructors: Add/manage instructors; full CRUD with soft deletion
Activities: Define activity types (sports, recreation, outdoor activities, walks); full CRUD with soft deletion
Services: Independent service management (e.g., horse boarding); separate from schedule; full CRUD with soft deletion
Participants: Add participants with contact info (email/phone); each participant has one default contact person; full CRUD with soft deletion
Contact Persons: Can exist independently; assignable to multiple participants; full CRUD
Price Lists: Simple per-activity and per-service base pricing; global pricing model for MVP
Schedule Entries: Create entries with date, time, instructor, multiple participants, one activity type; optional service association (participant-only); full CRUD regardless of date
User Roles and Permissions
Stable Owner: Full CRUD on all entities
Schedule Manager: CRUD on schedule entries only; cannot modify stable settings
Viewer: Read-only access to all entities
Key Features
Schedule Management: Create, edit, delete schedule entries; support group activities (multiple participants per entry); allow instructors to have multiple simultaneous activities
Schedule Viewing: Calendar/list view with filtering (date range, instructor, participant); search functionality; visual indicators for past vs. future entries
Schedule Export: CSV export with date, time, instructor, participants, activity, and price for summary overview
Bulk Operations: Copy/duplicate schedule entries with date adjustments
Flexible Setup: Incremental configuration; no forced wizard; dashboard with clear "Add" buttons
Technical Architecture
API Design: RESTful API with optional Bearer token support; clear public vs. authenticated endpoints; middleware pattern for future auth integration
Data Model: Soft deletion for all entities; referential integrity with historical data preservation; optimistic locking for concurrent edits
Deployment: Microservices architecture (2-3 services: API gateway, business logic, data persistence) on mikr.us platform
Time Zones: Single time zone per stable; ISO 8601 format in API
Validation: Minimal validation - required fields and existence/active status checks only
Key User Stories and Usage Paths
User Story 1: Stable Owner Initial Setup
Create stable (name required)
Optionally add address/contact info
Add instructors (can skip and return later)
Add activities (can skip and return later)
Add services (can skip and return later)
Set prices for activities/services
Add participants with contact persons
Start creating schedule entries
User Story 2: Schedule Manager Creating Schedule
View schedule (default: current week)
Filter by instructor or participant if needed
Create new schedule entry:
Select date and time
Select instructor
Select one or more participants
Select activity type
Optionally associate service with participant
Save entry (minimal validation)
Optionally duplicate entry for different date/time
User Story 3: Viewer Accessing Public Information
View stable information (public)
View available activities (public)
View available services (public)
View schedule (public read-only)
User Story 4: Exporting Schedule for Summary
Filter schedule by date range
Export to CSV
Review activity counts and pricing summary
Success Criteria and Measurement
Primary Success Criteria
Fast and Flexible UX: System must enable quick schedule creation without complex rules or validation dialogs
Measurement: Time to create schedule entry (target: lt 30 seconds), user feedback on ease of use
Understanding Stable Owners: System must accommodate fast-paced, dynamic stable operations
Measurement: User interviews, feedback on flexibility, adoption rate
Well-Defined Architecture: Architecture must support future auth integration without refactoring
Measurement: Code review, architecture documentation, ease of adding auth middleware
Complete CRUD APIs: All entities must have full CRUD operations
Measurement: API coverage audit, endpoint testing
Secondary Success Criteria
Public Accessibility: Stable information, activities, and services viewable without authentication
Measurement: Public endpoint availability, access logs
Data Integrity: Historical data preserved when entities are deactivated
Measurement: Data retention testing, referential integrity validation
Export Functionality: Schedule data exportable for external analysis
Measurement: Export feature testing, CSV format validation
Important Design Constraints
No Authentication in MVP: Auth architecture must be designed but not implemented
No Notifications: Contact information collected but not used for communication
No Schedule Sharing: Sharing features deferred to post-MVP
No Blog: Blog functionality excluded from MVP
Deployment Platform: Must work within mikr.us platform constraints
Many Stables per Account: MVP assumes many stable per account,
</prd_planning_summary>
<unresolved_issues>
mikr.us Platform Research: Specific technical constraints, supported languages, database options, scaling limits, and cost structure of mikr.us platform need to be researched to finalize microservices architecture
Excel Import Schema: While Excel import is post-MVP, the exact schema and validation rules should be defined early to ensure CSV export format compatibility
Activity-Service Relationship Clarification: While services are separate from schedule entries, the exact relationship between activities and services (if any) needs clarification - can a service be associated with a specific activity type, or are they completely independent?
Pricing Display: How should prices be displayed in the schedule view and exports - per participant, per activity, or aggregated? This affects the summary calculation mentioned in export requirements
Contact Person Default Assignment: The workflow for assigning a default contact person when a contact person is shared across multiple participants needs clarification
Schedule Entry Duration: No specification on whether schedule entries have a duration/time length or are point-in-time entries
Service Duration/Period: Services like boarding are ongoing - how should start/end dates or billing periods be handled?
API Rate Limiting: No discussion on API rate limiting or usage constraints for public vs. authenticated endpoints
Data Backup and Recovery: No specification on data backup strategies or disaster recovery requirements
Performance Requirements: No specific performance targets (response times, concurrent users, data volume limits) defined
</unresolved_issues>
</conversation_summary>
