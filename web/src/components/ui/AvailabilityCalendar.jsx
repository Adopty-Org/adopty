// AvailabilityCalendar.jsx - Version avec affichage des récurrences
import { useState, useMemo, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useDisponibilites, useCreateDisponibilite, useUpdateDisponibilite } from '../../hooks/useDisponibilite';

const localizer = momentLocalizer(moment);

const AvailabilityCalendar = ({ profilId }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentView, setCurrentView] = useState('week');
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [showRecurrenceModal, setShowRecurrenceModal] = useState(false);
  const [pendingAvailability, setPendingAvailability] = useState(null);
  
  const { disponibilites, isLoading, refetch } = useDisponibilites(profilId);
  const createDisponibilite = useCreateDisponibilite();
  const updateDisponibilite = useUpdateDisponibilite();

  // ✅ Fonction utilitaire pour parser les dates correctement
const parseDate = (dateString) => {
  if (!dateString) return null;
  
  // Si c'est déjà un objet Date
  if (dateString instanceof Date) return dateString;
  
  // Essayer différents formats
  const date = new Date(dateString);
  
  // Vérifier si la date est valide
  if (isNaN(date.getTime())) {
    console.warn(`Date invalide: ${dateString}`);
    return null;
  }
  
  return date;
};

  // ✅ Fonction corrigée pour générer les dates de récurrence
    /*const generateRecurringDatesForDisplay = (disponibilite) => {
    // Parser les dates de début et fin
    const startDate = parseDate(disponibilite.DateDebut);
    const endDate = parseDate(disponibilite.DateFin);
    
    if (!startDate || !endDate) {
        console.error(`Dates invalides pour disponibilite ${disponibilite.Id}`);
        return [];
    }
    
    // Si pas de récurrence ou récurrence invalide
    if (!disponibilite.Recurrence || 
        disponibilite.Recurrence === 'Aucune' || 
        disponibilite.Recurrence === 'null') {
        return [{
        id: disponibilite.Id,
        start: startDate,
        end: endDate,
        disponible: disponibilite.Disponibilite,
        isRecurring: false,
        parentId: disponibilite.Id,
        title: disponibilite.Disponibilite === 1 ? '✓ Disponible' : '✗ Indisponible'
        }];
    }

    const dates = [];
    const duration = endDate.getTime() - startDate.getTime();
    let currentStart = new Date(startDate);
    
    // Définir la date de fin de récurrence
    let recurrenceEnd = null;
    if (disponibilite.RecurrenceFin) {
        recurrenceEnd = parseDate(disponibilite.RecurrenceFin);
    }
    
    // Si pas de date de fin, mettre +6 mois par défaut (pour éviter trop d'occurrences)
    if (!recurrenceEnd) {
        recurrenceEnd = new Date(startDate);
        recurrenceEnd.setMonth(startDate.getMonth() + 6);
        recurrenceEnd.setHours(23, 59, 59, 999);
    }
    
    const frequency = disponibilite.Frequence || 1;
    const maxDates = 50; // Limite raisonnable
    
    console.log(`Génération ${disponibilite.Recurrence} pour ID ${disponibilite.Id}`);
    console.log(`De ${currentStart.toLocaleString()} à ${recurrenceEnd.toLocaleString()}`);
    
    switch(disponibilite.Recurrence) {
        case 'quotidien':
        while (currentStart <= recurrenceEnd && dates.length < maxDates) {
            dates.push({
            id: `${disponibilite.Id}-${currentStart.getTime()}`,
            start: new Date(currentStart),
            end: new Date(currentStart.getTime() + duration),
            disponible: disponibilite.Disponibilite,
            isRecurring: true,
            parentId: disponibilite.Id,
            title: disponibilite.Disponibilite === 1 ? '✓ Disponible' : '✗ Indisponible'
            });
            currentStart.setDate(currentStart.getDate() + frequency);
        }
        break;
        
        case 'hebdomadaire':
        // Déterminer le jour de la semaine
        const dayOfWeek = startDate.getDay();
        const daysToAdd = 7 * frequency;
        
        while (currentStart <= recurrenceEnd && dates.length < maxDates) {
            // S'assurer que c'est le bon jour de la semaine
            if (currentStart.getDay() === dayOfWeek || dates.length === 0) {
            dates.push({
                id: `${disponibilite.Id}-${currentStart.getTime()}`,
                start: new Date(currentStart),
                end: new Date(currentStart.getTime() + duration),
                disponible: disponibilite.Disponibilite,
                isRecurring: true,
                parentId: disponibilite.Id,
                title: disponibilite.Disponibilite === 1 ? '✓ Disponible' : '✗ Indisponible'
            });
            console.log(`Push hebdomadaire: ${currentStart.toLocaleDateString()}`);
            }
            currentStart.setDate(currentStart.getDate() + daysToAdd);
        }
        break;
        
        case 'mensuelle':
        while (currentStart <= recurrenceEnd && dates.length < maxDates) {
            dates.push({
            id: `${disponibilite.Id}-${currentStart.getTime()}`,
            start: new Date(currentStart),
            end: new Date(currentStart.getTime() + duration),
            disponible: disponibilite.Disponibilite,
            isRecurring: true,
            parentId: disponibilite.Id,
            title: disponibilite.Disponibilite === 1 ? '✓ Disponible' : '✗ Indisponible'
            });
            currentStart.setMonth(currentStart.getMonth() + frequency);
        }
        break;
        
        case 'annuelle':
        while (currentStart <= recurrenceEnd && dates.length < maxDates) {
            dates.push({
            id: `${disponibilite.Id}-${currentStart.getTime()}`,
            start: new Date(currentStart),
            end: new Date(currentStart.getTime() + duration),
            disponible: disponibilite.Disponibilite,
            isRecurring: true,
            parentId: disponibilite.Id,
            title: disponibilite.Disponibilite === 1 ? '✓ Disponible' : '✗ Indisponible'
            });
            currentStart.setFullYear(currentStart.getFullYear() + frequency);
        }
        break;
        
        default:
        dates.push({
            id: disponibilite.Id,
            start: startDate,
            end: endDate,
            disponible: disponibilite.Disponibilite,
            isRecurring: false,
            parentId: disponibilite.Id,
            title: disponibilite.Disponibilite === 1 ? '✓ Disponible' : '✗ Indisponible'
        });
    }
    
    console.log(`Généré ${dates.length} événements pour ID ${disponibilite.Id}`);
    return dates;
    };* /

  // ✅ Fonction pour découper les disponibilités avec les indisponibilités (en incluant les récurrences)
  const processEventsWithCutting = (disponibilites) => {
    if (!disponibilites || disponibilites.length === 0) return [];
    
    // D'abord, générer toutes les occurrences récurrentes
    let allEvents = [];
    disponibilites.forEach(dispo => {
      const recurringEvents = generateRecurringDatesForDisplay(dispo);
      allEvents.push(...recurringEvents);
    });
    
    // Séparer les disponibilités et indisponibilités parmi les événements générés
    const disponibles = allEvents.filter(e => e.disponible === 1);
    const indisponibles = allEvents.filter(e => e.disponible === 0);
    
    if (indisponibles.length === 0) {
      return disponibles.map(dispo => ({
        ...dispo,
        title: '✓ Disponible',
      }));
    }
    
    // Pour chaque disponibilité, la découper par les indisponibilités
    const cutEvents = [];
    
    disponibles.forEach(dispo => {
      const dispoStart = dispo.start.getTime();
      const dispoEnd = dispo.end.getTime();
      
      // Trouver toutes les indisponibilités qui intersectent cette disponibilité
      const overlappingIndispos = indisponibles.filter(indispo => {
        const indispoStart = indispo.start.getTime();
        const indispoEnd = indispo.end.getTime();
        return (indispoStart < dispoEnd && indispoEnd > dispoStart);
      });
      
      if (overlappingIndispos.length === 0) {
        cutEvents.push({
          ...dispo,
          title: '✓ Disponible',
        });
      } else {
        overlappingIndispos.sort((a, b) => a.start.getTime() - b.start.getTime());
        
        let currentStart = dispoStart;
        
        overlappingIndispos.forEach(indispo => {
          const indispoStart = indispo.start.getTime();
          const indispoEnd = indispo.end.getTime();
          
          if (currentStart < indispoStart) {
            cutEvents.push({
              ...dispo,
              id: `${dispo.id}-${currentStart}`,
              start: new Date(currentStart),
              end: new Date(Math.min(indispoStart, dispoEnd)),
              title: '✓ Disponible',
            });
          }
          
          cutEvents.push({
            ...indispo,
            title: '✗ Indisponible',
          });
          
          currentStart = Math.max(currentStart, indispoEnd);
        });
        
        if (currentStart < dispoEnd) {
          cutEvents.push({
            ...dispo,
            id: `${dispo.id}-end`,
            start: new Date(currentStart),
            end: new Date(dispoEnd),
            title: '✓ Disponible',
          });
        }
      }
    });
    
    // Ajouter les indisponibilités qui n'intersectent aucune disponibilité
    const usedIndispoIds = new Set(cutEvents.filter(e => e.disponible === 0).map(e => e.id));
    indisponibles.forEach(indispo => {
      if (!usedIndispoIds.has(indispo.id)) {
        cutEvents.push({
          ...indispo,
          title: '✗ Indisponible',
        });
      }
    });
    
    return cutEvents;
  };*/

  // ✅ Fonction corrigée pour découper les disponibilités avec les indisponibilités
