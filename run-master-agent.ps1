# DevisFlow — Master Agent 24/7
# Lance Claude Code en mode autonome en boucle continue
# Usage: powershell -ExecutionPolicy Bypass -File run-master-agent.ps1

$projectDir = "C:\Users\Natha\Desktop\devisflow"
$logFile = "$projectDir\.claude\master-agent.log"
$iteration = 0

Write-Host "=== DevisFlow Master Agent 24/7 ===" -ForegroundColor Cyan
Write-Host "Dossier: $projectDir" -ForegroundColor Gray
Write-Host "Log: $logFile" -ForegroundColor Gray
Write-Host "Ctrl+C pour arreter" -ForegroundColor Yellow
Write-Host ""

Set-Location $projectDir

while ($true) {
    $iteration++
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

    Write-Host "[$timestamp] Iteration #$iteration — Lancement master agent..." -ForegroundColor Green

    $task = @"
Tu es le master agent DevisFlow. Effectue un cycle complet :
1. Verifie que https://devis-flow.fr repond (curl)
2. Audite rapidement les fichiers cles (src/app/page.tsx, src/app/devis/page.tsx) pour detecter tout probleme
3. Corrige le premier bug ou amelioration identifie
4. Deploie si des changements ont ete faits
5. Rapporte en 3 lignes ce qui a ete fait
Reste sous 4000 tokens. Sois efficace et direct.
"@

    # Lancer claude avec la tache
    $output = echo $task | claude --dangerously-skip-permissions --print 2>&1

    # Logger
    $logEntry = "[$timestamp] Iteration #$iteration`n$output`n---`n"
    Add-Content -Path $logFile -Value $logEntry

    Write-Host $output -ForegroundColor White
    Write-Host ""
    Write-Host "Prochain cycle dans 30 minutes..." -ForegroundColor Gray

    # Attendre 30 minutes avant le prochain cycle
    Start-Sleep -Seconds 1800
}
