import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface SOP {
  id: string
  title: string
  description: string
  instructions: string
  author: string
  category: string
  priority: "low" | "medium" | "high" | "critical"
  tags: string[]
  createdAt: string
  updatedAt: string
  editedAt?: string
  steps?: { text: string; image?: string }[]
}

const priorityLabels = {
  low: "Faible",
  medium: "Moyenne",
  high: "Élevée",
  critical: "Critique",
}

const priorityColors = {
  low: [34, 197, 94] as [number, number, number], // green-500
  medium: [234, 179, 8] as [number, number, number], // yellow-500
  high: [249, 115, 22] as [number, number, number], // orange-500
  critical: [239, 68, 68] as [number, number, number], // red-500
}

const formatInstructions = (instructions: string): string[] => {
  const lines = instructions.split('\n')
  const formatted: string[] = []
  
  for (const line of lines) {
    const trimmedLine = line.trim()
    if (!trimmedLine) continue
    
    // Detect numbered steps (starts with number followed by dot)
    if (/^\d+\./.test(trimmedLine)) {
      formatted.push(`\n${trimmedLine}`)
    }
    // Detect bullet points (starts with -)
    else if (trimmedLine.startsWith('- ')) {
      formatted.push(`  ${trimmedLine}`)
    }
    // Regular text
    else {
      formatted.push(trimmedLine)
    }
  }
  
  return formatted
}

export const downloadSOPAsPDF = async (sop: SOP): Promise<void> => {
  try {
    // Create new PDF document
    const doc = new jsPDF()
    
    // Colors
    const primaryBlue = [37, 99, 235] as [number, number, number]
    const lightGray = [243, 244, 246] as [number, number, number]
    const mediumGray = [156, 163, 175] as [number, number, number]
    const darkGray = [55, 65, 81] as [number, number, number]
    
    let currentY = 20
    
    // Header section
    doc.setFontSize(24)
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2])
    doc.setFont('helvetica', 'bold')
    doc.text('Procédure Opérationnelle Standard', 105, currentY, { align: 'center' })
    
    currentY += 15
    doc.setFontSize(18)
    doc.text(sop.title, 105, currentY, { align: 'center' })
    
    currentY += 20
    
    // Metadata table
    const priorityColor = priorityColors[sop.priority.toLowerCase() as keyof typeof priorityColors]
    autoTable(doc, {
      startY: currentY,
      head: [['ID', 'Auteur', 'Catégorie', 'Priorité']],
      body: [[
        sop.id,
        sop.author,
        sop.category,
        priorityLabels[sop.priority.toLowerCase() as keyof typeof priorityLabels]
      ]],
      styles: {
        fontSize: 10,
        cellPadding: 5,
      },
      headStyles: {
        fillColor: primaryBlue,
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      bodyStyles: {
        textColor: darkGray
      },
      columnStyles: {
        3: { fillColor: priorityColor, textColor: [255, 255, 255], fontStyle: 'bold' }
      },
      margin: { left: 15, right: 15 }
    })
    
    currentY = (doc as any).lastAutoTable.finalY + 15
    
    // Description section
    doc.setFontSize(14)
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2])
    doc.setFont('helvetica', 'bold')
    doc.text('Description', 15, currentY)
    
    currentY += 8
    doc.setFontSize(11)
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])
    doc.setFont('helvetica', 'normal')
    
    const descriptionLines = doc.splitTextToSize(sop.description, 180)
    doc.text(descriptionLines, 15, currentY)
    currentY += descriptionLines.length * 5 + 10
    
    // Instructions section
    doc.setFontSize(14)
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2])
    doc.setFont('helvetica', 'bold')
    doc.text('Instructions', 15, currentY)
    
    currentY += 8
    doc.setFontSize(10)
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])
    doc.setFont('helvetica', 'normal')
    
    const instructionLines = formatInstructions(sop.instructions)
    for (const line of instructionLines) {
      if (currentY > 270) { doc.addPage(); currentY = 20 }
      if (line.startsWith('\n')) { currentY += 5; doc.setFont('helvetica', 'bold'); doc.text(line.trim(), 15, currentY); doc.setFont('helvetica', 'normal') }
      else if (line.startsWith('  - ')) { doc.text(line, 20, currentY) }
      else { const textLines = doc.splitTextToSize(line, 175); doc.text(textLines, 15, currentY); currentY += (textLines.length - 1) * 4 }
      currentY += 5
    }
    currentY += 10;
    // Étapes illustrées
    if (sop.steps && sop.steps.length > 0) {
      doc.setFontSize(14)
      doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2])
      doc.setFont('helvetica', 'bold')
      doc.text('Étapes illustrées', 15, currentY)
      currentY += 8
      doc.setFontSize(10)
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])
      doc.setFont('helvetica', 'normal')
      for (const [idx, step] of sop.steps.entries()) {
        if (currentY > 250) { doc.addPage(); currentY = 20 }
        doc.setFont('helvetica', 'bold')
        doc.text(`${idx + 1}. ${step.text}`, 15, currentY)
        doc.setFont('helvetica', 'normal')
        currentY += 6
        if (step.image) {
          try {
            // Charger l'image en base64 (synchrone via fetch + FileReader)
            // (fonction utilitaire à ajouter plus bas)
            const imgData = await getImageBase64(step.image)
            if (imgData) {
              doc.addImage(imgData, 'JPEG', 20, currentY, 60, 40)
              currentY += 42
            }
          } catch (e) { /* ignore erreur image */ }
        }
        currentY += 6
      }
      currentY += 10
    }
    
    // Tags section
    if (sop.tags.length > 0) {
      if (currentY > 260) {
        doc.addPage()
        currentY = 20
      }
      
      doc.setFontSize(14)
      doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2])
      doc.setFont('helvetica', 'bold')
      doc.text('Mots-clés', 15, currentY)
      
      currentY += 8
      doc.setFontSize(10)
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])
      doc.setFont('helvetica', 'normal')
      
      const tagsText = sop.tags.join(', ')
      const tagLines = doc.splitTextToSize(tagsText, 180)
      doc.text(tagLines, 15, currentY)
      currentY += tagLines.length * 5 + 15
    }
    
    // Footer information
    if (currentY > 240) {
      doc.addPage()
      currentY = 20
    }
    
    const formattedCreatedDate = new Date(sop.createdAt).toLocaleDateString('fr-FR')
    const formattedEditedDate = sop.editedAt 
      ? new Date(sop.editedAt).toLocaleDateString('fr-FR') 
      : formattedCreatedDate
    
    autoTable(doc, {
      startY: currentY,
      head: [['Date de création', 'Dernière mise à jour']],
      body: [[
        formattedCreatedDate,
        sop.editedAt ? `${formattedEditedDate} (Modifié)` : formattedEditedDate
      ]],
      styles: {
        fontSize: 10,
        cellPadding: 5,
      },
      headStyles: {
        fillColor: primaryBlue,
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      bodyStyles: {
        textColor: darkGray
      },
      margin: { left: 15, right: 15 }
    })
    
    // Footer
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2])
      doc.text('Document confidentiel - Usage interne uniquement', 105, 285, { align: 'center' })
      doc.text(`Page ${i} sur ${pageCount}`, 195, 290, { align: 'right' })
      doc.text('Généré automatiquement par le Gestionnaire de SOP', 15, 290)
    }
    
    // Save the PDF
    const fileName = `SOP_${sop.id}_${sop.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
    doc.save(fileName)
    
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error)
    throw new Error('Impossible de générer le PDF. Veuillez réessayer.')
  }
}

// Ajout utilitaire pour charger une image en base64
async function getImageBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    return await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
} 