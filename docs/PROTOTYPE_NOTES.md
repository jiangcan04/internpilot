# InternPilot UI prototype

A buildless Chinese-language UI design for a university internship agent. All jobs, companies, match scores, dialogue, and collection runs are synthetic demonstration data. No recruitment account, collection engine, model API, or outbound messaging is connected.

## Screens

- Dashboard: summary, recommendations, saved jobs, missing evidence, activities.
- Search results: retrieval, deduplication and explainable preliminary screening. Results are suggestions, not automatic admissions to the followed job pool. Hard-condition mismatches are hidden by default but can be viewed and explicitly kept. Unknown requirements remain uncertain; match scores are not admission thresholds.
- Followed job pool: user-selected jobs only, manual addition from pasted JD, duplicate review, reversible removal, archive/restore for jobs with application history, and batch selection.
- Job pool: three views (全部跟进 / 只看收藏 / 已归档). Favorites remain a priority flag inside the pool, with no separate sidebar module. Counts, composed filters, sorting and bulk actions follow the current view; clearing filters preserves that view.
- Desktop job workspace: job content and one embedded assistant side by side, with evidence comparison, original JD, editable greetings and application record.
- Select job text to reveal a single “向助手提问” button. Clicking attaches a removable citation to the composer without sending, preserving the job text. Citations retain job identity in conversation history.
- Persistent contextual assistant: query examples, evidence clarification, confirmation, local updates.
- Application manager: state tabs, batch applied marking, dates, notes, undo.
- Profile: three submodules for preferences, resume material, and experience/skills. Experience records support manual entry or guided conversation, factual fields, source labels, confirmation, editing, deletion, undo, and profile versions.
- First-run onboarding, history, settings, design notes, global search and notices.
- Responsive tablet/mobile layouts; mobile assistant drawer; keyboard search and modal navigation.

## State boundaries

Data persists only in this browser using localStorage. Copying a greeting does not alter application status. Changing profile conditions recalculates condition conflicts; existing application states remain intact. A simulated failed save preserves the old states.

Favorites mark important jobs inside the active pool. Favoriting a search result also retains it in the pool. Removing a favorite does not remove pool membership or application history. Counts and reversible actions update across results, pool views and applications. Toggling a favorite in the detail workspace preserves unsaved text in the greeting editor.

The canonical browser-local catalog retains source records; `resultIds` identifies the latest retrieved batch and `inPool`/`archived` tracks user follow-up choices. Retrieving or re-retrieving jobs preserves existing notes, drafts, dates, favorites and application history without adding new jobs to the pool. Explicit actual-application confirmation retains the job. Removing a job with application history archives it rather than erasing it. Manual jobs retain exact pasted JD, unknown conditions and unverified source links; their semantic matching and numerical scores are not fabricated. Duplicate manual additions preserve application records. Legacy data migrates user intent and history, while manual jobs survive reload instead of being restricted to demo IDs.

Experience drafts never persist to the profile until the user confirms. A draft originating in chat can be used only within that job's conversation instead of updating the shared archive. User statements are retained as statements, and profile evidence is distinguished from qualification judgments. Synthetic match scores do not automatically increase when users add facts. Related evidence explanations update without changing application data. Existing legacy evidence flags are retained as historical records requiring more detail, rather than treated as independent proof of proficiency.

## Validation

`node --check dist/app.js`, `node --check dist/experience.js`, `node --check dist/job-pool.js`, and `node checks.cjs` check syntax, view rendering, separate result/pool scopes, screening, manual job addition and deduplication, preservation across reload, archive/restore, contextual quote handling, experience confirmation, application data isolation, undo, failed persistence and sample task recovery. These are VM-based logic checks, not browser interaction or visual verification. Browser visual QA is not available in the current tool environment. The contextual job workspace targets desktop web.

## Demo account flow

The entry page now explicitly offers two **demo accounts**, with no password or identity verification. The header avatar and sidebar account button expose profile, account switching and logout. First login to the primary account copies pre-existing browser-local data into its account key, leaving the legacy key intact. The secondary account starts with an empty followed pool and no application history. Profiles, experiences, drafts already saved as records, favorites, source catalogs, chats and application records persist in separate browser-local keys. Session state survives refresh; logout retains saved data and clears transient inputs, undo context and running demo tasks. Cross-tab session changes return other tabs to account selection. Storage failures block a transition instead of silently losing data.

This is a UI and local data workflow demonstration, not an authentication or access-control implementation. It does not verify a person's identity, secure data between browser users, synchronize across devices, or sign in to recruitment platforms. Production use requires server-backed authentication, authorization and per-user storage. Use synthetic data while reviewing the prototype.

Validation: `node checks.cjs` and `node checks-auth.cjs`. Browser visual QA was unavailable in the managed environment.
