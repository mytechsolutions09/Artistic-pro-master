import { BlogPost } from '../services/blogService';

export interface SeoCheckResult {
  name: string;
  status: 'good' | 'warning' | 'error';
  message: string;
}

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'arent', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'cant', 'cannot', 'could', 'couldnt', 'did', 'didnt', 'do', 'does', 'doesnt', 'doing', 'dont', 'down', 'during',
  'each', 'few', 'for', 'from', 'further', 'had', 'hadnt', 'has', 'hasnt', 'have', 'havent', 'having',
  'he', 'hed', 'hell', 'hes', 'her', 'here', 'heres', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'hows',
  'i', 'id', 'ill', 'im', 'ive', 'if', 'in', 'into', 'is', 'isnt', 'it', 'its', 'itself', 'lets',
  'me', 'more', 'most', 'mustnt', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other',
  'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shant', 'she', 'shed', 'shell', 'shes',
  'should', 'shouldnt', 'so', 'some', 'such', 'than', 'that', 'thats', 'the', 'their', 'theirs', 'them', 'themselves',
  'then', 'there', 'theres', 'these', 'they', 'theyd', 'theyll', 'theyre', 'theyve', 'this', 'those', 'through',
  'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasnt', 'we', 'wed', 'well', 'were', 'weve', 'werent',
  'what', 'whats', 'when', 'whens', 'where', 'wheres', 'which', 'while', 'who', 'whos', 'whom', 'why', 'whys',
  'with', 'wont', 'would', 'wouldnt', 'you', 'youd', 'yoll', 'youre', 'youve', 'your', 'yours', 'yourself', 'yourselves'
]);

