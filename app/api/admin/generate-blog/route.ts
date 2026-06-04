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

    const { keyword } = await request.json();

    if (!keyword) {
      return NextResponse.json(
        { error: 'Keyword is required.' },
        { status: 400 }
      );
    }

    // Prepare the model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // The prompt for Gemini
    const prompt = `
You are an expert SEO blog writer for an online luxury home decor and art store called "Lurevi". 
Write an engaging, SEO-optimized blog post based on the following keyword/topic: "${keyword}".

Please return a valid JSON object with the following structure:
{
  "title": "A catchy, SEO-friendly title",
  "excerpt": "A short 1-2 sentence excerpt summarizing the post",
  "content": "The full blog content in HTML format, structured with <h2>, <h3>, <p>, <ul> etc.",
  "seo_title": "SEO title (around 60 characters)",
  "seo_description": "SEO description (around 150-160 characters)",
  "tags": "comma, separated, tags"
}

Ensure the content is well-written, professional, and tailored to an audience interested in luxury home decor, wall art, and premium gifts in India. Do NOT include Markdown code block formatting (like \`\`\`json) in the response, just the raw JSON object.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Try to parse the JSON response
    try {
      // In case Gemini returns it with markdown json formatting
      const cleanedText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const blogData = JSON.parse(cleanedText);
      
      return NextResponse.json(blogData);
    } catch (parseError) {
      console.error('Error parsing Gemini JSON response:', parseError);
      console.log('Raw response:', text);
      return NextResponse.json(
        { error: 'Failed to parse AI response. Try again.' },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Error generating blog:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error.' },
      { status: 500 }
    );
  }
}
