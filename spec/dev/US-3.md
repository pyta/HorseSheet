# US-3: Balance

## Functional Requirements

### US-3.1: Balance entity

**Priority**: High  
**Description**: In the system we need to keep information about the balance for contact person.

**Acceptance Criteria**:

- [ ] New entity is created: Balance { contactPersonId, Balance }.
- [ ] New entity should be created in the same way as the rest of entities.
- [ ] BE controller is creted.
- [ ] Balance filed from Payment is deleted (we don't need it).
- [ ] All Payment.balance references are deleted (BE & FE). 

### US-3.2: Price list history

**Priority**: High  
**Description**: All price list should have a history. We need to create a new entities - ServicePriceListHistory, ActivityPriceListHistory, IndividualActivityPriceListHostory, IndividualServicePriceListHistory.

**Structure**:
```
{
  ...
  dateFrom: Date;
  dateTo?: Date; // dateTo is nullable, so the current date will have null here.
}
```

**Acceptance Criteria**:

- [ ] New entities are created (4 new entities).
- [ ] Structure should be the same but we need two additional fields: dateFrom & dateFrom (see Structure).
- [ ] Services should be updated - when user add some changes in the price list system should update history entities (update dateTo & create a new row with dateFrom).

### US-3.3: Balance components

**Priority**: High  
**Description**: We need a queue to handle a requests to change tha balance. 

**Acceptance Criteria**:

- [ ] BullMQ is used & setup in the right way.
- [ ] Handler is connected to queue. Handler should update a contact person balance. Create a new balance row (see US-3.1: Balance entity) if not exist. 
- [ ] All balance related change should add a new message to queue (activities, services, payments).

**Balance logic**
1. When activity's schedule is added / deleted / updated we need to calculate a value of activity and add a message to queue.
2. When service's schedule is added / deleted / updated we need to calculate a value of service and add a message to queue.
3. When paymnet is added / deleted / updated we need to add a message to queue.

**Activity calculation - when add**
1. Get activity details.
2. Get individal price is defined (participant + instructor + stable + activity).
3. Get price (stable + astivity).
4. If activity is in the future we can use standard price list / individual price list BUT if activity is in the past - we have to get value from xxxHistory entities (see US-3.2: Price list history).
5. Total = (price (1 or 2)) * (activity duration / 60)
6. Add message to queue: { value: total, contactPersonId }

**Activity calculation - when delete**
1. Get activity details.
2. Get individal price is defined (participant + instructor + stable + activity).
3. Get price (stable + astivity).
4. If activity is in the future we can use standard price list / individual price list BUT if activity is in the past - we have to get value from xxxHistory entities (see US-3.2: Price list history).
5. Total = ((price (1 or 2)) * (activity duration / 60)) * -1. Activity is removed do the value must be negative.
6. Add message to queue: { value: total, contactPersonId }

**Activity calculation - when update**
1. Get activity details.
2. Get individal price is defined (participant + instructor + stable + activity).
3. Get price (stable + astivity).
4. If activity is in the future we can use standard price list / individual price list BUT if activity is in the past - we have to get value from xxxHistory entities (see US-3.2: Price list history).
5. Minus = ((price (1 or 2)) * (activity duration / 60)) * -1. Activity is removed do the value must be negative.
5. Plus = (price (1 or 2)) * (new activity duration / 60)
6. Add message to queue: { value: minus + plus, contactPersonId }

**Message type**
```
{
  value: number;
  contactPersonId: string;
}
```