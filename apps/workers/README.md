# Workers

This app is a placeholder for future background job workers.

Background job processing is currently handled within the `apps/api` application
via the `src/workers/` directory (e.g., `MediaModule` for media processing).

This standalone workers app is reserved for extracting heavy background processing
into a dedicated service when the application needs to scale independently.

## Planned Workers

- Media processing (image/video transcoding)
- Search index synchronization
- Email queue processing
- Scheduled tasks (cleanup, reports)

## Note

The `apps/workers` package is intentionally excluded from production builds until
it contains meaningful implementation.
