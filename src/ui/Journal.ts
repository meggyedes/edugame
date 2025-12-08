// Journal UI - Field Journal with evidence tracking, photos, and animal facts
// Layout: Left = Evidence collected | Middle = Photo | Right = Animal facts

import type { Photo, Language, BiomeType } from '../types/index.js';
import { I18n } from '../i18n/translations.js';
import { ANIMAL_FACTS, type AnimalFacts } from '../data/AnimalFacts.js';
import { EVIDENCE_DATABASE, type EvidenceData } from '../entities/Evidence.js';

interface JournalAnimalEntry {
    animalId: string;
    photo: Photo | null;
    collectedEvidence: EvidenceData[];
    facts: AnimalFacts | null;
}

export class Journal {
    private i18n: I18n;
    private isOpen: boolean = false;
    private canvasWidth: number;
    private canvasHeight: number;
    
    // Data
    private photos: Photo[] = [];
    private collectedEvidence: Map<string, EvidenceData[]> = new Map(); // animalId -> evidence
    private animalEntries: JournalAnimalEntry[] = [];
    private loadedImages: Map<string, HTMLImageElement> = new Map();
    
    // Animation
    private openAnimation: number = 0;
    private animationTimer: number = 0;
    
    // Navigation - now animal-based, not photo-based
    private currentAnimalIndex: number = 0;
    private hoveredNav: 'prev' | 'next' | null = null;
    
    // Mouse position
    private mouseX: number = 0;
    private mouseY: number = 0;

    constructor(canvasWidth: number, canvasHeight: number) {
        this.i18n = I18n.getInstance();
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
    }

    public setPhotos(photos: Photo[]): void {
        this.photos = photos;
        
        // Preload images
        photos.forEach(photo => {
            if (!this.loadedImages.has(photo.id)) {
                const img = new Image();
                img.src = photo.dataUrl;
                this.loadedImages.set(photo.id, img);
            }
        });
        
        this.rebuildAnimalEntries();
    }

    public addEvidence(animalId: string, evidence: EvidenceData): void {
        if (!this.collectedEvidence.has(animalId)) {
            this.collectedEvidence.set(animalId, []);
        }
        const existing = this.collectedEvidence.get(animalId)!;
        // Don't add duplicates
        if (!existing.find(e => e.type === evidence.type)) {
            existing.push(evidence);
            this.rebuildAnimalEntries();
        }
    }

    public getCollectedEvidence(animalId: string): EvidenceData[] {
        return this.collectedEvidence.get(animalId) || [];
    }

    private rebuildAnimalEntries(): void {
        // Build entries from all known animals (from evidence database)
        const animalIds = new Set<string>();
        
        // Add animals with collected evidence
        this.collectedEvidence.forEach((_, animalId) => animalIds.add(animalId));
        
        // Add animals with photos
        this.photos.forEach(photo => {
            if (photo.animalId) animalIds.add(photo.animalId);
        });
        
        this.animalEntries = Array.from(animalIds).map(animalId => {
            const photo = this.photos.find(p => p.animalId === animalId) || null;
            const evidence = this.collectedEvidence.get(animalId) || [];
            const facts = ANIMAL_FACTS[animalId] || null;
            
            return { animalId, photo, collectedEvidence: evidence, facts };
        });
        
        // Sort: animals with photos first, then by name
        this.animalEntries.sort((a, b) => {
            if (a.photo && !b.photo) return -1;
            if (!a.photo && b.photo) return 1;
            return a.animalId.localeCompare(b.animalId);
        });
    }

    public open(): void {
        this.isOpen = true;
        this.openAnimation = 0;
    }

    public close(): void {
        this.isOpen = false;
    }

