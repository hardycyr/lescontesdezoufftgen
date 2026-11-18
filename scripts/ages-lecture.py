# -*- coding: utf-8 -*-
u"""L'age de lecture remonte sous l'accroche.

OU IL ETAIT. En huitieme et neuvieme puces de \u00ab Dans cet album \u00bb, apres
le format, le nombre de pages et la dorure \u2014 c'est-a-dire tout en bas
d'une liste technique, a un ecran et demi du titre.

POURQUOI IL REMONTE. C'est la premiere question de celui qui achete un
album pour un enfant : est-ce de son age ? La poser sous l'accroche, la
ou l'oeil est deja, evite qu'il faille deviner ou faire defiler.

ON LE DEPLACE, ON NE LE DUPLIQUE PAS : la meme information deux fois sur
une page courte se lit comme une hesitation.
"""
import glob
import io
import os
import re
import sys

RAC = (u'C:/Users/cyril/OneDrive/H\u00e9l\u00e8ne/Les contes de Zoufftgen/'
       u'Site internet/public/boutique/')

# Les puces ne sont pas ecrites pareil d'une page a l'autre : La
# Sorciere met une espace insecable avant \u00ab ans \u00bb. On les repere donc
# par motif plutot que par egalite.
FR = re.compile(r'[ \t]*<li>lecture (?:accompagn\u00e9e|autonome)[^<]*</li>\n')
EN = re.compile(r'[ \t]*<li>(?:read-aloud|independent reading)[^<]*</li>\n')

LIGNE_FR = (u'        <p class="book-ages">\n'
            u'          Lecture accompagn\u00e9e d\u00e8s 3&nbsp;ans &middot; '
            u'Lecture autonome \u00e0 partir de 6-7&nbsp;ans\n'
            u'        </p>\n')
LIGNE_EN = (u'        <p class="book-ages">\n'
            u'          Read-aloud from age 3 &middot; '
            u'Independent reading from age 6-7\n'
            u'        </p>\n')

STYLE = u'''
    /* L'age de lecture, juste sous l'accroche : on sort de l'italique
       de .book-intro p pour que ce soit une mention, pas une suite du
       texte. Chiffres alignes : Libre Baskerville sort sinon des
       chiffres elzeviriens au milieu d'une ligne en capitales basses. */
    .book-ages {
      font-family: 'Libre Baskerville', 'Baskerville', Georgia, serif;
      font-size: 0.9rem;
      font-style: normal;
      color: #555;
      text-align: center;
      letter-spacing: 0.02em;
      font-variant-numeric: lining-nums;
      font-feature-settings: 'lnum' 1;
      margin: 1rem auto 0;
      max-width: 600px;
    }
'''

# Les feuilles de style de ces pages ne sont pas formatees pareil (les
# unes aerees, les autres sur une ligne) : on se raccroche a la fin du
# bloc, qui est la seule forme commune.
ANCRE_STYLE = u'  </style>'

for f in sorted(glob.glob(RAC + u'*.html')):
    nom = os.path.basename(f)
    if nom.startswith(u'panier'):
        continue
    anglais = nom.endswith(u'-en.html')
    puces = EN if anglais else FR
    ligne = LIGNE_EN if anglais else LIGNE_FR

    s = io.open(f, encoding='utf-8').read()
    if u'book-ages' in s:          # deja fait lors d'un passage precedent
        sys.stdout.write('  %s (deja pose)\n' % nom)
        continue

    # 1. retirer les deux puces
    s, n = puces.subn(u'', s)
    assert n == 2, (nom, 'puces', n)

    # 2. poser la mention a la fin du bloc .book-intro
    i = s.index(u'<div class="book-intro">')
    j = s.index(u'</div>', i)
    s = s[:j] + ligne + s[j:]

    # 3. la regle de style, juste avant .book-content
    assert s.count(ANCRE_STYLE) == 1, (nom, 'ancre')
    s = s.replace(ANCRE_STYLE, STYLE.lstrip(u'\n') + u'\n' + ANCRE_STYLE)

    io.open(f, 'w', encoding='utf-8', newline='\n').write(s)
    sys.stdout.write('  %s\n' % nom)
