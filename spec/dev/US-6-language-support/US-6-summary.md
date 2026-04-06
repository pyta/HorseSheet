# US-6: Language Support - Questions & Decisions Summary

## Overview

This document summarizes all questions, recommendations, and decisions made during the PRD creation process for US-6 (Language Support feature).

## Round 1: Core Requirements

### 1. Scope of Translatable Content
**Question**: What is the scope of translatable content?

**Decision**: 
- **Included**: UI labels/buttons, error messages, validation messages, form labels, table headers, navigation, notifications, date/time formats, currency formats, CSV export headers
- **Excluded**: User-generated content (stable names, participant names) unless explicitly required

### 2. Language Preference Persistence
**Question**: How should language preference be persisted?

**Decision**: 
- **MVP**: Store preference in localStorage
- **Authenticated users (future)**: Store in user profile
- **Public users**: Use localStorage with browser language detection as fallback
- **Default**: PL if no preference is set

### 3. Backend API Internationalization
**Question**: Should the backend API support internationalization?

**Decision**: 
- **MVP**: Keep backend messages in English (technical)
- **Frontend**: Handles all user-facing translations
- **Future**: Add Accept-Language header support for API error messages if needed

### 4. Missing Translation Keys
**Question**: What happens when a translation key is missing?

**Decision**: 
- **Fallback strategy**: missing key → English → key name
- **Development**: Log missing keys
- **Production**: Consider translation completeness checker to identify gaps before release

### 5. Date, Time, and Currency Formatting
**Question**: Should date, time, and currency formatting be localized?

**Decision**: 
- **Yes**: Use `Intl.DateTimeFormat` and `Intl.NumberFormat` with selected locale
- **PL**: pl-PL locale, dates DD.MM.YYYY, currency PLN
- **EN**: en-US locale, dates MM/DD/YYYY, currency PLN (or configurable per stable)

### 6. Browser Language Detection
**Question**: Should the application detect browser language on first visit?

**Decision**: 
- **Yes**: On first visit, detect browser language
- **If EN or PL**: Use detected language
- **Otherwise**: Default to PL
- **Override**: Allow manual override at any time
- **UI**: Show language selector in header/navigation

### 7. i18n Library and Organization
**Question**: Which i18n library should be used, and how should translations be organized?

**Decision**: 
- **Library**: vue-i18n v9 for Vue 3
- **Organization**: By feature/module (common, schedule, participants, errors)
- **Files**: JSON files - `locales/pl.json` and `locales/en.json`
- **Keys**: Namespaced keys (e.g., `schedule.create.title`)

### 8. User-Generated Content Translation
**Question**: Should user-generated content (stable names, activity names) be translatable?

**Decision**: 
- **No**: Keep user content in the language it was entered
- **Future**: Consider multi-language support for stable descriptions if needed (adds complexity)

### 9. Language Selector UI
**Question**: How should the language selector be implemented in the UI?

**Decision**: 
- **Location**: Main navigation/header (dropdown or toggle)
- **Indicator**: Show current language (PL/EN flag or text)
- **Accessibility**: Available on all pages, including public pages
- **Enhancement**: Consider keyboard shortcut for power users

### 10. Translation Workflow
**Question**: What is the translation workflow and quality assurance process?

**Decision**: 
- **Process**: Identify all translatable strings → Create translation keys → Provide context to translators → Review for domain accuracy → Test UI with both languages → Verify date/time/currency formatting → Check text overflow/layout issues

## Round 2: Implementation Details

### 11. API Error Message Handling
**Question**: How should API error messages be handled for internationalization?

**Decision**: 
- **Mapping**: Map API error codes/keys to translation keys
- **Structure**: `errors.validation.fieldRequired` or `errors.validation.invalidFormat`
- **Mapper**: Create centralized error message mapper that translates backend error codes to i18n keys
- **Generic errors**: Network failures, timeouts use frontend-only translations

### 12. Migration Strategy
**Question**: What is the migration strategy for existing hardcoded strings?

**Decision**: 
- **Phase 1**: Identify all hardcoded strings via code search
- **Phase 2**: Create translation keys following namespace pattern (e.g., `participants.form.nameRequired`, `schedule.success.created`)
- **Phase 3**: Replace strings incrementally by feature/module, starting with high-visibility areas (navigation, forms)
- **Phase 4**: Add lint rule to prevent new hardcoded strings
- **Tool**: Consider script to extract strings from templates and components

### 13. Pluralization
**Question**: How should pluralization be handled for Polish and English?