    public toggle(): void {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    public isJournalOpen(): boolean {
        return this.isOpen;
    }

    public update(deltaTime: number, mouseX: number, mouseY: number): void {
        this.animationTimer += deltaTime;
        this.mouseX = mouseX;
        this.mouseY = mouseY;

        if (this.isOpen) {
            this.openAnimation = Math.min(1, this.openAnimation + deltaTime * 5);
        } else {
            this.openAnimation = Math.max(0, this.openAnimation - deltaTime * 5);
        }
    }

    public render(ctx: CanvasRenderingContext2D): void {
        if (this.openAnimation <= 0) return;

        ctx.save();
        ctx.globalAlpha = this.openAnimation;

        // Semi-transparent background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

        // Scale animation
        ctx.translate(this.canvasWidth / 2, this.canvasHeight / 2);
        ctx.scale(this.openAnimation, this.openAnimation);
        ctx.translate(-this.canvasWidth / 2, -this.canvasHeight / 2);

        // Journal container - MUCH LARGER for readability
        const containerWidth = Math.min(1200, this.canvasWidth - 40);
        const containerHeight = Math.min(750, this.canvasHeight - 60);
        const containerX = (this.canvasWidth - containerWidth) / 2;
        const containerY = (this.canvasHeight - containerHeight) / 2;

        // Render journal background
        this.renderJournalBackground(ctx, containerX, containerY, containerWidth, containerHeight);

        if (this.animalEntries.length === 0) {
            this.renderEmptyState(ctx, containerX, containerY, containerWidth, containerHeight);
        } else {
            // Render current animal entry
            const entry = this.animalEntries[this.currentAnimalIndex];
            if (entry) {
                this.renderAnimalEntry(ctx, entry, containerX, containerY, containerWidth, containerHeight);
            }
            
            // Render navigation
            this.renderNavigation(ctx, containerX, containerY, containerWidth, containerHeight);
        }

        // Close hint
        ctx.fillStyle = '#8B4513';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.i18n.t('press_j_esc_close'), this.canvasWidth / 2, containerY + containerHeight + 35);

        ctx.restore();
    }

    private renderJournalBackground(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
        // Old leather book look
        const gradient = ctx.createLinearGradient(x, y, x + w, y);
        gradient.addColorStop(0, '#5D4037');
        gradient.addColorStop(0.02, '#8D6E63');
        gradient.addColorStop(0.04, '#F5F5DC');
        gradient.addColorStop(0.5, '#FFFEF0');
        gradient.addColorStop(0.96, '#F5F5DC');
        gradient.addColorStop(0.98, '#8D6E63');
        gradient.addColorStop(1, '#5D4037');
        
        ctx.fillStyle = gradient;
        this.roundRect(ctx, x, y, w, h, 8);
        ctx.fill();

        // Book spine
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.fillRect(x + w / 2 - 3, y, 6, h);

        // Border
        ctx.strokeStyle = '#5D4037';
        ctx.lineWidth = 4;
        this.roundRect(ctx, x + 2, y + 2, w - 4, h - 4, 6);
        ctx.stroke();

        // Title
        ctx.fillStyle = '#5D4037';
        ctx.font = 'bold 28px Georgia, serif';
        ctx.textAlign = 'center';
        ctx.fillText('📓 ' + this.i18n.t('field_journal'), this.canvasWidth / 2, y + 40);
    }

    private renderEmptyState(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
        ctx.fillStyle = '#8B7355';
        ctx.font = 'bold 26px Arial';
        ctx.textAlign = 'center';
        
        const title = this.i18n.t('journal_empty');
        const hint1 = this.i18n.t('look_for_clues');
        const hint2 = this.i18n.t('clue_types');
        const hint3 = this.i18n.t('take_photos_hint');
        
        ctx.fillText(title, this.canvasWidth / 2, y + h / 2 - 60);
        ctx.font = '18px Arial';
        ctx.fillText(hint1, this.canvasWidth / 2, y + h / 2 - 10);
        ctx.fillText(hint2, this.canvasWidth / 2, y + h / 2 + 25);
        ctx.fillText(hint3, this.canvasWidth / 2, y + h / 2 + 60);
        
        ctx.font = '70px Arial';
        ctx.fillText('🔍', this.canvasWidth / 2, y + h / 2 + 150);
    }

