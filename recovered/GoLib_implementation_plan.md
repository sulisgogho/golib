# Redesign Library Page

The user requested a complete layout redesign of the Library page to match the provided screenshot. The new design features a reversed background split (White on the left, Beige on the right), a large carousel of books, and reorganized top headers.

## Open Questions

- The current library page displays progress bars for books you are currently reading. The new screenshot design doesn't explicitly show progress bars on the book covers. Should we remove the progress bars, or adapt them to fit the new cover cards?
- The new design has a "Start reading" button on the left and an author bio/description on the right. We will dynamically populate this data based on the currently selected/featured book in the carousel.

## Proposed Changes

### `src/app/(main)/layout.tsx`
[MODIFY] Remove the hardcoded `linear-gradient` background. This allows individual pages to define their own background splits.

### `src/app/(main)/page.tsx`
[MODIFY] Add the original background gradient (55% Beige, 45% White) as an absolute `-z-10` layer so the Home page remains unchanged.

### `src/app/(main)/library/page.tsx`
[MODIFY] Completely rewrite the layout:
1. **Background**: Add a new reversed background gradient (45% White, 55% Beige).
2. **Top Layout**:
   - Left side (White): Search bar, "Keep the story going.." header, and "Start reading" button.
   - Right side (Beige): User profile, Author info block, and Book description.
3. **Carousel Section**:
   - Create a horizontal flex or grid layout for books.
   - The featured book will be scaled up and positioned precisely to overlap the 45% background boundary line.
   - Other books will be scaled down slightly and scrollable horizontally.
4. **Bottom Layout**:
   - Add pagination arrows (Left/Right) and footer text as shown in the mockup.

## Verification Plan
1. Ensure the Home page layout is unaffected and maintains its original background split.
2. Verify the Library page matches the screenshot, with the featured book perfectly overlapping the new background boundary.
3. Ensure the carousel controls function properly to select different books.