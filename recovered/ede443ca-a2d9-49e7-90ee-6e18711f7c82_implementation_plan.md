# Book Overview Redesign Plan

The user requested a complete redesign of the Book Overview layout to match a provided reference image. The reference shows a beautiful, full-page split layout with the book cover floating between a beige top section and a white bottom section.

## Proposed Changes

Currently, the `OverviewModal.tsx` is a smaller popup dialog. To achieve the look in the image while maintaining the current architecture, I propose transforming the `OverviewModal` into a **Full-Content-Area Overlay**.

### 1. Layout Structure
- **Background**: Change from a dark overlay to a solid split background:
  - Top 45% of the modal: Beige (`#F1EEE3`).
  - Bottom 55% of the modal: White (`#FDFBF7`).
- **Positioning**: Make the modal cover the entire main content area (but leave the main sidebar visible by adding a left margin/padding on desktop, or simply making it a full-screen overlay with its own close button).
- **Close Button**: Add a subtle `X` or "Back" button at the top left/right to close the overview.

### 2. Top Section (Beige Area)
- **Book Cover**: A large book cover that is absolutely positioned to bridge the top (beige) and bottom (white) sections.
- **Book Details**: Placed to the right of the cover:
  - Large Serif Title and Author Name.
  - A short, italicized tagline or snippet.
  - A dark pill-shaped "Start reading ↗" button.
  - Circular icon buttons for: Bookmark, Share, Download.

### 3. Bottom Section (White Area)
- **Two-Column Grid**:
  - **Left Column**: "Description" heading followed by the book's full synopsis. Below that, a mock "Review" section (e.g., Roberto Jordan).
  - **Right Column**: Metadata sections: "Editors", "Language", and "Paperback" (pages, ISBN, etc.).

## Open Questions

1. **Routing vs Modal**: Do you want me to keep this as a **Modal** (which pops up instantly when a book is clicked) but styled to look like a full page? Or do you want me to convert it into a completely new **Page** (e.g., navigating to `/book/123`)? Keeping it as a modal is faster and smoother, but making it a page is better if you want users to be able to refresh or share the URL.
2. **Top Header**: The image shows a search bar and profile at the very top. If we keep it as a Modal, we can either hide the header while the modal is open, or recreate a fake header/back button inside the modal. Which do you prefer?

## Verification
- Ensure the modal is fully responsive (stacking the columns on mobile).
- Ensure the floating book cover uses the correct z-index to overlap the two background colors.
- Verify the bookmark save state works exactly as before.