export function runSeoAnalysis(params: {
  content: string;
  title: string;
  slug: string;
  seoTitle: string;
  seoDescription: string;
  keyphrase: string;
  existingPosts: BlogPost[];
  currentPostId: string | null;
  coverImage?: string;
}): SeoCheckResult[] {
  const results: SeoCheckResult[] = [];
  const { content, title, slug, seoTitle, seoDescription, keyphrase, existingPosts, currentPostId, coverImage } = params;

  const normalizedKeyphrase = keyphrase.trim().toLowerCase();
  const keyphraseWords = normalizedKeyphrase.split(/\s+/).filter(Boolean);
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  // 1. Keyphrase length
  if (!normalizedKeyphrase) {
    results.push({
      name: 'Keyphrase length',
      status: 'error',
      message: 'No focus keyphrase was set for this post. Please add a focus keyphrase to begin analysis.'
    });
  } else if (keyphraseWords.length > 6) {
    results.push({
      name: 'Keyphrase length',
      status: 'error',
      message: `The focus keyphrase is too long (${keyphraseWords.length} words). Keep it under 6 words.`
    });
  } else if (keyphraseWords.length > 4) {
    results.push({
      name: 'Keyphrase length',
      status: 'warning',
      message: 'The focus keyphrase is slightly long. Try to make it more concise.'
    });
  } else {
    results.push({
      name: 'Keyphrase length',
      status: 'good',
      message: 'Good job! The focus keyphrase is of a good length.'
    });
  }

  // If no keyphrase is set, skip keyphrase-dependent checks
  const hasKeyphrase = !!normalizedKeyphrase;

  // 2. Keyphrase consists only of function words
  if (hasKeyphrase) {
    const onlyStopWords = keyphraseWords.every(word => STOP_WORDS.has(word));
    if (onlyStopWords) {
      results.push({
        name: 'Keyphrase consists only of function words',
        status: 'error',
        message: 'The focus keyphrase consists only of function words (stop words like "and", "the"). Add more specific content words.'
      });
    } else {
      results.push({
        name: 'Keyphrase consists only of function words',
        status: 'good',
        message: 'The focus keyphrase contains content words.'
      });
    }
  }

  // Helper to extract paragraphs
  const paragraphs = content
    .split(/\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  // 3. Keyphrase in introduction
  if (hasKeyphrase) {
    const firstParagraph = paragraphs[0] || '';
    if (firstParagraph.toLowerCase().includes(normalizedKeyphrase)) {
      results.push({
        name: 'Keyphrase in introduction',
        status: 'good',
        message: 'Your focus keyphrase or its synonyms appear in the first paragraph.'
      });
    } else {
      results.push({
        name: 'Keyphrase in introduction',
        status: 'error',
        message: 'Your focus keyphrase does not appear in the first paragraph of the main content.'
      });
    }
  }

  // 4. Keyphrase density
  if (hasKeyphrase) {
    if (wordCount === 0) {
      results.push({
        name: 'Keyphrase density',
        status: 'error',
        message: 'No text content available to compute keyphrase density.'
      });
    } else {
      // Find exact occurrences (rough check)
      const regex = new RegExp(`\\b${normalizedKeyphrase.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'gi');
      const matches = content.match(regex);
      const count = matches ? matches.length : 0;
      const density = (count * 100) / wordCount;

      if (count === 0) {
        results.push({
          name: 'Keyphrase density',
          status: 'error',
          message: 'The focus keyphrase was found 0 times. That is less than the recommended minimum of 0.5%.'
        });
      } else if (density < 0.5) {
        results.push({
          name: 'Keyphrase density',
          status: 'warning',
          message: `The focus keyphrase was found ${count} times (${density.toFixed(2)}% density). This is too low; aim for at least 0.5%.`
        });
      } else if (density > 2.5) {
        results.push({
          name: 'Keyphrase density',
          status: 'warning',
          message: `The focus keyphrase was found ${count} times (${density.toFixed(2)}% density). This is too high; avoid overusing the keyphrase.`
        });
      } else {
        results.push({
          name: 'Keyphrase density',
          status: 'good',
          message: `Great! The focus keyphrase density is ${density.toFixed(2)}% (found ${count} times), which is optimal.`
        });
      }
    }
  }

  // 5. Keyphrase in meta description
  if (hasKeyphrase) {
    if (!seoDescription) {
      results.push({
        name: 'Keyphrase in meta description',
        status: 'error',
        message: 'No meta description has been specified. Add one to see if it contains the keyphrase.'
      });
    } else if (seoDescription.toLowerCase().includes(normalizedKeyphrase)) {
      results.push({
        name: 'Keyphrase in meta description',
        status: 'good',
        message: 'Keyphrase found in the meta description.'
      });
    } else {
      results.push({
        name: 'Keyphrase in meta description',
        status: 'warning',
        message: 'The meta description does not contain the focus keyphrase.'
      });
    }
  }

  // 6. Keyphrase in SEO title
  if (hasKeyphrase) {
    const titleToUse = seoTitle || title;
    if (!titleToUse) {
      results.push({
        name: 'Keyphrase in SEO title',
        status: 'error',
        message: 'SEO title or post title is empty.'
      });
    } else if (titleToUse.toLowerCase().includes(normalizedKeyphrase)) {
      const index = titleToUse.toLowerCase().indexOf(normalizedKeyphrase);
      if (index < titleToUse.length / 2) {
        results.push({
          name: 'Keyphrase in SEO title',
          status: 'good',
          message: 'The focus keyphrase is in the SEO title and appears near the beginning.'
        });
      } else {
        results.push({
          name: 'Keyphrase in SEO title',
          status: 'warning',
          message: 'The focus keyphrase is in the SEO title but not at the beginning.'
        });
      }
    } else {
      results.push({
        name: 'Keyphrase in SEO title',
        status: 'error',
        message: 'The focus keyphrase was not found in the SEO title.'
      });
    }
  }

  // 7. Keyphrase in slug
  if (hasKeyphrase) {
    const slugifiedKeyphrase = normalizedKeyphrase.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (slug.includes(slugifiedKeyphrase) || slug.replace(/-/g, ' ').includes(normalizedKeyphrase)) {
      results.push({
        name: 'Keyphrase in slug',
        status: 'good',
        message: 'The focus keyphrase appears in the URL slug.'
      });
    } else {
      results.push({
        name: 'Keyphrase in slug',
        status: 'error',
        message: 'The focus keyphrase does not appear in the URL slug. Try updating your slug.'
      });
    }
  }

  // Extract headings (support both Markdown and HTML)
  const mdHeadings = content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('#'));

  const htmlHeadingRegex = /<h([1-6])[^>]*>(.*?)<\/h\1>/gi;
  const htmlHeadings: string[] = [];
  let headingMatch;
  while ((headingMatch = htmlHeadingRegex.exec(content)) !== null) {
    const level = parseInt(headingMatch[1]);
    const text = headingMatch[2].replace(/<[^>]+>/g, '').trim();
    htmlHeadings.push('#'.repeat(level) + ' ' + text);
  }

  const headings = [...mdHeadings, ...htmlHeadings];

  // 8. Keyphrase in subheadings
  if (hasKeyphrase) {
    const subheadings = headings.filter(h => h.startsWith('##') && !h.startsWith('#####')); // H2, H3, H4
    if (subheadings.length === 0) {
      results.push({
        name: 'Keyphrase in subheadings',
        status: 'warning',
        message: 'No subheadings (H2, H3, etc.) found in the content. Use subheadings to improve topical structure.'
      });
    } else {
      const matchingSubheading = subheadings.some(sh => sh.toLowerCase().includes(normalizedKeyphrase));
      if (matchingSubheading) {
        results.push({
          name: 'Keyphrase in subheadings',
          status: 'good',
          message: 'Good job! The focus keyphrase is present in at least one subheading.'
        });
      } else {
        results.push({
          name: 'Keyphrase in subheadings',
          status: 'warning',
          message: 'None of your subheadings (H2, H3, etc.) contain the focus keyphrase.'
        });
      }
    }
  }

  // Extract images, check alt attributes, and inspect file names
  const mdImageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const htmlImgRegex = /<(?:img|Image)([^>]+)>/gi;

  const totalImagesList: { type: 'md' | 'html' | 'cover'; alt: string | null; src: string }[] = [];

  if (coverImage && coverImage.trim() !== '') {
    totalImagesList.push({
      type: 'cover',
      alt: title,
      src: coverImage.trim()
    });
  }

  let mdMatch;
  while ((mdMatch = mdImageRegex.exec(content)) !== null) {
    totalImagesList.push({ 
      type: 'md', 
      alt: mdMatch[1] ? mdMatch[1].trim() : null, 
      src: mdMatch[2] ? mdMatch[2].trim() : '' 
    });
  }

  let htmlImgMatch;
  while ((htmlImgMatch = htmlImgRegex.exec(content)) !== null) {
    const imgBody = htmlImgMatch[1];
    const altMatch = /alt=["']([^"']*)["']/i.exec(imgBody);
    const srcMatch = /src=["']([^"']*)["']/i.exec(imgBody);
    
    totalImagesList.push({ 
      type: 'html', 
      alt: altMatch ? altMatch[1].trim() : null, 
      src: srcMatch ? srcMatch[1].trim() : '' 
    });
  }

  const imageAlts = totalImagesList.map(img => img.alt).filter((alt): alt is string => alt !== null);
  const imagesWithoutAltCount = totalImagesList.filter(img => img.alt === null).length;

  // Helper to extract the filename from a URL or source path
  const getFilename = (srcUrl: string) => {
    try {
      const decoded = decodeURIComponent(srcUrl);
      const pathOnly = decoded.split('?')[0];
      return pathOnly.split('/').pop() || '';
    } catch {
      return '';
    }
  };

  // Helper to check if a filename is generic
  const isGenericFilename = (filename: string) => {
    if (!filename) return true;
    const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.')) || filename;
    const lowerName = nameWithoutExt.toLowerCase();

    // Generic patterns: IMG_123, DSC_456, screenshot-2026, photo, pic, image, untitled, upload, canvas
    if (/^(img|dsc|image|photo|pic|screenshot|upload|download|canvas|export|untitled|bg|logo|banner|avatar)[-_]?\d*$/i.test(lowerName)) {
      return true;
    }
    // Purely numeric (e.g. 194828.png) or too short
    if (/^\d+$/.test(lowerName) || lowerName.length < 3) {
      return true;
    }
    // UUID / md5 hash patterns (32 hex characters or 36 char GUID)
    if (/^[a-f0-9]{32}$/i.test(lowerName) || /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(lowerName)) {
      return true;
    }
    return false;
  };

  const imageFiles = totalImagesList.map(img => getFilename(img.src)).filter(Boolean);
  const genericFilesCount = imageFiles.filter(isGenericFilename).length;

  // Image alt attributes check (General check)
  if (totalImagesList.length > 0) {
    if (imagesWithoutAltCount > 0) {
      results.push({
        name: 'Image alt attributes',
        status: 'error',
        message: `Of the ${totalImagesList.length} image(s) on this page, ${imagesWithoutAltCount} are missing an alt attribute. Add alt text to all images for better accessibility and search visibility.`
      });
    } else {
      results.push({
        name: 'Image alt attributes',
        status: 'good',
        message: 'Good job! All images on this page have alt attributes.'
      });
    }
  }

  // Image file names check (Descriptive naming)
  if (totalImagesList.length > 0) {
    if (genericFilesCount > 0) {
      results.push({
        name: 'Image file names',
        status: 'warning',
        message: `Of the ${imageFiles.length} image filename(s), ${genericFilesCount} appear to be generic (like "screenshot", a hash, or number). Rename them to use lowercase descriptive words separated by hyphens (e.g. "luxury-wall-art.jpg").`
      });
    } else {
      results.push({
        name: 'Image file names',
        status: 'good',
        message: 'Good job! All image file names are descriptive and SEO friendly.'
      });
    }
  }

  // 9. Keyphrase in image alt attributes
  if (hasKeyphrase) {
    if (totalImagesList.length === 0) {
      results.push({
        name: 'Keyphrase in image alt attributes',
        status: 'warning',
        message: 'No images found in the content. Add some images with keyphrase-targeted alt attributes.'
      });
    } else if (imageAlts.length === 0) {
      results.push({
        name: 'Keyphrase in image alt attributes',
        status: 'warning',
        message: 'Images are present, but none have descriptive alt text to match your focus keyphrase.'
      });
    } else {
      const matchFound = imageAlts.some(alt => alt.toLowerCase().includes(normalizedKeyphrase));
      if (matchFound) {
        results.push({
          name: 'Keyphrase in image alt attributes',
          status: 'good',
          message: 'Great! At least one image alt attribute contains the focus keyphrase.'
        });
      } else {
        results.push({
          name: 'Keyphrase in image alt attributes',
          status: 'warning',
          message: 'Images are present and have alt attributes, but none of them contain the focus keyphrase.'
        });
      }
    }
  }

  // 10. Previously used keyphrase
  if (hasKeyphrase) {
    const isPreviouslyUsed = existingPosts.some(post => {
      if (currentPostId && post.id === currentPostId) return false;
      // We check if the keyphrase matches tags, title keywords or slug
      const postSlug = post.slug.toLowerCase();
      const slugifiedKey = normalizedKeyphrase.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const tagsMatch = (post.tags || []).some(t => t.toLowerCase() === normalizedKeyphrase);
      return postSlug.includes(slugifiedKey) || tagsMatch;
    });

    if (isPreviouslyUsed) {
      results.push({
        name: 'Previously used keyphrase',
        status: 'error',
        message: 'You have used this focus keyphrase on another post. Do not cannibalize your own rankings.'
      });
    } else {
      results.push({
        name: 'Previously used keyphrase',
        status: 'good',
        message: 'You have not used this focus keyphrase before.'
      });
    }
  }

  // 11. Text length
  if (wordCount < 300) {
    results.push({
      name: 'Text length',
      status: 'error',
      message: `The text contains ${wordCount} words. This is below the recommended minimum of 300 words. Add more content.`
    });
  } else if (wordCount < 600) {
    results.push({
      name: 'Text length',
      status: 'warning',
      message: `The text contains ${wordCount} words. That's a good amount, but cornerstone articles should aim for 600+ words.`
    });
  } else {
    results.push({
      name: 'Text length',
      status: 'good',
      message: `The text contains ${wordCount} words, which is well above the recommended 300-word minimum.`
    });
  }

  // Link analysis
  // Markdown links: [text](url)
  // HTML links: <a href="url">text</a>
  const mdLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const htmlLinkRegex = /<a[^>]+href=["']([^"']*)["'][^>]*>/g;

  const links: string[] = [];
  let linkMatch;
  while ((linkMatch = mdLinkRegex.exec(content)) !== null) {
    links.push(linkMatch[2]);
  }
  while ((linkMatch = htmlLinkRegex.exec(content)) !== null) {
    links.push(linkMatch[1]);
  }

  const isInternal = (url: string) => {
    if (url.startsWith('/') || url.startsWith('#')) return true;
    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'lurevi.com';
    return url.includes(hostname);
  };

  const internalLinks = links.filter(url => isInternal(url));
  const outboundLinks = links.filter(url => !isInternal(url));

  // 12. Internal links
  if (internalLinks.length > 0) {
    results.push({
      name: 'Internal links',
      status: 'good',
      message: `You have ${internalLinks.length} internal link(s) in your content.`
    });
  } else {
    results.push({
      name: 'Internal links',
      status: 'warning',
      message: 'No internal links appear in this page, make sure to link to other pages on your site.'
    });
  }

  // 13. Outbound links
  if (outboundLinks.length > 0) {
    results.push({
      name: 'Outbound links',
      status: 'good',
      message: `Great! You have ${outboundLinks.length} outbound link(s).`
    });
  } else {
    results.push({
      name: 'Outbound links',
      status: 'warning',
      message: 'No outbound links appear in this page. Add links to relevant external articles or resources.'
    });
  }

  // 14. Images present
  if (totalImagesList.length > 0) {
    results.push({
      name: 'Images present',
      status: 'good',
      message: `Great job! Your content contains ${totalImagesList.length} image(s).`
    });
  } else {
    results.push({
      name: 'Images present',
      status: 'error',
      message: 'No images appear in this page. Add some to break up the text.'
    });
  }

  // 15. Meta description length
  if (!seoDescription) {
    results.push({
      name: 'Meta description length',
      status: 'error',
      message: 'No meta description specified. Add one to help your search listing.'
    });
  } else if (seoDescription.length < 120) {
    results.push({
      name: 'Meta description length',
      status: 'warning',
      message: `The meta description is too short (${seoDescription.length} characters). It should be between 120 and 160 characters.`
    });
  } else if (seoDescription.length > 160) {
    results.push({
      name: 'Meta description length',
      status: 'warning',
      message: `The meta description is too long (${seoDescription.length} characters). Keep it under 160 characters to avoid truncation.`
    });
  } else {
    results.push({
      name: 'Meta description length',
      status: 'good',
      message: `The meta description is of excellent length (${seoDescription.length} characters).`
    });
  }

  // 16. SEO title width
  const titleToUse = seoTitle || title;
  if (!titleToUse) {
    results.push({
      name: 'SEO title width',
      status: 'error',
      message: 'No SEO title or main title specified.'
    });
  } else if (titleToUse.length < 30) {
    results.push({
      name: 'SEO title width',
      status: 'warning',
      message: `The SEO title is too short (${titleToUse.length} characters). It should be between 30 and 60 characters.`
    });
  } else if (titleToUse.length > 60) {
    results.push({
      name: 'SEO title width',
      status: 'warning',
      message: `The SEO title is too long (${titleToUse.length} characters). Keep it under 60 characters to avoid truncation.`
    });
  } else {
    results.push({
      name: 'SEO title width',
      status: 'good',
      message: `The SEO title is of excellent length (${titleToUse.length} characters).`
    });
  }

  // 17. Single H1 assessment
  const h1Headings = headings.filter(h => h.startsWith('# ') && !h.startsWith('##'));
  if (h1Headings.length > 0) {
    results.push({
      name: 'Single H1 assessment',
      status: 'warning',
      message: 'Your content contains H1 headings in the body. Since the post title is the main H1, avoid adding extra H1s in the content.'
    });
  } else {
    results.push({
      name: 'Single H1 assessment',
      status: 'good',
      message: 'Good job! No extra H1 headings are used in the content body.'
    });
  }

  // 18. Duplicate title check
  const duplicateTitle = existingPosts.some(post => {
    if (currentPostId && post.id === currentPostId) return false;
    return post.title.toLowerCase().trim() === title.toLowerCase().trim();
  });

  if (duplicateTitle && title.trim()) {
    results.push({
      name: 'Duplicate blog title',
      status: 'error',
      message: 'This blog title is already in use by another blog post. Please use a unique title.'
    });
  } else if (title.trim()) {
    results.push({
      name: 'Duplicate blog title',
      status: 'good',
      message: 'This blog title is unique.'
    });
  }

  return results;
}
