const AUTH_COOKIE = 'sprout_ds_auth';
const AUTH_TOKEN = 'sds2026_verified';

const LOGIN_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Sprout Design — Access Required</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Inter', system-ui, sans-serif;
    background: #f5f5f5;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    color: #181d27;
    -webkit-font-smoothing: antialiased;
  }
  .login-card {
    background: white;
    border-radius: 12px;
    padding: 48px 40px;
    box-shadow:
      0 1px 3px 0 rgba(10,13,18,0.1),
      0 1px 2px -1px rgba(10,13,18,0.1);
    max-width: 400px;
    width: 90%;
    text-align: center;
    position: relative;
    z-index: 1;
    animation: cardIn 0.5s ease both;
  }
  @keyframes cardIn {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .logo {
    width: 64px;
    height: 64px;
    margin: 0 auto 24px;
  }
  .logo img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  h1 {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 8px;
    color: #181d27;
  }
  p { color: #535862; font-size: 14px; line-height: 20px; margin-bottom: 24px; }
  form { display: flex; flex-direction: column; gap: 12px; }
  input[type="password"] {
    padding: 10px 14px;
    border: 1px solid #d5d7da;
    border-radius: 8px;
    font-size: 16px;
    line-height: 24px;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    background: white;
    color: #181d27;
    font-family: 'Inter', system-ui, sans-serif;
  }
  input[type="password"]::placeholder { color: #717680; }
  input[type="password"]:focus {
    border-color: #0ba5ec;
    box-shadow: 0 0 0 4px rgba(11,165,236,0.24);
  }
  button {
    padding: 10px 18px;
    background: #0ba5ec;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    line-height: 24px;
    cursor: pointer;
    transition: background 0.15s;
    font-family: 'Inter', system-ui, sans-serif;
    box-shadow: 0 1px 2px 0 rgba(10,13,18,0.05);
  }
  button:hover { background: #0086c9; }
  .error {
    color: #d92d20;
    font-size: 14px;
    line-height: 20px;
    margin-top: 4px;
    display: none;
  }
  .error.show { display: block; }
</style>
</head>
<body>
<div class="login-card">
  <div class="logo">
    <img src="/brand/assets/character-sprout-avatar.svg" alt="Sprout">
  </div>
  <h1>Sprout Design</h1>
  <p>Enter the passcode to access design resources.</p>
  <form method="POST" action="/api/login">
    <input type="hidden" name="redirect" id="redirect" value="/">
    <input type="password" name="password" placeholder="Passcode" autofocus required>
    <button type="submit">Continue</button>
    <div class="error ERRORCLASS">Incorrect passcode. Please try again.</div>
  </form>
</div>
<script>
  var params = new URLSearchParams(window.location.search);
  if (params.get('error') === '1') {
    document.querySelector('.error').classList.add('show');
  }
  document.getElementById('redirect').value = params.get('next') || '/';
</script>
</body>
</html>`;

export default function middleware(request) {
  const url = new URL(request.url);

  if (
    url.pathname.startsWith('/api/') ||
    url.pathname === '/favicon.ico' ||
    /\.(css|js|svg|png|jpg|jpeg|gif|ico|woff|woff2|otf|ttf|riv|json)$/i.test(url.pathname)
  ) {
    return;
  }

  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const [key, ...val] = c.trim().split('=');
      return [key, val.join('=')];
    })
  );

  if (cookies[AUTH_COOKIE] === AUTH_TOKEN) {
    return;
  }

  const hasError = url.searchParams.get('error') === '1';
  const html = LOGIN_HTML.replace('ERRORCLASS', hasError ? 'show' : '');

  return new Response(html, {
    status: 200,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}

export const config = {
  matcher: ['/((?!api|_vercel|favicon\\.ico).*)'],
};
