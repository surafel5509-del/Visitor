export default function handler(_req: any, res: any) {
  return res.status(200).json({
    success: true,
    data: { status: 'healthy', app: 'VISTORA', timestamp: new Date().toISOString() },
  });
}
