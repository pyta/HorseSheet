## Main issue

System should handle roles.

## Prerequisites

- Verify that all entities are related to the stable, or to other entities directly belonging to the stable,
- The requirement is to easily identify entities related to specific stables,
- System should provide a way to login using user number (generated on BE - unique user number) as a user login,

### user_stables table

- System should contains a new table to join user and stable. 
- When user (SO) add a new stable new relation is created.
- SO can add an access to the SM & U.

```
UserStables {
    userId,
    stableId,
}
```

## Out of scope (keep in mind)

- In near future system should provide a way to register users,
- But registered user will be SO always (I can't create a account as a SM - no use case), but I can use the same email in other users accoount,

### Admin

- ADMIN should have an access to the all parts of the system.

### Stable owner

- Stable Owner (SO) should have access to all stable data that he has created (or to which he has been given access).
- SO can't add other stable owners.

### Stable manager

- Stable Manager (SM) should have access to all stable data to which he has been given access.
- SM can't have an access to the stables module.
- SM can't have an access to the prices & individual prices module (service & activity).

### User

- User (U) can view the data about activities & services (but only related to user ID).
- U can't have an access to the prices & individual prices module (service & activity).


## User number for login

1 What format should the user number be?
- numeric, lenfth: 6.
2. When is it generated?
- on user creation.
3. Should it be displayed to the user? 
- skip in MVP.
4. Can users change their user number, or is it permanent?
- is is permanent.

## User–Stable relationship

1. How is access to stables granted? There's no user_stables or stable_access table.
- stable_access should be created (see Prerequisites)
2. When a SO creates a stable, should they be automatically granted access? How is this tracked?
- SO can create a stable using stable controller. Should they be automatically granted access - no.
3. Who can grant access to a stable? (Admin only? SO only?)
- All users (all roles) can be related to the stable.
4. Can a user have access to multiple stables? If yes, how is the current stable selected?
- Yes, for MVP no stable context.

## Stable Owner (SO) permissions

1. Can SO add Stable Managers to their stables?
- yes, this is a core function. SO can create a new user (SM). This is why we need a user number insted of e-mail. In user module SO can create a new user & select role & stables.
2. Can SO remove access from other SOs who were granted access?
- no,
3. Can SO delete stables they created? What about stables they were granted access to?
- yes, can delete in all cases.
4. Can SO modify stable settings (name, address, etc.) for stables they created vs. granted access?
- yes, can modify in all cases.

## Stable Manager (SM) permissions

1. What does "stables module" mean? (CRUD on stables, or viewing stable list/settings?)
- CRUD & list
2. Can SM view stable information (name, address, contact info)?
- no, no place for it in MVP,
3. Can SM manage schedules, instructors, participants, activities, services?
- yes,
4. Can SM add other SMs to the same stable?
- no,
5. Can SM view global price lists (read-only) or are they completely hidden?
- hidden,

## User (U) permissions

1. "View data about activities & services (but only related to user ID)" — what does "related to user ID" mean?
- activities are related to the contact person - U is a link to contact person. So in the system we should create a account for contact person.
2. Activities/services where the user is a participant? 
- YES
3. Activities/services in stables the user has access to? 
- NO
4. Can U view schedules? (US-5 mentions "schedule preview")
- Yes,
5. Can U view their own bookings/reservations?
- Yes,
6. Can U view instructors, participants, contact persons?
- No,

## Price & individual prices modules

1. Should SM/U see price fields as null, 0, or completely omitted from responses?
- hidden
2. Can SM/U view price lists in read-only mode, or are they completely blocked?
- blocked,

## Admin permissions

1. Can Admin grant/revoke access to stables for any user?
- yes,
2. Can Admin change user roles?
- yes,
3. Can Admin access all stables regardless of ownership?
- yes,

## Access control implementation

1. Should access be checked at the endpoint level (guards) or within services (data filtering)?
- guars, better from architecture point of view I guess,
2. How should "given access" be stored? (junction table, stable ownership field, etc.)
- stable_users table (see Prerequisites),
3, Should there be an audit log for access grants/revocations?
- no for MVP,

## Out of scope clarification

1. "Registered user will be SO always" — does this mean:
Self-registration always creates a SO role?
- yes
Or registration creates a user account that must be assigned SO role by an admin?
- no
2. "I can use the same email in other users account" — does this mean:
One email can be associated with multiple user accounts?
- yes
Or one user account can have multiple roles across different stables?
- no

## Entity relationship verification

1. The prerequisite says "all entities are related to the stable" — should we verify that all entities have a stableId field?
- yes
2. Should there be a validation that ensures users can only access entities belonging to stables they have access to?
- no