const processEventsWithCutting = (disponibilites) => {
  if (!disponibilites || disponibilites.length === 0) return [];
  
  console.log("=== PROCESS EVENTS WITH CUTTING ===");
  
  // D'abord, générer toutes les occurrences récurrentes
  
  let allEvents = [];
  disponibilites.forEach(dispo => {
    const recurringEvents = generateRecurringDatesForDisplay(dispo);
    console.log(`Dispo ${dispo.Id}: ${recurringEvents.length} événements générés`);
    allEvents.push(...recurringEvents);
  });

  // Dans processEventsWithCutting, ajoute ce log avant le filtrage
console.log(`📊 TOTAL brut avant dédoublonnage: ${allEvents.length}`);

  // ✅ CHANGEMENT: Éviter les doublons par parentId + start time
  const uniqueEvents = new Map();
  allEvents.forEach(event => {
    const key = `${event.parentId}-${event.start.getTime()}`;
    if (!uniqueEvents.has(key)) {
      uniqueEvents.set(key, event);
    }
  });
  //allEvents = Array.from(uniqueEvents.values());
  
  // Filtrer les événements invalides dès le début
  allEvents = allEvents.filter(event => {
    if (!event.start || !event.end) return false;
    if (isNaN(event.start.getTime()) || isNaN(event.end.getTime())) {
      console.warn("Événement avec dates invalides ignoré:", event);
      return false;
    }
    return true;
  });
  
  console.log(`Total événements valides: ${allEvents.length}`);
  
  if (allEvents.length === 0) return [];
  
  // Séparer les disponibilités et indisponibilités
  const disponibles = allEvents.filter(e => e.disponible === 1);
  const indisponibles = allEvents.filter(e => e.disponible === 0);
  
  console.log(`Disponibles: ${disponibles.length}, Indisponibles: ${indisponibles.length}`);
  
  // Si pas d'indisponibles, retourner directement les disponibles
  if (indisponibles.length === 0) {
    return disponibles.map(dispo => ({
      ...dispo,
      title: '✓ Disponible',
    }));
  }
  
  // Pour chaque disponibilité, la découper par les indisponibilités
  const cutEvents = [];
  
  disponibles.forEach(dispo => {
    const dispoStart = dispo.start.getTime();
    const dispoEnd = dispo.end.getTime();
    
    // Trouver toutes les indisponibilités qui intersectent cette disponibilité
    const overlappingIndispos = indisponibles.filter(indispo => {
      const indispoStart = indispo.start.getTime();
      const indispoEnd = indispo.end.getTime();
      // Vérifier l'intersection
      return (indispoStart < dispoEnd && indispoEnd > dispoStart);
    });
    
    if (overlappingIndispos.length === 0) {
      // Pas d'intersection, garder la dispo intacte
      cutEvents.push({
        ...dispo,
        title: '✓ Disponible',
      });
    } else {
      // Trier les indisponibilités par date de début
      overlappingIndispos.sort((a, b) => a.start.getTime() - b.start.getTime());
      
      let currentStart = dispoStart;
      
      overlappingIndispos.forEach((indispo, index) => {
        const indispoStart = indispo.start.getTime();
        const indispoEnd = indispo.end.getTime();
        
        // Segment avant l'indisponibilité (s'il existe)
        if (currentStart < indispoStart) {
          const segmentEnd = Math.min(indispoStart, dispoEnd);
          if (segmentEnd > currentStart) {
            cutEvents.push({
              ...dispo,
              id: `${dispo.id}-before-${index}`,
              start: new Date(currentStart),
              end: new Date(segmentEnd),
              title: '✓ Disponible',
            });
          }
        }
        
        // Ajouter l'indisponibilité (dans sa partie qui intersecte la dispo)
        const overlapStart = Math.max(currentStart, indispoStart);
        const overlapEnd = Math.min(indispoEnd, dispoEnd);
        
        if (overlapEnd > overlapStart) {
          cutEvents.push({
            ...indispo,
            id: `${indispo.id}-cut`,
            start: new Date(overlapStart),
            end: new Date(overlapEnd),
            title: '✗ Indisponible',
          });
        }
        
        currentStart = Math.max(currentStart, indispoEnd);
      });
      
      // Dernier segment après la dernière indisponibilité
      if (currentStart < dispoEnd) {
        cutEvents.push({
          ...dispo,
          id: `${dispo.id}-after`,
          start: new Date(currentStart),
          end: new Date(dispoEnd),
          title: '✓ Disponible',
        });
      }
    }
  });
  
  // Ajouter les indisponibilités qui n'intersectent aucune disponibilité
  const usedIndispoIds = new Set();
  cutEvents.forEach(event => {
    if (event.disponible === 0 && event.parentId) {
      usedIndispoIds.add(event.parentId);
    }
  });
  
  indisponibles.forEach(indispo => {
    if (!usedIndispoIds.has(indispo.parentId || indispo.id)) {
      cutEvents.push({
        ...indispo,
        title: '✗ Indisponible',
      });
    }
  });
  
  // Filtrer une dernière fois les dates invalides
  const finalEvents = cutEvents.filter(event => {
    if (!event.start || !event.end) return false;
    if (isNaN(event.start.getTime()) || isNaN(event.end.getTime())) return false;
    return true;
  });
  
  console.log(`Final events: ${finalEvents.length}`);
  
  // Trier par date
  finalEvents.sort((a, b) => a.start.getTime() - b.start.getTime());
  
  return finalEvents;
};

