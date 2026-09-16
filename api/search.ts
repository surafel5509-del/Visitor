import { searchService } from '../server/services/searchService';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
  try {
    const type = String(req.query.type || 'all') as 'all' | 'photo' | 'video';
    const q = String(req.query.q || '');
    const filters = {
      type,
      category: req.query.category ? String(req.query.category) : undefined,
      orientation: req.query.orientation ? String(req.query.orientation) as any : undefined,
      order: req.query.order ? String(req.query.order) as any : undefined,
      page: Number(req.query.page || 1),
      perPage: Number(req.query.perPage || 24),
    };
    const result = await searchService.search(type, q, filters as any);
    return res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    console.error('[VISTORA /api/search]', error?.message || error);
    return res.status(500).json({ success: false, error: { code: 'SEARCH_FAILED', message: 'Unable to perform visual search.' } });
  }
}
