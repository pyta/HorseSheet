## Main issue

I need to add a language support in the APP. The default language should be polish. We need to also handle a english.

## Success Criteria

- User can change the language to EN / PL.
- Default language is PL.
- All assets are translated and displayed in the right way.

## Feature Description

### Overview

This feature implements internationalization (i18n) support for the HorseSheet application, enabling users to switch between Polish (PL) and English (EN) languages. The implementation covers all user-facing content including UI labels, error messages, notifications, date/time formatting, currency formatting, and CSV exports.

### Functional Requirements

#### FR-6.1: Language Selection
- Users can change the language between Polish (PL) and English (EN) at any time
- Language selector is accessible from the main navigation/header on all pages (including public pages)
- Current language is clearly indicated (PL/EN flag or text)
- Language preference is persisted in localStorage
- For authenticated users (future): language preference will be stored in user profile
- Default language is Polish (PL) if no preference is set

#### FR-6.2: Browser Language Detection
- On first visit, the application detects browser language
- If browser language is EN or PL, it is used as the initial language
- If browser language is neither EN nor PL, default to PL
- User can manually override the detected language at any time

#### FR-6.3: Translation Scope
The following content must be translated:
- **UI Elements**: All buttons, labels, form fields, table headers, navigation items
- **Messages**: Success messages, error messages, validation messages, notifications
- **Form Labels**: All form field labels, placeholders, help text
- **Date/Time Formatting**: Dates and times displayed using locale-appropriate formats
  - PL: DD.MM.YYYY format
  - EN: MM/DD/YYYY format
- **Currency Formatting**: Currency values formatted according to locale
  - PL: pl-PL locale, PLN currency
  - EN: en-US locale, PLN currency (or configurable per stable)
- **CSV Export**: Export headers and formatted data (dates, times, currency) use selected language
- **Error Messages**: All API error messages, validation errors, network errors

**Excluded from translation:**
- User-generated content (stable names, participant names, activity names, descriptions)
- Technical error details (logged server-side, not displayed to users)

#### FR-6.4: Date and Time Localization
- All date displays use `Intl.DateTimeFormat` with the selected locale
- All time displays use locale-appropriate formatting
- Date/time pickers are locale-aware and support the selected language
- Date parsing handles both DD.MM.YYYY (PL) and MM/DD/YYYY (EN) formats correctly
- Time zone information is preserved and displayed correctly

#### FR-6.5: Currency Formatting
- All currency values use `Intl.NumberFormat` with the selected locale
- Currency symbol and formatting follow locale conventions
- Formatting is consistent across the application (forms, tables, exports)

#### FR-6.6: CSV Export Localization
- CSV export headers are translated to the selected language
- Date and time columns use the selected locale format
- Currency columns use the selected locale format
- User-entered text (names, descriptions) remains as-is (not translated)
- Export uses the current UI language setting

#### FR-6.7: Error Message Handling
- API error codes/keys are mapped to translation keys
- Centralized error message mapper translates backend error codes to i18n keys
- Validation errors use structured keys: `errors.validation.{fieldName}.{errorType}`
- Generic errors (network failures, timeouts) use frontend-only translations
- Fallback strategy: missing key → English → key name
- Missing translation keys are logged in development mode

#### FR-6.8: Validation Messages
- Validation error messages use structured approach: `validation.{fieldName}.{errorType}`
- Examples: `validation.name.required`, `validation.email.invalid`, `validation.balance.mustBeNumber`
- Support for dynamic field names via parameters
- Validation composable returns translated messages
- Mapping from validation rules to translation keys

#### FR-6.9: Pluralization
- Support for Polish pluralization rules (complex: 1, 2-4, 5+)
- Support for English pluralization rules (simple: singular/plural)
- Pluralization keys follow pattern: `{namespace}.count.{zero|one|few|many}`
- Edge cases tested: 0, 1, 2, 5, 22, etc. in both languages

#### FR-6.10: Dynamic String Interpolation
- Support for parameter interpolation in translations
- Format: `$t('schedule.entry.created', { name: participantName })`
- Named parameters for complex sentences with variable positions
- Handles word order differences between PL and EN
- Parameters documented for each translation key

### Technical Requirements

#### TR-6.1: i18n Library
- Use **vue-i18n v9** for Vue 3 (Composition API compatible)
- Install and configure vue-i18n plugin
- Set up i18n instance with Polish and English locales

#### TR-6.2: Translation File Organization
- Translations stored in JSON files: `locales/pl.json` and `locales/en.json`
- Translations organized by feature/module using namespaces:
  - `common`: Common UI elements (buttons, labels, general messages)
  - `schedule`: Schedule-related translations
  - `participants`: Participant management translations
  - `instructors`: Instructor management translations
  - `activities`: Activity management translations
  - `services`: Service management translations
  - `stables`: Stable management translations
  - `contactPersons`: Contact person management translations
  - `priceLists`: Price list translations
  - `errors`: Error messages and validation errors
  - `navigation`: Navigation and menu items
  - `notifications`: Notification messages
