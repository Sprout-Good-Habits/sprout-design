const CORRECT_PASSWORD = 'sprout2026';
const AUTH_COOKIE = 'sprout_ds_auth';
const AUTH_TOKEN = 'sds2026_verified';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).end('Method not allowed');
    return;
  }

  const password = req.body?.password;
  const redirect = req.body?.redirect || '/';

  if (password === CORRECT_PASSWORD) {
    res.setHeader(
      'Set-Cookie',
      `${AUTH_COOKIE}=${AUTH_TOKEN}; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax`
    );
    res.writeHead(302, { Location: redirect });
    res.end();
  } else {
    const next = encodeURIComponent(redirect);
    res.writeHead(302, { Location: `/?error=1&next=${next}` });
    res.end();
  }
}
