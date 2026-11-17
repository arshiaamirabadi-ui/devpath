# Verification · DevPath 1.1.0

## Application checks

- 68 unit tests passed across 15 files, covering learning progress, scheduling, content, backups, account isolation and sync behavior.
- TypeScript checks and the production web build passed.
- Browser checks covered the learning workflow, notes, study sessions, backup export/restore, language switching, mobile navigation and responsive layouts.
- iPad WebKit layouts passed in portrait, landscape and split view, in both languages and themes.
- Edge and WebKit verified the standalone web app manifest, offline English lessons and persistence after reload, including the published website.

## Authentication and sync

- Four Firestore Emulator rule tests passed, including unauthenticated access, cross-account reads and writes, field/type/size validation and deletion tombstones.
- Three browser scenarios passed against the Authentication and Firestore emulators: shared email accounts with offline edits, concurrent changes and conflict resolution, and Google sign-in cancellation with guest data preserved.
- Email/password sign-in and successful sync were confirmed against the deployed backend.
- Live Google sign-in across physical devices remains outside the completed checks. Native Android Google sign-in is disabled until its platform configuration is provided.

## Android release

- The Android build and offline emulator launch passed in CI.
- Version 1.1.0 uses versionCode 2 and the same signing certificate as version 1.0.0.
- The signed release APK passed signature verification.
- The published APK was downloaded from the public release and passed a second offline launch check.
- [Version 1.1.0 release](https://github.com/arshiaamirabadi-ui/devpath/releases/tag/android-v1.1.0)

## Scope and limitations

These checks do not cover every physical device or assistive technology. Emulator sync tests verify the application workflow but do not replace testing platform-specific Google authentication on real devices. Learning progress is self-reported and is not an independent assessment of proficiency.

## Rollback

The web deployment can be reverted to a previously verified commit. Android updates must retain the signing certificate and increase versionCode. Preserve account records and unsent local changes during rollback; versions before account sync use the separate guest workspace.
