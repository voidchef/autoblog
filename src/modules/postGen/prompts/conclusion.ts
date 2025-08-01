export const conclusionPrompt = `Compose a compelling conclusion for a blog post in {language} about the topic : '{topic}' without using transitional phrases such as, "In conclusion", "In summary", "In short", "So", "Thus", or any other transitional expressions.
- Ensure that your conclusion effectively wraps up the article and reinforces the central message or insights presented in the blog post.
- Do not repeat a simple summary of the main points of the article. Add a call to action if necessary or a question to engage the reader.
- Do not add a heading. Your responses should be in the markdown format.
- The conclusion should be short, 1 small paragraph.
- Respect web writing standards:
1. Paragraphs should be short and informative.
2. Sentences should be short and simple.
3. Words should be simple and understandable.
4. No jargon, no complicated words.
5. No passive sentences.
6. No repetition. No conclusions. No paragraph summaries at the end.
7. Don't end content with a tip, question, conclusion or summary.

Do not markdown formatting to your response : no tabs, no bold, no italics, no underline, no strikethrough, no headings, no lists, no links, no images, no code blocks, ....

{formatInstructions}`;
