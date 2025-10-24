# Example Blog Template

This is an example template for generating AI-powered blogs. You can customize it for your needs.

## How to Use This Template

1. **System Prompt**: Define the overall context and role (using `{{s: ... }}`)
2. **Content Sections**: Add content prompts for each section (using `{{c: ... }}`)
3. **Image Sections**: Add image generation prompts (using `{{i: ... }}`)
4. **Variables**: Use `{variableName}` format for dynamic content

---

{{s: You are an expert content writer specializing in {topic}. Write a comprehensive, SEO-optimized blog post for {audience} audience. Use a {tone} tone and include practical examples. The content should be engaging, informative, and well-structured with clear headings. }}

{{c: Write an attention-grabbing introduction about {topic}. Start with a compelling hook, explain why this topic matters to {audience}, and provide a brief overview of what the article will cover. Keep it concise (2-3 paragraphs). }}

{{c: Explain what {topic} is in detail. Define key concepts, provide context, and ensure even beginners can understand. Use analogies or real-world examples if helpful. Include 3-4 paragraphs with clear explanations. }}

{{c: Discuss the main benefits and advantages of {topic} for {audience}. List at least 5 key benefits with brief explanations for each. Use bullet points or numbered lists for clarity. }}

{{i: Create a professional infographic showing the top 5 benefits of {topic} with icons }}

{{c: Provide practical tips and best practices for implementing {topic}. Include actionable advice that readers can apply immediately. Use a numbered list with detailed explanations for each tip. Aim for 5-7 practical tips. }}

{{c: Address common challenges, mistakes, or misconceptions about {topic}. Explain what to avoid and why. This helps readers learn from common pitfalls. Include 3-5 challenges with solutions. }}

{{i: Design a comparison chart or visual showing common mistakes vs best practices for {topic} }}

{{c: Share real-world examples, case studies, or success stories related to {topic}. Make it relevant to {audience} and show practical applications. Include specific details and results when possible. }}

{{c: Discuss future trends and predictions for {topic}. What's coming next? How should {audience} prepare? Keep it forward-thinking and insightful (2-3 paragraphs). }}

{{c: Write a strong conclusion that summarizes the key points about {topic}. Include a clear call-to-action encouraging readers to implement what they've learned. End with an inspiring or thought-provoking statement. }}

{{i: Create a visually appealing summary graphic highlighting the main takeaways from the article }}

---

## Template Variables Used

- **{topic}**: The main subject of your blog (e.g., "Machine Learning", "Content Marketing")
- **{audience}**: Your target readers (e.g., "beginners", "small business owners", "developers")
- **{tone}**: Writing style (e.g., "professional", "casual", "conversational", "technical")

## Customization Tips

1. **Add More Sections**: Include additional `{{c: ... }}` tags for more content sections
2. **Add More Images**: Include more `{{i: ... }}` tags where visual content would enhance understanding
3. **Adjust Detail Level**: Modify prompts to request more or less detail (e.g., "Write 5 paragraphs" vs "Write 2-3 paragraphs")
4. **Specify Format**: Request specific formats like "Create a table comparing...", "Write a bulleted list...", etc.
5. **Add Your Variables**: Create custom variables like `{industry}`, `{product_name}`, `{location}`, etc.

## Example Usage

When using this template, you might fill in the variables like:
- **topic**: "Email Marketing Automation"
- **audience**: "small business owners"
- **tone**: "friendly and practical"

This would generate a complete blog post about Email Marketing Automation tailored for small business owners with a friendly tone!
