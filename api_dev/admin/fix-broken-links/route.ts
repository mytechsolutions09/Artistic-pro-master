import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key is not configured.' },
        { status: 500 }
      );
    }

    const { content, cover_image, brokenLinks } = await request.json();

    if (!content || !brokenLinks || !Array.isArray(brokenLinks)) {
      return NextResponse.json(
        { error: 'Content and brokenLinks array are required.' },
        { status: 400 }
      );
    }

    // Prepare the model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // The prompt for Gemini
    const prompt = `
You are an expert content editor. We have found broken links in a blog post.
Here are the broken URLs:
${brokenLinks.map((bl: any) => `- ${bl.url} (${bl.status})`).join('\n')}

Please review the provided blog content and cover image, and replace these broken links.
Rules:
1. If the broken link is an image URL (e.g. used in an <img src="..."> or Markdown ![alt](url) or the cover_image), replace it with a highly relevant, working placeholder image from Unsplash (e.g., https://images.unsplash.com/photo-...).
2. If the broken link is a hyperlink (e.g. <a href="..."> or [text](url)), replace it with a working, generic, high-authority link relevant to the text (e.g. Wikipedia), or if you can't find a good one, simply remove the link formatting and keep the plain text.
3. Keep the rest of the content exactly as it is.

Here is the data:
Cover Image URL: ${cover_image || ''}
Content:
${content}

Return a valid JSON object with the updated fields (return the full text for these fields, not diffs):
{
  "cover_image": "...",
  "content": "..."
}

Do NOT include Markdown code block formatting (like \`\`\`json) in the response, just the raw JSON object.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Try to parse the JSON response
    try {
      const cleanedText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const fixedData = JSON.parse(cleanedText);
      
      return NextResponse.json(fixedData);
    } catch (parseError) {
      console.error('Error parsing Gemini JSON response:', parseError);
      console.log('Raw response:', text);
      return NextResponse.json(
        { error: 'Failed to parse AI response. Try again.' },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Error fixing broken links:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error.' },
      { status: 500 }
    );
  }
}
