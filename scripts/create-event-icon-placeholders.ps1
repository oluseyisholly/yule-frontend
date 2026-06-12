$keys = @(
  "birthdays","kids_birthdays","milestone_birthdays","surprise_birthdays",
  "valentines","couples_gift_exchange","friendship_valentines","love_notes_and_gifts",
  "work_anniversaries","employee_recognition","promotion_celebration","retirement_celebration",
  "farewell_gifts","team_appreciation","teachers_day","teacher_appreciation",
  "school_staff_appreciation","end_of_school_year_gifts","girls_day","women_appreciation",
  "ladies_hangout","mother_and_daughter_day","weddings","wedding_gifts",
  "wedding_anniversary","bridal_shower","engagement_gifts","housewarming_for_couple",
  "religious_holidays","christmas_gifts","secret_santa","eid_gifts",
  "easter_gifts","ramadan_gifts","thanksgiving_gifts","direct_gifting",
  "group_gifting","wishlist","wishlist_exchange","draw_names",
  "random_gift_exchange","auto_gifting","baby_shower","naming_ceremony",
  "housewarming","graduation","congratulations","get_well_soon",
  "thank_you_gifts","apology_gifts","just_because","hangout",
  "dinner_party","friends_reunion","family_reunion","community_event"
)

$outDir = Join-Path (Get-Location) "src\components\icons\event-types"
New-Item -ItemType Directory -Path $outDir -Force | Out-Null

$manifest = @{}
foreach ($k in $keys) {
  $filename = "$k.svg"
  $manifest[$k] = $filename

  $svg = @"
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" role="img" aria-label="$k">
  <!-- DESIGNER: replace this placeholder with final SVG content for "$k" -->
  <rect width="24" height="24" fill="none"/>
</svg>
"@

  $filePath = Join-Path $outDir $filename
  Set-Content -Path $filePath -Value $svg -Encoding UTF8
}

$manifestPath = Join-Path $outDir "manifest.json"
$manifest | ConvertTo-Json -Depth 2 | Set-Content -Path $manifestPath -Encoding UTF8

Write-Host "Created $($keys.Count) placeholder SVGs + manifest at $outDir"
