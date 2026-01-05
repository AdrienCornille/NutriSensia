#!/bin/bash

# Script pour télécharger des images temporaires depuis Unsplash
# pour la section "Mes Méthodes"

echo "📥 Téléchargement des images pour la section 'Mes Méthodes'..."

# Créer le dossier si nécessaire
mkdir -p public/images/methods

# Télécharger les images avec curl
echo "1/5 Téléchargement micronutrition.jpg..."
curl -L "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=800&h=600&fit=crop&q=80" \
  -o public/images/methods/micronutrition.jpg

echo "2/5 Téléchargement functional-nutrition.jpg..."
curl -L "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=600&fit=crop&q=80" \
  -o public/images/methods/functional-nutrition.jpg

echo "3/5 Téléchargement glycemic-management.jpg..."
curl -L "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&h=600&fit=crop&q=80" \
  -o public/images/methods/glycemic-management.jpg

echo "4/5 Téléchargement anti-inflammatory.jpg..."
curl -L "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop&q=80" \
  -o public/images/methods/anti-inflammatory.jpg

echo "5/5 Téléchargement oligotherapy.jpg..."
curl -L "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&h=600&fit=crop&q=80" \
  -o public/images/methods/oligotherapy.jpg

echo "✅ Toutes les images ont été téléchargées avec succès !"
echo "📂 Les images sont dans : public/images/methods/"
echo ""
echo "Vous pouvez maintenant visiter http://localhost:3000/approche"
echo "et tester la section 'Mes Méthodes' avec les images !"
