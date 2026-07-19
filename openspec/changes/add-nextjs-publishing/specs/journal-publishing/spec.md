## ADDED Requirements

### Requirement: Owner authentication
The system SHALL require a valid owner session before displaying publishing controls or accepting any upload or publication request.

#### Scenario: Owner signs in
- **WHEN** the configured administrator password is submitted correctly
- **THEN** the system creates a signed, expiring, HTTP-only session and opens the publishing page

#### Scenario: Unauthorized write is attempted
- **WHEN** a request without a valid owner session reaches an upload or publication endpoint
- **THEN** the system rejects it without creating or changing stored content

### Requirement: Validated photograph upload
The system SHALL accept one JPEG, PNG, or WebP photograph up to 20 MB for a journal entry and SHALL require localized alternative text before publication.

#### Scenario: Valid photograph is selected
- **WHEN** an authenticated owner uploads an allowed image within the size limit
- **THEN** the system stores it under a randomized entry-specific Blob path and returns its public URL

#### Scenario: Invalid photograph is selected
- **WHEN** a file has a disallowed type, exceeds 20 MB, or lacks localized alternative text
- **THEN** the system rejects publication with an actionable error

### Requirement: Bilingual entry publication
The system SHALL validate and persist a unique slug, date, localized titles, summaries, bodies, places, alternative text, and photograph URL for each published entry.

#### Scenario: Owner publishes a complete entry
- **WHEN** an authenticated owner submits all required valid Czech and English fields after a successful photo upload
- **THEN** the system stores one entry document and confirms the stable Czech and English public URLs

#### Scenario: Invalid entry is submitted
- **WHEN** a required field is empty, the slug is unsafe, or the photograph URL is not a Vercel Blob public URL
- **THEN** the system rejects the entry without storing its document

### Requirement: Published journal rendering
The system SHALL show persisted entries in the journal overview and SHALL render each entry at matching Czech and English stable URLs.

#### Scenario: Visitor opens a localized overview
- **WHEN** one or more entries have been published
- **THEN** the localized journal section lists them newest first using the matching title, summary, date, and photograph

#### Scenario: Visitor opens a localized entry
- **WHEN** the visitor follows a published entry URL
- **THEN** the matching language version shows the entry narrative, photograph with localized alternative text, counterpart language link, and navigation back to the journal

### Requirement: Vercel build and deployment configuration
The repository SHALL declare Next.js as a root production dependency and SHALL build from the repository root on Vercel.

#### Scenario: Vercel inspects the repository
- **WHEN** Vercel builds the connected production branch with Root Directory set to `.`
- **THEN** it detects Next.js, installs locked dependencies, and completes the production build
