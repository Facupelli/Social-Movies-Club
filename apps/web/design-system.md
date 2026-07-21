# Design System

## Purpose

This document defines the visual language of Social Movies Club.

It provides shared rules for humans and AI coding agents when creating or modifying interfaces. It intentionally avoids prescribing individual screens or components. New UI should be derived from these principles and the semantic design tokens.

## Product character

Social Movies Club is a mobile-first, dark, social and content-led application.

The interface should feel:

* Personal rather than algorithmic.
* Cinematic without becoming decorative.
* Familiar and easy to scan.
* Compact without feeling crowded.
* Modern without relying on visual trends.
* Consistent across existing and future features.

Movie and series artwork provides most of the visual variety. Application chrome should remain neutral and restrained.

## Core principles

### Mobile first

Mobile is the primary product experience.

Design every interface for narrow screens first. Desktop layouts are progressive enhancements that may introduce additional columns, wider content areas or persistent navigation, but they must preserve the same hierarchy and interaction model.

Do not design a desktop interface and then compress it for mobile.

### Content before chrome

Content should dominate the screen.

Navigation, containers, dividers and controls should help users understand and interact with the content without attracting unnecessary attention.

Avoid decorative gradients, glows, glass effects, textures and prominent shadows.

### Clear hierarchy

Every interface should communicate:

1. What the user is looking at.
2. Which information is most important.
3. Which action is primary.
4. Which information is supporting context.

Create hierarchy through spacing, typography, contrast and placement before introducing additional containers or colors.

### One primary accent

Violet is the only primary interactive accent.

Use it for:

* Primary actions.
* Links.
* Selected states.
* Active indicators.
* Focus rings.
* Important values.
* Unread or attention indicators.

Do not introduce another accent color for navigation or selection.

Semantic colors are reserved for success, warning and destructive meaning.

### Consistency over novelty

Reuse existing visual rules before inventing new ones.

Elements with equivalent importance or behavior should share the same treatment across the application.

A new component should feel like a natural combination of existing surfaces, typography, spacing and interaction rules.

### Accessibility is part of the design

Every interface must remain understandable without relying exclusively on color, hover or visual decoration.

Keyboard focus, readable contrast, touch target size and clear states are required parts of the visual system.

## Responsive strategy

Start with the smallest supported viewport.

Mobile interfaces should:

* Use a single primary content column.
* Prioritize the most important information and actions.
* Use horizontal padding of approximately `16px`.
* Avoid fixed widths.
* Avoid interactions that depend on hover.
* Keep primary actions easily reachable.
* Use progressive disclosure for secondary information.
* Preserve at least `40 × 40px` interactive areas, preferably `44 × 44px`.

Larger screens may:

* Increase page padding.
* Constrain content to a readable maximum width.
* Introduce persistent navigation.
* Place related content side by side.
* Display more items per row.
* Expose secondary information that is collapsed on mobile.

Desktop should not enlarge every element proportionally. It should use the extra space to improve composition and visibility while keeping comfortable content density.

Use responsive layouts based on available space rather than device names whenever practical.

## Color system

The application is dark-only until a complete light theme is intentionally designed.

### Surfaces

Use a limited surface hierarchy:

| Token        | Purpose                          |
| ------------ | -------------------------------- |
| `background` | Outermost application background |
| `surface`    | Primary page or content region   |
| `card`       | Grouped or interactive content   |
| `elevated`   | Content layered above the page   |

Avoid assigning a different gray to every component.

Adjacent surfaces should be distinguishable without creating strong contrast between every region.

### Text

| Token               | Purpose                          |
| ------------------- | -------------------------------- |
| `foreground`        | Primary text                     |
| `muted-foreground`  | Supporting information           |
| `subtle-foreground` | Timestamps and tertiary metadata |

Primary text should be easy to scan. Supporting text must remain readable and should not depend on very low opacity.

### Brand

| Token                | Purpose                              |
| -------------------- | ------------------------------------ |
| `primary`            | Main violet accent                   |
| `primary-hover`      | Hovered or emphasized primary state  |
| `primary-subtle`     | Selected and highlighted backgrounds |
| `primary-foreground` | Content placed over solid violet     |

Use solid primary surfaces sparingly so important actions and values remain distinctive.

### Semantic colors

Semantic colors communicate meaning, not decoration.

* Red represents destructive or critical states.
* Green represents successful or available states.
* Amber represents warning or incomplete states.

Do not use semantic colors where neutral or primary styling is sufficient.

## Typography

Use one sans-serif family throughout the product. Prefer Geist or Inter.

Use a compact type scale:

| Role              | Size |  Weight |
| ----------------- | ---: | ------: |
| Page heading      | 24px |     700 |
| Section heading   | 20px | 600–700 |
| Prominent content | 18px | 600–700 |
| Body              | 16px |     400 |
| Compact text      | 14px | 400–500 |
| Caption           | 13px | 400–500 |

Use a line height between `1.35` and `1.5`.

Typography should create hierarchy without requiring several font sizes inside one small region.

Avoid excessive bold text. When everything is emphasized, nothing is emphasized.

Titles may wrap when necessary. Do not truncate important identity or content information unless users can access the complete value elsewhere.

## Spacing

Use Tailwind’s four-pixel spacing rhythm.

Preferred values:

|  Value | Typical relationship                |
| -----: | ----------------------------------- |
|  `4px` | Fine alignment and icon adjustments |
|  `8px` | Closely related elements            |
| `12px` | Compact internal spacing            |
| `16px` | Standard padding and separation     |
| `24px` | Groups of related content           |
| `32px` | Sections                            |
| `48px` | Large intentional separation        |

