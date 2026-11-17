# Google account and cross-device sync

Status: implemented locally; production activation and real web/Android Google login verification remain pending.

## Objective and scope

Let a learner sign in with Google or email/password on the web and Android app and continue with the same personal data. First successful sign-in or explicit email signup creates the application account. Guest use and offline work remain available. Email signup, login, and password recovery were explicitly requested during implementation.

Sync the existing PersonalState fields: settings, activities, sessions, notes, reviews, resources, skills, projects, planned dates, and last activity. Static curriculum and device installation state are not account data.

## Existing implementation

- React 19, TypeScript, Vite, Capacitor 8, Zod, Vitest, Playwright.
- src/logic.ts defines PersonalState and validates backups with stateSchema.
- src/store.tsx persists rahgo.personal.v1 in localStorage and listens for same-browser storage events.
- src/pages.tsx contains settings, JSON backup/restore, and reset controls.
- There is no authentication service or server database in this repository.

## Proposed behavior

- Settings shows Google sign-in, account identity, sign-out, sync status, last successful sync, and retry on failure. UI follows the existing Persian/English language support.
- Guest data stays on the device. Before uploading existing guest data into an account, show a preview and an explicit import action. Never silently replace an existing cloud account with a guest snapshot.
- Local caches are isolated by account. Signing out returns to the guest workspace. Switching accounts must never display or upload the previous account's data.
- Save edits locally first. Queue offline edits durably and retry when the network returns or the app resumes. Only show success after server acknowledgement.
- Receive remote edits while online. Independent records merge; simultaneous edits to the same record require a visible conflict decision that preserves both versions until resolved. A stale whole-state upload must not overwrite unrelated remote edits.
- Record deletions explicitly so deleted notes or sessions do not reappear from an offline device. Reset and backup restore must have explicit account-wide semantics before they are enabled for a signed-in user.
- Existing JSON backup/export remains available, including before guest import, restore, or conflict resolution.
- Authentication uses the provider-supported browser flow on web and a supported external/native flow on Android. Cancellation and failed callbacks preserve local data.

## Proposed service and open decisions

The user approved Firebase Authentication and Cloud Firestore and supplied project devpath-e0b3c and Web app ID 1:624308802056:web:35a2cba4915f99198b37bd. Public Web app configuration is in src/firebase-config.ts, with environment overrides. Provider documentation and official Firebase agent skills were consulted.

Production activation requires enabling email/password and Google authentication, creating or selecting the actual Firestore database, deploying firestore.rules, authorizing web domains, and Android application registration/signing certificate configuration. CLI administrative login is not available yet. Do not put private service credentials in frontend code or version control.

## Security boundaries

- Enforce account ownership in server-side database rules using authenticated user identity; frontend filters are insufficient.
- Deny unauthenticated access and all cross-account reads and writes. Validate record shapes and size limits server-side and at the local ingestion boundary.
- Keep tokens out of logs and backups. Use the official authentication SDK for session lifecycle.
- Update the current local-only privacy statements to explain which data is uploaded after sign-in.
- Deployment of cloud resources and live authentication setup are separate from local implementation and verification.

## Implementation outline

1. Add provider configuration examples and authentication adapters for web and Android.
2. Add account-scoped persistence, guest import preview, durable pending changes, and record-level sync metadata.
3. Add authenticated cloud storage and ownership rules, conflict handling, and deletion tracking.
4. Connect account controls and sync status to settings; update privacy and setup instructions.
5. Verify regression behavior locally and verify live sign-in/sync on two devices once cloud configuration is supplied.

## Code style and project structure

Keep the existing typed functional React style and Zod validation. Keep provider/network behavior outside UI components, with tests beside source modules. Example existing update pattern:

```ts
update(previous => ({...previous, lastActivity: activityId}));
```

## Commands and testing

- Unit tests: npm test
- Type checking and production build: npm run build
- Browser tests: npm run test:e2e
- Android web assets and native plugin sync: npm run android:sync

Write failing tests before new sync behavior. Cover guest preservation, account switching, invalid remote payloads, offline retries, edits arriving during upload, conflict preservation, deletion, reset/restore, and sign-out during a request. Use provider emulators to prove ownership rules reject cross-account access. Browser tests cover sign-in cancellation and account/status controls. Live two-device verification covers web-to-Android and Android-to-web changes; local tests alone do not establish live sync.

## Acceptance criteria

- Signing in with the same Google account restores the same personal data on a second device.
- Independent changes survive concurrent edits; conflicting same-record edits cannot silently discard data.
- Offline edits survive app restart and upload once connected.
- Signing out or switching accounts cannot leak or upload another account's data.
- Guest mode, backups, and existing learning behavior continue to work.
- Both supported platforms complete the real Google flow with configured credentials.
- Unit tests, relevant browser tests, build, and database rule tests pass.

## Boundaries

Always preserve existing local data and validate imported data. Never commit secrets or silently discard pending edits. Do not claim the feature is activated until the cloud project and real two-device flow have been verified.