**Decision**: 
- **Library**: Use vue-i18n's pluralization
- **Polish**: Complex rules (1, 2-4, 5+)
- **English**: Simple rules (singular/plural)
- **Keys**: `participants.count.zero`, `participants.count.one`, `participants.count.few`, `participants.count.many`
- **Testing**: Test edge cases (0, 1, 2, 5, 22, etc.) in both languages

### 14. CSV Export Localization
**Question**: Should the CSV export headers and content be localized?

**Decision**: 
- **Yes**: Export headers match selected language
- **Data formatting**: Dates/times use selected locale format, currency uses selected locale format
- **User content**: Keep user-entered text (names, descriptions) as-is
- **Language**: Use current UI language (or add language selector in export dialog)

### 15. Validation Error Messages
**Question**: How should validation error messages be structured for field-specific translations?

**Decision**: 
- **Structure**: `validation.{fieldName}.{errorType}` (e.g., `validation.name.required`, `validation.email.invalid`, `validation.balance.mustBeNumber`)
- **Dynamic fields**: Support dynamic field names via parameters
- **Composable**: Create validation composable that returns translated messages
- **Mapping**: Consider mapping from validation rules to translation keys

### 16. Testing Strategy
**Question**: What testing strategy should be implemented for i18n?

**Decision**: 
- **Unit tests**: Verify all translation keys exist in both languages
- **Integration tests**: Test language switching, persistence, browser detection
- **Visual regression**: Test UI with both languages for layout issues
- **E2E tests**: Test critical flows in both languages
- **Tool**: Create translation completeness report script that identifies missing keys

### 17. Accessibility Requirements
**Question**: How should the language selector handle accessibility requirements?

**Decision**: 
- **ARIA labels**: `aria-label="Select language"`, `aria-current="true"` for active language
- **Keyboard navigation**: Tab, Enter, Arrow keys
- **Screen readers**: Support with descriptive text
- **Indicator**: Visible language indicator (not just flags)
- **Testing**: Test with screen readers (NVDA, JAWS, VoiceOver)

### 18. URL-Based Language Switching
**Question**: Should the application support URL-based language switching (e.g., /en/, /pl/)?

**Decision**: 
- **MVP**: No, use localStorage-based switching
- **Future**: Consider URL prefixes for SEO and shareable links

### 19. Date/Time Picker Localization
**Question**: How should date/time pickers and form inputs handle localization?

**Decision**: 
- **Library**: Use locale-aware date/time pickers (e.g., `@vuepic/vue-datepicker` with locale support)
- **Placeholders**: Ensure input placeholders are translated
- **Validation**: Format validation messages according to selected locale
- **Testing**: Test with different date formats (DD.MM.YYYY vs MM/DD/YYYY) to ensure proper parsing

### 20. Dynamic String Interpolation
**Question**: What is the strategy for handling dynamic/interpolated strings with variables?

**Decision**: 
- **Method**: Use vue-i18n's parameter interpolation: `$t('schedule.entry.created', { name: participantName })`
- **Complex sentences**: Use named parameters for variable positions
- **Word order**: Be careful with word order differences between PL and EN
- **Testing**: Test with long names/values to ensure proper formatting
- **Documentation**: Document parameter requirements for each translation key

## Key Decisions Summary

### Technology Stack
- **i18n Library**: vue-i18n v9
- **Date/Time**: Intl.DateTimeFormat, Intl.NumberFormat
- **Date Picker**: @vuepic/vue-datepicker (or similar locale-aware library)
- **Storage**: localStorage for language preference

### Translation Organization
- **Files**: `locales/pl.json`, `locales/en.json`
- **Structure**: Namespaced by feature/module
- **Key Pattern**: `{namespace}.{feature}.{element}`

### Default Behavior
- **Default Language**: Polish (PL)
- **Browser Detection**: Yes, on first visit
- **Persistence**: localStorage
- **URL Structure**: No language prefixes in MVP

### Scope
- **Translated**: UI, messages, dates, currency, exports
- **Not Translated**: User-generated content
- **Languages**: PL and EN only

### Quality Assurance
- **Completeness Checker**: Script to identify missing keys
- **Lint Rule**: Prevent new hardcoded strings
- **Testing**: Unit, integration, visual regression, E2E, accessibility

## Implementation Phases

1. **Preparation**: Audit and identify all translatable content
2. **Setup**: Install vue-i18n, create file structure, set up language selector
3. **Translation**: Create translation keys and content for both languages
4. **Migration**: Replace hardcoded strings incrementally
5. **Testing**: Comprehensive testing in both languages
6. **Quality Assurance**: Completeness check, lint rules, accessibility testing

