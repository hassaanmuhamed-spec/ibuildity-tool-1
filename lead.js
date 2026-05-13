export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { name, phone, email, estimate, specs } = req.body;
  if (!name || !phone) return res.status(400).json({ error: 'الاسم ورقم الهاتف مطلوبان' });
  const GOOGLE_SHEET_WEBHOOK = process.env.GOOGLE_SHEET_WEBHOOK;
  if (!GOOGLE_SHEET_WEBHOOK) return res.status(500).json({ error: 'Server configuration error' });
  const now = new Date();
  const cairoTime = now.toLocaleString('ar-EG', { timeZone: 'Africa/Cairo', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  const payload = { name: name.trim(), phone: phone.trim(), email: email ? email.trim() : '—', estimate: estimate || '—', specs: specs || '—', date: cairoTime, source: 'حاسبة التشطيب' };
  try {
    const response = await fetch(GOOGLE_SHEET_WEBHOOK, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!response.ok) throw new Error(`Webhook error: ${response.status}`);
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'حدث خطأ أثناء الإرسال' });
  }
}
