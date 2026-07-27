# DevisFlow — Analyse concurrentielle hebdomadaire
# Usage: powershell -ExecutionPolicy Bypass -File run-competitor-analysis.ps1

$projectDir = "C:\Users\Natha\Desktop\devisflow"
Set-Location $projectDir

$task = @"
Tu es l'agent competitor-analysis de DevisFlow.
Analyse ces concurrents directs dans la niche devis artisans France :
- obat.fr
- henrri.com
- evoliz.com
- batappli.fr

Pour chacun : fetche leur landing + page tarifs. Extrais : prix, angle marketing, points faibles.
Genere un rapport dans .claude/competitive-intelligence.md avec :
1. Tableau comparatif prix
2. 3 messages marketing a copier en mieux sur notre landing page
3. 2 features a ajouter en priorite
4. Modifie src/app/page.tsx pour integrer le meilleur message marketing trouve
5. Deploie avec : git add src/ && git commit -m 'Marketing: competitive insights applied' && npx vercel --prod --yes
"@

Write-Host "Lancement analyse concurrentielle..." -ForegroundColor Cyan
echo $task | claude --dangerously-skip-permissions --print
