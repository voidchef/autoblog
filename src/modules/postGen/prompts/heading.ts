export const headingPrompt = `Based on the blog post outline, compose some informative content for the heading  "{headingTitle}" in {language}.
- Do not add the heading in your response.
- Use the following keywords in the content : {keywords}.
- Do not repeat ideas or information from the introduction or other headings.
- Respect web & SEO writing standards:
1. Paragraphs should be short and informative.
2. Sentences should be short and simple.
3. Words should be simple and understandable.
4. No jargon, no complicated words.
5. No passive sentences.
6. No repetition of ideas already present in the previous headers. 
7. No conclusion. No paragraph summaries at the end of this content.
8. Format the content according to the usual rules for the SEO content/copywriting. 
9. IMPORTANT : do NOT end the content with a tip, question, conclusion or summary.

{formatInstructions}`;
