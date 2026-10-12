// Ubah dist/index.html → dist/app.html agar "/" dilayani api/invite.ts (meta OG per tamu).
// Jika fungsi itu bermasalah, ia mengalihkan ke /app.html sehingga undangan tetap terbuka.
import { renameSync, existsSync } from 'node:fs'
if (existsSync('dist/index.html')) renameSync('dist/index.html', 'dist/app.html')
console.log('✓ dist/app.html')
