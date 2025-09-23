<script>

function stripDiacritics(str){
return str.normalize('NFD').replace(/\p{Diacritic}/gu, '')
}
function normalize(name){
if(!name) return '';
const trimmed = name.trim().replace(/\s+/g,' ');
const lowered = trimmed.toLowerCase();
const ascii = stripDiacritics(lowered);
return {compact: ascii.replace(/\s+/g,''), withSpace: ascii};
}
function levenshtein(a, b){
const m = a.length, n = b.length;
const dp = Array.from({length:m+1}, ()=>Array(n+1).fill(0));
for(let i=0;i<=m;i++) dp[i][0]=i;
for(let j=0;j<=n;j++) dp[0][j]=j;
for(let i=1;i<=m;i++){
for(let j=1;j<=n;j++){
const cost = a[i-1]===b[j-1]?0:1;
dp[i][j] = Math.min(
dp[i-1][j]+1,
dp[i][j-1]+1,
dp[i-1][j-1]+cost
);
}
}
return dp[m][n];
}
function bestFuzzyMatch(query){
const keys = Object.keys(SEATING);
let best = {key:null, dist:Infinity};
for(const k of keys){
const d = levenshtein(query, k);
if(d < best.dist) best = {key:k, dist:d};
}
return best;
}
const $result = document.getElementById('result');
const $hint = document.getElementById('hint');
function renderFound(nameDisplay, info){
$result.textContent = `${nameDisplay}: ${info.table} – ${info.seat}`;
$hint.textContent = info.group ? `Gruppe: ${info.group}` : '';
}
function renderNotFound(input){
$result.textContent = 'Leider nicht gefunden.';
$hint.textContent = input ? `Prüfe Schreibweise (Vorname Nachname).` : '';
}
function findSeatByName(raw){
const norm = normalize(raw);
if(!norm.compact) return null;
if(SEATING[norm.compact]) return {key:norm.compact, alias:false};
const aliasKey = ALIASES[norm.withSpace];
if(aliasKey && SEATING[aliasKey]) return {key:aliasKey, alias:true};
const {key, dist} = bestFuzzyMatch(norm.compact);
if(key && dist > 0 && dist <= 2) return {key, alias:true};
return null;
}
const form = document.getElementById('searchForm');
form.addEventListener('submit', (e)=>{
e.preventDefault();
const input = document.getElementById('nameInput');
const raw = input.value;
const hit = findSeatByName(raw);
if(hit){
renderFound(raw.trim(), SEATING[hit.key]);
} else {
renderNotFound(raw);
}
});
document.getElementById('nameInput').addEventListener('keydown', (e)=>{
if(e.key === 'Enter'){
e.preventDefault();
form.requestSubmit();
}
});
const params = new URLSearchParams(location.search);
const prefill = params.get('name');
if(prefill){
const input = document.getElementById('nameInput');
input.value = prefill;
form.requestSubmit();
}
document.getElementById('scanBtn').addEventListener('click', ()=>{
alert('Scan-Funktion ist als Platzhalter enthalten. Hier könnte ein QR-Reader integriert werden.');
});
</script>
</body>
</html>
