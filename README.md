# Tréninkový deník beachvolejbalistky – samostatná verze

Webová aplikace pro Prague Beach Team. Hráčky se přihlašují jen svým e-mailem (odkaz nebo šestimístný kód, žádné heslo) a nepotřebují účet na Claude. Data jsou v databázi Supabase. Hráčka vidí jen svoje zápisy, trenér vidí všechny.

## Co je v balíčku

| Soubor | K čemu je |
|---|---|
| `index.html` | celá aplikace |
| `config.js` | propojení s databází (vyplníš v kroku 2) |
| `manifest.webmanifest`, `icons/` | ikona s logem klubu pro „Přidat na plochu“ |
| `supabase/setup.sql` | vytvoří tabulky a pravidla přístupu |

---

## Spuštění (jednorázově, asi 30–45 minut)

### 1. Databáze Supabase
1. Založ si zdarma účet na <https://supabase.com> a klikni na **New project**.
   - Region: kterýkoli v EU, třeba **West EU (Ireland)** nebo **Central EU (Frankfurt)**, aby data zůstala v EU.
   - Heslo k databázi si ulož, ale aplikace ho nepotřebuje.
2. Otevři **SQL Editor → New query**, vlož celý **obsah** souboru `supabase/setup.sql` (ne jeho název – otevři soubor na GitHubu a zkopíruj text) a klikni na **Run**. Poslední blok (krok 6) zatím nespouštěj.
3. **Authentication → Emails → Templates → Magic Link**: do textu e-mailu přidej řádek s kódem, třeba:
   ```
   Tvůj přihlašovací kód: {{ .Token }}
   ```
   Kód je potřeba hlavně na iPhonu, když hráčka používá aplikaci z plochy.
4. **Doporučeno:** Supabase na bezplatném tarifu posílá jen pár e-mailů za hodinu. Aby se mohlo přihlásit víc hráček najednou, nastav vlastní odesílání v **Authentication → Emails → SMTP Settings**. Zdarma to jde třeba přes Resend nebo Brevo (provedu tě tím, stačí říct).

### 2. Propojení aplikace s databází
V Supabase otevři **Project Settings → API** a zkopíruj **Project URL** a **anon public** klíč do `config.js`:
```js
window.DENIK_CONFIG = {
  supabaseUrl: "https://xxxx.supabase.co",
  supabaseAnonKey: "eyJ..."
};
```
Anon klíč je veřejný a smí být v kódu. Data chrání pravidla v databázi.

### 3. Zveřejnění přes GitHub Pages
1. Na GitHubu vytvoř nový repozitář, třeba `beach-denik`. Musí být **Public**, protože GitHub Pages zdarma funguje jen pro veřejné repozitáře. V kódu nejsou žádná data hráček ani tajné klíče.
2. **Add file → Upload files**, přetáhni sem všechny soubory a složky z balíčku a dej **Commit changes**.
3. **Settings → Pages**: Source **Deploy from a branch**, branch **main**, složka **/ (root)**, a ulož.
4. Za minutu bude aplikace na adrese `https://TVUJ-UCET.github.io/beach-denik/`.
5. Tuto adresu zadej v Supabase do **Authentication → URL Configuration**: **Site URL** a také do **Redirect URLs**.

### 4. Udělej ze sebe trenéra
1. Otevři aplikaci a přihlas se svým e-mailem.
2. V Supabase v SQL Editoru spusť:
   ```sql
   update public.players set is_coach = true
     where id = (select id from auth.users where email = 'lukikorda@gmail.com');
   ```
3. Obnov aplikaci. Uvidíš záložku **Trenér** a výběr hráček.

### 5. Pozvi hráčky
Pošli jim odkaz na aplikaci. Při prvním přihlášení zadají e-mail a jméno a pak se ti objeví v přehledu.
Na ploše telefonu: **iPhone** Safari → Sdílet → *Přidat na plochu*, **Android** Chrome → ⋮ → *Přidat na plochu*. Ikona bude logo klubu.

---

## Jak aplikaci dál upravovat

**Doporučeno, přes Claude a GitHub:**
1. Na claude.ai otevři **Nastavení → Konektory** a připoj **GitHub**. Povol přístup k repozitáři `beach-denik`.
2. V konverzaci s Claude napiš, co chceš změnit, a uveď repozitář, třeba „v repozitáři TVUJ-UCET/beach-denik přidej pitný režim“.
3. Claude změnu udělá a nahraje do repozitáře. GitHub Pages ji do minuty zveřejní a hráčkám se po obnovení stránky ukáže nová verze. Jejich data zůstanou.

**Bez propojení:** požádej Claude o upravený `index.html` a nahraj ho na GitHubu přes **Add file → Upload files**, kde přepíšeš starý soubor.

**Změny databáze** (nová tabulka, jiná pravidla) Claude připraví jako SQL. Ty ho spustíš v Supabase SQL Editoru.

---

## Ochrana údajů
Deník obsahuje údaje o spánku, únavě a zdraví hráček. Informuj o tom hráčky, a u nezletilých i rodiče, a ukládej data v EU. Hráčku i všechna její data smažeš v Supabase: **Authentication → Users → Delete user**.
