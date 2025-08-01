export const seoPrompt = `For the following content post (Delimited below with ****) based on the topic of this conversation, write a H1, a SEO title, a SEO description and a slug. 
- The H1 and the title should be different.
- The SEO title should be no more than 60 characters long.
- The SEO description should be no more than 155 characters long.
- Use the main keywords for the slug based on the topic of the post. Do not mention the country. Max 3 or 4 keywords, without stop words, and with text normalization and accent stripping.
- Write the SEO information in the same language as the content of the post.
- For the title, the headings and the SEO Title :  capitalize words in function of the language of the content :
    In English : capitalize the first word and all nouns, pronouns, adjectives, verbs, adverbs, and subordinate conjunctions ("as", "because", "although").
    In French : Capitalize ONLY the first word and proper nouns.
    For other languages, apply the usual rules for capitalization.

Your response has to be in the following JSON format: 
{formatInstructions}

Here is the content topic
****
{content}
****`;
