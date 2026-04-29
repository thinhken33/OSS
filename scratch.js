const fs = require('fs');
let css = fs.readFileSync('public/style.css', 'utf8');

// 1. Root variables
css = css.replace(/:root\s*\{[\s\S]*?\}/, `:root {
  --bg: #ffffff;
  --card: #ffffff;
  --text: #000000;
  --muted: #333333;
  --line: #000000;
  --shadow: none;
  --blue: #000000;
  --blue-bg: #ffffff;
  --orange: #000000;
  --orange-bg: #ffffff;
  --red: #000000;
  --red-bg: #ffffff;
  --green: #000000;
  --green-bg: #ffffff;
  --gray: #000000;
  --gray-bg: #ffffff;
  --purple: #000000;
  --purple-bg: #ffffff;
  --sidebar-w: 240px;
  --radius: 0px;
}`);

// 2. Auth Page
css = css.replace(/background:\s*linear-gradient[^;]+;/, 'background: #ffffff;');
css = css.replace(/box-shadow:\s*[^;]+;/, 'box-shadow: 6px 6px 0px #000000;');

// 3. Sidebar colors
css = css.replace(/\.sidebar\s*\{[^}]+\}/, `.sidebar {
  width: var(--sidebar-w);
  background: #ffffff;
  color: #000000;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 100;
  border-right: 1px solid #000000;
}`);

css = css.replace(/\.sidebar-header\s*\{[^}]+\}/, `.sidebar-header {
  padding: 22px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid #000000;
}`);

css = css.replace(/color:\s*#fff;/g, 'color: #000000;'); // Many occurrences, replaces sidebar-title, etc. Wait, this will affect active state too.
// Let's be more specific instead of global replace.
css = css.replace(/color:\s*#000000;/g, 'color: #000000;'); // Just in case.

// 4. Reset menu items
css = css.replace(/\.menu-item\s*\{[^}]+\}/, `.menu-item {
  width: 100%;
  text-align: left;
  padding: 12px 16px;
  border: 1px solid transparent;
  background: transparent;
  color: #000000;
  font-size: 15px;
  border-radius: 0;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: 0.15s;
}`);
css = css.replace(/\.menu-item:hover\s*\{[^}]+\}/, `.menu-item:hover {
  background: #f0f0f0;
  color: #000000;
  border: 1px solid #000000;
}`);
css = css.replace(/\.menu-item\.active\s*\{[^}]+\}/, `.menu-item.active {
  background: #000000;
  color: #ffffff !important;
  border: 1px solid #000000;
}`);

// 5. Buttons & Badges
css = css.replace(/\.menu-badge\s*\{[^}]+\}/, `.menu-badge {
  background: #000000;
  color: #ffffff !important;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 99px;
  margin-left: auto;
}`);

css = css.replace(/\.sidebar-footer\s*\{[^}]+\}/, `.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #000000;
}`);

css = css.replace(/\.avatar-sm\s*\{[^}]+\}/, `.avatar-sm {
  width: 32px;
  height: 32px;
  border-radius: 0;
  border: 1px solid #000000;
  background: #ffffff;
  color: #000000;
  display: grid;
  place-items: center;
  font-size: 13px;
  font-weight: 700;
}`);

css = css.replace(/\.btn-logout\s*\{[^}]+\}/, `.btn-logout {
  width: 100%;
  padding: 8px;
  border: 1px solid #000000;
  border-radius: 0;
  background: transparent;
  color: #000000;
  font-size: 13px;
}`);

css = css.replace(/\.btn-logout:hover\s*\{[^}]+\}/, `.btn-logout:hover {
  background: #000000;
  color: #ffffff !important;
}`);

// 6. Fix pill borders
css = css.replace(/\.pill\s*\{[^}]+\}/, `.pill {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 9px;
  border-radius: 0;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  border: 1px solid #000000;
}`);

css = css.replace(/\.pill\.blue[^}]+\}/, '.pill.blue { background: #ffffff; color: #000000; }');
css = css.replace(/\.pill\.orange[^}]+\}/, '.pill.orange { background: #ffffff; color: #000000; }');
css = css.replace(/\.pill\.red[^}]+\}/, '.pill.red { background: #ffffff; color: #000000; }');
css = css.replace(/\.pill\.green[^}]+\}/, '.pill.green { background: #ffffff; color: #000000; }');
css = css.replace(/\.pill\.gray[^}]+\}/, '.pill.gray { background: #ffffff; color: #000000; }');
css = css.replace(/\.pill\.purple[^}]+\}/, '.pill.purple { background: #ffffff; color: #000000; }');