// ✅ Fonction generateRecurringDatesForDisplay CORRIGÉE (sans récurrence infinie)
const generateRecurringDatesForDisplay = (disponibilite) => {
  // Parser les dates de début et fin
  const startDate = parseDate(disponibilite.DateDebut);
  const endDate = parseDate(disponibilite.DateFin);
  
  if (!startDate || !endDate) {
    console.error(`Dates invalides pour disponibilite ${disponibilite.Id}`);
    return [];
  }
  
  // Si pas de récurrence
  if (!disponibilite.Recurrence || disponibilite.Recurrence === 'Aucune') {
    return [{
      id: disponibilite.Id,
      start: startDate,
      end: endDate,
      disponible: disponibilite.Disponibilite,
      isRecurring: false,
      parentId: disponibilite.Id,
      title: disponibilite.Disponibilite === 1 ? '✓ Disponible' : '✗ Indisponible'
    }];
  }

  const dates = [];
  const duration = endDate.getTime() - startDate.getTime();
  let currentStart = new Date(startDate);
  //currentStart.setHours(12, 0, 0, 0);
  
  // Date de fin de récurrence
  let recurrenceEnd = null;
  if (disponibilite.RecurrenceFin) {
    recurrenceEnd = parseDate(disponibilite.RecurrenceFin);
  }
  
  if (!recurrenceEnd) {
    recurrenceEnd = new Date(startDate);
    recurrenceEnd.setFullYear(startDate.getFullYear() + 2); // +2 ANS
  }
  
  // Si pas de date de fin, limiter à 3 mois pour éviter trop d'occurrences
  /*if (!recurrenceEnd) {
    recurrenceEnd = new Date(startDate);
    recurrenceEnd.setMonth(startDate.getMonth() + 3); // 3 mois max
  }*/
  
  //const frequency = disponibilite.Frequence || 1;
  let frequency = parseInt(disponibilite.Frequence);
  if (isNaN(frequency) || frequency < 1) {
    frequency = 1; // Valeur par défaut
    console.warn(`⚠️ Frequence invalide pour ID ${disponibilite.Id}: "${disponibilite.Frequence}", utilisation de 1`);
  }
  const maxDates = 365; // Limite stricte pour éviter les boucles infinies
  
  console.log(`Génération ${disponibilite.Recurrence} pour ID ${disponibilite.Id}, max ${maxDates} dates`);
  console.log(`📅 Génération ${disponibilite.Recurrence} pour ID ${disponibilite.Id}`);
  console.log(`   Date début: ${startDate.toLocaleDateString()}`);
  console.log(`   Date fin récurrence: ${recurrenceEnd.toLocaleDateString()}`);
  console.log(`   Fréquence: ${frequency}`);
  
  let loopCount = 0;
  const maxLoop = 500; // Sécurité anti-boucle infinie
  let iteration = 0;
  
  switch(disponibilite.Recurrence) {
    case 'quotidien':
      while (currentStart <= recurrenceEnd && dates.length < maxDates && loopCount < maxLoop) {
        dates.push({
          id: `${disponibilite.Id}-${dates.length}`,
          start: new Date(currentStart),
          end: new Date(currentStart.getTime() + duration),
          disponible: disponibilite.Disponibilite,
          isRecurring: true,
          parentId: disponibilite.Id,
          title: disponibilite.Disponibilite === 1 ? '✓ Disponible' : '✗ Indisponible'
        });
        currentStart.setDate(currentStart.getDate() + frequency);
        loopCount++;
      }
      break;
      
    case 'hebdomadaire':
      while (currentStart <= recurrenceEnd && dates.length < maxDates && loopCount < maxLoop) {
        console.log(`   Iteration ${iteration}: currentStart = ${currentStart.toLocaleDateString()}`);
        dates.push({
          id: `${disponibilite.Id}-${dates.length}`,
          start: new Date(currentStart),
          end: new Date(currentStart.getTime() + duration),
          disponible: disponibilite.Disponibilite,
          isRecurring: true,
          parentId: disponibilite.Id,
          title: disponibilite.Disponibilite === 1 ? '✓ Disponible' : '✗ Indisponible'
        });

         // Avancer de 7 jours
        const oldDate = new Date(currentStart);
        currentStart.setDate(currentStart.getDate() + (7 * frequency));
        console.log(`   Nouvelle date après +${7*frequency} jours: ${currentStart.toLocaleDateString()}`);
        
        iteration++;
        //currentStart.setDate(currentStart.getDate() + (7 * frequency));
        //loopCount++;
      }
      break;
      
    case 'mensuelle':
      while (currentStart <= recurrenceEnd && dates.length < maxDates && loopCount < maxLoop) {
        dates.push({
          id: `${disponibilite.Id}-${dates.length}`,
          start: new Date(currentStart),
          end: new Date(currentStart.getTime() + duration),
          disponible: disponibilite.Disponibilite,
          isRecurring: true,
          parentId: disponibilite.Id,
          title: disponibilite.Disponibilite === 1 ? '✓ Disponible' : '✗ Indisponible'
        });
        currentStart.setMonth(currentStart.getMonth() + frequency);
        loopCount++;
      }
      break;
      
    case 'annuelle':
      while (currentStart <= recurrenceEnd && dates.length < maxDates && loopCount < maxLoop) {
        dates.push({
          id: `${disponibilite.Id}-${dates.length}`,
          start: new Date(currentStart),
          end: new Date(currentStart.getTime() + duration),
          disponible: disponibilite.Disponibilite,
          isRecurring: true,
          parentId: disponibilite.Id,
          title: disponibilite.Disponibilite === 1 ? '✓ Disponible' : '✗ Indisponible'
        });
        currentStart.setFullYear(currentStart.getFullYear() + frequency);
        loopCount++;
      }
      break;
      
    default:
      dates.push({
        id: disponibilite.Id,
        start: startDate,
        end: endDate,
        disponible: disponibilite.Disponibilite,
        isRecurring: false,
        parentId: disponibilite.Id,
        title: disponibilite.Disponibilite === 1 ? '✓ Disponible' : '✗ Indisponible'
      });
  }
  
  console.log(`Généré ${dates.length} événements pour ID ${disponibilite.Id}`);
  return dates;
};

  const events = useMemo(() => processEventsWithCutting(disponibilites), [disponibilites]);

  // ✅ Sauvegarder avec récurrence (en base)
  const handleSetAvailabilityWithRecurrence = async (isAvailable, recurrenceData) => {
    if (!selectedSlot) return;
    
    const { recurrence, frequency, untilDate } = recurrenceData;
    
    const data = {
      IdProfil: profilId,
      DateDebut: selectedSlot.start.toISOString(),
      DateFin: selectedSlot.end.toISOString(),
      Disponibilite: isAvailable,
      Recurrence: recurrence === 'aucune' ? 'Aucune' : recurrence,
      Frequence: frequency || 1,
      RecurrenceFin: untilDate || null
    };
    
    try {
      if (selectedSlot.existingId && selectedSlot.currentStatus !== undefined) {
        await updateDisponibilite.mutateAsync({ id: selectedSlot.existingId, data });
      } else {
        await createDisponibilite.mutateAsync(data);
      }
      
      await refetch();
      setShowRecurrenceModal(false);
      setShowModal(false);
      setSelectedSlot(null);
    } catch (error) {
      console.error('Erreur:', error);
      alert("Erreur lors de l'enregistrement");
    }
  };
  
  // ✅ Sauvegarde simple (sans récurrence)
  const saveSingleAvailability = async (isAvailable, start, end) => {
    const data = {
      IdProfil: profilId,
      DateDebut: start.toISOString(),
      DateFin: end.toISOString(),
      Disponibilite: isAvailable,
      Recurrence: 'Aucune',
      Frequence: 1,
      RecurrenceFin: null
    };
    
    try {
      await createDisponibilite.mutateAsync(data);
    } catch (error) {
      console.error('Erreur:', error);
      throw error;
    }
  };

  // ✅ Gestionnaire pour sauvegarder avec gestion des conflits
  const handleSetAvailability = async (isAvailable) => {
    if (!selectedSlot) return;
    await handleSetAvailabilityWithRecurrence(isAvailable, { recurrence: 'aucune', frequency: 1, untilDate: null });
  };

  const eventStyleGetter = (event) => {
    const baseStyle = {
      borderRadius: '4px',
      fontWeight: 'bold',
      fontSize: '12px',
      padding: '2px 4px'
    };
    
    if (event.disponible === 1) {
      return {
        style: {
          ...baseStyle,
          backgroundColor: '#ffffff',
          borderColor: '#d1d5db',
          color: '#000000',
          borderWidth: '2px',
          borderStyle: 'solid',
        }
      };
    }
    
    if (event.disponible === 0) {
      return {
        style: {
          ...baseStyle,
          backgroundColor: '#f87171',
          borderColor: '#dc2626',
          color: '#ffffff',
          borderWidth: '2px',
          borderStyle: 'solid',
        }
      };
    }
    
    return {
      style: {
        ...baseStyle,
        backgroundColor: '#e5e7eb',
        borderColor: '#9ca3af',
        color: '#6b7280',
        borderWidth: '1px',
        borderStyle: 'solid',
      }
    };
  };

  const slotStyleGetter = () => {
    return {
      style: {
        backgroundColor: '#e5e7eb',
        borderColor: '#d1d5db'
      }
    };
  };

  const handleSelectSlot = ({ start, end }) => {
    const slotStart = start.getTime();
    const slotEnd = end.getTime();
    
    const intersectingEvents = events.filter(event => {
      const eventStart = event.start.getTime();
      const eventEnd = event.end.getTime();
      return (eventStart < slotEnd && eventEnd > slotStart);
    });
    
    let isFullyAvailable = true;
    let isFullyUnavailable = true;
    let isPartiallyMixed = false;
    let hasUndefinedParts = false;
    let warningMsg = null;
    
    if (intersectingEvents.length === 0) {
      isFullyAvailable = false;
      isFullyUnavailable = false;
      hasUndefinedParts = true;
      warningMsg = "⚠️ Ce créneau est entièrement non déclaré (gris).\n\nLe définir comme disponible ou indisponible écrasera cette zone.";
    } else {
      let coveredTime = [];
      intersectingEvents.forEach(event => {
        coveredTime.push({
          start: Math.max(slotStart, event.start.getTime()),
          end: Math.min(slotEnd, event.end.getTime()),
          disponible: event.disponible
        });
      });
      
      coveredTime.sort((a, b) => a.start - b.start);
      
      let currentTime = slotStart;
      for (let segment of coveredTime) {
        if (segment.start > currentTime) {
          hasUndefinedParts = true;
          isFullyAvailable = false;
          isFullyUnavailable = false;
          break;
        }
        currentTime = Math.max(currentTime, segment.end);
      }
      
      if (currentTime < slotEnd) {
        hasUndefinedParts = true;
        isFullyAvailable = false;
        isFullyUnavailable = false;
      }
      
      if (!hasUndefinedParts) {
        const allAvailable = coveredTime.every(segment => segment.disponible === 1);
        const allUnavailable = coveredTime.every(segment => segment.disponible === 0);
        
        isFullyAvailable = allAvailable;
        isFullyUnavailable = allUnavailable;
        isPartiallyMixed = !allAvailable && !allUnavailable;
      }
    }
    
    let currentStatus = undefined;
    let existingId = null;
    
    if (isFullyAvailable) {
      currentStatus = 1;
      existingId = intersectingEvents[0]?.parentId || intersectingEvents[0]?.id;
      warningMsg = "✅ Ce créneau est entièrement disponible.\n\nSouhaitez-vous le modifier ?";
    } 
    else if (isFullyUnavailable) {
      currentStatus = 0;
      existingId = intersectingEvents[0]?.parentId || intersectingEvents[0]?.id;
      warningMsg = "❌ Ce créneau est entièrement indisponible.\n\nSouhaitez-vous le modifier ?";
    }
    else if (isPartiallyMixed) {
      currentStatus = 'mixed';
      warningMsg = "⚠️ ATTENTION : Ce créneau contient à la fois du disponible et de l'indisponible.\n\nVoulez-vous continuer quand même ?";
    }
    else if (hasUndefinedParts) {
      currentStatus = 'partial';
      warningMsg = "⚠️ ATTENTION : Ce créneau contient des parties non déclarées (gris).\n\nVoulez-vous continuer ?";
    }
    
    setSelectedSlot({
      start,
      end,
      currentStatus,
      existingId,
      isFullyAvailable,
      isFullyUnavailable,
      isPartiallyMixed,
      hasUndefinedParts
    });
    
    setWarningMessage(warningMsg);
    setShowWarningModal(true);
  };

  const handleContinueToEdit = () => {
    setShowWarningModal(false);
    setShowModal(true);
  };

  const handleCancelWarning = () => {
    setShowWarningModal(false);
    setWarningMessage('');
  };

  const handleAvailabilityClick = (isAvailable) => {
    setPendingAvailability(isAvailable);
    setShowRecurrenceModal(true);
  };

  // Ajoute ce useEffect pour voir ce qui est réellement passé au calendrier