- Translation keys follow pattern: `{namespace}.{feature}.{element}`
- Example: `schedule.create.title`, `participants.form.nameRequired`, `errors.validation.fieldRequired`

#### TR-6.3: Language Persistence
- Language preference stored in `localStorage` with key: `horseSheet.language`
- On app initialization, check localStorage for saved preference
- If no preference exists, detect browser language or default to PL
- Language change immediately updates UI and saves to localStorage
- Future: For authenticated users, sync with user profile on login

#### TR-6.4: Date/Time Picker Localization
- Use locale-aware date/time picker library (e.g., `@vuepic/vue-datepicker` with locale support)
- Configure picker with selected locale
- Ensure input placeholders are translated
- Format validation messages according to selected locale

#### TR-6.5: Backend API
- Backend messages remain in English (technical)
- Frontend handles all user-facing translations
- API error codes/keys are mapped to frontend translation keys
- Future: Consider Accept-Language header support for API error messages

#### TR-6.6: URL Structure
- **MVP**: No URL-based language switching (e.g., `/en/`, `/pl/`)
- Language switching uses localStorage-based approach
- Future: Consider URL prefixes for SEO and shareable links

### Migration Strategy

#### Phase 1: Preparation
- Identify all hardcoded strings via code search
- Audit existing error messages, validation messages, UI labels
- Create inventory of all translatable content

#### Phase 2: Translation Key Creation
- Create translation keys following namespace pattern
- Organize keys by feature/module
- Create initial Polish translations (default language)
- Create English translations

#### Phase 3: Implementation
- Install and configure vue-i18n
- Set up translation file structure
- Implement language selector component
- Implement language persistence (localStorage)
- Implement browser language detection
- Replace hardcoded strings incrementally by feature/module:
  - Start with high-visibility areas (navigation, forms)
  - Continue with error messages and notifications
  - Complete with remaining UI elements

#### Phase 4: Quality Assurance
- Add lint rule to prevent new hardcoded strings
- Create translation completeness checker script
- Test all features in both languages
- Verify date/time/currency formatting
- Check for text overflow and layout issues
- Test pluralization edge cases

### Testing Requirements

#### Unit Tests
- Verify all translation keys exist in both languages
- Test translation key structure and naming
- Test pluralization rules for both languages
- Test parameter interpolation

#### Integration Tests
- Test language switching functionality
- Test language persistence (localStorage)
- Test browser language detection
- Test date/time formatting with both locales
- Test currency formatting with both locales

#### Visual Regression Tests
- Test UI with both languages for layout issues
- Verify text doesn't overflow containers
- Check button and form field sizing
- Verify date/time picker displays correctly

#### E2E Tests
- Test critical user flows in both languages
- Test CSV export with both languages
- Test form validation messages in both languages
- Test error handling in both languages

#### Accessibility Tests
- Test language selector with keyboard navigation
- Test with screen readers (NVDA, JAWS, VoiceOver)
- Verify ARIA labels are properly translated
- Test language switching with assistive technologies

### Accessibility Requirements

#### AR-6.1: Language Selector
- Proper ARIA labels: `aria-label="Select language"`
- Active language marked with `aria-current="true"`
- Keyboard navigation support (Tab, Enter, Arrow keys)
- Screen reader support with descriptive text
- Visible language indicator (not just flags)

#### AR-6.2: Translated Content
- All translated content is accessible to screen readers
- Form labels properly associated with inputs
- Error messages announced to screen readers
- Notification messages accessible

### Implementation Details

#### Component Structure
- Language selector component in main navigation/header
- Language store/composable for managing language state
- Translation composable for easy access to translations
- Error message mapper for API error translation
- Validation message composable for form validation

#### File Structure
```
FE/horse-sheet-fe/
├── src/
│   ├── locales/
│   │   ├── pl.json
│   │   ├── en.json
│   │   └── index.ts
│   ├── composables/
│   │   ├── useI18n.ts (if needed beyond vue-i18n)
│   │   ├── useValidationMessages.ts
│   │   └── useErrorMapper.ts
│   ├── stores/
│   │   └── language.ts (language preference store)
│   ├── components/
│   │   └── common/
│   │       └── LanguageSelector.vue
│   └── plugins/
│       └── i18n.ts (vue-i18n setup)
```

### Success Metrics

- All UI elements are translated in both languages
- Language switching works seamlessly without page reload
- Language preference persists across sessions
- Date/time formatting displays correctly for both locales
- Currency formatting displays correctly for both locales
- CSV exports use correct language and formatting
- No missing translation keys in production
- All error messages are user-friendly and translated
- Accessibility requirements are met
- Translation completeness: 100% of defined keys exist in both languages

### Out of Scope

- URL-based language switching (e.g., `/en/`, `/pl/`)
- Translation of user-generated content
- More than two languages (PL and EN only for MVP)
- Backend API message translation (frontend-only for MVP)
- Automatic translation services
- Translation management system/UI

### Future Considerations

- Store language preference in user profile for authenticated users
- Add Accept-Language header support for API error messages
- Consider URL-based language switching for SEO
- Support for additional languages (if needed)
- Translation management interface for content updates