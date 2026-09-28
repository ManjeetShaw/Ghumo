const express = require('express');
const fs = require('fs'); 
const path = require('path'); 
const Book = require('../models/Book');
const bookGenerator = require('../services/bookGenerator');
const { requireAuth } = require('../middleware/auth');
const config = require('../config');

const router = express.Router();

// All book routes require a logged-in user.
router.use(requireAuth);

/**
 * POST /books/generate
 * body: { prompt: string, pageCount?: number (4-12), style?: string, language?: string }
 * Generates the book in-process (Gemini for text, Cloudflare for images),
 * saves the result with images downloaded to disk, returns the saved book.
 */
router.post('/generate', async (req, res) => {
  try {
    const { prompt, pageCount = 8, style, language = 'English' } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'prompt (string) is required' });
    }

    // 1. Run text and image generation
    const storyResult = await bookGenerator.generateBook(prompt, pageCount, style, language);

    // 2. Setup a local folder for the saved images
    const uploadDir = path.join(__dirname, '../public/images');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 3. Process pages and convert base64 image data to reliable image URLs & Data URIs
    const processedPages = storyResult.pages.map((page) => {
      let rawImage = null;

      if (page.image) {
        if (typeof page.image === 'string') {
          rawImage = page.image;
        } else if (page.image.base64) {
          rawImage = page.image.base64;
        } else if (page.image.result && page.image.result.image) {
          rawImage = page.image.result.image;
        }
      }

      if (rawImage && typeof rawImage === 'string') {
        // Fix any mangled string containing http/https
        if (rawImage.includes('http://') || rawImage.includes('https://')) {
          const httpIndex = rawImage.indexOf('http');
          return {
            ...page,
            image: rawImage.substring(httpIndex),
            imageError: null,
          };
        }

        // If it already has a data: prefix
        if (rawImage.startsWith('data:')) {
          return {
            ...page,
            image: rawImage,
            imageError: null,
          };
        }

        // Clean raw base64 string
        const cleanBase64 = rawImage.replace(/^data:image\/\w+;base64,/, '');
        return {
          ...page,
          image: `data:image/jpeg;base64,${cleanBase64}`,
          imageError: null,
        };
      }

      return {
        ...page,
        image: null,
        imageError: page.imageError || null,
      };
    });

    const coverImage = processedPages[0]?.image || null;

    // 4. Create the final book document with pages and cover image
    const book = await Book.create({
      userId: req.user.id,
      title: storyResult.title,
      characterDescription: storyResult.characterDescription,
      style: storyResult.style,
      language: storyResult.language || language,
      pageCount: storyResult.pageCount,
      coverImage,
      pages: processedPages, 
    });

    res.status(201).json({ book });
  } catch (err) {
    console.error('Book generation error:', err.message);
    res.status(502).json({ error: 'Failed to generate book', details: err.message });
  }
});

/**
 * POST /books/tts
 * body: { text: string }
 * Generates voice audio using ElevenLabs API if key is present,
 * or indicates fallback to Web Speech API if key is not configured or fails.
 */
router.post('/tts', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'text is required' });
    }

    if (!config.elevenlabsApiKey) {
      return res.json({ fallback: true, message: 'ElevenLabs API key not configured, fallback to Web Speech API' });
    }

    const voiceId = config.elevenlabsVoiceId || '21m00Tcm4TlvDq8ikWAM';
    const elevenLabsUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

    const response = await fetch(elevenLabsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': config.elevenlabsApiKey,
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn('[TTS] ElevenLabs API failed:', response.status, errText);
      return res.json({ fallback: true, error: 'ElevenLabs request failed' });
    }

    const audioBuffer = await response.arrayBuffer();
    res.set('Content-Type', 'audio/mpeg');
    return res.send(Buffer.from(audioBuffer));
  } catch (err) {
    console.warn('[TTS] Error invoking ElevenLabs TTS:', err.message);
    return res.json({ fallback: true, error: err.message });
  }
});

/**
 * GET /books/styles
 * Returns the available art style presets for the frontend's style picker.
 */
router.get('/styles', (req, res) => {
  try {
    const result = bookGenerator.getStyles();
    res.json(result);
  } catch (err) {
    console.error('Get styles error:', err.message);
    res.status(500).json({ error: 'Failed to fetch styles' });
  }
});

/**
 * GET /books
 * Lists the current user's books with cover images.
 */
router.get('/', async (req, res) => {
  try {
    const books = await Book.find({ userId: req.user.id })
      .select('title characterDescription style pageCount coverImage pages createdAt')
      .sort({ createdAt: -1 });

    const formattedBooks = books.map((b) => {
      const obj = b.toObject();
      const cover = obj.coverImage || (Array.isArray(obj.pages) && obj.pages[0]?.image) || null;
      return {
        id: obj._id,
        _id: obj._id,
        title: obj.title,
        characterDescription: obj.characterDescription,
        style: obj.style,
        pageCount: obj.pageCount,
        coverImage: cover,
        createdAt: obj.createdAt,
      };
    });

    res.json({ books: formattedBooks });
  } catch (err) {
    console.error('List books error:', err);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

/**
 * GET /books/:id
 * Full book, including all pages and images. Ownership-checked.
 */
router.get('/:id', async (req, res) => {
  try {
    const bookDoc = await Book.findOne({ _id: req.params.id, userId: req.user.id });
    if (!bookDoc) {
      return res.status(404).json({ error: 'Book not found' });
    }
    const book = bookDoc.toObject();

    // Sanitize image fields for legacy and new books
    const sanitizeImg = (raw) => {
      if (!raw || typeof raw !== 'string') return null;
      if (raw.includes('http://') || raw.includes('https://')) {
        return raw.substring(raw.indexOf('http'));
      }
      if (raw.startsWith('data:')) return raw;
      return `data:image/jpeg;base64,${raw.replace(/^data:image\/\w+;base64,/, '')}`;
    };

    if (Array.isArray(book.pages)) {
      book.pages = book.pages.map((p) => ({
        ...p,
        image: sanitizeImg(p.image),
      }));
    }

    book.coverImage = sanitizeImg(book.coverImage) || (book.pages?.[0]?.image || null);

    res.json({ book });
  } catch (err) {
    console.error('Get book error:', err);
    res.status(500).json({ error: 'Failed to fetch book' });
  }
});

/**
 * DELETE /books/:id
 * Ownership-checked.
 */
router.delete('/:id', async (req, res) => {
  try {
    const result = await Book.deleteOne({ _id: req.params.id, userId: req.user.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('Delete book error:', err);
    res.status(500).json({ error: 'Failed to delete book' });
  }
});

// 💡 THE CRUCIAL MISSING LINE THAT FIXED THE EXPRESS CRASH:
module.exports = router;