useEffect(() => {
  console.log("=== DÉBOGAGE DES ÉVÉNEMENTS ===");
  console.log("Nombre d'événements:", events.length);
  console.log("Premier événement:", events[0]);
  console.log("Dernier événement:", events[events.length - 1]);
  
  // Afficher les événements par type
  const disponibles = events.filter(e => e.disponible === 1);
  const indisponibles = events.filter(e => e.disponible === 0);
  console.log(`Disponibles: ${disponibles.length}, Indisponibles: ${indisponibles.length}`);
  
  // Afficher les récurrences
  const recurring = events.filter(e => e.isRecurring === true);
  console.log("Événements récurrents:", recurring.length);
  recurring.forEach(ev => {
    console.log(`  - ${ev.title} le ${ev.start.toLocaleDateString()} à ${ev.start.toLocaleTimeString()}`);
  });
}, [events]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96 bg-gray-100 rounded-xl">
        <div className="text-gray-500">Chargement de l'agenda...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-gray-100 rounded-xl border-2 border-black p-4 h-[700px] overflow-y-auto">
        {/* Légende avec récurrence */}
        <div className="flex gap-6 mb-4 pb-3 border-b-2 border-gray-300 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-200 border border-gray-400 rounded"></div>
            <span className="text-sm font-bold">⚪ Non déclaré (gris)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white border-2 border-gray-500 rounded"></div>
            <span className="text-sm font-bold">✅ Disponible (blanc)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-400 border border-red-600 rounded"></div>
            <span className="text-sm font-bold">❌ Indisponible (rouge)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-100 border-2 border-blue-400 rounded relative">
              <span className="absolute top-0 right-0 text-[8px]">🔄</span>
            </div>
            <span className="text-sm font-bold">🔄 Événement récurrent</span>
          </div>
          <div className="flex-1 text-right text-xs text-gray-500">
            Cliquez sur un créneau pour modifier
          </div>
        </div>

        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          defaultView="week"
          views={['month', 'agenda', 'week', 'day']}
          view={currentView}
          onView={setCurrentView}
          step={30}
          timeslots={1}
          date={currentDate}
          onNavigate={setCurrentDate}
          selectable
          onSelectSlot={handleSelectSlot}
          eventPropGetter={eventStyleGetter}
          slotPropGetter={slotStyleGetter}
          min={new Date(1970, 1, 1, 8, 0, 0)}
          max={new Date(1970, 1, 1, 20, 0, 0)}
          formats={{
            timeGutterFormat: 'HH:mm',
            eventTimeRangeFormat: ({ start, end }) => {
              return `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`;
            }
          }}
          messages={{
            next: '▶',
            previous: '◀',
            today: "Aujourd'hui",
            week: 'Semaine',
            day: 'Jour',
            noEventsInRange: 'Aucune disponibilité déclarée'
          }}
        />
      </div>

      {/* Modals... (garde les mêmes que précédemment) */}
      {showModal && selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl border-2 border-black p-6 min-w-[350px] shadow-xl">
            <h3 className="text-lg font-bold mb-2">
              {selectedSlot.start.toLocaleDateString('fr-FR')}
            </h3>
            <p className="text-gray-600 mb-4">
              {selectedSlot.start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - 
              {selectedSlot.end.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => handleAvailabilityClick(1)}
                className="flex-1 py-3 bg-white border-2 border-green-500 rounded-lg font-bold hover:bg-green-50 transition-all"
              >
                ✅ Disponible
              </button>
              <button
                onClick={() => handleAvailabilityClick(0)}
                className="flex-1 py-3 bg-red-400 border-2 border-red-600 rounded-lg font-bold text-white hover:bg-red-500 transition-all"
              >
                ❌ Indisponible
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-3 bg-gray-200 border border-gray-400 rounded-lg font-bold hover:bg-gray-300 transition-all"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {showWarningModal && warningMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-xl border-2 border-gray-300 p-6 min-w-[400px] max-w-md shadow-2xl">
            <div className="flex items-start gap-3 mb-4">
              <div className="text-3xl">⚠️</div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-yellow-700 mb-2">Attention</h3>
                <p className="text-gray-700 whitespace-pre-line">
                  {warningMessage}
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleContinueToEdit}
                className="flex-1 py-2 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition-all"
              >
                Continuer
              </button>
              <button
                onClick={handleCancelWarning}
                className="flex-1 py-2 bg-gray-200 border border-gray-400 rounded-lg font-bold hover:bg-gray-300 transition-all"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {showRecurrenceModal && selectedSlot && (
        <RecurrenceModal
          slot={selectedSlot}
          pendingAvailability={pendingAvailability}
          onConfirm={handleSetAvailabilityWithRecurrence}
          onCancel={() => {
            setShowRecurrenceModal(false);
            setPendingAvailability(null);
          }}
        />
      )}
    </div>
  );
};

