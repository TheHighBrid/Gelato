# Website Audit Skill

A Claude skill that performs comprehensive website content and UX audits. It combines content editing, UX strategy, creative direction, and technical QA into a single structured review.

Built by a Head of Product Design who got tired of launching websites with broken stats, lorem ipsum hiding in corners, and copy that switched dialects mid-sentence.


## What it does

Give it a URL and it will crawl every page, read every word, and produce a structured audit document covering:

- **Content & copy quality** — spelling, grammar, dialect consistency (PT-BR vs PT-PT, US vs UK English), placeholder text, weak copy, missing content
- **UX structure** — page flow, narrative arc, self-selection, cognitive load, missing sections (FAQ, "how it works", final CTA)
- **Conversion** — CTA clarity, pricing presentation, social proof placement, objection handling, urgency signals
- **Creative direction** — brand voice consistency, content hierarchy, pacing, emotional arc
- **Technical QA** — broken links, duplicate content, alt text quality, SEO basics
- **Product/course deep-dive** — for sites with multiple offerings, checks every individual page for completeness and consistency

The output is a downloadable markdown file with every issue categorised by severity, corrected text where applicable, and a priority action plan.


## What's in the box

```
website-audit/
├── SKILL.md              — The main skill (audit methodology + output format)
├── references/
│   └── checklist.md      — Detailed checklist with 50+ individual checks
└── README.md             — You're reading it
```


## How to install

Drop the entire `website-audit` folder into your Claude skills directory:

```
/mnt/skills/user/website-audit/
```

That's it. Claude will pick it up automatically.


## How to use

Just ask Claude to audit a website. Any of these will trigger it:

- "Audit this website: [url]"
- "Review my site before launch: [url]"
- "Check my website content: [url]"
- "What's wrong with my landing page?"
- "Full content review of [url]"
- "Is my website ready to launch?"

The first time you use it, Claude will ask you a few context questions:

1. What is your product?
2. Link to the product
3. Who are your focal users?
4. What do you feel could improve?
5. How would you like to be seen?
6. What language(s) is the site in?
7. Is there a launch deadline?

If you've already provided some of this context in the conversation, Claude will skip those questions and confirm what it knows.

After that, it crawls every page and produces the audit.


## What the output looks like

You get a markdown file with this structure:

```
# [Site Name] — Website Audit

> Audit date, pages reviewed, URL

## Executive Summary
## Critical Issues (fix before launch)
## Content & Copy Issues
## UX & Structure Issues
## Conversion Issues
## Content Improvements by Page
## Technical Issues
## Priority Action Plan
```

Every issue is tagged with a severity marker:

| Marker | Meaning |
|--------|---------|
| 🔴 CRITICAL | Fix before launch. Will damage credibility or conversion. |
| 🟡 IMPORTANT | Fix in week one. Noticeable quality issue. |
| 🟢 NICE TO HAVE | Improve when possible. Polish and refinement. |
| ⚠️ | Text correction (grammar, spelling, dialect) |
| 💡 | Strategic suggestion (new section, rewrite, structural change) |

The priority action plan at the end gives you a clear table of what to do first.


## Language support

The skill works with any language, but has specific support for catching dialect issues in:

- **Portuguese** — PT-BR vs PT-PT (post-reform spelling, vocabulary, verb forms, article usage)
- **English** — US vs UK spelling and conventions

The references/checklist.md file includes a detailed PT-BR vs PT-PT comparison table for common issues.


## Tips for best results

- **Share the URL first.** The more context Claude has before starting, the fewer questions it needs to ask.
- **Mention your concerns.** If you already know something feels off, say so. It helps focus the audit.
- **Ask for per-page correction docs.** For large sites, you can ask Claude to produce individual correction files for each page (e.g. "now give me a corrections doc for the about page").
- **Run it before launch.** That's when it's most valuable. Catching a zeroed-out stats section before your audience does is worth the 10 minutes.


## Who made this

Recipe skill by [ajota.uk](https://ajota.uk/)

If you're a designer, product person, or founder who ships websites, this will save you from the things you always miss on the final check.
