import { searchService } from '../server/services/searchService';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
  try {
    const q = String(req.query.q || '');
    const result = await searchService.search('photo', q, {
      type: 'photo',
      category: req.query.category ? String(req.query.category) : undefined,
      page: Number(req.query.page || 1),
      perPage: Number(req.query.perPage || 24),
    } as any);
    return res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    console.error('[VISTORA /api/photos]', error?.message || error);
    return res.status(500).json({ success: false, error: { code: 'PHOTOS_FAILED', message: 'Unable to load photos.' } });
  }
}
