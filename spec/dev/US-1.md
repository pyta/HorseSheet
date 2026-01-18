# US-1: Raw setup review

## Functional Requirements

### US-1.1: Price lists

**Priority**: High  
**Description**: Price list for activities and price list for services should be separated. So we need service-price-list (price list for service - { stableId, serviceId }) and activity-price-list (price list for activities - { stableId, activityId }).

**Acceptance Criteria**:

- [ ] Two new entities: service-price-list & activity-price-list.
- [ ] Services, controllers & modules are adjusted.
- [ ] CRUD is updated.
- [ ] All operations are available via swagger.

### US-1.2: ScheduleEntry

**Priority**: High  
**Description**: ScheduleEntry should be divided to handle Activities & Services independently. We need ActivityScheduleEntry and ServiceScheduleEntry. 

**Acceptance Criteria**:

- [ ] New entities are created (see types).
- [ ] Services, controllers & modules are adjusted.
- [ ] CRUD is updated.
- [ ] All operations are available via swagger.

**Types**:

```
ActivityScheduleEntry {
    stableId: string;
    date: Date; // ex. 2026-01-18
    time: string; // 10:00:00
    duration: number; // duration in min
    instructorId: string;
    isActive: boolean;
    activityId: string;
}

ActivityScheduleEntryDetails {
    activityScheduleEntryId: string;
    participantId: string;
}

ServiceScheduleEntry {
    stableId: string;
    date: Date; // start day ex. 2026-01-18
    duration: string; // day / month / ...
    isActive: boolean;
    serviceId: string;
}

ServiceScheduleEntryDetails {
    serviceScheduleEntryId: string;
    participantId: string;
}
```

### US-1.3: Individual price lists

**Priority**: High  
**Description**: In the system we can define individual price lists. For activities we can define individual prices for instructor & participant. For services we can define individual price for participant.

**Acceptance Criteria**:

- [ ] New entities are created (see types).
- [ ] Services, controllers & modules are adjusted.
- [ ] CRUD is updated.
- [ ] All operations are available via swagger.

**Types**:

```
IndividualServicePriceList {
    stableId: string;
    serviceId: string | null;
    price: number;
    currency: string;
    participantId: string;;
}

IndividualActivityPriceList {
    stableId: string;
    activityId: string | null;
    price: number;
    currency: string;
    instructorId: string;
    participantId: string;;
}
```

### US-1.4: Payments

**Priority**: High  
**Description**: We need to handle stable payments in the app. We can start from a simple table of payments. The next goal is to calculate balance for participant - when processing a payment we can calculate a sum of activities & services and add a value to the balance. Can be adjusted in the next steps of the project.

**Acceptance Criteria**:

- [ ] New entities are created (see types).
- [ ] Services, controllers & modules are adjusted.
- [ ] CRUD is updated.
- [ ] All operations are available via swagger.

**Types**:

```
Payment {
    stableId: string;
    participantId: string;;
    amount: number;
    paymentDate: Date;
    balance: number;
}
```