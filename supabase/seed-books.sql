-- Bulk import books from Books.xlsx (200 titles)
-- Generated: 2026-05-22
-- Run in Supabase Dashboard → SQL Editor
-- Prerequisites: library_schema.sql applied
-- Safe to re-run: skips duplicate ISBNs and same title+author.

BEGIN;

-- Categories from spreadsheet
INSERT INTO categories (name, description) VALUES ('General', 'Imported from Books.xlsx') ON CONFLICT (name) DO NOTHING;
INSERT INTO categories (name, description) VALUES ('අධ්‍යාත්මික පොත්', 'Imported from Books.xlsx') ON CONFLICT (name) DO NOTHING;
INSERT INTO categories (name, description) VALUES ('අධ්‍යාපනික පොත්', 'Imported from Books.xlsx') ON CONFLICT (name) DO NOTHING;
INSERT INTO categories (name, description) VALUES ('කෙටි කතා පොත්', 'Imported from Books.xlsx') ON CONFLICT (name) DO NOTHING;
INSERT INTO categories (name, description) VALUES ('නවකතා පොත්', 'Imported from Books.xlsx') ON CONFLICT (name) DO NOTHING;
INSERT INTO categories (name, description) VALUES ('පරිවර්තන පොත්', 'Imported from Books.xlsx') ON CONFLICT (name) DO NOTHING;
INSERT INTO categories (name, description) VALUES ('මනෝ විද්‍යාත්මක පොත්', 'Imported from Books.xlsx') ON CONFLICT (name) DO NOTHING;

-- Authors from spreadsheet
INSERT INTO authors (name) VALUES ('B.R. AGRAWAL') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('BIMAN BASY') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('CHARLES DICKENS') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('CHID AMBAR') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('DANIEL DEFORE') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('H.N. SRIVASTAVA') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('JUGJIT SINGH') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('K.T. ACHAYA') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('KULDEEP MATHUR') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('KXISHNA KRIOALANI') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('LEELA SAMSON') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('MAHATHMA GANDI') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('Marting Hewings') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('NICK JICIC') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('NIKHIL DEY') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('NORMAN VINCETPEALE') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('PADMA RAMACHANRA') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('PUSHPA M. BHARGAMAN') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('R.K. LAXSHMAN') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('RUDYARD KIPLING') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('SETHUMADHAVARA S PAYADI') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('SHIBHANI KINGKAR') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('SP.CHATTERGEA') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('SURESH') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('Unknown Author') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('අනුල ද සිල්වා') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('අභය හේවාවසම්') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('ආර්.එච්. විලියම්') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('ආර්.බී. අතපත්තු') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('ඇන්.ඩී. පිරිස්') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('උදේනි සරච්චන්ද්‍ර') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('එච්.ඒ. ගමගේ') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('එඩ්වඩ් මල්ලවආරච්චි') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('එදිරිවීර සරච්චන්ද්‍ර') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('එන්. පී. විජේරත්න') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('එන්.චන්ද්‍රසිරි කිරිඇල්ල') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('එන්.ටී. විජේරත්න') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('එම්.එස්.ඒ. නසාර්') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('එම්.ඩී.සි. තරිඳු පෙරේරා') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('එල්.එස්.ටී අමරරත්න') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('ඒ.ඊ.එස්. දසනායක') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('ඒ.එම්.කේ.බී. අධිකාරි') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('ඒ.පි. ගුණරත්න') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('කඳන ආරච්චිගේ තිලකරත්න') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('කපිල කුමාර කාලිංග') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('කපිල ගාමිණි ජයසිංහ') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('කරුණා රත්නායක') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('කල්ප එරන්ද') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('කාර්ලෝ කොලොඩිගේ') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('කැත්ලින් ජයවර්ධන') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('කුමාර කරුණාරත්න') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('කුමාරතුංග මුනිදාස') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('කේ.ඉදුනිල් ද සිල්වා') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('කේ.එන්.ඩී. පිරිස්') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('කේ.එම්.ටී. අමරසිරි') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('කේ.ඒ.එස්.පී. කළුආරච්චි') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('චන්දන මෙන්ඩිස්') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('චන්ද්‍රසිරි කළුබෝවිල') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('චන්දි කොඩිකාර') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('චිංගිස් අයිත්මාතව්') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('චිංගිස් අයිත්මාතවි') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('චින්තා ලක්ෂ්මි') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('ජනමාධ්‍ය අමාත්‍යාංශය') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('ජයතිලක කම්මැල්ලවීර') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('ජයවිර ලියනගේ') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('ජානක ලිලාරත්න') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('ජැක්සන් ඇන්තනී') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('ජිනසිරි දඩැල්ලගේ') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('ජේ.බී. දිසානායක') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('ටී. ජයකුමාර්') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('ටී.පේරින් පනායගම') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('ඩබ්ලිව්. කිංස්ලි ප්‍රනාන්දු') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('ඩබ්ලිව්.ඒ. සිල්වා') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('ඩබ්ලිව්.ඒ.ඩබ්ලිව්. සිල්වා') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('ඩබ්ලිව්.ඕ.ටී. ප්‍රනාන්දු') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('ඩී.එම්. කරුණාරත්න') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('ඩී.කේ. වික්‍රමආරච්චි') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('ඩේවිඩ් කරුණාරත්න') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('තිලකරත්න කඳාන ආරච්චි') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('තිලක් ගමගේ') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('තිස්ස හේවාවිස්ස') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('තුෂාරි අබේසේකර') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('දකුණු පළාත් සභා ලේකම් කාර්යාලය') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('දයා ද අල්විස්') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('දයා රෝහණ අතුකෝරල') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('දයාරෝහණ අතුකෝරල') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('දැදිගම පී රුද්‍රි ගෝ') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('දිනිති පද්මසිරි') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('දිපාල් සුරියආරච්චි') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('දිල්හානි වික්‍රමරත්න') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('දිලිප ජයකොඩි') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('දිලු සඳමාලි රසංගිකා මාපා') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('දිලුක අමරසිංහ') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('නදි දික්කුඹුර') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('නිරංජන් චාමින්ද කරුණාතිලක') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('නිලන්ත හෙට්ටිගේ') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('නෝබට් අයගමගේ') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('පද්මහර්ෂ කුර්තගේ') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('පර්සි ජයමාන්න') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('ප්‍රේමසිරි මාහිංගොඩ') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('පියසිරි පිරිස්') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('පී.එම්.පී. අබේසිංහ') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('පී.ටී. සිරිසේන') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('පී.බී. අබේකෝන්') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('පොතුපිටියේ අමරසේකර පහළ විතාන') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('බුද්ධික කහටපිටිය') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('බේන්ස් කාර්සන්') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('මංජුල සේනාරත්න') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('මතුගම මහින්ද විජේතිලක') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('මහින්ද ප්‍රසාද් මස්ඉඹුල') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('මාටින් වික්‍රමසිංහ') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('මැක්සිම් ගෝර්කි') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('මෝහාන් රාජ් මඩවල') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('යූ.ඒ.ඩබ්ලිව්. ද සිල්වා') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('යේෂා ප්‍රනාන්දු') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('රත්න දේශප්‍රිය අමරසූරිය') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('රාජ්‍ය භාෂා දෙපාර්තමේන්තුව') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('ලක්ෂිත රවීන් උමගිලිය') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('ලසිත රවින් උමගිලිය') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('ලසිත් රවින් උමගිලිය') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('ලියනගේ අමරකිර්ති') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('වැ.ප. විජේරත්න') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('වෑවල පී ප්‍රේමදාස') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('විමල් උදය හපුගොඩආරච්චි') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('වෛද්‍ය ආචර්ය ආර්.එච්. විලියම්') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('සත්‍ය දයාරත්න') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('සමන්ති ඉහලගේ') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('සරත් ඊරියගම') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('සරත් විජේතුංග') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('සිනිගම මහානාම මංගලසිරි') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('සිසිල් රුද්‍රි ගෝ') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('සී.වාස්. ගුණවර්ධන') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('සුදත් මංජුල අමරසේන') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('සුනිල් පෝද්දිවල') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('සූහර්ශනි ධර්මරත්න') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('හෂාන් රන්දික ඩයස්') ON CONFLICT (name) DO NOTHING;
INSERT INTO authors (name) VALUES ('හේමපාල මුනිදාස') ON CONFLICT (name) DO NOTHING;

