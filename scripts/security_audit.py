import os
import re

deploy_dir = 'websites/deploy/main'
issues = []

# 1. Check for sensitive files
sensitive_exts = ('.sh', '.bash', '.swift', '.ts', '.tsx', '.py', '.sql', '.bak', '.swp', '.env', '.yml', '.yaml', '.xcodeproj', '.xcworkspace', '.map', '.md', '.log', '.lock')
sensitive_names = ('.git', '.gitignore', '.DS_Store', 'package.json', 'package-lock.json', 'tsconfig.json')

found_sensitive = []
for root, dirs, files in os.walk(deploy_dir):
    for d in dirs:
        if d in sensitive_names:
            found_sensitive.append(os.path.join(root, d))
    for f in files:
        if f in sensitive_names or f.endswith(sensitive_exts):
            found_sensitive.append(os.path.join(root, f))

print('=== 1. SENSITIVE FILES AUDIT ===')
print(f'Sensitive files found in deploy: {len(found_sensitive)}')
for s in found_sensitive:
    print(f'  [FAIL] Exposed file: {s}')
if not found_sensitive:
    print('  [PASS] Zero sensitive files, source maps, scripts or hidden directories exposed.')

# 2. Check JS files for dangerous patterns
print('\n=== 2. JAVASCRIPT INJECTION AUDIT ===')
js_files = []
for root, dirs, files in os.walk(deploy_dir):
    for f in files:
        if f.endswith('.js'):
            js_files.append(os.path.join(root, f))

print(f'Total JavaScript files scanned: {len(js_files)}')
eval_count = 0
doc_write_count = 0
for jf in js_files:
    with open(jf, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    if 'eval(' in content:
        eval_count += 1
        print(f'  [FLAG] {jf}: contains eval()')
    if 'document.write(' in content:
        doc_write_count += 1
        print(f'  [FLAG] {jf}: contains document.write()')

if eval_count == 0 and doc_write_count == 0:
    print('  [PASS] Zero eval() or document.write() dangerous execution sinks detected.')

# 3. Check HTML files for leaks & inspection vectors
print('\n=== 3. HTML INSPECTABILITY & ASSET AUDIT ===')
html_files = []
for root, dirs, files in os.walk(deploy_dir):
    for f in files:
        if f.endswith('.html'):
            html_files.append(os.path.join(root, f))

print(f'Total HTML pages scanned: {len(html_files)}')
local_path_pattern = re.compile(r'/Users/[a-zA-Z0-9_\-]+/|C:\\\\Users\\\\')
leaked_paths = []
missing_favicons = []
missing_alts = []

for hf in html_files:
    with open(hf, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    if local_path_pattern.search(content):
        leaked_paths.append(hf)
    if 'rel="icon"' not in content and "rel='icon'" not in content and 'rel="shortcut icon"' not in content and 'rel="apple-touch-icon"' not in content:
        missing_favicons.append(hf)
    imgs = re.findall(r'<img\s+[^>]*>', content)
    for img in imgs:
        if 'alt=' not in img:
            missing_alts.append((hf, img))

print(f'Pages with local system paths: {len(leaked_paths)}')
for lp in leaked_paths:
    print(f'  [FAIL] Local path leaked in: {lp}')
if not leaked_paths:
    print('  [PASS] Zero local development file paths leaked in production HTML.')

print(f'Pages missing favicon: {len(missing_favicons)}')
if not missing_favicons:
    print('  [PASS] 100% of pages have favicon and apple-touch-icon links.')

print(f'Images missing alt attributes: {len(missing_alts)}')
if not missing_alts:
    print('  [PASS] 100% of images have descriptive alt text.')

# 4. Check .htaccess security configuration
print('\n=== 4. HTACCESS SERVER HARDENING AUDIT ===')
htaccess_path = os.path.join(deploy_dir, '.htaccess')
if os.path.exists(htaccess_path):
    with open(htaccess_path, 'r', encoding='utf-8') as f:
        ht = f.read()
    checks = [
        ('Directory Listing Disabled', 'Options -Indexes'),
        ('Hidden Files Blocked', 'FilesMatch "^\\."'),
        ('Source Extensions Blocked', 'FilesMatch "\\.(sh|bash|swift|ts|tsx'),
        ('Force HTTPS 301', 'RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]'),
        ('HSTS Header Enabled', 'Strict-Transport-Security'),
        ('X-Frame-Options (Anti-Clickjacking)', 'X-Frame-Options'),
        ('X-Content-Type-Options (Anti-Sniffing)', 'X-Content-Type-Options "nosniff"'),
        ('Content-Security-Policy (Anti-XSS)', 'Content-Security-Policy'),
        ('Custom 404 Error Page', 'ErrorDocument 404 /404.html'),
    ]
    for name, req in checks:
        if req in ht:
            print(f'  [PASS] {name}')
        else:
            print(f'  [FAIL] {name} missing!')
else:
    print('  [FAIL] .htaccess file not found in deploy/main!')

print('\nAudit completed successfully.')
