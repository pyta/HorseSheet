# The App - Horse sheet

## Main issue

I plan to find a easy way to organize work on stable. We have some areas to cover:

- schedule for instructors & participants,
- types of users: stable owner, schedule manager, viever,
- list of participants and contact persons (participant should have one default contact person),
- available activities: sports, recreation, outdoor activities, walks,
- available services: horse boarding house,
- global & specific prices for instructors + participants,
- schedule share (email, calendar sync),
- notifications (email + SMS),
- blog,

## The smallest set of functionalities

- enable to setup my stable - create a new stable, add instructors, add activites, add services, add price lists,
- add participants & contact person (SMS or email),
- create a schedule,

## What is NOT included in the MVP

- auth, login using phone number,
- blog,
- notifications,
- schedule sharing,

## Success Criteria:

- create a plan how to use the system - we need to understand the stable owners, a lot is happening and it's happening quickly, we need a very flexible system, perhaps even with the ability for multiple people to create schedules in different ways (e.g. as entries in an Excel file),
- we can create a public version of the app, but the auth service should be taken into consideration to create a well defined architecture,
- users will be able to setup the stable, so all entities should have a CRUD and API for it,
- the POC will be deployed using https://mikr.us/?landing, so we need an architecture to deploy several small services