CREATE TEMP TABLE books_import (
  legacy_book_id TEXT,
  title          TEXT NOT NULL,
  author_name    TEXT NOT NULL,
  isbn           TEXT,
  category_name  TEXT NOT NULL,
  book_status    book_status NOT NULL DEFAULT 'available',
  language       TEXT NOT NULL DEFAULT 'Sinhala'
) ON COMMIT DROP;

INSERT INTO books_import (legacy_book_id, title, author_name, isbn, category_name, book_status, language) VALUES
  ('1', 'ගුරු ගිතය', 'චිංගිස් අයිත්මාතව්', NULL, 'පරිවර්තන පොත්', 'available'::book_status, 'Sinhala'),
  ('2', 'රූපාන්තරණය', 'කැත්ලින් ජයවර්ධන', '9789556613582', 'කෙටි කතා පොත්', 'available'::book_status, 'Sinhala'),
  ('3', 'අම්මා', 'මැක්සිම් ගෝර්කි', NULL, 'පරිවර්තන පොත්', 'available'::book_status, 'Sinhala'),
  ('4', 'විජයබා කොල්ලය', 'ඩබ්ලිව්.ඒ. සිල්වා', '9552023432', 'නවකතා පොත්', 'available'::book_status, 'Sinhala'),
  ('5', 'අභියෝග්‍යතාවය හා බුද්ධිපරීක්ෂණය (පළමු පොත)', 'ඩබ්ලිව්.ඕ.ටී. ප්‍රනාන්දු', '9555931801', 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('6', 'Auto CAD පළමු කොටස', 'එන්.ටී. විජේරත්න', '9789551349210', 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('8', 'උසස් තරඟ විභාග සඳහා භාෂා හැකියාව - පළමු පොත', 'ඩබ්ලිව්.ඕ.ටී. ප්‍රනාන්දු', '9789555935388', 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('9', 'සදාචාර සමාජයක් සඳහා අධ්‍යාපනය', 'දයා රෝහණ අතුකෝරල', '955900865X', 'මනෝ විද්‍යාත්මක පොත්', 'available'::book_status, 'Sinhala'),
  ('10', 'ඔව් ඔබට ජය ගත හැකිය', 'දයා රෝහණ අතුකෝරල', '955900879X', 'මනෝ විද්‍යාත්මක පොත්', 'available'::book_status, 'Sinhala'),
  ('11', 'දියුණුවේ රහස්', 'දයා රෝහණ අතුකෝරල', '9789551782327', 'මනෝ විද්‍යාත්මක පොත්', 'available'::book_status, 'Sinhala'),
  ('12', 'මනෝ විද්‍යාත්මක උපදේශනය', 'දයා රෝහණ අතුකෝරල', '978955178085', 'මනෝ විද්‍යාත්මක පොත්', 'available'::book_status, 'Sinhala'),
  ('13', 'ශ්‍රි ලංකා පරිපාලන සේවා සිමිත/විවෘත සහ උසස් තරඟ විභාග සඳහා', 'ඩබ්ලිව්.ඕ.ටී. ප්‍රනාන්දු', '9789555932127', 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('14', 'බුදු දහමයි විද්‍යාවයි ජිවිතයයි', 'මතුගම මහින්ද විජේතිලක', '9551178386', 'අධ්‍යාත්මික පොත්', 'available'::book_status, 'Sinhala'),
  ('15', 'Advanced English Grammar', 'Marting Hewings', '9788175960671', 'අධ්‍යාපනික පොත්', 'available'::book_status, 'English'),
  ('16', 'මලලසේකර ඉංග්‍රිසි - සිංහල ශබ්ද කෝෂය', 'Unknown Author', '9789552116742', 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('17', 'අපට නොපෙනෙන ලෝකය - සිව්වන කොටස', 'මතුගම මහින්ද විජේතිලක', '9789556614466', 'අධ්‍යාත්මික පොත්', 'available'::book_status, 'Sinhala'),
  ('18', 'කාර්යාල ක්‍රම', 'ඩබ්ලිව්.ඒ. සිල්වා', '9559955608', 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('19', 'බවතරණය', 'මාටින් වික්‍රමසිංහ', '9558415456', 'නවකතා පොත්', 'available'::book_status, 'Sinhala'),
  ('20', 'දෙමළ I', 'ඇන්.ඩී. පිරිස්', '9552111307', 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('21', 'දෙමළ II', 'ඇන්.ඩී. පිරිස්', '9552111684', 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('22', 'විලාසනියකගේ ප්‍රේමය', 'එදිරිවීර සරච්චන්ද්‍ර', '9552063361', 'නවකතා පොත්', 'available'::book_status, 'Sinhala'),
  ('23', 'මලවුන්ගේ අවුරුදු දා', 'එදිරිවීර සරච්චන්ද්‍ර', '9552021596', 'නවකතා පොත්', 'available'::book_status, 'Sinhala'),
  ('24', 'සිරිලක දිය ඇලි', 'තිස්ස හේවාවිස්ස', '9789551710924', 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('26', 'ප්‍රථමාධාර අත්පොත', 'ආර්.බී. අතපත්තු', '955211053X', 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('27', 'හස්ත රේඛා විද්‍යාව', 'ඩබ්ලිව්. කිංස්ලි ප්‍රනාන්දු', NULL, 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('28', 'නැකත් හදන හැටි', 'ආර්.එච්. විලියම්', '9552112850', 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('29', 'ඔබේ දරුවා රජ කරවන්න', 'තිලක් ගමගේ', '9559818102', 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('30', 'කේන්ද්‍ර බලන්න ඉගෙන ගන්න', 'ජයවිර ලියනගේ', '9789559950097', 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('31', 'සිංහල පිඩීයා', 'සමන්ති ඉහලගේ', '9789550581030', 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('32', 'එදා හෙල දිව', 'ඩේවිඩ් කරුණාරත්න', '9552102235', 'නවකතා පොත්', 'available'::book_status, 'Sinhala'),
  ('33', 'Auto CAD - සැලසුම් අදින්නේ මෙහෙමයි', 'එන්. පී. විජේරත්න', '9789551349356', 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('34', 'ඔබේ ම කම්පියුටරයක් සකස් කර ගන්න', 'එන්. පී. විජේරත්න', '9789551349424', 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('35', 'දෙමළ සිංහල ශබ්ද කෝෂය', 'කේ.එන්.ඩී. පිරිස්', '9559635565', 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('36', 'ආයතන සංග්‍රහයේ රෙගුලාසි පිළිබඳ සටහන් හා ප්‍රශ්නෝත්තර සංග්‍රහය', 'ඩබ්ලිව්.ඒ.ඩබ්ලිව්. සිල්වා', '9789559955658', 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('37', 'නිති ප්‍රවේශයට අත්වැලක්', 'ටී. ජයකුමාර්', '9789555037044', 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('38', 'ප්‍රාර්ථනා', 'එඩ්වඩ් මල්ලවආරච්චි', '9558460001', 'නවකතා පොත්', 'available'::book_status, 'Sinhala'),
  ('39', 'ඇස්', 'ජයතිලක කම්මැල්ලවීර', '9789556528688', 'නවකතා පොත්', 'available'::book_status, 'Sinhala'),
  ('41', 'සෝවියට් කෙටිකතා', 'පද්මහර්ෂ කුර්තගේ', '9789556524604', 'කෙටි කතා පොත්', 'available'::book_status, 'Sinhala'),
  ('42', 'සංවිධාන චර්යාව', 'කේ.ඒ.එස්.පී. කළුආරච්චි', '9552095379', 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('43', 'රාජ්‍ය ගිණුම්කාර්ය පටිපාටිය', 'යූ.ඒ.ඩබ්ලිව්. ද සිල්වා', '9789559955627', 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('44', 'ඉතිරි කරන්නන්ට අත්වැලක්', 'පී.ටී. සිරිසේන', '9789555372503', 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('45', 'ඉංග්‍රිසි කතාව ඉගෙනීමේ රහස් හත', 'කේ.එම්.ටී. අමරසිරි', '9781622138', 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('46', 'කටු කුරුල්ලෝ', 'කුමාර කරුණාරත්න', '9789558504338', 'නවකතා පොත්', 'available'::book_status, 'Sinhala'),
  ('47', 'දෙමළ III', 'ඇන්.ඩී. පිරිස්', '9552111714', 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('48', 'THE JUNGLE BOOK', 'RUDYARD KIPLING', '9788177586619', 'නවකතා පොත්', 'available'::book_status, 'English'),
  ('49', 'ROBINSON CRUSOE', 'DANIEL DEFORE', NULL, 'නවකතා පොත්', 'available'::book_status, 'English'),
  ('50', 'DAVID COPPERFIED', 'CHARLES DICKENS', '97881775866695', 'නවකතා පොත්', 'available'::book_status, 'English'),
  ('51', 'නස්රුදින් 1', 'පර්සි ජයමාන්න', '9552111528', 'නවකතා පොත්', 'available'::book_status, 'Sinhala'),
  ('52', 'නස්රුදින් 2', 'පර්සි ජයමාන්න', '9552113881', 'නවකතා පොත්', 'available'::book_status, 'Sinhala'),
  ('54', 'සර්කිට් ඉලෙක්ට්‍රෝනික පරිපථ 101', 'බුද්ධික කහටපිටිය', '9789551710391', 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('56', 'කළමනාකරණය', 'කේ.ඒ.එස්.පී. කළුආරච්චි', '9552099433', 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('58', 'දෙමළ I,II', 'එම්.එස්.ඒ. නසාර්', '9789555320450', 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('59', 'ROBOTS & ROBOTICS', 'CHID AMBAR', '9788123709147', 'අධ්‍යාපනික පොත්', 'available'::book_status, 'English'),
  ('60', 'EMPLOYMENT GUARANTEE ACT', 'NIKHIL DEY', '9788123747286', 'අධ්‍යාපනික පොත්', 'available'::book_status, 'English'),
  ('61', 'ASTROLOGY', 'BIMAN BASY', '9788123753881', 'අධ්‍යාපනික පොත්', 'available'::book_status, 'English'),
  ('62', 'GANDHI A LIFE', 'KXISHNA KRIOALANI', '98123706464', 'අධ්‍යාපනික පොත්', 'available'::book_status, 'English'),
  ('63', 'COMPENDIUM', 'Unknown Author', '9788133745572', 'General', 'available'::book_status, 'English'),
  ('64', 'ROMANCE OF POSTAGE STAMPS', 'SP.CHATTERGEA', NULL, 'General', 'available'::book_status, 'English'),
  ('65', 'INDIAN CONSTITUTION', 'SHIBHANI KINGKAR', '8123755481', 'General', 'available'::book_status, 'English'),
  ('66', 'EDUCATION IN INDIA', 'PADMA RAMACHANRA', '9788123744438', 'General', 'available'::book_status, 'English'),
  ('67', 'GOVERNMENT TO GOVERNMENT', 'KULDEEP MATHUR', '8123754108', 'General', 'available'::book_status, 'English'),
  ('68', 'WHAT IS HINDUNISM', 'MAHATHMA GANDI', '9788123709274', 'General', 'available'::book_status, 'English'),
  ('69', 'SHIVAJI', 'SETHUMADHAVARA S PAYADI', '9788123706474', 'General', 'available'::book_status, 'English'),
  ('70', 'THE LOY OF CLASSIAL DANCE OF INDIA', 'LEELA SAMSON', '8123739761', 'General', 'available'::book_status, 'English'),
  ('71', 'CASTAL HAZARD', 'H.N. SRIVASTAVA', '9788123754529', 'General', 'available'::book_status, 'English'),
  ('72', 'OUR JUDICIARY', 'B.R. AGRAWAL', '9788123706351', 'General', 'available'::book_status, 'English'),
  ('73', 'DEMOCRACY', 'R.K. LAXSHMAN', '9788123717715', 'General', 'available'::book_status, 'English'),
  ('74', 'SRINIVASA RAMANJAN', 'SURESH', '9788123728117', 'General', 'available'::book_status, 'English'),
  ('75', 'GANDHI INDIA', 'Unknown Author', '812375213X', 'General', 'available'::book_status, 'English'),
  ('76', 'GENETICS TODAY', 'JUGJIT SINGH', '9788123717876', 'General', 'available'::book_status, 'English'),
  ('77', 'OUR CONSTIUTION', 'Unknown Author', '8123707374', 'General', 'available'::book_status, 'English'),
  ('78', 'ANGELS DEVI & SCIENCE', 'PUSHPA M. BHARGAMAN', '8123751826', 'General', 'available'::book_status, 'English'),
  ('79', 'EVERY DAY INDIA', 'K.T. ACHAYA', '9788123710358', 'General', 'available'::book_status, 'English'),
  ('80', 'දකුණු පළාත් සභාවේ ප්‍රතිපත්ති ප්‍රකාශනය', 'Unknown Author', NULL, 'General', 'available'::book_status, 'Sinhala'),
  ('81', 'MINOR CONTRACTS', 'Unknown Author', NULL, 'General', 'available'::book_status, 'English'),
  ('82', 'DIS - SBD/03', 'Unknown Author', NULL, 'General', 'available'::book_status, 'Sinhala'),
  ('83', 'SPECIFIATION FOR IRRIGATION & DRAINAGE WORKS', 'Unknown Author', NULL, 'General', 'available'::book_status, 'English'),
  ('84', 'HYDROLOGICAL ANNUAL / 2014/2015', 'Unknown Author', NULL, 'General', 'available'::book_status, 'English'),
  ('85', 'HYDROLOGICAL ANNUAL / 2015/2016', 'Unknown Author', NULL, 'General', 'available'::book_status, 'English'),
  ('86', 'පළාත් සභා', 'කඳන ආරච්චිගේ තිලකරත්න', '978955420323', 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('87', 'එවා මෙහේ බෑ මචං I', 'ජිනසිරි දඩැල්ලගේ', '9789559764359', 'නවකතා පොත්', 'available'::book_status, 'Sinhala'),
  ('88', 'එවා මෙහේ බෑ මචං II', 'ජිනසිරි දඩැල්ලගේ', NULL, 'නවකතා පොත්', 'available'::book_status, 'Sinhala'),
  ('89', 'එවා මෙහේ බෑ මචං III', 'ජිනසිරි දඩැල්ලගේ', NULL, 'නවකතා පොත්', 'available'::book_status, 'Sinhala'),
  ('90', 'සිඳු තරඟ I', 'සත්‍ය දයාරත්න', '978556863641', 'නවකතා පොත්', 'available'::book_status, 'Sinhala'),
  ('91', 'සිඳු තරඟ II', 'සත්‍ය දයාරත්න', '978556863642', 'නවකතා පොත්', 'available'::book_status, 'Sinhala'),
  ('92', 'සොදුරු අතිතය', 'පොතුපිටියේ අමරසේකර පහළ විතාන', NULL, 'General', 'available'::book_status, 'Sinhala'),
  ('93', 'පාලන වාර්තාව 2017', 'Unknown Author', NULL, 'General', 'available'::book_status, 'Sinhala'),
  ('94', 'දකුණු පළාත් සභාවේ ප්‍රතිපත්ති ප්‍රකාශය 2015', 'Unknown Author', NULL, 'General', 'available'::book_status, 'Sinhala'),
  ('95', '2018 පාලන වාර්තාව', 'Unknown Author', NULL, 'General', 'available'::book_status, 'Sinhala'),
  ('96', 'කාර්යාල ක්‍රම සහ භාවිතය', 'එච්.ඒ. ගමගේ', '9789559700654', 'General', 'available'::book_status, 'Sinhala'),
  ('98', 'රෝහන ආයුර්වේදය', 'Unknown Author', NULL, 'General', 'available'::book_status, 'Sinhala'),
  ('99', 'සංඛ්‍යාන නිබන්ධනය 2015', 'Unknown Author', NULL, 'General', 'available'::book_status, 'Sinhala'),
  ('100', 'සංඛ්‍යාන නිබන්ධනය 2016', 'Unknown Author', NULL, 'General', 'available'::book_status, 'Sinhala'),
  ('101', 'රාජ්‍ය සේවා දැනුම් එකතුව සහ ප්‍රශ්න සංග්‍රහය', 'ඩී.කේ. වික්‍රමආරච්චි', '9786249532502', 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('102', 'රාජ්‍ය මුල්‍ය කළමනාකරණය', 'සුනිල් පෝද්දිවල', NULL, 'General', 'available'::book_status, 'Sinhala'),
  ('103', 'දකුණු පළාත් සභාවේ ප්‍රතිපත්ති ප්‍රකාශය 2016/2017', 'Unknown Author', NULL, 'General', 'available'::book_status, 'Sinhala'),
  ('104', 'කාර්ය සාධන වාර්තාව 2018', 'Unknown Author', NULL, 'General', 'available'::book_status, 'Sinhala'),
  ('105', 'සංඛ්‍යාන නිබන්ධනය', 'Unknown Author', NULL, 'General', 'available'::book_status, 'Sinhala'),
  ('106', 'සංඛ්‍යාන නිබන්ධනය', 'Unknown Author', NULL, 'General', 'available'::book_status, 'Sinhala'),
  ('107', 'සදිය පැතිකඩ', 'Unknown Author', NULL, 'General', 'available'::book_status, 'Sinhala'),
  ('109', 'සිංහල පද වර්ග', 'කල්ප එරන්ද', '9789552122941', 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('110', 'නිදන් දුපත', 'ප්‍රේමසිරි මාහිංගොඩ', '9789552119682', 'පරිවර්තන පොත්', 'available'::book_status, 'Sinhala'),
  ('111', 'පිනෝකියෝ', 'කාර්ලෝ කොලොඩිගේ', '9552106753', 'පරිවර්තන පොත්', 'available'::book_status, 'Sinhala'),
  ('114', 'වාල්මිකාගේ රාමායනය', 'පී.එම්.පී. අබේසිංහ', '9789552103878', 'පරිවර්තන පොත්', 'available'::book_status, 'Sinhala'),
  ('115', 'රෝබින් හුඩ්', 'ඩේවිඩ් කරුණාරත්න', '9789552102227', 'පරිවර්තන පොත්', 'available'::book_status, 'Sinhala'),
  ('116', 'එදා හෙළ දිව', 'ඩේවිඩ් කරුණාරත්න', NULL, 'පරිවර්තන පොත්', 'available'::book_status, 'Sinhala'),
  ('117', 'වස්තු විද්‍යානුකුල ගෘහ නිර්මාණය', 'රත්න දේශප්‍රිය අමරසූරිය', '9552112952', 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('118', 'වාස්තු විද්‍යා අත්පොත', 'රත්න දේශප්‍රිය අමරසූරිය', '9789552119668', 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('119', 'නිවාස අත්පොත', 'වෛද්‍ය ආචර්ය ආර්.එච්. විලියම්', '9789552122880', 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('120', 'බුද්ධි පරික්ෂණය', 'සරත් ඊරියගම', '9552109310', 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('121', 'සමාන පද හා විරුද්ධ පද', 'කල්ප එරන්ද', '9552122965', 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('122', 'අභියෝග්‍යතාව', 'පියසිරි පිරිස්', '9789552123405', 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('123', 'ආදරණිය මාක්ස්', 'නදි දික්කුඹුර', '9789552129155', 'පරිවර්තන පොත්', 'available'::book_status, 'Sinhala'),
  ('124', 'A TAKE OF TWO CITYS', 'CHARLES DICKENS', '9729552126949', 'General', 'available'::book_status, 'English'),
  ('125', 'කුමාර රචනය', 'ඒ.ඊ.එස්. දසනායක', NULL, 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('126', 'කුමාර රෝදය', 'එල්.එස්.ටී අමරරත්න', NULL, 'General', 'available'::book_status, 'Sinhala'),
  ('127', 'හත්පන', 'කුමාරතුංග මුනිදාස', '9789552129575', 'නවකතා පොත්', 'available'::book_status, 'Sinhala'),
  ('128', 'LIFE WITHOUT LIMITS', 'NICK JICIC', '978037589743', 'General', 'available'::book_status, 'English'),
  ('129', 'THE POWER OF POSITIVE THINKING', 'NORMAN VINCETPEALE', '9789381529720', 'General', 'available'::book_status, 'English'),
  ('130', 'කඳුකර ජිවිතයේ අභිරහස් ඝාතනය', 'ලක්ෂිත රවීන් උමගිලිය', '9789551596244', 'නවකතා පොත්', 'available'::book_status, 'Sinhala'),
  ('131', 'ENGLIGH PROVERBS', 'ඩී.එම්. කරුණාරත්න', '9789559346539', 'අධ්‍යාපනික පොත්', 'available'::book_status, 'English'),
  ('132', 'දුක දිනාගත් හපන්නෝ', 'දයාරෝහණ අතුකෝරල', '9789551782894', 'මනෝ විද්‍යාත්මක පොත්', 'available'::book_status, 'Sinhala'),
  ('133', 'කේක් කාලාවේ අපුරු නිර්මාණ', 'දිලුක අමරසිංහ', '9556238905', 'General', 'available'::book_status, 'Sinhala'),
  ('134', 'සාමාන්‍ය දැනීම', 'Unknown Author', NULL, 'General', 'available'::book_status, 'Sinhala'),
  ('135', 'රතුවත ඇදි කත', 'චන්දන මෙන්ඩිස්', NULL, 'පරිවර්තන පොත්', 'available'::book_status, 'Sinhala'),
  ('136', 'පෞද්ගලිකයි රහසිගතයි', 'චන්දන මෙන්ඩිස්', '9559777645', 'පරිවර්තන පොත්', 'available'::book_status, 'Sinhala'),
  ('137', 'සප්න මයා', 'චන්දි කොඩිකාර', '978955166048', 'නවකතා පොත්', 'available'::book_status, 'Sinhala'),
  ('138', 'නිකිනි සිහිනය', 'චන්දි කොඩිකාර', '9789551660468', 'නවකතා පොත්', 'available'::book_status, 'Sinhala'),
  ('139', 'සුදු මල් පියවිලි 1 2', 'චන්දි කොඩිකාර', '9789551660772', 'නවකතා පොත්', 'available'::book_status, 'Sinhala'),
  ('140', 'අනුපම සිතුවම්', 'චන්දි කොඩිකාර', '9789551660130', 'නවකතා පොත්', 'available'::book_status, 'Sinhala'),
  ('142', 'අම්මා', 'මැක්සිම් ගෝර්කි', '9789555910446', 'පරිවර්තන පොත්', 'available'::book_status, 'Sinhala'),
  ('143', 'කළමනාකරණ මුලධර්ම හා සිද්ධි අධ්‍යනය', 'දයා රෝහණ අතුකෝරල', '9789551782658', 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('144', 'ශ්‍රි ලංකා පරිපාලන සේවා', 'ඩබ්ලිව්.ඕ.ටී. ප්‍රනාන්දු', NULL, 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('145', 'රාජ්‍ය සේවා විභාග ජයමග', 'ඒ.එම්.කේ.බී. අධිකාරි', '9789555440448', 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('147', 'දරුවන් දිවිනසා ගන්නේ ඇයි', 'සරත් විජේතුංග', '9789556525748', 'මනෝ විද්‍යාත්මක පොත්', 'available'::book_status, 'Sinhala'),
  ('148', 'ගුරු ගිතය', 'චිංගිස් අයිත්මාතවි', '9789555911139', 'පරිවර්තන පොත්', 'available'::book_status, 'Sinhala'),
  ('149', 'මාතාභාරි', 'චන්ද්‍රසිරි කළුබෝවිල', '9789552126109', 'නවකතා පොත්', 'available'::book_status, 'Sinhala'),
  ('151', 'නිවැරදි සිංහලය', 'ජේ.බී. දිසානායක', '9789556962369', 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('152', 'අපේගම සිනිගම', 'සිනිගම මහානාම මංගලසිරි', '9789555387620', 'නවකතා පොත්', 'available'::book_status, 'Sinhala'),
  ('153', 'විසල් අහසයට කදුහෙල් බෝමා', 'පී.බී. අබේකෝන්', '9786249740402', 'නවකතා පොත්', 'available'::book_status, 'Sinhala'),
  ('154', 'නායකත්ව ගුණාංග හා ඵලදායිතාව', 'වැ.ප. විජේරත්න', '9789555022910', 'මනෝ විද්‍යාත්මක පොත්', 'available'::book_status, 'Sinhala'),
  ('157', 'සිහිනයකි සඳ', 'ජානක ලිලාරත්න', '9786240008303', 'නවකතා පොත්', 'available'::book_status, 'Sinhala'),
  ('158', 'ස්ත්‍රි යාචකගේ අවදානය', 'සී.වාස්. ගුණවර්ධන', '9786249809000', 'නවකතා පොත්', 'available'::book_status, 'Sinhala'),
  ('159', 'සමථකරනය හා සාමවිනිසුරු භූමිකාව', 'කේ.ඉදුනිල් ද සිල්වා', '9789553887405', 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('160', 'ලංකා සිවිල් සේවය', 'තිලකරත්න කඳාන ආරච්චි', '9786249899209', 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('161', 'බ්‍රෝහියර් දුටු ලංකාව', 'අභය හේවාවසම්', '9789559348639', 'පරිවර්තන පොත්', 'available'::book_status, 'Sinhala'),
  ('162', 'බ්‍රෝහියර් දුටු ලංකාව', 'අභය හේවාවසම්', NULL, 'පරිවර්තන පොත්', 'available'::book_status, 'Sinhala'),
  ('163', 'බ්‍රෝහියර් දුටු ලංකාව', 'අභය හේවාවසම්', NULL, 'පරිවර්තන පොත්', 'available'::book_status, 'Sinhala'),
  ('166', 'පෝෂණය හා කිරි', 'Unknown Author', NULL, 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('167', 'රිය පැදවීම', 'ටී.පේරින් පනායගම', '9555993688', 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('168', 'රිය පැදවීම', 'ටී.පේරින් පනායගම', NULL, 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('169', 'රාජකාරි ලිපි සම්පාදනයට අත්වැලක්', 'රාජ්‍ය භාෂා දෙපාර්තමේන්තුව', '9789559180333', 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('170', 'රාජකාරි ලිපි සම්පාදනයට අත්වැලක්', 'රාජ්‍ය භාෂා දෙපාර්තමේන්තුව', NULL, 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('171', 'රාජකාරි ලිපි සම්පාදනයට අත්වැලක්', 'රාජ්‍ය භාෂා දෙපාර්තමේන්තුව', NULL, 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('172', 'රාජකාරි ලිපි සම්පාදනයට අත්වැලක්', 'රාජ්‍ය භාෂා දෙපාර්තමේන්තුව', NULL, 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('173', 'රාජකාරි ලිපි සම්පාදනයට අත්වැලක්', 'රාජ්‍ය භාෂා දෙපාර්තමේන්තුව', NULL, 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('174', 'රාජකාරි ලිපි සම්පාදනයට අත්වැලක්', 'රාජ්‍ය භාෂා දෙපාර්තමේන්තුව', NULL, 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('175', 'දකුණු පළාත් සභා ප්‍රඥාප්තිය', 'දකුණු පළාත් සභා ලේකම් කාර්යාලය', NULL, 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('176', 'කර්මාන්ත පුහුණු වාර්තාව', 'එම්.ඩී.සි. තරිඳු පෙරේරා', NULL, 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('177', 'නාගරික තිරසාර සංවර්ධනය', 'එන්.චන්ද්‍රසිරි කිරිඇල්ල', '9789553108111', 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('178', 'සිවිල් සමාජ දේපල නිති ප්‍රතිකර්ම', 'කපිල ගාමිණි ජයසිංහ', '9789556615262', 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('179', 'ශ්‍රි ලංකාවේ වානිජ හා ව්‍යාපාර නිති', 'සුදත් මංජුල අමරසේන', '9559705415', 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('180', 'නායකත්වය', 'දිපාල් සුරියආරච්චි', '97895531070777', 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('181', 'වාස්තු සාරදර්ශනය', 'වෑවල පී ප්‍රේමදාස', '9789556716832', 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('182', 'මානව සම්පත් සංවර්ධනය', 'උදේනි සරච්චන්ද්‍ර', '9789556719161', 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('183', 'මාර්ගෝපදේශ සංග්‍රහය', 'ජනමාධ්‍ය අමාත්‍යාංශය', NULL, 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('184', 'මාර්ගෝපදේශ සංග්‍රහය', 'ජනමාධ්‍ය අමාත්‍යාංශය', NULL, 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('185', 'රෝසපාට හින පොකුරු', 'චන්දි කොඩිකාර', '9789551660697', 'නවකතා පොත්', 'available'::book_status, 'Sinhala'),
  ('186', 'ලිලැක්', 'යේෂා ප්‍රනාන්දු', '9786246417000', 'නවකතා පොත්', 'available'::book_status, 'Sinhala'),
  ('187', 'බංගලාවෙන් බිල්ලක්', 'ලසිත් රවින් උමගිලිය', '9786245152322', 'නවකතා පොත්', 'available'::book_status, 'Sinhala'),
  ('188', 'සධෂකාරි', 'දිල්හානි වික්‍රමරත්න', '9786245766000', 'නවකතා පොත්', 'available'::book_status, 'Sinhala'),
  ('189', 'ස්නේහයේ පනකුරු', 'දිලු සඳමාලි රසංගිකා මාපා', '9789557339160', 'නවකතා පොත්', 'available'::book_status, 'Sinhala'),
  ('190', 'අපරාධ නිතියේ නව ප්‍රවනතා', 'කපිල ගාමිණි ජයසිංහ', '9786245608096', 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('191', 'රාජ්‍ය පරිපාලනය', 'කරුණා රත්නායක', NULL, 'General', 'available'::book_status, 'Sinhala'),
  ('192', 'ජිවිතය සහ නිතිය', 'නිලන්ත හෙට්ටිගේ', '9789558786109', 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('193', 'ජිවිතයෙන් මාස හයක්', 'මංජුල සේනාරත්න', '9786245579426', 'නවකතා පොත්', 'available'::book_status, 'Sinhala'),
  ('194', 'අපුගේ ලෝකය', 'චින්තා ලක්ෂ්මි', '9789556520828', 'පරිවර්තන පොත්', 'available'::book_status, 'Sinhala'),
  ('195', 'පංචතන්ත්‍රය', 'හේමපාල මුනිදාස', '9789552102197', 'පරිවර්තන පොත්', 'available'::book_status, 'Sinhala'),
  ('196', 'මැදියම් රැ පුස්තකාලය', 'හෂාන් රන්දික ඩයස්', '9789552132155', 'පරිවර්තන පොත්', 'available'::book_status, 'Sinhala'),
  ('197', 'සැමිගේ කතාව', 'සිසිල් රුද්‍රි ගෝ', '9789552112605', 'පරිවර්තන පොත්', 'available'::book_status, 'Sinhala'),
  ('198', 'බැද්දේගම', 'ඒ.පි. ගුණරත්න', '955210033X', 'පරිවර්තන පොත්', 'available'::book_status, 'Sinhala'),
  ('199', 'එකෝමත් එක දවසකට පස්සේ', 'දයා ද අල්විස්', '9789552127021', 'පරිවර්තන පොත්', 'available'::book_status, 'Sinhala'),
  ('200', 'ආපුටුංගෝ මාපුටුංගෝ', 'සූහර්ශනි ධර්මරත්න', '9789552131073', 'පරිවර්තන පොත්', 'available'::book_status, 'Sinhala'),
  ('201', 'විස්මිත දොස්තර', 'බේන්ස් කාර්සන්', '97895521352', 'පරිවර්තන පොත්', 'available'::book_status, 'Sinhala'),
  ('202', 'ඔබේ දරුවා ශිෂ්‍යත්වයට ලෑස්ති ද', 'දිනිති පද්මසිරි', '9789552128035', 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('203', 'වරදට දඩුවම', 'ලසිත රවින් උමගිලිය', '97895514596248', 'නවකතා පොත්', 'available'::book_status, 'Sinhala'),
  ('204', 'භාවනා උපදේශ සංග්‍රහය', 'නිලන්ත හෙට්ටිගේ', '9558786039', 'අධ්‍යාපනික පොත්', 'available'::book_status, 'Sinhala'),
  ('205', 'කන්ද උඩ ගින්දර', 'ජැක්සන් ඇන්තනී', '9789552129087', 'නවකතා පොත්', 'available'::book_status, 'Sinhala'),
  ('206', 'දකින්න වෙනස්ව ජිවිතය', 'නිරංජන් චාමින්ද කරුණාතිලක', '9789552132162', 'මනෝ විද්‍යාත්මක පොත්', 'available'::book_status, 'Sinhala'),
  ('207', 'ලාභයි ඇපල්', 'තුෂාරි අබේසේකර', '9789552129681', 'පරිවර්තන පොත්', 'available'::book_status, 'Sinhala'),
  ('208', 'බිඳුණු බිලින්දා', 'දිලිප ජයකොඩි', '9789556770230', 'පරිවර්තන පොත්', 'available'::book_status, 'Sinhala'),
  ('209', 'තිත්ත කෝපි', 'අනුල ද සිල්වා', '9789558892033', 'පරිවර්තන පොත්', 'available'::book_status, 'Sinhala'),
  ('210', 'ID', 'මෝහාන් රාජ් මඩවල', '9789554690103', 'නවකතා පොත්', 'available'::book_status, 'English'),
  ('211', 'කුර හඩකි වියැකෙන', 'නෝබට් අයගමගේ', '9786242040776', 'නවකතා පොත්', 'available'::book_status, 'Sinhala'),
  ('212', 'අදිසි නදිය', 'කපිල කුමාර කාලිංග', '9789556767987', 'නවකතා පොත්', 'available'::book_status, 'Sinhala'),
  ('213', 'සෙංකෝට්ටන්', 'මහින්ද ප්‍රසාද් මස්ඉඹුල', '9789550980000', 'නවකතා පොත්', 'available'::book_status, 'Sinhala'),
  ('214', 'කළුවර ගෙදර', 'මාටින් වික්‍රමසිංහ', '9784550201419', 'නවකතා පොත්', 'available'::book_status, 'Sinhala'),
  ('215', 'ලස්සන වසිලිස්සා', 'දැදිගම පී රුද්‍රි ගෝ', '9555911045', 'පරිවර්තන පොත්', 'available'::book_status, 'Sinhala'),
  ('216', 'යකඩ සිල්පර', 'විමල් උදය හපුගොඩආරච්චි', '9789556776355', 'නවකතා පොත්', 'available'::book_status, 'Sinhala'),
  ('217', 'අටවක පුත්තු', 'ලියනගේ අමරකිර්ති', '9786245087457', 'General', 'available'::book_status, 'Sinhala');

-- Books with ISBN (skip duplicate ISBN)
INSERT INTO books (
  title, isbn, author_id, category_id, language,
  total_copies, available_copies, status, tags
)
SELECT
  bi.title,
  bi.isbn,
  a.id,
  c.id,
  bi.language,
  1, 1,
  bi.book_status,
  ARRAY['legacy_book_id:' || bi.legacy_book_id]
FROM books_import bi
JOIN authors a ON a.name = bi.author_name
JOIN categories c ON c.name = bi.category_name
WHERE bi.isbn IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM books b
    WHERE b.deleted_at IS NULL AND b.isbn = bi.isbn
  )
  AND NOT EXISTS (
    SELECT 1 FROM books b
    WHERE b.deleted_at IS NULL
      AND lower(b.title) = lower(bi.title)
      AND b.author_id = a.id
  )
ON CONFLICT (isbn) DO NOTHING;

-- Books without ISBN
INSERT INTO books (
  title, author_id, category_id, language,
  total_copies, available_copies, status, tags
)
SELECT
  bi.title,
  a.id,
  c.id,
  bi.language,
  1, 1,
  bi.book_status,
  ARRAY['legacy_book_id:' || bi.legacy_book_id]
FROM books_import bi
JOIN authors a ON a.name = bi.author_name
JOIN categories c ON c.name = bi.category_name
WHERE bi.isbn IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM books b
    WHERE b.deleted_at IS NULL
      AND lower(b.title) = lower(bi.title)
      AND b.author_id = a.id
  );

COMMIT;

SELECT count(*) AS total_books FROM books WHERE deleted_at IS NULL;
SELECT count(*) AS imported_with_legacy_tag FROM books WHERE deleted_at IS NULL AND EXISTS (SELECT 1 FROM unnest(tags) t WHERE t LIKE 'legacy_book_id:%');