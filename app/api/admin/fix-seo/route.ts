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

    const { blogData, issueName, issueMessage } = await request.json();

    if (!blogData) {
      return NextResponse.json(
        { error: 'Blog data is required.' },
        { status: 400 }
      );
    }

    // Prepare the model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // The prompt for Gemini
    const prompt = `
You are an expert SEO blog writer. You are reviewing a blog post and an SEO tool has flagged the following issue:
Issue Name: ${issueName}
Issue Details: ${issueMessage}

Here is the current blog post data:
Title: ${blogData.title}
Slug: ${blogData.slug}
Focus Keyphrase: ${blogData.focus_keyphrase}
SEO Title: ${blogData.seo_title}
SEO Description: ${blogData.seo_description}
Content: ${blogData.content}

Please fix this specific SEO issue by updating the relevant fields. Keep the changes minimal and focused primarily on resolving the issue, but ensure it remains natural and engaging. Do not drastically rewrite the entire post unless necessary to fix the issue.

Return a valid JSON object with the updated fields (return the full text for these fields, not diffs):
{
  "title": "...",
  "slug": "...",
  "content": "...",
  "seo_title": "...",
  "seo_description": "..."
}

Ensure the content is well-written and professional. Do NOT include Markdown code block formatting (like \`\`\`json) in the response, just the raw JSON object.
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
    console.error('Error fixing SEO issue:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error.' },
      { status: 500 }
    );
  }
}
