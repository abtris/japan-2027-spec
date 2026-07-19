## ADDED Requirements

### Requirement: Trip overview
The site SHALL present a public overview that identifies the Japan 2027 trip and explains what visitors can follow.

#### Scenario: Visitor opens the home page
- **WHEN** a visitor opens the site home page
- **THEN** the visitor sees the trip title, introductory copy, journey map navigation, and journal navigation

### Requirement: Visual trip identity
The home page SHALL depict a map of Japan in the hero background and a Torii gate as the dominant foreground element using original site artwork.

#### Scenario: Visitor sees the pre-trip hero
- **WHEN** a visitor opens either localized home page before trip photography is available
- **THEN** the visitor sees the Japan map and Torii composition without any supplied reference image being used as a production asset

### Requirement: Bilingual browsing
The site SHALL publish equivalent Czech and English pages, with Czech at `/`, English under `/en/`, and a visible language switch linking directly between counterparts.

#### Scenario: Visitor switches language
- **WHEN** a visitor activates the language switch on a Czech or English page
- **THEN** the equivalent page opens in the other language rather than returning to a generic home page

#### Scenario: Localized page metadata is inspected
- **WHEN** a localized page is opened
- **THEN** it declares the correct document language, canonical URL, and Czech and English `hreflang` alternates

### Requirement: Journey map
The home page SHALL present the supplied watercolor map artwork at its original proportions with the planned destinations and numbered links for the itinerary days.

#### Scenario: Visitor follows a map day link
- **WHEN** a visitor activates a numbered day link with a pointer or keyboard
- **THEN** focus moves to the matching itinerary section on the same localized page

#### Scenario: Visitor cannot interpret the visual route
- **WHEN** the illustrated map is unavailable or difficult for a visitor to interpret
- **THEN** the numbered links and ordered itinerary below it provide the same destination sequence and full place names

### Requirement: Planned itinerary
The site SHALL list the April 1–15, 2027 itinerary in ascending trip-day order, with each item showing its day number or range, date or date range, place, and supplied description.

#### Scenario: Visitor browses the pre-trip schedule
- **WHEN** a visitor reaches the itinerary
- **THEN** days 1–15 appear in order, Kyoto remains grouped as days 6–8, and day 12 visibly preserves the conditional Nagano or Tokyo plan

### Requirement: Daily journal
The site SHALL allow each itinerary item to gain daily observations, photographs, and a stable detail-page link without changing its date, order, or map anchor.

#### Scenario: A travel day is updated
- **WHEN** observations or photographs are published for an itinerary day
- **THEN** that day remains in its original itinerary position and exposes the new journal content or detail-page link

### Requirement: Individual journal entries
Each published journal entry SHALL have stable Czech and English pages containing its title, date, place, narrative, language switch, and a way back to the localized journal overview.

#### Scenario: Visitor follows an entry link
- **WHEN** a visitor opens an entry from the journal list
- **THEN** the complete entry is displayed at its own URL with navigation back to the home page

#### Scenario: Visitor opens a shared entry URL
- **WHEN** a visitor opens an individual entry URL directly
- **THEN** the entry is understandable without first visiting the home page

### Requirement: Photo presentation
The site SHALL present trip photos with useful alternative text and SHALL preserve their aspect ratio across supported viewport sizes.

#### Scenario: Visitor views an entry with photos
- **WHEN** an entry contains one or more photos
- **THEN** each photo is displayed without distortion and has alternative text or an explicitly empty alternative for a decorative image

#### Scenario: Photo needs additional context
- **WHEN** a photo's meaning is not clear from the surrounding story
- **THEN** the site displays a visible caption with the needed context

### Requirement: Responsive and accessible browsing
The site SHALL provide semantic navigation, visible keyboard focus, readable text, and layouts that do not require horizontal page scrolling on common phone and desktop viewport widths.

#### Scenario: Visitor uses a phone
- **WHEN** the home page, journey map, itinerary, or an entry is viewed at a 320 CSS-pixel viewport width
- **THEN** its text, navigation, map links, and media remain usable without horizontal page scrolling

#### Scenario: Visitor navigates by keyboard
- **WHEN** a visitor moves through interactive elements using the keyboard
- **THEN** focus follows a logical order and the focused element has a visible indicator

### Requirement: Shareable page metadata
Every localized home page and journal entry SHALL provide a descriptive localized document title, description, canonical URL, and social-preview metadata matching that page's content.

#### Scenario: Entry link is shared
- **WHEN** a service reads the metadata for an individual journal entry
- **THEN** it receives that entry's title, description, canonical URL, and preview image metadata rather than generic home-page values