// Composant Modal de récurrence
const RecurrenceModal = ({ slot, pendingAvailability, onConfirm, onCancel }) => {
  const [recurrence, setRecurrence] = useState('aucune');
  const [frequency, setFrequency] = useState(1);
  const [untilDate, setUntilDate] = useState('');
  const [customEnd, setCustomEnd] = useState(false);

  const getRecurrenceText = () => {
    switch(recurrence) {
      case 'quotidien': return 'jour(s)';
      case 'hebdomadaire': return 'semaine(s)';
      case 'mensuelle': return 'mois';
      case 'annuelle': return 'an(s)';
      default: return '';
    }
  };

  const getRecurrencePreview = () => {
    const start = new Date(slot.start);
    const previewDates = [];
    
    for (let i = 1; i <= 3; i++) {
      let nextDate = new Date(start);
      switch(recurrence) {
        case 'quotidien':
          nextDate.setDate(start.getDate() + (frequency * i));
          break;
        case 'hebdomadaire':
          nextDate.setDate(start.getDate() + (7 * frequency * i));
          break;
        case 'mensuelle':
          nextDate.setMonth(start.getMonth() + (frequency * i));
          break;
        case 'annuelle':
          nextDate.setFullYear(start.getFullYear() + (frequency * i));
          break;
      }
      previewDates.push(nextDate.toLocaleDateString('fr-FR'));
    }
    
    return previewDates.join(', ');
  };

  const handleConfirm = () => {
    onConfirm(pendingAvailability, {
      recurrence,
      frequency,
      untilDate: customEnd ? untilDate : null
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70]">
      <div className="bg-white rounded-xl border-2 border-black p-6 min-w-[400px] max-w-md shadow-2xl">
        <h3 className="text-xl font-bold mb-2">
          {pendingAvailability === 1 ? '✅ Définir comme disponible' : '❌ Définir comme indisponible'}
        </h3>
        
        <p className="text-gray-600 mb-4 text-sm">
          {slot.start.toLocaleDateString('fr-FR')} de {slot.start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} 
          à {slot.end.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-2">Récurrence :</label>
            <select 
              value={recurrence} 
              onChange={(e) => setRecurrence(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="aucune">🔹 Une seule fois (aucune récurrence)</option>
              <option value="quotidien">📅 Quotidienne</option>
              <option value="hebdomadaire">📆 Hebdomadaire</option>
              <option value="mensuelle">🗓️ Mensuelle</option>
              <option value="annuelle">📅 Annuelle</option>
            </select>
          </div>
          
          {recurrence !== 'aucune' && (
            <div>
              <label className="block text-sm font-bold mb-2">
                Fréquence : tous les {frequency} {getRecurrenceText()}
              </label>
              <input 
                type="range" 
                min="1" 
                max="12" 
                value={frequency} 
                onChange={(e) => setFrequency(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="text-center text-sm text-gray-600 mt-1">
                {frequency} {getRecurrenceText()}
              </div>
            </div>
          )}
          
          {recurrence !== 'aucune' && (
            <div>
              <label className="flex items-center gap-2 mb-2">
                <input 
                  type="checkbox" 
                  checked={customEnd} 
                  onChange={(e) => setCustomEnd(e.target.checked)}
                />
                <span className="text-sm font-bold">Date de fin</span>
              </label>
              
              {customEnd && (
                <input 
                  type="date" 
                  value={untilDate} 
                  onChange={(e) => setUntilDate(e.target.value)}
                  min={new Date(slot.start).toISOString().split('T')[0]}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              )}
            </div>
          )}
          
          {/* Aperçu des récurrences */}
          {recurrence !== 'aucune' && (
            <div className="bg-blue-50 p-3 rounded-lg text-xs border border-blue-200">
              <p className="font-bold mb-1 text-blue-700">📋 Aperçu des prochaines occurrences :</p>
              <p className="text-gray-600">
                <span className="font-semibold">Première :</span> {slot.start.toLocaleDateString('fr-FR')}<br/>
                <span className="font-semibold">Suivantes :</span> {getRecurrencePreview()}
              </p>
              {customEnd && untilDate && (
                <p className="text-green-600 mt-1">
                  ✓ Jusqu'au {new Date(untilDate).toLocaleDateString('fr-FR')}
                </p>
              )}
              {!customEnd && (
                <p className="text-orange-600 mt-1">
                  ⚠️ Sans date de fin, la récurrence continuera indéfiniment
                </p>
              )}
            </div>
          )}
        </div>
        
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleConfirm}
            className="flex-1 py-2 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition-all"
          >
            Confirmer
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-2 bg-gray-200 border border-gray-400 rounded-lg font-bold hover:bg-gray-300 transition-all"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityCalendar;