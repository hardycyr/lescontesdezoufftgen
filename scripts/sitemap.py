# -*- coding: utf-8 -*-
u"""Reconstruire le sitemap a partir des pages elles-memes.

CE QUI MANQUAIT. Le sitemap listait 24 URLs ecrites a la main, et il
avait pris du retard : ni les deux pages de kits (neuves), ni les deux
fiches de La Sorciere (qu'elle vend pourtant maintenant), ni la page des
audios, ni les quatre pages de conte derriere les QR codes des albums.

POURQUOI ON LE GENERE. Une liste tenue a la main diverge toujours. Ici
on lit les pages : chacune declare deja son URL canonique et ses
alternances de langue, et c'est a cela que Google compare le sitemap.
Les pages a canonique courte (/audios, /livre/papa-sanglier) sont ainsi
annoncees sous leur forme courte, et non sous le nom du fichier \u2014 une
divergence qui aurait fait ignorer l'entree.

LES DATES VIENNENT DE GIT, pas de l'horloge : la vraie date du dernier
commit qui a touche le fichier. Une page qui n'a pas bouge garde donc sa
date, et celles d'aujourd'hui disent aujourd'hui.

LES PRIORITES de l'ancien sitemap sont conservees telles quelles ; les
nouvelles pages prennent celle de leur famille.
"""
import io
import os
import re
import subprocess
import sys

BASE = (u'C:/Users/cyril/OneDrive/H\u00e9l\u00e8ne/Les contes de Zoufftgen/'
        u'Site internet/')
RAC = BASE + u'public/'

# Pages hors index : transactionnelles, ou sans canonique.
EXCLUES = {u'boutique/panier.html', u'boutique/panier-en.html',
           u'success.html', u'success-en.html',
           u'cancel.html', u'cancel-en.html'}

PRIORITES = {
    u'/': u'1.00',
    u'/livres-jeunesse-lorraine.html': u'0.95',
    u'/collection.html': u'0.90',
    u'/index-en.html': u'0.90',
    u'/boutique/le-petit-zouffarceur.html': u'0.85',
    u'/boutique/la-maison-du-petit-zouffarceur.html': u'0.85',
    u'/boutique/papa-sanglier-et-sa-dent-or.html': u'0.85',
    u'/boutique/la-sorciere-de-la-frontiere.html': u'0.85',
    u'/kits.html': u'0.85',
    u'/audios': u'0.80',
    u'/objetsnarratifs.html': u'0.80',
    u'/interventions.html': u'0.80',
    u'/projet.html': u'0.80',
    u'/mybooks.html': u'0.80',
    u'/boutique/le-petit-zouffarceur-en.html': u'0.75',
    u'/boutique/la-maison-du-petit-zouffarceur-en.html': u'0.75',
    u'/boutique/papa-sanglier-et-sa-dent-or-en.html': u'0.75',
    u'/boutique/la-sorciere-de-la-frontiere-en.html': u'0.75',
    u'/story-kits.html': u'0.75',
    u'/univers.html': u'0.70',
    u'/parutions.html': u'0.70',
    u'/apropos.html': u'0.70',
    u'/story-objects.html': u'0.70',
    u'/author-visits.html': u'0.70',
    u'/the-project.html': u'0.70',
    u'/livre/petit-zouffarceur': u'0.70',
    u'/livre/la-maison': u'0.70',
    u'/livre/papa-sanglier': u'0.70',
    u'/livre/la-sorciere': u'0.70',
    u'/contact.html': u'0.60',
    u'/universe.html': u'0.60',
    u'/news-and-events.html': u'0.60',
    u'/about.html': u'0.60',
    u'/contact-en.html': u'0.50',
    u'/gland': u'0.50',
}