Spacing should communicate relationships:

* Related elements stay close together.
* Separate ideas receive more space.
* Container padding should be consistent at equivalent hierarchy levels.
* Empty space must be intentional rather than caused by fixed heights.

Avoid arbitrary values unless required by artwork proportions or layout calculations.

## Layout and composition

Use a single-column foundation.

The primary content region should:

* Fill the mobile viewport width.
* Use consistent horizontal padding.
* Avoid unnecessary nested containers.
* Keep reading order clear.
* Maintain predictable vertical rhythm.

On wider screens, constrain content to a readable maximum width instead of stretching it across the viewport.

Different content types may require different maximum widths, but the visual alignment of headers, controls and content should remain consistent within a page.

Use grids only when items have equivalent importance and comparable structure. Use vertical flow when content has a natural chronological, narrative or hierarchical order.

When space becomes limited:

1. Preserve essential content.
2. Reduce columns.
3. Move secondary information below primary information.
4. Collapse optional controls.
5. Hide information only as a final option.

## Surfaces and containment

Use containment only when it helps users understand grouping, interactivity or hierarchy.

A surface may be communicated through:

* Background contrast.
* A border.
* Spacing.
* Position.
* Elevation.

Do not automatically place every piece of content inside a rounded card.

Use cards when content represents a distinct object, grouped action or independent interactive region.

Use dividers when content belongs to a continuous list or feed.

Avoid multiple nested bordered containers. Prefer spacing and typography inside an already established surface.

## Borders, radius and elevation

Use neutral borders for structure.

Violet borders are reserved for focus, selection or active interaction.

Use one-pixel borders and a small radius scale:

| Token         |  Value |
| ------------- | -----: |
| `radius-sm`   |    8px |
| `radius-md`   |   12px |
| `radius-lg`   |   16px |
| `radius-full` | 9999px |

Use:

* Small radius for compact controls and badges.
* Medium radius for standard containers and inputs.
* Large radius for prominent or elevated surfaces.
* Full radius for avatars, pills and circular controls.

Most application content should not use prominent shadows.

Use elevation only when content is temporarily or spatially above another layer, such as dialogs, menus and popovers.

## Imagery

Poster and profile imagery are central to the product identity.

Preserve the natural aspect ratio of media artwork. Posters use the standard `2 / 3` ratio.

Do not crop artwork arbitrarily when `object-cover` would remove meaningful content. Use consistent image dimensions among equivalent items.

Images should have predictable loading placeholders that preserve final layout dimensions.

Overlays should be used sparingly and only when their relationship to the image is immediately clear.

Avoid placing several unrelated controls over the same image.

## Interaction

Interactive elements must define:

* Default.
* Hover where applicable.
* Focus-visible.
* Active.
* Selected where applicable.
* Disabled.
* Loading where applicable.

Hover should enhance feedback but never reveal functionality unavailable to touch users.

Use subtle changes in background, foreground or border. Avoid movement-based hover effects for ordinary controls.

Use transitions between `150ms` and `200ms` for colors, borders and backgrounds.

Respect reduced-motion preferences.

Primary actions should be visually distinct from supporting actions. A small region should usually contain only one clearly primary action.

Icon-only actions require accessible labels.

## Visual density

The interface should be compact but readable.

Prefer reducing unnecessary containers and duplicated labels before reducing spacing or font size.

Metadata should be visually quieter than names, titles and ratings.

Secondary information may be grouped into concise rows rather than distributed across several distant regions.

On mobile, prioritize the information needed to understand the content and make the next decision. Additional detail may use progressive disclosure.

## States and feedback

Every data-driven interface should account for:

* Loading.
* Empty.
* Error.
* Partial or unavailable information.
* Success after an action.

State presentation should preserve the layout’s visual language.

Loading placeholders should resemble the expected content rather than using generic centered spinners for entire pages.

Empty states should remain near the relevant content region. They should contain a concise explanation and a clear next action only when one exists.

Error states should explain what failed and provide recovery when possible without appearing visually destructive unless data loss or danger is involved.

## Deriving components from the system

When designing any component, determine:

1. Its importance relative to surrounding content.
2. Whether it needs containment.
3. Its primary piece of information.
4. Its primary action.
5. Which information is supporting metadata.
6. How it behaves on the smallest viewport.
7. Which semantic tokens express its states.

For example, a content card can be derived by combining:

* A suitable surface.
* Standard internal spacing.
* A clear typography hierarchy.
* Consistent media proportions.
* Muted supporting metadata.
* One visually dominant action or value.
* Responsive stacking before multi-column presentation.

The design system should be applied through composition rather than through hard-coded component-specific styling.

## AI implementation rules

When creating or modifying UI:

* Begin with the mobile layout.
* Use semantic theme tokens instead of hard-coded colors.
* Use existing shadcn primitives where appropriate.
* Reuse established application components before creating new ones.
* Follow the spacing, typography and radius scales.
* Use violet only for interaction, selection and emphasis.
* Use neutral borders for structure.
* Avoid unnecessary nested cards.
* Preserve artwork aspect ratios.
* Include relevant loading, empty, error, disabled and focus states.
* Do not depend on hover for essential behavior.
* Validate the interface at narrow and wide viewport sizes.
* Do not redesign unrelated UI during focused changes.
* Prefer the simplest composition that communicates the hierarchy clearly.


