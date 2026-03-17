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
    background: #e0f2fe;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    color: #181d27;
    -webkit-font-smoothing: antialiased;
  }
  .login-card {
    background: white;
    border-radius: 16px;
    padding: 48px 40px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.08);
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
    background: #acdc79;
    border-radius: 16px;
    margin: 0 auto 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    box-shadow: 0 4px 16px rgba(134,203,60,0.25);
  }
  .logo .eye {
    width: 10px; height: 10px;
    background: #fff;
    border-radius: 50%;
    position: absolute;
    top: 17px;
  }
  .logo .eye::after {
    content: '';
    width: 6px; height: 6px;
    background: #181d27;
    border-radius: 50%;
    position: absolute;
    top: 2px; left: 2px;
  }
  .logo .eye.l { left: 14px; }
  .logo .eye.r { right: 14px; }
  .logo .mouth {
    position: absolute;
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    width: 8px; height: 4px;
    border-bottom: 2px solid #181d27;
    border-radius: 0 0 6px 6px;
  }
  h1 {
    font-size: 22px;
    font-weight: 700;
    margin-bottom: 8px;
    color: #181d27;
  }
  p { color: #535862; font-size: 14px; margin-bottom: 28px; }
  form { display: flex; flex-direction: column; gap: 12px; }
  input[type="password"] {
    padding: 12px 16px;
    border: 2px solid #e9eaeb;
    border-radius: 10px;
    font-size: 16px;
    outline: none;
    transition: border-color 0.2s;
    background: white;
    color: #181d27;
    font-family: 'Inter', system-ui, sans-serif;
  }
  input[type="password"]::placeholder { color: #a4a7ae; }
  input[type="password"]:focus { border-color: #86cb3c; }
  button {
    padding: 12px;
    background: #86cb3c;
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
    font-family: 'Inter', system-ui, sans-serif;
  }
  button:hover { background: #4f7a21; }
  .error {
    color: #d92d20;
    font-size: 13px;
    margin-top: 4px;
    display: none;
  }
  .error.show { display: block; }
</style>
</head>
<body>
<div class="login-card">
  <div class="logo">
    <div class="eye l"></div>
    <div class="eye r"></div>
    <div class="mouth"></div>
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
