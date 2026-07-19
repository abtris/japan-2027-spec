## ADDED Requirements

### Requirement: Trip overview
The site SHALL present a public overview that identifies the Japan 2027 trip and explains what visitors can follow.

#### Scenario: Visitor opens the home page
- **WHEN** a visitor opens the site home page
- **THEN** the visitor sees the trip title, introductory copy, and primary journal navigation

### Requirement: Chronological journal
The site SHALL list published journal entries in reverse chronological order, with each item showing its date, place, title, summary, and link.

#### Scenario: Visitor browses published entries
- **WHEN** two or more journal entries have been published
- **THEN** the home page lists the newest entry first and provides a link to every entry

#### Scenario: Visitor arrives before the first entry
- **WHEN** no journal entries have been published
- **THEN** the home page explains that trip stories will appear later without showing broken or empty entry controls

### Requirement: Individual journal entries
Each published journal entry SHALL have a stable page containing its title, date, place, narrative, and a way back to the journal overview.

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
- **WHEN** the home page or an entry is viewed at a 320 CSS-pixel viewport width
- **THEN** its text, navigation, and media remain readable without horizontal page scrolling

#### Scenario: Visitor navigates by keyboard
- **WHEN** a visitor moves through interactive elements using the keyboard
- **THEN** focus follows a logical order and the focused element has a visible indicator

### Requirement: Shareable page metadata
The home page and every journal entry SHALL provide a descriptive document title, description, canonical URL, and social-preview metadata matching that page's content.

#### Scenario: Entry link is shared
- **WHEN** a service reads the metadata for an individual journal entry
- **THEN** it receives that entry's title, description, canonical URL, and preview image metadata rather than generic home-page values