    private renderAnimalEntry(ctx: CanvasRenderingContext2D, entry: JournalAnimalEntry, containerX: number, containerY: number, containerWidth: number, containerHeight: number): void {
        const lang = this.i18n.getLanguage();
        const panelY = containerY + 65;
        const panelHeight = containerHeight - 120;
        
        // Three columns: Evidence | Photo | Facts - with more spacing
        const columnWidth = (containerWidth - 80) / 3;
        const leftX = containerX + 25;
        const middleX = containerX + 25 + columnWidth + 15;
        const rightX = containerX + 25 + (columnWidth + 15) * 2;

        // === LEFT PANEL: Evidence ===
        this.renderEvidencePanel(ctx, entry, leftX, panelY, columnWidth, panelHeight, lang);

        // === MIDDLE PANEL: Photo ===
        this.renderPhotoPanel(ctx, entry, middleX, panelY, columnWidth, panelHeight, lang);

        // === RIGHT PANEL: Facts ===
        this.renderFactsPanel(ctx, entry, rightX, panelY, columnWidth, panelHeight, lang);
    }

    private renderEvidencePanel(ctx: CanvasRenderingContext2D, entry: JournalAnimalEntry, x: number, y: number, w: number, h: number, lang: string): void {
        // Panel background
        ctx.fillStyle = 'rgba(139, 115, 85, 0.15)';
        this.roundRect(ctx, x, y, w, h, 8);
        ctx.fill();
        ctx.strokeStyle = '#8B7355';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Title
        ctx.fillStyle = '#5D4037';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🔍 ' + this.i18n.t('evidence'), x + w / 2, y + 35);

        // Evidence items
        const allEvidence = EVIDENCE_DATABASE[entry.animalId] || [];
        const collectedEvidence = entry.collectedEvidence;
        
        let itemY = y + 65;
        allEvidence.forEach((evidence, index) => {
            const isCollected = collectedEvidence.some(e => e.type === evidence.type);
            
            ctx.fillStyle = isCollected ? '#4CAF50' : '#CCCCCC';
            ctx.beginPath();
            ctx.arc(x + 30, itemY + 15, 18, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = isCollected ? '#000' : '#999';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(isCollected ? evidence.icon : '?', x + 30, itemY + 22);
            
            ctx.fillStyle = isCollected ? '#333' : '#999';
            ctx.font = isCollected ? 'bold 16px Arial' : 'italic 16px Arial';
            ctx.textAlign = 'left';
            const name = isCollected ? evidence.name[lang as 'nl' | 'en'] : '???';
            ctx.fillText(name.length > 20 ? name.substring(0, 19) + '...' : name, x + 58, itemY + 18);
            
            if (isCollected) {
                ctx.fillStyle = '#666';
                ctx.font = '13px Arial';
                const desc = evidence.description[lang as 'nl' | 'en'];
                ctx.fillText(desc.length > 30 ? desc.substring(0, 29) + '...' : desc, x + 58, itemY + 38);
            }
            
            itemY += 65;
        });

        // Progress indicator
        const progress = collectedEvidence.length;
        const total = allEvidence.length;
        ctx.fillStyle = '#8B7355';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${progress}/${total} ${this.i18n.t('found')}`, x + w / 2, y + h - 20);
    }

    private renderPhotoPanel(ctx: CanvasRenderingContext2D, entry: JournalAnimalEntry, x: number, y: number, w: number, h: number, lang: string): void {
        // Panel background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        this.roundRect(ctx, x, y, w, h, 8);
        ctx.fill();
        ctx.strokeStyle = '#8B7355';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Animal name
        const animalName = entry.facts?.name[lang as 'nl' | 'en'] || entry.animalId;
        ctx.fillStyle = '#5D4037';
        ctx.font = 'bold 24px Georgia, serif';
        ctx.textAlign = 'center';
        ctx.fillText(animalName, x + w / 2, y + 38);
        
        // Scientific name
        if (entry.facts?.scientificName) {
            ctx.fillStyle = '#888';
            ctx.font = 'italic 15px Arial';
            ctx.fillText(entry.facts.scientificName, x + w / 2, y + 58);
        }

        // Photo area
        const photoY = y + 75;
        const photoHeight = h - 130;
        const photoWidth = w - 30;
        const photoX = x + 15;

        if (entry.photo) {
            // Polaroid frame
            ctx.fillStyle = '#FFF';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = 10;
            ctx.fillRect(photoX - 5, photoY - 5, photoWidth + 10, photoHeight + 35);
            ctx.shadowColor = 'transparent';

            // Photo image
            const img = this.loadedImages.get(entry.photo.id);
            if (img && img.complete) {
                ctx.drawImage(img, photoX, photoY, photoWidth, photoHeight);
            } else {
                ctx.fillStyle = '#DDD';
                ctx.fillRect(photoX, photoY, photoWidth, photoHeight);
            }

            // Photo date
            ctx.fillStyle = '#666';
            ctx.font = '14px Arial';
            const date = new Date(entry.photo.timestamp);
            ctx.fillText(date.toLocaleDateString(), x + w / 2, photoY + photoHeight + 25);
            
            // Points
            ctx.fillStyle = '#DAA520';
            ctx.font = 'bold 18px Arial';
            ctx.fillText(`⭐ ${entry.photo.points}`, x + w / 2, y + h - 15);
        } else {
            // No photo yet - show placeholder
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            this.roundRect(ctx, photoX, photoY, photoWidth, photoHeight, 5);
            ctx.fill();
            
            ctx.strokeStyle = '#AAA';
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.setLineDash([]);
            
            ctx.fillStyle = '#999';
            ctx.font = '60px Arial';
            ctx.fillText('📷', x + w / 2, photoY + photoHeight / 2 + 15);
            
            ctx.font = '18px Arial';
            ctx.fillText(this.i18n.t('no_photo_yet'), x + w / 2, photoY + photoHeight / 2 + 60);
            
            ctx.font = '14px Arial';
            ctx.fillText(this.i18n.t('find_and_photo'), x + w / 2, photoY + photoHeight / 2 + 85);
        }
    }

    private renderFactsPanel(ctx: CanvasRenderingContext2D, entry: JournalAnimalEntry, x: number, y: number, w: number, h: number, lang: string): void {
        // Panel background
        ctx.fillStyle = 'rgba(139, 115, 85, 0.15)';
        this.roundRect(ctx, x, y, w, h, 8);
        ctx.fill();
        ctx.strokeStyle = '#8B7355';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Title
        ctx.fillStyle = '#5D4037';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('📖 ' + this.i18n.t('facts'), x + w / 2, y + 35);

        if (!entry.facts) {
            ctx.fillStyle = '#999';
            ctx.font = '18px Arial';
            ctx.fillText(this.i18n.t('unknown_animal'), x + w / 2, y + h / 2);
            return;
        }

        const facts = entry.facts;
        let factY = y + 70;
        ctx.textAlign = 'left';

        // Habitat
        ctx.fillStyle = '#5D4037';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(`🏠 ${this.i18n.t('habitat')}:`, x + 15, factY);
        ctx.fillStyle = '#333';
        ctx.font = '14px Arial';
        const habitat = facts.habitat[lang as 'nl' | 'en'];
        this.wrapText(ctx, habitat, x + 15, factY + 22, w - 30, 18);
        factY += 70;

        // Diet
        ctx.fillStyle = '#5D4037';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(`🍽️ ${this.i18n.t('diet')}:`, x + 15, factY);
        ctx.fillStyle = '#333';
        ctx.font = '14px Arial';
        const diet = facts.diet[lang as 'nl' | 'en'];
        this.wrapText(ctx, diet, x + 15, factY + 22, w - 30, 18);
        factY += 70;

        // Size
        ctx.fillStyle = '#5D4037';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(`📏 ${this.i18n.t('size')}:`, x + 15, factY);
        ctx.fillStyle = '#333';
        ctx.font = '14px Arial';
        ctx.fillText(facts.size[lang as 'nl' | 'en'], x + 15, factY + 22);
        factY += 55;

        // Fun facts
        ctx.fillStyle = '#5D4037';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(`💡 ${this.i18n.t('did_you_know')}`, x + 15, factY);
        factY += 25;

        ctx.fillStyle = '#333';
        ctx.font = '14px Arial';
        const funFacts = facts.funFacts[lang as 'nl' | 'en'];
        funFacts.slice(0, 3).forEach((fact, i) => {
            ctx.fillText(`• ${fact.length > 45 ? fact.substring(0, 44) + '...' : fact}`, x + 15, factY + i * 22);
        });
    }

    private renderNavigation(ctx: CanvasRenderingContext2D, containerX: number, containerY: number, containerWidth: number, containerHeight: number): void {
        const total = this.animalEntries.length;
        if (total <= 1) return;

        const y = containerY + containerHeight - 50;
        const btnSize = 50;

        // Previous button
        const prevX = containerX + 40;
        const isPrevHovered = this.mouseX >= prevX && this.mouseX <= prevX + btnSize &&
                              this.mouseY >= y && this.mouseY <= y + btnSize;
        ctx.fillStyle = this.currentAnimalIndex > 0 ? (isPrevHovered ? '#5D4037' : '#8B7355') : '#CCC';
        this.roundRect(ctx, prevX, y, btnSize, btnSize, 8);
        ctx.fill();
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('‹', prevX + btnSize / 2, y + 36);

        // Page indicator
        ctx.fillStyle = '#5D4037';
        ctx.font = 'bold 20px Arial';
        ctx.fillText(`${this.currentAnimalIndex + 1} / ${total}`, this.canvasWidth / 2, y + 34);

        // Next button
        const nextX = containerX + containerWidth - 40 - btnSize;
        const isNextHovered = this.mouseX >= nextX && this.mouseX <= nextX + btnSize &&
                              this.mouseY >= y && this.mouseY <= y + btnSize;
        ctx.fillStyle = this.currentAnimalIndex < total - 1 ? (isNextHovered ? '#5D4037' : '#8B7355') : '#CCC';
        this.roundRect(ctx, nextX, y, btnSize, btnSize, 8);
        ctx.fill();
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 30px Arial';
        ctx.fillText('›', nextX + btnSize / 2, y + 36);
    }

    public handleClick(x: number, y: number): boolean {
        if (!this.isOpen) return false;

        const containerWidth = Math.min(1200, this.canvasWidth - 40);
        const containerHeight = Math.min(750, this.canvasHeight - 60);
        const containerX = (this.canvasWidth - containerWidth) / 2;
        const containerY = (this.canvasHeight - containerHeight) / 2;

        // Navigation clicks
        const total = this.animalEntries.length;
        if (total > 1) {
            const navY = containerY + containerHeight - 50;
            const btnSize = 50;
            
            // Previous
            const prevX = containerX + 40;
            if (x >= prevX && x <= prevX + btnSize && y >= navY && y <= navY + btnSize) {
                if (this.currentAnimalIndex > 0) {
                    this.currentAnimalIndex--;
                }
                return true;
            }

            // Next
            const nextX = containerX + containerWidth - 40 - btnSize;
            if (x >= nextX && x <= nextX + btnSize && y >= navY && y <= navY + btnSize) {
                if (this.currentAnimalIndex < total - 1) {
                    this.currentAnimalIndex++;
                }
                return true;
            }
        }

        // Click outside to close
        if (x < containerX || x > containerX + containerWidth ||
            y < containerY || y > containerY + containerHeight) {
            this.close();
        }

        return true;
    }

    private wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number): void {
        const words = text.split(' ');
        let line = '';
        let currentY = y;

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && n > 0) {
                ctx.fillText(line.trim(), x, currentY);
                line = words[n] + ' ';
                currentY += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line.trim(), x, currentY);
    }

    private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number): void {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    public updateSize(width: number, height: number): void {
        this.canvasWidth = width;
        this.canvasHeight = height;
    }
}
