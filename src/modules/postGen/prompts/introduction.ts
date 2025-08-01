export const introductionPrompt = `Based on the post outline, compose a blog post introduction in {language} about the topic : '{topic}' 
- Without using phrases such as, "In this article,..." to introduce the subject.
- Instead, explain the context and/or explain the main problem. 
- If necessary, mention facts to help the user better understand the context or the problem. 
- Do not describe or introduce the content of the different headings of the outline.'
- Do not add the title in the beginning of the introduction.
- The introduction should be short, 1 small paragraph.
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
