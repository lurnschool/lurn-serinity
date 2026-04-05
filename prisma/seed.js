const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  await prisma.noteEvolution.deleteMany()
  await prisma.facture.deleteMany()
  await prisma.seance.deleteMany()
  await prisma.client.deleteMany()
  await prisma.user.deleteMany()

  const hash = await bcrypt.hash('admin123', 10)
  const praticien = await prisma.user.create({
    data: {
      name: 'Julien Hafis',
      email: 'julien@serenity.app',
      password: hash,
      role: 'PRATICIEN',
      specialty: 'Reflexologie, Energetique',
      phone: '06 12 34 56 78',
      bio: 'Praticien en reflexologie plantaire et soins energetiques depuis 8 ans.',
      maxClientsPerDay: 6,
      bufferMinutes: 15,
    },
  })

  const clientsData = [
    {
      firstName: 'Sophie',
      lastName: 'Martin',
      email: 'sophie.martin@email.com',
      phone: '06 23 45 67 89',
      dateOfBirth: '1985-03-15',
      gender: 'Femme',
      address: '12 rue des Lilas, 75011 Paris',
      profession: 'Enseignante',
      referredBy: 'Bouche a oreille',
      motifConsultation: 'Migraines chroniques depuis 2019, fatigue persistante, troubles du sommeil.',
      antecedentsMedicaux: 'Migraines depuis adolescence. Operation appendicite 2010. Suivi ORL en 2022.',
      antecedentsFamiliaux: 'Mere : hypertension. Pere : diabete type 2.',
      traitementEnCours: 'Homeopathie (Nux Vomica 9CH). Magnesium bisglycinate.',
      allergies: 'Huiles essentielles de menthe. Intolerance lactose legere.',
      habitudesVie: 'Non fumeuse. Verre de vin occasionnel. The vert quotidien.',
      qualiteSommeil: 'Endormissement difficile (45min+). Reveils nocturnes vers 3h. Fatigue au reveil.',
      niveauStress: 'Eleve -- charge de travail importante, classe difficile cette annee.',
      alimentation: 'Vegetarienne depuis 5 ans. Tendance a sauter le petit-dejeuner.',
      activitePhysique: 'Yoga 2x/semaine. Marche quotidienne 30min.',
      objectifs: 'Reduire frequence et intensite des migraines. Ameliorer qualite du sommeil. Retrouver de l\'energie.',
      contreIndications: 'Pas de manipulation cervicale (hernie C5-C6 diagnostiquee).',
      consentement: true,
      notesPrivees: 'Personne tres receptive aux soins. A tendance a intellectualiser -- l\'aider a lacher prise.',
    },
    {
      firstName: 'Marc',
      lastName: 'Durand',
      email: 'marc.durand@email.com',
      phone: '06 34 56 78 90',
      dateOfBirth: '1978-07-22',
      gender: 'Homme',
      profession: 'Ingenieur informatique',
      referredBy: 'Sophie Martin',
      motifConsultation: 'Lombalgie recurrente depuis 3 ans. Ancien sportif de haut niveau (rugby).',
      antecedentsMedicaux: 'Entorse cheville droite x3. Pubalgie 2015. Lombalgie chronique.',
      traitementEnCours: 'Kinesitherapie 1x/mois. Anti-inflammatoires ponctuels.',
      allergies: '',
      qualiteSommeil: 'Correct en general. Douleurs nocturnes si journee chargee.',
      niveauStress: 'Modere -- bonne gestion globale.',
      activitePhysique: 'Natation 1x/semaine. A arrete la course a pied a cause du dos.',
      objectifs: 'Soulager les douleurs lombaires. Retrouver une meilleure mobilite pour reprendre le sport.',
      consentement: true,
      notesPrivees: 'Vient sur recommandation de Sophie. Assez sceptique au debut mais ouvert.',
    },
    {
      firstName: 'Camille',
      lastName: 'Leroy',
      email: 'camille.leroy@email.com',
      phone: '06 45 67 89 01',
      dateOfBirth: '1992-11-08',
      gender: 'Femme',
      address: '45 avenue Victor Hugo, 75016 Paris',
      profession: 'Graphiste freelance',
      referredBy: 'Instagram',
      motifConsultation: 'Anxiete generalisee. Crises d\'angoisse depuis rupture. Recherche approche naturelle.',
      antecedentsMedicaux: 'Anxiete diagnostiquee en 2021. Arret anxiolytiques il y a 8 mois (sevrage accompagne).',
      antecedentsFamiliaux: 'Grand-mere maternelle : depression. Mere : fibromyalgie.',
      traitementEnCours: 'Fleurs de Bach (Rescue). Meditation guidee quotidienne.',
      habitudesVie: 'Travaille beaucoup le soir. Ecrans jusqu\'a 23h. Peu de contacts sociaux.',
      qualiteSommeil: 'Insomnie d\'endormissement. Sommeil agite avec cauchemars frequents.',
      niveauStress: 'Tres eleve -- lie a l\'isolement et incertitude professionnelle.',
      alimentation: 'Irreguliere. Tendance au grignotage sucre en cas de stress.',
      activitePhysique: 'Aucune actuellement. Aimait la danse classique.',
      objectifs: 'Gerer les crises d\'angoisse sans medicaments. Se reconnecter a son corps. Retrouver confiance.',
      contreIndications: '',
      consentement: true,
      notesPrivees: 'Premiere experience en soin energetique. Tres emotive en seance -- c\'est bon signe. Avance bien.',
    },
    {
      firstName: 'Thomas',
      lastName: 'Bernard',
      email: 'thomas.b@email.com',
      phone: '06 56 78 90 12',
      dateOfBirth: '1990-01-30',
      gender: 'Homme',
      profession: 'Chef de projet',
      motifConsultation: 'Developpement personnel. Blocages emotionnels lies a l\'enfance. Difficulte a s\'affirmer.',
      antecedentsMedicaux: 'RAS. Bonne sante generale.',
      qualiteSommeil: 'Bon.',
      niveauStress: 'Modere a eleve -- surtout en contexte professionnel (prise de parole, conflits).',
      objectifs: 'Travailler sur la confiance en soi. Liberer les emotions refoulees. Mieux poser ses limites.',
      consentement: true,
    },
    {
      firstName: 'Isabelle',
      lastName: 'Moreau',
      email: 'isabelle.moreau@email.com',
      phone: '06 67 89 01 23',
      dateOfBirth: '1970-05-12',
      gender: 'Femme',
      address: '8 rue de la Paix, 75002 Paris',
      profession: 'Directrice commerciale',
      referredBy: 'Medecin traitant',
      motifConsultation: 'Fibromyalgie diagnostiquee en 2020. Fatigue chronique. Douleurs diffuses.',
      antecedentsMedicaux: 'Fibromyalgie. Hypothyroidie (Levothyrox). Syndrome du canal carpien droit.',
      antecedentsFamiliaux: 'Mere : polyarthrite rhumatoide.',
      traitementEnCours: 'Levothyrox 75ug. Vitamine D 100 000 UI/trimestre. CBD le soir.',
      allergies: 'Aucune connue.',
      habitudesVie: 'Non fumeuse. Rythme professionnel intense (50h/semaine). Peu de pauses.',
      qualiteSommeil: 'Sommeil non reparateur malgre 8h. Reveils douloureux.',
      niveauStress: 'Chroniquement eleve. Difficulte a deleguer.',
      alimentation: 'Equilibree mais repas souvent rapides. Peu hydratee.',
      activitePhysique: 'Aquagym 1x/semaine quand energie suffisante.',
      objectifs: 'Soulagement des douleurs. Amelioration energie vitale. Apprendre a ralentir.',
      contreIndications: 'Pression forte sur les mains (canal carpien). Pas de manipulation cervicale.',
      consentement: true,
      notesPrivees: 'Patiente suivie depuis 6 mois. Progres notables sur gestion de la douleur. A commence a reduire son temps de travail.',
    },
    {
      firstName: 'Alexandre',
      lastName: 'Petit',
      email: 'alex.petit@email.com',
      phone: '06 78 90 12 34',
      dateOfBirth: '1988-09-25',
      gender: 'Homme',
      profession: 'Artisan menuisier',
      motifConsultation: 'Transition professionnelle. Burn-out il y a 1 an (ancien cadre marketing). Recherche de sens.',
      antecedentsMedicaux: 'Burn-out 2024. Suivi psychologue pendant 6 mois.',
      qualiteSommeil: 'Ameliore depuis reconversion. Encore des insomnies ponctuelles.',
      niveauStress: 'En baisse. Reste de l\'anxiete liee aux finances.',
      objectifs: 'Ancrage dans sa nouvelle vie. Travail sur les schemas familiaux (pere tres exigeant).',
      consentement: true,
      notesPrivees: 'Travail de constellation familiale en cours. Grande evolution depuis le debut.',
    },
    {
      firstName: 'Nathalie',
      lastName: 'Roux',
      email: 'nathalie.roux@email.com',
      phone: '06 89 01 23 45',
      dateOfBirth: '1975-12-03',
      gender: 'Femme',
      profession: 'Infirmiere liberale',
      motifConsultation: 'Menopause. Bouffees de chaleur. Irritabilite inhabituelle.',
      antecedentsMedicaux: 'Menopause depuis 2024. Aucun THS (choix personnel).',
      traitementEnCours: 'Sauge en tisane. Onagre en complement.',
      qualiteSommeil: 'Perturbe par les bouffees de chaleur nocturnes.',
      objectifs: 'Equilibrage hormonal naturel. Mieux-etre emotionnel.',
      consentement: true,
      status: 'INACTIF',
      notesPrivees: 'En pause depuis 2 mois -- surcharge professionnelle. A recontacter en mai.',
    },
    {
      firstName: 'Lucas',
      lastName: 'Fournier',
      email: 'lucas.fournier@email.com',
      phone: '06 90 12 34 56',
      dateOfBirth: '1995-06-18',
      gender: 'Homme',
      profession: 'Etudiant en architecture',
      referredBy: 'Camille Leroy',
      motifConsultation: 'Gestion des emotions. Hypersensibilite. Manque de confiance en soi.',
      antecedentsMedicaux: 'Aucun particulier. HPI diagnostique en 2023.',
      qualiteSommeil: 'Variable -- tres sensible au bruit et a la lumiere.',
      niveauStress: 'Eleve en periode d\'examens. Moyen sinon.',
      alimentation: 'Vegetalien. Complemente en B12.',
      objectifs: 'Apprendre a canaliser son hypersensibilite. Confiance en soi. Gestion du perfectionnisme.',
      consentement: true,
    },
  ]

  const clients = []
  for (const data of clientsData) {
    const client = await prisma.client.create({
      data: { ...data, praticienId: praticien.id },
    })
    clients.push(client)
  }

  // Notes d'evolution pour les clients suivis
  const notesData = [
    // Sophie Martin
    { clientId: 0, title: 'Bilan initial', content: 'Premiere consultation. Anamnese complete realisee. Zones reflexes pieds : tension importante au niveau du plexus solaire et de la zone cervicale. Points douloureux au niveau hepatique. Plan : 4 seances rapprochees puis espacement.', category: 'bilan', daysAgo: 90 },
    { clientId: 0, title: 'Seance 2 -- Reflexologie plantaire', content: 'Nette amelioration du sommeil depuis la derniere seance (endormissement en 20min vs 45). Travail approfondi sur la zone du foie et vesicule biliaire. Detente profonde en fin de seance. Legere crise de larmes -- liberation emotionnelle.', category: 'seance', daysAgo: 75 },
    { clientId: 0, title: 'Retour inter-seance', content: 'Sophie m\'a envoye un message -- seulement 1 migraine en 2 semaines au lieu de 3-4 habituellement. Continue le magnesium. A commence la coherence cardiaque sur mes conseils.', category: 'observation', daysAgo: 68 },
    { clientId: 0, title: 'Seance 5 -- Soin energetique', content: 'Equilibrage des chakras. Blocage important au niveau du 5eme chakra (gorge/expression). Sophie reconnait avoir du mal a exprimer ses besoins. Lien avec les migraines ? Recommandation : journal d\'ecriture le soir.', category: 'seance', daysAgo: 40 },
    { clientId: 0, title: 'Point d\'etape -- 3 mois', content: 'Migraines passees de 4/semaine a 1/semaine. Sommeil nettement ameliore. Niveau d\'energie en hausse. Sophie a repris une activite de peinture qu\'elle avait abandonnee. On passe a 1 seance toutes les 3 semaines.', category: 'bilan', daysAgo: 15 },

    // Camille Leroy
    { clientId: 2, title: 'Bilan initial', content: 'Camille arrive tres tendue. Respiration haute et rapide. Anamnese difficile -- beaucoup d\'emotion. Crise d\'angoisse recente (il y a 3 jours). Ne veut plus de medicaments. Travail en douceur, accueil. Premiere approche energetique legere.', category: 'bilan', daysAgo: 60 },
    { clientId: 2, title: 'Seance 2 -- Travail respiratoire + reflexo', content: 'Beaucoup plus calme aujourd\'hui. On a travaille la respiration abdominale pendant 15min puis reflexologie centree sur le systeme nerveux. Elle a reussi a se detendre completement. Pas de crise depuis la derniere seance.', category: 'seance', daysAgo: 46 },
    { clientId: 2, title: 'Evolution positive', content: 'Camille a repris la danse -- cours de danse contemporaine 1x/semaine. Tres fiere d\'elle. Les crises d\'angoisse sont moins intenses et elle arrive a utiliser la respiration pour les gerer.', category: 'observation', daysAgo: 25 },

    // Isabelle Moreau
    { clientId: 4, title: 'Bilan initial approfondi', content: 'Fibromyalgie depuis 4 ans. 18 points douloureux positifs. EVA douleur : 7/10 en moyenne. Fatigue : 8/10. Points reflexes plantaires : tout le systeme musculo-squelettique est en tension. Systeme endocrinien desequilibre. Approche tres douce necessaire -- hypersensibilite au toucher.', category: 'bilan', daysAgo: 180 },
    { clientId: 4, title: 'Ajustement du protocole', content: 'Apres 3 seances, Isabelle tolere mieux la pression. On peut maintenant travailler plus en profondeur. EVA douleur descendue a 5-6/10. Elle a commence a boire 1.5L d\'eau par jour (vs 0.5L avant). Gros impact sur la fatigue.', category: 'observation', daysAgo: 140 },
    { clientId: 4, title: 'Seance 8 -- Breakthrough', content: 'Isabelle a pleure pendant 20 minutes. Beaucoup de non-dits au travail, pression qu\'elle se met. On a discute de la possibilite de reduire son temps de travail. Elle y reflechit. EVA : 4/10. Premier jour sans douleur le mois dernier.', category: 'seance', daysAgo: 90 },
    { clientId: 4, title: 'Point d\'etape -- 6 mois', content: 'Resultats remarquables. EVA douleur : 3-4/10 en moyenne. Isabelle est passee a 4 jours/semaine au travail. Sommeil ameliore avec le CBD. Elle fait l\'aquagym regulierement maintenant. On continue le suivi bi-mensuel.', category: 'bilan', daysAgo: 10 },
  ]

  for (const note of notesData) {
    const d = new Date()
    d.setDate(d.getDate() - note.daysAgo)
    await prisma.noteEvolution.create({
      data: {
        title: note.title,
        content: note.content,
        category: note.category,
        date: d,
        clientId: clients[note.clientId].id,
      },
    })
  }

  // Seances
  const now = new Date()
  const seancesData = []

  for (let i = 1; i <= 20; i++) {
    const d = new Date(now)
    d.setDate(d.getDate() - Math.floor(Math.random() * 60))
    d.setHours(8 + Math.floor(Math.random() * 10), Math.random() > 0.5 ? 0 : 30, 0, 0)
    seancesData.push({
      date: d,
      duration: [45, 60, 75, 90][Math.floor(Math.random() * 4)],
      type: ['Reflexologie plantaire', 'Soin energetique', 'Bilan', 'Suivi', 'Constellation'][Math.floor(Math.random() * 5)],
      status: 'TERMINEE',
      price: [55, 65, 70, 80, 90][Math.floor(Math.random() * 5)],
      paid: Math.random() > 0.2,
      notesAfter: 'Seance bien deroulee.',
      clientId: clients[Math.floor(Math.random() * 6)].id,
      praticienId: praticien.id,
    })
  }

  for (let i = 0; i < 8; i++) {
    const d = new Date(now)
    d.setDate(d.getDate() + i + 1)
    d.setHours(9 + Math.floor(Math.random() * 8), Math.random() > 0.5 ? 0 : 30, 0, 0)
    seancesData.push({
      date: d,
      duration: [60, 75, 90][Math.floor(Math.random() * 3)],
      type: ['Reflexologie plantaire', 'Soin energetique', 'Suivi', 'Bilan'][Math.floor(Math.random() * 4)],
      status: Math.random() > 0.5 ? 'CONFIRMEE' : 'PLANIFIEE',
      price: [65, 70, 80][Math.floor(Math.random() * 3)],
      paid: false,
      clientId: clients[Math.floor(Math.random() * 6)].id,
      praticienId: praticien.id,
    })
  }

  for (const data of seancesData) {
    await prisma.seance.create({ data })
  }

  // Factures
  let factNum = 1
  for (let i = 0; i < 15; i++) {
    const d = new Date(now)
    d.setDate(d.getDate() - Math.floor(Math.random() * 90))
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const num = String(factNum++).padStart(3, '0')
    await prisma.facture.create({
      data: {
        number: `F-${d.getFullYear()}${month}-${num}`,
        date: d,
        amount: [55, 65, 70, 80, 90, 130, 160][Math.floor(Math.random() * 7)],
        status: i < 10 ? 'PAYEE' : i < 13 ? 'EN_ATTENTE' : 'ANNULEE',
        description: ['Reflexologie plantaire', 'Bilan initial', 'Soin energetique', 'Bilan complet', 'Suivi'][Math.floor(Math.random() * 5)],
        paymentMethod: ['Especes', 'CB', 'Virement', 'Cheque'][Math.floor(Math.random() * 4)],
        clientId: clients[Math.floor(Math.random() * 6)].id,
        praticienId: praticien.id,
      },
    })
  }

  console.log('Base de donnees alimentee avec succes.')
  console.log(`  - 1 praticien`)
  console.log(`  - ${clients.length} clients (avec anamnese complete)`)
  console.log(`  - ${notesData.length} notes d'evolution`)
  console.log(`  - ${seancesData.length} seances`)
  console.log(`  - 15 factures`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