# L'ordre de sortie : le francais d'abord, puis l'anglais, chacun du
# plus important au moins important.
ORDRE = [
    u'/', u'/collection.html', u'/livres-jeunesse-lorraine.html',
    u'/kits.html', u'/objetsnarratifs.html', u'/interventions.html',
    u'/audios', u'/univers.html', u'/parutions.html', u'/projet.html',
    u'/apropos.html', u'/contact.html',
    u'/boutique/le-petit-zouffarceur.html',
    u'/boutique/la-maison-du-petit-zouffarceur.html',
    u'/boutique/papa-sanglier-et-sa-dent-or.html',
    u'/boutique/la-sorciere-de-la-frontiere.html',
    u'/livre/petit-zouffarceur', u'/livre/la-maison',
    u'/livre/papa-sanglier', u'/livre/la-sorciere', u'/gland',
    u'/index-en.html', u'/mybooks.html', u'/story-kits.html',
    u'/story-objects.html', u'/author-visits.html', u'/universe.html',
    u'/news-and-events.html', u'/the-project.html', u'/about.html',
    u'/contact-en.html',
    u'/boutique/le-petit-zouffarceur-en.html',
    u'/boutique/la-maison-du-petit-zouffarceur-en.html',
    u'/boutique/papa-sanglier-et-sa-dent-or-en.html',
    u'/boutique/la-sorciere-de-la-frontiere-en.html',
]

SITE = u'https://www.lescontesdezoufftgen.com'


def date_git(rel):
    d = subprocess.check_output(
        ['git', '-C', BASE.rstrip(u'/'), 'log', '-1', '--format=%cs',
         '--', u'public/' + rel]).decode().strip()
    return d or u'2026-11-18'


pages = {}
for dossier, _, fichiers in os.walk(RAC):
    for n in sorted(fichiers):
        if not n.endswith(u'.html'):
            continue
        chemin = os.path.join(dossier, n).replace(u'\\', u'/')
        rel = chemin[len(RAC):]
        if rel in EXCLUES:
            continue
        s = io.open(chemin, encoding='utf-8').read()
        m = re.search(r'rel="canonical"\s+href="([^"]+)"', s)
        if not m:
            sys.stdout.write('  (sans canonique, ignoree) %s\n' % rel)
            continue
        loc = m.group(1)
        alt = re.findall(
            r'rel="alternate"\s+hreflang="([^"]+)"\s+href="([^"]+)"', s)
        pages[loc.replace(SITE, u'') or u'/'] = (loc, alt, rel)

manquantes = [c for c in pages if c not in ORDRE]
assert not manquantes, manquantes
inconnues = [c for c in ORDRE if c not in pages]
assert not inconnues, inconnues

out = [u'<?xml version="1.0" encoding="UTF-8"?>',
       u'<urlset',
       u'    xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
       u'    xmlns:xhtml="http://www.w3.org/1999/xhtml">',
       u'',
       u'  <!-- Genere depuis les pages elles-memes : chaque <loc> est la',
       u'       canonique declaree par la page, et <lastmod> la date du',
       u'       dernier commit qui l\'a touchee. Regenerer avec scripts/sitemap.py. -->',
       u'',
       u'  <!-- ===================== Pages francaises ===================== -->']

for i, cle in enumerate(ORDRE):
    if cle == u'/index-en.html':
        out += [u'', u'  <!-- ===================== Pages anglaises ====================== -->']
    loc, alt, rel = pages[cle]
    bloc = [u'',
            u'  <url>',
            u'    <loc>%s</loc>' % loc,
            u'    <lastmod>%s</lastmod>' % date_git(rel),
            u'    <priority>%s</priority>' % PRIORITES[cle]]
    for lang, href in alt:
        bloc.append(u'    <xhtml:link rel="alternate" hreflang="%s" href="%s" />'
                    % (lang, href))
    bloc.append(u'  </url>')
    out += bloc

out += [u'', u'</urlset>', u'']
io.open(RAC + u'sitemap.xml', 'w', encoding='utf-8',
        newline='\n').write(u'\n'.join(out))
sys.stdout.write('  sitemap.xml : %d URLs\n' % len(ORDRE))