// 7. Forms and Cards focus
css = css.replace(/box-shadow: 0 0 0 3px[^;]+;/, 'box-shadow: 4px 4px 0px #000000;');

// 8. Buttons
css = css.replace(/\.btn-primary\s*\{\s*background:\s*#111;\s*color:\s*#fff;\s*\}/, `.btn-primary { background: #000000; color: #ffffff !important; }`);
css = css.replace(/\.btn-primary:hover\s*\{[^}]+\}/, `.btn-primary:hover { background: #ffffff; color: #000000 !important; border: 1px solid #000000; transform: translateY(-1px); box-shadow: 4px 4px 0px #000000; }`);

// 9. Task Cards hover
css = css.replace(/\.task-card:hover\s*\{[^}]+\}/, `.task-card:hover { box-shadow: 4px 4px 0px #000000; transform: translateY(-2px); }`);

// 10. Landing page Overhaul
css += `
/* MONOCHROME OVERRIDES */
body { background: #ffffff; color: #000000; }
.landing-page { background: #ffffff !important; color: #000000 !important; }
.landing-header { background: #ffffff !important; border-bottom: 2px solid #000000 !important; backdrop-filter: none; }
.brand-name { color: #000000 !important; }
.btn-ghost { color: #000000 !important; border: 1px solid #000000 !important; }
.btn-ghost:hover { background: #000000 !important; color: #ffffff !important; }
.btn-accent { background: #000000 !important; color: #ffffff !important; box-shadow: 4px 4px 0px #000000 !important; border: 1px solid #000000 !important; }
.btn-accent:hover { background: #ffffff !important; color: #000000 !important; box-shadow: 6px 6px 0px #000000 !important; }
.hero-title { color: #000000 !important; }
.hero-highlight { background: none !important; -webkit-text-fill-color: #000000 !important; color: #000000 !important; }
.hero-subtitle { color: #333333 !important; }
.hero-card { background: #ffffff !important; border: 2px solid #000000 !important; box-shadow: 6px 6px 0px #000000; border-radius: 0; }
.hc-title { color: #000000 !important; }
.hc-desc { color: #333333 !important; }
.blue-glow, .green-glow, .purple-glow { background: #ffffff !important; border: 1px solid #000000 !important; }
.features-heading { color: #000000 !important; }
.features-sub { color: #333333 !important; }
.feature-card { background: #ffffff !important; border: 2px solid #000000 !important; box-shadow: 4px 4px 0px #000000; border-radius: 0; }
.feature-card h3 { color: #000000 !important; }
.feature-card p { color: #333333 !important; }
.landing-footer { border-top: 2px solid #000000 !important; color: #000000 !important; }
.stat-card { border: 2px solid #000000; box-shadow: 4px 4px 0px #000000; border-radius: 0; }
.chart-section { border: 2px solid #000000; box-shadow: 4px 4px 0px #000000; border-radius: 0; }
.profile-card { border: 2px solid #000000; box-shadow: 4px 4px 0px #000000; border-radius: 0; }
.profile-avatar { background: #ffffff; border: 2px solid #000000; color: #000000; }
.toast { background: #ffffff !important; border: 2px solid #000000; color: #000000 !important; box-shadow: 4px 4px 0px #000000; border-radius: 0; }
.admin-table { border: 2px solid #000000; }
.admin-table th { background: #ffffff; border-bottom: 2px solid #000000; border-right: 1px solid #000000; color: #000000; }
.admin-table td { border-bottom: 1px solid #000000; border-right: 1px solid #000000; color: #000000; }
.dm-card { border: 2px solid #000000; box-shadow: 2px 2px 0px #000000; border-radius: 0; }
.tb-card { border: 2px solid #000000; box-shadow: 2px 2px 0px #000000; border-radius: 0; }
.tb-card.unread { background: #f9f9f9; border: 2px solid #000000; }
.action-btn { color: #000000; }
.chart-bar-fill { background: #000000 !important; border-right: 1px solid #ffffff; }
.chart-bar-track { border: 1px solid #000000; border-radius: 0; background: #ffffff; }
.stat-total .stat-number, .stat-pending .stat-number, .stat-progress .stat-number, .stat-done .stat-number, .stat-overdue .stat-number, .stat-rate .stat-number { color: #000000; }
`;

fs.writeFileSync('public/style.css', css);
console.log('Successfully updated style.css to black and white theme');
