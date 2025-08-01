export const outlinePrompt = `I need a detailed blog post outline in {language} about the topic: '{topic}'.
    - Write this post outline structure/headings based on the copywriting concept called 'inverted pyramid'.
    - For the title, the headings and the SEO Title :  capitalize words in function of the language: {language} :
        In English : capitalize the first word and all nouns, pronouns, adjectives, verbs, adverbs, and subordinate conjunctions ("as", "because", "although").
        In French : Capitalize ONLY the first word and proper nouns.
        For other languages, apply the usual rules for capitalization.

    - Do not use the same for words for the first title (top of the inverted pyramid) and the SEO title
    - Please make sure your title and headings are clear and concise.
    - for the SEO description : be concise ! 150 characters max. Make a short summary that will make the reader want to read the article.

    - for the slug : use the main keywords with dashes between words, without stop words, and all words in lowercase.

    - Country: {country}.
    - Audience: {audience}.
    - Intent: {intent}.

IMPORTANT: Do not add a heading in the JSON for an introduction, a conclusion, or to summarize the article in the post outline. We will add them later.`;
