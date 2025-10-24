# Template Feature - User Guide Resources

This document lists all user-facing resources for the template feature.

## 📥 Downloadable Templates

### 1. General Blog Template
**Location:** `/autoblog/front/public/example-blog-template.md`

**Description:** A comprehensive template for creating any type of blog post with 3 variables.

**Variables:**
- `{topic}` - The main subject of the blog
- `{audience}` - Target readers (e.g., "beginners", "small business owners")
- `{tone}` - Writing style (e.g., "professional", "casual", "friendly")

**Structure:**
- 1 system prompt
- 9 content sections (introduction, definition, benefits, tips, challenges, examples, trends, conclusion)
- 3 image sections (infographic, comparison chart, summary graphic)

**Best For:** General-purpose blogs, educational content, marketing articles

**Download from UI:** "General Blog Template" button

---

### 2. Dog Breed Guide Template
**Location:** `/autoblog/front/public/dog-breed-template.md`

**Description:** A specialized template for creating comprehensive dog breed guides with 1 variable.

**Variables:**
- `{breed}` - The dog breed name (e.g., "Golden Retriever", "Beagle")

**Structure:**
- 1 system prompt
- 9 content sections (introduction, physical characteristics, temperament, care, health, environment, training, family compatibility, conclusion)
- 2 image sections (breed photo, care infographic)

**Best For:** Pet blogs, breed comparisons, dog owner resources

**Download from UI:** "Dog Breed Guide Template" button

---

## 📖 Documentation

### User-Facing Documentation

#### 1. In-App Helper (Accordion)
**Location:** `TemplateUpload` component

**Content:**
- Template structure explanation ({{s:}}, {{c:}}, {{i:}} tags)
- Variable syntax with live example
- Best practices checklist
- Download buttons for example templates

**Access:** Expand the "How to Create a Blog Template" section in the Create Post page (Template mode)

#### 2. Quick Reference Guide
**Location:** `/autoblog/docs/TEMPLATE_QUICK_REFERENCE.md`

**Content:**
- Template syntax table
- Variable rules
- Simple and complete examples
- Best practices (Do's and Don'ts)
- Common patterns (Blog, Product Review, How-To)
- Variable strategies
- Testing guidelines

**Use Case:** Quick lookup for syntax and patterns

#### 3. Complete Feature Documentation
**Location:** `/autoblog/docs/TEMPLATE_FEATURE.md`

**Content:**
- Full technical explanation
- Detailed workflow
- API endpoints
- Error handling
- Advanced usage
- Troubleshooting

**Use Case:** Comprehensive understanding of the feature

#### 4. Quick Start Guide
**Location:** `/autoblog/docs/TEMPLATE_QUICK_START.md`

**Content:**
- 5-minute getting started guide
- Step-by-step tutorial with screenshots
- Common use cases
- Tips and tricks

**Use Case:** New users getting started quickly

---

## 🎨 UI Components with Helper Notes

### TemplateUpload Component

**Visual Elements:**

1. **Helper Accordion** (Collapsible)
   - 📋 Template Structure section
     - Visual icons for each tag type
     - Clear descriptions
   
   - 🔤 Using Variables section
     - Code example in a styled box
     - Shows actual variable usage
   
   - ✅ Best Practices section
     - Bulleted list of tips
     - Easy to scan
   
   - 📥 Example Templates section
     - Two download buttons
     - Shows variable count for each

2. **Upload Area** (Drag & Drop)
   - Visual feedback on hover/drag
   - File format hints
   - Size limit display
   - Success state with preview info

3. **Template Preview** (After Upload)
   - Shows extracted variables as chips
   - Displays section counts
   - Visual confirmation of successful parse

---

## 🚀 User Workflow

### For New Users

1. Open Create Post page
2. Toggle to "Template" mode
3. **Expand helper accordion** to learn syntax
4. **Download an example template**
5. Open template in text editor
6. Modify for their needs
7. Upload modified template
8. See preview with extracted variables
9. Fill in variable values in the form
10. Generate blog

### For Experienced Users

1. Create template file with familiar syntax
2. Upload directly
3. Fill variables
4. Generate blog

---

## 📝 Helper Notes Content

### Tag Syntax Help

```
{{s: ... }} - System prompt
Sets the overall context and instructions for the AI

{{c: ... }} - Content section  
Each tag generates one section of content

{{i: ... }} - Image section
Generates an image based on the prompt
```

### Variable Syntax Help

```
Use {variableName} format for dynamic content

Example:
{{s: You are writing about {topic} for {audience} }}
{{c: Write an introduction about {topic} }}

Variables: topic, audience (you'll fill these in later)
```

### Best Practices Help

- Start with a system prompt to set the tone and context
- Use clear, specific prompts for each content section
- Place image prompts after related content sections
- Keep variable names simple and descriptive
- Test your template with different variable values

---

## 🎯 Quick Access Guide

| What You Need | Where to Find It |
|---------------|------------------|
| Example templates to download | UI: Helper accordion → "Example Templates" section |
| Quick syntax reference | UI: Helper accordion → "Template Structure" section |
| Variable usage examples | UI: Helper accordion → "Using Variables" section |
| Best practices tips | UI: Helper accordion → "Best Practices" section |
| Detailed documentation | Docs: `/docs/TEMPLATE_FEATURE.md` |
| Quick start tutorial | Docs: `/docs/TEMPLATE_QUICK_START.md` |
| Syntax cheat sheet | Docs: `/docs/TEMPLATE_QUICK_REFERENCE.md` |
| Example files | Repository: `/front/public/*.md` |

---

## 🔧 Customization Tips

### For Content Creators

1. **Start with dog breed template** if writing about a specific topic
2. **Start with general template** if writing about broad subjects
3. **Modify section prompts** to match your content style
4. **Add/remove sections** based on article length needs

### For Developers

1. Templates are served from `front/public/` directory
2. Add more example templates by placing `.md` files there
3. Update helper accordion in `TemplateUpload.tsx` to add download buttons
4. Template validation is in `template.utils.ts`

---

## 📊 Template Comparison

| Feature | General Template | Dog Breed Template |
|---------|------------------|-------------------|
| Variables | 3 | 1 |
| Complexity | Medium-High | Simple |
| Content Sections | 9 | 9 |
| Image Sections | 3 | 2 |
| Best For | Any topic | Specific breed info |
| Customization | High | Medium |
| Beginner-Friendly | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## 💡 Tips for Template Users

1. **First Time?** Start with the dog breed template - it's simpler (1 variable)
2. **Need Flexibility?** Use the general template - it has 3 variables for more control
3. **Want Custom?** Download either template and modify it in any text editor
4. **Not Sure?** Expand the helper accordion in the UI - it has all the basics
5. **Need More Info?** Check the Quick Reference guide for common patterns

---

## ✅ Checklist for Users

Before creating your first template:
- [ ] Read the helper notes in the UI accordion
- [ ] Download an example template
- [ ] Open it in a text editor to see the structure
- [ ] Understand the three tag types: {{s:}}, {{c:}}, {{i:}}
- [ ] Know how to use variables: {variableName}

When creating your template:
- [ ] Start with a system prompt ({{s:}})
- [ ] Add at least 3-5 content sections ({{c:}})
- [ ] Consider adding image sections ({{i:}}) for visual content
- [ ] Use clear, specific prompts
- [ ] Test with simple variable values first

After uploading:
- [ ] Check that all variables were detected correctly
- [ ] Verify section counts match your expectations
- [ ] Fill in variable values thoughtfully
- [ ] Review generated content and iterate if needed

---

Last Updated: October 23, 2025
